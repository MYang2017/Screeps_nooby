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
                
                let emi = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 5, {filter: c=>c.owner.username=='Source Keeper' || c.owner.username=='Invader'});
                if (emi.length>0) {
                    creep.memory._trav = undefined;
                }
                
                emi = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 4, {filter: c=>c.owner.username=='Source Keeper' || c.owner.username=='Invader'});
                if (emi.length>0) {
                    fleee.run(creep);
                }
                else {
                    if (creep.memory.recycle) { // if going to be recycled
                        if (travelToPrioHighwayWithClosestRoomExit(creep, creep.memory.home)) {
                            actionRecycle.run(creep);
                        }
                        return
                    }
                    
                    let resToGive = 'power';
                    let resToTake = 'ops';
                    
                    if (_.sum(creep.store)==0) { // if carry nothing
                        if (creep.room.name == creep.memory.home) {
                            let totake = getATypeOfRes(creep.room, resToGive);
                            if (totake == undefined) {
                                creep.memory.recycle = true;
                            }
                            else {
                                if (creep.pos.getRangeTo(totake)>1) {
                                    creep.travelTo(totake, {maxRooms: 1});
                                }
                                else {
                                    creep.withdraw(totake, resToGive);
                                }
                            }
                            return
                        }
                        else if (creep.room.name == creep.memory.target) {
                            let totake = getATypeOfRes(creep.room, resToTake);
                            if (totake == undefined) {
                                creep.memory.recycle = true;
                            }
                            else {
                                if (creep.pos.getRangeTo(totake)>1) {
                                    creep.travelTo(totake, {maxRooms: 1});
                                }
                                else {
                                    if (creep.withdraw(totake, resToTake) == OK) {
                                        if (creep.memory.transferTime == undefined) { // not first time
                                            creep.memory.transferTime = Game.time;
                                        }
                                    }
                                }
                            }
                            return
                        }
                        else {
                            fo('trader impossible state');
                            if (travelToPrioHighwayWithClosestRoomExit(creep, creep.memory.home)) {
                                actionRecycle.run(creep);
                            }
                            return
                        }
                    }
                    else { // carry something
                        if (creep.store[resToGive]>0) { // if togive
                            if (travelToPrioHighwayWithClosestRoomExit(creep, creep.memory.target)) {
                                let totake = putATypeOfRes(creep.room, resToGive);
                                if (totake == undefined) {
                                    creep.memory.recycle = true;
                                }
                                else {
                                    if (creep.pos.getRangeTo(totake)>1) {
                                        creep.moveTo(totake, {maxRooms: 1});
                                    }
                                    else {
                                        creep.transfer(totake, resToGive);
                                    }
                                }
                            }
                            return
                        }
                        else if (creep.store[resToTake]>0) { // if togive
                            if (travelToPrioHighwayWithClosestRoomExit(creep, creep.memory.home)) {
                                let totake = putATypeOfRes(creep.room, resToTake);
                                if (totake == undefined) {
                                    creep.memory.recycle = true;
                                }
                                else {
                                    if (creep.pos.getRangeTo(totake)>1) {
                                        creep.travelTo(totake, {maxRooms: 1});
                                    }
                                    else {
                                        if (creep.transfer(totake, resToTake)==OK) {
                                            if (creep.memory.transferTime != undefined) { // not first time
                                                if (creep.ticksToLive < 25 + (creep.memory.transferTime-creep.memory.bornTime)*2) { // creep cannot make a round trip
                                                    creep.memory.recycle = true;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            return
                        }
                        else {
                            fo('trader carrying rubish');
                            if (travelToPrioHighwayWithClosestRoomExit(creep, creep.memory.home)) {
                                actionRecycle.run(creep);
                            }
                            return
                        }
                    }
                }
            }
        }
    }
};
