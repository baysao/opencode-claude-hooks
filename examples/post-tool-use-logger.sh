#!/bin/bash
# PostToolUse hook - logs tool completions

INPUT=$(cat)

TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name')
CWD=$(echo "$INPUT" | jq -r '.cwd')
OUTPUT_LENGTH=$(echo "$INPUT" | jq -r '.tool_output | length')

LOG_FILE="${CLAUDE_PROJECT_DIR:-$CWD}/.hook-logs/tools.log"
mkdir -p "$(dirname "$LOG_FILE")"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] PostToolUse: $TOOL_NAME (output: ${OUTPUT_LENGTH} chars)" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

exit 0
