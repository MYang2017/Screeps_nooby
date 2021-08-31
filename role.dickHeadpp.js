var byhand = require('action.ontheway');

module.exports = {
    run: function(creep) {
        
        let toFill = creep.memory.toFill;
        let toTake = creep.memory.toTake;
        let toStore = creep.memory.toStore;
        // check if position correct
        if (Game.time%50==0) {
            creep.memory.toFill=undefined;
            creep.memory.toTake=undefined;
            creep.memory.toStore=undefined;
        }
        if (toFill == undefined || (toStore && Game.getObjectById(toStore)==null) || (Game.time%50==0 && toStore == undefined)) {
            let lands = returnALLAvailableLandCoords(creep.room, creep.pos);
            let toFillIds = [];
            for (let land of lands) {
                 let lound = creep.room.lookForAt(LOOK_STRUCTURES, land.x, land.y);
                 let tocheck = undefined;
                 if (lound.length>1) {
                     for (let l of lound) {
                         if (l.structureType!=STRUCTURE_RAMPART && l.structureType!=STRUCTURE_CONTAINER && l.structureType!=STRUCTURE_ROAD) {
                             tocheck = l;
                             break;
                         }
                     }
                 }
                 else if (lound.length==1) {
                     tocheck = lound[0];
                 }
                 if (tocheck && (tocheck.structureType == STRUCTURE_EXTENSION)) {
                     toFillIds.push(tocheck.id);
                 }
                 if (tocheck && (tocheck.structureType == STRUCTURE_SPAWN)) {
                     creep.memory.toTake = tocheck.id;
                 }
                 if (tocheck && (tocheck.structureType == STRUCTURE_TOWER)) {
                     creep.memory.toStore = tocheck.id;
                 }
            }
            creep.memory.toFill = toFillIds;
            if (toStore == undefined && creep.store.energy>0) {
                let jobInc;
                for (let toFillId of toFillIds) {
                    let toFillStruct = Game.getObjectById(toFillId);
                    if (toFillStruct.store.energy<toFillStruct.store.getCapacity('energy')) {
                        jobInc = toFillStruct;
                        break;
                    }
                }
                creep.transfer(jobInc, 'energy')
                return
            }
        }
        else { // all structure cached
            let jobInc;
            for (let toFillId of toFill) {
                let toFillStruct = Game.getObjectById(toFillId);
                if (toFillStruct.store.energy<toFillStruct.store.getCapacity('energy')) {
                    jobInc = toFillStruct;
                    break;
                }
            }
            
            if (toTake == undefined) { // early stage no link setup
                if (jobInc !== undefined) { // something to fill
                    if (creep.store.energy==0) { // no enery
                        if (!byhand.run(creep)) {
                            if (toStore) {
                                let ctn = Game.getObjectById(toStore);
                                if (ctn.store.energy>0) {
                                    creep.withdraw(ctn, 'energy');
                                }
                            }
                        }
                    }
                    else { // has energy, fill
                        if (creep.transfer(jobInc, 'energy') == OK) {
                            return;
                        }
                    }
                }
            }
            else {
                if (jobInc !== undefined) { // something to fill
                    if (creep.store.energy==0) { // no enery
                        if (!byhand.run(creep)) {
                            let linko = Game.getObjectById(toTake);
                            if (linko&&linko.store.energy>0) {
                                creep.withdraw(linko, 'energy');
                            }
                            else {
                                if (toStore) {
                                    let ctn = Game.getObjectById(toStore);
                                    if (ctn.store.energy>0) {
                                        creep.withdraw(ctn, 'energy');
                                    }
                                }
                            }
                        }
                    }
                    else { // has energy, fill
                        if (creep.transfer(jobInc, 'energy') == OK) {
                            return;
                        }
                    }
                }
                else { // nothing to fill
                    if (!byhand.run(creep)) {
                        let linko = Game.getObjectById(toTake);
                        let ctn = Game.getObjectById(toStore);
                        if (ctn && ctn.store.getFreeCapacity('energy')>200) {
                            if (creep.store.energy>0) {
                                creep.transfer(ctn, 'energy');
                            }
                            else {
                                creep.withdraw(linko, 'energy');
                            }
                        }
                    }
                }
            }
        }
        
        // add spawn when about to die
        let tRem = creep.ticksToLive;
        if (tRem<300) {
            let spss = creep.pos.findInRange(FIND_MY_STRUCTURES, 1, {filter:c=>c.structureType==STRUCTURE_SPAWN && c.spawning==null});
            if (spss.length>0) {
                spss[0].renewCreep(creep);
            }
        }
    }
};
