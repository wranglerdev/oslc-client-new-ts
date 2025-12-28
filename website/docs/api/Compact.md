# Compact API Reference

`Compact` represents an OSLC Compact resource, which provides lightweight preview information for embedding OSLC resources in other tools' UIs.

**Source:** `src/Compact.ts:31`

**Extends:** `OSLCResource`

## Overview

OSLC Compact resources enable **resource previews** without full page loads. They provide:
- Short titles and icons for list views
- Small/large preview HTML for hover cards
- Hint dimensions for preview frames

## Constructor

### `new Compact(uri, store)`

**Source:** `src/Compact.ts:32`

**Parameters:**
- `uri` (string) - URI of the compact resource
- `store` (IndexedFormula) - RDF graph containing the compact data

## Methods

### `getShortTitle()`

Get the short title (typically an identifier).

**Source:** `src/Compact.ts:40`

**Returns:** `string | undefined`

**Example:**
```typescript
const compact = await client.getCompactResource(compactURL);
const shortTitle = compact.getShortTitle();
console.log(shortTitle);  // "12345" or abbreviated title
```

### `getIcon()`

Get the icon URL.

**Source:** `src/Compact.ts:49`

**Returns:** `string | undefined`

**Example:**
```typescript
const icon = compact.getIcon();
if (icon) {
  console.log(`<img src="${icon}" alt="icon">`);
}
// https://server.com/ccm/service/com.ibm.team.workitem.common.internal.model.IImageContentService/icon/defect.png
```

### `getIconTitle()`

Get the icon title (alt text).

**Source:** `src/Compact.ts:58`

**Returns:** `string | undefined`

**Example:**
```typescript
const iconTitle = compact.getIconTitle();
console.log(iconTitle);  // "Defect" or "Task"
```

### `getIconSrcSet()`

Get the icon source set for responsive images.

**Source:** `src/Compact.ts:67`

**Returns:** `string | undefined`

**Example:**
```typescript
const srcSet = compact.getIconSrcSet();
// "icon.png 1x, icon@2x.png 2x"
```

### `getSmallPreview()`

Get small preview information (for compact hover cards).

**Source:** `src/Compact.ts:76`

**Returns:** `PreviewInfo | null`

```typescript
interface PreviewInfo {
  document: string;      // Preview HTML document URL
  hintHeight?: string;   // Suggested height (e.g., "200px")
  hintWidth?: string;    // Suggested width (e.g., "400px")
}
```

**Example:**
```typescript
const smallPreview = compact.getSmallPreview();
if (smallPreview) {
  console.log('Preview URL:', smallPreview.document);
  console.log('Size:', `${smallPreview.hintWidth} x ${smallPreview.hintHeight}`);
  // Preview URL: https://server.com/ccm/resource/.../small.html
  // Size: 400px x 200px
}
```

### `getLargePreview()`

Get large preview information (for full preview dialogs).

**Source:** `src/Compact.ts:93`

**Returns:** `PreviewInfo | null`

**Example:**
```typescript
const largePreview = compact.getLargePreview();
if (largePreview) {
  console.log('Large preview URL:', largePreview.document);
  console.log('Size:', `${largePreview.hintWidth} x ${largePreview.hintHeight}`);
  // Size: 800px x 600px
}
```

## Complete Example: Building a Preview Card

```typescript
import OSLCClient from './oslc/index.js';

async function buildPreviewCard(resourceURL: string) {
  const client = new OSLCClient('username', 'password');

  // Get the compact representation
  const compactURL = `${resourceURL}?oslc.compact=true`;
  const compact = await client.getCompactResource(compactURL);

  // Build HTML preview card
  const html = `
    <div class="oslc-preview-card">
      <div class="header">
        <img src="${compact.getIcon()}" alt="${compact.getIconTitle()}">
        <span class="id">${compact.getShortTitle()}</span>
        <span class="title">${compact.getTitle()}</span>
      </div>
      <div class="preview">
        <iframe
          src="${compact.getSmallPreview()?.document}"
          width="${compact.getSmallPreview()?.hintWidth || '400px'}"
          height="${compact.getSmallPreview()?.hintHeight || '200px'}"
          frameborder="0"
        ></iframe>
      </div>
    </div>
  `;

  return html;
}

// Usage
const card = await buildPreviewCard(
  'https://server.com/ccm/resource/itemName/com.ibm.team.workitem.WorkItem/12345'
);
document.getElementById('preview').innerHTML = card;
```

## Compact Resource Structure

A typical compact resource:

```xml
<oslc:Compact rdf:about="https://server.com/ccm/resource/.../12345">
  <dcterms:title>Login page crashes on Safari</dcterms:title>
  <oslc:shortTitle>12345</oslc:shortTitle>

  <oslc:icon rdf:resource="https://server.com/ccm/icons/defect.png"/>
  <oslc:iconTitle>Defect</oslc:iconTitle>

  <oslc:smallPreview>
    <oslc:Preview>
      <oslc:document rdf:resource="https://server.com/ccm/preview/12345/small.html"/>
      <oslc:hintHeight>200px</oslc:hintHeight>
      <oslc:hintWidth>400px</oslc:hintWidth>
    </oslc:Preview>
  </oslc:smallPreview>

  <oslc:largePreview>
    <oslc:Preview>
      <oslc:document rdf:resource="https://server.com/ccm/preview/12345/large.html"/>
      <oslc:hintHeight>600px</oslc:hintHeight>
      <oslc:hintWidth>800px</oslc:hintWidth>
    </oslc:Preview>
  </oslc:largePreview>
</oslc:Compact>
```

## Fetching Compact Resources

### Using OSLCClient

```typescript
const compact = await client.getCompactResource(
  'https://server.com/ccm/oslc/workitems/_12345/compact'
);
```

### Query Parameter Method

Some servers support adding `?oslc.compact=true`:

```typescript
const resourceURL = 'https://server.com/ccm/resource/.../WorkItem/12345';
const compactURL = `${resourceURL}?oslc.compact=true`;

const compact = await client.getCompactResource(compactURL);
```

### Dedicated Compact Endpoint

Jazz applications typically have dedicated compact endpoints:

```
https://server.com/ccm/oslc/workitems/_<id>/compact
```

## Use Cases

### 1. Resource Link Hover Cards

Show a preview when hovering over a link:

```typescript
async function showHoverCard(resourceURL: string, event: MouseEvent) {
  const compact = await client.getCompactResource(`${resourceURL}?oslc.compact=true`);

  const hoverCard = document.createElement('div');
  hoverCard.className = 'hover-card';
  hoverCard.style.left = `${event.clientX}px`;
  hoverCard.style.top = `${event.clientY}px`;

  hoverCard.innerHTML = `
    <div class="hover-card-header">
      <img src="${compact.getIcon()}" />
      <strong>${compact.getShortTitle()}</strong>
      ${compact.getTitle()}
    </div>
    <iframe src="${compact.getSmallPreview()?.document}"></iframe>
  `;

  document.body.appendChild(hoverCard);
}
```

### 2. Resource Picker List

Display compact information in a resource selector:

```typescript
async function buildResourceList(resourceURLs: string[]) {
  const items = [];

  for (const url of resourceURLs) {
    const compact = await client.getCompactResource(`${url}?oslc.compact=true`);

    items.push({
      id: compact.getShortTitle(),
      title: compact.getTitle(),
      icon: compact.getIcon(),
      url: url
    });
  }

  return items;
}
```

### 3. Dashboard Widgets

Embed compact previews in dashboards:

```typescript
async function createDashboardWidget(workItemURL: string) {
  const compact = await client.getCompactResource(`${workItemURL}?oslc.compact=true`);
  const preview = compact.getSmallPreview();

  const widget = `
    <div class="dashboard-widget">
      <h3>${compact.getTitle()}</h3>
      <iframe
        src="${preview?.document}"
        width="${preview?.hintWidth}"
        height="${preview?.hintHeight}"
      ></iframe>
    </div>
  `;

  return widget;
}
```

## Preview HTML Documents

The `document` URLs returned by `getSmallPreview()` and `getLargePreview()` are **HTML pages** designed to be embedded in iframes:

- Styled with CSS for consistent appearance
- Interactive (may contain links, buttons)
- Respond to parent window messages (OSLC Compact specification)

**Example preview content:**
```html
<!-- Returned from compact.getSmallPreview().document -->
<html>
<head>
  <style>
    body { font-family: Arial; padding: 10px; }
    .field { margin: 5px 0; }
    .label { font-weight: bold; }
  </style>
</head>
<body>
  <div class="field">
    <span class="label">ID:</span> 12345
  </div>
  <div class="field">
    <span class="label">Status:</span> Open
  </div>
  <div class="field">
    <span class="label">Priority:</span> High
  </div>
  <div class="field">
    <span class="label">Description:</span>
    Login page crashes when clicking the submit button...
  </div>
</body>
</html>
```

## Browser Compatibility

Compact resources are typically used in **browser environments** for UI integration:

```typescript
// In a web application
import OSLCClient from './oslc/index.js';

const client = new OSLCClient('username', 'password');
const compact = await client.getCompactResource(compactURL);

// Render in your React/Vue/Angular component
function PreviewCard({ url }) {
  const [compact, setCompact] = useState(null);

  useEffect(() => {
    client.getCompactResource(url).then(setCompact);
  }, [url]);

  if (!compact) return <div>Loading...</div>;

  return (
    <div>
      <img src={compact.getIcon()} alt={compact.getIconTitle()} />
      <h3>{compact.getTitle()}</h3>
      <iframe src={compact.getSmallPreview()?.document} />
    </div>
  );
}
```

## Related Documentation

- [OSLCClient.getCompactResource()](./OSLCClient.md#getcompactresourceurl-oslc_version-accept) - Fetching compacts
- [OSLC Specification](https://open-services.net/specifications/) - Compact specification details
- [OSLCResource](./OSLCResource.md) - Base resource class
