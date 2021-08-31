var loading = require('role.loader');
var actionAvoid = require('action.idle');
var byhand = require('action.ontheway');
var dupCheck = require('action.dupCheck');
var sac = require('action.recycle');

module.exports = {
    run: function (creep) {
        creep.say('linking');

        /*if (creep.room.find(FIND_MY_CREEPS, {filter: c=>c.memory.role=='linkKeeper'}).length>1) {
            creep.say('boob!')
            let sp = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: s=>s.structureType==STRUCTURE_SPAWN})
            creep.moveTo(sp);
            sp.recycleCreep(creep);
            return
        }*/
        
        let r = creep.room;
        
        if (creep.getActiveBodyparts(MOVE)>0 && !(r.memory.newBunker && r.memory.newBunker.layout && r.memory.newBunker.layout.recCtn && r.memory.newBunker.layout.recCtn.length>0 && r.memory.newBunker.layout.recCtn[0] && r.memory.newBunker.layout.recCtn[0].id && Game.getObjectById(r.memory.newBunker.layout.recCtn[0].id))) {
            loading.run(creep);
            return
        }
        
        if (r.memory.newBunker && r.memory.newBunker.layout && creep.getActiveBodyparts(MOVE)>0) {
            sac.run(creep);
        }

        let receiverLink = creep.room.memory.forLinks.receiverLinkId;
        if (receiverLink==undefined) {
            receiverLink = creep.room.memory.forLinks.receiverCoreLinkId;
        }
        
        if (receiverLink == undefined) {
            if (creep.room.memory.newBunker) {
                let recCtn = Game.getObjectById(creep.room.memory.newBunker.layout.recCtn[0].id);
                let st = creep.room.storage;
                let sp = Game.getObjectById(creep.room.memory.newBunker.layout.coreSp[0].id);
                if (creep.store.energy==0) {
                    if (!byhand.run(creep)) {
                        if (recCtn && recCtn.store.energy>0) {
                            creep.withdraw(recCtn, 'energy');
                        }
                        else if (st) {
                            creep.withdraw(st, 'energy');
                        }
                    }
                }
                else {
                    if (sp.store.energy<300) {
                        creep.transfer(sp, 'energy');
                    }
                }
            }
            else {
                loading.run(creep);
            }
            return
        }

        if (creep.room.memory.forLinks) {
            // special rebuild case where there is link but no storage
            if (creep.room.storage==undefined) {
                if (creep.room.memory.newBunker) {
                    let recCtn = Game.getObjectById(creep.room.memory.newBunker.layout.recCtn[0].id);
                    let rlink = Game.getObjectById(receiverLink);
                    let st = creep.room.storage;
                    let sp = Game.getObjectById(creep.room.memory.newBunker.layout.coreSp[0].id);
                    if (creep.store.energy==0) {
                        if (!byhand.run(creep)) {
                            if (recCtn && recCtn.store.energy>0) {
                                creep.withdraw(recCtn, 'energy');
                            }
                            else if (rlink && rlink.store.energy>0) {
                                creep.withdraw(rlink, 'energy');
                            }
                        }
                    }
                    else {
                        if (sp.store.energy<300) {
                            creep.transfer(sp, 'energy');
                        }
                        else {
                            let ed = creep.pos.findInRange(FIND_MY_CREEPS, 1, {filter:c=>c.getActiveBodyparts(WORK)>0 && c.getActiveBodyparts(CARRY)>0 && c.memory.role!='miner'});
                            if (ed.length>0) {
                                creep.transfer(ed[0], 'energy');
                            }
                        }
                    }
                }
                else {
                    loading.run(creep);
                }
                return
            }
            
            // go to spot
            let tobe = creep.room.memory.anchor;
            if (tobe == undefined) {
                tobe = creep.room.memory.newAnchor;
            }
            if (creep.room.memory.newBunker) {
                tobe = creep.pos;
                creep.memory.in = true;
            }

            // cach structures
            let cachedToFillIds = creep.memory.toFill;
            let cachedToTakeIds = creep.memory.toTake;
            if (cachedToFillIds == undefined || cachedToFillIds.length == 0 || cachedToTakeIds == undefined || cachedToTakeIds.length == 0 || Game.time & 1111 == 11) {
                let toFillIds = [];
                let tws = creep.pos.findInRange(FIND_MY_STRUCTURES, 1, {filter: t=>t.structureType==STRUCTURE_TOWER||t.structureType==STRUCTURE_EXTENSION||t.structureType==STRUCTURE_SPAWN});
                for (let tw of tws) {
                    toFillIds.push(tw.id);
                }
                if (creep.room.storage && creep.pos.getRangeTo(creep.room.storage)==1) {
                    creep.memory.toTake = creep.room.storage.id;
                }
                creep.memory.toFill = toFillIds;
            }

            if (creep.memory.in || creep.pos.x == tobe.x - 1 && creep.pos.y == tobe.y - 2) {
                creep.memory.in = true;
                creep.memory.fixed = true; // cannot be swapped
                
                let rl = Game.getObjectById(receiverLink);

                let senders = creep.room.memory.forLinks.linksIdsInRoom;

                let toFill = undefined;
                let toTake = undefined;

                let hasJob = undefined;
                
                let recCtn = undefined;
                if (creep.room.memory.newBunker && creep.room.memory.newBunker.layout && creep.room.memory.newBunker.layout.recCtn && creep.room.memory.newBunker.layout.recCtn.length>0 && creep.room.memory.newBunker.layout.recCtn[0].id && Game.getObjectById(creep.room.memory.newBunker.layout.recCtn[0].id)) {
                    let recCtn = Game.getObjectById(creep.room.memory.newBunker.layout.recCtn[0].id);
                }
                else {
                    runUltraToBuildPlan(creep.room);
                }

                for (let possiFillId of creep.memory.toFill) { // find spawn or extensions to fill
                    let possiFillObj = Game.getObjectById(possiFillId);
                    if (possiFillObj) {
                        if (possiFillObj && (possiFillObj.store.energy < possiFillObj.store.getCapacity('energy'))) { // possiFillObj.store == null || possiFillObj.store.getCapacity() == null || 
                            if (creep.store.energy == null || creep.store.energy == 0) {
                                if (byhand.run(creep)) {
                                    return
                                }
                                else {
                                    toTake = creep.room.storage;
                                    if (rl && (!(creep.room.memory.forLinks.receiverCoreLinkId||creep.room.memory.forLinks.receiverUpLinkId)) && rl.store.energy>0) {
                                        toTake = rl;
                                    }
                                    
                                    if (recCtn && recCtn.store.energy>0) {
                                        toTake = recCtn;
                                    }
                                    if (creep.withdraw(toTake, 'energy') == OK) {
                                        return
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
                    else {
                        creep.memory.toFill = undefined;
                    }
                }

                if ((_.sum(creep.store) > 0 && _.sum(creep.store) != creep.store.energy)) { // if not carry energy
                    for (let tp in creep.store) {
                        creep.transfer(creep.room.storage, tp);
                        return
                    }
                }

                if (senders && senders.length > 0) { // if there is sender link
                    for (let senderId of senders) {
                        let sender = Game.getObjectById(senderId);
                        // if senders cd<8, start clearing out receiverLink
                        if (sender.cooldown < 8 && sender.store !== null && sender.store.energy > 100) { // if any sender link is about to send, we clear receiver link and fill other structures
                            toTake = rl;
                            toFill = creep.room.storage;
                            hasJob = true;
                            break;
                        }
                    }

                    if (hasJob == undefined) { // all senders>8 
                        // if receiver link cd < 8
                        if (rl.cooldown < 8 && (creep.room.memory.forLinks&&(creep.room.memory.forLinks.receiverCoreLinkId||creep.room.memory.forLinks.receiverUpLinkId))) { // keep receiverLink Full
                            toFill = rl;
                            toTake = creep.room.storage;
                            hasJob = true;
                        }
                        else { // else keep receiverLink empty
                            if (rl.store.energy < rl.store.getCapacity()) { // if not full
                                toFill = creep.room.storage;
                                toTake = rl;
                                hasJob = true;
                            }
                            else { // full
                                // run loader
                                if (hasJob == undefined) {
                                    //loading.run(creep);
                                }
                            }
                        }
                    }
                }
                else { // no sender link 
                    // if receiver link cd < 8
                    if (rl.cooldown < 8 && (creep.room.memory.forLinks&&(creep.room.memory.forLinks.receiverCoreLinkId||creep.room.memory.forLinks.receiverUpLinkId))) { // keep receiverLink Full
                        toFill = rl;
                        toTake = creep.room.storage;
                        if (recCtn && recCtn.store.energy>0) {
                            toTake = recCtn;
                        }
                        hasJob = true;
                    }
                    else if (rl && (!(creep.room.memory.forLinks.receiverCoreLinkId||creep.room.memory.forLinks.receiverUpLinkId)) && rl.store.energy>0) {
                        toTake = rl;
                        toFill = creep.room.storage;
                        hasJob = true;
                    }
                    else { // else keep receiverLink empty
                        if (rl.store.energy < rl.store.getCapacity()) { // if not full
                            toFill = creep.room.storage;
                            toTake = rl;
                            hasJob = true;
                        }
                        else { // full
                            // run loader
                            if (hasJob == undefined) {
                                //loading.run(creep);
                            }
                        }
                    }
                }

                if (true) { // as we are static, this is fixed
                    if (hasJob == undefined) {
                        //loading.run(creep);
                    }
                    else {
                        if (_.sum(creep.store)>0) { // put energy into structures
                            if (creep.transfer(toFill, 'energy') == ERR_NOT_IN_RANGE) {
                                creep.moveTo(toFill);
                            }
                        }
                        else { // get energy from link
                            if (byhand.run(creep)) {
                                return
                            }
                            else {
                                if (creep.withdraw(toTake, 'energy') == ERR_NOT_IN_RANGE) {
                                    creep.moveTo(toTake);
                                }
                            }
                        }
                    }
                }
            }
            else {
                let oc = creep.room.lookForAt(LOOK_CREEPS, tobe.x - 1, tobe.y - 2);
                if(oc.length && oc[0].memory.role != 'linkKeeper') {
                    oc[0].moveTo(creep);
                }
                creep.travelTo(new RoomPosition(tobe.x - 1, tobe.y - 2, creep.memory.target));
                dupCheck.run(creep);
            }

            // add spawn when about to die
            let tRem = creep.ticksToLive;
            if (creep.memory.spawnedBy) {
                let sp = Game.getObjectById(creep.memory.spawnedBy);
                if (tRem < 1200) {
                    sp.renewCreep(creep);
                }
            }
        }
        else {
            loading.run(creep);
        }
    }
};
