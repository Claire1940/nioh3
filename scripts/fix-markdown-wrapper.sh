#!/bin/bash

# Fix MDX files with ```markdown wrapper

cd /Users/bk_libin/Documents/GameProjects/1117WinterBurrow/src/content

echo "🔧 Fixing MDX files with markdown code blocks..."
echo ""

count=0

# Find all .mdx files that start with ```markdown
for file in $(grep -l "^\`\`\`markdown" **/*.mdx 2>/dev/null); do
    echo "Fixing: $file"

    # Remove first line if it's ```markdown
    sed -i '' '1{/^```markdown$/d;}' "$file"

    count=$((count + 1))
done

echo ""
echo "✅ Fixed $count files"
