//Game.rooms['E94N17'].memory.forSpawning.spawningQueue.push({memory:{role:'claimer',target:'E94N17'},priority:10})

global.clearSpawnQueue = function() {
    for (let roomName of myRoomList()) {
        Game.rooms[roomName].memory.forSpawning.spawningQueue = [];
    }
}

global.removeRepairerRoom = function() {
    for (let roomName of myRoomList()) {
        Game.rooms[roomName].memory.forSpawning.roomCreepNo.minCreeps['builder'] = 0;
    }
}

global.myRoomList = function() {
    return ['E92N11','E92N12','E91N16','E94N17', 'E97N14', 'E94N22']
}

global.spawnCreepByRoomSpawnQueue = function(room) {
    let roomName = room.name;
    let availableSpawn = ifSpawnAvailable(roomName); // check spawn that is available for spawning
    let noOfAvailableSpawns = availableSpawn.length;
    //console.log(room.name+' spawn available '+noOfAvailableSpawns)

    for (let i = 0; i<noOfAvailableSpawns; i++) {
        let spawnToSpawn = availableSpawn[i];
        //console.log(spawnToSpawn.name, room.name)
        spawnCreepWithHighestPriority(spawnToSpawn, room);
    }
}

global.ifSpawnAvailable = function(roomName) {
    let spawns = Game.rooms[roomName].find(FIND_MY_STRUCTURES, {filter:s=>s.structureType==STRUCTURE_SPAWN});
    let availableSpawns = [];
    for (let spawn of spawns) {
        if (spawn.spawning == null) { // spawn is spawning
            availableSpawns.push(spawn); // return the free spawn
        }
    }
    return availableSpawns; // all spawns are busy
}

global.spawnCreepWithHighestPriority = function(spawnToSpawn, room) {
    let spawnQ = room.memory.forSpawning.spawningQueue;

    if (spawnQ.length>0) { // if spawn queue is not empty
        let spawnPriority = 0;
        let creepInfo;

        for (let creepToSpawn of spawnQ) {
            if (creepToSpawn.priority > spawnPriority) { // get creep with highest priority to spawn
                spawnPriority = creepToSpawn.priority;
                creepInfo = creepToSpawn;
            }
        }

        let creepMemory = creepInfo.memory;
        //console.log(creepMemory.role)

        switch (creepMemory.role) {
            case 'miner':
                if ( !(spawnToSpawn.createMiner(creepMemory.sourceID, creepMemory.target, creepMemory.currentRCL, creepMemory.ifMineEnergy, creepMemory.ifLink, creepMemory.ifKeeper)<0) ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                break;
            case 'scouter':
                if ( !(spawnToSpawn.createScouter(creepMemory.target, creepMemory.target)<0) ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                break;
            case 'longDistanceBuilder':
                if ( !(spawnToSpawn.createLongDistanceBuilder(creepMemory.energy, creepMemory.target, creepMemory.home)<0) ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                break;
            case 'reserver':
                if ( !(spawnToSpawn.createReserver(creepMemory.target, creepMemory.big)<0) ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                break;
            case 'longDistanceLorry':
                if ( !(spawnToSpawn.createLongDistanceLorry(creepMemory.energy, creepMemory.home, creepMemory.target)<0) ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                break;
            case 'ranger':
                if ( !(spawnToSpawn.createRanger(creepMemory.target, creepMemory.home)<0) ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                break;
            case 'attacker':
                if ( !(spawnToSpawn.createAttacker(creepMemory.energy, creepMemory.target)<0) ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                break;
            case 'claimer':
                if ( !(spawnToSpawn.createClaimer(creepMemory.target)<0) ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                break;
            case 'pioneer':
                if ( !(spawnToSpawn.createPioneer(creepMemory.energy, creepMemory.target,creepMemory.home)<0) ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                break;
            case 'teezer':
                if ( !(spawnToSpawn.createTeezer(creepMemory.energy, creepMemory.target,creepMemory.home)<0) ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                break;
            case 'superUpgrader':
                if ( !(spawnToSpawn.createSuperUpgrader()<0) ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                break;
            case 'transporter':
                if ( !(spawnToSpawn.createTransporter(creepMemory.resourceType)<0) ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                break;
            case 'keeperLairMeleeKeeper':
                if ( !(spawnToSpawn.createKeeperLairMeleeKeeper(creepMemory.target, creepMemory.ranged)<0) ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                break;
            case 'keeperLairLorry':
                if ( !(spawnToSpawn.createKeeperLairLorry(creepMemory.target, creepMemory.home)<0) ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                break;
            default:
                //console.log(spawnToSpawn.createCustomCreep(creepMemory.energy, creepMemory.role));
                if ( !(spawnToSpawn.createCustomCreep(creepMemory.energy, creepMemory.role, creepMemory.target)<0) ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
        }

        return spawnQ
    }
}

global.removeElementInArrayByElement = function(element, array) {
    let indexToRemove = array.indexOf(element);
    array.splice(indexToRemove, 1);
}

global.justForOnce = function() {
    let array = [1,2,3,4];
    removeElementInArrayByElement(2,array);
    console.log(array)
}
