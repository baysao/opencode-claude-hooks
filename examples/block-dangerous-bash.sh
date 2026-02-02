#!/bin/bash
# PreToolUse hook - blocks dangerous bash commands

INPUT=$(cat)

TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name')

# Only check Bash tool
if [ "$TOOL_NAME" != "Bash" ]; then
  exit 0
fi

COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# List of dangerous patterns
DANGEROUS_PATTERNS=(
  "rm -rf /"
  "rm -rf ~"
  "rm -rf \$HOME"
  ":(){:|:&};:"  # Fork bomb
  "mkfs"
  "dd if=/dev"
  "> /dev/sda"
)

for pattern in "${DANGEROUS_PATTERNS[@]}"; do
  if [[ "$COMMAND" == *"$pattern"* ]]; then
    # Exit code 2 = block
    echo "Blocked dangerous command: $pattern" >&2
    cat << EOF
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Command contains dangerous pattern: $pattern"
  },
  "continue": false,
  "stopReason": "Dangerous command blocked by safety hook"
}
EOF
    exit 2
  fi
done

exit 0
