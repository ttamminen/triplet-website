var hbs = require('express-hbs');

module.exports = function(){  
    hbs.registerHelper('blogPostMiniImage', function(imageUrl) {
    	var extension = imageUrl.slice(imageUrl.lastIndexOf('.'));
		var fileNameWithoutExtension = imageUrl.slice(0, imageUrl.lastIndexOf('.'));
		return fileNameWithoutExtension + "_mini" + extension;
    });
};