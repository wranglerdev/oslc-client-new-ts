import type { IndexedFormula } from 'rdflib';
import OSLCResource from './OSLCResource.js';
/**
 * Encapsulates an OSLC ServiceProviderCatalog resource as in-memory RDF knowledge base
 * @class
 *
 * @constructor
 * @param {string} uri - the URI of the OSLC ServiceProviderCatalog resource
 * @param {IndexedFormula} store - the RDF Knowledge Base for this service provider catalog
 * @param {string} etag - the ETag of the resource
 */
export default class ServiceProviderCatalog extends OSLCResource {
    constructor(uri: string, store: IndexedFormula, etag?: string | undefined);
    /**
     * Get the ServiceProvider with the given service provider name. This will also load all the
     * services for that service provider so they are available for use.
     *
     * @param {string} serviceProviderTitle - the dcterms:title of the service provider (e.g., an EWM project area)
     * @returns {string|undefined} serviceProviderURL - the matching ServiceProvider URL from the service provider catalog
     */
    serviceProvider(serviceProviderTitle: string): string | undefined;
}
