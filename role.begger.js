// for newly created rooms, transport energy from mature rooms to current base room

var actionRunAway = require('action.flee');

var rolePickuper = require('role.pickuper');

module.exports = {
    run: function(creep) {
        creep.say('begging');
        if (creep.memory.working == true && _.sum(creep.carry) == 0) {
            creep.memory.working = false;
        }
        else if (creep.memory.working == false && _.sum(creep.carry) > 0.618 * creep.carryCapacity) {
            creep.memory.working = true;
        }

        if (creep.hits < creep.hitsMax) { // go back home to heal when injured
            /*for (const resourceType in creep.carry) {
                creep.drop(resourceType);
            }*/
            creep.travelTo(new RoomPosition(25, 25, creep.memory.home));
        }
        else {
            if (creep.memory.working == true) { // if working
                if (creep.room.name != creep.memory.home) { // if not at home base, go back to home base
                    creep.travelTo(new RoomPosition(25, 25, creep.memory.home));
                }
                else if (creep.room.name == creep.memory.home) { // back to home, finish begging
                    let storage = creep.room.storage;
                    /*let terminal = creep.room.terminal;
                    let toStore;
                    if (terminal && _.sum(terminal.store) > 270000) {
                        toStore = storage;
                    }
                    else {
                        toStore = terminal;
                    }*/

                    for (const resourceType in creep.carry) {
                        if (creep.transfer(storage, resourceType) == ERR_NOT_IN_RANGE) {
                            creep.travelTo(storage);
                        }
                    }
                }
            }
            else { // working == false
                let currentShard = Game.shard.name;
                let currentShardRooms = Memory.myRoomList;
                // if both target and home are mines, this is an 'energy' transporter
                if ( currentShardRooms[currentShard].includes(creep.memory.target) && currentShardRooms[currentShard].includes(creep.memory.home) ) {
                    if (creep.room.name != creep.memory.target) {
                        creep.travelTo(new RoomPosition(25, 25, creep.memory.target));
                    }
                    else {
                        let storage = creep.room.storage;
                        /*let terminal = creep.room.terminal;
                        let toStore;
                        if (storage.store.energy > 200000) {
                            toStore = storage;
                        }
                        else {
                            toStore = terminal;
                        }*/
                        if (creep.withdraw(storage, 'energy') == ERR_NOT_IN_RANGE) {
                            creep.travelTo(storage);
                        }
                    }
                }
                else {
                    if (creep.room.name == creep.memory.target) { // if in target (giver) room
                        let storage = creep.room.storage;
                        if (storage && _.sum(storage.store) > 0) { // go withdraw from storage:
                            for (let mineralType in storage.store) {
                                if (creep.withdraw(storage, mineralType) == ERR_NOT_IN_RANGE) {
                                    creep.travelTo(storage, { maxRooms: 1 });
                                }
                            }
                        }
                        else {
                            let terminal = creep.room.terminal;
                            if (terminal && _.sum(terminal.store) > 0) { // go withdraw from storage:
                                for (let mineralType in terminal.store) {
                                    if (creep.withdraw(terminal, mineralType) == ERR_NOT_IN_RANGE) {
                                        creep.travelTo(terminal, { maxRooms: 1 });
                                    }
                                }
                            }
                            else {
                                let structure = creep.room.find(FIND_STRUCTURES, {
                                    filter: (s) => (
                                        ((s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION) && (s.energy > 0)) ||
                                        ((s.structureType == STRUCTURE_TOWER) && (s.energy > 0)) ||
                                        ((s.structureType == STRUCTURE_LAB) && (s.energy > 0)) ||
                                        ((s.structureType == STRUCTURE_POWER_SPAWN) && (s.energy > 0))
                                        //((s.structureType == STRUCTURE_NUKER) && (s.energy > 0))
                                    )
                                });
                                if (structure.length>0) { // if there is something to draw
                                    if (creep.withdraw(structure[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                        creep.travelTo(structure[0]);
                                    }
                                }
                                else {
                                    let containers = creep.room.find(FIND_STRUCTURES, { filter: (s) => (s.structureType == STRUCTURE_CONTAINER) && (_.sum(s.store) > 0) });
                                    if (containers.length > 0) {
                                        let container = containers[0];
                                        for (const resourceType in container.store) {
                                            if (creep.withdraw(container, resourceType) == ERR_NOT_IN_RANGE) {
                                                creep.travelTo(container);
                                            }
                                        }
                                    }
                                    else {
                                        let droppedMinerals = creep.room.find(FIND_DROPPED_RESOURCES, { filter: s => s.resourceType != RESOURCE_ENERGY });
                                        if (droppedMinerals.length) { // if there is mineral dropped
                                            creep.travelTo(droppedMinerals[0], { maxRooms: 1 });
                                            creep.pickup(droppedMinerals[0]);
                                        }
                                        else {
                                            let tombstones = creep.room.find(FIND_TOMBSTONES, { filter: c => _.sum(c.store) > 0 });
                                            if (tombstones.length > 0) {
                                                let tombstone = tombstones[0];
                                                for (let mineralType in tombstone.store) {
                                                    if (creep.withdraw(tombstone, mineralType) == ERR_NOT_IN_RANGE) {
                                                        creep.travelTo(tombstone);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    else { // if not in target room, move to target room
                        creep.travelTo(new RoomPosition(25, 25, creep.memory.target));
                        //var exit = creep.room.findExitTo(creep.memory.target);
                        //creep.travelTo(creep.pos.findClosestByRange(exit));
                    }
                }
            }
        }
    }
};
