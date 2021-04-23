var actionRunAway = require('action.idle');
let getB = require('action.getBoost');
let gogo = require('action.attackAllInOne');
let dego = require('action.flee')

module.exports = {
    run: function(creep) {
        creep.say('Biu~', true);
        if (getB.run(creep)!=true) {
            return
        }
        else {
            let q = creep.pos.findInRange(FIND_MY_CREEPS, 2, {filter: c=>c.memory.role=='quads'});
            if (q.length>0) {
                actionRunAway.run(creep);
                creep.heal(creep);
                return
            }
            if (creep.room.name == creep.memory.target) { // if in target (giver) room, go withdraw from storage:
                if (creep.hits<0.9*creep.hitsMax) {
                    retreatToNexRoom(creep);
                }
                else {
                    creep.moveTo(25, 25, {range: 24});
                }
            }
            else { // if not in target room, move to target room
                if (storedTravelFromAtoB(creep, 'l')) { // not in target
                    // in target
                }
            }
        }
        creep.heal(creep);
    }
};
