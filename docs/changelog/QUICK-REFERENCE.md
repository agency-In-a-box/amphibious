# Quick Reference: Fixing Amphibious 2.0

## 🚨 Two Main Issues

1. **Grid System Broken** - Float layout with overflow
2. **Images Broken** - Missing/incorrect paths

## ⚡ Quick Fixes

### Fix Grid (30 seconds)
```bash
cd /Users/clivemoore/Documents/GitHub/AIAB/amphibious
bun run scripts/fix-grid.ts
bun run dev
```

### Fix Images (Manual - 5 minutes)
```bash
# Replace via.placeholder with placehold.co
find . -name "*.html" -exec sed -i '' \
  's|via.placeholder.com|placehold.co|g' {} \;
```

## 📚 Detailed Guides

| Guide | Purpose | When to Use |
|-------|---------|-------------|
| **FIXES-SUMMARY.md** | Overview of all fixes | Start here |
| **GRID-FIX-GUIDE.md** | Deep dive on grid issues | Understanding problems |
| **VISUAL-GRID-GUIDE.md** | Visual examples | See before/after |
| **CLAUDE-CODE-IMAGE-INSTRUCTIONS.md** | Automated image fix | Use with Claude Code CLI |
| **scripts/fix-grid.ts** | Ready-to-run script | Just fix it now |

## 🎯 What Gets Fixed

### Grid System
- ✅ Flexbox replaces float layout
- ✅ Percentage widths (not pixels)
- ✅ Box-sizing: border-box
- ✅ Consistent 20px gutters
- ✅ Responsive breakpoints
- ✅ No overflow issues

### Images
- ✅ Placeholder service (placehold.co)
- ✅ Brand colors (#667eea, #764ba2)
- ✅ Appropriate sizes
- ✅ Lazy loading
- ✅ Preserved alt text

## 🧪 Test Results

After running fixes:

```bash
bun run dev
# Visit: http://localhost:2960
```

Check:
- [ ] Two 8-column layout is 50/50
- [ ] Four 4-column layout is equal
- [ ] No horizontal scroll
- [ ] Mobile stacks columns
- [ ] All images load
- [ ] No broken image icons

## 📝 Column Width Reference

| Columns | Percentage | Use Case |
|---------|-----------|----------|
| col-4   | 25%      | Quarter (4 columns) |
| col-8   | 50%      | Half (2 columns) |
| col-12  | 75%      | Three-quarters + sidebar |
| col-16  | 100%     | Full width |

## 🎨 Placeholder Colors

```
Primary:   #667eea (Purple)
Secondary: #764ba2 (Dark Purple)
Warning:   #f59e0b (Orange)
Success:   #10b981 (Green)
```

## 🔧 Common Commands

```bash
# Fix grid
bun run scripts/fix-grid.ts

# Start dev server
bun run dev

# Build for production
bun run build

# Lint code
bun run lint

# Type check
bun run typecheck
```

## 📞 Need More Help?

1. Read **FIXES-SUMMARY.md** for complete overview
2. Check **VISUAL-GRID-GUIDE.md** for visual examples
3. Use **CLAUDE-CODE-IMAGE-INSTRUCTIONS.md** with Claude Code CLI
4. Refer to **Claude.md** for general project info

## ⚠️ Important Notes

- Grid script creates backup (grid.css.backup)
- Old class names still work (.eight.col)
- Images are temporary placeholders
- Test responsive on mobile/tablet
- No breaking changes to HTML

## ✅ Success Criteria

Grid is fixed when:
- No horizontal scrollbar
- Columns add up to 100%
- Consistent gutters
- Mobile stacks properly

Images are fixed when:
- No broken icons
- All load correctly
- Appropriate sizes
- Console has no errors

---

**Quick Start:** Run `bun run scripts/fix-grid.ts` → Test → Commit
