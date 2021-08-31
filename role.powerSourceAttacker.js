var selfRecycling = require('action.selfRecycle');
let rec = require('action.recycle');
module.exports = {
    run: function(creep) {
        if (creep.memory.prepareToDie) {
            if (creep.room.name != creep.memory.home) {
                // move to home
                let route = Game.map.findRoute(creep.room, creep.memory.home, {
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
                    if (route[0] && route[0].room) {
                        creep.travelTo(creep.pos.findClosestByRange(creep.room.findExitTo(route[0].room)), {maxRooms: 1});
                    }
                }
                return
            }
            else { // at home
                rec.run(creep);
            }
        }
        else {
            //creep.travelTo(new RoomPosition(25,25,creep.memory.target),{range:5});
            if (creep.room.name == creep.memory.target) { // if in target room
                let tar = Game.getObjectById(creep.memory.sId);
                if (tar == undefined) { // no pb
                    creep.memory.prepareToDie = true;
                    if (Memory.storedSymbols[Game.shard.name][creep.memory.sId]) {
                        Memory.storedSymbols[Game.shard.name][creep.memory.sId] = undefined;
                    }
                    else {
                        Memory.storedSymbols[Game.shard.name][creep.memory.sId].noPath = true;
                    }
                    return
                }
                if (creep.ticksToLive<500 && creep.pos.getRangeTo(tar)>4 && tar.hits>1999999 && (creep.pos.x == 0||creep.pos.x == 49||creep.pos.y == 0||creep.pos.y == 49)) { // new area wall
                    if (Memory.storedSymbols[Game.shard.name][creep.memory.sId]) {
                        Memory.storedSymbols[Game.shard.name][creep.memory.sId].noPath = true;
                    }
                    creep.memory.prepareToDie = true;
                    return
                }
                
                if (creep.hits<creep.hitsMax && creep.memory.attacked == undefined && creep.room.find(FIND_HOSTILE_CREEPS, {filter:h=>!allyList().includes(h.owner.username)}).length>0 && creep.room.find(FIND_MY_CREEPS, {filter: a=>a.memory.role=='powerSourceAttacker'}).length<3) {
                    /*
                    if (creep.pos.findInRange(FIND_HOSTILE_CREEPS, 1, {filter:c=>c.getActiveBodyparts(ATTACK)>10}).length>0) {
                        if (Memory.storedSymbols[Game.shard.name][creep.memory.sId]) {
                            Memory.storedSymbols[Game.shard.name][creep.memory.sId].snipeMode = true;
                        }
                    }
                    */
                    if (Memory.storedSymbols[Game.shard.name][creep.memory.sId].attackedAtTime && Memory.storedSymbols[Game.shard.name][creep.memory.sId].attackedAtTime>Game.time) {
                        // pass
                    }
                    else {
                        Memory.storedSymbols[Game.shard.name][creep.memory.sId].attackedAtTime = Game.time - 1;
                    }
                    //addPowerGroupAtTime(Game.time,creep.memory.target,creep.memory.home, creep.memory.sId);
                    creep.memory.attacked = true;
                }
                
                if (tar.length != 0 && tar.hits > 1900) {
                    //console.log((creep.room.find(FIND_MY_CREEPS, {filter: c=> c.memory.role == 'powerSourceLorry'}).length+1) * 1650 , target[0].power);
                    if (creep.pos.getRangeTo(tar)>1) {
                        creep.travelTo(tar, {maxRooms:1});
                    }
                    else {
                        creep.attack(tar);
                        if (Memory.storedSymbols[Game.shard.name][creep.memory.sId] && Memory.storedSymbols[Game.shard.name][creep.memory.sId].travelTime == undefined) {
                            Memory.storedSymbols[Game.shard.name][creep.memory.sId].travelTime = 1500-creep.ticksToLive;
                        }
                    }
                    if (tar.hits / tar.ticksToDecay > 1000) {
                        creep.room.memory.goPower = undefined;
                        creep.memory.prepareToDie = true;
                    }
                }
                else {
                    let carryCapa = 0; 
                    if (creep.pos.getRangeTo(tar)>1) {
                        creep.travelTo(tar, {maxRooms:1});
                    }
                    let myLorries = creep.room.find(FIND_MY_CREEPS, {filter: c => c.memory.role == 'powerSourceLorry'});
                    myLorries.forEach(c=>carryCapa+=c.store.getCapacity('power'));
                    
                    if (myLorries.length>0 && Memory.storedSymbols[Game.shard.name][creep.memory.sId] && Memory.storedSymbols[Game.shard.name][creep.memory.sId].travelTime) {
                        if (myLorries.some((c) => c.ticksToLive<2.134*Memory.storedSymbols[Game.shard.name][creep.memory.sId].travelTime)) {
                            creep.attack(tar);
                        }
                    }
                    if (tar && carryCapa >= tar.power * 0.911) { // 
                        creep.attack(tar);
                    }
                    else if (tar && myLorries.length>0 && ((creep.ticksToLive<11&&creep.room.find(FIND_MY_CREEPS, {filter: c => c.memory.role == 'powerSourceAttacker'}).length==1)||tar.ticksToDecay<11)) {
                        creep.attack(tar);
                    }
                    else {
                        creep.room.memory.goPower = undefined;
                        //creep.memory.prepareToDie = true;
                    }
                }
                let nearbyannoyers = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 1, {filter:c=>!allyList().includes(c.owner.username)});
                if (nearbyannoyers.length>0) {
                    creep.attack(nearbyannoyers[0]);
                }
            }
            else { // go to target room
                // move to target
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
                    if (route[0] && route[0].room) {
                        creep.travelTo(creep.pos.findClosestByRange(creep.room.findExitTo(route[0].room)), {maxRooms: 1});
                    }
                }
                return
            }
        }
    }
};
