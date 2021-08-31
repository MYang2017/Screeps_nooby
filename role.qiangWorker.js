var dog = require('action.idle');
var gogo = require('action.attackAllInOne');
var getB = require('action.getBoost');
var pick = require('action.ontheway');
module.exports = {
    run: function (creep) {
            if (creep.room.name != creep.memory.target) {
                // doge dangerous enemy
                if (creep.pos.findInRange(FIND_HOSTILE_CREEPS, 6, { filter: c => (!allyList().includes(c.owner.username) && c.getActiveBodyparts(ATTACK) + c.getActiveBodyparts(RANGED_ATTACK) > 3) }).length > 0) {
                    runaway.run(creep);
                    return
                }
                if (Game.cpu.bucket>100) {
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
                                else if (Memory.rooms[roomName] && Memory.rooms[roomName].avoid) {
                                    return 12;
                                }
                                else {
                                    return 3.8;
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
                //creep.travelTo(new RoomPosition(25, 25, creep.memory.target));
                //storedTravelFromAtoB(creep, 'l');
            }
            else {// else in target
                let css = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
                if (css.length>0) {
                    let dist = creep.pos.getRangeTo(css[0]);
                    if (dist>2) {
                        creep.travelTo(css[0]);
                    }
                    else {
                        if (creep.store.energy>0) {
                            creep.build(css[0]);
                        }
                        pick.run(creep);
                    }
                }
                else {
                    let ctr = creep.room.controller;
                    if (ctr && ctr.my) {
                        let dist = creep.pos.getRangeTo(ctr);
                        if (dist>3) {
                            creep.travelTo(ctr);
                        }
                        else {
                            creep.upgradeController(ctr);
                        }
                    }
                    else {
                        dog.run(creep);
                    }
                }
                return
                
                if (creep.memory.rec) {
                    give.run(creep);
                }
                else {
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
                                    creep.travelTo(suc);
                                }
                                else {
                                    creep.transfer(suc, 'energy');
                                }
                            }
                        }
                        else if (_.sum(creep.store)>0) { // carrying non energy
                            if (creep.pos.getRangeTo(creep.room.storage)>1) {
                                creep.travelTo(creep.room.storage);
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
                                    creep.travelTo(st);
                                }
                                else {
                                    creep.withdraw(st, 'energy');
                                }
                            }
                        }
                        
                        if (creep.room.find(FIND_MY_CREEPS, {filter:f=>f.memory.role=='dedicatedUpgraderHauler'}).length<3) {
                            creep.memory.role = 'dedicatedUpgraderHauler';
                        }
                        else if ((creep.room.find(FIND_MY_CREEPS, {filter:f=>f.memory.role=='driver'}).length==0 && creep.room.find(FIND_MY_CREEPS, {filter:f=>f.memory.role=='pickuper'}).length<3) || (creep.room.find(FIND_MY_CREEPS, {filter:f=>f.memory.role=='pickuper'}).length<2)) {
                            creep.memory.role = 'pickuper';
                        }
                        else {
                            if (dupCheck.run(creep, 1)) {
                                creep.memory.rec = true;
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