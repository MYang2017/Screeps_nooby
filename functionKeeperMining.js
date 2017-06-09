global.keeperLairToGo = function(creep, keeperRoomName) {
    // called when a keeper is removed or creep just entre keeper room
    let target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter: s => (!allyList().includes(s.owner))}); // find hostile creeps in keeper room
    if (target) { // if found
        return target
    }
    else { // if no target, go to the keeper lair that is about to spawn
        let keeperRoom = Game.rooms[keeperRoomName];
        let keeperLairs = keeperRoom.find(FIND_STRUCTURES, {filter: c => c.structureType == STRUCTURE_KEEPER_LAIR});
        let lowestSpawningTimer = 1000;
        let goToLair;
        for (let keeperLair of keeperLairs) {
            if (keeperLair.ticksToSpawn < lowestSpawningTimer) {
                goToLair = keeperLair;
                lowestSpawningTimer = keeperLair.ticksToSpawn;
            }
        }
        if (lowestSpawningTimer < 50) { // about to spawn, go there immediately!
            return goToLair;
        }
    }
}
