module.exports = {
    run: function(creep) {
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
              var structure = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: (s) => ( (s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION || s.structureType == STRUCTURE_TOWER) && s.energy < s.energyCapacity) })
              if (structure == undefined) {
                  structure = creep.room.storage;
              }
              if (creep.transfer(structure, resourceType) == ERR_NOT_IN_RANGE) {
                  creep.moveTo(structure);
              }
            }
            else { // carrying minerals
              var structure = creep.room.storage;
              if (creep.transfer(structure, resourceType) == ERR_NOT_IN_RANGE) {
                  creep.moveTo(structure);
              }
            }
          }
        }
        else {
            var [resourceID, ifDropped] = evaluateEnergyResources(creep, true, false, true, true); // find energy functoin in myFunctoins
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
        }
    }
};
