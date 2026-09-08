import type { UserConfig } from '@commitlint/types';

import conventional from '@commitlint/config-conventional';
const userConfig: UserConfig = {
  ...conventional,
  rules: {
    ...conventional.rules,
    'header-max-length': [2, 'always', 100],
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert',
      ],
    ],
    'scope-case': [1, 'always', 'lower-case'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
  },
};

export default userConfig;
