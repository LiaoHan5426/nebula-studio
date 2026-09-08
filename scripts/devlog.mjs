#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

function parseArgs(values) {
  const result = { lang: 'zh-CN' };
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (value === '--') continue;
    if (value === '--write') result.write = true;
    else if (value === '--lang') result.lang = values[++index];
    else if (value === '--output') result.output = values[++index];
    else if (value === '--since') result.since = values[++index];
    else if (value === '--until') result.until = values[++index];
    else if (value === '--from') result.from = values[++index];
    else if (value === '--to') result.to = values[++index];
    else if (value === '--all') result.all = true;
    else if (value === '--period') result.period = values[++index];
    else if (value === '--week' && values[++index] === 'current')
      result.week = 'current';
    else throw new Error(`Unknown argument: ${value}`);
  }
  if (!['zh-CN', 'en-US', 'zh', 'en', 'bilingual'].includes(result.lang)) {
    throw new Error('--lang must be zh, en, or bilingual');
  }
  if (result.lang === 'zh') result.lang = 'zh-CN';
  if (result.lang === 'en') result.lang = 'en-US';
  if (
    result.period &&
    !['month', 'week', 'day', 'none'].includes(result.period)
  )
    throw new Error('--period must be month, week, day, or none');
  return result;
}

function resolveRange(options) {
  if (options.all) {
    const roots = execFileSync('git', ['rev-list', '--max-parents=0', 'HEAD'], {
      encoding: 'utf8',
    }).trim();
    if (!roots)
      throw new Error(
        '无法找到仓库根提交；请确认当前目录是完整 Git 仓库，而不是空仓库或不完整浅克隆。',
      );
    const root = roots.split(/\r?\n/)[0];
    return `${root} HEAD`;
  }
  if (options.from || options.to)
    return `${options.from ?? 'HEAD'}..${options.to ?? 'HEAD'}`;
  if (options.week === 'current') return '--since=1 week ago';
  if (options.since || options.until) {
    return [
      options.since && `--since=${options.since}`,
      options.until && `--until=${options.until}`,
    ]
      .filter(Boolean)
      .join(' ');
  }
  return '--since=7 days ago';
}

function readCommits(range) {
  const format = '%H%x1f%an%x1f%ad%x1f%s%x1e';
  const output = execFileSync(
    'git',
    ['log', '--date=short', `--format=${format}`, ...range.split(' ')],
    {
      encoding: 'utf8',
    },
  );
  return output
    .split('\x1e')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const [sha, author, date, subject] = item.split('\x1f');
      return { sha, author, date, subject };
    });
}

function isNoiseCommit(commit) {
  return (
    /^(merge|revert)\b/i.test(commit.subject) ||
    /^chore\(release\)/i.test(commit.subject)
  );
}

function toRecord(commit) {
  const match = commit.subject.match(/^([a-z]+)(?:\(([^)]+)\))?!?:\s*(.+)$/i);
  const paths = changedPaths(commit.sha);
  const scope = match?.[2] ?? 'workspace';
  const title = match?.[3] ?? commit.subject;
  const type = match?.[1]?.toLowerCase() ?? inferType(title, paths);
  return {
    ...commit,
    type,
    scope: inferScope(scope, paths),
    title,
    paths,
    language: detectLanguage(title),
  };
}

function inferType(subject, paths) {
  const value = subject.toLowerCase();
  if (/(修复|fix|bug|错误|异常|问题)/i.test(value)) return 'fix';
  if (/(重构|refactor|迁移|拆分|替换)/i.test(value)) return 'refactor';
  if (
    /(测试|test|验收|spec)/i.test(value) ||
    paths.some((path) => /(^|\/)(test|tests|e2e)(\/|\.)/i.test(path))
  )
    return 'test';
  if (
    /(文档|documentation|readme|docs)/i.test(value) ||
    paths.some((path) => /(^|\/)(docs?|README)/i.test(path))
  )
    return 'docs';
  if (
    /(依赖|dependency|dependencies|构建|build|配置|config|lint|format|格式化)/i.test(
      value,
    )
  )
    return 'build';
  if (/(新增|添加|实现|支持|add|implement|support|feature)/i.test(value))
    return 'feat';
  if (
    /(优化|性能|清理|更新|调整|改进|update|improve|cleanup|优化)/i.test(value)
  )
    return 'chore';
  return 'other';
}

function changedPaths(sha) {
  return execFileSync('git', ['show', '--format=', '--name-only', sha], {
    encoding: 'utf8',
  })
    .split(/\r?\n/)
    .map((path) => path.trim())
    .filter(Boolean);
}

function inferScope(explicitScope, paths) {
  if (explicitScope !== 'workspace') return explicitScope;
  const roots = new Map([
    ['apps/sub-web/docs', 'docs'],
    ['apps/sub-web/settings', 'settings'],
    ['apps/sub-web/integration', 'integration'],
    ['apps/web', 'web-host'],
    ['apps/electron', 'electron'],
    ['internal/build-kit', 'build-kit'],
    ['internal/node-kit', 'node-kit'],
    ['packages/ui/nebula-assembly', 'assembly'],
    ['packages/ui', 'ui'],
    ['packages/platform', 'platform'],
    ['packages/core', 'core'],
    ['scripts', 'tooling'],
    ['configs', 'configuration'],
  ]);
  const matches = [...roots.entries()].filter(([root]) =>
    paths.some((path) => path === root || path.startsWith(`${root}/`)),
  );
  if (matches.length === 1) return matches[0][1];
  if (matches.length > 1) return 'cross-cutting';
  return paths.length ? paths[0].split('/')[0] : explicitScope;
}

function detectLanguage(value) {
  return /[\u3400-\u9fff]/.test(value) ? 'zh' : 'en';
}

const category = {
  feat: ['功能开发', 'Features'],
  fix: ['缺陷修复', 'Fixes'],
  refactor: ['架构与重构', 'Refactoring'],
  perf: ['性能优化', 'Performance'],
  test: ['测试与质量', 'Tests & quality'],
  docs: ['文档', 'Documentation'],
  build: ['构建与依赖', 'Build & dependencies'],
  ci: ['持续集成', 'CI'],
  chore: ['工程维护', 'Maintenance'],
  other: ['其他', 'Other'],
};

const glossary = new Map([
  ['修复', 'fix'],
  ['优化', 'improve'],
  ['新增', 'add'],
  ['支持', 'support'],
  ['更新', 'update'],
  ['重构', 'refactor'],
  ['配置', 'configuration'],
  ['文档', 'documentation'],
  ['测试', 'test'],
  ['组件', 'component'],
  ['依赖', 'dependency'],
  ['启动', 'startup'],
  ['地址', 'endpoint'],
]);

function translate(title) {
  let result = title;
  for (const [source, target] of glossary)
    result = result.replaceAll(source, target);
  return result === title && detectLanguage(title) === 'zh'
    ? `${title} (translation pending)`
    : result;
}

function translateToChinese(title) {
  if (detectLanguage(title) === 'zh') return title;
  return `英文原文：${title}`;
}

function render(records, range, language, periodMode = 'month') {
  const english = language === 'en-US';
  const title = english
    ? 'Nebula Studio Development Record'
    : 'Nebula Studio 开发记录';
  const empty = english ? 'No changes in this period.' : '本周期无可记录变更。';
  const lines = [
    `# ${title}`,
    '',
    `> Range: \`${range}\``,
    '',
    english ? '## Summary' : '## 摘要',
    '',
  ];
  const changesets = createVirtualChangesets(records);
  if (changesets.length) {
    lines.push(
      english ? '### Changeset-style summary' : '### Changeset 风格总结',
      '',
    );
    for (const changeset of changesets) {
      const summary = english
        ? changeset.summary
        : `自动归纳：${changeset.summary}`;
      lines.push(
        `- ${summary} (${changeset.scope}, ${changeset.count} ${changeset.count === 1 ? (english ? 'commit' : '提交') : english ? 'commits' : '提交'})`,
      );
    }
    lines.push('');
  }
  if (records.length) {
    const typeSummary = [...groupBy(records, (record) => record.type)]
      .map(
        ([type, entries]) =>
          `${category[type]?.[english ? 1 : 0] ?? type}: ${entries.length}`,
      )
      .join(english ? ', ' : '、');
    const scopeSummary = [...groupBy(records, (record) => record.scope)]
      .toSorted((a, b) => b[1].length - a[1].length)
      .slice(0, 8)
      .map(([scope, entries]) => `${scope}: ${entries.length}`)
      .join(english ? ', ' : '、');
    lines.push(
      `${english ? 'Recorded commits' : '记录提交数'}: ${records.length}`,
      '',
      english
        ? `Changes by category: ${typeSummary}`
        : `按类型统计：${typeSummary}`,
      '',
      english
        ? `Most affected modules: ${scopeSummary}`
        : `主要受影响模块：${scopeSummary}`,
      '',
    );
  } else {
    lines.push(empty, '');
  }
  const periods =
    periodMode === 'none'
      ? [['all', records]]
      : groupBy(records, (record) => periodKey(record.date, periodMode));
  for (const [period, periodRecords] of periods) {
    if (periodMode !== 'none')
      lines.push(`## ${english ? 'Period' : '周期'}: ${period}`, '');
    for (const [type, entries] of groupBy(
      periodRecords,
      (record) => record.type,
    )) {
      const heading =
        category[type]?.[english ? 1 : 0] ?? category.other[english ? 1 : 0];
      lines.push(`### ${heading}`, '');
      for (const record of entries) {
        const renderedTitle = english
          ? record.language === 'en'
            ? record.title
            : translate(record.title)
          : translateToChinese(record.title);
        lines.push(
          `- **${record.scope}** ${renderedTitle} — ${record.date} — commit \`${record.sha.slice(0, 7)}\``,
        );
      }
      lines.push('');
    }
  }
  lines.push(
    english ? '## Source note' : '## 来源说明',
    '',
    english
      ? 'Generated deterministically from Git history. Names, paths, SHAs and links are preserved.'
      : '本记录由 Git 历史确定性生成，名称、路径、SHA 和链接保持原样。',
  );
  return lines.join('\n');
}

function createVirtualChangesets(records) {
  return [
    ...groupBy(records, (record) => `${record.type}:${record.scope}`),
  ].map(([key, entries]) => {
    const [type, scope] = key.split(':');
    const summary =
      entries.length === 1
        ? entries[0].title
        : `${category[type]?.[0] ?? '其他'}：${entries.length} 项变更`;
    return { scope, count: entries.length, summary };
  });
}

function periodKey(date, mode) {
  if (mode === 'day') return date;
  if (mode === 'week') {
    const value = new Date(`${date}T00:00:00Z`);
    const day = value.getUTCDay() || 7;
    value.setUTCDate(value.getUTCDate() - day + 1);
    return value.toISOString().slice(0, 10);
  }
  return date.slice(0, 7);
}

function groupBy(values, key) {
  const groups = new Map();
  for (const value of values) {
    const group = key(value);
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push(value);
  }
  return groups;
}

function defaultOutput(range, language) {
  const suffix = language === 'bilingual' ? 'bilingual' : language;
  return join('docs', 'development-records', `generated-${suffix}.md`);
}

const args = parseArgs(process.argv.slice(2));
const range = resolveRange(args);
const commits = readCommits(range);
const records = commits
  .filter((commit) => !isNoiseCommit(commit))
  .map(toRecord);
const languages =
  args.lang === 'bilingual' ? ['zh-CN', 'en-US'] : [args.lang ?? 'zh-CN'];
const periodMode = args.period ?? (args.all ? 'month' : 'none');
const rendered = new Map(
  languages.map((language) => [
    language,
    render(records, range, language, periodMode),
  ]),
);
const markdown = [...rendered.values()].join('\n\n---\n\n');

if (args.write) {
  const outputs =
    args.output && args.lang !== 'bilingual'
      ? [[args.output, markdown]]
      : args.lang === 'bilingual'
        ? languages.map((language) => [
            defaultOutput(range, language),
            rendered.get(language),
          ])
        : [
            [
              args.output ?? defaultOutput(range, args.lang ?? 'zh-CN'),
              markdown,
            ],
          ];
  for (const [output, content] of outputs) {
    mkdirSync(dirname(output), { recursive: true });
    writeFileSync(output, `${content.trim()}\n`, 'utf8');
    process.stdout.write(`Generated ${output}\n`);
  }
} else {
  process.stdout.write(`${markdown.trim()}\n`);
}
