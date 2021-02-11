//var actionUpgrade = require('action.upgradeController');

module.exports = {
    run: function(creep) {
        if (!creep.memory.boosted&&creep.ticksToLive>1400) { // if creep is not boosted, find a lab to boost
            creep.say('get boosted');
            if (creep.room.memory.upgradeLabId) {
                let upgradeLab = Game.getObjectById(creep.room.memory.upgradeLabId);
                if (upgradeLab.mineralAmount>0) {
                    if ( creep.pos.getRangeTo(upgradeLab) > 1 ) {
                        creep.moveTo(upgradeLab);
                    }
                    else {
                        if (upgradeLab.boostCreep(creep) == 0||upgradeLab.boostCreep(creep) == -6) {
                            creep.memory.boosted = true;
                        }
                    }
                }
                else {
                    creep.memory.boosted = true;
                }
            }
            else { // not upgrader boosting lab, go straight to upgrading
               creep.memory.boosted=true;
            }
        }
        else { // not a boost creep
            if (creep.memory.working == true) {
                if (creep.memory.suckFrom==undefined) {
                    let nearbyEnergySources = creep.pos.findInRange(FIND_MY_STRUCTURES, 1, {filter:s=> ((s.structureType==STRUCTURE_STORAGE)||(s.structureType==STRUCTURE_TERMINAL))});
                    if (nearbyEnergySources.length>0) {
                        creep.memory.suckFrom = nearbyEnergySources[0].id;
                    }
                    else {
                        console.log(creep.room+'superUpgrader is not next to energy sources');
                    }
                }
                else {
                    let suckFrom = creep.memory.suckFrom;
                    creep.withdraw(Game.getObjectById(suckFrom),RESOURCE_ENERGY);

                    // look for construnction sites
                    let sites = creep.pos.findInRange(FIND_MY_CONSTRUCTION_SITES,3);
                    if (sites.length>0) {
                        creep.build(sites[0]);
                    }
                    else {
                        creep.upgradeController(creep.room.controller);
                    }

                    //actionUpgrade.run(creep);
                }
            }
            else if (creep.memory.working == false) {
                let roomName = creep.room.name;
                if ((creep.pos.isEqualTo(Game.flags['up'+roomName]))
                  ||(creep.pos.isEqualTo(Game.flags['up'+roomName+'_1']))
                  ||(creep.pos.isEqualTo(Game.flags['up'+roomName+'_2']))
                  //||(creep.pos.isEqualTo(Game.flags['up'+roomName+'_3']))
                  //||(creep.pos.isEqualTo(Game.flags['up'+roomName+'_4']))
                  //||(creep.pos.isEqualTo(Game.flags['up'+roomName+'_5']))
                  //||(creep.pos.isEqualTo(Game.flags['up'+roomName+'_6']))
                  ) {
                    creep.memory.working = true;
                }
                else {
                    let firstUp = Game.flags['up'+roomName].pos.findInRange(FIND_MY_CREEPS, 0)[0];
                    if (firstUp) { // if first up is occupied
                        let secondUp = Game.flags['up'+roomName+'_1'].pos.findInRange(FIND_MY_CREEPS, 0)[0];
                        if (secondUp) { // if 2nd is occupied
                            let thirdUp = Game.flags['up'+roomName+'_2'].pos.findInRange(FIND_MY_CREEPS, 0)[0];
                            if (thirdUp) { // if 3rd is occupied
                                let forthUp = Game.flags['up'+roomName+'_3'].pos.findInRange(FIND_MY_CREEPS, 0)[0];
                                if (forthUp) {
                                    let fifthUp = Game.flags['up'+roomName+'_4'].pos.findInRange(FIND_MY_CREEPS, 0)[0];
                                    if (fifthUp) {
                                        let sixthup = Game.flags['up'+roomName+'_5'].pos.findInRange(FIND_MY_CREEPS, 0)[0];
                                        if (sixthup) {
                                            let seventhUp = Game.flags['up'+roomName+'_6'].pos.findInRange(FIND_MY_CREEPS, 0)[0];
                                            if (seventhUp) {
                                                creep.travelTo(Game.flags['up' + roomName], { maxRooms: 1 });
                                            }
                                            else {
                                                creep.travelTo(Game.flags['up' + roomName + '_6'], { maxRooms: 1 });
                                            }
                                        }
                                        else {
                                            creep.travelTo(Game.flags['up' + roomName + '_5'], { maxRooms: 1 });
                                        }
                                    }
                                    else {
                                        creep.travelTo(Game.flags['up' + roomName + '_4'], { maxRooms: 1 });
                                    }
                                }
                                else {
                                    creep.travelTo(Game.flags['up' + roomName + '_3'], { maxRooms: 1 });
                                }
                            }
                            else { // 3rd is free
                                creep.travelTo(Game.flags['up' + roomName + '_2'], { maxRooms: 1 });
                            }
                        } // 2nd space is free
                        else {
                            creep.travelTo(Game.flags['up' + roomName + '_1'], { maxRooms: 1 });
                        }
                    }
                    else { // first up is free
                        creep.travelTo(Game.flags['up' + roomName], { maxRooms: 1 });
                    }
                }
            }
        }

        // re-spawn creep in advance
        /*if (creep.ticksToLive == creep.memory.spawnTime) {
            creep.room.memory.forSpawning.spawningQueue.push({memory:{role: 'superUpgrader'},priority: 5.1});
            console.log('respawn superUpgrader in advance');
        }*/
    }
};
