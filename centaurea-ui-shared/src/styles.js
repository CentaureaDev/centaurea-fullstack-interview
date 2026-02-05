/**
 * Dynamically inject shared styles into the DOM
 * This avoids the need to import CSS files directly
 */

function injectStyles() {
  if (typeof document === 'undefined') {
    return; // Skip in SSR/Node.js environments
  }

  // Check if styles are already injected
  if (document.getElementById('centaurea-ui-shared-styles')) {
    return;
  }

  // Create style element
  const style = document.createElement('style');
  style.id = 'centaurea-ui-shared-styles';
  
  // Inline all the CSS
  style.textContent = `
/* Variables and theme */
:root {
  /* Base palette (4 colors) */
  --color-bg: #f7f7f9;
  --color-text: #1f2937;
  --color-text-light: #6b7280;
  --color-action: #2563eb;

  /* Derived colors (from base palette) */
  --color-primary: var(--color-action);
  --color-primary-hover: #1d4ed8;
  --color-primary-dark: #1e40af;

  --color-success: var(--color-action);
  --color-success-hover: #1d4ed8;
  --color-success-light: rgba(37, 99, 235, 0.12);

  --color-danger: var(--color-action);
  --color-danger-hover: #1d4ed8;
  --color-danger-light: rgba(37, 99, 235, 0.12);

  --color-secondary: var(--color-text-light);
  --color-secondary-hover: var(--color-text);

  --color-text-lighter: rgba(31, 41, 55, 0.55);
  --color-bg-light: #ffffff;
  --color-bg-lighter: #ffffff;
  --color-border: rgba(31, 41, 55, 0.12);
  --color-border-light: rgba(31, 41, 55, 0.08);

  --color-info: var(--color-action);
  --color-info-light: rgba(37, 99, 235, 0.12);
  --color-info-border: rgba(37, 99, 235, 0.25);

  --color-warning: var(--color-action);
  --color-warning-bg: rgba(37, 99, 235, 0.12);
  --color-warning-border: rgba(37, 99, 235, 0.25);

  --color-gradient: linear-gradient(135deg, rgba(37, 99, 235, 0.9) 0%, rgba(29, 78, 216, 0.9) 100%);
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 20px;
  --spacing-2xl: 30px;
  --spacing-3xl: 40px;
  
  /* Typography */
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  --font-size-sm: 12px;
  --font-size-base: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 24px;
  --font-size-2xl: 28px;
  --font-size-3xl: 32px;
  
  --font-weight-normal: 400;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  
  /* Border Radius */
  --border-radius-sm: 4px;
  --border-radius-md: 6px;
  --border-radius-lg: 8px;
  
  /* Shadows */
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 4px 6px rgba(0, 0, 0, 0.1);
  
  /* Transitions */
  --transition-fast: 0.2s ease;
  --transition-base: 0.3s ease;
  --transition-slow: 0.5s ease;
}

/* Global Styles */
* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  font-family: var(--font-family);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-normal);
  line-height: 1.5;
  color: var(--color-text);
  background-color: var(--color-bg-lighter);
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  min-width: 320px;
  min-height: 100vh;
}

h1, h2, h3, h4, h5, h6 {
  margin: 0;
  color: var(--color-text);
}

h1 {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-2xl);
}

h2 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-lg);
}

h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-md);
}

p {
  margin: 0;
}

a {
  color: var(--color-primary);
  text-decoration: none;
  transition: color var(--transition-base);
}

a:hover {
  color: var(--color-primary-hover);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Container Block */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-lg);
  font-family: var(--font-family);
}

/* Application Container */
.app-container {
  min-height: 100vh;
  text-align: center;
}

.app-container__content {
  animation: fadeIn 0.3s ease-in;
}

/* Header Section */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-2xl);
}

.header__title {
  text-align: center;
  color: var(--color-text);
  margin: 0;
}

/* User Badge Block */
.user-badge {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--color-bg-light);
  border-radius: var(--border-radius-lg);
}

.user-badge__info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.user-badge__name {
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  font-size: var(--font-size-base);
}

.user-badge__email {
  font-size: var(--font-size-sm);
  color: var(--color-text-light);
}

.user-badge__button {
  padding: var(--spacing-xs) var(--spacing-md);
  border: none;
  background-color: var(--color-secondary);
  color: white;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  font-size: var(--font-size-sm);
  transition: background-color var(--transition-base);
}

.user-badge__button:hover {
  background-color: var(--color-secondary-hover);
}

/* Navigation Tabs */
.tabs {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  border-bottom: 2px solid var(--color-border);
}

.tabs__item {
  padding: var(--spacing-md) var(--spacing-lg);
  border: none;
  background-color: transparent;
  cursor: pointer;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-light);
  border-bottom: 3px solid transparent;
  transition: all var(--transition-base);
  text-decoration: none;
  display: inline-block;
}

.tabs__item:hover {
  color: var(--color-text);
}

.tabs__item--active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

/* Form Block */
.form {
  max-width: 500px;
  margin: 0 auto;
  padding: var(--spacing-2xl);
  background-color: var(--color-bg-light);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  animation: fadeIn 0.3s ease-in;
}

.form--auth {
  max-width: 420px;
}

/* Form Group */
.form__group {
  margin-bottom: var(--spacing-lg);
}

.form__label {
  display: block;
  margin-bottom: var(--spacing-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
}

.form__input,
.form__select {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-base);
  font-family: inherit;
  transition: border-color var(--transition-base);
}

.form__input:focus,
.form__select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

/* Button Styles */
.button {
  padding: var(--spacing-md) var(--spacing-lg);
  border: none;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  transition: all var(--transition-base);
  font-family: inherit;
  display: inline-block;
  text-decoration: none;
}

.button:disabled {
  background-color: var(--color-border);
  cursor: not-allowed;
  opacity: 0.6;
}

.button--primary {
  width: 100%;
  background-color: var(--color-success);
  color: white;
}

.button--primary:hover:not(:disabled) {
  background-color: var(--color-success-hover);
}

.button--secondary {
  background-color: white;
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.button--secondary:hover:not(:disabled) {
  background-color: var(--color-bg-light);
}

.button--secondary--active {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.button--danger {
  background-color: var(--color-danger);
  color: white;
}

.button--danger:hover:not(:disabled) {
  background-color: var(--color-danger-hover);
}

/* Toggle Buttons */
.toggle {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  margin-bottom: var(--spacing-lg);
}

.toggle__button {
  padding: var(--spacing-md) var(--spacing-lg);
  border: 1px solid var(--color-border);
  background-color: white;
  color: var(--color-text);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  font-weight: var(--font-weight-semibold);
  transition: all var(--transition-base);
}

.toggle__button--active {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

/* Result Card */
.card {
  max-width: 500px;
  margin: var(--spacing-2xl) auto 0;
  padding: var(--spacing-2xl);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  animation: slideUp 0.3s ease-out;
}

.card--result {
  background: var(--color-gradient);
  color: white;
}

.card--result__title {
  margin-top: 0;
  margin-bottom: var(--spacing-lg);
  font-size: var(--font-size-xl);
}

.card--result__expression {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  margin: var(--spacing-lg) 0;
  text-align: center;
  padding: var(--spacing-lg);
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: var(--border-radius-sm);
}

.card--result__value {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  margin: var(--spacing-md) 0;
  text-align: center;
}

.card--result__meta {
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-md);
  opacity: 0.9;
}

/* Item Card */
.card--item {
  background-color: white;
  border: 1px solid var(--color-border-light);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--transition-fast);
}

.card--item:hover {
  box-shadow: var(--shadow-md);
}

.card--item__expression {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin-bottom: var(--spacing-sm);
}

.card--item__result {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  margin-bottom: var(--spacing-sm);
}

.card--item__time {
  font-size: var(--font-size-sm);
  color: var(--color-text-lighter);
}

/* Messages */
.message {
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
  border: 1px solid;
  border-radius: var(--border-radius-sm);
}

.message--error {
  background-color: var(--color-warning-bg);
  border-color: var(--color-warning-border);
  color: var(--color-warning);
}

.message--info {
  background-color: var(--color-info-light);
  border-color: var(--color-info-border);
  color: var(--color-info);
}

.message--loading {
  text-align: center;
  padding: var(--spacing-3xl);
  font-size: var(--font-size-lg);
  color: var(--color-text-light);
}

.message--empty {
  text-align: center;
  padding: var(--spacing-3xl);
  color: var(--color-text-lighter);
  font-size: var(--font-size-lg);
}

/* Table */
.table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  margin-top: var(--spacing-lg);
}

.table__header {
  background-color: var(--color-bg-light);
  border-bottom: 2px solid var(--color-border);
}

.table__header-cell {
  padding: var(--spacing-md);
  text-align: left;
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
}

.table__body-row {
  border-bottom: 1px solid var(--color-border);
}

.table__body-row:hover {
  background-color: var(--color-bg-light);
}

.table__body-cell {
  padding: var(--spacing-md);
  color: var(--color-text-light);
}

/* Grid */
.grid {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.grid__controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-lg);
  flex-wrap: wrap;
}

.grid__page-info {
  font-size: var(--font-size-sm);
  color: var(--color-text-light);
}

.grid__page-size {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.grid__page-size label {
  font-size: var(--font-size-sm);
  color: var(--color-text-light);
}

.grid__buttons {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

/* Section Blocks */
.section {
  animation: fadeIn 0.3s ease-in;
}

/* Section Header */
.section__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.section__title {
  margin: 0;
}

/* List Container */
.list {
  list-style: none;
  padding: 0;
  max-width: 800px;
  margin: 0 auto;
}

.list--items {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

/* Responsive */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
  }

  .tabs {
    flex-wrap: wrap;
  }

  .list {
    max-width: 100%;
  }

  .section__header {
    flex-direction: column;
    align-items: flex-start;
  }
}

/* Utilities */
.u-margin-40-auto {
  margin: 40px auto;
}

.u-max-width-sm {
  max-width: 500px;
}

.u-margin-bottom-lg {
  margin-bottom: 20px;
}

.u-overflow-x-auto {
  overflow-x: auto;
}

.u-width-full {
  width: 100%;
}
  `;

  document.head.appendChild(style);
}

// Inject styles immediately when module is imported
injectStyles();

export { injectStyles };
