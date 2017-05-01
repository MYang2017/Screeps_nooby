// move resource from storage to terminal for sell

module.exports = {
    run: function(creep) {
        //creep.say('begging');
        var load = _.sum(creep.carry);
        var resourceType = creep.memory.resourceType;
        if ( creep.memory.working == true && load == 0 ) {
            creep.memory.working = false;
        }
        else if (creep.memory.working == false && load == creep.carryCapacity) {
            creep.memory.working = true;
        }

        if (creep.memory.working == true) { // if working
          var terminal = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: (s) => ( (s.structureType == STRUCTURE_TERMINAL ) && (_.sum(s.store) < s.storeCapacity)) })
          if (terminal != undefined) { // terminal is found and not full
              if (creep.transfer(terminal, resourceType) == ERR_NOT_IN_RANGE) { // go to storage and put energy
                  creep.moveTo(terminal);
              }
          }
          else { // if cannot find the unfull terminal
              terminal = creep.room.storage; // find storage
              if (terminal != undefined) { // found a resevoir and not filled
                  if (creep.transfer(terminal, resourceType) == ERR_NOT_IN_RANGE) { // go to storage and put mineral
                      creep.moveTo(terminal);
                      if (_.sum(creep.carry)==0) { // if emety, task finished, become a pickuper
                        creep.memory.role = 'pickuper';
                      }
                  }
              }
          }
        }
        else { // working == false
          let giver = creep.room.storage;
          if (giver != undefined) { // if there is storage
              if (creep.withdraw(giver, resourceType) == ERR_NOT_IN_RANGE) {
                  creep.moveTo(giver);
              }
          }
        }
    }
};
