module.exports = {
    run: function(creep) {
        if (creep.memory.home) {
            if (creep.room.name==creep.memory.home) {
                if (creep.pox.x == 0 || creep.pox.y == 0 || creep.pox.x == 49 || creep.pox.y == 49) {
                    creep.moveTo(25, 25, {maxRooms: 1});
                    return true
                }
            }
        }
    }
};
