var rolePickuper = require('role.pickuper');

module.exports = {
    run: function(creep) {
        creep.say('linking');
        if (creep.memory.working == true && _.sum(creep.carry) == 0) {
            creep.memory.working = false;
        }
        else if ( creep.memory.working == false && _.sum(creep.carry) > 0) {//} == creep.carryCapacity ) {
            creep.memory.working = true;
        }

        if (creep.memory.working == true) { // put energy into structures
          for(const resourceType in creep.carry) {
            if (resourceType==RESOURCE_ENERGY) { // carrying energy
              var structure = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: (s) => ( (s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION || s.structureType == STRUCTURE_NUKER) && s.energy < s.energyCapacity) })
              if (structure == undefined) {
                  structure = creep.room.storage;
                  if (structure.store[RESOURCE_ENERGY]>0.8*structure.storeCapacity) { // storage is almost full
                      structure = creep.room.terminal;
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
        else { // get energy from link
            let link = Game.flags['link'+creep.room.name].pos.findInRange(FIND_STRUCTURES, 1, {filter: s => s.structureType == STRUCTURE_LINK})[0];
            if (link.energy == 0) {
                //rolePickuper.run(creep);
            }
            else {
              //console.log(creep.withdraw(link, RESOURCE_ENERGY))
                if (creep.withdraw(link, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.travelTo(link);
                }
            }
        }

        // re-spawn creep in advance
        if (creep.ticksToLive == creep.memory.spawnTime) {
            creep.room.memory.forSpawning.spawningQueue.push({memory:{energy: 1200, role: 'linkKeeper'},priority: 10});
            console.log('respawn linkKeeper in advance');
        }
    }
};
