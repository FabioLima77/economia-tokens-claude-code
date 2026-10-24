# Model setup (optional)

Economia Tokens does not change models. This is the setup the author uses, if you want to copy it. Put it in your `settings.json` file (`~/.claude/settings.json`; on Windows `C:\Users\YOUR_USER\.claude\settings.json`).

Idea: the main chat runs on a cheap model (Haiku), helper agents (subagents) run on a middle model (Sonnet), and a stronger advisor (Opus) is called only for hard decisions.

```json
{
  "model": "haiku",
  "advisorModel": "opus",
  "env": {
    "CLAUDE_CODE_SUBAGENT_MODEL": "sonnet",
    "CLAUDE_AUTOCOMPACT_PCT_OVERRIDE": "50",
    "ECONOMIA_TOKENS_LIMIT": "300000"
  }
}
```

## What each line does

- `model`: model for the main conversation.
- `advisorModel`: model for the advisor tool. Each call costs more, so use it only when it matters.
- `CLAUDE_CODE_SUBAGENT_MODEL`: model for the helper agents Claude starts for heavy tasks.
- `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE`: with `50`, Claude summarizes the conversation earlier, at half of its context window.
- `ECONOMIA_TOKENS_LIMIT`: when the long-conversation warning starts (tokens read per answer).

If your settings file already has other content, do not delete it. Only add the lines you are missing.

## Going back

Remove the lines above from `settings.json`, or set them back to the values you used before.
