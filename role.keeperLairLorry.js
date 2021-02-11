var actionRunAway = require('action.flee');
var actionGetEnergy = require('action.getEnergy');
var linkEnergyTransferAtHome = require('action.linkEnergyTransferAtHome');

module.exports = {
    run: function(creep) {
      //console.log(creep.pos,creep.name)
        let creepCarrying = _.sum(creep.carry);
        if (creep.memory.storedTarget == undefined) {
            creep.memory.storedTarget = {};
        }

        if (creep.hits < creep.hitsMax && creep.room.name != creep.memory.home) { // go back home to heal when injured
            creep.travelTo(new RoomPosition(25, 25, creep.memory.home));
        }
        else {
            if (creep.pos.findInRange(FIND_HOSTILE_CREEPS, 4).length > 0) { // self destroy if not useful damages by NPC
                actionRunAway.run(creep)
            }
            else {
                if (creep.memory.working == true && creepCarrying == 0) {
                    creep.memory.toCentre = false;
                    creep.memory.working = false;
                    creep.memory.energyTransferCount = 0;
                }
                else if (creep.memory.working == false && creepCarrying > 0.95 * creep.carryCapacity) {
                    creep.memory.working = true;
                    creep.memory.energyTransferCount = 0;
                }

                if (creep.memory.working == true) {
                    if (creep.room.name == creep.memory.home) { // if not in target room go to target room, if in:
                        for (const resourceType in creep.carry) {
                            if (resourceType == RESOURCE_ENERGY) { // carrying energy
                                if (creep.carry.energy < 200) {
                                    creep.drop(RESOURCE_ENERGY);
                                    if (_.sum(creep.carry) == 0) {
                                        creep.memory.working = false;
                                    }
                                }
                                if (creep.carry.energy > 0) {
                                    linkEnergyTransferAtHome.run(creep);
                                }
                            }
                            else { // carrying minerals
                                let structure = creep.room.terminal;
                                if ((structure == undefined) || (_.sum(structure.store) > 0.9 * structure.storeCapacity)) {
                                    structure = creep.room.storage;
                                }
                                if (creep.transfer(structure, resourceType) == ERR_NOT_IN_RANGE) {
                                    creep.travelTo(structure);
                                }
                            }
                        }
                    }
                    else { // in target room
                        if ((creep.carry.energy > 0) && (creep.getActiveBodyparts(WORK) > 0)) {
                            let constructionSite = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
                            if (false) { // work as temperory builder
                                //if (constructionSite) {
                                if (creep.build(constructionSite) == ERR_NOT_IN_RANGE) {
                                    creep.travelTo(constructionSite, { maxRooms: 1 });
                                    //creep.build(constructionSite);
                                }
                            }
                            else {
                                let thingUnderFeet = creep.room.lookForAt(LOOK_STRUCTURES, creep)[0];
                                if (thingUnderFeet && thingUnderFeet.structureType == STRUCTURE_ROAD) {
                                    creep.repair(thingUnderFeet);
                                    creep.say('repair road');
                                }
                                creep.travelTo(new RoomPosition(25, 25, creep.memory.home));
                            }
                        }
                        else {
                            creep.travelTo(new RoomPosition(25, 25, creep.memory.home));
                        }
                    }
                }
                else { // working is false, take energy
                    if (creep.room.name == creep.memory.target) { // if not in target room go to target room, if in:
                        if (true) { //(creep.room.name == 'E35S5') { // new test code for the resource getting management
                            let jobIdToDo = creep.memory.toGetId;
                            let resType = creep.memory.resType;
                            if (!resType) {
                                delete creep.memory.toGetId;
                            }
                            if (jobIdToDo) {
                                let resObj = Game.getObjectById(jobIdToDo);
                                if (resObj) { // if the resource is still there (not decayed)
                                    if (resType == 't') {
                                        for (let mineralType in resObj.store) {
                                            if (creep.withdraw(resObj, mineralType) == ERR_NOT_IN_RANGE) {
                                                creep.travelTo(resObj, { maxRooms: 1 });
                                            }
                                        }
                                        if (!resObj || _.sum(resObj.store) == 0) {
                                            creep.memory.toGetId = undefined;
                                            creep.memory.resType = undefined;
                                        }
                                    }
                                    else if (resType == 'd') {
                                        if (creep.pickup(resObj) == ERR_NOT_IN_RANGE) {
                                            creep.travelTo(resObj, { maxRooms: 1 });
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
                                                    creep.travelTo(resObj, { maxRooms: 1 });
                                                    creep.room.memory.resMem[jobIdToDo].resAmount = _.sum(resObj.store);
                                                }
                                            }
                                        }
                                    }
                                }
                                else {
                                    creep.memory.toGetId = undefined;
                                    creep.memory.resType = undefined;
                                }
                            }
                            else { // does not have job to do but entred the room, avoid standing on edge
                                creep.travelTo(new RoomPosition(25, 25, creep.memory.target), { maxRooms: 1 });
                            }
                        }
                        else {
                            // if there is dropped mineral
                            let droppedMinerals = creep.room.find(FIND_DROPPED_RESOURCES, { filter: s => s.resourceType != RESOURCE_ENERGY });
                            if (droppedMinerals.length) { // if there is mineral dropped
                                creep.travelTo(droppedMinerals[0], { maxRooms: 1 });
                                creep.pickup(droppedMinerals[0]);
                            }
                            else { // no mineral dropped
                                // check if there is tombstone, if there is, pickup tombstone
                                let tombstones = creep.room.find(FIND_TOMBSTONES, { filter: c => (_.sum(c.store) > 1500) || (_.sum(c.store) - c.store.energy > 0) });
                                if (tombstones.length > 0) {
                                    let tombstone = tombstones[0];
                                    for (let mineralType in tombstone.store) {
                                        if (creep.withdraw(tombstone, mineralType) == ERR_NOT_IN_RANGE) {
                                            creep.travelTo(tombstone);
                                        }
                                    }
                                }
                                else { // no tombstone, work normally
                                    ifMineral = mineralNeedsCollect(creep.room);
                                    if ((ifMineral) && (ifMineral[2] > 0)) {
                                        let container = creep.pos.findClosestByRange(FIND_STRUCTURES, { filter: s => s.structureType == STRUCTURE_CONTAINER && s.store.energy > 0 });
                                        if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                            creep.travelTo(container, { maxRooms: 1 });
                                        }
                                    }
                                    else if ((ifMineral) && (ifMineral[0] > creep.carryCapacity)) { // if there is a mineral container and its mineral amount is higher than creep's carrying capacity
                                        let resourceType = ifMineral[1];
                                        creep.say('get ' + resourceType);
                                        let container = creep.pos.findClosestByRange(FIND_STRUCTURES, { filter: s => s.structureType == STRUCTURE_CONTAINER && s.store[resourceType] > 0 });
                                        if (creep.withdraw(container, resourceType) == ERR_NOT_IN_RANGE) {
                                            creep.travelTo(container, { maxRooms: 1 });
                                        }
                                    }
                                    else { // find energy
                                        let [resourceID, ifDropped] = evaluateEnergyResources(creep, false, false, true, true); // find energy functoin in myFunctoins
                                        if (resourceID) { // if there is dropped energy or energy in container
                                            let energy = Game.getObjectById(resourceID);
                                            if (ifDropped) { // if energy is dropped
                                                if (creep.pickup(energy) == ERR_NOT_IN_RANGE) {
                                                    creep.travelTo(energy, { maxRooms: 1 });
                                                }
                                            }
                                            else { // energy is from container
                                                if (creep.withdraw(energy, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                                    creep.travelTo(energy, { maxRooms: 1 });
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    else {
                        if (creep.memory.storedTarget.roomName) { // if stored target position
                            creep.travelTo(new RoomPosition(creep.memory.storedTarget.x, creep.memory.storedTarget.y, creep.memory.storedTarget.roomName));
                        }
                        else {
                            creep.travelTo(new RoomPosition(25, 25, creep.memory.target));
                        }
                        //var exit = creep.room.findExitTo(creep.memory.target);
                        //creep.travelTo(creep.pos.findClosestByRange(exit));
                    }
                }
            }
        }
    }
};
