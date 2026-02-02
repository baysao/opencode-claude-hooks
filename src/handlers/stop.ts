import type { HooksResult, PluginContext, StopInput } from "../types";
import { getHooksConfig, getHooksForEvent } from "../config";
import { executeHooks } from "../executor";

/**
 * Handle Stop event (maps to OpenCode session.idle)
 *
 * Note: OpenCode's session.idle semantics may differ from Claude Code's Stop event.
 * In Claude Code, Stop fires when the assistant is about to stop responding.
 * In OpenCode, session.idle may fire when the session becomes inactive.
 */
export async function handleStop(
  ctx: PluginContext,
  stopReason: string
): Promise<HooksResult> {
  const config = await getHooksConfig(ctx.cwd);
  const hookConfigs = getHooksForEvent(config, "Stop");

  if (hookConfigs.length === 0) {
    return {
      blocked: false,
      additionalContext: [],
      errors: [],
    };
  }

  const input: StopInput = {
    session_id: ctx.sessionId,
    transcript_path: ctx.transcriptPath,
    cwd: ctx.cwd,
    permission_mode: ctx.permissionMode,
    hook_event_name: "Stop",
    stop_reason: stopReason,
  };

  return executeHooks(hookConfigs, input, ctx.cwd);
}
