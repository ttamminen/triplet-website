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
  var container = document.querySelector('.blog-front');
  if(!container) {
      return;
  }
  new ImagesLoaded(container, function() {
    new Masonry(container, {
        itemSelector: '.post'
    });
  });
});