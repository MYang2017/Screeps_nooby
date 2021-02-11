var actionRunAway = require('action.idle');

module.exports = {
    run: function(creep) {
        let toHealName = creep.memory.toHeal;
        if (Game.creeps[toHealName] == undefined || Game.creeps[toHealName].spawning == true) { // toHeal target is dead or still spawning
            if (creep.room.name == creep.memory.target) { // if in target room
                let toHeal = creep.pos.findClosestByRange(FIND_MY_CREEPS, { filter: (s) => (s.hits < s.hitsMax) });

                if (toHeal) { // if there is damaged creep, go heal
                    if (creep.heal(toHeal) == ERR_NOT_IN_RANGE) {
                        creep.travelTo(toHeal);
                        creep.rangedHeal(toHeal);
                    }
                }
                else {
                    actionRunAway.run(creep);
                }
            }
            else {
                creep.travelTo(new RoomPosition(25,25,creep.memory.target),{range:15});
            }
        }
        else { // toHeal Creep is here
            if (creep.room.name != creep.memory.target) {
                creep.travelTo(new RoomPosition(25,25,creep.memory.target),{range:15});
            }
            else {
                let toHealCreep = Game.creeps[toHealName];
                if (creep.hits<0.618*creep.hitsMax) {
                    creep.moveTo(toHealCreep);
                    creep.heal(creep);
                }
                else {
                    if (toHealCreep&&toHealCreep.room.name == creep.room.name&&toHealCreep.hits<toHealCreep.hitsMax) {
                        if (creep.heal(toHealCreep) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(toHealCreep);
                            creep.rangedHeal(toHealCreep);
                        }
                    }
                    else {
                        let toHeal = creep.pos.findClosestByRange(FIND_MY_CREEPS, { filter: (s) => (s.hits < s.hitsMax) } );
                        if (toHeal) { // if there is damaged creep, go heal
                            if (creep.heal(toHeal) == ERR_NOT_IN_RANGE) {
                                creep.travelTo(toHeal);
                                creep.rangedHeal(toHeal);
                            }
                        }
                        else {
                            actionRunAway.run(creep);
                        }
                    }
                }
            }
        }
    }
};
