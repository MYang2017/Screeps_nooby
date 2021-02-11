// lorry now only fill energy in room since v7
var actionAvoid = require('action.idle');
var noStoragePickuper = require('role.pickuper');

module.exports = {
    run: function (creep) {
        //if ((creep.room.terminal == undefined)||(creep.room.find(FIND_MY_STRUCTURES, {filter:c=>c.structureType==STRUCTURE_LINK}).length==0)) {
        if (creep.room.terminal == undefined) {
            noStoragePickuper.run(creep);
        }
        else {
            if (creep.room.name == creep.memory.target) { // if in target room work
                ifMineral = mineralNeedsCollect(creep.room);
                creepCarrying = _.sum(creep.carry);

                if (creep.memory.working == true && creepCarrying == 0) {
                    creep.memory.working = false;
                }
                else if (creep.memory.working == false && creepCarrying == creep.carryCapacity) {
                    creep.memory.working = true;
                }

                if (creep.memory.working == true) { // if filled with energy, transfer to spawn, extensions or towers
                    //console.log('fill')
                    let terminal = creep.room.terminal;
                    let storage = creep.room.storage;

                    let boostLabStates = checkRoomBoostLabState(creep.room,'fill');
                    let ifBoostLabJob = boostLabStates[0];
                    let boostMat = boostLabStates[1];
                    let boostLabId = boostLabStates[2];
                    let boostLab = Game.getObjectById(boostLabId);

                    let powerSpawn = Game.getObjectById(creep.room.memory.powerSpawnId);

                    if (creep.carry[RESOURCE_POWER]>0 && powerSpawn && powerSpawn.power < 40) {
                          if (creep.transfer(powerSpawn, RESOURCE_POWER) == ERR_NOT_IN_RANGE) {
                              creep.travelTo(powerSpawn);
                          }
                    }
                    /*else if (creep.carry['XGH2O']) {
                        let upgradeLab = Game.getObjectById(creep.room.memory.upgradeLabId);
                        if (upgradeLab&&(upgradeLab.mineralType==undefined||upgradeLab.mineralType=='XGH2O')) {
                            if (creep.transfer(upgradeLab, 'XGH2O') == ERR_NOT_IN_RANGE) {
                                creep.travelTo(upgradeLab);
                            }
                        }
                        else {
                            if (creep.transfer(creep.room.terminal, 'XGH2O') == ERR_NOT_IN_RANGE) {
                                creep.travelTo(creep.room.terminal);
                            }
                        }
                    }*/
                    else if ( ifBoostLabJob && (creep.carry[boostMat]>0) ) {
                        if (creep.transfer(boostLab, boostMat) == ERR_NOT_IN_RANGE) {
                            creep.travelTo(boostLab);
                        }
                    }
                    else if (creep.carry[RESOURCE_ENERGY]==0) { // carrying other minerals
                        for (const resourceType in creep.carry) {
                            let ifShooterRoom = creep.room.memory.startMB;
                            if (ifShooterRoom && creep.room.terminal) {
                                if (creep.transfer(terminal, resourceType) == ERR_NOT_IN_RANGE) {
                                    creep.travelTo(terminal);
                                }
                            }
                            else {
                                if (resourceType != 'energy') {
                                    if (terminal && _.sum(terminal.store) < terminal.storageCapacity * 0.95) { // if terminal is defined
                                        // chech if terminal threshold is met
                                        // chech if terminal threshold is met
                                        let TorSToFill = whereToFill(creep.room, resourceType);
                                        // threshold decider is in myTrading.js
                                        if (TorSToFill) {
                                            if (creep.transfer(TorSToFill, resourceType) == ERR_NOT_IN_RANGE) {
                                                creep.travelTo(TorSToFill);
                                                break;
                                            }
                                        }
                                        /*if (terminal.store[resourceType]>creep.room.memory.mineralThresholds.terminalThreshold[resourceType]) {
                                            if (creep.transfer(storage, resourceType) == ERR_NOT_IN_RANGE) {
                                                creep.travelTo(storage);
                                            }
                                        }
                                        else {
                                            if (creep.transfer(terminal, resourceType,Math.min(creep.carry[resourceType],creep.room.memory.mineralThresholds.terminalThreshold[resourceType]-terminal.store[resourceType])) == ERR_NOT_IN_RANGE) {
                                                creep.travelTo(terminal);
                                            }
                                        }*/
                                    }
                                    else {
                                        if (creep.transfer(storage, resourceType) == ERR_NOT_IN_RANGE) {
                                            creep.travelTo(storage);
                                        }
                                    }
                                }
                                else {
                                    if (creep.transfer(storage, resourceType) == ERR_NOT_IN_RANGE) {
                                        creep.travelTo(storage);
                                    }
                                }
                            }
                        }
                    }
                    else {
                        let structure = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: (s) => (
                            ((s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION) && (s.energy < s.energyCapacity)) ||
                            ((s.structureType == STRUCTURE_TOWER)&&(s.energy < s.energyCapacity*0.8)) ||
                            ((s.structureType == STRUCTURE_LAB) && (s.energy < s.energyCapacity*0.9)) ||
                            ((s.structureType == STRUCTURE_POWER_SPAWN) && (s.energy < s.energyCapacity*0.618))
                            ) });
                        // nuker fill should be implemented here
                        if (structure) { // if there is something to fill
                            if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                creep.travelTo(structure);
                            }
                        }
                        else { // no emergency filling
                            let ifShooterRoom = creep.room.memory.startMB;
                            if (ifShooterRoom && creep.room.terminal) {
                                if (creep.transfer(terminal, 'energy') == ERR_NOT_IN_RANGE) {
                                    creep.travelTo(terminal);
                                }
                            }
                            else {
                                if (creep.room.terminal) {
                                    if ((creep.room.terminal.store.energy < 20000) && (_.sum(creep.room.terminal.store) < 270000)) {
                                        structure = creep.room.terminal;
                                    }
                                    else if (_.sum(creep.room.storage.store) > 900000 || creep.room.storage.store.energy > 600000) { // storage is almost full
                                        structure = creep.room.terminal;
                                    }
                                    else {
                                        structure = creep.room.storage;
                                    }
                                }
                                else {
                                    structure = creep.room.storage;
                                }
                            }
                            if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                creep.travelTo(structure);
                            }
                        }
                    }
                }
                else { // if not working: find a none empty container and get energy from containers //
                    //console.log('take')
                    let terminal = creep.room.terminal;
                    let storage = creep.room.storage;
                    let boostLabStates = checkRoomBoostLabState(creep.room, 'take');
                    let ifBoostLabJob = boostLabStates[0];
                    let boostMat = boostLabStates[1];
                    let boostLabId = boostLabStates[2];
                    let boostLab = Game.getObjectById(boostLabId);

                    // removal of old XGH2O boost code
                    /*if (creep.room.memory.upgradeLabId&&Game.getObjectById(creep.room.memory.upgradeLabId).mineralAmount<1860&&terminal.store['XGH2O']>2000&&creep.ticksToLive>100) {
                        if (Game.getObjectById(creep.room.memory.upgradeLabId).mineralType&&Game.getObjectById(creep.room.memory.upgradeLabId).mineralType!='XGH2O') {
                            if (creep.withdraw(Game.getObjectById(creep.room.memory.upgradeLabId),Game.getObjectById(creep.room.memory.upgradeLabId).mineralType)== ERR_NOT_IN_RANGE) {
                                creep.travelTo(Game.getObjectById(creep.room.memory.upgradeLabId));
                            }
                        }
                        else if (creep.withdraw(terminal,'XGH2O')== ERR_NOT_IN_RANGE) {
                            creep.travelTo(terminal);
                        }
                    }*/
                    if (ifBoostLabJob) { // new check boost lab code
                        if (boostLab.mineralType && (boostLab.mineralType != boostMat)) {
                            if (creep.withdraw(boostLab, boostLab.mineralType) == ERR_NOT_IN_RANGE) {
                                creep.travelTo(boostLab);
                            }
                        }
                        else {
                            if (terminal.store[boostLabStates[1]]) {
                                if (creep.withdraw(terminal, boostLabStates[1]) == ERR_NOT_IN_RANGE) {
                                    creep.travelTo(terminal);
                                }
                            }
                            else {
                                if (creep.withdraw(storage, boostLabStates[1]) == ERR_NOT_IN_RANGE) {
                                    creep.travelTo(storage);
                                }
                            }
                        }
                    }
                    else {
                        let linkMem = creep.room.memory.forLinks;
                        if (linkMem != undefined) {
                            var link = Game.getObjectById(linkMem.receiverLinkId);
                        }

                        if (linkMem == undefined || link.energy == 0 ) { // no link work to do
                            var containers = creep.room.find(FIND_STRUCTURES, {filter : c => (c.structureType == STRUCTURE_CONTAINER) && (_.sum(c.store) > creep.carryCapacity) });
                            if (containers.length > 0) {
                                // if any container has too much energy
                                let container = containers[0]
                                for (let mineralType in container.store) {
                                    if (creep.withdraw(container, mineralType) == ERR_NOT_IN_RANGE) {
                                        creep.travelTo(container, { maxRooms: 1 });
                                    }
                                }
                            }
                            else {
                                let storage = creep.room.storage;
                                let powerVariable = hasPowerJobToDo(creep.room);
                                if (powerVariable && ((!creep.carry.power) || (creep.carry.power && creep.carry.power < 60))) {
                                    // take power
                                    let toGo = powerVariable;
                                    let powerStoreAmout = toGo.store['power'];
                                    if (creep.withdraw(toGo, RESOURCE_POWER, Math.min(60, powerStoreAmout)) == ERR_NOT_IN_RANGE) {
                                        creep.travelTo(toGo);
                                    }
                                }
                                else {
                                    if (creep.room.energyAvailable < creep.room.energyCapacityAvailable) {
                                        let ifShooterRoom = creep.room.memory.startMB;
                                        if (ifShooterRoom && creep.room.terminal) {
                                            if (creep.withdraw(terminal, 'energy') == ERR_NOT_IN_RANGE) {
                                                creep.travelTo(terminal);
                                            }
                                        }
                                        else {
                                            if (terminal) { // if terminal is defined
                                                // chech if terminal threshold is met
                                                if (terminal.store['energy'] > creep.room.memory.mineralThresholds.terminalThreshold['energy']) {
                                                    if (creep.withdraw(terminal, 'energy', Math.min(creep.carryCapacity - _.sum(creep.carry), terminal.store['energy'] - creep.room.memory.mineralThresholds.terminalThreshold['energy'])) == ERR_NOT_IN_RANGE) {
                                                        creep.travelTo(terminal);
                                                    }
                                                }
                                                else {
                                                    if (creep.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                                        creep.travelTo(storage);
                                                    }
                                                }
                                            }
                                            else {
                                                if (creep.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                                    creep.travelTo(storage);
                                                }
                                            }
                                        }
                                    }
                                    else {
                                        let ifShooterRoom = creep.room.memory.startMB;
                                        if (ifShooterRoom && creep.room.terminal) {
                                            if (creep.withdraw(terminal, 'energy') == ERR_NOT_IN_RANGE) {
                                                creep.travelTo(terminal);
                                            }
                                        }
                                        else {
                                            if (terminal) { // if terminal is defined
                                                // check if terminal threshold is met
                                                for (let mineralType in creep.room.memory.mineralThresholds.terminalThreshold) {
                                                    let TorSToTake = whereToTake(creep.room, mineralType);
                                                    // threshold decider is in myTrading.js
                                                    if (TorSToTake) {
                                                        let amountToTake = 800;
                                                        if (TorSToTake.storeCapacity == 300000) { // if terminal
                                                            amountToTake = TorSToTake.store[mineralType] - creep.room.memory.mineralThresholds.terminalThreshold[mineralType];
                                                        }
                                                        else if (TorSToTake.storeCapacity == 1000000) { // if storage
                                                            amountToTake = TorSToTake.store[mineralType] - creep.room.memory.mineralThresholds.storageThreshold[mineralType];
                                                        }
                                                        else {
                                                            console.log('impossible mistake in lorry code.')
                                                        }

                                                        if (creep.withdraw(TorSToTake, mineralType, Math.min(creep.carryCapacity - _.sum(creep.carry), amountToTake)) == ERR_NOT_IN_RANGE) {
                                                            creep.travelTo(TorSToTake);
                                                            break;
                                                        }
                                                    }
                                                }
                                                // storage and terminal is in equivallent state
                                                if (storage.store.energy > 100000) {
                                                    if (creep.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                                        creep.travelTo(storage);
                                                    }
                                                }
                                            }
                                            else {
                                                if (creep.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                                    creep.travelTo(storage);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        else {
                            //console.log(creep.withdraw(link, RESOURCE_ENERGY))
                            if (creep.withdraw(link, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                creep.travelTo(link);
                            }
                        }
                    }
                }
            }
            else {
                creep.travelTo(new RoomPosition(25, 25, creep.memory.target));
            }
        }
    }
};
