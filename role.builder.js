var roleRepairer = require('role.repairer');

module.exports = {
    run: function(creep) {
        creep.say('building');
        if (creep.memory.working == true && creep.carry.energy == 0) {
            creep.memory.working = false;
        }
        else if (creep.memory.working == false && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
        }

        if (creep.memory.working == true) {
            var constructionSite = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES)
            if (constructionSite != undefined) {
                //if (creep.build(constructionSite) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(constructionSite);
                    creep.build(constructionSite);
                //}
            }
            else {
                roleRepairer.run(creep);
            }
        }
        else { // finding resources
            let container = creep.pos.findClosestByRange(FIND_DROPPED_ENERGY); // find dropped energy first
            if (container != undefined && container.energy > 500 && creep.pos.inRangeTo(container, 20)) { // if found and quite a lot and within 20 linear distance
                if (creep.pickup(container) == ERR_NOT_IN_RANGE) {
                creep.moveTo(container);
                }
            }
            else { // if no dropped energy found or small quantity or very far away
                let container = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: s => (s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_STORAGE) && s.store[RESOURCE_ENERGY] > 0});
                if (container != undefined) {
                    if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(container);
                    }
                }
                else {
                    var source = creep.pos.findClosestByRange(FIND_SOURCES);
                    if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(source);
                    }
                }
            }
        }
    }
};
