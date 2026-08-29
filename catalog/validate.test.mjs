// validate.mjs 用例矩阵（TDD：RED 先写，GREEN 后实现）
// 运行：node catalog/validate.test.mjs  退出码 0=全过 / 1=有失败
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { validate } from './validate.mjs';

const REAL_MODULES = 'cc-assistant/modules';
const REAL_TOPICS = [
  { id: 'core-workflow', description: 'x' },
  { id: 'hooks', description: 'x' },
  { id: 'mcp', description: 'x' },
];
const REAL_MAPPING = {
  core: ['core-workflow'], memory: ['core-workflow'], skills: ['core-workflow'],
  subagent: ['core-workflow'], hooks: ['hooks'], mcp: ['mcp'],
  headless: ['core-workflow'], sdk: ['core-workflow'], plugins: ['core-workflow'],
  engineering: ['core-workflow'], capstone: ['core-workflow'],
};
const REAL_SKILL = {
  id: 'cc-assistant', name: 'Claude Code Horse Tamer', description: 'desc', author: 'A',
  install: 'inst', repo: 'https://x.example/repo', license: 'MIT',
  topics: ['core-workflow', 'hooks'],
};

let failures = 0;
function check(name, actualOk, expectOk, errors) {
  const pass = actualOk === expectOk;
  if (!pass) failures++;
  console.log(`${pass ? 'PASS' : 'FAIL'} | ${name}${pass ? '' : ` | got ok=${actualOk} errors=${JSON.stringify(errors)}`}`);
}

function mkfixture({ catalog, topics, mapping } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'v4-validate-'));
  fs.writeFileSync(path.join(dir, 'topics.json'), JSON.stringify(topics ?? REAL_TOPICS));
  fs.writeFileSync(path.join(dir, 'course-mapping.json'), JSON.stringify(mapping ?? REAL_MAPPING));
  const cat = catalog ?? { skills: [REAL_SKILL] };
  fs.writeFileSync(path.join(dir, 'catalog.json'), typeof cat === 'string' ? cat : JSON.stringify(cat));
  return { catalog: path.join(dir, 'catalog.json'), topics: path.join(dir, 'topics.json'), mapping: path.join(dir, 'course-mapping.json') };
}

const p = mkfixture();

// 合法：应 ok=true
{
  const r = validate({ catalogFile: p.catalog, topicsFile: p.topics, mappingFile: p.mapping, modulesDir: REAL_MODULES });
  check('合法 catalog/topics/mapping → 通过', r.ok, true, r.errors);
}

// 非法 JSON
{
  const f = mkfixture({ catalog: '{"skills": [broken' });
  const r = validate({ catalogFile: f.catalog, topicsFile: f.topics, mappingFile: f.mapping, modulesDir: REAL_MODULES });
  check('非法 JSON → 失败', r.ok, false, r.errors);
}

// 缺必填字段 name
{
  const c = { skills: [{ ...REAL_SKILL, name: undefined }] };
  const f = mkfixture({ catalog: c });
  const r = validate({ catalogFile: f.catalog, topicsFile: f.topics, mappingFile: f.mapping, modulesDir: REAL_MODULES });
  check('缺必填字段 name → 失败', r.ok, false, r.errors);
}

// 空 description
{
  const c = { skills: [{ ...REAL_SKILL, description: '' }] };
  const f = mkfixture({ catalog: c });
  const r = validate({ catalogFile: f.catalog, topicsFile: f.topics, mappingFile: f.mapping, modulesDir: REAL_MODULES });
  check('空 description → 失败', r.ok, false, r.errors);
}

// id 重复
{
  const c = { skills: [REAL_SKILL, { ...REAL_SKILL, id: 'cc-assistant' }] };
  const f = mkfixture({ catalog: c });
  const r = validate({ catalogFile: f.catalog, topicsFile: f.topics, mappingFile: f.mapping, modulesDir: REAL_MODULES });
  check('id 重复 → 失败', r.ok, false, r.errors);
}

// 词表外 topics
{
  const c = { skills: [{ ...REAL_SKILL, topics: ['ghost-topic'] }] };
  const f = mkfixture({ catalog: c });
  const r = validate({ catalogFile: f.catalog, topicsFile: f.topics, mappingFile: f.mapping, modulesDir: REAL_MODULES });
  check('词表外 topics → 失败', r.ok, false, r.errors);
}

// topics 类型错（字符串非数组）
{
  const c = { skills: [{ ...REAL_SKILL, topics: 'core-workflow' }] };
  const f = mkfixture({ catalog: c });
  const r = validate({ catalogFile: f.catalog, topicsFile: f.topics, mappingFile: f.mapping, modulesDir: REAL_MODULES });
  check('topics 非数组 → 失败', r.ok, false, r.errors);
}

// 映射键与模块不一致（hooks→hook）
{
  const m = { ...REAL_MAPPING, hook: REAL_MAPPING.hooks }; delete m.hooks;
  const f = mkfixture({ mapping: m });
  const r = validate({ catalogFile: f.catalog, topicsFile: f.topics, mappingFile: f.mapping, modulesDir: REAL_MODULES });
  check('映射键与模块不一致 → 失败', r.ok, false, r.errors);
}

// 映射引用词表外主题
{
  const m = { ...REAL_MAPPING, core: ['ghost-topic'] };
  const f = mkfixture({ mapping: m });
  const r = validate({ catalogFile: f.catalog, topicsFile: f.topics, mappingFile: f.mapping, modulesDir: REAL_MODULES });
  check('映射引用词表外主题 → 失败', r.ok, false, r.errors);
}

// topics.json 自身 id 重复
{
  const t = [...REAL_TOPICS, { id: 'core-workflow', description: 'dup' }];
  const f = mkfixture({ topics: t });
  const r = validate({ catalogFile: f.catalog, topicsFile: f.topics, mappingFile: f.mapping, modulesDir: REAL_MODULES });
  check('topics.json id 重复 → 失败', r.ok, false, r.errors);
}

// v6：四类条目（缺 type 按 skill 合法）
{
  const c = { skills: [
    { ...REAL_SKILL },                                                        // 缺 type → skill
    { ...REAL_SKILL, id: 'agent-x', topics: ['core-workflow'], type: 'agent' },
    { ...REAL_SKILL, id: 'mcp-x', topics: ['mcp'], type: 'mcp-server' },
    { ...REAL_SKILL, id: 'plugin-x', topics: ['core-workflow'], type: 'plugin' },
  ] };
  const f = mkfixture({ catalog: c });
  const r = validate({ catalogFile: f.catalog, topicsFile: f.topics, mappingFile: f.mapping, modulesDir: REAL_MODULES });
  check('四类条目（缺 type 按 skill）→ 通过', r.ok, true, r.errors);
}

// v6：非法 type（枚举外）→ 失败
{
  const c = { skills: [{ ...REAL_SKILL, type: 'command' }] };
  const f = mkfixture({ catalog: c });
  const r = validate({ catalogFile: f.catalog, topicsFile: f.topics, mappingFile: f.mapping, modulesDir: REAL_MODULES });
  check('非法 type（command）→ 失败', r.ok, false, r.errors);
}

console.log(failures === 0 ? '\n全部用例通过 ✓' : `\n${failures} 个用例失败 ✗`);
process.exit(failures === 0 ? 0 : 1);
