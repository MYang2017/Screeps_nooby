var actionRecycle = require('action.recycle');
let fleee = require('action.flee');

module.exports = {
    run: function(creep) {
        // if creep born time undi
        if (creep.memory.bornTime == undefined) {
            // creep born time = Game.time
            creep.memory.bornTime = Game.time;
        }
        else { // born time logged
            // if (creep not transfered and creep tick<750) || (creep transfered and transfered time * 2 + 20 < creep.tickstolive )
            if ((creep.memory.transferTime == undefined && creep.ticksToLive<800) && creep.memory.recycle == undefined) {
                // creep lost 
                creep.memory.recycle = true; // set recycle true
                /*if (creep.memory.dests) {
                    for (let did in creep.memory.dests) {
                        creep.memory.dests[did].completed = undefined;
                    }
                }*/
            }
            else { // not lost, on normal job
                
                let emi = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 5, {filter: c=>c.owner.username=='Source Keeper'});
                if (emi.length>0) {
                    creep.memory._trav = undefined;
                }
                
                emi = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 3, {filter: c=>c.owner.username=='Source Keeper'});
                if (emi.length>0) {
                    fleee.run(creep);
                }
                else {
                    if (creep.memory.recycle) { // if going to be recycled
                        if (creep.room.name !== creep.memory.home) { // if not at home
                            // go back home
                            storedTravelFromAtoB(creep, 'r');
                        }
                        else { // else at home
                            if (_.sum(creep.store)>0) {
                                for (let mineralType in creep.store) {
                                    if (creep.transfer(creep.room.storage, mineralType) == ERR_NOT_IN_RANGE) {
                                        creep.travelTo(creep.room.storage, {maxRooms: 1, offRoad: true, ignoreRoads: true});
                                    }
                                }
                            }
                            else { // recycle
                                actionRecycle.run(creep);
                            }
                        }
                    }
                    else { // not recycle
                        // determine what symbol to take
                        let symSitu = Memory.symSitu;
                        let togives = symSitu.slice(0,10);
                        let totakes = symSitu.slice(0,symSitu.length).reverse().slice(0,10);
                        
                        if (_.sum(creep.store)==0) { // if creep carry 0
                            let am = creep.store.getFreeCapacity('energy');
                            if (Math.floor(Math.random()*10)<5) {
                                am = Math.floor(am*Math.random()*0.618);
                            }
                            if (creep.room.name == creep.memory.home) { // if at home
                                // take unwanted
                                let tg = undefined;
                                let froms = undefined;
                                for (let togive of togives) {
                                    if (creep.room.storage.store[togive]>0) {
                                        tg = togive;
                                        froms = creep.room.storage;
                                        break;
                                    }
                                    else if (creep.room.terminal.store[togive]>0) {
                                        tg = togive;
                                        froms = creep.room.terminal;
                                        break;
                                    }
                                }
                                
                                // if have symbol, take
                                tg=undefined;
                                if (tg&&froms) {
                                    if (creep.pos.getRangeTo(froms)>1) {
                                        creep.travelTo(froms);
                                        return
                                    }
                                    else {
                                        let withRes = creep.withdraw(froms, tg, am);
                                        if (withRes == ERR_NOT_ENOUGH_RESOURCES || withRes == OK) {
                                            if (creep.memory.transferTime != undefined) { // not first time
                                                if (creep.ticksToLive < 25 + 2*(creep.memory.transferTime-creep.memory.bornTime)) { // creep cannot make a round trip
                                                    creep.memory.recycle = true;
                                                    creep.transfer(froms, tg);
                                                }
                                            }
                                            if (creep.memory.dests) { // refresh intermediate checkpoints
                                                for (let did in creep.memory.dests) {
                                                    creep.memory.dests[did].completed = undefined;
                                                }
                                            }
                                        }
                                        return
                                    }
                                }
                                else { // else take 1 energy and log borntime
                                    if (creep.pos.getRangeTo(froms)>1) {
                                        creep.travelTo(froms);
                                        return
                                    }
                                    else {
                                        if (creep.withdraw(froms, 'energy', am)==OK) {
                                            if (creep.ticksToLive < 25 + 2*(creep.memory.transferTime-creep.memory.bornTime)) { // creep cannot make a round trip
                                                creep.memory.recycle = true;
                                                creep.transfer(froms, 'energy');
                                            }
                                            if (creep.memory.dests) { // refresh intermediate checkpoints
                                                for (let did in creep.memory.dests) {
                                                    creep.memory.dests[did].completed = undefined;
                                                }
                                            }
                                            if (creep.memory.dests) { // refresh intermediate checkpoints
                                                for (let did in creep.memory.dests) {
                                                    creep.memory.dests[did].completed = undefined;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            else if (creep.room.name == creep.memory.target) { // if at target
                                // take wanted
                                // take unwanted
                                let tg = undefined;
                                let froms = undefined;
                                for (let togive of totakes) {
                                    if (creep.room.storage.store[togive]>0) {
                                        tg = togive;
                                        froms = creep.room.storage;
                                        break;
                                    }
                                    else if (creep.room.terminal.store[togive]>0) {
                                        tg = togive;
                                        froms = creep.room.terminal;
                                        break;
                                    }
                                }
                                // if have symbol, take
                                if (tg&&froms) {
                                    if (creep.pos.getRangeTo(froms)>1) {
                                        creep.travelTo(froms);
                                        return
                                    }
                                    else {
                                        let withRes = creep.withdraw(froms, tg);
                                        if (withRes == ERR_NOT_ENOUGH_RESOURCES || withRes == OK) {
                                            if (creep.memory.transferTime != undefined) { // not first time
                                                if (creep.ticksToLive < 25 + (creep.memory.transferTime-creep.memory.bornTime)) { // creep cannot make a round trip
                                                    creep.memory.recycle = true;
                                                    creep.transfer(froms, tg);
                                                    creep.suicide();
                                                }
                                            }
                                            else {
                                                creep.memory.transferTime = Game.time;
                                            }
                                            if (creep.memory.dests) { // refresh intermediate checkpoints
                                                for (let did in creep.memory.dests) {
                                                    creep.memory.dests[did].completed = undefined;
                                                }
                                            }
                                        }
                                        return
                                    }
                                }
                                else { // else take 1 energy and log borntime <<<<<<<<<<<<<<<<<< change to take anything
                                    if (creep.withdraw(froms, 'energy', 1)==OK) {
                                        if (creep.ticksToLive < 25 + (creep.memory.transferTime-creep.memory.bornTime)) { // creep cannot make a round trip
                                            creep.suicide();
                                        }
                                    }
                                }
                            }
                        }
                        else { // if creep carry
                            let carryAnyUnwanted = false;
                            let carryAnyWanted = false;
                            for (let tp in creep.store) {
                                if (togives.includes(tp)|| tp=='energy') {
                                    carryAnyUnwanted = true;
                                }
                                if (totakes.includes(tp)) {
                                    carryAnyWanted = true;
                                }
                            }
                            if (creep.room.name == creep.memory.home) { // if at home
                                if (carryAnyWanted) { // if carry any wanted
                                    // transfer
                                    for (let mineralType in creep.store) {
                                        if (totakes.includes(mineralType)) {
                                            if (creep.transfer(creep.room.storage, mineralType) == ERR_NOT_IN_RANGE) {
                                                creep.travelTo(creep.room.storage, {maxRooms: 1, offRoad: true, ignoreRoads: true});
                                            }
                                            return
                                        }
                                    }
                                }
                                else { // else all unwanted
                                    // go target
                                    storedTravelFromAtoB(creep, 'l');
                                }
                            }
                            else if (creep.room.name == creep.memory.target) { // if at target
                                if (carryAnyUnwanted) { // if carry any unwanted
                                    // transfer
                                    for (let mineralType in creep.store) {
                                        if (togives.includes(mineralType)||mineralType=='energy') {
                                            if (creep.transfer(creep.room.storage, mineralType) == ERR_NOT_IN_RANGE) {
                                                creep.travelTo(creep.room.storage, {maxRooms: 1, offRoad: true, ignoreRoads: true});
                                            }
                                            return
                                        }
                                    }
                                }
                                else { // else all wanted
                                    // go home
                                    storedTravelFromAtoB(creep, 'r');
                                }
                            }
                            else { // else on the way
                                if (carryAnyWanted) { // if carry any wanted
                                    // go home
                                    storedTravelFromAtoB(creep, 'r');
                                }
                                else {
                                    // go target
                                    storedTravelFromAtoB(creep, 'l');
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};
