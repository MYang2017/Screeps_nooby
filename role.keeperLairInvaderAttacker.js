var actionRunAway = require('action.idle');

module.exports = {
    run: function(creep) {
        if (creep.room.name == creep.memory.target) { // if in target room
            let hostileCreep = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter: s => s.owner.username=='Invader'&&!allyList().includes(s.owner.username)});
            if (hostileCreep) { // if there is damaged creep, go heal
                if (creep.attack(hostileCreep) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(hostileCreep,{maxRooms:1});
                    creep.rangedAttack(hostileCreep);
                }
                creep.rangedMassAttack();
            }
            else {
                let hostileCreep = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter: s => !allyList().includes(s.owner.username)});
                if (hostileCreep) { // if there is damaged creep, go heal
                    if (creep.attack(hostileCreep) == ERR_NOT_IN_RANGE) {
                        creep.travelTo(hostileCreep,{maxRooms:1});
                        creep.rangedAttack(hostileCreep);
                    }
                    creep.rangedMassAttack();
                }
                else {
                    actionRunAway.run(creep);
                }
            }
        }
        else {
            creep.travelTo(new RoomPosition(25,25,creep.memory.target),{range:5});
        }
    }
};
