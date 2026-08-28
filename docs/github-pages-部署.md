# 社区 Skill 目录 GitHub Pages 部署指南

> 目标：把仓库的 `site/` 部署为 GitHub Pages，让社区 Skill 目录公开可浏览（按主题/课程模块筛选）；并让 CI（`catalog-ci.yml`）在社区 PR 合入后自动再生成产物，网页无需人工改动。
> 适用：本仓库（origin = `git@github.com:wangflyfly/Claude-Code-Assistant.git`）。

---

## 一、前置条件

| 项 | 要求 | 检查命令 |
|---|---|---|
| 仓库已推送到 GitHub | `main` 推送到 origin | `git status`（无 ahead） |
| `gh` CLI | 已安装并登录 | `gh --version`、`gh auth status` |
| GitHub Actions | 仓库已启用 Actions | 仓库 Settings → Actions |
| 目录产物已提交 | `site/`、`catalog/`、`.github/workflows/` 在 main | `git ls-files site/ .github/workflows/` |
| 仓库可见性 | **项目 Pages 站点要求仓库为 Public**（免费版） | 仓库 Settings → 可见性 |

> ⚠️ 本机当前 `gh` **未安装**。见下一节安装。

---

## 二、安装并登录 gh（若未装）

### 2.1 安装

**Windows（winget）**：

```bash
winget install --id GitHub.cli
```

**macOS（Homebrew）**：

```bash
brew install gh
```

**Linux（apt）**：

```bash
(type -p wget >/dev/null || (sudo apt update && sudo apt-get install wget -y)) \
&& sudo mkdir -p -m 755 /etc/apt/keyrings \
&& wget -qO- https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null \
&& sudo chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg \
&& echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
&& sudo apt update && sudo apt install gh -y
```

安装后**重启终端**再继续。

### 2.2 登录

```bash
gh auth login
```

按提示选择 GitHub.com → HTTPS → 浏览器登录（或粘贴 token）。

验证：

```bash
gh auth status
gh api user --jq .login   # 应输出你的 GitHub 用户名
```

---

## 三、推送 main 到 GitHub

当前 main 领先 origin 20 个提交（v3/v4 全部工作）。首次或增量推送：

```bash
git push -u origin main
```

验证：

```bash
git status                       # 显示 up to date
git ls-remote origin main        # 应看到远端 main 的 SHA
```

> 推送后，`.github/workflows/catalog-ci.yml` 会被 GitHub 识别；但 Pages 站点还需在下一步显式启用。

---

## 四、启用 GitHub Pages（`site/` 为发布源）

### 方式 A：gh CLI（推荐，可脚本化）

先确认仓库已在 GitHub：

```bash
gh repo view wangflyfly/Claude-Code-Assistant --json visibility,url
# visibility 应为 PUBLIC（免费版项目 Pages 需要）；URL 应存在
```

启用 Pages，发布源 = `main` 分支 + `/site` 目录：

```bash
gh api -X POST repos/wangflyfly/Claude-Code-Assistant/pages \
  -f "build_type=legacy" \
  -f "source[branch]=main" \
  -f "source[path]=/site"
```

> 说明：
> - `build_type=legacy` = 从分支目录发布（非 Actions workflow）；`source[path]=/site` 让 Pages 只发布 `site/` 子目录。
> - 若仓库此前从 web UI 配置过 Pages，会报「已存在」，改用 PUT 更新：
>   ```bash
>   gh api -X PUT repos/wangflyfly/Claude-Code-Assistant/pages \
>     -f "source[branch]=main" -f "source[path]=/site"
>   ```

查询 Pages 配置与部署状态：

```bash
gh api repos/wangflyfly/Claude-Code-Assistant/pages --jq '{url: .html_url, status: .status, source: .source}'
# status: built / building / null（尚未触发首次构建）
```

### 方式 B：Web UI（备选）

1. 浏览器打开 `https://github.com/wangflyfly/Claude-Code-Assistant/settings/pages`
2. **Build and deployment → Source**：选 **Deploy from a branch**
3. **Branch**：`main`；**目录**：`/site`
4. Save

---

## 五、验证站点

1. **首次部署**：启用后 GitHub 触发首次构建，通常 **1~3 分钟**。

2. **访问 URL**（项目站点格式）：

   ```
   https://wangflyfly.github.io/Claude-Code-Assistant/
   ```

3. **核对内容**：
   - 页面加载出免责声明横幅 + 主题 chips + 课程模块下拉 + 至少 1 张 skill 卡片（cc-assistant 自荐）。
   - 点主题 chip（如 `hooks`）→ 列表过滤正确；选模块下拉 → 按映射主题匹配。
   - 打开浏览器 DevTools → Network：`data/catalog.json`、`data/course-mapping.json`、`assets/app.js` 均为 200。

4. **curl 快速冒烟**：

   ```bash
   curl -s -o /dev/null -w "%{http_code}\n" https://wangflyfly.github.io/Claude-Code-Assistant/
   curl -s https://wangflyfly.github.io/Claude-Code-Assistant/data/catalog.json | head
   ```

---

## 六、CI 自动生效（无需额外配置）

推送后 GitHub Actions 自动识别 `.github/workflows/catalog-ci.yml`：

| 事件 | job | 行为 |
|---|---|---|
| 对 `catalog/**` 的 **PR** | `validate` | 只读：`node catalog/validate.mjs`（结构）+ `sync-catalog.mjs --check`（防漂移），不写文件（供应链防护） |
| **push 到 main** 且动到 `catalog/**` | `sync` | 跑 `sync-catalog.mjs` 再生成三产物（site/data 两文件 + `_community-skills.md`），用 GITHUB_TOKEN 提交并推送（不递归触发） |

验证 CI：

```bash
gh run list --limit 5
```

首次推送的 `sync` job 应是 no-op（产物已在 main 且无漂移，`git diff --cached --quiet` 分支跳过提交）。

---

## 七、日常贡献闭环（部署后）

1. 网友按 `.github/PULL_REQUEST_TEMPLATE/skill-entry.md` 模板，在 `catalog/catalog.json` 加一条 skill，本地跑：
   ```bash
   node catalog/validate.mjs
   node catalog/sync-catalog.mjs    # 并把再生成产物一起提交
   ```
2. 提 PR → CI `validate` 通过 → 维护者审核合入 → CI `sync` 再生成 → **网页自动展示、课程快照自动更新**。

---

## 八、常见问题 / 注意点

| 问题 | 说明 / 处理 |
|---|---|
| **站点 404** | 首次部署未完成（等 1-3 分钟）；或 Pages 未保存 `/site` 目录；或仓库为 Private（免费版项目站点必须 Public）。 |
| **网页空白、卡片不显示** | 打开 DevTools Console：多为 `file://` 直开（CORS）或 `data/*.json` 404——必须走 http(s) 访问；确认 `site/data/*` 已提交（Pages 只服务已提交文件）。 |
| **Jekyll 干扰** | `site/.nojekyll` 已关闭 Jekyll；勿删除。 |
| **CI 校验报漂移** | 产物被手工改过：`node catalog/sync-catalog.mjs` 重新生成并提交；或映射/词表与模块清单不一致。 |
| **sync 提交死循环** | 已用 GITHUB_TOKEN（不触发递归）+ `concurrency` 组防竞态；正常不会循环。 |
| **产物与源行尾差异** | `--check` 已做 CRLF 归一化（git autocrlf 检出差异不影响判定）。 |
| **想换自定义域名** | Pages Settings → Custom domain，配 CNAME；`site/` 下加 `CNAME` 文件。 |

---

## 附：当前状态快照（写本文档时）

- `gh` 未安装；origin 已配置；`main` 领先 origin **20** 个提交（v3/v4 全部工作）。
- 已完成且在 main：`site/`（含 `.nojekyll` + 静态站 + `data/` 产物）、`catalog/`（数据层 + validate/sync 双脚本 + 测试）、`.github/workflows/catalog-ci.yml`、`.github/PULL_REQUEST_TEMPLATE/skill-entry.md`。
- 剩余动作：装/登 gh → `git push -u origin main` → 启用 Pages（`/site`）→ 验证站点。
