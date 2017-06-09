var actionRunAway = require('action.flee');

module.exports = {
    run: function(creep) {
        if (creep.room.name != creep.memory.target) {
            //var exit = creep.room.findExitTo(creep.memory.target);
            //creep.moveTo(creep.pos.findClosestByRange(exit));
            creep.moveTo(Game.flags[creep.memory.target].pos);
        }
        else {
            if (creep.reserveController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
            }
            actionRunAway.run(creep)
        }
    }
};
