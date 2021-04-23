module.exports = {
    run: function(creep) {
        let availableSpawns = ifSpawnAvailable(creep.room.name);
        if (availableSpawns.length > 0) {
            let availableSpawn = availableSpawns[0];
            if (availableSpawn.recycleCreep(creep) == ERR_NOT_IN_RANGE) {
                creep.moveTo(availableSpawn);
            }
        }
    }
};
