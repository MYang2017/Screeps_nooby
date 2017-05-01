module.exports = {
    run: function(creep) {
        if (creep.room.name == creep.memory.target) { // if in target room
            //console.log(creep.claimController(creep.room.controller));
            if (creep.claimController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
            }
        }
        else { // go to target room
            var exit = creep.room.findExitTo(creep.memory.target);
            creep.moveTo(creep.pos.findClosestByRange(exit));
        }
    }
};