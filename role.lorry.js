var actionAvoid = require('action.idle');

module.exports = {
    run: function(creep) {
        ifMineral = mineralNeedsCollect(creep.room);
        creepCarrying = _.sum(creep.carry);

        if (creep.memory.working == true && creepCarrying == 0) {
            creep.memory.working = false;
        }
        else if (creep.memory.working == false && creepCarrying == creep.carryCapacity) {
            creep.memory.working = true;
        }

        if (creep.memory.working == true) { // if filled with energy, transfer to spawn, extensions or towers
            if (creep.carry.energy>0) { // creep is tranfering energy
                creep.say('deli E');
                var structure = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: (s) => (
                    ((s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION || ( s.structureType == STRUCTURE_TOWER && (s.energy < s.energyCapacity*0.7) ) ) && s.energy < s.energyCapacity) || s.structureType == STRUCTURE_NUKER || ( s.structureType == STRUCTURE_TERMINAL && (s.store[RESOURCE_ENERGY] < 5000) )
                    ) })
                if (structure == undefined) { // if spawn extensions or towers are full, go find labs
                  var structure = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: (s) => ( s.structureType == STRUCTURE_LAB && s.energy < s.energyCapacity*0.75) });
                  if (structure == undefined) { //
                      structure = creep.room.storage;
                      if (structure) {
                          if (structure.store[RESOURCE_ENERGY]>0.8*structure.storeCapacity) { // storage is almost full
                              structure = creep.room.terminal;
                          }
                      }
                      else { // storage is not defined, move to centre link point and drop resource
                          /*get imaginaryStorage = Game.flags['link'+creep.room.name];
                          if (creep.pos.getRangeTo(imaginaryStorage)>3) {
                              creep.travelTo(imaginaryStorage);
                          }
                          else {
                              creep.drop(RESOURCE_ENERGY);
                          }*/
                          //actionAvoid.run(creep);
                      }
                  }
                }
                if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) { // transfer energy to storage
                    creep.travelTo(structure);
                }
            }
            else { // if carrying something is not energy
                for (let resourceType in creep.carry) {
                    creep.say('deli '+resourceType);
                    var structure = creep.room.terminal;
                    if (structure == undefined) {
                        structure = creep.room.storage;
                    }
                    if (creep.transfer(structure, resourceType) == ERR_NOT_IN_RANGE) {
                        creep.travelTo(structure);
                    }
                }
            }
        }
        else { // if not working: find a none empty container and get energy from containers //
            if ( (creep.ticksToLive<400) || (ifMineral == undefined) || (ifMineral[0]<500) ) { // creep is getting energy
                creep.say('get E');
                var [resourceID, ifDropped] = evaluateEnergyResources(creep, false, false, true, true); // find energy functoin in myFunctoins
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
                /*let container = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: s => s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] == s.storeCapacity});
                  if (container == undefined) {
                    container = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: s => s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0});
                  }
                  if (container == undefined) {
                      container = creep.room.storage;
                  }
                  if (container != undefined) { // if all containers are 0, take energy from storage
                      if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                          creep.travelTo(container);
                      }
                  }*/
            }
            else { // get minerals
                var resourceType = ifMineral[1];
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
        }
    }
};
