/**
 * App Cards Block
 *
 * Authored structure (one row per app):
 * | App Cards |              |
 * |-----------|--------------|
 * | (empty)   | App Name     |
 * |           | Description  |
 * |           | [CTA link]   |
 *
 * Renders as: icon-centered card with app name below and ··· menu top-right.
 *
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];

  const grid = document.createElement('ul');
  grid.classList.add('app-cards-grid');
  grid.setAttribute('role', 'list');

  rows.forEach((row) => {
    const cols = [...row.children];
    const iconCol = cols[0];
    const contentCol = cols[1] ?? cols[0];

    const card = document.createElement('li');
    card.classList.add('app-cards-card');

    // --- Three-dot menu button (top right) ---
    const menuBtn = document.createElement('button');
    menuBtn.classList.add('app-cards-menu');
    menuBtn.setAttribute('aria-label', 'More options');
    menuBtn.setAttribute('type', 'button');
    menuBtn.innerHTML = '<span aria-hidden="true">···</span>';
    menuBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      // placeholder for future menu logic
    });

    // --- Icon ---
    const iconWrapper = document.createElement('div');
    iconWrapper.classList.add('app-cards-icon');

    const img = iconCol?.querySelector('img, svg');
    if (img) {
      img.removeAttribute('width');
      img.removeAttribute('height');
      iconWrapper.append(img);
    } else {
      const appName = contentCol?.querySelector('h1,h2,h3,h4,h5,h6')?.textContent?.trim() ?? '?';
      const monogram = document.createElement('span');
      monogram.classList.add('app-cards-monogram');
      monogram.textContent = appName.charAt(0).toUpperCase();
      iconWrapper.append(monogram);
    }

    // --- App name ---
    const nameEl = contentCol?.querySelector('h1,h2,h3,h4,h5,h6');
    const name = document.createElement('p');
    name.classList.add('app-cards-name');
    name.textContent = nameEl?.textContent?.trim() ?? '';

    // --- Link (stretched to cover whole card, sits behind menu button) ---
    const link = contentCol?.querySelector('a[href]');
    if (link) {
      link.classList.add('app-cards-link');
      const appName = name.textContent;
      link.setAttribute('aria-label', appName ? `Open ${appName}` : 'Open app');
      link.textContent = '';
      card.append(link);
    }

    // --- Assemble ---
    card.append(menuBtn, iconWrapper, name);
    grid.append(card);
  });

  block.replaceChildren(grid);
}
