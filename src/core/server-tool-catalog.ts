import {
  AGENT_INSTRUCTION_TOOLS,
  CARTRIDGE_GENERATION_TOOLS,
  CODE_VERSION_TOOLS,
  ISML_DOCUMENTATION_TOOLS,
  JOB_LOG_TOOLS,
  LOG_TOOLS,
  SCRIPT_DEBUGGER_TOOLS,
  SFCC_DOCUMENTATION_TOOLS,
  SFRA_DOCUMENTATION_TOOLS,
  SYSTEM_OBJECT_TOOLS,
} from './tool-definitions.js';

export type LogCapabilityState = 'available' | 'unavailable' | 'unknown';

export type ToolDefinition = {
  name: string;
  description: string;
  inputSchema: unknown;
};

export type ToolNameSets = {
  alwaysAvailable: Set<string>;
  logCapability: Set<string>;
  scriptDebuggerCapability: Set<string>;
  ocapiCapability: Set<string>;
};

export const ALWAYS_AVAILABLE_TOOLS: ToolDefinition[] = [
  ...AGENT_INSTRUCTION_TOOLS,
  ...SFCC_DOCUMENTATION_TOOLS,
  ...SFRA_DOCUMENTATION_TOOLS,
  ...ISML_DOCUMENTATION_TOOLS,
  ...CARTRIDGE_GENERATION_TOOLS,
];

export const LOG_CAPABILITY_TOOLS: ToolDefinition[] = [
  ...LOG_TOOLS,
  ...JOB_LOG_TOOLS,
];

/**
 * Script debugger tools are gated behind log capability AND an explicit
 * opt-in (script debugger enabled). They execute arbitrary code on the
 * SFCC instance, so they are separated from log tools to allow a
 * hard kill switch via config (disableScriptDebugger).
 */
export const SCRIPT_DEBUGGER_CAPABILITY_TOOLS: ToolDefinition[] = [
  ...SCRIPT_DEBUGGER_TOOLS,
];

export const OCAPI_CAPABILITY_TOOLS: ToolDefinition[] = [
  ...SYSTEM_OBJECT_TOOLS,
  ...CODE_VERSION_TOOLS,
];

export const ALL_TOOL_DEFINITIONS: ToolDefinition[] = [
  ...ALWAYS_AVAILABLE_TOOLS,
  ...LOG_CAPABILITY_TOOLS,
  ...SCRIPT_DEBUGGER_CAPABILITY_TOOLS,
  ...OCAPI_CAPABILITY_TOOLS,
];

export function createToolNameSets(): ToolNameSets {
  return {
    alwaysAvailable: new Set(ALWAYS_AVAILABLE_TOOLS.map((tool) => tool.name)),
    logCapability: new Set(LOG_CAPABILITY_TOOLS.map((tool) => tool.name)),
    scriptDebuggerCapability: new Set(SCRIPT_DEBUGGER_CAPABILITY_TOOLS.map((tool) => tool.name)),
    ocapiCapability: new Set(OCAPI_CAPABILITY_TOOLS.map((tool) => tool.name)),
  };
}

export function getAvailableTools(
  logCapabilityState: LogCapabilityState,
  canAccessOCAPI: boolean,
  canUseScriptDebugger: boolean,
): ToolDefinition[] {
  const tools: ToolDefinition[] = [...ALWAYS_AVAILABLE_TOOLS];

  if (logCapabilityState === 'available') {
    tools.push(...LOG_CAPABILITY_TOOLS);
  }

  if (logCapabilityState === 'available' && canUseScriptDebugger) {
    tools.push(...SCRIPT_DEBUGGER_CAPABILITY_TOOLS);
  }

  if (canAccessOCAPI) {
    tools.push(...OCAPI_CAPABILITY_TOOLS);
  }

  return tools;
}

export function isToolAvailable(
  toolName: string,
  logCapabilityState: LogCapabilityState,
  canAccessOCAPI: boolean,
  canUseScriptDebugger: boolean,
  toolNames: ToolNameSets,
): boolean {
  if (toolNames.alwaysAvailable.has(toolName)) {
    return true;
  }

  if (toolNames.logCapability.has(toolName)) {
    return logCapabilityState === 'available';
  }

  if (toolNames.scriptDebuggerCapability.has(toolName)) {
    return logCapabilityState === 'available' && canUseScriptDebugger;
  }

  if (toolNames.ocapiCapability.has(toolName)) {
    return canAccessOCAPI;
  }

  return false;
}
