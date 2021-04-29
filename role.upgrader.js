var actionGetEnergy = require('action.getEnergy');
var actionUpgrade = require('action.upgradeController');
var actionBuild = require('action.build');
var actionFillEnergy = require('action.fillEnergy');

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
                if (ifConstructionSiteInRoom(creep.room) || creep.room.memory.forSpawning.roomCreepNo.minCreeps.superUpgrader > 0) {
                    actionBuild.run(creep);
                }
                else {
                    if ( (creep.room.find(FIND_MY_CREEPS, { filter: c => c.memory.role == 'pickuper' || c.memory.role == 'harvester' || c.memory.role == 'lorry' }).length == 0) && creep.memory.role != 'pioneer' ) {
                        if (creep.room.name == creep.memory.target) { // if in target room work
                            if (creep.room.energyAvailable == creep.room.energyCapacityAvailable) {
                                actionUpgrade.run(creep);
                            }
                            else {
                                creep.say('temp recycling');
                                actionFillEnergy.run(creep);
                            }
                        }
                        else { // not at home
                            creep.travelTo(new RoomPosition(25, 25, creep.memory.target));
                        }
                    }
                    else {
                        actionUpgrade.run(creep);
                        if ((creep.room.controller.level >= 5) && (_.sum(creep.room.find(FIND_MY_CREEPS, { filter: s => s.role == 'linkKeeper' })) == 0)) {
                            let link = creep.pos.findInRange(FIND_STRUCTURES, 1, { filter: s => s.structureType == STRUCTURE_LINK })[0];
                            creep.withdraw(link, RESOURCE_ENERGY)
                        }
                    }
                }
            }
            else {
                actionGetEnergy.run(creep);
            }
        }
    }
};
