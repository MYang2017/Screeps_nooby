module.exports = {
    run: function(creep) {
        var [resourceID, ifDropped] = evaluateEnergyResources(creep, true, true, true, true); // find energy function in myFunctoins
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
        else { // room level too low, go for resources
          if (creep.harvest(Game.getObjectById(ifDropped)) == ERR_NOT_IN_RANGE) {
              creep.travelTo(Game.getObjectById(ifDropped));
          }
        }
    }
};
