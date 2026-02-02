/**
 * Manual test runner for verifying hooks work correctly
 * Run with: bun run examples/test-runner.ts
 */

import { loadHooksConfig, getHooksForEvent } from "../src/config";
import { executeHooks } from "../src/executor";
import type { PreToolUseInput, SessionStartInput } from "../src/types";

const PROJECT_DIR = process.cwd();

async function testSessionStartHook() {
  console.log("\n=== Testing SessionStart Hook ===\n");

  const config = await loadHooksConfig(PROJECT_DIR);
  const hookConfigs = getHooksForEvent(config, "SessionStart");

  console.log(`Found ${hookConfigs.length} SessionStart hook config(s)`);

  if (hookConfigs.length === 0) {
    console.log("No hooks configured for SessionStart");
    return;
  }

  const input: SessionStartInput = {
    session_id: "test-session-123",
    transcript_path: "/tmp/test-transcript.jsonl",
    cwd: PROJECT_DIR,
    permission_mode: "default",
    hook_event_name: "SessionStart",
    is_continuation: false,
  };

  console.log("Input:", JSON.stringify(input, null, 2));

  const result = await executeHooks(hookConfigs, input, PROJECT_DIR);

  console.log("\nResult:", JSON.stringify(result, null, 2));
}

async function testPreToolUseHook() {
  console.log("\n=== Testing PreToolUse Hook (safe command) ===\n");

  const config = await loadHooksConfig(PROJECT_DIR);
  const hookConfigs = getHooksForEvent(config, "PreToolUse");

  console.log(`Found ${hookConfigs.length} PreToolUse hook config(s)`);

  const safeInput: PreToolUseInput = {
    session_id: "test-session-123",
    transcript_path: "/tmp/test-transcript.jsonl",
    cwd: PROJECT_DIR,
    permission_mode: "default",
    hook_event_name: "PreToolUse",
    tool_name: "Bash",
    tool_input: { command: "echo hello" },
  };

  console.log("Input (safe):", JSON.stringify(safeInput, null, 2));

  const safeResult = await executeHooks(hookConfigs, safeInput, PROJECT_DIR, "Bash");
  console.log("\nResult (safe):", JSON.stringify(safeResult, null, 2));

  console.log("\n=== Testing PreToolUse Hook (dangerous command) ===\n");

  const dangerousInput: PreToolUseInput = {
    session_id: "test-session-123",
    transcript_path: "/tmp/test-transcript.jsonl",
    cwd: PROJECT_DIR,
    permission_mode: "default",
    hook_event_name: "PreToolUse",
    tool_name: "Bash",
    tool_input: { command: "rm -rf /" },
  };

  console.log("Input (dangerous):", JSON.stringify(dangerousInput, null, 2));

  const dangerousResult = await executeHooks(hookConfigs, dangerousInput, PROJECT_DIR, "Bash");
  console.log("\nResult (dangerous):", JSON.stringify(dangerousResult, null, 2));

  if (dangerousResult.blocked) {
    console.log("\n✓ Dangerous command was correctly blocked!");
  } else {
    console.log("\n✗ WARNING: Dangerous command was NOT blocked!");
  }
}

async function testReadToolHook() {
  console.log("\n=== Testing PreToolUse Hook (Read tool) ===\n");

  const config = await loadHooksConfig(PROJECT_DIR);
  const hookConfigs = getHooksForEvent(config, "PreToolUse");

  const input: PreToolUseInput = {
    session_id: "test-session-123",
    transcript_path: "/tmp/test-transcript.jsonl",
    cwd: PROJECT_DIR,
    permission_mode: "default",
    hook_event_name: "PreToolUse",
    tool_name: "Read",
    tool_input: { file_path: `${PROJECT_DIR}/package.json` },
  };

  console.log("Input:", JSON.stringify(input, null, 2));

  const result = await executeHooks(hookConfigs, input, PROJECT_DIR, "Read");
  console.log("\nResult:", JSON.stringify(result, null, 2));
}

async function main() {
  console.log("OpenCode Claude Hooks - Manual Test Runner");
  console.log("====================================");
  console.log(`Project directory: ${PROJECT_DIR}`);

  try {
    await testSessionStartHook();
    await testPreToolUseHook();
    await testReadToolHook();

    console.log("\n=== Check logs ===");
    console.log(`Logs should be in: ${PROJECT_DIR}/.hook-logs/`);

  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  }
}

main();
