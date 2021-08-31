var actionUpgrade = require('action.upgradeController');

module.exports = {
    run: function(creep) {
        let room = creep.room;
        if (room.memory.toRepairId) {
            let structure = Game.getObjectById(room.memory.toRepairId);
            if (structure == null) {
                delete room.memory.toRepairId;
            }
            else {
                if (creep.pos.getRangeTo(structure)>3) {
                    creep.travelTo(structure, { maxRooms: 1 });
                }
                else {
                    creep.repair(structure);
                    if (creep.pos.findInRange(FIND_MY_CREEPS, 1).length>1) {
                        let thingUnderFeet = creep.room.lookForAt(LOOK_STRUCTURES, creep)[0];
                        if (thingUnderFeet && thingUnderFeet.structureType && thingUnderFeet.structureType == STRUCTURE_ROAD) {
                            creep.move(getRandomInt(1, 8));
                        }
                    }
                }
                if (structure.hits > 0.20 * structure.hitsMax) { // if structure is healthy, find another to repair
                    if (cacheContainerOrRoadToBuild(room,0.8,1)==undefined) { // if not found anything to repair
                      actionUpgrade.run(creep);
                    }
                }
            }
        }
        else { // no repair ID cached yet, cache road or container ID to repaire
            if (cacheContainerOrRoadToBuild(room,0.8,1)==undefined) { // if not found anything to repair
              actionUpgrade.run(creep);
            }
        }
    }
};
