# OSLC Client - TypeScript Version

TypeScript conversion of the oslc-client package for direct use in your projects.

## Project Structure

```
oslc-client-new-ts/
├── src/
│   ├── index.ts                    # Default export: OSLCClient
│   ├── OSLCClient.ts              # Main client (~500 lines)
│   ├── OSLCResource.ts            # Base resource class
│   ├── RootServices.ts            # Jazz rootservices
│   ├── ServiceProviderCatalog.ts  # Service provider catalog
│   ├── ServiceProvider.ts         # Service provider
│   ├── Compact.ts                 # UI preview resource
│   ├── namespaces.ts              # RDF namespaces
│   └── types.ts                   # TypeScript type definitions
├── package.json
├── tsconfig.json
└── README.md
```

## Installation

```bash
npm install
```

## Usage

### Basic Usage

```typescript
import OSLCClient from './src/index.js';

const client = new OSLCClient(username, password, configContext);
await client.use(serverUrl, 'Project Area', 'CM');

const resource = await client.getResource(url);
console.log(resource.getTitle());
```

### Creating a Resource

```typescript
import OSLCClient, { OSLCResource } from './src/index.js';
import { dcterms, oslc_cm } from './src/namespaces.js';

const client = new OSLCClient(username, password);
await client.use(serverUrl, 'Project Area', 'CM');

const newResource = new OSLCResource();
newResource.setTitle('New Work Item');
newResource.setDescription('This is a test work item');

const created = await client.createResource('ChangeRequest', newResource);
console.log('Created:', created.getURI());
```

### Querying Resources

```typescript
const resources = await client.queryResources('ChangeRequest', {
  where: 'dcterms:title="Test"',
  select: 'dcterms:title,dcterms:description'
});

for (const resource of resources) {
  console.log(resource.getTitle());
}
```

### Updating a Resource

```typescript
const resource = await client.getResource(url);
resource.setTitle('Updated Title');
await client.putResource(resource, resource.etag);
```

### Deleting a Resource

```typescript
const resource = await client.getResource(url);
await client.deleteResource(resource);
```

## Dependencies

All original dependencies are preserved:

- **axios** - HTTP client
- **rdflib** - RDF graph operations
- **@xmldom/xmldom** - XML parsing for Node.js
- **axios-cookiejar-support** - Cookie jar support
- **tough-cookie** - Cookie management

## Features

- ✅ Full TypeScript support with strict types
- ✅ Default export pattern for easy imports
- ✅ All original functionality preserved
- ✅ Service discovery (rootservices → catalog → provider)
- ✅ Multiple authentication methods (Form, jauth, Basic)
- ✅ CRUD operations on OSLC resources
- ✅ Query with automatic pagination
- ✅ ETag support for optimistic concurrency
- ✅ Configuration context support
- ✅ Owner caching

## Type Definitions

The package includes comprehensive TypeScript types:

```typescript
import type {
  IOSLCResource,
  QueryParams,
  PreviewInfo,
  PropertyValue
} from './src/types.js';
```

## Building

To compile TypeScript to JavaScript:

```bash
npm run build
```

To check types without building:

```bash
npm run typecheck
```

## Copying to Your Project

Simply copy the entire `src/` directory to your project and import as needed:

```typescript
import OSLCClient from './path/to/src/index.js';
```

## License

Copyright 2014 IBM Corporation (original implementation)

Licensed under the Apache License, Version 2.0.
