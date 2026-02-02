import type { HooksResult, PluginContext, PreCompactInput } from "../types";
import { getHooksConfig, getHooksForEvent } from "../config";
import { executeHooks } from "../executor";

/**
 * Handle PreCompact event (maps to OpenCode experimental.session.compacting)
 *
 * Note: This is an experimental event in OpenCode and behavior may change.
 */
export async function handlePreCompact(
  ctx: PluginContext,
  summarySoFar?: string
): Promise<HooksResult> {
  const config = await getHooksConfig(ctx.cwd);
  const hookConfigs = getHooksForEvent(config, "PreCompact");

  if (hookConfigs.length === 0) {
    return {
      blocked: false,
      additionalContext: [],
      errors: [],
    };
  }

  const input: PreCompactInput = {
    session_id: ctx.sessionId,
    transcript_path: ctx.transcriptPath,
    cwd: ctx.cwd,
    permission_mode: ctx.permissionMode,
    hook_event_name: "PreCompact",
    summary_so_far: summarySoFar,
  };

  return executeHooks(hookConfigs, input, ctx.cwd);
}
