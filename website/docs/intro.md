# OSLC Client for TypeScript

A TypeScript client library for interacting with OSLC (Open Services for Lifecycle Collaboration) servers, specifically designed for IBM Jazz/ELM applications.

## Documentation Overview

### Getting Started
- [What is OSLC?](./what-is-oslc) - Introduction to OSLC standard
- [IBM Jazz & ELM](./ibm-jazz-elm) - Understanding IBM's lifecycle management tools
- [Why This Client?](./why-this-client) - Benefits of using this TypeScript client
- [Getting Started](./getting-started) - Quick start guide

### API Reference
- [OSLCClient](./api/OSLCClient.md) - Main client for OSLC operations
- [OSLCResource](./api/OSLCResource.md) - Generic OSLC resource wrapper
- [RootServices](./api/RootServices.md) - Jazz rootservices discovery
- [ServiceProviderCatalog](./api/ServiceProviderCatalog.md) - OSLC service catalog
- [ServiceProvider](./api/ServiceProvider.md) - OSLC service provider with capabilities
- [Compact](./api/Compact.md) - OSLC compact resources for UI previews
- [Types](./api/types.md) - TypeScript type definitions
- [Namespaces](./api/namespaces.md) - RDF namespace definitions

### Installation
- [Manual Installation](./manual-installation) - Copy source files directly into your project

## Quick Example

```typescript
import OSLCClient from './src/index.js';
import { oslc_cm } from './src/namespaces.js';

// Create client
const client = new OSLCClient('username', 'password');

// Connect to a service provider
await client.use('https://your-server.com/ccm', 'Your Project Area', 'CM');

// Query for change requests
const resources = await client.queryResources(
  oslc_cm('ChangeRequest'),
  {
    select: 'dcterms:title,dcterms:identifier',
    where: 'dcterms:type="Defect"'
  }
);

// Create a new change request
const newResource = new OSLCResource();
newResource.setTitle('Bug: Login fails on Safari');
const created = await client.createResource(oslc_cm('ChangeRequest'), newResource);
```

## Features

- **Full OSLC 2.0 Support** - Complete implementation of OSLC Core 2.0
- **RDF-Based** - Built on rdflib for robust RDF graph handling
- **Multi-Environment** - Works in Node.js and modern browsers
- **Authentication** - Supports JEE Form, jauth realm, and Basic Auth
- **TypeScript** - Full type safety and IntelliSense support
- **Jazz/ELM Ready** - Designed specifically for IBM Jazz and ELM servers

## License

Apache License 2.0 - See source files for details.
