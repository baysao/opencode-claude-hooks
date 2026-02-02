#!/bin/bash
# PreToolUse hook - logs all tool calls

INPUT=$(cat)

TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name')
CWD=$(echo "$INPUT" | jq -r '.cwd')

LOG_FILE="${CLAUDE_PROJECT_DIR:-$CWD}/.hook-logs/tools.log"
mkdir -p "$(dirname "$LOG_FILE")"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] PreToolUse: $TOOL_NAME" >> "$LOG_FILE"
echo "  input: $(echo "$INPUT" | jq -c '.tool_input')" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Allow the tool to proceed
exit 0
