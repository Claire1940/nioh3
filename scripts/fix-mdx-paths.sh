#!/bin/bash

# Fix .mdx files in subdirectories
# Moves .mdx files from subdirectories to proper file names

cd /Users/bk_libin/Documents/GameProjects/1117WinterBurrow/src/content

echo "🔧 Fixing .mdx file paths..."
echo ""

count=0

# Find all .mdx files
while IFS= read -r file; do
    # Get directory path
    dir=$(dirname "$file")
    # Get parent directory
    parent=$(dirname "$dir")
    # Get directory name (this will be the file name)
    dir_name=$(basename "$dir")

    # New file path
    new_file="$parent/$dir_name.mdx"

    # Move file
    if [ -f "$file" ]; then
        echo "Moving: $dir/.mdx"
        echo "    To: $new_file"
        mv "$file" "$new_file"
        # Try to remove empty directory
        rmdir "$dir" 2>/dev/null && echo "   Removed empty dir: $dir"
        count=$((count + 1))
        echo ""
    fi
done < <(find . -name ".mdx" -type f)

echo "✅ Fixed $count files"
