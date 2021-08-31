let dog = require('action.idle');

module.exports = {
    run: function(creep) {
        // pc dont rec
        if (creep.className) {
            creep.memory.rec = undefined;
            return false
        }
        
        // reassign
        if (creep.body.length>9 && creep.body.length == creep.getActiveBodyparts(MOVE) + creep.getActiveBodyparts(CARRY)) {
            if (creep.ticksToLive<200) {
                
            }
            else {
                if (creep.room.memory.frenzyMode) {
                    
                }
                else {
                    if (Game.rooms[creep.memory.home].memory.remoteMiningRoomNames) {
                        let remoteMiningRoomNames = Object.keys(Game.rooms[creep.memory.home].memory.remoteMiningRoomNames);
                        if (remoteMiningRoomNames) {
                            for (let rmn of remoteMiningRoomNames) {
                                if (Game.rooms[creep.memory.home].memory.remoteMiningRoomNames[rmn] && Game.rooms[creep.memory.home].memory.remoteMiningRoomNames[rmn]['need']>0) {
                                    creep.memory.role = 'longDistanceLorry';
                                    creep.memory.target = rmn;
                                    Game.rooms[creep.memory.home].memory.remoteMiningRoomNames[rmn]['need'] -= 1;
                                    return
                                }
                            }
                        }
                    }
                }
                if (creep.room.find(FIND_MY_CREEPS, { filter: c=>c.memory.role == 'lorry'}).length<2) {
                    creep.memory.role = 'lorry';
                    creep.memory.target = creep.memory.home;
                    return
                }
                if (creep.room.controller.level<8 && creep.room.find(FIND_MY_CREEPS, { filter: c=>c.memory.role == 'dedicatedUpgraderHauler'}).length<1) {
                    creep.memory.role = 'dedicatedUpgraderHauler';
                    creep.memory.target = creep.memory.home;
                    return
                }
            }
        }
        
        if (creep.room.find(FIND_MY_STRUCTURES, {filter: t=>t.structureType==STRUCTURE_SPAWN}).length==0) {
            let togo = creep.room.find(FIND_MY_CREEPS, {filter: t=>t.getActiveBodyparts(WORK)>0});
            if (togo.length>0) {
                if (creep.pos.getRangeTo(togo)>1) {
                    creep.travelTo(togo, {maxRooms: 1});
                }
                else {
                    if (creep.store.energy>0) {
                        creep.transfer(togo, 'energy');
                    }
                    else {
                        creep.suicide();
                    }
                }
            }
            return
        }
        
        let boosted = undefined;
        for (let b of creep.body) {
            if (b.boost) {
                boosted = true;
                break;
            }
        }
        
        if (boosted) {
            let labs = creep.room.find(FIND_MY_STRUCTURES, {filter: s=>s.structureType==STRUCTURE_LAB&&s.cooldown<=creep.pos.getRangeTo(s)});
            if (labs.length>0) {
                if (creep.pos.getRangeTo(labs[0])>1) {
                    creep.travelTo(labs[0], {maxRooms: 1});
                }
                else {
                    if (Memory.stopReaction == undefined) {
                        Memory.stopReaction = {};
                    }
                    Memory.stopReaction[labs[0].id] = Game.time;
                    labs[0].unboostCreep(creep);
                }
                return false
            }
        }
        
        if (creep.room.storage) {
            if (creep.getActiveBodyparts(CARRY)>24 && (_.sum(creep.store)==0)) { // sacrificer or anyone useful
                let drops = creep.room.find(FIND_DROPPED_RESOURCES, {filter: d=>d.amount>500});
                if (drops.length>0) {
                    if (creep.pos.getRangeTo(drops[0])>1) {
                        creep.travelTo(drops[0], {maxRooms: 1});
                    }
                    else {
                        creep.pickup(drops[0], {maxRooms: 1});
                    }
                    return false
                }
                else {
                    drops = creep.room.find(FIND_TOMBSTONES, {filter: t=>_.sum(t.store)>500});
                    if (drops.length>0) {
                        if (creep.pos.getRangeTo(drops[0])>1) {
                            creep.travelTo(drops[0], {maxRooms: 1});
                        }
                        else {
                            for (let res in drops[0].store) {
                                creep.withdraw(drops[0], res);
                                return false
                            }
                        }
                        return false
                    }
                }
            }
            
            if (_.sum(creep.store)>0) {
                for (res in creep.store) {
                    let whereToPut = putATypeOfRes(creep.room, res);
                    if (whereToPut) {
                        if (creep.pos.getRangeTo(whereToPut)>1) {
                            creep.travelTo(whereToPut, {maxRooms: 1});
                        }
                        else {
                            if (creep.transfer(whereToPut, res)==OK) {
                                creep.memory.readyToDie = true;
                            }
                        }
                    }
                    return false
                }
            }
        }
            
        let sp = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter: s=>s.structureType==STRUCTURE_SPAWN});
        if (sp) {
            //fo('recycling ' + creep.memory.role + ' at ' + creep.pos);
            creep.travelTo(sp, {maxRooms: 1})
            sp.recycleCreep(creep);
            return true
        }
        else {
            let cp = creep.pos.findClosestByRange(FIND_MY_CREEPS, {filter: c=>c.name!==creep.name});
            if (cp&&creep.pos.getRangeTo(cp)>1) {
                creep.travelTo(cp, {maxRooms: 1});
            }
            else {
                creep.suicide();
            }
            return true
        }
    }
};
