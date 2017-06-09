// move resource from storage to terminal for sell

module.exports = {
    run: function(creep) {
        creep.say('anti-begging');
        var load = _.sum(creep.carry);
        var resourceType = creep.memory.resourceType;
        if ( creep.memory.working == true && load == 0 ) {
            creep.memory.working = false;
        }
        else if (creep.memory.working == false && load == creep.carryCapacity) {
            creep.memory.working = true;
        }

        if (creep.memory.working == true) { // if working
          var storage = creep.room.storage;
          if (storage != undefined) { // storage is found
              if (creep.transfer(storage, resourceType) == ERR_NOT_IN_RANGE) { // go to storage and put energy
                  creep.moveTo(storage);
              }
          }
        }
        else { // working == false
          let giver = creep.room.terminal;
          if (giver != undefined) { // if there is terminal
              if (creep.withdraw(giver, resourceType) == ERR_NOT_IN_RANGE) {
                  creep.moveTo(giver);
              }
          }
        }
    }
};
