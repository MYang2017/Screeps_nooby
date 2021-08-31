// pickuper now is the combination of old lorry and pickuper together since v7
var actionAvoid = require('action.idle');
let doge = require('action.flee');
let fillReLab = require('action.fillReactionLabs');

module.exports = {
    run: function(creep) {
        //if (creep.memory.home == undefined) { // || creep.room.name != creep.memory.home) {
        //    creep.travelTo(Game.flags('linkE94N17'));
        //}
        //else {
            creep.memory.free=false;
            if (creep.room.name == creep.memory.target) { // if in target room work
                creep.say('recycling');
                if (creep.memory.working == undefined) {
                    creep.memory.working = false;
                }
                else {
                    if (creep.pos.findInRange(FIND_HOSTILE_CREEPS, 4, {filter:c=>!allyList().includes(c.owner.username)}).length>0) {
                        doge.run(creep);
                        return
                    }
                    
                    // run reaction labs
                    if (fillReLab.run(creep)) {
                        return
                    }
                    
                    if (creep.memory.working == true && _.sum(creep.carry) == 0) {
                        creep.memory.working = false;
                    }
                    else if (((creep.memory.working) == false) && ((creep.carry.energy > 0.618 * creep.carryCapacity) || (_.sum(creep.carry) == creep.carryCapacity))) {
                        creep.memory.working = true;
                    }
                    if (creep.memory.working == true) {
                        for (const resourceType in creep.carry) {
                            if (resourceType == RESOURCE_ENERGY) { // carrying energy
                                var structure = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                                    filter: (s) => (
                                        (((s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION) && (s.energy < s.energyCapacity)) ||
                                        ((s.structureType == STRUCTURE_TOWER) && (s.energy < s.energyCapacity * 0.8)) ||
                                        ((s.structureType == STRUCTURE_LAB) && (s.energy < s.energyCapacity * 0.9)) ||
                                        ((s.structureType == STRUCTURE_POWER_SPAWN) && (s.energy < s.energyCapacity * 0.618)))
                                        && ifNotBunkerBlocked(creep.room, s.pos)
                                        && s.pos.findInRange(FIND_MY_CREEPS, 1, {filter:c=>(c.memory.role=='dickHead'||c.memory.role=='linkKeeper'||c.memory.role=='dickHeadpp'||c.memory.role=='newDickHead'||c.memory.role=='maintainer'||c.memory.role=='balancer')&&c.getActiveBodyparts(CARRY)>0}).length==0
                                    )
                                });
                                if (structure == undefined) {
                                    structure = creep.room.storage;
                                    if (structure) {
                                        if (_.sum(structure.store) > 0.8 * structure.storeCapacity) { // storage is almost full

                                            structure = creep.room.terminal;
                                        }
                                    }
                                    else { // storage is not defined, move to centre link point and drop resource
                                        /*let imaginaryStorage = Game.flags['link'+creep.room.name];
                                        if (creep.pos.getRangeTo(imaginaryStorage)>3) {
                                            creep.travelTo(imaginaryStorage);
                                        }
                                        else {
                                            creep.drop(RESOURCE_ENERGY);
                                        }*/
                                        //actionAvoid.run(creep);
                                        creep.move(Math.floor(Math.random() * 8) +1);
                                    }
                                }
                                if (creep.pos.getRangeTo(structure)>1) {
                                    creep.travelTo(structure, { maxRooms: 1 });
                                }
                                else {
                                    creep.transfer(structure, resourceType);
                                }
                                return
                            }
                            else { // carrying minerals, mineral management same as lorry
                                let terminal = creep.room.terminal;
                                let ifShooterRoom = creep.room.memory.startMB;
                                if (ifShooterRoom && creep.room.terminal) {
                                    if (creep.transfer(terminal, resourceType) == ERR_NOT_IN_RANGE) {
                                        creep.travelTo(terminal);
                                    }
                                }
                                else {
                                    let whereToPut = putATypeOfRes(creep.room, resourceType); 
                                    if (creep.pos.getRangeTo(whereToPut)>1) {
                                        creep.travelTo(whereToPut, {maxRooms: 1});
                                    }
                                    else {
                                        creep.transfer(whereToPut, resourceType);
                                    }
                                    return
                                    actionAvoid.run(creep);
                                    

                                    if (terminal && _.sum(terminal.store) < terminal.storageCapacity * 0.95) { // if terminal is defined
                                        // chech if terminal threshold is met
                                        if (terminal.store[resourceType] > creep.room.memory.mineralThresholds.terminalThreshold[resourceType]) {
                                            if (creep.transfer(storage, resourceType) == ERR_NOT_IN_RANGE) {
                                                creep.travelTo(storage);
                                            }
                                        }
                                        else {
                                            if (creep.transfer(terminal, resourceType, Math.min(creep.carry[resourceType], creep.room.memory.mineralThresholds.terminalThreshold[resourceType] - terminal.store[resourceType])) == ERR_NOT_IN_RANGE) {
                                                creep.travelTo(terminal);
                                            }
                                        }
                                    }
                                    else {
                                        if (creep.transfer(storage, resourceType) == ERR_NOT_IN_RANGE) {
                                            creep.moveTo(storage);
                                        }
                                    }
                                    /*var structure = creep.room.terminal;
                                    if (structure==undefined||_.sum(structure.store)>250000) {
                                        structure = creep.room.storage;
                                        if (structure == undefined) {
                                            creep.memory.working = false; // no storage or terminal build yet, fuck minerals
                                        }
                                    }
                                    if (creep.transfer(structure, resourceType) == ERR_NOT_IN_RANGE) {
                                        creep.travelTo(structure, { maxRooms: 1 });
                                    }*/
                                }
                            }
                        }
                    }
                    else { // working, get resources: dropped minerals >> minerals (container) >> energy (container) >> dropped energy
                        // if there is dropped mineral
                        let droppedMinerals = creep.room.find(FIND_DROPPED_RESOURCES, { filter: s => s.resourceType != RESOURCE_ENERGY && (s.pos.findInRange(FIND_HOSTILE_CREEPS, 4).length==0) });
                        if (droppedMinerals.length>0) { // if there is mineral dropped

                            creep.travelTo(droppedMinerals[0], { maxRooms: 1 });
                            creep.pickup(droppedMinerals[0]);
                        }
                        else { // no mineral dropped
                            let tombstones = creep.room.find(FIND_TOMBSTONES, { filter: c => _.sum(c.store) > 0 && (c.pos.findInRange(FIND_HOSTILE_CREEPS, 4).length==0)});
                            if (tombstones.length > 0) {
                                let tombstone = tombstones[0];
                                for (let mineralType in tombstone.store) {
                                    if (creep.withdraw(tombstone, mineralType) == ERR_NOT_IN_RANGE) {
                                        creep.travelTo(tombstone, { maxRooms: 1 });
                                    }
                                }
                                hasJobToDo = true;
                                //break;
                            }
                            else {
                                ifMineral = mineralNeedsCollect(creep.room);
                                if ((ifMineral) && ((ifMineral[0]+ifMineral[2]) > creep.carryCapacity)) { // if there is a mineral container and its mineral amount is higher than creep's carrying capacity
                                    let resourceType = ifMineral[1];
                                    creep.say('get ' + resourceType);
                                    let container = creep.pos.findClosestByRange(FIND_STRUCTURES, { filter: s => s.structureType == STRUCTURE_CONTAINER && s.store[resourceType] > 0 && (s.pos.findInRange(FIND_HOSTILE_CREEPS, 4).length==0) });
                                    if (ifMineral[2]>0) {
                                        if (creep.withdraw(container, 'energy') == ERR_NOT_IN_RANGE) {
                                            creep.travelTo(container, { maxRooms: 1 });
                                        }
                                    }
                                    else {
                                        if (creep.withdraw(container, resourceType) == ERR_NOT_IN_RANGE) {
                                            creep.travelTo(container, { maxRooms: 1 });
                                        }
                                    }
                                }
                                else { // find energy
                                    let terminal = creep.room.terminal;
                                    /*if ((terminal!=undefined)&&((terminal.store.energy > 50000 && creep.room.storage.store.energy < 20000)||(creep.room.storage.store.energy < 5000))) {
                                        if (creep.withdraw(terminal, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                            creep.travelTo(terminal, { maxRooms: 1 });
                                        }
                                    }
                                    else {*/
                                    if (false) {// (creep.room.controller.level==8 && creep.room.energyAvailable==creep.room.energyCapacityAvailable) {
                                        actionAvoid.run(creep);
                                        return
                                    }
                                    else {
                                        let [resourceID, ifDropped] = evaluateEnergyResources(creep, false, false, true, true); // find energy functoin in myFunctoins
                                        let hasJobToDo = false;
                                        if (resourceID) { // if there is dropped energy or energy in container
                                            let energy = Game.getObjectById(resourceID);
                                            if (ifDropped) { // if energy is dropped
                                                if (creep.pickup(energy) == ERR_NOT_IN_RANGE) {
                                                    creep.travelTo(energy, { maxRooms: 1 });
                                                }
                                            }
                                            else { // energy is from container
                                                if (creep.withdraw(energy, 'energy') == ERR_NOT_IN_RANGE) {
                                                    creep.travelTo(energy, { maxRooms: 1 });
                                                }
                                            }
                                            return
                                        }
                                        else { // no energy getable, get mineral from lab
                                            actionAvoid.run(creep);
                                            creep.memory.free = true;
                                            return
                                        }
                                    }
                                }
                                //}
                            }
                        }
                    }
                }
            }
            else { // not at home
                if (creep.memory.target) {
                    creep.travelTo(new RoomPosition(25, 25, creep.memory.target));
                }
                else {
                    creep.memory.target = creep.room.name;
                }
            }
        }
};
