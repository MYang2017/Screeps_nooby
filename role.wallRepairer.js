var roleBuilder = require('role.builder');
var actionAvoid = require('action.idle');
var harv = require('role.upgrader');
var getE = require('action.getEnergy');
var fleee = require('action.flee');

module.exports = {
    run: function(creep) {
        creep.say('wall...');
        
        try {
            
            if (creep.room.memory.battleMode && creep.ticksToLive>1450 && creep.memory.checkBoost==undefined) {
                creep.memory.checkBoost = true;
                creep.memory.boostMats = ['LH'];
                creep.memory.boosted = false;
            }
            
            var doge = function (creep, tar) {
                if (creep.pos.findInRange(FIND_MY_CREEPS, 1).length>1) {
                    let thingUnderFeet = creep.room.lookForAt(LOOK_STRUCTURES, creep)[0];
                    if (thingUnderFeet && thingUnderFeet.structureType && thingUnderFeet.structureType == STRUCTURE_ROAD) {
                        creep.travelTo(tar, {plainCost: 0.5, swampCost: 0.7});
                    }
                }
            }
            
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
                    let endangeredRampart = creep.room.find(FIND_MY_STRUCTURES, { filter: s => (s.structureType == STRUCTURE_RAMPART) && (s.hits < 11000) });
                    if (endangeredRampart.length > 0) { // if any rampart less than 100, repair with priority
                        //console.log(creep.repair(endangeredRampart[0]) == ERR_NOT_IN_RANGE)
                        let repres = creep.repair(endangeredRampart[0]);
                        if (repres== ERR_NOT_IN_RANGE) {
                            creep.travelTo(endangeredRampart[0], { maxRooms: 1 });
                            //creep.repair(target)
                        }
                        else if (repres==OK) {
                            if (creep.pos.findInRange(FIND_MY_CREEPS, 1).length>1) {
                                let thingUnderFeet = creep.room.lookForAt(LOOK_STRUCTURES, creep)[0];
                                if (thingUnderFeet && thingUnderFeet.structureType && thingUnderFeet.structureType == STRUCTURE_ROAD) {
                                    creep.move(getRandomInt(1, 8));
                                }
                            }
                        }
                        Game.rooms[creep.room.name].memory.toRepairWallOrRampartId = endangeredRampart[0].id;
    
                    }
                    else { // if all rampart safe find rampart constructionsite
                        let rampartConstructionSite = creep.room.find(FIND_MY_CONSTRUCTION_SITES, { filter: { structureType: STRUCTURE_RAMPART } });
                        if (rampartConstructionSite.length > 0) { // if any rampart construction site, build
                            if (creep.build(rampartConstructionSite[0]) == ERR_NOT_IN_RANGE) {
                                creep.travelTo(rampartConstructionSite[0], { maxRooms: 1 });
                                //creep.build(constructionSite);
                            }
                            else {
                                /*
                                let thingUnderFeet = creep.room.lookForAt(LOOK_STRUCTURES, creep)[0];
                                if (thingUnderFeet && thingUnderFeet.structureType && thingUnderFeet.structureType == STRUCTURE_ROAD) {
                                    creep.move(getRandomInt(1,8));
                                }
                                */
                            }
                        }
                        else { // cannot find rampart constructionsite, repair normally
                            let wallConstructionSite = creep.room.find(FIND_MY_CONSTRUCTION_SITES, { filter: { structureType: STRUCTURE_WALL } });
                            if (wallConstructionSite.length > 0) { // if any rampart construction site, build
                                if (creep.build(wallConstructionSite[0]) == ERR_NOT_IN_RANGE) {
                                    creep.travelTo(wallConstructionSite[0], { maxRooms: 1 });
                                }
                                else {
                                    /*
                                    let thingUnderFeet = creep.room.lookForAt(LOOK_STRUCTURES, creep)[0];
                                    if (thingUnderFeet && thingUnderFeet.structureType && thingUnderFeet.structureType == STRUCTURE_ROAD) {
                                        creep.move(getRandomInt(1,8));
                                    }
                                    */
                                }
                            }
                            else { // all wall and rampart sites build, repair
                                let wallRampartToRepair = Game.rooms[creep.room.name].memory.toRepairWallOrRampartId;
                                if (wallRampartToRepair == undefined) {
                                    let thinkid = whichWorRtoRepairUnderNuke(creep.room);
                                    Game.rooms[creep.room.name].memory.toRepairWallOrRampartId = thinkid;
                                    if (thinkid==undefined) {
                                        roleBuilder.run(creep);
                                    }
                                }
                                else {
                                    var target = Game.getObjectById(Game.rooms[creep.room.name].memory.toRepairWallOrRampartId);
                                    if (target==null || creep.room.memory.battleMode || Game.time % 500 == 0 || ((Game.time % 125 == 0 || (creep.room.memory.battleMode && Game.time % 25 == 0)) && Game.getObjectById(Game.rooms[creep.room.name].memory.toRepairWallOrRampartId).hits>100000)) {
                                        Game.rooms[creep.room.name].memory.toRepairWallOrRampartId = whichWorRtoRepairUnderNuke(creep.room);
                                    }
                                    if (target != undefined) {
                                        //console.log(creep.room.name,target);
                                        if (target.hits==RAMPART_HITS_MAX[creep.room.controller.level]) {
                                            harv.run(creep);
                                            return
                                        }
                                        let repres = creep.repair(target);

                                        if (creep.pos.findInRange(FIND_HOSTILE_CREEPS, 3).length>0 || creep.pos.findInRange(FIND_FLAGS, 3).length>0) {
                                            if (creep.pos.findInRange(FIND_MY_STRUCTURES, 0, {filter: t=>t.structureType==STRUCTURE_RAMPART}).length==0) {
                                                let potentialShelter = target.pos.findInRange(FIND_MY_STRUCTURES, 3, {filter:t=>t.structureType==STRUCTURE_RAMPART && t.pos.findInRange(FIND_MY_CREEPS, 0, {filter:c=>c.name!=creep.name}).length==0});
                                                if (potentialShelter.length>1) {
                                                    creep.travelTo(potentialShelter[0], {maxRooms: 1});
                                                }
                                                else {
                                                    fleee.run(creep);
                                                }
                                            }
                                        }
                                        if (repres== ERR_NOT_IN_RANGE) {
                                            creep.travelTo(target, { maxRooms: 1 });
                                            //creep.repair(target)
                                        }
                                    }
                                    else {
                                        /*
                                        let thingUnderFeet = creep.room.lookForAt(LOOK_STRUCTURES, creep)[0];
                                        if (thingUnderFeet && thingUnderFeet.structureType && thingUnderFeet.structureType == STRUCTURE_ROAD) {
                                            creep.move(getRandomInt(1,8));
                                        }
                                        */
                                    }
                                }
                            }
                        }
                    }
                    if (((creep.pos.x == 0) || (creep.pos.x == 49)) || ((creep.pos.y == 0) || (creep.pos.y == 49))) {
                        creep.travelTo(new RoomPosition(25, 25, creep.memory.target), { range: 15, maxRooms: 1 });
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
                        getE.run(creep);
                        return
                        var [resourceID, ifDropped] = evaluateEnergyResources(creep, true, true, true, true); // find energy functoin in myFunctoins
                        if (resourceID != undefined) {
                            energy = Game.getObjectById(resourceID);
                            if (energy.resourceType != 'energy') {
                                if (creep.withdraw(creep.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                    creep.travelTo(creep.room.storage, { maxRooms: 1 });
                                }
                            }
                            else {if (ifDropped) { // if energy is dropped
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
        }
        catch (err) {
            harv.run(creep);
        }
    }
};
