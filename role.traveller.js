module.exports = {
    run: function(creep) {
        if (creep.room.name == creep.memory.target) { // if in target room
            // do nothing
        }
        else { // go to target room
            var exit = creep.room.findExitTo(creep.memory.target);
            creep.moveTo(creep.pos.findClosestByRange(exit));
        }
    }
};
