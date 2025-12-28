/*
 * TypeScript type definitions for OSLC Client
 */

import type { IndexedFormula } from 'rdflib';
import type { NamedNode, Literal, BlankNode } from 'rdflib/lib/tf-types';

// RDF types
export type RDFNode = NamedNode | Literal | BlankNode;
export type PropertyValue = string | string[] | undefined;

/**
 * Base interface for OSLC Resources
 */
export interface IOSLCResource {
  readonly uri: NamedNode | BlankNode;
  readonly store: IndexedFormula;
  readonly etag?: string;

  get(property: string | NamedNode): PropertyValue;
  set(property: string | NamedNode, value: RDFNode | RDFNode[] | undefined): void;

  getURI(): string;
  getTitle(): string | undefined;
  getDescription(): string | undefined;
  getIdentifier(): string | undefined;
  getShortTitle(): string | undefined;

  setTitle(value: string): void;
  setDescription(value: string): void;

  getLinkTypes(): Set<string>;
  getProperties(): Record<string, PropertyValue>;
}

/**
 * OSLC Client configuration
 */
export interface OSLCClientConfig {
  username: string;
  password: string;
  configurationContext?: string;
}

/**
 * Authentication method types
 */
export type AuthMethod = 'form' | 'jauth' | 'basic';

/**
 * OSLC Query parameters
 */
export interface QueryParams {
  prefix?: string;
  select?: string;
  where?: string;
  orderBy?: string;
}

/**
 * Preview information for OSLC Compact resources
 */
export interface PreviewInfo {
  document: string;
  hintHeight?: string;
  hintWidth?: string;
}

/**
 * Atom feed response structure
 */
export type AtomFeed = unknown; // TODO: Define proper Atom feed structure when needed

/**
 * SPARQL query result binding
 */
export interface SPARQLBinding {
  [key: string]: { value: string; type?: string };
}

/**
 * SPARQL query results
 */
export type SPARQLResults = SPARQLBinding[];
