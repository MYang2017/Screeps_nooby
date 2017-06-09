module.exports = {
    run: function(creep) {
          creep.say('pauwa');
          if (creep.memory.working == true && _.sum(creep.carry) == 0) {
              creep.memory.working = false;
          }
          else if (creep.memory.working == false && _.sum(creep.carry) == creep.carryCapacity) {
              creep.memory.working = true;
          }

          if (creep.memory.working == true) {
              if (creep.room.name != creep.memory.home) { // if not at home base
                  creep.moveTo(Game.flags[creep.memory.home].pos);
              }
              else { // creep at home, transfer power to storage
                var storage = creep.room.storage;
                if (creep.transfer(storage, RESOURCE_POWER) == ERR_NOT_IN_RANGE) { // transfer energy to storage
                    creep.moveTo(structure);
                }
              }
          }
          else { // working is false, take power
              if (creep.room.name == creep.memory.target) { // if not in target room go to target room, if in:
                  var power = creep.room.find(FIND_DROPPED_RESOURCES);
                  if (power.length) { // if there is mineral dropped
                      creep.moveTo(power[0]);
                      creep.pickup(power[0]);
                  }
                  else { // no power dropped, go to power bank
                    var target = creep.room.find(FIND_HOSTILE_STRUCTURES, {filter: c => c.structureType==STRUCTURE_POWER_BANK});
                    if (target != undefined) {
                        creep.moveTo(target)
                    }
                  }
              }
              else {
                  creep.moveTo(Game.flags[creep.memory.target].pos);
              }
          }
    }
};
