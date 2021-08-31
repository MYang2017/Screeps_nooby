var loader = require('role.loader');
var dupCheck = require('action.dupCheck');
let idle = require('action.idle');

module.exports = {
    run: function(creep) {
        
        let allowed_num = 4;
        if (creep.room.memory.newBunker) {
            allowed_num = 2;
        }
        
        if (creep.memory.toStore==undefined || !Game.getObjectById(creep.memory.toStore)) {
            if (creep.memory.in && creep.store.energy==0 && creep.room.storage && creep.room.storage.store.energy==0) {
                let ss = creep.room.find(FIND_MY_STRUCTURES, {filter: t=>t.structureType==STRUCTURE_SPAWN && t.store.energy>0});
                if (ss.length>0) {
                    if (creep.pos.getRangeTo(ss[0])>1) {
                        creep.travelTo(ss[0]);
                    }
                    else {
                        creep.withdraw(ss[0], 'energy');
                    }
                }
                else if (creep.room.terminal && creep.room.terminal.store.energy>0) {
                    if (creep.pos.getRangeTo(creep.room.terminal)>1) {
                        creep.travelTo(creep.room.terminal);
                    }
                    else {
                        creep.withdraw(creep.room.terminal, 'energy');
                    }
                }
                return
            }
            else if (creep.memory.in && creep.store.energy>0 && creep.memory.togo && (creep.pos.x!=creep.memory.togo.x||creep.pos.y!=creep.memory.togo.y)) {
                creep.memory.togo=undefined;
                creep.memory.in=undefined;
                creep.memory.toFill=undefined;
            }
        }
        
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
                                if (lookCreep.name==creep.name) {
                                    return {x:lx, y:ly}
                                }
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
                        dupCheck.run(creep, allowed_num);
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
                        creep.travelTo(new RoomPosition(creep.memory.togo.x, creep.memory.togo.y, creep.room.name));
                    }
                }
            }
            dupCheck.run(creep, allowed_num);
        }
        else { // in position
            creep.memory.fixed = true; // cannot be swapped
            let toFill = creep.memory.toFill;
            let toTake = creep.memory.toTake;
            let toStore = creep.memory.toStore;
            // check if position correct
            if (Game.time%50==0) {
                if (creep.room.memory.coreBaseReady && creep.pos.findInRange(FIND_MY_STRUCTURES, 1, {filter:t=>t.structureType==STRUCTURE_LINK}).length==0) {
                    creep.memory.in=undefined;
                    creep.memory.fixed=undefined;
                    creep.memory.togo=undefined;
                    creep.memory.toFill=undefined;
                    creep.memory.toTake=undefined;
                    creep.memory.toStore=undefined;
                }
            }
            if (toFill == undefined || toStore == undefined || Game.getObjectById(toStore)==null) {
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
                if (toStore == undefined && creep.store.energy>0) {
                    let jobInc;
                    for (let toFillId of toFill) {
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
