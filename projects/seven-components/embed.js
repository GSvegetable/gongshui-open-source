/* Compatibility shim: 七个组件 → 八个组件.
 * The old embed URL keeps working; it just points at the renamed project.
 */
(() => {
  'use strict';
  const script = document.currentScript;
  if (!script) return;
  const base = new URL('./', script.src);
  const next = new URL('../eight-components/embed.js', base);
  ['data-target', 'data-width', 'data-height', 'data-label', 'data-loading', 'data-version', 'data-theme', 'data-lang']
    .forEach(key => {
      const value = script.getAttribute(key);
      if (value !== null) next.searchParams.set(key, value);
    });
  next.searchParams.set('version', script.getAttribute('data-version') || '2.0.0');
  const replacement = document.createElement('script');
  replacement.src = next.href;
  replacement.async = false;
  script.parentNode.insertBefore(replacement, script.nextSibling);
})();
