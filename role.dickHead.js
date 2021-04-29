var loader = require('role.loader');
var dupCheck = require('action.dupCheck');

module.exports = {
    run: function(creep) {
        
        var findSpotTogo = function (creep, linkx, linky) {
            for (let yind in [1, -1]) {
                for (let xind in [1, -1]) {
                    let found = false;
                    x = [1, -1][xind];
                    y = [1, -1][yind];
                    let lx = linkx + x;
                    let ly = linky + y;
    
                    let cps = creep.room.lookAt(lx, ly);
                    for (let cp of cps) {
                        if (cp.type == LOOK_CREEPS) {
                            let lookCreep = Game.creeps[cp.creep.name];
                            if (lookCreep.memory.role == 'dickHead') {
                                found = true; // pass
                            }
                        }
                    }
                    if (found == false) {
                        return {x:lx, y:ly}
                    }
                }
            }
        }
        
        let anchPos = creep.room.memory.anchor;
        let anch = anchPos;
        
        if (anchPos == undefined) {
            anch = creep.room.memory.newAnchor;
        }
        
        linkx = anch.x;
        linky = anch.y-8;

        let gox;
        let goy;
        
        let ins = creep.memory.in;
        if (ins == undefined || ins == false) {
            let togo = creep.memory.togo;
            if (togo == undefined || togo.x == undefined) { // find new to go
                let go = findSpotTogo(creep, linkx, linky);
                if (go) {
                    creep.memory.togo = {x: go.x, y: go.y};
                }
            }
            else {
                // if to go not taken by me but other dh
                let taken = false;
                let cps = creep.room.lookAt(creep.memory.togo.x, creep.memory.togo.y);
                for (let cp of cps) {
                    if (cp.type == LOOK_CREEPS) {
                        let lookCreep = Game.creeps[cp.creep.name];
                        if (lookCreep.memory.role == 'dickHead' && lookCreep.name!=creep.name) {
                            taken = true;
                        }
                    }
                }
                
                if (taken) { // change
                    let go = findSpotTogo(creep, linkx, linky);
                    if (go==undefined) {
                        dupCheck.run(creep, 4);
                    }
                    else {
                        creep.memory.togo = {x: go.x, y: go.y};
                    }
                }
                else { 
                    // if my pos == togo
                    if (creep.pos.x == creep.memory.togo.x && creep.pos.y == creep.memory.togo.y) {
                        // in
                        creep.memory.in = true;
                    }
                    else {// keep moving
                        creep.moveTo(creep.memory.togo.x, creep.memory.togo.y);
                    }
                }
            }
            dupCheck.run(creep, 4);
        }
        else { // in position
            let toFill = creep.memory.toFill;
            let toTake = creep.memory.toTake;
            let toStore = creep.memory.toStore;
            if (toFill == undefined || toStore == undefined) {
                let lands = returnALLAvailableLandCoords(creep.room, creep.pos);
                let toFillIds = [];
                for (let land of lands) {
                     let lound = creep.room.lookForAt(LOOK_STRUCTURES, land.x, land.y);
                     if (lound.length>0 && (lound[0].structureType == STRUCTURE_EXTENSION || lound[0].structureType == STRUCTURE_SPAWN)) {
                         toFillIds.push(lound[0].id);
                     }
                     if (lound.length>0 && (lound[0].structureType == STRUCTURE_LINK)) {
                         creep.memory.toTake = lound[0].id;
                     }
                     if (lound.length>0) {
                         if (lound[0].structureType == STRUCTURE_CONTAINER) {
                            creep.memory.toStore = lound[0].id;
                         }
                         else if (lound[1] && lound[1].structureType == STRUCTURE_CONTAINER) {
                            creep.memory.toStore = lound[1].id;
                         }
                     }
                }
                creep.memory.toFill = toFillIds;
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
                            let ctn = Game.getObjectById(toStore);
                            if (ctn.store.energy>0) {
                                creep.withdraw(ctn, 'energy');
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
                            let linko = Game.getObjectById(toTake);
                            if (linko&&linko.store.energy>0) {
                                creep.withdraw(linko, 'energy');
                            }
                            else {
                                let ctn = Game.getObjectById(toStore);
                                if (ctn.store.energy>0) {
                                    creep.withdraw(ctn, 'energy');
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
                        let linko = Game.getObjectById(toTake);
                        let ctn = Game.getObjectById(toStore);
                        if (linko&&linko.store.energy>0) {
                            if (creep.store.getFreeCapacity('energy') > 0) { // still room to take
                                creep.withdraw(linko, 'energy');
                            }
                            else if (creep.store.energy==creep.store.getCapacity('energy')) {
                                creep.transfer(ctn, 'energy');
                            }
                            else {
                                creep.withdraw(linko, 'energy');
                            }
                            if (ctn.store.energy > 0 && ctn.hits<0.97*ctn.hitsMax) {
                                creep.repair(ctn);
                            }
                        }
                        else if (creep.store.energy>0) { //  fill container or repair
                            if (ctn.store.getFreeCapacity('energy')>0) {
                                creep.transfer(ctn, 'energy');
                            }
                            else { // link empty, ctn full, very good repair
                                if (ctn.hits<0.97*ctn.hitsMax) {
                                    creep.repair(ctn);
                                }
                            }
                        }
                    }
                }
                /*
                if (creep.store.energy>0) { // fill
                    for (let toFillId of toFill) {
                        let toFillStruct = Game.getObjectById(toFillId);
                        if (toFillStruct.store.getCapacity() == null || toFillStruct.store.energy<toFillStruct.store.getCapacity()) {
                            if (creep.transfer(toFillStruct, 'energy') == OK) {
                                return;
                            }
                        }
                    }
                    let ctn = Game.getObjectById(toStore)
                    if (ctn.store.getFreeCapacity()>0) {
                        creep.transfer(ctn, 'energy')
                    }
                    if (creep.getActiveBodyparts(WORK)>0) {
                        creep.repair(ctn);
                    }
                }
                else { // takes
                    let linko = Game.getObjectById(toTake);
                    if (linko&&linko.store.energy>0) {
                        creep.withdraw(linko, 'energy')
                    }
                    else {
                        let ctn = Game.getObjectById(toStore);
                        if (creep.store.energy>0) {
                            // idle
                        }
                        else {
                            creep.withdraw(ctn, 'energy');
                        }
                    }
                }
                */
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
