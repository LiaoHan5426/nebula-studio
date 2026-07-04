import Mustache from 'mustache';
import { getTemplateContent, registerTemplate } from '../templates';

export type SQLPromptParams = {
  dbType: string;
  schema: string;
};

const BUILT_IN_TEMPLATE_NAME = 'sql-system';

export async function buildSQLPrompt(
  promptsDir: string = '',
  params: SQLPromptParams,
): Promise<string> {
  let template = await tryLoadFromFile(promptsDir);

  if (!template) {
    const content = getTemplateContent(BUILT_IN_TEMPLATE_NAME);
    template = content ?? null;
  }

  if (!template) {
    throw new Error('SQL system prompt template not found');
  }

  return Mustache.render(template, {
    dbType: params.dbType,
    schema: params.schema,
  });
}

async function tryLoadFromFile(promptsDir: string): Promise<string | null> {
  if (!promptsDir) {
    return null;
  }

  const templatePath = `${promptsDir}/system.md`;

  try {
    if (isElectronEnvironment()) {
      return await loadFromElectron(templatePath);
    } else {
      return await loadFromWeb(templatePath);
    }
  } catch {
    return null;
  }
}

function isElectronEnvironment(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  const windowWithHost = window as unknown as {
    __NEBULA_PRESENTATION_HOST__?: string;
  };
  const host = windowWithHost['__NEBULA_PRESENTATION_HOST__'];
  return host !== 'web';
}

async function loadFromWeb(templatePath: string): Promise<string | null> {
  try {
    const url = new URL(templatePath, import.meta.url);
    const response = await fetch(url);
    if (response.ok) {
      const content = await response.text();
      registerTemplate({
        name: BUILT_IN_TEMPLATE_NAME,
        content,
        description: 'Loaded from web',
      });
      return content;
    }
    return null;
  } catch {
    return null;
  }
}

async function loadFromElectron(templatePath: string): Promise<string | null> {
  try {
    const windowWithElectron = window as unknown as {
      electron?: {
        ipcRenderer: {
          invoke: (channel: string, ...args: unknown[]) => Promise<string>;
        };
      };
    };
    const { ipcRenderer } = windowWithElectron.electron || {};

    if (!ipcRenderer) {
      throw new Error('ipcRenderer not available');
    }

    const content = await ipcRenderer.invoke('shell:read-file', templatePath);
    registerTemplate({
      name: BUILT_IN_TEMPLATE_NAME,
      content,
      description: 'Loaded from electron',
    });
    return content;
  } catch {
    if (typeof process !== 'undefined' && process.versions?.node) {
      try {
        const fs = await import('fs');
        const content = fs.readFileSync(templatePath, 'utf-8');
        registerTemplate({
          name: BUILT_IN_TEMPLATE_NAME,
          content,
          description: 'Loaded from fs',
        });
        return content;
      } catch {
        return null;
      }
    }
    return null;
  }
}

export { BUILT_IN_TEMPLATE_NAME };
