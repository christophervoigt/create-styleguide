
export default function collapsable(selector = '[data-collapse]') {
  const elements = document.querySelectorAll(selector);

  if (elements.length) {
    Array.prototype.forEach.call(elements, (element) => {
      element.addEventListener('click', () => {
        const parent = element.parentNode;
        const targetSelector = element.dataset.collapse;
        const target = parent.querySelector(targetSelector);

        if (!target.classList.contains('expanded')) {
          target.style.cssText = 'height: auto';
          const height = target.scrollHeight;
          target.style.cssText = 'height: 0';
          target.style.cssText = `max-height: ${height}px;`;
        } else {
          target.style.cssText = '';
        }

        element.classList.toggle('expanded');
        target.classList.toggle('expanded');
      });
    });
  }
}
