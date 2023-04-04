import {Patch} from '../types/types';

// This is a util function to parse a git diff patch into a more usable format
export function parseGitPatch(patch: string): Patch[] {
  const lines = patch.split('\n');

  let currentFiles: [string, string];
  let currentPatch: Patch | undefined;
  const patches: Patch[] = [];

  // Need to parse this line by line
  lines.forEach(line => {
    const matches = line.match(/^diff --git a\/(.*?) b\/(.*)$/m);

    if (matches) {
      currentFiles = [matches[1], matches[2]];
      return;
    }

    const patchMatches = line.match(
      /^@@ -(\d+)(?:,|)(\d*) \+(\d+)(?:,|)(\d*) @@/
    );

    if (patchMatches) {
      // push old patch
      if (currentPatch) {
        patches.push(currentPatch);
      }

      currentPatch = {
        removed: {
          file: currentFiles[0],
          start: Number(patchMatches[1]),
          end: Number(patchMatches[1]) + Number(patchMatches[2]),
          lines: [],
        },
        added: {
          file: currentFiles[1],
          start: Number(patchMatches[3]),
          end: Number(patchMatches[3]) + Number(patchMatches[4]),
          lines: [],
        },
      };
      return;
    }

    const contentMatches = line.match(/^(-|\+)(.*)$/);

    if (contentMatches) {
      // This can match `--- a/<file>` and `+++ b/<file>`, so ignore if no `currentPatch` object
      if (!currentPatch) {
        return;
      }

      const patchType = contentMatches[1] === '-' ? 'removed' : 'added';
      currentPatch[patchType].lines.push(contentMatches[2]);
    }
  });

  if (currentPatch) {
    patches.push(currentPatch);
  }

  return patches;
}