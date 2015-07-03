"use strict";

var highlight = require('./vendor/highlight.pack.js');
var Blazy = require('blazy');
var ImagesLoaded = require('imagesloaded');
var Masonry = require('masonry-layout');

highlight.initHighlightingOnLoad();

var bLazy = new Blazy();

document.addEventListener('DOMContentLoaded', function(event) { 
  var container = document.querySelector('.blog-front');
  if(!container) {
      return;
  }
  ImagesLoaded(container, function() {
    var msnry = new Masonry(container, {
        itemSelector: '.post'
    });
  });
});