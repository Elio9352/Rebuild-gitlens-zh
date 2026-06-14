import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const GITLENS_VERSION = process.env.GITLENS_VERSION || '18.1.0';
// 版本号参与路径拼接和 rmSync 递归删除，必须限定为合法 semver，防止异常 env 导致路径逃逸
if (!/^\d+\.\d+\.\d+(?:[-+][\w.-]+)?$/.test(GITLENS_VERSION)) {
	throw new Error(`Invalid GITLENS_VERSION: ${GITLENS_VERSION}`);
}
const extractedRoot = path.resolve(`gitlens-${GITLENS_VERSION}-extracted`);
const extensionRoot = path.join(extractedRoot, 'extension');
const packagePath = path.join(extensionRoot, 'package.json');
const vsixManifestPath = path.join(extractedRoot, 'extension.vsixmanifest');
const sourceVsixPath = path.resolve(`gitlens-${GITLENS_VERSION}.vsix`);
const localizedVsixPath = path.resolve(`gitlens-${GITLENS_VERSION}-zh-CN.vsix`);

const exactTranslations = new Map(
	Object.entries({
		'GitLens — Git supercharged': 'GitLens — 增强你的 Git 体验',
		'Supercharge Git within VS Code — Visualize code authorship at a glance via Git blame annotations and CodeLens, seamlessly navigate and explore Git repositories, gain valuable insights via rich visualizations and powerful comparison commands, and so much more':
			'在 VS Code 中增强 Git 体验 — 通过 Git Blame 标注和 CodeLens 一眼查看代码作者，顺畅浏览和探索 Git 仓库，并通过丰富的可视化与强大的比较命令获取深入洞察。',
		'Join us in the #gitlens channel': '加入我们的 #gitlens 频道',
		'GitKraken (bundled with GitLens)': 'GitKraken（随 GitLens 捆绑）',
		GitLens: 'GitLens',
		'GitLens Inspect': 'GitLens 检查',
		'GitLens Patch': 'GitLens 补丁',
		'Inline Blame': '内联 Blame',
		'Git CodeLens': 'Git CodeLens',
		'Status Bar Blame': '状态栏 Blame',
		Hovers: '悬停提示',
		'File Annotations': '文件标注',
		'File Blame': '文件 Blame',
		'File Changes': '文件更改',
		'File Heatmap': '文件热力图',
		'Commit Graph (ᴘʀᴏ)': '提交图（ᴘʀᴏ）',
		Home: '主页',
		'Launchpad (ᴘʀᴏ)': '启动台（ᴘʀᴏ）',
		'Cloud Patches (ᴘʀᴇᴠɪᴇᴡ)': '云补丁（ᴘʀᴇᴠɪᴇᴡ）',
		'AI (ᴘʀᴇᴠɪᴇᴡ)': 'AI（ᴘʀᴇᴠɪᴇᴡ）',
		'Visual File History': '可视化文件历史',
		'Cloud Integrations': '云集成',
		'Remote Providers & Integrations': '远程提供商与集成',
		'AI Features': 'AI 功能',
		'Get Started With GitLens': '开始使用 GitLens',
		'Welcome to GitLens': '欢迎使用 GitLens',
		'Welcome to GitLens Pro': '欢迎使用 GitLens Pro',
		'Get the most out of GitLens': '充分发挥 GitLens 的价值',
		'Get the most out of GitLens ': '充分发挥 GitLens 的价值',
		'Discover the Benefits of GitLens Pro': '了解 GitLens Pro 的优势',
		'Home View': '主页视图',
		'Interactive Code History': '交互式代码历史',
		'Accelerate PR Reviews': '加速 PR 评审',
		'Streamline Collaboration': '简化协作',
		'Improve Workflows With Integrations': '通过集成改进工作流',
		'Built-in AI': '内置 AI',
		Repositories: '仓库',
		Commits: '提交',
		Branches: '分支',
		Remotes: '远程',
		Stashes: '贮藏',
		Tags: '标签',
		Worktrees: '工作树',
		Contributors: '贡献者',
		Inspect: '检查',
		'Pull Request': '拉取请求',
		'Line History': '行历史',
		'File History': '文件历史',
		'Search & Compare': '搜索与比较',
		Launchpad: '启动台',
		'Cloud Patches': '云补丁',
		'Cloud Workspaces': '云工作区',
		'Commit View': '提交视图',
		'Pull Request View': '拉取请求视图',
		Graph: '图',
		'Graph Details': '图详情',
		Patch: '补丁',
		Browse: '浏览',
		'Open Changes': '打开更改',
		'Copy As': '复制为',
		'Open Changes with': '用以下方式打开更改',
		Commit: '提交',
		'Filter Files': '筛选文件',
		'Open on Remote (Web)': '在远程打开（Web）',
		Share: '共享',
		Sections: '分区',
		'New Search or Compare': '新建搜索或比较',
		'Sort By': '排序方式',
		'Sort Branches By': '分支排序方式',
		'Group / Detach Views': '分组 / 分离视图',
		'View Options': '视图选项',
		'Show / Hide Views': '显示 / 隐藏视图',
		'Scroll Markers': '滚动标记',
		'Commit Graph Settings': '提交图设置',
		Add: '添加',
		'Add Co-authors...': '添加共同作者...',
		'Explain Branch Changes (Preview)...': '解释分支更改（预览）...',
		'Explain Branch Changes (Preview)': '解释分支更改（预览）',
		'Explain Commit Changes (Preview)...': '解释提交更改（预览）...',
		'Explain Changes (Preview)': '解释更改（预览）',
		'Explain Stash Changes (Preview)...': '解释贮藏更改（预览）...',
		'Explain Unpushed Changes (Preview)': '解释未推送更改（预览）',
		'Explain Working Changes (Preview)...': '解释工作区更改（预览）...',
		'Explain Working Changes (Preview)': '解释工作区更改（预览）',
		Helpful: '有帮助',
		Unhelpful: '没有帮助',
		'Generate Changelog (Preview)...': '生成变更日志（预览）...',
		'Generate Changelog (Preview)': '生成变更日志（预览）',
		'Generate Commit Message': '生成提交消息',
		'Generate Commit Message with GitLens': '使用 GitLens 生成提交消息',
		'Install GitKraken MCP Server': '安装 GitKraken MCP 服务器',
		'Reinstall GitKraken MCP Server': '重新安装 GitKraken MCP 服务器',
		'$(loading~spin) Loading...': '$(loading~spin) 正在加载...',
		'Install Claude Hooks': '安装 Claude Hooks',
		'Uninstall Claude Hooks': '卸载 Claude Hooks',
		'Enable AI Features...': '启用 AI 功能...',
		'Connect GitKraken MCP to More Agents...': '将 GitKraken MCP 连接到更多智能体...',
		'Enable Debug (Trace) Logging': '启用调试（跟踪）日志',
		'Disable Debug (Trace) Logging': '禁用调试（跟踪）日志',
		'Git Worktree...': 'Git 工作树...',
		'Start PR Review': '开始 PR 审查',
		'Always continue manually': '总是手动继续',
		'Always open in an agent': '总是在智能体中打开',
		'Ask each time (default)': '每次询问（默认）',
		'Switch AI Provider/Model...': '切换 AI 提供商/模型...',
		'Switch GitLens AI Provider/Model...': '切换 GitLens AI 提供商/模型...',
		'Next Change': '下一个更改',
		'Previous Change': '上一个更改',
		'Apply Copied Changes (Patch)': '应用已复制的更改（补丁）',
		'Associate Issue with Branch...': '将议题关联到分支...',
		'Browse Repository from Revision': '从修订浏览仓库',
		'Browse Repository from Revision in New Window': '在新窗口中从修订浏览仓库',
		'Browse Repository from Before Revision': '从修订之前浏览仓库',
		'Browse Repository from Before Revision in New Window': '在新窗口中从修订之前浏览仓库',
		'Change Branch Merge Target': '更改分支合并目标',
		'Change Upstream...': '更改上游...',
		'Clear File Annotations': '清除文件标注',
		'Close Unchanged Files': '关闭未更改文件',
		'Compare HEAD with...': '将 HEAD 与...比较',
		'Compare References...': '比较引用...',
		'Compare Working Tree with...': '将工作树与...比较',
		'Compose Commits (Preview)...': '编排提交（预览）...',
		'Composing Changes': '编排更改',
		'NEXT STEPS': '后续步骤',
		Maximize: '最大化',
		Refresh: '刷新',
		Stashes: '贮藏',
		Tags: '标签',
		'Connected to GitHub': '已连接到 GitHub',
		'Connected to GitLab': '已连接到 GitLab',
		'Connected to Bitbucket': '已连接到 Bitbucket',
		'Connected to Azure DevOps': '已连接到 Azure DevOps',
		'files modified': '个文件已修改',
		'file modified': '个文件已修改',
		'Visualizes the volume of additions and deletions per day. Computing this requires reading each commit\'s diff stats and can take a while on large repos.':
			'可视化每天的新增和删除量。计算这个需要读取每个提交的差异统计，在大型仓库上可能需要一段时间。',
		'Computing File Annotations...': '正在计算文件标注...',
		'Connect Remote Integration': '连接远程集成',
		'Copy Current Branch Name': '复制当前分支名称',
		'Copy Link to Branch': '复制分支链接',
		'Copy Link to Commit': '复制提交链接',
		'Copy Link to Comparison': '复制比较链接',
		'Copy Link to File': '复制文件链接',
		'Copy Link to File at Revision...': '复制指定修订的文件链接...',
		'Copy Link to Code': '复制代码链接',
		'Copy Link to Repository': '复制仓库链接',
		'Copy Link to Tag': '复制标签链接',
		'Copy Link to Workspace': '复制工作区链接',
		'Copy Message': '复制消息',
		'Copy Changes (Patch)': '复制更改（补丁）',
		'Copy Relative Path': '复制相对路径',
		Views: '视图',
		'Interactive Rebase Editor': '交互式变基编辑器',
		'Date & Times': '日期和时间',
		Sorting: '排序',
		'Menus & Toolbars': '菜单与工具栏',
		'Keyboard Shortcuts': '键盘快捷键',
		Modes: '模式',
		Advanced: '高级',
		General: '通用',
		Terminal: '终端',
		Review: '评审',
		Zen: '禅模式',
		// === 命令标题翻译（修复半汉化问题）===
		// Agent 相关
		'Open AI Agent Session': '打开 AI 智能体会话',
		'Switch Default Agent...': '切换默认智能体...',
		// Worktree 相关
		'Copy Working Changes to Worktree...': '复制工作区更改到工作树...',
		'Checkout Pull Request in Worktree (GitLens)...': '在工作树中检出拉取请求 (GitLens)...',
		'Git Create Worktree...': 'Git 创建工作树...',
		'Git Delete Worktree...': 'Git 删除工作树...',
		'Git Open Worktree...': 'Git 打开工作树...',
		'Create Worktree...': '创建工作树...',
		'Delete Worktree...': '删除工作树...',
		'Delete Worktrees...': '删除工作树...',
		'Open Worktree': '打开工作树',
		'Open Worktree File': '打开工作树文件',
		'Open Worktree in New Window': '在新窗口中打开工作树',
		'Open Worktrees in New Window': '在新窗口中打开工作树',
		'Open in Worktree': '在工作树中打开',
		Worktree: '工作树',
		// Working Tree 相关
		'Compare Working Tree to Common Base': '比较工作树与公共基准',
		'Compare Working Tree to Here': '比较工作树与此处',
		'Compare Working Tree with': '比较工作树与',
		'Compare with Working Tree': '与工作树比较',
		'Compare Ancestry with Working Tree': '比较工作树公共基准',
		'Open All Changes with Working Tree': '使用工作树打开所有更改',
		'Open All Changes with Working Tree Individually': '分别使用工作树打开所有更改',
		'Open All Changes with Working Tree': '使用工作树打开所有更改',
		'Open All Changes with Working Tree Individually': '分别使用工作树打开所有更改',
		'Directory Compare Working Tree with Here': '目录比较工作树与此处',
		'Directory Compare with Working Tree': '将目录与工作树比较',
		'Set Branch Comparison to Working Tree': '与工作树比较',
		// Path 相关
		'Copy Path': '复制路径',
		'Copy Paths': '复制路径',
		'Copy Relative Paths': '复制相对路径',
		// 操作动词
		'Reword Commit...': '改写提交消息...',
		'Modify Commits from Here (Interactive Rebase)...': '修改提交从此处（交互式变基）...',
		'Modify Commits (Interactive Rebase)...': '修改提交（交互式变基）...',
		'Squash Commits...': '压缩提交...',
		'Discard Changes...': '丢弃更改...',
		'Pop Stash...': '弹出贮藏...',
		'Git Pop Stash...': 'Git 弹出贮藏...',
		'Apply / Pop Stash...': '应用 / 弹出贮藏...',
		'Apply / Pop a Stash...': '应用 / 弹出贮藏...',
		'Undo Commit on Worktree': '撤销工作树上的提交',
		// Filter 相关
		'Filter Repositories...': '筛选仓库...',
		'Clear Author Filter': '清除作者筛选',
		// 其他操作
		'Git Copy Working Changes to Worktree...': 'Git 复制工作区更改到工作树...',
		'Git Change Branch Merge Target...': 'Git 更改分支合并目标...',
		'Simulate AI Provider (Debugging)': '模拟 AI 提供商（调试）',
		'Remove Remote': '移除远程',
		'Remove Remote...': '移除远程...',
		'Git Remove Remote...': 'Git 移除远程...',
		'Setup Commit Signing...': '设置提交签名...',
		'Configure Inline Blame': '配置内联 Blame',
		'Show Welcome View': '显示欢迎视图',
		'Show Worktrees View': '显示工作树视图',
		'Start Work with Agent': '使用智能体开始工作',
		'Pin Branch to Edge': '固定分支到边缘',
		'Unpin Branch from Edge': '从边缘取消固定分支',
		'Stage Current Changes': '暂存当前更改',
		'Stage Incoming Changes': '暂存传入更改',
		'Simulate AI Provider (Debug)': '模拟 AI 提供商（调试）',
		'Open on gitkraken.dev': '在 gitkraken.dev 上打开',
		'Open Logs': '打开日志',
		'Open Visual Folder History': '打开可视化文件夹历史',
		'Close Welcome': '关闭欢迎',
		'Hide Worktrees': '隐藏工作树',
		'Show Worktrees': '显示工作树',
		'Group Worktrees View': '分组工作树视图',
		'Detach Worktrees View': '分离工作树视图',
		'Hide Worktrees View': '隐藏工作树视图',
		'Show Worktrees View': '显示工作树视图',
		'Worktrees View Options': '工作树视图选项',
		'Hide SHA Column': '隐藏 SHA 列',
		'Show SHA Column': '显示 SHA 列',
		'Copy SHA': '复制 SHA',
	}),
);

const phraseTranslations = [
	['Pull Requests', '拉取请求'],
	['Pull Request', '拉取请求'],
	['Pull Request Markers', '拉取请求标记'],
	['Associated Pull Request', '关联拉取请求'],
	['All Changes Individually', '分别打开所有更改'],
	['All Changes with Common Base', '使用公共基准打开所有更改'],
	['All Changes with Worktree Individually', '分别使用 Worktree 打开所有更改'],
	['All Changes with Worktree', '使用 Worktree 打开所有更改'],
	['All Changes', '所有更改'],
	['Common Base', '公共基准'],
	['Current Branch', '当前分支'],
	['Since Before this Commit', '自此提交之前'],
	['Stage All Changes', '暂存所有更改'],
	['Unstage All Changes', '取消暂存所有更改'],
	['Highlight All Changes Since Before this Commit', '高亮此提交之前以来的所有更改'],
	['Reset Current Branch to Commit', '将当前分支重置到提交'],
	['Reset Current Branch to Tag', '将当前分支重置到标签'],
	['Switch to Branch', '切换到分支'],
	['Switch to Commit', '切换到提交'],
	['Switch to Tag', '切换到标签'],
	['Push to Commit', '推送到提交'],
	['Stash All Changes', '贮藏所有更改'],
	['Create VS Code Workspace', '创建 VS Code 工作区'],
	['Create Cloud Workspace', '创建云工作区'],
	['Convert to Cloud Workspace', '转换为云工作区'],
	['Delete Workspace', '删除工作区'],
	['Remove from Workspace', '从工作区移除'],
	['Open All Changes with Worktree Individually', '分别使用 Worktree 打开所有更改'],
	['Open All Changes with Worktree', '使用 Worktree 打开所有更改'],
	['Copy Working Changes to Worktree', '复制工作区更改到 Worktree'],
	['Checkout Pull Request in Worktree', '在 Worktree 中签出拉取请求'],
	['Compare Worktree to Common Base', '将 Worktree 与公共基准比较'],
	['Compare Worktree to Here', '将 Worktree 与此处比较'],
	['Directory Compare Worktree to Here', '将目录中的 Worktree 与此处比较'],
	['Compare with Worktree', '与 Worktree 比较'],
	['Git Create Worktree', 'Git 创建 Worktree'],
	['Git Delete Worktree', 'Git 删除 Worktree'],
	['Git Open Worktree', 'Git 打开 Worktree'],
	['Create Worktree', '创建 Worktree'],
	['Delete Worktree', '删除 Worktree'],
	['Open Worktree', '打开 Worktree'],
	['Create Patch', '创建补丁'],
	['Delete Cloud Patch', '删除云补丁'],
	['Share as Cloud Patch', '共享为云补丁'],
	['Debug Logging', '调试日志'],
	['Disable Debug Logging', '禁用调试日志'],
	['Enable Debug Logging', '启用调试日志'],
	['Get Started', '开始使用'],
	['Git Checkout', 'Git 签出'],
	['Git Cherry Pick', 'Git 拣选'],
	['Git History', 'Git 历史'],
	['Git Merge', 'Git 合并'],
	['Git Rebase', 'Git 变基'],
	['Git Reset', 'Git 重置'],
	['Git Revert', 'Git 还原'],
	['Git Status', 'Git 状态'],
	['Git Switch to', 'Git 切换到'],
	['Switch Organization', '切换组织'],
	['Add as Co-authors', '添加为共同作者'],
	['Add as Co-author', '添加为共同作者'],
	['Hide Date Column', '隐藏日期列'],
	['Use Compact Graph Column', '使用紧凑图列'],
	['Use Expanded Graph Column', '使用展开图列'],
	['Hide Graph Column', '隐藏图列'],
	['Hide SHA Column', '隐藏 SHA 列'],
	['Reset Columns to Compact Layout', '将列重置为紧凑布局'],
	['Reset Columns to Default Layout', '将列重置为默认布局'],
	['Invite to Live Share', '邀请加入 Live Share'],
	['Toggle Launchpad Indicator', '切换启动台指示器'],
	['Manage Integrations', '管理集成'],
	['Hide Pro Features', '隐藏 Pro 功能'],
	['Restore Pro Features', '恢复 Pro 功能'],
	['Sign In to GitKraken', '登录 GitKraken'],
	['Sign Out of GitKraken', '退出 GitKraken'],
	['Sign Up for GitKraken', '注册 GitKraken'],
	['Manage Your Account', '管理你的账号'],
	['Reactivate Pro Trial', '重新激活 Pro 试用'],
	['Refer a friend', '推荐朋友'],
	['Simulate Subscription', '模拟订阅'],
	['Upgrade to Pro', '升级到 Pro'],
	['Abort Rebase', '中止变基'],
	['Start/Continue Rebase', '开始/继续变基'],
	['Disable Interactive Rebase Editor', '禁用交互式变基编辑器'],
	['Enable Interactive Rebase Editor', '启用交互式变基编辑器'],
	['Disable Interactive Editor', '禁用交互式编辑器'],
	['Enable Interactive Editor', '启用交互式编辑器'],
	['Switch to Interactive Editor', '切换到交互式编辑器'],
	['Switch to Text Editor', '切换到文本编辑器'],
	['Reset Stored Data', '重置已存储数据'],
	['Reset Views Layout', '重置视图布局'],
	['Set Upstream', '设置上游'],
	['Configure Autolinks', '配置自动链接'],
	['Add to Favorites', '添加到收藏'],
	['Remove from Favorites', '从收藏移除'],
	['Start Work', '开始工作'],
	['Switch Mode', '切换模式'],
	['Split Visual History', '拆分可视化历史'],
	['Toggle Git CodeLens', '切换 Git CodeLens'],
	['Toggle File Blame', '切换文件 Blame'],
	['Toggle File Heatmap', '切换文件热力图'],
	['Toggle Line Blame', '切换行 Blame'],
	['Toggle Review Mode', '切换评审模式'],
	['Toggle Zen Mode', '切换禅模式'],
	['Group into GitLens View', '分组到 GitLens 视图'],
	['Group Launchpad View', '分组启动台视图'],
	['Detach Launchpad View', '分离启动台视图'],
	['Hide Launchpad View', '隐藏启动台视图'],
	['Group All Views', '分组所有视图'],
	['Detach All Views', '分离所有视图'],
	['Reset All Views', '重置所有视图'],
	['Set as Default View', '设为默认视图'],
	['Set as Default', '设为默认'],
	['Unset as Default', '取消默认'],
	['View Files as Auto', '以自动布局查看文件'],
	['View Files as List', '以列表查看文件'],
	['View Files as Tree', '以树形查看文件'],
	['View as List', '以列表查看'],
	['View as Tree', '以树形查看'],
	['Hide Avatars', '隐藏头像'],
	['Hide Statistics', '隐藏统计信息'],
	['Hide Section', '隐藏分区'],
	['Hide Date Markers', '隐藏日期标记'],
	['Clear Reviewed Files', '清除已评审文件'],
	['Clear Results', '清除结果'],
	['Clear Filter', '清除筛选'],
	['Pin the Current History', '固定当前历史'],
	['Unpin the Current History', '取消固定当前历史'],
	["Don't Follow Renames", '不跟踪重命名'],
	['Follow Renames', '跟踪重命名'],
	['GitHub Discussions', 'GitHub 讨论'],
	['GitHub Issues', 'GitHub 议题'],
	['Help Center', '帮助中心'],
	["What's New", '新增内容'],
	['Release Notes', '发行说明'],
	['Learn about Launchpad', '了解启动台'],
	['Close Patch', '关闭补丁'],
	['Enable Automatic Refresh', '启用自动刷新'],
	['Disable Automatic Refresh', '禁用自动刷新'],
	['Sort by Discovery Time', '按发现时间排序'],
	['Sort by Last Fetched', '按上次抓取时间排序'],
	['Sort by Count', '按数量排序'],
	['Sort by Score', '按分数排序'],
	['Sort by Date', '按日期排序'],
	['Sort by Name', '按名称排序'],
	['Ascending', '升序'],
	['Descending', '降序'],
	['Regenerate', '重新生成'],
	['Collapse', '折叠'],
	['Expand', '展开'],
	['Dismiss', '忽略'],
	['Edit', '编辑'],
	['Load All', '加载全部'],
	['Abort', '中止'],
	['Continue', '继续'],
	['Skip', '跳过'],
	['Prune', '清理'],
	['Fetch', '抓取'],
	['Pull', '拉取'],
	['Push (force)', '强制推送'],
	['Push', '推送'],
	['Close', '关闭'],
	['Hide', '隐藏'],
	['Line Blame Annotations', '行 Blame 标注'],
	['Line Blame', '行 Blame'],
	['Current Line Hovers', '当前行悬停提示'],
	['Rich Hovers', '丰富悬停提示'],
	['Cloud Workspaces', '云工作区'],
	['Cloud Patches', '云补丁'],
	['Visual File History', '可视化文件历史'],
	['File History', '文件历史'],
	['Line History', '行历史'],
	['Folder History', '文件夹历史'],
	['Commit Graph', '提交图'],
	['Graph Details', '图详情'],
	['File Annotations', '文件标注'],
	['File Annotation', '文件标注'],
	['File Changes annotations', '文件更改标注'],
	['File Heatmap annotations', '文件热力图标注'],
	['File Blame annotations', '文件 Blame 标注'],
	['blame annotations', 'Blame 标注'],
	['blame annotation', 'Blame 标注'],
	['Blame Annotations', 'Blame 标注'],
	['Inline Blame', '内联 Blame'],
	['Status Bar', '状态栏'],
	['CodeLens', 'CodeLens'],
	['Worktrees', 'Worktrees'],
	['Worktree', 'Worktree'],
	['Repositories', '仓库'],
	['Repository', '仓库'],
	['Branches', '分支'],
	['Branch', '分支'],
	['Commits', '提交'],
	['Commit', '提交'],
	['Stashes', '贮藏'],
	['Stash', '贮藏'],
	['Tags', '标签'],
	['Tag', '标签'],
	['Remotes', '远程'],
	['Remote', '远程'],
	['Contributors', '贡献者'],
	['Contributor', '贡献者'],
	['Authors', '作者'],
	['Author', '作者'],
	['Launchpad', '启动台'],
	['Home View', '主页视图'],
	['Home', '主页'],
	['Inspect', '检查'],
	['Search & Compare', '搜索与比较'],
	['Search and Compare', '搜索与比较'],
	['Compare', '比较'],
	['Comparison', '比较'],
	['Changes', '更改'],
	['Change', '更改'],
	['Revision', '修订'],
	['Revisions', '修订'],
	['Working Tree', '工作树'],
	['Working Changes', '工作区更改'],
	['Uncommitted Changes', '未提交更改'],
	['Unpushed Changes', '未推送更改'],
	['Current Line', '当前行'],
	['current committed file', '当前已提交文件'],
	['previous commit', '上一提交'],
	['previous', '上一项'],
	['current line', '当前行'],
	['current window', '当前窗口'],
	['status bar', '状态栏'],
	['editor title', '编辑器标题'],
	['Side Bar', '侧边栏'],
	['Quick Pick', '快速选择'],
	['quick pick', '快速选择'],
	['Command Palette', '命令面板'],
	['Open Changes', '打开更改'],
	['Open on Remote', '在远程打开'],
	['Copy Link', '复制链接'],
	['Copy Changes', '复制更改'],
	['Copy Message', '复制消息'],
	['Copy Relative Path', '复制相对路径'],
	['Generate Changelog', '生成变更日志'],
	['Generate Commit Message', '生成提交消息'],
	['Switch AI Provider/Model', '切换 AI 提供商/模型'],
	['Install GitKraken MCP Server', '安装 GitKraken MCP 服务器'],
	['Reinstall GitKraken MCP Server', '重新安装 GitKraken MCP 服务器'],
	['Connect Integrations', '连接集成'],
	['Connect Integration', '连接集成'],
	['Remote Integration', '远程集成'],
	['AI Provider', 'AI 提供商'],
	['AI Model', 'AI 模型'],
	['Preview', '预览'],
	['Experimental', '实验性'],
	['Sort By', '排序方式'],
	['Show / Hide Views', '显示 / 隐藏视图'],
	['View Options', '视图选项'],
	['Settings', '设置'],
	['setting', '设置'],
	['configuration', '配置'],
	['annotations', '标注'],
	['annotation', '标注'],
	['indicators', '指示器'],
	['indicator', '指示器'],
	['avatar images', '头像图像'],
	['avatar', '头像'],
	['font family', '字体族'],
	['font size', '字体大小'],
	['format', '格式'],
	['date format', '日期格式'],
	['remote service', '远程服务'],
	['remote provider', '远程提供商'],
	['remote file URL', '远程文件 URL'],
	['remote commit URL', '远程提交 URL'],
	['clipboard', '剪贴板'],
	['an inline', '内联'],
	['any Git', '任何 Git'],
	['blame information', 'Blame 信息'],
	['the annotations', '标注'],
	['the annotation', '标注'],
	['the Git CodeLens', 'Git CodeLens'],
	['the current window', '当前窗口'],
	['the current line', '当前行'],
	['by default', '默认情况下'],
	['for the current window', '用于当前窗口'],
	['for the current line', '用于当前行'],
	['on and off', '开启和关闭'],
	['command', '命令'],
	['information about', '相关信息'],
	['that introduced', '引入'],
	['introduced', '引入'],
	['code block', '代码块'],
	['prominent author', '主要作者'],
	['more than one', '多个'],
	['range', '范围'],
	['document symbols', '文档符号'],
	['single line', '单行'],
	['in place of', '代替'],
	['per-language', '按语言'],
	['settings instead', '设置'],
	['alignment', '对齐方式'],
	['Aligns to left', '左对齐'],
	['Aligns to right', '右对齐'],
	['Automatically switches between', '自动切换'],
	['Automatically switches', '自动切换'],
	['Automatically', '自动'],
	['Displays as a list', '以列表显示'],
	['Displays as a tree', '以树形显示'],
	['Displays', '显示'],
	['Display', '显示'],
	['Compares', '比较'],
	['Creates', '创建'],
	['Resets', '重置'],
	['Switches', '切换'],
	['Sorts', '排序'],
	['Skips', '跳过'],
	['Marks', '标记'],
	['Hides', '隐藏'],
	['Shown', '显示'],
	['Only shown', '仅显示'],
	['hovering anywhere over the line', '悬停在该行任意位置时'],
	['hovering over the line', '悬停在行上时'],
	['anywhere over the line', '该行任意位置'],
	['over the line', '在行上'],
	['scrolled into view', '滚动进入视图'],
	['outside the viewport', '位于视口外'],
	['empty string', '空字符串'],
	['will disable', '将禁用'],
	['will inhibit', '将阻止'],
	['Set', '设置'],
	['using the', '使用'],
	['using', '使用'],
	['token', '令牌'],
	['similar to', '类似于'],
	['or a custom', '或自定义'],
	['full', '完整'],
	['long', '长格式'],
	['medium', '中等格式'],
	['short', '短格式'],
	['and', '和'],
	['or', '或'],
	['hover shown over', '悬停显示在'],
	['reduce flicker', '减少闪烁'],
	['clearing the previous', '清除上一个'],
	['changing lines', '切换行'],
	['external resources', '外部资源'],
	['automatically link', '自动链接'],
	['lookup additional details', '查找更多详情'],
	['trigger hovers', '触发悬停提示'],
	['line annotation', '行标注'],
	['details hover', '详情悬停提示'],
	['changes (diff) hover', '更改 (diff) 悬停提示'],
	['set of related changes', '相关更改集合'],
	['just the changes to the line', '仅该行的更改'],
	['pressing the', '按下'],
	['dismisses the active', '关闭当前'],
	['while editing', '编辑时'],
	['re-blaming', '重新 Blame'],
	['unsaved document', '未保存文档'],
	['maximum document size', '最大文档大小'],
	['in lines', '以行为单位'],
	['no maximum', '不设上限'],
	['each file individually', '分别处理每个文件'],
	['all files at once', '所有文件一次性处理'],
	['left edge', '左边缘'],
	['right edge', '右边缘'],
	['full-line highlight background', '整行高亮背景'],
	['heatmap indicator', '热力图指示器'],
	['matching adjacent', '相邻且相同的'],
	['associated line highlights', '关联行高亮'],
	['small gap', '小间距'],
	['fade out older lines', '淡化较旧的行'],
	['age of the most recent change', '最近更改的时间'],
	['in days', '以天为单位'],
	['cold rather than hot', '显示为冷色而非热色'],
	['base color', '基础颜色'],
	['preferred layout', '首选布局'],
	['multiple instances', '多个实例'],
	['without restriction', '不限制'],
	['topologically', '按拓扑顺序'],
	['commit activity', '提交活动'],
	['lines changed', '更改行数'],
	['additional markers', '其他标记'],
	['Marks the location of', '标记位置：'],
	['local branch', '本地分支'],
	['remote names', '远程名称'],
	['only relevant', '仅相关'],
	['only favorited', '仅收藏的'],
	['highest priority', '最高优先级'],
	['status counts', '状态计数'],
	['mergeable', '可合并的'],
	['blocked', '被阻塞的'],
	['needing your review', '需要你评审的'],
	['needing follow-up', '需要跟进的'],
	['polling', '轮询'],
	['stale', '过期'],
	['editor tab', '编辑器标签页'],
	['query limit', '查询限制'],
	['Work in progress', '正在进行的工作'],
	['reverse chronological order', '逆时间顺序'],
	['author timestamp', '作者时间戳'],
	['commit timestamp', '提交时间戳'],
	['first parent', '第一父提交'],
	['upstream status', '上游状态'],
	['ghost branch', '幽灵分支'],
	['sticky timeline header', '固定时间线标题'],
	['page item limit', '分页项目限制'],
	['search item limit', '搜索项目限制'],
	['default item limit', '默认项目限制'],
	['no limit', '不限制'],
	['associated with', '关联到'],
	['number of', '数量'],
	['most recent', '最近'],
	['current branch', '当前分支'],
	['current file', '当前文件'],
	['current repository', '当前仓库'],
	['current workspace', '当前工作区'],
	['remote branches', '远程分支'],
	['remote branch', '远程分支'],
	['local branch', '本地分支'],
	['merge commit', '合并提交'],
	['pull requests', '拉取请求'],
	['pull request', '拉取请求'],
	['commit messages', '提交消息'],
	['commit message', '提交消息'],
	['commit details', '提交详情'],
	['commit file details', '提交文件详情'],
	['file revision', '文件修订'],
	['file changes', '文件更改'],
	['file change', '文件更改'],
	['file history', '文件历史'],
	['branch history', '分支历史'],
	['line history', '行历史'],
	['working tree', 'Working Tree'],
	['uncommitted changes', '未提交更改'],
	['unsaved changes', '未保存更改'],
	['external resources', '外部资源'],
	['additional details', '更多详情'],
	['supported issue service', '受支持的议题服务'],
	['supported remote service', '受支持的远程服务'],
	['remote service', '远程服务'],
	['issue service', '议题服务'],
	['editor area', '编辑器区域'],
	['bottom panel', '底部面板'],
	['source control side bar', '源代码管理侧边栏'],
	['scroll bar', '滚动条'],
	['gutter', '装订线'],
	['side bar', '侧边栏'],
	['status bar', '状态栏'],
	['quick pick', '快速选择'],
	['view', '视图'],
	['views', '视图'],
	['groups', '分组'],
	['group', '分组'],
	['items', '项目'],
	['item', '项目'],
	['files', '文件'],
	['file', '文件'],
	['folders', '文件夹'],
	['folder', '文件夹'],
	['branches', '分支'],
	['branch', '分支'],
	['commits', '提交'],
	['commit', '提交'],
	['authors', '作者'],
	['author', '作者'],
	['contributors', '贡献者'],
	['contributor', '贡献者'],
	['repositories', '仓库'],
	['repository', '仓库'],
	['organizations', '组织'],
	['organization', '组织'],
	['stashes', '贮藏'],
	['stash', '贮藏'],
	['tags', '标签'],
	['tag', '标签'],
	['changes', '更改'],
	['change', '更改'],
	['dates', '日期'],
	['date', '日期'],
	['colors', '颜色'],
	['color', '颜色'],
	['markers', '标记'],
	['marker', '标记'],
	['statistics', '统计信息'],
	['results', '结果'],
	['result', '结果'],
	['selection', '选择'],
	['selected', '选中'],
	['visible', '可见'],
	['visibility', '可见性'],
	['layout', '布局'],
	['label', '标签'],
	['icon', '图标'],
	['menu', '菜单'],
	['button', '按钮'],
	['message', '消息'],
	['format', '格式'],
	['string', '字符串'],
	['absolute', '绝对'],
	['relative', '相对'],
	['automatically', '自动'],
	['automatic', '自动'],
	['enabled', '启用'],
	['disabled', '禁用'],
	['enable', '启用'],
	['disable', '禁用'],
	['allowing', '允许'],
	['allows', '允许'],
	['allow', '允许'],
	['providing', '提供'],
	['provides', '提供'],
	['provide', '提供'],
	['showing', '显示'],
	['shown', '显示'],
	['show', '显示'],
	['displaying', '显示'],
	['display', '显示'],
	['opening', '打开'],
	['opened', '打开'],
	['open', '打开'],
	['copying', '复制'],
	['copy', '复制'],
	['searching', '搜索'],
	['search', '搜索'],
	['filtering', '筛选'],
	['filter', '筛选'],
	['fetching', '抓取'],
	['fetch', '抓取'],
	['selecting', '选择'],
	['select', '选择'],
	['querying', '查询'],
	['query', '查询'],
	['ignoring', '忽略'],
	['ignore', '忽略'],
	['privately and securely share code', '私密且安全地共享代码'],
	['specific teammates and other developers', '指定队友和其他开发者'],
	['accessible from anywhere', '可从任何位置访问'],
	['Enhance collaboration without adding noise to your repositories', '在不打扰仓库的情况下增强协作'],
	['Try GitLens Pro', '试用 GitLens Pro'],
	['Get 14 days of GitLens Pro for free — no credit card required', '免费获得 14 天 GitLens Pro，无需信用卡'],
	['sign in', '登录'],
	['Create Cloud Patch', '创建云补丁'],
	['Connect an Integration', '连接集成'],
	['Allows Launchpad to organize your pull requests into actionable groups and keep your team unblocked', '允许启动台将拉取请求整理为可操作分组，并帮助团队保持畅通'],
	['organizes your pull requests into actionable groups to help you focus and keep your team unblocked', '将拉取请求整理为可操作分组，帮助你保持专注并避免团队阻塞'],
	['Resend Verification Email', '重新发送验证邮件'],
	['recheck Status', '重新检查状态'],
	['You must verify your email before you can continue', '继续之前必须验证邮箱'],
	['An account is required', '需要账号'],
	['may require', '将来可能需要'],
	['in the future', ''],
	['default', '默认'],
	['enabled', '启用'],
	['disabled', '禁用'],
	['toggles', '切换'],
	['toggle', '切换'],
	['Toggles', '切换'],
	['Shows', '显示'],
	['Show', '显示'],
	['Opens', '打开'],
	['Open', '打开'],
	['Copies', '复制'],
	['Copy', '复制'],
	['Searches', '搜索'],
	['Search', '搜索'],
	['Reveals', '显示'],
	['Reveal', '显示'],
	['Specifies whether to', '指定是否'],
	['Specifies how', '指定如何'],
	['Specifies where', '指定位置'],
	['Specifies the', '指定'],
	['Specifies', '指定'],
	['Requires a connection to a supported remote service', '需要连接到受支持的远程服务'],
	['Date formatting is controlled by', '日期格式由'],
	['Use the', '使用'],
	['See', '参见'],
	['in the GitLens docs', 'GitLens 文档中的'],
	['if any', '如果有'],
	['when available', '可用时'],
	['Pull Request', '拉取请求'],
	['GitHub', 'GitHub'],
	['GitLab', 'GitLab'],
	['Bitbucket', 'Bitbucket'],
	['Azure DevOps', 'Azure DevOps'],
	['Jira', 'Jira'],
];

function escapeRegExp(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function replacePhrases(value) {
	let translated = value;
	for (const [source, target] of phraseTranslations) {
		const leftBoundary = /^[A-Za-z0-9]/.test(source) ? '(?<![A-Za-z0-9])' : '';
		const rightBoundary = /[A-Za-z0-9]$/.test(source) ? '(?![A-Za-z0-9])' : '';
		translated = translated.replace(new RegExp(`${leftBoundary}${escapeRegExp(source)}${rightBoundary}`, 'g'), target);
	}
	translated = translated
		.replace(/\(Preview\)/g, '（预览）')
		.replace(/\(Experimental\)/g, '（实验性）')
		.replace(/\(Web\)/g, '（Web）')
		.replace(/\bPR\b/g, 'PR')
		.replace(/\bAI\b/g, 'AI')
		.replace(/\s+([，。；：])/g, '$1')
		.replace(/，\s+/g, '，')
		.replace(/。\s+/g, '。');
	return translated;
}

function normalizePreservedTerms(value) {
	// 仅做中英文排版空格规整，不再把"拉取请求/议题"等中文术语反向改回英文缩写
	return value
		.replace(/([一-龥])(PR|Issue|URL|SHA|HEAD|WIP|AI)/g, '$1 $2')
		.replace(/(PR|Issue|URL|SHA|HEAD|WIP|AI)([一-龥])/g, '$1 $2')
		.replace(/\s+([，。；：、）])/g, '$1')
		.replace(/([（])\s+/g, '$1');
}

function restoreOriginalPackageFiles() {
	if (!fs.existsSync(sourceVsixPath)) {
		throw new Error(`Original VSIX not found: ${sourceVsixPath}`);
	}
	// 完整解压：packageLocalizedVsix() 会重新打包整个 extracted 目录，
	// 局部解压会导致产物缺失 dist/browser、dist/webviews 等未被翻译触及的资源
	fs.rmSync(extractedRoot, { recursive: true, force: true });
	fs.mkdirSync(extractedRoot, { recursive: true });
	execFileSync('unzip', ['-q', '-o', sourceVsixPath, '-d', extractedRoot], { stdio: 'ignore' });
}

function protectSegments(value) {
	const segments = [];
	const protect = match => {
		const token = `__GL_PROTECTED_${segments.length}__`;
		segments.push(match);
		return token;
	};
	const protectedValue = value
		.replace(/`[^`]*`/g, protect)
		.replace(/command:[^\s)"']+/g, protect)
		.replace(/https?:\/\/[^\s)"']+/g, protect)
		.replace(/\$\([^)]+\)/g, protect);
	return {
		value: protectedValue,
		restore(next) {
			return segments.reduce((result, segment, index) => result.replaceAll(`__GL_PROTECTED_${index}__`, segment), next);
		},
	};
}

function tidyTranslatedText(value) {
	return normalizePreservedTerms(value
		.replace(/拉取 Request/g, '拉取请求')
		.replace(/拉取 Requests/g, '拉取请求')
		.replace(/Create 拉取请求/g, '创建拉取请求')
		.replace(/复制 拉取请求 URL/g, '复制拉取请求 URL')
		.replace(/打开 拉取请求/g, '打开拉取请求')
		.replace(/比较 拉取请求/g, '比较拉取请求')
		.replace(/隐藏 拉取请求 Markers/g, '隐藏拉取请求标记')
		.replace(/显示 拉取请求 Markers/g, '显示拉取请求标记')
		.replace(/隐藏 分支 拉取请求/g, '隐藏分支拉取请求')
		.replace(/显示 分支 拉取请求/g, '显示分支拉取请求')
		.replace(/隐藏 Current 分支 拉取请求/g, '隐藏当前分支拉取请求')
		.replace(/显示 Current 分支 拉取请求/g, '显示当前分支拉取请求')
		.replace(/\b提交 Details\b/g, '提交详情')
		.replace(/\b提交 Tokens\b/g, '提交 Tokens')
		.replace(/\b文件 blame\b/gi, '文件 Blame')
		.replace(/\b文件 heatmap\b/gi, '文件热力图')
		.replace(/\binline Blame\b/gi, '内联 Blame')
		.replace(/\bfont style\b/g, '字体样式')
		.replace(/\bfont weight\b/g, '字体粗细')
		.replace(/打开 All 更改/g, '打开所有更改')
		.replace(/贮藏 All 更改/g, '贮藏所有更改')
		.replace(/All 更改/g, '所有更改')
		.replace(/，Individually/g, '，分别')
		.replace(/ Individually/g, '，分别')
		.replace(/使用 Common Base/g, '使用公共基准')
		.replace(/\bwith Worktree\b/g, '使用 Worktree')
		.replace(/\bWorking 更改\b/g, '工作区更改')
		.replace(/\bWorktree View\b/g, 'Worktrees 视图')
		.replace(/\bWorktree view\b/g, 'Worktrees 视图')
		.replace(/\bWorktrees View\b/g, 'Worktrees 视图')
		.replace(/\bWorktrees view\b/g, 'Worktrees 视图')
		.replace(/\bGroup ([^，。]+?) View\b/g, '分组 $1 视图')
		.replace(/\bDetach ([^，。]+?) View\b/g, '分离 $1 视图')
		.replace(/\b隐藏 ([^，。]+?) View\b/g, '隐藏 $1 视图')
		.replace(/\b显示 ([^，。]+?) View\b/g, '显示 $1 视图')
		.replace(/\b([一-龥A-Za-z0-9_]+) view\b/g, '$1 视图')
		.replace(/\b([一-龥A-Za-z0-9_]+) View\b/g, '$1 视图')
		.replace(/\b指定如何to\b/g, '指定如何')
		.replace(/\b指定如何 to\b/g, '指定如何')
		.replace(/\b指定是否the\b/g, '指定是否')
		.replace(/\b指定the\b/g, '指定')
		.replace(/\b指定 a\b/g, '指定')
		.replace(/\b指定 an\b/g, '指定')
		.replace(/\b显示 a\b/g, '显示')
		.replace(/\b显示 an\b/g, '显示')
		.replace(/\b显示 the\b/g, '显示')
		.replace(/\b打开 the\b/g, '打开')
		.replace(/\b复制 the\b/g, '复制')
		.replace(/\b切换 the\b/g, '切换')
		.replace(/\bto 切换/g, '切换')
		.replace(/\bto 启用/g, '启用')
		.replace(/\bto 忽略/g, '忽略')
		.replace(/\bto 外部资源/g, '到外部资源')
		.replace(/\bto 搜索/g, '搜索')
		.replace(/\bto 更改/g, '更改')
		.replace(/\bto specify/g, '表示')
		.replace(/\bto be queried/g, '要查询')
		.replace(/\bto be 显示/g, '显示')
		.replace(/\bto be re-blamed/g, '重新 Blame')
		.replace(/\bto be\b/g, '')
		.replace(/\bto\b/g, '')
		.replace(/\bthe (__GL_PROTECTED_\d+__)/g, '$1')
		.replace(/\bthe (`[^`]+`)/g, '$1')
		.replace(/\bthe _([^_]+)_/g, '_$1_')
		.replace(/\bthe /g, '')
		.replace(/\ba _([^_]+)_/g, '_$1_')
		.replace(/\ban _([^_]+)_/g, '_$1_')
		.replace(/\ba /g, '')
		.replace(/\ban /g, '')
		.replace(/\bUse (__GL_PROTECTED_\d+__)/g, '使用 $1')
		.replace(/\bUse (`[^`]+`)/g, '使用 $1')
		.replace(/\bUse 0 to specify no limit\b/g, '使用 0 表示不限制')
		.replace(/\b使用 0 to specify no limit\b/g, '使用 0 表示不限制')
		.replace(/\b使用 0 to 禁用/g, '使用 0 禁用')
		.replace(/\bto 格式\b/g, '格式化')
		.replace(/\bto 显示\b/g, '显示')
		.replace(/\bto 打开\b/g, '打开')
		.replace(/\bto 复制\b/g, '复制')
		.replace(/\bto 获取\b/g, '获取')
		.replace(/\bto 忽略\b/g, '忽略')
		.replace(/\bto be 显示\b/g, '显示')
		.replace(/\bwhen 存在\b/g, '当存在')
		.replace(/\bwhen /g, '当')
		.replace(/\bwith /g, '使用 ')
		.replace(/\bfor each\b/g, '每个')
		.replace(/\bfor _/g, '用于 _')
		.replace(/\bfor ([一-龥])/g, '用于$1')
		.replace(/\bin _/g, '在 _')
		.replace(/\bin ([一-龥])/g, '在$1')
		.replace(/\bon ([一-龥])/g, '在$1')
		.replace(/\bof _/g, '的 _')
		.replace(/\bof ([一-龥])/g, '的$1')
		.replace(/\bto _/g, '到 _')
		.replace(/\bif empty\b/gi, '如果为空')
		.replace(/\bIf empty\b/g, '如果为空')
		.replace(/\ball ([一-龥])/g, '所有$1')
		.replace(/\bonly the ([一-龥])/g, '仅$1')
		.replace(/\bonly ([一-龥])/g, '仅$1')
		.replace(/\bPrefer 显示/g, '优先显示')
		.replace(/\bNever shows/g, '从不显示')
		.replace(/\bNever 显示/g, '从不显示')
		.replace(/\bHides the 标签/g, '隐藏标签')
		.replace(/\bDisallows 选择 multiple/g, '不允许选择多个')
		.replace(/\bAllows 选择 multiple/g, '允许选择多个')
		.replace(/\bCompares the 当前行 提交 使用previous\b/g, '将当前行提交与上一提交比较')
		.replace(/\bCompares 当前行 提交 使用上一项\b/g, '将当前行提交与上一提交比较')
		.replace(/\bCompares 当前行 提交 使用Worktree\b/g, '将当前行提交与 Worktree 比较')
		.replace(/\bCompares current committed 文件 使用previous 提交\b/g, '将当前已提交文件与上一提交比较')
		.replace(/\bCompares 当前已提交文件 使用上一提交\b/g, '将当前已提交文件与上一提交比较')
		.replace(/\b搜索 for 提交 within the range\b/g, '在范围内搜索提交')
		.replace(/Requires connection supported 远程服务/g, '需要连接到受支持的远程服务')
		.replace(/Requires connection 受支持的议题服务/g, '需要连接到受支持的议题服务')
		.replace(/Requires connection to supported 远程服务/g, '需要连接到受支持的远程服务')
		.replace(/Requires connection to 受支持的议题服务/g, '需要连接到受支持的议题服务')
		.replace(/Requires a connection to a supported 远程服务/g, '需要连接到受支持的远程服务')
		.replace(/Requires a connection to a 受支持的议题服务/g, '需要连接到受支持的议题服务')
		.replace(/Requires a connection to supported 远程服务/g, '需要连接到受支持的远程服务')
		.replace(/指定是否提供 相关信息 ([^。]+?) 引入 提交/g, '指定是否提供引入该提交的 $1 相关信息')
		.replace(/指定是否提供引入该提交的 ([^。]+?) 相关信息 在([^。]+?)。/g, '指定是否在$2中提供引入该提交的 $1 相关信息。')
		.replace(/指定如何 格式/g, '指定如何格式化')
		.replace(/指定如何to 格式/g, '指定如何格式化')
		.replace(/指定 格式 的/g, '指定格式：')
		.replace(/日期格式由 ([^ ]+) 设置/g, '日期格式由 $1 设置')
		.replace(/参见 \[_提交 Tokens_\]\(([^)]+)\) GitLens 文档中的/g, '参见 GitLens 文档中的 [_提交 Tokens_]($1)')
		.replace(/参见 \[_File Tokens_\]\(([^)]+)\) GitLens 文档中的/g, '参见 GitLens 文档中的 [_File Tokens_]($1)')
		.replace(/指定是否提供 任何 hovers/g, '指定是否提供任何悬停提示')
		.replace(/in hovers/g, '在悬停提示中')
		.replace(/hovers/g, '悬停提示')
		.replace(/hover/g, '悬停提示')
		.replace(/minimap/g, '小地图')
		.replace(/scrollbar/g, '滚动条')
		.replace(/document/g, '文档')
		.replace(/symbols/g, '符号')
		.replace(/symbol/g, '符号')
		.replace(/which/g, '哪些')
		.replace(/指定 whether/g, '指定是否')
		.replace(/associated 拉取请求/g, '关联的拉取请求')
		.replace(/associated issues/g, '关联的议题')
		.replace(/grouped into/g, '分组到')
		.replace(/将 grouped into/g, '将分组到')
		.replace(/将 hidden/g, '将隐藏')
		.replace(/\bif there is\b/g, '如果存在')
		.replace(/\bthere is\b/g, '存在')
		.replace(/\bit is\b/g, '它')
		.replace(/\bthat span\b/g, '跨越')
		.replace(/\bthat are\b/g, '符合条件的')
		.replace(/\bthat require\b/g, '需要')
		.replace(/\bthat\b/g, '该')
		.replace(/\bmost\b/g, '主要')
		.replace(/\bmultiple\b/g, '多个')
		.replace(/\bwhere\b/g, '哪些位置')
		.replace(/\bavoid\b/g, '避免')
		.replace(/\bMust be member 的\b/g, '必须是')
		.replace(/\bcan\b/g, '可以')
		.replace(/\bThis can take while compute depending 在仓库 size\b/g, '这可能需要一段时间，具体取决于仓库大小')
		.replace(/\bdepending 在仓库 size\b/g, '具体取决于仓库大小')
		.replace(/\bThis 设置 has been renamed\b/g, '此设置已重命名为')
		.replace(/\bThis 设置 is no longer used\b/g, '此设置不再使用')
		.replace(/\bThis\b/g, '此')
		.replace(/\bsections\b/g, '分区')
		.replace(/\bsection\b/g, '分区')
		.replace(/\bsize\b/g, '大小')
		.replace(/\binitials\b/g, '首字母')
		.replace(/\bicons\b/g, '图标')
		.replace(/\bicon\b/g, '图标')
		.replace(/\brows\b/g, '行')
		.replace(/\brow\b/g, '行')
		.replace(/\babove\b/g, '上方')
		.replace(/\bat top\b/g, '顶部')
		.replace(/\bwhile scrolling\b/g, '滚动时')
		.replace(/\bremains\b/g, '保持')
		.replace(/\border by\b/g, '排序依据')
		.replace(/\border\b/g, '顺序')
		.replace(/\bfollow\b/g, '跟随')
		.replace(/\bdim\b/g, '弱化')
		.replace(/\bdeemphasize\b/g, '弱化')
		.replace(/\badditional\b/g, '额外')
		.replace(/\bgather\b/g, '收集')
		.replace(/\bkeyboard\b/g, '键盘')
		.replace(/\bscroll\b/g, '滚动')
		.replace(/\bedge\b/g, '边缘')
		.replace(/\bnew home preview\b/g, '新版主页预览')
		.replace(/\bnew\b/g, '新版')
		.replace(/\bpreview\b/g, '预览')
		.replace(/\bdays\b/g, '天')
		.replace(/\bminutes\b/g, '分钟')
		.replace(/\brate\b/g, '频率')
		.replace(/\blimit\b/g, '限制')
		.replace(/\bprivately\b/g, '私密地')
		.replace(/\bsecurely\b/g, '安全地')
		.replace(/\bspecific teammates\b/g, '指定队友')
		.replace(/\bother developers\b/g, '其他开发者')
		.replace(/\bother\b/g, '其他')
		.replace(/\bdevelopers\b/g, '开发者')
		.replace(/\bteammates\b/g, '队友')
		.replace(/\bshare code\b/g, '共享代码')
		.replace(/\bshare\b/g, '共享')
		.replace(/\bcode\b/g, '代码')
		.replace(/\bcompact\b/g, '紧凑化')
		.replace(/\bflatten\b/g, '扁平化')
		.replace(/\bunnecessary\b/g, '不必要的')
		.replace(/\bnesting level\b/g, '嵌套层级')
		.replace(/\bnesting\b/g, '嵌套')
		.replace(/\blevel\b/g, '层级')
		.replace(/\bbased 在数量\b/g, '基于数量')
		.replace(/\bbased\b/g, '基于')
		.replace(/\bswitch between\b/g, '在两者之间切换')
		.replace(/\bswitch\b/g, '切换')
		.replace(/\beach page\b/g, '每页')
		.replace(/\blist\b/g, '列表')
		.replace(/\btree\b/g, '树形')
		.replace(/\bstatus\b/g, '状态')
		.replace(/\bactive\b/g, '当前')
		.replace(/\bdecoration foreground 颜色\b/g, '装饰前景色')
		.replace(/\bforeground 颜色\b/g, '前景色')
		.replace(/\bforeground\b/g, '前景')
		.replace(/\bdecoration\b/g, '装饰')
		.replace(/\bof added 文件\b/g, '新增文件的')
		.replace(/\bof changed 文件\b/g, '已更改文件的')
		.replace(/\bof deleted 文件\b/g, '已删除文件的')
		.replace(/\bof missing 文件\b/g, '缺失文件的')
		.replace(/\bof ignored 文件\b/g, '已忽略文件的')
		.replace(/\bof untracked 文件\b/g, '未跟踪文件的')
		.replace(/\buser-defined\b/g, '用户定义的')
		.replace(/\bfriendly name\b/g, '友好名称')
		.replace(/\bcustom 远程服务\b/g, '自定义远程服务')
		.replace(/\bcustom\b/g, '自定义')
		.replace(/\bdomain name used match this\b/g, '用于匹配此配置的域名')
		.replace(/\bdomain name\b/g, '域名')
		.replace(/\bused match this\b/g, '用于匹配此')
		.replace(/\bAvailable tokens\b/g, '可用 token')
		.replace(/\btokens\b/g, 'token')
		.replace(/\bpath\b/g, '路径')
		.replace(/\bname\b/g, '名称')
		.replace(/\bline information\b/g, '行信息')
		.replace(/\bline\b/g, '行')
		.replace(/\bgenerating summary\b/g, '生成摘要')
		.replace(/\bgenerating\b/g, '生成')
		.replace(/\bcustom instructions\b/g, '自定义指令')
		.replace(/\binstructions\b/g, '指令')
		.replace(/\boptional external diff tool use\b/g, '可选的外部 diff 工具')
		.replace(/\boptional\b/g, '可选')
		.replace(/\bexternal\b/g, '外部')
		.replace(/\bshould be\b/g, '应')
		.replace(/\bshould\b/g, '应')
		.replace(/\bmatch\b/g, '匹配')
		.replace(/\bref\b/g, '引用')
		.replace(/\bnotation\b/g, '表示法')
		.replace(/\bworkspaces\b/g, '工作区')
		.replace(/\bpriority\b/g, '优先级')
		.replace(/\blane\b/g, '泳道')
		.replace(/\bvisualization\b/g, '可视化')
		.replace(/\bfirst\b/g, '第一')
		.replace(/\bupstream\b/g, '上游')
		.replace(/\btheir\b/g, '其')
		.replace(/\bup 日期\b/g, '最新')
		.replace(/\byou\b/g, '你')
		.replace(/\byour\b/g, '你的')
		.replace(/\bteam\b/g, '团队')
		.replace(/\bkeep\b/g, '保持')
		.replace(/\bunblocked\b/g, '畅通')
		.replace(/\bactionable\b/g, '可操作')
		.replace(/\btrial\b/g, '试用')
		.replace(/\bfeatures\b/g, '功能')
		.replace(/\bfeature\b/g, '功能')
		.replace(/\bPlease upgrade\b/g, '请升级')
		.replace(/\bPlease\b/g, '请')
		.replace(/\bupgrade\b/g, '升级')
		.replace(/\baccess\b/g, '访问权限')
		.replace(/\banother\b/g, '另一个')
		.replace(/\bfree\b/g, '免费')
		.replace(/\bexperience\b/g, '体验')
		.replace(/\bReactivate your Pro trial\b/g, '重新激活你的 Pro 试用')
		.replace(/\bYour Pro trial has ended\b/g, '你的 Pro 试用已结束')
		.replace(/Source Control 侧边栏/g, '源代码管理侧边栏')
		.replace(/Source Control/g, '源代码管理')
		.replace(/will formatted/g, '将格式化')
		.replace(/formatted/g, '格式化')
		.replace(/about 自动链接/g, '关于自动链接')
		.replace(/指定是否查找更多详情 about 自动链接/g, '指定是否查找自动链接的更多详情')
		.replace(/指定是否查询 for 关联的拉取请求/g, '指定是否查询关联的拉取请求')
		.replace(/用于拉取请求 关联到/g, '关联到')
		.replace(/each 分支/g, '每个分支')
		.replace(/worktree 分支/g, 'Worktree 分支')
		.replace(/will 显示/g, '将显示')
		.replace(/will 获取/g, '将获取')
		.replace(/will 更新/g, '将更新')
		.replace(/will/g, '将')
		.replace(/ or /g, ' 或 ')
		.replace(/ and /g, ' 和 ')
		.replace(/ in /g, ' 在 ')
		.replace(/ as /g, ' 作为 ')
		.replace(/ using /g, ' 使用 ')
		.replace(/ when/g, ' 当')
		.replace(/ when /g, ' 当 ')
		.replace(/ from /g, ' 从 ')
		.replace(/ before /g, ' 之前 ')
		.replace(/ since /g, ' 自 ')
		.replace(/ within /g, ' 在 ')
		.replace(/ to /g, ' ')
		.replace(/Requires connection supported 远程服务/g, '需要连接到受支持的远程服务')
		.replace(/Requires connection 受支持的议题服务/g, '需要连接到受支持的议题服务')
		.replace(/需要连接 受支持的远程服务/g, '需要连接到受支持的远程服务')
		.replace(/需要连接 受支持的议题服务/g, '需要连接到受支持的议题服务')
		.replace(/Requires connection supported 远程服务/g, '需要连接到受支持的远程服务')
		.replace(/Requires connection 受支持的议题服务/g, '需要连接到受支持的议题服务')
		.replace(/Requires connection to supported 远程服务/g, '需要连接到受支持的远程服务')
		.replace(/Requires connection to 受支持的议题服务/g, '需要连接到受支持的议题服务')
		.replace(/指定是否查找更多详情 关于自动链接 外部资源 在提交消息/g, '指定是否查找提交消息中自动链接外部资源的更多详情')
		.replace(/指定是否显示 关联的拉取请求 在远程分支 在/g, '指定是否在远程分支上显示关联的拉取请求，位于')
		.replace(/指定是否显示 关联的议题 在分支 在/g, '指定是否在分支上显示关联的议题，位于')
		.replace(/指定是否查询 关联到 ([^ ]+) 和 ([^ ]+) 在/g, '指定是否查询关联到$1和$2的拉取请求，位于')
		.replace(/指定是否查询 关联到 ([^ ]+) 在/g, '指定是否查询关联到$1的拉取请求，位于')
		.replace(/指定是否显示 拉取请求 \(如果有\) 关联到 ([^ ]+) 在/g, '指定是否显示关联到$1的拉取请求（如果有），位于')
		.replace(/ 在_([^_]+)_/g, '在 _$1_')
		.replace(/ 在([，。])/g, '$1')
		.replace(/ 拉取请求 \(如果有\)/g, '拉取请求（如果有）')
		.replace(/\be\.g。/g, '例如 ')
		.replace(/\bi\.e。/g, '即 ')
		.replace(/\betc\)/g, '等)')
		.replace(/\bmdash\b/g, '')
		.replace(/\s+([，。；：）])/g, '$1')
		.replace(/([（])\s+/g, '$1')
		.replace(/\s{2,}/g, ' ')
		.trim());
}

function translateText(value) {
	if (typeof value !== 'string' || value.length === 0) return value;
	if (exactTranslations.has(value)) return exactTranslations.get(value);

	const protectedSegments = protectSegments(value);
	let translated = replacePhrases(protectedSegments.value);
	translated = translated
		.replace(/^指定是否 provide /, '指定是否提供 ')
		.replace(/^指定 whether to provide /, '指定是否提供 ')
		.replace(/^指定 whether /, '指定是否 ')
		.replace(/^指定是否 /, '指定是否')
		.replace(/^指定如何 /, '指定如何')
		.replace(/^指定位置 /, '指定')
		.replace(/\bthe 当前行\b/g, '当前行')
		.replace(/\bthe 当前窗口\b/g, '当前窗口')
		.replace(/\bthe 当前分支\b/g, '当前分支')
		.replace(/\bthe 当前文件\b/g, '当前文件')
		.replace(/\bthe 当前仓库\b/g, '当前仓库')
		.replace(/\bthe 当前工作区\b/g, '当前工作区')
		.replace(/\bthe ([^，。]+?) 视图\b/g, '$1 视图')
		.replace(/\bthe ([^，。]+?) 标注\b/g, '$1 标注')
		.replace(/\bthe ([^，。]+?) 指示器\b/g, '$1 指示器')
		.replace(/\bthe ([^，。]+?) CodeLens\b/g, '$1 CodeLens')
		.replace(/\ba ([^，。]+?) 视图\b/g, '$1 视图')
		.replace(/\ban ([^，。]+?) CodeLens\b/g, '$1 CodeLens')
		.replace(/\bany ([^，。]+?)\b/g, '任何 $1')
		.replace(/\bfor the /g, '用于')
		.replace(/\bfor all /g, '用于所有')
		.replace(/\bin the /g, '在')
		.replace(/\bon the /g, '在')
		.replace(/\bof the /g, '的')
		.replace(/\bto the /g, '到')
		.replace(/\bwith the /g, '使用')
		.replace(/\bwhen the /g, '当')
		.replace(/\bwhen not specified\b/g, '未指定时')
		.replace(/\bif there are\b/g, '如果存在')
		.replace(/\bthere are\b/g, '存在')
		.replace(/\bwhich need your attention\b/g, '需要你关注')
		.replace(/\bneeds your attention\b/g, '需要你关注')
		.replace(/\bper day\b/g, '每天')
		.replace(/\bat once\b/g, '一次性')
		.replace(/\binstead of\b/g, '而不是')
		.replace(/\bfrom the\b/g, '从')
		.replace(/\bto be executed\b/g, '要执行')
		.replace(/\bto choose\b/g, '用于选择')
		.replace(/\bto control\b/g, '用于控制')
		.replace(/\bto enable\b/g, '用于启用')
		.replace(/\bto ignore\b/g, '要忽略')
		.replace(/\bto include\b/g, '要包含')
		.replace(/\bto show\b/g, '显示')
		.replace(/\bto display\b/g, '显示')
		.replace(/\bto fetch\b/g, '抓取')
		.replace(/\bto open\b/g, '打开')
		.replace(/\bto copy\b/g, '复制')
		.replace(/\bto 切换\b/g, '用于切换')
		.replace(/\bto 显示\b/g, '显示')
		.replace(/\bto 打开\b/g, '打开')
		.replace(/\bto 复制\b/g, '复制')
		.replace(/\bto 获取\b/g, '获取')
		.replace(/\bfor the 当前行\b/g, '用于当前行')
		.replace(/\bfor the 当前窗口\b/g, '用于当前窗口')
		.replace(/\bin the 状态栏\b/g, '在状态栏中')
		.replace(/\bthe 标注\b/g, '标注')
		.replace(/\bthe 剪贴板\b/g, '剪贴板')
		.replace(/\bwith 指定队友和其他开发者\b/g, '与指定队友和其他开发者')
		.replace(/\bOr \[/g, '也可以[')
		.replace(/\band 将来可能需要\b/g, '，将来可能需要')
		.replace(/\bor \[/g, '或[')
		.replace(/\bUse 0\b/g, '使用 0')
		.replace(/\bOnly applies\b/g, '仅适用于')
		.replace(/\bOnly shown\b/g, '仅显示')
		.replace(/\bNever 显示\b/g, '从不显示')
		.replace(/\bPrefer 显示\b/g, '优先显示')
		.replace(/\bAdds an\b/g, '添加')
		.replace(/\bAdds a\b/g, '添加')
		.replace(/\bDeprecated\b/g, '已弃用')
		.replace(/\bNOTE\b/g, '注意')
		.replace(/\bSetting this to\b/g, '将此设置为')
		.replace(/\bwill be\b/g, '将')
		.replace(/\bwill not be\b/g, '不会')
		.replace(/\bcan be\b/g, '可以')
		.replace(/\bis used\b/g, '会被使用')
		.replace(/\bis clicked\b/g, '被点击时')
		.replace(/\bare included\b/g, '都会包含')
		.replace(/\bis considered\b/g, '被视为')
		.replace(/\bis set to\b/g, '设为')
		.replace(/ \./g, '。')
		.replace(/, /g, '，')
		.replace(/\. /g, '。')
		.replace(/\s{2,}/g, ' ')
		.trim();

	return protectedSegments.restore(tidyTranslatedText(translated));
}

function localizeStringProperty(object, property, stats) {
	if (object && typeof object[property] === 'string') {
		const next = translateText(object[property]);
		if (next !== object[property]) {
			object[property] = next;
			stats.stringsChanged += 1;
		}
	}
}

const viewNameOverrides = new Map(
	Object.entries({
		'gitlens.views.home': '主页',
		'gitlens.views.launchpad': '启动台',
	}),
);

function applyViewNameOverride(view, stats) {
	const override = viewNameOverrides.get(view?.id);
	if (!override || view.name === override) return;
	view.name = override;
	stats.stringsChanged += 1;
}

function localizeStringArrayProperty(object, property, stats) {
	if (!object || !Array.isArray(object[property])) return;
	object[property] = object[property].map(item => {
		if (typeof item !== 'string') return item;
		const next = translateText(item);
		if (next !== item) stats.stringsChanged += 1;
		return next;
	});
}

function cleanupResidualVisibleEnglish(value) {
	return value
		.replace(/commit-horizontal icon/g, '水平提交图标')
		.replace(/([A-Za-z0-9-]+) icon/g, '$1 图标')
		.replace(/指定工具提示格式 \(使用 markdown\) of/g, '指定工具提示格式（使用 markdown）：')
		.replace(/指定工具提示格式（使用 markdown）： "文件" 提交在视图/g, '指定视图中文件提交的工具提示格式（使用 Markdown）')
		.replace(/of "文件" 提交/g, '“文件”提交的')
		.replace(/for each/g, '每个')
		.replace(/for supported formats/g, '查看受支持的格式')
		.replace(/for GitKraken AI provided/g, '使用 GitKraken AI 提供的')
		.replace(/for GitKraken AI/g, '使用 GitKraken AI')
		.replace(/for 另一个/g, '再')
		.replace(/for 路径/g, '路径')
		.replace(/\bfor\b/g, '用于')
		.replace(/used 匹配 this/g, '用于匹配此')
		.replace(/\bthis\b/g, '此')
		.replace(/it is/g, '它')
		.replace(/if there is/g, '如果存在')
		.replace(/there is/g, '存在')
		.replace(/\bis under\b/g, '小于')
		.replace(/\bis older\b/g, '早于')
		.replace(/\bis newer\b/g, '晚于')
		.replace(/\bis saved\b/g, '被保存')
		.replace(/\bis detected\b/g, '被检测到')
		.replace(/focus is lost/g, '失去焦点')
		.replace(/priority is/g, '优先级为')
		.replace(/\bis\b/g, '是')
		.replace(/must have considered rename/g, '才会被视为重命名')
		.replace(/Must be member 的/g, '必须是')
		.replace(/Must be configured/g, '必须配置')
		.replace(/\bMust\b/g, '必须')
		.replace(/are displayed/g, '显示')
		.replace(/are sorted/g, '排序')
		.replace(/are currently/g, '当前')
		.replace(/\bare\b/g, '是')
		.replace(/\bbe\b/g, '是')
		.replace(/\bthat span\b/g, '跨越')
		.replace(/\bthat are\b/g, '符合条件的')
		.replace(/\bthat require\b/g, '需要')
		.replace(/\bthat\b/g, '该')
		.replace(/\bmost\b/g, '主要')
		.replace(/\bmultiple\b/g, '多个')
		.replace(/\bwhere\b/g, '哪些位置')
		.replace(/\bavoid\b/g, '避免')
		.replace(/\bcan\b/g, '可以')
		.replace(/This can take while compute depending 在仓库 size/g, '这可能需要一段时间，具体取决于仓库大小')
		.replace(/depending 在仓库 size/g, '具体取决于仓库大小')
		.replace(/This 设置 has been renamed/g, '此设置已重命名为')
		.replace(/This 设置 is no longer used/g, '此设置不再使用')
		.replace(/\bThis\b/g, '此')
		.replace(/\bsections\b/g, '分区')
		.replace(/\bsection\b/g, '分区')
		.replace(/\bsize\b/g, '大小')
		.replace(/\binitials\b/g, '首字母')
		.replace(/\bicons\b/g, '图标')
		.replace(/\bicon\b/g, '图标')
		.replace(/\brows\b/g, '行')
		.replace(/\brow\b/g, '行')
		.replace(/\babove\b/g, '上方')
		.replace(/at top/g, '顶部')
		.replace(/while scrolling/g, '滚动时')
		.replace(/\bremains\b/g, '保持')
		.replace(/order by/g, '排序依据')
		.replace(/\border\b/g, '顺序')
		.replace(/\bfollow\b/g, '跟随')
		.replace(/\bdim\b/g, '弱化')
		.replace(/\bdeemphasize\b/g, '弱化')
		.replace(/\badditional\b/g, '额外')
		.replace(/\bgather\b/g, '收集')
		.replace(/\bkeyboard\b/g, '键盘')
		.replace(/\bscroll\b/g, '滚动')
		.replace(/\bedge\b/g, '边缘')
		.replace(/new home preview/g, '新版主页预览')
		.replace(/\bnew\b/g, '新版')
		.replace(/\bpreview\b/g, '预览')
		.replace(/\bdays\b/g, '天')
		.replace(/\bminutes\b/g, '分钟')
		.replace(/\brate\b/g, '频率')
		.replace(/\blimit\b/g, '限制')
		.replace(/\bprivately\b/g, '私密地')
		.replace(/\bsecurely\b/g, '安全地')
		.replace(/specific teammates/g, '指定队友')
		.replace(/other developers/g, '其他开发者')
		.replace(/\bother\b/g, '其他')
		.replace(/\bdevelopers\b/g, '开发者')
		.replace(/\bteammates\b/g, '队友')
		.replace(/share code/g, '共享代码')
		.replace(/\bshare\b/g, '共享')
		.replace(/\bcode\b/g, '代码')
		.replace(/\bcompact\b/g, '紧凑化')
		.replace(/\bflatten\b/g, '扁平化')
		.replace(/\bunnecessary\b/g, '不必要的')
		.replace(/nesting level/g, '嵌套层级')
		.replace(/\bnesting\b/g, '嵌套')
		.replace(/\blevel\b/g, '层级')
		.replace(/based 在数量/g, '基于数量')
		.replace(/\bbased\b/g, '基于')
		.replace(/switch between/g, '在两者之间切换')
		.replace(/\bswitch\b/g, '切换')
		.replace(/each page/g, '每页')
		.replace(/\blist\b/g, '列表')
		.replace(/\btree\b/g, '树形')
		.replace(/\bstatus\b/g, '状态')
		.replace(/\bactive\b/g, '当前')
		.replace(/decoration foreground 颜色/g, '装饰前景色')
		.replace(/foreground 颜色/g, '前景色')
		.replace(/\bforeground\b/g, '前景')
		.replace(/\bdecoration\b/g, '装饰')
		.replace(/of added 文件/g, '新增文件的')
		.replace(/of changed 文件/g, '已更改文件的')
		.replace(/of deleted 文件/g, '已删除文件的')
		.replace(/of missing 文件/g, '缺失文件的')
		.replace(/of ignored 文件/g, '已忽略文件的')
		.replace(/of untracked 文件/g, '未跟踪文件的')
		.replace(/\bof\b/g, '的')
		.replace(/\buser-defined\b/g, '用户定义的')
		.replace(/friendly name/g, '友好名称')
		.replace(/custom 远程服务/g, '自定义远程服务')
		.replace(/\bcustom\b/g, '自定义')
		.replace(/domain name/g, '域名')
		.replace(/used match/g, '用于匹配')
		.replace(/Available tokens/g, '可用 token')
		.replace(/\btokens\b/g, 'token')
		.replace(/\bpath\b/g, '路径')
		.replace(/\bname\b/g, '名称')
		.replace(/line information/g, '行信息')
		.replace(/\bline\b/g, '行')
		.replace(/generating summary/g, '生成摘要')
		.replace(/\bgenerating\b/g, '生成')
		.replace(/custom instructions/g, '自定义指令')
		.replace(/\binstructions\b/g, '指令')
		.replace(/optional external diff tool use/g, '可选的外部 diff 工具')
		.replace(/\boptional\b/g, '可选')
		.replace(/\bexternal\b/g, '外部')
		.replace(/should be/g, '应')
		.replace(/\bshould\b/g, '应')
		.replace(/\bmodel\b/g, '模型')
		.replace(/terminal links/g, '终端链接')
		.replace(/integrated terminal/g, '集成终端')
		.replace(/\bterminal\b/g, '终端')
		.replace(/\bautolinks\b/g, '自动链接')
		.replace(/\bautolink\b/g, '自动链接')
		.replace(/quickly jump more details/g, '快速跳转到更多详情')
		.replace(/more details/g, '更多详情')
		.replace(/\bmore\b/g, '更多')
		.replace(/\bprompt\b/g, '提示')
		.replace(/\bcreating\b/g, '创建')
		.replace(/\bshows\b/g, '显示')
		.replace(/\bimmediately\b/g, '立即')
		.replace(/\bspecified\b/g, '指定')
		.replace(/\bpreserved\b/g, '保留')
		.replace(/\bdirty\b/g, '未保存')
		.replace(/\bstill\b/g, '仍然')
		.replace(/\bwait\b/g, '等待')
		.replace(/\bupdate\b/g, '更新')
		.replace(/after edit/g, '编辑后')
		.replace(/\bafter\b/g, '之后')
		.replace(/\bbefore\b/g, '之前')
		.replace(/\bbut\b/g, '但')
		.replace(/\bif\b/g, '如果')
		.replace(/\binfinite\b/g, '无限期')
		.replace(/\btime\b/g, '时间')
		.replace(/in milliseconds/g, '以毫秒为单位')
		.replace(/in seconds/g, '以秒为单位')
		.replace(/maximum amount of time/g, '最大时间')
		.replace(/\bamount\b/g, '数量')
		.replace(/\bload\b/g, '加载')
		.replace(/\bindefinitely\b/g, '无限期')
		.replace(/no timeout/g, '无超时')
		.replace(/\btimeout\b/g, '超时')
		.replace(/\bCheckout\b/g, '签出')
		.replace(/\bHighlight\b/g, '高亮')
		.replace(/\bSelect\b/g, '选择')
		.replace(/\bAdd\b/g, '添加')
		.replace(/\bWarning\b/g, '警告')
		.replace(/\bRebase\b/g, '变基')
		.replace(/Interactive Rebase 编辑器/g, '交互式变基编辑器')
		.replace(/\bGroup\b/g, '分组')
		.replace(/Working 文件/g, '工作区文件')
		.replace(/\bWorking\b/g, '工作区')
		.replace(/\bManually\b/g, '手动')
		.replace(/\bPrefer\b/g, '优先')
		.replace(/Learn about/g, '了解')
		.replace(/\bLearn\b/g, '了解')
		.replace(/\bPublish\b/g, '发布')
		.replace(/\bRevert\b/g, '还原')
		.replace(/\bSolo\b/g, '单独显示')
		.replace(/\bHistory\b/g, '历史')
		.replace(/\bComparisons\b/g, '比较')
		.replace(/\bStage\b/g, '暂存')
		.replace(/\bUnstage\b/g, '取消暂存')
		.replace(/\bFrom\b/g, '从')
		.replace(/Unchanged 文件/g, '未更改文件')
		.replace(/指定是否文件标注将 保留 编辑时/g, '指定文件标注是否在编辑时保留')
		.replace(/用于控制 how 长格式 等待 之前标注将 更新 while 文件 是 still 未保存/g, '用于控制文件仍未保存时，等待多久后更新标注')
		.replace(/指定 时间 \(in milliseconds\) 等待 之前重新 Blame 未保存文档 之后 edit 但 之前它 saved/g, '指定编辑后、保存前等待多久重新 Blame 未保存文档（以毫秒为单位）')
		.replace(/使用 0 表示 无限期 等待/g, '使用 0 表示无限期等待')
		.replace(/仅适用于 如果 文件 是 under/g, '仅适用于文件小于')
		.replace(/指定是否文件 Blame 标注将 toggled/g, '指定文件 Blame 标注如何切换')
		.replace(/指定是否文件 Blame 标注将 separated by 小间距/g, '指定文件 Blame 标注是否用小间距分隔')
		.replace(/指定是否reveal 提交在 _提交_ 视图，otherwise they revealed在 _仓库_ 视图/g, '指定是否在 _提交_ 视图中显示提交，否则会在 _仓库_ 视图中显示')
		.replace(/指定是否try collapse 打开 Worktrees into single \(common\) 仓库在视图当possible/g, '指定是否在可行时，将打开的 Worktrees 折叠为单个公共仓库显示在视图中')
		.replace(/指定如何Git commands are sorted在 _Git 命令面板_/g, '指定 Git 命令在 _Git 命令面板_ 中如何排序')
		.replace(/指定是否dismiss _Git 命令面板_ 当focus is lost \(if not，press `ESC` dismiss\)/g, '指定失去焦点时是否关闭 _Git 命令面板_（否则按 `ESC` 关闭）')
		.replace(/指定 AI 提供商和 model use for GitLens' AI 功能/g, '指定 GitLens AI 功能使用的 AI 提供商和模型')
		.replace(/Should be 格式化作为/g, '应格式化为')
		.replace(/指定 custom URL use for 访问权限 Azure OpenAI model/g, '指定用于访问 Azure OpenAI 模型的自定义 URL')
		.replace(/Azure URLs 应在following 格式/g, 'Azure URL 应采用以下格式')
		.replace(/指定 maximum amount 的 时间 \(in seconds\) 等待用于所有贡献者 load/g, '指定等待所有贡献者加载的最大时间（以秒为单位）')
		.replace(/指定可选 title 用于generated 自动链接/g, '指定生成自动链接时使用的可选标题')
		.replace(/作为 variable/g, '作为变量')
		.replace(/用于引用 number/g, '用于引用编号')
		.replace(/外部 resource/g, '外部资源')
		.replace(/你 want link/g, '你想链接的')
		.replace(/partner integration/g, '合作伙伴集成')
		.replace(/所有lines/g, '所有行')
		.replace(/tabs/g, '标签页')
		.replace(/patterns/g, '模式')
		.replace(/prefix/g, '前缀')
		.replace(/resource/g, '资源')
		.replace(/number/g, '编号')
		.replace(/variable/g, '变量')
		.replace(/locale/g, '区域设置')
		.replace(/formatting/g, '格式化')
		.replace(/product usage telemetry/g, '产品使用遥测')
		.replace(/whitespace/g, '空白字符')
		.replace(/revisions/g, '修订')
		.replace(/during/g, '期间')
		.replace(/operations/g, '操作')
		.replace(/proxy server use/g, '代理服务器')
		.replace(/organizes 你的拉取请求 into 可操作分组 help 你 focus 和保持你的团队畅通/g, '将你的拉取请求整理为可操作分组，帮助你保持专注并让团队保持畅通')
		.replace(/Allows (?:Launchpad|启动台) organize 你的拉取请求 into 可操作分组和保持你的团队畅通/g, '允许启动台将你的拉取请求整理为可操作分组，并让团队保持畅通')
		.replace(/Enhance collaboration without adding noise 你的仓库/g, '增强协作，同时避免给你的仓库增加噪音')
		.replace(/Limited-time sale on GitLens Pro/g, 'GitLens Pro 限时优惠')
		.replace(/Limited-时间 sale on GitLens Pro/g, 'GitLens Pro 限时优惠')
		.replace(/Save up 50% on GitLens Pro/g, 'GitLens Pro 最高可省 50%')
		.replace(/Your Pro 试用 has ended/g, '你的 Pro 试用已结束')
		.replace(/请升级用于完整访问权限/g, '请升级以完整访问')
		.replace(/Reactivate 你的 Pro 试用和 体验 Launchpad 和 all 新版 Pro 功能 — 免费用于 另一个 14 天/g, '重新激活你的 Pro 试用，免费再体验 14 天启动台和所有新版 Pro 功能')
		.replace(/Reactivate 你的 Pro 试用和体验 ([^ ]+) 和 all 新版 Pro 功能 — 免费再 14 天/g, '重新激活你的 Pro 试用，免费再体验 14 天 $1 和所有新版 Pro 功能')
		.replace(/GitLens 分组 many related 视图—提交，分支，贮藏，etc—here for easier 视图 management/g, 'GitLens 将许多相关视图（提交、分支、贮藏等）分组在这里，便于视图管理')
		.replace(/GitLens 分组 many related 视图—提交，分支，贮藏，etc—here 用于 easier 视图 management/g, 'GitLens 将许多相关视图（提交、分支、贮藏等）分组在这里，便于视图管理')
		.replace(/使用标签页上方 navigate/g, '使用上方标签页导航')
		.replace(/或 detach 视图你 want 保持 separated/g, '或分离你想单独保留的视图')
		.replace(/优先 them separate/g, '更喜欢它们分开')
		.replace(/还原视图上一项 locations/g, '还原视图之前的位置')
		.replace(/You 可以 regroup them anytime 使用 'x' 在视图 header/g, '你可以随时使用视图标题中的 “x” 重新分组')
		.replace(/搜索用于提交 by/g, '按以下条件搜索提交：')
		.replace(/比较 References/g, '比较引用')
		.replace(/minimize context switching by 允许你 work on 多个分支 simultaneously/g, '通过允许你同时处理多个分支来减少上下文切换')
		.replace(/minimize context switching by working on 多个分支 simultaneously/g, '通过同时处理多个分支来减少上下文切换')
		.replace(/Unlock 此功能用于私密地 hosted repos 使用/g, '使用以下方式为私有托管仓库解锁此功能：')
		.replace(/Worktrees 是 not supported by 你的 version 的 Git/g, '你的 Git 版本不支持 Worktrees')
		.replace(/请升级更多 recent version/g, '请升级到更新版本')
		.replace(/Workspaces ᴘʀᴇᴠɪᴇᴡ — 分组和 manage 多个仓库 together，可从任何位置访问，streamlining 你的 workflow/g, '云工作区 ᴘʀᴇᴠɪᴇᴡ — 将多个仓库分组管理并可从任何位置访问，从而简化你的工作流')
		.replace(/创建工作区 just 用于 yourself 或共享 \(coming soon 在 GitLens\) them 使用你的团队用于 faster onboarding 和 better collaboration/g, '创建仅供自己使用的工作区，或与团队共享（即将在 GitLens 中推出），以便更快上手并改进协作')
		.replace(/Moment\.js formats/g, 'Moment.js 格式')
		.replace(/Moment\.js docs/g, 'Moment.js 文档')
		.replace(/Disables click interaction/g, '禁用点击交互')
		.replace(/Aligns 到left/g, '左对齐')
		.replace(/Aligns 到right/g, '右对齐')
		.replace(/`ESC` key/g, '`ESC` 键')
		.replace(/切换 window/g, '切换窗口')
		.replace(/\(deduplicate\)/g, '（去重）')
		.replace(/指定如何文件更改标注将 toggled/g, '指定文件更改标注如何切换')
		.replace(/指定如何文件热力图标注将 toggled/g, '指定文件热力图标注如何切换')
		.replace(/文件热力图标注当最近更改早于 \(cold\) than/g, '最近更改早于（冷色）阈值时文件热力图标注的')
		.replace(/文件热力图标注当最近更改晚于 \(hot\) than/g, '最近更改晚于（热色）阈值时文件热力图标注的')
		.replace(/指定是否显示 sidebar在 _提交图_/g, '指定是否在 _提交图_ 中显示侧边栏')
		.replace(/Selects working 更改 \(WIP\) 行当存在未提交更改，otherwise selects HEAD 行/g, '存在未提交更改时选择 Working Tree 更改（WIP）行，否则选择 HEAD 行')
		.replace(/Always selects HEAD 行/g, '始终选择 HEAD 行')
		.replace(/指定如何日期将 displayed在 _提交图_/g, '指定日期在 _提交图_ 中如何显示')
		.replace(/defaults (__GL_PROTECTED_\d+__)/g, '默认使用 $1')
		.replace(/例如 1 day ago/g, '例如 1 天前')
		.replace(/例如 July 25th，2018 7:18pm/g, '例如 2018 年 7 月 25 日 19:18')
		.replace(/指定如何绝对日期将格式化在 _提交图_/g, '指定绝对日期在 _提交图_ 中如何格式化')
		.replace(/但 avoids intermixing 多个 lines 的 history/g, '但会避免混合多条历史线')
		.replace(/指定是否only 跟随第一父提交当显示提交在 _提交图_/g, '指定在 _提交图_ 中显示提交时是否仅跟随第一父提交')
		.replace(/悬停提示ing over/g, '悬停在')
		.replace(/highlight 行/g, '高亮行')
		.replace(/当paginating在 _提交图_/g, '在 _提交图_ 中分页时')
		.replace(/当paginating 视图列表/g, '视图列表分页时')
		.replace(/指定数量额外项目获取/g, '指定要额外获取的项目数量')
		.replace(/moved Other在 _Launchpad_/g, '移动到 _启动台_ 中的 Other')
		.replace(/指定是否use 颜色在 _Launchpad_ 状态栏指示器/g, '指定是否在 _启动台_ 状态栏指示器中使用颜色')
		.replace(/指定是否always 显示当前分支顶部的视图/g, '指定是否始终在视图顶部显示当前分支')
		.replace(/on revision \(提交\) histories 在视图/g, '在视图中的修订（提交）历史中')
		.replace(/已弃用。使用 (__GL_PROTECTED_\d+__) instead/g, '已弃用。请改用 $1')
		.replace(/自动切换显示文件作为 (__GL_PROTECTED_\d+__) 或 (__GL_PROTECTED_\d+__) 基于在(__GL_PROTECTED_\d+__) 值和数量文件 at each 嵌套层级/g, '基于 $3 的值和每个嵌套层级中的文件数量，在 $1 或 $2 布局之间自动切换显示文件')
		.replace(/显示文件's type \(theme 图标\) 作为图标/g, '使用文件类型（主题图标）作为图标')
		.replace(/显示分支和标签作为树形当names contain slashes (__GL_PROTECTED_\d+__)/g, '当名称包含斜杠 $1 时，以树形显示分支和标签')
		.replace(/显示分支作为树形当names contain slashes (__GL_PROTECTED_\d+__)/g, '当名称包含斜杠 $1 时，以树形显示分支')
		.replace(/显示标签作为树形当names contain slashes (__GL_PROTECTED_\d+__)/g, '当名称包含斜杠 $1 时，以树形显示标签')
		.replace(/显示 Worktree 分支作为树形当names contain slashes (__GL_PROTECTED_\d+__)/g, '当名称包含斜杠 $1 时，以树形显示 Worktree 分支')
		.replace(/指定是否显示比较的分支使用用户选择的引用 \(分支，标签，等\) under 每个分支在 _仓库_ 视图/g, '指定是否在 _仓库_ 视图中每个分支下方显示与用户所选引用（分支、标签等）的比较')
		.replace(/指定是否显示比较的分支使用用户选择的引用 \(分支，标签，等\) under 每个分支在 _云工作区_ 视图/g, '指定是否在 _云工作区_ 视图中每个分支下方显示与用户所选引用（分支、标签等）的比较')
		.replace(/指定是否文件 histories 将跟随 renames/g, '指定文件历史是否跟随重命名')
		.replace(/指定是否文件 histories 将显示提交从所有分支/g, '指定文件历史是否显示来自所有分支的提交')
		.replace(/指定是否文件 histories 将显示 merge 提交/g, '指定文件历史是否显示合并提交')
		.replace(/指定是否reveal ([^在]+?)在 _([^_]+)_ 视图，otherwise they revealed在 _仓库_ 视图/g, '指定是否在 _$2_ 视图中显示$1，否则在 _仓库_ 视图中显示')
		.replace(/指定是否reveal Worktrees在 _Worktrees_ 视图，otherwise they revealed在 _仓库_ 视图/g, '指定是否在 _Worktrees_ 视图中显示 Worktrees，否则在 _仓库_ 视图中显示')
		.replace(/指定默认路径在哪些新版 Worktrees 将 created/g, '指定创建新版 Worktrees 时使用的默认路径')
		.replace(/指定如何和当打开 Worktree 之后它 created/g, '指定创建 Worktree 后如何以及何时打开它')
		.replace(/Always 打开新版 Worktree 在当前窗口/g, '始终在当前窗口打开新版 Worktree')
		.replace(/Always 打开新版 Worktree 在新版 window/g, '始终在新窗口打开新版 Worktree')
		.replace(/Never 打开新版 Worktree/g, '从不打开新版 Worktree')
		.replace(/Always 提示打开新版 Worktree/g, '始终提示是否打开新版 Worktree')
		.replace(/此可以 take while compute 具体取决于仓库大小/g, '这可能需要一段时间，具体取决于仓库大小')
		.replace(/指定 maximum 数量的 时间 \(以秒为单位\) 等待用于所有贡献者加载/g, '指定等待所有贡献者加载的最大时间（以秒为单位）')
		.replace(/指定是否include working 树形文件状态每个仓库在 _云工作区_ 视图/g, '指定是否在 _云工作区_ 视图中为每个仓库包含 Working Tree 文件状态')
		.replace(/指定是否显示 experimental incoming activity 每个仓库在 _云工作区_ 视图/g, '指定是否在 _云工作区_ 视图中为每个仓库显示实验性传入活动')
		.replace(/指定是否显示 _云工作区_ 视图在紧凑化显示 density/g, '指定 _云工作区_ 视图是否使用紧凑显示密度')
		.replace(/指定布局 density 的_Interactive 变基 Editor_/g, '指定 _交互式变基编辑器_ 的布局密度')
		.replace(/Compact 布局使用 minimal spacing/g, '紧凑布局使用最小间距')
		.replace(/Comfortable 布局使用更多 space between 行/g, '舒适布局在行之间使用更多间距')
		.replace(/显示 oldest 提交第一/g, '最旧的提交优先显示')
		.replace(/显示 newest 提交第一/g, '最新的提交优先显示')
		.replace(/指定是否自动打开 _Interactive 变基 Editor_ 当paused rebase 被检测到/g, '指定检测到暂停的 rebase 时是否自动打开 _交互式变基编辑器_')
		.replace(/Never 自动打开 editor/g, '从不自动打开编辑器')
		.replace(/仅自动打开 editor 当interactive rebase 被检测到/g, '仅在检测到交互式 rebase 时自动打开编辑器')
		.replace(/自动打开 editor 当任何 paused rebase 被检测到/g, '检测到任何暂停的 rebase 时自动打开编辑器')
		.replace(/指定 reveal 提交和 references/g, '指定是否显示提交和引用')
		.replace(/指定当自动 reveal 提交在(__GL_PROTECTED_\d+__) location/g, '指定在 $1 位置自动显示提交时的行为')
		.replace(/自动 reveals 提交当double-clicking on 行/g, '双击行时自动显示提交')
		.replace(/自动 reveals 提交当选择更改或当double-clicking on 行/g, '选择更改或双击行时自动显示提交')
		.replace(/指定是否显示头像图像在快速选择 menus 当applicable/g, '指定适用时是否在快速选择菜单中显示头像图像')
		.replace(/排序 commands by 名称/g, '按名称排序命令')
		.replace(/排序 commands by last used 日期/g, '按上次使用日期排序命令')
		.replace(/Git commands 将 skip confirmation step/g, 'Git 命令将跳过确认步骤')
		.replace(/指定是否显示提交搜索结果 directly 在快速选择菜单，在侧边栏，或将基于在context/g, '指定是在快速选择菜单、侧边栏中直接显示提交搜索结果，还是根据上下文决定')
		.replace(/使用或 without regard casing/g, '是否忽略大小写')
		.replace(/使用 regular expressions/g, '使用正则表达式')
		.replace(/指定是否启用 rich integrations 使用任何受支持的远程服务/g, '指定是否为所有受支持的远程服务启用丰富集成')
		.replace(/指定是否use cloud-基于 integrations 当authenticating 使用 GitHub/g, '指定使用 GitHub 认证时是否使用基于云的集成')
		.replace(/指定自定义远程 services matched 使用 Git 远程 detect 自定义 domains 用于 built-in 远程 services 或提供 support 用于自定义远程 services/g, '指定自定义远程服务，用于通过 Git 远程检测自定义域名、匹配内置远程服务，或为自定义远程服务提供支持')
		.replace(/指定是否启用 integration 使用 Visual Studio Live Share/g, '指定是否启用与 Visual Studio Live Share 的集成')
		.replace(/指定是否允许访客访问权限 GitLens 功能当使用 Visual Studio Live Share/g, '指定使用 Visual Studio Live Share 时是否允许访客访问 GitLens 功能')
		.replace(/当clicking 在提交 link 在集成终端/g, '点击集成终端中的提交链接时')
		.replace(/指定是否启用 experimental integration 使用GitKraken CLI/g, '指定是否启用与 GitKraken CLI 的实验性集成')
		.replace(/指定是否自动 install 和启用 GitKraken MCP。此 only applies VS Code 1\.101 和 later/g, '指定是否自动安装并启用 GitKraken MCP。仅适用于 VS Code 1.101 及更高版本')
		.replace(/指定是否use VS Code 作为 Git's (__GL_PROTECTED_\d+__) 用于 Gitlens 终端 commands/g, '指定是否使用 VS Code 作为 Git 的 $1，用于 GitLens 终端命令')
		.replace(/指定是否启用 experimental version 的提交 composer/g, '指定是否启用实验性版本的提交 composer')
		.replace(/指定 GitKraken AI provided 模型 use 用于 GitLens' AI 功能，格式化作为 (__GL_PROTECTED_\d+__)/g, '指定 GitLens AI 功能使用的 GitKraken AI 提供模型，格式为 $1')
		.replace(/指定 VS Code provided 模型 use 用于 GitLens' AI 功能，格式化作为 (__GL_PROTECTED_\d+__)/g, '指定 GitLens AI 功能使用的 VS Code 提供模型，格式为 $1')
		.replace(/指定 Ollama URL use 用于访问权限/g, '指定用于访问 Ollama 的 URL')
		.replace(/指定自定义 URL use 用于访问权限 OpenAI 模型/g, '指定用于访问 OpenAI 模型的自定义 URL')
		.replace(/指定自定义 URL use 用于访问权限 Azure OpenAI 模型/g, '指定用于访问 Azure OpenAI 模型的自定义 URL')
		.replace(/指定自定义 URL use 用于访问权限 OpenAI-compatible 模型/g, '指定用于访问 OpenAI-compatible 模型的自定义 URL')
		.replace(/指定 threshold \(in token\) 用于当显示 warning about 提示 being too large/g, '指定提示词过大时显示警告的阈值（以 token 为单位）')
		.replace(/指定 temperature，measure 的 output randomness， use 用于AI 模型。Higher values 结果在更多 randomness，例如 creativity，while lower values 是更多 deterministic/g, '指定 AI 模型使用的 temperature，用于衡量输出随机性。值越高随机性越强，例如更具创造性；值越低则更确定')
		.replace(/指定自定义指令提供到AI 提供商当生成 changelog 从 set 的更改/g, '指定从一组更改生成 changelog 时提供给 AI 提供商的自定义指令')
		.replace(/指定是否启用 GitLens' AI-powered 功能/g, '指定是否启用 GitLens 的 AI 驱动功能')
		.replace(/指定自定义指令提供到AI 提供商当生成 cloud patch title 和说明/g, '指定生成 cloud patch 标题和说明时提供给 AI 提供商的自定义指令')
		.replace(/指定自定义指令提供到AI 提供商当生成代码 suggest title 和说明/g, '指定生成代码建议标题和说明时提供给 AI 提供商的自定义指令')
		.replace(/指定自定义指令提供到AI 提供商当生成拉取请求 title 和说明/g, '指定生成拉取请求标题和说明时提供给 AI 提供商的自定义指令')
		.replace(/指定如何日期将 displayed 默认情况下/g, '指定默认情况下日期如何显示')
		.replace(/指定如何绝对日期将格式化默认情况下/g, '指定默认情况下绝对日期如何格式化')
		.replace(/指定如何短格式绝对日期将格式化默认情况下/g, '指定默认情况下短格式绝对日期如何格式化')
		.replace(/指定如何times 将格式化默认情况下/g, '指定默认情况下时间如何格式化')
		.replace(/指定是否提交日期应 use authored 或 committed 日期/g, '指定提交日期应使用作者日期还是提交日期')
		.replace(/Uses 日期当更改 were authored \(即 originally written\)/g, '使用更改被作者编写时的日期')
		.replace(/Uses 日期当更改 were committed/g, '使用更改被提交时的日期')
		.replace(/排序仓库 by discovery 或 workspace 顺序/g, '按发现顺序或工作区顺序排序仓库')
		.replace(/排序仓库 by last fetched 日期在 descending 顺序/g, '按上次抓取日期降序排序仓库')
		.replace(/排序仓库 by last fetched 日期在 ascending 顺序/g, '按上次抓取日期升序排序仓库')
		.replace(/排序仓库 by 名称在 ascending 顺序/g, '按名称升序排序仓库')
		.replace(/排序仓库 by 名称在 descending 顺序/g, '按名称降序排序仓库')
		.replace(/排序分支 by 最近提交日期在 descending 顺序/g, '按最近提交日期降序排序分支')
		.replace(/排序分支 by 最近提交日期在 ascending 顺序/g, '按最近提交日期升序排序分支')
		.replace(/排序分支 by 名称在 ascending 顺序/g, '按名称升序排序分支')
		.replace(/排序分支 by 名称在 descending 顺序/g, '按名称降序排序分支')
		.replace(/排序标签 by 日期在 descending 顺序/g, '按日期降序排序标签')
		.replace(/排序标签 by 日期在 ascending 顺序/g, '按日期升序排序标签')
		.replace(/排序标签 by 名称在 ascending 顺序/g, '按名称升序排序标签')
		.replace(/排序标签 by 名称在 descending 顺序/g, '按名称降序排序标签')
		.replace(/排序 Worktrees by 最近提交日期在 descending 顺序/g, '按最近提交日期降序排序 Worktrees')
		.replace(/排序 Worktrees by 最近提交日期在 ascending 顺序/g, '按最近提交日期升序排序 Worktrees')
		.replace(/排序 Worktrees by 名称在 ascending 顺序/g, '按名称升序排序 Worktrees')
		.replace(/排序 Worktrees by 名称在 descending 顺序/g, '按名称降序排序 Worktrees')
		.replace(/排序贡献者 by 提交 count 在 descending 顺序/g, '按提交数降序排序贡献者')
		.replace(/排序贡献者 by 提交 count 在 ascending 顺序/g, '按提交数升序排序贡献者')
		.replace(/排序贡献者 by 最近提交日期在 descending 顺序/g, '按最近提交日期降序排序贡献者')
		.replace(/排序贡献者 by 最近提交日期在 ascending 顺序/g, '按最近提交日期升序排序贡献者')
		.replace(/排序贡献者 by 名称在 ascending 顺序/g, '按名称升序排序贡献者')
		.replace(/排序贡献者 by 名称在 descending 顺序/g, '按名称降序排序贡献者')
		.replace(/在快速选择 menus 和视图/g, '在快速选择菜单和视图中')
		.replace(/指定如何Worktrees 排序/g, '指定 Worktrees 如何排序')
		.replace(/\s+([，。；：）])/g, '$1')
		.replace(/([一-龥])\s+([一-龥])/g, '$1$2')
		.replace(/\s{2,}/g, ' ')
		.trim();
}

function cleanupRestoredVisibleText(value) {
	return normalizePreservedTerms(value
		.replace(/已弃用。Use 按语言 `gitlens\.codeLens\.scopes` 和 `gitlens\.codeLens\.symbolScopes` 设置/g, '已弃用。请改用按语言的 `gitlens.codeLens.scopes` 和 `gitlens.codeLens.symbolScopes` 设置')
		.replace(/\(使用 markdown\)/g, '（使用 Markdown）')
		.replace(/`ESC` key/g, '`ESC` 键')
		.replace(/指定基础颜色的文件热力图标注当最近更改早于 \(cold\) than `#gitlens\.heatmap\.ageThreshold#` 值/g, '指定最近更改早于 `#gitlens.heatmap.ageThreshold#` 值时，文件热力图标注使用的基础冷色')
		.replace(/指定基础颜色的文件热力图标注当最近更改晚于 \(hot\) than `#gitlens\.heatmap\.ageThreshold#` 值/g, '指定最近更改晚于 `#gitlens.heatmap.ageThreshold#` 值时，文件热力图标注使用的基础热色')
		.replace(/指定数量天之后哪些拉取请求被视为过期和移动到 _Launchpad_ 中的 Other/g, '指定多少天之后将拉取请求视为过期，并移动到 _启动台_ 中的“其他”分组')
		.replace(/自动切换显示文件作为 `tree` 或 `list` 基于在`#([^#]+)#` 值和数量文件 at each 嵌套层级/g, '基于 `#$1#` 的值和每个嵌套层级中的文件数量，在 `tree` 或 `list` 布局之间自动切换显示文件')
		.replace(/显示分支和标签作为树形当names contain slashes `\/`/g, '当名称包含斜杠 `/` 时，以树形显示分支和标签')
		.replace(/显示分支作为树形当names contain slashes `\/`/g, '当名称包含斜杠 `/` 时，以树形显示分支')
		.replace(/显示标签作为树形当names contain slashes `\/`/g, '当名称包含斜杠 `/` 时，以树形显示标签')
		.replace(/显示 Worktree 分支作为树形当names contain slashes `\/`/g, '当名称包含斜杠 `/` 时，以树形显示 Worktree 分支')
		.replace(/指定是否文件 histories 将显示提交从所有分支/g, '指定文件历史是否显示来自所有分支的提交')
		.replace(/指定默认路径在哪些新版 Worktrees 将 created/g, '指定创建新版 Worktrees 时使用的默认路径')
		.replace(/指定如何和当打开 Worktree 之后它 created/g, '指定创建 Worktree 后如何以及何时打开它')
		.replace(/Always 提示打开新版 Worktree/g, '始终提示是否打开新版 Worktree')
		.replace(/指定 maximum 数量的 时间 \(以秒为单位\) 等待用于所有贡献者加载。使用 0 等待无限期 \(无超时\)/g, '指定等待所有贡献者加载的最大时间（以秒为单位）。使用 0 表示无限期等待（无超时）')
		.replace(/指定是否显示 _云工作区_ 视图在紧凑化显示 density/g, '指定 _云工作区_ 视图是否使用紧凑显示密度')
		.replace(/Comfortable 布局使用更多 space between 行/g, '舒适布局在行之间使用更多间距')
		.replace(/指定当自动 reveal 提交在`#gitlens\.rebaseEditor\.revealLocation#` location/g, '指定在 `#gitlens.rebaseEditor.revealLocation#` 位置自动显示提交时的行为')
		.replace(/自动 reveals 提交当选择更改或当double-clicking on 行/g, '选择更改或双击行时自动显示提交')
		.replace(/指定是否显示提交搜索结果 directly 在快速选择菜单，在侧边栏，或将基于在context/g, '指定是在快速选择菜单、侧边栏中直接显示提交搜索结果，还是根据上下文决定')
		.replace(/已弃用。此设置已重命名为 gitlens\.gitCommands\.搜索\.showResultsInSideBar/g, '已弃用。此设置已重命名为 `gitlens.gitCommands.search.showResultsInSideBar`')
		.replace(/指定自定义远程 services matched 使用 Git 远程 detect 自定义 domains 用于 built-in 远程 services 或提供 support 用于自定义远程 services/g, '指定自定义远程服务，用于通过 Git 远程检测自定义域名、匹配内置远程服务，或为自定义远程服务提供支持')
		.replace(/指定 Ollama URL use 用于访问权限/g, '指定用于访问 Ollama 的 URL')
		.replace(/指定自定义 URL use 用于访问权限 OpenAI 模型\./g, '指定用于访问 OpenAI 模型的自定义 URL。')
		.replace(/指定自定义 URL use 用于访问权限 Azure OpenAI 模型/g, '指定用于访问 Azure OpenAI 模型的自定义 URL')
		.replace(/指定自定义 URL use 用于访问权限 OpenAI-compatible 模型\./g, '指定用于访问 OpenAI-compatible 模型的自定义 URL。')
		.replace(/指定 temperature，measure 的 output randomness， use 用于AI 模型。Higher values 结果在更多 randomness，例如 creativity，while lower values 是更多 deterministic/g, '指定 AI 模型使用的 temperature，用于衡量输出随机性。值越高随机性越强，例如更具创造性；值越低则更确定')
		.replace(/指定区域设置，\[BCP 47 language 标签\]\(([^)]+)\)， use 用于日期格式化，defaults 到VS Code 区域设置。使用 `system` 跟随 current system 区域设置，或 choose specific 区域设置，e\.g `en-US` — US English，`en-GB` — British English，`de-DE` — German，`ja-JP` = Japanese，etc\./g, '指定用于日期格式化的区域设置，即 [BCP 47 语言标签]($1)，默认使用 VS Code 区域设置。使用 `system` 跟随当前系统区域设置，或选择特定区域设置，例如 `en-US`（美国英语）、`en-GB`（英国英语）、`de-DE`（德语）、`ja-JP`（日语）等。')
		.replace(/指定 keymap use 用于 GitLens shortcut keys/g, '指定 GitLens 快捷键使用的键盘映射')
		.replace(/添加 alternate set 的 shortcut keys 该 start 使用 `Alt` \(⌥ on macOS\)/g, '添加一组备用快捷键，以 `Alt` 开始（macOS 上为 ⌥）')
		.replace(/添加 chorded set 的 shortcut keys 该 start 使用 `Ctrl\+Shift\+G` \(`⌥⌘G` on macOS\)/g, '添加一组组合快捷键，以 `Ctrl+Shift+G` 开始（macOS 上为 `⌥⌘G`）')
		.replace(/No shortcut keys 将 added/g, '不添加快捷键')
		.replace(/指定用户定义的 GitLens modes/g, '指定用户定义的 GitLens 模式')
		.replace(/指定 ID 的user's 当前 GitKraken 组织在 GitLens/g, '指定 GitLens 中用户当前 GitKraken 组织的 ID')
		.replace(/指定是否attempt detect nested 仓库当打开文件/g, '指定打开文件时是否尝试检测嵌套仓库')
		.replace(/指定哪些 messages 应 suppressed/g, '指定要抑制哪些消息')
		.replace(/指定如何many 文件夹 deep 搜索用于仓库。Defaults `#git\.repositoryScanMaxDepth#`/g, '指定搜索仓库时递归多少层文件夹。默认使用 `#git.repositoryScanMaxDepth#`')
		.replace(/指定 length 的 abbreviated 提交 SHAs/g, '指定缩写提交 SHA 的长度')
		.replace(/指定是否复制完整或 abbreviated 提交 SHAs 到剪贴板。Abbreviates 到length 的 `#gitlens\.advanced\.abbreviatedShaLength#`\./g, '指定复制到剪贴板的是完整提交 SHA 还是缩写提交 SHA。缩写长度由 `#gitlens.advanced.abbreviatedShaLength#` 控制。')
		.replace(/指定排序依据哪些提交将显示。If unspecified，提交将显示在逆时间顺序/g, '指定提交显示时使用的排序依据。未指定时，提交按逆时间顺序显示')
		.replace(/指定是否忽略空白字符当comparing 修订期间 Blame 操作/g, '指定 Blame 操作比较修订时是否忽略空白字符')
		.replace(/指定额外 arguments pass 到`git blame` 命令/g, '指定传递给 `git blame` 命令的额外参数')
		.replace(/指定数量 \(percent\) 的 similarity deleted 和 added 文件 pair 才会被视为重命名/g, '指定已删除文件与新增文件成对比较时，被视为重命名所需的相似度百分比')
		.replace(/指定是否dismiss 快速选择 menus 当失去焦点 \(如果 not，press `ESC` dismiss\)/g, '指定失去焦点时是否关闭快速选择菜单（否则按 `ESC` 关闭）')
		.replace(/指定是否skip onboarding experiences，such 作为 welcome 视图和 walkthroughs。Useful 用于 ephemeral environments like containers 或 sandboxes/g, '指定是否跳过入门体验，例如欢迎视图和演练。适用于容器或沙盒等临时环境')
		.replace(/Reactivate 你的 Pro 试用和体验启动台和 all 新版 Pro 功能 — 免费再 14 天!/g, '重新激活你的 Pro 试用，免费再体验 14 天启动台和所有新版 Pro 功能！')
		.replace(/Reactivate 你的 Pro 试用和体验([^ ]+)和 all 新版 Pro 功能 — 免费再 14 天!/g, '重新激活你的 Pro 试用，免费再体验 14 天$1和所有新版 Pro 功能！')
		.replace(/Supercharge Git 和 unlock untapped knowledge 在你的 repo better understand，write，和 review 代码\./g, '增强 Git 体验，解锁仓库中的深层知识，帮助你更好地理解、编写和评审代码。')
		.replace(/继续 walkthrough/g, '继续演练')
		.replace(/指定 maximum 数量项目显示在列表。使用 0 表示不设上限/g, '指定列表中显示的最大项目数。使用 0 表示不设上限')
		.replace(/指定 maximum 数量项目显示在搜索。使用 0 表示不设上限/g, '指定搜索中显示的最大项目数。使用 0 表示不设上限')
		.replace(/指定是否cache \(per-workspace\) 路径到Git executable use 用于 GitLens/g, '指定是否按工作区缓存 GitLens 使用的 Git 可执行文件路径')
		.replace(/指定 debug 模式/g, '指定调试模式')
		.replace(/指定是否override 默认 deep link scheme \(vscode:\/\/\) 使用environment 值或指定值/g, '指定是否使用环境值或指定值覆盖默认 deep link scheme（vscode://）')
		.replace(/指定是否resolve 符号ic links 当determining 文件 paths 用于 Git 操作/g, '指定确定 Git 操作的文件路径时是否解析符号链接')
		.replace(/指定是否delay loading 提交文件详情 until required。此可以 improve performance 当打开仓库使用 large histories，但 causes 更多 incremental Git calls/g, '指定是否延迟加载提交文件详情，直到需要时再加载。打开大型历史仓库时这可以提升性能，但会产生更多增量 Git 调用')
		.replace(/指定是否显示新增内容 notification 之后 upgrading 新版功能 releases/g, '指定升级到新版功能版本后是否显示新增内容通知')
		.replace(/指定如何much \(如果有\) output 将 sent 到GitLens output channel/g, '指定发送到 GitLens 输出通道的输出量')
		.replace(/Logs nothing/g, '不记录任何内容')
		.replace(/Logs only errors/g, '仅记录错误')
		.replace(/Logs errors 和 warnings/g, '记录错误和警告')
		.replace(/Logs errors，warnings，和 messages/g, '记录错误、警告和消息')
		.replace(/Logs verbose errors，warnings，和 messages。Best 用于 issue reporting\./g, '记录详细错误、警告和消息。最适合问题报告。')
		.replace(/指定样式的gravatar 默认 \(fallback\) images/g, '指定默认 gravatar 备用图像的样式')
		.replace(/A geometric pattern/g, '几何图案')
		.replace(/A simple，cartoon-样式 silhouetted outline 的 person \(does not vary by email hash\)/g, '简单的卡通风格人物轮廓（不会随邮箱哈希变化）')
		.replace(/A monster 使用 different 颜色，faces，etc/g, '使用不同颜色和面孔等元素的怪物图像')
		.replace(/8-bit arcade-样式 pixelated faces/g, '8-bit 街机风格像素头像')
		.replace(/A robot 使用 different 颜色，faces，etc/g, '使用不同颜色和面孔等元素的机器人图像')
		.replace(/A face 使用 differing 功能和 backgrounds/g, '使用不同特征和背景的人脸图像')
		.replace(/指定 proxy 配置 use。If not 指定，proxy 配置将 determined 基于 on VS Code 或 OS settings/g, '指定要使用的 proxy 配置。未指定时，将根据 VS Code 或 OS 设置确定 proxy 配置')
		.replace(/指定是否hide 或显示功能需要试用或 GitLens Pro 和是 not accessible given 打开仓库和 current 试用或 plan/g, '指定是否隐藏或显示需要试用或 GitLens Pro、且在当前打开仓库和当前试用或方案下不可访问的功能')
		.replace(/指定是否启用 virtual 仓库 support/g, '指定是否启用虚拟仓库支持')
		.replace(/已弃用。使用 pre-release edition 的 GitLens instead/g, '已弃用。请改用 GitLens 的预发布版本')
		.replace(/已弃用。使用 pre-release 的 GitLens instead/g, '已弃用。请改用 GitLens 预发布版本')
		.replace(/指定图标颜色的打开 issues 在GitLens 视图/g, '指定 GitLens 视图中打开的议题图标颜色')
		.replace(/指定图标颜色的 closed issues 在GitLens 视图/g, '指定 GitLens 视图中已关闭的议题图标颜色')
		.replace(/指定图标颜色的 closed PR 在GitLens 视图/g, '指定 GitLens 视图中已关闭的 PR 图标颜色')
		.replace(/指定图标颜色的打开 PR 在GitLens 视图/g, '指定 GitLens 视图中打开的 PR 图标颜色')
		.replace(/指定图标颜色的 merged PR 在GitLens 视图/g, '指定 GitLens 视图中已合并的 PR 图标颜色')
		.replace(/指定图标颜色的 unpublished 更改在GitLens 视图/g, '指定 GitLens 视图中未发布更改的图标颜色')
		.replace(/指定图标颜色的 unpublished 提交在GitLens 视图/g, '指定 GitLens 视图中未发布提交的图标颜色')
		.replace(/指定图标颜色的 unpulled 更改在GitLens 视图/g, '指定 GitLens 视图中未拉取更改的图标颜色')
		.trim());
}

function finalizeVisibleText(value) {
	if (typeof value !== 'string' || value.length === 0) return value;
	const protectedSegments = protectSegments(value);
	let text = protectedSegments.value;
	text = text
		.replace(/\bGitLens Launchpad\b/g, 'GitLens 启动台')
		.replace(/\bLaunchpad Indicator\b/g, '启动台指示器')
		.replace(/\bLaunchpad indicator\b/g, '启动台指示器')
		.replace(/\bLaunchpad View Options\b/g, '启动台视图选项')
		.replace(/\bLaunchpad View\b/g, '启动台视图')
		.replace(/\bLaunchpad view\b/g, '启动台视图')
		.replace(/_Launchpad_/g, '_启动台_')
		.replace(/\bLaunchpad\b/g, '启动台')
		.replace(/Requires connection supported 远程服务/g, '需要连接到受支持的远程服务')
		.replace(/Requires connection 受支持的议题服务/g, '需要连接到受支持的议题服务')
		.replace(/Requires connection to supported 远程服务/g, '需要连接到受支持的远程服务')
		.replace(/Requires connection to 受支持的议题服务/g, '需要连接到受支持的议题服务')
		.replace(/Requires a connection to a supported remote service/g, '需要连接到受支持的远程服务')
		.replace(/Requires a connection to a supported issue service/g, '需要连接到受支持的议题服务')
		.replace(/需要连接 受支持的远程服务/g, '需要连接到受支持的远程服务')
		.replace(/需要连接 受支持的议题服务/g, '需要连接到受支持的议题服务')
		.replace(/相关信息。需要/g, '相关信息。需要')
		.replace(/（如果有） 相关信息/g, '（如果有）相关信息')
		.replace(/\bDisable 调试日志/g, '禁用调试日志')
		.replace(/\bEnable 调试日志/g, '启用调试日志')
		.replace(/\bDisconnect 远程 Integration/g, '断开远程集成')
		.replace(/\bIntegration\b/g, '集成')
		.replace(/\bDirectory\b/g, '目录')
		.replace(/\bFolder\b/g, '文件夹')
		.replace(/\bLine\b/g, '行')
		.replace(/\bFile\b/g, '文件')
		.replace(/\bFiles\b/g, '文件')
		.replace(/\bPrevious\b/g, '上一修订')
		.replace(/\bNext\b/g, '下一修订')
		.replace(/\bWorking File\b/g, '工作区文件')
		.replace(/\bSelected\b/g, '所选')
		.replace(/\bColumn\b/g, '列')
		.replace(/\bMarkers\b/g, '标记')
		.replace(/\bDetails\b/g, '详情')
		.replace(/\bQuick\b/g, '快速')
		.replace(/\bRestore\b/g, '还原')
		.replace(/\bRefresh\b/g, '刷新')
		.replace(/\bRecompose\b/g, '重组')
		.replace(/\bCherry Pick\b/g, '拣选')
		.replace(/\bSwitch\b/g, '切换')
		.replace(/\bReset\b/g, '重置')
		.replace(/\bUpstream\b/g, '上游')
		.replace(/\bLocal\b/g, '本地')
		.replace(/\bMerge\b/g, '合并')
		.replace(/\bStatistics\b/g, '统计信息')
		.replace(/\bAvatars\b/g, '头像')
		.replace(/\bCreate\b/g, '创建')
		.replace(/\bDelete\b/g, '删除')
		.replace(/\bRename\b/g, '重命名')
		.replace(/\bApply\b/g, '应用')
		.replace(/\bDrop\b/g, '删除')
		.replace(/\bToggle\b/g, '切换')
		.replace(/\bView\b/g, '查看')
		.replace(/\bChanged\b/g, '已更改')
		.replace(/\bOnly\b/g, '仅')
		.replace(/\bAll\b/g, '所有')
		.replace(/\bFrom Here\b/g, '从此处')
		.replace(/\bfrom Here\b/g, '从此处')
		.replace(/\bHere\b/g, '此处')
		.replace(/\bBefore Here\b/g, '此处之前')
		.replace(/\bNew Window\b/g, '新窗口')
		.replace(/\bEditor\b/g, '编辑器')
		.replace(/\bPanel\b/g, '面板')
		.replace(/\bStatus\b/g, '状态')
		.replace(/\bAccount\b/g, '账号')
		.replace(/\bAccess\b/g, '访问权限')
		.replace(/\bDebugging\b/g, '调试')
		.replace(/\bPatch\b/g, '补丁')
		.replace(/\bIssue\b/g, '议题')
		.replace(/\bIssues\b/g, '议题')
		.replace(/\bList\b/g, '列表')
		// 必须在 Tree 替换之前处理 Working Tree，避免被拆分
		.replace(/\bWorking Tree\b/g, '工作树')
		.replace(/\bWorktree\b/g, '工作树')
		.replace(/\bWorktrees\b/g, '工作树')
		.replace(/\bTree\b/g, '树形')
		.replace(/\bRemote\b/g, '远程')
		.replace(/\bremote\b/g, '远程')
		.replace(/\bremote services\b/g, '远程服务')
		.replace(/\bsupported 远程 services\b/g, '受支持的远程服务')
		.replace(/\bremote names\b/g, '远程名称')
		.replace(/\bremotes\b/g, '远程')
		.replace(/\bworktrees\b/g, '工作树')
		.replace(/\bworktree\b/g, '工作树')
		.replace(/\bblame\b/g, 'Blame')
		.replace(/\bheatmap\b/g, '热力图')
		.replace(/\bhover\b/g, '悬停提示')
		.replace(/\bhovers\b/g, '悬停提示')
		.replace(/\btooltip\b/g, '工具提示')
		.replace(/\bdescription\b/g, '说明')
		.replace(/\bMessage\b/g, '消息')
		.replace(/\bin markdown\b/g, '使用 markdown')
		.replace(/\bmarked\b/g, '标记')
		.replace(/\bmarking\b/g, '标记')
		.replace(/\bformat\b/g, '格式')
		.replace(/\bmode\b/g, '模式')
		.replace(/\bquery\b/g, '查询')
		.replace(/\bsearch\b/g, '搜索')
		.replace(/\bfilter\b/g, '筛选')
		.replace(/\bfilters\b/g, '筛选器')
		.replace(/\bdata\b/g, '数据')
		.replace(/\bguest access\b/g, '访客访问')
		.replace(/\bguest\b/g, '访客')
		.replace(/\bstyle\b/g, '样式')
		.replace(/\bvalue\b/g, '值')
		.replace(/\bdefault\b/g, '默认')
		.replace(/\benabled\b/g, '启用')
		.replace(/\bdisabled\b/g, '禁用')
		.replace(/\bsource\b/g, '来源')
		.replace(/\bprovider\b/g, '提供商')
		.replace(/\bbranch comparison\b/g, '分支比较')
		.replace(/\bcomparison\b/g, '比较')
		.replace(/\buser-selected reference\b/g, '用户选择的引用')
		.replace(/\buser-选中 reference\b/g, '用户选择的引用')
		.replace(/\breference\b/g, '引用')
		.replace(/\bcommon base\b/g, '公共基准')
		.replace(/\btip\b/gi, '顶端')
		.replace(/\bPrior\b/g, '之前')
		.replace(/\bCheckout\b/g, '签出')
		.replace(/\bHighlight\b/g, '高亮')
		.replace(/\bSelect\b/g, '选择')
		.replace(/\bAdd\b/g, '添加')
		.replace(/\bWarning\b/g, '警告')
		.replace(/\bRebase\b/g, '变基')
		.replace(/\bInteractive Rebase 编辑器\b/g, '交互式变基编辑器')
		.replace(/\bGroup\b/g, '分组')
		.replace(/\bWorking 文件\b/g, '工作区文件')
		.replace(/\bWorking\b/g, '工作区')
		.replace(/\binto 当前分支\b/g, '到当前分支')
		.replace(/\bonto /g, '到')
		.replace(/\bvia 源代码管理/g, '通过源代码管理')
		.replace(/\bCopied 更改/g, '已复制的更改')
		.replace(/\bStaged 更改/g, '已暂存更改')
		.replace(/\bUnstaged 更改/g, '未暂存更改')
		.replace(/\bFile Explorer\b/g, '文件资源管理器')
		.replace(/\bVisual History\b/g, '可视化历史')
		.replace(/\bLaunchpad 查看/g, '启动台视图')
		.replace(/\bView 设置/g, '视图设置')
		.replace(/\b显示 ([^，。]+?) View\b/g, '显示 $1 视图')
		.replace(/\b查看 ([^，。]+?) View\b/g, '查看 $1 视图')
		.replace(/\b([一-龥A-Za-z0-9_]+) View\b/g, '$1 视图')
		.replace(/\b([一-龥A-Za-z0-9_]+) view\b/g, '$1 视图')
		.replace(/复制 远程/g, '复制远程')
		.replace(/打开 文件 在远程/g, '在远程打开文件')
		.replace(/打开 文件 从 远程/g, '从远程打开文件')
		.replace(/打开 文件 at 修订/g, '打开指定修订的文件')
		.replace(/打开 文件/g, '打开文件')
		.replace(/打开 更改 使用 工作区文件/g, '打开与工作区文件的更改')
		.replace(/打开 更改 使用 上一修订 修订/g, '打开与上一修订的更改')
		.replace(/打开 更改 使用 下一修订 修订/g, '打开与下一修订的更改')
		.replace(/打开 已更改 & 关闭 Unchanged 文件/g, '打开已更改文件并关闭未更改文件')
		.replace(/关闭 Unchanged 文件/g, '关闭未更改文件')
		.replace(/Unchanged 文件/g, '未更改文件')
		.replace(/显示 在 文件资源管理器/g, '在文件资源管理器中显示')
		.replace(/比较 使用 所选/g, '与所选项比较')
		.replace(/比较 使用 上游/g, '与上游比较')
		.replace(/比较 Working Tree 公共基准/g, '比较工作树与公共基准')
		.replace(/比较 Working Tree 此处/g, '比较工作树与此处')
		.replace(/打开 所有更改 使用 Working Tree/g, '使用工作树打开所有更改')
		.replace(/打开 所有更改 使用 Working Tree，分别/g, '分别使用工作树打开所有更改')
		.replace(/显示 作者 列/g, '显示作者列')
		.replace(/隐藏 作者 列/g, '隐藏作者列')
		.replace(/显示 更改 列/g, '显示更改列')
		.replace(/隐藏 更改 列/g, '隐藏更改列')
		.replace(/显示 日期 列/g, '显示日期列')
		.replace(/显示 图 列/g, '显示图列')
		.replace(/显示 提交 Message 列/g, '显示提交消息列')
		.replace(/隐藏 提交 Message 列/g, '隐藏提交消息列')
		.replace(/显示 分支 \/ 标签 列/g, '显示分支 / 标签列')
		.replace(/隐藏 分支 \/ 标签 列/g, '隐藏分支 / 标签列')
		.replace(/显示 SHA 列/g, '显示 SHA 列')
		.replace(/隐藏 SHA 列/g, '隐藏 SHA 列')
		.replace(/显示 头像/g, '显示头像')
		.replace(/隐藏 Merge 提交/g, '隐藏合并提交')
		.replace(/显示 Merge 提交/g, '显示合并提交')
		.replace(/显示 贡献者 统计信息/g, '显示贡献者统计信息')
		.replace(/隐藏 贡献者 统计信息/g, '隐藏贡献者统计信息')
		.replace(/当前分支 仅/g, '仅当前分支')
		.replace(/所有 分支/g, '所有分支')
		.replace(/查看 当前分支 仅/g, '仅查看当前分支')
		.replace(/查看 所有 分支/g, '查看所有分支')
		.replace(/切换 New 主页视图/g, '切换到新主页视图')
		.replace(/重组 所选 提交/g, '重组所选提交')
		.replace(/重组 提交 从此处/g, '从此处重组提交')
		.replace(/重组 提交/g, '重组提交')
		.replace(/应用 贮藏/g, '应用贮藏')
		.replace(/删除 贮藏/g, '删除贮藏')
		.replace(/重命名 贮藏/g, '重命名贮藏')
		.replace(/创建 分支/g, '创建分支')
		.replace(/删除 分支/g, '删除分支')
		.replace(/重命名 分支/g, '重命名分支')
		.replace(/创建 标签/g, '创建标签')
		.replace(/删除 标签/g, '删除标签')
		.replace(/合并 分支 到当前分支/g, '将分支合并到当前分支')
		.replace(/重置 当前分支/g, '重置当前分支')
		.replace(/切换 分支/g, '切换分支')
		.replace(/拣选 提交/g, '拣选提交')
		.replace(/刷新 仓库 访问权限/g, '刷新仓库访问权限')
		.replace(/快速 打开 文件历史/g, '快速打开文件历史')
		.replace(/快速 显示/g, '快速显示')
		.replace(/检查 提交 详情/g, '检查提交详情')
		.replace(/检查 行 提交 详情/g, '检查行提交详情')
		.replace(/显示 Patch 详情/g, '显示补丁详情')
		.replace(/\s+([，。；：）])/g, '$1')
		.replace(/([一-龥])\s+([一-龥])/g, '$1$2')
		.replace(/([（])\s+/g, '$1')
		.replace(/\s{2,}/g, ' ')
		.trim();
	text = cleanupResidualVisibleEnglish(text);
	return cleanupRestoredVisibleText(protectedSegments.restore(text));
}

function finalizeStringProperty(object, property, stats) {
	if (object && typeof object[property] === 'string') {
		const next = finalizeVisibleText(object[property]);
		if (next !== object[property]) {
			object[property] = next;
			stats.stringsChanged += 1;
		}
	}
}

function finalizeStringArrayProperty(object, property, stats) {
	if (!object || !Array.isArray(object[property])) return;
	object[property] = object[property].map(item => {
		if (typeof item !== 'string') return item;
		const next = finalizeVisibleText(item);
		if (next !== item) stats.stringsChanged += 1;
		return next;
	});
}

const configurationDescriptionOverrides = new Map(
	Object.entries({
		'gitlens.currentLine.scrollable':
			'指定内联 Blame 标注位于视口外时，是否可以滚动进入视图。**注意**: 将此设置为 `false` 会阻止在标注上显示悬停提示；设置 `#gitlens.hovers.currentLine.over#` 为 `line` 可在该行任意位置显示悬停提示。',
		'gitlens.codeLens.symbolScopes':
			'指定 Git CodeLens 将在哪些文档符号上显示或隐藏。使用 `!` 前缀可避免在某个符号上提供 Git CodeLens。必须是 `SymbolKind` 的成员。',
		'gitlens.codeLens.includeSingleLineSymbols': '指定是否为仅跨越单行的符号提供 Git CodeLens。',
		'gitlens.strings.codeLens.unsavedChanges.recentChangeAndAuthors':
			'指定存在未保存更改时，用来代替 _recent 更改_ 和 _作者_ CodeLens 的显示字符串。',
		'gitlens.statusBar.reduceFlicker': '指定切换行时是否避免清除上一条 Blame 信息，从而减少状态栏闪烁。',
		'gitlens.fileAnnotations.preserveWhileEditing':
			'指定文件标注是否在编辑时保留。使用 `#gitlens.advanced.blame.delayAfterEdit#` 控制文件仍未保存时，等待多久后更新标注。',
		'gitlens.advanced.blame.delayAfterEdit':
			'指定编辑后、保存前等待多久重新 Blame 未保存文档（以毫秒为单位）。使用 0 表示无限期等待。仅适用于文件小于 `#gitlens.advanced.sizeThresholdAfterEdit#` 的情况。',
		'gitlens.advanced.blame.sizeThresholdAfterEdit':
			'指定允许在编辑后且仍未保存时重新 Blame 的最大文档大小（以行为单位）。使用 0 表示不设上限。',
		'gitlens.blame.toggleMode': '指定文件 Blame 标注如何切换。',
		'gitlens.blame.highlight.enabled': '指定是否高亮与当前行关联的行。',
		'gitlens.heatmap.ageThreshold':
			'指定最近更改超过多少天后，文件热力图标注显示为冷色而非热色（即使用 `#gitlens.heatmap.coldColor#` 而不是 `#gitlens.heatmap.hotColor#`）。',
		'gitlens.graph.multiselect': '指定是否允许选择多个提交，以及是否按拓扑顺序限制选择。',
		'gitlens.graph.scrollRowPadding': '指定使用键盘或搜索更改选中行时，距离边缘多少行开始滚动提交图。',
		'gitlens.views.showContributorsStatistics': '指定是否在视图的 _贡献者_ 分区中显示贡献者统计信息。这可能需要一段时间，具体取决于仓库大小。',
		'gitlens.views.openChangesInMultiDiffEditor':
			'指定是在 multi-diff 编辑器（单个标签页）中打开多个更改，还是在单独的 diff 编辑器（多个标签页）中打开。',
		'gitlens.views.repositories.includeWorkingTree': '指定是否在 _仓库_ 视图中为每个仓库包含 Working Tree 文件状态。',
		'gitlens.views.repositories.showIncomingActivity': '指定是否在 _仓库_ 视图中为每个仓库显示实验性传入活动。',
		'gitlens.views.repositories.autoRefresh': '指定仓库或文件系统更改时，是否自动刷新 _仓库_ 视图。',
		'gitlens.views.repositories.autoReveal': '指定打开文件时，是否在 _仓库_ 视图中自动显示仓库。',
		'gitlens.views.repositories.compact': '指定是否以紧凑显示密度显示 _仓库_ 视图。',
		'gitlens.visualHistory.queryLimit':
			'指定 _可视化文件历史_ 中用于统计信息的提交查询上限，因为可能存在速率限制。仅适用于虚拟工作区。',
		'gitlens.launchpad.staleThreshold':
			'指定多少天之后将拉取请求视为过期，并移动到 _启动台_ 中的“其他”分组。',
		'gitlens.launchpad.indicator.useColors': '指定是否在 _启动台_ 状态栏指示器中使用颜色。',
		'gitlens.launchpad.indicator.polling.interval':
			'指定 _启动台_ 状态栏指示器获取拉取请求数据的频率（以分钟为单位）。使用 0 禁用自动轮询。',
		'gitlens.gitCommands.closeOnFocusOut': '指定失去焦点时是否关闭 _Git 命令面板_（否则按 `ESC` 关闭）。',
		'gitlens.gitCommands.sortBy': '指定 Git 命令在 _Git 命令面板_ 中如何排序。',
		'gitlens.ai.model':
			'指定 GitLens AI 功能使用的 AI 提供商和模型。应格式化为 `provider:model`（例如 `openai:gpt-4o` 或 `anthropic:claude-3-5-sonnet-latest`）；使用 `gitkraken` 表示 GitKraken AI 提供的模型，或使用 `vscode` 表示 VS Code extension API 提供的模型（例如 Copilot）。',
		'gitlens.telemetry.enabled':
			'指定是否允许 GitLens 发送产品使用遥测。_**注意:** 要让 GitLens 发送任何遥测，此设置和 VS Code telemetry 都必须启用。如果任一设置被禁用，则不会发送遥测。_',
		'gitlens.advanced.gitTimeout': '指定 Git 命令的超时（以秒为单位）。使用 0 禁用超时。某些长时间运行的操作（如 merge、rebase 和 revert）始终禁用超时。',
		'gitlens.advanced.externalDiffTool': '指定比较文件时使用的可选外部 diff 工具。必须配置 [Git difftool](https://git-scm.com/docs/git-config#Documentation/git-config.txt-difftool)。',
		'gitlens.advanced.externalDirectoryDiffTool':
			'指定比较目录时使用的可选外部 diff 工具。必须配置 [Git difftool](https://git-scm.com/docs/git-config#Documentation/git-config.txt-difftool)。',
		'gitlens.proxy.items.strictSSL': '指定是否根据提供的 CA 列表验证 proxy server 证书。',
		'gitlens.menus': '指定哪些命令将添加到哪些菜单。',
	}),
);

const commandTitleOverrides = new Map(
	Object.entries({
		'gitlens.launchpad.indicator.toggle': '切换启动台指示器',
		'gitlens.compareWorkingWith': '将工作树与...比较',
		'gitlens.diffDirectory': '使用...打开目录比较 (difftool)',
		'gitlens.gitCommands.remote.remove': 'Git 移除远程...',
		'gitlens.gitCommands.stash.pop': 'Git 弹出贮藏...',
		'gitlens.graph.columnDateTimeOn': '显示日期列',
		'gitlens.graph.columnGraphOn': '显示图列',
		'gitlens.graph.compareAncestryWithWorking': '比较工作树与公共基准',
		'gitlens.graph.compareWithHead': '与 HEAD 比较',
		'gitlens.graph.compareWithWorking': '比较工作树与此处',
		'gitlens.graph.copyRemoteCommitUrl.multi': '复制远程提交 URL',
		'gitlens.graph.mergeBranchInto': '将分支合并到当前分支...',
		'gitlens.graph.openChangedFileDiffsWithWorking': '使用工作树打开所有更改',
		'gitlens.graph.openChangedFileDiffsWithWorkingIndividually': '分别使用工作树打开所有更改',
		'gitlens.graph.split': '拆分提交图',
		'gitlens.graph.undoCommit': '撤销提交',
		'gitlens.openAssociatedPullRequestOnRemote': '打开关联拉取请求',
		'gitlens.openFileRevisionFrom': '从...打开指定修订的文件',
		'gitlens.pastePatchFromClipboard': '粘贴已复制的更改（补丁）',
		'gitlens.showLaunchpad': '打开启动台',
		'gitlens.showLaunchpadView': '显示启动台视图',
		'gitlens.showCommitsInView': '在选区中搜索提交',
		'gitlens.showLastQuickPick': '显示上次打开的快速选择',
		'gitlens.toggleMaximizedGraph': '切换最大化提交图',
		'gitlens.views.browseRepoBeforeRevision': '从此处之前浏览仓库',
		'gitlens.views.browseRepoBeforeRevisionInNewWindow': '在新窗口中从此处之前浏览仓库',
		'gitlens.views.clearComparison': '清除比较',
		'gitlens.views.commits.setCommitsFilterAuthors': '按作者筛选提交...',
		'gitlens.views.compareAncestryWithWorking': '比较工作树与公共基准',
		'gitlens.views.compareWithHead': '与 HEAD 比较',
		'gitlens.views.compareWithWorking': '比较工作树与此处',
		'gitlens.views.copyRemoteCommitUrl.multi': '复制远程提交 URL',
		'gitlens.views.copyUrl.multi': '复制 URL',
		'gitlens.views.fileHistory.changeBase': '更改基准...',
		'gitlens.views.home.disablePreview': '还原旧版主页视图',
		'gitlens.views.home.previewFeedback': '新版主页视图反馈',
		'gitlens.views.launchpad.info': '了解启动台...',
		'gitlens.views.launchpad.viewOptionsTitle': '启动台视图选项',
		'gitlens.views.lineHistory.changeBase': '更改基准...',
		'gitlens.views.mergeBranchInto': '将分支合并到当前分支...',
		'gitlens.views.openChangedFileDiffsWithWorking': '使用工作树打开所有更改',
		'gitlens.views.openChangedFileDiffsWithWorkingIndividually': '分别使用工作树打开所有更改',
		'gitlens.views.openDirectoryDiffWithWorking': '将目录与工作树比较',
		'gitlens.views.openInIntegratedTerminal': '在集成终端中打开',
		'gitlens.views.openInTerminal': '在终端中打开',
		'gitlens.views.openUrl.multi': '打开 URL',
		'gitlens.views.remotes.setSortByDate': '按日期排序分支',
		'gitlens.views.remotes.setSortByName': '按名称排序分支',
		'gitlens.views.removeRemote': '移除远程...',
		'gitlens.views.revealRepositoryInExplorer': '在文件资源管理器中显示',
		'gitlens.views.revealWorktreeInExplorer': '在文件资源管理器中显示',
		'gitlens.views.scm.grouped.worktrees.detach': '分离工作树视图',
		'gitlens.views.scm.grouped.launchpad': '启动台',
		'gitlens.views.scm.grouped.launchpad.attach': '分组启动台视图',
		'gitlens.views.scm.grouped.launchpad.detach': '分离启动台视图',
		'gitlens.views.scm.grouped.launchpad.visibility.hide': '隐藏启动台视图',
		'gitlens.views.scm.grouped.launchpad.visibility.show': '显示启动台视图',
		'gitlens.views.searchAndCompare.swapComparison': '交换比较',
		'gitlens.views.setBranchComparisonToWorking': '与工作树比较',
		'gitlens.views.setResultsCommitsFilterAuthors': '按作者筛选提交...',
		'gitlens.views.setResultsFilesFilterOnLeft': '仅显示左侧文件',
		'gitlens.views.setResultsFilesFilterOnRight': '仅显示右侧文件',
		'gitlens.views.setShowRelativeDateMarkersOn': '显示日期标记',
		'gitlens.views.undoCommit': '撤销提交',
		'gitlens.views.workspaces.addReposFromLinked': '从关联工作区添加仓库...',
		'gitlens.views.workspaces.changeAutoAddSetting': '更改关联工作区自动添加行为...',
		'gitlens.views.workspaces.createLocal': '创建 VS Code 工作区...',
		'gitlens.views.workspaces.locateAllRepos': '定位仓库...',
		'gitlens.views.workspaces.openLocal': '在当前窗口打开 VS Code 工作区...',
		'gitlens.views.workspaces.openLocalNewWindow': '在新窗口打开 VS Code 工作区...',
		'gitlens.views.workspaces.repo.addToWindow': '将仓库添加到 VS Code 工作区',
		'gitlens.views.workspaces.repo.locate': '定位仓库...',
		'gitlens.visualizeHistory.folder:explorer': '打开可视化文件夹历史',
		'gitlens.visualizeHistory.folder:scm': '打开可视化文件夹历史',
		'gitlens.visualizeHistory.repo:scm': '可视化仓库历史',
		'gitlens.visualizeHistory.repo:views': '可视化仓库历史',
		'gitlens.graph.revealWorktreeInExplorer': '在文件资源管理器中显示',
		'gitlens.openInIntegratedTerminal:graph': '在集成终端中打开',
		'gitlens.reviewChanges:graph': '审查更改（预览）...',
		'gitlens.startReview.openInAgent': '使用智能体开始 PR 审查',
		'gitlens.graph.rewordCommit': '重写提交消息...',
		'gitlens.graph.modifyCommits': '从此处修改提交（交互式变基）...',
		'gitlens.graph.modifyCommits.multi': '修改提交（交互式变基）...',
	}),
);

function applyCommandTitleOverride(command, stats) {
	const override = commandTitleOverrides.get(command.command);
	if (!override) return;
	const normalized = normalizePreservedTerms(override);
	if (command.title === normalized) return;
	command.title = normalized;
	stats.stringsChanged += 1;
}

function applyConfigurationDescriptionOverride(key, property, stats) {
	const override = configurationDescriptionOverrides.get(key);
	if (!override || !property || typeof property !== 'object') return;
	const normalized = normalizePreservedTerms(override);
	for (const field of ['markdownDescription', 'description', 'deprecationMessage', 'markdownDeprecationMessage']) {
		if (typeof property[field] === 'string' && property[field] !== normalized) {
			property[field] = normalized;
			stats.stringsChanged += 1;
			return;
		}
	}
}

function getViewsWelcomeOverride(welcome) {
	const contents = welcome.contents;
	const when = welcome.when ?? '';
	if (contents === 'Loading...') return '正在加载...';

	if (contents.includes('Allows Launchpad organize') || contents.includes('Allows 启动台 organize')) {
		return '[连接集成...](command:gitlens.showLaunchpad?%7B%22source%22%3A%22launchpad-view%22%7D) 允许启动台将你的拉取请求整理为可操作分组，并让团队保持畅通。';
	}

	if (contents.includes('Reactivate') && contents.includes('Launchpad')) {
		return '[继续](command:gitlens.plus.reactivateProTrial?%7B%22source%22%3A%22launchpad-view%22%7D) 重新激活你的 Pro 试用，免费再体验 14 天启动台和所有新版 Pro 功能！';
	}

	if (contents.includes('Reactivate') && contents.includes('Worktrees')) {
		return '[继续](command:gitlens.plus.reactivateProTrial?%7B%22source%22%3A%22worktrees%22%7D) 重新激活你的 Pro 试用，免费再体验 14 天 Worktrees 和所有新版 Pro 功能！';
	}

	if (contents.includes('GitLens 将许多相关视图') && when.includes('!gitlens:install:new')) {
		return 'GitLens 将许多相关视图（提交、分支、贮藏等）分组在这里，便于视图管理。[继续](command:gitlens.views.scm.grouped.welcome.dismiss) 更喜欢它们分开？[还原视图之前的位置](command:gitlens.views.scm.grouped.welcome.restore) 使用上方标签页导航，或分离你想单独保留的视图。你可以随时使用视图标题中的 “x” 重新分组。';
	}

	if (contents.includes('GitLens 将许多相关视图')) {
		return 'GitLens 将许多相关视图（提交、分支、贮藏等）分组在这里，便于视图管理。[继续](command:gitlens.views.scm.grouped.welcome.dismiss) 使用上方标签页导航，或分离你想单独保留的视图。你可以随时使用视图标题中的 “x” 重新分组。';
	}

	if (contents.includes('Unlock') && contents.includes('hosted repos')) {
		return '使用 [GitLens Pro](https://help.gitkraken.com/gitlens/gitlens-community-vs-gitlens-pro/) 为私有托管仓库解锁此功能。';
	}

	if (contents.includes('Worktrees') && (contents.includes('not supported') || contents.includes('recent version'))) {
		return '⚠ 你的 Git 版本不支持 Worktrees。请升级到更新版本。';
	}

	if (contents.includes('Workspaces ᴘʀᴇᴠɪᴇᴡ') || contents.includes('云工作区 ᴘʀᴇᴠɪᴇᴡ')) {
		return '云工作区 ᴘʀᴇᴠɪᴇᴡ — 将多个仓库分组管理并可从任何位置访问，从而简化你的工作流。创建仅供自己使用的工作区，或与团队共享（即将在 GitLens 中推出），以便更快上手并改进协作。';
	}

	return undefined;
}

function applyViewsWelcomeOverride(welcome, stats) {
	const override = getViewsWelcomeOverride(welcome);
	if (override == null) return;
	const normalized = normalizePreservedTerms(override);
	if (welcome.contents === normalized) return;
	welcome.contents = normalized;
	stats.stringsChanged += 1;
}

function finalizeSchemaDescriptions(node, stats) {
	if (!node || typeof node !== 'object') return;
	finalizeStringProperty(node, 'description', stats);
	finalizeStringProperty(node, 'markdownDescription', stats);
	finalizeStringProperty(node, 'deprecationMessage', stats);
	finalizeStringProperty(node, 'markdownDeprecationMessage', stats);
	finalizeStringArrayProperty(node, 'enumDescriptions', stats);
	finalizeStringArrayProperty(node, 'markdownEnumDescriptions', stats);

	for (const value of Object.values(node)) {
		if (Array.isArray(value)) {
			for (const item of value) finalizeSchemaDescriptions(item, stats);
		} else if (value && typeof value === 'object') {
			finalizeSchemaDescriptions(value, stats);
		}
	}
}

function finalizePackageJson(pkg, stats) {
	finalizeStringProperty(pkg, 'displayName', stats);
	finalizeStringProperty(pkg, 'description', stats);
	for (const badge of pkg.badges ?? []) finalizeStringProperty(badge, 'description', stats);

	const contributes = pkg.contributes ?? {};
	for (const provider of contributes.mcpServerDefinitionProviders ?? []) finalizeStringProperty(provider, 'label', stats);

	const configurations = Array.isArray(contributes.configuration)
		? contributes.configuration
		: contributes.configuration
			? [contributes.configuration]
			: [];
	for (const section of configurations) {
		finalizeStringProperty(section, 'title', stats);
		for (const [key, property] of Object.entries(section.properties ?? {})) {
			finalizeSchemaDescriptions(property, stats);
			applyConfigurationDescriptionOverride(key, property, stats);
		}
	}

	for (const command of contributes.commands ?? []) {
		finalizeStringProperty(command, 'title', stats);
		finalizeStringProperty(command, 'shortTitle', stats);
		finalizeStringProperty(command, 'category', stats);
		finalizeStringProperty(command, 'tooltip', stats);
		applyCommandTitleOverride(command, stats);
	}

	for (const submenu of contributes.submenus ?? []) finalizeStringProperty(submenu, 'label', stats);
	for (const color of contributes.colors ?? []) finalizeStringProperty(color, 'description', stats);
	for (const icon of Object.values(contributes.icons ?? {})) finalizeStringProperty(icon, 'description', stats);
	for (const editor of contributes.customEditors ?? []) finalizeStringProperty(editor, 'displayName', stats);
	for (const containers of Object.values(contributes.viewsContainers ?? {})) {
		for (const container of containers) finalizeStringProperty(container, 'title', stats);
	}
	for (const views of Object.values(contributes.views ?? {})) {
		for (const view of views) {
			finalizeStringProperty(view, 'name', stats);
			finalizeStringProperty(view, 'contextualTitle', stats);
			applyViewNameOverride(view, stats);
		}
	}
	for (const welcome of contributes.viewsWelcome ?? []) {
		finalizeStringProperty(welcome, 'contents', stats);
		applyViewsWelcomeOverride(welcome, stats);
	}
	for (const walkthrough of contributes.walkthroughs ?? []) {
		finalizeStringProperty(walkthrough, 'title', stats);
		finalizeStringProperty(walkthrough, 'description', stats);
		for (const step of walkthrough.steps ?? []) {
			finalizeStringProperty(step, 'title', stats);
			finalizeStringProperty(step, 'description', stats);
		}
	}
}

function localizePackageJson() {
	const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
	const stats = { stringsChanged: 0 };

	localizeStringProperty(pkg, 'displayName', stats);
	localizeStringProperty(pkg, 'description', stats);
	for (const badge of pkg.badges ?? []) {
		localizeStringProperty(badge, 'description', stats);
	}

	const contributes = pkg.contributes ?? {};
	for (const provider of contributes.mcpServerDefinitionProviders ?? []) {
		localizeStringProperty(provider, 'label', stats);
	}

	const configurations = Array.isArray(contributes.configuration)
		? contributes.configuration
		: contributes.configuration
			? [contributes.configuration]
			: [];
	for (const section of configurations) {
		localizeStringProperty(section, 'title', stats);
		for (const property of Object.values(section.properties ?? {})) {
			localizeSchemaDescriptions(property, stats);
		}
	}

	for (const command of contributes.commands ?? []) {
		localizeStringProperty(command, 'title', stats);
		localizeStringProperty(command, 'shortTitle', stats);
		localizeStringProperty(command, 'category', stats);
		localizeStringProperty(command, 'tooltip', stats);
	}

	for (const submenu of contributes.submenus ?? []) {
		localizeStringProperty(submenu, 'label', stats);
	}

	for (const color of contributes.colors ?? []) {
		localizeStringProperty(color, 'description', stats);
	}

	for (const editor of contributes.customEditors ?? []) {
		localizeStringProperty(editor, 'displayName', stats);
	}

	for (const containers of Object.values(contributes.viewsContainers ?? {})) {
		for (const container of containers) {
			localizeStringProperty(container, 'title', stats);
		}
	}

	for (const views of Object.values(contributes.views ?? {})) {
		for (const view of views) {
			localizeStringProperty(view, 'name', stats);
			localizeStringProperty(view, 'contextualTitle', stats);
			applyViewNameOverride(view, stats);
		}
	}

	for (const welcome of contributes.viewsWelcome ?? []) {
		localizeStringProperty(welcome, 'contents', stats);
	}

	for (const walkthrough of contributes.walkthroughs ?? []) {
		localizeStringProperty(walkthrough, 'title', stats);
		localizeStringProperty(walkthrough, 'description', stats);
		for (const step of walkthrough.steps ?? []) {
			localizeStringProperty(step, 'title', stats);
			localizeStringProperty(step, 'description', stats);
			applyWalkthroughStepOverride(step, stats);
		}
	}

	finalizePackageJson(pkg, stats);
	fs.writeFileSync(packagePath, `${JSON.stringify(pkg, null, '\t')}\n`);
	return stats;
}

function replaceExact(value, source, target, stats) {
	const next = value.replaceAll(source, target);
	if (next !== value) stats.stringsChanged += 1;
	return next;
}

function localizeVsixManifest() {
	const stats = { stringsChanged: 0 };
	let manifest = fs.readFileSync(vsixManifestPath, 'utf8');
	manifest = replaceExact(
		manifest,
		'<DisplayName>GitLens — Git supercharged</DisplayName>',
		'<DisplayName>GitLens — 增强你的 Git 体验</DisplayName>',
		stats,
	);
	manifest = replaceExact(
		manifest,
		'<Description xml:space="preserve">Supercharge Git within VS Code — Visualize code authorship at a glance via Git blame annotations and CodeLens, seamlessly navigate and explore Git repositories, gain valuable insights via rich visualizations and powerful comparison commands, and so much more</Description>',
		'<Description xml:space="preserve">在 VS Code 中增强 Git 体验 — 通过 Git blame 标注和 CodeLens 一眼查看代码作者，顺畅浏览和探索 Git 仓库，并通过丰富的可视化与强大的比较命令获取深入洞察。</Description>',
		stats,
	);
	manifest = replaceExact(
		manifest,
		'Description="Join us in the #gitlens channel"',
		'Description="加入我们的 #gitlens 频道"',
		stats,
	);
	fs.writeFileSync(vsixManifestPath, manifest);
	return stats;
}

function localizeSchemaDescriptions(node, stats) {
	if (!node || typeof node !== 'object') return;
	localizeStringProperty(node, 'description', stats);
	localizeStringProperty(node, 'markdownDescription', stats);
	localizeStringProperty(node, 'deprecationMessage', stats);
	localizeStringProperty(node, 'markdownDeprecationMessage', stats);
	localizeStringArrayProperty(node, 'enumDescriptions', stats);
	localizeStringArrayProperty(node, 'markdownEnumDescriptions', stats);

	for (const value of Object.values(node)) {
		if (Array.isArray(value)) {
			for (const item of value) localizeSchemaDescriptions(item, stats);
		} else if (value && typeof value === 'object') {
			localizeSchemaDescriptions(value, stats);
		}
	}
}

const walkthroughStepOverrides = {
	'get-started-community': {
		title: '欢迎使用 GitLens：解锁仓库的完整故事',
		description:
			'Community 版本可以让你：\n\n- 内联查看 Blame 标注和提交详情\n- 浏览任意仓库的文件修订历史\n\n升级到 **GitLens Pro**（免费试用 14 天），即可在上述功能之外，使用直接内置于 VS Code 的高级可视化、协作和 AI 工具。\n\n$(sparkle) Pro 让你完整使用：\n\n**- 提交图：** 可视化每个分支和提交的关系\n**- 可视化文件历史：** 通过图表查看文件何时发生了哪些变化\n**- 启动台与 Worktrees：** 在一个中心管理 PR 和分支\n**- GitKraken AI：** 为你撰写提交、PR 和变更日志。\n\n[开始使用 GitLens Pro](command:gitlens.walkthrough.plus.signUp)\n\n或[登录](command:gitlens.walkthrough.plus.login)',
	},
	'welcome-in-trial': {
		title: '欢迎使用 GitLens Pro',
		description:
			'感谢开始试用 **GitLens Pro**。\n\n完成此演练，体验增强的 PR 评审工具、更深入的代码历史可视化，以及可帮助提升生产力的协作流程。\n\n[继续演练](command:gitlens.walkthrough.openWalkthrough)\n\n试用结束后，你将回到 **GitLens Community**；仍可继续使用编辑器内 Blame 标注、悬停提示、CodeLens 等功能。立即[升级到 GitLens Pro](command:gitlens.walkthrough.plus.upgrade)，继续享受完整体验。\n\n[升级到 GitLens Pro](command:gitlens.walkthrough.plus.upgrade)',
	},
	'welcome-in-trial-expired': {
		title: '充分发挥 GitLens 的价值',
		description:
			'感谢安装 GitLens 并试用 GitLens Pro。\n\n你现在使用的是 **GitLens Community** 版本。\n借助编辑器内 Blame 标注、悬停提示、CodeLens 等功能，你可以跟踪代码更改并查看是谁做出的更改，而且完全免费。\n\n了解更多 [GitLens Community 与 Pro 的区别](command:gitlens.walkthrough.openCommunityVsPro)。\n\n**使用 GitLens Pro 解锁更强工具**\n\n[升级到 GitLens Pro](command:gitlens.walkthrough.plus.upgrade)\n\n使用 GitLens Pro，你可以加速 PR 评审、深入可视化代码历史，并增强团队协作。它是优化 VS Code 工作流的理想升级。',
	},
	'welcome-in-trial-expired-eligible': {
		title: '充分发挥 GitLens 的价值',
		description:
			'感谢安装 GitLens 并试用 GitLens Pro。\n\n你正在使用 **GitLens Community** 版本。\n借助编辑器内 Blame 标注、悬停提示、CodeLens 等功能，你可以跟踪代码更改并查看是谁做出的更改，而且完全免费。\n\n**解锁更多强大工具 — 再次免费试用 GitLens Pro** 14 天。\n\n[重新激活 GitLens Pro 试用](command:gitlens.walkthrough.plus.reactivate)\n\n使用 GitLens Pro，你可以加速 PR 评审、深入可视化代码历史，并增强团队协作。它是优化 VS Code 工作流的理想升级。',
	},
	'welcome-paid': {
		title: '了解 GitLens Pro 的优势',
		description:
			'作为 **GitLens Pro** 用户，你可以使用强大的工具来加速 PR 评审、获得更深入的代码历史可视化，并简化团队协作。\n\n[继续演练](command:gitlens.walkthrough.openWalkthrough)\n\n为了充分发挥 **GitLens Pro** 体验，请完成演练，并访问帮助中心查看深入指南。\n\n**[在帮助中心了解更多](command:gitlens.walkthrough.openHelpCenter)**',
	},
	'visualize-code-history': {
		title: '提交图：你的指挥中心',
		description:
			'**提交图**将你的开发流程与智能体（Agent）工作流融合在一起。并行推进工作——管理多个活动的 Worktree、编排并发智能体，并在不切换上下文的情况下完成整个 Git 生命周期。\n\n- **完成完整工作流：** 评审更改、暂存文件、组织提交、解决冲突——并获得拉取、推送或起草 PR 等下一步引导。\n- **编排智能体：** 直接从提交图启动、监控智能体并与之交互，内联批准权限和评审执行计划。\n- **AI 组织与评审：** 将更改重组为干净、可评审的提交，并通过带严重程度标记的评审尽早发现问题，还可以委托给智能体处理。\n- **无可比拟的 Git 上下文：** 通过可搜索、按颜色区分的提交时间线浏览复杂仓库，即刻理解分支关系、作者分布和提交序列。\n\n[探索你的提交图](command:gitlens.walkthrough.showGraph)',
	},
	'ai-features': {
		title: '更聪明地提交，而不是更辛苦',
		description:
			'让 **GitKraken AI** 把你的更改整理成清晰、有条理的提交——让评审更高效，并保持提交历史整洁。\n\n**- 自动组织提交：** 在交互式编辑器中即时生成一系列带描述性摘要的提交\n**- 解释提交和分支：** 无需埋头比对 diff 即可理解更改\n**- 创建 PR 标题和描述：** 为评审者每次评审节省 10 分钟以上\n\n一切尽在掌控——提交前可以评审和编辑。\n体验在不离开 VS Code 的情况下轻松记录工作。\n\n[使用 AI 组织提交](command:gitlens.walkthrough.showComposer)',
	},
	'git-blame': {
		title: '通过内联 Blame 了解每一行代码背后的原因',
		description:
			'无需离开编辑器，即可查看谁在何时因为什么原因修改了某一行。将鼠标悬停在 Blame 标注上即可：\n\n- 查看文件的历史修订\n\n- 打开相关 PR\n\n- 跳转到提交图中的提交\n\n- 与先前版本比较\n\n[配置内联 Blame](command:gitlens.showSettingsPage!current-line)',
	},
	'accelerate-pr-reviews': {
		title: '保持心流，在一个地方管理所有工作',
		description:
			'借助启动台与 Worktrees，一切尽在指尖。\n\n**- 启动台：** 在一个中心查看并管理所有 PR 和分支\n\n**- Worktrees：** 在多个分支上并行编码、测试和评审\n\n**- 集成：** 关联来自 GitHub、GitLab、Jira、Azure DevOps 等服务的 PR 和议题\n\n保持心流，更快交付，不错过任何重要事项。\n\n[打开启动台](command:gitlens.walkthrough.showLaunchpad)',
	},
};

function applyWalkthroughStepOverride(step, stats) {
	const override = walkthroughStepOverrides[step.id];
	if (!override) return;
	for (const key of ['title', 'description']) {
		if (step[key] !== override[key]) {
			step[key] = override[key];
			stats.stringsChanged += 1;
		}
	}
}

const walkthroughTranslations = {
	'walkthroughs/welcome/accelerate-pr-reviews.md': `<a href="command:gitlens.walkthrough.openAcceleratePrReviews" title="观看“加速 PR 评审”教程视频">
  <img src="./thumbnails/launchpad.webp" alt="观看“加速 PR 评审”教程视频"/>
</a>
`,
	'walkthroughs/welcome/ai-features.md': `<img src="./thumbnails/ai-features.webp" alt="在主页视图中生成提交消息"/>
`,
	'walkthroughs/welcome/get-started-community.md': `<a href="command:gitlens.walkthrough.openCommunityVsPro" title="了解 GitLens Community 与 Pro 的区别">
  <img src="thumbnails/welcome.webp" alt="了解 GitLens Community 与 Pro 的区别" />
</a>
`,
	'walkthroughs/welcome/git-blame.md': `<img src="./thumbnails/git-blame.webp" alt="内联 Blame 标注"/>
`,
	'walkthroughs/welcome/visualize-code-history.md': `<a href="command:gitlens.walkthrough.openInteractiveCodeHistory" title="观看可视化代码历史视频">
  <img src="./thumbnails/commit-graph.webp" alt="观看可视化代码历史视频"/>
</a>
`,
	'walkthroughs/welcome/welcome-in-trial-expired-eligible.md': `### GitLens：探索你的选择

<a href="command:gitlens.walkthrough.openCommunityVsPro" title="了解 GitLens Community 与 Pro 的区别">
  <img src="thumbnails/welcome.webp" alt="了解 GitLens Community 与 Pro 的区别" />
</a>

加速 PR 评审，通过可视化获得可执行的代码洞察，并简化协作，从而增强你的 Git 和 VS Code 体验。使用 GitLens Pro 的强大工作流，提升你和团队的生产力。

[重新激活 GitLens Pro 试用](command:gitlens.walkthrough.plus.reactivate)，免费再体验 14 天的所有 Pro 新功能。
`,
	'walkthroughs/welcome/welcome-in-trial-expired.md': `### GitLens：探索你的选择

<a href="command:gitlens.walkthrough.openCommunityVsPro" title="了解 GitLens Community 与 Pro 的区别">
  <img src="thumbnails/welcome.webp" alt="了解 GitLens Community 与 Pro 的区别" />
</a>

加速 PR 评审，通过可视化获得可执行的代码洞察，并简化协作，从而增强你的 Git 和 VS Code 体验。使用 GitLens Pro 的强大工作流，提升你和团队的生产力。

立即[升级到 GitLens Pro](command:gitlens.walkthrough.plus.upgrade)。包含对 [GitKraken DevEx 平台](command:gitlens.walkthrough.openDevExPlatform)的访问权限，在 IDE、桌面端、浏览器和终端等任何工作位置释放强大的 Git 可视化和生产力能力。
`,
	'walkthroughs/welcome/welcome-in-trial.md': `### 了解 GitLens Pro 的优势

<a href="command:gitlens.walkthrough.openCommunityVsPro" title="了解 GitLens Community 与 Pro 的区别">
  <img src="thumbnails/welcome.webp" alt="了解 GitLens Community 与 Pro 的区别" />
</a>

加速 PR 评审，通过可视化获得可执行的代码洞察，并简化协作，从而增强你的 Git 和 VS Code 体验。使用 GitLens Pro 的强大工作流，提升你和团队的生产力。
`,
	'walkthroughs/welcome/welcome-paid.md': `### 了解 GitLens Pro 的优势

<img src="thumbnails/discover-pro.webp" alt="GitLens Pro - GitLens Pro 功能列表" />

你还可以访问 [GitKraken DevEx 平台](command:gitlens.walkthrough.openDevExPlatform)，在 IDE、桌面端、浏览器和终端等任何工作位置释放强大的 Git 可视化和生产力能力。
`,
};

function localizeWalkthroughMarkdown() {
	let filesChanged = 0;
	for (const [relativePath, content] of Object.entries(walkthroughTranslations)) {
		fs.writeFileSync(path.join(extensionRoot, relativePath), normalizePreservedTerms(content));
		filesChanged += 1;
	}
	return filesChanged;
}

function localizeReadme() {
	const readmePath = path.join(extensionRoot, 'readme.md');
	const content = `# GitLens — 在 VS Code 中增强 Git 体验

> GitLens 可以帮助你在 VS Code 中更好地理解、编写和评审代码：查看 Blame 标注、CodeLens、提交图、文件历史、PR 工作流、集成和 AI 辅助能力。

GitLens 是由 GitKraken 构建并维护的 VS Code 扩展，面向希望在编辑器中理解代码历史、追踪作者信息、管理分支与 PR、提升协作效率的开发者。本地化版本已将安装元数据、命令、设置说明、视图、欢迎页、walkthrough、README、changelog 以及可安全替换的运行时 UI 文案改为简体中文。GitLens、Git、GitHub、GitLab、Bitbucket、Azure DevOps、Jira、VS Code、CodeLens、Blame、Worktrees、PR、AI 等技术或产品名称保持原样。

## 快速开始

安装此 VSIX 后，可以从命令面板搜索 GitLens，打开 GitLens 主页、提交图、文件历史、行历史、仓库视图、启动台、Cloud Patches 等功能。

常用入口：

- **GitLens 主页**：在一个视图中查看当前工作、最近分支、议题和 PR。
- **提交图**：浏览提交历史、分支、标签、远程分支，并执行比较、变基、合并等操作。
- **Blame 与 CodeLens**：在编辑器中查看行级作者、最近提交、作者统计和变更上下文。
- **文件历史与行历史**：跟踪文件或选中行随时间的变化。
- **搜索与比较**：按分支、提交、文件或 Worktree 进行比较。
- **启动台**：整理 PR，发现阻塞点并处理评审任务。
- **Cloud Patches**：在正式提交或创建 PR 前共享变更。
- **AI 功能**：生成提交消息、解释更改、生成 PR 描述和变更日志。

## 版本与授权

此包基于 GitLens ${GITLENS_VERSION} 的官方 VSIX 解包后本地化。原始 LICENSE.txt、LICENSE.plus 和 ThirdPartyNotices.txt 保留在包内，便于查看官方许可与第三方声明。

## 本地化范围

- VSIX 安装元数据
- VS Code 扩展清单
- 命令标题、分类、短标题和工具提示
- 设置分组、设置说明、枚举说明和弃用说明
- 视图、视图容器、子菜单、颜色说明、自定义编辑器名称
- welcome / walkthrough 内容
- README 与 changelog
- 可安全替换的运行时 UI 文案

## 保留的英文或拉丁字符

为避免破坏扩展功能，下列内容不会翻译：

- 命令 ID、配置 key、上下文 key、默认值、枚举值
- URL、文件路径、协议名、CSS 类名、HTML 属性名
- 遥测字段、内部符号、依赖库和框架内部文本
- 许可证、第三方声明和法务文本
- GitLens、Git、GitHub、GitLab、Bitbucket、Azure DevOps、Jira、VS Code、CodeLens、Blame、Worktrees、PR、AI 等技术或产品名称
`;
	fs.writeFileSync(readmePath, normalizePreservedTerms(content));
	return true;
}

function localizeChangelog() {
	const changelogPath = path.join(extensionRoot, 'changelog.md');
	const content = `# GitLens ${GITLENS_VERSION} 更新日志

此本地化包基于 GitLens ${GITLENS_VERSION} 官方版本制作，重点保留扩展功能并将用户可见文案改为简体中文。

## 本地化变更

- 安装元数据已汉化，包括扩展显示名、描述和徽章说明。
- VS Code 扩展清单已汉化，包括命令、设置、视图、菜单、欢迎页和 walkthrough。
- README 与 changelog 已改为中文内容。
- 可安全替换的运行时 UI 文案已进行中文替换。
- 原始 VSIX 文件保持不变，便于回滚和比对。

## 兼容性说明

- 命令 ID、配置 key、上下文 key、默认值、枚举值、URL、路径、遥测字段、内部符号和代码协议保持不变。
- GitLens、Git、GitHub、GitLab、Bitbucket、Azure DevOps、Jira、VS Code、CodeLens、Blame、Worktrees、PR、AI 等技术或产品名称保持原样。
- 许可证和第三方声明保留官方原文。

## 验证摘要

- 本地化后的 extension/package.json 可以正常解析。
- 本地化后的 VSIX 元数据包含中文显示名和中文描述。
- 命令数、配置项数、菜单项数、视图数、walkthrough 数与原始包保持一致。
- command ID、configuration key、view ID 和 walkthrough ID 与原始包保持一致。
`;
	fs.writeFileSync(changelogPath, normalizePreservedTerms(content));
	return true;
}

function localizeLocalizationNotes() {
	const notesPath = path.join(extensionRoot, 'LOCALIZATION_NOTES.zh-CN.md');
	const content = `# GitLens ${GITLENS_VERSION} 简体中文本地化说明

本包基于 \`gitlens-${GITLENS_VERSION}.vsix\` 解包后直接本地化，原始 VSIX 未修改。

## 已本地化

- VSIX 安装元数据中的扩展名称、描述和徽章说明
- VS Code 扩展清单中的显示名、描述、命令、分类、短标题和工具提示
- 设置分组标题、设置说明、枚举说明、Markdown 说明和弃用说明
- 视图、视图容器、子菜单、颜色说明、自定义编辑器名称、欢迎内容和 walkthrough 文案
- \`walkthroughs/welcome/*.md\`
- \`readme.md\` 和 \`changelog.md\` 已改为中文说明内容
- \`dist/*.js\` 与 \`dist/webviews/*.js\` 中明确可见且可安全替换的高频运行时 UI 文案

## 保留英文

- 命令 ID、配置 key、上下文 key、默认值、枚举值、路径、URL、协议名、CSS 类名、HTML 属性名、遥测名和内部符号
- 依赖库、框架内部文本、打包运行时代码中无法确认安全性的英文文本
- \`LICENSE*\`、\`ThirdPartyNotices.txt\` 和其他法务/第三方声明
- GitLens、Git、GitHub、GitLab、Bitbucket、Azure DevOps、Jira、VS Code、CodeLens、Blame、Worktrees、PR、AI 等技术或产品名称

保留这些内容是为了避免破坏扩展加载、命令绑定、配置兼容性或第三方许可文本。可见的“启动台”功能名按用户确认统一汉化；技术标识中的 \`launchpad\` 保持不变。
`;
	fs.writeFileSync(notesPath, normalizePreservedTerms(content));
	return true;
}

const runtimeLiteralTranslations = new Map(
	Object.entries({
		'Loading... \n\n---\n\n${i}': '正在加载...\n\n---\n\n${i}',
		'Loading...': '正在加载...',
		Loading: '正在加载',
		User: '用户',
		Workspace: '工作区',
		'No data': '无数据',
		'no data': '无数据',
		'Not supported': '不支持',
		'Method not supported.': '不支持该方法。',
		'Invalid format': '格式无效',
		'Please enter a valid URL': '请输入有效的 URL',
		'Color needs a value': '颜色需要一个值',
		'Error retrieving content': '获取内容时出错',
		'Unable to open compare': '无法打开比较',
		'Unable to open changes': '无法打开更改',
		'Unable to open file': '无法打开文件',
		'Unable to open repository': '无法打开仓库',
		'Unable to fetch': '无法抓取',
		'Unable to pull': '无法拉取',
		'Unable to push': '无法推送',
		'Unable to switch to reference': '无法切换到引用',
		'Unable to generate changelog': '无法生成变更日志',
		'Unable to find changes': '无法找到更改',
		'Unable to find commit': '无法找到提交',
		'Unable to find patch': '无法找到补丁',
		'Unable to create cloud patch': '无法创建 Cloud Patch',
		'Unable to find pull request to compare': '无法找到要比较的 PR',
		'Unable to find pull request to open changes': '无法找到要打开更改的 PR',
		'Unable to find pull request to open on remote': '无法找到要在远程打开的 PR',
		'Unable to find pull request to open details': '无法找到要打开详情的 PR',
		'Unable to create draft': '无法创建草稿',
		'Unable to apply patch': '无法应用补丁',
		'Operation was canceled': '操作已取消',
		'Patch applied successfully': '补丁已成功应用',
		'Patch applied with conflicts': '补丁已应用，但存在冲突',
		'Cloud Patch successfully created': 'Cloud Patch 已成功创建',
		'Cloud Patch successfully updated': 'Cloud Patch 已成功更新',
		'View Patch': '查看补丁',
		'Copy Link': '复制链接',
		'Select Collaborators': '选择协作者',
		'Choose collaborators to share this patch with': '选择要共享此补丁的协作者',
		'Choose Commit...': '选择提交...',
		'Search for Commit': '搜索提交',
		'Search commit messages to quickly find specific changes or features': '搜索提交消息，快速查找特定更改或功能',
		'Generate Changelog': '生成变更日志',
		'Choose a reference (branch, tag, etc) to generate a changelog for':
			'选择要为其生成变更日志的引用（分支、标签等）',
		'Generate Changelog • Select Base to Start From': '生成变更日志 • 选择起始基准',
		'Choose a base reference (branch, tag, etc) to generate the changelog from':
			'选择生成变更日志的基准引用（分支、标签等）',
		'Choose a Base Reference': '选择基准引用',
		'Choose a Head Reference': '选择头部引用',
		'Choose a reference (branch, tag, etc) as the base to view history from':
			'选择作为历史查看基准的引用（分支、标签等）',
		'Choose a reference (branch, tag, etc) as the head to view history for':
			'选择作为历史查看目标的引用（分支、标签等）',
		'No results found': '未找到结果',
		'Select a Branch': '选择分支',
		'No branch selected': '未选择分支',
		'Create Cloud Patch': '创建 Cloud Patch',
		'Cloud Patch Details': 'Cloud Patch 详情',
		'Cloud Suggestion': 'Cloud Suggestion',
		'Create Pull Request': '创建拉取请求',
		'Open Pull Request': '打开拉取请求',
		'Open Issue': '打开议题',
		'Create Pull Request on Remote': '在远程创建拉取请求',
		'Open Pull Request on Remote': '在远程打开拉取请求',
		'Open Issue on Remote': '在远程打开议题',
		'Start a Live Share Session': '启动 Live Share 会话',
		'Click to Switch GitLens Modes': '点击切换 GitLens 模式',
		'GitLens Current Line Blame': 'GitLens 当前行 Blame',
		'Blame Paused': 'Blame 已暂停',
		'Click to Copy Remote Commit URL': '点击复制远程提交 URL',
		'Click to Copy Remote File Revision URL': '点击复制远程文件修订 URL',
		'Click to Open Line Changes with Previous Revision': '点击打开与上一修订的行更改',
		'Click to Open Line Changes with Working File': '点击打开与工作区文件的行更改',
		'Click to Open Commit on Remote': '点击在远程打开提交',
		'Click to Open Revision on Remote': '点击在远程打开修订',
		'Click to Reveal Commit in the Side Bar': '点击在侧边栏显示提交',
		'Click to Search for Commit': '点击搜索提交',
		'Click to Show Commit': '点击显示提交',
		'Click to Show Commit (file)': '点击显示提交（文件）',
		'Click to Show Branch History': '点击显示分支历史',
		'Click to Show File History': '点击显示文件历史',
		'Click to Toggle Git CodeLens': '点击切换 Git CodeLens',
		'Click to Toggle File Blame': '点击切换文件 Blame',
		'Click to Toggle File Changes': '点击切换文件更改',
		'Click to Toggle File Heatmap': '点击切换文件热力图',
		'Uncommitted changes': '未提交更改',
		'Commit Graph Inspect': '提交图检查',
		'Commit Graph Inspect View': '提交图检查视图',
		'Visual File History': '可视化文件历史',
		'Visual History': '可视化历史',
		'Commit Details': '提交详情',
		'Stash Details': '贮藏详情',
		'Uncommitted Changes': '未提交更改',
		'Inspect Commit Details': '检查提交详情',
		Explain: '解释',
		'Explain Changes': '解释更改',
		'Explain Working Changes': '解释工作区更改',
		'Explain Changes in this Commit': '解释此提交中的更改',
		'Explain Changes in this Stash': '解释此贮藏中的更改',
		'Learn About Autolinks': '了解自动链接',
		'Show Branches & Tags': '显示分支和标签',
		'Open file': '打开文件',
		'Open File': '打开文件',
		'Open Files': '打开文件',
		'Open All Changes': '打开所有更改',
		'Open Changes with Working File': '打开与工作区文件的更改',
		'Open on remote': '在远程打开',
		'Open Commit on Remote': '在远程打开提交',
		'Copy Link to Commit': '复制提交链接',
		'Push to Commit...': '推送到提交...',
		'Revert Commit...': '还原提交...',
		'Cherry Pick Commit...': '拣选提交...',
		'Switch to Commit...': '切换到提交...',
		'Create Branch at Commit...': '基于提交创建分支...',
		'Create Tag at Commit...': '基于提交创建标签...',
		'Create Branch 于 Commit...': '基于提交创建分支...',
		'Create Tag 于 Commit...': '基于提交创建标签...',
		'Copy SHA': '复制 SHA',
		'Copy Message': '复制消息',
		'URL copied to the clipboard': 'URL 已复制到剪贴板',
		'Commit SHA copied to the clipboard': '提交 SHA 已复制到剪贴板',
		'Commit Message copied to the clipboard': '提交消息已复制到剪贴板',
		'Stash Message copied to the clipboard': '贮藏消息已复制到剪贴板',
		'Click to see all changed files': '点击查看所有更改的文件',
		'No files changed': '没有文件更改',
		'Stage changes': '暂存更改',
		'Unstage changes': '取消暂存更改',
		'Incoming Changes': '传入更改',
		'Outgoing Changes': '传出更改',
		'Incoming / Outgoing': '传入 / 传出',
		'Code Suggestions': '代码建议',
		'Code Suggestions are a Preview feature and require an account.':
			'代码建议是预览功能，需要登录账号。',
		'View Code Suggestions': '查看代码建议',
		'Code Suggestion successfully created': '代码建议已成功创建',
		'Unable to create draft': '无法创建草稿',
		'View Options': '视图选项',
		'View All Branches': '查看所有分支',
		Timeframe: '时间范围',
		'Slice By': '切分方式',
		'All Branches': '所有分支',
		'All Repositories': '所有仓库',
		'Current Branch': '当前分支',
		'Smart Branches': '智能分支',
		'Favorited Branches': '收藏分支',
		'Hidden Branches / Tags': '隐藏的分支 / 标签',
		'Shows only relevant branches': '仅显示相关分支',
		'Shows only branches that have been starred as favorites': '仅显示已标星收藏的分支',
		'Includes the current branch, its upstream, and its base or target branch': '包括当前分支、其上游分支，以及其基准或目标分支',
		'Also includes the current branch': '也包括当前分支',
		'Show All': '显示全部',
		'Change Reference...': '更改引用...',
		'Showing All Branches': '正在显示所有分支',
		'1 week': '1 周',
		'1 day': '1 天',
		'1 month': '1 个月',
		'3 months': '3 个月',
		'6 months': '6 个月',
		'9 months': '9 个月',
		'1 year': '1 年',
		'2 years': '2 年',
		'4 years': '4 年',
		'Full history': '完整历史',
		'Up to 1wk ago': '截至 1 周前',
		'Up to 1mo ago': '截至 1 个月前',
		'Up to 3mo ago': '截至 3 个月前',
		'Up to 6mo ago': '截至 6 个月前',
		'Up to 9mo ago': '截至 9 个月前',
		'Up to 1yr ago': '截至 1 年前',
		'Up to 2yr ago': '截至 2 年前',
		'Up to 4yr ago': '截至 4 年前',
		'All time': '全部时间',
		'Hold shift to compare with working tree': '按住 Shift 与 Working Tree 比较',
		Copy: '复制',
		Copied: '已复制',
		'Unable to Copy': '无法复制',
		'Nothing to Copy': '没有可复制内容',
		'Copy Path': '复制路径',
		Additions: '新增',
		Deletions: '删除',
		'Lines changed': '变更行数',
		'Open in Editor': '在编辑器中打开',
		'Try the Graph Minimap': '试试提交图小地图',
		'No uncommitted changes': '没有未提交更改',
		'Please close this tab and try again': '请关闭此标签页后重试',
		'Checking account...': '正在检查账号...',
		'Checking plan...': '正在检查方案...',
		'Matching link type...': '正在匹配链接类型...',
		'Finding a matching repository...': '正在查找匹配的仓库...',
		'Adding repository...': '正在添加仓库...',
		'Finding a matching remote...': '正在查找匹配的远程...',
		'Adding remote...': '正在添加远程...',
		'finding a matching target...': '正在查找匹配的目标...',
		'Finding a matching target...': '正在查找匹配的目标...',
		'Opening repository...': '正在打开仓库...',
		'Missing Upstream': '缺少上游',
		'Up to Date': '已是最新',
		'Opened Worktree': '已打开工作树',
		'Default Remote': '默认远程',
		'Has Uncommitted Changes': '存在未提交更改',
		'Commit message for changes by ${o}': '${o} 的更改提交消息',
		'No commits found for the specified time period': '指定时间段内未找到提交',
		'There are no editors open that can provide file history information.': '没有打开可提供文件历史信息的编辑器。',
		'Choose File or Folder to Visualize...': '选择要可视化的文件或文件夹...',
		'Choose File / Folder...': '选择文件 / 文件夹...',
		'Visualize Repository History': '可视化仓库历史',
		'Visualize Folder History': '可视化文件夹历史',
		'Graph Filtering': '提交图筛选',
		'Graph Filters': '提交图筛选器',
		'Only follow the first parent of merge commits to provide a more linear history':
			'仅跟随合并提交的第一个父提交，以提供更线性的历史',
		'Simplify Merge History': '简化合并历史',
		'Hide Remote-only Branches': '隐藏仅远程分支',
		'Hide Stashes': '隐藏贮藏',
		'Hide Tags': '隐藏标签',
		'Dim Merge Commit Rows': '淡化合并提交行',
		'Toggle Minimap': '切换小地图',
		'Minimap Options': '小地图选项',
		Minimap: '小地图',
		'Lines Changed': '变更行数',
		Markers: '标记',
		'Local Branches': '本地分支',
		'Remote Branches': '远程分支',
		'Pull Requests': '拉取请求',
		'Fetch Merge Target': '抓取合并目标',
		'Fetch All': '全部抓取',
		'Visualize Repo History': '可视化仓库历史',
		'Fetch from': '从以下位置抓取',
		'Last fetched': '上次抓取',
		'Line History': '行历史',
		'File History': '文件历史',
		'There are no editors open that can provide line history information.':
			'没有打开可提供行历史信息的编辑器。',
		'There was no selection provided for line history.': '未提供用于行历史的选区。',
		'Change Line History Base': '更改行历史基准',
		'Choose a reference to set as the new base': '选择要设为新基准的引用',
		'File Blame annotations': '文件 Blame 标注',
		'File Changes annotations': '文件更改标注',
		'File Heatmap annotations': '文件热力图标注',
		'Inline blame annotations': '内联 Blame 标注',
		'Status bar blame annotations': '状态栏 Blame 标注',
		'Current Line Hovers': '当前行悬停提示',
		'Revision Navigation': '修订导航',
		'Worktrees view': 'Worktrees 视图',
		'Watch the GitLens Getting Started video': '观看 GitLens 入门视频',
		'Watch the Interactive Code History video': '观看交互式代码历史视频',
		'Watch the Accelerate PR Reviews video': '观看加速 PR 评审视频',
		'Watch the Streamline Collaboration video': '观看简化协作视频',
		'Watch the Start Integrations video': '观看开始集成视频',
		'Watch the Home View video': '观看主页视图视频',
		'Getting Started': '快速开始',
		'Discover Powerful Workflows': '发现强大工作流',
		'More Features': '更多功能',
		'Support and Community': '支持与社区',
		Contributing: '贡献',
		Contributors: '贡献者',
		License: '许可证',
		'Home View - Your VS Code Workflow Hub': '主页视图 - 你的 VS Code 工作流中心',
		'Accelerate Your Workflow with AI': '使用 AI 加速工作流',
		'Community Features': 'Community 功能',
		'Pro Features': 'Pro 功能',
		'Interactive Code History': '交互式代码历史',
		'Blame, CodeLens, and Hovers': 'Blame、CodeLens 和悬停提示',
		'Inline and Status Bar Blame': '内联和状态栏 Blame',
		'Rich Hovers': '丰富悬停提示',
		'File Annotations': '文件标注',
		'Commit Graph': '提交图',
		'GitLens Home': 'GitLens 主页',
		'GitLens Launchpad': 'GitLens 启动台',
		Launchpad: '启动台',
		'focus on a pull request': '专注处理拉取请求',
		'Open Launchpad': '打开启动台',
		'Open in Launchpad': '在启动台中打开',
		'Open Launchpad View': '打开启动台视图',
		'Show Launchpad View': '显示启动台视图',
		'Launchpad View': '启动台视图',
		'Launchpad View Options': '启动台视图选项',
		'Learn about Launchpad': '了解启动台',
		'Toggle Launchpad Indicator': '切换启动台指示器',
		'All done! Take a vacation.': '全部完成！休息一下吧。',
		'Connect additional integrations to view their pull requests in Launchpad':
			'连接更多集成，以便在启动台中查看它们的拉取请求',
		'Connect additional integrations to Launchpad': '将更多集成连接到启动台',
		'Connect additional integrations to view and start work on their issues':
			'连接更多集成，以便查看并开始处理它们的议题',
		'Connect an integration to accelerate your PR reviews': '连接集成以加速 PR 评审',
		'Connect an integration to get started with': '连接集成以开始使用',
		'Manage integrations...': '管理集成...',
		'Manage your connected integrations': '管理已连接的集成',
		'Open in Commit Graph': '在提交图中打开',
		'Visualize Branch History': '可视化分支历史',
		'Switch to Branch...': '切换到分支...',
		'Open in Branches View': '在分支视图中打开',
		'Open Worktree': '打开 Worktree',
		'Open Worktree in New Window': '在新窗口中打开 Worktree',
		'Open in Worktrees View': '在 Worktrees 视图中打开',
		'Publish Branch': '发布分支',
		'Current work item': '当前工作项',
		'Associate Issue with Branch': '将议题关联到分支',
		'Start Work on an Issue': '开始处理议题',
		'Create New Branch': '创建新分支',
		'Connect to see PRs and Issue here': '连接后在此查看 PR 和议题',
		'Error loading summary': '加载摘要时出错',
		'No recent branches': '没有最近分支',
		'Rich details for commits and stashes are shown as you navigate:': '浏览时会显示提交和贮藏的丰富详情：',
		'lines in the text editor': '文本编辑器中的行',
		'Commits view': '提交视图',
		'Stashes view': '贮藏视图',
		'Alternatively, show your work-in-progress, or search for or choose a commit':
			'也可以显示当前 work-in-progress，或搜索/选择一个提交',
		Overview: '概览',
		'This stash is not currently visible in the Commit Graph.': '此贮藏当前未在提交图中显示。',
		'This commit is not currently visible in the Commit Graph.': '此提交当前未在提交图中显示。',
		'Accelerate PR Reviews': '加速 PR 评审',
		'Streamline Collaboration': '简化协作',
		'Cloud Patches': 'Cloud Patches',
		'Code Suggest': 'Code Suggest',
		'Remote Providers': '远程提供商',
		'Search and Compare': '搜索与比较',
		'Copy Remote Links': '复制远程链接',
		'Autolinks': '自动链接',
		'Switch to Pre-Release Version': '切换到预发布版本',
		'Write a review': '撰写评价',
		'For access to all Pro features:': '要访问所有 Pro 功能：',
		'Unlock this feature with GitLens Pro': '使用 GitLens Pro 解锁此功能',
		'Unlock this feature with an account and may require GitLens Pro in the future':
			'登录账号即可解锁此功能，将来可能需要 GitLens Pro',
		'May require GitLens Pro in the future': '将来可能需要 GitLens Pro',
		'Resend Email': '重新发送邮件',
		Back: '返回',
		Cancel: '取消',
		Close: '关闭',
		Reload: '重新加载',
		OK: '确定',
		'Load more': '加载更多',
		'Try again': '重试',
		'Try GitLens Pro': '试用 GitLens Pro',
		'Upgrade to Pro': '升级到 Pro',
		'Sign In': '登录',
		'Unable to load items': '无法加载项目',
		'You are all caught up!': '已全部处理完毕！',
		'No pull requests need your attention': '没有需要你关注的拉取请求',
		'Open Ready to Merge in Launchpad': '在启动台中打开可合并项',
		'Open Blocked in Launchpad': '在启动台中打开已阻塞项',
		'Open Follow-Up in Launchpad': '在启动台中打开需跟进项',
		'Open Needs Your Review in Launchpad': '在启动台中打开需要你评审的项',
		'Preview feature': '预览功能',
		'Pro feature': 'Pro 功能',
		'You must verify your email before you can access Pro features.': '你必须先验证邮箱，才能访问 Pro 功能。',
		'You must verify your email before you can continue.': '你必须先验证邮箱才能继续。',
		'Continue Preview': '继续预览',
		'Try Commit Search': '试用提交搜索',
		'Conflict Detection Unavailable': '冲突检测不可用',
		'No commits to rebase': '没有可变基的提交',
		'GitLens Interactive Rebase': 'GitLens 交互式变基',
		Accept: '接受',
		Reject: '拒绝',
		'Apply Patch': '应用补丁',
		'Apply Patch Options...': '应用补丁选项...',
		'Apply to a Branch': '应用到分支',
		'Share Patch': '共享补丁',
		Share: '共享',
		'Open on gitkraken.dev': '在 gitkraken.dev 打开',
		'Generating Commits': '正在生成提交',
		'Generating Commits...': '正在生成提交...',
		'Commits are being generated.': '正在生成提交。',
		'Generating Commit Message': '正在生成提交消息',
		'A commit message is being generated.': '正在生成提交消息。',
		'Creating Commits': '正在创建提交',
		'Commits Generated': '提交已生成',
		'Exit Composer': '退出 Composer',
		'Composer actions': 'Composer 操作',
		Undo: '撤销',
		Redo: '重做',
		'Undo last action': '撤销上一个操作',
		'Redo last undone action': '重做上一个撤销的操作',
		'Reset to initial state': '重置为初始状态',
		'AI features are disabled': 'AI 功能已禁用',
		'AI features are disabled by your GitKraken admin': 'AI 功能已被你的 GitKraken 管理员禁用',
		'AI features are disabled in your settings': 'AI 功能已在你的设置中禁用',
		Prefix: '前缀',
		// Step 3: 补充高优先级 runtime 弹窗/QuickPick/InputBox 字符串
		'Are you sure you want to delete this workspace? This cannot be undone.': '确定要删除此工作区吗？此操作无法撤销。',
		'Choose worktree to open': '选择要打开的 Worktree',
		'Choose worktrees to delete': '选择要删除的 Worktrees',
		'Enter stash message': '输入贮藏消息',
		'Enter new stash message': '输入新贮藏消息',
		'Choose a pull request or paste a pull request URL to act on': '选择拉取请求或粘贴拉取请求 URL 以执行操作',
		'Enter a remote file url to open': '输入要打开的远程文件 URL',
		'Choose a branch or tag to show its commit history': '选择要显示其提交历史的分支或标签',
		'Your local changes would be overwritten by checkout': '签出操作将覆盖你的本地更改',
		'A merge is already in progress': '合并操作已在进行中',
		'Resolve the conflicts before continuing': '请在继续之前解决冲突',
		'Cannot delete the default worktree': '无法删除默认 Worktree',
		'Failed to create pull request': '创建拉取请求失败',
		'Failed to open pull request': '打开拉取请求失败',
		'Failed to open pull request details': '打开拉取请求详情失败',
		'as it hasn\'t been published to a remote': '因为它尚未推送到远程',
		'because it is not associated with a supported remote provider': '因为它未关联到受支持的远程提供商',
		'Cherry-pick failed': '拣选失败',
		'Rebase failed': '变基失败',
		'Merge failed': '合并失败',
		'Failed to apply stash': '应用贮藏失败',
		'Failed to delete stash': '删除贮藏失败',
		'Failed to fetch': '抓取失败',
		'Failed to pull': '拉取失败',
		'Failed to push': '推送失败',
		// Step 6: 补充提交图界面翻译（48条）
		'Filter Commits': '筛选提交',
		'Resume Search': '恢复搜索',
		'Stop Searching': '停止搜索',
		'Graph Commit Search': '提交图搜索',
		'Natural Language Search (AI Preview)': '自然语言搜索（AI 预览）',
		'Enter a search value': '输入搜索值',
		'Use Regular Expression': '使用正则表达式',
		'Match All': '全部匹配',
		'Show Results in Side Bar': '在侧边栏显示结果',
		'Add to Search': '添加到搜索',
		'Search navigation': '搜索导航',
		'Clear entry': '清除条目',
		'Switch Branch...': '切换分支...',
		'Jump to Branch': '跳转到分支',
		'Jump to Commit': '跳转到提交',
		'Jump to a specific commit using its SHA': '使用 SHA 跳转到特定提交',
		'Choose a branch or tag to filter by': '选择要筛选的分支或标签',
		'Choose a branch or tag…': '选择分支或标签…',
		'Choose a reference to jump to': '选择要跳转的引用',
		'Choose contributors to include commits from': '选择要包含提交的贡献者',
		'Choose two refs to compare': '选择两个引用进行比较',
		'Choose a comparison range…': '选择比较范围…',
		'Open in Rebase Editor': '在变基编辑器中打开',
		'Open Branch in Commit Graph': '在提交图中打开分支',
		'Open Commit in Commit Graph': '在提交图中打开提交',
		'Open Visual History': '打开可视化历史',
		'Open GitLens Home View': '打开 GitLens 主页视图',
		'Cherry picking': '拣选中',
		'Pending rebase of': '等待变基',
		'Resolve conflicts to continue cherry picking': '解决冲突以继续拣选',
		'Resolve conflicts to continue merging': '解决冲突以继续合并',
		'Resolve conflicts to continue rebasing': '解决冲突以继续变基',
		'Resolve conflicts to continue reverting': '解决冲突以继续还原',
		'No commits': '无提交',
		'No results found': '未找到结果',
		'No options selected': '未选择选项',
		'Branches Visibility': '分支可见性',
		'Favorited Branches': '收藏的分支',
		'Smart Branches': '智能分支',
		'Hide Remote-only Branches': '隐藏仅远程分支',
		'Hide Stashes': '隐藏贮藏',
		'Columns settings': '列设置',
		'Minimap Options': '小地图选项',
		'Toggle Minimap': '切换小地图',
		'Dim Merge Commit Rows': '淡化合并提交行',
		'Simplify Merge History': '简化合并历史',
		'Resize Panel': '调整面板大小',
		'Filter commits to only show stashes': '筛选提交仅显示贮藏',
		// Step 6.1: 补充截图中发现的列标题和下拉选项
		'BRANCH / TAG': '分支 / 标签',
		'COMMIT MESSAGE': '提交消息',
		'AUTHOR': '作者',
		'CHANGES': '更改',
		'All Branches': '所有分支',
		// Step 6.2: 补充截图中的搜索提示和说明文本
		'Search using filters': '使用筛选器搜索',
		"Describe what you're looking for and let AI build the query": '描述你要查找的内容，让 AI 构建查询',
		'Combine filters to build powerful searches, e.g. @me after:1.week.ago file:*.ts.': '组合筛选器构建强大搜索，例如 @me after:1.week.ago file:*.ts。',
		// Step 6.3: 补充截图中的分支、提示、列标题等
		'Create New Branch from': '从此创建新分支',
		'visualize the evolution of a repository, branch, folder, or file and identify when the most impactful changes were made and by whom': '可视化仓库、分支、文件夹或文件的演变，识别何时做出最具影响力的更改以及由谁完成',
		'COMMIT DATE / TIME': '提交日期 / 时间',
		'Work in progress': '进行中',
		'Pull with Rebase': '拉取并变基',
		'Pull and rebase': '拉取并变基',
		'Will pull': '将拉取',
		// Step 6.5: 全量检索后批量追加25条遗漏翻译
		'Filter by author to see contributions from specific team members': '按作者筛选以查看特定团队成员的贡献',
		'Filter by date range using absolute dates or relative times': '按日期范围筛选，使用绝对日期或相对时间',
		'Filter commits to only show commits pointed to by branches or tags': '筛选提交仅显示分支或标签指向的提交',
		'Filter to a specific branch or tag (solo), or compare ranges to see unique commits': '筛选到特定分支或标签（单独），或比较范围以查看唯一提交',
		'Filter to only show your own commits': '筛选仅显示你自己的提交',
		'Open Details': '打开详情',
		'Search by Author': '按作者搜索',
		'Search by Branch or Tag': '按分支或标签搜索',
		'Search by Comparison Range': '按比较范围搜索',
		'Search by File': '按文件搜索',
		'Search by Folder': '按文件夹搜索',
		'Search code changes to find when specific functions or patterns were modified': '搜索代码更改以查找特定函数或模式何时被修改',
		'Select a branch or tag to filter by': '选择要筛选的分支或标签',
		'Select a folder to filter by': '选择要筛选的文件夹',
		'Select one or more contributors to filter by': '选择一个或多个贡献者进行筛选',
		'Select one or more files to filter by': '选择一个或多个文件进行筛选',
		'Select two refs to compare (e.g. main..feature)': '选择两个引用进行比较（例如 main..feature）',
		'Show Conflicts': '显示冲突',
		'Show password': '显示密码',
		'Showing commits per day': '显示每日提交',
		'Showing lines changed per day': '显示每日更改行数',
		'Track file changes across history (supports glob patterns)': '跨历史跟踪文件更改（支持 glob 模式）',
		'enter branch name': '输入分支名称',
		'enter tag name': '输入标签名称',
		'matching commit': '匹配的提交',
		// Step 6.6: 批量追加 gitlens.js 高优先级翻译（批次1：30条）
		'Add Pull Request Remote...': '添加拉取请求远程...',
		'Add Worktree to Workspace': '添加 Worktree 到工作区',
		'Adding repositories to workspace failed: you do not have permission to delete this workspace': '添加仓库到工作区失败：你没有权限删除此工作区',
		'Apply Stash...': '应用贮藏...',
		'Autolinked Issues and Pull Requests': '自动链接的议题和拉取请求',
		'Autolinked Pull Request': '自动链接的拉取请求',
		'Cannot delete the default worktree.': '无法删除默认 worktree。',
		'Cannot delete worktree because it is the default working tree': '无法删除 worktree，因为它是默认 Working Tree',
		'Cannot get files for comparisons of a ref with working tree': '无法获取引用与 Working Tree 比较的文件',
		'Cannot pull a branch until it has been published': '分支发布前无法拉取',
		'Cannot pull a remote branch': '无法拉取远程分支',
		'Cannot push a remote branch': '无法推送远程分支',
		'Change Merge Target for a branch': '更改分支的合并目标',
		'Choose Worktree Folder': '选择 Worktree 文件夹',
		'Choose a Different Root Folder for this Worktree': '为此 Worktree 选择不同的根文件夹',
		'Choose a Pull Request...': '选择拉取请求...',
		'Choose a Specific Folder for this Worktree': '为此 Worktree 选择特定文件夹',
		'Choose a Stash...': '选择贮藏...',
		'Conflicts Detected': '检测到冲突',
		'Copy Changes to Worktree': '复制更改到 Worktree',
		'Copy Staged Changes to Worktree': '复制暂存更改到 Worktree',
		'Create Pull Request Details (Preview)': '创建拉取请求详情（预览）',
		'Create Pull Request...': '创建拉取请求...',
		'Create Worktree for Branch...': '为分支创建 Worktree...',
		'Create Worktree for Local Branch...': '为本地分支创建 Worktree...',
		'Create Worktree for New Local Branch...': '为新本地分支创建 Worktree...',
		'Create Worktree from Branch': '从分支创建 Worktree',
		'Create Worktree from Local Branch': '从本地分支创建 Worktree',
		'Create Worktree from New Branch': '从新分支创建 Worktree',
		'Create Worktree from New Local Branch': '从新本地分支创建 Worktree',
		// Step 6.7: 批量追加 gitlens.js 高优先级翻译（批次2：30条）
		'Add on Workspace (Window) Open': '工作区（窗口）打开时添加',
		'Clone Repository...': '克隆仓库...',
		'Delete Worktrees': '删除 Worktrees',
		'Deleted user': '已删除用户',
		'Directory Compare Working Tree With': '目录比较 Working Tree 与',
		'Directory Compare Working Tree with': '目录比较 Working Tree 与',
		"Don't Show Again": '不再显示',
		'Open All Changed Files': '打开所有更改的文件',
		'Open All Changes (difftool)': '打开所有更改（difftool）',
		'Open All Changes with Working Tree': '打开与 Working Tree 的所有更改',
		'Open Associated Pull Request': '打开关联的拉取请求',
		'Open Blame Prior to this Change': '打开此更改之前的 Blame',
		'Open Branch On Remote': '在远程打开分支',
		'Open Branches on Remote': '在远程打开分支',
		'Open Changes (difftool)': '打开更改（difftool）',
		'Open Changes with Previous Revision': '打开与上一版本的更改',
		'Open Commit On Remote': '在远程打开提交',
		'Open Current Branch Name': '打开当前分支名称',
		'Open Directory Compare': '打开目录比较',
		'Open Directory Compare with Working Tree': '打开与 Working Tree 的目录比较',
		'Open File at Revision': '在版本打开文件',
		'Open Files at Revision': '在版本打开文件',
		'Open Folder': '打开文件夹',
		'Open Folder Changes with Branch or Tag': '打开文件夹与分支或标签的更改',
		'Open Folder Changes with Revision': '打开文件夹与版本的更改',
		'Open Only Staged Files': '仅打开暂存文件',
		'Open Only Unstaged Files': '仅打开未暂存文件',
		'Open Output Channel': '打开输出通道',
		'Open Patch File': '打开补丁文件',
		// Step 6.8: 批量追加 gitlens.js 高优先级翻译（批次3：50条）
		'A remote with that name already exists': '该名称的远程已存在',
		'Account required to open link': '打开链接需要账户',
		'Apply Changes': '应用更改',
		'Assign Reviewers': '分配审查者',
		'Associate an issue with your branch': '将议题关联到你的分支',
		'Azure (Preview)': 'Azure（预览）',
		'Azure PRs must have a repository ID to be encoded': 'Azure PR 必须有仓库 ID 才能编码',
		'Bitbucket Server reviewer requires ': 'Bitbucket Server 审查者需要 ',
		'Bitbucket reviewer requires ': 'Bitbucket 审查者需要 ',
		'Blame repository not found.': '未找到 Blame 仓库。',
		'Branch Summary': '分支摘要',
		'Branch name': '分支名称',
		'Can only re-request review from existing reviewer.': '只能向现有审查者重新请求审查。',
		'Change Auto-Add Behavior...': '更改自动添加行为...',
		'Change File History Base': '更改文件历史基准',
		'Change Root Folder...': '更改根文件夹...',
		'Change Threshold': '更改阈值',
		'Change the after edit delay': '更改编辑后延迟',
		'Change the after edit line threshold': '更改编辑后行阈值',
		'Change-Id: ': 'Change-Id: ',
		'Changes copied successfully': '更改复制成功',
		'Changes copied with conflicts': '更改复制时有冲突',
		'Changes were stashed, but the working tree cannot be updated because at least one file has staged and unstaged changes on the same line(s)': '更改已贮藏，但无法更新 Working Tree，因为至少一个文件在同一行有暂存和未暂存的更改',
		'Check In with Reviewers': '与审查者确认',
		'Checkout to Remote Branch': '切换到远程分支',
		'Choose a Branch or Tag...': '选择分支或标签...',
		'Choose a Specific Commit': '选择特定提交',
		'Choose a Workspace File...': '选择工作区文件...',
		'Choose a base to create the new branch from': '选择创建新分支的基准',
		'Choose a branch option': '选择分支选项',
		'Choose a branch or tag to compare with': '选择要比较的分支或标签',
		'Choose a branch or tag to open the file revision from': '选择从中打开文件版本的分支或标签',
		'Choose a branch to associate the issue with': '选择要关联议题的分支',
		'Choose a branch to change its upstream tracking': '选择要更改其上游跟踪的分支',
		'Choose a branch to copy the URL from': '选择要复制 URL 的分支',
		'Choose a branch to explain': '选择要解释的分支',
		'Choose a branch to open': '选择要打开的分支',
		'Choose a branch to recompose': '选择要重组的分支',
		'Choose a branch to rename': '选择要重命名的分支',
		'Choose a commit': '选择提交',
		'Choose a commit to compare with': '选择要比较的提交',
		'Choose a commit to explain': '选择要解释的提交',
		'Choose a contributor to show commits from': '选择要显示其提交的贡献者',
		'Choose a file revision to open': '选择要打开的文件版本',
		'Choose a location for the new code workspace file': '选择新代码工作区文件的位置',
		'Choose a reference (branch, tag, etc) to compare': '选择要比较的引用（分支、标签等）',
		'Choose a reference (branch, tag, etc) to compare with': '选择要与之比较的引用（分支、标签等）',
		'Choose a reference (branch, tag, etc) to copy the file link for': '选择要复制文件链接的引用（分支、标签等）',
		'Choose a remote': '选择远程',
		'Choose a remote to prune': '选择要修剪的远程',
		// Step 6.9: 批量追加 gitlens.js 高优先级翻译（批次4：50条）
		'Choose a repository': '选择仓库',
		'Choose a stash': '选择贮藏',
		'Choose a stash to apply to your working tree': '选择要应用到 Working Tree 的贮藏',
		'Choose a stash to compare with': '选择要比较的贮藏',
		'Choose a stash to explain': '选择要解释的贮藏',
		'Choose a stash to rename': '选择要重命名的贮藏',
		'Choose an existing branch': '选择现有分支',
		'Choose an issue to associate with your branch': '选择要关联到分支的议题',
		'Choose an upstream branch to track': '选择要跟踪的上游分支',
		'Choose another working file to open': '选择要打开的其他工作文件',
		'Choose branches to delete': '选择要删除的分支',
		'Choose branches with missing upstreams to delete': '选择缺少上游的分支进行删除',
		'Choose commits to revert': '选择要恢复的提交',
		'Choose contributors to show commits from': '选择要显示其提交的贡献者',
		'Choose how to create a pull request': '选择如何创建拉取请求',
		'Choose how to open the issue': '选择如何打开议题',
		'Choose how to open the pull request': '选择如何打开拉取请求',
		'Choose remote to remove': '选择要移除的远程',
		'Choose stashes to delete': '选择要删除的贮藏',
		'Choose tags to delete': '选择要删除的标签',
		'Choose which remote to copy the link for': '选择要复制链接的远程',
		'Choose which repositories or worktrees to show': '选择要显示的仓库或 worktrees',
		'Choose which repository to connect to the remote provider': '选择要连接到远程提供商的仓库',
		'Choose which repository to copy the url from': '选择要复制 URL 的仓库',
		'Choose which repository to disconnect from the remote provider': '选择要从远程提供商断开的仓库',
		'Choose which repository to explain a branch from': '选择要解释分支的仓库',
		'Choose which repository to explain a commit from': '选择要解释提交的仓库',
		'Choose which repository to explain a stash from': '选择要解释贮藏的仓库',
		'Choose which repository to explain working changes from': '选择要解释工作更改的仓库',
		'Choose which repository to open on remote': '选择要在远程打开的仓库',
		'Clears the stored repository access cache': '清除存储的仓库访问缓存',
		'Close All Unchanged Files': '关闭所有未更改文件',
		'Commit Composer': '提交编排器',
		'Commit Summary': '提交摘要',
		'Commit has no file': '提交没有文件',
		'Commit not found.': '未找到提交。',
		'Commits result is not an array': '提交结果不是数组',
		'Connect additional integrations to associate their issues with your branches': '连接额外集成以将其议题关联到你的分支',
		'Connect additional integrations to view their issues': '连接额外集成以查看其议题',
		'Connect an integration to associate its issues with your branches': '连接集成以将其议题关联到你的分支',
		'Connect an integration to view its issues in Start Work': '连接集成以在开始工作中查看其议题',
		'Connect your branches to their associated issues in Home view': '在主页视图中将分支连接到其关联的议题',
		'Copy Remote Branch URL': '复制远程分支 URL',
		'Copy Remote Branches URL': '复制远程分支 URL',
		'Could not add pull request label': '无法添加拉取请求标签',
		'Could not add pull request reviewer': '无法添加拉取请求审查者',
		'Could not close pull request': '无法关闭拉取请求',
		'Could not convert pull request to draft': '无法将拉取请求转换为草稿',
		'Could not create commit': '无法创建提交',
		'Could not create the new workspace file. Check logs for details': '无法创建新工作区文件。查看日志了解详情',
		// Step 6.10: 批量追加 gitlens.js 高优先级翻译（批次5：50条）
		'Could not fetch accounts for repo': '无法获取仓库的账户',
		'Could not fetch labels': '无法获取标签',
		'Could not fetch milestones': '无法获取里程碑',
		'Could not fetch orgs for current user': '无法获取当前用户的组织',
		'Could not fetch pull request': '无法获取拉取请求',
		'Could not fetch pull request by id': '无法通过 ID 获取拉取请求',
		'Could not fetch pull request by number': '无法通过编号获取拉取请求',
		'Could not fetch pull requests, project mismatch': '无法获取拉取请求，项目不匹配',
		'Could not fetch repos': '无法获取仓库',
		'Could not fetch repos for usernames': '无法获取用户名的仓库',
		'Could not fetch trees': '无法获取树',
		'Could not find user for commit': '无法找到提交的用户',
		'Could not mark pull request ready to review': '无法将拉取请求标记为准备审查',
		'Could not merge pull request': '无法合并拉取请求',
		'Could not parse commit sha from sequencer/todo': '无法从 sequencer/todo 解析提交 SHA',
		'Could not re-request pull request reviews': '无法重新请求拉取请求审查',
		'Could not reopen issue': '无法重新打开议题',
		'Could not search pull requests': '无法搜索拉取请求',
		'Could not set issue tags': '无法设置议题标签',
		'Could not set milestone of pull request': '无法设置拉取请求的里程碑',
		'Could not set pull request as draft': '无法将拉取请求设置为草稿',
		'Could not set pull request assignees': '无法设置拉取请求的受让人',
		'Could not set pull request labels': '无法设置拉取请求的标签',
		'Could not set pull request reviewers': '无法设置拉取请求的审查者',
		'Could not set the pull request as draft': '无法将拉取请求设置为草稿',
		'Create Cloud Patch Details': '创建云补丁详情',
		'Create Code Suggestion Details': '创建代码建议详情',
		'Create New Branch...': '创建新分支...',
		'Create Workspace': '创建工作区',
		'Created by Me': '我创建的',
		'Creates a branch to apply the Cloud Patch to. (Typing an existing branch name will use that branch.)': '创建一个分支以应用云补丁。（输入现有分支名称将使用该分支。）',
		'Current changes': '当前更改',
		'Deleting branch...': '删除分支中...',
		'Deleting worktrees': '删除 worktrees',
		'Displaying worktrees': '显示 worktrees',
		'Drop Stash...': '丢弃贮藏...',
		'Empty sequencer/todo file': '空的 sequencer/todo 文件',
		'Enter a name for the new branch': '输入新分支的名称',
		'Enter a name for the remote': '输入远程的名称',
		'Enter a reference or commit SHA': '输入引用或提交 SHA',
		'Enter a term to search for a pull request to act on': '输入搜索词以查找要操作的拉取请求',
		'Enter remote URL': '输入远程 URL',
		'Enter remote name': '输入远程名称',
		'Enter tag name': '输入标签名称',
		'EntityType PullRequest is not valid for Jira': 'EntityType PullRequest 对 Jira 无效',
		'Error fetching remote.': '抓取远程时出错。',
		'Explain Commit Summary': '解释提交摘要',
		'Explaining branch changes...': '解释分支更改中...',
		'Explaining commit...': '解释提交中...',
		'Explaining stash...': '解释贮藏中...',
		// Step 6.11: 批量追加 gitlens.js 高优先级翻译（批次6：50条）
		'Failed to add remote.': '添加远程失败。',
		'Failed to create global storage directory': '创建全局存储目录失败',
		'Failed to execute merge-tree for conflict check': '执行 merge-tree 进行冲突检查失败',
		'Failed to fetch proxy': '获取代理失败',
		'Failed to fetch proxy URL': '获取代理 URL 失败',
		'Failed to get pull requests': '获取拉取请求失败',
		'Failed to get pull requests with suggestion counts': '获取带建议计数的拉取请求失败',
		"Field 'isDraft' doesn't exist on type 'PullRequest'": "字段 'isDraft' 在类型 'PullRequest' 上不存在",
		'File matches the working tree': '文件与 Working Tree 匹配',
		'File not found': '未找到文件',
		'File not found.': '未找到文件。',
		'File seems to be binary and cannot be opened as text': '文件似乎是二进制文件，无法作为文本打开',
		'Firing pending file system changes': '触发待处理的文件系统更改',
		'Generate Commits (Preview)': '生成提交（预览）',
		'Generate Search Query (Preview)': '生成搜索查询（预览）',
		'Generate Stash Message': '生成贮藏消息',
		'Generating commit message...': '生成提交消息中...',
		'GitHub requires reviewer ': 'GitHub 需要审查者 ',
		'GitLab requires reviewer ': 'GitLab 需要审查者 ',
		'GitLens Commit Graph': 'GitLens 提交图',
		'GitLens Pro is required to open link': '打开链接需要 GitLens Pro',
		'Id is required to delete state': '删除状态需要 ID',
		'Incoming changes': '传入更改',
		'Invalid Azure DevOps pull request uniqueId, check version': 'Azure DevOps 拉取请求 uniqueId 无效，检查版本',
		'Invalid Bitbucket DevOps pull request uniqueId, check version': 'Bitbucket DevOps 拉取请求 uniqueId 无效，检查版本',
		'Invalid Github pull request uniqueId, check version': 'Github 拉取请求 uniqueId 无效，检查版本',
		'Invalid Gitlab pull request uniqueId, check version': 'Gitlab 拉取请求 uniqueId 无效，检查版本',
		'Invalid commit structure: missing or invalid hunks array': '无效的提交结构：缺少或无效的 hunks 数组',
		'Invalid pull request uniqueId': '无效的拉取请求 uniqueId',
		'Invalid state: repo should be a Repository instance': '无效状态：repo 应该是 Repository 实例',
		'Keep a Changelog': '保持更新日志',
		'Launchpad prioritizes your pull requests to keep you focused and your team unblocked': '启动台优先处理你的拉取请求，让你专注并让团队畅通无阻',
		'Load more commits to search for autolinks': '加载更多提交以搜索自动链接',
		'Locate Repository': '定位仓库',
		'Locate the workspace file': '定位工作区文件',
		'Locating Remote': '定位远程',
		'Locating Repository': '定位仓库',
		'Mark as Reviewed': '标记为已审查',
		'Matching repository found. Choose a location to open it.': '找到匹配的仓库。选择打开位置。',
		'Missing branches': '缺少分支',
		'Missing file path.': '缺少文件路径。',
		'Missing filename': '缺少文件名',
		'Missing remote': '缺少远程',
		'Missing repository': '缺少仓库',
		'Missing repository id, remote url and path.': '缺少仓库 ID、远程 URL 和路径。',
		'Missing repository or remote url.': '缺少仓库或远程 URL。',
		'Missing repository or remote.': '缺少仓库或远程。',
		'Missing repository or target type.': '缺少仓库或目标类型。',
		'Missing repository.': '缺少仓库。',
		'Missing required fields for Azure DevOps pull request uniqueId': 'Azure DevOps 拉取请求 uniqueId 缺少必需字段',
		// Step 6.12: 批量追加 gitlens.js 高优先级翻译（批次7：50条）
		'Missing required fields for Bitbucket DevOps pull request uniqueId': 'Bitbucket DevOps 拉取请求 uniqueId 缺少必需字段',
		'Missing required fields for Github pull request uniqueId': 'Github 拉取请求 uniqueId 缺少必需字段',
		'Missing required fields for Gitlab pull request uniqueId': 'Gitlab 拉取请求 uniqueId 缺少必需字段',
		'Needs My Review': '需要我审查',
		'No Conflicts Detected': '未检测到冲突',
		'No Uncommitted Changes': '没有未提交更改',
		'No auto-detected or configured remote providers found': '未找到自动检测或配置的远程提供商',
		'No autolinked issues or pull requests could be found.': '未找到自动链接的议题或拉取请求。',
		'No branches could be found.': '未找到分支。',
		'No changes found': '未找到更改',
		'No changes found to copy': '未找到要复制的更改',
		'No changes found to explain': '未找到要解释的更改',
		'No changes found to explain.': '未找到要解释的更改。',
		'No changes to copy': '没有要复制的更改',
		'No changes to generate a changelog from.': '没有要生成更新日志的更改。',
		'No changes to generate a commit message from.': '没有要生成提交消息的更改。',
		'No changes to generate a pull request from.': '没有要生成拉取请求的更改。',
		'No changes to generate a stash message from.': '没有要生成贮藏消息的更改。',
		'No changes to stash.': '没有要贮藏的更改。',
		'No changes to stash. Choose the ': '没有要贮藏的更改。选择 ',
		'No commit found to explain.': '未找到要解释的提交。',
		'No commits could be found.': '未找到提交。',
		'No commits found to push': '未找到要推送的提交',
		'No editor opened': '未打开编辑器',
		'No file history could be found.': '未找到文件历史。',
		'No files to stash': '没有要贮藏的文件',
		'No issues found for your open repositories.': '未找到打开仓库的议题。',
		'No matching branch found.': '未找到匹配的分支。',
		'No matching remote found.': '未找到匹配的远程。',
		'No matching repository found.': '未找到匹配的仓库。',
		'No matching stashes found': '未找到匹配的贮藏',
		'No non-ignored fs changes': '没有未忽略的文件系统更改',
		'No opened repositories found': '未找到打开的仓库',
		'No pending fs changes': '没有待处理的文件系统更改',
		'No pending repo changes': '没有待处理的仓库更改',
		'No pull request id provided.': '未提供拉取请求 ID。',
		'No pull request info provided': '未提供拉取请求信息',
		'No pull request refs was provided.': '未提供拉取请求引用。',
		'No pull requests found': '未找到拉取请求',
		'No remote or initial commit found': '未找到远程或初始提交',
		'No remotes could be found': '未找到远程',
		'No remotes could be found.': '未找到远程。',
		'No remotes found': '未找到远程',
		'No repositories in this workspace could be found locally. Please locate at least one repository.': '本地未找到此工作区中的仓库。请至少定位一个仓库。',
		'No repository detected. To use GitLens, open a folder containing a git repository or clone from a URL in Source Control.': '未检测到仓库。要使用 GitLens，请打开包含 git 仓库的文件夹或在源代码管理中从 URL 克隆。',
		'No repository id, remote url or path was provided.': '未提供仓库 ID、远程 URL 或路径。',
		'No repository path was provided.': '未提供仓库路径。',
		'No reviewers': '没有审查者',
		'No sequencer/todo file found': '未找到 sequencer/todo 文件',
		// Step 6.13: 批量追加 gitlens.js 高优先级翻译（批次8：50条）
		'No stashes could be found.': '未找到贮藏。',
		'No stashes found': '未找到贮藏',
		'No tags could be found.': '未找到标签。',
		'No working tree changes': '没有 Working Tree 更改',
		'No worktrees could be found.': '未找到 worktrees。',
		'Only GitHub is supported for this operation. Please ensure all open repositories are hosted on GitHub.': '此操作仅支持 GitHub。请确保所有打开的仓库都托管在 GitHub 上。',
		'Open Revisions': '打开版本',
		'Open Staged Files': '打开暂存文件',
		'Open Unstaged Files': '打开未暂存文件',
		'Open Worktree in a New Window': '在新窗口打开 Worktree',
		'Open in Current Window': '在当前窗口打开',
		'Open in Git Command Palette': '在 Git 命令面板中打开',
		'Open in New Window': '在新窗口打开',
		'Open in Terminal': '在终端打开',
		'Open local file': '打开本地文件',
		'Open on Azure DevOps': '在 Azure DevOps 上打开',
		'Open on Bitbucket': '在 Bitbucket 上打开',
		'Open on GitHub': '在 GitHub 上打开',
		'Open on GitLab': '在 GitLab 上打开',
		'Open on Jira': '在 Jira 上打开',
		'OpenAI-Compatible Provider': 'OpenAI 兼容提供商',
		'Opening all PR changes...': '打开所有 PR 更改中...',
		'Opening cloud patch...': '打开云补丁中...',
		'Opening comparison...': '打开比较中...',
		'Opening file...': '打开文件中...',
		'Opening graph...': '打开图中...',
		'Opening inspect...': '打开检查中...',
		'Opening login URL failed': '打开登录 URL 失败',
		'Opening target...': '打开目标中...',
		'Opening workspace...': '打开工作区中...',
		'Pick a branch to edit': '选择要编辑的分支',
		'Pick a merge target branch': '选择合并目标分支',
		'Pinning is a Preview feature and requires an account.': '固定是预览功能，需要账户。',
		'Please choose an option to open the repository': '请选择打开仓库的选项',
		'Please enter a valid branch name': '请输入有效的分支名称',
		'Please enter a valid remote URL': '请输入有效的远程 URL',
		'Please enter a valid remote name': '请输入有效的远程名称',
		'Please enter a valid tag name': '请输入有效的标签名称',
		'Please provide a URL for the remote': '请提供远程的 URL',
		'Please provide a name for the new tag': '请提供新标签的名称',
		'Please provide a name for the remote': '请提供远程的名称',
		'Please provide a new branch name': '请提供新分支名称',
		'Please provide a stash message': '请提供贮藏消息',
		'Please provide an optional message to annotate the tag': '请提供可选消息以注释标签',
		'Prompt on Workspace (Window) Open': '工作区（窗口）打开时提示',
		'Recompose Branch': '重组分支',
		'Ref repository not found.': '未找到引用仓库。',
		'Remote file url': '远程文件 URL',
		'Rename Stash...': '重命名贮藏...',
		// Step 6.14: 批量追加 gitlens.js 高优先级翻译（批次9：50条）
		'Repository (Write)': '仓库（写入）',
		'Repository Access...': '仓库访问...',
		'Repository not found': '未找到仓库',
		'Repository not found.': '未找到仓库。',
		'Repository or Worktree': '仓库或 Worktree',
		'Reset Feature Previews': '重置功能预览',
		'Reset Merge Target': '重置合并目标',
		'Reset Repository Access': '重置仓库访问',
		'Reset the merge target branch to be automatically detected': '重置合并目标分支为自动检测',
		'Respond to Reviewers': '回应审查者',
		'Reveal in File Explorer': '在文件资源管理器中显示',
		'Reviewer Commented': '审查者已评论',
		'Search by Changes': '按更改搜索',
		'Search by Commit SHA': '按提交 SHA 搜索',
		'Search files by name': '按名称搜索文件',
		'Search for Pull Request...': '搜索拉取请求...',
		'Searching for a Pull Request (if any) that introduced this commit...': '搜索引入此提交的拉取请求（如果有）...',
		'See how to configure a custom remote provider...': '查看如何配置自定义远程提供商...',
		'Select Base to Create Branch From': '选择创建分支的基准',
		'Select Branch to Create Worktree From': '选择创建 Worktree 的分支',
		'Select Existing Branch': '选择现有分支',
		'Select Repositories or Worktrees to Show': '选择要显示的仓库或 Worktrees',
		'Selects an existing branch to apply the Cloud Patch to.': '选择要应用云补丁的现有分支。',
		'Set as Default Remote': '设为默认远程',
		'Show More Actions': '显示更多操作',
		'Show Team Actions': '显示团队操作',
		'Show my commits from last month': '显示我上个月的提交',
		'Show the GitLens Commit Graph': '显示 GitLens 提交图',
		'Showing incomplete contributors': '显示不完整的贡献者',
		'Showing incomplete contributors and statistics': '显示不完整的贡献者和统计信息',
		'Showing view': '显示视图',
		'Skipping a merge is not supported': '不支持跳过合并',
		'Snoozing is a Preview feature and requires an acccount.': '暂停是预览功能，需要账户。',
		'Start Reviewing': '开始审查',
		'Stash Everything': '贮藏所有内容',
		'Stash Summary': '贮藏摘要',
		'Stash applied with conflicts': '贮藏应用时有冲突',
		'Stashing individual files': '贮藏单个文件',
		'Suggested Changes': '建议的更改',
		'Switch to Local Branch': '切换到本地分支',
		'Switch to New Branch': '切换到新分支',
		"The 'badge' property not supported on Webview parent": "Webview 父级不支持 'badge' 属性",
		"The argument 'simultaneousPagesToFetch' cannot exceed 40 for 'getReposForCurrentUser'": "'getReposForCurrentUser' 的参数 'simultaneousPagesToFetch' 不能超过 40",
		"The argument 'simultaneousPagesToFetch' cannot exceed 40 for 'getReposForOrg'": "'getReposForOrg' 的参数 'simultaneousPagesToFetch' 不能超过 40",
		"The current file doesn't have any changes": '当前文件没有任何更改',
		"The repository doesn't have any changes": '仓库没有任何更改',
		'There is no previous commit.': '没有上一个提交。',
		'Unable to Detect Conflicts': '无法检测冲突',
		'Unable to apply changes': '无法应用更改',
		// Step 6.15: 批量追加 gitlens.js 高优先级翻译（批次10：50条）
		'Unable to apply stash': '无法应用贮藏',
		'Unable to apply stash. Your local changes would be overwritten. Please commit or stash your changes before trying again.': '无法应用贮藏。你的本地更改将被覆盖。请先提交或贮藏更改后重试。',
		'Unable to apply stash. Your working tree changes would be overwritten. Please commit or stash your changes before trying again': '无法应用贮藏。你的 Working Tree 更改将被覆盖。请先提交或贮藏更改后重试',
		'Unable to cherry-pick due to conflicts. Resolve the conflicts before continuing, or abort the cherry-pick.': '由于冲突无法拣选。解决冲突后继续，或中止拣选。',
		'Unable to cherry-pick. Your local changes would be overwritten. Please commit or stash your changes before trying again.': '无法拣选。你的本地更改将被覆盖。请先提交或贮藏更改后重试。',
		'Unable to clear file annotations': '无法清除文件标注',
		'Unable to clone repository': '无法克隆仓库',
		'Unable to close all unchanged files': '无法关闭所有未更改文件',
		'Unable to close unchanged files': '无法关闭未更改文件',
		'Unable to complete pull due to conflicts which must be resolved.': '由于冲突无法完成拉取，必须解决冲突。',
		'Unable to compose commits': '无法编辑提交',
		'Unable to copy changes as some local changes would be overwritten': '无法复制更改，因为某些本地更改将被覆盖',
		'Unable to copy commit SHA': '无法复制提交 SHA',
		'Unable to copy current branch name': '无法复制当前分支名称',
		'Unable to copy file link': '无法复制文件链接',
		'Unable to copy the commit SHA': '无法复制提交 SHA',
		'Unable to create branch': '无法创建分支',
		'Unable to create tag': '无法创建标签',
		'Unable to create worktree': '无法创建 worktree',
		'Unable to create worktree because it already exists': '无法创建 worktree，因为它已存在',
		'Unable to create worktree because it is already checked out': '无法创建 worktree，因为它已被检出',
		'Unable to delete branch': '无法删除分支',
		'Unable to delete tag': '无法删除标签',
		'Unable to delete worktree': '无法删除 worktree',
		'Unable to delete worktree because the directory is not empty': '无法删除 worktree，因为目录不为空',
		'Unable to delete worktree because there are uncommitted changes': '无法删除 worktree，因为有未提交的更改',
		'Unable to detect conflicts': '无法检测冲突',
		'Unable to detect conflicts because Git 2.38 or later is required': '无法检测冲突，因为需要 Git 2.38 或更高版本',
		"Unable to detect conflicts because the branch or commit doesn't exist": '无法检测冲突，因为分支或提交不存在',
		"Unable to detect conflicts because the branches don't share a common history": '无法检测冲突，因为分支没有共同历史',
		'Unable to detect conflicts because the selection includes the initial commit': '无法检测冲突，因为选择包含初始提交',
		'Unable to determine branch for commit': '无法确定提交的分支',
		'Unable to determine parent commit': '无法确定父提交',
		'Unable to explain branch': '无法解释分支',
		'Unable to explain commit': '无法解释提交',
		'Unable to explain stash': '无法解释贮藏',
		'Unable to find a repository': '无法找到仓库',
		'Unable to find commits': '无法找到提交',
		'Unable to find link target in the repository.': '无法在仓库中找到链接目标。',
		'Unable to find the specified branch': '无法找到指定的分支',
		'Unable to find the specified commit': '无法找到指定的提交',
		'Unable to find the specified stash commit': '无法找到指定的贮藏提交',
		'Unable to force delete branch': '无法强制删除分支',
		'Unable to get commits service': '无法获取提交服务',
		'Unable to inspect commit details': '无法检查提交详情',
		'Unable to locate a matching repository, please choose how to locate it': '无法定位匹配的仓库，请选择如何定位',
		'Unable to merge': '无法合并',
		'Unable to merge due to conflicts. Resolve the conflicts before continuing, or abort the merge.': '由于冲突无法合并。解决冲突后继续，或中止合并。',
		'Unable to merge. A merge is already in progress. Continue or abort the current merge first.': '无法合并。合并已在进行中。请先继续或中止当前合并。',
		// Step 6.16: 批量追加 gitlens.js 高优先级翻译（批次11：50条）
		'Unable to merge. Your local changes would be overwritten. Please commit or stash your changes before trying again.': '无法合并。你的本地更改将被覆盖。请先提交或贮藏更改后重试。',
		'Unable to open all changed files': '无法打开所有更改的文件',
		'Unable to open blame': '无法打开 blame',
		'Unable to open branch on remote provider': '无法在远程提供商上打开分支',
		'Unable to open branches on remote provider': '无法在远程提供商上打开分支',
		'Unable to open changed files': '无法打开更改的文件',
		'Unable to open changes because no Git diff tool is configured': '无法打开更改，因为未配置 Git diff 工具',
		'Unable to open changes because the specified diff tool cannot be found or no Git diff tool is configured': '无法打开更改，因为找不到指定的 diff 工具或未配置 Git diff 工具',
		'Unable to open changes in diff tool': '无法在 diff 工具中打开更改',
		'Unable to open code suggestion counts': '无法打开代码建议计数',
		'Unable to open commit on remote provider': '无法在远程提供商上打开提交',
		'Unable to open compare. File has been deleted from the working tree': '无法打开比较。文件已从 Working Tree 中删除',
		'Unable to open comparison': '无法打开比较',
		'Unable to open comparison on remote provider': '无法在远程提供商上打开比较',
		'Unable to open directory compare': '无法打开目录比较',
		'Unable to open directory compare because the specified diff tool cannot be found or no Git diff tool is configured': '无法打开目录比较，因为找不到指定的 diff 工具或未配置 Git diff 工具',
		'Unable to open drafts': '无法打开草稿',
		'Unable to open file at revision': '无法在版本打开文件',
		'Unable to open file comparison': '无法打开文件比较',
		'Unable to open file on remote provider': '无法在远程提供商上打开文件',
		'Unable to open file revision': '无法打开文件版本',
		'Unable to open file.': '无法打开文件。',
		'Unable to open in remote provider': '无法在远程提供商中打开',
		'Unable to open repository on remote provider': '无法在远程提供商上打开仓库',
		'Unable to open the commit on the remote provider': '无法在远程提供商上打开提交',
		'Unable to open the merge editor, no working file found': '无法打开合并编辑器，未找到工作文件',
		'Unable to open the repository at the specified revision': '无法在指定版本打开仓库',
		'Unable to open working file': '无法打开工作文件',
		'Unable to open working file. File could not be found in the working tree': '无法打开工作文件。在 Working Tree 中找不到文件',
		'Unable to parse the provided remote url.': '无法解析提供的远程 URL。',
		'Unable to perform action on branch': '无法对分支执行操作',
		'Unable to perform action on tag': '无法对标签执行操作',
		'Unable to read file': '无法读取文件',
		'Unable to rebase': '无法变基',
		'Unable to rebase due to conflicts. Resolve the conflicts before continuing, or abort the rebase.': '由于冲突无法变基。解决冲突后继续，或中止变基。',
		'Unable to rebase. A rebase is already in progress. Continue or abort the current rebase first.': '无法变基。变基已在进行中。请先继续或中止当前变基。',
		'Unable to rebase. Your local changes would be overwritten. Please commit or stash your changes before trying again.': '无法变基。你的本地更改将被覆盖。请先提交或贮藏更改后重试。',
		'Unable to recompose: missing commit information': '无法重组：缺少提交信息',
		'Unable to recompose: missing repository information': '无法重组：缺少仓库信息',
		'Unable to remove remote': '无法移除远程',
		'Unable to rename branch': '无法重命名分支',
		'Unable to rename stash': '无法重命名贮藏',
		'Unable to resolve non-existing file': '无法解析不存在的文件',
		'Unable to resolve nonexistent file': '无法解析不存在的文件',
		'Unable to revert due to conflicts. Resolve the conflicts before continuing, or abort the revert.': '由于冲突无法恢复。解决冲突后继续，或中止恢复。',
		'Unable to revert. Your local changes would be overwritten. Please commit or stash your changes before trying again.': '无法恢复。你的本地更改将被覆盖。请先提交或贮藏更改后重试。',
		'Unable to safely reset. Your local changes would be overwritten by the reset. Please commit or stash your changes before trying again.': '无法安全重置。重置将覆盖你的本地更改。请先提交或贮藏更改后重试。',
		'Unable to show commit': '无法显示提交',
		'Unable to show commit details': '无法显示提交详情',
		// Step 6.17: 批量追加 gitlens.js 高优先级翻译（批次12：最后100条）
		'Unable to show commit file details': '无法显示提交文件详情',
		'Unable to show last quick pick': '无法显示上次快速选择',
		'Unable to stash': '无法贮藏',
		'Unable to stash changes': '无法贮藏更改',
		'Undo Commit': '撤销提交',
		'Updated but Unmerged': '已更新但未合并',
		'Use AI-powered GitLens features like Generate Commit Message, Explain Commit, and more': '使用 AI 驱动的 GitLens 功能，如生成提交消息、解释提交等',
		'View Changes': '查看更改',
		'View Git Docs': '查看 Git 文档',
		'View Release Notes': '查看发布说明',
		'View Setup Instructions': '查看设置说明',
		'Visualize commits on the Commit Graph': '在提交图上可视化提交',
		'Will add the worktree into the current workspace': '将把 worktree 添加到当前工作区',
		'Will checkout and start suggesting code changes': '将检出并开始建议代码更改',
		'Will checkout the branch, create or open a worktree': '将检出分支，创建或打开 worktree',
		'Will connect to GitHub to provide access to your pull requests and issues': '将连接到 GitHub 以提供对拉取请求和议题的访问',
		'Will connect to GitHub to provide access your pull requests and issues': '将连接到 GitHub 以提供对拉取请求和议题的访问',
		'Will connect to GitLab to provide access your pull requests and issues': '将连接到 GitLab 以提供对拉取请求和议题的访问',
		'Will create or open a worktree in a new window': '将在新窗口中创建或打开 worktree',
		'Will open the pull request changes for review': '将打开拉取请求更改以供审查',
		'Will open the pull request details in the Side Bar': '将在侧边栏中打开拉取请求详情',
		'Will open the worktree in a new window': '将在新窗口中打开 worktree',
		'Will open the worktree in the File Explorer': '将在文件资源管理器中打开 worktree',
		'Will open the worktree in the current window': '将在当前窗口中打开 worktree',
		'Will start suggesting code changes': '将开始建议代码更改',
		'Will stash uncommitted changes without changing the working tree': '将贮藏未提交的更改而不改变 Working Tree',
		'Will stash uncommitted changes, including untracked files': '将贮藏未提交的更改，包括未跟踪的文件',
		'Worktrees minimize context switching by allowing simultaneous work on multiple branches': 'Worktrees 通过允许同时在多个分支上工作来最小化上下文切换',
		'add, prune, or remove remotes': '添加、修剪或移除远程',
		'adds a new remote': '添加新远程',
		'adds co-authors to a commit message': '向提交消息添加共同作者',
		"after:' - Search for commits after a certain date or range (e.g. 'after:2023-01-01', 'after:": "after:' - 搜索特定日期或范围之后的提交（例如 'after:2023-01-01', 'after:",
		'aka checkout, switches to a specified branch': '即 checkout，切换到指定分支',
		'aka grep, searches for commits': '即 grep，搜索提交',
		'aka log, shows commit history': '即 log，显示提交历史',
		"before:' - Search for commits before a certain date or range (e.g. 'before:2023-01-01', 'before:": "before:' - 搜索特定日期或范围之前的提交（例如 'before:2023-01-01', 'before:",
		'cannot clone body after it is used': '使用后无法克隆主体',
		'cannot open': '无法打开',
		"change:' - Search by specific code changes using regular expressions (e.g. 'change:": "change:' - 使用正则表达式按特定代码更改搜索（例如 'change:",
		'clone the repository to': '克隆仓库到',
		'codicon codicon-git-merge': 'codicon codicon-git-merge',
		'codicon codicon-git-pull-request': 'codicon codicon-git-pull-request',
		'codicon codicon-git-pull-request-closed': 'codicon codicon-git-pull-request-closed',
		"commit:' - Search by a specific commit SHA (e.g. 'commit:4ce3a": "commit:' - 按特定提交 SHA 搜索（例如 'commit:4ce3a",
		'conflicting file': '冲突文件',
		'copy the create pull request link for': '复制创建拉取请求链接',
		'copy the create pull request links for': '复制创建拉取请求链接',
		'create the pull request on': '在此创建拉取请求',
		'create the pull requests on': '在此创建拉取请求',
		'create, change upstream, prune, rename, or delete branches': '创建、更改上游、修剪、重命名或删除分支',
		'create, or delete tags': '创建或删除标签',
		'creates a new branch': '创建新分支',
		'creates a new tag': '创建新标签',
		'creates a new worktree': '创建新 worktree',
		'delete the worktree and then prompt to delete the associated branch': '删除 worktree 然后提示删除关联的分支',
		'deletes local branches with missing upstreams': '删除缺少上游的本地分支',
		'deletes the specified branches': '删除指定的分支',
		'deletes the specified stashes': '删除指定的贮藏',
		'deletes the specified tags': '删除指定的标签',
		'deletes the specified worktrees': '删除指定的 worktrees',
		'fetches and integrates changes from a remote into the current branch': '从远程抓取并集成更改到当前分支',
		'fetches changes from one or more remotes': '从一个或多个远程抓取更改',
		"file:' - Search by file path (e.g. 'file:": "file:' - 按文件路径搜索（例如 'file:",
		'filename too long': '文件名太长',
		'in a worktree': '在 worktree 中',
		'in an opened worktree': '在打开的 worktree 中',
		'includes ANY UNCOMMITTED changes': '包括任何未提交的更改',
		'integrates changes from a specified branch into the current branch': '将指定分支的更改集成到当前分支',
		'integrates changes from a specified branch into the current branch, by changing the base of the branch and reapplying the commits on top': '通过更改分支的基准并重新应用提交，将指定分支的更改集成到当前分支',
		'integrates changes from specified commits into the current branch': '将指定提交的更改集成到当前分支',
		'integrates changes from the specified stash into the current branch': '将指定贮藏的更改集成到当前分支',
		'integrates changes from the specified stash into the current branch and deletes the stash': '将指定贮藏的更改集成到当前分支并删除贮藏',
		'lists the saved stashes': '列出保存的贮藏',
		'manages upstream tracking for a branch': '管理分支的上游跟踪',
		"message:' - Search in commit messages (e.g. 'message:fix bug": "message:' - 在提交消息中搜索（例如 'message:fix bug",
		'native promise missing, set fetch.Promise to your favorite alternative': '缺少原生 promise，将 fetch.Promise 设置为你喜欢的替代品',
		'needs merge': '需要合并',
		'opens the specified worktree': '打开指定的 worktree',
		'prunes remote branches on the specified remote': '修剪指定远程上的远程分支',
		'pushes changes from the current branch to a remote': '将当前分支的更改推送到远程',
		"ref:' - Search for commits reachable by a reference (branch, tag, commit) or reference range. Supports single refs (e.g. 'ref:main', 'ref:v1.0'), two-dot ranges (e.g. 'ref:main..feature": "ref:' - 搜索引用（分支、标签、提交）或引用范围可达的提交。支持单个引用（例如 'ref:main', 'ref:v1.0'）、两点范围（例如 'ref:main..feature",
		"ref:' when the query involves exploring commit history within or between specific references. Use temporal operators ('after:', 'before:": "ref:' 当查询涉及探索特定引用内或之间的提交历史时。使用时间运算符（'after:', 'before:",
		'removes the specified remote': '移除指定的远程',
		'renames the specified branch': '重命名指定的分支',
		'renames the specified stash': '重命名指定的贮藏',
		'repo / worktree': '仓库 / worktree',
		'repos / worktrees': '仓库 / worktrees',
		'repository or worktree': '仓库或 worktree',
		'resets the current branch to a specified commit': '将当前分支重置为指定提交',
		'saves your local changes to a new stash and discards them from the working tree and index': '将本地更改保存到新贮藏并从 Working Tree 和索引中丢弃它们',
		'shelves (stashes) local changes to be reapplied later': '暂存（贮藏）本地更改以便稍后重新应用',
		'shows information about a git reference': '显示有关 git 引用的信息',
		'shows status information about a repository': '显示有关仓库的状态信息',
		'staged file': '暂存文件',
		'these changes': '这些更改',
		'this change': '此更改',
		"type:' - Search by type -- supports stash and tip (e.g. 'type:stash', 'type:tip": "type:' - 按类型搜索 -- 支持 stash 和 tip（例如 'type:stash', 'type:tip",
		'undoes the changes of specified commits, by creating new commits with inverted changes': '通过创建反转更改的新提交来撤销指定提交的更改',
		'unstaged file': '未暂存文件',
		// Step 6.18: 追加剩余 webview 翻译（composer/commitDetails/patchDetails/rebase/home/timeline）
		'Draft commit (add a commit message)': '草稿提交（添加提交消息）',
		'The branch will be updated with the new commit structure.': '分支将更新为新的提交结构。',
		'New commits will be added to your current branch.': '新提交将添加到当前分支。',
		'Include Unstaged Changes': '包含未暂存更改',
		'Include Staged Changes': '包含暂存更改',
		'Include Unassigned Changes': '包含未分配更改',
		'Include Changes': '包含更改',
		'Unincluded changes (unstaged)': '未包含的更改（未暂存）',
		'Recompose Commits': '重组提交',
		'Auto-Compose Commits': '自动编排提交',
		'Auto-Compose Commits is disabled': '自动编排提交已禁用',
		'Commit the changes in this draft.': '提交此草稿中的更改。',
		'Draft Commits': '草稿提交',
		'No commits yet': '暂无提交',
		'Binary files': '二进制文件',
		'Binary file': '二进制文件',
		'Enter commit message...': '输入提交消息...',
		'Generate commit message with AI': '使用 AI 生成提交消息',
		'Error: Commit message is required.': '错误：提交消息是必需的。',
		'Unstaged Changes': '未暂存更改',
		'Unassigned Changes': '未分配更改',
		'Generated Commits': '已生成的提交',
		'Welcome to Commit Composer': '欢迎使用提交编排器',
		'Auto Compose Commits with AI': '使用 AI 自动编排提交',
		'Review and Compose Working Changes': '审查并编排工作更改',
		'Draft Commits represent what will be committed when you': '草稿提交代表当你完成时将提交的内容',
		"Draft commits and messages will be committed when you're finished.": '草稿提交和消息将在你完成后提交。',
		'Combined commit': '合并的提交',
		'Commit Composer Feedback': '提交编排器反馈',
		'Index has changed. You must reload to commit.': '索引已更改。必须重新加载才能提交。',
		'Working directory has changed. You must reload to commit.': '工作目录已更改。必须重新加载才能提交。',
		'Working directory has changed': '工作目录已更改',
		'View as Auto': '自动视图',
		'No matching files': '没有匹配的文件',
		'Share Staged Changes': '共享暂存更改',
		'Share Unstaged Changes': '共享未暂存更改',
		'Configure autolinks to linkify external references, like Jira or Zendesk tickets, in commit messages.': '配置自动链接，将提交消息中的外部引用（如 Jira 或 Zendesk 工单）转换为链接。',
		'Loading branches and tags which contain this commit': '加载包含此提交的分支和标签中',
		'Failed to load branches and tags. Click to retry.': '加载分支和标签失败。点击重试。',
		'Show which branches and tags contain this commit': '显示包含此提交的分支和标签',
		'Commit is not on any branch or tag': '提交不在任何分支或标签上',
		'Complexity of pull request': '拉取请求的复杂度',
		'Changes to Suggest': '要建议的更改',
		'Changes to Include': '要包含的更改',
		'Check at least one change': '至少勾选一项更改',
		'Commit via SCM': '通过源代码管理提交',
		'Suggest Changes for PR': '为 PR 建议更改',
		'Open SCM view': '打开源代码管理视图',
		'Show Commit Actions': '显示提交操作',
		'No working changes': '没有工作更改',
		'Please select changes to apply': '请选择要应用的更改',
		'Open in Inspect View': '在检查视图中打开',
		'This commit will cause conflicts': '此提交将导致冲突',
		'Branches to update': '要更新的分支',
		'Base commit': '基准提交',
		'This rebase contains merge commits and cannot be edited here. Switch to the text editor to make changes.': '此变基包含合并提交，无法在此编辑。切换到文本编辑器进行更改。',
		'Showing Oldest Commits First': '最早提交优先显示',
		'Showing Newest Commits First': '最新提交优先显示',
		'Let AI intelligently reorganize these commits with clearer messages and better logical grouping.': '让 AI 智能重组这些提交，提供更清晰的消息和更好的逻辑分组。',
		'Draft pull request': '草稿拉取请求',
		'Potential Conflicts with Merge Target': '与合并目标存在潜在冲突',
		'Up to Date with Merge Target': '与合并目标保持最新',
		'Last commit on ': '最后提交于 ',
		'Select a File or Folder to Visualize': '选择要可视化的文件或文件夹',
		'No issue provided in OpenIssueOnRemoteCommand': 'OpenIssueOnRemoteCommand 中未提供议题',
		// Step 7: 提交图搜索框与下拉补全
		'Search using natural language': '使用自然语言搜索',
		'Choose authors…': '选择作者…',
		'Choose files…': '选择文件…',
		'Choose a folder…': '选择文件夹…',
		'Copy Query': '复制查询',
		'Load more results...': '加载更多结果...',
		'Load more commits...': '加载更多提交...',
		'This result is hidden or unable to be shown on the Commit Graph': '此结果已隐藏或无法在提交图中显示',
		'Search commit messages to quickly find specific changes or features': '搜索提交消息，快速找到特定更改或功能',
		'Jump to a specific commit using its SHA': '使用 SHA 跳转到特定提交',
		'Filter to a specific branch or tag (solo), or compare ranges to see unique commits':
			'筛选特定分支或标签（单独使用），或比较范围以查看独有提交',
		'Filter by commit type — view only stashes or branch & tag tips': '按提交类型筛选 — 仅查看贮藏或分支/标签顶端',
		'Filter commits to only show stashes': '筛选提交，仅显示贮藏',
		'Filter commits to only show commits pointed to by branches or tags': '筛选提交，仅显示分支或标签指向的提交',
		'Track file changes across history (supports glob patterns)': '跟踪文件在历史中的更改（支持 glob 模式）',
		'Search code changes to find when specific functions or patterns were modified':
			'搜索代码更改，找到特定函数或模式被修改的时间',
		// Step 7: 解锁提示（带尾随空格的拼接片段）
		'Unlock this feature for privately hosted repos with ': '解锁私有托管仓库的此功能：',
		'Unlock this feature with ': '解锁此功能：',
		// Step 7: 变基（rebase）界面
		'Checking for conflicts...': '正在检查冲突...',
		'Start Rebase (Conflicts Detected)': '开始变基（检测到冲突）',
		'Start Rebase (No Conflicts Detected)': '开始变基（未检测到冲突）',
		'No Conflicts Detected (may be stale)': '未检测到冲突（可能已过期）',
		'No Conflicts Detected': '未检测到冲突',
		'Unable to detect conflicts': '无法检测冲突',
		'Rebase paused at breakpoint': '变基已在断点处暂停',
		'Rebase paused due to conflicts at ${s}': '变基因冲突暂停于 ${s}',
		'Rebase paused due to conflicts': '变基因冲突而暂停',
		'Rebase paused due to exec failure': '变基因 exec 失败而暂停',
		'Rebase paused for editing at ${s}': '变基已暂停以编辑 ${s}',
		'Rebase paused for editing': '变基已暂停以进行编辑',
		'Rebase paused for rewording at ${s}': '变基已暂停以改写 ${s} 的消息',
		'Rebase paused for rewording': '变基已暂停以改写提交消息',
		'Rebase paused at ${s}': '变基已暂停于 ${s}',
		'Rebase paused': '变基已暂停',
		'Let AI intelligently reorganize these commits with clearer messages and better logical grouping. <br><br> After recomposition, simply rebase again to apply these commits onto the target branch.':
			'让 AI 智能重组这些提交，提供更清晰的消息和更好的逻辑分组。<br><br> 重组完成后，再次变基即可将这些提交应用到目标分支。',
		// Step 7: 其他
		'Create Commits': '创建提交',
		'Collaborators only': '仅协作者',
		'Open Patch...': '打开补丁...',
		// Step 8: 单行压缩字符串遗漏（面板标题/按钮/工具提示，JS 赋值或属性形式）
		'Working Changes': '工作区更改',
		'Share as Cloud Patch': '共享为 Cloud Patch',
		'Close Suggestion for PR': '关闭 PR 更改建议',
		'View as List': '以列表查看',
		'View as Tree': '以树形查看',
		'No Files': '无文件',
		'Lines Added/Removed': '增加/删除的行数',
		'Generate Title and Description...': '生成标题和描述...',
		'Title (required)': '标题（必填）',
		'Description (optional)': '描述（可选）',
		'Title is required': '标题为必填项',
		'Staged Changes': '暂存的更改',
		'Collapse All': '全部折叠',
		'Expand All': '全部展开',
		'Select AI Model': '选择 AI 模型',
		'Choose an AI model to use': '选择要使用的 AI 模型',
		'Switch AI Provider/Model': '切换 AI 提供方/模型',
		'Switch to Text Editor': '切换到文本编辑器',
		'Force Push': '强制推送',
		'Graph Minimap': '图谱缩略图',
		'Zoom In': '放大',
		'Zoom Out': '缩小',
		'Explain Working Changes (Preview)': '解释工作区更改（预览）',
		'Explain Branch Changes (Preview)': '解释分支更改（预览）',
		'Code suggestions have been made on this pull request': '此拉取请求上已有代码建议',
		'Opt In Now': '立即启用',
		'All Access Week - now until July 11th!': 'All Access 全功能周 — 截止 7 月 11 日！',
		'Opt in now to get unlimited GitKraken AI until July 11th!':
			'立即启用，在 7 月 11 日前无限量使用 GitKraken AI！',
		'Opt in now to try all Advanced GitLens features with unlimited GitKraken AI for FREE until July 11th!':
			'立即启用，在 7 月 11 日前免费试用全部 GitLens Advanced 功能并无限量使用 GitKraken AI！',
		'Open Changes': '打开更改',
		'Switch Model': '切换模型',
		'Unable to resolve link': '无法解析链接',
		'Stash All': '全部贮藏',
		'Stash Changes': '贮藏更改',
		'Unknown error': '未知错误',
		'Click to learn more about Launchpad': '点击了解启动台的更多信息',
		'Learn More': '了解更多',
		"Please enter your provider's URL to use this feature": '请输入你的提供商 URL 以使用此功能',
		'Cancel Searching': '取消搜索',
		'Click to cancel searching': '点击取消搜索',
		'Go back to Launchpad': '返回启动台',
		'Switch to Branch': '切换到分支',
		'Create & Switch to Branch': '创建并切换到分支',
		'Switch to Local Branch & Fast-Forward': '切换到本地分支并快进',
		'Create & Switch to New Local Branch': '创建并切换到新本地分支',
		'Connect an integration to get started with Launchpad': '连接一个集成以开始使用启动台',
		'Connecting integrations...': '正在连接集成...',
		'Connecting cloud integrations...': '正在连接云端集成...',
		'Could not connect to Ollama server. Make sure Ollama is installed and running locally.':
			'无法连接到 Ollama 服务器。请确保 Ollama 已在本地安装并正在运行。',
		'Add Remote': '添加远程',
		'AI is Disabled': 'AI 已禁用',
		'Re-enable AI Features': '重新启用 AI 功能',
		'Enable Debug Logging': '启用调试日志',
		'Disable Debug Logging': '禁用调试日志',
		'Explain Branch Changes': '解释分支更改',
		'Explain Stash Changes': '解释贮藏更改',
		'No regeneration command found for this document.': '未找到此文档的重新生成命令。',
		'Unable to open changed & close unchanged files': '无法打开已更改并关闭未更改的文件',
		"Your Git version doesn't support stashing only staged changes. Stash all changes instead?":
			'你的 Git 版本不支持仅贮藏已暂存的更改。改为贮藏所有更改？',
		"Your Git version doesn't support stashing individual files. Stash all changes instead?":
			'你的 Git 版本不支持贮藏单个文件。改为贮藏所有更改？',
		'There are no staged changes to stash. Stash all changes instead?':
			'没有可贮藏的已暂存更改。改为贮藏所有更改？',
		'There are no unstaged changes to stash. Stash all changes instead?':
			'没有可贮藏的未暂存更改。改为贮藏所有更改？',
		'What could be improved?': '哪些方面可以改进？',
		'Select all that apply (optional)': '选择所有适用项（可选）',
		'Other feedback': '其他反馈',
		'Describe your experience...': '描述你的体验...',
		'Enter your feedback to help us improve our AI features (optional).':
			'输入你的反馈，帮助我们改进 AI 功能（可选）。',
		'Switching to ref...': '正在切换到引用...',
		'Running command...': '正在运行命令...',
		'Open the GitHub Access Tokens Page': '打开 GitHub 访问令牌页面',
		'Open the GitLab Access Tokens Page': '打开 GitLab 访问令牌页面',
		'Connect an Additional Integration...': '连接其他集成...',
		'All done! Take a vacation': '全部完成！休个假吧',
		'Open in Worktree': '在 Worktree 中打开',
		'Choose an action to perform': '选择要执行的操作',
		'Connect to GitHub...': '连接到 GitHub...',
		'Connect to GitLab...': '连接到 GitLab...',
		'Error retrieving issues': '获取议题时出错',
		'Enter optional message': '输入可选消息',
		'Choose Root Folder': '选择根文件夹',
		'Choose a Specific Folder...': '选择特定文件夹...',
		'Choose a Local Folder...': '选择本地文件夹...',
		'Choose Folder': '选择文件夹',
		'Copy Working Changes to Worktree': '将工作区更改复制到 Worktree',
		'GitLens has been disabled. Authentication is required for GitLens to work with remote GitHub repositories.':
			'GitLens 已被禁用。GitLens 需要身份验证才能使用远程 GitHub 仓库。',
		'Execute action': '执行操作',
		'Cannot swap comparisons with the working tree': '无法交换与 Working Tree 的比较',
		'Select AI Provider': '选择 AI 提供商',
		'Choose an AI provider to use': '选择要使用的 AI 提供商',
		'Connect to OpenAI-Compatible Provider': '连接到 OpenAI 兼容提供商',
		"This AI feature isn't included in your current plan. Please upgrade and try again.":
			'你当前的计划不包含此 AI 功能。请升级后重试。',
		'Please upgrade to GitLens Pro to access this AI feature and try again.':
			'请升级到 GitLens Pro 以使用此 AI 功能，然后重试。',
		'Your request is too large. Please reduce the size of your request or switch to a different model, and then try again.':
			'你的请求过大。请缩小请求规模或切换到其他模型，然后重试。',
		'Increase Limit': '提升限额',
		"Your request could not be completed because you've reached the weekly Al usage limit for your current plan. Upgrade to unlock more Al-powered actions.":
			'你的请求无法完成，因为已达到当前计划的每周 AI 使用上限。升级以解锁更多 AI 操作。',
		'Rate limit exceeded. Please wait a few moments or switch to a different model, and then try again.':
			'已超出速率限制。请稍候片刻或切换到其他模型，然后重试。',
		'Rate limit exceeded, or your account is out of funds. Please wait a few moments, check your account balance, or switch to a different model, and then try again.':
			'已超出速率限制，或你的账户余额不足。请稍候片刻、检查账户余额，或切换到其他模型，然后重试。',
		'GitKraken AI is temporarily unable to process your request due to high volume. Please wait a few moments and try again. If this issue persists, please contact support.':
			'由于请求量过大，GitKraken AI 暂时无法处理你的请求。请稍候片刻后重试。如果问题持续存在，请联系支持团队。',
		'The selected model is not supported for this request. Please select a different model and try again.':
			'所选模型不支持此请求。请选择其他模型后重试。',
		'You do not have access to the selected model. Please select a different model and try again.':
			'你无权访问所选模型。请选择其他模型后重试。',
		'You have denied access to the selected model. Please provide access or select a different model, and then try again.':
			'你已拒绝访问所选模型。请授予访问权限或选择其他模型，然后重试。',
		'Reset Current': '重置当前',
		'Reset All': '全部重置',
		'Do you want to reset all of the stored AI keys?': '是否要重置所有已存储的 AI 密钥？',
		'All stored AI keys have been reset. The configured keys were copied to your clipboard.':
			'所有已存储的 AI 密钥均已重置。已配置的密钥已复制到剪贴板。',
		'The stored AI key has been reset. The configured key was copied to your clipboard.':
			'已存储的 AI 密钥已重置。已配置的密钥已复制到剪贴板。',
		'Opt in for Unlimited AI': '启用无限量 AI',
		'Opt in and Switch to GitKraken AI': '启用并切换到 GitKraken AI',
		'No, Thanks': '不，谢谢',
		'Accept Only for this Workspace': '仅在此工作区接受',
		'GitLens AI features can send code snippets, diffs, and other context to your selected AI provider for analysis.':
			'GitLens AI 功能可能会将代码片段、diff 及其他上下文发送给你选择的 AI 提供商进行分析。',
		'Save up to 50% on GitLens Pro': 'GitLens Pro 最高可省 50%',
		'Upgrade now and Save up to 50% on GitLens Pro': '立即升级，GitLens Pro 最高可省 50%',
		'Welcome to GitLens': '欢迎使用 GitLens',
		'Verify the email we just sent you to start your Pro trial.':
			'请验证我们刚发送给你的电子邮件，以开始你的 Pro 试用。',
		'Your trial also includes access to the GitKraken DevEx platform, unleashing powerful Git visualization & productivity capabilities everywhere you work: IDE, desktop, browser, and terminal.':
			'你的试用还包含 GitKraken DevEx 平台的访问权限，在 IDE、桌面、浏览器和终端等所有工作场景释放强大的 Git 可视化与生产力能力。',
		'Community vs. Pro': 'Community 与 Pro 对比',
		'You are not eligible to reactivate your Pro trial. If you feel that is an error, please contact support.':
			'你不符合重新激活 Pro 试用的条件。如果你认为这是错误，请联系支持团队。',
		'Unable to reactivate trial: Too many failed requests. Please reload the window and try again.':
			'无法重新激活试用：失败请求过多。请重新加载窗口后重试。',
		'Unable to reactivate trial. Please try again. If this issue persists, please contact support.':
			'无法重新激活试用。请重试。如果问题持续存在，请联系支持团队。',
		"See What's New": '查看新功能',
		"Once you have verified your email address, click 'Recheck'.":
			'验证你的电子邮件地址后，请点击“重新检查”。',
		'Unable to resend verification email': '无法重新发送验证邮件',
		'Validating your account...': '正在验证你的账户...',
		'Retry Sign In': '重试登录',
		'Switch Organization': '切换组织',
		'Choose an active organization for your account': '为你的账户选择一个活动组织',
		'No new repositories found to add.': '未发现可添加的新仓库。',
		'New repositories found in the linked Cloud workspace. Would you like to add them to the current VS Code workspace?':
			'在关联的云端工作区中发现了新仓库。是否要将它们添加到当前 VS Code 工作区？',
		'Adding new repositories from linked cloud workspace...': '正在从关联的云端工作区添加新仓库...',
		'Choose a folder containing repositories for this workspace': '为此工作区选择一个包含仓库的文件夹',
		'Choose repositories from a folder': '从文件夹中选择仓库',
		'Choose repositories from the current window': '从当前窗口中选择仓库',
		'Choose repositories from the current window or a folder': '从当前窗口或文件夹中选择仓库',
		'Finding repositories to add to the workspace...': '正在查找可添加到工作区的仓库...',
		'No repositories found in the chosen folder.': '在所选文件夹中未找到仓库。',
		'All possible repositories are already in this workspace.': '所有可用仓库均已在此工作区中。',
		'Some repositories in this workspace could not be located locally. Do you want to continue?':
			'此工作区中的部分仓库无法在本地找到。是否继续？',
		'Choose the behavior of automatically adding missing repositories to the current VS Code workspace':
			'选择将缺失仓库自动添加到当前 VS Code 工作区的行为',
		'Linked Workspace: Automatically Add Repositories': '关联工作区：自动添加仓库',
		'Show HEAD': '显示 HEAD',
		'Show Branch': '显示分支',
		'Show Tag': '显示标签',
		'Show Commits': '显示提交',
		'Show Commit': '显示提交',
		'Use Current Window': '使用当前窗口',
		'Add Folder to Workspace': '将文件夹添加到工作区',
		'Upgrade to Advanced': '升级到 Advanced',
		'Failed to reload composer': '重新加载提交编排器失败',
		'Failed trying to find branches or tags that contain this commit': '查找包含此提交的分支或标签失败',
		' Working Tree': ' Working Tree',
		'Choose a branch or tag to show commits from': '选择要显示其提交的分支或标签',
		'Choose a base to compare against (e.g., main)': '选择要对比的基准（例如 main）',
		'Unable to recompose: commit must belong to exactly one local branch':
			'无法重新编排：提交必须恰好属于一个本地分支',
		'Start work on an issue from your connected integrations': '从已连接的集成中开始处理一个议题',
		'Disable & Sign Out': '禁用并退出登录',
		'GitLens AI features have been disabled by your GitKraken admin':
			'GitLens AI 功能已被你的 GitKraken 管理员禁用',
		'AI features have been disabled by your GitKraken admin.': 'AI 功能已被你的 GitKraken 管理员禁用。',
		'GitLens AI features have been disabled via settings': 'GitLens AI 功能已通过设置禁用',
		'AI features have been disabled via GitLens settings.': 'AI 功能已通过 GitLens 设置禁用。',
		'Cloud Patches are currently disabled. Would you like to enable them?':
			'Cloud Patch 功能当前已禁用。是否要启用？',
		'Choose Base...': '选择基准...',
		'Cloud Patches are securely stored by GitKraken and can be accessed by anyone with the link and a GitKraken account.':
			'Cloud Patch 由 GitKraken 安全存储，任何拥有链接和 GitKraken 账户的人都可以访问。',
		'No issue provided': '未提供议题',
		'Loading contributors...': '正在加载贡献者...',
		"Copied patch — use 'Apply Copied Patch' in another window to apply it":
			'已复制补丁 — 在另一个窗口中使用“应用已复制的补丁”来应用它',
		'No valid patch found in the clipboard': '剪贴板中未找到有效补丁',
		'This action can only be used on GitLens AI markdown documents.':
			'此操作只能用于 GitLens AI Markdown 文档。',
		'Failed to regenerate document. See output for more details.': '重新生成文档失败。详情请查看输出。',
		'AI Keys...': 'AI 密钥...',
		'Clears any locally stored AI keys': '清除本地存储的所有 AI 密钥',
		'AI Confirmations...': 'AI 确认记录...',
		'Clears any accepted AI confirmations': '清除已接受的所有 AI 确认记录',
		'Clears the stored avatar cache': '清除已存储的头像缓存',
		'Resets dismissed banners/notices': '重置已关闭的横幅/通知',
		'Integrations (Authentication)...': '集成（身份验证）...',
		'Clears any locally stored authentication for integrations': '清除本地存储的所有集成身份验证信息',
		'Suppressed Warnings...': '已抑制的警告...',
		'Clears any suppressed warnings, e.g. messages with "Don\'t Show Again" options':
			'清除所有已抑制的警告，例如带有“不再显示”选项的消息',
		'Usage Tracking...': '使用情况跟踪...',
		'Clears any locally tracked usage, typically used for first time experience':
			'清除本地跟踪的所有使用记录（通常用于首次使用体验）',
		'Workspace Storage...': '工作区存储...',
		'Clears stored data associated with the current workspace': '清除与当前工作区关联的已存储数据',
		'Reset Stored Data': '重置已存储数据',
		'Choose which data to reset, will be prompted to confirm': '选择要重置的数据，将提示你确认',
		'Open a Folder or Repo': '打开文件夹或仓库',
		'Unable to apply changes cleanly. Retry and allow conflicts?': '无法干净地应用更改。重试并允许冲突？',
		'Setting up the GitKraken MCP...': '正在设置 GitKraken MCP...',
		'GitKraken MCP is active in your AI chat, leveraging Git and your integrations to provide context and perform actions.':
			'GitKraken MCP 已在你的 AI 聊天中启用，借助 Git 和你的集成提供上下文并执行操作。',
		'Finish & Commit': '完成并提交',
		'Choose AI Model': '选择 AI 模型',
		'Unknown Model': '未知模型',
		'Committing...': '正在提交...',
		'Next &rarr;': '下一步 &rarr;',
		'&larr; Previous': '&larr; 上一步',
		'{{current}} of {{total}}': '{{current}} / {{total}}',
		'{current} of {total}': '{current} / {total}',
	}),
);

const runtimeFragmentTranslations = [
	// ===== Git 命令 QuickPick 流程（branch/tag/stash/remote 子命令标题与选择器） =====
	// 子命令前缀 Map：title = `${Map.get(subcommand)}${基名}`
	[
		'new Map([["create","Create"],["delete","Delete"],["prune","Prune"],["rename","Rename"],["upstream","Change Upstream"]])',
		'new Map([["create","创建"],["delete","删除"],["prune","清理"],["rename","重命名"],["upstream","更改上游"]])',
	],
	[
		'new Map([["add","Add"],["prune","Prune"],["remove","Remove"]])',
		'new Map([["add","添加"],["prune","清理"],["remove","移除"]])',
	],
	[
		'new Map([["apply","Apply"],["drop","Drop"],["list","List"],["pop","Pop"],["push","Push"],["rename","Rename"]])',
		'new Map([["apply","应用"],["drop","丢弃"],["list","列表"],["pop","弹出"],["push","贮藏"],["rename","重命名"]])',
	],
	[
		'new Map([["create","Create"],["delete","Delete"]])',
		'new Map([["create","创建"],["delete","删除"]])',
	],
	// 命令基名（拼在子命令前缀之后）；Worktree 按术语策略保留英文
	['"tag","tag","Tag"', '"tag","tag","标签"'],
	['"branch","branch","Branch"', '"branch","branch","分支"'],
	['"stash","stash","Stash"', '"stash","stash","贮藏"'],
	['"remote","remote","Remote"', '"remote","remote","远程"'],
	// 去掉前缀与基名之间的空格（创建 标签 → 创建标签）
	['.get(t)} ${e}`}', '.get(t)}${e}`}'],
	// 标题 "Create Tag at Commit xxx" 的 at 拼接
	[
		'.title} at ${(0,es.M4)(e.reference,{capitalize:!0,icon:!1})}',
		'.title}：${(0,es.M4)(e.reference,{capitalize:!0,icon:!1})}',
	],
	// reference 类型标签（Commit bf8084f → 提交 bf8084f）
	[
		'case"branch":return"Branch";case"stash":return"Stash";case"tag":return"Tag";default:return"Commit"',
		'case"branch":return"分支";case"stash":return"贮藏";case"tag":return"标签";default:return"提交"',
	],
	// 确认步骤标题
	['Confirm ${', '确认 ${'],
	// 分支/标签选择器 placeholder（整模板重排语序）
	[
		'Choose a branch${e.showTags?" or tag":""} to switch to',
		'选择要切换到的分支${e.showTags?"或标签":""}',
	],
	[
		'Choose a branch${e.showTags?" or tag":""} to cherry-pick from',
		'选择要从中拣选提交的分支${e.showTags?"或标签":""}',
	],
	[
		'Choose a branch${e.showTags?" or tag":""} to merge',
		'选择要合并的分支${e.showTags?"或标签":""}',
	],
	[
		'Choose a branch${e.showTags?" or tag":""} to rebase onto',
		'选择要变基到的分支${e.showTags?"或标签":""}',
	],
	[
		'Choose a branch${e.showTags?" or tag":""} to create the new tag from',
		'选择创建新标签所基于的分支${e.showTags?"或标签":""}',
	],
	[
		'Choose a branch${e.showTags?" or tag":""} to create the new worktree from',
		'选择创建新 Worktree 所基于的分支${e.showTags?"或标签":""}',
	],
	// 选择器空结果与修订输入提示
	[
		'No branches${t.showTags?" or tags":""} found in ${e.repo.name}',
		'${e.repo.name} 中没有分支${t.showTags?"或标签":""}',
	],
	[
		'${e.repo.name} has no branches${t.showTags?" or tags":""}',
		'${e.repo.name} 中没有分支${t.showTags?"或标签":""}',
	],
	[
		'No ${1===e.repos.length?"":"common "}branches${t.showTags?" or tags":""} found in ${1===e.repos.length?e.repos[0].name:`${e.repos.length} repos`}',
		'${1===e.repos.length?e.repos[0].name:`${e.repos.length} 个仓库`} 中没有${1===e.repos.length?"":"共同"}分支${t.showTags?"或标签":""}',
	],
	[' (or enter a revision using #)', '（或使用 # 输入修订）'],
	[
		'Compose your changes into organized, meaningful commits before committing them. Use AI to automatically structure your work into draft commits with clear messages and descriptions, or commit manually.',
		'在提交之前，将你的更改编排为条理清晰、有意义的提交。可以使用 AI 自动将工作整理成带有清晰消息和描述的草稿提交，也可以手动提交。',
	],
	// ===== Composer 页面（标题徽标、文件统计、提交按钮、diff2html 状态徽标） =====
	[
		'${this.state?.mode==="experimental"?"Experimental":"Preview"}',
		'${this.state?.mode==="experimental"?"实验性":"预览"}',
	],
	['Files Changed (${e})', '更改的文件（${e}）'],
	[
		'Create ${this.commits.length} ${1===this.commits.length?"Commit":"Commits"}',
		'创建 ${this.commits.length} 个提交',
	],
	['Committing ${e} commit${1===e?"":"s"}.', '正在提交 ${e} 个提交。'],
	['${this.fileCount} ${1===this.fileCount?"file":"files"}', '${this.fileCount} 个文件'],
	['${e.fileCount} ${1===e.fileCount?"file":"files"}', '${e.fileCount} 个文件'],
	['d2h-added-tag">ADDED</span>', 'd2h-added-tag">已添加</span>'],
	['d2h-changed-tag">CHANGED</span>', 'd2h-changed-tag">已更改</span>'],
	['d2h-deleted-tag">DELETED</span>', 'd2h-deleted-tag">已删除</span>'],
	['d2h-moved-tag">RENAMED</span>', 'd2h-moved-tag">已重命名</span>'],
	// ===== 提交图（搜索导航、minimap 侧栏图标、fetch/pull/push 工具栏 tooltip） =====
	[
		'Previous Match (Shift+Enter)&#10;First Match (Shift+Click)',
		'上一个匹配 (Shift+Enter)&#10;第一个匹配 (Shift+Click)',
	],
	[
		'Previous Match (Shift+Enter)<br />First Match (Shift+Click)',
		'上一个匹配 (Shift+Enter)<br />第一个匹配 (Shift+Click)',
	],
	['Next Match (Enter)&#10;Last Match (Shift+Click)', '下一个匹配 (Enter)&#10;最后一个匹配 (Shift+Click)'],
	['Next Match (Enter)<br />Last Match (Shift+Click)', '下一个匹配 (Enter)<br />最后一个匹配 (Shift+Click)'],
	[
		'tooltip:"Branches"},{type:"remotes",icon:"gl-remotes-view",command:"gitlens.showRemotesView",tooltip:"Remotes"},{type:"stashes",icon:"gl-stashes-view",command:"gitlens.showStashesView",tooltip:"Stashes"},{type:"tags",icon:"gl-tags-view",command:"gitlens.showTagsView",tooltip:"Tags"},{type:"worktrees",icon:"gl-worktrees-view",command:"gitlens.showWorktreesView",tooltip:"Worktrees"}',
		'tooltip:"分支"},{type:"remotes",icon:"gl-remotes-view",command:"gitlens.showRemotesView",tooltip:"远程"},{type:"stashes",icon:"gl-stashes-view",command:"gitlens.showStashesView",tooltip:"贮藏"},{type:"tags",icon:"gl-tags-view",command:"gitlens.showTagsView",tooltip:"标签"},{type:"worktrees",icon:"gl-worktrees-view",command:"gitlens.showWorktreesView",tooltip:"Worktree"}',
	],
	['eS` on ${this.branchState.provider.name}`', 'eS`（${this.branchState.provider.name}）`'],
	[
		'Pull ${tg("commit",this.branchState.behind)} from\n\t\t\t${this.upstream}${t}',
		'从 ${this.upstream}${t} 拉取 ${this.branchState.behind} 个提交',
	],
	[
		'${this.renderBranchPrefix()} ${tg("commit",this.branchState.behind)} behind and\n\t\t\t\t\t${tg("commit",this.branchState.ahead)} ahead of ${this.upstream}${t}',
		'${this.renderBranchPrefix()} 落后 ${this.upstream}${t} ${this.branchState.behind} 个提交，领先 ${this.branchState.ahead} 个提交',
	],
	[
		'${this.renderBranchPrefix()} ${tg("commit",this.branchState.behind)} behind\n\t\t\t\t${this.upstream}${t}',
		'${this.renderBranchPrefix()} 落后 ${this.upstream}${t} ${this.branchState.behind} 个提交',
	],
	[
		'Push ${tg("commit",this.branchState.ahead)} to ${this.upstream}${t}\n\t\t\t<hr />\n\t\t\t${this.renderBranchPrefix()} ${tg("commit",this.branchState.ahead)} ahead of ${this.upstream}',
		'推送 ${this.branchState.ahead} 个提交到 ${this.upstream}${t}\n\t\t\t<hr />\n\t\t\t${this.renderBranchPrefix()} 领先 ${this.upstream} ${this.branchState.ahead} 个提交',
	],
	['</span> is`}renderTooltipContent', '</span>`}renderTooltipContent'],
	['r=this.isBehind?"Pull":"Push"', 'r=this.isBehind?"拉取":"推送"'],
	['[Alt] Jump to Reference...', '[Alt] 跳转到引用...'],
	['Jump to Reference ${eW.Dot} ${t}', '跳转到引用 ${eW.Dot} ${t}'],
	['&mdash; not connected', '&mdash; 未连接'],
	// ===== 提交图检查面板（Graph Inspect / Overview tab tooltip 与标题） =====
	['Overview of &nbsp;', '概览：&nbsp;'],
	[
		'</span> is\n\t\t\t\t\t\t${e3("commit",this.wipStatus.behind)} behind and\n\t\t\t\t\t\t${e3("commit",this.wipStatus.ahead)} ahead of\n\t\t\t\t\t\t<span class="md-code">${this.wipStatus.upstream??"origin"}</span>',
		'</span> 落后 <span class="md-code">${this.wipStatus.upstream??"origin"}</span> ${this.wipStatus.behind} 个提交，领先 ${this.wipStatus.ahead} 个提交',
	],
	[
		'</span> is\n\t\t\t\t\t\t${e3("commit",this.wipStatus.behind)} behind\n\t\t\t\t\t\t<span class="md-code">${this.wipStatus.upstream??"origin"}</span>',
		'</span> 落后 <span class="md-code">${this.wipStatus.upstream??"origin"}</span> ${this.wipStatus.behind} 个提交',
	],
	[
		'</span> is\n\t\t\t\t\t\t${e3("commit",this.wipStatus.ahead)} ahead of\n\t\t\t\t\t\t<span class="md-code"> ${this.wipStatus.upstream??"origin"}</span>',
		'</span> 领先 <span class="md-code">${this.wipStatus.upstream??"origin"}</span> ${this.wipStatus.ahead} 个提交',
	],
	['${e3("working change",this.wipStatus.working)}', '${this.wipStatus.working} 项工作区更改'],
	['Switch to Another Branch...', '切换到其他分支...'],
	['}: Overview`', '}: 概览`'],
	['>Learn about autolinks<', '>了解 autolinks<'],
	['>Configure autolinks<', '>配置 autolinks<'],
	['>Connect an Integration<', '>连接集成<'],
	['Auto-Compose Commits', '自动编排提交'],
	['>No content available<', '>无可用内容<'],
	['>Learn More<', '>了解更多<'],
	['Commit Composer', '提交编排器'],
	['Repository State Changed', '仓库状态已变更'],
	['Loading Error', '加载错误'],
	['Operation Failed', '操作失败'],
	['Switch Branch...', '切换分支...'],
	['Jump to HEAD', '跳转到 HEAD'],
	['Jump to Reference...', '跳转到引用...'],
	['>Change Merge Target<', '>更改合并目标<'],
	['>Compare Branch with Merge Target<', '>将分支与合并目标比较<'],
	['>Cloud Patches<', '>Cloud Patch<'],
	['>Update Patch<', '>更新补丁<'],
	['>Zoom Out<', '>缩小<'],
	['>Conflict Detection (Pro)<', '>冲突检测（Pro）<'],
	['GitLens Launchpad', 'GitLens 启动台'],
	['GitLens: Open Launchpad', 'GitLens: 打开启动台'],
	['GitLens: Toggle Launchpad Indicator', 'GitLens: 切换启动台指示器'],
	['tooltip:\"Ahead\"', 'tooltip:\"领先\"'],
	['tooltip:\"Behind\"', 'tooltip:\"落后\"'],
	['tooltip:\"Diverged\"', 'tooltip:\"已分叉\"'],
	['tooltip:\"Unpublished\"', 'tooltip:\"未发布\"'],
	['tooltip:\"Current\"', 'tooltip:\"当前\"'],
	['tooltip:\"Favorited\"', 'tooltip:\"已收藏\"'],
	['tooltip:\"Ignored\"', 'tooltip:\"已忽略\"'],
	['tooltip:\"Untracked\"', 'tooltip:\"未跟踪\"'],
	['tooltip:\"Added\"', 'tooltip:\"已新增\"'],
	['tooltip:\"Deleted\"', 'tooltip:\"已删除\"'],
	['tooltip:\"Modified\"', 'tooltip:\"已修改\"'],
	['tooltip:\"Renamed\"', 'tooltip:\"已重命名\"'],
	['What is this?', '这是什么？'],
	['Hide Anyway', '仍然隐藏'],
	[
		'organizes your pull requests into actionable groups to help you focus and keep your team unblocked',
		'将你的拉取请求整理为可操作分组，帮助你保持专注并让团队保持畅通',
	],
	[
		"It's always accessible using the \\`GitLens: 打开启动台\\` command from the Command Palette.",
		'你始终可以从命令面板运行 \\`GitLens: 打开启动台\\` 命令来访问它。',
	],
	[
		'启动台 helps you focus and keep your team unblocked.\n\nAre you sure you want hide the indicator?',
		'启动台可帮助你保持专注并让团队保持畅通。\n\n确定要隐藏该指示器吗？',
	],
	[
		'Launchpad helps you focus and keep your team unblocked.\n\nAre you sure you want hide the indicator?',
		'启动台可帮助你保持专注并让团队保持畅通。\n\n确定要隐藏该指示器吗？',
	],
	[
		'You can always access 启动台 using the "GitLens: 打开启动台" command, and can re-enable the indicator with the "GitLens: 切换启动台指示器" command.',
		'你始终可以使用“GitLens: 打开启动台”命令访问启动台，并可通过“GitLens: 切换启动台指示器”命令重新启用该指示器。',
	],
	[
		'You can always access Launchpad using the "GitLens: 打开启动台" command, and can re-enable the indicator with the "GitLens: 切换启动台指示器" command.',
		'你始终可以使用“GitLens: 打开启动台”命令访问启动台，并可通过“GitLens: 切换启动台指示器”命令重新启用该指示器。',
	],
	['$(alert) Unable to load items', '$(alert) 无法加载项目'],
	['Unable to Load Items', '无法加载项目'],
	['Unable to load items (', '无法加载项目（'],
	['No pull requests need your attention\\', '没有需要你关注的拉取请求\\'],
	['No pull requests need your attention', '没有需要你关注的拉取请求'],
	['You are all caught up!', '已全部处理完毕！'],
	['"can be merged"', '"可合并"'],
	[' can be merged](', ' 可合并]('],
	['?"are blocked":d', '?"已阻塞":d'],
	['?"are blocked":u', '?"已阻塞":u'],
	['} ${o.length>1?"require":"requires"} follow-up]', '} 需要跟进]'],
	['} ${a.length>1?"require":"requires"} follow-up]', '} 需要跟进]'],
	['} ${o.length>1?"need":"needs"} your review]', '} 需要你评审]'],
	['} ${a.length>1?"need":"needs"} your review]', '} 需要你评审]'],
	['${m.length>1?"need":"needs"} reviewers', '需要评审者'],
	['${p.length>1?"need":"needs"} reviewers', '需要评审者'],
	['"failed CI checks"', '"存在失败的 CI 检查"'],
	['${m.length>1?"have":"has"} conflicts', '存在冲突'],
	['${p.length>1?"have":"has"} conflicts', '存在冲突'],
	['"is blocked"', '"已阻塞"'],
	['"needs reviewers"', '"需要评审者"'],
	['"has conflicts"', '"存在冲突"'],
	['"requires follow-up"', '"需要跟进"'],
	['"needs your review"', '"需要你评审"'],
	['>Visual File History<', '>可视化文件历史<'],
	['>Visual History<', '>可视化历史<'],
	['content="Show Visual File History view"', 'content="显示可视化文件历史视图"'],
	['aria-label="Show Visual File History view"', 'aria-label="显示可视化文件历史视图"'],
	[
		'this.isUncommitted?"Explain Working Changes":`Explain Changes in this ${this.isStash?"Stash":"Commit"}`',
		'this.isUncommitted?"解释工作区更改":this.isStash?"解释此贮藏中的更改":"解释此提交中的更改"',
	],
	[
		'this.isUncommitted?"解释工作区更改":`Explain Changes in this ${this.isStash?"Stash":"Commit"}`',
		'this.isUncommitted?"解释工作区更改":this.isStash?"解释此贮藏中的更改":"解释此提交中的更改"',
	],
	[
		'Copy ${null!=this.stashNumber?"Stash Name":"SHA"}<br />',
		'复制 ${null!=this.stashNumber?"贮藏名称":"SHA"}<br />',
	],
	['								Copy Message</span', '								复制消息</span'],
	[
		'Copy Link to ${d(t)} for ${i?.length?i[0].name:"Remote"}${i?.length===1?"":o.EO.Ellipsis}',
		'复制${i?.length?i[0].name:"远程"}的${d(t)==="Commit"?"提交":d(t)}链接${i?.length===1?"":o.EO.Ellipsis}',
	],
	[
		'Open ${d(t)} on ${i?.length===1?i[0].name:`${i?.length?i[0].name:"Remote"}${o.EO.Ellipsis}`}',
		'在${i?.length===1?i[0].name:`${i?.length?i[0].name:"远程"}${o.EO.Ellipsis}`}打开${d(t)==="Commit"?"提交":d(t)}',
	],
	['Open Commit on ${t?.length?t[0].name:"Remote"}', '在 ${t?.length?t[0].name:"远程"} 打开提交'],
	['Reset ${s?.name??"当前分支"} to Commit...', '将 ${s?.name??"当前分支"} 重置到此提交...'],
	[
		'Reset ${s?.name??"当前分支"} to Previous Commit...',
		'将 ${s?.name??"当前分支"} 重置到上一个提交...',
	],
	['Rebase ${s?.name??"当前分支"} onto Commit...', '将 ${s?.name??"当前分支"} 变基到此提交...'],
	['`${(0,s.td)("line",r)} added`', '`${r} 行新增`'],
	['`${(0,s.td)("line",o)} deleted`', '`${o} 行删除`'],
	['`${(0,s.td)("file",i)} added`', '`${i} 个文件新增`'],
	['`${(0,s.td)("file",r)} changed`', '`${r} 个文件更改`'],
	['`${(0,s.td)("file",o)} deleted`', '`${o} 个文件删除`'],
	['`${(0,s.td)("file",h.length,{zero:"No"})} changed`', '`${h.length} 个文件更改`'],
	['`${(0,s.td)("file",u.length,{zero:"No"})} changed`', '`${u.length} 个文件更改`'],
	['Commit is on ${r} ${"branch"===e?"branches":"tags"}', '提交位于 ${r} 个${"branch"===e?"分支":"标签"}'],
	['Changes in Pull Request #${t.id}', '拉取请求 #${t.id} 中的更改'],
	['Unable to create draft: ${e.message}', '无法创建草稿：${e.message}'],
	['Code Suggestion successfully created${i?"— link copied to the clipboard":""}', '代码建议已成功创建${i?" - 链接已复制到剪贴板":""}'],
	['						Incoming Changes', '						传入更改'],
	['						Outgoing Changes', '						传出更改'],
	['>Incoming Changes', '>传入更改'],
	['>Outgoing Changes', '>传出更改'],
	['>No uncommitted changes<', '>没有未提交更改<'],
	['>Try the Graph Minimap</p>', '>试试提交图小地图</p>'],
	['tooltip="Open in Editor"', 'tooltip="在编辑器中打开"'],
	['aria-label="Open in Editor"', 'aria-label="在编辑器中打开"'],
	['>Choose File / Folder...</gl-button', '>选择文件 / 文件夹...</gl-button'],
	['aria-label="Visualize folder history of ${e}"', 'aria-label="可视化 ${e} 的文件夹历史"'],
	['aria-label="Visualize folder history of ${i}"', 'aria-label="可视化 ${i} 的文件夹历史"'],
	['>Visualize Folder History', '>可视化文件夹历史'],
	['copyLabel="Copy Path&#10;&#10;${e}"', 'copyLabel="复制路径&#10;&#10;${e}"'],
	['<p>Please close this tab and try again</p>', '<p>请关闭此标签页后重试</p>'],
	['<p>No commits found for the specified time period</p>', '<p>指定时间段内未找到提交</p>'],
	['<p>Something went wrong</p>', '<p>出了点问题</p>'],
	['<menu-label>View Options</menu-label>', '<menu-label>视图选项</menu-label>'],
	['>View All Branches</gl-checkbox', '>查看所有分支</gl-checkbox'],
	['<label for="periods">Timeframe</label>', '<label for="periods">时间范围</label>'],
	['><label for="sliceBy">Slice By</label>', '><label for="sliceBy">切分方式</label>'],
	['>Author</option>', '>作者</option>'],
	['>Branch</option>', '>分支</option>'],
	['>All Branches</span', '>所有分支</span'],
	['>All Branches </sl-option>', '>所有分支 </sl-option>'],
	['> All Branches </sl-option>', '> 所有分支 </sl-option>'],
	['>Current Branch</sl-option>', '>当前分支</sl-option>'],
	['> Current Branch</sl-option>', '> 当前分支</sl-option>'],
	['Smart Branches', '智能分支'],
	['Favorited Branches', '收藏分支'],
	['Shows only relevant branches', '仅显示相关分支'],
	['Includes the current branch, its upstream, and its base or target branch', '包括当前分支、其上游分支，以及其基准或目标分支'],
	['Shows only branches that have been starred as favorites', '仅显示已标星收藏的分支'],
	['Also includes the current branch', '也包括当前分支'],
	['Hidden Branches / Tags', '隐藏的分支 / 标签'],
	['Show All', '显示全部'],
	['Change Reference...', '更改引用...'],
	['Showing All Branches', '正在显示所有分支'],
	['>Up to 1wk ago<', '>截至 1 周前<'],
	['>Up to 1mo ago<', '>截至 1 个月前<'],
	['>Up to 3mo ago<', '>截至 3 个月前<'],
	['>Up to 6mo ago<', '>截至 6 个月前<'],
	['>Up to 9mo ago<', '>截至 9 个月前<'],
	['>Up to 1yr ago<', '>截至 1 年前<'],
	['>Up to 2yr ago<', '>截至 2 年前<'],
	['>Up to 4yr ago<', '>截至 4 年前<'],
	['>All time<', '>全部时间<'],
	['>1 week</option>', '>1 周</option>'],
	['>1 month</option>', '>1 个月</option>'],
	['>3 months</option>', '>3 个月</option>'],
	['>6 months</option>', '>6 个月</option>'],
	['>9 months</option>', '>9 个月</option>'],
	['>1 year</option>', '>1 年</option>'],
	['>2 years</option>', '>2 年</option>'],
	['>4 years</option>', '>4 年</option>'],
	['>Full history</option>', '>完整历史</option>'],
	['>No results found<', '>未找到结果<'],
	['>Load more results...<', '>加载更多结果...<'],
	['>Load more commits...<', '>加载更多提交...<'],
	['Graph Filtering', '提交图筛选'],
	['Graph Filters', '提交图筛选器'],
	['Only follow the first parent of merge commits to provide a more linear history', '仅跟随合并提交的第一个父提交，以提供更线性的历史'],
	['Simplify Merge History', '简化合并历史'],
	['Hide Remote-only Branches', '隐藏仅远程分支'],
	['Hide Stashes', '隐藏贮藏'],
	['Hide Tags', '隐藏标签'],
	['Dim Merge Commit Rows', '淡化合并提交行'],
	['Toggle Minimap', '切换小地图'],
	['Minimap Options', '小地图选项'],
	['<menu-label>Minimap</menu-label>', '<menu-label>小地图</menu-label>'],
	['> Commits </gl-radio>', '> 提交 </gl-radio>'],
	['> Lines Changed </gl-radio>', '> 变更行数 </gl-radio>'],
	['<menu-label>Markers</menu-label>', '<menu-label>标记</menu-label>'],
	['Local Branches', '本地分支'],
	['Remote Branches', '远程分支'],
	['Pull Requests', '拉取请求'],
	['>Stashes<', '>贮藏<'],
	['>Tags<', '>标签<'],
	['>Open in Commit Graph<', '>在提交图中打开<'],
	['label="Open in Commit Graph"', 'label="在提交图中打开"'],
	['tooltip="Open in Commit Graph"', 'tooltip="在提交图中打开"'],
	['content="Open in Commit Graph"', 'content="在提交图中打开"'],
	['label="Switch to Branch..."', 'label="切换到分支..."'],
	['label="Visualize Branch History"', 'label="可视化分支历史"'],
	['label="Open in Branches View"', 'label="在分支视图中打开"'],
	['label="Open Worktree"', 'label="打开 Worktree"'],
	['alt-label="Open Worktree in New Window"', 'alt-label="在新窗口中打开 Worktree"'],
	['label="Open in Worktrees View"', 'label="在 Worktrees 视图中打开"'],
	['>Publish Branch<', '>发布分支<'],
	['Publish Branch<span', '发布分支<span'],
	['>Current work item</span>', '>当前工作项</span>'],
	['tooltip="Associate Issue with Branch"', 'tooltip="将议题关联到分支"'],
	['aria-label="Associate Issue with Branch"', 'aria-label="将议题关联到分支"'],
	['>Start Work on an Issue</gl-button>', '>开始处理议题</gl-button>'],
	['tooltip="Create New Branch"', 'tooltip="创建新分支"'],
		['>Connect to see PRs and Issue here</span>', '>连接后在此查看 PR 和议题</span>'],
		['>Error loading summary</li>', '>加载摘要时出错</li>'],
		['<li>Unable to load items</li>', '<li>无法加载项目</li>'],
		['<li>You are all caught up!</li>', '<li>已全部处理完毕！</li>'],
		['<li>No pull requests need your attention</li>', '<li>没有需要你关注的拉取请求</li>'],
		['other pull requests)</li>', '个其他拉取请求)</li>'],
		['${rg("pull request",o)} can be merged', '${o} 个拉取请求可合并'],
		[
			'${rg("pull request",o)} ${r[0].message}',
			'${o} 个拉取请求${r[0].message==="needs reviewers"||r[0].message==="need reviewers"?"需要评审者":r[0].message==="has failed CI checks"||r[0].message==="have failed CI checks"?"存在失败的 CI 检查":r[0].message==="has conflicts"||r[0].message==="have conflicts"?"存在冲突":r[0].message}',
		],
		[
			'${rg("pull request",o)} ${o>1?"are":"is"} blocked',
			'${o} 个拉取请求已阻塞',
		],
		[
			'${e.count} ${e.message}',
			'${e.count} ${e.message==="needs reviewers"||e.message==="need reviewers"?"需要评审者":e.message==="has failed CI checks"||e.message==="have failed CI checks"?"存在失败的 CI 检查":e.message==="has conflicts"||e.message==="have conflicts"?"存在冲突":e.message}',
		],
		[
			'${rg("pull request",o)} ${o>1?"require":"requires"}\n\t\t\t\t\t\t\t\t\t\tfollow-up',
			'${o} 个拉取请求需要跟进',
		],
		[
			'${rg("pull request",o)} ${o>1?"require":"requires"}\n\t\t\t\t\t\t\t\t\tfollow-up',
			'${o} 个拉取请求需要跟进',
		],
		[
			'${rg("pull request",o)} ${o>1?"need":"needs"} your\n\t\t\t\t\t\t\t\t\t\treview',
			'${o} 个拉取请求需要你评审',
		],
		[
			'<span\n\t\t\t\t\t\t\t\t\t>${rg("pull request",o)} ${o>1?"need":"needs"} your\n\t\t\t\t\t\t\t\t\treview</span',
			'<span\n\t\t\t\t\t\t\t\t\t>${o} 个拉取请求需要你评审</span',
		],
		['tooltip="Dismiss"', 'tooltip="关闭"'],
		['aria-label="Dismiss"', 'aria-label="关闭"'],
		['>GitLens Walkthrough', '>GitLens 演练'],
		['>Open Walkthrough<', '>打开演练<'],
		['>Walkthrough Progress', '>演练进度'],
		['\n\t\t\t\tWalkthrough Progress', '\n\t\t\t\t演练进度'],
	['homeView:"Home View"', 'homeView:"主页视图"'],
	['id:"gitlens.views.home",fileName:"home.html",title:"Home"', 'id:"gitlens.views.home",fileName:"home.html",title:"主页"'],
	['visualizeCodeHistory:"Visualize Code History"', 'visualizeCodeHistory:"可视化代码历史"'],
	['prReviews:"PR Reviews"', 'prReviews:"PR 评审"'],
	['integrations:"Integrations"', 'integrations:"集成"'],
	['aiFeatures:"AI Features"', 'aiFeatures:"AI 功能"'],
	['["prs","pull requests"],["issues","issues"]', '["prs","PR"],["issues","议题"]'],
	['["pinned","Pinned"]', '["pinned","已固定"]'],
	['["mergeable","Ready to Merge"]', '["mergeable","可合并"]'],
	['["blocked","Blocked"]', '["blocked","已阻塞"]'],
	['["follow-up","Requires Follow-up"]', '["follow-up","需要跟进"]'],
	['["needs-review","Needs Your Review"]', '["needs-review","需要你评审"]'],
	['["waiting-for-review","Waiting for Review"]', '["waiting-for-review","等待评审"]'],
	['["draft","Draft"]', '["draft","草稿"]'],
	['["other","Other"]', '["other","其他"]'],
	['["snoozed","Snoozed"]', '["snoozed","已稍后提醒"]'],
	['["mergeable",["Ready to Merge","Ready to merge"]]', '["mergeable",["可合并","可合并"]]'],
	[
		'["unassigned-reviewers",["Unassigned Reviewers","You need to assign reviewers"]]',
		'["unassigned-reviewers",["未分配评审者","你需要分配评审者"]]',
	],
	[
		'["failed-checks",["Failed Checks","You need to resolve the failing checks"]]',
		'["failed-checks",["检查失败","你需要解决失败的检查"]]',
	],
	[
		'["conflicts",["Resolve Conflicts","You need to resolve merge conflicts"]]',
		'["conflicts",["解决冲突","你需要解决合并冲突"]]',
	],
	[
		'["needs-my-review",["Needs Your Review","${author} requested your review"]]',
		'["needs-my-review",["需要你评审","${author} 请求你评审"]]',
	],
	[
		'["code-suggestions",["Code Suggestions","Code suggestions have been made on this pull request"]]',
		'["code-suggestions",["代码建议","此拉取请求中已有代码建议"]]',
	],
	[
		'["changes-requested",["Changes Requested","Reviewers requested changes before this can be merged"]]',
		'["changes-requested",["请求更改","评审者要求先更改后才能合并"]]',
	],
	[
		'["reviewer-commented",["Reviewers Commented","Reviewers have commented on this pull request"]]',
		'["reviewer-commented",["评审者已评论","评审者已在此拉取请求中评论"]]',
	],
	[
		'["waiting-for-review",["Waiting for Review","Waiting for reviewers to approve this pull request"]]',
		'["waiting-for-review",["等待评审","正在等待评审者批准此拉取请求"]]',
	],
	['["draft",["Draft","Continue working on your draft"]]', '["draft",["草稿","继续处理你的草稿"]]'],
	['["other",["Other","Opened by ${author} ${createdDateRelative}"]]', '["other",["其他","由 ${author} 在 ${createdDateRelative} 打开"]]'],
	['<span slot="heading">Launchpad</span>', '<span slot="heading">启动台</span>'],
		[
			`renderSectionLabel(){return this.isFetching||0===this.branches.length?this.label:\`\${this.label} (\${this.branches.length})\`}`,
			`getLocalizedLabel(){switch(this.label){case"recent":return"最近";case"stale":return"过期";default:return this.label}}renderSectionLabel(){let e=this.getLocalizedLabel();return this.isFetching||0===this.branches.length?e:\`\${e} (\${this.branches.length})\`}`,
		],
		[
			`e$\`<p>No \${this.label} branches</p>\``,
			`e$$\`<p>\${this.label==="recent"?"没有最近分支":this.label==="stale"?"没有过期分支":"没有 "+this.label+" 分支"}</p>\``,
		],
		['label:"1 day"', 'label:"1 天"'],
	[
		'<code-icon icon="question"></code-icon> Features which need a repository are currently\n\t\t\t\t\t\tunavailable',
		'<code-icon icon="question"></code-icon> 需要仓库的功能当前不可用',
	],
	['>Setup</h2>', '>设置</h2>'],
	['aria-label="Open GitLens Settings"', 'aria-label="打开 GitLens 设置"'],
	['content="Open GitLens Settings"', 'content="打开 GitLens 设置"'],
	['>Open GitLens Settings</span>', '>打开 GitLens 设置</span>'],
	['aria-label="Connect an Integration on GitKraken.dev"', 'aria-label="在 GitKraken.dev 连接集成"'],
	['content="Connect an Integration on GitKraken.dev"', 'content="在 GitKraken.dev 连接集成"'],
	['>Connect an Integration</span>', '>连接集成</span>'],
		['aria-label="Manage Integrations on GitKraken.dev"', 'aria-label="在 GitKraken.dev 管理集成"'],
		['content="Manage Integrations on GitKraken.dev"', 'content="在 GitKraken.dev 管理集成"'],
		['>Manage Integrations</span>', '>管理集成</span>'],
		['tooltip="Manage Integrations"', 'tooltip="管理集成"'],
		['aria-label="Manage Integrations"', 'aria-label="管理集成"'],
		['<span class="header__title">Integrations</span>', '<span class="header__title">集成</span>'],
		['<span class="chip__label">Connect</span>', '<span class="chip__label">连接</span>'],
		['tooltip="Synchronize Status"', 'tooltip="同步状态"'],
		['aria-label="Synchronize Status"', 'aria-label="同步状态"'],
			['tooltip="Manage Account"', 'tooltip="管理账户"'],
			['aria-label="Manage Account"', 'aria-label="管理账户"'],
			['tooltip="Sign Out"', 'tooltip="退出登录"'],
			['aria-label="Sign Out"', 'aria-label="退出登录"'],
			['aria-label="Switch Active Organization"', 'aria-label="切换活动组织"'],
			['>Switch Active Organization', '>切换活动组织'],
			['function oF(e){return"Enterprise"}', 'function oF(e){return"企业版"}'],
			['renderIncludesDevEx(){return e$`<p>Includes access to <a href="${rt.platform}">GitKraken\'s DevEx platform</a></p>`}', 'renderIncludesDevEx(){return e$$`<p>包含对 <a href="${rt.platform}">GitKraken DevEx 平台</a>的访问权限</p>`}'],
			['>Upgrade</span>', '>升级</span>'],
			['aria-label="Upgrade to Advanced"', 'aria-label="升级到 Advanced"'],
			['>Upgrade to Advanced</gl-button', '>升级到 Advanced</gl-button'],
			['>Upgrade to Pro</gl-button', '>升级到 Pro</gl-button'],
		['>Try GitLens Pro</gl-button', '>试用 GitLens Pro</gl-button'],
		['>&nbsp;Try GitLens Pro&nbsp;</gl-button', '>&nbsp;试用 GitLens Pro&nbsp;</gl-button'],
		['>Reactivate GitLens Pro Trial</gl-button', '>重新激活 GitLens Pro 试用</gl-button'],
		['>Reactivate Pro Trial</gl-button', '>重新激活 Pro 试用</gl-button'],
		['>Start ${14}-day Pro Trial</gl-button', '>开始 ${14} 天 Pro 试用</gl-button'],
		['title="Sign In"', 'title="登录"'],
		['>sign in</a', '>登录</a'],
			['>Refer a friend</a', '>推荐好友</a'],
			['&mdash; give 50% off and get up to $20', '&mdash; 给朋友 50% 优惠，你最高可获得 $20'],
			['<span class="header__title">Advantages of GitLens Pro</span>', '<span class="header__title">GitLens Pro 优势</span>'],
			['<li>Unlimited cloud integrations</li>', '<li>无限云集成</li>'],
			['<li>Smart AI features &mdash; 250K tokens/week</li>', '<li>智能 AI 功能 &mdash; 每周 250K tokens</li>'],
		['<li>Streamlined workflows &mdash; start work from issues, pull request reviews</li>', '<li>顺畅工作流 &mdash; 从议题和拉取请求评审开始工作</li>'],
		['<li>Self-hosted integrations</li>', '<li>自托管集成</li>'],
		['<li>Advanced AI features &mdash; 1M tokens/week</li>', '<li>高级 AI 功能 &mdash; 每周 1M tokens</li>'],
		['<span class="popup-title">Preview feature</span>', '<span class="popup-title">预览功能</span>'],
		['<span class="popup-title">Pro feature</span>', '<span class="popup-title">Pro 功能</span>'],
		['content="Pro features that do not require an account"', 'content="不需要账户的 Pro 功能"'],
		['Select AI model to enable AI features', '选择 AI 模型以启用 AI 功能'],
		['tooltip="Switch AI Provider/Model"', 'tooltip="切换 AI 提供商/模型"'],
		['aria-label="Switch AI Provider/Model"', 'aria-label="切换 AI 提供商/模型"'],
		['tooltip="Re-enable AI Features"', 'tooltip="重新启用 AI 功能"'],
		['aria-label="Re-enable AI Features"', 'aria-label="重新启用 AI 功能"'],
		['aria-label="Open Autolinks Settings"', 'aria-label="打开自动链接设置"'],
	['content="Open Autolinks Settings"', 'content="打开自动链接设置"'],
	['>Configure Autolinks</span>', '>配置自动链接</span>'],
	['>Popular</h2>', '>常用</h2>'],
	['aria-label="Show Commit Graph"', 'aria-label="显示提交图"'],
	['content="Show Commit Graph"', 'content="显示提交图"'],
	['>Commit Graph</span>', '>提交图</span>'],
		['aria-label="Open Launchpad"', 'aria-label="打开启动台"'],
		['content="Open Launchpad"', 'content="打开启动台"'],
		['<span class="nav-list__label">Launchpad</span', '<span class="nav-list__label">启动台</span'],
		['>New!</span>', '>新功能！</span>'],
	['aria-label="Show Commits view"', 'aria-label="显示提交视图"'],
	['content="Show Commits view"', 'content="显示提交视图"'],
	['>Commits</span>', '>提交</span>'],
	['aria-label="Show Inspect view"', 'aria-label="显示检查视图"'],
	['content="Show Inspect view"', 'content="显示检查视图"'],
	['>Inspect</span>', '>检查</span>'],
	['aria-label="Open Code Suggest walkthrough"', 'aria-label="打开 Code Suggest 演练"'],
	['content="Open Code Suggest walkthrough"', 'content="打开 Code Suggest 演练"'],
	['aria-label="Show Cloud Patches view"', 'aria-label="显示 Cloud Patches 视图"'],
	['content="Show Cloud Patches view"', 'content="显示 Cloud Patches 视图"'],
	['aria-label="Show File History view"', 'aria-label="显示文件历史视图"'],
	['content="Show File History view"', 'content="显示文件历史视图"'],
	['>File History</span>', '>文件历史</span>'],
	['aria-label="Show Stashes view"', 'aria-label="显示贮藏视图"'],
	['content="Show Stashes view"', 'content="显示贮藏视图"'],
	['aria-label="Show Search &amp; Compare view"', 'aria-label="显示搜索与比较视图"'],
	['content="Show Search &amp; Compare view"', 'content="显示搜索与比较视图"'],
	['>Search &amp; Compare</span>', '>搜索与比较</span>'],
	['aria-label="Show Cloud Workspaces view"', 'aria-label="显示 Cloud Workspaces 视图"'],
	['content="Show Cloud Workspaces view"', 'content="显示 Cloud Workspaces 视图"'],
	['>Cloud Workspaces</span>', '>Cloud Workspaces</span>'],
	['aria-label="Show Worktrees view"', 'aria-label="显示 Worktrees 视图"'],
	['content="Show Worktrees view"', 'content="显示 Worktrees 视图"'],
	['>Activity Bar</h2>', '>活动栏</h2>'],
		['aria-label="Show GitLens Side Bar"', 'aria-label="显示 GitLens 侧边栏"'],
		['content="Show GitLens Side Bar"', 'content="显示 GitLens 侧边栏"'],
		['content="Show Account view"', 'content="显示账户视图"'],
		['aria-label="Show GitLens Inspect Side Bar"', 'aria-label="显示 GitLens 检查侧边栏"'],
	['content="Show GitLens Inspect Side Bar"', 'content="显示 GitLens 检查侧边栏"'],
	['content="Show Source Control Side Bar"', 'content="显示源代码管理侧边栏"'],
	['>Source Control</span>', '>源代码管理</span>'],
	['>Commands</h3>', '>命令</h3>'],
	['aria-label="Show GitLens Commands"', 'aria-label="显示 GitLens 命令"'],
	['content="Show GitLens Commands"', 'content="显示 GitLens 命令"'],
	['>Commands</span>', '>命令</span>'],
	['aria-label="Open Git Command Palette"', 'aria-label="打开 Git 命令面板"'],
	['content="Open Git Command Palette"', 'content="打开 Git 命令面板"'],
	['>Git Command Palette</span>', '>Git 命令面板</span>'],
	['>Companion Tools</h2>', '>配套工具</h2>'],
		['aria-label="Try the GitKraken Browser Extension"', 'aria-label="试用 GitKraken 浏览器扩展"'],
		['content="Try the GitKraken Browser Extension"', 'content="试用 GitKraken 浏览器扩展"'],
		['>GitKraken Browser Extension</span>', '>GitKraken 浏览器扩展</span>'],
		['aria-label="Try the GitKraken CLI"', 'aria-label="试用 GitKraken CLI"'],
	['content="Try the GitKraken CLI"', 'content="试用 GitKraken CLI"'],
	['aria-label="Try GitKraken.dev"', 'aria-label="试用 GitKraken.dev"'],
	['content="Try GitKraken.dev"', 'content="试用 GitKraken.dev"'],
	['>GitLens is better with integrations!</strong>', '>连接集成后 GitLens 更好用！</strong>'],
		[
			'Connect hosting services like GitHub and issue trackers like Jira to track progress and take action\n\t\t\t\t\ton PRs and issues related to your branches.',
			'连接 GitHub 等托管服务和 Jira 等议题跟踪器，即可跟踪进展，并处理与你的分支相关的 PR 和议题。',
		],
		[
			'Connect hosting services like <strong>GitHub</strong> and issue trackers like\n\t\t\t\t\t\t\t\t\t\t<strong>Jira</strong> to track progress and take action on PRs and issues related to\n\t\t\t\t\t\t\t\t\t\tyour branches.',
			'连接 <strong>GitHub</strong> 等托管服务和 <strong>Jira</strong> 等议题跟踪器，即可跟踪进展，并处理与你的分支相关的 PR 和议题。',
		],
		[
			'Connect hosting services like <strong>GitHub</strong> and issue trackers like\n\t\t\t\t\t\t\t\t\t<strong>Jira</strong> to track progress and take action on PRs and issues related to\n\t\t\t\t\t\t\t\t\tyour branches.',
			'连接 <strong>GitHub</strong> 等托管服务和 <strong>Jira</strong> 等议题跟踪器，即可跟踪进展，并处理与你的分支相关的 PR 和议题。',
		],
		[
			'<p>\n\t\t\t\t\t\t\t\t\tConnect hosting services like <strong>GitHub</strong> and issue trackers like\n\t\t\t\t\t\t\t\t\t<strong>Jira</strong> to track progress and take action on PRs and issues related to\n\t\t\t\t\t\t\t\t\tyour branches.\n\t\t\t\t\t\t\t\t</p>',
			'<p>\n\t\t\t\t\t\t\t\t\t连接 <strong>GitHub</strong> 等托管服务和 <strong>Jira</strong> 等议题跟踪器，即可跟踪进展，并处理与你的分支相关的 PR 和议题。\n\t\t\t\t\t\t\t\t</p>',
		],
		[
			'Connect hosting services like <strong>GitHub</strong> and issue trackers like\n\t\t\t\t\t\t\t\t\t\t<strong>Jira</strong> to track progress and take action on PRs and issues related to\n\t\t\t\t\t\t\t\t\t\tyour branches.',
			'连接 <strong>GitHub</strong> 等托管服务和 <strong>Jira</strong> 等议题跟踪器，即可跟踪进展，并处理与你的分支相关的 PR 和议题。',
		],
		[
			'Connect hosting services like <strong>GitHub</strong> and issue trackers like\n\t\t\t\t\t\t\t\t\t\t<strong>Jira</strong> to track progress and take action on PRs and issues related to\n\t\t\t\t\t\t\t\t\t\tyour branches.',
			'连接 <strong>GitHub</strong> 等托管服务和 <strong>Jira</strong> 等议题跟踪器，即可跟踪进展，并处理与你的分支相关的 PR 和议题。',
		],
		[
			'Connect hosting services like <strong>GitHub</strong> and issue trackers like\n\t\t\t\t\t\t\t\t\t\t<strong>Jira</strong> to track progress and take action on PRs and issues related to\n\t\t\t\t\t\t\t\t\t\tyour branches.',
			'连接 <strong>GitHub</strong> 等托管服务和 <strong>Jira</strong> 等议题跟踪器，即可跟踪进展，并处理与你的分支相关的 PR 和议题。',
		],
		[
			'<strong>Jira</strong> to track progress and take action on PRs and issues related to\n\t\t\t\t\t\t\t\t\t\tyour branches.',
			'<strong>Jira</strong> 等议题跟踪器，即可跟踪进展，并处理与你的分支相关的 PR 和议题。',
		],
		['>Switch to Another Repository...', '>切换到其他仓库...'],
		['Switch to Another Repository...\n\t\t\t\t\t\t\t\t<hr />', '切换到其他仓库...\n\t\t\t\t\t\t\t\t<hr />'],
			['>Switch to Another Branch... </span>', '>切换到其他分支... </span>'],
			['>Explain Working Changes (Preview)</menu-item', '>解释工作区更改（预览）</menu-item'],
			['>Explain Branch Changes (Preview)</menu-item', '>解释分支更改（预览）</menu-item'],
			['>Share as Cloud Patch</menu-item', '>共享为 Cloud Patch</menu-item'],
			['>Create a Pull Request</span>', '>创建拉取请求</span>'],
			['tooltip="Create a Pull Request with AI (Preview)"', 'tooltip="使用 AI 创建拉取请求（预览）"'],
			['label="Open Pull Request Changes"', 'label="打开拉取请求更改"'],
			['label="Compare Pull Request"', 'label="比较拉取请求"'],
			['label="Open Pull Request Details"', 'label="打开拉取请求详情"'],
			['tooltip="Share as Cloud Patch"', 'tooltip="共享为 Cloud Patch"'],
			['aria-label="Additional Actions"', 'aria-label="更多操作"'],
		['<strong>Compose Commits</strong> (Preview)', '<strong>编排提交</strong>（预览）'],
		[
			'Automatically or interactively organize changes into meaningful commits',
			'自动或交互式地将更改整理为有意义的提交',
		],
		['>${a?"":"Pull"}', '>${a?"":"拉取"}'],
		['>${a?"":"Push"}', '>${a?"":"推送"}'],
		['> Connect Integrations</gl-button', '> 连接集成</gl-button'],
		['>Connect Integrations</gl-button', '>连接集成</gl-button'],
	['New Home View <code-icon icon="arrow-right"></code-icon>', '新版主页视图 <code-icon icon="arrow-right"></code-icon>'],
	['<strong>Switch to the new Home View!</strong><br />', '<strong>切换到新版主页视图！</strong><br />'],
	[
		"We've reimagined GitLens' Home to be a more helpful daily workflow tool. We're continuing to\n\t\t\t\t\t\trefine this experience and welcome your feedback.",
		'我们重新设计了 GitLens 主页，让它成为更有帮助的日常工作流工具。我们会继续改进体验，也欢迎你的反馈。',
	],
	['<h4 class="title">Welcome to the GitLens Home View</h4>', '<h4 class="title">欢迎使用 GitLens 主页视图</h4>'],
	[
		'Streamline your workflow — effortlessly track, manage, and collaborate on your branches and pull\n\t\t\t\t\trequests, all in one intuitive hub.',
		'在一个直观中心内轻松跟踪、管理并协作处理分支和拉取请求，让工作流更顺畅。',
	],
	['>Learn more</a>', '>了解更多</a>'],
	['tooltip="Dismiss Welcome"', 'tooltip="关闭欢迎提示"'],
		[
			'GitKraken MCP is active in your AI chat, leveraging Git and your integrations to provide context and perform actions. <a href="${rt.helpCenterMCP}">Learn more</a>',
			'GitKraken MCP 已在你的 AI 聊天中启用，可利用 Git 和集成来提供上下文并执行操作。<a href="${rt.helpCenterMCP}">了解更多</a>',
		],
		[
			'GitKraken MCP is active in your AI chat, leveraging Git and your integrations to provide context and perform actions. <a href="${rt.helpCenterMCP}">了解更多</a>',
			'GitKraken MCP 已在你的 AI 聊天中启用，可利用 Git 和集成来提供上下文并执行操作。<a href="${rt.helpCenterMCP}">了解更多</a>',
		],
		[
			'View pull requests and issues in Home, Commit Graph, Launchpad, autolinks, and more',
			'在主页、提交图、启动台、自动链接等位置查看拉取请求和议题',
		],
		['banner-title="GitKraken MCP Bundled with GitLens"', 'banner-title="GitLens 随附 GitKraken MCP"'],
		[
			'Leverage Git and your integrations (issues, PRs, etc) to provide context and perform actions in AI chat. <a href="${rt.helpCenterMCP}">Learn more</a>',
			'利用 Git 和你的集成（议题、PR 等）在 AI 聊天中提供上下文并执行操作。<a href="${rt.helpCenterMCP}">了解更多</a>',
		],
		[
			'Leverage Git and your integrations (issues, PRs, etc) to provide context and perform actions in AI chat. <a href="${rt.helpCenterMCP}">了解更多</a>',
			'利用 Git 和你的集成（议题、PR 等）在 AI 聊天中提供上下文并执行操作。<a href="${rt.helpCenterMCP}">了解更多</a>',
		],
		['banner-title="Install GitKraken MCP for GitLens"', 'banner-title="为 GitLens 安装 GitKraken MCP"'],
		['primary-button="Install GitKraken MCP"', 'primary-button="安装 GitKraken MCP"'],
		['secondary-button="Dismiss"', 'secondary-button="关闭"'],
	['<h1 class="alert__title">No repository detected</h1>', '<h1 class="alert__title">未检测到仓库</h1>'],
	[
		'To use GitLens, open a folder containing a git repository or clone from a URL from the\n\t\t\t\t\t\t\t\tExplorer.',
		'要使用 GitLens，请打开包含 Git 仓库的文件夹，或从资源管理器通过 URL 克隆仓库。',
	],
	['>Open a Folder or Repository</gl-button', '>打开文件夹或仓库</gl-button'],
	[
		'If you have opened a folder with a repository, please let us know by\n\t\t\t\t\t\t\t\t<a class="one-line" href="https://github.com/gitkraken/vscode-gitlens/issues/new/choose"\n\t\t\t\t\t\t\t\t\t>creating an Issue</a\n\t\t\t\t\t\t\t\t>.',
		'如果你已经打开了包含仓库的文件夹，请通过 <a class="one-line" href="https://github.com/gitkraken/vscode-gitlens/issues/new/choose">创建议题</a> 告诉我们。',
	],
	['<h1 class="alert__title">Unsafe repository</h1>', '<h1 class="alert__title">不安全的仓库</h1>'],
	[
		'Unable to open any repositories as Git blocked them as potentially unsafe, due to the\n\t\t\t\t\t\t\t\tfolder(s) not being owned by the current user.',
		'无法打开任何仓库，因为这些文件夹不归当前用户所有，Git 已将其作为潜在不安全仓库阻止。',
	],
	['>Manage in Source Control</gl-button', '>在源代码管理中处理</gl-button'],
	['<h1 class="alert__title">Untrusted workspace</h1>', '<h1 class="alert__title">不受信任的工作区</h1>'],
	['<p>Unable to open repositories in Restricted Mode.</p>', '<p>受限模式下无法打开仓库。</p>'],
		['>Manage Workspace Trust</gl-button', '>管理工作区信任</gl-button'],
		['>RECENT<', '>最近<'],
		['>LAUNCHPAD<', '>启动台<'],
		['>HOME<', '>主页<'],
		['>No recent branches<', '>没有最近分支<'],
	['Rich details for commits and stashes are shown as you navigate:', '浏览时会显示提交和贮藏的丰富详情：'],
	['>lines in the text editor</li>', '>文本编辑器中的行</li>'],
	['>Commits view</a>', '>提交视图</a>'],
	['>Stashes view</a>', '>贮藏视图</a>'],
	[
		'Alternatively, show your work-in-progress, or search for or choose a commit',
		'也可以显示当前 work-in-progress，或搜索/选择一个提交',
	],
	['>Overview</gl-button>', '>概览</gl-button>'],
	['>Choose Commit...</gl-button>', '>选择提交...</gl-button>'],
	['tooltip="Search for Commit"', 'tooltip="搜索提交"'],
	[
		'This ${this.isStash?"stash":"commit"} is not currently visible in the Commit Graph.',
		'此${this.isStash?"贮藏":"提交"}当前未在提交图中显示。',
	],
	['>Search using natural language<', '>使用自然语言搜索<'],
	['>Search using filters<', '>使用筛选器搜索<'],
	['Search commit messages to quickly find specific changes or features', '搜索提交消息，快速查找特定更改或功能'],
	['Compose Commits...', '编排提交...'],
	['Generate Commit Message', '生成提交消息'],
	['Stash All Changes...', '贮藏所有更改...'],
	['label="Fetch"', 'label="抓取"'],
	['tooltip="Fetch"', 'tooltip="抓取"'],
	['tooltip="Fetch All"', 'tooltip="全部抓取"'],
	['tooltip="Visualize Repo History"', 'tooltip="可视化仓库历史"'],
	['content="Fetch"', 'content="抓取"'],
	['tooltip:"Fetch"', 'tooltip:"抓取"'],
	['Fetch Merge Target<br />', '抓取合并目标<br />'],
	['tooltip="Change Merge Target"', 'tooltip="更改合并目标"'],
	['>Fetch<', '>抓取<'],
	['\n\t\t\t\t\tFetch\n\t\t\t\t\t${this.fetchedText', '\n\t\t\t\t\t抓取\n\t\t\t\t\t${this.fetchedText'],
	['Fetch from ${this.upstream}', '从 ${this.upstream} 抓取'],
	['Last fetched ${this.fetchedText}', '上次抓取 ${this.fetchedText}'],
	['Last fetched ', '上次抓取 '],
	['<code-icon icon="${t>0?"repo-pull":e>0?"repo-push":"repo-fetch"}" slot="prefix"></code-icon> ${i}', '<code-icon icon="${t>0?"repo-pull":e>0?"repo-push":"repo-fetch"}" slot="prefix"></code-icon> ${t>0?"拉取":e>0?"推送":"抓取"}'],
	['${t>0?"Pull from":e>0?"Push to":"Fetch from"} <strong>', '${t>0?"从以下位置拉取":e>0?"推送到":"从以下位置抓取"} <strong>'],
	['`No results for ${e.query}`', '`没有与 ${e.query} 匹配的结果`'],
	['>Resend Email</gl-button', '>重新发送邮件</gl-button'],
	[
		'>Unlock this feature with an account and may require GitLens Pro in the future</span',
		'>登录账号即可解锁此功能，将来可能需要 GitLens Pro</span',
	],
	['> Unlock this feature with GitLens Pro</span', '> 使用 GitLens Pro 解锁此功能</span'],
	['>May require GitLens Pro in the future</span', '>将来可能需要 GitLens Pro</span'],
	[
		'> Unlock this feature for privately hosted repos with GitLens Pro</span',
		'> 使用 GitLens Pro 解锁私有托管仓库的此功能</span',
	],
	['<p>For access to all Pro features:</p>', '<p>要访问所有 Pro 功能：</p>'],
	['>Prefix</label>', '>前缀</label>'],
	['Setting name: ', '设置名称：'],
	['Connect to Jira Cloud', '连接 Jira Cloud'],
	['Connect to Linear', '连接 Linear'],
	['sign up and ', '注册并'],
	['sign up and get access to automatic rich Jira autolinks.', '注册并使用自动丰富的 Jira 自动链接。'],
	['sign up and get access to automatic rich Linear autolinks.', '注册并使用自动丰富的 Linear 自动链接。'],
	['get access to automatic rich Jira autolinks.', '使用自动丰富的 Jira 自动链接。'],
	['get access to automatic rich Linear autolinks.', '使用自动丰富的 Linear 自动链接。'],
	[
		'Jira connected &mdash; automatic rich Jira autolinks are enabled.',
		'Jira 已连接 &mdash; 已启用自动丰富的 Jira 自动链接。',
	],
	[
		'Linear connected &mdash; automatic rich Linear autolinks are enabled.',
		'Linear 已连接 &mdash; 已启用自动丰富的 Linear 自动链接。',
	],
	['>Accept</gl-button', '>接受</gl-button'],
	['>Reject</gl-button', '>拒绝</gl-button'],
	['>Apply Patch</gl-button>', '>应用补丁</gl-button>'],
	['aria-label="Apply Patch Options..."', 'aria-label="应用补丁选项..."'],
	['title="Apply Patch Options..."', 'title="应用补丁选项..."'],
	['>Apply to a Branch</gk-menu-item>', '>应用到分支</gk-menu-item>'],
	['aria-label="Share Patch"', 'aria-label="共享补丁"'],
	['title="Share Patch"', 'title="共享补丁"'],
	['>Share</a', '>共享</a'],
	['title="Open on gitkraken.dev"', 'title="在 gitkraken.dev 打开"'],
	['>Cancel</gl-button>', '>取消</gl-button>'],
	['>Close</gl-button>', '>关闭</gl-button>'],
	['>Reload</gl-button>', '>重新加载</gl-button>'],
	['>OK</gl-button>', '>确定</gl-button>'],
	['<h2>Commits Generated</h2>', '<h2>提交已生成</h2>'],
	[' commits have been generated successfully!', ' 个提交已成功生成！'],
	['>Exit Composer</gl-button>', '>退出 Composer</gl-button>'],
	['aria-label="Composer actions"', 'aria-label="Composer 操作"'],
	['tooltip="Undo last action"', 'tooltip="撤销上一个操作"'],
	['tooltip="Redo last undone action"', 'tooltip="重做上一个撤销的操作"'],
	['tooltip="Reset to initial state"', 'tooltip="重置为初始状态"'],
	['>Undo</gl-button', '>撤销</gl-button'],
	['>Redo</gl-button', '>重做</gl-button'],
	['>Reset</gl-button', '>重置</gl-button'],
	['>Continue Preview</gl-button', '>继续预览</gl-button'],
	['<p>Try Commit Search</p>', '<p>试用提交搜索</p>'],
	[
		'Search for commits in your repo by author, commit message, SHA, file, change, or type.',
		'按作者、提交消息、SHA、文件、更改或类型搜索仓库中的提交。',
	],
	['<p class="popover__title">Conflict Detection Unavailable</p>', '<p class="popover__title">冲突检测不可用</p>'],
	['<span class="indicator__content">Conflict Detection Unavailable</span>', '<span class="indicator__content">冲突检测不可用</span>'],
	['<div class="entries-empty">No commits to rebase</div>', '<div class="entries-empty">没有可变基的提交</div>'],
	['<h1 class="header-title">GitLens Interactive Rebase</h1>', '<h1 class="header-title">GitLens 交互式变基</h1>'],
	['<span class="popup-title">${this.preview?"Preview feature":"Pro feature"}</span>', '<span class="popup-title">${this.preview?"预览功能":"Pro 功能"}</span>'],
	['plan provides access to all Pro features.', '方案可访问所有 Pro 功能。'],
	['You must verify your email before you can access Pro features.', '你必须先验证邮箱，才能访问 Pro 功能。'],
	['You must verify your email before you can continue.', '你必须先验证邮箱才能继续。'],
	['Your Pro trial has ended. You can now only use Pro features on publicly-hosted repos.', '你的 Pro 试用已结束。现在只能在公开托管仓库中使用 Pro 功能。'],
	['Please upgrade for full access to all GitLens Pro features:', '请升级以完整访问所有 GitLens Pro 功能：'],
	['Reactivate your Pro trial and experience all the new Pro features — free for another', '重新激活你的 Pro 试用，免费再体验所有新版 Pro 功能'],
	['Reactivate your GitLens Pro trial and experience', '重新激活你的 GitLens Pro 试用并体验'],
	['all the new\n\t\t\t\t\t\tPro features — free for another', '所有新版 Pro 功能，免费再体验'],
	['For full access to all GitLens Pro features,', '要访问所有 GitLens Pro 功能，'],
	['start your free ${14}-day Pro trial', '开始 ${14} 天 Pro 免费试用'],
	['— no credit card required.', '— 无需信用卡。'],
	// Step 4: 补充 runtime 片段翻译（按钮/操作）
	['Confirm Open Worktree', '确认打开 Worktree'],
	['Create Anyway', '仍然创建'],
	['Force Delete', '强制删除'],
	['Reset AI Keys', '重置 AI 密钥'],
	['Compare with HEAD', '与 HEAD 比较'],
	['Compare with Working Tree', '与 Working Tree 比较'],
	['Delete Branch', '删除分支'],
	// Step 6.4: 补充截图中需要片段匹配的字符串
	['Create New Branch from', '从此创建新分支'],
	['<strong>GitLens Home</strong> — track, manage, and collaborate on your branches and pull', '<strong>GitLens Home</strong> — 跟踪、管理和协作你的分支和拉取请求'],
	['requests, all in one intuitive hub', '一切尽在一个直观的中心'],
	['visualize the evolution of a repository', '可视化仓库的演变'],
	['identify when the most impactful changes were made', '识别何时做出最具影响力的更改'],
	['Pull with Rebase', '拉取并变基'],
	['Will pull', '将拉取'],
	// Step 7: 提交图搜索框（代码上下文精确片段）
	['get label(){return this.filter?"Filter":"Search"}', 'get label(){return this.filter?"筛选":"搜索"}'],
	[
		' commits using natural language (\\u2191\\u2193 for history), e.g. my commits from last week',
		'提交 — 使用自然语言（↑↓ 浏览历史），例如：我上周的提交',
	],
	[
		' commits (press Enter to search, \\u2191\\u2193 for history), e.g. @me after:1.week.ago file:*.ts',
		'提交（按 Enter 搜索，↑↓ 浏览历史），例如 @me after:1.week.ago file:*.ts',
	],
	['this.resultsLabel="result"', 'this.resultsLabel="个结果"'],
	[
		'tg(this.resultsLabel,this.total,{infix:this.resultsHasMore?"+ ":void 0})',
		'tg(this.resultsLabel,this.total,{infix:this.resultsHasMore?"+ ":void 0,plural:this.resultsLabel})',
	],
	['tg(this.resultsLabel,0,{zero:"No"})', 'tg("结果",0,{zero:"无",infix:"",plural:"结果"})'],
	['`${t} found`', '`已找到 ${t}`'],
	['</span> of <span>', '</span> / <span>'],
	['"GraphHeader-CommitGraph":"GRAPH"', '"GraphHeader-CommitGraph":"图谱"'],
	['</code-icon> Processing your natural language query...', '</code-icon> 正在处理你的自然语言查询...'],
	['`Query: <code>${this.processedQuery}</code>`', '`查询：<code>${this.processedQuery}</code>`'],
	[
		'Match Case${this.matchCaseOverride&&!this.matchCase?" (always on without regular expressions)":""}',
		'区分大小写${this.matchCaseOverride&&!this.matchCase?"（无正则表达式时始终开启）":""}',
	],
	[
		'Match Whole Word${this.matchWholeWordOverride&&!this.matchWholeWord?" (requires regular expressions)":""}',
		'全字匹配${this.matchWholeWordOverride&&!this.matchWholeWord?"（需要正则表达式）":""}',
	],
	// Step 7: 主页分支状态提示
	[
		't=this.branch?sD(this.branch):"Branch",r=this.upstream?sD(this.upstream):"its upstream"',
		't=this.branch?sD(this.branch):"分支",r=this.upstream?sD(this.upstream):"其上游"',
	],
	['${t} has diverged from ${r}', '${t} 已与 ${r} 产生分叉'],
	['${t} is behind ${r}', '${t} 落后于 ${r}'],
	['${t} is ahead of ${r}', '${t} 领先于 ${r}'],
	['${t} is missing its upstream ${r}', '${t} 缺失其上游 ${r}'],
	['${t} is up to date with ${r}', '${t} 已与 ${r} 保持同步'],
	["${t} is a local branch which hasn't been published", '${t} 是尚未发布的本地分支'],
	['${t} is a remote branch', '${t} 是远程分支'],
	['${t} is in a detached state, i.e. checked out to a commit or tag', '${t} 处于分离状态（即检出到某个提交或标签）'],
	['${t} is in an unknown state', '${t} 处于未知状态'],
	// Step 7: 提交详情（固定状态）
	[':"Inspect"}${this.state?.pinned?eC`(pinned)', ':"检查"}${this.state?.pinned?eC`（已固定）'],
	// Step 7: 变基确认弹窗属性
	['heading="Abort Rebase &amp; Recompose"', 'heading="中止变基并重新组合"'],
	['confirm="Abort &gt; Recompose"', 'confirm="中止 &gt; 重新组合"'],
];

// Step 7: 正则翻译通道 —— 处理跨行模板文本（bundle 中模板字符串保留换行缩进，
// 同一文案在不同文件中缩进不同），以及带 ${...} 插值的句子（用捕获组原样保留插值）。
// 注意：本通道在字面量/片段通道之前、于原始文本上执行，顺序为「长句优先」。
// 合并外部补充翻译表（由全量扫描 triage 产出）
// runtime-extra-literals.json：完整字符串字面量 → 走带引号的 literal 替换
// runtime-extra-fragments.json：模板字面量片段 → 走 raw 子串替换（已按 key 长度降序）
const extraLiteralsPath = path.join(import.meta.dirname, 'runtime-extra-literals.json');
if (fs.existsSync(extraLiteralsPath)) {
	const extraLiterals = JSON.parse(fs.readFileSync(extraLiteralsPath, 'utf8'));
	for (const [source, target] of Object.entries(extraLiterals)) {
		if (!runtimeLiteralTranslations.has(source)) runtimeLiteralTranslations.set(source, target);
	}
}
const extraFragmentsPath = path.join(import.meta.dirname, 'runtime-extra-fragments.json');
if (fs.existsSync(extraFragmentsPath)) {
	const extraFragments = JSON.parse(fs.readFileSync(extraFragmentsPath, 'utf8'));
	const existingFragmentKeys = new Set(runtimeFragmentTranslations.map(([source]) => source));
	for (const [source, target] of extraFragments) {
		if (!existingFragmentKeys.has(source)) runtimeFragmentTranslations.push([source, target]);
	}
}

function flexRegExp(text) {
	return new RegExp(escapeRegExp(text).replace(/ /g, '\\s+'), 'g');
}

// ===== 占位符模板层（variable-agnostic）=====
// 解决 minifier 变量名变体问题：用 ⟦⟧ 标记占位符位置，编译时把每个 ⟦⟧
// 转成捕获组 (\$\{[^{}]*\})（匹配任意单层 ${...} 表达式），value 里的 ⟦⟧
// 按出现顺序回填对应捕获组，从而原样保留运行时变量表达式。
//
// 适用：含简单（无嵌套大括号）占位符的固定文本模板，覆盖所有变量名变体。
// 不适用：占位符内含嵌套 {}（如三元 ${e.b?`'${e.b}'`:""}）— 仍走字面 fragment。
//
// 文件格式 scripts/runtime-extra-templates.json：[["key 含 ⟦⟧", "value 含 ⟦⟧"], ...]
const PLACEHOLDER = '⟦⟧';
const PLACEHOLDER_CAPTURE = '(\\$\\{[^{}]*\\})';

function compilePlaceholderTemplate(key, value) {
	// key 里占位符数量 = value 里占位符数量
	const keyHoles = key.split(PLACEHOLDER).length - 1;
	const valHoles = value.split(PLACEHOLDER).length - 1;
	if (keyHoles === 0) {
		throw new Error(`占位符模板无 ⟦⟧: ${JSON.stringify(key)}`);
	}
	if (keyHoles !== valHoles) {
		throw new Error(`占位符数量不匹配 key=${keyHoles} value=${valHoles}: ${JSON.stringify(key)}`);
	}
	// 固定文本段转义，占位符位置插入捕获组
	const pattern = key
		.split(PLACEHOLDER)
		.map(escapeRegExp)
		.join(PLACEHOLDER_CAPTURE);
	// value 里第 n 个 ⟦⟧ → $n 回填（捕获组从 1 计）
	let captureIndex = 0;
	const replacement = value.replace(
		new RegExp(PLACEHOLDER, 'g'),
		() => `$${++captureIndex}`,
	);
	return [new RegExp(pattern, 'g'), replacement];
}

const placeholderTemplateTranslations = [];
const extraTemplatesPath = path.join(import.meta.dirname, 'runtime-extra-templates.json');
if (fs.existsSync(extraTemplatesPath)) {
	const extraTemplates = JSON.parse(fs.readFileSync(extraTemplatesPath, 'utf8'));
	for (const [key, value] of extraTemplates) {
		placeholderTemplateTranslations.push(compilePlaceholderTemplate(key, value));
	}
}

const runtimeRegexTranslations = [
	// ===== Pro 试用横幅（graph/settings/timeline + home 变体）=====
	[
		/You have\s+<strong>\$\{(\w+)<1\?"<1 day":(\w+)\("day",\1,\{infix:" more "\}\)\} left<\/strong>\s+in your Pro trial\. Once your trial ends, you will only be able to use Pro features on\s+publicly-hosted repos\./g,
		'你的 Pro 试用还剩 <strong>${$1<1?"不足 1 天":$2("天",$1,{plural:"天"})}</strong>。试用结束后，你将只能在公开托管的仓库中使用 Pro 功能。',
	],
	[
		/You have\s+<strong>\$\{(\w+)<1\?"<1 day":(\w+)\("day",\1,\{infix:" more "\}\)\} left<\/strong>\s+in your \$\{"Student"===this\.planTier\?"Student":"Pro"\} trial\. Once your trial ends, you will\s+only be able to use Pro features on publicly-hosted repos\./g,
		'你的${"Student"===this.planTier?"学生":"Pro"}试用还剩 <strong>${$1<1?"不足 1 天":$2("天",$1,{plural:"天"})}</strong>。试用结束后，你将只能在公开托管的仓库中使用 Pro 功能。',
	],
	[
		flexRegExp('Your Pro trial has ended. You can now only use Pro features on publicly-hosted repos.'),
		'你的 Pro 试用已结束。现在你只能在公开托管的仓库中使用 Pro 功能。',
	],
	[flexRegExp('You only have access to'), '你当前仅可使用'],
	[flexRegExp('<span class="hint">local</span>'), '<span class="hint">本地</span>'],
	[flexRegExp('Pro features on publicly-hosted repos.'), 'Pro 功能（限公开托管的仓库）。'],
	[
		flexRegExp('<span class="popup-subtitle"> Unlock this feature for privately hosted repos with GitLens Pro</span>'),
		'<span class="popup-subtitle"> 使用 GitLens Pro 解锁私有托管仓库的此功能</span>',
	],
	[flexRegExp('will require GitLens Pro in the future'), '将来需要 GitLens Pro'],
	// ===== 合并目标状态（home/graph 当前工作项）=====
	[
		/Your current branch \$\{(\w+)\(this\.branch\.name\)\} has\s+\$\{"highest"!==this\.mergedStatus\.confidence\?"likely ":""\}been merged into its merge\s+target's local branch \$\{(\w+)\(this\.mergedStatus\.localBranchOnly\.name\)\}\./g,
		'你当前的分支 ${$1(this.branch.name)} ${"highest"!==this.mergedStatus.confidence?"可能":""}已合并到其合并目标的本地分支 ${$2(this.mergedStatus.localBranchOnly.name)}。',
	],
	[
		/Your current branch \$\{(\w+)\(this\.branch\.name\)\} has\s+\$\{"highest"!==this\.mergedStatus\.confidence\?"likely ":""\}been merged into its merge target\s+\$\{this\.renderInlineTargetEdit\(this\.target\)\}\./g,
		'你当前的分支 ${$1(this.branch.name)} ${"highest"!==this.mergedStatus.confidence?"可能":""}已合并到其合并目标 ${this.renderInlineTargetEdit(this.target)}。',
	],
	[
		/Your current branch \$\{(\w+)\(this\.branch\.name\)\} is\s+\$\{(\w+)\("commit",this\.status\.behind\)\} behind its merge target\s+\$\{this\.renderInlineTargetEdit\(this\.target\)\}\./g,
		'你当前的分支 ${$1(this.branch.name)} 落后于其合并目标 ${this.renderInlineTargetEdit(this.target)} ${$2("个提交",this.status.behind,{plural:"个提交"})}。',
	],
	[
		/Your current branch \$\{(\w+)\(this\.branch\.name\)\} is up to date with its merge target\s+\$\{this\.renderInlineTargetEdit\(this\.target\)\}\./g,
		'你当前的分支 ${$1(this.branch.name)} 已与其合并目标 ${this.renderInlineTargetEdit(this.target)} 保持同步。',
	],
	// ===== 功能预览 / 升级引导 =====
	[
		/After continuing, you will have \$\{(\w+)\("day",(3-\w+),\{infix:" more "\}\)\} to preview/g,
		'继续后，你还可以再预览 ${$1("天",$2,{plural:"天"})}',
	],
	[
		/\$\{this\.featureWithArticleIfNeeded\?`\$\{this\.featureWithArticleIfNeeded\} on`:""\} privately hosted\s+repos, or/g,
		'${this.featureWithArticleIfNeeded?`${this.featureWithArticleIfNeeded}`:""}（限私有托管仓库），或',
	],
	[
		/\$\{this\.featureWithArticleIfNeeded\?`\$\{this\.featureWithArticleIfNeeded\} on`:""\} privately hosted\s+repos\.<br \/>/g,
		'${this.featureWithArticleIfNeeded?`${this.featureWithArticleIfNeeded}`:""}（限私有托管仓库）。<br />',
	],
	[flexRegExp('Continue to preview'), '继续预览'],
	[/title="Sign In">sign in<\/a/g, 'title="登录">登录</a'],
	[/ For full access to all GitLens Pro features,/g, ' 要完整使用所有 GitLens Pro 功能，请'],
	[flexRegExp('— no credit card required.'), '—— 无需信用卡。'],
	[flexRegExp('>Continue</gl-button'), '>继续</gl-button'],
	// ===== Reactivate / 升级 / 账户 =====
	[
		/Reactivate your GitLens Pro trial and experience all the new Pro features — free for another\s+\$\{(\w+)\("day",14\)\}\./g,
		'重新激活你的 GitLens Pro 试用，体验所有新的 Pro 功能 —— 免费再享 ${$1("天",14,{plural:"天"})}。',
	],
	[
		/Reactivate your Pro trial and experience all the new Pro features — free for another\s+\$\{(\w+)\("day",14\)\}!/g,
		'重新激活你的 Pro 试用，体验所有新的 Pro 功能 —— 免费再享 ${$1("天",14,{plural:"天"})}！',
	],
	[
		/Reactivate your GitLens Pro trial and experience\s+\$\{this\.featureWithArticleIfNeeded\?`\$\{this\.featureWithArticleIfNeeded\} and `:""\}all the new\s+Pro features — free for another \$\{(\w+)\("day",14\)\}!/g,
		'重新激活你的 GitLens Pro 试用，体验${this.featureWithArticleIfNeeded?`${this.featureWithArticleIfNeeded}及`:""}所有新的 Pro 功能 —— 免费再享 ${$1("天",14,{plural:"天"})}！',
	],
	[/Reactivate your Pro trial for another \$\{(\w+)\("day",14\)\}/g, '重新激活 Pro 试用，再享 ${$1("天",14,{plural:"天"})}'],
	[flexRegExp('>Reactivate GitLens Pro Trial</gl-button'), '>重新激活 GitLens Pro 试用</gl-button'],
	[flexRegExp('>Reactivate Pro Trial</gl-button'), '>重新激活 Pro 试用</gl-button'],
	[flexRegExp('Please upgrade for full access to all GitLens Pro features:'), '请升级以完整使用所有 GitLens Pro 功能：'],
	[/Thank you for trying (<a href="\$\{\w+\.communityVsPro\}">GitLens Pro<\/a>)\./g, '感谢试用 $1。'],
	[
		flexRegExp('Continue leveraging Pro features and workflows for privately hosted repos by upgrading today.'),
		'立即升级，继续在私有托管仓库中使用 Pro 功能与工作流。',
	],
	[
		flexRegExp('Unlock advanced features and workflows for private repos, accelerate reviews, and streamline collaboration with'),
		'解锁私有仓库的高级功能与工作流，加速评审并简化协作 ——',
	],
	[/Get \$\{14\} days of GitLens Pro for free/g, '免费获取 ${14} 天 GitLens Pro'],
	[
		/Includes access to <a href="\$\{(\w+)\.platform\}">GitKraken's DevEx platform<\/a>/g,
		'包含 <a href="${$1.platform}">GitKraken DevEx 平台</a> 的访问权限',
	],
	[
		flexRegExp('>Upgrade to the Advanced plan for access to self-hosted integrations, advanced AI features @ 1M tokens/week, and more'),
		'>升级至 Advanced 计划，获享自托管集成、高级 AI 功能（每周 100 万 tokens）等更多内容',
	],
	[flexRegExp('<span class="upgrade-button">Upgrade</span>'), '<span class="upgrade-button">升级</span>'],
	[
		/You are in\s+\$\{(\w+)\("organization",([^,]+),\{infix:" other "\}\)\}/g,
		'你还属于另外 ${$1("个组织",$2,{plural:"个组织"})}',
	],
	[/See\s+<a href="\$\{(\w+)\.releaseNotes\}">what's new<\/a>\s+in GitLens\./g, '查看 GitLens <a href="${$1.releaseNotes}">新特性</a>。'],
	[
		/GitLens AI features have been\s+disabled\$\{!this\.aiSettingEnabled\?" via settings":" by your GitKraken admin"\}/g,
		'GitLens AI 功能已${!this.aiSettingEnabled?"通过设置":"被你的 GitKraken 管理员"}禁用',
	],
	[flexRegExp('<li>Smart AI features &mdash; 250K tokens/week</li>'), '<li>智能 AI 功能 &mdash; 每周 250K tokens</li>'],
	[
		flexRegExp('Powerful tools &mdash; Commit Graph, Visual History, &amp; Git Worktrees for private repos'),
		'强大工具 &mdash; 私有仓库可用的提交图、可视化历史与 Git Worktrees',
	],
	[
		flexRegExp('<li>Streamlined workflows &mdash; start work from issues, pull request reviews</li>'),
		'<li>顺畅工作流 &mdash; 从议题、拉取请求评审开始工作</li>',
	],
	// ===== 提交图顶栏工具提示 =====
	[
		flexRegExp('<strong>Launchpad</strong> &mdash; organizes your pull requests into actionable groups to help you focus and keep your team unblocked'),
		'<strong>启动台</strong> &mdash; 将拉取请求整理为可操作的分组，帮助你保持专注并避免团队阻塞',
	],
	[
		flexRegExp('<strong>Visual History</strong> — visualize the evolution of a repository, branch, folder, or file and identify when the most impactful changes were made and by whom'),
		'<strong>可视化历史</strong> — 可视化仓库、分支、文件夹或文件的演变，识别何时做出了最具影响力的更改以及由谁完成',
	],
	[
		flexRegExp('<strong>Install GitKraken MCP for GitLens</strong> <br />'),
		'<strong>为 GitLens 安装 GitKraken MCP</strong> <br />',
	],
	[
		flexRegExp('Leverage Git and Integration information from GitLens in AI chat.'),
		'在 AI 聊天中利用来自 GitLens 的 Git 与集成信息。',
	],
	[
		flexRegExp('Leverage Git and your integrations (issues, PRs, etc) to provide context and perform actions in AI chat.'),
		'在 AI 聊天中利用 Git 与你的集成（议题、PR 等）提供上下文并执行操作。',
	],
	[flexRegExp('<i> (in a worktree)</i>'), '<i>（位于 worktree 中）</i>'],
	// ===== 提交图功能介绍 / 迷你地图 =====
	[
		flexRegExp('&mdash; easily visualize your repository and keep track of all work in progress. Use the rich commit search to find a specific commit, message, author, a changed file or files, or even a specific code change.'),
		'&mdash; 轻松可视化你的仓库并跟踪所有进行中的工作。使用强大的提交搜索来查找特定的提交、消息、作者、变更的文件，甚至特定的代码更改。',
	],
	[
		flexRegExp('Search for commits in your repo by author, commit message, SHA, file, change, or type. Turn on the commit filter to show only commits that match your query.'),
		'按作者、提交消息、SHA、文件、更改或类型搜索仓库中的提交。开启提交筛选后，将仅显示与查询匹配的提交。',
	],
	[
		flexRegExp('Visualize the amount of changes to a repository over time, and inspect specific points in the history to locate branches, stashes, tags and pull requests.'),
		'可视化仓库随时间变化的更改量，并查看历史中的特定时间点，以定位分支、贮藏、标签和拉取请求。',
	],
	[flexRegExp('>Try the Graph Minimap</p>'), '>试试提交图小地图</p>'],
	// ===== 可视化历史（timeline）功能门 =====
	[
		flexRegExp('&mdash; visualize the evolution of a repository, branch, folder, or file and identify when the most impactful changes were made and by whom. Quickly see unmerged changes in files or folders, when slicing by branch.'),
		'&mdash; 可视化仓库、分支、文件夹或文件的演变，识别何时做出了最具影响力的更改以及由谁完成。按分支切片时，可快速查看文件或文件夹中未合并的更改。',
	],
	[
		flexRegExp('&mdash; visualize the evolution of a file and quickly identify when the most impactful changes were made and by whom. Quickly see unmerged changes in files or folders, when slicing by branch.'),
		'&mdash; 可视化文件的演变，快速识别何时做出了最具影响力的更改以及由谁完成。按分支切片时，可快速查看文件或文件夹中未合并的更改。',
	],
	[
		flexRegExp('<p>There are no editors open that can provide file history information.</p>'),
		'<p>当前没有可提供文件历史信息的已打开编辑器。</p>',
	],
	// ===== 搜索操作符示例 =====
	[
		flexRegExp('Use quotes to search for phrases, e.g. <code>message:"Updates dependencies"</code> or <code>=:"bug fix"</code>'),
		'使用引号搜索短语，例如 <code>message:"Updates dependencies"</code> 或 <code>=:"bug fix"</code>',
	],
	[
		flexRegExp('Use a name or email, e.g. <code>author:eamodio</code>, <code>@:john</code>, or <code>@me</code> for your own commits'),
		'使用姓名或邮箱，例如 <code>author:eamodio</code>、<code>@:john</code>；<code>@me</code> 表示你自己的提交',
	],
	[
		flexRegExp('Use a full or short commit SHA, e.g. <code>commit:4ce3a</code> or <code>#:4ce3a</code>'),
		'使用完整或简短的提交 SHA，例如 <code>commit:4ce3a</code> 或 <code>#:4ce3a</code>',
	],
	[
		flexRegExp('Use a reference to filter, e.g. <code>ref:main</code> or <code>^:v1.0.0</code>, or a range to compare, e.g. <code>ref:main..feature</code> (commits in feature but not in main)'),
		'使用引用进行筛选，例如 <code>ref:main</code> 或 <code>^:v1.0.0</code>；或使用范围进行比较，例如 <code>ref:main..feature</code>（在 feature 中但不在 main 中的提交）',
	],
	[
		flexRegExp('Use a path or filename, e.g. <code>file:package.json</code>, or a glob, e.g. <code>?:src/**/*.ts</code>'),
		'使用路径或文件名，例如 <code>file:package.json</code>；或使用 glob，例如 <code>?:src/**/*.ts</code>',
	],
	[
		flexRegExp('Use a code snippet or regex, e.g. <code>change:"function login"</code> or <code>~:"import.*React"</code>'),
		'使用代码片段或正则，例如 <code>change:"function login"</code> 或 <code>~:"import.*React"</code>',
	],
	[
		flexRegExp('Use a date string, e.g. <code>after:2022-01-01</code>, or a relative date, e.g. <code>since:3.weeks.ago</code> or <code>&gt;:1.month.ago</code>'),
		'使用日期字符串（例如 <code>after:2022-01-01</code>）或相对日期（例如 <code>since:3.weeks.ago</code>、<code>&gt;:1.month.ago</code>）',
	],
	[
		flexRegExp('Use a date string, e.g. <code>before:2022-01-01</code>, or a relative date, e.g. <code>until:3.weeks.ago</code> or <code>&lt;:1.month.ago</code>'),
		'使用日期字符串（例如 <code>before:2022-01-01</code>）或相对日期（例如 <code>until:3.weeks.ago</code>、<code>&lt;:1.month.ago</code>）',
	],
	[
		flexRegExp("Describe what you're looking for and let AI build the query, e.g. <code>my commits from last week</code> or <code>changes to package.json by eamodio last month</code>"),
		'描述你要查找的内容，让 AI 构建查询，例如 <code>my commits from last week</code> 或 <code>changes to package.json by eamodio last month</code>',
	],
	[
		flexRegExp('Combine filters to build powerful searches, e.g. <code>@me after:1.week.ago file:*.ts</code>'),
		'组合筛选器构建强大搜索，例如 <code>@me after:1.week.ago file:*.ts</code>',
	],
	// ===== 主页：分支 worktree / 跟踪状态 =====
	[
		flexRegExp('<p>Checked out in a worktree and has working (uncommitted) changes</p>'),
		'<p>已在 worktree 中检出，且有（未提交的）工作更改</p>',
	],
	[flexRegExp('<p>Checked out in a worktree</p>'), '<p>已在 worktree 中检出</p>'],
	[flexRegExp('<p>Has working (uncommitted) changes</p>'), '<p>有（未提交的）工作更改</p>'],
	[/\$\{(\w+)\("commit",o\.behind\)\} behind/g, '落后 ${$1("个提交",o.behind,{plural:"个提交"})}'],
	[/\$\{(\w+)\("commit",o\.ahead\)\} ahead of/g, '领先 ${$1("个提交",o.ahead,{plural:"个提交"})} 于'],
	[/(\$\{sD\(this\.branch\.name\)\}) is\s+(\$\{e\.join\(", "\)\})/g, '$1 $2'],
	[
		/(\$\{sD\(this\.branch\.name\)\}) is up to date with\s+(\$\{sD\(this\.branch\.upstream\?\.name\)\})/g,
		'$1 已与 $2 保持同步',
	],
	[/\$\{(\w+)\("file",e\.added\?\?0\)\} added/g, '新增 ${$1("个文件",e.added??0,{plural:"个文件"})}'],
	[/\$\{(\w+)\("file",e\.changed\?\?0\)\} changed/g, '修改 ${$1("个文件",e.changed??0,{plural:"个文件"})}'],
	[/\$\{(\w+)\("file",e\.deleted\?\?0\)\} deleted/g, '删除 ${$1("个文件",e.deleted??0,{plural:"个文件"})}'],
	[/(\$\{t\.join\(", "\)\}) in the working tree/g, 'Working Tree 中：$1'],
	// ===== 主页：合并目标状态 =====
	[
		/Your current branch (\$\{sD\(this\.branch\.name\)\}) has\s+\$\{"highest"!==this\.mergedStatus\.confidence\?"likely ":""\}been merged into its merge\s+target's local branch (\$\{sD\(this\.mergedStatus\.localBranchOnly\.name\)\})\./g,
		'你当前的分支 $1 ${"highest"!==this.mergedStatus.confidence?"可能":""}已合并入其合并目标的本地分支 $2。',
	],
	[
		/Your current branch (\$\{sD\(this\.branch\.name\)\}) has\s+\$\{"highest"!==this\.mergedStatus\.confidence\?"likely ":""\}been merged into its merge target/g,
		'你当前的分支 $1 ${"highest"!==this.mergedStatus.confidence?"可能":""}已合并入其合并目标',
	],
	[
		/Your current branch (\$\{sD\(this\.branch\.name\)\}) is\s+\$\{(\w+)\("commit",this\.status\.behind\)\} behind its merge target/g,
		'你当前的分支 $1 落后其合并目标 ${$2("个提交",this.status.behind,{plural:"个提交"})}：',
	],
	[
		/Your current branch (\$\{sD\(this\.branch\.name\)\}) is up to date with its merge target/g,
		'你当前的分支 $1 已与其合并目标保持同步：',
	],
	[
		/Merging will cause conflicts in\s+\$\{(\w+)\("file",this\.conflicts\.files\.length\)\} that will need to be resolved\./g,
		'合并将在 ${$1("个文件",this.conflicts.files.length,{plural:"个文件"})}中产生需要解决的冲突。',
	],
	[
		flexRegExp('<code-icon icon="error"></code-icon> Unable to detect conflicts.'),
		'<code-icon icon="error"></code-icon> 无法检测冲突。',
	],
	[
		flexRegExp('<code-icon icon="check"></code-icon> Merging will not cause conflicts.'),
		'<code-icon icon="check"></code-icon> 合并不会产生冲突。',
	],
	[
		/The "merge target" is the branch that (\$\{sD\(this\.branch\.name\)\}) is most likely to be\s+merged into\./g,
		'“合并目标”是 $1 最有可能被合并入的分支。',
	],
	[
		flexRegExp('<span class="header__title">Detect potential merge conflicts</span>'),
		'<span class="header__title">检测潜在的合并冲突</span>',
	],
	[
		flexRegExp('See when your current branch has potential conflicts with its merge target branch and take action to resolve them.'),
		'查看当前分支与其合并目标分支何时存在潜在冲突，并采取措施解决。',
	],
	// ===== 主页：AMA 卡片 =====
	[flexRegExp('<h4>Live AMA w/ the creator of GitLens</h4>'), '<h4>GitLens 作者线上 AMA 直播</h4>'],
	[flexRegExp('Feb 13 @ 1pm EST &mdash;'), '美东时间 2 月 13 日 13:00 &mdash;'],
	[flexRegExp('>Register now</a>'), '>立即报名</a>'],
	// ===== 提交详情（commitDetails）=====
	[
		flexRegExp('<p>Rich details for commits and stashes are shown as you navigate:</p>'),
		'<p>浏览时将显示提交和贮藏的详细信息：</p>',
	],
	[flexRegExp('<li>lines in the text editor</li>'), '<li>文本编辑器中的行</li>'],
	[
		flexRegExp('commits in the <a href="command:gitlens.showGraph">Commit Graph</a>, <a href="command:gitlens.showTimelineView">Visual File History</a>, or <a href="command:gitlens.showCommitsView">Commits view</a>'),
		'<a href="command:gitlens.showGraph">提交图</a>、<a href="command:gitlens.showTimelineView">可视化文件历史</a> 或 <a href="command:gitlens.showCommitsView">提交视图</a> 中的提交',
	],
	[
		flexRegExp('<li>stashes in the <a href="command:gitlens.showStashesView">Stashes view</a></li>'),
		'<li><a href="command:gitlens.showStashesView">贮藏视图</a> 中的贮藏</li>',
	],
	[
		flexRegExp('Alternatively, show your work-in-progress, or search for or choose a commit'),
		'或者，显示你的进行中工作，或搜索/选择一个提交',
	],
	[
		/This \$\{this\.isStash\?"stash":"commit"\} is not currently visible in the Commit Graph\./g,
		'此${this.isStash?"贮藏":"提交"}当前未显示在提交图中。',
	],
	[
		flexRegExp('label="Failed to load branches and tags. Click to retry."'),
		'label="加载分支和标签失败。点击重试。"',
	],
	[flexRegExp('<span class="mq-hide-sm">Failed to load</span>'), '<span class="mq-hide-sm">加载失败</span>'],
	[flexRegExp('label="Commit is not on any branch or tag"'), 'label="提交不在任何分支或标签上"'],
	[
		flexRegExp('<span class="mq-hide-sm">Not on any branch or tag</span>'),
		'<span class="mq-hide-sm">不在任何分支或标签上</span>',
	],
	[flexRegExp('Anyone with the link'), '任何拥有链接的人'],
	[flexRegExp('Members of my Org with the link'), '我的组织中拥有链接的成员'],
	[
		/(>\$\{\w+\}<\/a)\s*>\s+are\s+(<a)\s+(href="https:\/\/help\.gitkraken\.com\/gitlens\/security")\s+title="Learn more about GitKraken security"\s+aria-label="Learn more about GitKraken security"\s+>securely stored(<\/a)\s*>\s+by GitKraken\./g,
		'$1> 由 GitKraken $2 $3 title="了解 GitKraken 安全性" aria-label="了解 GitKraken 安全性" >安全存储$4>。',
	],
	[
		flexRegExp("will be securely stored in your organization's self-hosted storage"),
		'将安全地存储在你组织的自托管存储中',
	],
	[/title="Learn more about (\$\{\w+\})"/g, 'title="了解$1"'],
	[/aria-label="Learn more about (\$\{\w+\})"/g, 'aria-label="了解$1"'],
	[flexRegExp('title="Learn more about GitKraken security"'), 'title="了解 GitKraken 安全性"'],
	[flexRegExp('aria-label="Learn more about GitKraken security"'), 'aria-label="了解 GitKraken 安全性"'],
	[flexRegExp('Inspect Commit <span class="md-code"'), '检查提交 <span class="md-code"'],
	[flexRegExp('Inspect Stash <span class="md-code"'), '检查贮藏 <span class="md-code"'],
	[flexRegExp('Automatic following is suspended while pinned'), '固定期间已暂停自动跟随'],
	// ===== 提交组合器（composer）=====
	[flexRegExp('>Was this composition helpful?</p>'), '>此次组合对你有帮助吗？</p>'],
	[
		flexRegExp('Review the auto-generated draft commits below to inspect diffs and modify commit messages.'),
		'请检查下方自动生成的草稿提交，查看差异并修改提交消息。',
	],
	[flexRegExp('>Auto-Compose Commits with AI (Preview)</h4>'), '>使用 AI 自动组合提交（预览）</h4>'],
	[
		flexRegExp('Let AI organize your changes into well-formed commits with clear messages and descriptions that help reviewers.'),
		'让 AI 将你的更改整理为结构良好的提交，附带清晰的消息和描述，方便评审者理解。',
	],
	[flexRegExp('>Recompose Commits with AI (Preview)</h4>'), '>使用 AI 重新组合提交（预览）</h4>'],
	[
		flexRegExp('Let AI reorganize work into logical commits with clear messages and descriptions that help reviewers.'),
		'让 AI 将工作重组为逻辑清晰的提交，附带方便评审者理解的清晰消息和描述。',
	],
	[flexRegExp('placeholder="Include additional instructions"'), 'placeholder="输入附加指令"'],
	[
		flexRegExp('Providing additional instructions can help steer the AI composition for this session.'),
		'提供附加指令有助于引导本次会话的 AI 组合。',
	],
	[flexRegExp('Potential instructions include:'), '可用的指令示例：'],
	[flexRegExp('<li>conventional commits format</li>'), '<li>约定式提交格式</li>'],
	[flexRegExp('<li>size of commits</li>'), '<li>提交的大小</li>'],
	[flexRegExp('<li>focus on certain changes</li>'), '<li>聚焦特定更改</li>'],
	[
		flexRegExp('You can also specify custom instructions that apply to all composer sessions with the following setting:'),
		'你也可以通过以下设置指定适用于所有组合会话的自定义指令：',
	],
	[flexRegExp('>You will be able to review before committing</p>'), '>提交前你可以进行检查</p>'],
	[flexRegExp('>Create Commits</gl-button>'), '>创建提交</gl-button>'],
	[flexRegExp('> Cancel </gl-button>'), '>取消</gl-button>'],
	[flexRegExp('>Drop hunks here to create new commit</span>'), '>将代码块拖放到此处以创建新提交</span>'],
	[flexRegExp('>Drop hunks here to unassign</span>'), '>将代码块拖放到此处以取消分配</span>'],
	[
		flexRegExp('When working directory changes are present, draft commits will appear here.'),
		'当存在工作目录更改时，草稿提交将显示在此处。',
	],
	[flexRegExp('>Commit Composer Needs Something to Compose</h2>'), '>提交组合器需要可组合的内容</h2>'],
	[
		flexRegExp('Commit Composer helps you organize changes into meaningful commits before committing them and can leverage AI to do this automatically.'),
		'提交组合器帮助你在提交前将更改整理为有意义的提交，并可借助 AI 自动完成。',
	],
	[
		flexRegExp('Make some working directory changes and Reload or come back to this view to see how it works.'),
		'做一些工作目录更改后重新加载，或稍后回到此视图查看效果。',
	],
	[flexRegExp('Select a commit or unassigned changes to view details'), '选择提交或未分配的更改以查看详情'],
	[
		flexRegExp('The repository state has changed since Commit Composer was opened. Please reload to update with new changes.'),
		'自提交组合器打开以来，仓库状态已发生变化。请重新加载以获取新更改。',
	],
	// ===== 补丁详情（patchDetails）=====
	[flexRegExp('>Open Patch...</gl-button>'), '>打开补丁...</gl-button>'],
	[
		flexRegExp('<p>Let AI assist in understanding the changes made with this patch.</p>'),
		'<p>让 AI 协助理解此补丁所做的更改。</p>',
	],
	[flexRegExp('Collaborators only'), '仅协作者'],
	// ===== 变基（rebase）=====
	[
		flexRegExp('<span class="indicator__content">Checking for conflicts...</span>'),
		'<span class="indicator__content">正在检查冲突...</span>',
	],
	[flexRegExp('<p class="popover__title">No Conflicts Detected</p>'), '<p class="popover__title">未检测到冲突</p>'],
	[
		flexRegExp('<p class="popover__title">Potential Conflicts Detected</p>'),
		'<p class="popover__title">检测到潜在冲突</p>',
	],
	[
		/\$\{(\w+)\} Conflict\$\{1===\1\?"":"s"\}\s+Detected\$\{this\.stale\?" \(may be stale\)":""\}/g,
		'检测到 ${$1} 个冲突${this.stale?"（可能已过期）":""}',
	],
	[
		/Potential Conflicts\s+Detected\$\{this\.stale\?" \(may be stale\)":""\}/g,
		'检测到潜在冲突${this.stale?"（可能已过期）":""}',
	],
	[flexRegExp('This rebase should complete without conflicts.'), '此变基应当可顺利完成，不会产生冲突。'],
	[
		flexRegExp('Detection may be stale. Rebase plan was modified after conflict check.'),
		'检测结果可能已过期：变基计划在冲突检查后被修改过。',
	],
	[
		/This rebase will cause conflicts in \$\{(\w+)\("file",(\w+)\)\}:/g,
		'此变基将在 ${$1("个文件",$2,{plural:"个文件"})}中产生冲突：',
	],
	[
		flexRegExp('Detect potential conflicts before starting your rebase and take action to resolve them.'),
		'在开始变基前检测潜在冲突，并采取措施解决。',
	],
	[flexRegExp('This commit will cause conflicts'), '此提交将导致冲突'],
	[/>Start Rebase\s+\$\{/g, '>开始变基 ${'],
	[flexRegExp('>Abort</gl-button>'), '>中止</gl-button>'],
	// ===== 设置页自动链接提示 =====
	[
		flexRegExp('Matches prefixes that are followed by a reference value within commit messages.'),
		'匹配提交消息中后跟引用值的前缀。',
	],
	[
		flexRegExp('The URL must contain a <code>&lt;num&gt;</code> for the reference value to be included in the link.'),
		'URL 必须包含 <code>&lt;num&gt;</code>，引用值才会包含在链接中。',
	],
	// ===== Worktree 术语统一翻译 =====
	[/(?<![a-zA-Z])Worktrees(?![A-Za-z])/g, '工作树'],
	[/(?<![a-zA-Z])Worktree(?![A-Za-z])/g, '工作树'],
];

const settingsHtmlFeatureTranslations = new Map(
	Object.entries({
		'Inline Blame': '内联 Blame',
		'Git CodeLens': 'Git CodeLens',
		'Status Bar Blame': '状态栏 Blame',
		Hovers: '悬停提示',
		'File Annotations': '文件标注',
		'File Blame': '文件 Blame',
		'File Changes': '文件更改',
		'File Heatmap': '文件热力图',
		'Commit Graph': '提交图',
		'Commits view': '提交视图',
		'Inspect view': '检查视图',
		'Repositories view': '仓库视图',
		'File History view': '文件历史视图',
		'Line History view': '行历史视图',
		'Branches view': '分支视图',
		'Remotes view': '远程视图',
		'Stashes view': '贮藏视图',
		'Tags view': '标签视图',
		'Worktrees view': 'Worktrees 视图',
		'Contributors view': '贡献者视图',
		'Search & Compare view': '搜索与比较视图',
		'Search &amp; Compare view': '搜索与比较视图',
		'Interactive Rebase Editor': '交互式变基编辑器',
		Autolinks: '自动链接',
		'Terminal Links': '终端链接',
		'Dates & Times': '日期和时间',
		'Dates &amp; Times': '日期和时间',
		Sorting: '排序',
		'Menus & Toolbars': '菜单与工具栏',
		'Menus &amp; Toolbars': '菜单与工具栏',
		'Keyboard Shortcuts': '键盘快捷键',
		Modes: '模式',
	}),
);

const settingsHtmlTextTranslations = new Map(
	Object.entries({
		'Git Supercharged': 'Git 增强体验',
		Version: '版本',
		'Release notes': '发行说明',
		Settings: '设置',
		'collapse all': '全部折叠',
		'expand all': '全部展开',
		'Save settings for the': '设置保存范围',
		'For advanced customizations, refer to the': '如需高级自定义，请参阅',
		'GitLens docs': 'GitLens 文档',
		'and edit your': '并编辑你的',
		'User Settings': '用户设置',
		'Learn more': '了解更多',
		'Run command': '运行命令',
		'See available tokens': '查看可用 Token',
		'Open Settings UI': '打开设置 UI',
		'Settings UI': '设置 UI',
		'Open User Settings': '打开用户设置',
		'Open Keyboard Shortcuts': '打开键盘快捷键',
		'Open formatting docs': '打开格式化文档',
		'Open CHANGELOG': '打开 CHANGELOG',
			'Open Release Notes': '打开发行说明',
			'Collapse all sections': '折叠所有分组',
			'Expand all sections': '展开所有分组',
			'See the GitLens settings docs': '查看 GitLens 设置文档',
			'See Moment.js docs for supported date formats': '查看 Moment.js 文档了解支持的日期格式',
			'See possible BCP 47 language tag for supported locale values': '查看可用的 BCP 47 语言标签作为支持的区域设置值',
			'Show View in Side Bar': '在侧边栏显示视图',
			'Jump to': '跳转到',
		'Available Tokens': '可用 Token',
		'about formatting options': '了解格式化选项',
		'For more options, open the': '更多选项请打开',
			'For more options or to add your own custom modes, open the': '更多选项或添加自定义模式请打开',
			'and search for': '并搜索',
			'Search for': '搜索',
			Show: '显示',
			'Use the': '使用',
		'Use': '使用',
		'Can use': '可以使用',
		'command to override this setting for the current window': '命令覆盖当前窗口的此设置',
		'command to turn the annotations on or off': '命令开启或关闭标注',
		'command to quickly switch the active mode': '命令快速切换活动模式',
		'command to toggle Review mode': '命令切换评审模式',
		'command to toggle Zen mode': '命令切换禅模式',
		command: '命令',
		commands: '命令',
		submenu: '子菜单',
			'Add': '添加',
			'Add a': '添加',
			'Add an': '添加',
			'Adds a': '添加',
			'Add to the': '添加到',
		'Add Co-authors': '添加共同作者',
		'Add CodeLens to the following scopes': '将 CodeLens 添加到以下范围',
		'Add author avatars': '添加作者头像',
		'Add autolink': '添加自动链接',
		'Add blame details': '添加 Blame 详情',
		'Add changes (diff)': '添加更改（diff）',
		'Add gutter indicator': '添加行号槽指示器',
		'Add line highlight': '添加行高亮',
		'Add revision history navigation commands': '添加修订历史导航命令',
		'Add scroll bar indicator': '添加滚动条指示器',
		'Add the author and date of the most recent change for the file or code block':
			'添加文件或代码块最近一次更改的作者和日期',
		'Add the number of authors and the most prominent author of the file or code block':
			'添加文件或代码块的作者数量和主要作者',
		'Add a heatmap (age) indicator to show how recently lines were changed':
			'添加热力图（时间）指示器，显示各行最近更改的时间',
		'Add to the editor context menu': '添加到编辑器上下文菜单',
		'Add to the editor group toolbar': '添加到编辑器组工具栏',
		'Add to the editor tab context menu': '添加到编辑器标签上下文菜单',
		"Add to the editor's line number (gutter) context menu": '添加到编辑器行号槽上下文菜单',
		'Add to the Explorer items context menu': '添加到资源管理器项目上下文菜单',
		"Add to the GitHub Pull Request and Issues' pull request context menu": '添加到 GitHub 拉取请求和议题扩展的 PR 上下文菜单',
		'Add to the Source Control context menu': '添加到源代码管理上下文菜单',
		'Add to the Source Control groups context menu': '添加到源代码管理组上下文菜单',
		'Add to the Source Control groups toolbar': '添加到源代码管理组工具栏',
		'Add to the Source Control items context menu': '添加到源代码管理项目上下文菜单',
		'Add to the Source Control items toolbar': '添加到源代码管理项目工具栏',
		'Add to the Source Control repository context menu': '添加到源代码管理仓库上下文菜单',
		'Add to the Source Control repository toolbar': '添加到源代码管理仓库工具栏',
		'Adds an unobtrusive blame annotation at the end of the current line': '在当前行末尾添加低干扰的 Blame 标注',
		'Adds authorship CodeLens to the top of files and on code blocks': '在文件顶部和代码块上添加作者信息 CodeLens',
		'Adds a Git blame annotation about the current line to the status bar': '在状态栏添加当前行的 Git Blame 标注',
		'Adds detailed blame information accessible via hovers': '添加可通过悬停查看的详细 Blame 信息',
		'Adds on-demand blame annotations for the whole file': '为整个文件添加按需 Blame 标注',
		'Adds on-demand file changes annotations to highlight any local (unpublished) changes or lines changed by the most recent commit':
			'添加按需文件更改标注，以高亮本地未发布更改或最近一次提交更改的行',
		'Adds on-demand heatmap (age) indicators to the file to show how recently lines were changed':
			'向文件添加按需热力图（时间）指示器，显示各行最近更改的时间',
		'Adds autolinks for branches, tags, commits, and commit ranges in the integrated terminal':
			'在集成终端中为分支、标签、提交和提交范围添加自动链接',
		'Adds a user-friendly interactive rebase editor to easily configure an interactive rebase session':
			'添加易用的交互式变基编辑器，便于配置交互式变基会话',
		'Adds many helpful commands to the built-in menus &amp; toolbars': '向内置菜单与工具栏添加许多实用命令',
		'Show the Pull Request (if any) that introduced the commit': '显示引入该提交的拉取请求（如果有）',
		'Requires a connection to a supported remote service (e.g. GitHub)': '需要连接到受支持的远程服务（例如 GitHub）',
		'Requires a connection to a supported issue service (e.g. GitHub)': '需要连接到受支持的议题服务（例如 GitHub）',
		'Annotation&nbsp;format': '标注&nbsp;格式',
		'Uncommitted&nbsp;changes&nbsp;format': '未提交更改&nbsp;格式',
		'Commit&nbsp;label&nbsp;format': '提交&nbsp;标签&nbsp;格式',
		'Commit&nbsp;description&nbsp;format': '提交&nbsp;描述&nbsp;格式',
		'Stash&nbsp;label&nbsp;format': '贮藏&nbsp;标签&nbsp;格式',
		'Stash&nbsp;description&nbsp;format': '贮藏&nbsp;描述&nbsp;格式',
		'Date&nbsp;format': '日期&nbsp;格式',
		'Date&nbsp;locale': '日期&nbsp;区域设置',
		'Short&nbsp;date&nbsp;format': '短日期&nbsp;格式',
		'Time&nbsp;format': '时间&nbsp;格式',
		'Default&nbsp;worktree&nbsp;location': '默认&nbsp;Worktree&nbsp;位置',
		'Commit Graph&nbsp;': '提交图&nbsp;',
		'Worktrees view&nbsp;': 'Worktrees 视图&nbsp;',
		'Example:': '示例：',
		'Example date:': '日期示例：',
		'Example short date:': '短日期示例：',
		'Example time:': '时间示例：',
			'Override format for uncommitted changes': '覆盖未提交更改的格式',
			'format for uncommitted changes': '未提交更改的格式',
			'absolute path to put new worktrees into': '新 Worktree 的绝对存放路径',
			'defaults to `defaultDateFormat` value': '默认为 `defaultDateFormat` 值',
			'defaults to h:mma': '默认为 h:mma',
			'defaults to MMMM Do, YYYY h:mma': '默认为 MMMM Do, YYYY h:mma',
			'defaults to system short date format': '默认为系统短日期格式',
			'defaults to VS Code locale': '默认为 VS Code 区域设置',
			'Include the annotation when scrolling the editor horizontally': '编辑器水平滚动时包含该标注',
		'When enabled the annotation can be scrolled into view when it is outside the viewport.':
			'启用后，当标注位于视口之外时，可以滚动到可见区域。',
		'Setting this to': '将此设置为',
		'will inhibit the hovers from showing over the annotation; Set': '会阻止在标注上显示悬停提示；请将',
		'to enable the hovers to show anywhere over the line.': '设为可在整行任意位置显示悬停提示。',
			'At the top of the file': '在文件顶部',
			'Also applies to inline blame annotations': '也适用于内联 Blame 标注',
			'Applies only when showing folder history:': '仅适用于显示文件夹历史时：',
			'At the start of modules, classes, interfaces, etc': '在模块、类、接口等的开头',
		'At the start of functions, methods, etc': '在函数、方法等的开头',
		'File scope': '文件范围',
		'Containers scope': '容器范围',
		'Block scope': '代码块范围',
		'When clicked': '点击时',
		'toggles the file blame': '切换文件 Blame',
		'toggles the file blame (default)': '切换文件 Blame（默认）',
		'toggles the file heatmap': '切换文件热力图',
			'toggles the file changes since before the commit': '切换自该提交之前以来的文件更改',
			'toggles the file changes from the commit': '切换该提交中的文件更改',
			'toggles the Git CodeLens': '切换 Git CodeLens',
			'Toggle File Blame': '切换文件 Blame',
			'Toggle File Changes': '切换文件更改',
			'Toggle File Heatmap': '切换文件热力图',
		'opens changes with the previous revision': '打开与上一修订的更改比较',
		'opens line changes with the previous revision': '打开与上一修订的行更改比较',
		'opens line changes with the working file': '打开与工作区文件的行更改比较',
		'reveals the commit in the Side Bar': '在侧边栏显示该提交',
		'shows details of the commit': '显示提交详情',
		'shows quick details of the commit': '显示提交快速详情',
		'shows quick details of the commit (default)': '显示提交快速详情（默认）',
		'show quick file details of the commit': '显示提交的文件快速详情',
		'shows quick file details of the commit': '显示提交的文件快速详情',
		'shows quick file details of the commit (default)': '显示提交的文件快速详情（默认）',
		'shows the current file history': '显示当前文件历史',
		'shows the current branch history': '显示当前分支历史',
		'searches for commits within the range': '搜索该范围内的提交',
		'opens the commit on the remote service (when available)': '在远程服务上打开该提交（如果可用）',
		'copies the remote commit URL to the clipboard (when available)': '复制远程提交 URL 到剪贴板（如果可用）',
		'opens the file revision on the remote service (when available)': '在远程服务上打开文件修订（如果可用）',
		'copies the remote file revision URL to the clipboard (when available)': '复制远程文件修订 URL 到剪贴板（如果可用）',
		'Add the number of authors and the most prominent author of the file or code block':
			'添加文件或代码块的作者数量和主要作者',
		'Show hovers for the current line': '显示当前行悬停提示',
		'Shown when over the': '悬停在以下位置时显示',
		line: '行',
		'line &amp; annotation': '行和标注',
		'annotation only': '仅标注',
		'Customize on-demand blame, changes, or heatmap annotations for the whole file':
			'自定义整个文件的按需 Blame、更改或热力图标注',
		'Toggle annotations': '切换标注',
		'Press': '按下',
		'key to dismiss the active file annotations': '键可关闭当前文件标注',
		'to turn off the annotations': '关闭标注',
			'Add line highlight': '添加行高亮',
			'Add gutter indicator': '添加行号槽指示器',
			'Add scroll bar indicator': '添加滚动条指示器',
			'Avoids clearing the previous blame information when changing lines to reduce status bar "flashing"':
				'切换行时避免清除上一条 Blame 信息，以减少状态栏闪烁',
			'Compacts (deduplicates) matching adjacent blame annotations': '压缩（去重）相邻的相同 Blame 标注',
			'Reduce flashing when updating the annotation': '减少更新标注时的闪烁',
			'Preserve file annotations while editing': '编辑时保留文件标注',
		'Annotations will be shown from the last saved version': '标注将基于上次保存的版本显示',
		'After unsaved changes, pause recomputing annotations for': '有未保存更改后，暂停重新计算标注',
		'After unsaved changes, don\'t recompute annotations on files with more than': '有未保存更改后，不对超过以下规模的文件重新计算标注',
		lines: '行',
		ms: '毫秒',
		days: '天',
		'Files larger than the threshold will only be recomputed when saved': '超过阈值的文件只会在保存时重新计算',
		'Smaller delays will provide a better experience but will have a greater performance impact':
			'较短的延迟体验更好，但会带来更大的性能影响',
		'Highlight other lines changed by the same commit as the current line': '高亮与当前行由同一提交更改的其他行',
		'Add a heatmap (age) indicator to show how recently lines were changed':
			'添加热力图（时间）指示器，显示各行最近更改的时间',
		'Hot/cold threshold': '冷热阈值',
		'Fade out older lines': '淡化较旧的行',
		'Indicator color reflects the age of the most recent change (hot or cold), while indicator brightness ranges from bright (newer) to dim (older) based on the relative age':
			'指示器颜色反映最近更改的新旧（热或冷），亮度则根据相对时间从亮（较新）到暗（较旧）变化',
		'Position the heatmap on the': '将热力图放在',
		'Position the annotation on the': '将标注放在',
		left: '左侧',
		right: '右侧',
		'Show associated pull requests': '显示关联的拉取请求',
		'Show associated pull requests on remote branches': '在远程分支上显示关联的拉取请求',
		'Show the pull request associated with each branch': '显示每个分支关联的拉取请求',
		'Show the pull request associated with the current branch': '显示当前分支关联的拉取请求',
			'Show the pull request associated with the worktree branch': '显示 Worktree 分支关联的拉取请求',
			'Show the pull request that introduced each commit': '显示引入每个提交的拉取请求',
			'Show associated issues on branches': '在分支上显示关联议题',
			'Show hovers while annotating': '标注时显示悬停提示',
			'Show Inspect view': '显示检查视图',
			'Show Inspect view for commit links': '为提交链接显示检查视图',
			'Show remote names on remote branches': '在远程分支上显示远程名称',
		'Enhance autolinks with remote details': '使用远程详情增强自动链接',
		'Use autolinks to linkify external references, like Jira issues or Zendesk tickets, in commit messages.':
			'使用自动链接将提交消息中的外部引用（如 Jira 议题或 Zendesk 工单）转换为链接。',
		'Can be configured on a per-workspace or per-folder basis': '可按工作区或文件夹分别配置',
		'Show autolinks in commit messages': '在提交消息中显示自动链接',
		'Use author avatars': '使用作者头像',
		'Use author and remote avatars': '使用作者和远程头像',
		'Add author avatars': '添加作者头像',
		'Associated pull requests': '关联拉取请求',
		'Current branch status': '当前分支状态',
		'Working tree file changes': 'Working Tree 文件更改',
		'Incoming Activity (Experimental)': '传入活动（实验性）',
		'Copy Remote File URL *': '复制远程文件 URL *',
		'Prefer showing the Commit Graph in the': '优先在以下位置显示提交图',
		'bottom panel': '底部面板',
		'editor area': '编辑器区域',
		'Show commits from all branches': '显示所有分支的提交',
		'Show markers on the Commit Graph scrollbar': '在提交图滚动条上显示标记',
		'Show ghost branch / tag when hovering over or selecting a commit': '悬停或选择提交时显示幽灵分支/标签',
		'Highlight associated rows when hovering over a branch': '悬停在分支上时高亮关联行',
		'Dim merge commit rows': '淡化合并提交行',
		'Layout branches': '分支布局',
		'Layout tags': '标签布局',
		'Sort branches': '分支排序',
		'Sort tags': '标签排序',
		'Sort repositories': '仓库排序',
		'Sort contributors': '贡献者排序',
		'Layout files': '文件布局',
		'Compacts (flattens) unnecessary nesting when using a tree layouts': '使用树形布局时压缩（展平）不必要的嵌套',
		'Chooses the best layout based on the number of files at each nesting level': '根据每个嵌套层级的文件数量选择最佳布局',
		'as a list': '以列表显示',
		'as a tree': '以树形显示',
		'automatically': '自动',
		'individually for each file': '按每个文件分别显示',
		'for all files': '适用于所有文件',
		'only when opening': '仅打开时',
		'show file status': '显示文件状态',
		'show file type (default)': '显示文件类型（默认）',
		'by name, ascending': '按名称升序',
		'by name, descending': '按名称降序',
		'by recent commit date, ascending': '按最近提交日期升序',
		'by recent commit date, descending': '按最近提交日期降序',
		'by last fetched date, ascending': '按上次抓取日期升序',
		'by last fetched date, descending': '按上次抓取日期降序',
		'by commit count, ascending': '按提交数升序',
		'by commit count, descending': '按提交数降序',
		'by discovery or workspace order': '按发现或工作区顺序',
		'newest commit first (default)': '最新提交优先（默认）',
		'oldest commit first': '最旧提交优先',
		'Allow relative date formatting': '允许相对日期格式',
		'Shows dates absolutely, e.g.': '以绝对日期显示，例如',
		'Shows some dates relatively, e.g. 1 day ago': '部分日期以相对时间显示，例如 1 天前',
		'to follow the system locale, or enter a locale language tag, e.g. en-US': '跟随系统区域设置，或输入区域语言标签，例如 en-US',
		'for the system locale, or a locale language tag, e.g. en-US': '表示系统区域设置，或区域语言标签，例如 en-US',
		system: '系统',
		'Relative date': '相对日期',
		'Relative, e.g. 1 day ago': '相对日期，例如 1 天前',
		'Absolute, e.g. August 8th, 2016 10:48am': '绝对日期，例如 2016 年 8 月 8 日 10:48',
		'Relative or absolute based on date setting': '根据日期设置显示相对或绝对日期',
		'Relative or absolute date based on date setting': '根据日期设置显示相对或绝对日期',
		'Short relative or absolute based on date setting': '根据日期设置显示短相对或短绝对日期',
		'Short relative or absolute date based on date setting': '根据日期设置显示短相对或短绝对日期',
		'Authored Date': '作者日期',
		'Authored Date (Short)': '作者日期（短）',
		'Commit Date': '提交日期',
		'Commit Date (Short)': '提交日期（短）',
		'Commit or Authored Date': '提交或作者日期',
		'Commit or Authored Date (Short)': '提交或作者日期（短）',
		'Committed vs Authored based on setting': '根据设置使用提交日期或作者日期',
		'Commit SHA': '提交 SHA',
		'Commit Author': '提交作者',
		'Commit Author First Name': '提交作者名',
		'Commit Author Last Name': '提交作者姓',
		'Commit Author (except you)': '提交作者（不含你）',
		'Commit Author E-mail': '提交作者邮箱',
		'Commit Message': '提交消息',
		'Branch & Tag Tips': '分支和标签提示',
		'Changes Indicator': '变更指示器',
		'Changes Indicator (short)': '变更指示器（短）',
		'Pull Request': '拉取请求',
		'Pull request (if any) that introduced the commit': '引入该提交的拉取请求（如果有）',
		'Pull Request State': '拉取请求状态',
		'State (open, merged, closed) of the pull request (if any) that introduced the commit':
			'引入该提交的拉取请求（如果有）的状态（打开、已合并、已关闭）',
		'Indicates if the commit is a tip of any branches or tags': '指示该提交是否是任何分支或标签的尖端',
		'Indicates adds, changes, renames, and deletes': '指示新增、更改、重命名和删除',
		'Open Changes': '打开更改',
		'Open Changes with': '用以下方式打开更改',
		'Open Changed Files': '打开已更改文件',
		'Close Unchanged Files': '关闭未更改文件',
		'Open on Remote (Web)': '在远程打开（Web）',
		'Open Worktree for Pull Request': '为拉取请求打开 Worktree',
		'Copy As': '复制为',
		'Copy as Patch': '复制为补丁',
		'Copy Relative Path': '复制相对路径',
		'Share as Cloud Patch...': '共享为 Cloud Patch...',
		'Generate Commit Message (Experimental)': '生成提交消息（实验性）',
		'Show Commit Graph': '显示提交图',
			'Stash All Changes': '贮藏所有更改',
			'Stash Changes': '贮藏更改',
			Share: '共享',
			'File Annotations submenu': '文件标注子菜单',
			'File History': '文件历史',
			'File icons': '文件图标',
			Branches: '分支',
			Commits: '提交',
			Contributors: '贡献者',
			Remotes: '远程',
			Stashes: '贮藏',
			Tags: '标签',
			'Visualize Repository History': '可视化仓库历史',
			'GitLens: Switch Mode': 'GitLens: 切换模式',
			'GitLens: Toggle File Blame Annotations': 'GitLens: 切换文件 Blame 标注',
			'GitLens: Toggle File Changes Annotations': 'GitLens: 切换文件更改标注',
			'GitLens: Toggle File Heatmap Annotations': 'GitLens: 切换文件热力图标注',
			'GitLens: Toggle Git CodeLens': 'GitLens: 切换 Git CodeLens',
			'GitLens: Toggle Line Blame Annotations': 'GitLens: 切换行 Blame 标注',
			'GitLens: Toggle Review Mode': 'GitLens: 切换评审模式',
			'GitLens: Toggle Zen Mode': 'GitLens: 切换禅模式',
			'Alt': 'Alt',
		'Ctrl+Shift+G': 'Ctrl+Shift+G',
		'Esc': 'Esc',
		'alt-based': '基于 Alt',
		'chorded (default)': '组合键（默认）',
		'user-defined': '用户自定义',
		'keyboard shortcuts': '键盘快捷键',
		'based (': '基于（',
		'on macOS) shortcuts. Not great for non-English keyboard layouts': '在 macOS 上）快捷键。不太适合非英文键盘布局',
		'Chorded shortcuts that start with': '以以下组合键开头的快捷键',
		'on macOS). Better for non-English keyboard layouts': '在 macOS 上）。更适合非英文键盘布局',
		"GitLens won't bind any keyboard shortcuts. Configure your own via the": 'GitLens 不会绑定任何键盘快捷键。可通过',
		'editor': '编辑器自行配置',
		'editor to see the shortcuts and to customize them further': '编辑器查看快捷键并进一步自定义',
		'Supports user-defined modes for quickly toggling between sets of settings': '支持用户定义模式，用于在多组设置之间快速切换',
		'Show the active mode in the status bar': '在状态栏显示活动模式',
		'Always ask where to put new worktrees': '始终询问新 Worktree 放置位置',
			'Current branch': '当前分支',
			'current branch': '当前分支',
			'working tree': 'Working Tree',
			'false': 'false',
			'or': '或',
			'and': '和',
			'in the': '在',
			'to see rich details for a commit': '查看提交的丰富详情',
			'when selection changes (default)': '选区变化时（默认）',
		'with a user-selected reference (branch, tag, etc)': '与用户选择的引用（分支、标签等）比较',
		'Show a comparison of the': '显示以下内容的比较',
		'Show a comparison of the branch with a user-selected reference (branch, tag, etc)':
			'显示分支与用户选择的引用（分支、标签等）的比较',
		'Show a comparison of the worktree branch with a user-selected reference (branch, tag, etc)':
			'显示 Worktree 分支与用户选择的引用（分支、标签等）的比较',
		'Comparison of the': '比较对象',
		'Automatically refresh when a repository or the file system changes': '当仓库或文件系统发生更改时自动刷新',
		'Automatically reveal repository when opening files': '打开文件时自动显示对应仓库',
		'Show the following sections under each repository': '在每个仓库下显示以下分组',
		'Show upstream status on local branches with remotes': '在有远程的本地分支上显示上游状态',
		'Use compact view': '使用紧凑视图',
		'Use compact file layout': '使用紧凑文件布局',
		'more rows when scrolling': '滚动时加载更多行',
		'rows at first and': '初始加载行数，以及',
		'rows from the edge': '距离边缘的行数',
		'search results at first and when paging': '初始和分页时的搜索结果数',
		'Start scrolling at': '开始滚动位置',
		'&nbsp;then page in': '&nbsp;之后分页加载',
		'to search and explore commit histories by message, author, files, id, etc, or visualize comparisons between branches, tags, commits, and more':
			'按消息、作者、文件、ID 等搜索和探索提交历史，或可视化比较分支、标签、提交等',
		'to visualize, explore, and manage a Git repository': '可视化、探索和管理 Git 仓库',
		'to visualize, explore, and manage Git repositories': '可视化、探索和管理 Git 仓库',
		'to visualize, explore, and manage Git commits': '可视化、探索和管理 Git 提交',
		'to visualize, explore, and manage Git branches': '可视化、探索和管理 Git 分支',
		'to visualize, explore, and manage Git remotes and remote branches': '可视化、探索和管理 Git 远程和远程分支',
		'to visualize, explore, and manage Git stashes': '可视化、探索和管理 Git 贮藏',
		'to visualize, explore, and manage Git tags': '可视化、探索和管理 Git 标签',
		'to visualize, explore, and manage Git worktrees': '可视化、探索和管理 Git Worktree',
		'to visualize, navigate, and explore contributors': '可视化、导航和探索贡献者',
		'to visualize, navigate, and explore the revision history of the current file, a specified file or folder, or just the selected lines of the current file':
			'可视化、导航和探索当前文件、指定文件/文件夹，或当前文件选中行的修订历史',
		'to visualize, navigate, and explore the revision history of the selected lines of current file':
			'可视化、导航和探索当前文件选中行的修订历史',
		', hidden by default, to visualize, explore, and manage Git repositories':
			'，默认隐藏，用于可视化、探索和管理 Git 仓库',
		', hidden by default, to visualize, navigate, and explore contributors':
			'，默认隐藏，用于可视化、导航和探索贡献者',
		', hidden by default, to visualize, navigate, and explore the revision history of the selected lines of current file':
			'，默认隐藏，用于可视化、导航和探索当前文件选中行的修订历史',
	}),
);

const settingsHtmlFragmentTranslations = [
	['<html lang="en">', '<html lang="zh-CN">'],
	[
		'Setting this to <code>false</code> will inhibit the hovers from showing over the annotation; Set',
		'将此设置为 <code>false</code> 会阻止在标注上显示悬停提示；请将',
	],
	[
		'to <code>line</code> to enable the hovers to show anywhere over the line.',
		'设置为 <code>line</code>，即可在整行任意位置显示悬停提示。',
	],
	['Use <kbd>Esc</kbd> key to dismiss the active file annotations', '使用 <kbd>Esc</kbd> 键关闭当前文件标注'],
	['Press <kbd>Esc</kbd> to turn off the annotations', '按 <kbd>Esc</kbd> 关闭标注'],
	[
		'Can use <code>system</code> to follow the system locale, or enter a locale language tag, e.g. en-US',
		'可使用 <code>system</code> 跟随系统区域设置，或输入区域语言标签，例如 en-US',
	],
	[
		'Use <code>system</code> for the system locale, or a locale language tag, e.g. en-US',
		'使用 <code>system</code> 表示系统区域设置，或使用区域语言标签，例如 en-US',
	],
	[
		'<kbd>Alt</kbd> based (<kbd>&#x2325;</kbd> on macOS) shortcuts. Not great for non-English keyboard layouts',
		'基于 <kbd>Alt</kbd>（macOS 上为 <kbd>&#x2325;</kbd>）的快捷键。不太适合非英文键盘布局',
	],
	[
		'Chorded shortcuts that start with <kbd>Ctrl+Shift+G</kbd> (<kbd>&#x2325;&#x2318;G</kbd> on macOS). Better for non-English keyboard layouts',
		'以 <kbd>Ctrl+Shift+G</kbd>（macOS 上为 <kbd>&#x2325;&#x2318;G</kbd>）开头的组合键。更适合非英文键盘布局',
	],
];

const runtimeFiles = [
	'dist/browser/gitlens.js',
	'dist/gitlens.js',
	'dist/integrations.js',
	'dist/agents.js',
	'dist/ai.js',
	'dist/annotations.js',
	'dist/codelens.js',
	'dist/compose.js',
	'dist/mcp.js',
	'dist/mcp-cursor.js',
	'dist/rebaseTodoEditor.js',
	'dist/webview-commitDetails.js',
	'dist/webview-composer.js',
	'dist/webview-graph.js',
	'dist/webview-home.js',
	'dist/webview-patchDetails.js',
	'dist/webview-rebase.js',
	'dist/webview-settings.js',
	'dist/webview-shared.js',
	'dist/webview-timeline.js',
	'dist/webview-welcome.js',
	'dist/webviews/commitDetails.js',
	'dist/webviews/composer.js',
	'dist/webviews/graph.js',
	'dist/webviews/home.js',
	'dist/webviews/patchDetails.js',
	'dist/webviews/rebase.js',
	'dist/webviews/settings.js',
	'dist/webviews/timeline.js',
	'dist/webviews/welcome.js',
];

function replaceAllCounting(value, source, target) {
	if (source.length === 0 || !value.includes(source)) return { value, count: 0 };
	const count = value.split(source).length - 1;
	return { value: value.replaceAll(source, target), count };
}

function escapeRuntimeQuotedLiteral(value, quote) {
	return value
		.replace(/\\/g, '\\\\')
		.replace(/\n/g, '\\n')
		.replace(/\t/g, '\\t')
		.replace(/\r/g, '\\r')
		.replace(new RegExp(escapeRegExp(quote), 'g'), `\\${quote}`);
}

function escapeRuntimeTemplateLiteral(value) {
	return value.replace(/`/g, '\\`');
}

function translateSettingsHtmlFeature(value) {
	return (
		settingsHtmlFeatureTranslations.get(value) ??
		settingsHtmlFeatureTranslations.get(value.replaceAll('&amp;', '&')) ??
		value
	);
}

function formatSettingsHtmlJumpTarget(value, suffix = '') {
	const target = translateSettingsHtmlFeature(value);
	const needsLeadingSpace = /^[A-Za-z0-9]/.test(target);
	const needsTrailingSpace = suffix.length !== 0 && /[A-Za-z0-9]$/.test(target);
	return `${needsLeadingSpace ? ' ' : ''}${target}${needsTrailingSpace ? ' ' : ''}${suffix}`;
}

function translateSettingsHtmlText(value) {
	const direct = settingsHtmlTextTranslations.get(value) ?? settingsHtmlFeatureTranslations.get(value);
	if (direct != null) return direct;

	let match = /^Jump to (.+?) settings$/.exec(value);
	if (match != null) return `跳转到${formatSettingsHtmlJumpTarget(match[1], '设置')}`;

	match = /^Jump to (.+)$/.exec(value);
	if (match != null) return `跳转到${formatSettingsHtmlJumpTarget(match[1])}`;

	return value;
}

function localizeSettingsHtmlToken(value) {
	const leading = /^\s*/.exec(value)?.[0] ?? '';
	const trailing = /\s*$/.exec(value)?.[0] ?? '';
	const trimmed = value.trim();
	if (trimmed.length === 0) return value;

	const translated = translateSettingsHtmlText(trimmed);
	if (translated === trimmed) return value;
	return `${leading}${translated}${trailing}`;
}

function escapeHtmlAttributeValue(value) {
	return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function protectSettingsHtmlSegments(value) {
	const segments = [];
	const protect = match => {
		const token = `__GL_SETTINGS_HTML_PROTECTED_${segments.length}__`;
		segments.push(match);
		return token;
	};
	const protectedValue = value
		.replace(/<code\b[\s\S]*?<\/code>/g, protect)
		.replace(/<kbd\b[\s\S]*?<\/kbd>/g, protect)
		.replace(/<span class="token"\b[\s\S]*?<\/span>/g, protect);
	return {
		value: protectedValue,
		restore(next) {
			return segments.reduce((result, segment, index) => result.replaceAll(`__GL_SETTINGS_HTML_PROTECTED_${index}__`, segment), next);
		},
	};
}

function localizeSettingsHtml() {
	const filePath = path.join(extensionRoot, 'dist/webviews/settings.html');
	if (!fs.existsSync(filePath)) return { changed: false, replacements: 0 };

	const original = fs.readFileSync(filePath, 'utf8');
	const protectedSegments = protectSettingsHtmlSegments(original);
	let replacements = 0;
	let next = protectedSegments.value.replace(/>([^<>]*[A-Za-z][^<>]*)</g, (match, text) => {
		const translated = localizeSettingsHtmlToken(text);
		if (translated === text) return match;
		replacements += 1;
		return `>${translated}<`;
	});

	next = next.replace(/\b(title|aria-label|placeholder)="([^"]*[A-Za-z][^"]*)"/g, (match, attribute, value) => {
		const translated = localizeSettingsHtmlToken(value);
		if (translated === value) return match;
		replacements += 1;
		return `${attribute}="${escapeHtmlAttributeValue(translated)}"`;
	});
	next = protectedSegments.restore(next);
	for (const [source, target] of settingsHtmlFragmentTranslations) {
		const result = replaceAllCounting(next, source, target);
		next = result.value;
		replacements += result.count;
	}

	if (next !== original) {
		fs.writeFileSync(filePath, next);
		return { changed: true, replacements };
	}
	return { changed: false, replacements: 0 };
}

function localizeRuntimeBundles() {
	const stats = { filesChanged: 0, replacements: 0 };
	for (const relativePath of runtimeFiles) {
		const filePath = path.join(extensionRoot, relativePath);
		if (!fs.existsSync(filePath)) continue;
		const original = fs.readFileSync(filePath, 'utf8');
		let next = original;
		let fileReplacements = 0;

		for (const [pattern, target] of runtimeRegexTranslations) {
			const matches = next.match(pattern);
			if (matches == null) continue;
			next = next.replace(pattern, target);
			fileReplacements += matches.length;
		}

		// 占位符模板层：覆盖所有 minifier 变量名变体，捕获组原样回填变量表达式
		for (const [pattern, target] of placeholderTemplateTranslations) {
			const matches = next.match(pattern);
			if (matches == null) continue;
			next = next.replace(pattern, target);
			fileReplacements += matches.length;
		}

		for (const [source, target] of runtimeLiteralTranslations) {
			for (const quote of ['"', "'"]) {
				const sourceLiteral = `${quote}${escapeRuntimeQuotedLiteral(source, quote)}${quote}`;
				const targetLiteral = `${quote}${escapeRuntimeQuotedLiteral(target, quote)}${quote}`;
				const result = replaceAllCounting(next, sourceLiteral, targetLiteral);
				next = result.value;
				fileReplacements += result.count;
			}

			const sourceTemplate = `\`${escapeRuntimeTemplateLiteral(source)}\``;
			const targetTemplate = `\`${escapeRuntimeTemplateLiteral(target)}\``;
			const result = replaceAllCounting(next, sourceTemplate, targetTemplate);
			next = result.value;
			fileReplacements += result.count;
		}

		for (const [source, target] of runtimeFragmentTranslations) {
			const result = replaceAllCounting(next, source, target);
			next = result.value;
			fileReplacements += result.count;
		}

		// ===== 后置正则：处理 fragment 替换引入的术语 =====
		// Worktree/Worktrees 在 fragment 翻译结果中作为术语残留，需在 fragment 后再次替换
		// 移除时间格式化中的 " ago" 后缀（中文不需要）
		const postFragmentRegexes = [
			[/(?<![a-zA-Z])Worktrees(?![A-Za-z])/g, '工作树'],
			[/(?<![a-zA-Z])Worktree(?![A-Za-z])/g, '工作树'],
			// 时间格式: "9秒前 ago" → "9秒前"
			[/前 ago\b/g, '前'],
		];
		for (const [pattern, target] of postFragmentRegexes) {
			const matches = next.match(pattern);
			if (matches == null) continue;
			next = next.replace(pattern, target);
			fileReplacements += matches.length;
		}

		const normalized = normalizePreservedTerms(next);
		if (normalized !== next) {
			next = normalized;
			fileReplacements += 1;
		}

		if (next !== original) {
			fs.writeFileSync(filePath, next);
			stats.filesChanged += 1;
			stats.replacements += fileReplacements;
		}
	}
	return stats;
}

function packageLocalizedVsix() {
	const tempPath = `${localizedVsixPath}.tmp`;
	fs.rmSync(tempPath, { force: true });
	execFileSync('zip', ['-qr', tempPath, '[Content_Types].xml', 'extension.vsixmanifest', 'extension'], {
		cwd: extractedRoot,
		stdio: 'ignore',
	});
	fs.renameSync(tempPath, localizedVsixPath);
	return true;
}

restoreOriginalPackageFiles();

const packageStats = localizePackageJson();
const vsixManifestStats = localizeVsixManifest();
const markdownFilesChanged = localizeWalkthroughMarkdown();
const readmeChanged = localizeReadme();
const changelogChanged = localizeChangelog();
const localizationNotesChanged = localizeLocalizationNotes();
const runtimeStats = localizeRuntimeBundles();
const settingsHtmlStats = localizeSettingsHtml();
const localizedVsixPackaged = packageLocalizedVsix();

console.log(
	JSON.stringify(
		{
			packageStringsChanged: packageStats.stringsChanged,
			vsixManifestStringsChanged: vsixManifestStats.stringsChanged,
			walkthroughMarkdownFilesChanged: markdownFilesChanged,
		readmeIntroAdded: readmeChanged,
		changelogLocalized: changelogChanged,
		localizationNotesLocalized: localizationNotesChanged,
		runtimeFilesChanged: runtimeStats.filesChanged,
			runtimeReplacements: runtimeStats.replacements,
			settingsHtmlLocalized: settingsHtmlStats.changed,
			settingsHtmlReplacements: settingsHtmlStats.replacements,
			localizedVsixPackaged,
		},
		null,
		2,
	),
);
