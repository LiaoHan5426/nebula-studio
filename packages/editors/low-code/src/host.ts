import type {
  ExactComponentLock,
  LowCodeDraftDocument,
} from '@nebula-studio/low-code-contract';
import type { LowCodeDataSourceDescriptor } from '@nebula-studio/low-code-kit';

import {
  COMPONENT_MANIFESTS,
  DEFAULT_DATA_SOURCES,
} from '@nebula-studio/low-code-kit';

export interface ComponentCatalogReader {
  types: { group?: string; label: string; type: string }[];
}

export interface DataSourceDescriptorReader {
  list(): LowCodeDataSourceDescriptor[];
}

export interface DraftDocumentPort {
  load(): LowCodeDraftDocument;
  save(document: LowCodeDraftDocument): void;
}

export interface StudioLifecyclePort {
  preview(
    document: LowCodeDraftDocument,
    componentLock: ExactComponentLock,
  ): Promise<void>;
  publish(
    document: LowCodeDraftDocument,
    componentLock: ExactComponentLock,
    version: string,
  ): Promise<void>;
  rollback(version: string): Promise<void>;
}

export interface LowCodeEditorHost {
  catalog: ComponentCatalogReader;
  dataSources: DataSourceDescriptorReader;
  drafts: DraftDocumentPort;
  studio?: StudioLifecyclePort;
}

export function cloneDraft(
  document: LowCodeDraftDocument,
): LowCodeDraftDocument {
  return JSON.parse(JSON.stringify(document)) as LowCodeDraftDocument;
}

export function createMemoryDraftPort(
  initial: LowCodeDraftDocument,
): DraftDocumentPort {
  let current = cloneDraft(initial);
  return {
    load: () => cloneDraft(current),
    save(document) {
      current = cloneDraft(document);
    },
  };
}

export function createMemoryDataSources(
  items: LowCodeDataSourceDescriptor[] = DEFAULT_DATA_SOURCES,
): DataSourceDescriptorReader {
  return { list: () => items };
}

export function createDocumentHistory(initial: LowCodeDraftDocument) {
  let past: LowCodeDraftDocument[] = [];
  let present = cloneDraft(initial);
  let future: LowCodeDraftDocument[] = [];
  return {
    current(): LowCodeDraftDocument {
      return present;
    },
    commit(next: LowCodeDraftDocument) {
      past = [...past, present];
      present = cloneDraft(next);
      future = [];
    },
    undo(): LowCodeDraftDocument {
      const previous = past.at(-1);
      if (!previous) return present;
      future = [present, ...future];
      past = past.slice(0, -1);
      present = previous;
      return present;
    },
    redo(): LowCodeDraftDocument {
      const next = future[0];
      if (!next) return present;
      past = [...past, present];
      future = future.slice(1);
      present = next;
      return present;
    },
    canUndo(): boolean {
      return past.length > 0;
    },
    canRedo(): boolean {
      return future.length > 0;
    },
  };
}

export const DEFAULT_LOW_CODE_CATALOG: ComponentCatalogReader = {
  types: COMPONENT_MANIFESTS.map((item) => ({
    type: item.type,
    label: item.label,
    group: item.group,
  })),
};
