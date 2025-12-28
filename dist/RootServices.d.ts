import type { IndexedFormula } from 'rdflib';
import type { NamedNode } from 'rdflib/lib/tf-types';
import OSLCResource from './OSLCResource.js';
/**
 * Encapsulates a Jazz rootservices document on an RDF Store
 *
 * @constructor
 * @param {string} uri - the URI of the Jazz rootservices resource
 * @param {IndexedFormula} store - the RDF Knowledge Base for this rootservices resource
 * @param {string} etag - the HTTP ETag for this resource
 */
export default class RootServices extends OSLCResource {
    constructor(uri: string, store: IndexedFormula, etag?: string | undefined);
    /**
     * The RTC rootservices document has a number of jd:oslcCatalogs properties
     * that contain inlined oslc:ServiceProviderCatalog instances.
     *  <jd:oslcCatalogs>
     *        <oslc:ServiceProviderCatalog rdf:about="https://oslclnx2.rtp.raleigh.ibm.com:9443/ccm/oslc/workitems/catalog">
     *            <oslc:domain rdf:resource="http://open-services.net/ns/cm#"/>
     *        </oslc:ServiceProviderCatalog>
     *  </jd:oslcCatalogs>
     * We want to get the URI for the CM oslc:domain Service Provider Catalog.
     *
     * @param {NamedNode} serviceProviders - the URL of the rootservices *serviceProviders element
     * @returns {string|undefined} - the first matching service provider catalog URI
     */
    serviceProviderCatalog(serviceProviders: NamedNode): string | undefined;
}
