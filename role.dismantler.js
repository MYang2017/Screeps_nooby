var doge = require('action.idle');
var getB = require('action.getBoost');

module.exports = {
    run: function(creep) {
      creep.say('presious...');
        /*if (!creep.memory.boosted) { // if creep is not boosted, find a lab to boost
            let matToBoost = creep.memory.boostMat;
            if (matToBoost==false) {
                creep.memory.boosted = true;
                return
            }
            let labMemory = creep.room.memory.forLab;
            if (labMemory) {
                let boostLabMemory = labMemory.boostLabs;
                if (boostLabMemory) {
                    let boostLabId = boostLabMemory[matToBoost];
                    if (boostLabId) {
                        let boostLab = Game.getObjectById(boostLabId);
                        if ( creep.pos.getRangeTo(boostLab) > 1 ) {
                            creep.moveTo(boostLab);
                        }
                        else {
                            if ( (boostLab.mineralAmount>750) && (boostLab.boostCreep(creep) == 0 || boostLab.boostCreep(creep) == ERR_NOT_ENOUGH_RESOURCES) ) {
                                creep.memory.boosted = true;
                            }
                        }
                    }
                }
            }
        }*/
        
        if (creep.memory.home == undefined) {
            creep.memory.home = creep.room.name;
        }
        
        if (getB.run(creep)!=true) {
            return
        }
        else {
            if ((creep.room.name == creep.memory.target)||(creep.memory.target==undefined)) { // if in target (giver) room, go withdraw from storage:
                    if (creep.hits > 0.75*creep.hitsMax) { // if full health
                        if (creep.memory.tarId) {
                            for (let xid in creep.memory.tarId) {
                                let x = Game.getObjectById(creep.memory.tarId[xid]);
                                if (x==null) {
                                    // pass
                                }
                                else {
                                    if (creep.pos.getRangeTo(x)>1) {
                                        creep.travelTo(x, {maxRooms: 1});
                                        // dodge traffic jam
                                        let blockers = creep.pos.findInRange(FIND_MY_CREEPS, 1, {filter: c=>(c.memory.role=='stealer')});
                                        if (blockers.length > 0) {
                                            creep.moveTo(x);
                                            blockers[0].move(getRandomInt(1,8));
                                        }
                                    }
                                    else {
                                        // stupid road on terrain wall
                                        let road = creep.room.find(FIND_STRUCTURES, {filter: c=>c.structureType==STRUCTURE_ROAD})[0];
                                        if (Game.time%6==0 && creep.getActiveBodyparts(CARRY)>0) {
                                            creep.repair(road);
                                        }
                                        else {
                                            creep.dismantle(x);
                                        }
                                    }
                                    return
                                }
                            }
                            // every thing is dismantled
                            creep.memory.target = creep.memory.home;
                            creep.memory.role = 'ranger';
                            creep.memory.recycle = true;
                        }
                        else {
                            let closestHealer = creep.pos.findClosestByRange(FIND_MY_CREEPS, {filter:s=>s.getActiveBodyparts(HEAL)>10&&s.name!=creep.name});
                              if (closestHealer&&creep.pos.getRangeTo(closestHealer)>2) {
                                  creep.travelTo(closestHealer);
                              }
                              else {
                                  if (Game.flags['Dismantle'] != undefined) {
                                      let presious = getTargetByFlag('Dismantle','structure');
                                      if (presious != undefined) { // if there is storage
                                          if (creep.dismantle(presious) == ERR_NOT_IN_RANGE) {
                                              creep.travelTo(presious);
                                          }
                                      }
                                      else {
                                        var target = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES);
                                        if (creep.dismantle(target) == ERR_NOT_IN_RANGE) {
                                            creep.travelTo(target)
                                        }
                                      }
                                      if (creep.pos.isEqualTo(Game.flags['Dismantle'])) {
                                          Game.flags['Dismantle'].remove();
                                      }
                                  }
                                  else {
                                      let core = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {filter:c => c.structureType==STRUCTURE_EXTENSION});
                                      if (core==undefined) {
                                          core = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {filter:c => c.structureType==STRUCTURE_TOWER});
                                          if (core ==undefined) {
                                              core = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {filter:c => c.structureType==STRUCTURE_SPAWN||c.structureType==STRUCTURE_LINK||c.structureType==STRUCTURE_LAB});
                                          }
                                      }
                                      if (core) {
                                          creep.travelTo(core);
                                          creep.dismantle(core);
                                      }
                                  }
                              }
                        }
                }
            }
            else { // if not in target room, move to target room
                if (creep.memory.target == 'E20S20') {
                    let dests = creep.memory.dests;
                    if (dests != undefined) {
                        for (let did in dests) {
                            let dest = dests[did];
                            if (dest.completed == undefined) {
                                creep.travelTo(new RoomPosition(dest.x, dest.y, dest.roomName));
                                if (creep.pos.x == dest.x && creep.pos.y==dest.y && creep.room.name == dest.roomName) {
                                    creep.memory.dests[did].completed = true;
                                }
                                return
                            }
                        }
                        
                    }
                    else {
                        if (creep.memory.boostMats = ['XZH2O']) {
                            creep.memory.dests = [{x:48 ,y: 22, roomName: 'E16S20'}]; //, {x: 26, y: 32, roomName: 'E20S10'}
                        }
                        else {
                            creep.memory.dests = [{x: 25 ,y: 20, roomName: 'E10S22'}, {x:48 ,y: 22, roomName: 'E16S20'}]; //, {x: 26, y: 32, roomName: 'E20S10'}
                        }
                    }
                }
                else if (creep.memory.target == 'E23S19') {
                    let dests = creep.memory.dests;
                    if (dests != undefined) {
                        for (let did in dests) {
                            let dest = dests[did];
                            if (dest.completed == undefined) {
                                creep.travelTo(new RoomPosition(dest.x, dest.y, dest.roomName));
                                if (creep.pos.x == dest.x && creep.pos.y==dest.y && creep.room.name == dest.roomName) {
                                    creep.memory.dests[did].completed = true;
                                }
                                return
                            }
                        }
                        
                    }
                    else {
                        creep.memory.dests = [{x: 25 ,y: 16, roomName: 'E20S20'}]; //, {x: 26, y: 32, roomName: 'E20S10'}
                    }
                }
                else if (creep.memory.target == 'E10S16') {
                    storedTravelFromAtoB(creep, 'l');
                    return
                }
                let route = Game.map.findRoute(creep.room, creep.memory.target);
                let exit = creep.pos.findClosestByRange(route[0].exit);
                let exitRange = creep.pos.getRangeTo(exit);
                // if x is close to exit
                if (exitRange > 0) {
                    // get in
                    creep.travelTo(exit);
                }
            }
        }
    }
};
