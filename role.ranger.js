var actionRunAway = require('action.idle');

module.exports = {
    run: function(creep) {
        creep.say('Biu~', true);
        //if (creep.hits > 0.9*creep.hitsMax) { // if full health
        if (true) {
          if (creep.room.name == creep.memory.target) { // if in target room
              /*var target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter: s => (!allyList().includes(s.owner))&&(s.getActiveBodyparts(HEAL) > 0)}); // find healer first
              if (target == undefined) { // if no healer, find hostile creeps
                  target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter: s => (!allyList().includes(s.owner))});
                  //console.log('attack '+target);
                  if (target == undefined) { // if no hostile creeps
                      creep.moveTo(Game.flags[creep.memory.target].pos); // gether at romote room flag
                  }
              }*/
              // find healer first
              var scan = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter: s => (!allyList().includes(s.owner))&&(s.getActiveBodyparts(HEAL) > 0)}); // find healer first
              if (scan == undefined) {
                  scan = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter: s => !allyList().includes(s.owner)}); // find other creeps
              }
              if (creep.attack(scan) == ERR_NOT_IN_RANGE) {
                  creep.rangedAttack(scan);
                  creep.moveTo(scan, { maxRooms: 1 });
              }
              if (scan == undefined) {
                  //creep.moveTo(Game.flags[creep.memory.target].pos);
                  actionRunAway.run(creep);
                  //creep.travelTo(new RoomPosition(25, 25, creep.memory.target), { range: 24 });
              }
          }
          else { // go to target room
              //var exit = creep.room.findExitTo(creep.memory.target);
              //creep.moveTo(Game.flags[creep.memory.target].pos);
              creep.travelTo(new RoomPosition(25, 25, creep.memory.target), { range: 24 });
          }
      }
      else { // if wound go to base to heal, hit and run
          var targets = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 3, {filter: s => (!allyList().includes(s.owner))});
          if(targets.length > 1) { // if more than 1 hostile targets, mass attack
              creep.rangedMassAttack();
              creep.attack(targets[0]);
              creep.moveTo(Game.flags[creep.memory.home]);
          }
          else if(targets.length == 1) { // if 1 hostile target, ranged attack it
              creep.rangedAttack(targets[0]);
              creep.attack(targets[0]);
              creep.moveTo(Game.flags[creep.memory.home]);
          }
      }
    }
};
