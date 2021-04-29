var actionRunAway = require('action.flee');

module.exports = {
    run: function(creep) {
        if (creep.memory.home == undefined) {
            creep.memory.home = creep.room.name;
        }
        
        if (creep.memory.attackedAtTime && creep.memory.attackedAtTime+50>Game.time) {
            creep.moveTo(new RoomPosition(25, 25,creep.memory.home), {range: 20});
            //actionRunAway.run(creep);
        }
        else {
<<<<<<< HEAD
            if (creep.room.name != creep.memory.target) {
                //var exit = creep.room.findExitTo(creep.memory.target);
                //creep.moveTo(creep.pos.findClosestByRange(exit));
                //creep.moveTo(Game.flags[creep.memory.target].pos);
                creep.travelTo(new RoomPosition(25, 25, creep.memory.target));
            }
            else {
                if (creep.ticksRemaining == 2) {
                    creep.signController(creep.room.controller, '💕 Your friendly neighbour open for collaboration, whisper me to add to white list 💕 ')
                }
                else {
                    let ctr = creep.room.controller;
                    if (ctr && ctr.reservation && ctr.reservation.username !== 'PythonBeatJava') {
                        if (creep.attackController(ctr) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(ctr);
                        }
                    }
                    else {
                        let upc = creep.reserveController(ctr);
                        if ( upc == ERR_NOT_IN_RANGE) {
                            creep.moveTo(ctr, { maxRooms: 1 });
                        }
                        else if (upc == OK) {
                            let thingUnderFeet = creep.room.lookForAt(LOOK_STRUCTURES, creep)[0];
                            if (thingUnderFeet && thingUnderFeet.structureType && thingUnderFeet.structureType == STRUCTURE_ROAD) {
                                let allrs = creep.room.find(FIND_MY_CREEPS, {filter: o=>o.memory.role == 'reserver'});
                                for (let allr of allrs) {
                                    allr.move(getRandomInt(1,8));
                                }
                            }
                        }
                        actionRunAway.run(creep)
                    }
                }
=======
            if(false&&creep.room.controller && !creep.room.controller.my) {
                if(creep.attackController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller);
                }
            }
            else {
                if (creep.reserveController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller, { maxRooms: 1 });
                }
                actionRunAway.run(creep)
>>>>>>> master
            }
        }
    }
};
