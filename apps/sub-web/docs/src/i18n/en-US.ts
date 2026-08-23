import type { MessageTree } from '@nebula-studio/i18n';

const enUS: MessageTree = {
  shell: {
    brand: 'Nebula Studio',
    nav: 'Docs navigation',
    help: 'Product help',
    reference: 'Developer reference',
    design: 'Design',
    search: 'Search help and reference',
    searchAria: 'Search documentation',
    noMatch: 'No matching documents',
    productHelp: 'Product help',
    guide: 'Guides',
    components: 'Components',
    patterns: 'Patterns',
    support: 'Support',
    troubleshooting: 'Troubleshooting',
    guidelines: 'Component guidelines',
    examples: 'Component examples',
  },
  category: {
    help: 'Product help',
    reference: 'Developer reference',
    guide: 'Guides',
    patterns: 'Patterns',
    design: 'Design catalog',
    components: 'Primitives',
  },
  design: {
    tokens: {
      title: 'Tokens',
      description:
        'Foundation and semantic tokens. Changing accent must not move success, warning, or danger.',
      foundation: 'Foundation',
      semantic: 'Semantic',
      status: 'Status',
      accent: 'Accent',
      statusHint:
        'Status colors stay independent of the brand accent for success, warning, and danger.',
      accentHint: 'Accent only affects brand variables such as action-primary.',
    },
    theme: {
      title: 'Theme matrix',
      description:
        'Light / dark / system, preset and custom accents, density, and contrast.',
      scheme: 'Color scheme',
      accent: 'Accent',
      density: 'Density',
      contrast: 'Contrast',
      preview: 'Preview surface',
      standaloneHint:
        'Standalone calls applyResolvedTheme. Inside Host, use theme.setPreference.',
    },
    patterns: {
      title: 'Patterns',
      description:
        'PageHeader, FilterBar, EntityList sketch, and Empty / Error / Forbidden.',
      header: 'PageHeader',
      filter: 'FilterBar',
      list: 'EntityList',
      empty: 'Empty',
      error: 'Error',
      forbidden: 'Forbidden',
      emptyTitle: 'No matching results',
      emptyBody: 'Try a different filter.',
      errorTitle: 'Could not load the list',
      errorBody: 'Retry later or contact an administrator.',
      forbiddenTitle: 'Access denied',
      forbiddenBody: 'Your current role cannot view this resource.',
    },
  },
};

export default enUS;
