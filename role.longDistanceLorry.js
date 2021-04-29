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

        if ((creep.pos.findInRange(FIND_HOSTILE_CREEPS, 5, {filter: c=> (c.getActiveBodyparts(ATTACK)+c.getActiveBodyparts(RANGED_ATTACK)>0)}).length > 0)) { // self destroy if not useful damages by NPC
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
                        let jobIdToDo = creep.memory.toGetId;
                        let resType = creep.memory.resType;
                        if (!resType) {
                            delete creep.memory.toGetId;
                        }
                        if (jobIdToDo) {
                            let resObj = Game.getObjectById(jobIdToDo);
                            if (resObj) { // if the resource is still there (not decayed)
                                if (resType == 't') {
                                    for (let mineralType in resObj.store) {
                                        if (creep.withdraw(resObj, mineralType) == ERR_NOT_IN_RANGE) {
                                            creep.travelTo(resObj, { maxRooms: 1 });
                                        }
                                    }
                                    if (!resObj || _.sum(resObj.store) == 0) {
                                        creep.memory.toGetId = undefined;
                                        creep.memory.resType = undefined;
                                    }
                                }
                                else if (resType == 'd') {
                                    if (creep.pickup(resObj) == ERR_NOT_IN_RANGE) {
                                        creep.travelTo(resObj, { maxRooms: 1 });
                                    }
                                    if (!resObj) {
                                        creep.memory.toGetId = undefined;
                                        creep.memory.resType = undefined;
                                    }
                                }
                                else if (resType == 'c') {
                                    if (!resObj || _.sum(resObj.store) < 100) {
                                        creep.memory.toGetId = undefined;
                                        creep.memory.resType = undefined;
                                    }
                                    else {
                                        for (let mineralType in resObj.store) {
                                            if (creep.withdraw(resObj, mineralType) == ERR_NOT_IN_RANGE) {
                                                creep.travelTo(resObj, { maxRooms: 1 });
                                                creep.room.memory.resMem[jobIdToDo].resAmount = _.sum(resObj.store);
                                            }
                                        }
                                    }
                                }
                            }
                            else {
                                creep.memory.toGetId = undefined;
                                creep.memory.resType = undefined;
                            }
                        }
                        else { // does not have job to do but entred the room, avoid standing on edge
                            creep.travelTo(new RoomPosition(25, 25, creep.memory.target), { maxRooms: 1 });
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
