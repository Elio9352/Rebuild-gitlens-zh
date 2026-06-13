// 扫描汉化后产物中的残留英文 UI 字符串
// 用法: node scan-residual.mjs <extractedRoot>
import fs from 'node:fs';
import path from 'node:path';

const root = process.argv[2] || 'gitlens-18.1.0-extracted';
const ext = path.join(root, 'extension');

const hasCJK = s => /[一-鿿]/.test(s);
// 排除技术名词/产品名为主的字符串
const TECH_ONLY = /^(GitLens|GitKraken|GitHub( Enterprise)?|GitLab|Bitbucket( Data Center)?|Azure DevOps|Jira( Cloud)?|Git|VS Code|Visual Studio Code|OpenAI|Anthropic|Gemini|Copilot|HuggingFace|Ollama|DeepSeek|xAI|Mistral|OpenRouter|URL|API|ID|SHA|HEAD|JSON|Markdown|CodeLens|Pro|Preview|Advanced|Community|MCP|CLI|SSH|HTTPS?|OAuth|PR|AI)([ ,&/+-]+(GitLens|GitKraken|GitHub( Enterprise)?|GitLab|Bitbucket( Data Center)?|Azure DevOps|Jira( Cloud)?|Git|VS Code|Visual Studio Code|OpenAI|Anthropic|Gemini|Copilot|HuggingFace|Ollama|DeepSeek|xAI|Mistral|OpenRouter|URL|API|ID|SHA|HEAD|JSON|Markdown|CodeLens|Pro|Preview|Advanced|Community|MCP|CLI|SSH|HTTPS?|OAuth|PR|AI))*$/i;

// 至少两个英文单词（其中一个 ≥3 字母），或首字母大写的句子
function looksEnglishUI(s) {
	if (hasCJK(s)) return false;
	const t = s.trim();
	if (t.length < 4) return false;
	if (TECH_ONLY.test(t)) return false;
	const words = t.match(/[A-Za-z]{2,}/g) || [];
	if (words.length < 2) return false;
	// 排除明显非 UI：URL、路径、标识符、CSS、颜色 token
	if (/https?:\/\/|\bwww\./.test(t)) return false;
	if (/^[\w.-]+(\/[\w.-]+)+$/.test(t)) return false; // path-like
	if (/^[a-z][a-zA-Z0-9]*(\.[a-zA-Z0-9]+)+$/.test(t)) return false; // dotted key
	if (/^--|^#[0-9a-fA-F]{3,8}$|;\s*$/.test(t)) return false;
	return true;
}

// ---------- package.json ----------
const VISIBLE_KEYS = new Set([
	'title', 'shortTitle', 'description', 'markdownDescription', 'deprecationMessage',
	'contents', 'label', 'name', 'contextualTitle', 'placeholder', 'tooltip', 'displayName',
]);
const pkgFindings = [];
function walk(node, keyPath) {
	if (node == null) return;
	if (Array.isArray(node)) {
		node.forEach((v, i) => walk(v, `${keyPath}[${i}]`));
		return;
	}
	if (typeof node === 'object') {
		for (const [k, v] of Object.entries(node)) {
			if (typeof v === 'string') {
				if (VISIBLE_KEYS.has(k) && looksEnglishUI(v)) pkgFindings.push({ path: `${keyPath}.${k}`, value: v });
			} else if (k === 'enumDescriptions' && Array.isArray(v)) {
				v.forEach((d, i) => { if (typeof d === 'string' && looksEnglishUI(d)) pkgFindings.push({ path: `${keyPath}.${k}[${i}]`, value: d }); });
			} else {
				walk(v, `${keyPath}.${k}`);
			}
		}
	}
}
const pkgFile = path.join(ext, 'package.json');
if (fs.existsSync(pkgFile)) walk(JSON.parse(fs.readFileSync(pkgFile, 'utf8')), '$');

// ---------- dist JS 字符串字面量 ----------
const runtimeFiles = fs.globSync ? null : null;
const distFindings = new Map(); // string -> {count, files}
const STRING_RE = /'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g;
function unescape(s) {
	try { return JSON.parse(`"${s.replace(/"/g, '\\"').replace(/\\'/g, "'")}"`); } catch { return s; }
}
function uiCandidate(s) {
	if (!looksEnglishUI(s)) return false;
	const t = s.trim();
	// minified JS 噪音过滤
	if (/[{};=]\s*$/.test(t) && !/[.!?]$/.test(t)) return false;
	if (/^[a-z-]+:[^ ]/.test(t)) return false; // css prop / scheme
	if (/^\w+\(/.test(t)) return false; // 函数调用样式
	if (/^[A-Za-z0-9_$]+$/.test(t)) return false; // 单标识符
	if (/data:|^image\//.test(t)) return false;
	// 需要至少一个空格分隔的自然语言迹象
	if (!/[A-Za-z]{2,}\s+[A-Za-z]{2,}/.test(t.replace(/\$\{[^}]*\}/g, ' '))) return false;
	return true;
}
function scanJs(rel) {
	const f = path.join(ext, rel);
	if (!fs.existsSync(f)) return;
	const src = fs.readFileSync(f, 'utf8');
	let m;
	while ((m = STRING_RE.exec(src))) {
		const raw = m[1] ?? m[2] ?? m[3];
		if (raw == null || raw.length > 600) continue;
		const val = unescape(raw);
		if (uiCandidate(val)) {
			const e = distFindings.get(val) || { count: 0, files: new Set() };
			e.count++; e.files.add(rel);
			distFindings.set(val, e);
		}
	}
}
const RUNTIME = ['dist/browser/gitlens.js','dist/gitlens.js','dist/integrations.js','dist/agents.js','dist/ai.js','dist/annotations.js','dist/codelens.js','dist/compose.js','dist/mcp.js','dist/mcp-cursor.js','dist/rebaseTodoEditor.js','dist/webview-commitDetails.js','dist/webview-composer.js','dist/webview-graph.js','dist/webview-home.js','dist/webview-patchDetails.js','dist/webview-rebase.js','dist/webview-settings.js','dist/webview-shared.js','dist/webview-timeline.js','dist/webview-welcome.js','dist/webviews/commitDetails.js','dist/webviews/composer.js','dist/webviews/graph.js','dist/webviews/home.js','dist/webviews/patchDetails.js','dist/webviews/rebase.js','dist/webviews/settings.js','dist/webviews/timeline.js','dist/webviews/welcome.js'];
RUNTIME.forEach(scanJs);

const distList = [...distFindings.entries()]
	.map(([s, e]) => ({ s, count: e.count, files: [...e.files] }))
	.sort((a, b) => b.count - a.count);

const out = {
	packageResidualCount: pkgFindings.length,
	distResidualCount: distList.length,
	packageResiduals: pkgFindings,
	distResiduals: distList,
};
fs.writeFileSync(process.argv[3] || '/tmp/residual-report.json', JSON.stringify(out, null, 2));
console.log('package.json residual visible-English strings:', pkgFindings.length);
console.log('dist JS residual English UI candidates (unique):', distList.length);
