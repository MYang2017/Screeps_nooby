var actionUpgrade = require('action.upgradeController');

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
            let cr = creep.room.controller;
            if (creep.memory.suckFrom == undefined) {
                let nearbyEnergySources = cr.pos.findInRange(FIND_MY_STRUCTURES, 3, {filter:s=> ((s.structureType==STRUCTURE_STORAGE)||(s.structureType==STRUCTURE_TERMINAL)||(s.structureType==STRUCTURE_LINK))});
                if (nearbyEnergySources.length>0) {
                    creep.memory.suckFrom = nearbyEnergySources[0].id;
                }
                else {
                    console.log(creep.room+'superUpgrader is not next to energy sources');
                }
            }
            
            let suck = Game.getObjectById(creep.memory.suckFrom);
            if (creep.pos.getRangeTo(suck)>1) {
                creep.moveTo(suck);
            }
            else {
                creep.withdraw(suck, 'energy');
                creep.upgradeController(cr);
            }

            /*if (creep.memory.working == true) {
                if (creep.memory.suckFrom == undefined) {
                    let nearbyEnergySources = creep.pos.findInRange(FIND_MY_STRUCTURES, 1, {filter:s=> ((s.structureType==STRUCTURE_STORAGE)||(s.structureType==STRUCTURE_TERMINAL)||(s.structureType==STRUCTURE_LINK))});
                    if (nearbyEnergySources.length>0) {
                        creep.memory.suckFrom = nearbyEnergySources[0].id;
                    }
                    else {
                        console.log(creep.room+'superUpgrader is not next to energy sources');
                    }
                }
                else {
                    // if in position move in cicles
                    let okPosis = creep.room.memory.superUpgraderPosisCach;
                    if (okPosis && okPosis.length>0) {
                        let nextPos = getNextElementInArrayInCircle(creep.pos, okPosis);
                        creep.moveTo(nextPos.x, nextPos.y);

                        let suckFrom = creep.memory.suckFrom;
                        creep.withdraw(Game.getObjectById(suckFrom), RESOURCE_ENERGY);

                        // look for construnction sites
                        let sites = creep.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 3);
                        if (sites.length > 0) {
                            creep.build(sites[0]);
                        }
                        else {
                            creep.upgradeController(creep.room.controller);
                        }
                    }
                    else { // posi not registered
                        actionUpgrade.run(creep);
                    }
                }
            }
            else if (creep.memory.working == false) {
                let okPosis = creep.room.memory.superUpgraderPosisCach;
                if (okPosis) {
                    for (let okPosi1 of okPosis) {
                        if (okPosi1.x == creep.pos.x && (okPosi1.y == creep.pos.y)) {
                            creep.memory.working = true;
                            return
                        }
                    }
                    let okPosi = superUpgraderLookForAvailablePosis(creep.room);
                    if ((creep.pos.x == okPosi.x && creep.pos.x == okPosi.y)) {
                        creep.memory.working = true;
                    }
                    else {
                        creep.travelTo(new RoomPosition(okPosi.x, okPosi.y, creep.room.name), { maxRooms: 1 });
                    }
                }
                else {
                    if (!superUpgraderPosisCach(creep.room.name)) {
                        actionUpgrade.run(creep);
                    }
                }
            }*/
        }

        // re-spawn creep in advance
        /*if (creep.ticksToLive == creep.memory.spawnTime) {
            creep.room.memory.forSpawning.spawningQueue.push({memory:{role: 'superUpgrader'},priority: 5.1});
            console.log('respawn superUpgrader in advance');
        }*/
    }
};
