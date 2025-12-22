#!/bin/bash

# Script to remove all float declarations from CSS files and replace with flexbox

echo "Removing all float declarations from CSS files..."

# Backup directory
BACKUP_DIR="backup-floats"
mkdir -p "$BACKUP_DIR"

# List of files to process
FILES=(
  "src/css/helpers.css"
  "src/css/molecules/pears.css"
  "src/css/organisms/forms.css"
  "src/css/organisms/navigation.css"
  "src/css/navigation-unified.css"
  "src/css/sitemap.css"
  "src/css/pear.rs.css"
  "src/css/always_fluid.css"
  "src/css/twentyfour.css"
  "src/css/navigation-fix.css"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing $file..."

    # Backup original
    cp "$file" "$BACKUP_DIR/$(basename $file)"

    # Remove float declarations and related margin-left adjustments
    sed -i '' \
      -e 's/float:\s*left;/display: inline-block;/g' \
      -e 's/float:\s*right;/margin-left: auto;/g' \
      -e 's/float:\s*none;/display: block;/g' \
      -e '/margin-left:\s*30%;/d' \
      -e '/margin-right:\s*5%;/d' \
      "$file"

    # Count remaining floats
    remaining=$(grep -c "float:" "$file" || true)
    if [ "$remaining" -gt 0 ]; then
      echo "  Warning: $remaining float declarations still remain in $file"
    else
      echo "  ✓ All floats removed from $file"
    fi
  fi
done

# Special handling for print.css (keep floats there as they're for print media)
echo "Skipping print.css (floats needed for print media)"

echo "Done! Backups saved in $BACKUP_DIR/"
echo "Total floats remaining: $(grep -r "float:" src/css | grep -v print.css | wc -l)"