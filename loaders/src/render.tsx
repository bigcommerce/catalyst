import { getSectionDefinition, LoaderContext } from "./registry";
import { Stream } from "./streamable";

interface RenderProps {
  type: string;
  context: LoaderContext;
}

export function Render({ type, context }: RenderProps) {
  const def = getSectionDefinition(type);
  if (!def) throw new Error(`Component "${type}" not found`);

  const Component = def.component;
  const promise = def.getData(context);

  return (
    <Stream value={promise} fallback={<div>Loading section: {type}...</div>}>
      {(props) => <Component {...props} />}
    </Stream>
  );
}
