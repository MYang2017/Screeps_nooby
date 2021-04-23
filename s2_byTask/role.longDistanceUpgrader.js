module.exports = {
    run: function(creep) {
        if (creep.memory.working == true && creep.carry.energy == 0) {
            creep.memory.working = false;
        }
        else if (creep.memory.working == false && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
        }

        if (creep.memory.working == true) {
            if (creep.room.name == creep.memory.home) {
                creep.moveTo(creep.room.controller);
                creep.upgradeController(creep.room.controller);
            }
            else {
                creep.moveTo(new RoomPosition(25,25, creep.memory.home));
                //var exit = creep.room.findExitTo(creep.memory.home);
                //creep.moveTo(creep.pos.findClosestByRange(exit));
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
                    let energy = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {filter: {resourceType: RESOURCE_ENERGY}});
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
