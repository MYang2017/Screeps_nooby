var actionAvoid = require('action.idle');

module.exports = {
    run: function(creep) {
        //if (creep.memory.home == undefined) { // || creep.room.name != creep.memory.home) {
        //    creep.travelTo(Game.flags('linkE94N17'));
        //}
        //else {
            creep.say('recycling');
            if (creep.memory.working == true && _.sum(creep.carry) == 0) {
                creep.memory.working = false;
            }
            else if (creep.memory.working == false && _.sum(creep.carry) == creep.carryCapacity ) {
                creep.memory.working = true;
            }

            if (creep.memory.working == true) {
              for(const resourceType in creep.carry) {
                if (resourceType==RESOURCE_ENERGY) { // carrying energy
                  var structure = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: (s) => ( (s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION || ( s.structureType == STRUCTURE_TOWER && (s.energy < s.energyCapacity*0.7) )) && s.energy < s.energyCapacity) })
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
                  var structure = creep.room.storage;
                  if (creep.transfer(structure, resourceType) == ERR_NOT_IN_RANGE) {
                      creep.travelTo(structure);
                  }
                }
              }
            }
            else { // working, pick up resources
              var droppedMinerals = creep.room.find(FIND_DROPPED_RESOURCES);
              if (droppedMinerals.length) { // if there is mineral dropped
                creep.travelTo(droppedMinerals[0]);
                creep.pickup(droppedMinerals[0]);
              }
              else {
                var [resourceID, ifDropped] = evaluateEnergyResources(creep, true, false, true, true); // find energy functoin in myFunctoins
                if (resourceID != undefined) {
                  energy = Game.getObjectById(resourceID);
                  if (ifDropped) { // if energy is dropped
                    if (creep.pickup(energy) == ERR_NOT_IN_RANGE) {
                        creep.travelTo(energy);
                    }
                  }
                  else { // energy is from container, storage or link
                      if (creep.withdraw(energy, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                          creep.travelTo(energy);
                      }
                  }
                }
              }
            }
        //}
    }
};
