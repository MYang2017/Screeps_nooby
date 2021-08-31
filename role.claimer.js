var selfRecycling = require('action.selfRecycle');
let fleee = require('action.flee');
require('funcExpand');

module.exports = {
    run: function (creep) {
        if (creep.memory.home == undefined) {
            creep.memory.home = creep.room.name;
        }
        
        let fs = creep.room.find(FIND_FLAGS, {filter:f=>f.color==COLOR_PURPLE});
        if (fs.length>0) {
            creep.travelTo(fs[0]);
            return
        }
        
        if (creep.getActiveBodyparts(HEAL)>0) {
            creep.heal(creep);
        }
        
        if (false) { //(creep.memory.prepareToDie && creep.memory.prepareToDie == true) {
            selfRecycling.run(creep);
            //console.log(creep.room.name)
            let baseFlag = Game.flags['base' + creep.memory.target];
            if (baseFlag) {
                Game.rooms[creep.memory.target].createConstructionSite(baseFlag.pos.x, baseFlag.pos.y, STRUCTURE_SPAWN, 'Spawn_' + creep.memory.target + '_1')
            }
            else {
                console.log('Please set spawn position for room: ' + creep.memory.target + ' (depricated code in claimer)');
            }
        }
        else {
            if (creep.room.name == creep.memory.target) { // if in target room
                if (creep.pos.getRangeTo(creep.room.controller)>5 && creep.pos.findInRange(FIND_HOSTILE_CREEPS, 5, {filter: c=>c.getActiveBodyparts(ATTACK)+c.getActiveBodyparts(RANGED_ATTACK)>0}).length>0) {
                    fleee.run(creep);
                    return
                }
                // log room info
                if (!creep.memory.logged) {
                    logGrandeRoomInfo(creep.room);
                    creep.memory.logged = true;
                }
                if (creep.room.controller.my) {

                    creep.memory.prepareToDie = true;
                }
                else {
                    if (Game.time%100==0||(!creep.memory.checked)) {
                        let invcs = creep.room.find(FIND_STRUCTURES, { filter: c => c.structureType == STRUCTURE_INVADER_CORE });
                        if (invcs.length > 0) {
                            Game.rooms[creep.memory.home].memory.forSpawning.spawningQueue.push({ memory: { role: 'melee', target: creep.room.name, home: creep.memory.home }, priority: 5 });
                            Game.rooms[creep.memory.home].memory.forSpawning.spawningQueue.push({ memory: { role: 'claimer', target: creep.room.name, home: creep.memory.home }, priority: 2 });
                        }
                        creep.memory.checked = true;
                    }
                    if (creep.room.controller && ((creep.room.controller.owner && creep.room.controller.owner.username != 'PythonBeatJava')||(creep.room.controller.reservation && creep.room.controller.reservation.username != 'PythonBeatJava'))) {
                        let proceed = false;
                        if (creep.pos.findInRange(FIND_HOSTILE_CREEPS, 5, {filter: c=>c.getActiveBodyparts(ATTACK)+c.getActiveBodyparts(RANGED_ATTACK)>0}).length>0) {
                            proceed = true;
                        }
                        else if (creep.memory.no && creep.memory.no>1) {
                            let us = creep.name.slice(1, creep.name.length);
                            let cpno = 0;
                            let tot = 0;
                            
                            for (let i = 0; i < creep.memory.no; i++) {
                                let cpn = i+us;
                                let cp = Game.creeps[cpn];
                                if (cp) {
                                    tot += 1;
                                }
                                if (cp && cp.pos.getRangeTo(creep.room.controller)==1) {
                                    cpno+=1;
                                }
                                if (cp && cp.ticksToLive && cp.ticksToLive<=3) {
                                    proceed = true;
                                }
                            }
    
                            if (cpno>=creep.memory.no || cpno>=tot) {
                                proceed = true;
                            }
                        }
                        else {
                            proceed = true;
                        }

                        if (creep.pos.getRangeTo(creep.room.controller)>1) {
                            creep.travelTo(creep.room.controller, { maxRooms: 1 });
                        }
                        else { 
                            if (proceed) {
                                creep.attackController(creep.room.controller);
                            }
                            if (creep.memory.ttime == undefined) {
                                creep.memory.ttime = creep.ticksToLive;
                            }
                        }
                        if (creep.room.controller && creep.room.controller.upgradeBlocked && creep.room.controller.upgradeBlocked>creep.ticksToLive) {
                            if (creep.room.name=='E27S45') {
                                creep.memory.target = creep.memory.home;
                                creep.memory.role = 'ranger';
                            }
                            else if (creep.room.name=='W1S43') {
                                creep.memory.target = creep.memory.home;
                                creep.memory.role = 'ranger';
                            }
                            else {
                                if (creep.ticksToLive>600-creep.memory.ttime) {
                                    creep.memory.target = creep.memory.home;
                                    creep.memory.role = 'ranger';
                                }
                                else {
                                    creep.suicide();
                                }
                            }
                        }
                        //creep.signController(creep.room.controller, '⏸🥒  mine is big, you tolerate 🥒⏸️');
                        creep.signController(creep.room.controller, '🥒');
                        //creep.signController(creep.room.controller, '💕 Friendship comes in both ways, if you treat me well, I will treat you twice as better  ----- Shuren Zhou 💕 ');
                    }
                    else {
                        let claimres = creep.claimController(creep.room.controller);
                        if (claimres == ERR_NOT_IN_RANGE) {
                            creep.travelTo(creep.room.controller, { maxRooms: 1 });
                        }
                        else if (claimres == ERR_GCL_NOT_ENOUGH) {
                            creep.memory.target = creep.memory.home;
                            creep.memory.role = 'ranger';
                        }
                        creep.signController(creep.room.controller, '🍷🍷🍷🚷🚪🧗🗻🗡️🐯🩸🥩');
                        //creep.signController(creep.room.controller, '💕 Your friendly neighbour open for collaboration, whisper me to add to white list 💕 ');
                    }
                }
            }
            else { // go to target room
                let route = Game.map.findRoute(creep.room, creep.memory.target, {
                    routeCallback(roomName, fromRoomName) {
                        let parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
                        let isHighway = (parsed[1] % 10 === 0) ||
                            (parsed[2] % 10 === 0);
                        let isMyRoom = Game.rooms[roomName] &&
                            Game.rooms[roomName].controller &&
                            Game.rooms[roomName].controller.my;
                        if (isHighway) {
                            return 0.9;
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
                            return 8.8;
                        }
                    }
                });
                
                if (route.length > 0) {
                let exit = creep.pos.findClosestByRange(route[0].exit);
                    creep.travelTo(exit, { maxRooms: 1 });
                }
            }
        }
    }
};
