/* exported Utils */
/* global XMLHttpRequest */

export default {
  addClass(el, className) {
    if (el.classList) {
      el.classList.add(className);
    } else {
      el.className += ` ${className}`; // eslint-disable-line no-param-reassign
    }
  },

  removeClass(el, className) {
    if (el.classList) {
      el.classList.remove(className);
    } else {
      el.className = el.className // eslint-disable-line no-param-reassign
        .replace(new RegExp('(^|\\b)' + className.split(' ') // eslint-disable-line prefer-template
        .join('|') + '(\\b|$)', 'gi'), ' ');
    }
  },

  outerHeight(el) {
    let height = el.offsetHeight;
    const style = getComputedStyle(el);

    height += parseInt(style.marginTop, 10) + parseInt(style.marginBottom, 10);
    return height;
  }
};
