

export default function sidebar(selector = '.sg-sidebar') {
  const body = document.querySelector('body');
  const sidebarElement = document.querySelector(selector);

  document.addEventListener('touchstart', handleTouchStart, false);
  sidebarElement.addEventListener('touchmove', handleTouchMove, false);

  let xDown = null;
  let yDown = null;

  function handleTouchStart(event) {
    xDown = event.touches[0].clientX;
    yDown = event.touches[0].clientY;
  }

  function handleTouchMove(event) {
    if (!xDown || !yDown) {
      return;
    }

    const xUp = event.touches[0].clientX;
    const yUp = event.touches[0].clientY;

    const xDiff = xDown - xUp;
    const yDiff = yDown - yUp;

    if (Math.abs(xDiff) > Math.abs(yDiff)) {
      if (xDiff > 0) {
        body.classList.remove('-openSidebar');
      } else {
        body.classList.add('-openSidebar');
      }
    }

    /* reset values */
    xDown = null;
    yDown = null;
  }
}
