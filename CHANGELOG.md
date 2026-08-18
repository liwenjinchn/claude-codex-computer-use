# Changelog

## 0.1.0 - 2026-08-18

- Add a Claude Code plugin with a Computer Use Skill and MCP server.
- Add a stdio MCP bridge that preserves OpenAI's trusted client ancestry.
- Add MCP elicitation capability injection and automatic app-access acceptance.
- Release the Computer Use client after an idle timeout and relaunch it on
  demand, so applications are not held while the session is inactive.
- Preserve accessibility text and screenshot image blocks.
- Add fake-server unit coverage and a real local Computer Use smoke test.
- Publish the bridge as the `claude-codex-computer-use` npm executable.
