let byHand = require('action.ontheway');
var dupCheck = require('action.dupCheck');

module.exports = {
    run: function(creep) {
        if (creep.room.terminal) {
            // go to spot
            
            /*if (creep.room.find(FIND_MY_CREEPS, {filter: c=>c.memory.role=='balancer'}).length>1) {
                creep.say('boob!')
                let sp = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: s=>s.structureType==STRUCTURE_SPAWN})
                creep.moveTo(sp);
                sp.recycleCreep(creep);
                return
            }*/
            
            let tobe = creep.room.memory.anchor;
            if (tobe == undefined) {
                tobe = creep.room.memory.newAnchor;
            }
            
            // cach structures
            let cachedToFillIds = creep.memory.toFill;
            let cachedToTakeIds = creep.memory.toTake;
            if (cachedToFillIds == undefined || cachedToTakeIds == undefined || Game.time&50==11) {
                let lands = returnALLAvailableLandCoords(creep.room, creep.pos);
                let toFillIds = [];
                for (let land of lands) {
                     let lound = creep.room.lookForAt(LOOK_STRUCTURES, land.x, land.y);
                     if (lound.length>0 && (lound[0].structureType == STRUCTURE_EXTENSION || lound[0].structureType == STRUCTURE_SPAWN || lound[0].structureType == STRUCTURE_TOWER)) {
                         toFillIds.push(lound[0].id);
                     }
                     if (lound.length>0 && (lound[0].structureType == STRUCTURE_STORAGE)) {
                         creep.memory.toTake = lound[0].id;
                     }
                }
                creep.memory.toFill = toFillIds;
            }
            
            if (creep.memory.in || creep.pos.x == tobe.x+1 && creep.pos.y == tobe.y-2) { // on spot, do job
                creep.memory.in = true;
                
                let senders = creep.room.memory.forLinks.linksIdsInRoom;
                
                let toFill = undefined;
                let toTake = undefined;
                
                let hasJob = undefined;
                
                for (let possiFillId of creep.memory.toFill) { // find spawn or extensions to fill
                    let possiFillObj = Game.getObjectById(possiFillId);
                    if (possiFillObj && (possiFillObj.store.energy<possiFillObj.store.getCapacity('energy'))) { // possiFillObj.store == null || possiFillObj.store.getCapacity() == null || 
                        if (_.sum(creep.store) > creep.store.energy) { // if carrying anything else
                            for (let tp in creep.store) {
                                if (tp != 'energy') { // dump all except energy
                                    creep.transfer(creep.room.storage, tp);
                                }
                            }
                        }
                        else { // not carrying anything else
                            if (creep.store.energy == 0) {
                                if (byHand.run(creep)) {
                                    return
                                }
                                else {
                                toTake = creep.room.storage;
                                    if (toTake.store.energy>0 && creep.withdraw(toTake, 'energy')==OK) {
                                        return
                                    }
                                    else {
                                        if (creep.room.terminal) {
                                            if (creep.withdraw(creep.room.terminal, 'energy')==OK) {
                                                return
                                            }
                                        }
                                    }
                                }
                            }
                            else {
                                if (creep.transfer(possiFillObj, 'energy') == OK) {
                                    return
                                }
                            }
                        }
                    }
                }

                // no fill job, do res balancing
                if (creep.memory.flowTask) { // if we have a task we do task first
                    let taskFrom = Game.getObjectById(creep.memory.flowTask.from);
                    let taskTo = Game.getObjectById(creep.memory.flowTask.to);
                    let resTp = creep.memory.flowTask.tp;
                    let a = creep.memory.flowTask.a;
                    // check if task finish or taskTo is full or taskFrom does not have any, we cancel quest
                    if ((a!=undefined&&a<=0)||(_.sum(taskTo.store)==taskTo.store.getCapacity())) {
                        creep.memory.flowTask = undefined;
                        creep.room.memory.resTask[resTp] = undefined;
                    }
                    else { // do job
                        if (_.sum(creep.store) > creep.store[resTp]) { // if carrying anything else
                            for (let tp in creep.store) {
                                if (tp != resTp) { // dump all except energy
                                    creep.transfer(creep.room.storage, tp);
                                    return
                                }
                            }
                        }
                        else { // not carrying anything else
                            if (creep.store[resTp] == 0) {
                                let takeRes = creep.withdraw(taskFrom, resTp);
                                if (takeRes==OK) {
                                    return
                                }
                                else if (takeRes == ERR_NOT_ENOUGH_RESOURCES) {
                                    creep.memory.flowTask = undefined;
                                    creep.room.memory.resTask[resTp] = undefined;
                                }
                            }
                            else {
                                if (creep.transfer(taskTo, resTp) == OK) {
                                    if (creep.memory.flowTask.a) { // track task amount
                                        creep.memory.flowTask.a -= creep.store[resTp];
                                    }
                                    return
                                }
                            }
                        }
                    }
                }
                else { // no fill task, take a resflow task
                    let resTasks = creep.room.memory.resTask;
                    if (resTasks && Object.keys(resTasks).length>0) {
                        if (resTasks.energy != undefined && (creep.room.storage.store.energy<5000||creep.room.terminal.store.energy<5000)) {
                            creep.memory.flowTask = {from: resTasks.energy.from, to: resTasks.energy.to, a:resTasks.energy.a, tp: 'energy'};
                            return
                        }
                        else {
                            for (let resTask in resTasks) {
                                let thisTask = resTasks[resTask];
                                if (thisTask == undefined) {
                                    
                                }
                                else {
                                    creep.memory.flowTask = {from: thisTask.from, to: thisTask.to, a:thisTask.a, tp: resTask};
                                    return
                                }
                            }
                        }
                    }
                }
            }
            else {
                creep.moveTo(tobe.x+1,tobe.y-2, {maxRooms: 1});
                dupCheck.run(creep);
            }
            
            // add spawn when about to die
            let tRem = creep.ticksToLive;
            if (creep.memory.spawnedBy) {
                let sp = Game.getObjectById(creep.memory.spawnedBy);
                if (tRem>2 && tRem<1200) {
                    sp.renewCreep(creep);
                }
            }
        }
        else {
            loading.run(creep);
        }
    }
};
