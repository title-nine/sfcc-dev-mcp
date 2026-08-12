import { GenericToolSpec, ToolExecutionContext, ToolArguments, HandlerError } from '../core/handlers/base-handler.js';
import { OCAPICodeVersionsClient } from '../clients/ocapi/code-versions-client.js';

export const CODE_VERSION_TOOL_NAMES = [
  'get_code_versions',
  'activate_code_version',
] as const;

export type CodeVersionToolName = typeof CODE_VERSION_TOOL_NAMES[number];
export const CODE_VERSION_TOOL_NAMES_SET = new Set<CodeVersionToolName>(CODE_VERSION_TOOL_NAMES);

/**
 * Configuration for code version tools
 * Maps each tool to its validation, execution, and messaging logic
 */
export const CODE_VERSION_TOOL_CONFIG: Record<CodeVersionToolName, GenericToolSpec<ToolArguments, unknown>> = {
  get_code_versions: {
    exec: async (_args: ToolArguments, context: ToolExecutionContext) => {
      const client = context.codeVersionsClient as OCAPICodeVersionsClient;
      return client.getCodeVersions();
    },
    logMessage: (_args: ToolArguments) => 'Get code versions',
  },

  activate_code_version: {
    validate: (args: ToolArguments, toolName: string) => {
      if (args.confirm !== true) {
        throw new HandlerError(
          'Activating a code version is a deployment-affecting change and requires explicit user confirmation. Ask the user first, then retry with confirm=true.',
          toolName,
          'CONFIRMATION_REQUIRED',
          { field: 'confirm', expected: true, actual: args.confirm },
        );
      }
    },
    exec: async (args: ToolArguments, context: ToolExecutionContext) => {
      const client = context.codeVersionsClient as OCAPICodeVersionsClient;
      return client.activateCodeVersion(args.codeVersionId as string);
    },
    logMessage: (args: ToolArguments) => `Activate code version ${args?.codeVersionId}`,
  },
};
