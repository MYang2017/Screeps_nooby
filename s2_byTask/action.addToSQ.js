module.exports = {
    run: function(creep) {
        if (creep.ticksToLive==1) {
            let h = creep.memory.home;
            if (h==undefined) {
                h = creep.room.name;
            }
            let meminfo = {};
            for (let inf in creep.memory) {
                meminfo[inf] = creep.memory[inf];
            }
            Game.rooms[h].memory.forSpawning.spawningQueue.push({memory: meminfo, priority: 13});
        }
    }
};