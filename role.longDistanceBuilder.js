var roleBuilder = require('role.builder');
var roleDismantler = require('role.dismantler');
var actionBuild = require('action.build');

module.exports = {
    run: function(creep) {
      if ((Game.rooms[creep.memory.target]==undefined)||(Game.rooms[creep.memory.target].memory.ifPeace == false)) { // room under attack, run away
         creep.say('run away');
         if (creep.memory.home == undefined) {
               creep.travelTo(Game.flags[creep.memory.target+'_shelter'].pos);
         }
         else {
               if (creep.room.name != creep.memory.home) { // if not at home base
                   creep.travelTo(new RoomPosition(25,25, creep.memory.home));
               }
               else if (creep.room.name == creep.memory.home) {
                   roleBuilder.run(creep);
               }
         }
      }
      else {
        creep.say('build here die here');
        if (creep.room.name == creep.memory.target) {
            /*if (creep.room.name == 'E91N12') { // if invading room
                roleDismantler.run(creep);
            }
            else {
            // if creep in target room then work
                roleBuilder.run(creep);
            }*/
            roleBuilder.run(creep);
        }
        else { // go to target room
            //var exit = creep.room.findExitTo(creep.memory.target);
            //creep.travelTo(creep.pos.findClosestByRange(exit));
            //creep.travelTo(Game.flags[creep.memory.target].pos);
            creep.travelTo(new RoomPosition(25, 25, creep.memory.target));
        }
      }
    }
};
