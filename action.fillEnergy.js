module.exports = {
    run: function(creep) {
        if (creep.memory.working == true) {
                for (const resourceType in creep.carry) {
                    if (resourceType == RESOURCE_ENERGY) { // carrying energy
                        var structure = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: (s) => ((s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION || (s.structureType == STRUCTURE_TOWER && (s.energy < s.energyCapacity * 0.7)) || s.structureType == STRUCTURE_LAB) && s.energy < s.energyCapacity) })
                        if (structure == undefined) {
                            structure = creep.room.storage;
                            if (structure) {
                                if (structure.store[RESOURCE_ENERGY] > 0.8 * structure.storeCapacity) { // storage is almost full
                                    structure = creep.room.terminal;
                                }
                            }
                            else {
                                // storage is not defined, move to centre link point and drop resource
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
                        var structure = creep.room.terminal;
                        if (structure == undefined || _.sum(structure.store) > 250000) {
                            structure = creep.room.storage;
                            if (structure == undefined) {
                                creep.memory.working = false; // no storage or terminal build yet, fuck minerals
                            }
                        }
                        if (creep.transfer(structure, resourceType) == ERR_NOT_IN_RANGE) {
                            creep.travelTo(structure);
                        }
                  }
            }
        }
    }
};
