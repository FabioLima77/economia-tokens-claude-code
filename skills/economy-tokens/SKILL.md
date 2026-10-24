---
name: economy-tokens
description: Use when the user asks how to spend fewer tokens or lower Claude Code costs, when a conversation is getting long or slow, or before starting a big task that could be split up.
---

# Economy Tokens

Claude reads the whole conversation again on every answer. The longer the chat, the more every new message costs. Follow these habits to keep costs low.

## Rules

1. **One topic per conversation.** When the topic changes, start a new conversation. Carry over only a short summary: goal, what is done, relevant files, next step.
2. **Delegate heavy work.** Searching many files, debugging, or writing a lot of code should run in a subagent. Only its short result goes back into the main conversation.
3. **Use the advisor rarely.** Call the stronger model only for a hard decision or architecture question, not for routine steps.
4. **Short final answers.** Lead with the result. Skip step-by-step narration unless the user asks for it.
5. **Check the footer.** After each answer, the Economy Tokens footer shows tokens per model. A "long conversation" warning means it is time for a new conversation.

## When the user asks for help

- Explain the rules above in plain language, in the user's language.
- If the conversation is already long, suggest a summary and a new conversation before continuing.
- For settings (which model runs the main chat, subagents, advisor), point to `docs/model-setup.md` in the plugin. Do not change `settings.json` unless the user asks for it.
