/**
 * Code Version Tool Schemas
 */

export const CODE_VERSION_TOOLS = [
  {
    name: 'get_code_versions',
    description: 'List all code versions on the SFCC instance. Use for deployment management, identifying active version, or preparing code-switch fixes.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'activate_code_version',
    description: `Activate a code version (deactivates current). Use for code-switch fixes, SCAPI endpoint issues, or deployment conflicts. Only inactive versions can be activated.

IMPORTANT: Activating a code version is a deployment-affecting change. ALWAYS ASK THE USER for explicit confirmation before calling this tool, and only pass confirm=true after the user has explicitly agreed. If the user declines, do NOT call this tool.`,
    inputSchema: {
      type: 'object',
      properties: {
        codeVersionId: {
          type: 'string',
          minLength: 1,
          description: 'ID of the inactive code version to activate.',
        },
        confirm: {
          type: 'boolean',
          description: 'Must be true. Explicit user confirmation that the code version should be activated.',
        },
      },
      required: ['codeVersionId', 'confirm'],
    },
  },
];
