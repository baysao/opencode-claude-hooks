import type {
  HooksResult,
  PluginContext,
  SubagentStartInput,
  SubagentStopInput,
} from "../types";
import { getHooksConfig, getHooksForEvent } from "../config";
import { executeHooks } from "../executor";

/**
 * Handle SubagentStart event (simulated via Task tool interception)
 *
 * Note: This is a partial mapping. In Claude Code, SubagentStart fires
 * when a subagent is spawned. In OpenCode, we simulate this by intercepting
 * the Task tool's execute.before event.
 */
export async function handleSubagentStart(
  ctx: PluginContext,
  subagentType: string,
  taskDescription: string
): Promise<HooksResult> {
  const config = await getHooksConfig(ctx.cwd);
  const hookConfigs = getHooksForEvent(config, "SubagentStart");

  if (hookConfigs.length === 0) {
    return {
      blocked: false,
      additionalContext: [],
      errors: [],
    };
  }

  const input: SubagentStartInput = {
    session_id: ctx.sessionId,
    transcript_path: ctx.transcriptPath,
    cwd: ctx.cwd,
    permission_mode: ctx.permissionMode,
    hook_event_name: "SubagentStart",
    subagent_type: subagentType,
    task_description: taskDescription,
  };

  return executeHooks(hookConfigs, input, ctx.cwd);
}

/**
 * Handle SubagentStop event (simulated via Task tool interception)
 *
 * Note: This is a partial mapping. In Claude Code, SubagentStop fires
 * when a subagent completes. In OpenCode, we simulate this by intercepting
 * the Task tool's execute.after event.
 */
export async function handleSubagentStop(
  ctx: PluginContext,
  subagentType: string,
  taskDescription: string,
  result?: string
): Promise<HooksResult> {
  const config = await getHooksConfig(ctx.cwd);
  const hookConfigs = getHooksForEvent(config, "SubagentStop");

  if (hookConfigs.length === 0) {
    return {
      blocked: false,
      additionalContext: [],
      errors: [],
    };
  }

  const input: SubagentStopInput = {
    session_id: ctx.sessionId,
    transcript_path: ctx.transcriptPath,
    cwd: ctx.cwd,
    permission_mode: ctx.permissionMode,
    hook_event_name: "SubagentStop",
    subagent_type: subagentType,
    task_description: taskDescription,
    result,
  };

  return executeHooks(hookConfigs, input, ctx.cwd);
}
