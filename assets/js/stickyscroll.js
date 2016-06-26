module.exports = {
  stickyScroll(e, nav, fixClass, headerHeight) {
    if (window.pageYOffset > headerHeight) {
      nav.classList.add(fixClass);
    }

    if (window.pageYOffset < headerHeight) {
      nav.classList.remove(fixClass);
    }
  }
};