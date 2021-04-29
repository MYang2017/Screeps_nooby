//Game.rooms['E94N17'].memory.forSpawning.spawningQueue.push({memory:{role:'claimer',target:'E94N17'},priority:10})

global.changeRoomCreepTypeAndCost = function (roomName, role, no, cost) {
    let roomCreepInfo = Game.rooms[roomName].memory.forSpawning.roomCreepNo;
    roomCreepInfo.minCreeps[role] = no;
    roomCreepInfo.creepEnergy[role] = cost;
}

global.clearSpawnQueue = function(rn) {
    let r = Game.rooms[rn];
    if (r && r.controller.my) {
        console.log(rn + ' spawn queue cleared.')
        r.memory.forSpawning.spawningQueue = [];
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
        if (creepInfo == undefined) {
            clearSpawnQueue(room.name);
        }
        else {
        let creepMemory = creepInfo.memory;
        switch (creepMemory.role) {
            case 'miner':
                if ( !(spawnToSpawn.createMiner(creepMemory.sourceID, creepMemory.target, creepMemory.currentRCL, creepMemory.ifMineEnergy, creepMemory.ifLink, creepMemory.ifKeeper, room.name, creepMemory.ifRescue, creepMemory.ifEarly)<0) ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                return;
            case 'mover':
                if (!(spawnToSpawn.createMover(creepMemory.ifRescue) < 0)) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                return;
            case 'scouter':
                if ( !(spawnToSpawn.createScouter(creepMemory.target, creepMemory.target)<0) ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                return;
            case 'longDistanceBuilder':
                if ( !(spawnToSpawn.createLongDistanceBuilder(creepMemory.energy, creepMemory.target, creepMemory.home)<0) ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                return;
            case 'longDistanceHarvester':
                if (!(spawnToSpawn.createLongDistanceHarvester(creepMemory.energy, creepMemory.home, creepMemory.target ) < 0)) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                return;
            case 'reserver':
                if ( !(spawnToSpawn.createReserver(creepMemory.target, creepMemory.big, creepMemory.roomEnergyMax)<0) ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                return;
            case 'longDistanceLorry':
                if ( !(spawnToSpawn.createLongDistanceLorry(creepMemory.energy, creepMemory.home, creepMemory.target)<0) ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                return;
            case 'ranger':
                if (!(spawnToSpawn.createRanger(creepMemory.target, creepMemory.home, creepMemory.RCL)<0) ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                return;
            case 'attacker':
                if ( !(spawnToSpawn.createAttacker(creepMemory.target, creepMemory.home, undefined )<0) ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                return;
            case 'claimer':
                if ( !(spawnToSpawn.createClaimer(creepMemory.target)<0) ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                return;
            case 'pioneer':
                if ( !(spawnToSpawn.createPioneer(creepMemory.energy, creepMemory.target,creepMemory.home,creepMemory.superUpgrader,creepMemory.route)<0) ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                return;
            case 'teezer':
                if (!(spawnToSpawn.createTeezer(creepMemory.energy, creepMemory.target, creepMemory.home, creepMemory.preferredLocation)<0) ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                return;
            case 'superUpgrader':
                let superUpgraderEnergy = creepMemory.energyMax;
                if (lvl == 8) {
                    superUpgraderEnergy = 2050;
                }
                if (!(spawnToSpawn.createSuperUpgrader(superUpgraderEnergy)<0) ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                return;
            case 'transporter':
                if (!(spawnToSpawn.createTransporter(creepMemory.resourceType, creepMemory.fromStorage)<0) ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                return;
            case 'keeperLairMeleeKeeper':
                if ( !(spawnToSpawn.createKeeperLairMeleeKeeper(creepMemory.target, creepMemory.home, creepMemory.ranged)<0) ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                return;
            case 'keeperLairInvaderAttacker':
                if ( !(spawnToSpawn.createKeeperLairInvaderAttacker(creepMemory.target, creepMemory.home, creepMemory.name)<0) ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                return;
            case 'keeperLairInvaderHealer':
                if ( !(spawnToSpawn.createKeeperLairInvaderHealer(creepMemory.target, creepMemory.home, creepMemory.toHeal)<0) ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                return;
            case 'keeperLairLorry':
                if ( !(spawnToSpawn.createKeeperLairLorry(creepMemory.target, creepMemory.home)<0) ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                return;
            case 'captain':
                if ( !(spawnToSpawn.createCaptain(creepMemory.groupName)<0) ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                return;
            case 'firstMate':
                if ( !(spawnToSpawn.createFirstMate(creepMemory.groupName, creepMemory.boostMat)<0) ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                return;
            case 'crew':
                if ( !(spawnToSpawn.createCrew(creepMemory.groupName, creepMemory.boostMat)<0) ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                return;
            case 'healer':
                if ( !(spawnToSpawn.createHealer(creepMemory.target, creepMemory.boosted)<0) ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                return;
            case 'ultimateWorrior':
                if ( !(spawnToSpawn.createUltimateWorrior(creepMemory.target)<0) ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                return;
            case 'dismantler':
                if ( !(spawnToSpawn.createDismantler(creepMemory.target)<0) ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                return;
            case 'ultimateUpgrader':
                if ( !(spawnToSpawn.createUltimateUpgrader(false)<0) ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                return;
            case 'powerSourceLorry':
                if ( !(spawnToSpawn.createPowerSourceLorry(creepMemory.target,creepMemory.home)<0) ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                return;
            case 'powerSourceAttacker':
                if ( !(spawnToSpawn.createPowerSourceAttacker(creepMemory.target,creepMemory.name)<0) ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                return;
            case 'powerSourceHealer':
                if ( !(spawnToSpawn.createPowerSourceHealer(creepMemory.target,creepMemory.toHeal)<0) ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                return;
            case 'wanderer':
                if ( !(spawnToSpawn.createWanderer(creepMemory.target)<0) ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                return;
            case 'onlyMineralDefender':
                if (!(spawnToSpawn.createOnlyMineralDefender(creepMemory.target, creepMemory.home) < 0)) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                return;
            case 'onlyMineralMiner':
                if (!(spawnToSpawn.createOnlyMineralMiner(creepMemory.target, creepMemory.home) < 0)) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                return;
            case 'onlyMineralHauler':
                if (!(spawnToSpawn.createOnlyMineralHauler(creepMemory.target, creepMemory.home) < 0)) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                return;
            case 'redneck':
                if (!(spawnToSpawn.createRedneck(creepMemory.target) < 0)) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                return;
            case 'oneWayInterSharder':
                if (!(spawnToSpawn.createOneWayInterSharder(creepMemory.targetShardName, creepMemory.portalRoomName, creepMemory.portalId, creepMemory.targetRoomName, creepMemory.roleWillBe, creepMemory.body, creepMemory.route) < 0)) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                return;
            case 'noLegWorker':
                if (!(spawnToSpawn.createNoLegWorker(creepMemory.energy)<0) ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                return;
            default:
                if ( spawnToSpawn.createCustomCreep(creepMemory.energy, creepMemory.role, creepMemory.target) == OK ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                return
        }
        }
        return
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
        let spawnTimeThreshold = 197*noOfSpawns;
        if (spawnQueueTimer > spawnTimeThreshold) { // to clear bad spawns in queue
            room.memory.spawnQueueTimer = 0;
            console.log('bad spawn queue in room: '+room.name);
            clearSpawnQueue(room.name)
        }
        else {
            let noOfAvailableSpawns = ifSpawnAvailable(room.name).length;
            room.memory.spawnQueueTimer += noOfAvailableSpawns;
            //console.log(room.name + ' timer ', spawnQueueTimer)
            return true
        }
    }
}

global.balanceNoLegWorkerAndMover = function (r) {
    let rn = r.name;
    let currentRCL = r.controller.level;
    let spq = r.memory.forSpawning.spawningQueue;
    
    if (r.storage == undefined) {
        r.memory.forSpawning.roomCreepNo.creepEnergy.noLegWorker = r.memory.ECap;
        r.memory.forSpawning.roomCreepNo.creepEnergy.mover = r.memory.ECap;
        if (spq.length == 0) {
            if (r.memory.forSpawning.roomCreepNo.minCreeps.noLegWorker<3) {
                r.memory.forSpawning.roomCreepNo.minCreeps.noLegWorker++;
                r.memory.forSpawning.roomCreepNo.minCreeps.mover = r.memory.forSpawning.roomCreepNo.minCreeps.noLegWorker;
                r.memory.forSpawning.spawningQueue.push({ memory: { role: 'mover', ifRescue: false }, priority: 10 });
                return false
            }
        }
        
        /*r.memory.forSpawning.roomCreepNo.minCreeps.noLegWorker = 0;
        r.memory.forSpawning.roomCreepNo.minCreeps['builder'] = updateBuilderNo(rn);
        r.memory.forSpawning.roomCreepNo.creepEnergy['builder'] = r.memory.ECap;
        
        r.memory.forSpawning.roomCreepNo.minCreeps['upgrader'] = earlyRoomUpgraderBalancing(r, r.memory.ECap, r.memory.forSpawning.roomCreepNo.creepEnergy['upgrader']);
        r.memory.forSpawning.roomCreepNo.creepEnergy['upgrader'] = r.memory.ECap;
        */
    }
    else {
        r.memory.forSpawning.roomCreepNo.minCreeps.noLegWorker = 0;
        r.memory.forSpawning.roomCreepNo.minCreeps.mover = 1;
        r.memory.forSpawning.roomCreepNo.minCreeps.lorry = 2;
        r.memory.forSpawning.roomCreepNo.minCreeps.pickuper = 1;
        r.memory.forSpawning.roomCreepNo.creepEnergy.lorry = Math.min(800, r.memory.ECap);
        r.memory.forSpawning.roomCreepNo.creepEnergy.pickuper = 600;
        
        if (Game.time % 1876 == 0) {
        r.memory.forSpawning.roomCreepNo.minCreeps['builder'] = updateBuilderNo(rn);
        r.memory.forSpawning.roomCreepNo.creepEnergy['builder'] = r.memory.ECap;
        
        r.memory.forSpawning.roomCreepNo.minCreeps['upgrader'] = earlyRoomUpgraderBalancing(r, r.memory.ECap, r.memory.forSpawning.roomCreepNo.creepEnergy['upgrader']);
        r.memory.forSpawning.roomCreepNo.creepEnergy['upgrader'] = r.memory.ECap;
        
        r.memory.forSpawning.roomCreepNo.minCreeps['wallRepairer'] = updateWallRampartRepairerNo(r.name);
        r.memory.forSpawning.roomCreepNo.creepEnergy['wallRepairer'] = r.memory.ECap;
        }
        
        if (currentRCL == 8) {
            r.memory.forSpawning.roomCreepNo.minCreeps['builder'] = 0;

            r.memory.forSpawning.roomCreepNo.minCreeps['upgrader'] = 0;
        }
    }
    return true
}

global.newEarlyRemoteMing = function (r) {
    
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
