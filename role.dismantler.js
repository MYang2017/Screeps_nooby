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
        
        let tr = Game.rooms[creep.memory.target];
        if (tr && tr.controller && tr.controller.safeMode) {
            creep.memory.role='ranger';
            creep.memory.target=creep.memory.home;
            return
        }
                
        if (getB.run(creep)!=true) {
            return
        }
        else {
            if (travelToPrioHighwayWithClosestRoomExit(creep, creep.memory.target)) { // if in target (giver) room, go withdraw from storage:
            let t = Game.getObjectById('60ec93057ba32c78f29bb309');
            if (creep.pos.getRangeTo(t)>1) {
                creep.moveTo(t);
            }
            else {
                creep.dismantle(t);
            }
            return
                if (creep.pos.getRangeTo)
                    if (true || creep.hits > 0.75*creep.hitsMax) { // if full health
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
                                  creep.travelTo(closestHealer, {maxRooms: 1});
                              }
                              else {
                                  if (Game.flags['Dismantle'] != undefined) {
                                      let presious = getTargetByFlag('Dismantle','structure');
                                      if (presious != undefined) { // if there is storage
                                          if (creep.dismantle(presious) == ERR_NOT_IN_RANGE) {
                                              creep.travelTo(presious, {maxRooms: 1});
                                          }
                                      }
                                      else {
                                        var target = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES);
                                        if (creep.dismantle(target) == ERR_NOT_IN_RANGE) {
                                            creep.travelTo(target, {maxRooms: 1})
                                        }
                                      }
                                      if (creep.pos.isEqualTo(Game.flags['Dismantle'])) {
                                          Game.flags['Dismantle'].remove();
                                      }
                                  }
                                  else {
                                      let core = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {filter:c => c.structureType==STRUCTURE_TOWER});
                                      if (core==undefined) {
                                          core = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {filter:c => c.structureType==STRUCTURE_EXTENSION});
                                          if (core ==undefined) {
                                              core = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {filter:c => c.structureType==STRUCTURE_SPAWN||c.structureType==STRUCTURE_LINK||(creep.room.controller && (c.structureType==STRUCTURE_RAMPART&&c.pos.getRangeTo(creep.room.controller)<2))||c.structureType==STRUCTURE_LAB});
                                          }
                                      }
                                      if (core) {
                                          creep.travelTo(core, {maxRooms: 1});
                                          creep.dismantle(core);
                                      }
                                  }
                              }
                        }
                }
            }
        }
    }
};
