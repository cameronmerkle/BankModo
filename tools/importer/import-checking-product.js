/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroBannerParser from './parsers/hero-banner.js';
import cardsCheckingParser from './parsers/cards-checking.js';
import columnsSplitParser from './parsers/columns-split.js';

// TRANSFORMER IMPORTS
import wintrustCleanupTransformer from './transformers/wintrust-cleanup.js';
import wintrustSectionsTransformer from './transformers/wintrust-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-banner': heroBannerParser,
  'cards-checking': cardsCheckingParser,
  'columns-split': columnsSplitParser,
};

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'checking-product',
  description: 'Banking checking account product page with features, benefits, and account details',
  urls: [
    'https://www.wintrust.com/personal-solutions/bank-with-us/checking/better-checking.html',
  ],
  blocks: [
    {
      name: 'hero-banner',
      instances: ['#cmp-wintrustgrid-656750079'],
    },
    {
      name: 'cards-checking',
      instances: ['#cmp-wintrustgrid--1529320396 .cmp-wintrustgridcolumn--4'],
    },
    {
      name: 'columns-split',
      instances: [
        '#cmp-wintrustgrid-1618508014 .cmp-wintrustgridcolumn--5',
        '#cmp-wintrustgrid--463868300 .cmp-wintrustgridcolumn--6',
        '#cmp-wintrustgrid-391309266 > .cmp-wintrustgridcolumn:nth-child(2)',
      ],
    },
  ],
  sections: [
    {
      id: 'section-1',
      name: 'Hero Banner',
      selector: '#cmp-wintrustgrid-656750079',
      style: 'dark-blue',
      blocks: ['hero-banner'],
      defaultContent: [],
    },
    {
      id: 'section-2',
      name: 'Checking Account Comparison',
      selector: '#cmp-wintrustgrid--1529320396',
      style: null,
      blocks: ['cards-checking'],
      defaultContent: ['#cmp-wintrustgrid--1529320396 > .cmp-wintrustgridcolumn:first-child'],
    },
    {
      id: 'section-3',
      name: 'Cash Bonus Steps',
      selector: '#cmp-wintrustgrid-1618508014',
      style: null,
      blocks: ['columns-split'],
      defaultContent: [
        '#cmp-wintrustgrid-1618508014 > .cmp-wintrustgridcolumn:first-child',
        '#cmp-wintrustgrid-1618508014 > .cmp-wintrustgridcolumn:last-child .button',
      ],
    },
    {
      id: 'section-4',
      name: 'Early Pay Feature',
      selector: '#cmp-wintrustgrid--463868300',
      style: 'dark-blue',
      blocks: ['columns-split'],
      defaultContent: [],
    },
    {
      id: 'section-5',
      name: 'Statement Savings',
      selector: '#cmp-wintrustgrid-391309266',
      style: null,
      blocks: ['columns-split'],
      defaultContent: ['#cmp-wintrustgrid-391309266 > .cmp-wintrustgridcolumn:first-child'],
    },
    {
      id: 'section-6',
      name: 'Disclosures',
      selector: '.disclosureText.parbase',
      style: null,
      blocks: [],
      defaultContent: ['.disclosureText.parbase'],
    },
  ],
};

// TRANSFORMER REGISTRY
const transformers = [
  wintrustCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1
    ? [wintrustSectionsTransformer]
    : []),
];

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((el) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element: el,
          section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;
    const main = document.body;

    // 1. Execute beforeTransform transformers (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Execute afterTransform transformers (final cleanup + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, ''),
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
