// 从 GitLens v18.1.0 源码提取用户可见字符串，并交叉验证汉化产物中是否残留英文
// 用法: node extract-source.mjs <srcRoot> <extractedExtensionRoot> <outJson>
import fs from 'node:fs';
import path from 'node:path';

const srcRoot = process.argv[2] || '/tmp/gitlens-v18.1.0/src';
const extRoot = process.argv[3] || 'gitlens-18.1.0-extracted/extension';
const outPath = process.argv[4] || '/tmp/gitlens-l10n/missed.json';

const hasCJK = s => /[一-鿿]/.test(s);

// ---------- 收集源码文件 ----------
const files = [];
(function walk(dir) {
	for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
		const p = path.join(dir, e.name);
		if (e.isDirectory()) {
			if (/^(test|__tests__|\.vscode-test)$/.test(e.name)) continue;
			walk(p);
		} else if (/\.ts$/.test(e.name) && !/\.test\.ts$|\.d\.ts$/.test(e.name)) {
			files.push(p);
		}
	}
})(srcRoot);

// ---------- 字符串提取 ----------
// kind: 'literal' (无插值) | 'template' (含 ${})
const found = new Map(); // key -> {value, kind, contexts:Set, files:Set}
function add(value, kind, ctx, file) {
	let v = value;
	if (kind === 'literal') {
		v = v.replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\\\/g, '\\').replace(/\\`/g, '`');
	}
	const t = v.trim();
	if (t.length < 3 || hasCJK(t)) return;
	// 必须含 ≥2 个英文词，或为首字母大写的 ≥4 字母单词（按钮/标签如 "Cancel", "Working Tree"）
	const stripped = t.replace(/\$\{[^{}]*\}/g, ' ');
	const words = stripped.match(/[A-Za-z]{2,}/g) || [];
	const sentence = /[A-Za-z]{2,}[ ,][\s\S]*[A-Za-z]{2,}/.test(stripped);
	const singleCap = /^[A-Z][a-z]{3,}([.…?!]{0,3})$/.test(t);
	if (!(sentence || words.length >= 2 || singleCap)) return;
	// 排除明显非 UI
	if (/https?:\/\/|\bwww\.|^[\w./-]+\.(ts|js|svg|png|md|html)$/.test(t)) return;
	if (/^[a-z][a-zA-Z0-9]*(\.[a-zA-Z0-9_*]+)+$/.test(t)) return; // dotted config key
	if (/^gitlens[./:]|^git\.|^workbench\.|^onCommand|^onView|^onUri|^setContext$/.test(t)) return;
	const key = `${kind}:${v}`;
	const e = found.get(key) || { value: v, kind, contexts: new Set(), files: new Set() };
	e.contexts.add(ctx); e.files.add(path.relative(srcRoot, file));
	found.set(key, e);
}

const SQ = String.raw`'(?:[^'\\\n]|\\.)*'`;
const DQ = String.raw`"(?:[^"\\\n]|\\.)*"`;
const TPL = String.raw`\`(?:[^\`\\]|\\.)*\``; // 可跨行
const ANY = `(${SQ}|${DQ}|${TPL})`;

function stripQuotes(m) {
	const q = m[0];
	return { body: m.slice(1, -1), isTpl: q === '`' };
}

const PROP_RE = new RegExp(String.raw`\b(title|placeHolder|placeholder|prompt|label|description|detail|tooltip|message|emptyMessage|noneMessage|pickedMessage|openTitle|actionMessage)\s*:\s*${ANY}`, 'g');
const SHOW_RE = new RegExp(String.raw`show(?:Information|Warning|Error)Message\s*\(\s*${ANY}`, 'g');
const SHOW2_RE = new RegExp(String.raw`showMessage\s*\(\s*(?:${SQ}|${DQ})\s*,\s*${ANY}`, 'g');
const ASSIGN_RE = new RegExp(String.raw`\.(title|placeholder|prompt|validationMessage|text|tooltip|description|detail|message)\s*=\s*${ANY}`, 'g');
const MDSTR_RE = new RegExp(String.raw`(?:new MarkdownString|appendMarkdown)\s*\(\s*${ANY}`, 'g');
const WITHPROG_RE = new RegExp(String.raw`\btitle:\s*${ANY}`, 'g'); // 已含于 PROP_RE

for (const f of files) {
	const src = fs.readFileSync(f, 'utf8');
	let m;
	for (const [re, ctx] of [[PROP_RE, 'prop'], [SHOW_RE, 'notify'], [SHOW2_RE, 'notify'], [ASSIGN_RE, 'assign'], [MDSTR_RE, 'markdown']]) {
		re.lastIndex = 0;
		while ((m = re.exec(src))) {
			const lit = m[m.length - 1];
			const { body, isTpl } = stripQuotes(lit);
			if (isTpl && body.includes('${')) add(body, 'template', ctx, f);
			else if (!isTpl || !body.includes('${')) add(body, 'literal', ctx, f);
		}
	}
	// lit-html：提取 html`...` 中标签间文本与可见属性
	const HTML_RE = /html\s*`((?:[^`\\]|\\.)*)`/g;
	while ((m = HTML_RE.exec(src))) {
		const tpl = m[1];
		// 属性
		const ATTR_RE = /\b(?:title|aria-label|placeholder|label|header|empty-text|button-label|busy-label|check-verb|uncheck-verb|tooltip|popover-text|alt)="([^"${}<>]{3,200})"/g;
		let a;
		while ((a = ATTR_RE.exec(tpl))) add(a[1], 'literal', 'html-attr', f);
		// 文本节点：>text< 之间
		const TEXT_RE = />([^<>{}`]{3,300})</g;
		let tn;
		while ((tn = TEXT_RE.exec(tpl))) {
			const txt = tn[1].replace(/\s+/g, ' ').trim();
			if (txt && !/^\$\{/.test(txt) && !txt.includes('${')) add(txt, 'literal', 'html-text', f);
			else if (txt.includes('${')) add(tn[1], 'template', 'html-text', f);
		}
	}
}

// ---------- 读取汉化产物 runtime 文件 ----------
const RUNTIME = ['dist/browser/gitlens.js','dist/gitlens.js','dist/integrations.js','dist/agents.js','dist/ai.js','dist/annotations.js','dist/codelens.js','dist/compose.js','dist/mcp.js','dist/mcp-cursor.js','dist/rebaseTodoEditor.js','dist/webview-commitDetails.js','dist/webview-composer.js','dist/webview-graph.js','dist/webview-home.js','dist/webview-patchDetails.js','dist/webview-rebase.js','dist/webview-settings.js','dist/webview-shared.js','dist/webview-timeline.js','dist/webview-welcome.js','dist/webviews/commitDetails.js','dist/webviews/composer.js','dist/webviews/graph.js','dist/webviews/home.js','dist/webviews/patchDetails.js','dist/webviews/rebase.js','dist/webviews/settings.js','dist/webviews/timeline.js','dist/webviews/welcome.js'];
const distContent = RUNTIME.filter(r => fs.existsSync(path.join(extRoot, r)))
	.map(r => ({ rel: r, text: fs.readFileSync(path.join(extRoot, r), 'utf8') }));

function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
// 模板转 flex regex：${...} → 任意插值；空白弹性
function templateToRegex(body) {
	const parts = body.split(/\$\{[^{}]*\}/);
	const re = parts.map(p => escRe(p).replace(/\s+/g, '\\s+')).join(String.raw`\$\{[^{}]*\}`);
	return new RegExp(re);
}

const missed = [];
for (const e of found.values()) {
	let hitFiles = [];
	if (e.kind === 'literal') {
		const needle = e.value.replace(/\s+/g, ' ').trim();
		if (needle.length < 4) continue;
		for (const d of distContent) {
			if (d.text.includes(needle) || (needle !== e.value.trim() && d.text.includes(e.value.trim()))) hitFiles.push(d.rel);
		}
	} else {
		let re;
		try { re = templateToRegex(e.value); } catch { continue; }
		for (const d of distContent) if (re.test(d.text)) hitFiles.push(d.rel);
	}
	if (hitFiles.length) {
		missed.push({ value: e.value, kind: e.kind, contexts: [...e.contexts], srcFiles: [...e.files].slice(0, 3), distFiles: hitFiles });
	}
}

missed.sort((a, b) => a.value.localeCompare(b.value));
fs.writeFileSync(outPath, JSON.stringify({ totalExtracted: found.size, missedCount: missed.length, missed }, null, 2));
console.log('source strings extracted:', found.size);
console.log('MISSED in localized dist:', missed.length);
const byCtx = {};
for (const m2 of missed) for (const c of m2.contexts) byCtx[c] = (byCtx[c] || 0) + 1;
console.log('by context:', JSON.stringify(byCtx));
