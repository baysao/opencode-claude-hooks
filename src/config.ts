import { existsSync } from "fs";
import { readFile } from "fs/promises";
import { homedir } from "os";
import { join } from "path";
import {
  type ClaudeHookEvent,
  type HookConfig,
  type HooksSettings,
  HooksSettingsSchema,
} from "./types";

export interface ConfigPaths {
  claudeProjectLocal: string;
  claudeProject: string;
  claudeGlobal: string;
  opencodeProject: string;
  opencodeGlobal: string;
}

/**
 * Get all configuration file paths
 */
export function getConfigPaths(projectDir: string): ConfigPaths {
  const home = homedir();
  // Ensure projectDir is a valid string
  const dir = typeof projectDir === "string" && projectDir ? projectDir : process.cwd();
  return {
    // Claude Code locations (highest to lowest priority)
    claudeProjectLocal: join(dir, ".claude", "settings.local.json"),
    claudeProject: join(dir, ".claude", "settings.json"),
    claudeGlobal: join(home, ".claude", "settings.json"),
    // OpenCode locations
    opencodeProject: join(dir, ".opencode", "hooks.json"),
    opencodeGlobal: join(home, ".config", "opencode", "hooks.json"),
  };
}

/**
 * Load and parse a single config file
 */
async function loadConfigFile(path: string): Promise<HooksSettings | null> {
  if (!existsSync(path)) {
    return null;
  }

  try {
    const content = await readFile(path, "utf-8");
    const json = JSON.parse(content);

    // Validate with zod schema
    const result = HooksSettingsSchema.safeParse(json);
    if (result.success) {
      return result.data;
    }

    console.warn(`Invalid hooks config in ${path}:`, result.error.message);
    return null;
  } catch (error) {
    console.warn(`Failed to load config from ${path}:`, error);
    return null;
  }
}

/**
 * Merge multiple hook configs, with earlier configs taking precedence
 * for the same event type and matcher combination
 */
function mergeHooksSettings(configs: HooksSettings[]): HooksSettings {
  const merged: HooksSettings = { hooks: {} };

  // Process configs in reverse order so earlier configs override later ones
  for (const config of configs.reverse()) {
    if (!config.hooks) continue;

    for (const [eventName, hookConfigs] of Object.entries(config.hooks) as [string, HookConfig[]][]) {
      if (!merged.hooks[eventName]) {
        merged.hooks[eventName] = [];
      }
      merged.hooks[eventName].push(...hookConfigs);
    }
  }

  return merged;
}

/**
 * Load hooks configuration from all supported paths
 */
export async function loadHooksConfig(projectDir: string): Promise<HooksSettings> {
  const paths = getConfigPaths(projectDir);

  // Load all configs in parallel
  const [
    claudeProjectLocal,
    claudeProject,
    claudeGlobal,
    opencodeProject,
    opencodeGlobal,
  ] = await Promise.all([
    loadConfigFile(paths.claudeProjectLocal),
    loadConfigFile(paths.claudeProject),
    loadConfigFile(paths.claudeGlobal),
    loadConfigFile(paths.opencodeProject),
    loadConfigFile(paths.opencodeGlobal),
  ]);

  // Filter out nulls and merge in priority order
  const configs = [
    claudeProjectLocal,
    claudeProject,
    claudeGlobal,
    opencodeProject,
    opencodeGlobal,
  ].filter((c): c is HooksSettings => c !== null);

  return mergeHooksSettings(configs);
}

/**
 * Get hook configs for a specific event type
 */
export function getHooksForEvent(
  settings: HooksSettings,
  event: ClaudeHookEvent
): HookConfig[] {
  const hooks = settings?.hooks?.[event];
  return Array.isArray(hooks) ? hooks : [];
}

// Singleton config instance for the plugin
let cachedConfig: HooksSettings | null = null;
let cachedProjectDir: string | null = null;

/**
 * Get or load the hooks configuration (cached)
 */
export async function getHooksConfig(projectDir: string): Promise<HooksSettings> {
  if (cachedConfig && cachedProjectDir === projectDir) {
    return cachedConfig;
  }

  cachedConfig = await loadHooksConfig(projectDir);
  cachedProjectDir = projectDir;
  return cachedConfig;
}

/**
 * Clear the cached configuration (useful for testing or config reload)
 */
export function clearConfigCache(): void {
  cachedConfig = null;
  cachedProjectDir = null;
}
