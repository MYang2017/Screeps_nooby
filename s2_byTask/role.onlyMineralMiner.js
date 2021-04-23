var actionRunAway = require('action.flee');
var actionAvoid = require('action.idle');
var selfRecycling = require('action.selfRecycle');

module.exports = {
    run: function (creep) {
        const avoidRadius = 3;

        let mineralRoom = creep.memory.target;
        let memo = Memory.rooms[mineralRoom];
        let isSafe = memo['isSafe'];
        
        if (creep.memory.home == undefined) {
            creep.memory.home = creep.room.name;
        }

        if (!Memory.rooms[mineralRoom]['minerId'] || Memory.rooms[mineralRoom]['minerId'] != creep.id) {
            Memory.rooms[mineralRoom]['minerId'] = creep.id;
        }
        
        let mineralToMine = Game.getObjectById(memo['mineralId']);
        // avoid incoming keeper
        let keeperLair = creep.pos.findInRange(FIND_STRUCTURES, avoidRadius, { filter: c => c.structureType == STRUCTURE_KEEPER_LAIR && c.ticksToSpawn < 3 });
        if ((creep.pos.findInRange(FIND_HOSTILE_CREEPS, avoidRadius, {filter: s=>(!allyList().includes(s.owner.username))}).length > 0) || keeperLair && (keeperLair.length > 0)) { // self destroy if not useful damages by NPC
            actionRunAway.run(creep);
        }
        else {
            if (isSafe) { // if room safe
                // if creep is not in target
                if (creep.room.name != mineralRoom) { // if not in target room
                    // go to target room
                    if (creep.room.name == creep.memory.home) {
                        let route = Game.map.findRoute(creep.room, creep.memory.target, {
                        routeCallback(roomName, fromRoomName) {
                            if(isSk(roomName) && Memory.rooms[roomName]&&Memory.rooms[roomName].avoid) {    // avoid this room
                                return Infinity;
                            }
                            return 1;
                        }});
                        let exit = creep.pos.findClosestByRange(route[0].exit);
                        creep.moveTo(exit);
                    }
                    else {
                        creep.travelTo(new RoomPosition(25, 25, mineralRoom), {signoreStructures: true, ignoreCreeps: false});
                    }
                }
                else { // else, creep in target room
                    // start working
                    if (memo['mineralId'] == undefined) {
                        Memory.rooms[mineralRoom]['mineralId'] = creep.room.find(FIND_MINERALS)[0].mineralType;
                    }
                    
                    //if ((Game.rooms[creep.memory.target]==undefined)||(Game.rooms[creep.memory.target].memory.ifPeace == false)) { // room under attack, run away
    
                    if (_.sum(creep.carry) < creep.carryCapacity - 30) {
                        if (creep.harvest(mineralToMine) == ERR_NOT_IN_RANGE) {
                            creep.travelTo(mineralToMine, {signoreStructures: true, ignoreCreeps: false});
                        }
                    }
                    if ( Game.time%12==7 ) {
                        let haulers = creep.pos.findInRange(FIND_MY_CREEPS, 1, { filter: c => c.name != creep.name && c.getActiveBodyparts(CARRY) > 0 });
                        if (haulers.length > 0) {
                            creep.transfer(haulers[0], mineralToMine.mineralType);
                        }
                    }
                }
            }
            else { // room is invaded
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
            }
        }
    }
};
