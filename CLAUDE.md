# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript conversion of the oslc-client package (v3.0.1) for direct use in projects. It is **NOT** intended for npm publishing - users copy the `src/` directory directly into their projects.

## Development Commands

```bash
# Type checking (no build)
npm run typecheck

# Build TypeScript to JavaScript
npm run build

# Install dependencies
npm install
```
# Tasks tracking Instructions

This project uses **bd** (beads) for issue tracking. Run `bd onboard` to get started.

## Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --status in_progress  # Claim work
bd close <id>         # Complete work
bd sync               # Sync with git
```

## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd sync
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds

## Architecture

### Core Design Philosophy

**CRITICAL:** This codebase is a **direct TypeScript port** of the original JavaScript oslc-client package. When making changes:

- **DO NOT** refactor or "improve" the original logic
- **DO NOT** split classes or reorganize code structure
- **DO** preserve exact behavior from the original JavaScript implementation
- **DO** only add TypeScript type annotations and maintain existing patterns

### RDF-Based Architecture

The entire client is built on **rdflib** (RDF graph manipulation). All OSLC resources are stored as RDF graphs in an `IndexedFormula` (rdflib's knowledge base). This is fundamental to understanding the codebase:

```typescript
// Everything is RDF under the hood
const store = $rdf.graph();  // IndexedFormula
$rdf.parse(rdfXml, store, url, contentType);
const values = store.each(subject, predicate, null);
```

### Class Hierarchy

```
OSLCResource (base)
├── RootServices (Jazz rootservices document)
├── ServiceProviderCatalog (OSLC catalog)
├── ServiceProvider (OSLC provider with query/creation capabilities)
└── Compact (OSLC UI preview resource)

OSLCClient (orchestrator)
├── Uses all resource classes above
├── Manages HTTP client (axios with cookie jar)
└── Handles authentication challenges
```

### Service Discovery Flow

The client follows a specific OSLC discovery pattern that must be maintained:

1. **RootServices** → Fetch `{baseUrl}/rootservices`
2. **ServiceProviderCatalog** → Extract catalog URL for domain (CM/RM/QM)
3. **ServiceProvider** → Lookup provider by title (e.g., "Project Area")
4. **Query/Create** → Use discovered capabilities

This flow is implemented in `OSLCClient.use()` and is critical for OSLC compliance.

### Authentication Architecture

Authentication is handled through **axios response interceptors** with three methods:

1. **JEE Form Auth** - Detects `x-com-ibm-team-repository-web-auth-msg: authrequired` header, POSTs to `/j_security_check`
2. **jauth realm** - Detects `www-authenticate` with `jauth realm`, extracts `token_uri`, gets bearer token
3. **Basic Auth** - Fallback for 401 responses

The interceptor automatically retries the original request after successful authentication.

### Property Access Pattern

OSLCResource uses **reflection-based property access**:

```typescript
// Generic get/set work with any RDF property
resource.get('http://purl.org/dc/terms/title')  // Returns PropertyValue
resource.set(dcterms('title'), $rdf.literal('value'))

// Convenience methods for common properties
resource.getTitle()  // Returns string | undefined
resource.setTitle('value')
```

This supports the **open-world assumption** - properties can be undefined or multi-valued, and accessing non-existent properties is not an error.

### Dependencies Strategy

**Keep ALL original dependencies:**
- **axios** + **axios-cookiejar-support** + **tough-cookie** - HTTP with cookie management
- **rdflib** - Core RDF operations (no alternative exists)
- **@xmldom/xmldom** - XML parsing for Node.js (rdflib dependency)

These are proven to work with Jazz/ELM servers. Do not replace with "modern" alternatives.

### Environment Detection

The code conditionally imports based on Node.js vs Browser:

```typescript
const isNodeEnvironment = typeof window === 'undefined';

if (isNodeEnvironment) {
  // Node.js: use cookie jar, xmldom DOMParser
  const cookiejarSupport = await import('axios-cookiejar-support');
  // ...
} else {
  // Browser: native DOMParser, withCredentials for cookies
}
```

Preserve this pattern - it enables the same code to run in both environments.

## File Responsibilities

- **types.ts** - All TypeScript interfaces and type aliases
- **namespaces.ts** - RDF namespace definitions (dcterms, oslc, oslc_cm, etc.)
- **OSLCResource.ts** - Base class wrapping rdflib Store with property get/set
- **OSLCClient.ts** - Main orchestrator with auth, HTTP, CRUD, and query operations
- **index.ts** - Default export entry point

## Key Patterns to Maintain

### Query Pagination

Queries automatically follow `oslc:nextPage` links:

```typescript
let nextPage = store.any(sym(queryBase), oslc('nextPage'), null)?.value;
while (nextPage) {
  // Fetch and parse next page
  nextPage = store.any(sym(nextPage), oslc('nextPage'), null)?.value;
}
```

### ETag Handling

Resources carry ETags for optimistic concurrency control:

```typescript
const resource = await client.getResource(url);  // Has resource.etag
await client.putResource(resource, resource.etag);  // If-Match header
```

### CSRF Protection for Jazz

DELETE operations extract JSESSIONID from cookies for CSRF prevention:

```typescript
const sessionCookie = cookies.find(c => c.key === 'JSESSIONID');
headers['X-Jazz-CSRF-Prevent'] = sessionCookie.value;
```

## TypeScript Specifics

- **Target:** ES2022 (native in Node 18+)
- **Strict mode:** Enabled
- **Module system:** ESNext with `"type": "module"`
- Uses `type` imports for type-only imports

## Original JavaScript Reference

The original JavaScript implementation is in `oslc-client/` directory. When in doubt about behavior, refer to the original JavaScript files to ensure TypeScript version maintains identical logic.
