interface NoibuHelpCodeProps {
  style?: string;
}

interface NoibuRequestHelpCodeButtonProps {
  text?: string;
  style?: string;
}

interface NoibuRequestHelpCodeLabelProps {
  style?: string;
}

function parseInlineStyle(style?: string): Record<string, string> {
  const parsed: Record<string, string> = {};

  if (style) {
    style.split(';').forEach((rule) => {
      const [prop, value] = rule.split(':');
      if (prop && value && !prop.trim().includes('-')) {
        parsed[prop.trim()] = value.trim();
      }
    });
  }

  return parsed;
}

export function NoibuAutomaticHelpCode({ style }: NoibuHelpCodeProps) {
  return (
    <div id="help-code-field" style={{ ...parseInlineStyle(style) }}>
      &nbsp;
    </div>
  );
}

export function NoibuRequestHelpCodeButton({ text, style }: NoibuRequestHelpCodeButtonProps) {
  return (
    <button id="request-help-code" style={{ ...parseInlineStyle(style) }}>
      {text || 'Request Help Code'}
    </button>
  );
}

export function NoibuRequestHelpCodeLabel({ style }: NoibuRequestHelpCodeLabelProps) {
  return (
    <div id="help-code-result" style={{ ...parseInlineStyle(style) }}>
      &nbsp;
    </div>
  );
}
