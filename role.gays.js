var actionRunAway = require('action.idle');
let getB = require('action.getBoost');
let gogo = require('action.attackAllInOne');
let dego = require('action.flee');
var kit = require('role.kiter');
/*
urgent E6S17
soso E7S15
juicy E7S19
fake E9S17

11t 6ra 9m 23h 1m lvl 8
6t 22ra 9m 12h 1m lvl 7
*/

module.exports = {
    run: function (creep) {
        creep.say('Biu~', true);
        if (getB.run(creep) != true) {
            return
        }
        else {
            let tr = Game.rooms[creep.memory.target];
            if (tr && tr.controller && tr.controller.safeMode) {
                creep.memory.role='ranger';
                creep.memory.target=creep.memory.home;
                return
            }
        
            let fuckedup = false;
            if (fuckedup) {
                creep.moveTo(new RoomPosition(25, 25, creep.memory.home));
            }
            let us = creep.name.slice(1, creep.name.length);
            // if creep is male
            if (creep.name.slice(0,1)=='m') {
                // find female
                let fn = 'f'+us;
                let f = Game.creeps[fn];
                // if female
                if (f==undefined || f.spawning) {
                    // just use the room rest position and dodge feature of chainmotion
                    chainMotion(creep, new RoomPosition(25, 25, creep.memory.target), fn, true);
                }
                if (f) {
                    // if in target
                    if (creep.room.name==creep.memory.target) {
                        let swampC = 1;
                        if (creep.body.length/creep.getActiveBodyparts(MOVE) >= 6/5) {
                            swampC = 3;
                        }
                        // if on edge
                        let tar = undefined;
                        if (ifOnEdgeOfRoom(creep.pos)) {
                            // move one step inside
                            creep.travelTo(new RoomPosition(25, 25, creep.memory.target), {maxRooms: 1});
                        }
                        else {
                            if (f.room.name==creep.room.name && creep.pos.getRangeTo(f)<2 && f.fatigue==0) { // if female followed
                                tar = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter:c=>(!allyList().includes(c.owner.username)) && c.pos.findInRange(FIND_HOSTILE_STRUCTURES, 0, {filter:t=>t.structureType==STRUCTURE_RAMPART}).length==0});
                                if (tar==undefined) {
                                    tar = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter:c=>(!allyList().includes(c.owner.username))});
                                    if (tar==undefined) {
                                        tar = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {filter:t=>t.structureType!=STRUCTURE_CONTROLLER});
                                        if (tar==undefined) {
                                            tar = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter:t=>t.structureType!=STRUCTURE_CONTROLLER});
                                            if (tar==undefined) {
                                                dego.run(creep); // doge
                                            }
                                        }
                                    }
                                }
                                if (tar) {
                                    if (creep.pos.getRangeTo(tar)>1) {
                                        moveRestrictedInRoom(creep, tar.pos);
                                    }
                                }
                            }
                            else { // female in room but not followed
                                if (f.room.name==creep.room.name && creep.pos.getRangeTo(f)>1 && f.fatigue>0) {
                                    creep.moveTo(f, {maxRooms: 1, range: 1});
                                }
                            }
                            gogo.run(creep);
                            return
                        }
                    }
                    else {
                        if (ifOnEdgeOfRoom(creep.pos)) {
                            // move one step inside
                            creep.moveTo(25, 25, {maxRooms: 1});
                        }
                        else if (f.room.name==creep.room.name && creep.pos.getRangeTo(f)<2) { // if female followed
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
                                    else if (Game.shard.name=='shard3' && (roomName=='E11S49'||roomName=='E12S49'||roomName=='E11S51')) {
                                        return 255;
                                    }
                                    else if (Memory.rooms[roomName] && Memory.rooms[roomName].avoid) {
                                        return 255;
                                    }
                                    else {
                                        return 4.8;
                                    }
                                }
                            });
                            
                            if (route.length > 0) {
                                let exit = creep.pos.findClosestByRange(route[0].exit);
                                    creep.travelTo(exit, { maxRooms: 1 });
                            }
                        }
                        else {
                            // wait for f to come to the same room
                        }
                    }
                }
                else {
                    // be normal attacker
                }
            }
            else if (creep.name.slice(0,1)=='f') {
                if (creep.getActiveBodyparts(RANGED_ATTACK)>0) {
                    let ens = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 3, {filter:c=>(!allyList().includes(c.owner.username))});
                    if (ens.length>1) {
                        creep.rangedMassAttack();
                    }
                    else if (ens.length==1) {
                        creep.rangedAttack(ens[0]);
                    }
                }
                let mn = 'm'+us;
                let m = Game.creeps[mn];
                if (m) {// if male
                    if (creep.room.name==m.room.name) {
                        creep.travelTo(m, {maxRooms:1});
                    }
                    else {
                        creep.travelTo(m);
                    }
                    gogo.run(creep);
                    return
                }
                else { 
                    kit.run(creep);
                    // be kiter
                }
            }
            else {
                fo('gays gender wrong');
            }
        }
    }
};
