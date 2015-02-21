var errors  = require('../errors'),
    storage = {};

function getStorage(storageChoice) {
    // TODO: this is where the check for storage apps should go
    // Local file system is the default.  Fow now that is all we support.
    storageChoice = 's3';

    if (storage[storageChoice]) {
        return storage[storageChoice];
    }

    try {
        // TODO: determine if storage has all the necessary methods.
        storage[storageChoice] = require('./' + storageChoice);
    } catch (e) {
        errors.logError(e);
    }

    // Instantiate and cache the storage module instance.
    storage[storageChoice] = new storage[storageChoice]({
        errors: errors,
        config: require('../config')().aws
    });

    return storage[storageChoice];
}

module.exports.getStorage = getStorage;
