var rolePickuper = require('role.pickuper');
var actionAvoid = require('action.idle');

module.exports = {
    run: function(creep) {
        creep.say('linking');
        let receiverLink = creep.room.memory.forLinks.receiverLinkId;
        let rl = Game.getObjectById(receiverLink);

        if (creep.memory.working == true && _.sum(creep.carry) == 0) {
            creep.memory.working = false;
        }
        else if ( creep.memory.working == false && _.sum(creep.carry) > 0) {//} == creep.carryCapacity ) {
            creep.memory.working = true;
        }
        
        if (creep.memory.working == true) { // put energy into structures

        if (creep.transfer(rl, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(rl);
            }
        }
        else { // get energy from link
            if (creep.withdraw(creep.room.storage, 'energy') == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.storage);
            }
        }
                
        
    }
};
