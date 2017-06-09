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
            var myHealer = creep.room.find(FIND_MY_CREEPS, { filter: (s) => (s.getActiveBodyparts(HEAL)>0) } );
            if (myHealer != undefined) { // if healer around, attack power source
                if (creep.hits > creep.hitsMax*0.8) { // only attack if health > 80%
                    var target = creep.room.find(FIND_HOSTILE_STRUCTURES, {filter: c => c.structureType==STRUCTURE_POWER_BANK});
                    if (target != undefined) {
                        if (creep.attack(target[0]) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(target[0])
                        }
                    }
                    else {
                        creep.moveTo(Game.flags[creep.memory.target].pos);
                    }
                }

            }
        }
        else { // go to target room
            //var exit = creep.room.findExitTo(creep.memory.target);
            creep.moveTo(Game.flags[creep.memory.target].pos);
        }
    }
};
