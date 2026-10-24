// Stop hook: after each answer, show which models worked on the request
// (main model, subagents and advisor) and how many tokens each one used.
// Long-conversation note uses ECONOMY_TOKENS_LIMIT, same as warn-long-conversation.js.
const fs = require('fs')
const path = require('path')

const LIMIT = Number(process.env.ECONOMY_TOKENS_LIMIT) || 300000
const MODEL_NAMES = { 'claude-opus-5-5': 'Opus', 'claude-sonnet-5-5': 'Sonnet', 'claude-haiku-5-5': 'Haiku' }
const modelName = m => MODEL_NAMES[m] || m
const k = n => (n >= 1000 ? (n / 1000).toFixed(1).replace('.0', '') + 'k' : String(n))

function readLines(file) {
  try {
    return fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).map(l => {
      try { return JSON.parse(l) } catch { return null }
    }).filter(Boolean)
  } catch { return [] }
}

// A real request is text typed by the user. Claude Code mixes blocks such as
// <system-reminder> into the same text, so those blocks are removed before testing.
function isRealRequest(entry) {
  if (entry.type !== 'user' || entry.isMeta || entry.isSidechain) return false
  const content = entry.message && entry.message.content
  if (Array.isArray(content) && content.some(b => b.type === 'tool_result')) return false
  const text = typeof content === 'string' ? content : (Array.isArray(content) ? content.map(b => b.text || '').join('') : '')
  return text.replace(/<([a-z-]+)>[\s\S]*?<\/\1>/g, '').trim().length > 0
}

function addUsage(entries, since, totals, role) {
  const seen = new Set()
  for (const entry of entries) {
    if (entry.type !== 'assistant' || !entry.message || !entry.message.usage) continue
    if (since && entry.timestamp < since) continue
    if (entry.message.id) { if (seen.has(entry.message.id)) continue; seen.add(entry.message.id) }
    const u = entry.message.usage
    const key = role + '|' + entry.message.model
    const t = (totals[key] = totals[key] || { role, model: entry.message.model, fresh: 0, cache: 0, out: 0 })
    t.fresh += (u.input_tokens || 0) + (u.cache_creation_input_tokens || 0)
    t.cache += u.cache_read_input_tokens || 0
    t.out += u.output_tokens || 0
    for (const it of u.iterations || []) {
      if (it.type !== 'advisor_message') continue
      const ak = 'advisor|' + it.model
      const a = (totals[ak] = totals[ak] || { role: 'advisor', model: it.model, fresh: 0, cache: 0, out: 0 })
      a.fresh += (it.input_tokens || 0) + (it.cache_creation_input_tokens || 0)
      a.cache += it.cache_read_input_tokens || 0
      a.out += it.output_tokens || 0
    }
  }
}

let input = ''
process.stdin.on('data', d => (input += d))
process.stdin.on('end', () => {
  try {
    const { transcript_path: file } = JSON.parse(input.replace(/^﻿/, ''))
    const all = readLines(file)
    let start = -1
    all.forEach((e, i) => { if (isRealRequest(e)) start = i })
    if (start < 0) process.exit(0)
    const since = all[start].timestamp
    const totals = {}
    addUsage(all.slice(start), null, totals, 'main')

    const subDir = path.join(path.dirname(file), path.basename(file, '.jsonl'), 'subagents')
    if (fs.existsSync(subDir)) {
      for (const f of fs.readdirSync(subDir).filter(x => x.endsWith('.jsonl'))) {
        addUsage(readLines(path.join(subDir, f)), since, totals, 'subagent')
      }
    }

    const parts = Object.values(totals)
      .filter(t => t.fresh + t.cache + t.out > 0)
      .map(t => `${modelName(t.model)} (${t.role}): ${k(t.fresh)} new input, ${k(t.cache)} cached, ${k(t.out)} output`)
    const last = [...all].reverse().find(e => e.type === 'assistant' && e.message && e.message.usage)
    const read = last ? (last.message.usage.cache_read_input_tokens || 0) + (last.message.usage.input_tokens || 0) : 0
    const warning = read > LIMIT ? ' | ⚠ long conversation (' + k(read) + ' read per answer): start a new one for the next topic' : ''
    if (parts.length) {
      process.stdout.write(JSON.stringify({ systemMessage: 'Tokens for this request → ' + parts.join(' | ') + warning }), () => process.exit(0))
      return
    }
  } catch (error) {
    if (process.env.HOOK_DEBUG) console.error(error)
  }
  process.exit(0)
})
