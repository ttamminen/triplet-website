/* global hljs, document, FontFaceObserver */
/* jshint -W031 */ // https://jslinterrors.com/do-not-use-new-for-side-effects

"use strict";

require('./vendor/highlight.pack');
require('fontfaceobserver/fontfaceobserver.js');
var Blazy = require('blazy');
var ImagesLoaded = require('imagesloaded');
var Masonry = require('masonry-layout');
var Utils = require('./utils');

var dinNextRegularObserver = new FontFaceObserver('DIN Next', {
  weight: 400
});

dinNextRegularObserver.check(null, 5000).then(function() {
  Utils.addClass(document.body, 'din-regular-loaded');
}, function() {
  console.log('DIN Next - Regular is not available');
});

var dinNextThinObserver = new FontFaceObserver('DIN Next', {
  weight: 200
});

dinNextThinObserver.check(null, 5000).then(function() {
  Utils.addClass(document.body, 'din-thin-loaded');
}, function() {
  console.log('DIN Next - Thin is not available');
});

hljs.initHighlightingOnLoad();

new Blazy();

document.addEventListener('DOMContentLoaded', function() { 
  var container = document.querySelector('.posts');
  if(!container) {
    return;
  }

  var stamp = document.querySelector('.stamp');
  if(!stamp) {
    return;
  }

  new ImagesLoaded(container, function() {
    new Masonry(container, {
      itemSelector: '.post',
      stamp: stamp
    });
  });
});

// Grab as much info as possible 
// outside the scroll handler for performace reasons.
var header             = document.querySelector('.image-header'),
    header_height      = outerHeight(header),
    nav                = document.querySelector('.nav'),
    fix_class          = 'nav-fixed';

function stickyScroll(e) {

  if(window.pageYOffset > header_height) {
    nav.classList.add(fix_class);
  }

  if(window.pageYOffset < header_height) {
    nav.classList.remove(fix_class);
  }
}

function outerHeight(el) {
  var height = el.offsetHeight;
  var style = getComputedStyle(el);

  height += parseInt(style.marginTop) + parseInt(style.marginBottom);
  return height;
}

// Scroll handler to toggle classes.
window.addEventListener('scroll', stickyScroll, false);