module.exports = {
    run: function(creep) {
        if (creep.carry.energy>0) {
            let toFill = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: (s) => ( (s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION || ( s.structureType == STRUCTURE_TOWER && (s.energy < s.energyCapacity*0.7) ) || s.structureType == STRUCTURE_LAB) && s.energy < s.energyCapacity) })
            if (toFill == undefined) {
                toFill = creep.room.storage;
            }
            if (creep.transfer(toFill, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.travelTo(toFill);
            }
        }
        else {
            let toFill = creep.room.storage;
            for(const resourceType in creep.carry) {
                if (creep.transfer(toFill, resourceType) == ERR_NOT_IN_RANGE) {
                    creep.travelTo(toFill);
                }
            }
        }
    }
};
