// lorry now only fill energy in room since v7
var actionAvoid = require('action.idle');
var actionRunAway =require('action.flee');
var getE = require('action.getEnergy');
var noStoragePickuper = require('role.pickuper');
var lorry = require('role.lorry');

module.exports = {
    run: function (creep) {
        if (creep.memory.target == undefined) { // home name
            creep.memory.target = creep.room.name;
        }
        
        //if ((creep.room.terminal == undefined)||(creep.room.find(FIND_MY_STRUCTURES, {filter:c=>c.structureType==STRUCTURE_LINK}).length==0)) {
        if (creep.pos.findInRange(FIND_HOSTILE_CREEPS, 5, {filter: c=> (c.getActiveBodyparts(ATTACK)+c.getActiveBodyparts(RANGED_ATTACK)>0)}).length > 0) {
            actionRunAway.run(creep);
        }
        let creepCarrying = _.sum(creep.store);
        
        if (creep.memory.working == undefined) {
            creep.memory.working = false;
        }

        if (creep.memory.working == true && creepCarrying == 0) {
            creep.memory.working = false;
        }
        else if (creep.memory.working == false && creepCarrying == creep.store.getCapacity()) {
            creep.memory.working = true;
        }
        
        var itemToFill = function (creep) {
            let r = creep.room;
            let conts = r.find(FIND_STRUCTURES, {filter: o=>o.structureType==STRUCTURE_CONTAINER && o.store.getFreeCapacity('energy')>333});
            let sps = r.find(FIND_STRUCTURES, {filter: o=>o.structureType==STRUCTURE_SPAWN});
            let ctr = r.controller;
            let tofillconts = [];
            for (let cont of conts) {
                for (let sp of sps) {
                    if (cont.pos.getRangeTo(sp) < 3) {
                        if (cont.pos.findInRange(FIND_SOURCES, 1).length==0) {
                            return cont.id
                        }
                    }
                }
            }
            for (let cont of conts) {
                for (let sp of sps) {
                    if (cont.pos.getRangeTo(ctr) < 3) {
                        return cont.id
                    }
                }
            }
            
            let toFill = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: (s) => (((s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION) && s.energy < s.energyCapacity|| ( s.structureType == STRUCTURE_TOWER && s.store.energy < 0.5*_.sum(s.store))) && ifNotBunkerBlocked(creep.room, s.pos)) })
            if (toFill) {
                return toFill.id
            }
            return undefined
        }
        
        
        let structToFill = itemToFill(creep);

        if (structToFill == undefined) {
            lorry.run(creep);
        }
        else {
            if (creep.memory.working) {
                for (let tp in creep.store) {
                    if (tp !== 'energy') {
                        let stor = creep.room.storage;
                        if (stor) {
                            if (creep.transfer(stor, tp) == ERR_NOT_IN_RANGE) {
                                creep.travelTo(stor, {maxRooms: 1});
                                return
                            }
                        }
                        else {
                            creep.drop(tp);
                        }
                    }
                }
                
                let toFill = Game.getObjectById(structToFill);
                if (creep.transfer(toFill, 'energy') == ERR_NOT_IN_RANGE) {
                    creep.travelTo(toFill, {maxRooms: 1});
                    return
                }
            }
            else {
                if (creep.room.storage && creep.room.storage.store.energy>0) {
                    if (creep.pos.getRangeTo(creep.room.storage)>1) {
                        creep.travelTo(creep.room.storage);
                    }
                    else {
                        creep.withdraw(creep.room.storage, 'energy');
                    }
                    return
                }
                getE.run(creep);
            }
        }
    }
};
