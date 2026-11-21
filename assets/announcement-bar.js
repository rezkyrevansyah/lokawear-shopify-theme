class AnnouncementBar extends HTMLElement {
  connectedCallback() {
    this.items = [...this.querySelectorAll('.announcement__item')];
    this.index = 0;
    this.storageKey = `announcement-dismissed-${this.dataset.sectionId}`;

    this.querySelector('[data-dismiss]')?.addEventListener('click', () => this.dismiss());

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (this.items.length > 1 && !reduceMotion) {
      this.addEventListener('mouseenter', () => this.stop());
      this.addEventListener('mouseleave', () => this.start());
      this.addEventListener('focusin', () => this.stop());
      this.addEventListener('focusout', () => this.start());
      this.start();
    }
  }

  disconnectedCallback() {
    this.stop();
  }

  start() {
    this.stop();
    this.timer = setInterval(() => this.show(this.index + 1), Number(this.dataset.interval) || 5000);
  }

  stop() {
    clearInterval(this.timer);
  }

  show(next) {
    this.items[this.index].hidden = true;
    this.index = next % this.items.length;
    this.items[this.index].hidden = false;
  }

  dismiss() {
    this.stop();
    this.hidden = true;
    try {
      sessionStorage.setItem(this.storageKey, '1');
    } catch (e) {}
  }
}

customElements.define('announcement-bar', AnnouncementBar);
