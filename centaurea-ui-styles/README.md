# centaurea-ui-styles

Shared BEM-based styles for Centaurea UI applications.

## Features

- **BEM Methodology**: Follows Block Element Modifier naming convention
- **Modular CSS**: Each component in its own file
- **CSS Variables**: Theming support with CSS custom properties
- **Responsive**: Mobile-first responsive design
- **Animations**: Smooth transitions and animations

## Installation

```bash
npm install centaurea-ui-styles
```

## Usage

### Import in JavaScript/React

```javascript
import 'centaurea-ui-styles';
```

This will automatically inject the styles into your application.

### Import CSS Directly

If you prefer to import CSS files directly:

```javascript
import 'centaurea-ui-styles/src/styles/index.css';
```

### Import Individual Components

You can also import individual component styles:

```javascript
import 'centaurea-ui-styles/src/styles/button.css';
import 'centaurea-ui-styles/src/styles/form.css';
```

## BEM Components

### Layout Components

- **container** - Generic content container
- **app-container** - Main application container
- **header** - Page header with title

### UI Components

- **button** - Button with variants (primary, secondary, danger, success)
- **form** - Form container and elements
- **card** - Card container
- **table** - Data table
- **tabs** - Navigation tabs
- **modal** - Modal dialog
- **alert** - Alert/notification
- **user-badge** - User information display

### Utility Classes

Text utilities, spacing utilities, display utilities, and more.

## BEM Naming Convention

### Block
```html
<div class="button"></div>
```

### Element
```html
<div class="card">
  <div class="card__header"></div>
  <div class="card__body"></div>
</div>
```

### Modifier
```html
<button class="button button--primary">Primary Button</button>
<button class="button button--secondary">Secondary Button</button>
```

## Examples

### Button

```html
<!-- Primary button -->
<button class="button button--primary">Click me</button>

<!-- Secondary button -->
<button class="button button--secondary">Cancel</button>

<!-- Danger button -->
<button class="button button--danger">Delete</button>

<!-- Small button -->
<button class="button button--primary button--small">Small</button>

<!-- Full-width button -->
<button class="button button--primary button--full-width">Full Width</button>
```

### Form

```html
<form class="form">
  <h2 class="form__title">Login</h2>
  
  <div class="form__group">
    <label class="form__label">Email</label>
    <input type="email" class="form__input" />
  </div>
  
  <div class="form__group">
    <label class="form__label">Password</label>
    <input type="password" class="form__input" />
  </div>
  
  <div class="form__actions">
    <button type="submit" class="button button--primary button--full-width">
      Sign In
    </button>
  </div>
</form>
```

### Card

```html
<div class="card">
  <div class="card__header">
    <h3 class="card__title">Card Title</h3>
    <p class="card__subtitle">Card subtitle</p>
  </div>
  
  <div class="card__body">
    Card content goes here
  </div>
  
  <div class="card__footer">
    <button class="button button--secondary">Cancel</button>
    <button class="button button--primary">Save</button>
  </div>
</div>
```

### Table

```html
<table class="table">
  <thead class="table__head">
    <tr class="table__row">
      <th class="table__header">Name</th>
      <th class="table__header">Email</th>
      <th class="table__header">Actions</th>
    </tr>
  </thead>
  <tbody>
    <tr class="table__row">
      <td class="table__cell">John Doe</td>
      <td class="table__cell">john@example.com</td>
      <td class="table__cell table__cell--actions">
        <button class="button button--small">Edit</button>
      </td>
    </tr>
  </tbody>
</table>
```

### Modal

```html
<div class="modal">
  <div class="modal__dialog">
    <div class="modal__header">
      <h3 class="modal__title">Modal Title</h3>
      <button class="modal__close">&times;</button>
    </div>
    
    <div class="modal__body">
      Modal content
    </div>
    
    <div class="modal__footer">
      <button class="button button--secondary">Cancel</button>
      <button class="button button--primary">Confirm</button>
    </div>
  </div>
</div>
```

### Alert

```html
<!-- Info alert -->
<div class="alert alert--info">
  <div class="alert__title">Information</div>
  <div class="alert__message">This is an informational message.</div>
</div>

<!-- Success alert -->
<div class="alert alert--success">
  <div class="alert__message">Operation successful!</div>
</div>

<!-- Danger alert -->
<div class="alert alert--danger">
  <div class="alert__message">An error occurred.</div>
</div>
```

## Customization

You can customize the design by overriding CSS variables:

```css
:root {
  --color-primary: #your-color;
  --font-family: 'Your Font', sans-serif;
  --spacing-md: 16px;
}
```

## CSS Variables

See [variables.css](src/styles/variables.css) for the complete list of available CSS variables.

- Colors: `--color-primary`, `--color-text`, etc.
- Spacing: `--spacing-xs` to `--spacing-3xl`
- Typography: `--font-size-*`, `--font-weight-*`
- Borders: `--border-radius-*`
- Shadows: `--shadow-*`
- Transitions: `--transition-*`
