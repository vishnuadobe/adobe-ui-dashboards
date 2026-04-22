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
 * Loads and decorates the cards block.
 *
 * Authored structure:
 * | Cards |
 * | Icon | Title | Description | Link |
 * | [img] | Photoshop | Edit and composite images | https://example.com/photoshop |
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
    const [iconCol, titleCol, descriptionCol, linkCol] = cols;

    if (cols.length < 4 || isHeaderRow(cols)) return;

    const card = document.createElement('li');
    card.classList.add('app-cards-card');

    const content = document.createElement('div');
    content.classList.add('app-cards-content');

    const name = titleCol?.textContent?.trim() ?? '';
    const description = descriptionCol?.textContent?.trim() ?? '';
    const href = getCardHref(linkCol);

    const menuBtn = document.createElement('button');
    menuBtn.classList.add('app-cards-menu');
    menuBtn.setAttribute('aria-label', name ? `Open details for ${name}` : 'Open details');
    menuBtn.setAttribute('type', 'button');
    menuBtn.innerHTML = '<span aria-hidden="true">...</span>';
    menuBtn.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      openDrawer({ name, description, href });
    });

    const iconWrapper = document.createElement('div');
    iconWrapper.classList.add('app-cards-icon');

    const picture = iconCol?.querySelector('picture');
    const img = picture?.querySelector('img') ?? iconCol?.querySelector('img, svg');
    if (picture) {
      img?.removeAttribute('width');
      img?.removeAttribute('height');
      iconWrapper.append(picture);
    } else if (img) {
      img.removeAttribute('width');
      img.removeAttribute('height');
      iconWrapper.append(img);
    } else {
      const monogram = document.createElement('span');
      monogram.classList.add('app-cards-monogram');
      monogram.textContent = name.charAt(0).toUpperCase() || '?';
      iconWrapper.append(monogram);
    }

    const title = document.createElement('p');
    title.classList.add('app-cards-name');
    title.textContent = name;

    if (href) {
      const cardLink = document.createElement('a');
      cardLink.classList.add('app-cards-link');
      cardLink.href = href;
      cardLink.setAttribute('aria-label', name ? `Open ${name}` : 'Open card');
      card.append(cardLink);
    }

    content.append(iconWrapper, title);
    card.append(menuBtn, content);
    grid.append(card);
  });

  block.replaceChildren(grid, overlay, drawer);
}
