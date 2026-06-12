# 实施计划 — GitLens 18.1.0 汉化遗漏补全

## 目标

将 362 条已确认遗漏（+ 第 2 轮迭代发现项）翻译为简体中文并注入翻译表，重建 zh-CN vsix，残留门禁趋零，不破坏 JS/JSON 完整性。

## 实施步骤

### Step 1: 翻译 backlog（核心工作量）

输入：`/tmp/gitlens-l10n/backlog.json`（362 条，含 kind/contexts/srcFiles/distFiles 元数据）

按目标文件分组注入（文件归属互不重叠）：

| 子任务 | 内容 | 目标文件 |
|--------|------|----------|
| T1 | 277 条 literal 翻译（按主题分批：quickpick/通知/webview 文本/属性/状态栏） | `scripts/localize/runtime-extra-literals.json` |
| T2 | 85 条 template 翻译（`${...}` → `⟦⟧` 占位符形式；多行含 `\n\t` 的保留原始空白用 fragments） | `scripts/localize/runtime-extra-templates.json`、`runtime-extra-fragments.json` |
| T3 | package.json 遗漏 1 条 "Git Worktree..." | `localize-gitlens-vsix.mjs` 的 `commandTitleOverrides` |

翻译规范：
- 技术名词保留英文：Git 子命令/参数、产品名（GitLens/GitKraken/GitHub/...）、Worktree、Blame、Rebase（命令语境）、stash、cherry-pick、PR、AI、MCP、URL、SHA、codicon `$(...)` 标记、`⟦⟧` 占位符
- 与既有 9700+ 条翻译的术语保持一致（如 Launchpad=启动台、Commit Graph=提交图、Worktree 不译、stash=贮藏）——注入前先从现有表抽取术语对照
- 翻译值禁止包含 `${`（防模板插值注入）；fragment 最小长度限制、≥2 自然语言词

### Step 2: 重建与门禁

1. `GITLENS_VERSION=18.1.0 node scripts/localize/localize-gitlens-vsix.mjs` → 替换统计应显著上升（9728 → 预计 +400~800）
2. 30 个 dist JS 全部 `node --check`；`unzip -t`；package.json `JSON.parse` + 与原包 command id/config key 数量 diff
3. 重跑源码交叉验证器：missedCount 386 → 目标 < 20（仅剩技术项）

### Step 3: 第 2 轮迭代（兜底）

1. 改进 tokenizer 重扫 dist 残留（过滤扫描伪影/内部错误），triage 高置信 UI 残留（如 packages/ 工作区来源、pluralize 片段）
2. 补翻 → 重建 → 重扫，直至高置信残留 ≈ 0
3. 每轮记录统计入 fix-log.jsonl

### Step 4: 验收

- 最终统计报告：替换数对比、残留分桶（host runtime / webview / package / markdown）
- 抽查 10 处典型 UI 字符串在产物中的中文呈现

## 架构决策

- **不改主表 .mjs 的内嵌大表**（除 1 条 commandTitleOverrides），全部走 `runtime-extra-*.json` 扩展点 — 保持上游 diff 最小、便于维护（KISS）
- 最窄规则优先：literal > ⟦⟧ template > fragment > regex（codex 共识，防 substring collision）
- 分析工具（extract-source.mjs / scan-residual.mjs）固化到 `scripts/localize/tools/`，便于后续版本复用

## 测试策略

构建脚本自带校验 + node --check 语法门禁 + 结构 diff + 残留扫描回归。无需运行时 E2E（post-build 替换不改逻辑）。

## 风险与缓解

| 风险 | 缓解 |
|------|------|
| 短字符串误替换（如 "Open" 出现在标识符中）| literal 替换仅匹配完整 quoted literal（脚本既有机制），不加短 fragment |
| 翻译破坏转义 | 脚本既有 escapeRuntimeQuotedLiteral；翻译值禁 `${`、禁未转义反引号 |
| 模板 ⟦⟧ 数量不匹配 | 注入前脚本化校验源/译占位符数量一致 |
| 术语不一致 | 注入前从现有表生成术语对照表供翻译参考 |

## 工作量

- 翻译：362 条 ≈ 4-6 批并行子代理（Claude 翻译，按 surface 分组）
- 工具与验证：约 150 行脚本增量
- 预计 2 轮迭代收敛
