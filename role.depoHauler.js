let rec = require('action.recycle');

module.exports = {
    run: function(creep) {
        let dist;
        if (Memory.storedDepos[Game.shard.name][creep.memory.depid] == undefined && creep.memory.madeSure) {
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
                return
            }
        }
        else {
            if (Memory.storedDepos[Game.shard.name][creep.memory.depid]) {
                dist = Memory.storedDepos[Game.shard.name][creep.memory.depid].dist;
            }
            else {
                dist = Game.map.findRoute(creep.room, creep.memory.home).length;
            }
        }
        let full = creep.store.getFreeCapacity('energy')==0;
        
        if (creep.ticksToLive< dist*50+55 || full || dist==undefined) {
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
                if (creep.ticksToLive< dist*50+55) {
                    rec.run(creep);
                    return
                }
                else {
                    for (let res in creep.store) {
                        if (creep.pos.getRangeTo(creep.room.terminal)>1) {
                            creep.travelTo(creep.room.terminal);
                            return
                        }
                        else {
                            creep.transfer(creep.room.terminal, res);
                            return
                        }
                    }
                }
            }
        }
        else if (creep.room.name == creep.memory.target) { // if in target room
            let tresh = creep.room.find(FIND_TOMBSTONES, {filter: t=>(_.sum(t.store)-t.store.energy)>0});
            if (tresh.length>0) {
                let tres = tresh[0];
                if (creep.pos.getRangeTo(tres)>1) {
                    fo(2)
                    creep.travelTo(tres);
                }
                else {
                    for (let res in tres.store) {
                        creep.withdraw(tres, res);
                    }
                }
                return
            }
            else {
                tresh = creep.room.find(FIND_DROPPED_RESOURCES, {filter: t=>t.resourceType!='energy'});
                if (tresh.length>0) {
                    let tres = tresh[0];
                    if (creep.pos.getRangeTo(tres)>1) {
                        creep.travelTo(tres);
                    }
                    else {
                        creep.pickup(tres);
                    }
                    return
                }
                else {
                    let collector = creep.room.find(FIND_MY_CREEPS, {filter:c=>(c.memory.role=='depoStorage'||c.memory.role=='depoHarvester')&&_.sum(c.store)>0});
                    if (collector.length>0) {
                        collector = collector[0];
                        if (creep.pos.getRangeTo(collector)>1) {
                            creep.travelTo(collector);
                        }
                        else {
                            for (let res in collector.store) {
                                collector.transfer(creep, res);
                            }
                        }
                    }
                    else if (Memory.storedDepos[Game.shard.name][creep.memory.depid] == undefined) {
                        creep.memory.madeSure = true;
                    }
                    else {
                        let dep = Game.getObjectById(creep.memory.depid);
                        if (creep.pos.getRangeTo(dep)>4) {
                            creep.travelTo(dep);
                        }
                    }
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