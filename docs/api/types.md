# Types API Reference

TypeScript type definitions for the OSLC client.

**Source:** `src/types.ts`

## RDF Types

### `RDFNode`

Union type for RDF graph nodes.

**Source:** `src/types.ts:9`

```typescript
type RDFNode = NamedNode | Literal | BlankNode;
```

**Usage:**
```typescript
import * as $rdf from 'rdflib';
import type { RDFNode } from './oslc/types.js';

// Named node (URI reference)
const node1: RDFNode = $rdf.sym('https://server.com/resource/123');

// Literal value
const node2: RDFNode = $rdf.literal('Hello World');

// Blank node
const node3: RDFNode = $rdf.blankNode();
```

### `PropertyValue`

Value type returned by `OSLCResource.get()`.

**Source:** `src/types.ts:10`

```typescript
type PropertyValue = string | string[] | undefined;
```

**Usage:**
```typescript
const title = resource.get(dcterms('title'));
// title: string | string[] | undefined

// Handle different cases
if (Array.isArray(title)) {
  console.log('Multiple values:', title);
} else if (title) {
  console.log('Single value:', title);
} else {
  console.log('Property not found');
}
```

## Interfaces

### `IOSLCResource`

Base interface for OSLC resources.

**Source:** `src/types.ts:15`

```typescript
interface IOSLCResource {
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
```

**Usage:**
```typescript
import type { IOSLCResource } from './oslc/types.js';

function processResource(resource: IOSLCResource) {
  console.log('URI:', resource.getURI());
  console.log('Title:', resource.getTitle());

  const allProps = resource.getProperties();
  console.log('Properties:', Object.keys(allProps));
}
```

### `OSLCClientConfig`

Configuration for creating an OSLC client.

**Source:** `src/types.ts:39`

```typescript
interface OSLCClientConfig {
  username: string;
  password: string;
  configurationContext?: string;
}
```

**Usage:**
```typescript
import type { OSLCClientConfig } from './oslc/types.js';

const config: OSLCClientConfig = {
  username: 'myuser',
  password: 'mypassword',
  configurationContext: 'https://server.com/gc/configuration/1234'
};

const client = new OSLCClient(
  config.username,
  config.password,
  config.configurationContext
);
```

### `QueryParams`

OSLC query parameters.

**Source:** `src/types.ts:53`

```typescript
interface QueryParams {
  prefix?: string;   // Namespace prefix declarations
  select?: string;   // Properties to return (comma-separated)
  where?: string;    // Filter expression
  orderBy?: string;  // Sort order (+asc, -desc)
}
```

**Usage:**
```typescript
import type { QueryParams } from './oslc/types.js';
import { oslc_cm } from './oslc/namespaces.js';

const query: QueryParams = {
  prefix: 'dcterms=<http://purl.org/dc/terms/>,oslc_cm=<http://open-services.net/ns/cm#>',
  select: 'dcterms:title,dcterms:identifier,oslc_cm:status',
  where: 'oslc_cm:status="Open" and oslc_cm:priority="High"',
  orderBy: '-dcterms:modified'  // Descending by modification date
};

const results = await client.queryResources(oslc_cm('ChangeRequest'), query);
```

**Field Details:**

#### `prefix`
Namespace prefix declarations in the format:
```typescript
prefix: 'prefix1=<uri1>,prefix2=<uri2>'
```

Example:
```typescript
prefix: 'dcterms=<http://purl.org/dc/terms/>,oslc_cm=<http://open-services.net/ns/cm#>'
```

#### `select`
Comma-separated list of properties to return:
```typescript
select: 'dcterms:title,dcterms:identifier,oslc_cm:status'
```

#### `where`
Filter expression using OSLC query syntax:
```typescript
where: 'dcterms:type="Defect" and oslc_cm:status="Open"'
```

Operators: `=`, `!=`, `<`, `>`, `<=`, `>=`, `and`, `or`, `contains`, `in`

#### `orderBy`
Sort order with `+` (ascending) or `-` (descending):
```typescript
orderBy: '+dcterms:created'   // Oldest first
orderBy: '-dcterms:modified'  // Newest first
```

### `PreviewInfo`

Preview information for OSLC Compact resources.

**Source:** `src/types.ts:63`

```typescript
interface PreviewInfo {
  document: string;      // Preview HTML document URL
  hintHeight?: string;   // Suggested height (e.g., "200px")
  hintWidth?: string;    // Suggested width (e.g., "400px")
}
```

**Usage:**
```typescript
import type { PreviewInfo } from './oslc/types.js';

const compact = await client.getCompactResource(compactURL);
const preview: PreviewInfo | null = compact.getSmallPreview();

if (preview) {
  const iframe = document.createElement('iframe');
  iframe.src = preview.document;
  iframe.width = preview.hintWidth || '400px';
  iframe.height = preview.hintHeight || '200px';
  document.body.appendChild(iframe);
}
```

### `SPARQLBinding`

Single result row from a SPARQL query.

**Source:** `src/types.ts:77`

```typescript
interface SPARQLBinding {
  [key: string]: { value: string; type?: string };
}
```

**Usage:**
```typescript
import type { SPARQLBinding } from './oslc/types.js';

const binding: SPARQLBinding = {
  title: { value: 'Login Bug', type: 'literal' },
  identifier: { value: '12345', type: 'literal' },
  creator: { value: 'https://server.com/users/alice', type: 'uri' }
};

console.log(binding.title.value);  // "Login Bug"
```

### `SPARQLResults`

Array of SPARQL query results.

**Source:** `src/types.ts:84`

```typescript
type SPARQLResults = SPARQLBinding[];
```

**Usage:**
```typescript
import type { SPARQLResults } from './oslc/types.js';

// Internal use (ServiceProvider uses this for SPARQL queries)
const query = `
  PREFIX oslc: <http://open-services.net/ns/core#>
  SELECT ?qb WHERE {
    ?sp oslc:service ?s .
    ?s oslc:queryCapability ?qc .
    ?qc oslc:resourceType <${resourceType}> .
    ?qc oslc:queryBase ?qb .
  }
`;

const results: SPARQLResults = sp.store.querySync(query);

for (const row of results) {
  console.log('Query base:', row.qb.value);
}
```

## Type Enums

### `AuthMethod`

Authentication method types (for reference).

**Source:** `src/types.ts:48`

```typescript
type AuthMethod = 'form' | 'jauth' | 'basic';
```

**Note:** This is automatically detected by OSLCClient; you don't need to specify it.

## Usage Examples

### Type-Safe Resource Handling

```typescript
import OSLCClient, { OSLCResource } from './oslc/index.js';
import type { QueryParams, PropertyValue } from './oslc/types.js';
import { oslc_cm, dcterms } from './oslc/namespaces.js';

async function typeSafeQuery(client: OSLCClient) {
  const query: QueryParams = {
    where: 'oslc_cm:status="Open"',
    select: 'dcterms:title,dcterms:identifier'
  };

  const resources: OSLCResource[] = await client.queryResources(
    oslc_cm('ChangeRequest'),
    query
  );

  for (const resource of resources) {
    const title: PropertyValue = resource.get(dcterms('title'));
    const identifier: PropertyValue = resource.get(dcterms('identifier'));

    if (typeof title === 'string') {
      console.log(`${identifier}: ${title}`);
    }
  }
}
```

### Type Guards

```typescript
import type { PropertyValue } from './oslc/types.js';

function isSingleValue(value: PropertyValue): value is string {
  return typeof value === 'string';
}

function isMultiValue(value: PropertyValue): value is string[] {
  return Array.isArray(value);
}

// Usage
const contributors = resource.get(dcterms('contributor'));

if (isMultiValue(contributors)) {
  contributors.forEach(c => console.log(c));
} else if (isSingleValue(contributors)) {
  console.log(contributors);
}
```

### Generic Resource Function

```typescript
import type { IOSLCResource } from './oslc/types.js';

function printResource(resource: IOSLCResource): void {
  console.log('=== Resource ===');
  console.log('URI:', resource.getURI());
  console.log('Title:', resource.getTitle());
  console.log('Description:', resource.getDescription());
  console.log('Identifier:', resource.getIdentifier());

  const props = resource.getProperties();
  console.log('Total properties:', Object.keys(props).length);
}

// Works with any OSLCResource subclass
printResource(workItem);
printResource(requirement);
printResource(testCase);
```

## Import Patterns

### Individual Types

```typescript
import type { QueryParams, PropertyValue, PreviewInfo } from './oslc/types.js';
```

### Wildcard Import

```typescript
import type * as OSLCTypes from './oslc/types.js';

const query: OSLCTypes.QueryParams = {...};
const value: OSLCTypes.PropertyValue = resource.get(...);
```

### With Classes

```typescript
import OSLCClient, { OSLCResource } from './oslc/index.js';
import type { QueryParams } from './oslc/types.js';
```

## Related Documentation

- [OSLCClient](./OSLCClient.md) - Main client class
- [OSLCResource](./OSLCResource.md) - Resource class
- [Namespaces](./namespaces.md) - RDF namespace definitions
- [Getting Started](../04-getting-started.md) - Usage examples
