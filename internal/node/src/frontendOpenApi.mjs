const stringSchema = { type: 'string' };
const booleanSchema = { type: 'boolean' };
const int32Schema = { type: 'integer', format: 'int32' };
const stringArraySchema = { type: 'array', items: stringSchema };

function objectSchema(properties) {
  return { type: 'object', properties };
}

function okArray(schemaName) {
  return {
    200: {
      description: 'OK',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: { $ref: `#/components/schemas/${schemaName}` },
          },
        },
      },
    },
  };
}

function okObject(schemaName) {
  return {
    200: {
      description: 'OK',
      content: {
        'application/json': {
          schema: { $ref: `#/components/schemas/${schemaName}` },
        },
      },
    },
  };
}

function jsonBody(schemaName) {
  return {
    required: true,
    content: {
      'application/json': {
        schema: { $ref: `#/components/schemas/${schemaName}` },
      },
    },
  };
}

const idParam = {
  name: 'id',
  in: 'path',
  required: true,
  schema: stringSchema,
};

export const FRONTEND_APPLICATION_SCHEMAS = {
  FrontendRuntimeEntryView: objectSchema({
    id: stringSchema,
    name: stringSchema,
    description: stringSchema,
    icon: stringSchema,
    category: stringSchema,
    driver: stringSchema,
    routeBase: stringSchema,
    defaultPath: stringSchema,
    roles: stringArraySchema,
    webEnabled: booleanSchema,
    electronEnabled: booleanSchema,
    sortOrder: int32Schema,
    version: stringSchema,
    channel: stringSchema,
    manifestUrl: stringSchema,
    remoteName: stringSchema,
    exposedModule: stringSchema,
    contractVersion: int32Schema,
    hostVersionRange: stringSchema,
    rolloutPercent: int32Schema,
    integrity: stringSchema,
    signature: stringSchema,
    allowedOrigins: stringArraySchema,
    source: stringSchema,
    renderer: stringSchema,
    preload: stringSchema,
    integratable: booleanSchema,
    defaultEnabled: booleanSchema,
    requiresAuth: booleanSchema,
    helpKey: stringSchema,
    searchKeywords: stringArraySchema,
    returnTo: stringSchema,
  }),
  FrontendApplicationView: objectSchema({
    id: stringSchema,
    name: stringSchema,
    description: stringSchema,
    icon: stringSchema,
    category: stringSchema,
    status: stringSchema,
    sortOrder: int32Schema,
    driver: stringSchema,
    routeBase: stringSchema,
    defaultPath: stringSchema,
    roles: stringArraySchema,
    tenantPolicy: stringSchema,
    webEnabled: booleanSchema,
    electronEnabled: booleanSchema,
  }),
  FrontendApplicationVersionView: objectSchema({
    id: stringSchema,
    applicationId: stringSchema,
    version: stringSchema,
    channel: stringSchema,
    manifestUrl: stringSchema,
    remoteName: stringSchema,
    exposedModule: stringSchema,
    contractVersion: int32Schema,
    hostVersionRange: stringSchema,
    integrity: stringSchema,
    allowedOrigins: stringArraySchema,
    rolloutPercent: int32Schema,
    publishedAt: stringSchema,
    status: stringSchema,
  }),
  FrontendApplicationVersionCreateRequest: objectSchema({
    version: stringSchema,
    channel: stringSchema,
    manifestUrl: stringSchema,
    remoteName: stringSchema,
    exposedModule: stringSchema,
    contractVersion: int32Schema,
    hostVersionRange: stringSchema,
    integrity: stringSchema,
    signature: stringSchema,
    allowedOrigins: stringArraySchema,
    rolloutPercent: int32Schema,
    status: stringSchema,
  }),
  FrontendApplicationCreateRequest: objectSchema({
    id: stringSchema,
    name: stringSchema,
    description: stringSchema,
    icon: stringSchema,
    category: stringSchema,
    status: stringSchema,
    sortOrder: int32Schema,
    driver: stringSchema,
    routeBase: stringSchema,
    defaultPath: stringSchema,
    roles: stringArraySchema,
    tenantPolicy: stringSchema,
    webEnabled: int32Schema,
    electronEnabled: int32Schema,
    renderer: stringSchema,
    preload: stringSchema,
    integratable: int32Schema,
    defaultEnabled: int32Schema,
    requiresAuth: int32Schema,
    helpKey: stringSchema,
    searchKeywords: stringArraySchema,
    returnTo: stringSchema,
    version: {
      $ref: '#/components/schemas/FrontendApplicationVersionCreateRequest',
    },
  }),
  FrontendApplicationRolloutRequest: objectSchema({
    version: stringSchema,
    rolloutPercent: int32Schema,
    status: stringSchema,
  }),
  FrontendApplicationValidateResultView: objectSchema({
    valid: booleanSchema,
    errors: stringArraySchema,
    warnings: stringArraySchema,
  }),
  FrontendRemoteTelemetryRequest: objectSchema({
    applicationId: stringSchema,
    version: stringSchema,
    eventType: stringSchema,
    entry: stringSchema,
    message: stringSchema,
  }),
  FrontendRemoteTelemetryResultView: objectSchema({
    ingested: booleanSchema,
    autoRolledBack: booleanSchema,
    restoredVersion: stringSchema,
  }),
  FrontendRemoteTelemetryEventView: objectSchema({
    id: stringSchema,
    applicationId: stringSchema,
    version: stringSchema,
    eventType: stringSchema,
    entry: stringSchema,
    message: stringSchema,
    autoRolledBack: booleanSchema,
    restoredVersion: stringSchema,
    createdAt: stringSchema,
  }),
  FrontendApplicationStatusBody: objectSchema({
    status: stringSchema,
  }),
};

export const FRONTEND_APPLICATION_PATHS = {
  '/api/system/frontend-apps/runtime': {
    get: {
      tags: ['frontend-application-rest-service'],
      operationId: 'listFrontendRuntime',
      responses: okArray('FrontendRuntimeEntryView'),
    },
  },
  '/api/system/frontend-apps/page': {
    get: {
      tags: ['frontend-application-rest-service'],
      operationId: 'pageFrontendApplications',
      parameters: [
        {
          name: 'page',
          in: 'query',
          schema: { ...int32Schema, default: 1 },
        },
        {
          name: 'size',
          in: 'query',
          schema: { ...int32Schema, default: 20 },
        },
        { name: 'keyword', in: 'query', schema: stringSchema },
        { name: 'status', in: 'query', schema: stringSchema },
      ],
      responses: { 200: { description: 'OK' } },
    },
  },
  '/api/system/frontend-apps': {
    get: {
      tags: ['frontend-application-rest-service'],
      operationId: 'listFrontendApplications',
      responses: okArray('FrontendApplicationView'),
    },
    post: {
      tags: ['frontend-application-rest-service'],
      operationId: 'createFrontendApplication',
      requestBody: jsonBody('FrontendApplicationCreateRequest'),
      responses: okObject('FrontendApplicationView'),
    },
  },
  '/api/system/frontend-apps/{id}': {
    get: {
      tags: ['frontend-application-rest-service'],
      operationId: 'getFrontendApplication',
      parameters: [idParam],
      responses: okObject('FrontendApplicationView'),
    },
    delete: {
      tags: ['frontend-application-rest-service'],
      operationId: 'deleteFrontendApplication',
      parameters: [idParam],
      responses: { 200: { description: 'OK' } },
    },
  },
  '/api/system/frontend-apps/{id}/versions': {
    get: {
      tags: ['frontend-application-rest-service'],
      operationId: 'listFrontendApplicationVersions',
      parameters: [idParam],
      responses: okArray('FrontendApplicationVersionView'),
    },
    post: {
      tags: ['frontend-application-rest-service'],
      operationId: 'createFrontendApplicationVersion',
      parameters: [idParam],
      requestBody: jsonBody('FrontendApplicationVersionCreateRequest'),
      responses: okObject('FrontendApplicationVersionView'),
    },
  },
  '/api/system/frontend-apps/{id}/validate': {
    post: {
      tags: ['frontend-application-rest-service'],
      operationId: 'validateFrontendApplication',
      parameters: [idParam],
      responses: okObject('FrontendApplicationValidateResultView'),
    },
  },
  '/api/system/frontend-apps/{id}/rollout': {
    put: {
      tags: ['frontend-application-rest-service'],
      operationId: 'rolloutFrontendApplication',
      parameters: [idParam],
      requestBody: jsonBody('FrontendApplicationRolloutRequest'),
      responses: okObject('FrontendApplicationVersionView'),
    },
  },
  '/api/system/frontend-apps/{id}/status': {
    put: {
      tags: ['frontend-application-rest-service'],
      operationId: 'updateFrontendApplicationStatus',
      parameters: [idParam],
      requestBody: jsonBody('FrontendApplicationStatusBody'),
      responses: okObject('FrontendApplicationView'),
    },
  },
  '/api/system/frontend-apps/telemetry': {
    post: {
      tags: ['frontend-application-rest-service'],
      operationId: 'ingestFrontendTelemetry',
      requestBody: jsonBody('FrontendRemoteTelemetryRequest'),
      responses: okObject('FrontendRemoteTelemetryResultView'),
    },
  },
  '/api/system/frontend-apps/{id}/telemetry': {
    get: {
      tags: ['frontend-application-rest-service'],
      operationId: 'listFrontendTelemetry',
      parameters: [
        idParam,
        {
          name: 'limit',
          in: 'query',
          schema: { ...int32Schema, default: 50 },
        },
      ],
      responses: okArray('FrontendRemoteTelemetryEventView'),
    },
  },
};

export function ensureFrontendApplicationOpenApi(spec) {
  const next = spec && typeof spec === 'object' ? spec : {};
  next.paths ??= {};
  next.components ??= {};
  next.components.schemas ??= {};
  Object.assign(next.paths, FRONTEND_APPLICATION_PATHS);
  Object.assign(next.components.schemas, FRONTEND_APPLICATION_SCHEMAS);
  return next;
}
