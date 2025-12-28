import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  // Documentation sidebar
  docsSidebar: [
    {
      type: 'doc',
      id: 'intro',
      label: 'Introduction',
    },
    {
      type: 'category',
      label: 'Understanding OSLC',
      items: [
        'what-is-oslc',
        'ibm-jazz-elm',
        'why-this-client',
      ],
    },
    {
      type: 'doc',
      id: 'getting-started',
      label: 'Getting Started',
    },
    {
      type: 'doc',
      id: 'manual-installation',
      label: 'Manual Installation',
    },
  ],

  // API Reference sidebar
  apiSidebar: [
    {
      type: 'category',
      label: 'Core Classes',
      items: [
        'api/OSLCClient',
        'api/OSLCResource',
      ],
    },
    {
      type: 'category',
      label: 'Service Discovery',
      items: [
        'api/RootServices',
        'api/ServiceProviderCatalog',
        'api/ServiceProvider',
      ],
    },
    {
      type: 'category',
      label: 'UI Integration',
      items: [
        'api/Compact',
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      items: [
        'api/types',
        'api/namespaces',
      ],
    },
  ],
};

export default sidebars;
