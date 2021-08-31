var selfRecycling = require('action.recycle');
let fle = require('action.flee');

module.exports = {
    run: function(creep) {

          creep.say('pauwa',true);
          if (creep.memory.working == true && _.sum(creep.carry) == 0) {
              creep.memory.working = false;
          }
          else if (creep.memory.working == false && _.sum(creep.carry) > 0) {
              creep.memory.working = true;
          }
          
          let dangerous = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 5, {filter:c=>!allyList().includes(c.owner.username) && c.getActiveBodyparts(ATTACK)+c.getActiveBodyparts(RANGED_ATTACK)>0});
          if (dangerous.length>0) {
              fle.run(creep);
          }

          
          if (creep.memory.readyToDie) {
              if (creep.store.getFreeCapacity('power')>0) {
                  let drs = creep.room.find(FIND_DROPPED_RESOURCES, {filter:d=>d.resourceType=='power'});
                  if (drs.length>0) {
                      let dr = drs[0];
                      if (creep.pos.getRangeTo(dr)>1) {
                          creep.travelTo(dr, {maxRooms: 1});
                      }
                      else {
                          creep.pickup(dr);
                      }
                      return
                  }
                  else {
                      let tmbs = creep.room.find(FIND_TOMBSTONES, {filter:t=>t.store.power>0});
                      if (tmbs.length>0) {
                            let tmb = tmbs[0];
                            if (creep.pos.getRangeTo(tmb)>1) {
                                creep.travelTo(tmb, {maxRooms: 1});
                            }
                            else {
                                creep.withdraw(tmb, 'power');
                            }
                            return
                       }    
                  }
              }
              if (creep.room.name != creep.memory.home) {
                  // move to target
                    if (creep.memory.foundRoute == undefined) {
                        creep.memory.foundRoute = {};
                    }
                    if (creep.memory.foundRoute[creep.room.name+creep.memory.home]) {
                        let route = creep.memory.foundRoute[creep.room.name+creep.memory.home];
                        if (route.length > 0) {
                            let next = route[0];
                            let nextRoomTar = new RoomPosition(25, 25, next.room);
                            creep.travelTo(nextRoomTar, {maxRooms: 1});
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
                            creep.travelTo(nextRoomTar, {maxRooms: 1});
                        }
                        creep.memory.foundRoute[creep.room.name+creep.memory.home] = route;
                    }
              }
              else {
                  // finished duty and recycle
                  selfRecycling.run(creep);
              }
          }
          else {

              if (creep.memory.working == true) {
                  if (creep.memory.reAssignHome == undefined) {
                      let mrns = Memory.myRoomList[Game.shard.name];
                      let power0rns = [];
                      for (let mrn of mrns) {
                          if (Game.rooms[mrn] && Game.rooms[mrn].memory.mineralThresholds && Game.rooms[mrn].memory.mineralThresholds.currentMineralStats.power<5000) {
                              if (Game.map.getRoomLinearDistance(creep.room.name, mrn)<10 && Game.map.getRoomLinearDistance(creep.room.name, mrn)+0.618<creep.ticksToLive/2/50) {
                                  power0rns.push(mrn);
                              }
                          }
                      }
                      if (power0rns.length>0) {
                          creep.memory.home = power0rns[0];
                      }
                      creep.memory.reAssignHome = true;
                  }
                  if (creep.room.name != creep.memory.home) { // if not at home base
                    // move to target
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
                  else { // creep at home, transfer power to storage
                    let whereToPut = putATypeOfRes(creep.room, 'ops');
                    if (whereToPut) {
                        if (creep.pos.getRangeTo(whereToPut)>1) {
                            creep.travelTo(whereToPut, {maxRooms: 1});
                        }
                        else {
                            if (creep.transfer(whereToPut, 'ops')==OK) {
                                creep.memory.readyToDie = true;
                            }
                        }
                    }
                  }
              }
              else { // working is false, take power
                      if (creep.room.name == creep.memory.target) { // if not in target room go to target room, if in:
                        if (creep.store.power==0 && (creep.pos.x==0 || creep.pos.y==0 || creep.pos.x==49 || creep.pos.y==49)) {
                            creep.moveTo(25, 25, {maxRooms: 1});
                            return
                        }
                          var power = creep.room.find(FIND_DROPPED_RESOURCES, {filter: p=>p.resourceType!='energy'});
                          if (power.length>0) { // if there is mineral dropped
                              creep.travelTo(power[0], {maxRooms: 1});
                              if (creep.pickup(power[0]) == OK) {
                                  creep.memory.readyToDie = true;
                              }
                          }
                          else { // no power dropped, go to power bank
                            var pelic = creep.room.find(FIND_RUINS, {filter: r=>r.store.power>0});
                            if (pelic.length>0) { // if there is mineral dropped
                                  creep.travelTo(pelic[0], {maxRooms: 1});
                                  if (creep.withdraw(pelic[0], 'power') == OK) {
                                      creep.memory.readyToDie = true;
                                  }
                            }
                            else {
                              var target = creep.room.find(FIND_HOSTILE_STRUCTURES, { filter: c => c.structureType == STRUCTURE_POWER_BANK })[0];
                              if (target != undefined) {
                                  if (target.hits<25000 && target.pos.findInRange(FIND_CREEPS, 1, {filter:c=>c.owner.username=='Mirroar'}).length>0) {
                                      creep.travelTo(target, {maxRooms: 1});
                                      return
                                  }
                                  if (creep.pos.getRangeTo(target) > 3) {
                                      creep.travelTo(target, {maxRooms: 1});
                                  }
                                  if (target.ticksToDecay < 50 && target.hits / target.ticksToDecay > 1000) {
                                      creep.memory.readyToDie = true;
                                  }
                              }
                              else {
                                  creep.memory.readyToDie = true;
                              }
                            }
                          }
                      }
                      else {
                          
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
};
