var loader = require('role.loader');
var dupCheck = require('action.dupCheck');
let idle = require('action.idle');

module.exports = {
    run: function(creep) {
        
        let allowed_num = 2;
        let ank = creep.room.memory.newBunker.setPoint;
        let ori = creep.room.memory.newBunker.orient;
        
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
        
        var findSpotTogo = function (creep, linkx, linky, ori) {
            let posisToGo;
            if (ori=='L') {
                posisToGo = [{x:linkx+1, y:linky+1}, {x:linkx+1, y:linky-1}];
            }
            else if (ori=='U') {
                posisToGo = [{x:linkx+1, y:linky+1}, {x:linkx-1, y:linky+1}];
            }
            else if (ori=='D') {
                posisToGo = [{x:linkx+1, y:linky-1}, {x:linkx-1, y:linky-1}];
            }
            else {
                posisToGo = [{x:linkx-1, y:linky+1}, {x:linkx-1, y:linky-1}];
            }

            for (let posiToGo of posisToGo) {
                let found = false;
                let lx = posiToGo.x;
                let ly = posiToGo.y;
    
                let cps = creep.room.lookAt(lx, ly);
                for (let cp of cps) {
                    if (cp.type == LOOK_CREEPS) {
                        let lookCreep = Game.creeps[cp.creep.name];
                        if (lookCreep.memory.role == 'newDickHead' || lookCreep.memory.role == 'dickHeadpp') {
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
        
        let linkx
        let linky
        if (ori=='L') {
            linkx = ank.x+2;
            linky = ank.y;
        }
        else if (ori=='U') {
            linkx = ank.x;
            linky = ank.y+2;
        }
        else if (ori=='D') {
            linkx = ank.x;
            linky = ank.y-2;
        }
        else if (ori=='R') {
            linkx = ank.x-2;
            linky = ank.y;
        }
        
        let ins = creep.memory.in;
        if (ins == undefined || ins == false) {
            let togo = creep.memory.togo;
            if (togo == undefined || togo.x == undefined) { // find new to go
                let go = findSpotTogo(creep, linkx, linky, ori);
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
                        if ((lookCreep.memory.role == 'newDickHead' || lookCreep.memory.role == 'dickHeadpp') && lookCreep.name!=creep.name) {
                            taken = true;
                        }
                    }
                }
                if (taken) { // change
                    let go = findSpotTogo(creep, linkx, linky, ori);
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
                        creep.travelTo(new RoomPosition(creep.memory.togo.x, creep.memory.togo.y, creep.room.name), {range: 0});
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
                creep.memory.in=undefined;
                creep.memory.fixed=undefined;
                creep.memory.togo=undefined;
                creep.memory.toFill=undefined;
                creep.memory.toTake=undefined;
                creep.memory.toStore=undefined;
            }
            if (toFill == undefined || (creep.pos.findInRange(FIND_STRUCTURES, 1, {filter:w=>w.structureType==STRUCTURE_CONTAINER}).length>0 && (toStore==undefined || Game.getObjectById(toStore)==null))) {
                let lands = returnALLAvailableLandCoords(creep.room, creep.pos);
                let toFillIds = [];
                for (let land of lands) {
                    let lound = creep.room.lookForAt(LOOK_STRUCTURES, land.x, land.y);
                    let tocheck = undefined;
                    if (lound.length>1) {
                        for (let l of lound) {
                            if (l.structureType!=STRUCTURE_RAMPART && l.structureType!=STRUCTURE_ROAD) {
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
                    if (tocheck && tocheck.structureType == STRUCTURE_CONTAINER) {
                        creep.memory.toStore = tocheck.id;
                    }
                    if (tocheck && (tocheck.structureType == STRUCTURE_TOWER)) {
                        creep.memory.toTake = tocheck.id;
                    }
                }
                creep.memory.toFill = toFillIds;
                if (toStore == undefined && creep.store.energy>0) {
                    let jobInc;
                    for (let toFillId of creep.memory.toFill) {
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
                                if (ctn && ctn.store.energy>0) {
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
                            if (ctn && ctn.store.energy > 0 && ctn.hits<0.97*ctn.hitsMax) {
                                creep.repair(ctn);
                            }
                        }
                        else if (ctn && creep.store.energy>0) { //  fill container or repair
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
