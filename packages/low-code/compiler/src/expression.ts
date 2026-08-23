import type { LowCodeRuntimeContext } from '@nebula-studio/low-code-contract';

export class LowCodeExpressionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LowCodeExpressionError';
  }
}

const MAX_LENGTH = 256;
const MAX_NODES = 64;
const FORBIDDEN = new Set([
  '__proto__',
  'arguments',
  'constructor',
  'document',
  'eval',
  'function',
  'globalthis',
  'import',
  'process',
  'prototype',
  'require',
  'self',
  'window',
]);

type Expr =
  | { argument: Expr; kind: 'unary'; op: '!' | '-'; }
  | { key: string; kind: 'member'; object: Expr; }
  | {
      kind: 'binary';
      left: Expr;
      op:
        | '!='
        | '&&'
        | '*'
        | '+'
        | '-'
        | '/'
        | '<'
        | '<='
        | '=='
        | '>'
        | '>='
        | '||';
      right: Expr;
    }
  | { kind: 'bool'; value: boolean }
  | { kind: 'ident'; name: string }
  | { kind: 'num'; value: number }
  | { kind: 'str'; value: string };

type Token =
  | { type: 'bool'; value: boolean }
  | { type: 'ident'; value: string }
  | { type: 'num'; value: number }
  | { type: 'op'; value: string }
  | { type: 'str'; value: string };

function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;
  while (index < source.length) {
    const char = source[index] ?? '';
    if (/\s/.test(char)) {
      index += 1;
      continue;
    }
    if (char === '"' || char === "'") {
      const quote = char;
      index += 1;
      let value = '';
      while (index < source.length && source[index] !== quote) {
        value += source[index];
        index += 1;
      }
      if (source[index] !== quote) {
        throw new LowCodeExpressionError('unterminated string');
      }
      index += 1;
      tokens.push({ type: 'str', value });
      continue;
    }
    if (/[0-9]/.test(char)) {
      let raw = char;
      index += 1;
      while (index < source.length && /[0-9.]/.test(source[index] ?? '')) {
        raw += source[index];
        index += 1;
      }
      tokens.push({ type: 'num', value: Number(raw) });
      continue;
    }
    if (/[A-Za-z_]/.test(char)) {
      let raw = char;
      index += 1;
      while (
        index < source.length &&
        /[A-Za-z0-9_]/.test(source[index] ?? '')
      ) {
        raw += source[index];
        index += 1;
      }
      if (raw === 'true' || raw === 'false') {
        tokens.push({ type: 'bool', value: raw === 'true' });
      } else {
        tokens.push({ type: 'ident', value: raw });
      }
      continue;
    }
    const two = source.slice(index, index + 2);
    if (['!=', '&&', '<=', '==', '>=', '||'].includes(two)) {
      tokens.push({ type: 'op', value: two });
      index += 2;
      continue;
    }
    if ('+-*/!<>=().'.includes(char)) {
      tokens.push({ type: 'op', value: char });
      index += 1;
      continue;
    }
    throw new LowCodeExpressionError(`unexpected character ${char}`);
  }
  return tokens;
}

class Parser {
  private index = 0;
  private nodes = 0;

  constructor(private readonly tokens: Token[]) {}

  parse(): Expr {
    const expr = this.parseOr();
    if (this.index !== this.tokens.length) {
      throw new LowCodeExpressionError('trailing tokens');
    }
    return expr;
  }

  private assertIdent(name: string): void {
    if (FORBIDDEN.has(name.toLowerCase())) {
      throw new LowCodeExpressionError(`identifier ${name} is not allowed`);
    }
  }

  private bump(): void {
    this.nodes += 1;
    if (this.nodes > MAX_NODES) {
      throw new LowCodeExpressionError('expression too large');
    }
  }

  private parseAdd(): Expr {
    let left = this.parseMul();
    while (true) {
      if (this.takeOp('+')) {
        this.bump();
        left = { kind: 'binary', op: '+', left, right: this.parseMul() };
        continue;
      }
      if (this.takeOp('-')) {
        this.bump();
        left = { kind: 'binary', op: '-', left, right: this.parseMul() };
        continue;
      }
      return left;
    }
  }

  private parseAnd(): Expr {
    let left = this.parseEq();
    while (this.takeOp('&&')) {
      this.bump();
      left = { kind: 'binary', op: '&&', left, right: this.parseEq() };
    }
    return left;
  }

  private parseEq(): Expr {
    let left = this.parseRel();
    while (true) {
      if (this.takeOp('==')) {
        this.bump();
        left = { kind: 'binary', op: '==', left, right: this.parseRel() };
        continue;
      }
      if (this.takeOp('!=')) {
        this.bump();
        left = { kind: 'binary', op: '!=', left, right: this.parseRel() };
        continue;
      }
      return left;
    }
  }

  private parseMember(): Expr {
    let expr = this.parsePrimary();
    while (this.takeOp('.')) {
      const token = this.peek();
      if (token?.type !== 'ident') {
        throw new LowCodeExpressionError(
          'member access requires an identifier',
        );
      }
      this.index += 1;
      this.assertIdent(token.value);
      this.bump();
      expr = { kind: 'member', object: expr, key: token.value };
    }
    return expr;
  }

  private parseMul(): Expr {
    let left = this.parseUnary();
    while (true) {
      if (this.takeOp('*')) {
        this.bump();
        left = { kind: 'binary', op: '*', left, right: this.parseUnary() };
        continue;
      }
      if (this.takeOp('/')) {
        this.bump();
        left = { kind: 'binary', op: '/', left, right: this.parseUnary() };
        continue;
      }
      return left;
    }
  }

  private parseOr(): Expr {
    let left = this.parseAnd();
    while (this.takeOp('||')) {
      this.bump();
      left = { kind: 'binary', op: '||', left, right: this.parseAnd() };
    }
    return left;
  }

  private parsePrimary(): Expr {
    const token = this.peek();
    if (!token) {
      throw new LowCodeExpressionError('unexpected end of expression');
    }
    if (token.type === 'num') {
      this.index += 1;
      this.bump();
      return { kind: 'num', value: token.value };
    }
    if (token.type === 'str') {
      this.index += 1;
      this.bump();
      return { kind: 'str', value: token.value };
    }
    if (token.type === 'bool') {
      this.index += 1;
      this.bump();
      return { kind: 'bool', value: token.value };
    }
    if (token.type === 'ident') {
      this.index += 1;
      this.assertIdent(token.value);
      this.bump();
      return { kind: 'ident', name: token.value };
    }
    if (token.type === 'op' && token.value === '(') {
      this.index += 1;
      const inner = this.parseOr();
      if (!this.takeOp(')')) {
        throw new LowCodeExpressionError('missing )');
      }
      return inner;
    }
    throw new LowCodeExpressionError('unexpected token');
  }

  private parseRel(): Expr {
    const left = this.parseAdd();
    for (const op of ['<=', '>=', '<', '>'] as const) {
      if (this.takeOp(op)) {
        this.bump();
        return { kind: 'binary', op, left, right: this.parseAdd() };
      }
    }
    return left;
  }

  private parseUnary(): Expr {
    if (this.takeOp('!')) {
      this.bump();
      return { kind: 'unary', op: '!', argument: this.parseUnary() };
    }
    if (this.takeOp('-')) {
      this.bump();
      return { kind: 'unary', op: '-', argument: this.parseUnary() };
    }
    return this.parseMember();
  }

  private peek(): Token | undefined {
    return this.tokens[this.index];
  }

  private takeOp(value: string): boolean {
    const token = this.peek();
    if (token?.type === 'op' && token.value === value) {
      this.index += 1;
      return true;
    }
    return false;
  }
}

function asNumber(value: unknown): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new LowCodeExpressionError('expected number');
  }
  return value;
}

function evalExpr(expr: Expr, data: Record<string, unknown>): unknown {
  switch (expr.kind) {
    case 'bool':
    case 'num':
    case 'str':
      return expr.value;
    case 'ident': {
      return data[expr.name];
    }
    case 'member': {
      const object = evalExpr(expr.object, data);
      if (!object || typeof object !== 'object' || Array.isArray(object)) {
        return undefined;
      }
      return (object as Record<string, unknown>)[expr.key];
    }
    case 'unary': {
      const argument = evalExpr(expr.argument, data);
      return expr.op === '!' ? !argument : -asNumber(argument);
    }
    case 'binary': {
      if (expr.op === '&&') {
        return evalExpr(expr.left, data) && evalExpr(expr.right, data);
      }
      if (expr.op === '||') {
        return evalExpr(expr.left, data) || evalExpr(expr.right, data);
      }
      const left = evalExpr(expr.left, data);
      const right = evalExpr(expr.right, data);
      switch (expr.op) {
        case '!=':
          return left !== right;
        case '*':
          return asNumber(left) * asNumber(right);
        case '+':
          if (typeof left === 'string' || typeof right === 'string') {
            return `${String(left)}${String(right)}`;
          }
          return asNumber(left) + asNumber(right);
        case '-':
          return asNumber(left) - asNumber(right);
        case '/': {
          const divisor = asNumber(right);
          if (divisor === 0) {
            throw new LowCodeExpressionError('division by zero');
          }
          return asNumber(left) / divisor;
        }
        case '<':
          return asNumber(left) < asNumber(right);
        case '<=':
          return asNumber(left) <= asNumber(right);
        case '==':
          return left === right;
        case '>':
          return asNumber(left) > asNumber(right);
        case '>=':
          return asNumber(left) >= asNumber(right);
        default:
          throw new LowCodeExpressionError('unsupported operator');
      }
    }
    default:
      throw new LowCodeExpressionError('unsupported expression');
  }
}

export function evaluateExpression(
  source: string,
  context: LowCodeRuntimeContext,
): unknown {
  if (source.length > MAX_LENGTH) {
    throw new LowCodeExpressionError('expression too long');
  }
  const ast = new Parser(tokenize(source)).parse();
  return evalExpr(ast, context.data);
}

function createExpressionWorker(): null | Worker {
  if (typeof Worker === 'undefined') {
    return null;
  }
  try {
    return new Worker(new URL('./expression.worker.ts', import.meta.url), {
      type: 'module',
    });
  } catch {
    return null;
  }
}

function evaluateExpressionWithTimeout(
  source: string,
  context: LowCodeRuntimeContext,
  timeoutMs: number,
): Promise<unknown> {
  return Promise.race([
    Promise.resolve().then(() => evaluateExpression(source, context)),
    new Promise((_resolve, reject) => {
      setTimeout(() => {
        reject(new LowCodeExpressionError('timeout'));
      }, timeoutMs);
    }),
  ]);
}

export async function evaluateExpressionIsolated(
  source: string,
  context: LowCodeRuntimeContext,
  timeoutMs = 50,
): Promise<unknown> {
  const worker = createExpressionWorker();
  if (!worker) {
    return evaluateExpressionWithTimeout(source, context, timeoutMs);
  }
  return await new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      worker.terminate();
      reject(new LowCodeExpressionError('timeout'));
    }, timeoutMs);
    worker.addEventListener(
      'message',
      (event: MessageEvent) => {
        clearTimeout(timer);
        worker.terminate();
        const payload = event.data as {
          message?: string;
          ok?: boolean;
          value?: unknown;
        };
        if (payload.ok) {
          resolve(payload.value);
          return;
        }
        reject(new LowCodeExpressionError(payload.message || 'worker failed'));
      },
      { once: true },
    );
    worker.addEventListener(
      'error',
      () => {
        clearTimeout(timer);
        worker.terminate();
        reject(new LowCodeExpressionError('worker failed'));
      },
      { once: true },
    );
    // oxlint-disable-next-line unicorn/require-post-message-target-origin -- Worker.postMessage
    worker.postMessage({ source, context });
  });
}
