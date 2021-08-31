var rec = require('action.recycle');

module.exports = {
    run: function(creep, no=1) {
        let myRoles = creep.room.find(FIND_MY_CREEPS, {filter: c=>c.memory.role==creep.memory.role && c.ticksToLive>20});
        if (myRoles.length>no) {
            rec.run(creep);
            return true
        }
    }
};
