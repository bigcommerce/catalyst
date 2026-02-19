import AdmZip from 'adm-zip';
import { Context, Effect, Layer } from 'effect';

import { ZipError } from '../../core/errors';

export class ZipArchive extends Context.Tag('@catalyst/ZipArchive')<
  ZipArchive,
  {
    readonly createFromDirectory: (
      srcDir: string,
      outputPath: string,
      zipPrefix?: string,
    ) => Effect.Effect<void, ZipError>;
  }
>() {}

export const ZipArchiveLive = Layer.succeed(ZipArchive, {
  createFromDirectory: (srcDir, outputPath, zipPrefix = 'output') =>
    Effect.try({
      try: () => {
        const zip = new AdmZip();

        zip.addLocalFolder(srcDir, zipPrefix);
        zip.writeZip(outputPath);
      },
      catch: (error) =>
        new ZipError({
          message: error instanceof Error ? error.message : String(error),
        }),
    }),
});
