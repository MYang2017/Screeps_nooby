var selfRecycling = require('action.selfRecycle');

module.exports = {
    run: function (creep) {
        if (creep.memory.prepareToDie && creep.memory.prepareToDie == true) {
            selfRecycling.run(creep);
            //console.log(creep.room.name)
            let baseFlag = Game.flags['base' + creep.memory.target];
            if (baseFlag) {
                Game.rooms[creep.memory.target].createConstructionSite(baseFlag.pos.x, baseFlag.pos.y, STRUCTURE_SPAWN, 'Spawn_' + creep.memory.target + '_1')
            }
            else {
                console.log('Please set spawn position for room: ' + creep.memory.target);
            }
        }
        else {
            if (creep.room.name == creep.memory.target) { // if in target room
                //console.log(creep.claimController(creep.room.controller));
                if (creep.room.controller.my) {
                    
                    creep.memory.prepareToDie = true;
                }
                else {
                    if (creep.claimController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                        creep.travelTo(creep.room.controller);

                    }
                    creep.signController(creep.room.controller, '‍♂‍♀ 💕 May the world full of peace and love 💕 ‍♂‍♀');
                }
            }
            else { // go to target room
                if (Game.flags['go']) {
                    var destination = Game.flags['go'].pos;
                    creep.travelTo(destination);
                    //creep.travelTo(Game.rooms[creep.memory.target])
                }
                else {
                    creep.travelTo(new RoomPosition(25, 25, creep.memory.target));
                }

            }
        }
    }
};
