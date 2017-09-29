import 'babel-polyfill'
import * as hljs from 'highlight.js'
import * as FontFaceObserver from 'fontfaceobserver'
import * as Blazy from 'blazy'
import ImagesLoaded from 'imagesloaded'
import Masonry from 'masonry-layout'
import Utils from './utils'
import ScrollHandler from './stickyscroll'
// const Notice = require('./notice');

const dinNextRegularObserver = new FontFaceObserver('DIN Next', {
  weight: 400
});

dinNextRegularObserver.load().then(() => {
  Utils.addClass(document.body, 'din-regular-loaded');
}, () => {
  console.log('DIN Next - Regular is not available');
});

const dinNextThinObserver = new FontFaceObserver('DIN Next', {
  weight: 200
});

dinNextThinObserver.load().then(() => {
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

  new ImagesLoaded(container, {}, () => {
    new Masonry(container, {
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

// Notice.init();