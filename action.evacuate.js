module.exports = {
    run: function(creep) {
        
        let home = creep.memory.home;
        if (home == undefined) {
            creep.memory.home = creep.room.name;
            home = creep.memory.home;
        }
        
        let r = Game.rooms[creep.memory.home];
        let enemies = r.find(FIND_HOSTILE_CREEPS, {filter: c=>((c.getActiveBodyparts(ATTACK)+c.getActiveBodyparts(RANGED_ATTACK)>0)&&(!allyList().includes(c.owner.username) ))}); 
        let tws = r.find(FIND_MY_STRUCTURES, {filter: c=>(c.structureType==STRUCTURE_TOWER)}); 
        
        if (tws.length==0 && enemies.length>0 ) {
            let candidates = calculateNeighbourNames(creep.room.name);
            let candidate = candidates[0];
            creep.travelTo(new RoomPosition(25,25,candidate), {range: 20});
            return true
        }
        else {
            if (creep.room.name == home) {
                return false
            }
            else {
                creep.travelTo(new RoomPosition(25,25,home), {range: 20});
            }
        }

    }
}
