import { html, render } from '../../vendor/htm-preact.js';
import { useEffect, useState } from '../../vendor/preact-hooks.js';

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
  const isFourCol = labels[0] === 'icon'
    && labels[1] === 'title'
    && labels[2] === 'description'
    && labels[3] === 'link';

  const isFiveCol = cols.length >= 5 && labels[0] === 'icon' && labels[1] === 'title'
    && labels[2] === 'description' && labels[3] === 'link' && labels[4] === 'image';

  return isFourCol || isFiveCol;
}

/**
 * Serializes the authored icon content into a renderable payload.
 *
 * @param {Element | undefined} iconCol The icon column
 * @returns {{ html: string, hasVisual: boolean }} The serialized icon content
 */
function getIconPayload(iconCol, name) {
  const altText = name ? `${name} icon` : '';
  const picture = iconCol?.querySelector('picture');
  if (picture) {
    const img = picture.querySelector('img');
    img?.removeAttribute('width');
    img?.removeAttribute('height');
    if (img && !img.getAttribute('alt')) img.setAttribute('alt', altText);
    return { html: picture.outerHTML, hasVisual: true };
  }

  const img = iconCol?.querySelector('img');
  if (img) {
    img.removeAttribute('width');
    img.removeAttribute('height');
    if (!img.getAttribute('alt')) img.setAttribute('alt', altText);
    return { html: img.outerHTML, hasVisual: true };
  }

  const svg = iconCol?.querySelector('svg');
  if (svg) return { html: svg.outerHTML, hasVisual: true };

  return { html: '', hasVisual: false };
}

/**
 * Serializes the authored image content into a renderable payload.
 *
 * @param {Element | undefined} imageCol The image column
 * @returns {{ html: string, hasImage: boolean }} The serialized image content
 */
function getImagePayload(imageCol) {
  const picture = imageCol?.querySelector('picture');
  if (picture) {
    const img = picture.querySelector('img');
    img?.removeAttribute('width');
    img?.removeAttribute('height');
    return { html: picture.outerHTML, hasImage: true };
  }

  const img = imageCol?.querySelector('img');
  if (img) {
    img.removeAttribute('width');
    img.removeAttribute('height');
    return { html: img.outerHTML, hasImage: true };
  }

  return { html: '', hasImage: false };
}

/**
 * Reads authored cards from the block markup.
 *
 * @param {Element} block The block element
 * @returns {Array} Parsed card items
 */
function getCardItems(block) {
  return [...block.children]
    .map((row) => [...row.children])
    .filter((cols) => cols.length >= 4 && !isHeaderRow(cols))
    .map((cols) => {
      const [iconCol, titleCol, descriptionCol, linkCol, imageCol] = cols;
      const name = titleCol?.textContent?.trim() ?? '';
      const description = descriptionCol?.textContent?.trim() ?? '';
      const href = getCardHref(linkCol);
      const icon = getIconPayload(iconCol);
      const image = getImagePayload(imageCol);

      return {
        name,
        description,
        href,
        iconHtml: icon.html,
        hasIcon: icon.hasVisual,
        imageHtml: image.html,
        hasImage: image.hasImage,
      };
    });
}

/**
 * Renders a card icon or monogram.
 *
 * @param {Object} props Component props
 * @param {string} props.name The card title
 * @param {string} props.iconHtml Serialized icon markup
 * @param {boolean} props.hasIcon Whether the card has icon markup
 * @param {Object | null} props.palette Background/foreground for the monogram
 * @returns {import('../../vendor/preact.js').ComponentChild} Rendered icon
 */
function CardIcon({
  name, iconHtml, hasIcon, palette,
}) {
  if (hasIcon) {
    return html`<div
      class="app-cards-icon has-image"
      dangerouslySetInnerHTML=${{ __html: iconHtml }}
    />`;
  }

  const style = palette ? `--icon-bg:${palette.bg};--icon-fg:${palette.fg};` : '';
  return html`
    <div class="app-cards-icon" style=${style}>
      <span class="app-cards-monogram">${name.charAt(0).toUpperCase() || '?'}</span>
    </div>
  `;
}

/**
 * Drawer component.
 *
 * @param {Object} props Component props
 * @param {Object | null} props.activeItem The active card item
 * @param {Function} props.onClose Drawer close handler
 * @returns {import('../../vendor/preact.js').ComponentChild} Drawer UI
 */
function Drawer({ activeItem, onClose }) {
  const isOpen = Boolean(activeItem);

  return html`
    <div class="app-cards-drawer-layer">
      <div
        class="app-cards-drawer-overlay"
        hidden=${!isOpen}
        onClick=${onClose}
      ></div>
      <aside
        class="app-cards-drawer"
        aria-hidden=${isOpen ? 'false' : 'true'}
        aria-label="Card details"
      >
        <div class="app-cards-drawer-header">
          <h2 class="app-cards-drawer-title">${activeItem?.name ?? ''}</h2>
          <button
            class="app-cards-drawer-close"
            type="button"
            aria-label="Close details"
            onClick=${onClose}
          >
            Close
          </button>
        </div>
        ${activeItem?.hasImage ? html`
          <div
            class="app-cards-drawer-image"
            dangerouslySetInnerHTML=${{ __html: activeItem.imageHtml }}
          />
        ` : null}
        <div class="app-cards-drawer-body">
          <p class="app-cards-drawer-description">${activeItem?.description ?? ''}</p>
          ${activeItem?.href ? html`
            <a
              class="app-cards-drawer-link button accent"
              href=${activeItem.href}
            >
              Launch App
            </a>
          ` : null}
        </div>
      </aside>
    </div>
  `;
}

/**
 * Card tile component.
 *
 * @param {Object} props Component props
 * @param {Object} props.item Card item
 * @param {Function} props.onOpenDetails Drawer open handler
 * @returns {import('../../vendor/preact.js').ComponentChild} Card UI
 */
function CardTile({ item, onOpenDetails }) {
  const linkLabel = item.name ? `Open ${item.name}` : 'Open card';
  return html`
    <li class="app-cards-card">
      ${item.href ? html`
        <a
          class="app-cards-link"
          href=${item.href}
          aria-label=${linkLabel}
        ><span class="app-cards-visually-hidden">${linkLabel}</span></a>
      ` : null}
      <button
        class="app-cards-menu"
        type="button"
        aria-label=${item.name ? `Open details for ${item.name}` : 'Open details'}
        onClick=${onOpenDetails}
      >
        <span aria-hidden="true">⋯</span>
      </button>
      <div class="app-cards-body">
        <${CardIcon}
          name=${item.name}
          iconHtml=${item.iconHtml}
          hasIcon=${item.hasIcon}
          palette=${item.palette}
        />
        <h3 class="app-cards-name">${item.name}</h3>
      </div>
    </li>
  `;
}

/**
 * Cards app component.
 *
 * @param {Object} props Component props
 * @param {Array} props.items Parsed card items
 * @returns {import('../../vendor/preact.js').ComponentChild} Cards UI
 */
function CardsApp({ items }) {
  const [activeItem, setActiveItem] = useState(null);
  const cardTiles = items.map((item) => {
    const openDetails = (event) => {
      event.preventDefault();
      event.stopPropagation();
      setActiveItem(item);
    };

    return html`<${CardTile} key=${item.name} item=${item} onOpenDetails=${openDetails} />`;
  });

  useEffect(() => {
    if (!activeItem) return () => {};

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setActiveItem(null);
    };

    document.addEventListener('keydown', onKeyDown);
    document.body.classList.add('app-cards-drawer-open');

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.classList.remove('app-cards-drawer-open');
    };
  }, [activeItem]);

  return html`
    <div class="app-cards-shell">
      <ul class="app-cards-grid" role="list">
        ${cardTiles}
      </ul>
      <${Drawer} activeItem=${activeItem} onClose=${() => setActiveItem(null)} />
    </div>
  `;
}

/**
 * Loads and decorates the cards block.
 *
 * Authored structure:
 * | Cards |
 * | Icon | Title | Description | Link | Image |
 * | [img] | Photoshop | Edit and composite images | https://example.com/photoshop | [screenshot] |
 *
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const items = getCardItems(block);
  block.replaceChildren();
  render(html`<${CardsApp} items=${items} />`, block);
}
