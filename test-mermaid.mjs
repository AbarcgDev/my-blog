import { readFileSync } from 'fs';
import { JSDOM } from 'jsdom';

const html = readFileSync('.gemini-tmp-test.html', 'utf-8');
const dom = new JSDOM(html);
const document = dom.window.document;

const blocks = document.querySelectorAll("pre > code.language-mermaid, pre[data-language='mermaid']");
blocks.forEach((block) => {
    const pre = block.tagName === 'PRE' ? block : block.parentElement;
    console.log("Found block! textContent is:\n" + JSON.stringify(pre.textContent));
    
    const lines = pre.querySelectorAll('.line');
    const text = lines.length > 0 ? Array.from(lines).map(l => l.textContent).join('\n') : pre.textContent;
    console.log("Alternative text is:\n" + JSON.stringify(text));
});
