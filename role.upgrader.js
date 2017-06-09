var actionGetEnergy = require('action.getEnergy');
var actionUpgrade = require('action.upgradeController');
var actionBuild = require('action.build');

module.exports = {
    run: function(creep) {
        creep.say('upgrading');
        if (creep.memory.working == true && creep.carry.energy == 0) {
            creep.memory.working = false;
        }
        else if (creep.memory.working == false && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
        }

        if (creep.memory.target != undefined && creep.room.name != creep.memory.target) {
           creep.moveTo(Game.flags[creep.memory.target]);
        }
        else {
            if (creep.memory.working == true) {
                if ( ifConstructionSiteInRoom(creep.room) ) {
                    actionBuild.run(creep);
                }
                else {
                    actionUpgrade.run(creep);
                    if ((creep.room.controller.level>=5)&&(_.sum(creep.room.find(FIND_MY_CREEPS, {filter:s=>s.role=='linkKeeper'}))==0)) {
                        let link = creep.pos.findInRange(FIND_STRUCTURES, 1, { filter: s => s.structureType == STRUCTURE_LINK})[0];
                        creep.withdraw(link, RESOURCE_ENERGY)
                    }
                }
            }
            else {
                actionGetEnergy.run(creep);
            }
        }
    }
};
