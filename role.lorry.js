// lorry now only fill energy in room since v7
var actionAvoid = require('action.idle');
var noStoragePickuper = require('role.pickuper');
var getE = require('action.getEnergy');
var fillE = require('action.fillEnergy');
var evac = require('action.evacuate');

module.exports = {
    run: function (creep) {
        //if ((creep.room.terminal == undefined)||(creep.room.find(FIND_MY_STRUCTURES, {filter:c=>c.structureType==STRUCTURE_LINK}).length==0)) {
        if (evac.run(creep)) {
            return
        }
        else {
            /*
            if (_.sum(creep.room.storage.store)>990000) {
                let emerg = false;
                for (let tp in creep.room.storage.store) {
                    if (tp == 'energy' || tp.slice(0,3)=='sym') {
                    }
                    else {
                        emerg = true;
                    }
                }
                
                if (emerg == false) {
                    if (_.sum(creep.store)==0) {
                        let am = 1000000;
                        let tobap = undefined;
                        for (let bao in creep.room.storage.store) {
                            if (bao!='energy') {
                                if (creep.room.storage.store[bao]<am) {
                                    am = creep.room.storage.store[bao];
                                    tobap = bao;
                                }
                            }
                        }
                        if (tobap) {
                            creep.withdraw(creep.room.storage, tobap);
                        }
                    }
                    else {
                        if (creep.pos.getRangeTo(creep.room.terminal)>1) {
                            creep.travelTo(creep.room.terminal);
                        }
                        else {
                            for (let tp in creep.store) {
                                creep.transfer(creep.room.terminal, tp);
                            }
                        }
                    }
                    return
                }
                
                if (emerg) {
                    if (_.sum(creep.store)==0) {
                        if (creep.pos.getRangeTo(creep.room.storage)>1) {
                            creep.travelTo(creep.room.storage);
                        }
                        else {
                            for (let tp in creep.room.storage.store) {
                                if (tp == 'energy' || tp.slice(0,3)=='sym') {
                                }
                                else {
                                    emerg = true;
                                    creep.withdraw(creep.room.storage, tp);
                                }
                            }
                        }
                    }
                    else {
                        if (creep.pos.getRangeTo(creep.room.terminal)>1) {
                            creep.travelTo(creep.room.terminal);
                        }
                        else {
                            for (let tp in creep.store) {
                                creep.transfer(creep.room.terminal, tp);
                            }
                        }
                    }
                    return
                }
            }
            else if (creep.room.terminal && creep.room.storage && creep.room.storage.store.energy<5000) {
                if (_.sum(creep.store)==0) {
                    if (creep.pos.getRangeTo(creep.room.terminal)>1) {
                        creep.travelTo(creep.room.terminal);
                    }
                    else {
                        creep.withdraw(creep.room.terminal, 'energy');
                    }
                }
                else {
                    if (creep.pos.getRangeTo(creep.room.storage)>1) {
                        creep.travelTo(creep.room.storage);
                    }
                    else {
                        creep.transfer(creep.room.storage, 'energy');
                    }
                }
                return
            }
            */
            let creepCarrying = _.sum(creep.store);
            if (creep.room.terminal == undefined) {
                if (creep.memory.working == undefined) {
                    creep.memory.working = false;
                }

                if (creep.memory.working == true && creepCarrying == 0) {
                    creep.memory.working = false;
                }
                else if (creep.memory.working == false && creepCarrying == creep.store.getCapacity()) {
                    creep.memory.working = true;
                }
                if (creep.memory.working) { // fill
                    if (creep.store.energy == 0) { // carrying something else
                        for (let resType in creep.store) {
                            if (creep.transfer(creep.room.storage, resType) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(creep.room.storage);
                            }
                        }
                    }
                    else {
                        fillE.run(creep);
                    }
                }
                else { // get
                    let hasJobtd = false;

                    if (!hasJobtd) {
                        let cs = creep.room.find(FIND_STRUCTURES, { filter: s => (s.structureType == STRUCTURE_CONTAINER) });
                        for (c of cs) {
                            if (c && c.store.energy > 0) {
                                if (creep.room.storage == undefined) {
                                    if (creep.withdraw(c, 'energy') == ERR_NOT_IN_RANGE) {
                                        creep.moveTo(c, { maxRooms: 1 });
                                    }
                                }
                                else {
                                    if (c.pos.inRangeTo(creep.room.controller, 3)) {
                                        // pass
                                    }
                                    else {
                                        if (creep.withdraw(c, 'energy') == ERR_NOT_IN_RANGE) {
                                            creep.moveTo(c, { maxRooms: 1 });
                                            hasJobtd = true;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (!hasJobtd) {
                        if (creep.room.storage) {
                            if (creep.withdraw(creep.room.storage, 'energy') == ERR_NOT_IN_RANGE) {
                                creep.moveTo(creep.room.storage, { maxRooms: 1 });
                                hasJobtd = true;
                            }
                        }
                    }
                }
            }
            else { // there is terminal
                let RCL = creep.room.controller.level;
                if (creep.room.name == creep.memory.target) { // if in target room work
                    //ifMineral = mineralNeedsCollect(creep.room);

                    if (creep.memory.working == undefined) {
                        creep.memory.working = false;
                    }

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

                        let boostLabStates = checkRoomBoostLabState(creep.room, 'fill');
                        let ifBoostLabJob = boostLabStates[0];
                        let boostMat = boostLabStates[1];
                        let boostLabId = boostLabStates[2];
                        let boostLab = Game.getObjectById(boostLabId);

                        let newLabBoostBoo = checkIfCarryIsBoostLab(creep);
                        let powerSpawn = Game.getObjectById(creep.room.memory.powerSpawnId);
                        
                        
                        if (RCL == 8 && Memory.mapInfo[creep.room.name].decoderInfo && creep.store[Memory.mapInfo[creep.room.name].decoderInfo.t] > 0) {
                            let decoder = creep.room.find(FIND_SYMBOL_DECODERS)[0];
                            if (creep.transfer(decoder, Memory.mapInfo[creep.room.name].decoderInfo.t) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(decoder);
                            }
                        }
                        else if (creep.carry[RESOURCE_POWER] > 0 && powerSpawn && powerSpawn.power < 40) {
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
                        else if (false) { //( ifBoostLabJob && (creep.carry[boostMat]>0) ) {
                            if (creep.transfer(boostLab, boostMat) == ERR_NOT_IN_RANGE) {
                                creep.travelTo(boostLab);
                            }
                            /*
                            let carrytp = Object.keys(creep.store)[0];
                            let toFillBostLab = Game.getObjectById(creep.room.memory.forlab.boostLabs[carrytp]);
                            if (creep.transfer(toFillBostLab, carrytp) == ERR_NOT_IN_RANGE) {
                                creep.travelTo(toFillBostLab);
                            }
                            */
                        }
                        else if (newLabBoostBoo[0]) {
                            let restp = newLabBoostBoo[1];
                            let booId = newLabBoostBoo[0];
                            let booLab = Game.getObjectById(booId);
                            if (creep.transfer(booLab, restp) == ERR_NOT_IN_RANGE) {
                                creep.travelTo(booLab);
                                return
                            }

                        }
                        else if (creep.carry[RESOURCE_ENERGY] == 0) { // carrying other minerals
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
                        else { // only carrying energy
                            let structure = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                                filter: (s) => (
                                    ((s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION) && (s.energy < s.energyCapacity)) ||
                                    ((s.structureType == STRUCTURE_TOWER) && (s.energy < s.energyCapacity * 0.8)) ||
                                    ((s.structureType == STRUCTURE_LAB) && (s.energy < s.energyCapacity * 0.9)) ||
                                    ((s.structureType == STRUCTURE_POWER_SPAWN) && (s.energy < s.energyCapacity * 0.618))
                                )
                            });
                            // nuker fill should be implemented here
                            if (structure) { // if there is something to fill
                                if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                    creep.travelTo(structure);
                                }
                            }
                            else { // no emergency filling
                                //actionAvoid.run(creep);
                                //return
                                if (creep.room.terminal) {
                                    if (creep.transfer(creep.room.terminal, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                        creep.travelTo(creep.room.terminal, { maxRooms: 1 });
                                    }
                                }
                                else if (creep.room.storage) {
                                    if (creep.travelTo(creep.room.storage, 'energy') == ERR_NOT_IN_RANGE) {
                                        creep.moveTo(creep.room.storage, { maxRooms: 1 });
                                    }
                                }
                                return

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
                        //console.log('take')fo(creep.pos)
                        if (creep.room.energyAvailable < 0.5 * creep.room.energyCapacityAvailable) {
                            let storage = creep.room.storage;
                            if (storage.store.energy > 0 && (creep.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)) {
                                creep.travelTo(storage);
                            }
                            else {
                                if (creep.room.terminal.store.energy > 0 && (creep.withdraw(creep.room.terminal, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)) {
                                    creep.travelTo(creep.room.terminal);
                                }
                            }
                            return
                        }
                        else {
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
                                let dropped_sym = creep.room.find(FIND_DROPPED_RESOURCES, { filter: s => s.resourceType != 'energy' });
                                if (dropped_sym.length > 0) {
                                    let todro = dropped_sym[0];
                                    if (creep.pickup(todro) == ERR_NOT_IN_RANGE) {
                                        creep.travelTo(todro, { maxRooms: 1 });
                                    }
                                }
                                else {
                                    var containers = creep.room.find(FIND_STRUCTURES, { filter: c => (c.structureType == STRUCTURE_CONTAINER) && (_.sum(c.store) > creep.carryCapacity) });
                                    if (containers.length > 0) {
                                        // mineral container
                                        for (let container of containers) {
                                            for (let mineralType in container.store) {
                                                if (mineralType !== 'energy') { // accidental mineral drop
                                                    if (creep.withdraw(container, mineralType) == ERR_NOT_IN_RANGE) {
                                                        creep.travelTo(container, { maxRooms: 1 });
                                                        return
                                                    }
                                                }
                                            }
                                        }

                                        let sps = creep.room.find(FIND_MY_STRUCTURES, { filter: o => o.structureType == STRUCTURE_SPAWN });
                                        for (let container of containers) {
                                            let takeThis = true;
                                            // check container not central containers
                                            if (sps.length > 0) { // my room
                                                // upgrade container
                                                if (container.pos.getRangeTo(creep.room.controller) < 3) {
                                                    takeThis = false;
                                                }
                                                // middle place container
                                                for (let sp of sps) {
                                                    if (container.pos.getRangeTo(sp) < 3) {
                                                        takeThis = false;
                                                    }
                                                }
                                            }
                                            if (takeThis) {
                                                for (let mineralType in container.store) {
                                                    if (creep.withdraw(container, mineralType) == ERR_NOT_IN_RANGE) {
                                                        creep.travelTo(container, { maxRooms: 1 });
                                                        return
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    // season 2 special
                                    // scoring
                                    if (RCL == 8 && Memory.mapInfo[creep.room.name] && Memory.mapInfo[creep.room.name].decoderInfo && creep.store.getFreeCapacity() > 0 && creep.ticksToLive > 100) {
                                        let symdonor;
                                        if (creep.room.storage.store[Memory.mapInfo[creep.room.name].decoderInfo.t] > 0) {
                                            symdonor = creep.room.storage;
                                        }
                                        else if (creep.room.terminal.store[Memory.mapInfo[creep.room.name].decoderInfo.t] > 0) {
                                            symdonor = creep.room.terminal;
                                        }
                                        else {
                                            // pass
                                        }
                                        if (symdonor) {
                                            if (creep.withdraw(symdonor, Memory.mapInfo[creep.room.name].decoderInfo.t) == ERR_NOT_IN_RANGE) {
                                                creep.moveTo(symdonor);
                                            }
                                            return
                                        }
                                    }

                                    if (true) {
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
                                            let structure = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                                                filter: (s) => (
                                                    ((s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION) && (s.energy < s.energyCapacity)) ||
                                                    ((s.structureType == STRUCTURE_TOWER) && (s.energy < s.energyCapacity * 0.8)) ||
                                                    ((s.structureType == STRUCTURE_LAB) && (s.energy < s.energyCapacity * 0.9)) ||
                                                    ((s.structureType == STRUCTURE_POWER_SPAWN) && (s.energy < s.energyCapacity * 0.618))
                                                )
                                            });
                                            // nuker fill should be implemented here
                                            if (structure) { // if there is something to fill
                                                if (storage.store.energy > 0 && creep.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                                    creep.travelTo(storage);
                                                }
                                                else {
                                                    if (creep.room.terminal.energy > 0 && creep.withdraw(creep.room.terminal, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                                        creep.travelTo(creep.room.terminal);
                                                    }
                                                }
                                            }
                                            else { // rooms does not need energy, we should idle, because resources balancing now takes over by balancer
                                                noStoragePickuper.run(creep);
                                                return
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
                            }
                        }
                    }
                }
                else {
                    creep.travelTo(new RoomPosition(25, 25, creep.memory.target));
                }
            }
        }
    }
};
