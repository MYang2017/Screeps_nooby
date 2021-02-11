var selfRecycling = require('action.selfRecycle');

module.exports = {
    run: function(creep) {
          creep.say('pauwa',true);
          if (creep.memory.working == true && _.sum(creep.carry) == 0) {
              creep.memory.working = false;
          }
          else if (creep.memory.working == false && _.sum(creep.carry) > 0) {
              creep.memory.working = true;
          }

          if (creep.memory.working == true) {
              if (creep.room.name != creep.memory.home) { // if not at home base
                  creep.travelTo(new RoomPosition(25,25,creep.memory.home));
              }
              else { // creep at home, transfer power to storage
                var storage = creep.room.storage;
                if (creep.transfer(storage, RESOURCE_POWER) == ERR_NOT_IN_RANGE) { // transfer energy to storage
                    creep.moveTo(storage);
                }
              }
          }
          else { // working is false, take power
              if (creep.memory.readyToDie) {
                  if (creep.room.name != creep.memory.home) {
                      creep.travelTo(new RoomPosition(25, 25, creep.memory.home));
                  }
                  else {
                      // finished duty and recycle
                      selfRecycling.run(creep);
                  }
              }
              else {
                  if (creep.room.name == creep.memory.target) { // if not in target room go to target room, if in:
                      var power = creep.room.find(FIND_DROPPED_RESOURCES);
                      if (power.length) { // if there is mineral dropped
                          creep.moveTo(power[0]);
                          if (creep.pickup(power[0]) == OK) {
                              creep.memory.readyToDie = true;
                          }
                      }
                      else { // no power dropped, go to power bank
                          var target = creep.room.find(FIND_HOSTILE_STRUCTURES, { filter: c => c.structureType == STRUCTURE_POWER_BANK })[0];
                          if (target != undefined) {
                              if (creep.pos.getRangeTo(target) > 3) {
                                  creep.moveTo(target)
                              }
                              if (target.hits / target.ticksToDecay > 1000) {
                                  creep.memory.readyToDie = true;
                              }
                          }
                          else {
                              creep.memory.readyToDie = true;
                          }
                      }
                  }
                  else {
                      if (creep.memory.readyToDie) {
                          // finished duty and recycle
                          selfRecycling.run(creep);
                      }
                      else {
                          creep.travelTo(new RoomPosition(25, 25, creep.memory.target), { range: 15 });
                      }
                  }
              }
          }
    }
};
