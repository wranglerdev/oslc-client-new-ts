/*
 * Copyright 2014 IBM Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as $rdf from 'rdflib';
import type { IndexedFormula } from 'rdflib';
import type { NamedNode, BlankNode } from 'rdflib/lib/tf-types';
import { dcterms, oslc } from './namespaces.js';
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
  public readonly uri: NamedNode | BlankNode;
  public readonly store: IndexedFormula;
  public readonly etag?: string;
  public readonly queryURI?: string;

  constructor(uri: string | null = null, store: IndexedFormula | null = null, etag: string | null = null) {
    if (uri) {
      this.queryURI = uri;
      const resourceURI = new URL(uri);
      this.uri = $rdf.sym(resourceURI.origin + resourceURI.pathname);
      this.store = store || $rdf.graph();
      this.etag = etag ?? undefined;
    } else {
      // construct an empty resource
      this.uri = $rdf.blankNode();
      this.store = $rdf.graph();
      this.etag = undefined;
    }
  }

  getURI(): string {
    return this.uri.value;
  }

  /**
   * Get a property of the resource. This method assumes any property could
   * be multi-valued or undefined. Based on open-world assumptions, it is not
   * considered an error to attempt to get a property that doesn't exist. This
   * would simply return undefined.
   *
   * @param {string|NamedNode} property - the RDF property to get
   * @returns - undefined, single object URL or literal value, or array of values
   */
  get(property: string | NamedNode): PropertyValue {
    const p = typeof property === 'string' ? this.store.sym(property) : property;
    const result = this.store.each(this.uri, p);
    if (result.length === 1) {
      return result[0].value;
    } else if (result.length > 1) {
      return result.map((v) => v.value);
    } else {
      return undefined;
    }
  }

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
  getIdentifier(): string | undefined {
    const result = this.get(dcterms('identifier'));
    return Array.isArray(result) ? result[0] : result;
  }

  /**
   * Get the resource dcterms:title
   *
   * @returns {string} - dcterms:title value(s)
   */
  getTitle(): string | undefined {
    const result = this.get(dcterms('title'));
    return Array.isArray(result) ? result[0] : result;
  }

  /**
   * Get the resource oslc:shortTitle
   *
   * @returns {string} - oslc:shortTitle value
   */
  getShortTitle(): string | undefined {
    const result = this.get(oslc('shortTitle'));
    return Array.isArray(result) ? result[0] : result;
  }

  /**
   * Get the resource dcterms:description
   *
   * @returns {string} - dcterms:description value
   */
  getDescription(): string | undefined {
    const result = this.get(dcterms('description'));
    return Array.isArray(result) ? result[0] : result;
  }

  /**
   * Set the resource dcterms:title
   *
   * @param {string} value - dcterms:title value
   */
  setTitle(value: string): void {
    this.set(dcterms('title'), $rdf.literal(value));
  }

  /**
   * Set the resource dcterms:description
   *
   * @param {string} value - dcterms:description value
   */
  setDescription(value: string): void {
    this.set(dcterms('description'), $rdf.literal(value));
  }

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
  set(property: string | NamedNode, value: RDFNode | RDFNode[] | undefined): void {
    // first remove the current values
    const p = typeof property === 'string' ? this.store.sym(property) : property;
    const subject = this.uri;
    this.store.remove(this.store.statementsMatching(subject, p, undefined));
    if (typeof value === 'undefined') return;
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        this.store.add(subject, p, value[i]);
      }
    } else {
      this.store.add(subject, p, value);
    }
  }

  /**
   * Return a Set of link types (i.e. ObjectProperties) provided by this resource
   */
  getLinkTypes(): Set<string> {
    const linkTypes = new Set<string>();
    const statements = this.store.statementsMatching(this.uri, undefined, undefined);
    for (const statement of statements) {
      if (statement.object instanceof $rdf.NamedNode) {
        linkTypes.add(statement.predicate.value);
      }
    }
    return linkTypes;
  }

  /**
   * Return an object of name-value pairs for all properties of this resource
   */
  getProperties(): Record<string, PropertyValue> {
    const result: Record<string, PropertyValue> = {};
    const statements = this.store.statementsMatching(this.uri, undefined, undefined);
    for (const statement of statements) {
      const key = statement.predicate.value;
      const value = statement.object.value;

      if (result[key] != null) {
        if (!Array.isArray(result[key])) {
          result[key] = [result[key] as string];
        }
        (result[key] as string[]).push(value);
      } else {
        result[key] = value;
      }
    }
    return result;
  }
}
