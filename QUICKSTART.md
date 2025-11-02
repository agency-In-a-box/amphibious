# Quick Start Guide

Get Amphibious 2.0 up and running in 60 seconds! ⚡

## Prerequisites

- **Bun** installed ([bun.sh](https://bun.sh))
- Or **Node.js 18+** with npm

## 1. Navigate to Module

```bash
cd /Users/clivemoore/Documents/GitHub/AIAB/amphibious
```

## 2. Install Dependencies

```bash
bun install
```

That's it! Bun will install:
- Vite (build tool)
- Biome (linting/formatting)
- Sass (theme support)
- TypeScript (type safety)

## 3. Start Development Server

```bash
bun run dev
```

Opens automatically at: **http://localhost:3000**

You'll see:
- 🐸 Welcome page with examples
- Grid system demo
- Component previews
- Browser console: "🐸 Amphibious 2.0 initialized"

## 4. Make Changes

Edit any file in `src/`:
- `src/css/*.css` → Instant CSS updates (HMR)
- `src/index.ts` → Fast TypeScript rebuild
- `index.html` → Instant page refresh

**No manual rebuild needed!** Vite handles it automatically.

## 5. Build for Production

```bash
bun run build
```

Outputs to `dist/`:
- `dist/amphibious.js` (minified)
- `dist/amphibious.css` (minified)
- Source maps for debugging

## Common Commands

```bash
bun run dev          # Start dev server (port 3000)
bun run build        # Build for production
bun run preview      # Preview production build
bun run lint         # Check code quality
bun run format       # Auto-format code
bun run typecheck    # TypeScript validation
```

## What's Next?

1. **Explore the code**: Check `src/css/` and `src/index.ts`
2. **Read the docs**: See `CLAUDE.md` and `docs/MIGRATION-GUIDE.md`
3. **Start migrating**: Copy components from original A.mphibio.us
4. **Test responsive**: Resize browser to see grid in action

## Project Structure at a Glance

```
amphibious/
├── src/
│   ├── css/           👈 Edit CSS here
│   │   ├── components/
│   │   ├── grid.css
│   │   ├── variables.css
│   │   └── main.css
│   └── index.ts       👈 Edit JS here
├── index.html         👈 Preview page
├── dist/              👈 Built files (auto-generated)
└── docs/              👈 Documentation
```

## Troubleshooting

### Port Already in Use
```bash
# Change port in vite.config.ts:
server: { port: 3001 }
```

### Build Fails
```bash
# Clean and rebuild:
bun run clean
bun install
bun run build
```

### Linting Errors
```bash
# Auto-fix most issues:
bun run lint:fix
```

## Need Help?

- **CLAUDE.md**: Complete development guide
- **MIGRATION-GUIDE.md**: Migration instructions
- **README.md**: Project overview
- **Original docs**: See A.mphibio.us repo

---

**Happy coding!** 🐸✨
