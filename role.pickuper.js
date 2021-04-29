// pickuper now is the combination of old lorry and pickuper together since v7
var actionAvoid = require('action.idle');

module.exports = {
    run: function(creep) {
        //if (creep.memory.home == undefined) { // || creep.room.name != creep.memory.home) {
        //    creep.travelTo(Game.flags('linkE94N17'));
        //}
        //else {
            if (creep.room.name == creep.memory.target) { // if in target room work
                creep.say('recycling');
                if (creep.memory.working == undefined) {
                    creep.memory.working = false;
                }
                else {
                    if (creep.memory.working == true && _.sum(creep.carry) == 0) {
                        creep.memory.working = false;
                    }
                    else if (((creep.memory.working) == false) && ((creep.carry.energy > 0.618 * creep.carryCapacity) || (_.sum(creep.carry) == creep.carryCapacity))) {
                        creep.memory.working = true;
                    }
                    if (creep.memory.working == true) {
                        for (const resourceType in creep.carry) {
                            if (resourceType == RESOURCE_ENERGY) { // carrying energy
                                var structure = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: (s) => ((s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION || (s.structureType == STRUCTURE_TOWER && (s.energy < s.energyCapacity * 0.7)) || s.structureType == STRUCTURE_LAB) && s.energy < s.energyCapacity) })
                                if (structure == undefined) {
                                    structure = creep.room.storage;
                                    if (structure) {
                                        if (_.sum(structure.store) > 0.8 * structure.storeCapacity) { // storage is almost full

                                            structure = creep.room.terminal;
                                        }
                                    }
                                    else { // storage is not defined, move to centre link point and drop resource
                                        /*let imaginaryStorage = Game.flags['link'+creep.room.name];
                                        if (creep.pos.getRangeTo(imaginaryStorage)>3) {
                                            creep.travelTo(imaginaryStorage);
                                        }
                                        else {
                                            creep.drop(RESOURCE_ENERGY);
                                        }*/
                                        //actionAvoid.run(creep);
                                        creep.move(Math.floor(Math.random() * 8) +1);
                                    }
                                }
                                if (creep.transfer(structure, resourceType) == ERR_NOT_IN_RANGE) {
                                    creep.travelTo(structure, { maxRooms: 1 });
                                }
                            }
                            else { // carrying minerals, mineral management same as lorry
                                let terminal = creep.room.terminal;
                                let ifShooterRoom = creep.room.memory.startMB;
                                if (ifShooterRoom && creep.room.terminal) {
                                    if (creep.transfer(terminal, resourceType) == ERR_NOT_IN_RANGE) {
                                        creep.travelTo(terminal);
                                    }
                                }
                                else {
                                    let storage = creep.room.storage;
                                    if (terminal==undefined) {
                                        if (creep.transfer(storage, resourceType) == ERR_NOT_IN_RANGE) {
                                            creep.travelTo(storage);
                                            return
                                        }
                                    }
                                    actionAvoid.run(creep);
                                    

                                    if (terminal && _.sum(terminal.store) < terminal.storageCapacity * 0.95) { // if terminal is defined
                                        // chech if terminal threshold is met
                                        if (terminal.store[resourceType] > creep.room.memory.mineralThresholds.terminalThreshold[resourceType]) {
                                            if (creep.transfer(storage, resourceType) == ERR_NOT_IN_RANGE) {
                                                creep.travelTo(storage);
                                            }
                                        }
                                        else {
                                            if (creep.transfer(terminal, resourceType, Math.min(creep.carry[resourceType], creep.room.memory.mineralThresholds.terminalThreshold[resourceType] - terminal.store[resourceType])) == ERR_NOT_IN_RANGE) {
                                                creep.travelTo(terminal);
                                            }
                                        }
                                    }
                                    else {
                                        if (creep.transfer(storage, resourceType) == ERR_NOT_IN_RANGE) {
                                            creep.moveTo(storage);
                                        }
                                    }
                                    /*var structure = creep.room.terminal;
                                    if (structure==undefined||_.sum(structure.store)>250000) {
                                        structure = creep.room.storage;
                                        if (structure == undefined) {
                                            creep.memory.working = false; // no storage or terminal build yet, fuck minerals
                                        }
                                    }
                                    if (creep.transfer(structure, resourceType) == ERR_NOT_IN_RANGE) {
                                        creep.travelTo(structure, { maxRooms: 1 });
                                    }*/
                                }
                            }
                        }
                    }
                    else { // working, get resources: dropped minerals >> minerals (container) >> energy (container) >> dropped energy
                        // if there is dropped mineral
                        let droppedMinerals = creep.room.find(FIND_DROPPED_RESOURCES, { filter: s => s.resourceType != RESOURCE_ENERGY });
                        if (droppedMinerals.length>0) { // if there is mineral dropped

                            creep.travelTo(droppedMinerals[0], { maxRooms: 1 });
                            creep.pickup(droppedMinerals[0]);
                        }
                        else { // no mineral dropped
                            let tombstones = creep.room.find(FIND_TOMBSTONES, { filter: c => _.sum(c.store) > 0 });
                            if (tombstones.length > 0) {
                                let tombstone = tombstones[0];
                                for (let mineralType in tombstone.store) {
                                    if (creep.withdraw(tombstone, mineralType) == ERR_NOT_IN_RANGE) {
                                        creep.travelTo(tombstone, { maxRooms: 1 });
                                    }
                                }
                                hasJobToDo = true;
                                //break;
                            }
                            else {
                                ifMineral = mineralNeedsCollect(creep.room);
                                if ((ifMineral) && ((ifMineral[0]+ifMineral[2]) > creep.carryCapacity)) { // if there is a mineral container and its mineral amount is higher than creep's carrying capacity
                                    let resourceType = ifMineral[1];
                                    creep.say('get ' + resourceType);
                                    let container = creep.pos.findClosestByRange(FIND_STRUCTURES, { filter: s => s.structureType == STRUCTURE_CONTAINER && s.store[resourceType] > 0 });
                                    if (ifMineral[2]>0) {
                                        if (creep.withdraw(container, 'energy') == ERR_NOT_IN_RANGE) {
                                            creep.travelTo(container, { maxRooms: 1 });
                                        }
                                    }
                                    else {
                                        if (creep.withdraw(container, resourceType) == ERR_NOT_IN_RANGE) {
                                            creep.travelTo(container, { maxRooms: 1 });
                                        }
                                    }
                                }
                                else { // find energy
                                    let terminal = creep.room.terminal;
                                    /*if ((terminal!=undefined)&&((terminal.store.energy > 50000 && creep.room.storage.store.energy < 20000)||(creep.room.storage.store.energy < 5000))) {
                                        if (creep.withdraw(terminal, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                            creep.travelTo(terminal, { maxRooms: 1 });
                                        }
                                    }
                                    else {*/
                                    if (false) {// (creep.room.controller.level==8 && creep.room.energyAvailable==creep.room.energyCapacityAvailable) {
                                        actionAvoid.run(creep);
                                        return
                                    }
                                    else {
                                        let [resourceID, ifDropped] = evaluateEnergyResources(creep, false, false, true, true); // find energy functoin in myFunctoins
                                        let hasJobToDo = false;
                                        if (resourceID) { // if there is dropped energy or energy in container
                                            let energy = Game.getObjectById(resourceID);
                                            if (ifDropped) { // if energy is dropped
                                                if (creep.pickup(energy) == ERR_NOT_IN_RANGE) {
                                                    creep.travelTo(energy, { maxRooms: 1 });
                                                }
                                            }
                                            else { // energy is from container
                                                if (creep.withdraw(energy, energy.resourceType) == ERR_NOT_IN_RANGE) {
                                                    creep.travelTo(energy, { maxRooms: 1 });
                                                }
                                            }
                                        }
                                        else { // no energy getable, get mineral from lab
                                            if (!hasJobToDo) {
                                                if (creep.room.memory.forLab && creep.ticksToLive > 50) {
                                                    let outLabIds = creep.room.memory.forLab.outLabs;
                                                    let toCreate = creep.room.memory.forLab.toCreate;
                                                    for (let labId of outLabIds) {
                                                        let lab = Game.getObjectById(labId);
                                                        if (((creep.room.memory.upgradeLabId == undefined) || (labId != creep.room.memory.upgradeLabId)) &&
                                                            (lab.mineralAmount > creep.carryCapacity)) {
                                                            if (creep.withdraw(lab, toCreate) == ERR_NOT_IN_RANGE) {
                                                                creep.travelTo(lab);
                                                                hasJobToDo = true;
                                                                break;
                                                            }

                                                        }
                                                    }
                                                }
                                            }
    
                                            /*let labs = creep.room.find(FIND_MY_STRUCTURES, {filter: c => c.structureType == STRUCTURE_LAB});
                                            for (let lab of labs) {
                                                let flag = creep.room.lookForAt(LOOK_FLAGS,lab)[0];
                                                if (flag != undefined) {
                                                    if (flag.color == COLOR_CYAN) { // 4 is cyan for out lab
                                                        let toCreate = getMineralType(flag.name);
                                                        if ((!boostingMineralToKeepInLab().includes(toCreate))&&(lab.mineralAmount>creep.carryCapacity)) {
                                                            if (creep.withdraw(lab, toCreate) == ERR_NOT_IN_RANGE) {
                                                                creep.travelTo(lab);
                                                                hasJobToDo = true;
                                                                break;
                                                            }
                                                        }
                                                    }
                                                }
                                            }*/
                                            if (!hasJobToDo) { // balancing mineral management, same as lorry
                                                let storage = creep.room.storage;
                                                let ifShooterRoom = creep.room.memory.startMB;
                                                if (ifShooterRoom && creep.room.terminal) {
                                                    /*for (let mineralType in terminal.store) {
                                                        if (terminal.store[mineralType] > creep.room.memory.mineralThresholds.terminalThreshold[mineralType]) {
                                                            if (creep.withdraw(terminal, mineralType, Math.min(creep.carryCapacity - _.sum(creep.carry), terminal.store[mineralType] - creep.room.memory.mineralThresholds.terminalThreshold[mineralType])) == ERR_NOT_IN_RANGE) {
                                                                creep.travelTo(terminal);
                                                                hasJobToDo = true;
                                                                break;
                                                            }
                                                        }
                                                    }*/
                                                }
                                                else {
                                                    actionAvoid.run(creep);
                                                    return
                                                    if (terminal) { // if terminal is defined
                                                        let lvl = creep.room.controller.level;
                                                        if (lvl<7) {
                                                            // chech if terminal threshold is met
                                                            for (let mineralType in terminal.store) {
                                                                if (terminal.store[mineralType] > creep.room.memory.mineralThresholds.terminalThreshold[mineralType]) {
                                                                    if (creep.withdraw(terminal, mineralType, Math.min(creep.carryCapacity - _.sum(creep.carry), terminal.store[mineralType] - creep.room.memory.mineralThresholds.terminalThreshold[mineralType])) == ERR_NOT_IN_RANGE) {
                                                                        creep.travelTo(terminal);
                                                                        hasJobToDo = true;
                                                                        break;
                                                                    }
                                                                }
                                                            }
                                                        }
                                                        else {
                                                            actionAvoid.run(creep);
                                                        }
                                                    }
                                                    else {
                                                        if (creep.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                                            creep.travelTo(storage);
                                                        }
                                                    }
                                                }
                                                /*if (terminal!=undefined && _.sum(terminal.store) < 250000) {
                                                    // no work to do, move over-stored minerals from storage to terminal for transaction or for sell
                                                    let storage = creep.room.storage;
                                                    for (let mineralType in storage.store) {
                                                        if (mineralType!='energy'&&mineralType!='power'&&storage.store[mineralType]>12000) {
                                                            if (creep.withdraw(storage, mineralType) == ERR_NOT_IN_RANGE) {
                                                                creep.travelTo(storage);
                                                                hasJobToDo = true;
                                                            }
                                                        }
                                                    }
                                                }*/
                                            }
                                            if (!hasJobToDo) {
                                                if (creep.room.find(FIND_STRUCTURES, { filter: s => s.structureType == STRUCTURE_LINK }).length > 0) {
                                                    let link = creep.pos.findInRange(FIND_STRUCTURES, 1, { filter: s => s.structureType == STRUCTURE_LINK });
                                                    if (link.length > 0 && link[0].energy > 0) {
                                                        //console.log(creep.withdraw(link, RESOURCE_ENERGY))
                                                        if (creep.withdraw(link[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                                            creep.travelTo(link[0]);
                                                            hasJobToDo = true;
                                                        }
                                                    }
                                                }
                                            }
                                            if (!hasJobToDo) {
                                                if (actionFillUpgrade.run(creep)) {
                                                    return

                                                }
                                                actionAvoid.run(creep);
                                            }
                                        }
                                    }
                                }
                                //}
                            }
                        }
                    }
                }
            }
            else { // not at home
                if (creep.memory.target) {
                    creep.travelTo(new RoomPosition(25, 25, creep.memory.target));
                }
                else {
                    creep.memory.target = creep.room.name;
                }
            }
        }
};
