module.exports = {
    run: function(creep) {
        if (creep.room.name == creep.memory.target) { // if in target room
            let target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter: s => (!allyList().includes(s.owner))});
            if (target != undefined) { // found hostile creep
                if (creep.attack(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target)
                }
            }
            else { // no hostile and safe
                creep.moveTo(Game.flags[creep.name].pos)
            }
        }
        else { // go to target room
            var exit = creep.room.findExitTo(creep.memory.target);
            creep.moveTo(creep.pos.findClosestByRange(exit));
        }
    }
};
