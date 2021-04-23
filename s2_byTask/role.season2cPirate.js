var doge = require('action.idle');

module.exports = {
    run: function(creep) {
        // if creep born time undi
        if (creep.room.name!=creep.memory.target) {
            storedTravelFromAtoB(creep, 'l')
        }
        else { // if not in target
            // in target
            
            // find adspof
            let ap = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter: s=>!allyList().includes(s.owner.username) });
            if (ap) { // adspof found
                creep.moveTo(ap);
                creep.attack(ap);
                creep.rangedAttack(ap);
                creep.say('🏴☠️' , true);
            }
            else {
                let symb = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {filter: r=>r.resourceType==creep.memory.stp});
                //let tomb = creep.pos.findClosestByRange(FIND_T, {filter: r=>r.resourceType==creep.memory.stp});
                let full = creep.store.getFreeCapacity('energy')==0;
                if (symb && !full) { // if symbol dropped with type && not full
                    if (creep.pos.getRangeTo(symb)>1) {
                        creep.moveTo(symb, {maxRooms: 1});
                    }
                    else {
                        creep.pickup(symb);
                    }
                }
                else { // else no symbol dropped or full
                    let decoder = creep.room.find(FIND_SYMBOL_DECODERS)[0];
                    if (_.sum(creep.store)>0) { // if carry
                        if (creep.pos.getRangeTo(decoder)>1) {
                            creep.moveTo(decoder, {maxRooms: 1});
                        }
                        else {
                            creep.transfer(decoder, creep.memory.stp);
                        }
                    }
                    else { // no res, idle
                        // go around decoder
                        if (creep.pos.getRangeTo(decoder)>2) {
                            creep.moveTo(decoder, {maxRooms: 1});
                        }
                        else {// avoid
                            if (creep.pos.findInRange(FIND_HOSTILE_CREEPS, 1).length>0) {
                                doge.run(creep);
                            }
                        }
                    }
                }
            }
        }
    }
};
