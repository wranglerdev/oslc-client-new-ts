# Manual Installation Guide

This guide provides the complete folder structure and all source files for manual installation of the OSLC TypeScript client into your project.

## Overview

This client is designed to be **copied directly** into your project rather than installed via npm. This gives you full control over the code and eliminates dependency management concerns.

## Quick Start

### 1. Create Directory Structure

Create an `oslc` directory in your project's `src` folder:

```bash
mkdir -p src/oslc
```

### 2. Install Dependencies

```bash
npm install axios axios-cookiejar-support tough-cookie rdflib @xmldom/xmldom
```

### 3. Copy Source Files

Copy all files from the sections below into the corresponding paths in your project.

## Directory Structure

```
your-project/
├── src/
│   └── oslc/                    # OSLC client directory
│       ├── index.ts             # Main entry point
│       ├── OSLCClient.ts        # Client class
│       ├── OSLCResource.ts      # Resource base class
│       ├── RootServices.ts      # Rootservices document
│       ├── ServiceProviderCatalog.ts  # Service provider catalog
│       ├── ServiceProvider.ts   # Service provider
│       ├── Compact.ts           # Compact resources
│       ├── types.ts             # TypeScript type definitions
│       └── namespaces.ts        # RDF namespace definitions
├── package.json
└── tsconfig.json
```

## Source Files

### File 1: `src/oslc/index.ts`

**Path:** `src/oslc/index.ts`

```typescript
/*
 * @oslc-client - TypeScript OSLC Client
 *
 * Entry point for the OSLC Client library
 */

import OSLCClient from './OSLCClient.js';

// Default export for easy import
export default OSLCClient;

// Also export types for convenience
export type * from './types.js';

// Optional: export other classes if needed
export { default as OSLCResource } from './OSLCResource.js';
export { default as RootServices } from './RootServices.js';
export { default as ServiceProviderCatalog } from './ServiceProviderCatalog.js';
export { default as ServiceProvider } from './ServiceProvider.js';
export { default as Compact } from './Compact.js';

// Export namespaces
export * from './namespaces.js';
```

### File 2: `src/oslc/types.ts`

**Path:** `src/oslc/types.ts`

```typescript
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
```

### File 3: `src/oslc/namespaces.ts`

**Path:** `src/oslc/namespaces.ts`

See [Namespaces API Reference](./api/namespaces.md) for the complete file content.

**Copy from:** Repository file `src/namespaces.ts`

```typescript
/*
 * Copyright 2014 IBM Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * ...
 */

/* Defines some common namespaces for OSLC and RDF */

import { Namespace, sym } from 'rdflib';

export const rdf = Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#');
export const rdfs = Namespace('http://www.w3.org/2000/01/rdf-schema#');
export const dcterms = Namespace('http://purl.org/dc/terms/');
// ... (see repository for complete file)
```

### Files 4-10: Core Classes

For the remaining source files, please copy them directly from the repository:

- **`OSLCClient.ts`** - Main client implementation (702 lines)
- **`OSLCResource.ts`** - Resource base class (219 lines)
- **`RootServices.ts`** - Rootservices handling (53 lines)
- **`ServiceProviderCatalog.ts`** - Catalog handling (57 lines)
- **`ServiceProvider.ts`** - Service provider handling (97 lines)
- **`Compact.ts`** - Compact resources (106 lines)

You can find these files at:
```
https://github.com/your-repo/oslc-client-new-ts/tree/main/src/
```

Or copy from your local repository:
```bash
cp /path/to/oslc-client-new-ts/src/*.ts your-project/src/oslc/
```

## Configuration Files

### package.json Dependencies

Add these dependencies to your `package.json`:

```json
{
  "dependencies": {
    "axios": "^1.13.2",
    "axios-cookiejar-support": "^6.0.4",
    "tough-cookie": "^6.0.0",
    "rdflib": "2.3.0-08f819ce",
    "@xmldom/xmldom": "^0.9.8"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0"
  }
}
```

### tsconfig.json

Ensure your TypeScript configuration includes:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## Installation Steps

### Step-by-Step Instructions

1. **Create the directory:**
   ```bash
   mkdir -p src/oslc
   ```

2. **Copy all source files from repository:**
   ```bash
   # If you have the repository cloned
   cp oslc-client-new-ts/src/*.ts your-project/src/oslc/
   ```

   Or manually create each file using the content from this repository.

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Build TypeScript (optional):**
   ```bash
   npm run build
   ```

   Or use `tsc` directly if you have it configured.

## Verification

### Test Import

Create a test file to verify installation:

**`src/test-oslc.ts`:**

```typescript
import OSLCClient from './oslc/index.js';
import { oslc_cm, dcterms } from './oslc/namespaces.js';

async function test() {
  console.log('OSLC Client imported successfully!');

  const client = new OSLCClient('testuser', 'testpass');
  console.log('Client created:', client);

  // Test namespace
  const titleProp = dcterms('title');
  console.log('Title property:', titleProp.value);
  // Output: http://purl.org/dc/terms/title
}

test().catch(console.error);
```

### Run the Test

```bash
# If using ts-node
npx ts-node src/test-oslc.ts

# Or build and run
npm run build
node dist/test-oslc.js
```

Expected output:
```
OSLC Client imported successfully!
Client created: OSLCClient { ... }
Title property: http://purl.org/dc/terms/title
```

## Usage Example

After installation, you can use the client:

**`src/example.ts`:**

```typescript
import OSLCClient, { OSLCResource } from './oslc/index.js';
import { oslc_cm, dcterms } from './oslc/namespaces.js';
import * as $rdf from 'rdflib';

async function main() {
  // Create client
  const client = new OSLCClient('username', 'password');

  // Connect to service provider
  await client.use(
    'https://your-server.com/ccm',
    'Your Project Area',
    'CM'
  );

  // Query resources
  const resources = await client.queryResources(
    oslc_cm('ChangeRequest'),
    {
      where: 'oslc_cm:status="Open"',
      select: 'dcterms:title,dcterms:identifier'
    }
  );

  console.log(`Found ${resources.length} resources`);

  for (const resource of resources) {
    console.log(`${resource.getIdentifier()}: ${resource.getTitle()}`);
  }

  // Create a new resource
  const newResource = new OSLCResource();
  newResource.setTitle('Test defect from TypeScript');
  newResource.setDescription('Created using the OSLC TypeScript client');
  newResource.set(oslc_cm('status'), $rdf.literal('New'));

  const created = await client.createResource(oslc_cm('ChangeRequest'), newResource);
  console.log('Created:', created.getURI());
}

main().catch(console.error);
```

## File Checksums (Optional)

For verification, you can check file sizes:

```
index.ts              ~520 bytes
types.ts              ~2.1 KB
namespaces.ts         ~1.8 KB
OSLCClient.ts         ~24 KB
OSLCResource.ts       ~6.5 KB
RootServices.ts       ~1.7 KB
ServiceProviderCatalog.ts  ~1.8 KB
ServiceProvider.ts    ~3.2 KB
Compact.ts            ~3.1 KB
```

## Alternative: Download as Archive

You can also download the entire `src/` directory as a ZIP archive and extract it:

```bash
# Download and extract (replace with actual URL)
wget https://github.com/your-repo/oslc-client-new-ts/archive/refs/heads/main.zip
unzip main.zip
cp oslc-client-new-ts-main/src/*.ts your-project/src/oslc/
```

## Customization

Since the code is now in your project, you can:

1. **Modify for your needs** - Add custom methods, change behavior
2. **Remove unused classes** - Don't need Compact? Delete it
3. **Add domain-specific logic** - Extend OSLCResource for your domain
4. **Version control** - Track changes in your repository

Example customization:

```typescript
// src/oslc/CustomResource.ts
import OSLCResource from './OSLCResource.js';
import { oslc_cm } from './namespaces.js';

export default class CustomWorkItem extends OSLCResource {
  getStatus(): string | undefined {
    const status = this.get(oslc_cm('status'));
    return Array.isArray(status) ? status[0] : status;
  }

  setStatus(value: string): void {
    this.set(oslc_cm('status'), $rdf.literal(value));
  }

  // Add your custom methods here
}
```

## Troubleshooting

### Import Errors

If you get module not found errors:

```bash
# Ensure dependencies are installed
npm install

# Check TypeScript compilation
npm run typecheck
```

### Type Errors

If TypeScript complains about types:

```bash
# Install type definitions
npm install --save-dev @types/node

# Update tsconfig.json to include node types
```

### Runtime Errors

Common issues:

1. **"Cannot find module"** - Check file extensions (`.js` in imports)
2. **"window is not defined"** - Environment detection issue, check Node version
3. **"axios is not a function"** - Dependency not installed

## Next Steps

- **Read the documentation:**
  - [Getting Started Guide](./getting-started)
  - [API Reference](./api/OSLCClient.md)

- **Explore examples:**
  - Query resources
  - Create and update work items
  - Link across tools

- **Join the community:**
  - OSLC community forums
  - Jazz.net forums

## Repository Access

The full source code is available at:

```
https://github.com/your-repo/oslc-client-new-ts
```

Clone the repository for the latest updates:

```bash
git clone https://github.com/your-repo/oslc-client-new-ts.git
cd oslc-client-new-ts
```

## License

This code is licensed under the Apache License 2.0. See source files for full license text.

---

**Need help?** Check the [Getting Started Guide](./getting-started) or open an issue on GitHub.
