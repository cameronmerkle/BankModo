import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-checking-card-image';
      else div.className = 'cards-checking-card-body';
    });
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });

  // Make "Product Features" sections collapsible
  ul.querySelectorAll('.cards-checking-card-body').forEach((body) => {
    const strongs = body.querySelectorAll('p strong');
    strongs.forEach((strong) => {
      if (strong.textContent.trim() === 'Product Features') {
        const trigger = strong.closest('p');
        const content = [];
        let next = trigger.nextElementSibling;
        // Collect elements until we hit "Requirements" or run out
        while (next) {
          const nextStrong = next.querySelector('strong');
          if (nextStrong && nextStrong.textContent.trim() === 'Requirements') break;
          content.push(next);
          next = next.nextElementSibling;
        }

        // Create collapsible wrapper
        const details = document.createElement('details');
        const summary = document.createElement('summary');
        summary.textContent = 'Product Features';
        details.append(summary);
        content.forEach((el) => details.append(el));
        trigger.replaceWith(details);
      }
    });
  });

  block.textContent = '';
  block.append(ul);
}
