module.exports = {
    run: function(creep) {
        
        let onTaskIdE = creep.memory.eTaskId;

        if (onTaskIdE !== undefined) { // creep have energy contract id
            if (creep.room.memory.taskE == undefined || creep.room.memory.taskE.contracts == undefined) { // no contract structure
                creep.memory.eTaskId == undefined; // remove stored id
                return false
            }
            let contract = creep.room.memory.taskE.contracts[onTaskIdE];
            if (contract) { // task still there, do task
                let askerId = contract.askerId;
                let askerCreep = Game.getObjectById(askerId);
                
                creep.room.visual.circle(askerCreep.pos, {fill: 'transparent', radius: 0.55, stroke: 'white', strokeWidth: 0.5});
                creep.room.visual.circle(creep.pos, {fill: 'transparent', radius: 0.55, stroke: 'red', strokeWidth: 0.5});
    
                if (askerCreep) { // if asker still alive
                    if (creep.memory.working == true) { // if working
                        let esitu = askerCreep.store.getUsedCapacity('energy');
                        let emax = askerCreep.store.getCapacity('energy');
                        // give e to asker
                        if (creep.transfer(askerCreep, 'energy') == OK || creep.transfer(askerCreep, 'energy') == ERR_FULL || esitu == emax) { // transferred, remove task
                            creep.travelTo(askerCreep, { maxRooms: 1 }); // to prevent walk away
                            creep.memory.eTaskId = undefined;
                            delete creep.room.memory.taskE.contracts[onTaskIdE];
                        }
                        else {
                            creep.travelTo(askerCreep, { maxRooms: 1 });
                        }
                    }
                    return true
                }
                else { // asker dead, remove task
                    creep.memory.eTaskId = undefined;
                    delete creep.room.memory.taskE.contracts[onTaskIdE];
                    return false
                }
            }
            else { // contract structure  is not there, clear own task
                creep.memory.eTaskId = undefined;
                return false
            }
        }
        else {
            if (!creep.room.memory.taskMove.offers.includes(creep.name)) {
                creep.room.memory.taskMove.offers.push(creep.name);
            }
            if (!creep.room.memory.taskE.offers.includes(creep.id)) {
                creep.room.memory.taskE.offers.push(creep.id);
            }
            if (!creep.room.memory.taskGetE.offers.includes(creep.id)) {
                creep.room.memory.taskGetE.offers.push(creep.id);
            }
            return false
        }
    }
};
