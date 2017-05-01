module.exports = {
    run: function(creep) {
        if (creep.memory.working == true && creep.carry.energy == 0) {
            creep.memory.working = false;
        }
        else if (creep.memory.working == false && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
        }

        if (creep.memory.working == true) {
            var structure = creep.pos.findClosestByRange(FIND_STRUCTURES, { filter: (s) => s.hits < s.hitsMax && s.structureType != STRUCTURE_ROAD && s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART })
            if (structure == undefined) {
                structure = creep.pos.findClosestByRange(FIND_STRUCTURES, { filter: (s) => s.hits < s.hitsMax && s.structureType == STRUCTURE_ROAD && s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART})
            }
            if (structure != undefined) {
                if (creep.repair(structure) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(structure);
                }
            }
            else {
                //roleLongDistanceHarvester.run(creep);
            }
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
