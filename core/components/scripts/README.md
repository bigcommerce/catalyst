# Script Components

This directory contains components for rendering BigCommerce scripts using Next.js Script component.

## Components

### ScriptManagerScripts
A single component that renders scripts with configurable strategy. Location filtering is now handled at the GraphQL level, simplifying the component logic.

## Usage

```tsx
import { ScriptManagerScripts } from '~/components/scripts';

// In your layout component:
<head>
  <ScriptManagerScripts 
    scripts={data.site.content.headerScripts} 
    strategy="afterInteractive" 
  />
</head>
<body>
  {children}
  <ScriptManagerScripts 
    scripts={data.site.content.footerScripts} 
    strategy="lazyOnload" 
  />
</body>
```

## Architecture

The component accepts:
- `scripts`: Pre-filtered GraphQL scripts data (headerScripts or footerScripts)
- `strategy`: 'afterInteractive', 'lazyOnload', or other Next.js Script strategies

## Script Processing

The component handles both types of BigCommerce scripts:

### External Scripts (SrcScript)
```tsx
<Script 
  id="bc-script-123" 
  src="https://example.com/script.js" 
  strategy="afterInteractive"
  integrity="sha256-abc123..."
  crossOrigin="anonymous"
/>
```

### Inline Scripts (InlineScript)
Inline scripts are rendered using `dangerouslySetInnerHTML` for reliable execution:
```tsx
<Script 
  id="bc-script-456" 
  strategy="lazyOnload"
  dangerouslySetInnerHTML={{ __html: scriptContent }}
/>
```

## Performance & Security

- Header scripts use `afterInteractive` strategy for critical functionality  
- Footer scripts use `lazyOnload` strategy for better performance
- Integrity hashes are included when available for security
