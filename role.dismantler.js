module.exports = {
    run: function(creep) {
      creep.say('presious...');
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
            if ((creep.room.name == creep.memory.target)||(creep.memory.target==undefined)) { // if in target (giver) room, go withdraw from storage:
                let presious = getTargetByFlag('Dismantle','structure');
                if (presious != undefined) { // if there is storage
                    if (creep.dismantle(presious, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(presious);
                    }
                }
                else {
                  var target = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES);
                  if (creep.dismantle(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                      creep.moveTo(target)
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
