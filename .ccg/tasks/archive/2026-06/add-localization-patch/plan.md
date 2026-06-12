# 实施计划：集成 post-build 汉化流程进 CI 工作流

## 需求

CI 在 `pnpm package` 产出原版 vsix 后，自动生成汉化版 `gitlens-{version}-zh-CN.vsix`，随 GitHub Release 一并发布。汉化方案来自 `/Users/qjh/Desktop/gitlens-localize`（post-build 字符串替换，~9700 处，零 npm 依赖）。

## 方案（双模型分析综合结论）

汉化采用 **post-build VSIX 字符串替换**（不做源码 patch，~9700 处替换做成源码 patch 不可行且每版必冲突）。脚本改造为**自包含的参数化转换器**，CI 中复制到隔离目录运行，保持「上游源码构建」与「本仓库后处理」的边界。

双模型关键发现（均已纳入）：
- 脚本实际读取 **4 个文件**：主脚本 + literals/fragments/**templates** 三个 JSON（原计划遗漏 templates）
- 翻译表路径硬编码为 `path.resolve('scripts/runtime-extra-*.json')`（依赖 cwd）→ 改用 `import.meta.dirname` 解析（高风险项）
- `restoreOriginalPackageFiles()` 只解压局部文件，但 `packageLocalizedVsix()` 打包整个目录 → 必须**完整解压**（runtime 目标含 `dist/browser/*`、`dist/webviews/*`）
- 版本号用 `package.json.version`（如 `18.1.0`），不是 tag 的 `v18.1.0`
- `source-repo` 不应存活到 `pnpm install/package`（避免污染上游构建）→ 先把 localize 脚本复制到隔离目录，再按原时机删除 `source-repo`

## 步骤

1. **新增 `scripts/localize/`**（从 gitlens-localize 复制 4 个文件）：
   - `localize-gitlens-vsix.mjs`（368KB 汉化引擎）
   - `runtime-extra-literals.json` / `runtime-extra-fragments.json` / `runtime-extra-templates.json`

2. **改造 `scripts/localize/localize-gitlens-vsix.mjs`**（3 处小改）：
   - L5: `const GITLENS_VERSION = process.env.GITLENS_VERSION || '18.1.0';`
   - L5001/5008/5058: 三个翻译表路径改为 `path.join(import.meta.dirname, 'runtime-extra-*.json')`
   - `restoreOriginalPackageFiles()`: 改为完整解压（`unzip -o source.vsix -d extractedRoot`，去掉局部文件列表），保证打包产物不缺资源；本地与 CI 行为一致

3. **修改 `.github/workflows/build.yml`**：
   - 「拉取patches」步骤 sparse-checkout 增加 `scripts/localize`
   - 「Apply patches」后新增复制：`cp -r source-repo/scripts/localize "$RUNNER_TEMP/localize"`（隔离，避免污染上游源码树）；`rm -rf source-repo` 时机不变
   - 「Get package name」后新增「Localize extension」步骤：
     ```
     GITLENS_VERSION=${{ env.PACKAGE_VERSION }} node "$RUNNER_TEMP/localize/localize-gitlens-vsix.mjs"
     ```
     并做最小验证：zh-CN vsix 存在非空、`unzip -t` 通过、`extension/package.json` 含中文
   - 「Create GitHub release」`files` 增加 `./gitlens-${{ env.PACKAGE_VERSION }}-zh-CN.vsix`

4. **本地验证**：用 gitlens-localize 现有的 `gitlens-18.1.0.vsix` 在临时目录跑通改造后的脚本，比对包完整性（文件数 ≥ 原包）与替换统计

## 影响范围

- 新增: `scripts/localize/` 4 个文件（~588KB）
- 修改: `.github/workflows/build.yml`（+~30 行）
- 测试: 本地 smoke test（步骤 4），CI 实际验证需下次 workflow 运行

## 已知风险与对策

- **版本漂移**：新版字符串替换不到 → 保持英文（优雅退化）；脚本输出 JSON 替换统计可观测
- **现有 CI 的 `git apply || echo` 吞错**：计划外问题，仅报告不处理
