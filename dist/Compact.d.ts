import type { IndexedFormula } from 'rdflib';
import OSLCResource from './OSLCResource.js';
import type { PreviewInfo } from './types.js';
/**
 * Implements OSLC Compact resource to support OSLC Resource Preview
 * @class
 *
 * @constructor
 * @param {string} uri - the URI of the Jazz rootservices resource
 * @param {IndexedFormula} store - the RDF Knowledge Base for this rootservices resource
 */
export default class Compact extends OSLCResource {
    constructor(uri: string, store: IndexedFormula);
    /**
     * Get the short title of the compact resource
     * @returns {string|undefined}
     */
    getShortTitle(): string | undefined;
    /**
     * Get the icon URL
     * @returns {string|undefined}
     */
    getIcon(): string | undefined;
    /**
     * Get the icon title
     * @returns {string|undefined}
     */
    getIconTitle(): string | undefined;
    /**
     * Get the icon source set
     * @returns {string|undefined}
     */
    getIconSrcSet(): string | undefined;
    /**
     * Get the small preview information
     * @returns {PreviewInfo|null}
     */
    getSmallPreview(): PreviewInfo | null;
    /**
     * Get the large preview information
     * @returns {PreviewInfo|null}
     */
    getLargePreview(): PreviewInfo | null;
}
