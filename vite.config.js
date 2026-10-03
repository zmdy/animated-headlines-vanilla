import {defineConfig} from 'vite';
import {resolve} from 'path';
import {transform} from 'esbuild';
import tsconfigPaths from 'vite-tsconfig-paths';

const banner = `/*!
 * Plain Vanilla JavaScript Animated Headline Component
 *
 * @author Geoff Selby
 * @author Christoph Massmann <cm@vianetz.com>
 * @license https://opensource.org/licenses/MIT MIT License
 */`;

/**
 * Vite leaves the whitespace of an ES library build alone (to keep tree-shaking
 * annotations intact for whoever bundles it next). Nothing here is tree-shaken
 * further - the entry registers custom elements as a side effect - so the
 * ES file is minified like the UMD one, and gets the licence notice once.
 */
const bundleFinish = {
    name: 'bundle-finish',
    apply: 'build',
    // Runs once Vite's own minifier is done: it is the one that leaves the
    // whitespace in, and nothing after this point rewrites the code again.
    async generateBundle(options, bundle) {
        for (const file of Object.values(bundle)) {
            if (file.type !== 'chunk') {
                continue;
            }

            if (options.format === 'es') {
                file.code = (await transform(file.code, {minify: true, format: 'esm', target: 'es2022'})).code;
            }

            // one notice for the bundle, instead of one per source file
            file.code = banner + '\n' + file.code;
        }
    },
};

export default defineConfig({
    plugins: [
        tsconfigPaths(),
        bundleFinish
    ],
    build: {
        lib: {
            entry: resolve(__dirname, 'src/js/index.ts'),
            name: 'AnimatedHeadline',
            fileName: 'animated-headline', // the proper extensions will be added
        },
        rollupOptions: {
            external: [],
        },
    },
    esbuild: {
        legalComments: 'none'
    }
});
