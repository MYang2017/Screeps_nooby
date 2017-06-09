var actionRunAway = require('action.flee');

module.exports = {
    run: function(creep) {
        /*if (creep.room.name == creep.memory.target) { // if in target room
            creep.travelTo(Game.flags[creep.name].pos);
        }
        else { // go to target room
            var exit = creep.room.findExitTo(creep.memory.target);
            creep.travelTo(creep.pos.findClosestByRange(exit));
        }*/
        creep.travelTo(Game.flags[creep.name].pos);
        actionRunAway.run(creep)
    }
};

/*module.exports = {
    run: function(creep) {
        if (creep.room.name == creep.memory.target) { // if in target room
            let target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter: s => (!allyList().includes(s.owner))&&(s.getActiveBodyparts(HEAL) > 0)});
            if (target != undefined) { // found hostile creep
                if (creep.attack(target) == ERR_NOT_IN_RANGE) {
                    creep.travelTo(target)
                }
            }
            else {
              target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter: s => (!allyList().includes(s.owner))});
              if (target != undefined) { // found hostile creep
                  if (creep.attack(target) == ERR_NOT_IN_RANGE) {
                      creep.travelTo(target)
                  }
              }
              else {// no hostile and safe
                creep.travelTo(Game.flags[creep.name].pos)
              }
            }
        }
        else { // go to target room
            var exit = creep.room.findExitTo(creep.memory.target);
            creep.travelTo(creep.pos.findClosestByRange(exit));
        }
    }
};*/
