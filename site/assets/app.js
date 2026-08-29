// Claude Code Horse Tamer 社区 Skill 目录客户端渲染（REQ-SIT-002/003/004/005）
// 读取 site/data/catalog.json + course-mapping.json（机器生成副本），按主题/课程模块筛选。
// 安全：所有 skill 数据经 textContent 渲染，禁止 innerHTML 注入（目录条目由社区 PR 提交）。
(async () => {
  const catalog = await (await fetch('data/catalog.json')).json();
  const mapping = await (await fetch('data/course-mapping.json')).json();
  const skills = Array.isArray(catalog.skills) ? catalog.skills : [];

  const topics = [...new Set(skills.flatMap((s) => s.topics ?? []))].sort();
  const modules = Object.keys(mapping).sort();

  let activeTopic = null;
  let activeModule = null;
  let activeType = null;

  const TYPES = ['skill', 'agent', 'mcp-server', 'plugin'];
  const typeChipsEl = document.getElementById('type-chips');
  if (typeChipsEl) {
    const allT = document.createElement('button');
    allT.type = 'button';
    allT.className = 'chip active';
    allT.textContent = '全部';
    allT.addEventListener('click', () => { activeType = null; render(); });
    typeChipsEl.appendChild(allT);
    TYPES.forEach((t) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chip';
      btn.dataset.type = t;
      btn.textContent = t;
      btn.addEventListener('click', () => { activeType = activeType === t ? null : t; render(); });
      typeChipsEl.appendChild(btn);
    });
  }

  const chipsEl = document.getElementById('topic-chips');
  topics.forEach((t) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chip';
    btn.dataset.topic = t;
    btn.textContent = t;
    btn.addEventListener('click', () => { activeTopic = activeTopic === t ? null : t; render(); });
    chipsEl.appendChild(btn);
  });

  const sel = document.getElementById('module-select');
  const all = document.createElement('option');
  all.value = '';
  all.textContent = '全部模块';
  sel.appendChild(all);
  modules.forEach((m) => {
    const opt = document.createElement('option');
    opt.value = m;
    opt.textContent = m;
    sel.appendChild(opt);
  });
  sel.addEventListener('change', () => { activeModule = sel.value || null; render(); });

  function matches(s) {
    if (activeType && (s.type ?? 'skill') !== activeType) return false;
    if (activeTopic && !(s.topics ?? []).includes(activeTopic)) return false;
    if (activeModule) {
      const mapped = mapping[activeModule] ?? [];
      if (!(s.topics ?? []).some((t) => mapped.includes(t))) return false;
    }
    return true;
  }

  function isSafeUrl(v) {
    try { const u = new URL(v); return u.protocol === 'http:' || u.protocol === 'https:'; } catch { return false; }
  }

  function render() {
    const list = skills.filter(matches);
    chipsEl.querySelectorAll('.chip').forEach((c) => c.classList.toggle('active', c.dataset.topic === activeTopic));
    typeChipsEl.querySelectorAll('.chip').forEach((c) => c.classList.toggle('active', c.dataset.type === activeType));
    document.getElementById('filter-status').textContent =
      `当前：${activeType ? '类型 ' + activeType : '全部类型'}${activeTopic ? ' + 主题 ' + activeTopic : ''}${activeModule ? ' + 模块 ' + activeModule : ''}｜${list.length} 条条目`;

    const el = document.getElementById('skill-list');
    el.textContent = '';
    list.forEach((s) => {
      const card = document.createElement('article');
      card.className = 'skill-card';

      const h = document.createElement('h3');
      h.textContent = s.name;
      const badge = document.createElement('span');
      badge.className = 'type-badge';
      badge.textContent = s.type ?? 'skill';
      h.appendChild(badge);
      const span = document.createElement('span');
      span.className = 'topics';
      span.textContent = ' ' + (s.topics ?? []).join(', ');
      h.appendChild(span);

      const desc = document.createElement('p');
      desc.className = 'desc';
      desc.textContent = s.description ?? '';

      const meta = document.createElement('ul');
      meta.className = 'meta';
      const li = (label, value, href) => {
        const item = document.createElement('li');
        item.appendChild(document.createTextNode(label + ': '));
        if (href) {
          const a = document.createElement('a');
          a.href = href;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          a.textContent = value;
          item.appendChild(a);
        } else {
          const code = document.createElement('code');
          code.textContent = value;
          item.appendChild(code);
        }
        meta.appendChild(item);
      };
      li('作者', s.author ?? '', false);
      li('仓库', s.repo ?? '', isSafeUrl(s.repo) ? s.repo : undefined);
      li('安装', s.install ?? '', false);
      li('License', s.license ?? '', false);

      card.append(h, desc, meta);
      el.appendChild(card);
    });
    if (list.length === 0) {
      const p = document.createElement('p');
      p.className = 'empty';
      p.textContent = '没有匹配的条目。';
      el.appendChild(p);
    }
  }

  render();

  if (location.protocol === 'file:') {
    document.getElementById('local-note').textContent =
      '提示：file:// 直开因浏览器 CORS 限制无法加载数据，请用本地 HTTP 服务访问（如在该目录运行 python -m http.server）。';
  }
})();
