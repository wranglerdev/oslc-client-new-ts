# OSLCResource API Reference

`OSLCResource` is the base class for all OSLC resources. It wraps an RDF graph (rdflib `IndexedFormula`) and provides convenient methods for getting and setting properties.

**Source:** `src/OSLCResource.ts:43`

## Philosophy

OSLCResource follows the **open-world assumption**:
- Any property can be single-valued, multi-valued, or undefined
- Accessing a non-existent property returns `undefined` (not an error)
- Properties can be added dynamically
- Generic enough to work with any OSLC domain

## Constructor

### `new OSLCResource(uri?, store?, etag?)`

Creates a new OSLC resource.

**Source:** `src/OSLCResource.ts:49`

**Parameters:**
- `uri` (string | null, optional) - Resource URI (creates blank node if not provided)
- `store` (IndexedFormula | null, optional) - RDF graph (creates empty graph if not provided)
- `etag` (string | null, optional) - HTTP ETag for optimistic concurrency

**Returns:** `OSLCResource` instance

**Examples:**

```typescript
import { OSLCResource } from './oslc/index.js';
import * as $rdf from 'rdflib';

// Create an empty resource (for new resources to be created)
const resource = new OSLCResource();

// Create with a URI (typically when fetched from server)
const resource = new OSLCResource(
  'https://server.com/ccm/resource/.../WorkItem/12345',
  $rdf.graph(),
  'W/123456'
);
```

## Properties

### `uri` (readonly)

The resource's URI as a `NamedNode` or `BlankNode`.

**Source:** `src/OSLCResource.ts:44`

```typescript
const resource = new OSLCResource('https://server.com/ccm/resource/123');
console.log(resource.uri);  // NamedNode { value: 'https://...' }
console.log(resource.uri.value);  // 'https://...'
```

### `store` (readonly)

The RDF graph (`IndexedFormula`) containing the resource's data.

**Source:** `src/OSLCResource.ts:45`

```typescript
const resource = await client.getResource(url) as OSLCResource;
console.log(resource.store);  // IndexedFormula with RDF triples
```

### `etag` (readonly)

The HTTP ETag for optimistic concurrency control.

**Source:** `src/OSLCResource.ts:46`

```typescript
const resource = await client.getResource(url) as OSLCResource;
console.log(resource.etag);  // "W/123456" or undefined
```

### `queryURI` (readonly)

The original query URI (may include query parameters).

**Source:** `src/OSLCResource.ts:47`

## Core Methods

### `getURI()`

Get the resource URI as a string.

**Source:** `src/OSLCResource.ts:64`

**Returns:** `string` - Resource URI

**Example:**
```typescript
const resource = await client.getResource(url) as OSLCResource;
console.log(resource.getURI());
// "https://server.com/ccm/resource/itemName/com.ibm.team.workitem.WorkItem/12345"
```

### `get(property)`

Get a property value from the resource.

**Source:** `src/OSLCResource.ts:77`

**Parameters:**
- `property` (string | NamedNode) - Property URI or NamedNode

**Returns:** `PropertyValue` - `string | string[] | undefined`
- Single value → returns the string value
- Multiple values → returns array of strings
- No values → returns `undefined`

**Examples:**

```typescript
import { dcterms, oslc_cm } from './oslc/namespaces.js';

const resource = await client.getResource(url) as OSLCResource;

// Using namespace helper
const title = resource.get(dcterms('title'));
console.log(title);  // "Login page crashes"

// Using full URI string
const status = resource.get('http://open-services.net/ns/cm#status');
console.log(status);  // "Open"

// Multi-valued property
const contributors = resource.get(dcterms('contributor'));
console.log(contributors);
// ["https://server.com/jts/users/alice", "https://server.com/jts/users/bob"]

// Non-existent property (open-world assumption)
const customProp = resource.get('http://example.com/nonexistent');
console.log(customProp);  // undefined (not an error!)
```

### `set(property, value)`

Set a property value on the resource.

**Source:** `src/OSLCResource.ts:168`

**Parameters:**
- `property` (string | NamedNode) - Property URI or NamedNode
- `value` (RDFNode | RDFNode[] | undefined) - New value(s) to set
  - `undefined` → removes the property
  - Single value → sets single value
  - Array → sets multiple values

**Returns:** `void`

**Important:** This **replaces all existing values** for the property.

**Examples:**

```typescript
import * as $rdf from 'rdflib';
import { dcterms, oslc_cm } from './oslc/namespaces.js';

const resource = new OSLCResource();

// Set a literal value
resource.set(dcterms('title'), $rdf.literal('My Work Item'));

// Set a URI reference
resource.set(
  dcterms('creator'),
  $rdf.sym('https://server.com/jts/users/alice')
);

// Set multiple values
resource.set(dcterms('contributor'), [
  $rdf.sym('https://server.com/jts/users/bob'),
  $rdf.sym('https://server.com/jts/users/charlie')
]);

// Remove a property
resource.set(oslc_cm('blockedBy'), undefined);

// Using full URI strings
resource.set(
  'http://open-services.net/ns/cm#status',
  $rdf.literal('In Progress')
);
```

**RDF Node Types:**

```typescript
// Literal (string, number, date, etc.)
$rdf.literal('Hello')
$rdf.literal('42', null, $rdf.sym('http://www.w3.org/2001/XMLSchema#integer'))
$rdf.literal('2024-01-15T10:30:00Z', null, $rdf.sym('http://www.w3.org/2001/XMLSchema#dateTime'))

// Named Node (URI reference)
$rdf.sym('https://server.com/resource/123')

// Blank Node
$rdf.blankNode()
```

## Common Property Accessors

Convenience methods for frequently-used OSLC properties:

### `getIdentifier()`

Get `dcterms:identifier`.

**Source:** `src/OSLCResource.ts:101`

**Returns:** `string | undefined`

```typescript
const id = resource.getIdentifier();
console.log(id);  // "12345"
```

### `getTitle()`

Get `dcterms:title`.

**Source:** `src/OSLCResource.ts:111`

**Returns:** `string | undefined`

```typescript
const title = resource.getTitle();
console.log(title);  // "Bug: Login fails"
```

### `setTitle(value)`

Set `dcterms:title`.

**Source:** `src/OSLCResource.ts:141`

**Parameters:**
- `value` (string) - New title

```typescript
resource.setTitle('Updated: Login bug fixed');
```

### `getDescription()`

Get `dcterms:description`.

**Source:** `src/OSLCResource.ts:131`

**Returns:** `string | undefined`

```typescript
const description = resource.getDescription();
console.log(description);  // "Steps to reproduce: ..."
```

### `setDescription(value)`

Set `dcterms:description`.

**Source:** `src/OSLCResource.ts:150`

**Parameters:**
- `value` (string) - New description

```typescript
resource.setDescription('Updated description with more details...');
```

### `getShortTitle()`

Get `oslc:shortTitle`.

**Source:** `src/OSLCResource.ts:121`

**Returns:** `string | undefined`

```typescript
const shortTitle = resource.getShortTitle();
console.log(shortTitle);  // "12345" or abbreviated title
```

## Utility Methods

### `getLinkTypes()`

Get all link types (ObjectProperties) in the resource.

**Source:** `src/OSLCResource.ts:186`

**Returns:** `Set<string>` - Set of property URIs that point to other resources

**Example:**
```typescript
const linkTypes = resource.getLinkTypes();
console.log(linkTypes);
// Set {
//   'http://purl.org/dc/terms/creator',
//   'http://open-services.net/ns/cm#tracksRequirement',
//   'http://open-services.net/ns/cm#relatedChangeRequest'
// }

// Check if a specific link exists
if (linkTypes.has('http://open-services.net/ns/cm#tracksRequirement')) {
  const requirements = resource.get(oslc_cm('tracksRequirement'));
  console.log('Tracked requirements:', requirements);
}
```

### `getProperties()`

Get all properties as a plain JavaScript object.

**Source:** `src/OSLCResource.ts:200`

**Returns:** `Record<string, PropertyValue>` - Object with property URIs as keys

**Example:**
```typescript
const props = resource.getProperties();
console.log(JSON.stringify(props, null, 2));
// {
//   "http://purl.org/dc/terms/title": "Login bug",
//   "http://purl.org/dc/terms/identifier": "12345",
//   "http://open-services.net/ns/cm#status": "Open",
//   "http://open-services.net/ns/cm#priority": "High",
//   "http://purl.org/dc/terms/contributor": [
//     "https://server.com/jts/users/alice",
//     "https://server.com/jts/users/bob"
//   ]
// }
```

## Common Usage Patterns

### Reading Properties

```typescript
import { dcterms, oslc_cm } from './oslc/namespaces.js';

const resource = await client.getResource(url) as OSLCResource;

// Standard properties
console.log('Title:', resource.getTitle());
console.log('ID:', resource.getIdentifier());
console.log('Description:', resource.getDescription());

// Custom properties
const priority = resource.get(oslc_cm('priority'));
const status = resource.get(oslc_cm('status'));
const creator = resource.get(dcterms('creator'));

console.log(`Priority: ${priority}, Status: ${status}`);

// Handling multi-valued properties
const contributors = resource.get(dcterms('contributor'));
if (Array.isArray(contributors)) {
  console.log('Contributors:', contributors.join(', '));
} else if (contributors) {
  console.log('Contributor:', contributors);
}
```

### Creating a New Resource

```typescript
import { OSLCResource } from './oslc/index.js';
import { dcterms, oslc_cm } from './oslc/namespaces.js';
import * as $rdf from 'rdflib';

// Create empty resource
const defect = new OSLCResource();

// Set standard properties
defect.setTitle('Critical authentication bug');
defect.setDescription('Users cannot log in after password reset');

// Set domain-specific properties
defect.set(dcterms('type'), $rdf.literal('Defect'));
defect.set(oslc_cm('status'), $rdf.literal('New'));
defect.set(oslc_cm('priority'), $rdf.literal('High'));
defect.set(oslc_cm('severity'), $rdf.literal('Critical'));

// Create on server
const created = await client.createResource(oslc_cm('ChangeRequest'), defect);
console.log('Created:', created.getURI());
```

### Updating Properties

```typescript
// Get existing resource
const resource = await client.getResource(url) as OSLCResource;

// Update properties
resource.setTitle('RESOLVED: ' + resource.getTitle());
resource.set(oslc_cm('status'), $rdf.literal('Resolved'));
resource.set(oslc_cm('resolution'), $rdf.literal('Fixed'));

// Save changes
await client.putResource(resource, resource.etag);
```

### Working with Links

```typescript
import * as $rdf from 'rdflib';

// Link to a requirement
const requirementURI = 'https://server.com/rm/resources/_abc123';
workItem.set(
  oslc_cm('tracksRequirement'),
  $rdf.sym(requirementURI)
);

// Link to multiple test cases
const testCaseURIs = [
  'https://server.com/qm/resources/testcase/456',
  'https://server.com/qm/resources/testcase/789'
];
workItem.set(
  oslc_cm('testedByTestCase'),
  testCaseURIs.map(uri => $rdf.sym(uri))
);

// Save
await client.putResource(workItem, workItem.etag);
```

### Copying Properties

```typescript
const source = await client.getResource(sourceURL) as OSLCResource;
const target = new OSLCResource();

// Copy specific properties
target.setTitle(source.getTitle() || '');
target.setDescription(source.getDescription() || '');

// Copy custom property
const priority = source.get(oslc_cm('priority'));
if (priority && typeof priority === 'string') {
  target.set(oslc_cm('priority'), $rdf.literal(priority));
}

// Create the copy
await client.createResource(oslc_cm('ChangeRequest'), target);
```

### Conditional Property Updates

```typescript
const resource = await client.getResource(url) as OSLCResource;

// Only update if property exists
const currentStatus = resource.get(oslc_cm('status'));
if (currentStatus === 'Open') {
  resource.set(oslc_cm('status'), $rdf.literal('In Progress'));
  await client.putResource(resource, resource.etag);
}

// Add value to multi-valued property
const existingContributors = resource.get(dcterms('contributor'));
const contributorsArray = Array.isArray(existingContributors)
  ? existingContributors
  : existingContributors ? [existingContributors] : [];

contributorsArray.push('https://server.com/jts/users/newperson');

resource.set(
  dcterms('contributor'),
  contributorsArray.map(uri => $rdf.sym(uri))
);

await client.putResource(resource, resource.etag);
```

### Inspecting Resource Structure

```typescript
const resource = await client.getResource(url) as OSLCResource;

// Get all properties
const allProps = resource.getProperties();
console.log('All properties:', Object.keys(allProps));

// Get all links (URI references)
const linkTypes = resource.getLinkTypes();
console.log('Link types:', Array.from(linkTypes));

// Detailed inspection
for (const propURI of Object.keys(allProps)) {
  const value = allProps[propURI];
  console.log(`${propURI}:`);
  if (Array.isArray(value)) {
    console.log(`  Multiple values (${value.length}):`);
    value.forEach(v => console.log(`    - ${v}`));
  } else {
    console.log(`  ${value}`);
  }
}
```

## Working with RDF Directly

For advanced use cases, access the underlying RDF store:

```typescript
import * as $rdf from 'rdflib';
import { dcterms } from './oslc/namespaces.js';

const resource = await client.getResource(url) as OSLCResource;

// Get all statements about this resource
const statements = resource.store.statementsMatching(
  resource.uri,
  null,  // any predicate
  null   // any object
);

console.log(`Resource has ${statements.length} statements`);

for (const stmt of statements) {
  console.log('Predicate:', stmt.predicate.value);
  console.log('Object:', stmt.object.value);
}

// Query with SPARQL (if supported by rdflib version)
const query = `
  PREFIX dcterms: <http://purl.org/dc/terms/>
  SELECT ?title WHERE {
    ?s dcterms:title ?title .
  }
`;

// Add custom statements
resource.store.add(
  resource.uri,
  dcterms('custom'),
  $rdf.literal('custom value')
);
```

## Type Information

```typescript
// PropertyValue type
type PropertyValue = string | string[] | undefined;

// RDFNode types
import type { NamedNode, Literal, BlankNode } from 'rdflib/lib/tf-types';
type RDFNode = NamedNode | Literal | BlankNode;

// Resource interface
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

## Best Practices

### 1. Always Check for Undefined

```typescript
// Good
const title = resource.getTitle();
if (title) {
  console.log('Title:', title);
}

// Or with default
const title = resource.getTitle() || 'Untitled';
```

### 2. Handle Multi-Valued Properties

```typescript
const contributors = resource.get(dcterms('contributor'));

// Safe handling
const contributorList = Array.isArray(contributors)
  ? contributors
  : contributors ? [contributors] : [];

contributorList.forEach(c => console.log(c));
```

### 3. Use Namespaces

```typescript
// Good - readable and maintainable
import { dcterms, oslc_cm } from './oslc/namespaces.js';
resource.get(dcterms('title'));

// Avoid - error-prone
resource.get('http://purl.org/dc/terms/title');
```

### 4. Preserve ETags

```typescript
// Good - optimistic concurrency control
const resource = await client.getResource(url) as OSLCResource;
// ... modify resource ...
await client.putResource(resource, resource.etag);

// Risky - no conflict detection
await client.putResource(resource);
```

## Related Documentation

- [OSLCClient](./OSLCClient.md) - Main client class
- [Namespaces](./namespaces.md) - RDF namespace definitions
- [Types](./types.md) - TypeScript type definitions
- [Getting Started](../getting-started) - Usage examples
