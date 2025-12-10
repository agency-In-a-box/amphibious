#!/bin/bash

# Remove wave icons from all HTML files in the amphibious directory
echo "Removing wave icons from Amphibious navigation..."

# Find all HTML files containing the wave icon
files=(
  "index.html"
  "docs/form.html"
  "docs/foundation.html"
  "docs/features.html"
  "docs/function.html"
  "docs/template.html"
  "docs/index.html"
  "docs/icons.html"
  "docs/grid-system.html"
  "docs/getting-started.html"
  "docs/carousel.html"
  "docs/api-reference.html"
  "docs/navigation-include.html"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing $file..."
    # Remove the SVG wave icon but keep the text "Amphibious"
    # This handles both inline and multi-line SVG elements
    perl -i -0pe 's/<svg[^>]*class="lucide lucide-waves"[^>]*>.*?<\/svg>\s*//gs' "$file"
    echo "✓ Processed $file"
  else
    echo "⚠ File not found: $file"
  fi
done

echo "Done! Wave icons removed from all files."