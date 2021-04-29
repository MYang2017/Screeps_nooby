module.exports = {
    run: function (creep) {
        
        let tar = creep.memory.workingPos;
        let css = creep.room.find(FIND_CONSTRUCTION_SITES); 
        let tarObj = undefined;
        let ctrler = creep.room.controller;
        let needToFindPos = true;
        
        // get tar obj
        if (css.length>0) {
            tarObj = css[0];
        }
        else {
            tarObj = ctrler;
        }
        
        if (tar && (creep.pos.x == creep.memory.workingPos.x) && (creep.pos.y == creep.memory.workingPos.y)) {
            needToFindPos = false;
        }
        
        
        if (needToFindPos) {
            let spots = returnALLAvailableNoStructureLandCoords3(creep.room, tarObj.pos);
            for (let spotId in spots) {
                let spot = spots[spotId];
                let found = creep.room.lookForAt(LOOK_CREEPS, spot.x, spot.y);
                if (found.length > 0 && (found[0].memory.role == 'miner' || found[0].memory.role == 'noLegWorker') && found[0].name !== creep.name) { // if position occupied by another creep  ///// find range 3 posis
                    // pass
                }
                else {
                    creep.memory.workingPos = {};
                    creep.memory.workingPos.x = spot.x;
                    creep.memory.workingPos.y = spot.y;
                    break;
                }
            }
        }
    
        // check if i have movement task
        let onTaskId = creep.memory.moveTaskId;
        if (onTaskId !== undefined) { // I have a stored taskId
            if (creep.room.memory.taskMove == undefined || creep.room.memory.taskMove.contracts == undefined) { // no contract stored
                creep.memory.moveTaskId = undefined; // remove stored id
                return
            }
            let contract = creep.room.memory.taskMove.contracts[onTaskId];

            if (contract) { // task still there, do task
                let offerName = contract.offerName;
                let offerCreep = Game.creeps[offerName];
                if (offerCreep) { // if asker still alive
                    if (creep.room.memory.taskMove.contracts == undefined) {
                        creep.memory.moveTaskId == undefined;
                        return
                    }
                    
                    // update contract
                    creep.room.memory.taskMove.contracts[onTaskId].posi.x = creep.memory.workingPos.x;
                    creep.room.memory.taskMove.contracts[onTaskId].posi.y = creep.memory.workingPos.y;
                    
                    if ((creep.pos.x == creep.memory.workingPos.x) && (creep.pos.y == creep.memory.workingPos.y)) { // if at working position, mine, remove task
                        // at position remove task
                        creep.memory.moveTaskId == undefined;
                        delete creep.room.memory.taskMove.contracts[onTaskId];
                    }
                    else if (css.length>0 && (creep.pos.getRangeTo(css[0])<=3) ) { // if task is building, if withing range 3 complete task
                        creep.memory.moveTaskId == undefined;
                        delete creep.room.memory.taskMove.contracts[onTaskId];
                    }
                    else { // not at target position follow
                        creep.move(offerCreep);
                    }
                } 
                else { // offer creep dead, remove task
                    creep.memory.moveTaskId = undefined;
                    delete creep.room.memory.taskMove.contracts[onTaskId];
                }
            }
            else { // contracts not there, clear own task
                creep.memory.moveTaskId = undefined;
            }
        } 
        else { // no registered move task, do energy task
            if ((creep.pos.x == creep.memory.workingPos.x) && (creep.pos.y == creep.memory.workingPos.y)) { // if at working position, do job
            //////////////////////////////////
                let onTaskIdE = creep.memory.eTaskId;
                let esitu = creep.store.energy;
                let emax = creep.store.getCapacity();
                
                if (onTaskIdE !== undefined) { // there is stored energy taskId
                    if (creep.room.memory.taskE == undefined || creep.room.memory.taskE.contracts == undefined) { // no contract structure
                        creep.memory.eTaskId = undefined; // remove stored id
                        return
                    }
                    let contract = creep.room.memory.taskE.contracts[onTaskIdE];
                    if (contract) { // task still there, do task
                        // wait for offerer come
                        // do build/upgrade if have energy
                        let offerId = contract.offerId;
                        let offerCreep = Game.getObjectById(offerId);
                        if (offerCreep) { // if asker still alive
                            if (creep.room.memory.taskE.contracts == undefined) { // if contracts not any more, move
                                creep.memory.eTaskId == undefined;
                                return
                            }
                            
                            // if energy < ? , pickup withdraw or publish require energy task
                            
                            // do usual jobs, upgrade or construct
                            let ts = creep.room.find(FIND_STRUCTURES, {filter: o=>o.structureType == STRUCTURE_TOWER})
                            if (ts.length>0 && ts[0].store.energy>400) {
                                creep.withdraw(ts[0], 'energy');
                            }
                            
                            if (emax*0.9<esitu) { // has more than 90% energy
                                // remove need energy task
                                creep.memory.energyTaskId = undefined;
                                delete creep.room.memory.taskE.contracts[onTaskIdE];
                            }
                            if (emax*0.5>esitu) { // has free capacity 50%
                                // look for eres
                                let lookE = creep.room.lookForAtArea(LOOK_ENERGY,creep.pos.y-1,creep.pos.x-1,creep.pos.y+1,creep.pos.x+1);
                                if (lookE.length>0) {
                                    creep.pickup(lookE[0]);
                                }
                            }
                            if (esitu>0) {
                                let containerSite = creep.pos.findInRange(FIND_CONSTRUCTION_SITES, 3);
                                if (containerSite.length>0) {
                                    if (creep.carry.energy > 0) {
                                        creep.build(containerSite[0]);
                                        return
                                    }
                                }
                                else { 
                                    creep.memory.upgrade = true;
                                    let ctrl = creep.room.controller;
                                    if (creep.pos.getRangeTo(ctrl)<=3 ) {
                                        if (creep.carry.energy > 0) {
                                            creep.upgradeController(ctrl);
                                            return
                                        }
                                    }
                                }
                            }
        
                        } 
                        else { // offer creep dead, remove task
                            creep.memory.eTaskId = undefined;
                            delete creep.room.memory.taskE.contracts[onTaskIdE];
                        }
                    }
                    else { // contracts structure not there, clear own task
                        creep.memory.eTaskId = undefined;
                    }
                } 
                else { // no registered energy task
                    if (emax*0.25>esitu) { // 25%
                        // publish require energy task
                        let asksList = creep.room.memory.taskE.asks;
                        if (asksList.length == 0) { // no task, add me
                            creep.room.memory.taskE.asks.push({askerId: creep.id}); // <<<<<<<<<<<<< e mount

                            return
                        }
                        else { // there is task, check if I have it
                            for (let askI of asksList) {
                                if (askI.askerId==creep.id) {
                                    return
                                }
                            }
                        }
                        creep.room.memory.taskE.asks.push({askerId: creep.id}); // <<<<<<<<<<<<< e mount
                    }
                    
                    // do job
                    if (emax/2>esitu) { // has free capacity 50%
                        // look for eres
                        let lookE = creep.room.lookForAtArea(LOOK_ENERGY,creep.pos.y-1,creep.pos.x-1,creep.pos.y+1,creep.pos.x+1, true);
                        if (lookE.length>0) {
                            creep.pickup(Game.getObjectById(lookE[0].energy.id));
                        }
                    }
                    if (esitu>0) {
                        let containerSite = creep.pos.findInRange(FIND_CONSTRUCTION_SITES, 3);
                        if (containerSite.length>0) {
                            if (creep.carry.energy > 0) {
                                creep.build(containerSite[0]);
                                return
                            }
                        }
                        else { // if defined check if still valid
                            let containerSite = creep.pos.findInRange(FIND_CONSTRUCTION_SITES, 3);
                            if (containerSite.length>0) {
                                if (creep.carry.energy > 0) {
                                    creep.build(containerSite[0]);
                                    return
                                }
                            }
                            else {
                                let containerSite = creep.room.find(FIND_CONSTRUCTION_SITES); // no more close sites, find a remote one
                                if (containerSite.length>0) {
                                    creep.memory.workingPos = undefined; // get a new site and this will start move task next tick
                                    return
                                }
                                else { // no more c sites, go upgrade
                                    let ctrl = creep.room.controller;
                                    if (creep.pos.getRangeTo(ctrl)<=3 ) {
                                        if (creep.carry.energy > 0) {
                                            creep.upgradeController(ctrl);
                                        }
                                    }
                                    let ts = creep.room.find(FIND_STRUCTURES, {filter: o=>o.structureType == STRUCTURE_TOWER})
                                    if (ts.length>0 && ts[0].store.energy>400) {
                                        creep.withdraw(ts[0], 'energy');
                                    }
                                }
                            }
                        }
                    }
                }
            }
            else { // publish move task
                let asksList = creep.room.memory.taskMove.asks;
                if (asksList.length == 0) { // no task, add me
                    creep.room.memory.taskMove.asks.push({posi: {x: creep.memory.workingPos.x,y:creep.memory.workingPos.y}, askerName: creep.name});
                    return
                }
                else { // there is task, check if it is mine
                    for (let askI of asksList) {
                        if (askI.askerName==creep.name) {
                            return
                        }
                    }
                }
                creep.room.memory.taskMove.asks.push({posi: {x: creep.memory.workingPos.x,y:creep.memory.workingPos.y}, askerName: creep.name});
            }
        }  
    }
};