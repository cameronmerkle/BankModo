export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-split-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          picWrapper.classList.add('columns-split-img-col');
        }
      }
    });
  });

  if (cols.length === 2) {
    // Add OR divider for bonus-style columns (2 cols, both with ordered lists, no images)
    const hasOl = cols.every((col) => col.querySelector('ol'));
    const hasImg = cols.some((col) => col.querySelector('picture'));
    if (hasOl && !hasImg) {
      block.classList.add('columns-split-bonus');
      const orDivider = document.createElement('div');
      orDivider.className = 'columns-split-or';
      orDivider.textContent = 'OR';
      block.firstElementChild.insertBefore(orDivider, cols[1]);
    }

    // Detect savings-style columns (first col has only a heading, second has details + link)
    const firstColChildren = cols[0].children;
    const secondHasLink = cols[1].querySelector('a');
    if (firstColChildren.length === 1 && firstColChildren[0].matches('h2, h3') && secondHasLink && !hasImg) {
      block.classList.add('columns-split-savings');
      cols[0].classList.add('columns-split-rate-col');
    }
  }
}
