# Economia Tokens for Claude Code

**Spend fewer tokens in Claude Code.** Economia Tokens warns you when a conversation gets too long (and expensive), and shows how many tokens each model used after every answer.

Built by [FabioLima77](https://github.com/FabioLima77). Português: see [README.pt-BR.md](README.pt-BR.md).

![Token footer example](docs/footer-example.svg)

## Why

Claude reads the whole conversation again on every answer. A chat with 300,000 tokens costs far more per message than a fresh one. Economia Tokens makes that cost visible and nudges you to start fresh at the right moment.

## What it does

| Part | When | What it does |
| --- | --- | --- |
| Long-conversation warning | Before each prompt | Warns and asks Claude to suggest a new conversation with a summary, once the chat passes your limit. |
| Token footer | After each answer | Shows tokens per model: main model, subagents and advisor. |
| `economia-tokens` skill | When you ask about saving tokens | Explains the habits that keep costs low. |

Everything runs on your computer. Nothing is sent anywhere.

## Install

After this repository is public, run these two commands in a terminal, one at a time:

```bash
claude plugin marketplace add FabioLima77/economia-tokens-claude-code
```

```bash
claude plugin install economia-tokens@economia-tokens-marketplace
```

To install from a folder on your computer instead:

```bash
claude plugin marketplace add "C:\path\to\economia-tokens-claude-code"
```

Then start a new conversation so the hooks load.

## Settings

| Variable | Default | Meaning |
| --- | --- | --- |
| `ECONOMIA_TOKENS_LIMIT` | `300000` | Tokens read per answer before the long-conversation warning appears. |

Set it in the `env` block of `~/.claude/settings.json`, for example `"ECONOMIA_TOKENS_LIMIT": "170000"`.

To choose which model runs the main chat, the subagents and the advisor, see [docs/model-setup.md](docs/model-setup.md).

## Turn it off

Pause it:

```bash
claude plugin disable economia-tokens@economia-tokens-marketplace
```

Turn it back on:

```bash
claude plugin enable economia-tokens@economia-tokens-marketplace
```

Remove it:

```bash
claude plugin uninstall economia-tokens@economia-tokens-marketplace
```

## Notes and limits

- Tested with Claude Code 2.1 on Windows 11. It uses only Node.js, which Claude Code already includes, so Mac and Linux should work too (not tested yet).
- The automatic "open a new conversation" action exists only in the Claude desktop app. In the terminal, the warning asks you to start a new conversation (or run `/clear`) and paste the summary.
- The footer numbers come from the conversation log that Claude Code writes on your computer. They are good for comparing, not an exact bill.

## Project layout

```
economia-tokens-claude-code/
├── .claude-plugin/
│   ├── plugin.json          # plugin identity
│   └── marketplace.json     # lets you install with "claude plugin marketplace add"
├── hooks/
│   ├── hooks.json           # connects the two hooks to the right moments
│   ├── warn-long-conversation.js
│   └── token-footer.js
├── skills/
│   └── economia-tokens/SKILL.md # habits to save tokens
└── docs/
    ├── model-setup.md
    └── index.html           # presentation page
```

## License

MIT. See [LICENSE](LICENSE).
