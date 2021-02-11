var selfRecycling = require('action.selfRecycle');

module.exports = {
    run: function (creep) {
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
            if (creep.ticksToLive < 1000 && creep.room.name == creep.memory.home) {
                // finished duty and recycle
                selfRecycling.run(creep);
            }
            else {
                var destination;
                let toHealName = creep.memory.toHeal;
                if ((toHealName == undefined) || (Game.creeps[toHealName] == undefined)) {
                    if (creep.room.name == creep.memory.target) { // if in target room
                        var target = creep.room.find(FIND_HOSTILE_STRUCTURES, { filter: c => c.structureType == STRUCTURE_POWER_BANK });
                        if (target.length == 0) {
                            creep.room.memory.goPower = undefined;
                            creep.memory.prepareToDie = true;
                        }
                        else {
                            if (creep.memory.toHeal == undefined) {
                                var woundeds = creep.room.find(FIND_MY_CREEPS, { filter: (s) => (s.hits < s.hitsMax) });
                                /*if (creep.heal(woundeds[0]) == ERR_NOT_IN_RANGE) {
                                    creep.moveTo(woundeds[0])
                                }*/
                                var lesser = 99999;
                                var healed;
                                if (woundeds != undefined) {
                                    for (let wounded of woundeds) {
                                        //console.log(Game.creeps[wounded.name])
                                        if (Game.creeps[wounded.name].hits < lesser) {
                                            lesser = wounded.hits;
                                            healed = Game.creeps[wounded.name];
                                        }
                                    }
                                    if (creep.heal(healed) == ERR_NOT_IN_RANGE) {
                                        creep.moveTo(healed);
                                    }
                                }
                                /*if (woundeds != undefined) {
                                    for (let wounded of woundeds) {
                                        //console.log(wounded)
                                        var range = creep.pos.getRangeTo(Game.creeps[wounded]);
                                        if (range==1) { // in range just heal
                                            creep.heal(wounded);
                                            break; // no need to scan other creeps
                                        }
                                        else { // not in range of healing that target
                                            var pos = ifSurrounded(Game.creeps[wounded.name]); // if the wounded target is surrounded or not
                                            //console.log(pos)
                                            if (pos != undefined) { // if not surrounded, go heal
                                                creep.moveTo(pos.x,pos.y);
                                                creep.heal(wounded);
                                                break; // break
                                            }
                                            else { // if it is already surrounded, find next one
                                                if (creep.heal(wounded) == ERR_NOT_IN_RANGE) {
                                                    creep.moveTo(wounded);
                                                }
                                            }
                                        }
                                    }
                                }*/
                                else { // if no wounded target go out of way
                                    creep.travelTo(new RoomPosition(25, 25, creep.memory.target), { range: 15 });
                                }
                            }
                            else { // heal assiged target
                                if (creep.heal(Game.creeps[creep.memory.toHeal]) == ERR_NOT_IN_RANGE) {
                                    creep.moveTo(Game.creeps[creep.memory.toHeal]);
                                }
                            }
                        }
                    }
                    else { // go to target room
                        //var exit = creep.room.findExitTo(creep.memory.target);
                        creep.travelTo(new RoomPosition(25, 25, creep.memory.target), { range: 15 });
                    }
                }
                else {
                    let toHealTar = Game.creeps[toHealName];
                    creep.heal(toHealTar);
                    creep.moveTo(toHealTar);
                }
            }
        }
    }
};
