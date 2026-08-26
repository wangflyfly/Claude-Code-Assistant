// sync-catalog.mjs —— 机器生成三产物 + --check 防漂移（REQ-CIV-003/004/005、REQ-SNP-001/002/005）
// 用法：
//   node catalog/sync-catalog.mjs          生成 site/data/catalog.json、site/data/course-mapping.json、cc-assistant/modules/_community-skills.md
//   node catalog/sync-catalog.mjs --check  比较已提交产物与最新生成，退出码 0=一致 / 1=漂移
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

export function build({ catalog, mapping, topics }) {
  const catalogJson = JSON.stringify(catalog, null, 2);
  const mappingJson = JSON.stringify(mapping, null, 2);

  const byTopic = new Map();
  for (const t of topics ?? []) byTopic.set(t.id, []);
  const sortedSkills = [...(Array.isArray(catalog?.skills) ? catalog.skills : [])].sort((a, b) => (a.id ?? '').localeCompare(b.id ?? ''));
  for (const s of sortedSkills) for (const topic of s.topics ?? []) if (byTopic.has(topic)) byTopic.get(topic).push(s);

  const sortedTopics = [...(topics ?? [])].sort((a, b) => a.id.localeCompare(b.id));
  const lines = ['# 社区好 Skill 快照', '', '> 本文件由 `catalog/sync-catalog.mjs` 从 `catalog/catalog.json`（skill 条目）+ `catalog/topics.json`（主题分组）机器生成，随课程分发，勿手工编辑。', ''];
  for (const t of sortedTopics) {
    lines.push(`## ${t.id} — ${t.description}`, '');
    const list = byTopic.get(t.id) ?? [];
    if (list.length === 0) {
      lines.push('（暂无收录 skill）', '');
    } else {
      for (const s of list) lines.push(`- **${s.name}** — ${s.description}`, `  - install: ${s.install}`, `  - repo: ${s.repo}`, '');
    }
  }
  return { catalogJson, mappingJson, snapshot: lines.join('\n') };
}

export function check({ catalog, mapping, topics, catalogFile, mappingFile, snapshotFile }) {
  const fresh = build({ catalog, mapping, topics });
  const diffs = [];
  const read = (f) => fs.readFileSync(f, 'utf8');
  if (read(catalogFile) !== fresh.catalogJson) diffs.push('site/data/catalog.json 与 catalog.json 不一致（需重新生成）');
  if (read(mappingFile) !== fresh.mappingJson) diffs.push('site/data/course-mapping.json 与 course-mapping.json 不一致（需重新生成）');
  if (read(snapshotFile) !== fresh.snapshot) diffs.push('_community-skills.md 与 catalog 不一致（需重新生成）');
  return { ok: diffs.length === 0, diffs };
}

function load() {
  const readJSON = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
  return {
    catalog: readJSON('catalog/catalog.json'),
    mapping: readJSON('catalog/course-mapping.json'),
    topics: readJSON('catalog/topics.json'),
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { catalog, mapping, topics } = load();
  const out = build({ catalog, mapping, topics });
  if (process.argv.includes('--check')) {
    const r = check({
      catalog, mapping, topics,
      catalogFile: path.join(ROOT, 'site', 'data', 'catalog.json'),
      mappingFile: path.join(ROOT, 'site', 'data', 'course-mapping.json'),
      snapshotFile: path.join(ROOT, 'cc-assistant', 'modules', '_community-skills.md'),
    });
    if (!r.ok) { for (const d of r.diffs) console.log('漂移:', d); process.exit(1); }
    console.log('产物与 catalog 一致 ✓');
    process.exit(0);
  }
  fs.mkdirSync(path.join(ROOT, 'site', 'data'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'site', 'data', 'catalog.json'), out.catalogJson);
  fs.writeFileSync(path.join(ROOT, 'site', 'data', 'course-mapping.json'), out.mappingJson);
  fs.writeFileSync(path.join(ROOT, 'cc-assistant', 'modules', '_community-skills.md'), out.snapshot);
  console.log('三产物已生成 ✓');
}
