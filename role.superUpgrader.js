var actionUpgrade = require('action.upgradeController');
let rec = require('action.recycle');
let b = require('role.builder');
let loot = require('action.ontheway');
var dupCheck = require('action.dupCheck');

module.exports = {
    run: function(creep) {
        if (checkIfCreepIsBoosted(creep) == false) {
            let sites = creep.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 3);
            if (sites.length > 0) {
                if (creep.pos.getRangeTo(sites[0])==0) {
                    creep.move(getRandomInt(1,8));
                }
                creep.build(sites[0]);
            }
        }

        if (false) { // (!creep.memory.boosted&&creep.ticksToLive>1400) { // if creep is not boosted, find a lab to boost
            creep.say('get boosted');
            if (creep.room.memory.upgradeLabId) {
                let upgradeLab = Game.getObjectById(creep.room.memory.upgradeLabId);
                if (upgradeLab.mineralAmount>0 && upgradeLab.cooldown==0) {
                    if ( creep.pos.getRangeTo(upgradeLab) > 1 ) {
                        creep.moveTo(upgradeLab, {maxRooms: 1});
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
            if (creep.memory.target && creep.room.name!=creep.memory.target) {
                creep.travelTo(Game.rooms[creep.memory.target].controller, {maxRooms: 1});
                return
            }
            let cr = creep.room.controller;
            
            if (creep.ticksToLive<=50 && checkIfCreepIsBoosted(creep)) {
                if (creep.store.energy>0) {
                    creep.upgradeController(cr);
                }
                rec.run(creep);
                return
            }
            
            if (creep.room.controller && creep.room.controller.my) {
                if (creep.room.controller.level==8) {
                    if (dupCheck.run(creep, 2)) {
                        creep.room.memory.forSpawning.roomCreepNo.minCreeps['builder'] = updateBuilderNo(creep.room.name);
                        return
                    }
                }
                else {
                    if (dupCheck.run(creep, 4)) {
                        creep.room.memory.forSpawning.roomCreepNo.minCreeps['builder'] = updateBuilderNo(creep.room.name);
                        return
                    }
                }
            }
            
            if (cr.level==8 && creep.getActiveBodyparts(WORK)>15) {
                rec.run(creep);
                return
            }

            if (creep.memory.suckFrom == undefined || Game.getObjectById(creep.memory.suckFrom) == undefined) {
                let ifTower = false;
                let ts = creep.room.find(FIND_MY_STRUCTURES, {filter: o=>o.structureType==STRUCTURE_TOWER});
                let tdis = 100;
                let tts = undefined;
                
                for (let t of ts) { // find closest tower
                    if (t.pos.getRangeTo(cr) <= 3) {
                        let thistdis = t.pos.getRangeTo(cr);
                        if (thistdis<tdis) {
                            tdis = thistdis;
                            tts = t;
                        }
                        ifTower = true;
                    }
                }
                if (ifTower) {
                    creep.memory.suckFrom = tts.id;
                }
                if (!ifTower) {
                    let nearbyEnergySources = cr.pos.findInRange(FIND_STRUCTURES, 3, {filter:s=> ((s.structureType==STRUCTURE_STORAGE)||(s.structureType==STRUCTURE_TERMINAL)||(s.structureType==STRUCTURE_CONTAINER)||(s.structureType==STRUCTURE_LINK)||(s.structureType==STRUCTURE_LAB))});
                    if (nearbyEnergySources.length>0) {
                        creep.memory.suckFrom = nearbyEnergySources[0].id;
                    }
                    else {
                        if (creep.pos.getRangeTo(creep.room.controller)>2) {
                            creep.travelTo(creep.room.controller, {maxRooms: 1});
                        }
                        else {
                            // wait or build cs
                            return
                        }
                    }
                }
            }
            
            
            let suck = Game.getObjectById(creep.memory.suckFrom);
            
            let tolabdist = creep.pos.getRangeTo(suck);
            
            if ( tolabdist > 1 ) {
                creep.travelTo(suck, {maxRooms: 1});
                if (creep.pos.getRangeTo(cr)<4) {
                    if (creep.store.energy>0) {
                        creep.upgradeController(cr);
                    }
                }
                return
                let lands1 = returnALLAvailableLandCoords(creep.room, suck.pos);
                let closest1 = undefined;
                let dist1 = 10;
                for (let land1 of lands1) {
                    let lound1 = creep.room.lookForAt(LOOK_STRUCTURES, land1.x, land1.y);
                    if (lound1.length==0 && creep.room.lookForAt(LOOK_CREEPS, land1.x, land1.y).length==0) {
                        let thisdist1 = creep.pos.getRangeTo(land1.x, land1.y);
                        if (thisdist1<dist1) {
                            dist1 = thisdist1;
                            closest1 = [land1.x, land1.y];
                        }
                    }
                }
                if (closest1) {
                    creep.moveTo(closest1[0], closest1[1], {maxRooms: 1});
                    return
                }
                else {
                    creep.move(getRandomInt(1,8));
                }
            }
            else {
                let suckInterv = Math.min(6, Math.ceil(creep.getActiveBodyparts(CARRY)*50/creep.getActiveBodyparts(WORK)-1));
                if ((Game.time%suckInterv==0 || creep.store.energy==0) && creep.ticksToLive>3) {
                    let suckres;
                    if (suck.store.energy>250 || (suck.structureType!==STRUCTURE_TOWER && suck.store.energy>0)) {
                        suckres = creep.withdraw(suck, 'energy');
                    }
                    else {
                        if (!(creep.room.memory.suckTimer == undefined)) {
                            creep.room.memory.suckTimer += 1;
                        }
                        else {
                            creep.room.memory.suckTimer = 0;
                        }
                    }
                }
                
                if (Game.time%12==0) {
                    loot.run(creep);
                }
                
                creep.upgradeController(cr);
                let thingUnderFeet = creep.room.lookForAt(LOOK_STRUCTURES, creep)[0];
                if (thingUnderFeet && thingUnderFeet.structureType && thingUnderFeet.structureType == STRUCTURE_ROAD) {
                    let allColleges = creep.room.find(FIND_MY_CREEPS, {filter:c=>c.memory.role=='superUpgrader'});
                    for (let cos of allColleges) {
                        if (cos.name!=creep.name) {
                            let randint = getRandomInt(1,8);
                            let nextpos = getPosByDir(creep.pos, randint);
                            if (nextpos.getRangeTo(suck)<2) {
                                cos.move(randint);
                            }
                        }
                    }

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
                        creep.moveTo(closest[0], closest[1], {maxRooms: 1});
                        return
                    }
                    else {
                        let randint = getRandomInt(1,8);
                        let nextpos = getPosByDir(creep.pos, randint);
                        if (nextpos.getRangeTo(suck)<2) {
                            creep.move(randint);
                        }
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
