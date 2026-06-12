# 多模型分析综合 — GitLens 汉化遗漏补全

## 基线测量（Claude 实测）

运行 `GITLENS_VERSION=18.1.0 node scripts/localize/localize-gitlens-vsix.mjs` 成功：
- runtime 替换 9728 处（27/30 文件变更）、package.json 3982 处、settings HTML 992 处
- 解包产物残留扫描：package.json 仅 4 处残留（1 处真遗漏 "Git Worktree..."，其余为作者名/技术模板）
- dist JS 裸扫残留候选 3937 个（含大量 minified 解析噪音与内部错误消息）
- **源码驱动交叉验证**（v18.1.0 worktree → 汉化产物）：提取 1989 个用户可见字符串，386 个残留英文；自动分类后 **362 条需翻译**（literal 277 / template 85），24 条排除（git 参数、codicon、搜索语法示例）

## codex (backend analyzer) 结论

- **两阶段法**：源码 TypeScript 抽取为主候选集，localized dist 扫描作为兜底与回归门禁；裸 regex 扫 minified JS 噪音过高
- 新增翻译**选择最窄规则类型**：完整 literal 优先 → 变量不稳定用 ⟦⟧ placeholder template → anchored regex → raw fragment 仅作最后手段
- 风险与防护：
  - 转义破坏 JS（引号/反引号/`${}`）；翻译目标含 `${` 默认禁止
  - substring collision：禁止新增短 fragment（最小长度 + ≥2 自然语言词），按长度降序
  - regex 替换中 `$1`/`$&` 特殊含义需审查
  - 避免词级宽泛清洗造成中英混排污染
- 验证：`unzip -t` + 全部 dist JS 跑 `node --check`（基线 31 个全部通过）+ package.json 结构对比（command id/config key/view id 数量不变）+ 残留扫描分桶统计
- SESSION: `019eba87-cbaa-7d40-b505-30a65f288894`

## gemini (frontend analyzer) 结论

- Surface 清单：webview apps（lit-html 文本/属性）、quickpick 流程、通知、package.json contributes、constants UI 标签
- 高风险遗漏类型排序：pluralize 复数逻辑（CRITICAL，编译后结构变化）> 运行时片段拼接 > minified 三元逻辑 > 静态 HTML（LOW）
- 属性提取要覆盖 aria-label/tooltip/placeholder/empty-text 等；注意 HTML entities（&mdash;）
- QA 清单：webview 文本溢出、悬停 tooltip、quickpick 向导全流程、通知按钮、walkthrough、输出通道
- SESSION: `f017a86b-ac95-4f92-a7b3-1181ce2320ed`

## 方案对比

| 方案 | 思路 | 评估 |
|------|------|------|
| A. 仅产物扫描 | 直接翻译 dist 残留候选 | ❌ 3937 候选噪音过高，误translate内部字符串风险大 |
| B. 源码驱动 + 产物门禁（双模型共识）| 源码提取 → 产物交叉验证 → 翻译注入 → 重建 → 残留门禁迭代 | ✅ 选定：精确、可验证、可迭代 |

## 选定方案 B 执行要点

1. 362 条 backlog 按 kind 注入：literal → `runtime-extra-literals.json`；template → `runtime-extra-templates.json`（⟦⟧ 形式）；多行 HTML 块 → `runtime-extra-fragments.json`
2. package.json 遗漏 "Git Worktree..." → `commandTitleOverrides`（或 exact 表）
3. 迭代第 2 轮：重建后用改进的 tokenizer 重扫残留（含 packages/ 工作区来源），triage 高置信项补翻，直至残留稳定 ≈ 0
4. 验证链：`node --check` × 30 dist JS + `unzip -t` + package.json 结构 diff + 残留统计分桶报告
