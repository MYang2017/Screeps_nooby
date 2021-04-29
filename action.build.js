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
        if (constructionSite != undefined) {
            if (creep.build(constructionSite) == ERR_NOT_IN_RANGE) {
                creep.travelTo(constructionSite, { maxRooms: 1 });
                //creep.build(constructionSite);
            }
            else {
                if (((creep.pos.x == 0) || (creep.pos.x == 49)) || ((creep.pos.y == 0) || (creep.pos.y == 49))) {
                    creep.travelTo(new RoomPosition(25, 25, creep.memory.target), { range: 15 })
                }
                else {
                    let posi = creep.pos;
                    let objectsAround = creep.room.lookForAtArea(LOOK_CREEPS, posi.y-1, posi.x-1, posi.y+1, posi.x+1, true);
                    if (objectsAround.length>=4) {
                        actionAvoid.run(creep);
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
