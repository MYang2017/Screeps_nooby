module.exports = {
    run: function(creep) {
        if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
            creep.travelTo(creep.room.controller,{restrictDistance:1});
            //creep.upgradeController(creep.room.controller);
        }
        let storage = creep.room.storage;
        if (storage) { // if storge is defined and next to upgrader, take resource
            if (creep.pos.getRangeTo(storage) == 1) {
                creep.withdraw(storage, RESOURCE_ENERGY);
            }
        }
    }
};
