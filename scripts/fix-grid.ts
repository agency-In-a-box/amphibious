/**
 * Quick Grid Fix Script
 *
 * This script creates a modern flexbox-based grid system to replace
 * the broken float-based grid in Amphibious 2.0
 *
 * Run with: bun run scripts/fix-grid.ts
 */

import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const GRID_CSS = `/* ==========================================================================
   Modern Flexbox Grid System - Amphibious 2.0
   16-Column responsive grid with proper box-sizing
   ========================================================================== */

/* Container
   ========================================================================== */

.aiab-container {
  width: min(960px, 96%);
  margin: 0 auto;
  padding: 0;
  position: relative;
}

.aiab-container.fluid {
  width: 96%;
  max-width: none;
}

.aiab-container.fluid.bleed {
  width: 100%;
  padding: 0;
}

/* Row - Flexbox Container
   ========================================================================== */

.aiab-row {
  display: flex;
  flex-wrap: wrap;
  margin-left: -10px;
  margin-right: -10px;
}

/* Base Column Styles
   ========================================================================== */

.aiab-row > [class*="col"],
.aiab-row > [class*="col-"] {
  box-sizing: border-box;
  padding-left: 10px;
  padding-right: 10px;
  flex: 0 0 auto;
  width: 100%; /* Default to full width */
}

/* 16-Column Grid - Percentage Based
   Each column is 6.25% (100% / 16)
   ========================================================================== */

/* Modern naming: .aiab-col-1 through .aiab-col-16 */
.aiab-col-1,
.aiab-container .one.col  { width: 6.25%; }

.aiab-col-2,
.aiab-container .two.col  { width: 12.5%; }

.aiab-col-3,
.aiab-container .three.col  { width: 18.75%; }

.aiab-col-4,
.aiab-container .four.col,
.aiab-container .one-quarter.col  { width: 25%; }

.aiab-col-5,
.aiab-container .five.col  { width: 31.25%; }

.aiab-col-6,
.aiab-container .six.col  { width: 37.5%; }

.aiab-col-7,
.aiab-container .seven.col  { width: 43.75%; }

.aiab-col-8,
.aiab-container .eight.col,
.aiab-container .half.col  { width: 50%; }

.aiab-col-9,
.aiab-container .nine.col  { width: 56.25%; }

.aiab-col-10,
.aiab-container .ten.col  { width: 62.5%; }

.aiab-col-11,
.aiab-container .eleven.col  { width: 68.75%; }

.aiab-col-12,
.aiab-container .twelve.col,
.aiab-container .three-quarters.col  { width: 75%; }

.aiab-col-13,
.aiab-container .thirteen.col  { width: 81.25%; }

.aiab-col-14,
.aiab-container .fourteen.col  { width: 87.5%; }

.aiab-col-15,
.aiab-container .fifteen.col  { width: 93.75%; }

.aiab-col-16,
.aiab-container .sixteen.col  { width: 100%; }

/* Fractional Columns (Common Patterns)
   ========================================================================== */

.one-third.col,
.col-one-third {
  width: 33.333%;
}

.two-thirds.col,
.col-two-thirds {
  width: 66.666%;
}

/* Offset/Push Classes
   Creates left margin to push columns right
   ========================================================================== */

.aiab-push-1,
.push_one,
.aiab-offset-1 { margin-left: calc(6.25% + 10px); }

.aiab-push-2,
.push_two,
.aiab-offset-2 { margin-left: calc(12.5% + 10px); }

.aiab-push-3,
.push_three,
.aiab-offset-3 { margin-left: calc(18.75% + 10px); }

.aiab-push-4,
.push_four,
.aiab-offset-4 { margin-left: calc(25% + 10px); }

.aiab-push-5,
.push_five,
.aiab-offset-5 { margin-left: calc(31.25% + 10px); }

.aiab-push-6,
.push_six,
.aiab-offset-6 { margin-left: calc(37.5% + 10px); }

.aiab-push-7,
.push_seven,
.aiab-offset-7 { margin-left: calc(43.75% + 10px); }

.aiab-push-8,
.push_eight,
.aiab-offset-8 { margin-left: calc(50% + 10px); }

/* Utility Classes
   ========================================================================== */

.col.centered,
.col-centered {
  margin-left: auto !important;
  margin-right: auto !important;
}

.col.text-center,
.text-center {
  text-align: center;
}

.col.text-left,
.text-left {
  text-align: left;
}

.col.text-right,
.text-right {
  text-align: right;
}

/* Vertical Alignment Options
   ========================================================================== */

.aiab-row.align-top {
  align-items: flex-start;
}

.aiab-row.align-middle {
  align-items: center;
}

.aiab-row.align-bottom {
  align-items: flex-end;
}

.aiab-row.align-stretch {
  align-items: stretch;
}

/* Horizontal Alignment Options
   ========================================================================== */

.aiab-row.justify-start {
  justify-content: flex-start;
}

.aiab-row.justify-center {
  justify-content: center;
}

.aiab-row.justify-end {
  justify-content: flex-end;
}

.aiab-row.justify-between {
  justify-content: space-between;
}

.aiab-row.justify-around {
  justify-content: space-around;
}

/* Column Order Control
   ========================================================================== */

.col-first {
  order: -1;
}

.col-last {
  order: 999;
}

/* No Gutters Option
   ========================================================================== */

.aiab-row.no-gutters {
  margin-left: 0;
  margin-right: 0;
}

.aiab-row.no-gutters > [class*="col"] {
  padding-left: 0;
  padding-right: 0;
}

/* Responsive Behavior
   ========================================================================== */

/* Tablet (768px to 960px) */
@media (max-width: 960px) and (min-width: 769px) {
  .aiab-container {
    width: 96%;
  }
  
  /* Optional: Keep layout on tablet */
  .tablet-keep-cols .aiab-row > [class*="col"] {
    /* Columns maintain their width on tablet */
  }
}

/* Mobile (max 768px) - Stack all columns */
@media (max-width: 768px) {
  .aiab-row > [class*="col"],
  .aiab-row > [class*="col-"] {
    width: 100% !important;
    margin-bottom: 1rem;
    margin-left: 0 !important; /* Reset push/offset */
  }
  
  .aiab-row.mobile-keep-cols > [class*="col"] {
    width: auto !important;
    flex: 1 1 0;
  }
  
  /* Mobile-specific column sizes */
  .col-mobile-half {
    width: 50% !important;
  }
  
  .col-mobile-third {
    width: 33.333% !important;
  }
  
  .col-mobile-quarter {
    width: 25% !important;
  }
}

/* Extra Small Mobile (max 480px) */
@media (max-width: 480px) {
  .aiab-container {
    width: 100%;
    padding: 0 10px;
  }
  
  .aiab-row {
    margin-left: -5px;
    margin-right: -5px;
  }
  
  .aiab-row > [class*="col"] {
    padding-left: 5px;
    padding-right: 5px;
  }
}

/* Print Styles
   ========================================================================== */

@media print {
  .aiab-container {
    width: 100%;
  }
  
  .aiab-row > [class*="col"] {
    page-break-inside: avoid;
  }
}

/* Legacy Float-based Grid Support (Optional)
   Uncomment if you need backwards compatibility with old float-based layouts
   ========================================================================== */

/*
.aiab-row.legacy {
  display: block;
  margin-left: 0;
  margin-right: 0;
}

.aiab-row.legacy:after {
  content: "";
  display: table;
  clear: both;
}

.aiab-row.legacy > [class*="col"] {
  float: left;
  display: inline;
}
*/
`;

// Write the fixed grid
const gridPath = resolve(process.cwd(), 'src/css/grid.css');

try {
  writeFileSync(gridPath, GRID_CSS, 'utf-8');
} catch (error) {
  console.error('❌ Error writing grid file:', error);
  process.exit(1);
}
