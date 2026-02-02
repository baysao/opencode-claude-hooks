/**
 * Tool name pattern matching utilities
 *
 * Supports Claude Code matcher patterns:
 * - Empty string or "*": matches all tools
 * - Simple string: "Write" matches exactly "Write"
 * - Regex pattern: "Edit|Write" matches "Edit" or "Write"
 */

/**
 * Check if a tool name matches a pattern
 */
export function matchTool(toolName: string, pattern: string | undefined): boolean {
  // Empty pattern or wildcard matches everything
  if (!pattern || pattern === "*" || pattern === "") {
    return true;
  }

  // Create regex from pattern and test against tool name
  try {
    const regex = new RegExp(`^(${pattern})$`);
    return regex.test(toolName);
  } catch {
    // If pattern is invalid regex, fall back to exact match
    return toolName === pattern;
  }
}

/**
 * Check if any pattern in an array matches the tool name
 */
export function matchToolAny(toolName: string, patterns: (string | undefined)[]): boolean {
  return patterns.some((pattern) => matchTool(toolName, pattern));
}

/**
 * Filter hook configs that match a given tool name
 */
export function filterMatchingConfigs<T extends { matcher?: string }>(
  configs: T[],
  toolName: string
): T[] {
  return configs.filter((config) => matchTool(toolName, config.matcher));
}
