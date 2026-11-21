// Product page: variant switching, AJAX add to cart, gallery thumbnails/zoom and the mobile sticky bar.
// Variant changes re-fetch this section with ?variant=, then swap every [data-dynamic] element,
// so prices and availability always come from Liquid.
class ProductInfo extends HTMLElement {
  connectedCallback() {
    this.track = this.querySelector('[data-gallery-track]');

    this.addEventListener('change', (event) => {
      if (event.target.matches('.picker__input')) this.selectVariant(event.target);
    });

    // The sticky bar submits the main form through its form= attribute, so one handler covers both.
    this.addEventListener('submit', (event) => {
      if (!event.target.matches('[data-product-form]')) return;
      event.preventDefault();
      this.addToCart(event.target);
    });

    this.addEventListener('click', (event) => {
      const thumb = event.target.closest('[data-thumb]');
      if (thumb) this.showSlide(Number(thumb.dataset.thumb));
      const zoom = event.target.closest('[data-zoom]');
      if (zoom) this.openZoom(Number(zoom.dataset.zoom));
    });

    this.watchGallery();
    this.watchStickyBar();
  }

  async selectVariant(input) {
    const variantId = input.dataset.variantId;
    if (!variantId) return;

    this.request?.abort();
    this.request = new AbortController();
    const url = `${this.dataset.url}?variant=${variantId}`;

    try {
      const response = await fetch(`${url}&section_id=${this.dataset.section}`, { signal: this.request.signal });
      const fresh = new DOMParser().parseFromString(await response.text(), 'text/html');
      this.querySelectorAll('[data-dynamic]').forEach((element) => {
        const next = fresh.querySelector(`[data-dynamic="${element.dataset.dynamic}"]`);
        if (next) element.replaceWith(next);
      });
      document.getElementById(input.id)?.focus();
      history.replaceState(history.state, '', url);
      this.updateStickyBar();

      const mediaId = this.querySelector('[data-dynamic="buy"]')?.dataset.mediaId;
      const slide = mediaId && this.track?.querySelector(`[data-media-id="${mediaId}"]`);
      if (slide) this.showSlide([...this.track.children].indexOf(slide));
    } catch (error) {
      if (error.name !== 'AbortError') window.location.assign(url);
    }
  }

  async addToCart(form) {
    // form.id would return the <input name="id">, so read the attribute.
    const formId = form.getAttribute('id');
    const buttons = document.querySelectorAll(`#${formId} [type="submit"], [form="${formId}"]`);
    const error = form.querySelector('[data-form-error]');
    const root = window.Shopify?.routes?.root || '/';
    const cartSection = document.querySelector('#CartDrawer')?.closest('.shopify-section')?.id.replace('shopify-section-', '');

    buttons.forEach((button) => button.setAttribute('aria-busy', 'true'));
    if (error) error.textContent = '';

    try {
      const body = new FormData(form);
      if (cartSection) {
        body.append('sections', cartSection);
        body.append('sections_url', window.location.pathname);
      }
      const response = await fetch(`${root}cart/add.js`, { method: 'POST', headers: { Accept: 'application/json' }, body });
      const added = await response.json();
      if (!response.ok) throw new Error(added.description || added.message);

      // /cart/add.js returns only the line item; the drawer also needs the new item count.
      const cart = await (await fetch(`${root}cart.js`)).json();
      document.dispatchEvent(new CustomEvent('cart:updated', { detail: { ...cart, sections: added.sections } }));
    } catch (err) {
      if (error) error.textContent = err.message;
    } finally {
      buttons.forEach((button) => button.removeAttribute('aria-busy'));
    }
  }

  watchGallery() {
    if (!this.track || !('IntersectionObserver' in window)) return;
    const slides = [...this.track.children];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const index = slides.indexOf(entry.target);
          this.querySelectorAll('[data-thumb]').forEach((thumb) => {
            thumb.setAttribute('aria-current', String(Number(thumb.dataset.thumb) === index));
          });
        });
      },
      { root: this.track, threshold: 0.6 }
    );
    slides.forEach((slide) => observer.observe(slide));
  }

  showSlide(index) {
    const slide = this.track?.children[index];
    if (slide) this.track.scrollTo({ left: slide.offsetLeft, behavior: 'smooth' });
  }

  openZoom(index) {
    const dialog = this.querySelector('[data-zoom-dialog]');
    if (!dialog) return;
    dialog.showModal();
    dialog.querySelectorAll('[data-zoom-item]')[index]?.scrollIntoView();
  }

  watchStickyBar() {
    const form = this.querySelector('[data-product-form]');
    if (!form || !this.querySelector('[data-sticky-atc]') || !('IntersectionObserver' in window)) return;
    // The huge bottom margin means "intersecting" = the form is anywhere below the viewport top,
    // so the bar shows only once the form has scrolled above it, even after a jump scroll.
    new IntersectionObserver(
      ([entry]) => {
        this.stickyVisible = !entry.isIntersecting;
        this.updateStickyBar();
      },
      { rootMargin: '0px 0px 100000px 0px' }
    ).observe(form);
  }

  updateStickyBar() {
    const bar = this.querySelector('[data-sticky-atc]');
    if (!bar) return;
    bar.classList.toggle('is-visible', Boolean(this.stickyVisible));
    bar.inert = !this.stickyVisible;
  }
}

customElements.define('product-info', ProductInfo);

// Loads related products after the main content, when the section nears the viewport.
class ProductRecommendations extends HTMLElement {
  connectedCallback() {
    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const response = await fetch(this.dataset.url);
        const fresh = new DOMParser().parseFromString(await response.text(), 'text/html').querySelector('product-recommendations');
        if (fresh?.querySelector('li')) this.innerHTML = fresh.innerHTML;
      },
      { rootMargin: '0px 0px 400px 0px' }
    );
    observer.observe(this);
  }
}

customElements.define('product-recommendations', ProductRecommendations);
