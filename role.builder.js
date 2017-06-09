var actionGetEnergy = require('action.getEnergy');
var actionBuild = require('action.build');

module.exports = {
    run: function(creep) {
        creep.say('building');
        if (creep.memory.working == true && creep.carry.energy == 0) {
            creep.memory.working = false;
        }
        else if (creep.memory.working == false && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
        }

        if (creep.memory.working == true) {
            actionBuild.run(creep);
        }
        else { // finding resources
            actionGetEnergy.run(creep);
        }
    }
};
