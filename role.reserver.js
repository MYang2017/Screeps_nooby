var actionRunAway = require('action.flee');

module.exports = {
    run: function(creep) {
        if (creep.memory.home == undefined) {
            creep.memory.home = creep.room.name;
        }
        
        if (creep.memory.attackedAtTime && creep.memory.attackedAtTime+50>Game.time) {
            creep.moveTo(new RoomPosition(25, 25,creep.memory.home), {range: 20});
            //actionRunAway.run(creep);
        }
        else {
            if (creep.room.name != creep.memory.target) {
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
                    creep.travelTo(new RoomPosition(25, 25, route[0].room), { maxRooms: 1 });
                }
            }
            else {
                let ctr = creep.room.controller;
                // sign something
                if (creep.ticksToLive==3) {
                    if (!(ctr && ctr.sign && ctr.sign.username && ctr.sign.username=='PythonBeatJava')) {
                        creep.signController(creep.room.controller, '🥒');

                    }
                }
                
                if (ctr && ctr.reservation && ctr.reservation.username !== 'PythonBeatJava') {
                    if (creep.attackController(ctr) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(ctr);
                    }
                }
                else {
                    let upc = creep.reserveController(ctr);
                    if ( upc == ERR_NOT_IN_RANGE) {
                        creep.moveTo(ctr, { maxRooms: 1 });
                    }
                    else if (upc == OK) {
                        let thingUnderFeet = creep.room.lookForAt(LOOK_STRUCTURES, creep)[0];
                        if (thingUnderFeet && thingUnderFeet.structureType && thingUnderFeet.structureType == STRUCTURE_ROAD) {
                            let allrs = creep.room.find(FIND_MY_CREEPS, {filter: o=>o.memory.role == 'reserver'});
                            for (let allr of allrs) {
                                allr.move(getRandomInt(1,8));
                            }
                        }
                    }
                    actionRunAway.run(creep)
                }
            }
        }
    }
};
