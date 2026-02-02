import type { PluginContext, SessionEndInput, SessionStartInput } from "../types";
import { getHooksConfig, getHooksForEvent } from "../config";
import { executeHooks } from "../executor";

/**
 * Handle SessionStart event (maps to OpenCode session.created)
 */
export async function handleSessionStart(
  ctx: PluginContext,
  isContinuation: boolean
): Promise<{ additionalContext?: string[] }> {
  const config = await getHooksConfig(ctx.cwd);
  const hookConfigs = getHooksForEvent(config, "SessionStart");

  if (hookConfigs.length === 0) {
    return {};
  }

  const input: SessionStartInput = {
    session_id: ctx.sessionId,
    transcript_path: ctx.transcriptPath,
    cwd: ctx.cwd,
    permission_mode: ctx.permissionMode,
    hook_event_name: "SessionStart",
    is_continuation: isContinuation,
  };

  const result = await executeHooks(hookConfigs, input, ctx.cwd);

  return {
    additionalContext: result.additionalContext,
  };
}

/**
 * Handle SessionEnd event (maps to OpenCode session.deleted)
 */
export async function handleSessionEnd(ctx: PluginContext): Promise<void> {
  const config = await getHooksConfig(ctx.cwd);
  const hookConfigs = getHooksForEvent(config, "SessionEnd");

  if (hookConfigs.length === 0) {
    return;
  }

  const input: SessionEndInput = {
    session_id: ctx.sessionId,
    transcript_path: ctx.transcriptPath,
    cwd: ctx.cwd,
    permission_mode: ctx.permissionMode,
    hook_event_name: "SessionEnd",
  };

  // SessionEnd hooks are fire-and-forget
  await executeHooks(hookConfigs, input, ctx.cwd);
}
