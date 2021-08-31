var actionRunAway = require('action.flee');
var actionAvoid = require('action.idle');

require('funcExpand');

module.exports = {
    run: function(creep) {
        if (creep.room.name==creep.memory.target) {
            if (creep.room.find(FIND_HOSTILE_CREEPS, {filter:c=>c.getActiveBodyparts(ATTACK)+c.getActiveBodyparts(RANGED_ATTACK)}).length>0) {
                creep.travelTo(new RoomPosition(25, 25, creep.memory.hide));
                creep.memory.timer = Game.time;
            }
            else {
                if (creep.pos.getRangeTo(25, 25)>22) {
                    creep.moveTo(25, 25);
                }
            }
            return
        }
        
        if (creep.pos.findInRange(FIND_HOSTILE_CREEPS, 7).length>0) {
            actionRunAway.run(creep);
            return
        }
        
        if (creep.room.name!=creep.memory.target) {
            if (creep.memory.timer && Game.time<creep.memory.timer+25) {
                creep.travelTo(new RoomPosition(25, 25, creep.memory.hide), {range: 22});
            }
            else {
                creep.travelTo(new RoomPosition(25, 25, creep.memory.target));
            }
        }
    }
};