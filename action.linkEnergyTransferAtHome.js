var passE = require('action.passEnergy');

module.exports = {
    run: function(creep) {
        let storage = creep.room.storage;
        let terminal = creep.room.terminal;
<<<<<<< HEAD
        if ((storage && storage.store.getUsedCapacity() > 980000) && (terminal && terminal.store.getUsedCapacity() > 290000)) {
            creep.drop(RESOURCE_ENERGY);
        }
        else {
=======
        if ((storage && storage.store.getUsedCapacity() > 980000) || (terminal && terminal.store.getUsedCapacity() > 290000)) {
            creep.drop(RESOURCE_ENERGY);
        }
        else {
            if (creep.memory.energyTransferCount == undefined) {
                creep.memory.energyTransferCount = 0;
            }
>>>>>>> master
            if (storage) {
                let structure = storage;
                if ((creep.room.terminal) && (_.sum(creep.room.terminal.store) < 222222)) {
                    structure = creep.room.terminal;
                }
                else {
                    structure = storage;
<<<<<<< HEAD
                    if (structure.store.getFreeCapacity('energy')==0){
                        structure = creep.room.terminal;
                    }
                }
                
                passE.run(creep);
                
                let roomEnergyFillers = creep.room.find(FIND_MY_CREEPS, { filter: (i) => i.memory.role == 'pickuper' || i.memory.role == 'lorry'|| i.memory.role == 'mover' || i.memory.role == 'balancer' || i.memory.role == 'dickHead' || i.memory.role == 'maintainer'}).length;
                if (!(roomEnergyFillers > 2)) {
                    let toFill = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: (s) => ((s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION) && s.energy < s.energyCapacity|| ( s.structureType == STRUCTURE_TOWER && s.store.energy < 0.5*_.sum(s.store))) })
                    if (toFill) { // cannot find spawn or extensions or tower or they are full, find the storage
                        structure = toFill;
                    }
                    for (let resT in creep.store) {
                        if (creep.transfer(structure, resT) == ERR_NOT_IN_RANGE) {
                            creep.travelTo(structure, {maxRooms: 1, creepCost: creep.memory.creepCost});
                        }
                    }
                }
                else {
                    for (let resT in creep.store) {
                        if (creep.transfer(structure, resT) == ERR_NOT_IN_RANGE) {
                            creep.travelTo(structure, {maxRooms: 1, creepCost: creep.memory.creepCost});
=======
                }

                if (creep.pos.getRangeTo(storage) > 4) { // if creep is far from storage and storage link
                    let countMax;
                    if (creep.carryCapacity <= 800) {
                        countMax = 2;
                    }
                    else {
                        countMax = 3;
                    }

                    if (creep.memory.energyTransferCount < countMax) { // transfered a lot and probably not in link range, do not need to scan for link anymore
                        // creep find a link that is close by and transfer energy
                        let nearbyLinks = creep.pos.findInRange(FIND_MY_STRUCTURES, 1, { filter: s => ((s.structureType == STRUCTURE_LINK) && (s.energy < s.energyCapacity)) });
                        if (nearbyLinks.length > 0 && nearbyLinks[0].energy < 800) { // if link is found
                            let nearbyLink = nearbyLinks[0];
                            if (creep.transfer(nearbyLink, RESOURCE_ENERGY) == 0) {
                                creep.memory.energyTransferCount += 1;
                            }
                            else {
                                let nearbyContainers = creep.pos.findInRange(FIND_STRUCTURES, 1, { filter: s => ((s.structureType == STRUCTURE_CONTAINER) && (s.energy < s.energyCapacity)) });
                                if (nearbyContainers.length > 0) { // if link is found
                                    let nearbyContainer = nearbyContainers[0];
                                    if (creep.transfer(nearbyContainer, RESOURCE_ENERGY) == 0) {
                                        creep.memory.energyTransferCount += 1;
                                    }
                                }
                            }
                        }
                        else { // no unfilled nearby links or containers
                            let roomEnergyFillers = creep.room.find(FIND_MY_CREEPS, { filter: (i) => i.memory.role == 'pickuper' || i.memory.role == 'lorry' }).length;
                            if (!(roomEnergyFillers > 1)) {
                                let structure = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: (s) => ((s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION) && s.energy < s.energyCapacity) })
                                if (structure == undefined) { // cannot find spawn or extensions or tower or they are full, find the storage
                                    structure = creep.room.storage;
                                }
                            }
                            if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                creep.travelTo(structure);
                            }
                        }
                    }
                    else {
                        let roomEnergyFillers = creep.room.find(FIND_MY_CREEPS, { filter: (i) => i.memory.role == 'pickuper' || i.memory.role == 'lorry' }).length;
                        if (!(roomEnergyFillers > 1)) {
                            structure = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: (s) => ((s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION) && s.energy < s.energyCapacity) })
                            if (structure == undefined) { // cannot find spawn or extensions or tower or they are full, find the storage
                                structure = creep.room.storage;
                            }
                        }
                        if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.travelTo(structure);
                        }
                    }
                }
                else { // creep is near storage
                    let roomEnergyFillers = creep.room.find(FIND_MY_CREEPS, { filter: (i) => i.memory.role == 'pickuper' || i.memory.role == 'lorry' }).length;
                    let structure = storage;
                    if (!(roomEnergyFillers > 1)) {
                        let toFill = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: (s) => ((s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION) && s.energy < s.energyCapacity) })
                        if (toFill) { // cannot find spawn or extensions or tower or they are full, find the storage
                            structure = toFill;
>>>>>>> master
                        }
                    }
                }
            }
            else { // if storage is not defined
                let structure = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: (s) => ((s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION) && s.energy < s.energyCapacity) })
                if (structure) {
                    if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.travelTo(structure);
                    }
                }
            }
<<<<<<< HEAD
=======
            else { // if storage is not defined
                let structure = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: (s) => ((s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION) && s.energy < s.energyCapacity) })
                if (structure) {
                    if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.travelTo(structure);
                    }
                }
                else { // cannot find spawn or extensions or tower or they are full, find the imaginary storage
                    let centreLinkFlag = Game.flags['link' + creep.memory.home];
                    let range = creep.pos.getRangeTo(centreLinkFlag);
                    if (range < 3) {
                        creep.drop(RESOURCE_ENERGY);
                    }
                    else {
                        creep.travelTo(centreLinkFlag);
                    }
                }
            }
>>>>>>> master
        }
    }
}
