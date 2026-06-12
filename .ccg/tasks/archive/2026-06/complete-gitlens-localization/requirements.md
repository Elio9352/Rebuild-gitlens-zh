# 需求文档：GitLens 18.1.0 汉化遗漏补全

## 背景

- 本项目采用 **post-build 汉化方案**：对编译后的 `gitlens-18.1.0.vsix` 做字符串替换，生成 `gitlens-18.1.0-zh-CN.vsix`，不修改上游源码。
- 翻译表内嵌于 `scripts/localize/localize-gitlens-vsix.mjs`（~9700 处），补充表为 `runtime-extra-{literals,fragments,templates}.json`（1163 / 1232 / 18 条）。
- 翻译表基于 v18.1.0；上游源码对照需使用 v18.1.0 tag（已建 worktree：`/tmp/gitlens-v18.1.0`）。
- 替换目标：`extension/package.json`（contributes 配置/命令/视图）、30 个 `dist/**/*.js` runtime 文件、walkthroughs markdown、README/CHANGELOG、settings HTML。

## 目标

1. 全量检索 vscode-gitlens v18.1.0 源码及 vsix 产物，找出**用户可见但未被翻译表覆盖**的英文字符串。
2. 将遗漏字符串翻译为简体中文，注入翻译表（优先 `runtime-extra-*.json` 扩展点）。
3. 重新构建 zh-CN vsix 并验证：替换统计提升、包完整性校验通过、抽查无残留。

## 边界与例外（不算"遗漏"）

- 技术专有名词：Git 术语（rebase/stash/cherry-pick 在命令名中的形式）、产品名（GitLens、GitKraken、GitHub、Jira 等）、API/协议名、文件路径、URL、CSS、HTML 标签、telemetry key、配置键名、命令 ID、SCM 内部 ID。
- 非用户可见字符串：日志、错误堆栈标识、内部枚举值、调试输出。
- 日期/locale 格式串、正则、快捷键 keybinding。
- 上游新版本（>18.1.0）新增的字符串不在本次范围（翻译表基于 18.1.0）。

## 验收标准

1. 运行 `GITLENS_VERSION=18.1.0 node scripts/localize/localize-gitlens-vsix.mjs` 成功，校验逻辑通过。
2. 解包 zh-CN vsix，对用户可见面（package.json contributes、runtime JS 中的 UI 字符串、walkthroughs）扫描：残留英文 UI 字符串数 ≈ 0（技术名词除外）。
3. 不破坏 JS 语法（字符串替换正确转义）、不破坏 package.json 结构。

## 需求完整性评分

- 目标明确性：3/3（找遗漏→翻译→100% 覆盖）
- 预期结果：3/3（zh-CN vsix 无残留英文 UI 字符串）
- 边界范围：2/2（技术名词除外，版本锁定 18.1.0）
- 约束条件：2/2（post-build 方案、不改上游源码、优雅退化机制保留）

**总分：10/10 ≥ 7 ✓ → 进入 Phase 2**
