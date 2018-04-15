
import hljs from 'highlight.js';

export default function highlight(selector = 'pre code') {
  const codeBlocks = document.querySelectorAll(selector);

  Array.prototype.forEach.call(codeBlocks, (codeBlock) => {
    const block = codeBlock;
    let html = block.innerHTML;
    html = html.replace(/<!--([^>]+-->)/g, '');
    html = format(html);
    html = html.replace(/^\r?\n/g, '');

    block.textContent = html;

    hljs.highlightBlock(block);

    block.addEventListener('dblclick', () => {
      copyToClipboard(html);

      block.parentNode.parentNode.classList.add('blink');
      setTimeout(() => {
        block.parentNode.parentNode.classList.remove('blink');
      }, 400);
    });
  });
}


function indentation(level) {
  let result = '';
  let i = level * 2;

  if (level < 0) { throw new Error('Level is below 0'); }

  while (i !== 0) {
    i -= 1;
    result += ' ';
  }

  return result;
}


function format(html) {
  const tokens = html.trim().split(/</);
  let result = '';
  let indentLevel = 0;

  for (let i = 0, l = tokens.length; i < l; i += 1) {
    const parts = tokens[i].split(/>/);

    if (parts.length === 2) {
      if (tokens[i][0] === '/') { indentLevel -= 1; }
      result += indentation(indentLevel);

      if (tokens[i][0] !== '/') { indentLevel += 1; }
      if (i > 0) { result += '<'; }
      result += `${parts[0].trim()}>\n`;

      if (parts[1].trim() !== '') { result += `${indentation(indentLevel) + parts[1].trim().replace(/\s+/g, ' ')}\n`; }
      if (parts[0].match(/^(img|hr|br|input)/)) { indentLevel -= 1; }
    } else {
      result += `${indentation(indentLevel) + parts[0]}\n`;
    }
  }

  return result;
}


function copyToClipboard(content) {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = content;
  document.body.appendChild(textarea);

  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}
