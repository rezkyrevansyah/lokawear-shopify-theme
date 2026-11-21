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
