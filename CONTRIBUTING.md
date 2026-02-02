# Contributing to OpenCode Claude Hooks

Thank you for your interest in contributing!

## Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/magarcia/opencode-claude-hooks.git
   cd opencode-claude-hooks
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Build the project**
   ```bash
   bun run build
   ```

4. **Run type checking**
   ```bash
   bun run typecheck
   ```

## Testing Locally

### Test Hook Execution

Run the test suite to verify hooks work correctly:

```bash
bun run examples/test-runner.ts
```

### Test with OpenCode

1. Link the plugin locally:
   ```bash
   bun link
   cd ~/.config/opencode
   bun link opencode-claude-hooks
   ```

2. Add to `~/.config/opencode/opencode.json`:
   ```json
   {
     "plugin": ["opencode-claude-hooks"]
   }
   ```

3. Run OpenCode and verify hooks are triggered

## Project Structure

```
opencode-claude-hooks/
├── src/
│   ├── index.ts              # Plugin entry point
│   ├── types.ts              # TypeScript interfaces
│   ├── config.ts             # Config loading
│   ├── executor.ts           # Hook execution
│   ├── matchers.ts           # Tool pattern matching
│   └── handlers/
│       ├── session.ts        # SessionStart/End
│       ├── tool.ts           # PreToolUse/PostToolUse
│       ├── permission.ts     # PermissionRequest
│       ├── stop.ts           # Stop
│       ├── compact.ts        # PreCompact
│       ├── notification.ts   # Notification
│       ├── prompt.ts         # UserPromptSubmit
│       └── subagent.ts       # SubagentStart/Stop
├── examples/                 # Example hook scripts
└── dist/                     # Built output
```

## Making Changes

1. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow existing code style
   - Add types for new functionality
   - Update tests if needed

3. **Test your changes**
   ```bash
   bun run typecheck
   bun run build
   bun run examples/test-runner.ts
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "Description of changes"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## Code Style

- Use TypeScript strict mode
- Prefer functional patterns
- Add JSDoc comments for public APIs
- Handle errors gracefully (hooks should never crash OpenCode)

## Adding New Hooks

1. Add handler in `src/handlers/`
2. Import and register in `src/index.ts`
3. Add tests in `examples/`
4. Update documentation in README.md

## Debugging

Enable debug output by adding console.log statements (they appear in OpenCode's output).

For hook scripts, check logs in `.hook-logs/`:
- `session.log` - Session events
- `tools.log` - Tool execution events

## Questions?

Open an issue or discussion on GitHub.
