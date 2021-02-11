module.exports = {
    run: function (creep) {
        creep.say('oh...');

        // movement
        let shootersPath = creep.room.memory.shootersPath;
        let currentPosObj = {'x':creep.pos.x,'y':creep.pos.y};
        let indexOfCurrent;
        for (let cachedPos of shootersPath) {
            if (cachedPos.x == currentPosObj.x && cachedPos.y == currentPosObj.y) {
                indexOfCurrent = shootersPath.indexOf(cachedPos);
            }
        }
        creep.move(cacheShootersMovingDirections()[indexOfCurrent]);

        // upgrading
        creep.withdraw(creep.room.storage, RESOURCE_ENERGY);
        creep.upgradeController(creep.room.controller);
    }
};
