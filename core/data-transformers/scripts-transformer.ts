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

/**
 * Extracts HTML attributes from a script tag's opening element.
 * Handles both boolean attributes (async, defer) and key-value attributes (data-*, crossorigin).
 * @param {string} scriptTag - The full script tag HTML string
 * @returns {Record<string, string>} Record of attribute name-value pairs (boolean attrs get empty string value)
 */
function extractAttributes(scriptTag: string): Record<string, string> {
  // Extract the opening tag content (everything between <script and >)
  const openingTagMatch = /<script([^>]*)>/i.exec(scriptTag);
  const openingTagContent = openingTagMatch?.[1];

  if (!openingTagContent) {
    return {};
  }

  // Match attributes in formats: name="value", name='value', or name (boolean)
  const attributePattern = /([a-zA-Z][\w-]*)\s*(?:=\s*["']([^"']*)["'])?/g;
  const matches = Array.from(openingTagContent.matchAll(attributePattern));

  // Convert matches to record, filtering out 'src' which is handled separately
  return matches.reduce<Record<string, string>>((acc, match) => {
    const name = match[1];
    const value = match[2];

    // Skip if no name or if it's 'src' (handled separately)
    if (name && name.toLowerCase() !== 'src') {
      // Boolean attributes get empty string, others get their value
      acc[name] = value ?? '';
    }

    return acc;
  }, {});
}

// C15T's ClientSideOptionsProvider creates the <script> element at runtime. BigCommerce's API
// returns inline scripts wrapped in <script> tags, which would result in nested <script> elements
// and cause errors. This function extracts both inline content and src attributes to handle cases
// where InlineScript types may contain external script references.
function extractScriptInfo(scriptTag: string): ScriptInfo {
  // Extract attributes first (works for both inline and src scripts)
  // Extract text content (for inline scripts)
  const scriptMatch = /<script[^>]*>([\s\S]*?)<\/script>/i.exec(scriptTag);
  const textContent = scriptMatch?.[1]?.trim();

  if (textContent) {
    return {
      textContent,
    };
  }

  // Extract src attribute (for external scripts that may be misclassified as inline)
  const srcMatch = /<script[^>]*\ssrc=["']([^"']+)["']/i.exec(scriptTag);
  const src = srcMatch?.[1];

  if (src) {
    return {
      src,
    };
  }

  return null;
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

  return scriptNodes.map((script) => {
    const baseConfig: C15tScript = {
      category: mapConsentCategory(script.consentCategory),
      id: script.entityId,
      target: script.location === 'HEAD' ? 'head' : 'body',
    };

    const integrityHashes = script.integrityHashes.map((h) => h.hash).filter(Boolean);
    const attributes = integrityHashes.length
      ? { integrity: integrityHashes.join(' ') }
      : undefined;

    if (script.__typename === 'InlineScript' && script.scriptTag) {
      const scriptInfo = extractScriptInfo(script.scriptTag);
      const additionalAttributes = extractAttributes(script.scriptTag);

      // Prefer textContent if available (true inline script)
      if (scriptInfo !== null && 'textContent' in scriptInfo) {
        return {
          ...baseConfig,
          textContent: scriptInfo.textContent,
          attributes: { ...additionalAttributes, ...attributes },
        };
      }

      if (scriptInfo !== null && 'src' in scriptInfo) {
        return {
          ...baseConfig,
          src: scriptInfo.src,
          attributes: { ...additionalAttributes, ...attributes },
        };
      }
    }

    if (script.__typename === 'SrcScript' && script.src) {
      return { ...baseConfig, src: script.src, attributes };
    }

    return { ...baseConfig, attributes };
  });
}
