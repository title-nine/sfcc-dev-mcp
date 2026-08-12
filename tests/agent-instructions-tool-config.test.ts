import { AGENT_INSTRUCTION_TOOL_CONFIG } from '../src/tool-configs/agent-instructions-tool-config.js';

const validate = AGENT_INSTRUCTION_TOOL_CONFIG.sync_agent_instructions.validate!;

describe('sync_agent_instructions confirmation gate', () => {
  it('requires confirm=true when writing to the user home directory', () => {
    expect(() => validate({ destinationType: 'user', dryRun: false }, 'sync_agent_instructions'))
      .toThrow(/requires explicit user confirmation/);
  });

  it('requires confirm=true when writing to a temp directory', () => {
    expect(() => validate({ destinationType: 'temp', dryRun: false }, 'sync_agent_instructions'))
      .toThrow(/requires explicit user confirmation/);
  });

  it('rejects confirm=false for home-directory writes', () => {
    let code: string | undefined;
    try {
      validate({ destinationType: 'user', dryRun: false, confirm: false }, 'sync_agent_instructions');
    } catch (error) {
      code = (error as { code?: string }).code;
    }
    expect(code).toBe('CONFIRMATION_REQUIRED');
  });

  it('allows confirm=true for home-directory writes', () => {
    expect(() => validate({ destinationType: 'user', dryRun: false, confirm: true }, 'sync_agent_instructions'))
      .not.toThrow();
  });

  it('allows confirm=true for temp-directory writes', () => {
    expect(() => validate({ destinationType: 'temp', dryRun: false, confirm: true }, 'sync_agent_instructions'))
      .not.toThrow();
  });

  it('allows dry-run planning without confirmation', () => {
    expect(() => validate({ destinationType: 'user', dryRun: true }, 'sync_agent_instructions'))
      .not.toThrow();
    expect(() => validate({ destinationType: 'temp', dryRun: true }, 'sync_agent_instructions'))
      .not.toThrow();
  });

  it('allows project writes without confirmation', () => {
    expect(() => validate({ destinationType: 'project', dryRun: false }, 'sync_agent_instructions'))
      .not.toThrow();
  });

  it('allows default arguments (project destination, dry run)', () => {
    expect(() => validate({}, 'sync_agent_instructions')).not.toThrow();
  });
});
