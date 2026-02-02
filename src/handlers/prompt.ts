import type { HooksResult, PluginContext, UserPromptSubmitInput } from "../types";
import { getHooksConfig, getHooksForEvent } from "../config";
import { executeHooks } from "../executor";

/**
 * Handle UserPromptSubmit event (maps to OpenCode message.updated with user role)
 *
 * Note: In OpenCode, this fires on message.updated events where the message
 * has a user role. This is a partial mapping since Claude Code's event
 * fires specifically when a user submits a prompt.
 */
export async function handleUserPromptSubmit(
  ctx: PluginContext,
  userPrompt: string
): Promise<HooksResult> {
  const config = await getHooksConfig(ctx.cwd);
  const hookConfigs = getHooksForEvent(config, "UserPromptSubmit");

  if (hookConfigs.length === 0) {
    return {
      blocked: false,
      additionalContext: [],
      errors: [],
    };
  }

  const input: UserPromptSubmitInput = {
    session_id: ctx.sessionId,
    transcript_path: ctx.transcriptPath,
    cwd: ctx.cwd,
    permission_mode: ctx.permissionMode,
    hook_event_name: "UserPromptSubmit",
    user_prompt: userPrompt,
  };

  return executeHooks(hookConfigs, input, ctx.cwd);
}
