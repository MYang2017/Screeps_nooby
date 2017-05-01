var roleBuilder = require('role.builder');
var roleDismantler = require('role.dismantler');

module.exports = {
    run: function(creep) {
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
            var exit = creep.room.findExitTo(creep.memory.target);
            creep.moveTo(creep.pos.findClosestByRange(exit));
        }
    }
};
