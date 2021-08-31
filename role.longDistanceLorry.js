//var rolePickuper = require('role.pickuper');
var linkEnergyTransferAtHome = require('action.linkEnergyTransferAtHome');
var actionRunAway = require('action.flee');
var actionPassE = require('action.passEnergy');
var dog = require('action.idle');

module.exports = {
    run: function (creep) {

        if (Game.cpu.bucket > 500) {
            if (Game.cpu.bucket > 5000 || creep.getActiveBodyparts(CARRY) > 10) {

                if (creep.memory.home == undefined) {
                    creep.memory.home = creep.room.name;
                }

                if (creep.memory.attackedAtTime && (creep.memory.attackedAtTime + 50) > Game.time) {
                    if (Game.rooms[creep.memory.target] && Game.rooms[creep.memory.target].find(FIND_HOSTILE_CREEPS, {filter:s=>!allyList().includes(s.owner.username) && (s.getActiveBodyparts(HEAL)+s.getActiveBodyparts(ATTACK)+s.getActiveBodyparts(RANGED_ATTACK)+s.getActiveBodyparts(WORK)>0)}).length==0) {
                        creep.memory.attackedAtTime = undefined;
                    }
                    creep.moveTo(new RoomPosition(25, 25, creep.memory.home), { range: 20 });
                    dog.run(creep);
                }
                else {
                    // log posi
                    let prvPosi = creep.memory.prvPosi;
                    let currentPosi = creep.pos;
                    if (prvPosi == undefined) {
                        let currentPosi = creep.pos;
                        creep.memory.prvPosi = currentPosi;
                    }

                    if (creep.memory.creepCost == undefined) {
                        creep.memory.creepCost = 1;
                    }
                    if (creep.memory && creep.memory._trav && creep.memory._trav.state && creep.memory._trav.state[2]) {
                        if (creep.memory._trav.state[2] > 5) {
                            creep.memory.creepCost = 10;
                        }
                        else {
                            creep.memory.creepCost = 1;
                        }
                    }

                    //console.log(creep.pos,creep.name)
                    // repair when walking
                    if (creep.getActiveBodyparts(WORK) > 0) {
                        let thingUnderFeet = creep.room.lookForAt(LOOK_STRUCTURES, creep)[0];
                        if (thingUnderFeet && thingUnderFeet.structureType == STRUCTURE_ROAD) {
                            creep.repair(thingUnderFeet);
                        }
                        else {
                            let thingUnderFeet = creep.room.lookForAt(LOOK_CONSTRUCTION_SITES, creep)[0];
                            if (thingUnderFeet) {
                                creep.build(thingUnderFeet);
                            }
                        }
                    }

                    if ((creep.pos.findInRange(FIND_HOSTILE_CREEPS, 5, { filter: c => (!allyList().includes(c.owner.username)) && (c.getActiveBodyparts(ATTACK) + c.getActiveBodyparts(RANGED_ATTACK) > 0) }).length > 0)) { // self destroy if not useful damages by NPC
                        actionRunAway.run(creep);
                    }
                    else {
                        creep.say('take away');
                        if (creep.memory.working == true && ((_.sum(creep.store) < 0.314 * creep.store.getCapacity()) && (_.sum(creep.store) == creep.store.energy))) {
                            creep.memory.working = false;
                        }
                        else if (creep.memory.working == false && _.sum(creep.store) >= creep.store.getCapacity() * 0.85) {
                            creep.memory.working = true;
                            creep.memory.energyTransferCount = 0;
                        }

                        if (creep.memory.working == true) {
                            if (creep.room.name != creep.memory.home) { // if not at home base
                                if (actionPassE.run(creep)) {
                                    return
                                }
                                else {
                                    creep.travelTo(new RoomPosition(25, 25, creep.memory.home));
                                }
                            }
                            else { // creep at home
                                if (creep.memory.working == true && _.sum(creep.store) == 0) { // < creep.carryCapacity*0.2) {
                                    creep.drop(RESOURCE_ENERGY);
                                    creep.memory.working = false;
                                }
                                linkEnergyTransferAtHome.run(creep)
                            }
                        }
                        else { // working is false, take energy
                            if (creep.hits < 0.8 * creep.hitsMax) {
                                creep.travelToWithCachedPath(new RoomPosition(25, 25, creep.memory.home), { creepCost: creep.memory.creepCost });
                            }
                            else {
                                if (creep.room.name == creep.memory.target) { // if not in target room go to target room, if in:
                                    let jobIdToDo = creep.memory.toGetId;
                                    let resObj = Game.getObjectById(jobIdToDo);
                                    let resType = creep.memory.resType;
                                    if (!resType) {
                                        if (resObj) { 
                                            if (resObj.store) {
                                                creep.memory.resType = 't'
                                                resType = creep.memory.resType;
                                            }
                                            else {
                                                creep.memory.resType = 'd'
                                                resType = creep.memory.resType;
                                            }
                                        }
                                        else {
                                            delete creep.memory.toGetId;
                                        }
                                    }
                                    if (jobIdToDo) {
                                        if (resObj) { // if the resource is still there (not decayed)
                                            if (resType == 't') {
                                                for (let mineralType in resObj.store) {
                                                    if (creep.withdraw(resObj, mineralType) == ERR_NOT_IN_RANGE) {
                                                        if (actionPassE.run(creep)) {
                                                            return
                                                        }
                                                        else {
                                                            if (resObj && resObj.pos) {
                                                                try {
                                                                    creep.travelTo(resObj.pos, { maxRooms: 1, creepCost: creep.memory.creepCost });
                                                                }
                                                                catch (e) {
                                                                    creep.moveTo(resObj.pos, { maxRooms: 1});
                                                                }
                                                            }
                                                            else {
                                                                creep.memory.toGetId = undefined;
                                                            }
                                                        }
                                                    }
                                                }
                                                if (!resObj || _.sum(resObj.store) == 0) {
                                                    creep.memory.toGetId = undefined;
                                                    creep.memory.resType = undefined;
                                                }
                                            }
                                            else if (resType == 'd') {
                                                if (creep.pickup(resObj) == ERR_NOT_IN_RANGE) {
                                                    if (actionPassE.run(creep)) {
                                                        return
                                                    }
                                                    else {
                                                        creep.travelToWithCachedPath(resObj.pos, { maxRooms: 1, creepCost: creep.memory.creepCost });
                                                    }
                                                }
                                                if (!resObj) {
                                                    creep.memory.toGetId = undefined;
                                                    creep.memory.resType = undefined;
                                                }
                                            }
                                            else if (resType == 'c') {
                                                if (!resObj || _.sum(resObj.store) < 100) {
                                                    creep.memory.toGetId = undefined;
                                                    creep.memory.resType = undefined;
                                                }
                                                else {
                                                    for (let mineralType in resObj.store) {
                                                        if (creep.withdraw(resObj, mineralType) == ERR_NOT_IN_RANGE) {
                                                            if (actionPassE.run(creep)) {
                                                                return
                                                            }
                                                            else {
                                                                creep.travelToWithCachedPath(resObj.pos, { maxRooms: 1, creepCost: creep.memory.creepCost });
                                                                if (creep.room.memory.resMem[jobIdToDo] && creep.room.memory.resMem[jobIdToDo].resAmount) {
                                                                    creep.room.memory.resMem[jobIdToDo].resAmount = _.sum(resObj.store);
                                                                }
                                                                else {
                                                                    creep.room.memory.resMem[jobIdToDo] = undefined;
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                            else {
                                                dog.run(creep);
                                            }
                                        }
                                        else {
                                            creep.memory.toGetId = undefined;
                                            creep.memory.resType = undefined;
                                            dog.run(creep);
                                        }
                                    }
                                    else { // does not have job to do but entred the room, avoid standing on edge
                                        //creep.travelToWithCachedPath(new RoomPosition(25, 25, creep.memory.target), { maxRooms: 1, creepCost: creep.memory.creepCost, range: 10 });
                                        if (creep.pos.x<2 || creep.pos.x>47 || creep.pos.y<2 || creep.pos.y>47 ) {
                                            creep.travelTo(new RoomPosition(25, 25, creep.memory.target), { maxRooms: 1, creepCost: creep.memory.creepCost, range: 15 })
                                        }
                                        else if (creep.pos.findInRange(FIND_MY_CREEPS, 1).length>1) {
                                            dog.run(creep);
                                        }
                                    }
                                }
                                else {
                                    //creep.travelTo(Game.flags[creep.memory.target]);
                                    //var exit = creep.room.findExitTo(creep.memory.target);
                                    //creep.travelTo(creep.pos.findClosestByRange(exit));
                                    if (actionPassE.run(creep)) {
                                        return
                                    }
                                    else {
                                        let route = Game.map.findRoute(creep.room, creep.memory.target, {
                                            routeCallback(roomName, fromRoomName) {
                                                let parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
                                                let isHighway = (parsed[1] % 10 === 0) ||
                                                    (parsed[2] % 10 === 0);
                                                let isMyRoom = Game.rooms[roomName] &&
                                                    Game.rooms[roomName].controller &&
                                                    Game.rooms[roomName].controller.my;
                                                if (isHighway) {
                                                    return 2;
                                                }
                                                else if (isMyRoom) {
                                                    return 1;
                                                }
                                                else if (Game.shard.name=='shard3' && (roomName=='E11S49'||roomName=='E12S49'||roomName=='E11S51')) {
                                                    return 255;
                                                }
                                                else if (Memory.rooms[roomName] && Memory.rooms[roomName].avoid) {
                                                    return 255;
                                                }
                                                else {
                                                    return 2.8;
                                                }
                                            }
                                        });
                                        
                                        if (route.length > 0) {
                                            creep.travelTo(creep.pos.findClosestByRange(creep.room.findExitTo(route[0].room)), {maxRooms: 1});
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};
