module.exports = {
    run: function(creep) {
        creep.say('presious...', true);
        if (creep.room.name == creep.memory.target) { // if in target room
            var target = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: s => s.structureType == STRUCTURE_CONTAINER});
            if (creep.dismantle(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target)
            }
        }
        else { // go to target room
            var exit = creep.room.findExitTo(creep.memory.target);
            creep.moveTo(creep.pos.findClosestByRange(exit));
        }
    }
};