module.exports = {
    run: function(creep) {
        //if (creep.hits == creep.hitsMax) { // if full health
        if (true) { // if full health
            //if (creep.room.name == creep.memory.target) { // if in target room
                if (Game.flags['attack'] != undefined) {
                    creep.travelTo(Game.flags['attack'].pos); // gether at flag's position
                    var target = Game.flags['attack'].pos.findInRange(FIND_STRUCTURES, 1)[0];

                    //var target = Game.getObjectById(Game.flags['attack'].room.lookAt(2,17)[0]['structure'].id);
                    //console.log(target)

                    if (creep.attack(target) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target)
                    }

                    if (creep.pos.isEqualTo(Game.flags['attack'])) {
                        Game.flags['attack'].remove();
                    }
                }
                else {
                    if (Game.flags['attack1'] != undefined) {
                        creep.moveTo(Game.flags['attack1'].pos);
                        if (creep.pos.isEqualTo(Game.flags['attack1'])) {
                            Game.flags['attack1'].remove();
                        }
                    }
                    else {
                        //var target = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {filter: s => ((s.structureType == STRUCTURE_SPAWN)||(s.structureType == STRUCTURE_RAMPART))});
                        var target = undefined; //= creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {filter: s => ((s.structureType == STRUCTURE_SPAWN))});
                          /*if (creep.pos.findInRange(FIND_HOSTILE_CREEPS, 2) !=undefined) {
                            target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                          };*/
                        if (target==undefined) {
                            //let target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter: s => (!allyList().includes(s.owner))});
                            target = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: s => ((s.structureType == STRUCTURE_WALL))});
                        }
                        if (target==undefined) {
                            //let target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter: s => (!allyList().includes(s.owner))});
                            target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                        }
                        if (creep.attack(target) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(target)
                            creep.rangeattack(target)
                        }
                    }
                }
            /*}
            else { // go to target room
                var exit = creep.room.findExitTo(creep.memory.target);
                creep.moveTo(creep.pos.findClosestByRange(exit));
            }*/
        }
        /*else { // if wound go to base to heal, hit and run
            var targets = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 3, {filter: s => (!allyList().includes(s.owner))});
            if(targets.length > 1) { // if more than 1 hostile targets, mass attack
                creep.attack(targets[0]);
            }
            else if(targets.length == 1) { // if 1 hostile target, ranged attack it
              creep.rangedAttack(targets[0]);
            }

            var exit = creep.room.findExitTo(creep.memory.home);
            creep.moveTo(creep.pos.findClosestByRange(exit));
        }*/
    }
};
