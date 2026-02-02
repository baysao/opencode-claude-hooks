#!/bin/bash
# SessionEnd hook - logs session end

INPUT=$(cat)

SESSION_ID=$(echo "$INPUT" | jq -r '.session_id')
CWD=$(echo "$INPUT" | jq -r '.cwd')

LOG_FILE="${CLAUDE_PROJECT_DIR:-$CWD}/.hook-logs/session.log"
mkdir -p "$(dirname "$LOG_FILE")"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] SessionEnd" >> "$LOG_FILE"
echo "  session_id: $SESSION_ID" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

exit 0
