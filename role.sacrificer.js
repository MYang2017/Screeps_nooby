let give = require('action.recycle');

module.exports = {
    run: function(creep) {
        let iffull = creep.store.getFreeCapacity('energy') == 0;
        if (!iffull) { // if not ful take energy
            let stor = creep.room.storage;
            if (stor.store.energy==0) {
                stor = creep.room.terminal;
            }
            if (creep.pos.getRangeTo(stor)>1) {
                creep.travelTo(stor);
            }
            else {
                creep.withdraw(stor, 'energy');
            }
        }
        else { // else if full
            // if not in target
            if (creep.room.name != creep.memory.target) {
                // move to target
                storedTravelFromAtoB(creep, 'l');
            }
            else {// else in target
                // recycle
                give.run(creep);
            }
        }
    }
};
