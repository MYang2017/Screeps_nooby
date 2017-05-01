module.exports = {
    run: function(creep) {
        if (creep.room.name == creep.memory.target) { // if in target room
            var target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter: s => s.getActiveBodyparts(HEAL) > 0});
            if (target == undefined) {
                target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
            }
            creep.attack(target)
        }
        else { // go to target room
            var exit = creep.room.findExitTo(creep.memory.target);
            creep.moveTo(creep.pos.findClosestByRange(exit));
        }
    }
};