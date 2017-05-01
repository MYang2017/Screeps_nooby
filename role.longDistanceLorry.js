var rolePickuper = require('role.pickuper');

module.exports = {
    run: function(creep) {
        creep.say('take away');
        if (creep.memory.working == true && creep.carry.energy == 0) {
            creep.memory.working = false;
        }
        else if (creep.memory.working == false && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
        }

        if (creep.memory.working == true) {
            if (creep.room.name != creep.memory.home) { // if not at home base
                creep.moveTo(new RoomPosition(25,25, creep.memory.home));
            }
            else { // creep at home
                var structure = Game.flags['link'+creep.memory.target].pos.findInRange(FIND_STRUCTURES, 1, {filter: s => s.structureType == STRUCTURE_LINK})[0];
                if (structure.energy<structure.energyCapacity) { // link is not full
                    var linkSpace = structure.energyCapacity-structure.energy;
                    if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(structure);
                    }
                    /*if ( (structure.energy<structure.energyCapacity)&&(creep.carry.energy<creep.carryCapacity) ) { // link is still not full and creep still has space
                        var container = Game.flags['link'+creep.memory.target].pos.findInRange(FIND_STRUCTURES, 1, {filter: s => s.structureType == STRUCTURE_CONTAINER})[0];
                        if (container.store.energy >= linkSpace) {// if container has the energy to fillin the link shortage getActiveBodyparts
                          if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                              creep.moveTo(container);
                          }
                          if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                              creep.moveTo(structure);
                          }
                        }
                    }*/
                }
                else { // link is full
                    // find the resevoir container
                    structure = Game.flags['link'+creep.memory.target].pos.findInRange(FIND_STRUCTURES, 1, {filter: s => s.structureType == STRUCTURE_CONTAINER})[0];
                    if (structure.store[RESOURCE_ENERGY]<structure.storeCapacity) { // resevoir container is not full
                        if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(structure);
                        }
                    }
                    else { // resevoir is full
                        structure = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: (s) => ( (s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION || s.structureType == STRUCTURE_TOWER) && s.energy < s.energyCapacity) })
                        if (structure == undefined) { // cannot find spawn or extensions or tower or they are full, find the storage
                            structure = creep.room.storage;
                        }
                    }
                    if (structure != undefined) { // if a structure is found go there and transfer energy
                        if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(structure);
                        }
                    }
                }
            }
        }
        else {
            if (creep.room.name == creep.memory.target) { // if not in target room go to target room, if in:
                let energy = creep.pos.findClosestByRange(FIND_DROPPED_ENERGY, {filter: s => s.energy>100} );
                if (creep.pickup(energy) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(energy);
                }
                else {
                    let container = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: s => s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 800});
                    if (container != undefined) { // if all containers are 0, take energy from storage
                        if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(container);
                        }
                    }
                }
            }
            else {
                creep.moveTo(new RoomPosition(25,25, creep.memory.target));
                //var exit = creep.room.findExitTo(creep.memory.target);
                //creep.moveTo(creep.pos.findClosestByRange(exit));
            }
        }
    }
};
