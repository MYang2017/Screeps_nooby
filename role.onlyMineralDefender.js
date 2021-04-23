var actionRunAway = require('action.flee');
var actionAvoid = require('action.idle');
var selfRecycling = require('action.selfRecycle');

module.exports = {
    run: function (creep) {

        let mineralRoom = creep.memory.target;
        let memo = Memory.rooms[mineralRoom];
        let isSafe = memo['isSafe'];

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
                if (creep.hits < creep.hitsMax) {
                    creep.heal(creep);
                }
            }
            else { // else, creep in target room
                // start working
                let mineralToProtect = Game.getObjectById(memo['mineralId']);
                if (mineralToProtect == undefined) {
                    let min = creep.room.find(FIND_MINERALS)[0];
                    Memory.rooms[mineralRoom].mineralId = min.id;
                    mineralToProtect = min;
                }
                let targets = mineralToProtect.pos.findInRange(FIND_HOSTILE_CREEPS, 4, { filter: c => c.owner.username == 'Source Keeper' });
                if (targets.length > 0) {
                    creep.travelTo(targets[0]);
                }
                else { // no dangerous creep around mineral, go to keeper lair to wait
                    let keeperLairs = mineralToProtect.pos.findInRange(FIND_STRUCTURES, 5, { filter: c => c.structureType == STRUCTURE_KEEPER_LAIR });
                    if (keeperLairs.length > 0) {
                        creep.travelTo(keeperLairs[0], {signoreStructures: true, ignoreCreeps: false});
                        let targets = keeperLairs[0].pos.findInRange(FIND_HOSTILE_CREEPS, 6, { filter: c => c.owner.username == 'Source Keeper' });
                        if (targets.length > 0) {
                            creep.travelTo(targets[0], {signoreStructures: true, ignoreCreeps: false});
                        }
                    }
                    else {
                        console.log(mineralRoom + ' not found keeper lair, impossible, check onlyMineralDefender code');
                    }
                }

                if (targets.length > 0) {
                    creep.attack(targets[0]);
                }

                if (creep.hits < creep.hitsMax) {
                    creep.heal(creep);
                }
                else {
                    // heal other creep
                    let woundeds = creep.room.find(FIND_MY_CREEPS, { filter: (s) => (s.hits < s.hitsMax) });
                    if (woundeds.length > 0) {
                        if (creep.heal(woundeds[0]) == ERR_NOT_IN_RANGE) {
                            creep.travelTo(woundeds[0]);
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
