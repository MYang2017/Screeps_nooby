var actionRunAway = require('action.flee');
var actionAvoid = require('action.idle');
var selfRecycling = require('action.selfRecycle');
var selfRenew = require('action.selfRenew');

module.exports = {
    run: function (creep) {
        const avoidRadius = 3;
        
        let keeperLair = creep.pos.findInRange(FIND_STRUCTURES, avoidRadius, { filter: c => c.structureType == STRUCTURE_KEEPER_LAIR && c.ticksToSpawn < 3 });
        //if ((Game.rooms[creep.memory.target]==undefined)||(Game.rooms[creep.memory.target].memory.ifPeace == false)) { // room under attack, run away
        if ((creep.pos.findInRange(FIND_HOSTILE_CREEPS, avoidRadius, {filter: s=>(!allyList().includes(s.owner.username))}).length > 0) || keeperLair && (keeperLair.length > 0)) { // self destroy if not useful damages by NPC
            actionRunAway.run(creep);
        }
        else {
            let mineralRoom = creep.memory.target;
            let memo = Memory.rooms[mineralRoom];
            let isSafe = memo['isSafe'];
    
            let creepCarrying = _.sum(creep.store);
            
            if (creep.memory.home == undefined) {
                creep.memory.home = creep.room.name;
            }
            
            if (Memory.rooms[mineralRoom] && Memory.rooms[mineralRoom].mineralCountDown && Memory.rooms[mineralRoom].mineralCountDown>Game.time) {
                // go back home and recycle
                let homeRoom = creep.memory.home;
                if (creep.room.name != homeRoom) { // if in target room
                    // go towards home
                    creep.travelTo(new RoomPosition(25, 25, homeRoom), {signoreStructures: true, ignoreCreeps: false});
                }
                else { // at home
                    // recycle
                    selfRecycling.run(creep);
                }
                return
            }
            if (isSafe) { // if room safe
                // if creep not carrying, go find miner
                if ((creep.room.name==creep.memory.target) && (creepCarrying < creep.store.getCapacity('energy')) || ((creep.room.name!==creep.memory.target)&&(creepCarrying < 0.314*creep.store.getCapacity('energy')))) {
                    if (creep.room.name != mineralRoom) { // if not in mineral room
                        // go to target room
                        if (creep.room.name == creep.memory.home) {
                            let route = Game.map.findRoute(creep.room, creep.memory.target, {
                            routeCallback(roomName, fromRoomName) {
                                if(isSk(roomName) && Memory.rooms[roomName]&&Memory.rooms[roomName].avoid) {    // avoid this room
                                    return Infinity;
                                }
                                return 1;
                            }});
                            if (route==-2) {
                                creep.travelTo(new RoomPosition(25, 25, creep.memory.target));
                            }
                            else {
                                let exit = creep.pos.findClosestByRange(route[0].exit);
                                creep.moveTo(exit);
                            }
                        }
                        else {
                            // pick up anything we find that dropped by previous dead haulers
                            let droppeds = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 5, { filter: c => (c.resourceType != 'energy') });
                            if (droppeds.length > 0) {
                                if (creep.pickup(droppeds[0]) == ERR_NOT_IN_RANGE) {
                                    creep.travelTo(droppeds[0], {maxRooms: 1, signoreStructures: true, ignoreCreeps: false, allowHostile: false});
                                    return
                                }
                            }
                            else {
                                let tombstones = creep.room.find(FIND_TOMBSTONES, { filter: c => ((_.sum(c.store) > 0) && (c.store.energy == undefined || ((_.sum(c.store) - c.store.energy) > 0))) });
                                if (tombstones.length > 0) {
                                    for (let mineralType in tombstones[0].store) {
                                        if (creep.withdraw(tombstones[0], mineralType) == ERR_NOT_IN_RANGE) {
                                            creep.travelTo(tombstones[0], { maxRooms: 1 });
                                            return
                                        }
                                    }
                                }
                            }
                            creep.travelTo(new RoomPosition(25, 25, mineralRoom), {signoreStructures: true, ignoreCreeps: false});
                            
                        }
                    }
                    else { // in mineral room
                        // find dropped minerals
                        let droppeds = creep.room.find(FIND_DROPPED_RESOURCES, { filter: c => (c.resourceType != 'energy') });
                        if (droppeds.length > 0) {
                            if (creep.pickup(droppeds[0]) == ERR_NOT_IN_RANGE) {
                                creep.travelTo(droppeds[0], {maxRooms: 1, signoreStructures: true, ignoreCreeps: false, allowHostile: false});
                            }
                        }
                        else {
                            let tombstones = creep.room.find(FIND_TOMBSTONES, { filter: c => ((_.sum(c.store) > 0) && (c.store.energy == undefined || ((_.sum(c.store) - c.store.energy) > 0))) });
                            if (tombstones.length > 0) {
                                for (let mineralType in tombstones[0].store) {
                                    if (creep.withdraw(tombstones[0], mineralType) == ERR_NOT_IN_RANGE) {
                                        creep.travelTo(tombstones[0], { maxRooms: 1 });
                                    }
                                }
                            }
                            else {
                                let myMinerId = memo['minerId'];
                                if (myMinerId && Game.getObjectById(myMinerId)) {
                                    creep.travelTo(Game.getObjectById(myMinerId), {maxRooms: 1, signoreStructures: true, ignoreCreeps: false});
                                }
                                else {
                                    actionAvoid.run(creep);
                                }
                            }
                        }
                    }
                }
                else { // else if creep carrys, go home and transfer energy
                    if (creep.room.name != creep.memory.home) {
                        creep.travelTo(new RoomPosition(25, 25, creep.memory.home, {signoreStructures: true, ignoreCreeps: false}));
                        //storedTravelFromAtoB(creep, 'r');
                    }
                    else {
                        if (creep.ticksToLive < 450) {
                            selfRenew.run(creep);
                        }
                        else {
                            let structure = creep.room.terminal;
                            if ((structure == undefined) || (_.sum(structure.store) > 0.9 * structure.storeCapacity)) {
                                structure = creep.room.storage;
                            }
                            for (const resourceType in creep.store) {
                                if (creep.transfer(structure, resourceType) == ERR_NOT_IN_RANGE) {
                                    creep.travelTo(structure);
                                }
                            }
                        }
                    }
                }
            }
            else { // room is invaded
                // go back home and recycle
                let homeRoom = creep.memory.home;
                if (creep.room.name != homeRoom) { // if in target room
                    // go towards home
                    creep.travelTo(new RoomPosition(25, 25, homeRoom), {maxRooms: 1, signoreStructures: true, ignoreCreeps: false, allowHostile: false});
                }
                else { // at home
                    // recycle
                    selfRecycling.run(creep);
                }
            }
        }
    }
};
