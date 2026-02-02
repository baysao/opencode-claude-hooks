# Example Hooks

This directory contains example hook scripts demonstrating various use cases.

## Session Hooks

### session-start.sh
Logs when a session starts and adds helpful context.

**Features:**
- Logs timestamp to `.hook-logs/session.log`
- Adds current datetime as context
- Shows project name

**Configuration:**
```json
{
  "hooks": {
    "SessionStart": [{
      "hooks": [{
        "type": "command",
        "command": "bash ./examples/session-start.sh"
      }]
    }]
  }
}
```

### session-end.sh
Logs when a session ends.

**Features:**
- Logs session end to `.hook-logs/session.log`
- Useful for tracking session history

## Tool Execution Hooks

### pre-tool-use-logger.sh
Logs all tool executions before they run.

**Features:**
- Logs tool name and arguments
- Writes to `.hook-logs/tools.log`
- Useful for debugging and auditing

**Configuration:**
```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "bash ./examples/pre-tool-use-logger.sh"
      }]
    }]
  }
}
```

### post-tool-use-logger.sh
Logs tool executions after they complete.

**Features:**
- Logs tool results
- Tracks execution time
- Useful for performance monitoring

### block-dangerous-bash.sh
Safety hook that blocks dangerous bash commands.

**Features:**
- Blocks commands with dangerous patterns:
  - `rm -rf /`
  - `dd if=`
  - `mkfs`
  - `:(){ :|:& };:`
  - `chmod -R 777 /`
- Returns exit code 2 to block
- Provides explanation in JSON output

**Configuration:**
```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "Bash",
      "hooks": [{
        "type": "command",
        "command": "bash ./examples/block-dangerous-bash.sh"
      }]
    }]
  }
}
```

### notify-on-write.sh
macOS notification when files are written.

**Features:**
- Shows notification for Write/Edit operations
- macOS only (uses `osascript`)
- Displays filename and operation type

**Configuration:**
```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Write|Edit",
      "hooks": [{
        "type": "command",
        "command": "bash ./examples/notify-on-write.sh"
      }]
    }]
  }
}
```

## Test Runner

### test-runner.ts
Comprehensive test suite for hook execution.

**Run tests:**
```bash
bun run examples/test-runner.ts
```

**Tests:**
- SessionStart hook execution
- PreToolUse hook with safe commands
- PreToolUse hook blocking dangerous commands
- Tool pattern matching

## Creating Custom Hooks

### Hook Input Structure

All hooks receive JSON via stdin:

```typescript
{
  session_id: string;
  transcript_path: string;
  cwd: string;
  permission_mode: string;
  hook_event_name: string;
  // Event-specific fields...
}
```

### Exit Codes

- `0` - Success, continue
- `2` - Block/deny the action
- Other - Non-blocking error

### JSON Output (Optional)

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Reason here",
    "additionalContext": "Context to add to session"
  }
}
```

### Environment Variables

- `CLAUDE_PROJECT_DIR` - Project root
- `OPENCODE_COMPAT` - Always `"true"`

## Tips

1. **Debugging** - Use `jq` to parse stdin JSON
2. **Performance** - Keep hooks fast (<1s execution time)
3. **Errors** - Exit 0 on non-critical errors to avoid breaking OpenCode
4. **Logging** - Write to `.hook-logs/` for persistence
5. **Security** - Validate all inputs from stdin
