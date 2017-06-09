module.exports = {
    run: function(creep) {
        if (creep.room.name == creep.memory.target) { // if in target room
            //console.log(creep.claimController(creep.room.controller));
            if (creep.claimController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);

            }
            creep.signController(creep.room.controller, 'Territory of the Twilight Kingdoms of the East');
        }
        else { // go to target room
            var destination = Game.flags['go'].pos;
            creep.moveTo(destination);
        }
    }
};
