import type { HooksResult, PermissionRequestInput, PluginContext } from "../types";
import { getHooksConfig, getHooksForEvent } from "../config";
import { executeHooks } from "../executor";

/**
 * Handle PermissionRequest event (maps to OpenCode permission.asked)
 */
export async function handlePermissionRequest(
  ctx: PluginContext,
  toolName: string,
  toolInput: Record<string, unknown>,
  permissionType: string
): Promise<HooksResult> {
  const config = await getHooksConfig(ctx.cwd);
  const hookConfigs = getHooksForEvent(config, "PermissionRequest");

  if (hookConfigs.length === 0) {
    return {
      blocked: false,
      additionalContext: [],
      errors: [],
    };
  }

  const input: PermissionRequestInput = {
    session_id: ctx.sessionId,
    transcript_path: ctx.transcriptPath,
    cwd: ctx.cwd,
    permission_mode: ctx.permissionMode,
    hook_event_name: "PermissionRequest",
    tool_name: toolName,
    tool_input: toolInput,
    permission_type: permissionType,
  };

  return executeHooks(hookConfigs, input, ctx.cwd, toolName);
}
