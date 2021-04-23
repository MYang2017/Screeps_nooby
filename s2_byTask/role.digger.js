module.exports = {
    run: function(creep) {
        creep.say(['一夫当关', '万夫莫开'][(Game.time+1)%2], true)
        
        // if in movement
        let target = creep.memory.target;
        let tarPosi = creep.memory.posi;
        let toEatId = creep.memory.toEatId;
        let following = creep.memory.followId;
        
        if (creep.memory.working == true) {
            creep.dismantle(Game.getObjectById(toEatId));
        }
        else {
            if (following) {
                let puller = Game.getObjectById(following);
                if (puller !== null) {
                    if (creep.pos.x==tarPosi.x && creep.pos.y==tarPosi.y && creep.pos.roomName == target) {
                        creep.memory.followId = undefined;
                        creep.memory.working = true;
                        puller.memory.jobId = undefined;
                    }
                    else {
                    }
                }
                else {
                    delete Memory.didi[following];
                    creep.memory.followId = undefined;
                }
            }
            else {
                if (Memory.didi) {
                    let closer = Infinity;
                    let toBound = undefined;
                    for (let pullerId in Memory.didi) {
                        let puller = Game.getObjectById(pullerId);
                        
                        if (puller == null) {
                            delete Memory.didi[pullerId];
                        }
                        else {
                            if (puller.memory.busy == undefined || puller.memory.busy == false) {
                                let thisDist = Game.map.getRoomLinearDistance(creep.room.name, puller.room.name);
                                if (thisDist<closer) {
                                    closer = thisDist;
                                    toBound = pullerId;
                                }
                            }
                        }
                    }
                    if (toBound != undefined) {
                        creep.memory.followId = toBound;
                        Game.getObjectById(toBound).memory.jobId = creep.id;
                    }
                }
            }
        }
    }
};
