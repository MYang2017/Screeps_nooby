var actionRunAway = require('action.flee');
var actionAvoid = require('action.idle');
var selfRecycling = require('action.selfRecycle');
var selfRenew = require('action.selfRenew');

module.exports = {
    run: function (creep) {
        const avoidRadius = 5;

        let mineralRoom = creep.memory.target;
        let memo = Memory.rooms[mineralRoom];
        let isSafe = memo['isSafe'];

        let creepCarrying = _.sum(creep.carry);

        if (isSafe) { // if room safe
            // if creep not carrying, go find miner
            if (creepCarrying < creep.carryCapacity) {
                if (creep.room.name != mineralRoom) { // if not in mineral room
                    creep.travelTo(new RoomPosition(25, 25, mineralRoom));
                }
                else { // in mineral room
                    // avoid incoming keeper
                    let keeperLair = creep.pos.findInRange(FIND_STRUCTURES, avoidRadius, { filter: c => c.structureType == STRUCTURE_KEEPER_LAIR && c.ticksToSpawn < 3 });
                    //if ((Game.rooms[creep.memory.target]==undefined)||(Game.rooms[creep.memory.target].memory.ifPeace == false)) { // room under attack, run away
                    if ((creep.pos.findInRange(FIND_HOSTILE_CREEPS, avoidRadius).length > 0) || keeperLair && (keeperLair.length > 0)) { // self destroy if not useful damages by NPC
                        actionRunAway.run(creep);
                    }
                    else { // working
                        // find dropped minerals
                        let droppeds = creep.room.find(FIND_DROPPED_RESOURCES, { filter: c => (c.resourceType != 'energy') });
                        if (droppeds.length > 0) {
                            if (creep.pickup(droppeds[0]) == ERR_NOT_IN_RANGE) {
                                creep.travelTo(droppeds[0], { maxRooms: 1 });
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
                                    creep.travelTo(Game.getObjectById(myMinerId));
                                }
                                else {
                                    actionAvoid.run(creep);
                                }
                            }
                        }
                    }
                }
            }
            else { // else if creep carrys, go home and transfer energy
                if (creep.room.name != creep.memory.home) {
                    creep.travelTo(new RoomPosition(25, 25, creep.memory.home));
                }
                else {
                    if (creep.ticksToLive < 300) {
                        selfRenew.run(creep);
                    }
                    else {
                        let structure = creep.room.terminal;
                        if ((structure == undefined) || (_.sum(structure.store) > 0.9 * structure.storeCapacity)) {
                            structure = creep.room.storage;
                        }
                        for (const resourceType in creep.carry) {
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
                creep.travelTo(new RoomPosition(25, 25, homeRoom));
            }
            else { // at home
                // recycle
                selfRecycling.run(creep);
            }
        }
    }
};
