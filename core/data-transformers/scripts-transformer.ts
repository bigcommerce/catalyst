import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import type { ConsentManagerProviderProps } from '@c15t/nextjs/client';

import type { ResultOf } from '~/client/graphql';
import type { ScriptsFragment } from '~/components/consent-manager/scripts-fragment';

type BigCommerceScriptsResult = ResultOf<typeof ScriptsFragment>;
type BigCommerceScripts = BigCommerceScriptsResult['scripts'] | null;
type C15tScripts = NonNullable<ConsentManagerProviderProps['options']['scripts']>;
type C15tScript = C15tScripts[number];

const BC_TO_C15T_CONSENT_CATEGORY_MAP = {
  ESSENTIAL: 'necessary',
  UNKNOWN: 'necessary',
  FUNCTIONAL: 'functionality',
  ANALYTICS: 'measurement',
  TARGETING: 'marketing',
} as const;

type ScriptInfo = { textContent: string } | { src: string } | null;

// C15T's ClientSideOptionsProvider creates the <script> element at runtime. BigCommerce's API
// returns inline scripts wrapped in <script> tags, which would result in nested <script> elements
// and cause errors. This function extracts both inline content and src attributes to handle cases
// where InlineScript types may contain external script references.
function extractScriptInfo(scriptTag: string): ScriptInfo {
  // Extract text content (for inline scripts)
  const scriptMatch = /<script[^>]*>([\s\S]*?)<\/script>/i.exec(scriptTag);
  const textContent = scriptMatch?.[1]?.trim();

  if (textContent) {
    return { textContent };
  }

  // Extract src attribute (for external scripts that may be misclassified as inline)
  const srcMatch = /<script[^>]*\ssrc=["']([^"']+)["']/i.exec(scriptTag);
  const src = srcMatch?.[1];

  if (src) {
    return { src };
  }

  return null;
}

// Wraps inline script content to handle missing global variables gracefully
// (e.g., paypal SDK that may not be loaded yet). Scripts execute in global scope
// by default when injected as <script> tags, so we only add error handling.
function wrapInlineScriptContent(content: string): string {
  // Check if the script already appears to be wrapped or is a function/IIFE
  const trimmed = content.trim();
  if (
    trimmed.startsWith('(function') ||
    trimmed.startsWith('(async function') ||
    trimmed.startsWith('function') ||
    trimmed.startsWith('try') ||
    trimmed.startsWith('var ') ||
    trimmed.startsWith('let ') ||
    trimmed.startsWith('const ')
  ) {
    // Script appears to already be structured, wrap in try-catch for error handling
    return `try {
${content}
} catch (error) {
  if (error instanceof ReferenceError && error.message.includes('is not defined')) {
    console.warn('Script execution skipped due to missing global:', error.message);
  } else {
    throw error;
  }
}`;
  }

  // For simple scripts, wrap in try-catch to handle missing globals
  return `try {
${content}
} catch (error) {
  if (error instanceof ReferenceError && error.message.includes('is not defined')) {
    console.warn('Script execution skipped due to missing global:', error.message);
  } else {
    throw error;
  }
}`;
}

function isValidConsentCategory(key: string): key is keyof typeof BC_TO_C15T_CONSENT_CATEGORY_MAP {
  return key in BC_TO_C15T_CONSENT_CATEGORY_MAP;
}

function mapConsentCategory(
  bigCommerceCategory: string,
): 'necessary' | 'functionality' | 'marketing' | 'measurement' | 'experience' {
  if (isValidConsentCategory(bigCommerceCategory)) {
    return BC_TO_C15T_CONSENT_CATEGORY_MAP[bigCommerceCategory];
  }

  return BC_TO_C15T_CONSENT_CATEGORY_MAP.UNKNOWN;
}

export function scriptsTransformer(scripts: BigCommerceScripts): C15tScripts {
  if (!scripts?.edges) return [];

  const scriptNodes = removeEdgesAndNodes(scripts);

  return scriptNodes
    .map((script) => {
      const baseConfig: C15tScript = {
        category: mapConsentCategory(script.consentCategory),
        id: script.entityId,
      };

      const integrityHashes = script.integrityHashes.map((h) => h.hash).filter(Boolean);
      const attributes = integrityHashes.length
        ? { integrity: integrityHashes.join(' ') }
        : undefined;

      if (script.__typename === 'InlineScript' && script.scriptTag) {
        const scriptInfo = extractScriptInfo(script.scriptTag);

        // Prefer textContent if available (true inline script)
        if (scriptInfo !== null && 'textContent' in scriptInfo) {
          return { ...baseConfig, textContent: wrapInlineScriptContent(scriptInfo.textContent), attributes };
        }

        if (scriptInfo !== null && 'src' in scriptInfo) {
          return { ...baseConfig, src: scriptInfo.src, attributes };
        }
      }

      if (script.__typename === 'SrcScript' && script.src) {
        return { ...baseConfig, src: script.src, attributes };
      }

      // Return null for scripts that don't have valid src or textContent
      // These will be filtered out below
      return null;
    })
    .filter((script): script is C15tScript => script !== null);
}
