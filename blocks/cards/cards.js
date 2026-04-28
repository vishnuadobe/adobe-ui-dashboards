/**
 * Checks whether an href value is usable for a card CTA.
 *
 * @param {string | null | undefined} href The candidate href
 * @returns {boolean} Whether the href should be used
 */
function isValidCardHref(href) {
  if (!href) return false;

  const value = href.trim();
  return Boolean(value && value !== '/' && value !== '#');
}

/**
 * Extracts a usable href from the authored link cell.
 *
 * @param {Element | undefined} linkCol The link column
 * @returns {string} The resolved href
 */
function getCardHref(linkCol) {
  const anchor = linkCol?.querySelector('a[href]');
  const anchorHref = anchor?.getAttribute('href')?.trim();
  if (isValidCardHref(anchorHref)) return anchorHref;

  const titleHref = anchor?.getAttribute('title')?.trim();
  if (isValidCardHref(titleHref)) return titleHref;

  const anchorTextHref = anchor?.textContent?.trim();
  if (isValidCardHref(anchorTextHref)) return anchorTextHref;

  const textHref = linkCol?.textContent?.trim();
  return isValidCardHref(textHref) ? textHref : '';
}

/**
 * Detects the authored table header row so it is not rendered as a card.
 *
 * @param {Element[]} cols The row columns
 * @returns {boolean} Whether the row is the column label row
 */
function isHeaderRow(cols) {
  if (cols.length < 4) return false;

  const labels = cols.map((col) => col.textContent?.trim().toLowerCase() ?? '');
  return labels[0] === 'icon'
    && labels[1] === 'title'
    && labels[2] === 'description'
    && labels[3] === 'link';
}

/**
 * Creates the shared drawer used by all cards in the block.
 *
 * @returns {Object} Drawer elements
 */
function createDrawer() {
  const overlay = document.createElement('div');
  overlay.classList.add('app-cards-drawer-overlay');
  overlay.setAttribute('hidden', '');

  const drawer = document.createElement('aside');
  drawer.classList.add('app-cards-drawer');
  drawer.setAttribute('aria-hidden', 'true');
  drawer.setAttribute('aria-label', 'Card details');

  const header = document.createElement('div');
  header.classList.add('app-cards-drawer-header');

  const title = document.createElement('h2');
  title.classList.add('app-cards-drawer-title');

  const closeBtn = document.createElement('button');
  closeBtn.classList.add('app-cards-drawer-close');
  closeBtn.setAttribute('type', 'button');
  closeBtn.setAttribute('aria-label', 'Close details');
  closeBtn.textContent = 'Close';

  const body = document.createElement('div');
  body.classList.add('app-cards-drawer-body');

  const description = document.createElement('p');
  description.classList.add('app-cards-drawer-description');

  const action = document.createElement('a');
  action.classList.add('app-cards-drawer-link', 'button', 'accent');
  action.textContent = 'Open app';
  action.setAttribute('hidden', '');

  header.append(title, closeBtn);
  body.append(description, action);
  drawer.append(header, body);

  return {
    overlay,
    drawer,
    title,
    description,
    action,
    closeBtn,
  };
}

/**
 * Picks a deterministic palette for the icon monogram based on the card name.
 *
 * @param {string} name The card title
 * @returns {{bg: string, fg: string}} Background/foreground colors
 */
function pickPalette(name) {
  const palettes = [
    { bg: '#FDEAD7', fg: '#A6561A' }, // amber
    { bg: '#E2F2EA', fg: '#1F6E46' }, // green
    { bg: '#E4EEFB', fg: '#1F4FA0' }, // blue
    { bg: '#F2E8FB', fg: '#6A2CA0' }, // purple
    { bg: '#FBE4E4', fg: '#B12C2C' }, // red
    { bg: '#E6F1F1', fg: '#1F6A6A' }, // teal
    { bg: '#E8E5FF', fg: '#4B43D8' }, // indigo
    { bg: '#F5EAD7', fg: '#8A5A16' }, // sand
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) % 1000000007;
  }
  return palettes[hash % palettes.length];
}

/**
 * Loads and decorates the cards block.
 *
 * Authored structure:
 * | Cards |
 * | Icon | Title | Description | Link | Tag (optional) |
 * | [img] | Photoshop | Edit and composite images | https://example.com/photoshop | Creative |
 *
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  const grid = document.createElement('ul');
  grid.classList.add('app-cards-grid');
  grid.setAttribute('role', 'list');

  const {
    overlay,
    drawer,
    title: drawerTitle,
    description: drawerDescription,
    action: drawerAction,
    closeBtn,
  } = createDrawer();

  const closeDrawer = () => {
    overlay.setAttribute('hidden', '');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('app-cards-drawer-open');
  };

  const openDrawer = ({ name, description, href }) => {
    drawerTitle.textContent = name;
    drawerDescription.textContent = description;

    if (href) {
      drawerAction.href = href;
      drawerAction.removeAttribute('hidden');
    } else {
      drawerAction.removeAttribute('href');
      drawerAction.setAttribute('hidden', '');
    }

    overlay.removeAttribute('hidden');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('app-cards-drawer-open');
  };

  overlay.addEventListener('click', closeDrawer);
  closeBtn.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && drawer.getAttribute('aria-hidden') === 'false') {
      closeDrawer();
    }
  });

  rows.forEach((row) => {
    const cols = [...row.children];
    const [iconCol, titleCol, descriptionCol, linkCol, tagCol] = cols;

    if (cols.length < 4 || isHeaderRow(cols)) return;

    const card = document.createElement('li');
    card.classList.add('app-cards-card');

    const name = titleCol?.textContent?.trim() ?? '';
    const description = descriptionCol?.textContent?.trim() ?? '';
    const href = getCardHref(linkCol);
    const tag = tagCol?.textContent?.trim() ?? '';

    // Top row: icon + kebab menu
    const topRow = document.createElement('div');
    topRow.classList.add('app-cards-top');

    const iconWrapper = document.createElement('div');
    iconWrapper.classList.add('app-cards-icon');

    const picture = iconCol?.querySelector('picture');
    const img = picture?.querySelector('img') ?? iconCol?.querySelector('img, svg');
    if (picture) {
      img?.removeAttribute('width');
      img?.removeAttribute('height');
      iconWrapper.append(picture);
      iconWrapper.classList.add('has-image');
    } else if (img) {
      img.removeAttribute('width');
      img.removeAttribute('height');
      iconWrapper.append(img);
      iconWrapper.classList.add('has-image');
    } else {
      const palette = pickPalette(name);
      iconWrapper.style.setProperty('--icon-bg', palette.bg);
      iconWrapper.style.setProperty('--icon-fg', palette.fg);
      const monogram = document.createElement('span');
      monogram.classList.add('app-cards-monogram');
      monogram.textContent = name.charAt(0).toUpperCase() || '?';
      iconWrapper.append(monogram);
    }

    const menuBtn = document.createElement('button');
    menuBtn.classList.add('app-cards-menu');
    menuBtn.setAttribute('aria-label', name ? `Open details for ${name}` : 'Open details');
    menuBtn.setAttribute('type', 'button');
    menuBtn.innerHTML = '<span aria-hidden="true">⋯</span>';
    menuBtn.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      openDrawer({ name, description, href });
    });

    topRow.append(iconWrapper, menuBtn);

    // Body: name + description
    const body = document.createElement('div');
    body.classList.add('app-cards-body');

    const title = document.createElement('p');
    title.classList.add('app-cards-name');
    title.textContent = name;
    body.append(title);

    if (description) {
      const desc = document.createElement('p');
      desc.classList.add('app-cards-desc');
      desc.textContent = description;
      body.append(desc);
    }

    // Footer: tag pill + launch link
    const foot = document.createElement('div');
    foot.classList.add('app-cards-foot');

    if (tag) {
      const pill = document.createElement('span');
      pill.classList.add('app-cards-pill');
      pill.textContent = tag;
      foot.append(pill);
    } else {
      foot.append(document.createElement('span'));
    }

    if (href) {
      const launch = document.createElement('span');
      launch.classList.add('app-cards-launch');
      launch.innerHTML = 'Launch <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7"/><path d="M8 7h9v9"/></svg>';
      foot.append(launch);
    }

    if (href) {
      const cardLink = document.createElement('a');
      cardLink.classList.add('app-cards-link');
      cardLink.href = href;
      cardLink.setAttribute('aria-label', name ? `Open ${name}` : 'Open card');
      card.append(cardLink);
    }

    card.append(topRow, body, foot);
    grid.append(card);
  });

  block.replaceChildren(grid, overlay, drawer);
}
