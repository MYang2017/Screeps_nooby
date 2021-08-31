let rec = require('action.recycle');

module.exports = {
    run: function(creep) {
        if (Memory.storedDepos[Game.shard.name][creep.memory.depid]==undefined && _.sum(creep.store)==0) {
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
            if (creep.room.name == creep.memory.target) { // if in target room
                let tar = Game.getObjectById(creep.memory.depid);
                if (creep.ticksToLive<1000 && creep.pos.getRangeTo(tar)>4 && (creep.pos.x == 0||creep.pos.x == 49||creep.pos.y == 0||creep.pos.y == 49)) {
                    Memory.storedDepos[Game.shard.name][creep.memory.depid].noPath = true;
                    creep.memory.role = 'ranger';
                    creep.memory.target = creep.memory.home;
                    return
                }
                if (creep.store.getFreeCapacity('energy')<creep.getActiveBodyparts(WORK)) {
                    let collector = creep.pos.findClosestByRange(FIND_MY_CREEPS, {filter:c=>(c.memory.role=='depoStorage'||c.memory.role=='depoHauler')&&c.store.getFreeCapacity('energy')>0});
                    if (collector) {
                        if (creep.pos.getRangeTo(collector)>1) {
                            creep.travelTo(collector);
                        }
                        else {
                            for (let res in creep.store) {
                                creep.transfer(collector, res);
                            }
                        }
                    }
                }
                else {
                    if (Memory.storedDepos[Game.shard.name][creep.memory.depid]) {
                        if (tar.cooldown==0) {
                            let nospots = Memory.storedDepos[Game.shard.name][creep.memory.depid].nospots;
                            let inguys = creep.room.find(FIND_MY_CREEPS, {filter:c=>c.memory.role=='depoHarvester' && c.pos.getRangeTo(tar)==1 }).length;
                            if (creep.pos.getRangeTo(tar)>1) {
                                if (nospots==inguys) { // depot occupied, idle
                                }
                                else {
                                    creep.travelTo(tar);
                                }
                            }
                            else {
                                //let myguysinroom = creep.room.find(FIND_MY_CREEPS, {filter:c=>c.memory.role=='depoHarvester' && (creep.store.getFreeCapacity('energy')>creep.getActiveBodyparts(WORK)) }).length;
                                if (inguys >= nospots || inguys==creep.room.find(FIND_MY_CREEPS, {filter:c=>c.memory.role=='depoHarvester'}).length) {
                                    // mine
                                    creep.harvest(tar);
                                }
                                else {
                                    // wait
                                }
                            }
                        }
                    }
                    else {
                        let collector = creep.room.find(FIND_MY_CREEPS, {filter:c=>c.memory.role=='depoStorage'&&c.store.getFreeCapacity('energy')>0});
                        if (collector.length>0) {
                            collector = collector[0];
                            if (creep.pos.getRangeTo(collector)>1) {
                                creep.travelTo(collector);
                            }
                            else {
                                for (let res in creep.store) {
                                    creep.transfer(collector, res);
                                }
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
}