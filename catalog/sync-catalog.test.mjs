// sync-catalog.mjs 输出断言用例（TDD：RED 先写，GREEN 后实现）
// 运行：node catalog/sync-catalog.test.mjs  退出码 0=全过 / 1=有失败
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { build, check as syncCheck } from './sync-catalog.mjs';

const SAMPLE_CATALOG = {
  skills: [
    { id: 'b-skill', name: 'B Skill', description: '用 hooks 做拦截', author: 'B', install: 'npx b', repo: 'https://x.example/b', license: 'MIT', topics: ['hooks'] },
    { id: 'a-skill', name: 'A Skill', description: '用 mcp 接数据', author: 'A', install: 'npx a', repo: 'https://x.example/a', license: 'MIT', topics: ['mcp', 'hooks'] },
  ],
};
const SAMPLE_TOPICS = [
  { id: 'mcp', description: 'MCP：接入外部数据与工具' },
  { id: 'hooks', description: 'Hooks：事件驱动的自动化拦截' },
];
const SAMPLE_MAPPING = { hooks: ['hooks'], mcp: ['mcp'] };

let failures = 0;
function check(name, pass, detail) {
  if (!pass) failures++;
  console.log(`${pass ? 'PASS' : 'FAIL'} | ${name}${pass ? '' : ` | ${detail}`}`);
}

const out = build({ catalog: SAMPLE_CATALOG, mapping: SAMPLE_MAPPING, topics: SAMPLE_TOPICS });

// 1. 三产物存在
check('build 返回三产物', typeof out.catalogJson === 'string' && typeof out.mappingJson === 'string' && typeof out.snapshot === 'string', '缺产物');

// 2. catalogJson = 输入 catalog 的规范 JSON（2 空格）
check('catalogJson 与输入一致', out.catalogJson === JSON.stringify(SAMPLE_CATALOG, null, 2), '不一致');

// 3. mappingJson = 输入 mapping 的规范 JSON
check('mappingJson 与输入一致', out.mappingJson === JSON.stringify(SAMPLE_MAPPING, null, 2), '不一致');

// 4. 快照按主题分组，主题排序（hooks 在 mcp 前）
const hIdx = out.snapshot.indexOf('## hooks');
const mIdx = out.snapshot.indexOf('## mcp');
check('快照含 hooks/mcp 主题节', hIdx >= 0 && mIdx >= 0, '缺主题节');
check('主题按 id 排序（hooks<mcp）', hIdx >= 0 && mIdx >= 0 && hIdx < mIdx, '排序错');

// 5. 主题下 skill 按 id 排序（a-skill 在 b-skill 前，hooks 主题下两 skill 都在）
const hooksSec = out.snapshot.slice(hIdx, mIdx > hIdx ? mIdx : undefined);
const aIdx = hooksSec.indexOf('A Skill');
const bIdx = hooksSec.indexOf('B Skill');
check('hooks 主题下列出两 skill', aIdx >= 0 && bIdx >= 0, '缺 skill');
check('skill 按 id 排序（A<B）', aIdx >= 0 && bIdx >= 0 && aIdx < bIdx, '排序错');

// 6. 每 skill 含 name/描述/install/repo
check('skill 行含描述/install/repo', /A Skill.*用 mcp 接数据[\s\S]*install: npx a[\s\S]*repo: https:\/\/x\.example\/a/.test(out.snapshot), '格式缺字段');

// 7. 不含 m0-onboarding 主题
check('快照不含 m0', !out.snapshot.includes('m0-onboarding'), '误含 m0');

// 8. 确定性：二次生成一致
const out2 = build({ catalog: SAMPLE_CATALOG, mapping: SAMPLE_MAPPING, topics: SAMPLE_TOPICS });
check('二次生成一致（确定性）', out.catalogJson === out2.catalogJson && out.mappingJson === out2.mappingJson && out.snapshot === out2.snapshot, '不确定');

// 9. check：产物一致 → ok；手工改动产物 → 漂移
{
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'v4-sync-'));
  fs.writeFileSync(path.join(dir, 'catalog.json'), out.catalogJson);
  fs.writeFileSync(path.join(dir, 'course-mapping.json'), out.mappingJson);
  fs.writeFileSync(path.join(dir, 'snapshot.md'), out.snapshot);
  const c1 = syncCheck({ catalog: SAMPLE_CATALOG, mapping: SAMPLE_MAPPING, topics: SAMPLE_TOPICS, catalogFile: path.join(dir, 'catalog.json'), mappingFile: path.join(dir, 'course-mapping.json'), snapshotFile: path.join(dir, 'snapshot.md') });
  check('--check 产物一致 → ok', c1.ok === true, JSON.stringify(c1.diffs));
  fs.writeFileSync(path.join(dir, 'snapshot.md'), out.snapshot + '\n<!-- 手工改动 -->');
  const c2 = syncCheck({ catalog: SAMPLE_CATALOG, mapping: SAMPLE_MAPPING, topics: SAMPLE_TOPICS, catalogFile: path.join(dir, 'catalog.json'), mappingFile: path.join(dir, 'course-mapping.json'), snapshotFile: path.join(dir, 'snapshot.md') });
  check('--check 手工改快照 → 漂移', c2.ok === false, '未检出漂移');
}

// v6：四类条目经 sync 传递（catalogJson 保留 type，缺省 skill 不带字段）
{
  const cat4 = {
    skills: [
      { ...SAMPLE_CATALOG.skills[0] },                                                                             // 缺 type → skill
      { id: 'agent-x', name: 'Agent X', description: 'd', author: 'A', install: 'i', repo: 'https://x.example/a', license: 'MIT', topics: ['hooks'], type: 'agent' },
      { id: 'mcp-x', name: 'MCP X', description: 'd', author: 'M', install: 'i', repo: 'https://x.example/m', license: 'MIT', topics: ['mcp'], type: 'mcp-server' },
      { id: 'plugin-x', name: 'Plugin X', description: 'd', author: 'P', install: 'i', repo: 'https://x.example/p', license: 'MIT', topics: ['hooks'], type: 'plugin' },
    ],
  };
  const o = build({ catalog: cat4, mapping: SAMPLE_MAPPING, topics: SAMPLE_TOPICS });
  const parsed = JSON.parse(o.catalogJson);
  const byId = Object.fromEntries(parsed.skills.map((s) => [s.id, s]));
  check('四类条目 catalogJson 保留 type', byId['agent-x'].type === 'agent' && byId['mcp-x'].type === 'mcp-server' && byId['plugin-x'].type === 'plugin', '缺 type');
  check('缺 type 条目不带 type 字段（不归一化）', !('type' in byId['b-skill']), '误归一化补写');
}

// 10. CRLF 检出归一化（git autocrlf 将 \n 检出为 \r\n，比较应忽略行尾）
{
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'v4-sync-crlf-'));
  fs.writeFileSync(path.join(dir, 'catalog.json'), out.catalogJson.replace(/\n/g, '\r\n'));
  fs.writeFileSync(path.join(dir, 'course-mapping.json'), out.mappingJson.replace(/\n/g, '\r\n'));
  fs.writeFileSync(path.join(dir, 'snapshot.md'), out.snapshot.replace(/\n/g, '\r\n'));
  const r = syncCheck({ catalog: SAMPLE_CATALOG, mapping: SAMPLE_MAPPING, topics: SAMPLE_TOPICS, catalogFile: path.join(dir, 'catalog.json'), mappingFile: path.join(dir, 'course-mapping.json'), snapshotFile: path.join(dir, 'snapshot.md') });
  check('--check 容忍 CRLF 检出（行尾归一化）', r.ok === true, JSON.stringify(r.diffs));
}

console.log(failures === 0 ? '\n全部用例通过 ✓' : `\n${failures} 个用例失败 ✗`);
process.exit(failures === 0 ? 0 : 1);
