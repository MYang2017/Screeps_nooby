let rec = require('action.recycle');

module.exports = {
    run: function(creep) {
        
        if (creep.memory.rec) {
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
            return
        }
        
        if (creep.room.name == creep.memory.target) { // if in target room
            let tar = Game.getObjectById(creep.memory.depid);
            if (tar && tar.lastCooldown<33) {
                if (creep.pos.getRangeTo(tar)>3) {
                    creep.travelTo(tar);
                }
            }
            else {
                if (creep.room.find(FIND_MY_CREEPS, {filter:c=>c.memory.role=='depoHarvester' || c.memory.role=='depoHauler'}).length>0) {
                    // pass
                }
                else {
                    creep.memory.rec = true;
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