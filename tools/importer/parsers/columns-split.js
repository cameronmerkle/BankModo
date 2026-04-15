/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-split.
 * Base: columns. Source: wintrust.com better-checking page.
 * Columns structure: N columns per row, each cell = text/images/links.
 * Used in 3 locations: bonus steps, early pay feature, statement savings.
 */
export default function parse(element, { document }) {
  // Find the direct grid columns (children of the element that are grid columns)
  const gridCols = element.querySelectorAll(':scope > .cmp-wintrustgridcolumn');

  // Filter to meaningful content columns (skip spacer-only or very small columns)
  const contentCols = [...gridCols].filter((col) => {
    const text = col.textContent.trim();
    return text.length > 5;
  });

  if (contentCols.length === 0) {
    const block = WebImporter.Blocks.createBlock(document, { name: 'columns-split', cells: [] });
    element.replaceWith(block);
    return;
  }

  // Build one row with N columns
  const row = [];

  contentCols.forEach((col) => {
    const cellContent = document.createElement('div');

    // Collect unique text content (skip responsive duplicates)
    const textDivs = col.querySelectorAll('.cmp-text');
    const seenTexts = new Set();
    textDivs.forEach((div) => {
      const text = div.textContent.trim();
      if (text && !seenTexts.has(text)) {
        seenTexts.add(text);

        // Check for headings vs regular text
        const p = div.querySelector('p');
        if (p) {
          // Check if it looks like a heading (short text, large styling indicators)
          const hasSpanColor = p.querySelector('span.WintrustBlue--color, span.White--color');
          const textLen = text.length;

          if (textLen < 50 && (hasSpanColor || textLen < 20)) {
            const h2 = document.createElement('h2');
            h2.textContent = text;
            cellContent.append(h2);
          } else {
            const newP = document.createElement('p');
            newP.textContent = text;
            cellContent.append(newP);
          }
        }

        // Check for lists
        const ul = div.querySelector('ul');
        if (ul) {
          const newUl = document.createElement('ul');
          ul.querySelectorAll('li').forEach((li) => {
            const newLi = document.createElement('li');
            newLi.textContent = li.textContent.trim();
            newUl.append(newLi);
          });
          cellContent.append(newUl);
        }

        const ol = div.querySelector('ol');
        if (ol) {
          const newOl = document.createElement('ol');
          ol.querySelectorAll('li').forEach((li) => {
            const newLi = document.createElement('li');
            newLi.textContent = li.textContent.trim();
            newOl.append(newLi);
          });
          cellContent.append(newOl);
        }
      }
    });

    // Check for images
    const img = col.querySelector('.cmp-image img, img.cmp-image__image');
    if (img) {
      cellContent.append(img);
    }

    // Check for CTA links
    const cta = col.querySelector('a[class*="cmp-button"]');
    if (cta) {
      const link = document.createElement('a');
      link.href = cta.href || '#';
      link.textContent = cta.textContent.trim();
      const ctaP = document.createElement('p');
      ctaP.append(link);
      cellContent.append(ctaP);
    }

    row.push(cellContent);
  });

  const cells = [row];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-split', cells });
  element.replaceWith(block);
}
