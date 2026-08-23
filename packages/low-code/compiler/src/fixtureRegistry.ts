import type { Component } from 'vue';

import type { LowCodeComponentRegistry } from './registry.ts';

import {
  AlertList,
  Box,
  FilterBar,
  MapControl,
  MetricCard,
  RankList,
  StatusCard,
  Text,
  TrendChart,
} from './builtins.ts';

export function createTrustedFixtureRegistry(): LowCodeComponentRegistry {
  const components: Record<string, Record<string, Component>> = {
    Box: { '1.0.0': Box },
    Text: { '1.0.0': Text },
    MetricCard: { '1.0.0': MetricCard },
    AlertList: { '1.0.0': AlertList },
    StatusCard: { '1.0.0': StatusCard },
    FilterBar: { '1.0.0': FilterBar },
    TrendChart: { '1.0.0': TrendChart },
    RankList: { '1.0.0': RankList },
    MapControl: { '1.0.0': MapControl },
  };
  return {
    resolve(type, version) {
      return components[type]?.[version] ?? null;
    },
  };
}
