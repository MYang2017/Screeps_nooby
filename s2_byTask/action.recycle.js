module.exports = {
    run: function(creep) {
        let boosted = undefined;
        for (let b of creep.body) {
            if (b.boost) {
                boosted = true;
                break;
            }
        }
        
        if (boosted) {
            let labs = creep.room.find(FIND_MY_STRUCTURES, {filter: s=>s.structureType==STRUCTURE_LAB&&s.cooldown==0});
            if (labs.length>0) {
                if (creep.pos.getRangeTo(labs[0])>1) {
                    creep.travelTo(labs[0]);
                }
                else {
                    labs[0].unboostCreep(creep);
                }
                return
            }
        }
        
        let sp = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter: s=>s.structureType==STRUCTURE_SPAWN});
        if (sp) {
            //fo('recycling ' + creep.memory.role + ' at ' + creep.pos);
            creep.travelTo(sp)
            sp.recycleCreep(creep);
        }
        else {
            let cp = creep.pos.findClosestByRange(FIND_MY_CREEPS, {filter: c=>c.name!==creep.name});
            if (cp&&creep.pos.getRangeTo(cp)>1) {
                creep.travelTo(cp);
            }
            else {
                creep.suicide();
            }
        }
    }
};
