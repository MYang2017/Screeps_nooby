var actionRepair = require('action.repair');
var evac = require('action.evacuate');
let ge = require('action.getEnergy');

module.exports = {
    run: function(creep) {
        if (evac.run(creep)) {
            return
        }
        else {
            if (creep.memory.working == true && creep.carry.energy == 0) {
                creep.memory.working = false;
            }
            else if (creep.memory.working == false && creep.carry.energy == creep.carryCapacity) {
                creep.memory.working = true;
            }
    
            if (creep.memory.working == true) {
                actionRepair.run(creep);
            }
            else {
                ge.run(creep);
            }
        }
    }
};
