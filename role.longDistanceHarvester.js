var rolePioneer = require('role.pioneer');
var roleHarvester = require('role.harvester');
var actionBuild = require('action.build');
var actionUpgradeController = require('action.upgradeController');
module.exports = {
    run: function(creep) {
      /*if (Game.rooms[creep.memory.target].memory.ifPeace == false) { // room under attack, run away
         creep.say('run away');
         creep.moveTo(Game.flags[creep.memory.target+'_shelter'].pos);
      }
      else {*/
        if (creep.memory.working == true && creep.carry.energy == 0) {
            creep.memory.working = false;
        }
        else if (creep.memory.working == false && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
        }

        if (creep.memory.working == true) { // if working act as upgrader
            if (creep.room.name == creep.memory.home) {
                if (creep.room.energyAvailable < creep.room.energyCapacityAvailable) { // need to fill
                    roleHarvester.run(creep);
                }
                else {
                    if (ifConstructionSiteInRoom(creep.room)) {
                        actionBuild.run(creep);
                    }
                    else {
                        if (creep.room.storage) {
                            if (creep.transfer(creep.room.storage, 'energy') == ERR_NOT_IN_RANGE) {
                                creep.travelTo(creep.room.storage);
                            }
                        }
                        else {
                            actionUpgradeController.run(creep);
                        }
                    }
                }
            }
            else {
                creep.travelTo(new RoomPosition(25,25, creep.memory.home));
                //var exit = creep.room.findExitTo(creep.memory.home);
                //creep.moveTo(creep.pos.findClosestByRange(exit));
            }
        }
        else { // working is false, find energy
            rolePioneer.run(creep);
        }
      }
    //}
};
