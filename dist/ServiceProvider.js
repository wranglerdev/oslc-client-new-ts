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
import OSLCResource from './OSLCResource.js';
import { oslc } from './namespaces.js';
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
    constructor(uri, store, etag = undefined) {
        // Parse the RDF source into an internal representation for future use
        super(uri, store, etag);
    }
    /**
     * Get the queryBase URL for an OSLC QueryCapability with the given oslc:resourceType
     *
     * @param {string|NamedNode} resourceType - a symbol for the desired oslc:resourceType
     * @returns {string|null} the queryBase URL used to query resources of that type
     */
    getQueryBase(resourceType) {
        const resourceTypeSym = typeof resourceType === 'string' ? this.store.sym(resourceType) : resourceType;
        const services = this.store.each(this.uri, oslc('service'));
        for (const service of services) {
            const queryCapabilities = this.store.each(service, oslc('queryCapability'));
            for (const queryCapability of queryCapabilities) {
                if (this.store.statementsMatching(queryCapability, oslc('resourceType'), resourceTypeSym)
                    .length) {
                    const queryBase = this.store.the(queryCapability, oslc('queryBase'));
                    return queryBase?.value || null;
                }
            }
        }
        return null;
    }
    /**
     * Get the creation URL for an OSLC CreationFactory with the given oslc:resourceType
     *
     * @param {string|NamedNode} resourceType - a symbol for, or the name of the desired oslc:resourceType
     * @returns {string|null} the creation URL used to create resources of that type
     */
    getCreationFactory(resourceType) {
        const services = this.store.each(this.uri, oslc('service'));
        for (const service of services) {
            const creationFactories = this.store.each(service, oslc('creationFactory'));
            for (const creationFactory of creationFactories) {
                if (typeof resourceType === 'string') {
                    const types = this.store.each(creationFactory, oslc('resourceType'));
                    for (const aType of types) {
                        if (aType.value?.endsWith(resourceType)) {
                            const creation = this.store.the(creationFactory, oslc('creation'));
                            return creation?.value || null;
                        }
                    }
                }
                else if (this.store.statementsMatching(creationFactory, oslc('resourceType'), resourceType).length === 1) {
                    const creation = this.store.the(creationFactory, oslc('creation'));
                    return creation?.value || null;
                }
            }
        }
        return null;
    }
}
//# sourceMappingURL=ServiceProvider.js.map