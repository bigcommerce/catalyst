import { type ComponentType } from "react";

export type LoaderContext = {
  params?: Record<string, string>;
  locale?: string;
};

export interface SectionDefinition<Props> {
  component: ComponentType<Props>;
  getData: (ctx: LoaderContext) => Promise<Props>;
}

const registry = new Map<string, SectionDefinition<any>>();

export function registerSection<Props>(
  type: string,
  def: SectionDefinition<Props>
) {
  registry.set(type, def);
}

export function getSectionDefinition(type: string) {
  return registry.get(type);
}
