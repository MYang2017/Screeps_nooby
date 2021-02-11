module.exports = {
    run: function(creep) {
        let storage = creep.room.storage;
        if (creep.memory.energyTransferCount==undefined) {
            creep.memory.energyTransferCount = 0;
        }
        if (storage) {
            if (creep.pos.getRangeTo(storage)>4) { // if creep is far from storage and storage link
                let countMax;
                if (creep.carryCapacity<=800) {
                    countMax = 2;
                }
                else {
                    countMax = 3;
                }
                if (creep.memory.energyTransferCount<countMax) { // transfered a lot and probably not in link range, do not need to scan for link anymore
                    // creep find a link that is close by and transfer energy
                    let nearbyLinks = creep.pos.findInRange(FIND_MY_STRUCTURES, 1, {filter:s=> ((s.structureType==STRUCTURE_LINK)&&(s.energy<s.energyCapacity))});
                    if (nearbyLinks.length>0&&nearbyLinks[0].energy<800) { // if link is found
                        let nearbyLink = nearbyLinks[0];
                        if (creep.transfer(nearbyLink, RESOURCE_ENERGY)==0) {
                            creep.memory.energyTransferCount += 1;
                        }
                        else {
                            let nearbyContainers = creep.pos.findInRange(FIND_STRUCTURES, 1, {filter:s=> ((s.structureType==STRUCTURE_CONTAINER)&&(s.energy<s.energyCapacity))});
                            if (nearbyContainers.length>0) { // if link is found
                                let nearbyContainer = nearbyContainers[0];
                                if (creep.transfer(nearbyContainer, RESOURCE_ENERGY)==0) {
                                    creep.memory.energyTransferCount += 1;
                                }
                            }
                        }
                    }
                    else { // no unfilled nearby links or containers
                        let structure = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: (s) => ( (s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION) && s.energy < s.energyCapacity) })
                        if (structure == undefined) { // cannot find spawn or extensions or tower or they are full, find the storage
                            structure = creep.room.storage;
                        }
                        if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.travelTo(structure);
                        }
                    }
                }
                else {
                    let structure = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: (s) => ( (s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION) && s.energy < s.energyCapacity) })
                    if (structure == undefined) { // cannot find spawn or extensions or tower or they are full, find the storage
                        structure = creep.room.storage;
                    }
                    if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.travelTo(structure);
                    }
                }
            }
            else { // creep is near storage
                let structure = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: (s) => ( (s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION) && s.energy < s.energyCapacity) })
                if (structure == undefined) { // cannot find spawn or extensions or tower or they are full, find the storage
                    structure = creep.room.storage;
                }
                if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.travelTo(structure);
                }
            }
        }
        else { // if storage is not defined
            let structure = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: (s) => ( (s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION) && s.energy < s.energyCapacity) })
            if (structure) {
                if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.travelTo(structure);
                }
            }
            else { // cannot find spawn or extensions or tower or they are full, find the imaginary storage
                let centreLinkFlag = Game.flags['link'+creep.memory.home];
                let range = creep.pos.getRangeTo(centreLinkFlag);
                if (range<3) {
                    creep.drop(RESOURCE_ENERGY);
                }
                else {
                    creep.travelTo(centreLinkFlag);
                }
            }
        }
    }
}
