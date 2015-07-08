/* global hljs, document */
/* jshint -W031 */ // https://jslinterrors.com/do-not-use-new-for-side-effects

"use strict";

require('./vendor/highlight.pack');
var Blazy = require('blazy');
var ImagesLoaded = require('imagesloaded');
var Masonry = require('masonry-layout');

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