let byHand = require('action.ontheway');
var dupCheck = require('action.dupCheck');

module.exports = {
    run: function(creep) {
        if (creep.room.terminal) {
            // go to spot
            
            if (_.sum(creep.store)==0 && Game.time%50<=3 && creep.getActiveBodyparts(CARRY)<5 && creep.room.terminal && (creep.room.terminal.store.energy > 100000 || _.sum(creep.room.terminal.store) > 200000 || (creep.room.storage && _.sum(creep.room.storage.store) > 800000))) {
                let sp = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: s=>s.structureType==STRUCTURE_SPAWN})
                sp.recycleCreep(creep);
                return
            }
            
            let tobe = creep.room.memory.anchor;
            if (tobe == undefined) {
                tobe = creep.room.memory.newAnchor;
            }
            
            // cach structures
            let cachedToFillIds = creep.memory.toFill;
            let cachedToTakeIds = creep.memory.toTake;
            if (cachedToFillIds == undefined || cachedToTakeIds == undefined || cachedToFillIds.length==0 || Game.time&50==11) {
                let lands = returnALLAvailableLandCoords(creep.room, creep.pos);
                let toFillIds = [];
                for (let land of lands) {
                    let lound = creep.room.lookForAt(LOOK_STRUCTURES, land.x, land.y);
                    if (lound.length>0) {
                        if ((lound[0].structureType == STRUCTURE_EXTENSION || lound[0].structureType == STRUCTURE_SPAWN || lound[0].structureType == STRUCTURE_TOWER)) {
                            toFillIds.push(lound[0].id);
                        }
                        if ((lound[0].structureType == STRUCTURE_STORAGE)) {
                            creep.memory.toTake = lound[0].id;
                        }
                        if (lound[0].structureType == STRUCTURE_POWER_SPAWN) {
                            toFillIds.push(lound[0].id);
                        }
                    }
                }
                creep.memory.toFill = toFillIds;
            }
            
            if (creep.memory.in || creep.pos.x == tobe.x+1 && creep.pos.y == tobe.y-2) { // on spot, do job
                let senders = creep.room.memory.forLinks.linksIdsInRoom;
                
                let toFill = undefined;
                let toTake = undefined;
                
                let hasJob = undefined;
                
                let pid = creep.room.memory.powerSpawnId;
                let ps = Game.getObjectById(pid)
                
                // supwer power priority
                if (pid && ps) {
                    if (ps.effects && ps.effects.length>0) {
                        if (creep.store.power>0) {
                            if (ps.store.power<50) {
                                creep.transfer(ps, 'power');
                                return
                            }
                            else {
                                if (creep.memory.flowTask && creep.memory.flowTask.tp == 'power') {
                                    // skip to task
                                }
                                else {
                                    let ptp = putATypeOfRes(creep.room, 'power');
                                    if (ptp) {
                                        creep.transfer(ptp, 'power');
                                    }
                                    else {
                                        fo(creep.room + 'term and stor exploded for balancer');
                                    }
                                    return
                                }
                            }
                        }
                        if (ps.store.power<50 && creep.room.memory.mineralThresholds.currentMineralStats.power>0) {
                            if (_.sum(creep.store)-creep.store.power>0) { // holding something else
                                if (creep.store.energy) {
                                    let ptp = putATypeOfRes(creep.room, 'energy');
                                    if (ptp) {
                                        creep.transfer(ptp, 'energy');
                                    }
                                    else {
                                        fo(creep.room + 'term and stor exploded for balancer');
                                    }
                                    return
                                }
                            }
                            else {
                                if (_.sum(creep.store)-creep.store.power-creep.store.energy>0) {
                                    // carry other mats, continue with resTasks
                                }
                                else {
                                    let ptp = getATypeOfRes(creep.room, 'power');
                                    if (ptp) {
                                        creep.withdraw(ptp, 'power', Math.min(50, ptp.store.power));
                                        return
                                    }
                                }
                            }
                        }
                    }
                }
                
                for (let possiFillId of creep.memory.toFill) { // find spawn or extensions to fill
                    let possiFillObj = Game.getObjectById(possiFillId);
                    if (possiFillObj) {
                        if (possiFillObj && ((possiFillObj.structureType != STRUCTURE_POWER_SPAWN && possiFillObj.store.energy<possiFillObj.store.getCapacity('energy')) || (possiFillObj.store.power>0 && possiFillObj.store.getFreeCapacity('energy')>1000) )) { // possiFillObj.store == null || possiFillObj.store.getCapacity() == null || 
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
                    else {
                        creep.memory.toFill = undefined;
                    }
                }
                
                if (creep.ticksToLive>5) {
                    // take or put power
                    if (pid && ps) {
                        if (creep.store.power>0) {
                            if (ps.store.power<50) {
                                creep.transfer(ps, 'power');
                                return
                            }
                            else {
                                if (creep.memory.flowTask && creep.memory.flowTask.tp == 'power') {
                                    // skip to task
                                }
                                else {
                                    let ptp = putATypeOfRes(creep.room, 'power');
                                    if (ptp) {
                                        creep.transfer(ptp, 'power');
                                    }
                                    else {
                                        fo(creep.room + 'term and stor exploded for balancer');
                                    }
                                    return
                                }
                            }
                        }
                        if (ps.store.power<50 && creep.room.memory.mineralThresholds.currentMineralStats.power>0) {
                            if (_.sum(creep.store)-creep.store.power>0) { // holding something else
                                if (creep.store.energy) {
                                    let ptp = putATypeOfRes(creep.room, 'energy');
                                    if (ptp) {
                                        creep.transfer(ptp, 'energy');
                                    }
                                    else {
                                        fo(creep.room + 'term and stor exploded for balancer');
                                    }
                                    return
                                }
                            }
                            else {
                                if (_.sum(creep.store)-creep.store.power-creep.store.energy>0) {
                                    // carry other mats, continue with resTasks
                                }
                                else {
                                    let ptp = getATypeOfRes(creep.room, 'power');
                                    if (ptp) {
                                        creep.withdraw(ptp, 'power', Math.min(50, ptp.store.power));
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
                        let urg = creep.memory.flowTask.urg;
                        // if we are not urg, check every x ticks for urg task
                        if (urg==undefined && Game.time%33==0) {
                            let resTasks = creep.room.memory.resTask;
                            if (resTasks && Object.keys(resTasks).length>0) {
                                let hasUrg = undefined;
                                for (let resTask in resTasks) {
                                    let thisTask = resTasks[resTask];
                                    if (thisTask == undefined) {
                                    }
                                    else {
                                        if (thisTask.urg) {
                                            hasUrg = resTask;
                                            break;
                                        }
                                    }
                                }
                                if (hasUrg) {
                                    let thisTask = resTasks[hasUrg];
                                    creep.memory.flowTask = {from: thisTask.from, to: thisTask.to, a:thisTask.a, tp: hasUrg, urg: true};
                                    taskFrom = Game.getObjectById(creep.memory.flowTask.from);
                                    taskTo = Game.getObjectById(creep.memory.flowTask.to);
                                    resTp = creep.memory.flowTask.tp;
                                    a = creep.memory.flowTask.a;
                                    urg = creep.memory.flowTask.urg;
                                }
                                else {
                                    // pass
                                }
                            }
                        }
                        
                        // if already on this task to fill, carrying the relevant mat
                        if (a!=undefined && creep.store[resTp]>0) {
                            if (creep.transfer(taskTo, resTp) == OK) {
                                if (creep.memory.flowTask.a) { // track task amount
                                    creep.memory.flowTask.a -= creep.store[resTp];
                                }
                                return
                            }
                        }
                        // check if task finish or taskTo is full or taskFrom does not have any, we cancel quest
                        else if ((a!=undefined&&a<=0)||(_.sum(taskTo.store)==taskTo.store.getCapacity())||(taskFrom.store[resTp]<a)) {
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
                            let hasUrg = undefined;
                            for (let resTask in resTasks) {
                                let thisTask = resTasks[resTask];
                                if (thisTask == undefined) {
                                }
                                else {
                                    if (thisTask.urg) {
                                        hasUrg = resTask;
                                        break;
                                    }
                                }
                            }
                            if (hasUrg) {
                                let thisTask = resTasks[hasUrg];
                                creep.memory.flowTask = {from: thisTask.from, to: thisTask.to, a:thisTask.a, tp: hasUrg, urg: true};
                                return
                            }
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
                else { // TTL < 10
                    if (_.sum(creep.store)>creep.store.energy) { // carrying none energy
                        for (let res in creep.store) {
                            creep.transfer(creep.room.storage, res);
                        }
                    }
                }
            }
            else {
                let oc = creep.room.lookForAt(LOOK_CREEPS, tobe.x + 1, tobe.y - 2);
                if(oc.length && oc[0].memory.role != 'balancer') {
                    oc[0].moveTo(creep);
                }
                creep.travelTo(new RoomPosition(tobe.x+1,tobe.y-2, creep.room.name), {maxRooms: 1});
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
            // loading.run(creep);
            if (creep.ticksToLive>10) {
                // take or put power
                let pid = creep.room.memory.powerSpawnId;
                let ps = Game.getObjectById(pid)
                if (pid && ps) {
                    if (creep.store.power>0) {
                        if (ps.store.power<50) {
                            creep.transfer(ps, 'power');
                        }
                        else {
                            let ptp = putATypeOfRes(creep.room, 'power');
                            if (ptp) {
                                creep.transfer(ptp, 'power');
                            }
                            else {
                                fo(creep.room + 'term and stor exploded for balancer');
                            }
                        }
                        return
                    }
                    if (ps.store.power<50 && creep.room.memory.mineralThresholds.currentMineralStats.power>0) {
                        if (_.sum(creep.store)-creep.store.power>0) { // holding something else
                            if (creep.store.energy) {
                                let ptp = putATypeOfRes(creep.room, 'energy');
                                if (ptp) {
                                    creep.transfer(ptp, 'energy');
                                }
                                else {
                                    fo(creep.room + 'term and stor exploded for balancer');
                                }
                                return
                            }
                        }
                        else {
                            if (_.sum(creep.store)-creep.store.power-creep.store.energy>0) {
                                // carry other mats, continue with resTasks
                            }
                            else {
                                let ptp = getATypeOfRes(creep.room, 'power');
                                if (ptp) {
                                    creep.withdraw(ptp, 'power', Math.min(50, ptp.store.power));
                                    return
                                }
                            }
                        }
                    }
                    // energy
                    if (ps.store.energy<4000) {
                        if (creep.store.energy==0) {
                            creep.withdraw(creep.room.storage, 'energy');
                        }
                        else {
                            creep.transfer(ps, 'energy');
                        }
                    }
                }
            }
            else {
                if (_.sum(creep.store)>creep.store.energy) { // carrying none energy
                    for (let res in creep.store) {
                        creep.transfer(creep.room.storage, res);
                    }
                }
            }
        }
    }
};
