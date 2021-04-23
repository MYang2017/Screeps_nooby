var getE = require('action.getEnergy');

module.exports = {
    run: function(creep) {
        let upRes = creep.upgradeController(creep.room.controller);
        if ( upRes== ERR_NOT_IN_RANGE) {
            creep.travelTo(creep.room.controller, {restrictDistance:1, maxRooms: 1});
            //creep.upgradeController(creep.room.controller);
            return
        }
        else if (upRes==OK) {
            let thingUnderFeet = creep.room.lookForAt(LOOK_STRUCTURES, creep)[0];
            if (thingUnderFeet && thingUnderFeet.structureType && thingUnderFeet.structureType == STRUCTURE_ROAD) {
                creep.moveTo(creep.room.controller);
            }
            return
        }
        let storage = creep.room.storage;
        if (storage) { // if storge is defined and next to upgrader, take resource
            if (creep.pos.getRangeTo(storage) == 1) {
                creep.withdraw(storage, RESOURCE_ENERGY);
            }
        }
        else {
            getE.run(creep);
        }
        
    }
};
