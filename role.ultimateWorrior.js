 var actionRecycle = require('action.recycle');

module.exports = {
    run: function(creep) {
        creep.say('😨', true);
        
        if (creep.memory.home == undefined) {
            creep.memory.home = creep.room.name;
        }
        
        if (creep.hits<0.7*creep.hitsMax) {
            creep.travelTo(new RoomPosition(25,25,creep.memory.home));
            creep.heal(creep);;
        }
        else {
            if (creep.memory.recycle) {
                if (creep.room.name != creep.memory.home) {
                    creep.travelTo(new RoomPosition(25,25,creep.memory.home));
                }
                else {
                    actionRecycle.run(creep);
                    return
                }
            }
            else {
                if (creep.room.name == 'E88N14') {
                    let message = ['20k','Oxygen','to','E92N11','every','50k','ticks']
                    creep.say(message[Game.time%message.length], true);
                }
                else {
                    let message = ['CrazyPilot...','we','will','remember...']
                    creep.say(message[Game.time%message.length], true);
                }
        
                if (creep.room.name == creep.memory.target) {// if creep in target room
                    // attack any creeps on the way
                    let closestHostile = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter:s=>s.getActiveBodyparts(ATTACK)>0||s.getActiveBodyparts(RANGED_ATTACK)>0||s.getActiveBodyparts(HEAL)>0||s.hits<0.2*s.hitsMax});
                    if (closestHostile == undefined) {
                      //closestHostile = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter:s=>s.getActiveBodyparts(CARRY)!=1});
                      closestHostile = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                    }
        
                    if (closestHostile) {
                        if (creep.pos.getRangeTo(closestHostile)>1) {
                            creep.rangedAttack(closestHostile);
                        }
                        else {
                            creep.rangedMassAttack();
                        }
                        let closestHealer = creep.pos.findClosestByRange(FIND_MY_CREEPS, {filter:s=>s.getActiveBodyparts(HEAL)>10&&s.name!=creep.name});
                        if (closestHealer&&creep.hits<0.9*creep.hitsMax) {
                            creep.travelTo(closestHealer, {maxRooms: 1});
                        }
                        else {
                            let distanceToKeep = fightingDistanceToKeep(creep,closestHostile);
                            keepAtDistance(creep, distanceToKeep, closestHostile);
                        }
                    }
                    else {
                        let core = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {filter:c => c.structureType==STRUCTURE_SPAWN});
                        if (core) {
                            creep.travelTo(core, {maxRooms: 1});
                            creep.rangedAttack(core);
                        }
                        else {
                            creep.memory.recycle = true;
                            creep.memory.target = creep.memory.home;
                        }
                    }
        
                    let toHeal = creep.pos.findClosestByRange(FIND_MY_CREEPS, { filter: (s) => (s.hits < s.hitsMax) } ); // find closest damaged creep
                    // go and heal damaged creep
                    if (toHeal) { // if there is damaged creep, go heal
                        if (creep.heal(toHeal) == ERR_NOT_IN_RANGE) {
                            creep.rangedHeal(toHeal);
                            //creep.memory.storedTarget.x = toHeal.pos.x;creep.memory.storedTarget.y = toHeal.pos.y;creep.memory.storedTarget.roomName = toHeal.room.name;
                        }
                    }
                }
                else {// go to target room
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
        }
    }
};
