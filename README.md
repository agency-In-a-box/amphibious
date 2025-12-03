# Amphibious 2.0

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/agency-In-a-box/amphibious)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-95%25%20complete-orange.svg)](docs/qa-reports/navigation-report.md)

> The Elegant HTML5 Boilerplate for Responsive Web Development - Evolved

**Amphibious** is a modern CSS framework and component library, rebuilt from the ground up with modern tooling while preserving the elegant responsive design patterns that made the original [A.mphibio.us](http://a.mphibio.us) great.

## Features

- **Modern Build System** - Vite 6 with TypeScript and Biome
- **Atomic Design System** - Systematic component architecture with tokens, atoms, molecules, and organisms
- **16-Column Grid System** - Flexible flexbox-based responsive grid
- **25+ Components** - Production-ready UI components including cards, modals, tabs, carousels, and more
- **E-commerce Ready** - Built with modern web applications in mind
- **Dark Mode Foundation** - CSS custom properties for theming
- **Accessibility First** - ARIA attributes and keyboard navigation
- **Zero Dependencies** - Pure CSS (except Splide.js for carousel)
- **Performance Optimized** - Lazy loading, tree-shaking, minification

## Quick Start

### Installation

```bash
cd amphibious
bun install
```

### Development

```bash
bun run dev          # Start development server on port 2960
```

Visit `http://localhost:2960` to see the framework in action.

### Build

```bash
bun run build        # Build for production
```

## Usage

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

## Grid System

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

## Components

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

## Project Status

**Current Version**: 2.0.0
**Completion**: 95% - QA Phase
**Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge)

### Completed
- Atomic Design System implementation
- Modern build system (Vite 6)
- 25+ production-ready components
- Navigation system with dropdowns
- Accessibility features
- Grid system modernization
- Image placeholder system

### Remaining Work
- [ ] NPM package publication
- [ ] CDN distribution setup
- [ ] Additional theme templates
- [ ] Component unit tests
- [ ] Storybook integration

## Development Commands

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

## Documentation

Full documentation coming soon. For now, refer to:

- `docs/` - Component documentation
- `examples/` - Live examples
- Original [A.mphibio.us docs](http://a.mphibio.us)

## Project Structure

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

## Philosophy

Amphibious embraces **mobile-first responsive design** with:

- Progressive enhancement
- Semantic HTML
- Accessible components
- Performance-first approach
- Clean, readable code

## License

MIT License - see LICENSE file for details

## Credits

Original A.mphibio.us created by **Clive Moore** [@cliveMoore](https://clivemoore.ca)

Rebuilt as part of the **AIAB** (Agency In A Box) monorepo.

---

**Status**: 95% Complete - Ready for production use

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Links

- [GitHub Repository](https://github.com/agency-In-a-box/amphibious)
- [Documentation](https://github.com/agency-In-a-box/amphibious/tree/main/docs)
- [Examples](https://github.com/agency-In-a-box/amphibious/tree/main/examples)
- [Agency In A Box](https://github.com/agency-In-a-box)
