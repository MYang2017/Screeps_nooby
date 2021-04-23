var doge = require('action.idle');

module.exports = {
    run: function(creep) {
        let availableSpawns = ifSpawnAvailable(creep.room.name);
        let dist = 50;
        let togo;
        if (availableSpawns.length > 0) {
            for (let availableSpawn of availableSpawns ) {
                let thisDist = creep.pos.getRangeTo(availableSpawn);
                if (thisDist<dist) {
                    dist = thisDist;
                    togo = availableSpawn;
                }
            }
        }
        if (togo) {
            if (togo.renewCreep(creep) == ERR_NOT_IN_RANGE) {
                creep.moveTo(togo);
            }
        }
        else {
            doge.run(creep);
        }
    }
};
