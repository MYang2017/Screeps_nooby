module.exports = {
    run: function(creep) {
      creep.say('stealling');
      if (creep.memory.working == true && _.sum(creep.carry) == 0) {
          creep.memory.working = false;
      }
      else if (creep.memory.working == false && _.sum(creep.carry) == creep.carryCapacity ) {
          creep.memory.working = true;
      }

      if (creep.memory.working == true) { // delivery
        if (creep.room.name == creep.memory.home) { // if in target room
          for(const resourceType in creep.carry) {
            if (resourceType==RESOURCE_ENERGY) { // carrying energy
              var structure = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: (s) => ( (s.structureType == STRUCTURE_TOWER || s.structureType == STRUCTURE_EXTENSION || s.structureType == STRUCTURE_SPAWN) && s.energy <s.energyCapacity) })
              if (structure == undefined) {
                  structure = creep.room.storage;
              }
              if (creep.transfer(structure, resourceType) == ERR_NOT_IN_RANGE) {
                  creep.moveTo(structure);
              }
            }
            else { // carrying minerals
              var structure = creep.room.storage;
              if (creep.transfer(structure, resourceType) == ERR_NOT_IN_RANGE) {
                  creep.moveTo(structure);
              }
            }
          }
        }
        else {
          var exit = creep.room.findExitTo(creep.memory.home);
          creep.moveTo(creep.pos.findClosestByRange(exit));
        }
      }
      else {
        if (creep.room.name == creep.memory.target) { // if in target room
          let target = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {filter: s => ((s.structureType == STRUCTURE_TOWER)||(s.structureType == STRUCTURE_EXTENSION)||(s.structureType == STRUCTURE_SPAWN))&&(s.energy>0)});
          //let target = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {filter: s => (s.structureType == STRUCTURE_TOWER)});
            //let target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter: s => (!allyList().includes(s.owner))});
            //console.log(creep.withdrow(target));
            if (target != undefined) { // found hostile creep
                if (creep.withdraw(target,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target)
                }
            }
        }
        else { // go to target room
            var exit = creep.room.findExitTo(creep.memory.target);
            creep.moveTo(creep.pos.findClosestByRange(exit));
        }
    }
  }
};
