module.exports = {
    run: function(creep) {
        creep.say('💕', true);
        if (!creep.memory.boosted) { // if creep is not boosted, find a lab to boost
            let labToGo;
            let labs = creep.room.find(FIND_MY_STRUCTURES, {filter: c => c.structureType == STRUCTURE_LAB});
            for (let lab of labs) {
                if (lab.mineralType == 'LHO2' && lab.mineralAmount>=30*25 && lab.energy>=20*25) {
                    labToGo = lab;
                    break;
                }
            }
            if ( creep.pos.getRangeTo(labToGo) > 1 ) {
                creep.moveTo(labToGo);
            }
            else {
                if (labToGo.boostCreep(creep) == 0) {
                    creep.memory.boosted = true;
                }
            }

        }
        else {
            if (creep.hits > 0.9*creep.hitsMax) { // if full health
                if (creep.room.name == creep.memory.target) {// if creep in target room
                    let toHeal = lowestHealthInRoom(creep);
                    if (toHeal.hits!=toHeal.hitsMax&&creep.heal(toHeal)==0) { // if found creep
                    }
                    else {
                        creep.rangedHeal(toHeal);
                        creep.moveTo(toHeal);
                    }
                }
                else {
                    creep.travelTo(new RoomPosition(25,25, creep.memory.target));
                    creep.heal(creep);
                }
            }
            else { // wounded, escape
                if (Game.flags[creep.memory.target+'esc']) {
                    creep.moveTo(Game.flags[creep.memory.target+'esc']);
                    creep.heal(creep);
                }
                else {
                    var exit = creep.room.findExitTo(creep.memory.target);
                    creep.moveTo(creep.pos.findClosestByRange(exit));
                    creep.heal(creep);
                }
            }
        }
    }
};
