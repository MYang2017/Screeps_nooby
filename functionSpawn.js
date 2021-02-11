//Game.rooms['E94N17'].memory.forSpawning.spawningQueue.push({memory:{role:'claimer',target:'E94N17'},priority:10})

global.changeRoomCreepTypeAndCost = function (roomName, role, no, cost) {
    let roomCreepInfo = Game.rooms[roomName].memory.forSpawning.roomCreepNo;
    roomCreepInfo.minCreeps[role] = no;
    roomCreepInfo.creepEnergy[role] = cost;
}

global.clearSpawnQueue = function() {
    for (let roomName in Game.rooms) {
        let r = Game.rooms[roomName];
        if (r && r.controller.my) {
            console.log(roomName + ' spawn queue cleared.')
            r.memory.forSpawning.spawningQueue = [];
        }
    }
}

global.removeRepairerRoom = function() {
    for (let roomName of myRoomList()) {
        Game.rooms[roomName].memory.forSpawning.roomCreepNo.minCreeps['builder'] = 0;
    }
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
    //let motherRoomName = Game.rooms[roomName].motherRoomName;
    //if (!motherRoomName) {
        let spawns = Game.rooms[roomName].find(FIND_MY_STRUCTURES, {filter:s=>s.structureType==STRUCTURE_SPAWN});
        let availableSpawns = [];
        for (let spawn of spawns) {
            if (spawn.spawning == null) { // spawn is spawning
                availableSpawns.push(spawn); // return the free spawn
            }
        }
        return availableSpawns; // all spawns are busy
    //}
}

global.spawnCreepWithHighestPriority = function(spawnToSpawn, room) {
    let spawnQ = room.memory.forSpawning.spawningQueue;
    let lvl = room.controller.level;

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
        console.log('waiting to spawn ' + room.name, creepMemory.role);

        switch (creepMemory.role) {
            case 'miner':
                fo(spawnToSpawn.createMiner(creepMemory.sourceID, creepMemory.target, creepMemory.currentRCL, creepMemory.ifMineEnergy, creepMemory.ifLink, creepMemory.ifKeeper, room.name));
                if ( !(spawnToSpawn.createMiner(creepMemory.sourceID, creepMemory.target, creepMemory.currentRCL, creepMemory.ifMineEnergy, creepMemory.ifLink, creepMemory.ifKeeper, room.name)<0) ) {
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
            case 'longDistanceHarvester':
                if (!(spawnToSpawn.createLongDistanceHarvester(creepMemory.energy, creepMemory.home, creepMemory.target ) < 0)) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                break;
            case 'reserver':
                if ( !(spawnToSpawn.createReserver(creepMemory.target, creepMemory.big, creepMemory.roomEnergyMax)<0) ) {
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
                if ( !(spawnToSpawn.createPioneer(creepMemory.energy, creepMemory.target,creepMemory.home,creepMemory.superUpgrader,creepMemory.route)<0) ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                break;
            case 'teezer':
                if (!(spawnToSpawn.createTeezer(creepMemory.energy, creepMemory.target, creepMemory.home, creepMemory.preferredLocation)<0) ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                break;
            case 'superUpgrader':
                let superUpgraderEnergy = creepMemory.energyMax;
                if (lvl == 8) {
                    superUpgraderEnergy = 2050;
                }
                if (!(spawnToSpawn.createSuperUpgrader(superUpgraderEnergy)<0) ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                break;
            case 'transporter':
                if (!(spawnToSpawn.createTransporter(creepMemory.resourceType, creepMemory.fromStorage)<0) ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                break;
            case 'keeperLairMeleeKeeper':
                if ( !(spawnToSpawn.createKeeperLairMeleeKeeper(creepMemory.target, creepMemory.home, creepMemory.ranged)<0) ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                break;
            case 'keeperLairInvaderAttacker':
                if ( !(spawnToSpawn.createKeeperLairInvaderAttacker(creepMemory.target, creepMemory.home, creepMemory.name)<0) ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                break;
            case 'keeperLairInvaderHealer':
                if ( !(spawnToSpawn.createKeeperLairInvaderHealer(creepMemory.target, creepMemory.home, creepMemory.toHeal)<0) ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                break;
            case 'keeperLairLorry':
                if ( !(spawnToSpawn.createKeeperLairLorry(creepMemory.target, creepMemory.home)<0) ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                break;
            case 'captain':
                if ( !(spawnToSpawn.createCaptain(creepMemory.groupName)<0) ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                break;
            case 'firstMate':
                if ( !(spawnToSpawn.createFirstMate(creepMemory.groupName, creepMemory.boostMat)<0) ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                break;
            case 'crew':
                if ( !(spawnToSpawn.createCrew(creepMemory.groupName, creepMemory.boostMat)<0) ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                break;
            case 'healer':
                if ( !(spawnToSpawn.createHealer(creepMemory.target, creepMemory.boosted)<0) ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                break;
            case 'ultimateWorrior':
                if ( !(spawnToSpawn.createUltimateWorrior(creepMemory.target)<0) ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                break;
            case 'dismantler':
                if ( !(spawnToSpawn.createDismantler(creepMemory.target)<0) ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                break;
            case 'ultimateUpgrader':
                if ( !(spawnToSpawn.createUltimateUpgrader(false)<0) ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                break;
            case 'powerSourceLorry':
                if ( !(spawnToSpawn.createPowerSourceLorry(creepMemory.target,creepMemory.home)<0) ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                break;
            case 'powerSourceAttacker':
                if ( !(spawnToSpawn.createPowerSourceAttacker(creepMemory.target,creepMemory.name)<0) ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                break;
            case 'powerSourceHealer':
                if ( !(spawnToSpawn.createPowerSourceHealer(creepMemory.target,creepMemory.toHeal)<0) ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                break;
            case 'wanderer':
                if ( !(spawnToSpawn.createWanderer(creepMemory.target)<0) ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                break;
            case 'onlyMineralDefender':
                if (!(spawnToSpawn.createOnlyMineralDefender(creepMemory.target, creepMemory.home) < 0)) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                break;
            case 'onlyMineralMiner':
                if (!(spawnToSpawn.createOnlyMineralMiner(creepMemory.target, creepMemory.home) < 0)) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                break;
            case 'onlyMineralHauler':
                if (!(spawnToSpawn.createOnlyMineralHauler(creepMemory.target, creepMemory.home) < 0)) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                break;
            default:
                if ( spawnToSpawn.createCustomCreep(creepMemory.energy, creepMemory.role, creepMemory.target) == OK ) {
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

global.updateSpawnQueueTimer = function(room) {
    if (room.memory.spawnQueueTimer == undefined) {
        room.memory.spawnQueueTimer = 0;
        room.memory.forSpawning = {}
        room.memory.forSpawning.spawningQueue = []
        return false
    }
    else {
        let spawnQueueTimer = room.memory.spawnQueueTimer;
        let noOfSpawns = room.find(FIND_STRUCTURES,{filter:s=>s.structureType==STRUCTURE_SPAWN}).length;
        let spawnTimeThreshold = 3*Math.pow(noOfSpawns,2) + 2;
        if ( noOfSpawns>0 && room.memory.forSpawning.spawningQueue.length>20) { // to clear bad spawns in queue
            console.log('bad spawn queue in room: '+room.name);
            clearSpawnQueue()
        }
        if (spawnQueueTimer>spawnTimeThreshold) {
            room.memory.spawnQueueTimer = 0;
            //console.log(room.name + ' spawn queue updated');
            return true
        }
        else {
            let noOfAvailableSpawns = ifSpawnAvailable(room.name).length;
            room.memory.spawnQueueTimer += noOfAvailableSpawns;
            //console.log(room.name + ' timer ', spawnQueueTimer)
            return false
        }
    }
}

//////////////////////////////////////////////////////////////////////////////////////////

global.justForOnce = function() {
    let array = [1,2,3,4];
    removeElementInArrayByElement(2,array);
    console.log(array)
}

global.changeAllMyCreeps = function() {
    /*for (let name in Game.creeps) {
        if (Game.creeps[name].memory.role == 'ultimateUpgrader') {
            Game.creeps[name].memory.boosted = true;
        }
    }*/
    for (let name in Game.creeps) {
        if (Game.creeps[name].memory.role == 'powerSourceLorry') {
            Game.creeps[name].memory.target = 'E94N12';
            Game.creeps[name].memory.role = 'begger';
        }
    }
}

global.spawnPowerLorries = function() {
    //Game.rooms['E92N12'].memory.forSpawning.spawningQueue.push({memory:{role: 'powerSourceLorry', target: 'E90N11', home: 'E92N11'},priority: 1.1});
    //Game.rooms['E92N12'].memory.forSpawning.spawningQueue.push({memory:{role: 'powerSourceLorry', target: 'E90N11', home: 'E92N11'},priority: 1.1});
    Game.rooms['E92N11'].memory.forSpawning.spawningQueue.push({memory:{role: 'powerSourceLorry', target: 'E90N11', home: 'E92N11'},priority: 1.1});
    Game.rooms['E92N11'].memory.forSpawning.spawningQueue.push({memory:{role: 'powerSourceLorry', target: 'E90N11', home: 'E92N11'},priority: 1.1});
    Game.rooms['E92N11'].memory.forSpawning.spawningQueue.push({memory:{role: 'powerSourceLorry', target: 'E90N11', home: 'E92N11'},priority: 1.1});
}
