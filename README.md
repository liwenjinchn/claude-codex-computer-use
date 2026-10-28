# Claude Code → Codex Computer Use（Mac 迁移版）

让 Claude Code 通过 MCP 使用本机已安装的 Codex / ChatGPT Computer Use。基于 [songkeys/claude-codex-computer-use](https://github.com/songkeys/claude-codex-computer-use) 0.1.2（MIT），保留原作者与许可证。

此 fork 增加新版 Codex 可执行文件路径识别、短名称 `codex-cua` 安装器和中文迁移说明。桥接不调用 OpenAI 模型，但截图与界面文字会返回 Claude Code 当前配置的模型服务。

## 另一台 Mac 安装

前提：macOS 14.4+、Node.js 22.14+、Git、Claude Code，以及已登录且 Computer Use 可用的 Codex / ChatGPT 桌面应用。先在桌面应用中安装 Computer Use，并按提示授予辅助功能、屏幕录制权限；这个仓库不包含 OpenAI 软件或账号凭据。Windows / Linux 不适用。

在终端执行：

```sh
git clone https://github.com/liwenjinchn/claude-codex-computer-use.git
cd claude-codex-computer-use
node scripts/install.mjs --dry-run
node scripts/install.mjs
```

安装器注册用户级 MCP `codex-cua`，安装 `/codex-computer-use` Skill；不需要 `npm install`，不改模型、密钥、代理配置。重复安装会保留已有同路径 MCP；若发现不同路径 MCP 或不同内容 Skill，会退出并提示处理。**安装后保留此文件夹和路径**，MCP 直接运行其中的脚本。

重开 Claude Code，运行 `/mcp`，确认 `codex-cua` 已连接，然后输入：

> 使用 codex-computer-use 操作计算器，输入 83×47=，读取实际界面与截图核对结果。

如以前安装过原版插件，先执行 `claude plugin disable --scope user claude-codex-computer-use@songkeys`，避免重复工具。推荐本安装器的短 MCP 名称；本机曾观察到原插件长工具名报 `No such tool available`，尚未确定问题属于客户端还是模型代理。

## 自检与已验证范围

```sh
node --test test/bridge.test.mjs
node scripts/real-smoke-test.mjs
claude mcp get codex-cua
```

冒烟测试会读取应用列表并打开计算器，检查界面文字和 JPEG 截图。模型端到端测试可使用：

```sh
claude -p '使用 codex-computer-use 操作计算器，通过 UI 输入 83*47=，读取真实结果，禁止用脚本或心算代替。' --allowedTools 'mcp__codex-cua__*'
```

本机验证：Claude Code 2.1.309、Node 22.23.4、Computer Use 1001641；Claude 实际执行 1 次 `get_app_state` 与 15 次 `click`，返回 16 张截图，UI 观察到 `83×47=3,901` 和 `3910−9=3,901`。退出后未发现 bridge / `SkyComputerUseClient mcp` 控制进程残留。这是单台 Mac 的桌面验收，另一台机器仍需自检；未验证内置浏览器，也未测试全部工具。

## 认证故障

若 MCP 已连接但模型返回 `401`，先检查 Claude Code 自身认证。若已配置 `apiKeyHelper`，而终端继承了旧认证变量，可仅对一次测试移除旧变量：

```sh
env -u ANTHROPIC_AUTH_TOKEN -u ANTHROPIC_API_KEY claude
```

仅适用于确认应使用 `apiKeyHelper` 的情况；不要把其他机器的密钥或配置备份上传 GitHub。

## 权限与生命周期

桥接自动接受 Computer Use 的应用访问请求，并通过签名的 Codex 启动器运行已有客户端。应用内容和截图会发送到当前模型服务。使用时明确限定目标应用和任务。默认空闲 60 秒释放客户端，下次调用自动重连；退出 Claude Code 时释放控制进程。应用菜单可能保留会话记录，详见[上游说明](docs/UPSTREAM-README.md)。

这是依赖内部接口的非官方集成；Codex / ChatGPT 更新后可能需要适配。本仓库不包含本机截图、认证信息、配置备份或 OpenAI 二进制文件。

## 更新与卸载

```sh
# 更新（通常不需要重新注册 MCP）
git pull --ff-only
node scripts/install.mjs --dry-run

# 卸载 MCP
claude mcp remove codex-cua --scope user
```

卸载 Skill：删除 `~/.claude/skills/codex-computer-use`（如自行修改过，先备份）。已有 Skill 内容变化时，更新安装器会拒绝覆盖；核对并备份后再替换。重开 Claude Code 生效。

[上游原始文档](docs/UPSTREAM-README.md) · [MIT License](LICENSE) · [Security](SECURITY.md)
