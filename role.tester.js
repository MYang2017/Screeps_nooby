module.exports = {
    run: function(creep) {
        if (true) {
            let sp = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter: s=>s.structureType==STRUCTURE_SPAWN});
            if (sp) {
                //fo('recycling ' + creep.memory.role + ' at ' + creep.pos);
                creep.travelTo(sp, {maxRooms: 1})
                sp.recycleCreep(creep);
                return true
            }
        }
        else {
            creep.move(getRandomInt(1,8));
        }
    }
};
