// Opens any <dialog> by id from a [data-dialog-open] trigger; closes via [data-dialog-close] or backdrop click.
// Triggers are real links/buttons, so pages still work if this script fails to load.
document.addEventListener('click', (event) => {
  const opener = event.target.closest('[data-dialog-open]');
  if (opener) {
    const dialog = document.getElementById(opener.dataset.dialogOpen);
    if (dialog && !dialog.open) {
      event.preventDefault();
      dialog.showModal();
    }
    return;
  }

  if (event.target.closest('[data-dialog-close]')) {
    event.target.closest('dialog')?.close();
  } else if (event.target instanceof HTMLDialogElement) {
    // The click landed on the ::backdrop, because .drawer__inner fills the dialog itself.
    event.target.close();
  }
});

// Fade-up reveal for [data-reveal] elements as they enter the viewport.
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -10% 0px' }
  );
  const observeAll = (root = document) => root.querySelectorAll('[data-reveal]:not(.is-revealed)').forEach((el) => observer.observe(el));
  observeAll();
  // Sections re-rendered in the theme editor need observing again.
  document.addEventListener('shopify:section:load', (event) => observeAll(event.target));
} else {
  document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-revealed'));
}

// Search drawer: as-you-type results from the Predictive Search API, rendered by sections/predictive-search.liquid.
// The form still submits to /search, so it works without JS.
class PredictiveSearch extends HTMLElement {
  connectedCallback() {
    this.input = this.querySelector('input[name="q"]');
    this.results = this.querySelector('[data-predictive-results]');
    this.initial = this.results.innerHTML;
    this.input.addEventListener('input', () => {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.search(this.input.value.trim()), 250);
    });
  }

  async search(terms) {
    this.request?.abort();
    if (!terms) {
      this.results.innerHTML = this.initial;
      return;
    }
    this.request = new AbortController();
    const params = new URLSearchParams({
      q: terms,
      section_id: 'predictive-search',
      'resources[type]': 'product,collection,query',
      'resources[limit]': '4',
      'resources[options][fields]': 'title,product_type,variants.title,tag',
    });
    try {
      const response = await fetch(`${this.dataset.url}?${params}`, { signal: this.request.signal });
      const fresh = new DOMParser().parseFromString(await response.text(), 'text/html');
      this.results.innerHTML = fresh.querySelector('[data-predictive-results]')?.innerHTML ?? '';
    } catch (error) {
      if (error.name !== 'AbortError') this.results.innerHTML = this.initial;
    }
  }
}

customElements.define('predictive-search', PredictiveSearch);

// Prev/next buttons for native scroll-snap sliders: [data-slider] > [data-slider-track] + [data-slide="-1|1"].
// Delegated, so it keeps working after the theme editor re-renders a section.
document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-slide]');
  const track = button?.closest('[data-slider]')?.querySelector('[data-slider-track]');
  if (!track) return;
  const card = track.firstElementChild;
  const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
  const step = card ? card.getBoundingClientRect().width + gap : track.clientWidth;
  track.scrollBy({ left: step * Number(button.dataset.slide), behavior: 'smooth' });
});
