import type { IndexedFormula } from 'rdflib';
import type { NamedNode } from 'rdflib/lib/tf-types';
import OSLCResource from './OSLCResource.js';
/**
 * Encapsulates an OSLC ServiceProvider resource as in-memory RDF knowledge base
 * This is an asynchronous constructor. The callback is called when the ServiceProvider
 * has discovered all its services
 * @class
 * @constructor
 * @param {string} uri - the URI of the ServiceProvider
 * @param {IndexedFormula} store - the RDF Knowledge Base for this service provider
 * @param {string} etag - the ETag of the resource
 */
export default class ServiceProvider extends OSLCResource {
    constructor(uri: string, store: IndexedFormula, etag?: string | undefined);
    /**
     * Get the queryBase URL for an OSLC QueryCapability with the given oslc:resourceType
     *
     * @param {string|NamedNode} resourceType - a symbol for the desired oslc:resourceType
     * @returns {string|null} the queryBase URL used to query resources of that type
     */
    getQueryBase(resourceType: string | NamedNode): string | null;
    /**
     * Get the creation URL for an OSLC CreationFactory with the given oslc:resourceType
     *
     * @param {string|NamedNode} resourceType - a symbol for, or the name of the desired oslc:resourceType
     * @returns {string|null} the creation URL used to create resources of that type
     */
    getCreationFactory(resourceType: string | NamedNode): string | null;
}
