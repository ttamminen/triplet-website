/* exported Utils */
/* global XMLHttpRequest */

module.exports = {
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

  getJSON(url, successCallback) {
    const request = new XMLHttpRequest();
    request.open('GET', url, true);

    request.onload = function onloadCallback() {
      if (this.status >= 200 && this.status < 400) {
        // Success!
        const data = JSON.parse(this.response);
        successCallback(data);
      } else {
        console.log('Ajax request failed');
      }
    };

    request.onerror = function onerrorCallback() {
      console.log('Ajax request failed');
    };

    request.send();
  },

  outerHeight(el) {
    let height = el.offsetHeight;
    const style = getComputedStyle(el);

    height += parseInt(style.marginTop, 10) + parseInt(style.marginBottom, 10);
    return height;
  }
};
