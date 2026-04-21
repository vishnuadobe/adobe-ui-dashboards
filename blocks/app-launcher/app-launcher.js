/**
 * Parse app entries authored in the block's table rows.
 * Each row: name | url | description | section | tag | icon-bg | icon-fg | icon-label
 * Falls back to default data if no rows are present.
 * @param {Element} block
 * @returns {Array}
 */
function parseAuthoredApps(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  if (!rows.length) return [];
  return rows.map((row, i) => {
    const cells = [...row.querySelectorAll(':scope > div')];
    const get = (n) => cells[n]?.textContent.trim() || '';
    const name = get(0);
    if (!name) return null;
    return {
      id: `${name.toLowerCase().replace(/\s+/g, '-')}-${i}`,
      name,
      url: get(1) || '#',
      desc: get(2) || '',
      section: get(3) || 'work',
      tag: get(4) || '',
      bg: get(5) || '#e8e8e8',
      fg: get(6) || '#131313',
      label: get(7) || name[0].toUpperCase(),
    };
  }).filter(Boolean);
}

/**
 * App Launcher block — Preact + htm, Spectrum 2 design tokens
 * @param {Element} block
 */
export default async function decorate(block) {
  // Read authored app data from block rows before clearing
  const authoredApps = parseAuthoredApps(block);

  block.innerHTML = '';
  block.classList.add('full-width');

  const root = document.createElement('div');
  block.appendChild(root);

  // Load Preact + htm from CDN (no build step required)
  // eslint-disable-next-line import/no-unresolved
  const preact = await import('https://unpkg.com/htm@3.1.1/preact/standalone.module.js');
  const {
    html, render, useState, useMemo, useEffect, useRef,
  } = preact;

  /* ── App data ── */
  const APPS = authoredApps.length ? authoredApps : [
    {
      id: 'mailflow', name: 'Mailflow', desc: 'Team inbox & shared conversations.', url: 'https://example.com/mailflow', section: 'work', tag: 'Comms', bg: '#E8E5FF', fg: '#4B43D8', label: 'M',
    },
    {
      id: 'board', name: 'Board', desc: 'Plan sprints, track tickets, ship.', url: 'https://example.com/board', section: 'work', tag: 'Product', bg: '#E2F2EA', fg: '#1F6E46', label: 'B',
    },
    {
      id: 'atlas', name: 'Atlas Docs', desc: 'Collaborative wiki & knowledge base.', url: 'https://example.com/atlas', section: 'work', tag: 'Docs', bg: '#FDEAD7', fg: '#A6561A', label: 'A',
    },
    {
      id: 'metrics', name: 'Metrics', desc: 'Dashboards for product & growth data.', url: 'https://example.com/metrics', section: 'work', tag: 'Analytics', bg: '#E4EEFB', fg: '#1F4FA0', label: 'M',
    },
    {
      id: 'ledger', name: 'Ledger', desc: 'Finance, invoicing & expense approvals.', url: 'https://example.com/ledger', section: 'work', tag: 'Finance', bg: '#F2E8FB', fg: '#6A2CA0', label: 'L',
    },
    {
      id: 'pulse', name: 'Pulse', desc: 'Incident response & on-call rotation.', url: 'https://example.com/pulse', section: 'work', tag: 'Ops', bg: '#FBE4E4', fg: '#B12C2C', label: 'P',
    },
    {
      id: 'forge', name: 'Forge CI', desc: 'Continuous integration pipelines.', url: 'https://example.com/forge', section: 'work', tag: 'Engineering', bg: '#E6F1F1', fg: '#1F6A6A', label: 'F',
    },
    {
      id: 'meet', name: 'Meet', desc: 'HD video calls and webinars.', url: 'https://example.com/meet', section: 'work', tag: 'Comms', bg: '#EAF5E8', fg: '#2E6A28', label: 'M',
    },
    {
      id: 'inkwell', name: 'Inkwell', desc: 'Writing tool for briefs and posts.', url: 'https://example.com/inkwell', section: 'personal', tag: 'Writing', bg: '#EFEDE7', fg: '#3B382F', label: 'I',
    },
    {
      id: 'drive', name: 'Cloud Drive', desc: 'Files, shares and team storage.', url: 'https://example.com/drive', section: 'personal', tag: 'Storage', bg: '#E4F0FB', fg: '#1F5FA0', label: 'D',
    },
    {
      id: 'timesheet', name: 'Timesheet', desc: 'Log hours and manage PTO.', url: 'https://example.com/timesheet', section: 'personal', tag: 'HR', bg: '#F5EAD7', fg: '#8A5A16', label: 'T',
    },
    {
      id: 'learn', name: 'Learn', desc: 'Courses, certifications & training.', url: 'https://example.com/learn', section: 'personal', tag: 'Learning', bg: '#EFE6FB', fg: '#5A2A9A', label: 'L',
    },
  ];

  /* ── SVG icons ── */
  const IconSearch = () => html`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>`;
  const IconStar = ({ filled }) => html`<svg width="16" height="16" viewBox="0 0 24 24" fill=${filled ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><polygon points="12 2 15.1 8.3 22 9.3 17 14.1 18.2 21 12 17.8 5.8 21 7 14.1 2 9.3 8.9 8.3 12 2"/></svg>`;
  const IconKebab = () => html`<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/></svg>`;
  const IconExt = () => html`<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7"/><path d="M8 7h9v9"/></svg>`;
  const IconChev = () => html`<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`;

  /* ── AppCard component ── */
  function AppCard({
    app, favorite, onFav, menuOpen, onMenu, onLaunch,
  }) {
    const handleCardClick = (e) => {
      if (menuOpen) { e.preventDefault(); return; }
      onLaunch(app);
    };

    return html`
      <a
        class="al-card"
        href=${app.url}
        target="_blank"
        rel="noreferrer"
        onClick=${handleCardClick}
      >
        <div class="al-card-top">
          <div
            class="al-card-icon"
            style=${{ '--icon-bg': app.bg, '--icon-fg': app.fg }}
          >
            ${app.label}
          </div>
          <div class="al-card-actions">
            <button
              class=${`al-iconbtn${favorite ? ' fav-on' : ''}`}
              onClick=${(e) => { e.preventDefault(); e.stopPropagation(); onFav(app.id); }}
              aria-label=${favorite ? 'Remove from favorites' : 'Add to favorites'}
              title=${favorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <${IconStar} filled=${favorite} />
            </button>
            <button
              class="al-iconbtn"
              onClick=${(e) => { e.preventDefault(); e.stopPropagation(); onMenu(app.id); }}
              aria-label="More options"
              title="More options"
            >
              <${IconKebab} />
            </button>
          </div>
        </div>

        <div class="al-card-body">
          <div class="al-card-name">${app.name}</div>
          <div class="al-card-desc">${app.desc}</div>
        </div>

        <div class="al-card-foot">
          <span class="al-pill">${app.tag}</span>
          <span class="al-launch-link">Launch <${IconExt} /></span>
        </div>

        ${menuOpen && html`
          <div class="al-menu" onClick=${(e) => e.preventDefault()}>
            <button class="al-menu-btn" onClick=${(e) => { e.preventDefault(); e.stopPropagation(); window.open(app.url, '_blank'); onMenu(null); }}>
              Open in new tab
            </button>
            <button class="al-menu-btn" onClick=${(e) => { e.preventDefault(); e.stopPropagation(); onFav(app.id); onMenu(null); }}>
              ${favorite ? 'Remove from favorites' : 'Add to favorites'}
            </button>
            <button class="al-menu-btn" onClick=${(e) => { e.preventDefault(); e.stopPropagation(); navigator.clipboard?.writeText(app.url); onMenu(null); }}>
              Copy link
            </button>
            <div class="al-menu-sep"></div>
            <button class="al-menu-btn" onClick=${(e) => { e.preventDefault(); e.stopPropagation(); onMenu(null); }}>
              Request access
            </button>
            <button class="al-menu-btn danger" onClick=${(e) => { e.preventDefault(); e.stopPropagation(); onMenu(null); }}>
              Hide from dashboard
            </button>
          </div>
        `}
      </a>
    `;
  }

  /* ── App root component ── */
  function AppLauncher() {
    const [q, setQ] = useState('');
    const [sort, setSort] = useState('az');
    const [section, setSection] = useState('work');
    const [favs, setFavs] = useState(() => {
      try { return JSON.parse(localStorage.getItem('launch.favs') || '["board","metrics"]'); } catch (_) { return []; }
    });
    const [menuOpen, setMenuOpen] = useState(null);
    const [toast, setToast] = useState(null);
    const searchRef = useRef(null);

    // Persist favourites
    useEffect(() => { localStorage.setItem('launch.favs', JSON.stringify(favs)); }, [favs]);

    // Keyboard: / focuses search, Escape closes menu
    useEffect(() => {
      const onKey = (e) => {
        if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
          e.preventDefault();
          searchRef.current?.focus();
        } else if (e.key === 'Escape') {
          setMenuOpen(null);
        }
      };
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }, []);

    // Close menu on outside click
    useEffect(() => {
      if (!menuOpen) return undefined;
      const close = () => setMenuOpen(null);
      setTimeout(() => window.addEventListener('click', close), 0);
      return () => window.removeEventListener('click', close);
    }, [menuOpen]);

    const counts = useMemo(() => ({
      work: APPS.filter((a) => a.section === 'work').length,
      personal: APPS.filter((a) => a.section === 'personal').length,
      favorites: favs.length,
      all: APPS.length,
    }), [favs]);

    const visible = useMemo(() => {
      let list = [...APPS];
      if (section === 'favorites') list = list.filter((a) => favs.includes(a.id));
      else if (section !== 'all') list = list.filter((a) => a.section === section);
      const ql = q.trim().toLowerCase();
      if (ql) {
        list = list.filter((a) => a.name.toLowerCase().includes(ql)
          || a.desc.toLowerCase().includes(ql)
          || a.tag.toLowerCase().includes(ql));
      }
      if (sort === 'az') list.sort((a, b) => a.name.localeCompare(b.name));
      if (sort === 'za') list.sort((a, b) => b.name.localeCompare(a.name));
      if (sort === 'fav') list.sort((a, b) => (favs.includes(b.id) ? 1 : 0) - (favs.includes(a.id) ? 1 : 0));
      return list;
    }, [q, sort, section, favs]);

    const toggleFav = (id) => setFavs(
      (prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]),
    );

    const launch = (app) => {
      setToast(`Opening ${app.name}…`);
      setTimeout(() => setToast(null), 1800);
    };

    const cycleSort = () => {
      const order = ['az', 'za', 'fav'];
      setSort((s) => order[(order.indexOf(s) + 1) % order.length]);
    };

    const sortLabels = { az: 'A–Z', za: 'Z–A', fav: 'Favorites' };
    const sortLabel = sortLabels[sort];

    const tabs = [
      { id: 'work', label: 'Work', count: counts.work },
      { id: 'personal', label: 'Personal', count: counts.personal },
      { id: 'favorites', label: 'Favorites', count: counts.favorites },
      { id: 'all', label: 'All apps', count: counts.all },
    ];

    const sectionLabel = {
      work: 'Work apps',
      personal: 'Personal apps',
      favorites: 'Your favorites',
      all: 'Every app available to you',
    }[section];

    return html`
      <div>
        <header class="al-topbar">
          <div class="al-topbar-inner">
            <a class="al-brand" href="/">
              <div class="al-brand-mark">L</div>
              <span>Launchpad</span>
            </a>

            <div class="al-search" role="search">
              <span class="al-search-icon" aria-hidden="true"><${IconSearch} /></span>
              <input
                ref=${searchRef}
                class="al-search-input"
                type="search"
                value=${q}
                onInput=${(e) => setQ(e.target.value)}
                placeholder="Search your apps"
                aria-label="Search apps"
              />
              <span class="al-kbd" aria-hidden="true">/</span>
            </div>

            <button class="al-user" aria-label="User menu">
              <div class="al-user-meta">
                <div class="al-user-name">Jordan Reeve</div>
                <div class="al-user-org">Northwind Labs</div>
              </div>
              <div class="al-avatar" aria-hidden="true">JR</div>
              <${IconChev} />
            </button>
          </div>
        </header>

        <main class="al-main">
          <div class="al-page-head">
            <div>
              <h1>My Apps</h1>
              <p>${visible.length} ${visible.length === 1 ? 'app' : 'apps'} · click a card to launch</p>
            </div>
            <button class="al-sort-btn" onClick=${cycleSort} aria-label="Change sort order">
              Sort: ${sortLabel} <${IconChev} />
            </button>
          </div>

          <div class="al-tabs" role="tablist" aria-label="App sections">
            ${tabs.map((t) => html`
              <button
                key=${t.id}
                class=${`al-tab${section === t.id ? ' active' : ''}`}
                role="tab"
                aria-selected=${section === t.id}
                onClick=${() => setSection(t.id)}
              >
                ${t.label}
                <span class="al-tab-count">${t.count}</span>
              </button>
            `)}
          </div>

          <div class="al-section-label" aria-live="polite">
            <span class="al-section-dot" aria-hidden="true"></span>
            ${sectionLabel}
          </div>

          ${visible.length === 0
    ? html`
              <div class="al-empty" role="status">
                <h3>No apps match</h3>
                <p>Try a different search or switch sections.</p>
              </div>
            `
    : html`
              <div class="al-grid" role="list">
                ${visible.map((app) => html`
                  <div role="listitem" key=${app.id}>
                    <${AppCard}
                      app=${app}
                      favorite=${favs.includes(app.id)}
                      onFav=${toggleFav}
                      menuOpen=${menuOpen === app.id}
                      onMenu=${(id) => setMenuOpen((prev) => (prev === id ? null : id))}
                      onLaunch=${launch}
                    />
                  </div>
                `)}
              </div>
            `
}
        </main>

        <footer class="al-footer">
          <span>Last sign in: a few seconds ago</span>
          <span>© 2026 Northwind Labs · Privacy</span>
        </footer>

        ${toast && html`<div class="al-toast" role="status" aria-live="polite">${toast}</div>`}
      </div>
    `;
  }

  render(html`<${AppLauncher} />`, root);
}
