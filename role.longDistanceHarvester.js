module.exports = {
    run: function(creep) {
        if (creep.memory.working == true && creep.carry.energy == 0) {
            creep.memory.working = false;
        }
        else if (creep.memory.working == false && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
        }

        if (creep.memory.working == true) {
            if (creep.room.name == creep.memory.home) {
                var structure = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: (s) => ( (s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION || s.structureType == STRUCTURE_TOWER) && s.energy < s.energyCapacity) })
                if (structure == undefined) {
                    structure = creep.room.storage;
                }
                if (structure == undefined) {
                    structure = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: s => s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0});
                }
                if (structure != undefined) {
                    if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(structure);
                    }
                }
            }
            else {
                creep.moveTo(new RoomPosition(25,25, creep.memory.home));
                //var exit = creep.room.findExitTo(creep.memory.home);
                //creep.moveTo(creep.pos.findClosestByRange(exit));
            }
        }
        else {
            if (creep.room.name == creep.memory.target) {
                var source = creep.room.find(FIND_SOURCES)[creep.memory.sourceIndex];
                if (source == undefined) {
                    source = creep.room.storage;
                }
                if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source);
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