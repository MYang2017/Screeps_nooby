module.exports = {
    run: function(creep) {
        if (creep.room.name == creep.memory.target) { // if in target room
            // do nothing
            creep.travelTo(Game.getObjectById('59f1c0062b28ff65f7f21507'));
        }
        else { // go to target room
            var exit = creep.room.findExitTo(creep.memory.target);
            creep.travelTo(new RoomPosition(25, 25, creep.memory.target));
        }
    }
};
