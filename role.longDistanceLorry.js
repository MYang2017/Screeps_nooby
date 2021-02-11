//var rolePickuper = require('role.pickuper');
var linkEnergyTransferAtHome = require('action.linkEnergyTransferAtHome');
var actionRunAway = require('action.flee');

module.exports = {
    run: function(creep) {
        //console.log(creep.pos,creep.name)
        // repair when walking
        let thingUnderFeet = creep.room.lookForAt(LOOK_STRUCTURES, creep)[0];
        if (thingUnderFeet && thingUnderFeet.structureType == STRUCTURE_ROAD) {
            creep.repair(thingUnderFeet);
        }
        else {
            let thingUnderFeet = creep.room.lookForAt(LOOK_CONSTRUCTION_SITES, creep)[0];
            if (thingUnderFeet) {
                creep.build(thingUnderFeet);
            }
        }

        if ((creep.pos.findInRange(FIND_HOSTILE_CREEPS, 5).length > 0)) { // self destroy if not useful damages by NPC
            actionRunAway.run(creep);
        }
        else {
            creep.say('take away');
            if (creep.memory.working == true && creep.carry.energy == 0) {
                creep.memory.energyTransferCount = 0;
                creep.memory.toCentre = false;
                creep.memory.working = false;
                creep.memory.searchForLink = true;
            }
            else if (creep.memory.working == false && creep.carry.energy == creep.carryCapacity) {
                creep.memory.working = true;
                creep.memory.energyTransferCount = 0;
            }

            if (creep.memory.working == true) {
                if (creep.room.name != creep.memory.home) { // if not at home base
                    //creep.travelTo(Game.flags['link' + creep.memory.home]);
                    creep.travelTo(new RoomPosition(25, 25, creep.memory.home));
                }
                else { // creep at home
                    if (creep.memory.working == true && creep.carry.energy == 0) { // < creep.carryCapacity*0.2) {
                        creep.drop(RESOURCE_ENERGY);
                        creep.memory.working = false;
                    }
                    linkEnergyTransferAtHome.run(creep)
                }
            }
            else { // working is false, take energy
                if (creep.hits< 0.8 * creep.hitsMax) {
                    creep.travelTo(new RoomPosition(25, 25, creep.memory.home));
                }
                else {
                    if (creep.room.name == creep.memory.target) { // if not in target room go to target room, if in:
                        let energy = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {filter: {resourceType: RESOURCE_ENERGY}});
                        if (creep.pickup(energy) == ERR_NOT_IN_RANGE) {
                            creep.travelTo(energy,{maxRooms:1});
                        }
                        else {
                            let container = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: s => s.structureType == STRUCTURE_CONTAINER && (s.store[RESOURCE_ENERGY] > 500)});
                            if (container != undefined) { // if all containers are 0, take energy from storage
                                if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                    creep.travelTo(container,{maxRooms:1});
                                }
                            }
                        }
                    }
                    else {
                        //creep.travelTo(Game.flags[creep.memory.target]);
                        //var exit = creep.room.findExitTo(creep.memory.target);
                        //creep.travelTo(creep.pos.findClosestByRange(exit));
                        creep.travelTo(new RoomPosition(25, 25, creep.memory.target));
                    }
                }
            }
        }
    }
};
