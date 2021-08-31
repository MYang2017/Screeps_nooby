var getE = require('action.getEnergy');

module.exports = {
    run: function(creep) {
        let cl = creep.room.controller;
        if (cl) {
            if (creep.pos.getRangeTo(cl)>3) {
                creep.travelTo(cl, {maxRooms: 1, range: 3});
                return
            }
            else if (creep.pos.findInRange(FIND_MY_CREEPS, 1, {filter: c=>c.store.getFreeCapacity('energy')==0}).length>0) {
                creep.travelTo(cl, {maxRooms: 1, range: 1});
                creep.upgradeController(cl);
                return
            }
            else {
                creep.upgradeController(cl);
                return
            }
            /*
            if (creep.pos.getRangeTo(cl)==4 && creep&&creep.memory&&creep.memory._trav&&creep.memory._trav.state&&creep.isStuck(creep, creep.memory._trav.state)) {
                let uppers = creep.room.find(FIND_MY_CREEPS, {filter: c=>(c.memory.role=='upgrader'||c.memory.role=='pioneer')&&c.pos.getRangeTo(cl)<=3&&c.store.energy>0});
                for (let upper of uppers) {
                    upper.travelTo(cl, {maxRooms: 1});
                }
            }
            */
            let storage = creep.room.storage;
            if (storage) { // if storge is defined and next to upgrader, take resource
                if (creep.pos.getRangeTo(storage) == 1) {
                    creep.withdraw(storage, RESOURCE_ENERGY);
                }
            }
        }
        else {
            fo('doogy upgrade room ' + creep.room.name + ' no controller');
        }
    }
};
