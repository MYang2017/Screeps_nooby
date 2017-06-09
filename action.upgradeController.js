module.exports = {
    run: function(creep) {
        if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
            creep.travelTo(creep.room.controller);
            //creep.upgradeController(creep.room.controller);
        }
        /*if (creep.signController(creep.room.controller, 'Territory of the Twilight Kingdoms of the East') == ERR_NOT_IN_RANGE) {
            creep.travelTo(creep.room.controller);
        }*/
    }
};
