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
                var structure = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: (s) => ( (s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION || s.structureType == STRUCTURE_TOWER) && s.energy < s.energyCapacity) })
                if (structure == undefined) { // if spawn extensions or towers are full, go find storage
                    structure = creep.room.storage;
                }
                if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) { // transfer energy to storage
                    creep.moveTo(structure);
                }
            }
            else { // if carrying something is not energy
                var resourceType = ifMineral[1];
                creep.say('deli '+resourceType);
                var structure = creep.room.storage;
                if (creep.transfer(structure, resourceType) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(structure);
                }
            }
        }
        else { // if not working: find a none empty container and get energy from containers //
            if ( (ifMineral == undefined) || (ifMineral[0]<500) ) { // creep is getting energy
                creep.say('get E');
                let container = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: s => s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] == s.storeCapacity});
                  if (container == undefined) {
                    container = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: s => s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0});
                  }
                  if (container == undefined) {
                      container = creep.room.storage;
                  }
                  if (container != undefined) { // if all containers are 0, take energy from storage
                      if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                          creep.moveTo(container);
                      }
                  }
            }
            else { // get minerals
                var resourceType = ifMineral[1];
                creep.say('get '+resourceType);
                let container = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: s => s.structureType == STRUCTURE_CONTAINER && s.store[resourceType] > 0});
                if (container != undefined) { // if all containers are 0, take energy from storage
                    if (creep.withdraw(container, resourceType) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(container);
                    }
                }
            }
        }
    }
};
