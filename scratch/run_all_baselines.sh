#!/bin/bash
# Fetch baselines for all markdown files in src/content/docs/

BASE_DIR="src/content/docs"
OUTPUT_DIR="scratch/baselines"

mkdir -p "$OUTPUT_DIR"

find "$BASE_DIR" -name "*.md" | while read -r filepath; do
    filename=$(basename "$filepath" .md)
    output_path="$OUTPUT_DIR/${filename}_baseline.md"
    
    if [ -f "$output_path" ]; then
        echo "Baseline already exists for $filename, skipping."
        continue
    fi
    
    # Extract title from frontmatter (assumes title: "..." format)
    title=$(grep -m 1 "^title:" "$filepath" | sed 's/^title: *//' | tr -d '"'\')
    if [ -z "$title" ]; then
        title=$filename
    fi
    
    echo "Processing $filepath - Topic: $title"
    python scratch/fetch_baselines.py "$title" "$output_path"
    
    # Sleep to avoid rate limiting
    sleep 3
done
