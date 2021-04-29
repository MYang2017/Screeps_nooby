// lorry now only fill energy in room since v7
var actionAvoid = require('action.idle');
var noStoragePickuper = require('role.pickuper');
//var getE = require('action.getEnergy');
var getE = require('action.getEnergyByTask');
var fillE = require('action.fillEnergyByTask');
var doCarry = require('action.moverDoCarryJob');

module.exports = {
    run: function (creep) {
        // clear long unfinished taskl
        creep.trackDeadTaskTimer();
        
        //if ((creep.room.terminal == undefined)||(creep.room.find(FIND_MY_STRUCTURES, {filter:c=>c.structureType==STRUCTURE_LINK}).length==0)) {
        if (creep.memory.target==undefined) {
            creep.memory.target = creep.room.name;
        }
        
        // working boolean
        if (creep.memory.working == undefined) {
            creep.memory.working = true;
        }
        let load = creep.store.getUsedCapacity();
        if ( creep.memory.working == true && load == 0 ) { // if no energy
            creep.memory.working = false; //  when false, get energy
        }
        else if (creep.memory.working == false && load == creep.carryCapacity) {
            creep.memory.working = true;
        }
        
        if ((creep.room.name != creep.memory.target) || ((creep.pos.x==0)||(creep.pos.y==0)||(creep.pos.x==49)||(creep.pos.y==49)) ) {
            creep.travelTo(new RoomPosition(25, 25, creep.memory.target))
        }
        else  { // at home
            if (creep.memory.working == false) { // without load, do move task first 
                // if movement task do movement task
                if (doCarry.run(creep)) {
                    return
                }
                else {
                    // if get task, do get task
                    if (getE.run(creep)) {
                        return
                    }
                    else {
                        actionAvoid.run(creep);
                    }
                }
            }
            else { // working true (has >0 energy), 
                // finish unfinished fill E task if any
                if (fillE.run(creep)) {
                    return
                }
                else {
                    // do move task if any
                    if (doCarry.run(creep)) {
                        // drop and do move task
                        creep.drop('energy');
                        return
                    }
                    else {// if no move task
                        if (getE.run(creep)) { // if get E task
                            return
                        }
                        else { // else no move task idle
                            actionAvoid.run(creep);
                        }
                    }
                }
            }
        }
    }
};
