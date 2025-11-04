# Amphibious 2.0 - Fix Documentation Index

## 📖 Overview

This directory contains comprehensive documentation for fixing the two main issues discovered during the Amphibious 2.0 migration:

1. **Broken Grid System** - Float-based layout with incorrect calculations
2. **Broken Image Links** - Missing assets from legacy migration

## 🚀 Quick Start

**Want to fix everything right now?**

```bash
cd /Users/clivemoore/Documents/GitHub/AIAB/amphibious

# Fix the grid
bun run fix:grid

# Start testing
bun run dev
```

Then visit http://localhost:2960 to verify the grid is working.

## 📚 Documentation Structure

### Entry Points (Start Here)

| Document | Purpose | Best For |
|----------|---------|----------|
| **[QUICK-REFERENCE.md](./QUICK-REFERENCE.md)** | One-page cheat sheet | Experienced developers who just need the commands |
| **[FIXES-SUMMARY.md](./FIXES-SUMMARY.md)** | Complete workflow guide | First-time readers, project overview |

### Deep Dives

| Document | Purpose | Best For |
|----------|---------|----------|
| **[GRID-FIX-GUIDE.md](./GRID-FIX-GUIDE.md)** | Technical analysis of grid issues | Understanding the problem, choosing solutions |
| **[VISUAL-GRID-GUIDE.md](./VISUAL-GRID-GUIDE.md)** | Visual before/after examples | Visual learners, teaching others |
| **[CLAUDE-CODE-IMAGE-INSTRUCTIONS.md](./CLAUDE-CODE-IMAGE-INSTRUCTIONS.md)** | Automated image replacement | Using Claude Code CLI for image fixes |

### Implementation

| Document | Purpose | Best For |
|----------|---------|----------|
| **[scripts/fix-grid.ts](./scripts/fix-grid.ts)** | Ready-to-run grid fix | Immediate implementation |
| **[Claude.md](./Claude.md)** | Main project documentation | General project reference |

## 🎯 Choose Your Path

### Path 1: "Just Fix It" (5 minutes)
**For**: Developers who trust the solution and want to move forward

1. Read: [QUICK-REFERENCE.md](./QUICK-REFERENCE.md)
2. Run: `bun run fix:grid`
3. Test: `bun run dev`
4. Commit changes

### Path 2: "Understand Then Fix" (30 minutes)
**For**: Developers who want to understand the issues first

1. Read: [FIXES-SUMMARY.md](./FIXES-SUMMARY.md) - Get the overview
2. Read: [VISUAL-GRID-GUIDE.md](./VISUAL-GRID-GUIDE.md) - See what's broken
3. Read: [GRID-FIX-GUIDE.md](./GRID-FIX-GUIDE.md) - Understand solutions
4. Run: `bun run fix:grid`
5. Test thoroughly
6. Review and commit

### Path 3: "Deep Dive" (2 hours)
**For**: Technical leads, maintainers, or the curious

1. Read: [Claude.md](./Claude.md) - Project context
2. Read: [VISUAL-GRID-GUIDE.md](./VISUAL-GRID-GUIDE.md) - Visual understanding
3. Read: [GRID-FIX-GUIDE.md](./GRID-FIX-GUIDE.md) - All three solution options
4. Review: [scripts/fix-grid.ts](./scripts/fix-grid.ts) - Implementation details
5. Consider alternatives (CSS Grid vs Flexbox)
6. Implement chosen solution
7. Test extensively
8. Document decisions

### Path 4: "Automated Fix with Claude Code" (15 minutes)
**For**: Users with access to Claude Code CLI

```bash
# For grid fix
cd /Users/clivemoore/Documents/GitHub/AIAB/amphibious
claude code --file GRID-FIX-GUIDE.md --task "Fix the grid system using the modern flexbox approach"

# For image fix
claude code --file CLAUDE-CODE-IMAGE-INSTRUCTIONS.md --task "Replace all broken image links with appropriate placeholders"
```

## 🔍 What Each Document Covers

### [QUICK-REFERENCE.md](./QUICK-REFERENCE.md)
**One-page cheat sheet**
- Quick commands
- Common issues
- Testing checklist
- Column width reference
- Success criteria

**Best for**: Developers who need quick answers

---

### [FIXES-SUMMARY.md](./FIXES-SUMMARY.md)
**Complete workflow guide**
- Issue descriptions
- Recommended workflow
- Step-by-step instructions
- Visual comparisons
- Next steps after fixes

**Best for**: First-time readers, project managers

---

### [GRID-FIX-GUIDE.md](./GRID-FIX-GUIDE.md)
**Technical deep dive**
- Root cause analysis
- Three solution approaches:
  1. Fix float-based grid
  2. Modern flexbox (recommended)
  3. CSS Grid (most modern)
- Implementation steps
- Testing checklist
- Migration notes

**Best for**: Technical decision makers

---

### [VISUAL-GRID-GUIDE.md](./VISUAL-GRID-GUIDE.md)
**Visual explanations**
- ASCII diagrams of layouts
- Before/after comparisons
- Box model visualizations
- Common patterns
- Testing visuals

**Best for**: Visual learners, presentations

---

### [CLAUDE-CODE-IMAGE-INSTRUCTIONS.md](./CLAUDE-CODE-IMAGE-INSTRUCTIONS.md)
**Automated image replacement**
- Placeholder service options
- Brand color palette
- Size guidelines
- Automated script approach
- Manual find/replace patterns
- Complete CLI workflow

**Best for**: Batch image processing with Claude Code

---

### [scripts/fix-grid.ts](./scripts/fix-grid.ts)
**Implementation script**
- Complete modern flexbox grid
- Backward compatible
- Well-documented CSS
- Ready to run

**Best for**: Immediate implementation

---

### [Claude.md](./Claude.md)
**Main project documentation**
- Project overview
- Development commands
- Architecture
- Migration guide
- Best practices
- Now includes links to these fix guides

**Best for**: General project reference

---

## 🎨 Visual Documentation

### Grid System Issues

**The Problem:**
```
Container (960px)
┌──────────────────────────────┐
│ ┌─────────┐┌─────────┐       │
│ │ Col-8   ││ Col-8   │ ← OVERFLOW!
│ │ 480px   ││ 480px   │
│ └─────────┘└─────────┘       │
└──────────────────────────────┘
```

**The Solution:**
```
Container (960px)
┌──────────────────────────────┐
│ ┌──────────┐ ┌──────────┐    │
│ │ Col-8    │ │ Col-8    │    │
│ │ 50%      │ │ 50%      │    │
│ └──────────┘ └──────────┘    │
└──────────────────────────────┘
```

See [VISUAL-GRID-GUIDE.md](./VISUAL-GRID-GUIDE.md) for detailed diagrams.

## 🧪 Testing Procedure

After applying fixes:

### 1. Visual Testing
```bash
bun run dev
# Visit: http://localhost:2960
```

Check the grid demo section:
- [ ] Two 8-column layout: Perfect 50/50 split
- [ ] Four 4-column layout: Equal widths
- [ ] Mixed layout (6+10): Proper proportions
- [ ] No horizontal scrollbar
- [ ] Consistent 20px gutters

### 2. Responsive Testing
Resize browser window:
- [ ] Desktop (960px+): Columns side-by-side
- [ ] Tablet (768-960px): Some wrapping
- [ ] Mobile (<768px): Single column stack

### 3. Code Quality
```bash
bun run lint      # Should pass
bun run typecheck # Should pass
bun run build     # Should succeed
```

### 4. Cross-browser Testing
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if on Mac)

## 📊 Issue Status

### Grid System
- **Status**: ✅ Solution ready
- **Effort**: 5 minutes with script
- **Impact**: High (affects all layouts)
- **Risk**: Low (backward compatible)

### Image Links
- **Status**: ⚠️ Manual intervention needed
- **Effort**: 15-30 minutes
- **Impact**: Medium (visual only)
- **Risk**: Low (placeholders are temporary)

## 🎯 Success Metrics

### Grid System Fixed When:
1. No horizontal scrollbar on any page
2. All column widths add up to exactly 100%
3. Consistent 20px gutters between columns
4. Responsive stacking works on mobile
5. No console errors related to layout

### Images Fixed When:
1. No broken image icons visible
2. All placeholder images load
3. Sizes appropriate for context
4. Brand colors used consistently
5. No 404 errors in network tab

## 📝 Next Steps After Fixes

1. **Test Thoroughly**
   - All pages and components
   - All breakpoints
   - All browsers

2. **Document Changes**
   - Update CHANGELOG
   - Add migration notes
   - Document any breaking changes

3. **Create Asset List**
   - Identify which placeholders need real assets
   - Prioritize by visibility
   - Assign to design team

4. **Update Examples**
   - Add new grid patterns
   - Show responsive behavior
   - Document best practices

5. **Consider Storybook**
   - Component isolation
   - Visual regression testing
   - Documentation site

## ⚠️ Important Notes

### Grid Fix
- Creates backup file (grid.css.backup)
- Maintains backward compatibility
- Old class names still work
- Flexbox has excellent browser support
- Test on actual devices, not just DevTools

### Image Fix
- Placeholders are TEMPORARY
- Document locations for real assets
- Use brand colors consistently
- Add lazy loading for performance
- Preserve alt text for accessibility

## 🤝 Contributing

If you improve these fixes or documentation:

1. Update the relevant .md file
2. Run examples to verify
3. Update this index if needed
4. Commit with descriptive message

## 📞 Getting Help

1. **Quick answer**: Check [QUICK-REFERENCE.md](./QUICK-REFERENCE.md)
2. **Visual help**: See [VISUAL-GRID-GUIDE.md](./VISUAL-GRID-GUIDE.md)
3. **Deep understanding**: Read [GRID-FIX-GUIDE.md](./GRID-FIX-GUIDE.md)
4. **Project context**: Refer to [Claude.md](./Claude.md)
5. **Automated help**: Use Claude Code with the instruction files

## 🎉 Quick Commands Reference

```bash
# Fix grid immediately
bun run fix:grid

# Start development server
bun run dev

# Run all checks
bun run lint && bun run typecheck && bun run build

# Build for production
bun run build

# Preview production build
bun run preview
```

## 🔗 Related Resources

- **Original A.mphibio.us**: `/Users/clivemoore/Documents/GitHub/A.mphibio.us`
- **AIAB Monorepo**: `/Users/clivemoore/Documents/GitHub/AIAB`
- **Amphibious 2.0**: `/Users/clivemoore/Documents/GitHub/AIAB/amphibious`

---

**Ready to fix?** Start with [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) or run `bun run fix:grid`
