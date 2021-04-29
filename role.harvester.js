module.exports = {
    run: function(creep) {
        let home = creep.memory.home;
        if (!home) {
            creep.memory.home = creep.room.name;
        }
        else {
            if (creep.room.name == home) {
                if (creep.memory.working == true && creep.carry.energy == 0) {
                    creep.memory.working = false;
                }
                else if (creep.memory.working == false && creep.carry.energy == creep.carryCapacity) {
                    creep.memory.working = true;
                }
        
                if (creep.memory.working == true) {
                    var structure = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: (s) => ( (s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION || (s.energy < 0.95*s.energyCapacity && s.structureType == STRUCTURE_TOWER) ) && s.energy < s.energyCapacity) })
                    if (structure == undefined) {
                        structure = creep.room.storage;
                        if (structure == undefined) {
                          if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                              creep.moveTo(creep.room.controller);
                              //creep.upgradeController(creep.room.controller);
                          }
                        }
                    }
                    if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(structure);
                    }
                }
                else {
                  if (creep.memory.sourceIndex == undefined) { // if there is not a fixed source index 0 or 1, go to the closest source
                    var [resourceID, ifDropped] = evaluateEnergyResources(creep, true, true, true, true); // find energy function in myFunctoins
                    //console.log(creep.room.name,resourceID, ifDropped)
                    if (resourceID != undefined) {
                      energy = Game.getObjectById(resourceID);
                      if (ifDropped) { // if energy is dropped
                        if (creep.pickup(energy) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(energy);
                        }
                      }
                      else { // energy is from container, storage or link
                        if (creep.withdraw(energy, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(energy);
                        }
                      }
                    }
                    else { // room level too low, go for resources
                      if (creep.harvest(Game.getObjectById(ifDropped)) == ERR_NOT_IN_RANGE) {
                          creep.travelTo(Game.getObjectById(ifDropped), { maxRooms: 1 });
                      }
                    }
                }
                else {
                  var source = creep.room.find(FIND_SOURCES)[creep.memory.sourceIndex];
                  if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                      creep.travelTo(source, { maxRooms: 1 });
                  }
                }
            }
            }
            else {
                creep.moveTo(new RoomPosition(25, 25, home));
            }
        }
    }
};
