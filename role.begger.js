// for newly created rooms, transport energy from mature rooms to current base room

var rolePickuper = require('role.pickuper');

module.exports = {
    run: function(creep) {
        creep.say('begging');
        if (creep.memory.working == true && creep.carry.energy == 0) {
            creep.memory.working = false;
        }
        else if (creep.memory.working == false && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
        }

        if (creep.memory.working == true) { // if working
            if (creep.room.name != creep.memory.home) { // if not at home base, go back to home base
                creep.moveTo(new RoomPosition(25,25, creep.memory.home)); 
            }
            else if (creep.room.name == creep.memory.home) { // back to home, finish begging
                var pocket = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: (s) => ( (s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION || s.structureType == STRUCTURE_TOWER) && s.energy < s.energyCapacity) })
                if (pocket != undefined) { // first consider put energy into storage
                    if (creep.transfer(pocket, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) { // go to storage and put energy
                        creep.moveTo(pocket);
                    }
                }
                else { // if cannot find a unfull spawn or extensions or tower, find a storage
                    pocket = creep.room.storage;
                    if (pocket != undefined) { // found a resevoir and not filled
                        if (creep.transfer(pocket, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) { // go to resevoir and put energy
                            creep.moveTo(pocket);
                        }
                    }
                    else { // they are full, find a container
                        pocket = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_CONTAINER});
                        if (creep.transfer(pocket, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) { // go to container and put energy
                            creep.moveTo(pocket);
                        }
                    }
                }
            }
        }
        else { // working == false
            if (creep.room.name == creep.memory.target) { // if in target (giver) room, go withdraw from storage:
                let giver = creep.room.storage;
                if (giver != undefined) { // if there is storage
                    if (creep.withdraw(giver, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(giver);
                    }
                }
                else { // if there is no storage (which could be possible after destroyed), try picking up some energy
                    let energy = creep.pos.findClosestByRange(FIND_DROPPED_ENERGY);
                    if (creep.pickup(energy) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(energy);
                    }
                }
            }
            else { // if not in target room, move to target room
                creep.moveTo(new RoomPosition(25,25, creep.memory.target));
                //var exit = creep.room.findExitTo(creep.memory.target);
                //creep.moveTo(creep.pos.findClosestByRange(exit));
            }
        }
    }
};