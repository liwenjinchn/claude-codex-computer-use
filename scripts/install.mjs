#!/usr/bin/env node
import { accessSync, constants, copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dryRun = process.argv.includes("--dry-run");
const help = process.argv.includes("--help");
if (help) {
  console.log("Usage: node scripts/install.mjs [--dry-run]\nRegisters user MCP codex-cua and installs /codex-computer-use; does not modify model credentials.");
  process.exit(0);
}
function fail(message) { console.error(message); process.exit(1); }
function executable(file) { try { accessSync(file, constants.X_OK); return true; } catch { return false; } }
if (process.platform !== "darwin") fail("Requires macOS with working Codex / ChatGPT Computer Use.");
const [major, minor] = process.versions.node.split(".").map(Number);
if (major < 22 || (major === 22 && minor < 14)) fail("Requires Node.js >=22.14.");
const codexHome = process.env.CODEX_HOME || path.join(os.homedir(), ".codex");
const client = process.env.COMPUTER_USE_CLIENT_PATH || path.join(codexHome,
  "computer-use/Codex Computer Use.app/Contents/SharedSupport/SkyComputerUseClient.app/Contents/MacOS/SkyComputerUseClient");
if (!executable(client)) fail("Computer Use client missing. Install and authorize Computer Use in Codex / ChatGPT first.");
const launcher = [process.env.COMPUTER_USE_CODEX_LAUNCHER_PATH,
  "/Applications/ChatGPT.app/Contents/Resources/codex-cli/CodexCLI.app/Contents/MacOS/codex",
  "/Applications/Codex.app/Contents/Resources/codex-cli/CodexCLI.app/Contents/MacOS/codex",
  "/Applications/ChatGPT.app/Contents/Resources/codex",
  "/Applications/Codex.app/Contents/Resources/codex"].filter(Boolean).find(executable);
if (!launcher) fail("Signed Codex launcher missing. Install Codex / ChatGPT or set COMPUTER_USE_CODEX_LAUNCHER_PATH.");
const version = spawnSync("claude", ["--version"], {encoding:"utf8"});
if (version.error || version.status !== 0) fail("Claude Code CLI missing or not working. Install Claude Code first.");
const configPath = path.join(os.homedir(), ".claude.json");
const skillPath = path.join(os.homedir(), ".claude/skills/codex-computer-use/SKILL.md");
const source = path.join(root, "skills/computer-use/SKILL.md");
const bridge = path.join(root, "bin/computer-use-mcp-bridge.mjs");
const config = existsSync(configPath) ? JSON.parse(readFileSync(configPath, "utf8")) : {};
const existing = config.mcpServers?.["codex-cua"];
const sameBridge = existing?.command === process.execPath && JSON.stringify(existing?.args) === JSON.stringify([bridge]);
// Also recognize the initial installation, which used node from PATH.
const sameOldBridge = existing?.command === "node" && JSON.stringify(existing?.args) === JSON.stringify([bridge]);
if (existing && !sameBridge && !sameOldBridge) fail("codex-cua already exists with a different command. Inspect it with claude mcp get codex-cua; this installer will not replace it.");
if (existsSync(skillPath) && readFileSync(skillPath,"utf8") !== readFileSync(source,"utf8"))
  fail("An existing codex-computer-use skill differs. Back it up or move it before installing; it will not be overwritten.");
console.log("Prerequisites OK: " + version.stdout.trim());
console.log("MCP: codex-cua; Skill: /codex-computer-use");
console.log("Bridge: " + bridge);
console.log("App access is auto-accepted by the upstream bridge. UI text and screenshots go to your configured model provider.");
if (dryRun) { console.log("Dry run: no configuration changed."); process.exit(0); }
if (!existing) {
  // Scope the discovered paths to this server. Never copy model keys or edit settings.json.
  const mcp = {command:process.execPath,args:[bridge],env:{COMPUTER_USE_CLIENT_PATH:client,COMPUTER_USE_CODEX_LAUNCHER_PATH:launcher}};
  const result = spawnSync("claude", ["mcp","add-json","--scope","user","codex-cua",JSON.stringify(mcp)], {stdio:"inherit"});
  if (result.error || result.status !== 0) fail("MCP registration failed; skill was not changed.");
} else { console.log("Matching codex-cua already registered; keeping its configuration."); }
mkdirSync(path.dirname(skillPath), {recursive:true});
if (!existsSync(skillPath)) copyFileSync(source, skillPath);
console.log("Installed. Keep this checkout at this path. Restart Claude Code and run /mcp.");
