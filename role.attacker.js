module.exports = {
    run: function(creep) {
        creep.say('OMG!😨', true);
        if (creep.room.name == creep.memory.target) { // if in target room
            /*var target = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: c => c.structureType == STRUCTURE_WALL});
            if (creep.attack(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target)
            }
            else {
                creep.moveTo(target)
            }*/
            var target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter: s => (!allyList().includes(s.owner))&&(s.getActiveBodyparts(HEAL) > 0)});
            if (target == undefined) {
                target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter: s => (!allyList().includes(s.owner))});
                //console.log('attack '+target);
                if (target == undefined) {
                    target = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {filter: (c) => c.structureType != STRUCTURE_WALL});
                }
            }

            const targets = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 3);
            if(targets.length > 0) {
                creep.rangedMassAttack();
            }

            if (creep.rangedAttack(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target)
            }
            else {
                creep.moveTo(target)
            }
        }
        else { // go to target room
            var exit = creep.room.findExitTo(creep.memory.target);
            creep.moveTo(creep.pos.findClosestByRange(exit));
        }
    }
};
