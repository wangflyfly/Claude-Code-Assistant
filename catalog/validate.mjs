// validate.mjs —— 社区 Skill 目录结构校验脚本（REQ-CAT-002/003、REQ-CMP-001/002/004、REQ-CIV-001/002）
// 用法：node catalog/validate.mjs         校验默认路径，退出码 0=通过 / 1=失败（输出 文件:字段:原因）
//       validate() 导出供用例矩阵/CI 复用
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

export function validate({ catalogFile, topicsFile, mappingFile, modulesDir } = {}) {
  catalogFile ??= path.join(ROOT, 'catalog', 'catalog.json');
  topicsFile ??= path.join(ROOT, 'catalog', 'topics.json');
  mappingFile ??= path.join(ROOT, 'catalog', 'course-mapping.json');
  modulesDir ??= path.join(ROOT, 'cc-assistant', 'modules');
  const schemaFile = path.join(ROOT, 'catalog', 'catalog.schema.json');

  const errors = [];
  const catalog = parseJSON(catalogFile, errors);
  const topics = parseJSON(topicsFile, errors);
  const mapping = parseJSON(mappingFile, errors);

  // topics.json：数组、每主题 {id, description}、id 唯一
  const topicIds = new Set();
  if (Array.isArray(topics)) {
    topics.forEach((t, i) => {
      if (!t || typeof t.id !== 'string' || !t.id.trim()) errors.push({ file: 'topics.json', field: `[${i}].id`, message: '主题缺 id 或为空' });
      if (!t || typeof t.description !== 'string' || !t.description.trim()) errors.push({ file: 'topics.json', field: `[${i}].description`, message: '主题缺 description 或为空' });
      if (t && typeof t.id === 'string') {
        if (topicIds.has(t.id)) errors.push({ file: 'topics.json', field: `[${i}].id`, message: `主题 id 重复: ${t.id}` });
        topicIds.add(t.id);
      }
    });
  } else if (topics !== undefined) {
    errors.push({ file: 'topics.json', field: '', message: '应为主题数组' });
  }

  // catalog.json：结构经 schema 校验（REQ-CAT-003）
  const schema = parseJSON(schemaFile, errors);
  if (schema && catalog !== undefined) validateAgainstSchema(catalog, schema, 'catalog.json', '', errors);

  // catalog.json：id 唯一 + topics ⊆ 词表（schema 无法表达跨文件约束）
  const skills = catalog && Array.isArray(catalog.skills) ? catalog.skills : [];
  const seen = new Set();
  skills.forEach((s, i) => {
    if (s && typeof s.id === 'string') {
      if (seen.has(s.id)) errors.push({ file: 'catalog.json', field: `skills[${i}].id`, message: `id 重复: ${s.id}` });
      seen.add(s.id);
    }
    if (s && Array.isArray(s.topics)) {
      s.topics.forEach((t) => {
        if (typeof t === 'string' && !topicIds.has(t)) errors.push({ file: 'catalog.json', field: `skills[${i}].topics`, message: `词表外主题: ${t}` });
      });
    }
  });

  // course-mapping.json：键 = 模块文件剔除 m0，值非空且 ⊆ 词表（REQ-CMP-002/004）
  const moduleFiles = fs.existsSync(modulesDir)
    ? fs.readdirSync(modulesDir).filter((f) => f.endsWith('.md') && f !== 'm0-onboarding.md').map((f) => f.replace(/\.md$/, ''))
    : [];
  const moduleSet = new Set(moduleFiles);
  if (mapping && typeof mapping === 'object' && !Array.isArray(mapping)) {
    for (const k of moduleSet) if (!(k in mapping)) errors.push({ file: 'course-mapping.json', field: k, message: '缺少模块键' });
    for (const k of Object.keys(mapping)) if (!moduleSet.has(k)) errors.push({ file: 'course-mapping.json', field: k, message: `非模块键: ${k}（模块清单=${moduleFiles.join(',')}）` });
    for (const [k, v] of Object.entries(mapping)) {
      if (!Array.isArray(v) || v.length === 0) { errors.push({ file: 'course-mapping.json', field: k, message: '映射值应为非空主题数组' }); continue; }
      v.forEach((t) => { if (typeof t === 'string' && !topicIds.has(t)) errors.push({ file: 'course-mapping.json', field: k, message: `词表外主题: ${t}` }); });
    }
  }

  return { ok: errors.length === 0, errors };
}

function parseJSON(file, errors) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    errors.push({ file: path.basename(file), field: '', message: `非法 JSON: ${e.message}` });
    return undefined;
  }
}

// 极简 draft-07 子集校验（覆盖本仓库 catalog.schema.json 用到的构造）
function validateAgainstSchema(data, schema, file, base, errors) {
  const walk = (value, node, ptr) => {
    if (node.type === 'object') {
      if (typeof value !== 'object' || value === null || Array.isArray(value)) { errors.push({ file, field: ptr, message: `应为对象（type=${typeof value}）` }); return; }
      if (node.required) for (const key of node.required) if (!(key in value)) errors.push({ file, field: ptr ? `${ptr}.${key}` : key, message: '缺必填字段' });
      if (node.additionalProperties === false) for (const key of Object.keys(value)) if (!node.properties || !(key in node.properties)) errors.push({ file, field: ptr ? `${ptr}.${key}` : key, message: `未声明的字段: ${key}` });
      if (node.properties) for (const [key, sub] of Object.entries(node.properties)) if (key in value) walk(value[key], sub, ptr ? `${ptr}.${key}` : key);
    } else if (node.type === 'array') {
      if (!Array.isArray(value)) { errors.push({ file, field: ptr, message: `应为数组（type=${typeof value}）` }); return; }
      if (node.minItems != null && value.length < node.minItems) errors.push({ file, field: ptr, message: `数组至少 ${node.minItems} 项` });
      if (node.uniqueItems && new Set(value.map((v) => JSON.stringify(v))).size !== value.length) errors.push({ file, field: ptr, message: '数组存在重复项' });
      if (node.items) value.forEach((v, i) => walk(v, node.items, `${ptr}[${i}]`));
    } else if (node.type === 'string') {
      if (typeof value !== 'string') { errors.push({ file, field: ptr, message: `应为字符串（type=${typeof value}）` }); return; }
      if (node.minLength != null && value.length < node.minLength) errors.push({ file, field: ptr, message: `字符串至少 ${node.minLength} 字符` });
      if (node.pattern && !new RegExp(node.pattern).test(value)) errors.push({ file, field: ptr, message: `不符合格式: ${node.pattern}` });
      if (node.format === 'uri') {
        try { new URL(value); } catch { errors.push({ file, field: ptr, message: `无效 URL: ${value}` }); }
      }
    }
  };
  walk(data, schema, base);
}

// CLI 入口
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = validate();
  if (!result.ok) {
    for (const e of result.errors) console.log(`${e.file}: ${e.field}: ${e.message}`);
    process.exit(1);
  }
  console.log('catalog 校验通过 ✓');
  process.exit(0);
}
