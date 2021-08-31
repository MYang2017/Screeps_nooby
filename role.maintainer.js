module.exports = {
    run: function(creep) {
        // cach structures
        let cachedToFillIds = creep.memory.toFill;
        let cachedToTakeIds = creep.memory.toTake;
        let cachedPS = creep.memory.pid;
        let cachedTM = creep.memory.termid;
        let spId;
        if (cachedToFillIds == undefined || cachedToTakeIds == undefined || (Game.time&1111==11||(creep.room.memory.forSpawning.roomCreepNo.minCreeps['builder'] > 0 && Game.time%77 == 3))) {
            let lands = returnALLAvailableLandCoords(creep.room, creep.pos);
            let toFillIds = [];
            let toTakeId = undefined;
            let twid = undefined;
            let termid = undefined;
            let pid = undefined;
            for (let land of lands) {
                let lound = creep.room.lookForAt(LOOK_STRUCTURES, land.x, land.y);
                if (lound.length>0) {
                    if (lound[0].structureType == STRUCTURE_EXTENSION) {
                        toFillIds.push(lound[0].id);
                    }
                    else if (lound[0].structureType == STRUCTURE_SPAWN) {
                        spId = lound[0].id;
                    }
                    else if (lound[0].structureType == STRUCTURE_TERMINAL) {
                        termid = lound[0].id;
                        creep.memory.termid = lound[0].id;
                    }
                    else if (lound[0].structureType == STRUCTURE_TOWER) {
                        twid = lound[0].id;
                    }
                    else if (lound[0].structureType == STRUCTURE_POWER_SPAWN) {
                        creep.memory.pid = lound[0].id;
                        pid = lound[0].id;
                    }
                }
            }
            
            if (termid) {
                if (twid) {
                    toFillIds.push(twid);
                }
                if (pid) {
                    toFillIds.push(pid);
                }
                toFillIds.push(spId);
                toTakeId = termid;
            }
            else if (twid) {
                toTakeId = twid;
                if (pid) {
                    toFillIds.push(pid);
                }
                toFillIds.push(spId);
            }
            else if (pid) {
                toTakeId = pid;
                toFillIds.push(spId);
            }
            else {
                toTakeId = spId;
            }
            
            creep.memory.toTake = toTakeId;
            creep.memory.toFill = toFillIds;
        }
        
        let toFill = undefined;
        let toTake = undefined;
        
        for (let possiFillId of creep.memory.toFill) { // find spawn or extensions to fill
            let possiFillObj = Game.getObjectById(possiFillId);
            if (possiFillObj==undefined) {
                removeElementInArrayByElement(possiFillId, creep.memory.toFill);
            }
            if (possiFillObj && ((possiFillObj.structureType != STRUCTURE_POWER_SPAWN && possiFillObj.store.energy<possiFillObj.store.getCapacity('energy')) || (possiFillObj.store.power>0 && possiFillObj.store.getFreeCapacity('energy')>0) )) { // possiFillObj.store == null || possiFillObj.store.getCapacity() == null || 
                toFill = possiFillObj;
                break;
            }
        }
        
        if (toFill) {
            toTake = Game.getObjectById(creep.memory.toTake);
            if (toTake==undefined) {
                creep.memory.toTake = undefined;
            }
            if (creep.store.power) {
                creep.transfer(toTake, 'power');
            }
            else { 
                if (creep.store.energy == 0) {
                    if (toTake.store.energy>0) {
                        creep.withdraw(toTake, 'energy');
                    }
                    else {
                        // no energy souce, idle
                    }
                }
                else {
                    creep.transfer(toFill, 'energy');
                }
            }
        }
        else {
            // no energy fill job, power?
            if (cachedPS && cachedTM && Game.getObjectById(cachedPS)) {
                if (creep.store.power) {
                    creep.transfer(Game.getObjectById(cachedPS), 'power', Math.min(creep.store.power, Game.getObjectById(cachedPS).store.getFreeCapacity('power')));
                }
                else if (Game.getObjectById(cachedPS).store.power<10 ) {
                    toTake = Game.getObjectById(creep.memory.toTake);
                    if (toTake.store.power) {
                        creep.withdraw(toTake, 'power', 90);
                    }
                }
                if (creep.room.terminal.store.power<1000) {
                    addResFlowTask(creep.room.name, creep.room.storage.id, cachedTM, 'power', Math.min(5000, creep.room.storage.store.power), true);
                }
            }
        }
        
        // add spawn when about to die
        let tRem = creep.ticksToLive;
        if (creep.memory.spawnedBy) {
            let sp = Game.getObjectById(creep.memory.spawnedBy);
            if (tRem<350 && sp.spawning==null) {
                sp.renewCreep(creep);
            }
        }
        if (tRem==2) {
            creep.room.memory.maintainerCheck[parseInt(creep.memory.posiNum)-1] = false;
        }
    }
};
