module.exports = {
    run: function (creep) {
        
        let ctrl = creep.room.controller;
        
        let dist = creep.pos.getRangeTo(ctrl);
        creep.memory.dist = dist;
        
        // move to ctrl
        if (dist>1) {
            creep.moveTo(ctrl, {maxRooms: 1});
        }
        
        creep.upgradeController(ctrl);
        
        // look for creeps around with range closer
        // pass energy to that creep if his e<1/2
        let cps = creep.room.find(FIND_MY_CREEPS);
        for (let cp of cps) {
            if (cp.memory.role == 'smartupgrade' && cp.memory.dist<dist && cp.store.energy<cp.store.getCapacity()/2) {
                if (creep.transfer(cp, 'energy')==OK) {
                    return
                }
            }
        }
        
    }
};
