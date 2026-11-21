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
