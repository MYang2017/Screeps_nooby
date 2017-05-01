module.exports = {
    run: function(creep) {
        creep.say('upgrading');
        if (creep.memory.working == true && creep.carry.energy == 0) {
            creep.memory.working = false;
        }
        else if (creep.memory.working == false && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
        }

        if (creep.memory.working == true) {
            //if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
                creep.upgradeController(creep.room.controller);
            //}
        }
        else {
          var [resourceID, ifDropped] = evaluateEnergyResources(creep, true, true, true, true); // find energy functoin in myFunctoins
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
