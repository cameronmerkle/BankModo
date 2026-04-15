/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-banner.
 * Base: hero. Source: wintrust.com better-checking page.
 * Hero structure: 1 column block. Row 1 = background image. Row 2 = heading + subtext + CTA in single cell.
 * Note: Source has duplicate text elements for responsive breakpoints; we select desktop versions.
 */
export default function parse(element, { document }) {
  // Extract background image from the grid outer wrapper
  const bgImage = element.querySelector(':scope > .old-tablet-resolution > .cmp-wintrustgrid--outer > img');

  // Find the text column (second gridcolumn)
  const textColumn = element.querySelector('.cmp-wintrustgridcolumn--m--1, .cmp-wintrustgridcolumn:nth-child(2)');
  if (!textColumn) {
    const block = WebImporter.Blocks.createBlock(document, { name: 'hero-banner', cells: [] });
    element.replaceWith(block);
    return;
  }

  // Collect unique text content from cmp-text elements (skip responsive duplicates)
  const textDivs = textColumn.querySelectorAll('.cmp-text');
  const seenTexts = new Set();
  const uniqueTexts = [];
  textDivs.forEach((div) => {
    const text = div.textContent.trim();
    if (text && !seenTexts.has(text)) {
      seenTexts.add(text);
      uniqueTexts.push(div);
    }
  });

  // First unique text = heading, second unique text = description
  let headingEl = null;
  if (uniqueTexts.length > 0) {
    headingEl = document.createElement('h1');
    headingEl.textContent = uniqueTexts[0].textContent.trim();
  }

  let descEl = null;
  if (uniqueTexts.length > 1) {
    descEl = document.createElement('p');
    descEl.textContent = uniqueTexts[1].textContent.trim();
  }

  // Extract CTA link
  const ctaLink = element.querySelector('a.cmp-button__whiteoutline, a[class*="cmp-button"]');

  // Build cells: Row 1 = image, Row 2 = content wrapper
  const cells = [];

  if (bgImage) {
    cells.push([bgImage]);
  }

  const contentWrapper = document.createElement('div');
  if (headingEl) contentWrapper.append(headingEl);
  if (descEl) contentWrapper.append(descEl);
  if (ctaLink) contentWrapper.append(ctaLink);
  cells.push([contentWrapper]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-banner', cells });
  element.replaceWith(block);
}
