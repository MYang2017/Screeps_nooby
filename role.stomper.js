var actionRunAway = require('action.flee');
var actionAvoid = require('action.idle');

require('funcExpand');

module.exports = {
    run: function(creep) {
        if (creep.memory.rantar == undefined) {
            let x = Math.floor(Math.random() * (48 - 1) + 1);
            let y = Math.floor(Math.random() * (48 - 1) + 1);
            creep.memory.rantar = {x: x, y: y};
        }
        if (creep.room.name==creep.memory.target) {
            /*
            if (creep.room.name=='W19S16' && creep.memory.capped == undefined) {
                if (creep.pos.getRangeTo(14, 33)>0) {
                    creep.travelTo(new RoomPosition(14, 33, 'W19S16'), {maxRooms: 1});
                }
                else {
                    creep.memory.capped = true;
                }
                return
            }
            */
            let ding = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter: c=>c.getActiveBodyparts(ATTACK)+c.getActiveBodyparts(RANGED_ATTACK)>0});
            if (ding) {
                let dingpow = ding.getActiveBodyparts(ATTACK)+ding.getActiveBodyparts(RANGED_ATTACK)
                let mcps = creep.room.find(FIND_MY_CREEPS, {filter:c=>c.memory.role=='stomper' && c.pos.getRangeTo(ding)<10});
                let atk = 0;
                for (let mcp of mcps) {
                    atk += mcp.getActiveBodyparts(ATTACK) + mcp.getActiveBodyparts(RANGED_ATTACK);
                }
                if (atk*1.68>dingpow) {
                    creep.moveTo(ding);
                    creep.attack(ding);
                    creep.rangedAttack(ding);
                }
                else {
                    actionRunAway.run(creep);
                }
            }
            else {
                let hst = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES, { filter: s => s.structureType==STRUCTURE_SPAWN && s.progress>47 });
                if (hst) {
                    if (creep.pos.getRangeTo(hst) > 0) {
                        creep.moveTo(hst);
                    }
                    return
                }
                let juc = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter:c=>c.getActiveBodyparts(ATTACK)+c.getActiveBodyparts(RANGED_ATTACK)+c.getActiveBodyparts(HEAL)==0});
                if (creep.getActiveBodyparts(ATTACK)>0 && juc) {
                    if (creep.pos.getRangeTo(juc)>1) {
                        creep.moveTo(juc, {maxRooms: 1});
                    }
                    else {
                        creep.attack(juc);
                    }
                }
                else if (creep.getActiveBodyparts(RANGED_ATTACK)>0 && juc) {
                    if (creep.pos.getRangeTo(juc)>1) {
                        creep.moveTo(juc, {maxRooms: 1});
                    }
                    if (creep.pos.getRangeTo(juc)<=1) {
                        creep.rangedMassAttack();
                    }
                    else {
                        creep.rangedAttack(juc);
                    }
                }
                else {
                    let hst = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES, { filter: s => !allyList().includes(s.owner.username) && s.progress>47 });
                    if (hst) {
                        if (creep.pos.getRangeTo(hst) > 0) {
                            creep.moveTo(hst);
                        }
                    }
                    else {
                        if (creep.getActiveBodyparts(ATTACK)+creep.getActiveBodyparts(RANGED_ATTACK)>0) {
                            let ss = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {filter: s=>s.structureType!=STRUCTURE_CONTROLLER});
                            if (ss) {
                                if (creep.pos.getRangeTo(ss)>1) {
                                    creep.moveTo(ss, {maxRooms: 1});
                                }
                                else {
                                    creep.attack(ss);
                                    if (creep.pos.getRangeTo(ss)<=1) {
                                        creep.rangedMassAttack();
                                    }
                                    else {
                                        creep.rangedAttack(ss);
                                    }
                                }
                            }
                            else {
                                let ss = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: s=>s.structureType!=STRUCTURE_CONTROLLER});
                                if (ss) {
                                    if (creep.pos.getRangeTo(ss)>1) {
                                        creep.moveTo(ss, {maxRooms: 1});
                                    }
                                    else {
                                        creep.attack(ss);
                                    }
                                    creep.rangedAttack(ss);
                                }
                                else {
                                    if (creep.pos.getRangeTo(25, 25)>5) {
                                        creep.moveTo(25, 25, {maxRooms:1})
                                    }
                                    actionRunAway.run(creep);
                                }
                            }
                        }
                        else {
                            let lure = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                            if (lure) {
                                if (creep.pos.getRangeTo(lure)>8) {
                                    creep.moveTo(lure, {maxRooms: 1});
                                }
                                else {
                                    if (creep.pos.getRangeTo(25, 25)>5) {
                                        creep.moveTo(25, 25, {maxRooms:1})
                                    }
                                }
                                actionRunAway.run(creep);
                            }
                            else {
                                creep.travelTo(new RoomPosition(25, 25, creep.memory.target), {maxRooms: 1});
                            }
                        }
                    }
                }
            }
        }
        else { // go to target room
            creep.travelTo(new RoomPosition(creep.memory.rantar.x, creep.memory.rantar.y, creep.memory.target));
            return
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
        }
    }
};