let give = require('action.recycle');
var dupCheck = require('action.dupCheck');
let runaway = require('action.flee')
let dog = require('action.idle');

module.exports = {
    run: function(creep) {
        if (_.sum(creep.store)>0 || creep.room.storage==undefined) {
            creep.memory.full = true;
        }
        
        if (!creep.memory.full) {
            let ships = ['energy'];
            if (creep.memory.toTp) {
                ships = [creep.memory.toTp];
            }
            else if (Game.shard.name=='shardSeason'&&Game.rooms[creep.memory.target].memory.powerSpawnId) {
                ships = ['power'];
            }
            for (let ship of ships) {
                let whereTo = getATypeOfRes(creep.room, ship);
                if (whereTo) {
                    if (creep.pos.getRangeTo(whereTo)>1) {
                        creep.travelTo(whereTo);
                    }
                    else {
                        creep.withdraw(whereTo, ship);
                    }
                    return
                }
            }
            return
        }
        else { // else if full
            // if not in target
            if (creep.room.name != creep.memory.target) { // if not in target room yet
                // move to target
                if (creep.memory.foundRoute == undefined) {
                    creep.memory.foundRoute = {};
                }
                if (creep.memory.foundRoute[creep.room.name+creep.memory.target]) {
                    let route = creep.memory.foundRoute[creep.room.name+creep.memory.target];
                    if (route.length > 0) {
                        let next = route[0];
                        let nextRoomTar = new RoomPosition(25, 25, next.room);
                        creep.travelTo(nextRoomTar, {maxRooms: 1});
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
                            else if (Memory.rooms[roomName] && Memory.rooms[roomName].avoid) {
                                return 25.8
                            }
                            else {
                                return 5.14;
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
            else {// else in target
                creep.memory.home = creep.memory.target;
                let qiangs = creep.room.find(FIND_MY_CREEPS, {filter: c=>c.memory.role=='qiangWorker' || c.memory.role=='pioneer'});
                if (qiangs.length>0) {
                    if (qiangs[0].store.energy==0) {
                        if (creep.pos.getRangeTo(qiangs[0])>1) {
                            creep.travelTo(qiangs[0], {maxRooms: 1});
                        }
                        else {
                            if (creep.store.energy>0) {
                                creep.transfer(qiangs[0], 'energy');
                            }
                            else {
                                creep.suicide();
                            }
                        }
                        return
                    }
                    else {
                        qiangs = creep.room.find(FIND_MY_CREEPS, {filter: c=>c.memory.role=='qiangWorker' || c.memory.role=='pioneer'}); // && c.pos.findInRange(FIND_MY_CREEPS, 3, {filter: c=>c.memory.role=='sacrificer'}).length<3
                        if (qiangs.length>0) {
                            if (creep.pos.getRangeTo(qiangs[0])>1) {
                                creep.travelTo(qiangs[0], {maxRooms: 1});
                            }
                            else {
                                if (creep.store.energy>0) {
                                    creep.transfer(qiangs[0], 'energy');
                                }
                                else {
                                    creep.suicide();
                                }
                            }
                        }
                        else {
                            dog.run(creep);
                        }
                    }
                    return
                }
                if (creep.memory.rec) {
                    give.run(creep);
                }
                else {
                    if (creep.room.find(FIND_MY_STRUCTURES, {filter: c=>c.structureType==STRUCTURE_SPAWN}).length == 0) {
                        if (creep.pos.getRangeTo(creep.room.controller)>1) {
                            creep.travelTo(creep.room.controller, {maxRooms: 1});
                        }
                        return
                    }
                    if (creep.room.memory.forSpawning.roomCreepNo.minCreeps.superUpgrader>0) {
                        if (creep.store.energy>0) {
                            if (creep.memory.suckFrom == undefined || Game.getObjectById(creep.memory.suckFrom) == undefined) {
                                let ifTower = false;
                                let ts = creep.room.find(FIND_STRUCTURES, {filter: o=>o.structureType==STRUCTURE_TOWER});
                                let cr = creep.room.controller;
                                for (let t of ts) {
                                    if (t.pos.getRangeTo(cr) < 3) {
                                        ifTower = true;
                                        creep.memory.suckFrom = t.id;
                                    }
                                }
                                if (!ifTower) {
                                    let nearbyEnergySources = cr.pos.findInRange(FIND_STRUCTURES, 3, {filter:s=> ((s.structureType==STRUCTURE_STORAGE)||(s.structureType==STRUCTURE_TERMINAL)||(s.structureType==STRUCTURE_CONTAINER)||(s.structureType==STRUCTURE_LINK)||(s.structureType==STRUCTURE_LAB))});
                                    if (nearbyEnergySources.length>0) {
                                        creep.memory.suckFrom = nearbyEnergySources[0].id;
                                    }
                                    else {
                                        if (Game.time%33==0) {
                                            console.log(creep.room+' sacrificer is not next to energy sources');
                                        }
                                        return
                                    }
                                }
                            }
                            else {
                                let suc = Game.getObjectById(creep.memory.suckFrom);
                                if (creep.pos.getRangeTo(suc)>1) {
                                    creep.travelTo(suc, {maxRooms: 1});
                                }
                                else {
                                    creep.transfer(suc, 'energy');
                                }
                            }
                        }
                        else if (_.sum(creep.store)>0) { // carrying non energy
                            if (creep.pos.getRangeTo(creep.room.storage)>1) {
                                creep.travelTo(creep.room.storage, {maxRooms: 1});
                            }
                            else {
                                for (let res in creep.store) {
                                    creep.transfer(creep.room.storage, res);
                                }
                            }
                            return
                        }
                        else { // carry 0 energy
                            if (creep.ticksToLive<111) {
                                give.run(creep);
                                return
                            }
                            else {
                                let st = creep.room.storage;
                                if (creep.pos.getRangeTo(st)>1) {
                                    creep.travelTo(st, {maxRooms: 1});
                                }
                                else {
                                    creep.withdraw(st, 'energy');
                                }
                            }
                        }
                        
                        if (creep.room.find(FIND_MY_CREEPS, {filter:f=>f.memory.role=='dedicatedUpgraderHauler'}).length<2) {
                            creep.memory.role = 'dedicatedUpgraderHauler';
                            creep.memory.home = creep.memory.target;
                        }
                        else if (creep.room.find(FIND_MY_CREEPS, {filter:f=>f.memory.role=='pickuper'}).length<2) {
                            creep.memory.role = 'pickuper';
                            creep.memory.home = creep.memory.target;
                        }
                        else {
                            if (dupCheck.run(creep, 1)) {
                                creep.memory.rec = true;
                                creep.memory.home = creep.memory.target;
                            }
                        }
                    }
                    else { // recycle
                        give.run(creep);
                        return
                    }
                }
            }
        }
    }
};
