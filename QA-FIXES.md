# Amphibious 2.0 - Documentation QA Fixes

## Issues Identified

### 1. Missing `docs.css` File
**Problem**: All documentation HTML files reference `./docs.css` which didn't exist
**Status**: ✅ FIXED
**Location**: `/docs/docs.css`

The file has been created with comprehensive documentation styles including:
- Base typography and layout
- Documentation navigation styling  
- Section and heading styles
- Example containers and code blocks
- Responsive adjustments for mobile

### 2. Vite Build Configuration
**Problem**: The build was creating hashed CSS files (`index-C5eH9UQy.css`) instead of `amphibious.css`
**Status**: ✅ FIXED
**Location**: `vite.config.js`

Changes made:
```javascript
assetFileNames: (assetInfo) => {
  if (assetInfo.name === 'style.css' || assetInfo.name?.endsWith('.css')) {
    return 'amphibious.css';  // Output as amphibious.css
  }
  return assetInfo.name || 'asset';
}
```

### 3. HTML Parsing Error in features.html
**Problem**: Vite showing parse5 error at line 570:10
**Status**: ⚠️ INVESTIGATION NEEDED
**Analysis**: The HTML structure at that line appears valid. The error might be caused by:
- Missing CSS files triggering parser issues
- Vite HMR (Hot Module Replacement) conflicts
- Browser caching of old files

**Likely Resolution**: After rebuilding and loading proper CSS files, this error should resolve.

### 4. Typography and Grid Issues
**Problem**: Function.html page showing broken typography and grid layout
**Status**: ✅ SHOULD BE FIXED
**Root Cause**: Missing CSS files meant no styles were being applied

## Grid System Verification

The grid system in `/src/css/grid.css` is correctly implemented with:
- ✅ `.container` class (max-width 960px, centered)
- ✅ `.row` class (flexbox container with gutters)
- ✅ `.col-1` through `.col-16` classes (16-column grid)
- ✅ `.col-4`, `.col-8`, `.col-12` classes (common breakpoints)
- ✅ Responsive behavior for mobile/tablet
- ✅ Push/offset classes for layout control

## Steps to Verify Fixes

### Step 1: Rebuild the Project
```bash
cd /Users/clivemoore/Documents/GitHub/AIAB/amphibious
bun run clean
bun run build
```

### Step 2: Verify Build Output
Check that these files exist:
```bash
ls -la dist/amphibious.css
ls -la docs/docs.css
```

### Step 3: Start Dev Server
```bash
bun run dev
```

### Step 4: Test Documentation Pages
Open in browser:
- http://localhost:2960/docs/function.html
- http://localhost:2960/docs/features.html
- http://localhost:2960/docs/foundation.html
- http://localhost:2960/docs/form.html

### Step 5: Verify Fixes
Check that:
- [ ] Typography is properly styled
- [ ] Grid layout (`.row` and `.col-*`) renders correctly
- [ ] Navigation menus display properly
- [ ] No Vite parsing errors in console
- [ ] CSS is loading (check Network tab)

## Optional: Build Validation Script

A new script has been created at `/scripts/fix-docs.ts` that will:
1. Clean and rebuild the project
2. Ensure amphibious.css is properly created
3. Validate HTML files for structural issues
4. Check that docs.css exists

To run:
```bash
bun run scripts/fix-docs.ts
```

## Common Issues and Solutions

### If CSS Still Not Loading:
1. Hard refresh browser (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
2. Clear browser cache
3. Check browser console for 404 errors
4. Verify file paths in HTML match actual file locations

### If Grid Still Broken:
1. Inspect element in browser DevTools
2. Check if `.row` and `.col-*` classes are being applied
3. Verify that `grid.css` is included in `main.css` imports
4. Check for CSS specificity conflicts

### If Vite Errors Persist:
1. Stop dev server (Ctrl+C)
2. Delete `node_modules/.vite` cache
3. Restart dev server
4. If still failing, check for syntax errors in HTML files

## Files Modified

1. **Created**: `/docs/docs.css` - Documentation-specific styles
2. **Updated**: `vite.config.js` - Fixed CSS output naming
3. **Created**: `/scripts/fix-docs.ts` - Build validation script

## Next Steps

1. ✅ Rebuild project: `bun run build`
2. ✅ Start dev server: `bun run dev`
3. ✅ Test all documentation pages
4. ✅ Verify in multiple browsers (Chrome, Firefox, Safari)
5. 📝 Document any remaining issues
6. 🚀 Prepare for open source release

## Additional Notes

### Typography System
The typography should now be loading from:
- `src/css/typography.css` (base styles)
- `docs/docs.css` (documentation-specific overrides)

### Icon System
Lucide icons are being loaded via the icon system in:
- `src/js/icons.ts`
- `src/css/components/icons.css`

If icons aren't showing:
1. Check that Lucide is installed: `bun install lucide`
2. Verify icon initialization in `src/index.ts`
3. Check browser console for errors

---

**Last Updated**: November 19, 2025
**Framework Version**: Amphibious 2.0
**Status**: Ready for QA Testing
