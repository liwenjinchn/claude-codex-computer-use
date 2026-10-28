# Claude Code → Codex Computer Use（Mac 迁移版）

让 Claude Code 通过 MCP 使用本机已安装的 Codex / ChatGPT Computer Use。基于 [songkeys/claude-codex-computer-use](https://github.com/songkeys/claude-codex-computer-use) 0.1.2（MIT），保留原作者与许可证。

此 fork 增加新版 Codex 可执行文件路径识别、短名称 `codex-cua` 安装器和中文迁移说明。桥接不调用 OpenAI 模型，但截图与界面文字会返回 Claude Code 当前配置的模型服务。

## 另一台 Mac 安装

前提：macOS 14.4+、Node.js 22.14+、Git、Claude Code，以及已登录且 Computer Use 可用的 Codex / ChatGPT 桌面应用。先在桌面应用中安装 Computer Use，并按提示授予辅助功能、屏幕录制权限；这个仓库不包含 OpenAI 软件或账号凭据。Windows / Linux 不适用。

### 第 1 步：补齐依赖

已安装的组件可以跳过；以下命令在 macOS「终端」执行。安装器只检查依赖并接入 MCP，不会代装系统软件或处理账号登录。

| 组件 | 如何安装 | 如何确认 |
| --- | --- | --- |
| Git | 执行 `xcode-select --install`，在系统弹窗中完成 Apple Command Line Tools 安装；不必安装完整 Xcode | `git --version` |
| Node.js | 到 [Node.js 官方下载页](https://nodejs.org/en/download)选择 macOS 的 LTS `.pkg` 安装包，匹配 Apple Silicon（arm64）或 Intel（x64）；本桥接要求 ≥22.14，推荐 24 LTS | `node --version` |
| Claude Code CLI | 按下方官方安装命令安装；已有 CLI 则跳过 | `claude --version` |
| Codex / ChatGPT 桌面应用与 Computer Use | 按第 2 步安装插件、登录并完成系统授权 | 在桌面应用内实际读取一次计算器 |

安装 Git 的命令会打开系统安装界面。等待安装完成，再继续下载仓库。如果系统提示已安装，则直接运行 `git --version`。

[Claude Code 官方安装方式](https://code.claude.com/docs/en/setup)：

```sh
curl -fsSL https://claude.ai/install.sh | bash
```

完成后重开终端。如果仍提示 `claude: command not found`，先在当前终端执行以下命令，再检查版本；需要长期生效时，把这一行加入自己的 `~/.zshrc`：

```sh
export PATH="$HOME/.local/bin:$PATH"
claude --version
```

如已安装 Homebrew，也可用 `brew install node@24` 安装 Node.js，再按 `brew info node@24` 的提示添加 PATH。Homebrew 不是必需依赖；较旧 macOS 优先参考 Node 官方安装方式。Homebrew 自身的安装与系统支持见 [Homebrew 官网](https://brew.sh/)。

### 第 2 步：分别确认账号与 Computer Use 权限

1. 在这台 Mac 上安装并打开 Codex / ChatGPT 桌面应用，登录有 Computer Use 可用权限的账号；按 [OpenAI Computer Use 官方说明](https://learn.chatgpt.com/docs/computer-use)，在应用的插件页安装 Computer Use。
2. 按系统提示授予 **辅助功能、屏幕录制** 权限。若未弹窗，到「系统设置 → 隐私与安全性」检查 Codex Computer Use 对应权限，然后按提示重启相关应用。
3. 在桌面应用中，让它用 Computer Use 读取计算器，确认这台机器的底层能力可用。仅安装 Codex CLI 不够，桥接需要桌面应用提供的服务。
4. 在终端运行 `claude`，完成这台电脑的 Claude Code 登录或已有模型服务配置。先发送一句普通对话，确认模型能响应，再配置 MCP。若使用自有代理，在新机器单独配置认证；不要复制本仓库中的示例为真实密钥。

账号可用范围和插件入口以当前官方应用为准。如果应用中没有 Computer Use，先解决该能力的可用性；仅下载这个仓库不能补出缺失的底层服务。

### 第 3 步：下载并接入 MCP

先确认三个命令都能输出版本：

```sh
git --version
node --version
claude --version
```

在准备长期保留仓库的目录中执行：

```sh
git clone https://github.com/liwenjinchn/claude-codex-computer-use.git
cd claude-codex-computer-use
node scripts/install.mjs --dry-run
node scripts/install.mjs
```

安装器注册用户级 MCP `codex-cua`，安装 `/codex-computer-use` Skill；不需要 `npm install`，不改模型、密钥、代理配置。重复安装会保留已有同路径 MCP；若发现不同路径 MCP 或不同内容 Skill，会退出并提示处理。**安装后保留此文件夹和路径**，MCP 直接运行其中的脚本。

### 第 4 步：验证完成

重开 Claude Code，运行 `/mcp`，确认 `codex-cua` 已连接，然后输入：

> 使用 codex-computer-use 操作计算器，输入 83×47=，读取实际界面与截图核对结果。

如以前安装过原版插件，先执行 `claude plugin disable --scope user claude-codex-computer-use@songkeys`，避免重复工具。推荐本安装器的短 MCP 名称；本机曾观察到原插件长工具名报 `No such tool available`，尚未确定问题属于客户端还是模型代理。

## 自检与已验证范围

```sh
node --test test/*.test.mjs
node scripts/real-smoke-test.mjs
claude mcp get codex-cua
```

冒烟测试会读取应用列表并打开计算器，检查界面文字和 JPEG 截图。模型端到端测试可使用：

```sh
claude -p '使用 codex-computer-use 操作计算器，通过 UI 输入 83*47=，读取真实结果，禁止用脚本或心算代替。' --allowedTools 'mcp__codex-cua__*'
```

本机验证：Claude Code 2.1.309、Node 22.23.4、Computer Use 1001641；Claude 实际执行 1 次 `get_app_state` 与 15 次 `click`，返回 16 张截图，UI 观察到 `83×47=3,901` 和 `3910−9=3,901`。退出后未发现 bridge / `SkyComputerUseClient mcp` 控制进程残留。这是单台 Mac 的桌面验收，另一台机器仍需自检；未验证内置浏览器，也未测试全部工具。

## 常见安装问题

| 现象 | 下一步 |
| --- | --- |
| `node` / `git` / `claude` 找不到 | 回到第 1 步，安装对应组件、重开终端并检查 PATH |
| `Computer Use client missing` | 回到第 2 步，在桌面应用安装 Computer Use；不要用 npm 包替代底层服务 |
| `Signed Codex launcher missing` | 确认桌面应用安装在 `/Applications`；自定义安装位置可设置 `COMPUTER_USE_CODEX_LAUNCHER_PATH` 为其中签名 codex 可执行文件的完整路径，再运行安装器 |
| 辅助功能、截图权限错误 | 在系统设置重新检查授权，按系统提示重启应用，先验证桌面应用自身能操作计算器 |
| `codex-cua already exists with a different command` | 用 `claude mcp get codex-cua` 核对旧路径；确认旧配置不再需要后，执行 `claude mcp remove codex-cua --scope user`，再运行安装器 |
| 已有 Skill 内容不同 | 备份 `~/.claude/skills/codex-computer-use`，核对自己的修改后再移走旧版本并重装；安装器不会直接覆盖 |
| MCP 已连接，但模型请求报 `401` | 按下方认证排查；这是 Claude 模型认证问题，需要与 MCP 连接状态分开检查 |
| 安装后移动了仓库 | MCP 保存的是绝对路径；移回原处，或移除旧 MCP 后在新目录重新安装 |

完成标准：`/mcp` 中 `codex-cua` 已连接，Claude 实际调用界面工具，在计算器中输入并读取到 `3,901`。只回答算术结果不算通过，需观察到工具调用和真实界面。

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
