import type { IndexedFormula } from 'rdflib';
import type { NamedNode, BlankNode } from 'rdflib/lib/tf-types';
import type { IOSLCResource, PropertyValue, RDFNode } from './types.js';
/**
 * This is a generic OSLC resource. Properties for
 * a particular domain resource will be added dynamically
 * when it is read. This allows OSLCResource to be used
 * on any domain without change or extension.
 *
 * However, subclasses may be created for any OSLC domain
 * as a convenience for those domain resources.
 *
 * OSLCResource is a class wrapper on an rdflib Store.
 * Some common OSLC properties are accessed directly through
 * accessor methods. Other properties are accessed through the
 * get and set property methods through reflection.
 *
 * @author Jim Amsden
 * @class
 * @param {string} uri - the URI sym of this resource
 * @param {IndexedFormula} store - the Knowledge Base that contains the resource RDF graph
 * @param {string} etag - the HTTP ETag for this resource
 */
export default class OSLCResource implements IOSLCResource {
    readonly uri: NamedNode | BlankNode;
    readonly store: IndexedFormula;
    readonly etag?: string;
    readonly queryURI?: string;
    constructor(uri?: string | null, store?: IndexedFormula | null, etag?: string | null);
    getURI(): string;
    /**
     * Get a property of the resource. This method assumes any property could
     * be multi-valued or undefined. Based on open-world assumptions, it is not
     * considered an error to attempt to get a property that doesn't exist. This
     * would simply return undefined.
     *
     * @param {string|NamedNode} property - the RDF property to get
     * @returns - undefined, single object URL or literal value, or array of values
     */
    get(property: string | NamedNode): PropertyValue;
    /**
     * The following accessor functions are for common OSLC core vocabulary
     * that most OSLC resources are likely to have. Subclasses for OSLC domain
     * vocabularies would likely add additional accessor methods for the
     * properties defined in their domain specification.
     */
    /**
     * Get the resource dcterms:identifier
     *
     * @returns {string} - dcterms:identifier value
     */
    getIdentifier(): string | undefined;
    /**
     * Get the resource dcterms:title
     *
     * @returns {string} - dcterms:title value(s)
     */
    getTitle(): string | undefined;
    /**
     * Get the resource oslc:shortTitle
     *
     * @returns {string} - oslc:shortTitle value
     */
    getShortTitle(): string | undefined;
    /**
     * Get the resource dcterms:description
     *
     * @returns {string} - dcterms:description value
     */
    getDescription(): string | undefined;
    /**
     * Set the resource dcterms:title
     *
     * @param {string} value - dcterms:title value
     */
    setTitle(value: string): void;
    /**
     * Set the resource dcterms:description
     *
     * @param {string} value - dcterms:description value
     */
    setDescription(value: string): void;
    /**
     * Set a property of the resource. This method assumes any property could
     * be multi-valued or undefined. Based on open-world assumptions, it is not
     * considered an error to attempt to set a property that doesn't exist. So
     * set can be used to add new properties. Using undefined for the value will
     * remove the property.
     *
     * If the property is multi-valued, the caller should include all the desired
     * values since the property will be completely replaced with the new value.
     *
     * @param {string|NamedNode} property - the RDF property to set
     * @param {RDFNode|RDFNode[]|undefined} value - the new value, all old values will be removed
     * @returns {void}
     */
    set(property: string | NamedNode, value: RDFNode | RDFNode[] | undefined): void;
    /**
     * Return a Set of link types (i.e. ObjectProperties) provided by this resource
     */
    getLinkTypes(): Set<string>;
    /**
     * Return an object of name-value pairs for all properties of this resource
     */
    getProperties(): Record<string, PropertyValue>;
}
