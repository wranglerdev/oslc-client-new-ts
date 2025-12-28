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
import type { Quad_Subject } from 'rdflib/lib/tf-types';
import { oslc } from './namespaces.js';
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
  constructor(uri: string, store: IndexedFormula) {
    super(uri, store);
  }

  /**
   * Get the short title of the compact resource
   * @returns {string|undefined}
   */
  getShortTitle(): string | undefined {
    const result = this.get(oslc('shortTitle'));
    return Array.isArray(result) ? result[0] : result;
  }

  /**
   * Get the icon URL
   * @returns {string|undefined}
   */
  getIcon(): string | undefined {
    const result = this.get(oslc('icon'));
    return Array.isArray(result) ? result[0] : result;
  }

  /**
   * Get the icon title
   * @returns {string|undefined}
   */
  getIconTitle(): string | undefined {
    const result = this.get(oslc('iconTitle'));
    return Array.isArray(result) ? result[0] : result;
  }

  /**
   * Get the icon source set
   * @returns {string|undefined}
   */
  getIconSrcSet(): string | undefined {
    const result = this.get(oslc('iconSrcSet'));
    return Array.isArray(result) ? result[0] : result;
  }

  /**
   * Get the small preview information
   * @returns {PreviewInfo|null}
   */
  getSmallPreview(): PreviewInfo | null {
    const preview = this.store.the(this.uri, oslc('smallPreview'));
    if (!preview) return null;
    const hintHeight = this.store.the(preview as Quad_Subject, oslc('hintHeight'));
    const hintWidth = this.store.the(preview as Quad_Subject, oslc('hintWidth'));
    const document = this.store.the(preview as Quad_Subject, oslc('document'));
    return {
      document: document?.value || '',
      hintHeight: hintHeight ? hintHeight.value : undefined,
      hintWidth: hintWidth ? hintWidth.value : undefined,
    };
  }

  /**
   * Get the large preview information
   * @returns {PreviewInfo|null}
   */
  getLargePreview(): PreviewInfo | null {
    const preview = this.store.the(this.uri, oslc('largePreview'));
    if (!preview) return null;
    const hintHeight = this.store.the(preview as Quad_Subject, oslc('hintHeight'));
    const hintWidth = this.store.the(preview as Quad_Subject, oslc('hintWidth'));
    const document = this.store.the(preview as Quad_Subject, oslc('document'));
    return {
      document: document?.value || '',
      hintHeight: hintHeight ? hintHeight.value : undefined,
      hintWidth: hintWidth ? hintWidth.value : undefined,
    };
  }
}
