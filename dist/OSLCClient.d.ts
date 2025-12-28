import type { IndexedFormula } from "rdflib";
import type { NamedNode } from "rdflib/lib/tf-types";
import type { Document } from "@xmldom/xmldom";
import OSLCResource from "./OSLCResource.js";
import Compact from "./Compact.js";
import type { QueryParams, AtomFeed } from "./types.js";
/**
 * An OSLCClient provides a simple interface to access OSLC resources
 * and perform operations like querying, creating, and updating resources.
 * It handles authentication, service provider discovery, and resource management.
 */
export default class OSLCClient {
    private userid;
    private password;
    private configuration_context;
    private rootservices;
    private spc;
    private sp;
    private ownerMap;
    private isNodeEnvironment;
    private jar?;
    private client;
    private base_url?;
    constructor(user: string, password: string, configuration_context?: string | null);
    /**
     * Set the OSLCClient to use a given service provider of the given domain
     *
     * @param {string} server_url - The base server URL
     * @param {string} serviceProviderName - The name of the service provider
     * @param {string} domain - The OSLC domain (CM, RM, or QM)
     */
    use(server_url: string, serviceProviderName: string, domain?: string): Promise<void>;
    /**
     * Get an OSLC resource from a URL
     *
     * @param {string} url - The URL of the resource
     * @param {string} oslc_version - OSLC version to use, defaults to 2.0
     * @param {string} accept - The Accept header value, defaults to 'application/rdf+xml'
     * @returns an OSLCResource object containing the resource data or XML/feed
     */
    getResource(url: string, oslc_version?: string, accept?: string): Promise<OSLCResource | {
        etag?: string;
        xml: Document;
    } | {
        etag?: string;
        feed: AtomFeed;
    }>;
    /**
     * Get an OSLC Compact resource
     *
     * @param {string} url - The URL of the resource
     * @param {string} oslc_version - OSLC version to use, defaults to 2.0
     * @param {string} accept - The Accept header value, defaults to 'application/x-oslc-compact+xml'
     * @returns a Compact object containing the resource data
     */
    getCompactResource(url: string, oslc_version?: string, accept?: string): Promise<Compact>;
    /**
     * Update an existing OSLC resource
     *
     * @param {OSLCResource} resource - The resource to update
     * @param {string} eTag - Optional ETag for optimistic concurrency control
     * @param {string} oslc_version - OSLC version to use, defaults to 2.0
     * @returns the updated resource
     */
    putResource(resource: OSLCResource, eTag?: string | null, oslc_version?: string): Promise<OSLCResource>;
    /**
     * Create a new OSLC resource
     *
     * @param {string|NamedNode} resourceType - The OSLC resource type
     * @param {OSLCResource} resource - The resource to create
     * @param {string} oslc_version - OSLC version to use, defaults to 2.0
     * @returns the created resource with its new URI
     */
    createResource(resourceType: string | NamedNode, resource: OSLCResource, oslc_version?: string): Promise<OSLCResource>;
    /**
     * Delete an OSLC resource
     *
     * @param {OSLCResource} resource - The resource to delete
     * @param {string} oslc_version - OSLC version to use, defaults to 2.0
     */
    deleteResource(resource: OSLCResource, oslc_version?: string): Promise<void>;
    /**
     * Query for OSLC resources and return them as OSLCResource objects
     *
     * @param {string|NamedNode} resourceType - The OSLC resource type to query
     * @param {QueryParams} query - The OSLC query parameters
     * @returns an array of OSLCResource objects
     */
    queryResources(resourceType: string | NamedNode, query: QueryParams): Promise<OSLCResource[]>;
    /**
     * Query for OSLC resources and return the RDF graph
     *
     * @param {string|NamedNode} resourceType - The OSLC resource type to query
     * @param {QueryParams} query - The OSLC query parameters
     * @returns an RDF IndexedFormula containing all query results
     */
    query(resourceType: string | NamedNode, query: QueryParams): Promise<IndexedFormula>;
    /**
     * Query using a specific query base URL
     *
     * @param {string} queryBase - The query base URL
     * @param {QueryParams} query - The OSLC query parameters
     * @returns an RDF IndexedFormula containing all query results
     */
    queryWithBase(queryBase: string, query: QueryParams): Promise<IndexedFormula>;
    /**
     * Get the owner name for a resource URL (with caching)
     *
     * @param {string} url - The URL of the owner resource
     * @returns the owner's name
     */
    getOwner(url: string): Promise<string>;
    /**
     * Get the query base URL for a resource type
     *
     * @param {string} resourceType - The resource type
     * @returns the query base URL
     */
    getQueryBase(resourceType: string): Promise<string>;
    /**
     * Get the creation factory URL for a resource type
     *
     * @param {string} resourceType - The resource type
     * @returns the creation factory URL
     */
    getCreationFactory(resourceType: string): Promise<string>;
}
