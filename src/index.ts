/**
 * OpenCode Plugin: Claude Code Hooks Compatibility
 * Full implementation - no re-exports
 */

import type { Plugin, PluginInput, Hooks } from "@opencode-ai/plugin";
import type { PluginContext } from "./types";
import { handleSessionStart, handleSessionEnd } from "./handlers/session";
import { handlePreToolUse, handlePostToolUse, handlePostToolUseFailure } from "./handlers/tool";
import { handlePermissionRequest } from "./handlers/permission";
import { handlePreCompact } from "./handlers/compact";
import { handleSubagentStart, handleSubagentStop } from "./handlers/subagent";

const sessionContexts = new Map<string, PluginContext>();

function getOrCreateContext(sessionId: string, cwd: string): PluginContext {
  let ctx = sessionContexts.get(sessionId);
  if (!ctx) {
    ctx = { sessionId, cwd, permissionMode: "default", transcriptPath: "" };
    sessionContexts.set(sessionId, ctx);
  }
  return ctx;
}

export const ClaudeCodeHooksPlugin: Plugin = async (input: PluginInput): Promise<Hooks> => {
  const projectDir = input.directory || input.worktree || process.cwd();

  return {
    event: async ({ event }) => {
      try {
        if (event.type === "session.created") {
          const props = event.properties as { id?: string } | undefined;
          const sessionId = props?.id ?? "unknown";
          const ctx = getOrCreateContext(sessionId, projectDir);
          await handleSessionStart(ctx, false);
        }
        if (event.type === "session.deleted") {
          const props = event.properties as { id?: string } | undefined;
          const sessionId = props?.id ?? "unknown";
          const ctx = sessionContexts.get(sessionId);
          if (ctx) {
            await handleSessionEnd(ctx);
            sessionContexts.delete(sessionId);
          }
        }
      } catch (err) {
        // ignore
      }
    },

    "tool.execute.before": async (hookInput, output) => {
      try {
        const { tool: toolName, sessionID } = hookInput;
        const ctx = getOrCreateContext(sessionID, projectDir);
        const toolInput = output.args ?? {};

        // Handle subagent (Task tool)
        if (toolName === "Task") {
          const subagentType = (toolInput as Record<string, unknown>).subagent_type as string ?? "unknown";
          const taskDescription = (toolInput as Record<string, unknown>).description as string ?? "";
          const subagentResult = await handleSubagentStart(ctx, subagentType, taskDescription);
          if (subagentResult.blocked) {
            output.args = { _blocked: true, _reason: subagentResult.blockReason };
            return;
          }
        }

        const result = await handlePreToolUse(ctx, toolName, toolInput);
        if (result.blocked) {
          output.args = { _blocked: true, _reason: result.blockReason };
          return;
        }
        if (result.updatedInput) {
          output.args = { ...toolInput, ...result.updatedInput };
        }
      } catch (err) {
        // ignore
      }
    },

    "tool.execute.after": async (hookInput, output) => {
      try {
        const { tool: toolName, sessionID } = hookInput;
        const ctx = sessionContexts.get(sessionID);
        if (!ctx) return;

        // Handle subagent (Task tool)
        if (toolName === "Task") {
          await handleSubagentStop(ctx, "unknown", "", output.output);
        }

        const isError = output.title?.toLowerCase().includes("error") ||
                        output.output?.toLowerCase().startsWith("error");
        if (isError) {
          await handlePostToolUseFailure(ctx, toolName, {}, output.output);
        } else {
          await handlePostToolUse(ctx, toolName, {}, output.output);
        }
      } catch (err) {
        // ignore
      }
    },

    "permission.ask": async (hookInput, output) => {
      try {
        const sessionID = (hookInput as unknown as { sessionID?: string }).sessionID ?? "unknown";
        const ctx = getOrCreateContext(sessionID, projectDir);
        const toolName = (hookInput as unknown as { tool?: string }).tool ?? "unknown";
        const toolArgs = (hookInput as unknown as { args?: Record<string, unknown> }).args ?? {};
        const permissionType = (hookInput as unknown as { permission?: string }).permission ?? "unknown";

        const result = await handlePermissionRequest(ctx, toolName, toolArgs, permissionType);
        if (result.permissionDecision === "allow") {
          output.status = "allow";
        } else if (result.permissionDecision === "deny") {
          output.status = "deny";
        }
      } catch (err) {
        // ignore
      }
    },

    "experimental.session.compacting": async (hookInput, output) => {
      try {
        const { sessionID } = hookInput;
        const ctx = sessionContexts.get(sessionID);
        if (!ctx) return;

        const result = await handlePreCompact(ctx);
        if (result.additionalContext?.length) {
          output.context.push(...result.additionalContext);
        }
      } catch (err) {
        // ignore
      }
    },
  };
};

export default ClaudeCodeHooksPlugin;
