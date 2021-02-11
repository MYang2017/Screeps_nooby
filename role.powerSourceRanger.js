module.exports = {
    run: function(creep) {
        var destination;
        /*if ((creep.room.name == creep.memory.home) && (creep.carry.energy < creep.carryCapacity)){ // if just borned, take some energy
          var structure = creep.room.storage;
          if (creep.withdraw(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
              creep.moveTo(structure);
          }
        }
        else if ( (creep.room.name == 'E92N11') || (creep.room.name =='E91N11') || (creep.room.name =='E90N11') || (creep.room.name =='E92N12') || (creep.room.name =='E91N12') ) { // go in sequence
            destination = Game.flags['E90N12'].pos;
            creep.moveTo(destination);
        }
        else if ( (creep.room.name == 'E90N12') || (creep.room.name == 'E90N13') || (creep.room.name == 'E90N14') || (creep.room.name == 'E90N15') || (creep.room.name == 'E90N16') ) { // go in sequence
            destination = Game.flags['E90N17'].pos;
            creep.moveTo(destination);
        }
        else */if (creep.room.name == creep.memory.target) { // if in target room
            if (creep.hits > 0.7* creep.hitsMax) {
                let target = creep.room.find(FIND_HOSTILE_STRUCTURES, {filter: c => c.structureType==STRUCTURE_POWER_BANK});
                if (creep.pos.getRangeTo(target[0])>2) {
                    creep.moveTo(target[0]);
                }
                else {
                    creep.heal(creep);
                    creep.rangedAttack(target[0])
                }
            }
            else {
               creep.heal(creep);
            }
        }
        else { // go to target room
            //var exit = creep.room.findExitTo(creep.memory.target);
            creep.moveTo(Game.flags[creep.memory.target].pos);
        }
    }
};
