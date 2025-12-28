import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: "OSLC Client for TypeScript",
  tagline:
    "A TypeScript client library for OSLC servers and IBM Jazz/ELM applications",
  favicon: "img/favicon.ico",

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: "https://wranglerdev.github.io",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/oslc-client-new-ts/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "wranglerdev", // Usually your GitHub org/user name.
  projectName: "oslc-client-new-ts", // Usually your repo name.

  onBrokenLinks: "throw",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          routeBasePath: "docs",
          // Remove this to remove the "edit this page" links.
          editUrl:
            "https://github.com/wranglerdev/oslc-client-new-ts/tree/main/website/",
        },
        blog: false, // Disable blog for this documentation site
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: "img/docusaurus-social-card.jpg",
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: "OSLC Client",
      logo: {
        alt: "OSLC Logo",
        src: "img/logo.svg",
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "docsSidebar",
          position: "left",
          label: "Documentation",
        },
        {
          type: "docSidebar",
          sidebarId: "apiSidebar",
          position: "left",
          label: "API Reference",
        },
        {
          href: "https://github.com/YOUR_USERNAME/oslc-client-new-ts",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Documentation",
          items: [
            {
              label: "Getting Started",
              to: "/docs/getting-started",
            },
            {
              label: "API Reference",
              to: "/docs/api/OSLCClient",
            },
            {
              label: "What is OSLC?",
              to: "/docs/what-is-oslc",
            },
          ],
        },
        {
          title: "Resources",
          items: [
            {
              label: "OSLC.org",
              href: "https://open-services.net/",
            },
            {
              label: "Jazz.net",
              href: "https://jazz.net/",
            },
            {
              label: "IBM ELM",
              href: "https://www.ibm.com/docs/en/engineering-lifecycle-management-suite",
            },
          ],
        },
        {
          title: "More",
          items: [
            {
              label: "GitHub",
              href: "https://github.com/YOUR_USERNAME/oslc-client-new-ts",
            },
            {
              label: "Report Issue",
              href: "https://github.com/YOUR_USERNAME/oslc-client-new-ts/issues",
            },
          ],
        },
      ],
      copyright: `Licensed under Apache License 2.0. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
    // Code copy button is enabled by default in Docusaurus
  } satisfies Preset.ThemeConfig,
};

export default config;
