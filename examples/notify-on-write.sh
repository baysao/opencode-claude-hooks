#!/bin/bash
# PostToolUse hook - sends notification when files are written

INPUT=$(cat)

TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name')

# Only trigger on Write or Edit tools
if [ "$TOOL_NAME" != "Write" ] && [ "$TOOL_NAME" != "Edit" ]; then
  exit 0
fi

FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.path // "unknown"')
FILENAME=$(basename "$FILE_PATH")

# macOS notification (if available)
if command -v osascript &> /dev/null; then
  osascript -e "display notification \"File modified: $FILENAME\" with title \"OpenCode Hooks\""
fi

exit 0
