module.exports = {
    run: function(creep) {
        if (creep.memory.target == undefined || creep.room.name == creep.memory.target) {// if in target room or main room
            let source = Game.getObjectById(creep.memory.sourceID);
            let container = source.pos.findInRange(FIND_STRUCTURES, 1, { filter: s => s.structureType == STRUCTURE_CONTAINER})[0];        
            if (creep.pos.isEqualTo(container)) {
                creep.harvest(source)
            }
            else {
                creep.moveTo(container);
            }
        }
        else {// go to target room
            var exit = creep.room.findExitTo(creep.memory.target);
            creep.moveTo(creep.pos.findClosestByRange(exit));
        }
    }
};