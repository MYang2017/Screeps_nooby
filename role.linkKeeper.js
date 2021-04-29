var loading = require('role.loader');
var actionAvoid = require('action.idle');
var byhand = require('action.ontheway');
var dupCheck = require('action.dupCheck');

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

        let receiverLink = creep.room.memory.forLinks.receiverLinkId;
        if (receiverLink == undefined) {
            loading.run(creep);
            return
        }

        if (creep.room.memory.forLinks) {
            // go to spot
            let tobe = creep.room.memory.anchor;
            if (tobe == undefined) {
                tobe = creep.room.memory.newAnchor;
            }

            // cach structures
            let cachedToFillIds = creep.memory.toFill;
            let cachedToTakeIds = creep.memory.toTake;
            if (cachedToFillIds == undefined || cachedToFillIds.length == 0 || cachedToTakeIds == undefined || cachedToTakeIds.length == 0 || Game.time & 1111 == 11) {
                let lands = returnALLAvailableLandCoords(creep.room, { x: tobe.x - 1, y: tobe.y - 2 });
                let toFillIds = [];
                for (let land of lands) {
                    let lound = creep.room.lookForAt(LOOK_STRUCTURES, land.x, land.y);
                    if (lound.length > 0 && (lound[0].structureType == STRUCTURE_EXTENSION || lound[0].structureType == STRUCTURE_SPAWN)) {
                        toFillIds.push(lound[0].id);
                    }
                    if (lound.length > 0 && (lound[0].structureType == STRUCTURE_TOWER || lound[0].structureType == STRUCTURE_NUKER)) { // middle structure
                        toFillIds.push(lound[0].id);
                    }
                    if (lound.length > 0 && (lound[0].structureType == STRUCTURE_STORAGE)) {
                        creep.memory.toTake = lound[0].id;
                    }
                }
                creep.memory.toFill = toFillIds;
            }

            if (creep.memory.in || creep.pos.x == tobe.x - 1 && creep.pos.y == tobe.y - 2) {
                creep.memory.in = true;
                let rl = Game.getObjectById(receiverLink);

                let senders = creep.room.memory.forLinks.linksIdsInRoom;

                let toFill = undefined;
                let toTake = undefined;

                let hasJob = undefined;

                for (let possiFillId of creep.memory.toFill) { // find spawn or extensions to fill
                    let possiFillObj = Game.getObjectById(possiFillId);
                    if (possiFillObj && (possiFillObj.store.energy < possiFillObj.store.getCapacity('energy'))) { // possiFillObj.store == null || possiFillObj.store.getCapacity() == null || 
                        if (creep.store.energy == null || creep.store.energy == 0) {
                            if (byhand.run(creep)) {
                                return
                            }
                            else {
                                toTake = creep.room.storage;
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
                        if (rl.cooldown < 8) { // keep receiverLink Full
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
                    if (rl.cooldown < 8) { // keep receiverLink Full
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

                if (true) { // as we are static, this is fixed
                    if (hasJob == undefined) {
                        //loading.run(creep);
                    }
                    else {
                        if (creep.memory.working == true && _.sum(creep.carry) == 0) {
                            creep.memory.working = false;
                        }
                        else if (creep.memory.working == false && _.sum(creep.carry) > 0) {//} == creep.carryCapacity ) {
                            creep.memory.working = true;
                        }

                        if (creep.memory.working == true) { // put energy into structures
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
                creep.moveTo(tobe.x - 1, tobe.y - 2);
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
