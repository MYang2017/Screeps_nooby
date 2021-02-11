var selfRecycling = require('action.selfRecycle');

module.exports = {
    run: function(creep) {
        if (creep.memory.prepareToDie) {
            if (creep.room.name != creep.memory.home) {
                creep.travelTo(new RoomPosition(25, 25, creep.memory.home));
            }
            else {
                // finished duty and recycle
                selfRecycling.run(creep);
            }
        }
        else {
            //creep.travelTo(new RoomPosition(25,25,creep.memory.target),{range:5});
            if (creep.room.name == creep.memory.target) { // if in target room
                var myHealer = creep.room.find(FIND_MY_CREEPS, { filter: (s) => (s.getActiveBodyparts(HEAL) > 0) });
                if (myHealer != undefined) { // if healer around, attack power source
                    if (creep.hits > creep.hitsMax * 0.8) { // only attack if health > 80%
                        var target = creep.room.find(FIND_HOSTILE_STRUCTURES, { filter: c => c.structureType == STRUCTURE_POWER_BANK });
                        if (target.length == 0) {
                            creep.room.memory.goPower = undefined;
                            creep.memory.prepareToDie = true;
                        }
                        else if (target.length != 0 && target[0].hits > 1900) {
                            //console.log((creep.room.find(FIND_MY_CREEPS, {filter: c=> c.memory.role == 'powerSourceLorry'}).length+1) * 1650 , target[0].power);
                            if (creep.attack(target[0]) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(target[0]);
                            }
                            if (target[0].hits / target[0].ticksToDecay > 1000) {
                                creep.room.memory.goPower = undefined;
                                creep.memory.prepareToDie = true;
                            }
                        }
                        else if ((target.length != 0) && ((creep.room.find(FIND_MY_CREEPS, { filter: c => c.memory.role == 'powerSourceLorry' }).length + 1) * 1650 >= target[0].power)) {
                            if (creep.attack(target[0]) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(target[0]);
                            }
                        }
                        else if ((target[0].hits / 600 + 10) > target[0].ticksToDecay || (target[0].hits / 600 + 10) > creep.ticksToDecay) {
                            if (creep.attack(target[0]) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(target[0]);
                            }
                        }
                        else {
                            creep.room.memory.goPower = undefined;
                            //creep.memory.prepareToDie = true;
                        }
                    }

                }
            }
            else { // go to target room
                //var exit = creep.room.findExitTo(creep.memory.target);
                creep.travelTo(new RoomPosition(25, 25, creep.memory.target), { range: 15 });
            }
        }
    }
};
