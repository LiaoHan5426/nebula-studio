/**
 * @nebula-studio/contracts/system
 *
 * 系统域权威类型定义。
 * 所有 renderer / package 必须从本模块导入，禁止在各自 shared/ 内重复声明。
 *
 * OpenAPI 已有 schema 的类型经 `mappers.ts` 与 generated 对齐；LogRecord 仍手写至 OpenAPI 覆盖。
 */

export * from './models.ts';
export * from './mappers.ts';
