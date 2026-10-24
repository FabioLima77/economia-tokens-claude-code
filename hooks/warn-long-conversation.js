// UserPromptSubmit hook: when the conversation gets long, tell Claude to suggest
// starting a fresh conversation with a summary of the current topic.
// Threshold: ECONOMIA_TOKENS_LIMIT (tokens read per answer). Default 300000.
const fs = require('fs')

const LIMIT = Number(process.env.ECONOMIA_TOKENS_LIMIT) || 300000

let input = ''
process.stdin.on('data', d => (input += d))
process.stdin.on('end', () => {
  try {
    const { transcript_path: file } = JSON.parse(input.replace(/^﻿/, ''))
    const lines = fs.readFileSync(file, 'utf8').split('\n').filter(Boolean)
    let read = 0
    for (let i = lines.length - 1; i >= 0; i--) {
      let entry
      try { entry = JSON.parse(lines[i]) } catch { continue }
      if (entry.type === 'assistant' && entry.message && entry.message.usage) {
        read = (entry.message.usage.cache_read_input_tokens || 0) + (entry.message.usage.input_tokens || 0)
        break
      }
    }
    if (read > LIMIT) {
      process.stdout.write(JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'UserPromptSubmit',
          additionalContext:
            'LONG CONVERSATION (' + read + ' tokens read per answer). Before answering the request: ' +
            'if the tool mcp__ccd_session__start_session exists (desktop app), call it with initiation "own_initiative", ' +
            'context "fresh", a title "Continued: <topic>", a background (80+ characters) and a prompt with a summary ' +
            'of the topic, what is done, the files and the next step. If that tool does not exist, tell the user in one ' +
            'line to open a new conversation (or run /clear) and paste the summary. Then tell the user in one line.',
        },
      }))
    }
  } catch {}
  process.exit(0)
})
