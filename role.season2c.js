var actionRecycle = require('action.recycle');

module.exports = {
    run: function(creep) {
        //creep.say('begging');
        
        // if creep born time undi
        if (creep.memory.bornTime == undefined) {
            // creep born time = Game.time
            creep.memory.bornTime = Game.time;
        }
        else { // born time logged
            // if (creep not transfered and creep tick<750) || (creep transfered and transfered time * 2 + 20 < creep.tickstolive )
            if ((creep.memory.transferTime == undefined && creep.ticksToLive<800) && creep.memory.recycle == undefined) {
                // creep lost 
                creep.memory.recycle = true; // set recycle true
            }
            else { // not lost, on normal job
                // if carry nothing or creep recycle
                if (_.sum(creep.store) == 0 || creep.memory.recycle || _.sum(creep.store)-creep.store[creep.memory.stp]>0) {
                    // if room green flag
                    let flag = creep.room.find(FIND_FLAGS, {filter: f=>f.color == COLOR_GREEN});
                    if (flag.length>0) { // follow flag 
                        let tar = flag[0].pos;
                        creep.travelTo(tar, {maxRooms: 1, offRoad: true, ignoreRoads: true});
                    }
                    else {
                        if (creep.room.name != creep.memory.home) {// if not at home
                            // if at special steal room
                            if (creep.room.name == creep.memory.target && (creep.ticksToLive > 75 + (creep.memory.transferTime-creep.memory.bornTime))) { // carrying nothing but in target
                                if ((_.sum(creep.store)==0)&&creep.room.controller.owner.username == 'TheLastPiece') { // specific
                                    let stor = creep.room.storage;
                                    for (let tresh in stor.store) {
                                        if (tresh.slice(0,3)=='sym') {
                                            if (creep.pos.getRangeTo(stor)>1) {
                                                creep.travelTo(stor, {maxRooms: 1})
                                            }
                                            else {
                                                creep.withdraw(stor, tresh);
                                            }
                                            return
                                        }
                                    }
                                    stor = creep.room.terminal;
                                    for (let tresh in stor.store) {
                                        if (tresh.slice(0,3)=='sym') {
                                            if (creep.pos.getRangeTo(stor)>1) {
                                                creep.travelTo(stor, {maxRooms: 1})
                                            }
                                            else {
                                                creep.withdraw(stor, tresh);
                                            }
                                            return
                                        }
                                        creep.memory.recycle = true;
                                    }
                                }
                                
                                // take boost from MvR
                                /*if ((_.sum(creep.store)==0)&&creep.room.name == 'E17S24') { // specific
                                    let stor = creep.room.storage;
                                    if (stor.store['XLHO2']) {
                                        if (creep.pos.getRangeTo(stor)>1) {
                                            creep.travelTo(stor, {maxRooms: 1})
                                        }
                                        else {
                                            creep.withdraw(stor, 'XLHO2');
                                        }
                                        return
                                    }
                                    stor = creep.room.terminal;
                                    if (stor.store['XLHO2']) {
                                        if (creep.pos.getRangeTo(stor)>1) {
                                            creep.travelTo(stor, {maxRooms: 1})
                                        }
                                        else {
                                            creep.withdraw(stor, 'XLHO2');
                                        }
                                        return
                                    }
                                }*/
                            }
                            // move follow route
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
                                        } else {
                                            return 1.5;
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
                        else { // else at home
                            if (_.sum(creep.store)-creep.store[creep.memory.stp]>0) {
                                for (let ress in creep.store) {
                                    if (creep.transfer(creep.room.storage, ress) == ERR_NOT_IN_RANGE) {
                                        creep.travelTo(creep.room.storage, {maxRooms: 1, offRoad: true, ignoreRoads: true});
                                        return
                                    }
                                }
                            }
                            else {
                                if (creep.memory.recycle) { // if going to be recycled
                                    if (_.sum(creep.store)>0) {
                                        for (let mineralType in creep.store) {
                                            if (creep.transfer(creep.room.storage, mineralType) == ERR_NOT_IN_RANGE) {
                                                creep.travelTo(creep.room.storage, {maxRooms: 1, offRoad: true, ignoreRoads: true});
                                            }
                                        }
                                    }
                                    else { // recycle
                                        actionRecycle.run(creep);
                                    }
                                }
                                else { // going on journey
                                    let withRes = creep.withdraw(creep.room.storage, creep.memory.stp);
                                    if (withRes == ERR_NOT_IN_RANGE) {
                                        creep.travelTo(creep.room.storage, {maxRooms: 1, offRoad: true, ignoreRoads: true});
                                    }
                                    else if (withRes == ERR_NOT_ENOUGH_RESOURCES) {
                                        creep.memory.recycle = true;
                                    }
                                    else if (withRes == OK) {
                                        if (creep.memory.transferTime != undefined) { // not first time
                                            if (creep.ticksToLive < 25 + (creep.memory.transferTime-creep.memory.bornTime)) { // creep cannot make a round trip
                                                creep.memory.recycle = true;
                                                creep.transfer(creep.room.storage, creep,memory.stp);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                else { // else if creep carry symbol
                    // if room red flag
                    let flag = creep.room.find(FIND_FLAGS, {filter: f=>f.color == COLOR_RED && f.name.substr(0,2) == creep.memory.stp.substr(7,2)});
                    if (flag.length>0) { // follow flag 
                        let tar = flag[0].pos;
                        creep.travelTo(tar, {maxRooms: 1, offRoad: true, ignoreRoads: true});
                    }
                    else {
                        if (creep.room.name != creep.memory.target) { // if not in target
                            // move follow route
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
                                        } else {
                                            return 2.5;
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
                        else { // in target
                            // find decoder and transfer
                            let decoder = creep.room.find(FIND_SYMBOL_DECODERS)[0];
                            let transRes = creep.transfer(decoder, creep.memory.stp);
                            if ( transRes == ERR_NOT_IN_RANGE) {
                                creep.moveTo(decoder);
                            }
                            else if (transRes == OK && creep.memory.transferTime == undefined) { // set transfered log time
                                creep.memory.transferTime = Game.time;
                            }
                        }
                    }
                }
            }
        }
    }
};
