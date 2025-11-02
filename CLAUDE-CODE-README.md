# 🤖 Claude Code Migration Guide

**Welcome, Claude Code!** This directory contains everything you need to migrate Amphibious from the old Grunt-based system to the modern Vite setup.

## 📋 What You Have

Here are all the instruction files available to you:

### 1. **CLAUDE-CODE-INSTRUCTIONS.md** ⭐ START HERE
**Purpose**: Your main migration manual  
**Contains**: 
- Complete phase-by-phase instructions
- 18 specific tasks to complete
- File paths for everything
- Step-by-step procedures
- Testing protocols
- Quality checklist

**When to use**: This is your primary guide. Read this first!

---

### 2. **CLAUDE-CODE-CHECKLIST.md** ✅ TRACK PROGRESS
**Purpose**: Your task tracking system  
**Contains**:
- Checkbox list of all tasks
- Current status tracking
- Progress summary
- Quick command reference
- Notes section for issues

**When to use**: Update this after completing each task. Mark checkboxes as you go.

---

### 3. **QUICK-REFERENCE.md** 🔍 LOOKUP PATTERNS
**Purpose**: Quick reference for common patterns  
**Contains**:
- CSS variable conversion examples
- Vendor prefix rules
- Float to Flexbox patterns
- BEM naming examples
- jQuery to Vanilla JS conversions
- Common gotchas and solutions

**When to use**: When you need to remember how to convert something specific.

---

### 4. **MIGRATION-GUIDE.md** (in docs/)  📚 DETAILED CONTEXT
**Purpose**: Human-readable migration context  
**Contains**:
- Migration strategy overview
- Priority order explanation
- Component checklist templates
- Quality standards
- Testing strategy

**When to use**: For understanding the bigger picture and strategy.

---

### 5. **MIGRATION-STATUS.md** (in docs/) 📊 PROGRESS REPORT
**Purpose**: Overall progress tracking  
**Contains**:
- Status of all components
- Percentage complete
- Blockers and notes
- Next steps

**When to use**: Update this file to reflect what's been completed. This is what the human will check.

---

### 6. **CLAUDE.md** 🧠 DEVELOPMENT KNOWLEDGE
**Purpose**: General development guide for the module  
**Contains**:
- Project architecture
- Build system details
- Development commands
- Best practices
- Integration with AIAB

**When to use**: For understanding how the module fits into AIAB and general development info.

---

### 7. **README.md** 📖 PROJECT OVERVIEW
**Purpose**: User-facing documentation  
**Contains**:
- What Amphibious is
- How to install and use it
- Features and components
- Examples

**When to use**: For understanding what Amphibious is meant to be when complete.

---

### 8. **QUICKSTART.md** ⚡ QUICK SETUP
**Purpose**: 60-second setup guide  
**Contains**:
- Install commands
- Start dev server
- Basic usage
- Troubleshooting

**When to use**: To get the dev environment running quickly.

---

## 🚀 Getting Started

### Step 1: Read the Instructions
```bash
# Open and read this first:
cat CLAUDE-CODE-INSTRUCTIONS.md
```

This file has EVERYTHING you need. Read it completely before starting.

### Step 2: Set Up Your Environment
```bash
cd /Users/clivemoore/Documents/GitHub/AIAB/amphibious
bun install
bun run dev
```

Keep the dev server running in one terminal window, work in another.

### Step 3: Start Task 1.1
Begin with **Task 1.1: Complete normalize.css** from the CLAUDE-CODE-INSTRUCTIONS.md file.

### Step 4: Track Your Progress
After completing each task:
1. Update CLAUDE-CODE-CHECKLIST.md (mark checkbox)
2. Update MIGRATION-STATUS.md (change status icons)
3. Test thoroughly before moving on

---

## 📁 File Structure You'll Work With

```
amphibious/
├── src/                           👈 Edit CSS/JS here
│   ├── css/
│   │   ├── main.css              👈 Import order matters!
│   │   ├── variables.css         👈 CSS custom properties
│   │   ├── normalize.css         👈 TASK 1.1
│   │   ├── typography.css        👈 TASK 1.2
│   │   ├── grid.css              👈 TASK 1.3
│   │   ├── grid-responsive.css   👈 TASK 1.4
│   │   ├── helpers.css           👈 TASK 1.5
│   │   ├── print.css             👈 TASK 1.6
│   │   └── components/           👈 TASK 2.x - 3.x
│   ├── js/                       👈 TASK 4.x
│   └── index.ts                  👈 Main entry point
├── examples/                      👈 Create examples here
├── docs/                          👈 Create documentation here
└── dist/                          👈 Built files (auto-generated)
```

---

## 🎯 Your Mission

Systematically migrate A.mphibio.us (2015 Grunt-based framework) to Amphibious 2.0 (2025 Vite-based framework).

**Total Tasks**: 18  
**Estimated Time**: Several hours of focused work  
**Approach**: Quality over speed - complete each task fully before moving on

---

## 📍 Where Files Come From (Source)

```
/Users/clivemoore/Documents/GitHub/A.mphibio.us/src/css/
├── normalize.css                    → src/css/normalize.css
├── typography.css                   → src/css/typography.css
├── grid_sixteen.css                 → src/css/grid.css
├── tablet_sixteen.css              → src/css/grid-responsive.css
├── mobile_l_sixteen.css            → src/css/grid-responsive.css
├── mobile_p_sixteen.css            → src/css/grid-responsive.css
├── helpers.css                      → src/css/helpers.css
├── clearing.css                     → src/css/helpers.css
├── print.css                        → src/css/print.css
└── components/
    ├── navigation.css               → src/css/components/navigation.css
    ├── cards.css                    → src/css/components/cards.css
    ├── alerts.css                   → src/css/components/alerts.css
    ├── breadcrumbs.css              → src/css/components/breadcrumbs.css
    ├── tabs.css                     → src/css/components/tabs.css
    ├── pagination.css               → src/css/components/pagination.css
    ├── steps.css                    → src/css/components/steps.css
    ├── sidebar.css                  → src/css/components/sidebar.css
    ├── input-groups.css             → src/css/components/input-groups.css
    └── responsive-tables.css        → src/css/components/responsive-tables.css
```

---

## ⚠️ Critical Rules

1. **Never skip tasks** - Complete in order (1.1 → 1.2 → 1.3 etc.)
2. **Always modernize** - Use CSS variables, remove vendor prefixes
3. **Test everything** - Run `bun run dev` and verify in browser
4. **Document as you go** - Create examples and docs for each component
5. **Quality over speed** - Better to do one component perfectly than ten poorly
6. **Update tracking files** - Keep CHECKLIST and STATUS files current

---

## 🧪 Testing Each Task

After completing ANY task, run this sequence:

```bash
# 1. Lint check
bun run lint

# 2. Type check
bun run typecheck

# 3. Build test
bun run build

# 4. Visual test (dev server should already be running)
# Open browser to http://localhost:3000
# Check browser console for errors

# 5. Responsive test
# Resize browser window to test breakpoints:
# - 1200px (desktop)
# - 768px (tablet)
# - 480px (mobile landscape)
# - 320px (mobile portrait)
```

---

## 🎨 Modernization Patterns

When migrating CSS, always:

```css
/* ❌ OLD WAY */
.element {
  color: #333;
  padding: 16px;
  -webkit-border-radius: 4px;
  -moz-border-radius: 4px;
  border-radius: 4px;
}

/* ✅ NEW WAY */
.element {
  color: var(--color-gray-800);
  padding: var(--spacing-md);
  border-radius: var(--border-radius);
}
```

See QUICK-REFERENCE.md for more patterns!

---

## 📞 When You're Stuck

1. **Check QUICK-REFERENCE.md** for the pattern you need
2. **Look at original files** in `/Users/clivemoore/Documents/GitHub/A.mphibio.us`
3. **Review MIGRATION-GUIDE.md** for context
4. **Ask the human** for clarification if something is unclear

---

## ✅ Success Criteria

You'll know you're done when:
- [ ] All 18 tasks completed
- [ ] All checkboxes in CHECKLIST marked
- [ ] All status icons in STATUS changed to ✅
- [ ] `bun run build` succeeds with no errors
- [ ] All examples work in browser
- [ ] All documentation complete
- [ ] All tests passing

---

## 🚦 Current Status

**Phase 1**: ❌ Not Started (6 tasks)  
**Phase 2**: ❌ Not Started (5 tasks)  
**Phase 3**: ❌ Not Started (5 tasks)  
**Phase 4**: ❌ Not Started (2 tasks)  

**Overall**: 0% Complete

---

## 👉 Start Now

**Your first task**: Task 1.1 - Complete normalize.css

**Open this file**:
```bash
cat CLAUDE-CODE-INSTRUCTIONS.md
```

**Read the section**: "Task 1.1: Complete normalize.css"

**Then execute the steps** and mark them complete in CLAUDE-CODE-CHECKLIST.md

---

## 📝 Quick Commands Reference

```bash
# Navigate to project
cd /Users/clivemoore/Documents/GitHub/AIAB/amphibious

# Development
bun install                  # First time only
bun run dev                 # Start dev server (keep running)
bun run build               # Build for production

# Quality checks
bun run lint                # Code quality check
bun run typecheck           # TypeScript validation

# View files
cat CLAUDE-CODE-INSTRUCTIONS.md      # Main instructions
cat CLAUDE-CODE-CHECKLIST.md         # Task checklist
cat QUICK-REFERENCE.md               # Pattern reference
cat docs/MIGRATION-STATUS.md         # Progress report

# Test
open http://localhost:3000                    # Main page
open http://localhost:3000/examples/          # Examples
open examples/[component].html                # Specific example
```

---

**Ready? Let's modernize Amphibious! 🐸✨**

**Remember**: Slow is smooth, smooth is fast. Do it right the first time!
