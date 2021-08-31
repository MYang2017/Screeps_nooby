module.exports = {
    run: function(creep) {
        
        let safeRn = function(rn) {
            let posirns = calculateNeighbourNames(rn);
            for (let posirn of posirns) {
                if (Game.rooms[posirn] && Game.rooms[posirn].find(FIND_HOSTILE_CREEPS, { filter: c => (!allyList().includes(c.owner.username)) && (c.getActiveBodyparts(ATTACK) + c.getActiveBodyparts(RANGED_ATTACK) > 0) }).length==0) {
                    return posirn;
                }

            }
            return posirns[0];
        }
        
        if (creep.room.controller && creep.room.controller.safeMode) {
            return false
        }
        
        if (creep.room.controller && creep.room.controller.my) {
        
            let home = creep.memory.home;
            if (home == undefined) {
                creep.memory.home = creep.room.name;
                home = creep.memory.home;
            }
            
            let r = Game.rooms[creep.memory.home];
            
            if (r==undefined) {
                fo('evac code bugged, home room destroyed?!');
            }
            else {
                let nukes = r.find(FIND_NUKES, {filter:n=>n.timeToLand<50});
                if (nukes.length==0) {
                    let enemies = r.find(FIND_HOSTILE_CREEPS, {filter: c=>((c.getActiveBodyparts(ATTACK)+c.getActiveBodyparts(RANGED_ATTACK)>0)&&(c.owner.username == 'Invader'))}); 
                    let tws = r.find(FIND_MY_STRUCTURES, {filter: c=>(c.structureType==STRUCTURE_TOWER && c.isActive())}); 
                    
                    if (tws.length==0 && enemies.length>0 ) {
                        let candidate = safeRn(creep.room.name);
                        creep.travelTo(new RoomPosition(25,25,candidate), {range: 20});
                        return true
                    }
                    else {
                        return false
                        if (creep.room.name == home) {
                            return false
                        }
                        else {
                            creep.travelTo(new RoomPosition(25,25,home), {range: 20});
                        }
                    }
                }
                else {
                    let candidate = safeRn(creep.room.name);
                    creep.travelTo(new RoomPosition(25,25,candidate), {range: 20});
                    return true
                }
            }
        }
        else {
            return false
        }

    }
}
