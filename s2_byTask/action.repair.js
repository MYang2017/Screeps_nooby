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
                if (creep.repair(structure) == ERR_NOT_IN_RANGE) {
                    creep.travelTo(structure, { maxRooms: 1 });
                }
                if (structure.hits > 0.95 * structure.hitsMax) { // if structure is healthy, find another to repair
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
