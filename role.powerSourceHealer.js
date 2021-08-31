var rec = require('action.recycle');
let dog = require('action.flee');

module.exports = {
    run: function (creep) {
        if (creep.memory.prepareToDie) {
            if (creep.room.name != creep.memory.home) {
                // move to home
                if (creep.memory.foundRoute == undefined) {
                    creep.memory.foundRoute = {};
                }
                if (creep.memory.foundRoute[creep.room.name+creep.memory.home]) {
                    let route = creep.memory.foundRoute[creep.room.name+creep.memory.home];
                    if (route.length > 0) {
                        let next = route[0];
                        let nextRoomTar = new RoomPosition(25, 25, next.room);
                        creep.travelTo(nextRoomTar, {maxRooms: 1, offRoad: true, ignoreRoads: true});
                    }
                }
                else {
                    let route = Game.map.findRoute(creep.room, creep.memory.home, {
                        routeCallback(roomName, fromRoomName) {
                            let parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
                            let isHighway = (parsed[1] % 10 === 0) || 
                                            (parsed[2] % 10 === 0);
                            let isMyRoom = Game.rooms[roomName] &&
                                Game.rooms[roomName].controller &&
                                Game.rooms[roomName].controller.my;
                            if (isHighway || isMyRoom) {
                                return 1;
                            }
                            else {
                                return 4.8;
                            }
                        }});
                    if (route.length > 0) {
                        let next = route[0];
                        let nextRoomTar = new RoomPosition(25, 25, next.room);
                        creep.travelTo(nextRoomTar, {maxRooms: 1, offRoad: true, ignoreRoads: true});
                    }
                    creep.memory.foundRoute[creep.room.name+creep.memory.home] = route;
                }
            }
            else { // at home
                rec.run(creep);
            }
        }
        else {
            if (creep.ticksToLive < 1000 && creep.room.name == creep.memory.home) {
                // finished duty and recycle
                rec.run(creep);
            }
            else {
                // if in target
                if (creep.room.name == creep.memory.target) { // if in target room
                    let pb = Game.getObjectById(creep.memory.sId); 
                    if (pb==undefined) { // no pb
                        creep.memory.prepareToDie = true;
                    }
                    
                    // if to heal here, heal it
                    let toHealName = creep.memory.toHeal;
                    let kuli = Game.creeps[creep.memory.toHeal];
                    if (toHealName && kuli) {
                        if (kuli.memory.in) {
                            if (creep.pos.getRangeTo(kuli)>1) {
                                creep.travelTo(kuli);
                            }
                            else {
                                creep.heal(kuli);
                            }
                        }
                        else {
                            if (kuli.room.name == kuli.memory.target && kuli.pos.getRangeTo(pb)<2) {
                                kuli.memory.in = true;
                            }
                        }
                    }
                    else {
                        if (creep.memory.toHeal == undefined) {
                            var woundeds = creep.room.find(FIND_MY_CREEPS, { filter: (s) => (s.hits < s.hitsMax) });
                            if (woundeds.length>0) {
                                if (creep.pos.getRangeTo(woundeds[0])>1) {
                                    creep.travelTo(woundeds[0]);
                                }
                                else {
                                    creep.heal(woundeds[0]);
                                }
                            }
                            else { // if no wounded target go out of way
                                if (creep.pos.getRangeTo(25, 25)>10) {
                                    creep.travelTo(new RoomPosition(25, 25, creep.memory.target), { range: 9 });
                                }
                                dog.run(creep);
                            }
                        }
                        else {
                            creep.memory.toHeal = undefined;
                        }
                    }
                }
                else { // go to target room
                    // move to target
                    if (creep.memory.foundRoute == undefined) {
                        creep.memory.foundRoute = {};
                    }
                    if (creep.memory.foundRoute[creep.room.name+creep.memory.target]) {
                        let route = creep.memory.foundRoute[creep.room.name+creep.memory.target];
                        if (route.length > 0) {
                            let next = route[0];
                            let nextRoomTar = new RoomPosition(25, 25, next.room);
                            creep.travelTo(nextRoomTar, {maxRooms: 1, offRoad: true, ignoreRoads: true});
                        }
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
                                if (isHighway || isMyRoom) {
                                    return 1;
                                }
                                else {
                                    return 4.8;
                                }
                            }});
                        if (route.length > 0) {
                            let next = route[0];
                            let nextRoomTar = new RoomPosition(25, 25, next.room);
                            creep.travelTo(nextRoomTar, {maxRooms: 1, offRoad: true, ignoreRoads: true});
                        }
                        creep.memory.foundRoute[creep.room.name+creep.memory.target] = route;
                    }
                }
            }
        }
    }
};
