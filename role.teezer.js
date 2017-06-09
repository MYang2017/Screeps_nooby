module.exports = {
    run: function(creep) {
        creep.say('???', true);
        if (creep.hits > 0.9*creep.hitsMax) { // if full health
            if (creep.room.name != creep.memory.target) { // if not in target room
               creep.travelTo(Game.flags[creep.memory.target]);
            }
            else { // in target room
                /*let target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                if (creep.attack(target) == ERR_NOT_IN_RANGE) {
                    creep.travelTo(target)
                }*/
                if (Game.flags['attack'] != undefined && creep.getActiveBodyparts(ATTACK)>0) {
                    creep.travelTo(Game.flags['attack']); // gether at flag's position
                    var target = Game.flags['attack'].pos.findInRange(FIND_STRUCTURES, 0)[0];

                    //var target = Game.getObjectById(Game.flags['attack'].room.lookAt(2,17)[0]['structure'].id);
                    //console.log(target)

                    if (creep.attack(target) == ERR_NOT_IN_RANGE) {
                        creep.travelTo(target)
                    }

                    if (creep.pos.isEqualTo(Game.flags['attack'])) {
                        Game.flags['attack'].remove();
                    }
                }
            }
        }
        else { // wounded
            //var exit = creep.room.findExitTo(creep.memory.home);
            //creep.travelTo(creep.pos.findClosestByRange(exit));
            creep.travelTo(Game.flags[creep.memory.home]);
        }
    }
};
