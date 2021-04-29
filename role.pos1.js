module.exports = {
    run: function(creep) {
        
        // pos 1 creep do not need to move at all
        
        // logic
        // fill order: sp > extension > link (when it has cd < 2) > ps
        // get order: link (if giver link cds < 8) > s
        
        // spawn condition, when link and storage ready
        // spawn direction, BOTTOM_RIGHT
        // by sp #1
        
        // size carry 400 at least
        
        
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
