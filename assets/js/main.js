/* global hljs, document, FontFaceObserver */
/* jshint -W031 */ // https://jslinterrors.com/do-not-use-new-for-side-effects

require('./vendor/highlight.pack');
require('fontfaceobserver/fontfaceobserver.js');
const Blazy = require('blazy');
const ImagesLoaded = require('imagesloaded');
const Masonry = require('masonry-layout');
const Utils = require('./utils');
const ScrollHandler = require('./stickyscroll');
//const Notice = require('./notice');

const dinNextRegularObserver = new FontFaceObserver('DIN Next', {
  weight: 400
});

dinNextRegularObserver.check(null, 5000).then(() => {
  Utils.addClass(document.body, 'din-regular-loaded');
}, () => {
  console.log('DIN Next - Regular is not available');
});

const dinNextThinObserver = new FontFaceObserver('DIN Next', {
  weight: 200
});

dinNextThinObserver.check(null, 5000).then(() => {
  Utils.addClass(document.body, 'din-thin-loaded');
}, () => {
  console.log('DIN Next - Thin is not available');
});

hljs.initHighlightingOnLoad();

new Blazy(); // eslint-disable-line no-new

document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.posts');
  if (!container) {
    return;
  }

  const stamp = document.querySelector('.stamp');
  if (!stamp) {
    return;
  }

  new ImagesLoaded(container, () => { // eslint-disable-line no-new
    new Masonry(container, { // eslint-disable-line no-new
      itemSelector: '.post',
      stamp
    });
  });
});

const nav = document.querySelector('.nav');
const fixClass = 'nav-fixed';
const header = document.querySelector('.image-header');
if (header) {
  const headerHeight = Utils.outerHeight(header);
  window.addEventListener('scroll', (e) => {
    ScrollHandler.stickyScroll(e, nav, fixClass, headerHeight);
  }, false);
}

//Notice.init();