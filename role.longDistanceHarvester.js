<<<<<<< HEAD
var rolePioneer = require('role.pioneer');
var roleHarvester = require('role.harvester');
var actionBuild = require('action.build');
var actionUpgradeController = require('action.upgradeController');
var avoidd = require('action.idle')
var actionPassE = require('action.passEnergy');
var actionGetEnergy = require('action.getEnergy');

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
                creep.moveTo(new RoomPosition(25, 25, creep.memory.home), {range: 10});
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
                    actionPassE.run(creep);
                    if (creep.room.find(FIND_MY_CREEPS).length<=3) {
                        roleHarvester.run(creep);
                    }
                    else {
                        if (ifConstructionSiteInRoom(creep.room)) {
                            actionBuild.run(creep);
                        }
                        else {
                            // fill logic
                            // upgrade container
                            let conts = creep.room.find(FIND_STRUCTURES, {filter: o=>o.structureType==STRUCTURE_CONTAINER});
                            for (let cont of conts) {
                                if ((cont.pos.findInRange(FIND_STRUCTURES, 3, {filter: o=>o.structureType == STRUCTURE_CONTROLLER}).length>0) &&
                                    (cont.pos.findInRange(FIND_SOURCES, 1).length==0)) {
                                        
                                    let transState = creep.transfer(cont, 'energy');
                                    if (transState == ERR_NOT_IN_RANGE) {
                                        creep.travelTo(cont);
                                    }
                                    else if (cont.store.energy>1800) {
                                        actionUpgradeController.run(creep);
                                    }
                                    return
                                }
                            }
                            actionUpgradeController.run(creep);
                        }
                    }
                }
                else {
                    creep.travelTo(new RoomPosition(25, 25, creep.memory.home), {range: 10});
                    //var exit = creep.room.findExitTo(creep.memory.home);
                    //creep.moveTo(creep.pos.findClosestByRange(exit));
                }
            }
            else { // working is false, find energy
                if (creep.room.name == creep.memory.home) {
                    creep.travelTo(new RoomPosition(25, 25, creep.memory.target), {range: 10});
                }
                else if (creep.room.name == creep.memory.target) {
                    let ctn = creep.room.find(FIND_STRUCTURES, {filter: t=>t.structureType == STRUCTURE_CONTAINER && t.store.energy>0});
                    if (ctn.length>0) {
                        if (creep.pos.getRangeTo(ctn[0])>1) {
                            creep.travelTo(ctn[0]);
                        }
                        else {
                            creep.withdraw(ctn[0], 'energy');
                        }
                        return
                    }
                    actionGetEnergy.run(creep);
                    /*
                    let energyResources = creep.room.find(FIND_SOURCES)
                    let energySource = creep.pos.findClosestByPath(FIND_SOURCES);// find closest energy source
                    let goToId = undefined;
                    if (energyResources.length>1) { // 2 source room
                        if (energySource) {
                            if (((energySource.energy>0)&&(ifSurrounded(energySource) == null)&&(creep.pos.getRangeTo(energySource)>1))||(energySource.energy==0)) { // if full
                                let indexOfCurrent = energyResources.indexOf(energySource); // go to the other one
                                goToId = energyResources[1-indexOfCurrent].id;
                            }
                            else { // not full go to the nearest one
                                goToId = energySource.id;
                            }
                        }
                    }
                    else { // 1 source room
                        if (energySource) {
                            if (((energySource.energy>0)&&(ifSurrounded(energySource) == null)&&(creep.pos.getRangeTo(energySource)>1))||(energySource.energy==0)) { // if full
                                goToId = undefined;
                            }
                            else {
                                goToId = energySource.id;
                            }
                        }
                    }
                    
                    if (goToId) {
                        let tar = Game.getObjectById(goToId)
                        if(creep.harvest(tar) == ERR_NOT_IN_RANGE) {
                            creep.travelTo(tar, {maxRooms: 1});
                        }
                    }
                    else {
                        avoidd.run(creep);
                    }
                    */
                }
                else {
                    creep.travelTo(new RoomPosition(25, 25, creep.memory.target), {range: 10});
                }
            }
        }
      }
    //}
};
=======
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
>>>>>>> master
