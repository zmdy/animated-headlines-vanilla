/**
 * Two bundles, built in sequence.
 *
 * The runtime is what a page loads. The manifest is metadata that only
 * integrations read - a page builder generating its own controls, for
 * instance - so it is kept out of the runtime and shipped as its own entry
 * rather than costing every visitor the bytes.
 */
import {build} from 'vite';

for (const target of ['runtime', 'manifest']) {
    process.env.AH_TARGET = target;
    await build();
}
