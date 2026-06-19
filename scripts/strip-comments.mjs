import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'src');

const REGEX_PRECEDING = new Set([
  '(', ',', '=', ':', ';', '!', '&', '|', '?', '{', '}', '[', '+', '-', '*', '<', '>', '~', '^', '%', '\n', '\r', undefined,
]);

function stripComments(code) {
  let out = '';
  let i = 0;
  const n = code.length;
  let lastNonWs = undefined;

  while (i < n) {
    const ch = code[i];
    const next = code[i + 1];

    if (ch === '/' && next === '/') {
      while (i < n && code[i] !== '\n') i++;
      continue;
    }
    if (ch === '/' && next === '*') {
      i += 2;
      while (i < n && !(code[i] === '*' && code[i + 1] === '/')) i++;
      i += 2;
      continue;
    }

    if (ch === "'" || ch === '"') {
      const quote = ch;
      out += ch;
      i++;
      while (i < n) {
        if (code[i] === '\\') {
          out += code[i] + (code[i + 1] ?? '');
          i += 2;
          continue;
        }
        if (code[i] === quote) {
          out += code[i];
          i++;
          break;
        }
        out += code[i];
        i++;
      }
      lastNonWs = quote;
      continue;
    }

    if (ch === '`') {
      out += ch;
      i++;
      let depth = 0;
      while (i < n) {
        if (code[i] === '\\') {
          out += code[i] + (code[i + 1] ?? '');
          i += 2;
          continue;
        }
        if (depth === 0 && code[i] === '`') {
          out += code[i];
          i++;
          break;
        }
        if (depth === 0 && code[i] === '$' && code[i + 1] === '{') {
          depth++;
          out += code[i] + code[i + 1];
          i += 2;
          continue;
        }
        if (depth > 0) {
          if (code[i] === '{') depth++;
          else if (code[i] === '}') depth--;
        }
        out += code[i];
        i++;
      }
      lastNonWs = '`';
      continue;
    }

    if (ch === '/' && REGEX_PRECEDING.has(lastNonWs)) {
      let j = i + 1;
      let valid = false;
      let inClass = false;
      while (j < n) {
        const c = code[j];
        if (c === '\\') { j += 2; continue; }
        if (c === '\n' || c === '\r') break;
        if (c === '[') inClass = true;
        else if (c === ']') inClass = false;
        else if (!inClass && c === '/') { valid = true; break; }
        j++;
      }
      if (valid) {
        out += code.slice(i, j + 1);
        i = j + 1;
        while (i < n && /[gimsuy]/.test(code[i])) {
          out += code[i];
          i++;
        }
        lastNonWs = '/';
        continue;
      }
    }

    out += ch;
    if (!/\s/.test(ch)) lastNonWs = ch;
    i++;
  }

  return out;
}

function tidy(code) {
  return code
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/, ''))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n');
}

async function walk(dir, files = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) await walk(full, files);
    else if (entry.isFile() && extname(entry.name) === '.ts') files.push(full);
  }
  return files;
}

const files = await walk(ROOT);
let changed = 0;
for (const file of files) {
  const before = await readFile(file, 'utf8');
  const after = tidy(stripComments(before));
  if (after !== before) {
    await writeFile(file, after, 'utf8');
    changed++;
    console.log('  cleaned', file.replace(ROOT, 'src'));
  }
}
console.log(`\n${changed}/${files.length} files cleaned.`);
