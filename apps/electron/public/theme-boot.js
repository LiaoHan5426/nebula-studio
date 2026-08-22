(function bootTheme() {
  try {
    const raw = localStorage.getItem('nebula.theme.v1');
    if (!raw) {
      return;
    }
    const parsed = JSON.parse(raw);
    const value = parsed && parsed.value ? parsed.value : parsed;
    const scheme = value && value.colorScheme;
    const dark =
      scheme === 'dark' ||
      (scheme === 'system' &&
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', Boolean(dark));
    if (value && value.density) {
      document.documentElement.dataset.nebulaDensity = value.density;
    }
  } catch {
    /* ignore corrupt cache */
  }
})();
