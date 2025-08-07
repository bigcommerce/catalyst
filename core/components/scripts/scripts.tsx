import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import Script from 'next/script';
import { ComponentProps } from 'react';

import { FragmentOf } from '~/client/graphql';

import { ScriptsFragment } from './fragment';

type ScriptsData = FragmentOf<typeof ScriptsFragment>;

interface ScriptRendererProps {
  scripts: ScriptsData['headerScripts'] | null;
  strategy: ComponentProps<typeof Script>['strategy'];
}

export const ScriptManagerScripts = ({ scripts, strategy }: ScriptRendererProps) => {
  if (!scripts?.edges) return null;

  const scriptNodes = removeEdgesAndNodes(scripts);

  return (
    <>
      {scriptNodes
        .map((script) => {
          const scriptProps: ComponentProps<typeof Script> = {
            strategy,
          };

          // Handle external scripts (SrcScript)
          if (script.__typename === 'SrcScript' && script.src) {
            scriptProps.src = script.src;

            // Add integrity hashes if provided
            if (script.integrityHashes.length > 0) {
              scriptProps.integrity = script.integrityHashes
                .map((hashObj) => hashObj.hash)
                .join(' ');
              scriptProps.crossOrigin = 'anonymous';
            }
          }

          // Handle inline scripts (InlineScript)
          if (script.__typename === 'InlineScript' && script.scriptTag) {
            const scriptMatch = /<script[^>]*>([\s\S]*?)<\/script>/i.exec(script.scriptTag);

            if (scriptMatch?.[1]) {
              scriptProps.dangerouslySetInnerHTML = {
                __html: scriptMatch[1],
              };
            }
          }

          scriptProps.id = `bc-script-${script.entityId}`;

          // Return null for invalid scripts (will be filtered out)
          if (!scriptProps.src && !scriptProps.dangerouslySetInnerHTML) {
            return null;
          }

          return scriptProps;
        })
        .filter((scriptProps): scriptProps is ComponentProps<typeof Script> => scriptProps !== null)
        .map((scriptProps) => {
          return <Script key={scriptProps.id} {...scriptProps} />;
        })}
    </>
  );
};
