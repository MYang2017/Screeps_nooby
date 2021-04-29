var roleBuilder = require('role.builder');
var actionAvoid = require('action.idle');

module.exports = {
    run: function(creep) {
        creep.say('wall...');
        if (creep.room.name != creep.memory.target) {
            creep.travelTo(new RoomPosition(25, 25, creep.memory.target));
        }
        else {
            if (creep.memory.working == true && creep.carry.energy == 0) {
                creep.memory.working = false;
            }
            else if (creep.memory.working == false && creep.carry.energy == creep.carryCapacity) {
                creep.memory.working = true;
            }

            if (creep.memory.working == true) {
                let endangeredRampart = creep.room.find(FIND_MY_STRUCTURES, { filter: s => (s.structureType == STRUCTURE_RAMPART) && (s.hits < 2000) });
                if (endangeredRampart.length > 0) { // if any rampart less than 100, repair with priority
                    //console.log(creep.repair(endangeredRampart[0]) == ERR_NOT_IN_RANGE)
                    if (creep.repair(endangeredRampart[0]) == ERR_NOT_IN_RANGE) {
                        creep.travelTo(endangeredRampart[0], { maxRooms: 1 });
                        //creep.repair(target)
                    }
                    else {
                        actionAvoid.run(creep);
                    }
                }
                else { // if all rampart safe find rampart constructionsite
                    let rampartConstructionSite = creep.room.find(FIND_MY_CONSTRUCTION_SITES, { filter: { structureType: STRUCTURE_RAMPART } });
                    if (rampartConstructionSite.length > 0) { // if any rampart construction site, build
                        if (creep.build(rampartConstructionSite[0]) == ERR_NOT_IN_RANGE) {
                            creep.travelTo(rampartConstructionSite[0], { maxRooms: 1 });
                            //creep.build(constructionSite);
                        }
                    }
                    else { // cannot find rampart constructionsite, repair normally
                        let wallRampartToRepair = Game.rooms[creep.room.name].memory.toRepairWallOrRampartId;
                        if (wallRampartToRepair == undefined) {
                            Game.rooms[creep.room.name].memory.toRepairWallOrRampartId = whichWallAndRampartToBuild(creep.room).id;
                        }
                        else {
                            var target = Game.getObjectById(Game.rooms[creep.room.name].memory.toRepairWallOrRampartId);
                            if (Game.time % 500 == 0) {
                                Game.rooms[creep.room.name].memory.toRepairWallOrRampartId = whichWallAndRampartToBuild(creep.room).id;
                            }
                            if (target != undefined) {
                                //console.log(creep.room.name,target);
                                if (creep.repair(target) == ERR_NOT_IN_RANGE) {
                                    creep.travelTo(target, { maxRooms: 1 });
                                    //creep.repair(target)
                                }
                                else {
                                    actionAvoid.run(creep);
                                }
                            }
                            else {
                                roleBuilder.run(creep);
                            }
                        }
                    }
                }
            }
            else {
                let ifShooterRoom = creep.room.memory.startMB;
                if (ifShooterRoom && creep.room.terminal) {
                    if (creep.withdraw(creep.room.terminal, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.travelTo(creep.room.terminal, { maxRooms: 1 });
                    }
                }
                else {
                    var [resourceID, ifDropped] = evaluateEnergyResources(creep, true, true, true, true); // find energy functoin in myFunctoins
                    if (resourceID != undefined) {
                        energy = Game.getObjectById(resourceID);
                        if (ifDropped) { // if energy is dropped
                            if (creep.pickup(energy) == ERR_NOT_IN_RANGE) {
                                creep.travelTo(energy, { maxRooms: 1 });
                            }
                        }
                        else { // energy is from container, storage or link
                            if (creep.withdraw(energy, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                creep.travelTo(energy, { maxRooms: 1 });
                            }
                        }
                    }
                }
            }
        }
    }
};
