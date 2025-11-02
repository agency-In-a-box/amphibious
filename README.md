# 🐸 Amphibious 2.0

> The Elegant HTML5 Boilerplate for Responsive Web Development - Evolved

**Amphibious** is a modern CSS framework and component library, rebuilt from the ground up with modern tooling while preserving the elegant responsive design patterns that made the original [A.mphibio.us](http://a.mphibio.us) great.

## ✨ Features

- **16-Column Grid System** - Flexible, responsive grid based on proven patterns
- **Modern Component Library** - Cards, alerts, navigation, tables, and more
- **Mobile-First** - Responsive breakpoints for all device sizes
- **CSS Variables** - Easy theming with custom properties
- **Zero Dependencies** - Pure CSS and vanilla JavaScript
- **TypeScript Ready** - Full type definitions included
- **Vite Powered** - Lightning-fast development and builds

## 🚀 Quick Start

### Installation

```bash
cd amphibious
bun install
```

### Development

```bash
bun run dev          # Start development server on port 3000
```

Visit `http://localhost:3000` to see the framework in action.

### Build

```bash
bun run build        # Build for production
```

## 📦 Usage

### As a Module

```typescript
import '@agency-in-a-box/amphibious';
import '@agency-in-a-box/amphibious/css';
```

### Via CDN

```html
<link rel="stylesheet" href="path/to/amphibious.css">
<script type="module" src="path/to/amphibious.js"></script>
```

## 🎨 Grid System

Amphibious uses a **16-column grid** for maximum flexibility:

```html
<div class="container">
  <div class="row">
    <div class="col-8">Half width (8/16)</div>
    <div class="col-8">Half width (8/16)</div>
  </div>
  
  <div class="row">
    <div class="col-4">Quarter (4/16)</div>
    <div class="col-12">Three quarters (12/16)</div>
  </div>
</div>
```

### Responsive Columns

```html
<div class="col-8 col-tablet-16 col-mobile-16">
  Full width on mobile/tablet, half width on desktop
</div>
```

## 🧩 Components

### Cards

```html
<div class="card">
  <div class="card-header">Card Title</div>
  <div class="card-body">Card content goes here</div>
  <div class="card-footer">Card footer</div>
</div>
```

### Alerts

```html
<div class="alert alert-success">Success message</div>
<div class="alert alert-danger">Error message</div>
<div class="alert alert-warning">Warning message</div>
<div class="alert alert-info">Info message</div>
```

## 🎯 Migration Status

This is a **modern rebuild** of A.mphibio.us. Core components marked `TODO` need to be migrated from the original source:

- [ ] Complete CSS component migration
- [ ] JavaScript plugin migration
- [ ] Theme system (SCSS)
- [ ] Complete documentation
- [ ] Examples and demos
- [ ] Testing suite

## 🛠 Development Commands

```bash
bun run dev          # Start dev server
bun run build        # Build for production
bun run preview      # Preview production build
bun run lint         # Lint with Biome
bun run lint:fix     # Fix linting issues
bun run format       # Format code
bun run typecheck    # TypeScript type checking
bun run clean        # Clean build directory
```

## 📖 Documentation

Full documentation coming soon. For now, refer to:

- `docs/` - Component documentation
- `examples/` - Live examples
- Original [A.mphibio.us docs](http://a.mphibio.us)

## 🏗 Project Structure

```
amphibious/
├── src/
│   ├── css/              # CSS source files
│   │   ├── components/   # Component styles
│   │   ├── grid.css      # Grid system
│   │   ├── variables.css # CSS custom properties
│   │   └── main.css      # Entry point
│   ├── js/               # JavaScript plugins
│   └── index.ts          # TypeScript entry
├── scss/                 # Sass theme files
├── examples/             # Usage examples
├── docs/                 # Documentation
├── public/               # Static assets
└── dist/                 # Built files (generated)
```

## 🌊 Philosophy

Amphibious embraces **mobile-first responsive design** with:

- Progressive enhancement
- Semantic HTML
- Accessible components
- Performance-first approach
- Clean, readable code

## 📜 License

MIT License - see LICENSE file for details

## 🙏 Credits

Original A.mphibio.us created by **Clive Moore** [@cliveMoore](https://clivemoore.ca)

Rebuilt as part of the **AIAB** (Agency In A Box) monorepo.

---

**Status**: 🚧 Active Development - Migration from A.mphibio.us in progress
