var actionUpgrade = require('action.upgradeController');
let rec = require('action.recycle');
let b = require('role.builder');

module.exports = {
    run: function(creep) {
        if (Game.cpu.bucket>7777) {
            let sites = creep.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 3);
            if (sites.length > 0) {
                creep.build(sites[0]);
            }
        }
        
        if (false) { // (!creep.memory.boosted&&creep.ticksToLive>1400) { // if creep is not boosted, find a lab to boost
            creep.say('get boosted');
            if (creep.room.memory.upgradeLabId) {
                let upgradeLab = Game.getObjectById(creep.room.memory.upgradeLabId);
                if (upgradeLab.mineralAmount>0 && upgradeLab.cooldown==0) {
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
            
            if (cr.level==8 && creep.getActiveBodyparts(WORK)>15) {
                rec.run(creep);
                return
            }
            
            if (creep.memory.suckFrom == undefined || Game.getObjectById(creep.memory.suckFrom) == undefined) {
                let ifTower = false;
                let ts = creep.room.find(FIND_STRUCTURES, {filter: o=>o.structureType==STRUCTURE_TOWER});
                for (let t of ts) {
                    if (t.pos.getRangeTo(cr) < 3) {
                        ifTower = true;
                        creep.memory.suckFrom = t.id;
                    }
                }
                if (!ifTower) {
                    let nearbyEnergySources = cr.pos.findInRange(FIND_STRUCTURES, 3, {filter:s=> ((s.structureType==STRUCTURE_STORAGE)||(s.structureType==STRUCTURE_TERMINAL)||(s.structureType==STRUCTURE_CONTAINER)||(s.structureType==STRUCTURE_LINK)||(s.structureType==STRUCTURE_LAB))});
                    if (nearbyEnergySources.length>0) {
                        creep.memory.suckFrom = nearbyEnergySources[0].id;
                    }
                    else {
                        if (Game.time%33==0) {
                            console.log(creep.room+'superUpgrader is not next to energy sources');
                        }
                        b.run(creep);
                        return
                    }
                }
            }
            
            
            let suck = Game.getObjectById(creep.memory.suckFrom);
            
            // check boost
            if (suck && suck.structureType == STRUCTURE_LAB) {
                if (creep.room.controller.level <8 &&Game.cpu.bucket>3000 && !creep.memory.boosted && creep.ticksToLive>1350) {
                    if (suck.mineralAmount>0 && suck.energyCapacity>1500 && suck.cooldown==0) {
                        let tolabdist = creep.pos.getRangeTo(suck);
                        if ( tolabdist > 4 ) {
                            creep.travelTo(suck, {ignoreCreeps: true});
                        }
                        else if (tolabdist > 1) {
                            creep.travelTo(suck);
                        }
                        else {
                            if (suck.boostCreep(creep) == 0||suck.boostCreep(creep) == -6) {
                                creep.memory.boosted = true;
                            }
                        }
                    }
                    else {
                        creep.memory.boosted = true;
                    }
                }
                if (creep.memory.boosted && creep.ticksToLive<2) {
                    suck.unboostCreep(creep);
                }
            }
            
            let tolabdist = creep.pos.getRangeTo(suck);
            if ( tolabdist > 4 ) {
                creep.travelTo(suck, {ignoreCreeps: true});
            }
            else if (tolabdist > 1) {
                creep.travelTo(suck);
            }
            else {
                let suckInterv = 2;
                if (creep.getActiveBodyparts(WORK)>25) {
                    suckInterv = 1;
                }
                if (Game.time%suckInterv==0 && creep.ticksToLive>3) {
                    if (suck.structureType==STRUCTURE_TOWER) {
                        if (suck.store.energy>250) {
                            creep.withdraw(suck, 'energy');
                        }
                    }
                    else {
                        creep.withdraw(suck, 'energy');
                    }
                }
                creep.upgradeController(cr);
                let thingUnderFeet = creep.room.lookForAt(LOOK_STRUCTURES, creep)[0];
                if (thingUnderFeet && thingUnderFeet.structureType && thingUnderFeet.structureType == STRUCTURE_ROAD) {
                    let lands = returnALLAvailableLandCoords(creep.room, suck.pos);
                    let closest = undefined;
                    let dist = 10;
                    for (let land of lands) {
                        let lound = creep.room.lookForAt(LOOK_STRUCTURES, land.x, land.y);
                        if (lound.length==0 && creep.room.lookForAt(LOOK_CREEPS, land.x, land.y).length==0) {
                            let thisdist = creep.pos.getRangeTo(land.x, land.y);
                            if (thisdist<dist) {
                                dist = thisdist;
                                closest = [land.x, land.y];
                            }
                        }
                    }
                    if (closest) {
                        creep.moveTo(closest[0], closest[1]);
                        return
                    }
                    else {
                        creep.move(getRandomInt(1,8));
                    }
                }
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
