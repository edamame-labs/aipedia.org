import { searchPages, type SearchEntry } from '../lib/search';

const MAX_RESULTS = 8;

let indexPromise: Promise<SearchEntry[]> | null = null;

function loadIndex(): Promise<SearchEntry[]> {
  indexPromise ??= fetch('/search-index.json')
    .then(response => (response.ok ? response.json() : []))
    .catch(() => [] as SearchEntry[]);
  return indexPromise;
}

function setupPanel(root: HTMLElement) {
  const input = root.querySelector<HTMLInputElement>('[data-search-input]');
  const list = root.querySelector<HTMLElement>('[data-search-results]');
  const empty = root.querySelector<HTMLElement>('[data-search-empty]');
  const clear = root.querySelector<HTMLButtonElement>('[data-search-clear]');
  if (!input || !list || !empty || !clear) return;

  let index: SearchEntry[] = [];
  let active = 0;

  const options = () => Array.from(list.querySelectorAll<HTMLAnchorElement>('a[role="option"]'));

  const highlight = (next: number) => {
    const items = options();
    if (!items.length) return;
    active = (next + items.length) % items.length;
    items.forEach((item, i) => {
      const selected = i === active;
      item.setAttribute('aria-selected', String(selected));
      if (selected) {
        input.setAttribute('aria-activedescendant', item.id);
        item.scrollIntoView({ block: 'nearest' });
      }
    });
  };

  const collapse = () => {
    list.replaceChildren();
    list.hidden = true;
    empty.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
  };

  const render = () => {
    const query = input.value;
    clear.hidden = query.length === 0;
    if (!query.trim()) return collapse();

    const results = searchPages(index, query).slice(0, MAX_RESULTS);
    list.replaceChildren(
      ...results.map((page, i) => {
        const link = document.createElement('a');
        link.id = `${list.id}-option-${i}`;
        link.href = `/${page.slug}`;
        link.setAttribute('role', 'option');
        link.setAttribute('aria-selected', String(i === 0));
        link.className =
          'block px-4 py-3 border-b border-border last:border-b-0 transition-colors hover:bg-bg-secondary aria-selected:bg-bg-secondary';

        const title = document.createElement('span');
        title.className = 'block font-medium';
        title.textContent = page.title;

        const description = document.createElement('span');
        description.className = 'block text-sm text-text-secondary mt-0.5';
        description.textContent = page.description;

        link.append(title, description);
        return link;
      })
    );

    active = 0;
    list.hidden = results.length === 0;
    empty.hidden = results.length > 0;
    input.setAttribute('aria-expanded', String(results.length > 0));
    if (results.length) highlight(0);
    else input.removeAttribute('aria-activedescendant');
  };

  const ensureIndex = async () => {
    if (index.length) return;
    index = await loadIndex();
    if (input.value.trim()) render();
  };

  input.addEventListener('focus', ensureIndex, { once: true });
  input.addEventListener('input', () => {
    void ensureIndex();
    render();
  });

  input.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      highlight(active + 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      highlight(active - 1);
    } else if (event.key === 'Enter') {
      const target = options()[active];
      if (target) {
        event.preventDefault();
        window.location.href = target.href;
      }
    } else if (event.key === 'Escape' && input.value) {
      // first Escape clears the query, a second one closes the dialog
      event.stopPropagation();
      input.value = '';
      render();
    }
  });

  clear.addEventListener('click', () => {
    input.value = '';
    render();
    input.focus();
  });

  if (root.dataset.variant === 'inline') {
    document.addEventListener('click', event => {
      if (!root.contains(event.target as Node)) {
        list.hidden = true;
        input.setAttribute('aria-expanded', 'false');
      }
    });
  }

  root.addEventListener('search:reset', () => {
    input.value = '';
    render();
  });
}

function setupDialog() {
  const dialog = document.querySelector<HTMLDialogElement>('#search-dialog');
  if (!dialog) return;

  const open = () => {
    if (dialog.open) return;
    void loadIndex();
    dialog.showModal();
    dialog.querySelector<HTMLInputElement>('[data-search-input]')?.focus();
  };

  const close = () => dialog.open && dialog.close();

  document.querySelectorAll('[data-search-open]').forEach(trigger => {
    trigger.addEventListener('click', open);
  });

  dialog.addEventListener('close', () => {
    dialog.querySelector<HTMLElement>('[data-search-root]')?.dispatchEvent(new CustomEvent('search:reset'));
  });

  // clicking the backdrop closes; clicking the panel itself must not
  dialog.addEventListener('click', event => {
    if (event.target === dialog) close();
  });

  document.addEventListener('keydown', event => {
    if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'k') return;
    event.preventDefault();
    if (dialog.open) close();
    else open();
  });
}

document.querySelectorAll<HTMLElement>('[data-search-root]').forEach(setupPanel);
setupDialog();
