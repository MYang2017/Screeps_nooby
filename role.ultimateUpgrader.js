//var actionUpgrade = require('action.upgradeController');

module.exports = {
    run: function(creep) {
        creep.say('💕', true);
        if (!creep.memory.boosted&&creep.ticksToLive>1400) { // if creep is not boosted, find a lab to boost
            creep.say('get boosted');
            if (creep.room.memory.upgradeLabId) {
                let upgradeLab = Game.getObjectById(creep.room.memory.upgradeLabId);
                if (upgradeLab.mineralAmount>30) {
                    if ( creep.pos.getRangeTo(upgradeLab) > 1 ) {
                        creep.travelTo(upgradeLab);
                    }
                    else {
                        if (upgradeLab.boostCreep(creep) == 0||upgradeLab.boostCreep(creep) == -6) {
                            creep.memory.boosted = true;
                        }
                    }
                }
                else {
                    creep.memory.boosted = true;
                }
            }
            else { // not upgrader boosting lab, go straight to upgrading
               creep.memory.boosted=true;
            }
        }
        else {
            let posTobe = Game.flags['up'+creep.room.name];
            if (creep.memory.suckFromID == undefined) {
                let suckFrom;
                if (Game.flags['upLink'+creep.room.name]) {
                    suckFrom = Game.flags['upLink'+creep.room.name].pos.findInRange(FIND_STRUCTURES, 1, {filter: s => s.structureType == STRUCTURE_LINK})[0];
                }
                else {
                    let storage = creep.room.storage;
                    if (posTobe.pos.getRangeTo(storage) == 1) {
                        suckFrom = storage;
                    }
                    else {
                        let terminal = creep.room.terminal;
                        if (posTobe.pos.getRangeTo(terminal) == 1) {
                            suckFrom = terminal;
                        }
                    }
                }
                creep.memory.suckFromID = suckFrom.id;
            }
            else {
                let suckFrom = Game.getObjectById(creep.memory.suckFromID);
                if (creep.pos.isEqualTo(posTobe)) {
                    creep.withdraw(suckFrom, RESOURCE_ENERGY);
                    creep.upgradeController(creep.room.controller);
                    //actionUpgrade.run(creep);
                }
                else {
                    creep.moveTo(posTobe);
                }
            }
        }
    }
};
