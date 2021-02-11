var roleBuilder = require('role.builder');
var roleUpgrader = require('role.upgrader')
var actionRunAway = require('action.flee');
//var actionHarvestE = require('action.getEnergy');
var roleHarvester = require('role.harvester');
var fillE = require('action.fillEnergy');

module.exports = {
    run: function(creep) {
        creep.say('pioneering');
        if (creep.hits < creep.hitsMax) {
            creep.travelTo(new RoomPosition(25, 25, creep.memory.home));
        }
        else {
            if (creep.pos.findInRange(FIND_HOSTILE_CREEPS, 3).length > 0) { // self destroy if not useful damages by NPC
                actionRunAway.run(creep)
            }
            else {
                if (creep.room.name != creep.memory.target) { // if not in target room yet
                    if (creep.memory.route) { // if there is a stored intermediate route, follow the route
                        let route = creep.memory.route;
                        if (creep.memory.intermediate == undefined) {
                            creep.memory.intermediate = route[creep.room.name];
                        }
                        else if (creep.room.name != creep.memory.intermediate) {
                            creep.travelTo(new RoomPosition(25, 25, creep.memory.intermediate));
                        }
                        else if ((creep.room.name == creep.memory.intermediate)) {
                            creep.memory.intermediate = route[creep.room.name];
                        }
                    }
                    else { // if there is not a stored route, do normal
                        if (creep.memory.workingPos) { // if stored target position
                            creep.travelTo(new RoomPosition(creep.memory.workingPos.x, creep.memory.workingPos.y, creep.memory.target));
                        }
                        else {
                            creep.travelTo(new RoomPosition(25, 25, creep.memory.target));
                        }
                    }
                }
                else { // if in target room
                    //console.log(!ifWaitForRenew(creep))
                    if (!ifWaitForRenew(creep)) {
                        if (creep.memory.role == 'longDistanceHarvester' && creep.memory.working == true) {
                            creep.travelTo(new RoomPosition(25, 25, creep.memory.home));
                        }
                        else {
                            if (creep.getActiveBodyparts(WORK) > 20) {
                                creep.memory.working = false;
                                creep.memory.role = 'superUpgrader';
                            }

                            if (creep.room.energyAvailable<creep.room.energyCapacityAvailable) {
                                roleHarvester.run(creep);
                            }
                            else if (ifConstructionSiteInRoom(creep.room) || (creep.room.controller == undefined) || (creep.room.controller.level < 1)) { // if there is still construction sites (globally, which is bad, need change)
                                roleBuilder.run(creep);
                                //actionHarvestE.run(creep);
                            }
                            else {
                                roleUpgrader.run(creep);
                            }
                        }
                    }
                    else {
                        creep.travelTo(creep.room.find(FIND_STRUCTURES, { filter: s => s.structureType == STRUCTURE_SPAWN })[0]);
                    }
                }
            }
        }
    }
};

/*if ((creep.room.name == creep.memory.home) && (creep.carry.energy < creep.carryCapacity)){ // if just borned, take some energy
  var structure = creep.room.storage;
  if (creep.withdraw(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      creep.travelTo(structure);
  }
}
else */
