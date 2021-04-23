var dog = require('action.idle');

module.exports = {
    run: function(creep) {
        //creep.say(['一夫当关', '万夫莫开'][Game.time%2], true)
        // if i dont have job
        let jobId = creep.memory.jobId;

        
        if (jobId == undefined) {
            if (Memory.didi == undefined) {
                Memory.didi = {};
            }
            else {
                Memory.didi[creep.id] = {t0: Game.time, td: creep.ticksToLive};
            }
            dog.run(creep);
        }
        else {
            let ed = Game.getObjectById(jobId);
            if (ed && (ed.memory.working == undefined || ed.memory.working==false)) {
                creep.memory.busy = true;
                let route = Game.map.findRoute(creep.room, ed.memory.target);
                let routed = Game.map.findRoute(ed.room, ed.memory.target);
                let ol = routed.length;
                let xl = route.length;
                let goNormal = true;
                let dist = creep.pos.getRangeTo(ed);
                let t0 = creep.memory.t0;
                // if x at boundary
                if (creep.pos.x == 0 || creep.pos.x == 49 || creep.pos.y == 0 || creep.pos.y == 49) {
                    // if o at boundary
                    if (ed.pos.x == 0 || ed.pos.x == 49 || ed.pos.y == 0 || ed.pos.y == 49) {
                        // both at boundary
                        if (ol>xl) { // if truck is closer to target, it is in the correct room, pull
                            if (creep.pos.x == 0) {
                                creep.moveTo(1, creep.pos.y);
                            }
                            else if (creep.pos.x == 49) {
                                creep.moveTo(48, creep.pos.y);
                            }
                            else if (creep.pos.y == 0) {
                                creep.moveTo(creep.pos.x, 1);
                            }
                            else if (creep.pos.y == 49) {
                                creep.moveTo(creep.pos.x, 48);
                            }
                            creep.pull(ed);
                            ed.move(creep);
                        }
                    }
                    else { // only x at boundary
                        creep.moveTo(ed);
                        creep.pull(ed);
                        ed.move(creep);
                    }
                }
                // else if only o at boundary
                else if (ed.pos.x == 0 || ed.pos.x == 49 || ed.pos.y == 0 || ed.pos.y == 49) {
                    if (xl == 0) {
                        // in target room
                        if (creep.pull(ed) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(ed, {range: 1});
                        }
                        else {
                            creep.moveTo(25, 25);
                            ed.move(creep);
                        }
                    }
                        else {
                        let exit = creep.pos.findClosestByRange(route[0].exit);
                        let exitRange = creep.pos.getRangeTo(exit);
                        // if x is close to exit
                        if (exitRange == 1) {
                            // get in
                            creep.moveTo(ed);
                        }
                        else { // else far from next exit
                            // pull out
                            creep.moveTo(25, 25);
                            creep.pull(ed);
                            ed.move(creep);
                        }
                    }
                }
                else { // else none at noundary
                    if (dist>1 || dist == Infinity) {
                        creep.travelTo(ed, {maxRooms: 1, creepCost: 10});
                        creep.pull(ed);
                        ed.move(creep);
                    }
                    else {
                        let target = ed.memory.target;
                        if (creep.room.name != target) {
                            if(route.length > 0) {
                                const exit = creep.pos.findClosestByRange(route[0].exit);
                                creep.travelTo(exit, {maxRooms: 1, creepCost: 10});
                            }
                            creep.pull(ed);
                            ed.move(creep);
                        }
                        else {
                            let finishDist = creep.pos.getRangeTo(ed.memory.posi.x, ed.memory.posi.y);
                            if (finishDist == 0) {
                                if (creep.moveTo(ed) == OK && creep.pull(ed) == OK && ed.move(creep) == OK) {
                                    creep.memory.jobId = undefined;
                                    Memory.didi[creep.id] = undefined;
                                    delete Memory.didi[creep.id];
                                    ed.memory.followId = undefined;
                                    creep.memory.busy = false;
                                }
                            }
                            else {
                                creep.travelTo(new RoomPosition(ed.memory.posi.x, ed.memory.posi.y, target), {maxRooms: 1, creepCost: 10});
                                creep.pull(ed);
                                ed.move(creep);
                            }
                        }
                    }
                }
            }
            else { // digger dead
                creep.memory.busy = false;
                creep.memory.jobId = undefined;
            }
        }
    }
};
