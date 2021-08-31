let give = require('action.recycle');
var dupCheck = require('action.dupCheck');
let runaway = require('action.flee')
let dog = require('action.idle');
let fillE = require('action.fillEnergy');

module.exports = {
    run: function(creep) {
        if (creep.memory.home == undefined) {
            if (creep.memory.target==undefined) {
                creep.memory.target = creep.room.name;
            }
            creep.memory.home = creep.memory.target;
        }
        else {
            if (creep.room.name != creep.memory.home) {
                creep.travelTo(new RoomPosition(25, 25, creep.memory.home));
                return
            }
            else if (dupCheck.run(creep, creep.room.memory.dedinum) || (creep.room.controller.level==8 && creep.className==undefined)) {
                return
            }
        }
        
        if (creep.ticksToLive<50) {
            give.run(creep);
            return
        }
        if (_.sum(creep.store)>0 || creep.room.storage==undefined) {
            creep.memory.full = true;
        }
        else if (_.sum(creep.store)==0) {
            creep.memory.full = false;
        }
        if (creep.memory.rec) {
            give.run(creep);
        }
        else {
            if (!creep.room.storage) {
                if (creep.store.energy==0) {
                    let r = creep.room;
                    if ((r.memory.newBunker && r.memory.newBunker.layout && r.memory.newBunker.layout.recCtn && r.memory.newBunker.layout.recCtn.length>0)) {
                        let rc = Game.getObjectById(r.memory.newBunker.layout.recCtn[0].id);
                        if (creep.pos.getRangeTo(rc)>1) {
                            creep.travelTo(rc, {maxRooms:1});
                        }
                        else {
                            creep.withdraw(rc, 'energy');
                        }
                        return
                    }
                    else {
                        
                    }
                }
                else {
                    
                }
            }
            if (!creep.memory.full) {
                let ships = ['energy'];
                let c = creep.pos.findClosestByRange(FIND_STRUCTURES, { filter: s => (s.structureType == STRUCTURE_CONTAINER && s.pos.findInRange(FIND_SOURCES, 1).length>0) && ((s.store.energy>1000||s.store.energy>creep.store.getCapacity('energy'))||(s.store.energy>0 && s.pos.getRangeTo(creep)<4)) });
                if (c) {
                    if (creep.pos.getRangeTo(c)>1) {
                        creep.travelTo(c, { maxRooms: 1 });
                    }
                    else {
                        creep.withdraw(c, 'energy');
                    }
                    return
                }
                for (let ship of ships) {
                    let whereTo = getATypeOfRes(creep.room, ship);
                    if (whereTo) {
                        if (creep.pos.getRangeTo(whereTo)>1) {
                            creep.travelTo(whereTo);
                        }
                        else {
                            creep.withdraw(whereTo, ship);
                        }
                        return
                    }
                }
                return
            }
            else { // else if full                                                                }
                if (creep.room.find(FIND_MY_CREEPS, { filter: c => c.memory.role == 'superUpgrader' }).length > 0) {
                    if (creep.store.energy > 0) {
                        if (creep.room.energyAvailable<creep.room.energyCapacityAvailable && creep.room.find(FIND_MY_CREEPS, { filter: c => c.memory.role == 'lorry' }).length == 0) {
                            fillE.run(creep);
                            return
                        }
                        if (creep.memory.suckFrom == undefined || Game.getObjectById(creep.memory.suckFrom) == null || Game.getObjectById(creep.memory.suckFrom).room.name!=creep.room.name) {
                            let ifTower = false;
                            let ts = creep.room.find(FIND_STRUCTURES, {filter: o=>o.structureType==STRUCTURE_TOWER});
                            let cr = creep.room.controller;
                            for (let t of ts) {
                                if (t.pos.getRangeTo(cr) < 3) {
                                    ifTower = true;
                                    creep.memory.suckFrom = t.id;
                                }
                            }
                            if (!ifTower) {
                                let nearbyEnergySources = cr.pos.findInRange(FIND_STRUCTURES, 3, {filter:s=> ((s.structureType==STRUCTURE_STORAGE)||(s.structureType==STRUCTURE_TERMINAL)||(s.structureType==STRUCTURE_CONTAINER)||(s.structureType==STRUCTURE_LINK)||(s.structureType==STRUCTURE_LAB))});
                                if (nearbyEnergySources.length>0) {
                                    creep.memory.suckFrom = nearbyEnergySources[0].id;
                                }
                                else {
                                    let pumpeds = creep.room.find(FIND_MY_CREEPS, {filter: o=>o.memory.role=='superUpgrader'}); 
                                    let pumped;
                                    let ener=10000;
                                    if (pumpeds.length>0) {
                                        for (let p of pumpeds) {
                                            if (p.store.energy<ener) {
                                                ener = p.store.energy;
                                                pumped = p;
                                            }
                                        }
                                        if (pumped) {
                                            if (creep.pos.getRangeTo(pumped)>1) {
                                                creep.travelTo(pumped);
                                            }
                                            else {
                                                creep.transfer(pumped, 'energy');
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        else {
                            let suc = Game.getObjectById(creep.memory.suckFrom);
                            if (suc == undefined || suc == null || suc.pos.roomName!=creep.pos.roomName) {
                                creep.memory.suckFrom = undefined;
                                return
                            }
                            let friends = suc.pos.findInRange(FIND_MY_CREEPS, 1, {filter:c=>c.memory.role=='dedicatedUpgraderHauler' && c.store.energy>creep.store.energy});
                            let avoidFlag = creep.pos.findInRange(FIND_MY_CREEPS, 1, {filter:c=>!(c.memory.role=='dedicatedUpgraderHauler' || c.memory.role=='superUpgrader')}).length>0;
                            if (friends.length > 0) {
                                if (creep.pos.getRangeTo(friends[0])>1) {
                                    creep.travelTo(friends[0]);
                                }
                                else {
                                    if (avoidFlag) {
                                        dog.run(creep);
                                    }
                                    if (creep.pos.findInRange(FIND_MY_CREEPS, 1).length>1) {
                                        let thingUnderFeet = creep.room.lookForAt(LOOK_STRUCTURES, creep)[0];
                                        if (thingUnderFeet && thingUnderFeet.structureType && thingUnderFeet.structureType == STRUCTURE_ROAD) {
                                            creep.move(getRandomInt(1, 8));
                                        }
                                    }
                                    creep.transfer(friends[0], 'energy');
                                }
                            }
                            else {
                                if (creep.pos.getRangeTo(suc)>1) {
                                    try {
                                        creep.travelTo(suc, {maxRooms: 1});
                                    }
                                    catch (e) {
                                        creep.moveTo(suc, {maxRooms: 1});
                                    }
                                }
                                else {
                                    if (avoidFlag) {
                                        dog.run(creep);
                                    }
                                    let depoInterv = 1;
                                    if (Game.cpu.bucket<9000) {
                                        depoInterv=5;
                                    }
                                    if (Game.time%depoInterv==0|| suc.store.energy<250) {
                                        creep.transfer(suc, 'energy');
                                        if (creep.pos.findInRange(FIND_MY_CREEPS, 1).length>1) {
                                            let thingUnderFeet = creep.room.lookForAt(LOOK_STRUCTURES, creep)[0];
                                            if (thingUnderFeet && thingUnderFeet.structureType && thingUnderFeet.structureType == STRUCTURE_ROAD) {
                                                creep.move(getRandomInt(1, 8));
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    else if (_.sum(creep.store)>0) { // carrying non energy
                        if (creep.pos.getRangeTo(creep.room.storage)>1) {
                            creep.travelTo(creep.room.storage);
                        }
                        else {
                            for (let res in creep.store) {
                                creep.transfer(creep.room.storage, res);
                            }
                        }
                        return
                    }
                    else { // carry 0 energy
                        let whereTo = getATypeOfRes(creep.room, 'energy');
                        if (whereTo) {
                            if (creep.pos.getRangeTo(whereTo)>1) {
                                creep.travelTo(whereTo);
                            }
                            else {
                                creep.withdraw(whereTo, 'energy');
                            }
                            return
                        }
                    }
                }
                else { // recycle
                    creep.memory.rec = true;
                    give.run(creep);
                    return
                }
            }
        }
    }
};
