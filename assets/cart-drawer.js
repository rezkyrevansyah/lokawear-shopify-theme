// Cart drawer: quantity changes, removal and order note via the Cart AJAX API.
// After each change the drawer markup is re-rendered with the Section Rendering API,
// so Liquid stays the single source of truth for cart markup.
class CartDrawer extends HTMLElement {
  connectedCallback() {
    this.dialog = this.querySelector('dialog');
    this.sectionId = this.closest('.shopify-section')?.id.replace('shopify-section-', '');

    this.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-line][data-quantity]');
      if (button) this.change(button.dataset.line, button.dataset.quantity, button.id);
    });

    this.addEventListener('change', (event) => {
      if (event.target.matches('.qty__input')) {
        this.change(event.target.dataset.line, event.target.value, event.target.id);
      } else if (event.target.matches('[data-cart-note]')) {
        this.post(`${this.root}cart/update.js`, { note: event.target.value });
      }
    });

    // Product forms dispatch this after a successful /cart/add.js with `sections` requested.
    document.addEventListener('cart:updated', (event) => {
      this.render(event.detail);
      if (event.detail?.open !== false && !this.dialog.open) this.dialog.showModal();
    });
  }

  get root() {
    return window.Shopify?.routes?.root || '/';
  }

  async change(line, quantity, focusId) {
    const contents = this.querySelector('[data-cart-contents]');
    contents.setAttribute('aria-busy', 'true');

    try {
      const response = await this.post(`${this.root}cart/change.js`, {
        line: Number(line),
        quantity: Math.max(0, Number(quantity) || 0),
        sections: [this.sectionId],
        sections_url: window.location.pathname,
      });
      this.render(response);
      if (focusId) document.getElementById(focusId)?.focus();
    } catch (error) {
      this.showError(error.message);
    } finally {
      this.querySelector('[data-cart-contents]')?.removeAttribute('aria-busy');
    }
  }

  async post(url, body) {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.description || data.message || 'Cart error');
    return data;
  }

  render(cart) {
    const html = cart?.sections?.[this.sectionId];
    if (html) {
      const fresh = new DOMParser().parseFromString(html, 'text/html').querySelector('[data-cart-contents]');
      if (fresh) this.querySelector('[data-cart-contents]').replaceWith(fresh);
    }

    if (typeof cart?.item_count === 'number') {
      document.querySelectorAll('[data-cart-count]').forEach((badge) => {
        badge.textContent = cart.item_count;
        badge.hidden = cart.item_count === 0;
      });
    }
  }

  showError(message) {
    const target = this.querySelector('[data-cart-error]');
    if (target) target.textContent = message;
  }
}

customElements.define('cart-drawer', CartDrawer);
