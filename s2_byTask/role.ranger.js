var actionRunAway = require('action.idle');
var actionRecycle = require('action.recycle');

module.exports = {
    run: function(creep) {
        creep.say('Biu~', true);
        //if (creep.hits > 0.9*creep.hitsMax) { // if full health
        if (creep.memory.recycle) {
            if (creep.room.name != creep.memory.home) {
                creep.travelTo(new RoomPosition(25,25,creep.memory.home));
            }
            else {
                actionRecycle.run(creep);
                return
            }
        }
        else {
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
              var scan = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter: s => (!allyList().includes(s.owner.username))&&(s.getActiveBodyparts(HEAL) > 0)}); // find healer first
              if (scan == undefined) {
                  scan = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter: s => !allyList().includes(s.owner.username)}); // find other creeps
              }

              if (creep.attack(scan) == ERR_NOT_IN_RANGE) {
                  creep.rangedAttack(scan);
                  creep.moveTo(scan, { maxRooms: 1 });
              }
              if (scan == undefined) {
                  //creep.moveTo(Game.flags[creep.memory.target].pos);
                  actionRunAway.run(creep);
                  creep.memory.recycle = true;
                  //creep.travelTo(new RoomPosition(25, 25, creep.memory.target), { range: 24 });
              }
              else {
                  
              }
            }
            else { // go to target room
                          //var exit = creep.room.findExitTo(creep.memory.target);
                          //creep.moveTo(Game.flags[creep.memory.target].pos);
                          creep.travelTo(new RoomPosition(25, 25, creep.memory.target), { range: 24 });
                      }
        }
    }
};
