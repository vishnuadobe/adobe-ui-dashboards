import { h, render } from '../../vendor/preact.js';
import { useEffect, useRef, useState } from '../../vendor/preact-hooks.js';
import htm from '../../vendor/htm.js';

const html = htm.bind(h);
const SORT_OPTIONS = ['Name ascending', 'Name descending'];

function SearchBar({ initialPlaceholder, iconSrc, sortOptions }) {
  const initialQuery = new URLSearchParams(window.location.search).get('search') || '';
  const [query, setQuery] = useState(initialQuery);
  const [sortOpen, setSortOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState(sortOptions[0] || '');
  const inputRef = useRef(null);
  const sortRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new CustomEvent('search-posts', { detail: { query } }));
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!sortOpen) return undefined;

    const onOutside = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setSortOpen(false);
      }
    };

    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [sortOpen]);

  const handleInput = (e) => setQuery(e.target.value);

  const handleClear = () => {
    setQuery('');
    if (inputRef.current) inputRef.current.focus();
  };

  const handleSubmit = (e) => e.preventDefault();

  const handleSortSelect = (option) => {
    setSelectedSort(option);
    setSortOpen(false);
    window.dispatchEvent(new CustomEvent('sort-posts', { detail: { sort: option } }));
  };

  const handleSortKeyDown = (e) => {
    if (e.key === 'Escape') setSortOpen(false);
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSortOpen((open) => !open);
    }
  };

  const searchIconMarkup = iconSrc
    ? html`<img src=${iconSrc} class="search-icon" aria-hidden="true" alt="" />`
    : html`
      <svg
        class="search-icon"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 18 18"
        focusable="false"
        aria-hidden="true"
      >
        <path
          d="M12.5 11h-.79l-.28-.27A6.471 6.471 0 0 0 13 6.5
            6.5 6.5 0 1 0 6.5 13c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5
            4.99L17.49 16l-4.99-5zm-6 0C4.01 11 2 8.99 2 6.5S4.01 2
            6.5 2 11 4.01 11 6.5 8.99 11 6.5 11z"
        />
      </svg>
    `;

  return html`
    <div class="search-bar-row">
      <form
        class="search-form"
        action="#"
        novalidate
        onSubmit=${handleSubmit}
        role="search"
      >
        <div class="search-form-inner">
          ${searchIconMarkup}

          <input
            ref=${inputRef}
            type="search"
            class="search-input"
            placeholder=${initialPlaceholder}
            aria-label="Search"
            autocomplete="off"
            spellcheck="false"
            value=${query}
            onInput=${handleInput}
          />

          <button
            type="button"
            class="search-clear ${query.length > 0 ? 'is-visible' : ''}"
            aria-label="Clear search"
            onClick=${handleClear}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 18 18"
              focusable="false"
              aria-hidden="true"
            >
              <path
                d="M13 6.06L11.94 5 9 7.94 6.06 5 5 6.06 7.94 9 5
                  11.94 6.06 13 9 10.06 11.94 13 13 11.94 10.06 9z"
              />
            </svg>
          </button>
        </div>
      </form>

      ${sortOptions.length > 0 && html`
        <div class="sort-wrapper" ref=${sortRef}>
          <button
            type="button"
            class="sort-trigger ${sortOpen ? 'is-open' : ''}"
            aria-haspopup="listbox"
            aria-expanded=${sortOpen}
            aria-label="Sort"
            onClick=${() => setSortOpen((open) => !open)}
            onKeyDown=${handleSortKeyDown}
          >
            <span class="sort-trigger-label">Sort</span>
            <svg
              class="sort-chevron"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 10 8"
              aria-hidden="true"
              focusable="false"
            >
              <polyline
                points="1 2 5 6 9 2"
                fill="none"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>

          ${sortOpen && html`
            <ul class="sort-menu" role="listbox" aria-label="Sort options">
              ${sortOptions.map((option) => html`
                <li
                  key=${option}
                  class="sort-menu-item ${option === selectedSort ? 'is-selected' : ''}"
                  role="option"
                  aria-selected=${option === selectedSort}
                  onClick=${() => handleSortSelect(option)}
                >
                  <span class="sort-menu-item-label">${option}</span>
                </li>
              `)}
            </ul>
          `}
        </div>
      `}
    </div>
  `;
}

export default function decorate(block) {
  const rows = [...block.children];
  const placeholder = rows[0]?.children[0]?.textContent?.trim() || 'Search...';
  const icon = rows[0]?.querySelector('img');
  const iconSrc = icon ? icon.src : null;
  const sortOptions = SORT_OPTIONS;

  block.innerHTML = '';

  render(
    html`<${SearchBar}
      initialPlaceholder=${placeholder}
      iconSrc=${iconSrc}
      sortOptions=${sortOptions}
    />`,
    block,
  );
}
