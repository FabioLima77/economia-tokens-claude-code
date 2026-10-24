// UserPromptSubmit hook, runs on every prompt:
// 1) tells Claude to start each reply with a line naming the model in use;
// 2) when the conversation is long, asks Claude to suggest a fresh conversation.
// Threshold: ECONOMY_TOKENS_LIMIT (tokens read per answer). Default 300000.
const fs = require('fs')

const LIMIT = Number(process.env.ECONOMY_TOKENS_LIMIT) || 300000
const FAMILY = { haiku: 'Haiku', sonnet: 'Sonnet', opus: 'Opus', fable: 'Fable' }

// "claude-haiku-5-5" -> "Haiku 5.5"
function modelLabel(model) {
  const m = /claude-([a-z]+)-(\d+)-(\d+)/.exec(model || '')
  return m ? (FAMILY[m[1]] || m[1]) + ' ' + m[2] + '.' + m[3] : ''
}

let input = ''
process.stdin.on('data', d => (input += d))
process.stdin.on('end', () => {
  try {
    const { transcript_path: file } = JSON.parse(input.replace(/^\uFEFF/, ''))
    const lines = fs.readFileSync(file, 'utf8').split('\n').filter(Boolean)
    let read = 0
    let model = ''
    for (let i = lines.length - 1; i >= 0; i--) {
      let entry
      try { entry = JSON.parse(lines[i]) } catch { continue }
      if (entry.type === 'assistant' && entry.message && entry.message.usage) {
        read = (entry.message.usage.cache_read_input_tokens || 0) + (entry.message.usage.input_tokens || 0)
        model = entry.message.model || ''
        break
      }
    }
    const label = modelLabel(model) || 'the name of the model you are running as, for example Haiku 5.5'
    let context =
      'Start your reply with this line, exactly, followed by a blank line: [' + label + ' · principal]'
    if (read > LIMIT) {
      context +=
        ' LONG CONVERSATION (' + read + ' tokens read per answer). This is a mandatory first step, before any other action: ' +
        '1) If the tool mcp__ccd_session__start_session is available (desktop app), call it now with initiation "own_initiative", ' +
        'context "fresh", title "Continued: <topic>", a background of at least 80 characters, and a prompt with a summary of the topic, ' +
        'what is done, the files involved and the next step. Do not ask the user first. ' +
        '2) If the tool is not available, tell the user, in their language, to open a new conversation (or run /clear) and paste the summary. ' +
        '3) Then answer the request, in the user\'s language.'
    }
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext: context },
    }))
  } catch {}
  process.exit(0)
})
