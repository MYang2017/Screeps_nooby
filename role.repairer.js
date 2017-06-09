var actionRepair = require('action.repair');

module.exports = {
    run: function(creep) {
        if (creep.memory.working == true && creep.carry.energy == 0) {
            creep.memory.working = false;
        }
        else if (creep.memory.working == false && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
        }

        if (creep.memory.working == true) {
            actionRepair.run(creep);
        }
        else {
          var [resourceID, ifDropped] = evaluateEnergyResources(creep, true, true, true, true); // find energy function in myFunctoins
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
                creep.moveTo(Game.getObjectById(ifDropped));
            }
          }
        }
    }
};
