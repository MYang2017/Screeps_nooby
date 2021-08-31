var actionRunAway = require('action.idle');
let getB = require('action.getBoost');
let gogo = require('action.attackAllInOne');
let dego = require('action.flee')

module.exports = {
    run: function(creep) {
        creep.say('Biu~', true);
        let q = creep.pos.findInRange(FIND_MY_CREEPS, 2, {filter: c=>c.memory.role=='quads'});
        if (q.length>0) {
            actionRunAway.run(creep);
            creep.heal(creep);
            return
        }
        if (creep.hits<0.9*creep.hitsMax) { // if damaged
            // if in target
            if (creep.room.name==creep.memory.target) { // in target retreat
                retreatToNexRoom(creep);
            }
            else { // not in target, safe
                creep.moveTo(25, 25, {range: 24});
            }
        }
        else { // healthy
            if (travelToPrioHighwayWithClosestRoomExit(creep, creep.memory.target)) {
                creep.moveTo(25, 25, {range: 24});
            }
        }
        creep.heal(creep);
    }
};
