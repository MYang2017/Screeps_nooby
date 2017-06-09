module.exports = {
    run: function(creep) {
        var destination;
        let toHealName = creep.memory.toHeal;
        if ((toHealName == undefined) || (Game.creeps[toHealName] == undefined)) {
            /*if ((creep.room.name == creep.memory.home) && (creep.carry.energy < creep.carryCapacity)){ // if just borned, take some energy
              var structure = creep.room.storage;
              if (creep.withdraw(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                  creep.moveTo(structure);
              }
            }
            else if ( (creep.room.name == 'E92N11') || (creep.room.name =='E91N11') || (creep.room.name =='E90N11') || (creep.room.name =='E92N12') || (creep.room.name =='E91N12') ) { // go in sequence
                destination = Game.flags['E90N12'].pos;
                creep.moveTo(destination);
            }
            else if ( (creep.room.name == 'E90N12') || (creep.room.name == 'E90N13') || (creep.room.name == 'E90N14') || (creep.room.name == 'E90N15') || (creep.room.name == 'E90N16') ) { // go in sequence
                destination = Game.flags['E90N17'].pos;
                creep.moveTo(destination);
            }
            else */if (creep.room.name == creep.memory.target) { // if in target room
                if (creep.memory.toHeal == undefined) {
                    var woundeds = creep.room.find(FIND_MY_CREEPS, { filter: (s) => (s.hits<s.hitsMax) } );
                    /*if (creep.heal(woundeds[0]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(woundeds[0])
                    }*/
                    var lesser = 99999;
                    var healed;
                    if (woundeds != undefined) {
                        for (let wounded of woundeds) {
                            //console.log(Game.creeps[wounded.name])
                            if (Game.creeps[wounded.name].hits<lesser) {
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
                        creep.moveTo(Game.flags[creep.memory.target].pos);
                    }
                }
                else { // heal assiged target
                    if (creep.heal(Game.creeps[creep.memory.toHeal]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(Game.creeps[creep.memory.toHeal]);
                    }
                }
            }
            else { // go to target room
                //var exit = creep.room.findExitTo(creep.memory.target);
                creep.moveTo(Game.flags[creep.memory.target].pos);
            }
        }
        else {
            let toHealTar = Game.creeps[toHealName];
            creep.heal(toHealTar);
            creep.moveTo(toHealTar);
        }
    }
};
