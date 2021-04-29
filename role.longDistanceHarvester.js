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
        let underAttack = creep.memory.underAttack;
        if (underAttack && Game.tick < underAttack) {
            if (creep.room.name != creep.room.home) {
                creep.moveTo(new RoomPosition(25, 25, creep.memory.home));
            }
            else {
                actionBuild.run(creep);
            }
 
        }
        else {
            let enemy = creep.room.find(FIND_HOSTILE_CREEPS);
            if (enemy && enemy.length > 0) {
                creep.memory.underAttack = Game.tick + 1456;
            }
            else {
                creep.memory.underAttack = undefined;
            }

            if (creep.memory.working == true && creep.carry.energy == 0) {
                creep.memory.working = false;
            }
            else if (creep.memory.working == false && creep.carry.energy == creep.carryCapacity) {
                creep.memory.working = true;
            }

            if (creep.memory.working == true) { // if working act as upgrader
                if (creep.room.name == creep.memory.home) {
                    /*let hunger = creep.room.lookForAtArea(LOOK_CREEPS, Math.max(0,creep.pos.y-2), Math.max(0, creep.pos.x-2), Math.min(creep.pos.y+2,49), Math.min(49, creep.pos.x+2), true);
                    if (hunger.length>0 && hunger[0]['creep']) {
                        let toCreep = Game.getObjectById(hunger[0]['creep']['id']);
                        if (toCreep.getActiveBodyparts(CARRY)>0) {
                            if (creep.transfer(toCreep, 'energy') == ERR_NOT_IN_RANGE) {
                                creep.moveTo(toCreep);
                                return
                            }
                        }
                        
                    }*/
                    
                    if (creep.room.energyAvailable < 0.3 * creep.room.energyCapacityAvailable) { // need to fill
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
                    creep.travelTo(new RoomPosition(25, 25, creep.memory.home));
                    //var exit = creep.room.findExitTo(creep.memory.home);
                    //creep.moveTo(creep.pos.findClosestByRange(exit));
                }
            }
            else { // working is false, find energy
                if (creep.room.name == creep.memory.home) {
                    creep.travelTo(new RoomPosition(25, 25, creep.memory.target));
                }
                else {
                    const target = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
                    if(target) {
                        if(creep.harvest(target) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(target);
                        }
                    }
                }
            }
        }
      }
    //}
};
