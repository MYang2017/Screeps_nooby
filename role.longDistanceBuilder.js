var roleBuilder = require('role.builder');
var roleDismantler = require('role.dismantler');
var actionBuild = require('action.build');
var actionRunAway = require('action.flee');
let getE = require('action.getEnergy');
module.exports = {
    run: function(creep) {
        
        let sites = creep.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 3);
        if (sites.length > 0) {
            creep.build(sites[0]);
        }
            
        if (creep.pos.findInRange(FIND_HOSTILE_CREEPS, 4, {filter: c=>(!allyList().includes(c.owner.username)&& c.getActiveBodyparts(ATTACK) + c.getActiveBodyparts(RANGED_ATTACK) > 0)}).length > 0) { // self destroy if not useful damages by NPC
            creep.memory._trav = undefined;
            actionRunAway.run(creep)
        }
        else {
            if (creep.hits<creep.hitsMax) {
                creep.travelTo(new RoomPosition(25,25, creep.memory.home));
                return
            }
            if (creep.memory.needhelp==true) {
                if (_.sum(creep.store) == 0) {
                    if (creep.room.name != creep.memory.home) {
                        creep.travelTo(new RoomPosition(25,25, creep.memory.home), { ignoreCreeps: false});
                    }
                    else {
                        let takres = creep.withdraw(creep.room.storage, 'energy');
                        if (takres!=OK) {
                            creep.travelTo(creep.room.storage)
                        }
                        else {
                            creep.memory.needhelp = undefined;
                        }
                    }
                }
                else {
                    creep.travelTo(new RoomPosition(25,25, creep.memory.target));
                }
                if (creep.room.name == creep.memory.target) {
                    let mino = creep.room.find(FIND_MY_CREEPS, {filter: c=>c.memory.role=='miner'})
                    if (_.sum(creep.store) == 0 && mino.length==0) {
                        creep.memory.needhelp = true;
                        return
                    }
                    else {
                        creep.memory.needhelp = false;
                    }
                }
                return
            }
          if (false) { //((Game.rooms[creep.memory.target]==undefined)||(Game.rooms[creep.memory.target].memory.ifPeace == false)) { // room under attack, run away
             creep.say('run away');
               if (creep.room.name != creep.memory.home) { // if not at home base
                   creep.travelTo(new RoomPosition(25,25, creep.memory.home), { ignoreCreeps: false});
               }
               else if (creep.room.name == creep.memory.home) {
                   roleBuilder.run(creep);
               }
          }
          else {
            creep.say('build here die here');
            if (creep.room.name == creep.memory.target) {
                let mino = creep.room.find(FIND_MY_CREEPS, {filter: c=>c.memory.role=='miner'})
                if (_.sum(creep.store) == 0 && mino.length==0) {
                    creep.memory.needhelp = true;
                    return
                }
                else {
                    creep.memory.needhelp = false;
                }
                /*if (creep.room.name == 'E91N12') { // if invading room
                    roleDismantler.run(creep);
                }
                else {
                // if creep in target room then work
                    roleBuilder.run(creep);
                }*/
                
                if (creep.memory.working == true && creep.carry.energy == 0) {
                    creep.memory.working = false;
                }
                else if (creep.memory.working == false && _.sum(creep.store) > 0.95 * creep.store.getCapacity('energy')) {
                    creep.memory.working = true;
                }
                if (creep.memory.working == false) {
                    getE.run(creep);
                }
                else {
                    let room = Game.rooms[creep.memory.home];
                    let remoteMiningRoomName = creep.memory.target;
                    if (room.memory.remoteMiningRoomNames && room.memory.remoteMiningRoomNames[remoteMiningRoomName] && room.memory.remoteMiningRoomNames[remoteMiningRoomName].roads) {
                        if (creep.room.find(FIND_MY_CONSTRUCTION_SITES).length>0) {
                            roleBuilder.run(creep);
                        }
                        else {
                            let repid = creep.memory.repid;
                            if (repid && Game.getObjectById(repid)) {
                                if (Game.getObjectById(repid).hits>Game.getObjectById(repid).hitsMax*0.887) {
                                    creep.memory.repid = undefined;
                                }
                                else {
                                    if (creep.pos.getRangeTo(Game.getObjectById(repid))>3) {
                                        creep.travelTo(Game.getObjectById(repid), {maxRooms:1});
                                    }
                                    else {
                                        creep.repair(Game.getObjectById(repid));
                                    }
                                }
                            }
                            else {
                                let roads = room.memory.remoteMiningRoomNames[remoteMiningRoomName].roads;
                                for (let road of roads) {
                                    let found = Game.rooms[remoteMiningRoomName].lookForAt(LOOK_STRUCTURES, road.x, road.y);
                                    if (found.length==0) {
                                        creep.room.createConstructionSite(road.x, road.y, STRUCTURE_ROAD);
                                    }
                                    if (found.length && found[0].hits<found[0].hitsMax*0.618) {
                                        creep.memory.repid = found[0].id;
                                        return
                                    }
                                }
                                for (let road of roads) {
                                    let found = Game.rooms[remoteMiningRoomName].lookForAt(LOOK_STRUCTURES, road.x, road.y);
                                    if (found.length && found[0].hits<=found[0].hitsMax*0.887) {
                                        creep.memory.repid = found[0].id;
                                        return
                                    }
                                }
                            }
                        }
                    }
                    else {
                        let roadneedsrep = creep.room.find(FIND_STRUCTURES, {filter:s=>s.structureType==STRUCTURE_ROAD&&s.hits<0.618*s.hitsMax&&(creep.room.name!='E2S29'||s.pos.x<32)&&(creep.room.name!='W2S19'||s.pos.y>10)});
                        if (roadneedsrep.length>0) {
                            if (creep.pos.getRangeTo(roadneedsrep[0])>3) {
                                creep.travelTo(roadneedsrep[0], {maxRooms: 1});
                            }
                            else {
                                creep.repair(roadneedsrep[0]);
                            }
                        }
                        else {
                            if (creep.room.find(FIND_MY_CONSTRUCTION_SITES).length>0) {
                                roleBuilder.run(creep);
                            }
                            else {
                                roadneedsrep = creep.room.find(FIND_STRUCTURES, {filter:s=>s.structureType==STRUCTURE_ROAD&&s.hits<0.996*s.hitsMax&&(creep.room.name!='E2S29'||s.pos.x<32)&&(creep.room.name!='W2S19'||s.pos.y>10)});
                                if (roadneedsrep.length>0) {
                                    if (creep.pos.getRangeTo(roadneedsrep[0])>3) {
                                        creep.travelTo(roadneedsrep[0], {maxRooms: 1});
                                    }
                                    else {
                                        creep.repair(roadneedsrep[0]);
                                    }
                                }
                                else {
                                    creep.memory.role='ranger';
                                }
                            }
                        }
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
