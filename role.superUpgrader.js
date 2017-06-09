var actionUpgrade = require('action.upgradeController');

module.exports = {
    run: function(creep) {
        creep.say('UP');
        if (creep.memory.working == true) {
            let storage = creep.room.storage;
            creep.withdraw(storage, RESOURCE_ENERGY);
            actionUpgrade.run(creep);
        }
        else if (creep.memory.working == false) {
            let roomName = creep.room.name;
            if ((creep.pos.isEqualTo(Game.flags['up'+roomName]))||(creep.pos.isEqualTo(Game.flags['up'+roomName+'1']))) {
                creep.memory.working = true;
            }
            else {
                let firstUp = Game.flags['up'+roomName].pos.findInRange(FIND_MY_CREEPS, 0)[0];
                if (firstUp && firstUp.memory.role == 'superUpgrader') {
                    creep.travelTo(Game.flags['up'+roomName+'1']);
                }
                else {
                    creep.travelTo(Game.flags['up'+roomName]);
                }
            }
        }

        // re-spawn creep in advance
        /*if (creep.ticksToLive == creep.memory.spawnTime) {
            creep.room.memory.forSpawning.spawningQueue.push({memory:{role: 'superUpgrader'},priority: 5.1});
            console.log('respawn superUpgrader in advance');
        }*/
    }
};
