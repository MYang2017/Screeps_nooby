var actionRecycle = require('action.recycle');
let fleee = require('action.flee');

module.exports = {
    run: function(creep) {
        // if creep born time undi
        // wipe ass
        if (creep.id == '6068bfb3788e547fd97ddebc') {
            let decoder = creep.room.find(FIND_SYMBOL_DECODERS)[0];
            let transRes = creep.transfer(decoder, creep.memory.stp);
            if ( transRes == ERR_NOT_IN_RANGE) {
                creep.moveTo(decoder);
            }
            else if (transRes == OK && creep.memory.transferTime == undefined) { // set transfered log time
                creep.memory.transferTime = Game.time;
            }
            return
        }
        
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
                    // if carry nothing or creep recycle
                    if (_.sum(creep.store) == 0 || creep.memory.recycle) {
                        if (creep.room.name == creep.memory.home) {
                            if (creep.memory.recycle) { // if going to be recycled
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
                            else { // going on journey
                                let withRes = creep.withdraw(creep.room.storage, creep.memory.stp);
                                if (withRes == ERR_NOT_IN_RANGE) {
                                    creep.travelTo(creep.room.storage, {maxRooms: 1, offRoad: true, ignoreRoads: true});
                                }
                                else if (withRes == ERR_NOT_ENOUGH_RESOURCES) {
                                    creep.memory.recycle = true;
                                }
                                else if (withRes == OK) {
                                    if (creep.memory.transferTime != undefined) { // not first time
                                        if (creep.ticksToLive < 25 + (creep.memory.transferTime-creep.memory.bornTime)) { // creep cannot make a round trip
                                            creep.memory.recycle = true;
                                            creep.transfer(creep.room.storage, creep,memory.stp);
                                        }
                                    }
                                    if (creep.memory.dests) { // refresh intermediate checkpoints
                                        for (let did in creep.memory.dests) {
                                            creep.memory.dests[did].completed = undefined;
                                        }
                                    }
                                }
                            }
                            return
                        }
                        else if (storedTravelFromAtoB(creep, 'r')) { // arrived or path not defined
                            // at home
                            if (creep.memory.recycle) { // if going to be recycled
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
                            else { // going on journey
                                let withRes = creep.withdraw(creep.room.storage, creep.memory.stp);
                                if (withRes == ERR_NOT_IN_RANGE) {
                                    creep.travelTo(creep.room.storage, {maxRooms: 1, offRoad: true, ignoreRoads: true});
                                }
                                else if (withRes == ERR_NOT_ENOUGH_RESOURCES) {
                                    creep.memory.recycle = true;
                                }
                                else if (withRes == OK) {
                                    if (creep.memory.transferTime != undefined) { // not first time
                                        if (creep.ticksToLive < 25 + (creep.memory.transferTime-creep.memory.bornTime)) { // creep cannot make a round trip
                                            creep.memory.recycle = true;
                                            creep.transfer(creep.room.storage, creep,memory.stp);
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
                    else { // else if creep carry symbol
                        if (storedTravelFromAtoB(creep, 'l')) { // if not in target
                            // in target
                            // find decoder and transfer
                            let decoder = creep.room.find(FIND_SYMBOL_DECODERS)[0];
                            let transRes = creep.transfer(decoder, creep.memory.stp);
                            if ( transRes == ERR_NOT_IN_RANGE) {
                                creep.moveTo(decoder);
                            }
                            else if (transRes == OK && creep.memory.transferTime == undefined) { // set transfered log time
                                creep.memory.transferTime = Game.time;
                                if (creep.memory.dests) { // refresh intermediate checkpoints
                                    for (let did in creep.memory.dests) {
                                        creep.memory.dests[did].completed = undefined;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};
