/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-checking.
 * Base: cards. Source: wintrust.com better-checking page.
 * Cards structure: 2 columns per row. Col 1 = image, Col 2 = text content.
 * Since these checking cards have no images, using 1-column (no images) variant structure.
 * Each card: heading + description + features + requirements + CTA
 */
export default function parse(element, { document }) {
  // Find the three product card columns (cmp-wintrustgridcolumn--4 with dropshadow)
  const cardColumns = element.querySelectorAll(':scope > .cmp-wintrustgridcolumn--4');

  const cells = [];

  cardColumns.forEach((col) => {
    const cardContent = document.createElement('div');

    // Collect unique text content (skip responsive duplicates)
    const textDivs = col.querySelectorAll('.cmp-text');
    const seenTexts = new Set();
    const uniqueTexts = [];
    textDivs.forEach((div) => {
      const text = div.textContent.trim();
      if (text && !seenTexts.has(text)) {
        seenTexts.add(text);
        uniqueTexts.push(div);
      }
    });

    // First unique text = card title (e.g., "Total Access Checking")
    if (uniqueTexts.length > 0) {
      const h3 = document.createElement('h3');
      h3.textContent = uniqueTexts[0].textContent.trim();
      cardContent.append(h3);
    }

    // Second unique text = description
    if (uniqueTexts.length > 1) {
      const p = document.createElement('p');
      p.textContent = uniqueTexts[1].textContent.trim();
      cardContent.append(p);
    }

    // Collect accordion content (Product Features)
    const accordionPanel = col.querySelector('.cmp-accordion__panel');
    if (accordionPanel) {
      const featuresHeading = document.createElement('p');
      featuresHeading.innerHTML = '<strong>Product Features</strong>';
      cardContent.append(featuresHeading);

      const featuresList = accordionPanel.querySelector('ul');
      if (featuresList) {
        const ul = document.createElement('ul');
        featuresList.querySelectorAll('li').forEach((li) => {
          const newLi = document.createElement('li');
          newLi.textContent = li.textContent.trim();
          ul.append(newLi);
        });
        cardContent.append(ul);
      }
    }

    // Requirements section - look for "Requirements" text followed by a list
    const reqHeadingIdx = [...uniqueTexts].findIndex((t) => t.textContent.trim().includes('Requirements'));
    if (reqHeadingIdx >= 0 && reqHeadingIdx + 1 < uniqueTexts.length) {
      const reqHeading = document.createElement('p');
      reqHeading.innerHTML = '<strong>Requirements</strong>';
      cardContent.append(reqHeading);

      const reqList = uniqueTexts[reqHeadingIdx + 1].querySelector('ul');
      if (reqList) {
        const ul = document.createElement('ul');
        reqList.querySelectorAll('li').forEach((li) => {
          const newLi = document.createElement('li');
          newLi.textContent = li.textContent.trim();
          ul.append(newLi);
        });
        cardContent.append(ul);
      }
    }

    // CTA button
    const cta = col.querySelector('a[class*="cmp-button"]');
    if (cta) {
      const link = document.createElement('a');
      link.href = cta.href || '#';
      link.textContent = cta.textContent.trim();
      const ctaP = document.createElement('p');
      ctaP.append(link);
      cardContent.append(ctaP);
    }

    cells.push([cardContent]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-checking', cells });
  element.replaceWith(block);
}
