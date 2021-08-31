var actionRepair = require('action.repair');
var actionUpgrade = require('action.upgradeController');
var actionAvoid = require('action.idle');

module.exports = {
    run: function (creep) {
        var constructionSite = creep.room.find(FIND_MY_CONSTRUCTION_SITES, c => c.structureType == STRUCTURE_EXTENSION);
        if (!constructionSite) {
            constructionSite = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
        }
        else {
            constructionSite = constructionSite[0]
        }
        
        let nbcs = creep.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 3);
        if (nbcs.length>0) {
            creep.build(nbcs[0]);
        }

        if (constructionSite != undefined) {
            creep.build(constructionSite);
            if (creep.pos.getRangeTo(constructionSite) > 3) {
                creep.travelTo(constructionSite, { maxRooms: 1, range: 3 });

            }
            else {
                if (((creep.pos.x == 0) || (creep.pos.x == 49)) || ((creep.pos.y == 0) || (creep.pos.y == 49))) {
                    creep.travelTo(new RoomPosition(25, 25, creep.memory.target), { maxRooms:1, range: 15 })
                }
                else {
                    if (creep.pos.findInRange(FIND_MY_CREEPS, 1, {filter: c=>c.getActiveBodyparts(MOVE)>0}).length>1) {
                        let thingUnderFeet = creep.room.lookForAt(LOOK_STRUCTURES, creep)[0];
                        if (thingUnderFeet && thingUnderFeet.structureType && thingUnderFeet.structureType == STRUCTURE_ROAD) {
                            creep.move(getRandomInt(1, 8));
                        }
                    }
                }
            }
        }
        else { // no construction site, do something else
            if (creep.room.find(FIND_STRUCTURES, { filter: s => s.structureType == STRUCTURE_TOWER }).length > 0) { // tower is here, repaire no needed, do something else
                if (creep.room.controller.level == 0) { // if not in controlled rooms
                    creep.memory.target = creep.memory.home; // go back home
                }
                else {
                    actionUpgrade.run(creep);
                }
            }
            else {
                actionRepair.run(creep);
            }
        }
    }
};
