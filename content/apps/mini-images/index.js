var App = require('ghost-app'),
    MyApp;

MyApp = App.extend({
  install: function () {},
  uninstall: function () {},
  activate: function () {
    this.ghost.helpers.register('blogPostMiniImage', this.blogPostMiniImage);
  },
  deactivate: function () {},
  blogPostMiniImage: function(imageUrl) {
    if(!imageUrl) {
      return "";
    }

    var extension = imageUrl.slice(imageUrl.lastIndexOf('.'));
    var fileNameWithoutExtension = imageUrl.slice(0, imageUrl.lastIndexOf('.'));
    return fileNameWithoutExtension + "_mini" + extension;
  }
});

module.exports = MyApp;