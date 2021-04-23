// move resource from terminal and storage to spawns and extensions, loading
var getOverwelmingEnergy = require('action.load');

module.exports = {
    run: function(creep) {
        creep.say('anti-begging');
        var load = _.sum(creep.carry);
        var resourceType = creep.memory.resourceType;
        if ( creep.memory.working == true && load == 0 ) {
            creep.memory.working = false;
        }
        else if (creep.memory.working == false && load == creep.carryCapacity) {
            creep.memory.working = true;
        }

        if (creep.memory.working == true) { // if working
            //getOverwelmingEnergy.run(creep);
            let toFill = creep.room.storage;
            if (creep.transfer(toFill, resourceType) == ERR_NOT_IN_RANGE) {
                creep.travelTo(toFill);
            }
        }
        else { // working == false
            let giver = creep.room.terminal;
            if ((giver == undefined)||(giver.store[resourceType]<5000)){ // if there is no terminal or terminal energy too small
                giver = creep.room.storage; // get energy from storage
            }
            if (creep.withdraw(giver, resourceType) == ERR_NOT_IN_RANGE) {
                creep.moveTo(giver);
            }
        }
    }
};
