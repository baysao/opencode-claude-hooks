import type { HooksResult, NotificationInput, PluginContext } from "../types";
import { getHooksConfig, getHooksForEvent } from "../config";
import { executeHooks } from "../executor";

/**
 * Handle Notification event (maps to OpenCode tui.toast.show)
 */
export async function handleNotification(
  ctx: PluginContext,
  message: string,
  level: "info" | "warning" | "error"
): Promise<HooksResult> {
  const config = await getHooksConfig(ctx.cwd);
  const hookConfigs = getHooksForEvent(config, "Notification");

  if (hookConfigs.length === 0) {
    return {
      blocked: false,
      additionalContext: [],
      errors: [],
    };
  }

  const input: NotificationInput = {
    session_id: ctx.sessionId,
    transcript_path: ctx.transcriptPath,
    cwd: ctx.cwd,
    permission_mode: ctx.permissionMode,
    hook_event_name: "Notification",
    message,
    level,
  };

  return executeHooks(hookConfigs, input, ctx.cwd);
}
