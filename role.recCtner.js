var actionRecycle = require('action.recycle');

module.exports = {
    run: function(creep) {
        if (actionRecycle.run(creep)) {
            return
        }
    }
};
