const Utils = require('./utils');

module.exports = {
  init() {
    const signUp = document.getElementById('js-sign-up');
    const blogPostContent = document.querySelector('.blog-post-body');
    if (blogPostContent) {
      const headers = blogPostContent.querySelectorAll('h2');
      if (headers && headers.length > 2) {
        Utils.removeClass(signUp, 'hidden');
        const targetHeader = headers[headers.length - 2];
        targetHeader.parentNode.insertBefore(signUp, targetHeader);
      }
    }
  }
};