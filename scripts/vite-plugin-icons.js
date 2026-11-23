import { generateIcons } from './generate-icons.js';

/** Regenerates src/js/icon-set.generated.ts before every build and dev start. */
export default function aiabIcons() {
  return {
    name: 'aiab-icons',
    buildStart() {
      generateIcons();
    },
  };
}
