var actionGetEnergy = require('action.getEnergy');
var actionUpgrade = require('action.upgradeController');
var actionBuild = require('action.build');
var actionFillEnergy = require('action.fillEnergy');
var evac = require('action.evacuate');

module.exports = {
    run: function(creep) {
        creep.say('upgrading');
        
        if (evac.run(creep)) {
            return
        }
        else {
        
            if (creep.memory.working == true && creep.carry.energy == 0) {
                creep.memory.working = false;
            }
            else if (creep.memory.working == false && creep.carry.energy > 0.8 * creep.carryCapacity) {
                creep.memory.working = true;
            }
    
            if (creep.memory.target != undefined && creep.room.name != creep.memory.target) {
               creep.moveTo(Game.flags[creep.memory.target]);
            }
            else {
                if (creep.memory.working == true) {
                    if ((ifConstructionSiteInRoom(creep.room) || (creep.room.memory.forSpawning && creep.room.memory.forSpawning.roomCreepNo && creep.room.memory.forSpawning.roomCreepNo.minCreeps.superUpgrader > 0)) && ((creep.room.controller && (creep.room.controller.progress<creep.room.controller.progressTotal) )&&(creep.room.controller && creep.room.controller.ticksToDowngrade && creep.room.controller.ticksToDowngrade>3333))) {
                        actionBuild.run(creep);
                    }
                    else {
                        if ( (creep.room.find(FIND_MY_CREEPS, { filter: c => c.memory.role == 'miner'}).length == 0) && creep.memory.role != 'pioneer' ) {
                            if (creep.room.name == creep.memory.target) { // if in target room work
                                if (creep.room.energyAvailable == creep.room.energyCapacityAvailable) {
                                    actionUpgrade.run(creep);
                                    return
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
                        }
                    }
                }
                else {
                    actionGetEnergy.run(creep);
                }
            }
        }
    }
};
