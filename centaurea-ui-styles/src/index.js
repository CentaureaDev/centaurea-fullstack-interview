/**
 * Centaurea UI Styles
 * 
 * BEM-based shared styles for Centaurea UI applications
 */

/**
 * Dynamically inject shared styles into the DOM
 * This avoids the need to import CSS files directly in some environments
 */
export function injectStyles() {
  if (typeof document === 'undefined') {
    return; // Skip in SSR/Node.js environments
  }

  // Check if styles are already injected
  if (document.getElementById('centaurea-ui-styles')) {
    return;
  }

  // Create link element for the stylesheet
  const link = document.createElement('link');
  link.id = 'centaurea-ui-styles';
  link.rel = 'stylesheet';
  link.href = new URL('./styles/index.css', import.meta.url).href;
  
  document.head.appendChild(link);
}

// Auto-inject styles when module is imported (optional)
// Comment this out if you prefer manual injection
injectStyles();
