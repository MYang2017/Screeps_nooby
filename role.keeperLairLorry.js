var actionRunAway = require('action.flee');
var actionGetEnergy = require('action.getEnergy');

module.exports = {
    run: function(creep) {
      //console.log(creep.pos,creep.name)
          let creepCarrying = _.sum(creep.carry);

          if (creep.pos.findInRange(FIND_HOSTILE_CREEPS, 5).length > 0) { // self destroy if not useful damages by NPC
              actionRunAway.run(creep)
          }
          else {
              creep.say('lair away');
              if (creep.memory.working == true && creepCarrying == 0) {
                  creep.memory.toCentre = false;
                  creep.memory.working = false;
              }
              else if (creep.memory.working == false && creepCarrying == creep.carryCapacity) {
                  creep.memory.working = true;
              }

              if (creep.memory.working == true) {
                  if (creep.room.name == creep.memory.home) { // if not in target room go to target room, if in:
                    for(const resourceType in creep.carry) {
                      if (resourceType==RESOURCE_ENERGY) { // carrying energy
                        var structure = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: (s) => ( (s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION || ( s.structureType == STRUCTURE_TOWER && (s.energy < s.energyCapacity*0.3) )) && s.energy < s.energyCapacity) })
                        if (structure == undefined) {
                            structure = creep.room.storage;
                            if (structure) {
                                if (structure.store[RESOURCE_ENERGY]>0.8*structure.storeCapacity) { // storage is almost full
                                    structure = creep.room.terminal;
                                }
                            }
                            else { // storage is not defined, move to centre link point and drop resource
                                /*let imaginaryStorage = Game.flags['link'+creep.room.name];
                                if (creep.pos.getRangeTo(imaginaryStorage)>3) {
                                    creep.travelTo(imaginaryStorage);
                                }
                                else {
                                    creep.drop(RESOURCE_ENERGY);
                                }*/
                                //actionAvoid.run(creep);
                            }
                        }
                        if (creep.transfer(structure, resourceType) == ERR_NOT_IN_RANGE) {
                            creep.travelTo(structure);
                        }
                      }
                      else { // carrying minerals
                        var structure = creep.room.terminal;
                        if (creep.transfer(structure, resourceType) == ERR_NOT_IN_RANGE) {
                            creep.travelTo(structure);
                        }
                      }
                    }
                  }
                  else {
                      if ((creep.carry.energy>0)&&(creep.getActiveBodyparts(WORK) > 0)) {
                          let constructionSite = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
                          if (constructionSite) {
                              if (creep.build(constructionSite) == ERR_NOT_IN_RANGE) {
                                  creep.travelTo(constructionSite);
                                  //creep.build(constructionSite);
                              }
                          }
                          else {
                              let thingUnderFeet = creep.room.lookForAt(LOOK_STRUCTURES, creep)[0];
                              if (thingUnderFeet && thingUnderFeet.structureType == STRUCTURE_ROAD) {
                                  creep.repair(thingUnderFeet);
                              }
                              creep.travelTo(Game.flags['link'+creep.memory.home]);
                          }
                      }
                      else {
                          creep.travelTo(Game.flags['link'+creep.memory.home]);
                      }
                  }
              }
              else { // working is false, take energy
                  if (creep.room.name == creep.memory.target) { // if not in target room go to target room, if in:
                      let ifMineral = mineralNeedsCollect(creep.room);
                      if ((ifMineral) && (ifMineral[0]>1000)) { // collect mineral
                          let resourceType = ifMineral[1];
                          creep.say('get '+resourceType);
                          let container = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: s => s.structureType == STRUCTURE_CONTAINER && s.store[resourceType] > 0});
                          if (container != undefined) { // if all containers are 0, take energy from storage
                              if (creep.withdraw(container, resourceType) == ERR_NOT_IN_RANGE) {
                                  creep.travelTo(container);
                              }
                              if ( _.sum(container.store)==0) {
                                  creep.memory.working = true;
                              }
                          }
                      }
                      else { // collect energy
                          actionGetEnergy.run(creep);
                          /*//let safeEnergy = creep.room.find(FIND_DROPPED_RESOURCES, {filter: c => ((c.resourceType == RESOURCE_ENERGY) && (c.pos.findInRange(FIND_HOSTILE_CREEPS, 3).length == 0))});
                          let energy = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {filter: c => ((c.resourceType == RESOURCE_ENERGY) && (c.pos.findInRange(FIND_HOSTILE_CREEPS, 3).length == 0))});
                          //console.log((energy),(energy.energy>400),(creep.pickup(energy) == ERR_NOT_IN_RANGE))
                          if ((energy)&&(energy.energy>400)&&(creep.pickup(energy) == ERR_NOT_IN_RANGE)) {
                              creep.travelTo(energy);
                          }
                          else {
                              let container = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: s => s.structureType == STRUCTURE_CONTAINER && (s.store[RESOURCE_ENERGY] > 0.618*creep.carryCapacity)});
                              if (container != undefined) { // if all containers are 0, take energy from storage
                                  if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                      creep.travelTo(container);
                                  }
                              }
                          }*/

                      }
                  }
                  else {
                      creep.travelTo(Game.flags[creep.memory.target]);
                      //var exit = creep.room.findExitTo(creep.memory.target);
                      //creep.travelTo(creep.pos.findClosestByRange(exit));
                  }
              }
          }
    }
};
