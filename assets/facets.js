// Collection and search filtering without page reloads.
// Every filter, sort, pill and pagination change fetches the section with the new query string
// and swaps each [data-facets-part], so Liquid renders all counts and states.
class FacetFilters extends HTMLElement {
  connectedCallback() {
    this.addEventListener('change', (event) => {
      const form = this.querySelector('[data-facet-form]');
      if (form && event.target.form === form) this.update(this.urlFromForm(form));
    });

    // "Show results" only closes the drawer; results are already live.
    this.addEventListener('submit', (event) => {
      if (!event.target.matches('[data-facet-form]')) return;
      event.preventDefault();
      event.target.closest('dialog')?.close();
    });

    this.addEventListener('click', (event) => {
      const link = event.target.closest('[data-facet-link]');
      if (!link) return;
      event.preventDefault();
      this.update(link.href, { scroll: link.closest('.pagination') !== null });
    });

    window.addEventListener('popstate', () => this.update(window.location.href, { push: false }));
  }

  urlFromForm(form) {
    const params = new URLSearchParams();
    for (const [key, value] of new FormData(form)) if (value !== '') params.append(key, value);
    return `${window.location.pathname}?${params}`;
  }

  async update(url, { push = true, scroll = false } = {}) {
    const target = new URL(url, window.location.origin);
    target.searchParams.set('section_id', this.dataset.section);

    this.request?.abort();
    this.request = new AbortController();
    this.setAttribute('aria-busy', 'true');

    try {
      const response = await fetch(target, { signal: this.request.signal });
      const fresh = new DOMParser().parseFromString(await response.text(), 'text/html');
      const focusId = document.activeElement?.id;

      this.querySelectorAll('[data-facets-part]').forEach((part) => {
        const next = fresh.querySelector(`[data-facets-part="${part.dataset.facetsPart}"]`);
        if (next) part.replaceWith(next);
      });
      if (focusId) document.getElementById(focusId)?.focus({ preventScroll: true });

      target.searchParams.delete('section_id');
      if (push) history.pushState(null, '', target);
      if (scroll) this.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      if (error.name !== 'AbortError') window.location.assign(url);
    } finally {
      this.removeAttribute('aria-busy');
    }
  }
}

customElements.define('facet-filters', FacetFilters);
