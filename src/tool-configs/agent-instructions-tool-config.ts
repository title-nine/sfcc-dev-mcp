import { GenericToolSpec, ToolArguments, HandlerError } from '../core/handlers/base-handler.js';
import { AgentInstructionsClient } from '../clients/agent-instructions-client.js';
import { InstructionAdvisor } from '../core/instruction-advisor.js';

export const AGENT_INSTRUCTION_TOOL_NAMES = [
  'sync_agent_instructions',
  'disable_agent_sync',
] as const;

export type AgentInstructionToolName = typeof AGENT_INSTRUCTION_TOOL_NAMES[number];
export const AGENT_INSTRUCTION_TOOL_NAMES_SET = new Set<AgentInstructionToolName>(AGENT_INSTRUCTION_TOOL_NAMES);

export const AGENT_INSTRUCTION_TOOL_CONFIG: Record<
  AgentInstructionToolName,
  GenericToolSpec<ToolArguments, unknown>
> = {
  sync_agent_instructions: {
    validate: (args: ToolArguments, toolName: string) => {
      const destinationType = args.destinationType ?? 'project';
      const dryRun = args.dryRun ?? true;
      const writesOutsideWorkspace =
        (destinationType === 'user' || destinationType === 'temp') && dryRun !== true;

      if (writesOutsideWorkspace && args.confirm !== true) {
        throw new HandlerError(
          'Installing agent instructions outside the current workspace (user home or temp directory) writes files outside your project and requires explicit user confirmation. Ask the user first, then retry with confirm=true.',
          toolName,
          'CONFIRMATION_REQUIRED',
          { field: 'confirm', destinationType, dryRun },
        );
      }
    },
    exec: async (args: ToolArguments, context) => {
      const client = context.agentInstructionsClient as AgentInstructionsClient;
      return client.syncInstructions({
        destinationType: args.destinationType as 'project' | 'user' | 'temp' | undefined,
        preferredRoot: args.preferredRoot as string | undefined,
        skillsDir: args.skillsDir as string | undefined,
        mergeStrategy: args.mergeStrategy as 'append' | 'replace' | 'skip' | undefined,
        includeAgents: args.includeAgents as boolean | undefined,
        includeSkills: args.includeSkills as boolean | undefined,
        installMissingOnly: args.installMissingOnly as boolean | undefined,
        dryRun: args.dryRun as boolean | undefined,
        tempDir: args.tempDir as string | undefined,
      });
    },
    logMessage: (args: ToolArguments) => `Sync agent instructions (${args.destinationType ?? 'project'})`,
  },
  disable_agent_sync: {
    exec: async (args: ToolArguments, context) => {
      const client = context.agentInstructionsClient as AgentInstructionsClient;
      const advisor = context.instructionAdvisor as InstructionAdvisor;

      // Get workspace root from client status
      const status = await client.getStatus(args.preferredRoot as string | undefined);
      if (!status.workspaceRoot) {
        return {
          success: false,
          message: 'Cannot disable agent sync: no workspace root found. Provide preferredRoot parameter.',
        };
      }

      return advisor.disableAgentSync(status.workspaceRoot);
    },
    logMessage: () => 'Disable agent sync suggestions',
  },
};
