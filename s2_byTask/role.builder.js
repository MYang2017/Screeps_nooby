var actionGetEnergy = require('action.getEnergy');
var actionBuild = require('action.build');
var actionRecycle = require('action.recycle');

module.exports = {
    run: function(creep) {
        creep.say('building');
        
        if (creep.room.find(FIND_MY_CONSTRUCTION_SITES).length==0 && creep.room.controller) { // middle room dont recycle, keep repairing
            if (creep.room.controller.level == 7 || creep.room.controller.level == 6) {
                creep.memory.role = 'superUpgrader';
            }
            else {
                creep.memory.recycle = true;
                if (creep.room.memory.forSpawning) {
                    creep.room.memory.forSpawning.roomCreepNo.minCreeps['builder'] = 0;
                }
            }
        }
        else {
            creep.memory.recycle = false;
        }
        
        if (creep.memory.recycle) {
            if (creep.room.memory.forSpawning) { 
                updateRoomPlan(creep.room.name);
            }
            if (creep.memory.home==undefined) {
                creep.memory.home=creep.room.name;
            }
            if (creep.room.name != creep.memory.home) {
                creep.memory.target = creep.memory.home;
                creep.travelTo(new RoomPosition(25,25,creep.memory.home));
            }
            else {
                actionRecycle.run(creep);
                return
            }
        }
        else {
            if (creep.memory.working == true && creep.carry.energy == 0) {
                creep.memory.working = false;
            }
            else if (creep.memory.working == false && creep.carry.energy == creep.carryCapacity) {
                creep.memory.working = true;
            }
    
            if (creep.memory.working == true) {
                actionBuild.run(creep);
            }
            else { // finding resources
                actionGetEnergy.run(creep);
            }
        }
    }
};
