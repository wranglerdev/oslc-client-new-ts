/*
 * Copyright 2014 IBM Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { IndexedFormula } from 'rdflib';
import * as $rdf from 'rdflib';
import OSLCResource from './OSLCResource.js';
import { dcterms } from './namespaces.js';

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
  constructor(uri: string, store: IndexedFormula, etag: string | undefined = undefined) {
    // Parse the RDF source into an internal representation for future use
    super(uri, store, etag);
  }

  /**
   * Get the ServiceProvider with the given service provider name. This will also load all the
   * services for that service provider so they are available for use.
   *
   * @param {string} serviceProviderTitle - the dcterms:title of the service provider (e.g., an EWM project area)
   * @returns {string|undefined} serviceProviderURL - the matching ServiceProvider URL from the service provider catalog
   */
  serviceProvider(serviceProviderTitle: string): string | undefined {
    const sp = this.store.statementsMatching(
      undefined,
      dcterms('title'),
      $rdf.literal(serviceProviderTitle, this.store.sym('http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral'))
    );
    if (!sp || sp.length === 0) {
      return undefined;
    } else {
      return sp[0].subject.value;
    }
  }
}
