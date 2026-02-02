#!/bin/bash
# SessionStart hook - logs session info and optionally adds context

# Read JSON input from stdin
INPUT=$(cat)

# Extract fields
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id')
CWD=$(echo "$INPUT" | jq -r '.cwd')
IS_CONTINUATION=$(echo "$INPUT" | jq -r '.is_continuation')

# Log to file for debugging
LOG_FILE="${CLAUDE_PROJECT_DIR:-$CWD}/.hook-logs/session.log"
mkdir -p "$(dirname "$LOG_FILE")"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] SessionStart" >> "$LOG_FILE"
echo "  session_id: $SESSION_ID" >> "$LOG_FILE"
echo "  cwd: $CWD" >> "$LOG_FILE"
echo "  is_continuation: $IS_CONTINUATION" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Output additional context (will be injected into the session)
cat << 'EOF'
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "<current-datetime>$(date '+%H:%M:%S %Y-%m-%d')</current-datetime>\nSession started via opencode-claude-hooks plugin. Project: opencode-claude-hooks"
  }
}
EOF

exit 0
