global.myRoomList = function () {
    return ['W4N51'] // ['E39S1'] //['E92N11','E91N16','E94N17', 'E97N14', 'E94N22', 'E97N13', 'E99N17', 'E93N24', 'E96N7']
    //return ['E92N11','E91N16','E94N17', 'E97N14', 'E94N22', 'E97N13', 'E99N17', 'E93N24','E96N7']
}

global.checkIfCreepInfoUpdateRequired = function (roomName) {
    let room = Game.rooms[roomName];
    if (room.memory.ECap == undefined) {
        room.memory.ECap = room.energyCapacityAvailable;
    }

    if (room.memory.ECap != room.energyCapacityAvailable) {
        console.log('change creeps spawning info.')
        initiateCreepsSpawnInfo(roomName);
    }
}

global.initiateShooterRoomMemory = function (roomName) {
    let shardName = Game.shard.name;
    if (!Memory.myShooterRoomList) {
        Memory.myShooterRoomList = {};
        Memory.myShooterRoomList[shardName] = [];
    }

    if (!Memory.myShooterRoomList[shardName].includes(roomName)) {
        Memory.myShooterRoomList[shardName].push(roomName);
    }
}

global.newInitiateBlankRoomCreepsSpawnInfo = function (roomName) {
    // initialize room memory
    let room = Game.rooms[roomName];
    updateSpawnQueueTimer(room);
    room.memory.forSpawning = {};
    room.memory.forSpawning.roomCreepNo = {};
    room.memory.forSpawning.spawningQueue = [];
    let roomMem = room.memory.forSpawning.roomCreepNo;
    roomMem.minCreeps = {};
    roomMem.creepEnergy = {}
    let ECap = room.energyCapacityAvailable;
    room.memory.ECap = ECap;

    // update Memory myRoomList
    let shardName = Game.shard.name;
    if (!Memory.myRoomList[shardName].includes(roomName)) {
        Memory.myRoomList[shardName].push(roomName);
    }

    roomMem.minCreeps['harvester'] = 0;
    roomMem.minCreeps['miner'] = 0;
    roomMem.minCreeps['lorry'] = 0;
    roomMem.minCreeps['pickuper'] = 0;
    roomMem.minCreeps['builder'] = 0;
    roomMem.minCreeps['upgrader'] = 5;
    roomMem.minCreeps['linkKeeper'] = 0;
    roomMem.minCreeps['repairer'] = 0;
    roomMem.minCreeps['wallRepairer'] = 0;
    roomMem.minCreeps['longDistanceHarvester'] = 0;
    roomMem.minCreeps['longDistanceLorry'] = 0;
    roomMem.minCreeps['longDistanceBuilder'] = 0;
    roomMem.minCreeps['reserver'] = 0;
    roomMem.minCreeps['claimer'] = 0;
    roomMem.minCreeps['attacker'] = 0;
    roomMem.minCreeps['scouter'] = 0;
    roomMem.minCreeps['teezer'] = 0;
    roomMem.minCreeps['begger'] = 0;
    roomMem.minCreeps['labber'] = 0;
    roomMem.minCreeps['superUpgrader'] = 0;
    roomMem.minCreeps['ultimateUpgrader'] = 0;
    roomMem.minCreeps['noLegWorker'] = 0;
    roomMem.minCreeps['mover'] = 1;

    roomMem.creepEnergy['harvester'] = ECap;
    roomMem.creepEnergy['miner'] = 0;
    roomMem.creepEnergy['lorry'] = 0;
    roomMem.creepEnergy['pickuper'] = 0;
    roomMem.creepEnergy['builder'] = ECap;
    roomMem.creepEnergy['upgrader'] = ECap;
    roomMem.creepEnergy['linkKeeper'] = 0;
    roomMem.creepEnergy['repairer'] = ECap;
    roomMem.creepEnergy['wallRepairer'] = 0;
    roomMem.creepEnergy['longDistanceHarvester'] = 0;
    roomMem.creepEnergy['longDistanceLorry'] = 0;
    roomMem.creepEnergy['longDistanceBuilder'] = 0;
    roomMem.creepEnergy['reserver'] = 0;
    roomMem.creepEnergy['claimer'] = 0;
    roomMem.creepEnergy['attacker'] = ECap;
    roomMem.creepEnergy['scouter'] = 0;
    roomMem.creepEnergy['teezer'] = 0;
    roomMem.creepEnergy['begger'] = 0;
    roomMem.creepEnergy['labber'] = 0;
    roomMem.creepEnergy['superUpgrader'] = 0;
    roomMem.creepEnergy['ultimateUpgrader'] = 0;
    roomMem.creepEnergy['noLegWorker'] = ECap;
    roomMem.creepEnergy['mover'] = 100;
}

global.initiateBlankRoomCreepsSpawnInfo = function (roomName) {
    // initialize room memory
    let room = Game.rooms[roomName];
    updateSpawnQueueTimer(room);
    room.memory.forSpawning.roomCreepNo = {};
    room.memory.forSpawning.spawningQueue = [];
    let roomMem = room.memory.forSpawning.roomCreepNo;
    roomMem.minCreeps = {};
    roomMem.creepEnergy = {}
    let ECap = room.energyCapacityAvailable;
    room.memory.ECap = ECap;

    // update Memory myRoomList
    let shardName = Game.shard.name;
    if (!Memory.myRoomList[shardName].includes(roomName)) {
        Memory.myRoomList[shardName].push(roomName);
    }

    roomMem.minCreeps['harvester'] = 1;
    roomMem.minCreeps['miner'] = 0;
    roomMem.minCreeps['lorry'] = 0;
    roomMem.minCreeps['pickuper'] = 0;
    roomMem.minCreeps['builder'] = 0;
    roomMem.minCreeps['upgrader'] = 6;
    roomMem.minCreeps['linkKeeper'] = 0;
    roomMem.minCreeps['repairer'] = 1;
    roomMem.minCreeps['wallRepairer'] = 0;
    roomMem.minCreeps['longDistanceHarvester'] = 0;
    roomMem.minCreeps['longDistanceLorry'] = 0;
    roomMem.minCreeps['longDistanceBuilder'] = 0;
    roomMem.minCreeps['reserver'] = 0;
    roomMem.minCreeps['claimer'] = 0;
    roomMem.minCreeps['attacker'] = 0;
    roomMem.minCreeps['scouter'] = 0;
    roomMem.minCreeps['teezer'] = 0;
    roomMem.minCreeps['begger'] = 0;
    roomMem.minCreeps['labber'] = 0;
    roomMem.minCreeps['superUpgrader'] = 0;
    roomMem.minCreeps['ultimateUpgrader'] = 0;

    roomMem.creepEnergy['harvester'] = ECap;
    roomMem.creepEnergy['miner'] = 0;
    roomMem.creepEnergy['lorry'] = 0;
    roomMem.creepEnergy['pickuper'] = 0;
    roomMem.creepEnergy['builder'] = ECap;
    roomMem.creepEnergy['upgrader'] = ECap;
    roomMem.creepEnergy['linkKeeper'] = 0;
    roomMem.creepEnergy['repairer'] = ECap;
    roomMem.creepEnergy['wallRepairer'] = 0;
    roomMem.creepEnergy['longDistanceHarvester'] = 0;
    roomMem.creepEnergy['longDistanceLorry'] = 0;
    roomMem.creepEnergy['longDistanceBuilder'] = 0;
    roomMem.creepEnergy['reserver'] = 0;
    roomMem.creepEnergy['claimer'] = 0;
    roomMem.creepEnergy['attacker'] = 0;
    roomMem.creepEnergy['scouter'] = 0;
    roomMem.creepEnergy['teezer'] = 0;
    roomMem.creepEnergy['begger'] = 0;
    roomMem.creepEnergy['labber'] = 0;
    roomMem.creepEnergy['superUpgrader'] = 0;
    roomMem.creepEnergy['ultimateUpgrader'] = 0;
}

global.initiateCreepsSpawnInfo = function (roomName) {
    let room = Game.rooms[roomName];
    let roomMem = room.memory.forSpawning.roomCreepNo
    let ECap = room.energyCapacityAvailable;
    room.memory.ECap = ECap;
    let lvl = room.controller.level;

    if (room.memory.startMB) { // for shooter room
        roomMem.minCreeps['harvester'] = 0;
        roomMem.minCreeps['miner'] = 0;
        roomMem.minCreeps['lorry'] = 1;
        roomMem.minCreeps['pickuper'] = 1;
        roomMem.minCreeps['builder'] = 0;
        roomMem.minCreeps['upgrader'] = 0;
        roomMem.minCreeps['linkKeeper'] = 0;
        roomMem.minCreeps['repairer'] = 0;
        roomMem.minCreeps['wallRepairer'] = 0;
        roomMem.minCreeps['longDistanceHarvester'] = 0;
        roomMem.minCreeps['longDistanceLorry'] = 0;
        roomMem.minCreeps['longDistanceBuilder'] = 0;
        roomMem.minCreeps['reserver'] = 0;
        roomMem.minCreeps['claimer'] = 0;
        roomMem.minCreeps['attacker'] = 0;
        roomMem.minCreeps['scouter'] = 0;
        roomMem.minCreeps['teezer'] = 0;
        roomMem.minCreeps['begger'] = 0;
        roomMem.minCreeps['labber'] = 0;
        roomMem.minCreeps['superUpgrader'] = 0;
        roomMem.minCreeps['ultimateUpgrader'] = 0;

        roomMem.creepEnergy['harvester'] = ECap;
        roomMem.creepEnergy['miner'] = 0;
        roomMem.creepEnergy['lorry'] = Math.min(ECap, 800);
        roomMem.creepEnergy['pickuper'] = Math.min(ECap, 800);
        roomMem.creepEnergy['builder'] = ECap;
        roomMem.creepEnergy['upgrader'] = ECap;
        roomMem.creepEnergy['linkKeeper'] = 0;
        roomMem.creepEnergy['repairer'] = 0;
        roomMem.creepEnergy['wallRepairer'] = 0;
        roomMem.creepEnergy['longDistanceHarvester'] = 0;
        roomMem.creepEnergy['longDistanceLorry'] = 0;
        roomMem.creepEnergy['longDistanceBuilder'] = 0;
        roomMem.creepEnergy['reserver'] = 0;
        roomMem.creepEnergy['claimer'] = 0;
        roomMem.creepEnergy['attacker'] = 0;
        roomMem.creepEnergy['scouter'] = 0;
        roomMem.creepEnergy['teezer'] = 0;
        roomMem.creepEnergy['begger'] = 0;
        roomMem.creepEnergy['labber'] = 0;
        roomMem.creepEnergy['superUpgrader'] = 0;
        roomMem.creepEnergy['ultimateUpgrader'] = 0;

        if (lvl > 4) {
            roomMem.minCreeps['linkKeeper'] = 1;
            roomMem.creepEnergy['linkKeeper'] = 200;
        }
    }
    else {
        room.memory.mineralThresholds.terminalThreshold['energy'] = 20000;
        room.memory.mineralThresholds.storageThreshold['energy'] = 1000000;
        //room.memory.mineralThresholds.marketThreshold['energy'] = 1000000;

        //room.memory.mineralThresholds.terminalThreshold['XGH2O'] = 20000;
        //room.memory.mineralThresholds.storageThreshold['XGH2O'] = 300000;
        //room.memory.mineralThresholds.marketThreshold['XGH2O'] = 1000000;

        if (lvl == 1 || ECap < 550) {
            roomMem.minCreeps['harvester'] = 3;
            roomMem.minCreeps['miner'] = 0;
            roomMem.minCreeps['lorry'] = 0;
            roomMem.minCreeps['pickuper'] = 0;
            roomMem.minCreeps['builder'] = 1;
            roomMem.minCreeps['upgrader'] = 2;
            roomMem.minCreeps['linkKeeper'] = 0;
            roomMem.minCreeps['repairer'] = 0;
            roomMem.minCreeps['wallRepairer'] = 0;
            roomMem.minCreeps['longDistanceHarvester'] = 0;
            roomMem.minCreeps['longDistanceLorry'] = 0;
            roomMem.minCreeps['longDistanceBuilder'] = 0;
            roomMem.minCreeps['reserver'] = 0;
            roomMem.minCreeps['claimer'] = 0;
            roomMem.minCreeps['attacker'] = 0;
            roomMem.minCreeps['scouter'] = 0;
            roomMem.minCreeps['teezer'] = 0;
            roomMem.minCreeps['begger'] = 0;
            roomMem.minCreeps['labber'] = 0;
            roomMem.minCreeps['superUpgrader'] = 0;
            roomMem.minCreeps['ultimateUpgrader'] = 0;

            roomMem.creepEnergy['harvester'] = ECap;
            roomMem.creepEnergy['miner'] = 0;
            roomMem.creepEnergy['lorry'] = 0;
            roomMem.creepEnergy['pickuper'] = 0;
            roomMem.creepEnergy['builder'] = ECap;
            roomMem.creepEnergy['upgrader'] = ECap;
            roomMem.creepEnergy['linkKeeper'] = 0;
            roomMem.creepEnergy['repairer'] = 0;
            roomMem.creepEnergy['wallRepairer'] = 0;
            roomMem.creepEnergy['longDistanceHarvester'] = 0;
            roomMem.creepEnergy['longDistanceLorry'] = 0;
            roomMem.creepEnergy['longDistanceBuilder'] = 0;
            roomMem.creepEnergy['reserver'] = 0;
            roomMem.creepEnergy['claimer'] = 0;
            roomMem.creepEnergy['attacker'] = 0;
            roomMem.creepEnergy['scouter'] = 0;
            roomMem.creepEnergy['teezer'] = 0;
            roomMem.creepEnergy['begger'] = 0;
            roomMem.creepEnergy['labber'] = 0;
            roomMem.creepEnergy['superUpgrader'] = 0;
            roomMem.creepEnergy['ultimateUpgrader'] = 0;
        }
        else if (lvl == 2) {
            roomMem.minCreeps['harvester'] = 3;
            roomMem.minCreeps['miner'] = 0;
            roomMem.minCreeps['lorry'] = 0;
            roomMem.minCreeps['pickuper'] = 1;
            roomMem.minCreeps['builder'] = 1;
            roomMem.minCreeps['upgrader'] = 4;
            roomMem.minCreeps['linkKeeper'] = 0;
            roomMem.minCreeps['repairer'] = 0;
            roomMem.minCreeps['wallRepairer'] = 0;
            roomMem.minCreeps['longDistanceHarvester'] = 0;
            roomMem.minCreeps['longDistanceLorry'] = 0;
            roomMem.minCreeps['longDistanceBuilder'] = 0;
            roomMem.minCreeps['reserver'] = 0;
            roomMem.minCreeps['claimer'] = 0;
            roomMem.minCreeps['attacker'] = 0;
            roomMem.minCreeps['scouter'] = 0;
            roomMem.minCreeps['teezer'] = 0;
            roomMem.minCreeps['begger'] = 0;
            roomMem.minCreeps['labber'] = 0;
            roomMem.minCreeps['superUpgrader'] = 0;
            roomMem.minCreeps['ultimateUpgrader'] = 0;

            roomMem.creepEnergy['harvester'] = ECap;
            roomMem.creepEnergy['miner'] = 0;
            roomMem.creepEnergy['lorry'] = 0;
            roomMem.creepEnergy['pickuper'] = ECap;
            roomMem.creepEnergy['builder'] = ECap;
            roomMem.creepEnergy['upgrader'] = ECap;
            roomMem.creepEnergy['linkKeeper'] = 0;
            roomMem.creepEnergy['repairer'] = 200;
            roomMem.creepEnergy['wallRepairer'] = 0;
            roomMem.creepEnergy['longDistanceHarvester'] = 0;
            roomMem.creepEnergy['longDistanceLorry'] = 0;
            roomMem.creepEnergy['longDistanceBuilder'] = 0;
            roomMem.creepEnergy['reserver'] = 0;
            roomMem.creepEnergy['claimer'] = 0;
            roomMem.creepEnergy['attacker'] = 0;
            roomMem.creepEnergy['scouter'] = 0;
            roomMem.creepEnergy['teezer'] = 0;
            roomMem.creepEnergy['begger'] = 0;
            roomMem.creepEnergy['labber'] = 0;
            roomMem.creepEnergy['superUpgrader'] = 0;
            roomMem.creepEnergy['ultimateUpgrader'] = 0;
        }
        else if (lvl == 3) {
            roomMem.minCreeps['harvester'] = 0;
            roomMem.minCreeps['miner'] = 0;
            roomMem.minCreeps['lorry'] = 0;
            roomMem.minCreeps['pickuper'] = 1;
            roomMem.minCreeps['builder'] = 1;
            roomMem.minCreeps['upgrader'] = 4;
            roomMem.minCreeps['linkKeeper'] = 0;
            roomMem.minCreeps['repairer'] = 0;
            roomMem.minCreeps['wallRepairer'] = 0;
            roomMem.minCreeps['longDistanceHarvester'] = 0;
            roomMem.minCreeps['longDistanceLorry'] = 0;
            roomMem.minCreeps['longDistanceBuilder'] = 0;
            roomMem.minCreeps['reserver'] = 0;
            roomMem.minCreeps['claimer'] = 0;
            roomMem.minCreeps['attacker'] = 0;
            roomMem.minCreeps['scouter'] = 0;
            roomMem.minCreeps['teezer'] = 0;
            roomMem.minCreeps['begger'] = 0;
            roomMem.minCreeps['labber'] = 0;
            roomMem.minCreeps['superUpgrader'] = 0;
            roomMem.minCreeps['ultimateUpgrader'] = 0;

            roomMem.creepEnergy['harvester'] = ECap;
            roomMem.creepEnergy['miner'] = 0;
            roomMem.creepEnergy['lorry'] = 0;
            roomMem.creepEnergy['pickuper'] = ECap;
            roomMem.creepEnergy['builder'] = ECap;
            roomMem.creepEnergy['upgrader'] = ECap;
            roomMem.creepEnergy['linkKeeper'] = 0;
            roomMem.creepEnergy['repairer'] = 200;
            roomMem.creepEnergy['wallRepairer'] = 0;
            roomMem.creepEnergy['longDistanceHarvester'] = 0;
            roomMem.creepEnergy['longDistanceLorry'] = 0;
            roomMem.creepEnergy['longDistanceBuilder'] = 0;
            roomMem.creepEnergy['reserver'] = 0;
            roomMem.creepEnergy['claimer'] = 0;
            roomMem.creepEnergy['attacker'] = 0;
            roomMem.creepEnergy['scouter'] = 0;
            roomMem.creepEnergy['teezer'] = 0;
            roomMem.creepEnergy['begger'] = 0;
            roomMem.creepEnergy['labber'] = 0;
            roomMem.creepEnergy['superUpgrader'] = 0;
            roomMem.creepEnergy['ultimateUpgrader'] = 0;
        }
        else if (lvl == 4) {
            roomMem.minCreeps['harvester'] = 0;
            roomMem.minCreeps['miner'] = 0;
            roomMem.minCreeps['lorry'] = 0;
            roomMem.minCreeps['pickuper'] = 2;
            roomMem.minCreeps['builder'] = updateBuilderNo(roomName);
            roomMem.minCreeps['upgrader'] = 4;
            roomMem.minCreeps['linkKeeper'] = 0;
            roomMem.minCreeps['repairer'] = 0;
            roomMem.minCreeps['wallRepairer'] = 0;
            roomMem.minCreeps['longDistanceHarvester'] = 0;
            roomMem.minCreeps['longDistanceLorry'] = 0;
            roomMem.minCreeps['longDistanceBuilder'] = 0;
            roomMem.minCreeps['reserver'] = 0;
            roomMem.minCreeps['claimer'] = 0;
            roomMem.minCreeps['attacker'] = 0;
            roomMem.minCreeps['scouter'] = 0;
            roomMem.minCreeps['teezer'] = 0;
            roomMem.minCreeps['begger'] = 0;
            roomMem.minCreeps['labber'] = 0;
            roomMem.minCreeps['superUpgrader'] = 0;
            roomMem.minCreeps['ultimateUpgrader'] = 0;

            roomMem.creepEnergy['harvester'] = ECap;
            roomMem.creepEnergy['miner'] = 0;
            roomMem.creepEnergy['lorry'] = 0;
            roomMem.creepEnergy['pickuper'] = ECap;
            roomMem.creepEnergy['builder'] = ECap;
            roomMem.creepEnergy['upgrader'] = ECap;
            roomMem.creepEnergy['linkKeeper'] = 0;
            roomMem.creepEnergy['repairer'] = 200;
            roomMem.creepEnergy['wallRepairer'] = ECap;
            roomMem.creepEnergy['longDistanceHarvester'] = 0;
            roomMem.creepEnergy['longDistanceLorry'] = 0;
            roomMem.creepEnergy['longDistanceBuilder'] = 0;
            roomMem.creepEnergy['reserver'] = 0;
            roomMem.creepEnergy['claimer'] = 0;
            roomMem.creepEnergy['attacker'] = 0;
            roomMem.creepEnergy['scouter'] = 0;
            roomMem.creepEnergy['teezer'] = 0;
            roomMem.creepEnergy['begger'] = 0;
            roomMem.creepEnergy['labber'] = 0;
            roomMem.creepEnergy['superUpgrader'] = 0;
            roomMem.creepEnergy['ultimateUpgrader'] = 0;
        }
        else if (lvl >= 5) {
            roomMem.minCreeps['harvester'] = 0;
            roomMem.minCreeps['miner'] = 0;
            roomMem.minCreeps['lorry'] = 1;
            roomMem.minCreeps['pickuper'] = 1;
            roomMem.minCreeps['builder'] = updateBuilderNo(roomName);
            roomMem.minCreeps['upgrader'] = 0;
            roomMem.minCreeps['linkKeeper'] = 0;
            roomMem.minCreeps['repairer'] = 0;
            roomMem.minCreeps['wallRepairer'] = updateWallRampartRepairerNo(roomName);
            roomMem.minCreeps['longDistanceHarvester'] = 0;
            roomMem.minCreeps['longDistanceLorry'] = 0;
            roomMem.minCreeps['longDistanceBuilder'] = 0;
            roomMem.minCreeps['reserver'] = 0;
            roomMem.minCreeps['claimer'] = 0;
            roomMem.minCreeps['attacker'] = 0;
            roomMem.minCreeps['scouter'] = 0;
            roomMem.minCreeps['teezer'] = 0;
            roomMem.minCreeps['begger'] = 0;
            roomMem.minCreeps['labber'] = 0;
            roomMem.minCreeps['superUpgrader'] = 0;
            roomMem.minCreeps['ultimateUpgrader'] = 0;

            roomMem.creepEnergy['harvester'] = ECap;
            roomMem.creepEnergy['miner'] = 0;
            roomMem.creepEnergy['lorry'] = 0;
            roomMem.creepEnergy['pickuper'] = ECap;
            roomMem.creepEnergy['builder'] = ECap;
            roomMem.creepEnergy['upgrader'] = ECap;
            roomMem.creepEnergy['linkKeeper'] = 0;
            roomMem.creepEnergy['repairer'] = 200;
            roomMem.creepEnergy['wallRepairer'] = ECap;
            roomMem.creepEnergy['longDistanceHarvester'] = 0;
            roomMem.creepEnergy['longDistanceLorry'] = 0;
            roomMem.creepEnergy['longDistanceBuilder'] = 0;
            roomMem.creepEnergy['reserver'] = 0;
            roomMem.creepEnergy['claimer'] = 0;
            roomMem.creepEnergy['attacker'] = 0;
            roomMem.creepEnergy['scouter'] = 0;
            roomMem.creepEnergy['teezer'] = 0;
            roomMem.creepEnergy['begger'] = 0;
            roomMem.creepEnergy['labber'] = 0;
            roomMem.creepEnergy['superUpgrader'] = 0;
            roomMem.creepEnergy['ultimateUpgrader'] = 0;
        }
        else if (lvl >= 7) {
            roomMem.creepEnergy['lorry'] = 800 / 5 * 8;
            roomMem.creepEnergy['pickuper'] = 800 / 5 * 8;
            roomMem.creepEnergy['linkKeeper'] = 800 / 5 * 8;
            roomMem.minCreeps['builder'] = updateBuilderNo(roomName);
            roomMem.minCreeps['wallRepairer'] = updateWallRampartRepairerNo(roomName);
            roomMem.creepEnergy['upgrader'] = Math.min(ECap, 2000);

            if (room.memory.startMB) { // for shooter room
            }
            else { // for normal room
                roomMem.minCreeps['labber'] = 1;
                roomMem.creepEnergy['labber'] = 800 / 5 * 8;

                roomMem.minCreeps['scientist'] = 1;
                roomMem.creepEnergy['scientist'] = 800 / 5 * 8;
            }

            if (lvl == 8) {
                room.memory.mineralThresholds.terminalThreshold['energy'] = 20000;
                room.memory.mineralThresholds.storageThreshold['energy'] = 300000;
                //room.memory.mineralThresholds.marketThreshold['energy'] = 1000000;
                roomMem.minCreeps['builder'] = updateBuilderNo(roomName);

                room.memory.mineralThresholds.terminalThreshold['XGH2O'] = 3000;
                room.memory.mineralThresholds.storageThreshold['XGH2O'] = 6000;
                //room.memory.mineralThresholds.marketThreshold['XGH2O'] = 1000000;
            }
        }

        /*else if (lvl == 4) {
            roomMem.minCreeps['harvester'] = 0;
            roomMem.minCreeps['miner'] = 0;
            roomMem.minCreeps['lorry'] = 0;
            roomMem.minCreeps['pickuper'] = 1;
            roomMem.minCreeps['builder'] = 2;
            roomMem.minCreeps['upgrader'] = 9;
            roomMem.minCreeps['linkKeeper'] = 0;
            roomMem.minCreeps['repairer'] = 1;
            roomMem.minCreeps['wallRepairer'] = 0;
            roomMem.minCreeps['longDistanceHarvester'] = 0;
            roomMem.minCreeps['longDistanceLorry'] = 0;
            roomMem.minCreeps['longDistanceBuilder'] = 0;
            roomMem.minCreeps['reserver'] = 0;
            roomMem.minCreeps['claimer'] = 0;
            roomMem.minCreeps['attacker'] = 0;
            roomMem.minCreeps['scouter'] = 0;
            roomMem.minCreeps['teezer'] = 0;
            roomMem.minCreeps['begger'] = 0;
            roomMem.minCreeps['labber'] = 0;
            roomMem.minCreeps['superUpgrader'] = 0;
            roomMem.minCreeps['ultimateUpgrader'] = 0;

            roomMem.creepEnergy['harvester'] = ECap * .8;
            roomMem.creepEnergy['miner'] = 0;
            roomMem.creepEnergy['lorry'] = 800;
            roomMem.creepEnergy['pickuper'] = 800;
            roomMem.creepEnergy['builder'] = ECap * .8;
            roomMem.creepEnergy['upgrader'] = ECap * .8;
            roomMem.creepEnergy['linkKeeper'] = 0;
            roomMem.creepEnergy['repairer'] = 200;
            roomMem.creepEnergy['wallRepairer'] = 0;
            roomMem.creepEnergy['longDistanceHarvester'] = 0;
            roomMem.creepEnergy['longDistanceLorry'] = 0;
            roomMem.creepEnergy['longDistanceBuilder'] = 0;
            roomMem.creepEnergy['reserver'] = 0;
            roomMem.creepEnergy['claimer'] = 0;
            roomMem.creepEnergy['attacker'] = 0;
            roomMem.creepEnergy['scouter'] = 0;
            roomMem.creepEnergy['teezer'] = 0;
            roomMem.creepEnergy['begger'] = 0;
            roomMem.creepEnergy['labber'] = 0;
            roomMem.creepEnergy['superUpgrader'] = 0;
            roomMem.creepEnergy['ultimateUpgrader'] = 0;
        }
        else if (lvl == 5) {
            if (room.memory.forLinks != undefined) {
                roomMem.minCreeps['harvester'] = 0;
                roomMem.minCreeps['miner'] = 0;
                roomMem.minCreeps['lorry'] = 1;
                roomMem.minCreeps['pickuper'] = 1;
                roomMem.minCreeps['builder'] = 0;
                roomMem.minCreeps['upgrader'] = 1;
                roomMem.minCreeps['linkKeeper'] = 1;
                roomMem.minCreeps['repairer'] = 0;
                roomMem.minCreeps['wallRepairer'] = 0;
                roomMem.minCreeps['labber'] = 0;
                roomMem.minCreeps['superUpgrader'] = 0;
                roomMem.minCreeps['ultimateUpgrader'] = 0;

                roomMem.creepEnergy['harvester'] = ECap * .8;
                roomMem.creepEnergy['miner'] = 0;
                roomMem.creepEnergy['lorry'] = 800;
                roomMem.creepEnergy['pickuper'] = 800;
                roomMem.creepEnergy['builder'] = ECap * .8;
                roomMem.creepEnergy['upgrader'] = ECap * .8;
                roomMem.creepEnergy['linkKeeper'] = 800;
                roomMem.creepEnergy['wallRepairer'] = 0;
                roomMem.creepEnergy['labber'] = 0;
                roomMem.creepEnergy['superUpgrader'] = 0;
                roomMem.creepEnergy['ultimateUpgrader'] = 0;
            }
            else {
                roomMem.minCreeps['harvester'] = 0;
                roomMem.minCreeps['miner'] = 0;
                roomMem.minCreeps['lorry'] = 0;
                roomMem.minCreeps['pickuper'] = 1;
                roomMem.minCreeps['builder'] = 2;
                roomMem.minCreeps['upgrader'] = 7;
                roomMem.minCreeps['linkKeeper'] = 0;
                roomMem.minCreeps['repairer'] = 0;
                roomMem.minCreeps['wallRepairer'] = 0;
                roomMem.minCreeps['labber'] = 0;
                roomMem.minCreeps['superUpgrader'] = 0;
                roomMem.minCreeps['ultimateUpgrader'] = 0;

                roomMem.creepEnergy['harvester'] = ECap * .8;
                roomMem.creepEnergy['miner'] = 0;
                roomMem.creepEnergy['lorry'] = 800;
                roomMem.creepEnergy['pickuper'] = 800;
                roomMem.creepEnergy['builder'] = ECap * .8;
                roomMem.creepEnergy['upgrader'] = ECap * .8;
                roomMem.creepEnergy['linkKeeper'] = 0;
                roomMem.creepEnergy['wallRepairer'] = 0;
                roomMem.creepEnergy['labber'] = 0;
                roomMem.creepEnergy['superUpgrader'] = 0;
                roomMem.creepEnergy['ultimateUpgrader'] = 0;

            }
        }*/
    }
}

global.updateWallRampartRepairerNo = function (rn) {
    let r = Game.rooms[rn];
    if (r.storage) { var eSitu = r.storage.store.energy };
    if (r.terminal) { eSitu += r.terminal.store.energy }

    let en = r.find(FIND_CONSTRUCTION_SITES, {
        filter: object => ((object.structureType == STRUCTURE_WALL) || (object.structureType == STRUCTURE_RAMPART))
    });

    if ((eSitu > 240000) && (r.memory.toRepairWallOrRampartId == undefined || Game.getObjectById(r.memory.toRepairWallOrRampartId).hits < 680000) || (r.controller.level == 8 && en.length > 0)) {
        let em = r.find(FIND_STRUCTURES, {
            filter: object => ((object.structureType == STRUCTURE_WALL) || (object.structureType == STRUCTURE_RAMPART))
        });

        let tot = em.concat(en).length;

        if (tot > 0) {
            return 1
        }
    }
    else if (eSitu > 15000 && r.controller.level == 4) {
        return 1
    }
    else if (eSitu > 100000) {
        return 0
    }
}

global.updateBuilderNo = function (rn) {
    let r = Game.rooms[rn];
    let tot = r.find(FIND_CONSTRUCTION_SITES, { filter: o => !(o.structureType == STRUCTURE_WALL || o.structureType == STRUCTURE_RAMPART) });

    if (tot.length > 0) {
        return 1
    }
    else {
        return 0
    }
    return 0
}


global.decomposeRoomNameIntoFourParts = function (roomName) {
    return roomName.match(/[a-zA-Z]+|[0-9]+/g)
}

global.calculateNeighbourNames = function (roomName) {
    var neighbours = [];
    var index = [-1, 0, 1];
    var roomNameSeparated = roomName.match(/[a-zA-Z]+|[0-9]+/g);
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            neighbours.push(roomNameSeparated[0] +
                '' + (parseInt(roomNameSeparated[1]) + index[i]) +
                roomNameSeparated[2] +
                '' + (parseInt(roomNameSeparated[3]) + index[j])
            );
        }
    }
    return neighbours
}

global.ifSurrounded = function (creep) {
    var index = [-1, 0, 1]
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            // if terrain is plain or swamp and it is not occupied by other creeps
            x = creep.pos.x + index[i];
            y = creep.pos.y + index[j];
            //console.log(x,y)
            if (((creep.room.lookForAt(LOOK_TERRAIN, x, y) == 'plain') || (creep.room.lookForAt(LOOK_TERRAIN, x, y) == 'swamp'))
                && (creep.room.lookForAt(LOOK_CREEPS, x, y)[0] == undefined)) {
                return [x, y]
            }
        }
    }
    return null
}

global.overlappedTiles = function (creep, pos1, pos2) {
    let pos1_neibs = [];
    let pos2_neibs = [];
    var index = [-1, 0, 1]
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            //if ( (i != 1)&&(j != 1 ) ) { // not including the centre tile itself
            // if terrain is plain or swamp and it is not occupied by other creeps
            let x1 = pos1.x + index[i];
            let y1 = pos1.y + index[j];
            let x2 = pos2.x + index[i];
            let y2 = pos2.y + index[j];
            //if ((creep.room.lookForAt(LOOK_TERRAIN,x1,y1)=='plain')||(creep.room.lookForAt(LOOK_TERRAIN,x1,y1)=='swamp')) {
            /*if (creep.name=='Luke') {
                console.log(x1,y1)
                console.log(creep.room.lookForAt(LOOK_STRUCTURES,x1,y1).length==0||creep.room.lookForAt(LOOK_STRUCTURES,x1,y1)[0].structureType==STRUCTURE_CONTAINER)
            }*/
            if (((creep.room.lookForAt(LOOK_TERRAIN, x1, y1) == 'plain') || (creep.room.lookForAt(LOOK_TERRAIN, x1, y1) == 'swamp')) && (creep.room.lookForAt(LOOK_STRUCTURES, x1, y1).length == 0 || creep.room.lookForAt(LOOK_STRUCTURES, x1, y1)[0].structureType == STRUCTURE_CONTAINER)) {
                pos1_neibs.push({ x: x1, y: y1 });
            }
            if ((creep.room.lookForAt(LOOK_TERRAIN, x2, y2) == 'plain') || (creep.room.lookForAt(LOOK_TERRAIN, x2, y2) == 'swamp')) {
                pos2_neibs.push({ x: x2, y: y2 });
            }
            //}
        }
    }
    //console.log(pos1_neibs)
    for (let xy1 of pos1_neibs) {
        x1 = xy1.x;
        y1 = xy1.y;
        for (let xy2 of pos2_neibs) {
            x2 = xy2.x;
            y2 = xy2.y;
            if (x1 == x2 && y1 == y2) {
                //console.log(x1,y1);
                return xy1
            }
        }
    }

}

global.tilesSurrounded = function (obj) {
    let index = [-1, 0, 1];
    let tilesSurrounded = 0;

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            // if terrain is plain or swamp
            x = obj.pos.x + index[i];
            y = obj.pos.y + index[j];
            //console.log(x,y)
            if (((obj.room.lookForAt(LOOK_TERRAIN, x, y) == 'plain') || (obj.room.lookForAt(LOOK_TERRAIN, x, y) == 'swamp'))) {
                tilesSurrounded += 1;
            }
        }
    }
    return tilesSurrounded
}

global.validSurrounds = function (obj) {
    var index = [-1, 0, 1]
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            // if terrain is plain or swamp
            x = obj.pos.x + index[i];
            y = obj.pos.y + index[j];
            //console.log(x,y)
            if (((obj.room.lookForAt(LOOK_TERRAIN, x, y) == 'plain') || (obj.room.lookForAt(LOOK_TERRAIN, x, y) == 'swamp'))) {
                return [x, y]
            }
        }
    }
    return null
}

global.determineIfFucked = function (myRoom) {
    var targets = myRoom.find(FIND_HOSTILE_CREEPS, { filter: s => (!allyList().includes(s.owner.username)) });
    //var mines = myRoom.find(FIND_MY_CREEPS);
    var enemyPartsCount = 0;
    var myPartsCount = 0;
    var enemyAttkPartsCount = 0;
    for (let target of targets) {
        enemyPartsCount += target.getActiveBodyparts(ATTACK) + 2 * target.getActiveBodyparts(RANGED_ATTACK) + 3 * target.getActiveBodyparts(HEAL) + 30 * target.getActiveBodyparts(WORK);
        enemyAttkPartsCount += target.getActiveBodyparts(ATTACK) + 2 * target.getActiveBodyparts(RANGED_ATTACK);
    }
    for (let name in Game.creeps) {
        var mine = Game.creeps[name];
        if (mine.memory.target == myRoom.name) { // if my solder is going to the room under attack
            myPartsCount += mine.getActiveBodyparts(ATTACK) + 2 * mine.getActiveBodyparts(RANGED_ATTACK) + 3 * mine.getActiveBodyparts(HEAL);
        }
    }
    /*for (let mine of mines) {
        partsCount -= mine.getActiveBodyparts(ATTACK) + 2*mine.getActiveBodyparts(RANGED_ATTACK) + 3*mine.getActiveBodyparts(HEAL);
    }*/
    if (enemyAttkPartsCount == 0) {
        return [0, 0]
    }
    else {
        return [enemyPartsCount - myPartsCount, enemyPartsCount]
    }
}

global.determineIfRoomInvaded = function (myRoom) {
    let invadersNumber = myRoom.find(FIND_HOSTILE_CREEPS, { filter: s => s.owner.username == 'Invader' }).length;
    invadersNumber = invadersNumber + myRoom.find(FIND_HOSTILE_CREEPS, { filter: s => s.owner.username == 'wtfrank' && s.getActiveBodyparts(HEAL) > 0 }).length;

    return invadersNumber
}

global.determineIfFuckedRemote = function (myRoom, creepsInHomeAndRemoteRoom) {
    var targets = myRoom.find(FIND_HOSTILE_CREEPS, { filter: s => (!allyList().includes(s.owner.username)) });
    //var mines = myRoom.find(FIND_MY_CREEPS);
    var enemyPartsCount = 0;
    let enermyCount = 0;
    var myPartsCount = 0;
    for (let target of targets) {
        enemyPartsCount += target.getActiveBodyparts(ATTACK) + 2 * target.getActiveBodyparts(RANGED_ATTACK) + 3 * target.getActiveBodyparts(HEAL);
        enermyCount += 1;
    }
    for (let myCreep of creepsInHomeAndRemoteRoom) {
        if (myCreep.memory.target == myRoom.name) { // if my solder is going to the room under attack
            if (myCreep.name == undefined) { // imaginary creep in spawning queue
                if (myCreep.memory.role == 'ranger') { // if it's ranger than 3 range parts
                    myPartsCount += (2 * 3 + 1) * 6; // 3 melee, 1 ranged, and the power is 6 times
                }
            }
            else {
                myPartsCount += myCreep.getActiveBodyparts(ATTACK) + 2 * myCreep.getActiveBodyparts(RANGED_ATTACK) + 3 * myCreep.getActiveBodyparts(HEAL);
            }
        }
    }
    /*for (let mine of mines) {
        partsCount -= mine.getActiveBodyparts(ATTACK) + 2*mine.getActiveBodyparts(RANGED_ATTACK) + 3*mine.getActiveBodyparts(HEAL);
    }*/
    return [enemyPartsCount - myPartsCount, enemyPartsCount, enermyCount]
}

global.mineralNeedsCollect = function (myRoom) {
    var mineral = myRoom.find(FIND_MINERALS)[0]
    var mineralType = mineral.mineralType;
    var mineralContainer = mineral.pos.findInRange(FIND_STRUCTURES, 1, { filter: s => ((s.structureType == STRUCTURE_CONTAINER) && (s.pos.findInRange(FIND_HOSTILE_CREEPS, 3).length == 0)) });
    if (mineralContainer.length > 0) { // if there is a mineral mine (becaue there is container)
        //console.log(mineralType,mineralContainer.store);
        //console.log(JSON.stringify(mineralContainer ))
        mineralContainer = mineralContainer[0]
        var mineralStored = mineralContainer.store[mineralType];
        let energyStored = mineralContainer.store.energy;
        return [mineralStored, mineralType, energyStored];
    }
    else { // there is no mineral mine RCL<6
        return undefined;
    }
}
global.bornToBeWrong = function () {
    try {
        asd + ok;
    }
    catch (err) {
        console.log('error: role name fault');
    }
}

global.linkTransfer = function (room) {
    if (room.memory.forLinks && Object.keys(room.memory.forLinks).length > 0) {
        if (room.memory.forLinks.receiverLinkId == undefined) {
            let linksInRoom = [];
            if (room.memory.forLinks.linksIdsInRoom) {
                for (let linkIdInRoom of room.memory.forLinks.linksIdsInRoom) {
                    linksInRoom.push(Game.getObjectById(linkIdInRoom));
                }
            }
            if (room.memory.forLinks.receiverCoreLinkId && Game.getObjectById(room.memory.forLinks.receiverCoreLinkId).energy < 700) {
                linkTransferToCentre(Game.getObjectById(room.memory.forLinks.receiverCoreLinkId), linksInRoom);
            }
            else if (room.memory.forLinks.receiverUpLinkId && Game.getObjectById(room.memory.forLinks.receiverUpLinkId).energy < 700) {
                linkTransferToCentre(Game.getObjectById(room.memory.forLinks.receiverUpLinkId), linksInRoom);
            }
        }
        else {
            let roomName = room.name
            let receiverLink = Game.getObjectById(room.memory.forLinks.receiverLinkId);

            let receiverUpLinkId = '?';
            let receiverUpLink;
            if (room.memory.forLinks.receiverUpLinkId) {
                receiverUpLinkId = room.memory.forLinks.receiverUpLinkId;
                receiverUpLink = Game.getObjectById(receiverUpLinkId);

            }

            let receiverCorepLinkId = '?';
            let receiverCoreLink;
            if (room.memory.forLinks.receiverCoreLinkId) {
                receiverCoreLinkId = room.memory.forLinks.receiverCoreLinkId;
                receiverCoreLink = Game.getObjectById(receiverCoreLinkId);

            }

            let usedLink;
            let linksInRoom = [];
            if (room.memory.forLinks.linksIdsInRoom) {
                for (let linkIdInRoom of room.memory.forLinks.linksIdsInRoom) {
                    linksInRoom.push(Game.getObjectById(linkIdInRoom));
                }
            }

            if (receiverCoreLink && receiverCoreLink.energy < 700) {
                if (receiverLink) {
                    usedLink = linkTransferToCentre(receiverCoreLink, linksInRoom.concat(receiverLink));
                    if (usedLink && usedLink.id != receiverLink.id) {
                        removeElementInArrayByElement(usedLink, linksInRoom);
                    }
                }
                else {
                    usedLink = linkTransferToCentre(receiverUpLink, linksInRoom);
                    if (usedLink && usedLink.id != receiverLink.id) {
                        removeElementInArrayByElement(usedLink, linksInRoom);
                    }
                }
            }

            if (receiverUpLink && receiverUpLink.energy < 700) {
                if (receiverLink) {
                    usedLink = linkTransferToCentre(receiverUpLink, linksInRoom.concat(receiverLink));
                    if (usedLink && usedLink.id != receiverLink.id) {
                        removeElementInArrayByElement(usedLink, linksInRoom);
                    }
                }
                else {
                    usedLink = linkTransferToCentre(receiverUpLink, linksInRoom);
                    if (usedLink && usedLink.id != receiverLink.id) {
                        removeElementInArrayByElement(usedLink, linksInRoom);
                    }
                }
            }
            if (receiverLink && receiverLink.energy < 700) {
                linkTransferToCentre(receiverLink, linksInRoom);
            }
        }
    }
}

global.initiateLinksInRoom = function (room) {
    room.memory.forLinks = {};

    let roomName = room.name

    let links = room.find(FIND_MY_STRUCTURES, { filter: o => o.structureType == STRUCTURE_LINK });

    if (links && links.length > 0) {

        for (let link of links) {
            if (link.pos.getRangeTo(room.storage) < 3) {
                room.memory.forLinks.receiverLinkId = link.id;
            }
            else if (link.pos.getRangeTo(room.controller) < 4) {
                room.memory.forLinks.receiverUpLinkId = link.id;
            }
            else {
                let senderLink = true;
                let sps = room.find(FIND_MY_STRUCTURES, { filter: o => o.structureType == STRUCTURE_SPAWN });
                for (let sp of sps) {
                    if (link.pos.getRangeTo(sp) < 3) {
                        room.memory.forLinks.receiverCoreLinkId = link.id;
                        senderLink = false;
                    }
                }
                if (!room.memory.forLinks.linksIdsInRoom) {
                    room.memory.forLinks.linksIdsInRoom = [];
                }
                if (senderLink) {
                    room.memory.forLinks.linksIdsInRoom.push(link.id);
                }
            }
        }

        room.memory.forSpawning.roomCreepNo.minCreeps['linkKeeper'] = 1;
        room.memory.forSpawning.roomCreepNo.creepEnergy['linkKeeper'] = 640;
    }
    else {
        room.memory.forSpawning.roomCreepNo.minCreeps['linkKeeper'] = 0;
        room.memory.forSpawning.roomCreepNo.creepEnergy['linkKeeper'] = 640;
    }
}

global.linkTransferToCentre = function (getter, givers) {
    for (let giver of givers) { // loop through all giver-links
        if (giver.cooldown == 0 && getter.energy < getter.energyCapacity) { // if getter has space
            if (giver.transferEnergy(getter, Math.min(giver.energy, getter.energyCapacity - getter.energy)) == 0) { // transfer giver energy or getter gap, whichever is smaller
                return giver
            }
        } // getter is full no need to transfer
    }
}

global.whichWallToBuild = function (room) {
    var walls = room.find(FIND_STRUCTURES, { filter: c => c.structureType == STRUCTURE_WALL });
    //for (let wall of walls) {
    //    console.log(wall.hits);
    //}
    var byHits = walls.slice(0);
    byHits.sort(function (a, b) {
        return a.hits - b.hits;
    });
    //console.log('by hits:');
    //console.log(byHits);
    //for (let wall of byHits) {
    //   console.log(wall.hits);
    //}
    return byHits[0]
}

global.cacheContainerOrRoadToBuild = function (room, containerThreshold, roadThreshold) {
    let toRepair = room.find(FIND_STRUCTURES, { filter: c => ((c.structureType == STRUCTURE_CONTAINER && c.hits < containerThreshold * c.hitsMax) || (c.structureType == STRUCTURE_ROAD && c.hits < roadThreshold * c.hitsMax) && (c.id != '5ba36cbf964822546cb96c08')) });

    if (toRepair.length > 0) {
        let byHits = toRepair.slice(0);
        byHits.sort(function (a, b) {
            return a.hits / a.hitsMax - b.hits / b.hitsMax;
        });
        room.memory.toRepairId = byHits[0].id;
        return true
    }
    else {
        return undefined
    }
}

global.whichRampartToBuild = function (room) {
    var walls = room.find(FIND_MY_STRUCTURES, { filter: c => c.structureType == STRUCTURE_RAMPART });
    //for (let wall of walls) {
    //    console.log(wall.hits);
    //}
    var byHits = walls.slice(0);
    byHits.sort(function (a, b) {
        return a.hits - b.hits;
    });
    //console.log('by hits:');
    //console.log(byHits);
    //for (let wall of byHits) {
    //   console.log(wall.hits);
    //}
    return byHits[0]
}

global.whichWallAndRampartToBuild = function (room) {
    var walls = room.find(FIND_STRUCTURES, { filter: c => ((c.structureType == STRUCTURE_RAMPART) || (c.structureType == STRUCTURE_WALL)) });
    //for (let wall of walls) {
    //    console.log(wall.hits);
    //}
    var byHits = walls.slice(0);
    byHits.sort(function (a, b) {
        return a.hits - b.hits;
    });
    //console.log('by hits:');
    //console.log(byHits);
    //for (let wall of byHits) {
    //   console.log(wall.hits);
    //}
    return byHits[0]
}

global.runEveryTicks = function (ticks) {
    // on average, run a command every 'ticks' ticks
    rnd = Math.random();
    if (rnd < 1 / ticks) {
        return true;
    }
    else {
        return false;
    }
}

global.evaluateEnergyResources = function (creep, ifLink, ifStorage, ifDropped, ifContainer) { // determine which resource to get
    var room = creep.room;
    var RCL;
    if (creep.room.controller) {
        RCL = creep.room.controller.level;
    }
    else {
        RCL = 0; // for keeper room
    }

    var linkWeight = 2.5;
    var storageWeight = 1;
    var droppedWeight = 3;
    var supperDroppedWeight = 5;
    var containerWeight = 2;

    var goToId = undefined;
    var resourceness = 0;
    var energyDropped = false;

    if ((creep.memory.role == 'longDistanceBuilder') || (creep.memory.role == 'harvester') || (creep.memory.role == 'keeperLairLorry') || ((RCL > 0) && (creep.memory.role == 'pioneer'))) {
        var notMineButExisted = room.storage;
        if (notMineButExisted && notMineButExisted.store.energy > 0) {
            return [notMineButExisted.id, false]
        }
        else {
            var containers = room.find(FIND_STRUCTURES, { filter: c => c.structureType == STRUCTURE_CONTAINER });
            let containersResource = 0;
            if (containers.length > 0) {
                for (let container of containers) {
                    containersResource += container.store.energy;
                }
                if (containersResource > creep.carryCapacity) {
                    ifLink = false;
                    ifStorage = false;
                }
                else {
                    var dropped = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, { filter: c => ((c.resourceType == RESOURCE_ENERGY) && (c.pos.findInRange(FIND_HOSTILE_CREEPS, 3).length == 0) && (c.energy > 0.5 * creep.carryCapacity)) });
                    if (dropped != undefined) {
                        return [dropped.id, true]
                    }
                    else {
                        let energyResources = room.find(FIND_SOURCES, { filter: c => (c.pos.findInRange(FIND_HOSTILE_CREEPS, 3).length == 0) })
                        if (energyResources.length == 2) { // if two E resources go to the unoccupied one
                            let energySource = creep.pos.findClosestByRange(FIND_SOURCES, { filter: c => (c.pos.findInRange(FIND_HOSTILE_CREEPS, 3).length == 0) });// find closest energy source
                            if (((energySource.energy > 0) && (ifSurrounded(energySource) == null) && (creep.pos.getRangeTo(energySource) > 1)) || (energySource.energy == 0)) { // if full
                                let indexOfCurrent = energyResources.indexOf(energySource); // go to the other one
                                goToId = energyResources[1 - indexOfCurrent].id;
                            }
                            else { // not full go to the nearest one
                                goToId = energySource.id;
                            }
                            return [undefined, goToId]
                        }
                        else if (energyResources.length > 2) {
                            let energySource = creep.pos.findClosestByRange(FIND_SOURCES, { filter: c => (c.pos.findInRange(FIND_HOSTILE_CREEPS, 3).length == 0) });// find closest energy source
                            if (((energySource.energy > 0) && (ifSurrounded(energySource) == null) && (creep.pos.getRangeTo(energySource) > 1)) || (energySource.energy == 0)) { // if full
                                let indexOfCurrent = energyResources.indexOf(energySource); // go to the other one
                                goToId = energyResources[(indexOfCurrent + 1) % energyResources.length].id;
                            }
                            else { // not full go to the nearest one
                                goToId = energySource.id;
                            }
                            return [undefined, goToId]
                        }
                        else { // if only one E resource, just go to that one
                            return [undefined, energyResources[0].id]
                        }
                    }
                }
            }
            else {
                var dropped = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, { filter: c => ((c.resourceType == RESOURCE_ENERGY) && (c.pos.findInRange(FIND_HOSTILE_CREEPS, 3).length == 0) && (c.energy > 0.5 * creep.carryCapacity)) });
                if (dropped != undefined) {
                    return [dropped.id, true]
                }
                else {
                    var ruined = creep.pos.findClosestByRange(FIND_RUINS, { filter: c => ((c.store['RESOURCE_ENERGY']) && (c.store['RESOURCE_ENERGY'] > 0) && (c.pos.findInRange(FIND_HOSTILE_CREEPS, 3).length == 0) && (c.energy > 0.5 * creep.carryCapacity)) });
                    if (ruined != undefined) {
                        return [ruined.id, true]
                    }
                    else {
                        let energyResources = room.find(FIND_SOURCES, { filter: c => (c.pos.findInRange(FIND_HOSTILE_CREEPS, 3).length == 0) })
                        if (energyResources.length > 1) { // if two E resources go to the unoccupied one
                            let energySource = creep.pos.findClosestByRange(FIND_SOURCES, { filter: c => (c.pos.findInRange(FIND_HOSTILE_CREEPS, 3).length == 0) });// find closest energy source
                            if (((energySource.energy > 0) && (ifSurrounded(energySource) == null) && (creep.pos.getRangeTo(energySource) > 1)) || (energySource.energy == 0)) { // if full
                                let indexOfCurrent = energyResources.indexOf(energySource); // go to the other one
                                goToId = energyResources[1 - indexOfCurrent].id;
                            }
                            else { // not full go to the nearest one
                                goToId = energySource.id;
                            }
                            return [undefined, goToId]
                        }
                        else { // if only one E resource, just go to that one
                            return [undefined, energyResources[0].id]
                        }
                    }
                }
            }
        }
    }
    else { // lorry, pickuper, ...
        if ((RCL < 2) || (_.sum(updateCreepsInRoomWithSpawningByRoom(creep.room), (c) => c.memory.role == 'miner' || c.memory.role == 'lorry' || c.memory.role == 'pickuper') < 2)) { // no container mining, find dropped energy first
            var dropped = room.find(FIND_DROPPED_RESOURCES, { filter: { resourceType: RESOURCE_ENERGY } })[0];
            if (dropped != undefined) {
                return [dropped.id, true]
            }
            else { // if no dropped find energy sources
                let energyResources = room.find(FIND_SOURCES, { filter: c => (c.pos.findInRange(FIND_HOSTILE_CREEPS, 3).length == 0) })
                if (energyResources.length > 1) {
                    let energySource = creep.pos.findClosestByPath(FIND_SOURCES, { filter: c => (c.pos.findInRange(FIND_HOSTILE_CREEPS, 3).length == 0) });// find closest energy source
                    if (energySource) {
                        if (((energySource.energy > 1) && (ifSurrounded(energySource) == null) && (creep.pos.getRangeTo(energySource) > 1)) || (energySource.energy == 0)) { // if full
                            let indexOfCurrent = energyResources.indexOf(energySource); // go to the other one
                            goToId = energyResources[1 - indexOfCurrent].id;
                        }
                        else { // not full go to the nearest one
                            goToId = energySource.id;
                        }
                    }
                    else {
                        goToId = undefined;
                    }
                }
                else {
                    goToId = energyResources[0].id;
                }
                return [undefined, goToId]
            }
        }

        if ((RCL < 5) || (_.sum(Game.rooms[creep.room.name].find(FIND_MY_STRUCTURES, { filter: c => c.structureType == STRUCTURE_LINK })) == 0)) { // no storage no link mining
            ifLink = false;
            if (creep.room.storage == undefined) {
                ifStorage = false;
                /*
                var dropped = room.find(FIND_DROPPED_RESOURCES, {filter: {resourceType: RESOURCE_ENERGY}})[0];
                if ((dropped != undefined)&&(dropped['energy']>creep.carryCapacity/2)) {
                    return [dropped.id,true]
                }
                else { // if no dropped find energy sources
                    let energyResources = room.find(FIND_SOURCES)
                    let energySource = creep.pos.findClosestByPath(FIND_SOURCES);// find closest energy source
                    if (energyResources.length>1) { // 2 source room
                        if (energySource) {
                            if (((energySource.energy>0)&&(ifSurrounded(energySource) == null)&&(creep.pos.getRangeTo(energySource)>1))||(energySource.energy==0)) { // if full
                                let indexOfCurrent = energyResources.indexOf(energySource); // go to the other one
                                goToId = energyResources[1-indexOfCurrent].id;
                                }
                                else { // not full go to the nearest one
                                    goToId = energySource.id;
                                }
                            }
                            else {
                                goToId = undefined;
                            }
                        return [undefined, goToId]
                    }
                    else { // 1 source room
                        if (energySource) {
                            if (((energySource.energy>0)&&(ifSurrounded(energySource) == null)&&(creep.pos.getRangeTo(energySource)>1))||(energySource.energy==0)) { // if full
                                goToId = undefined;
                            }
                            else {
                                goToId = energySource.id;
                            }
                        return [undefined, goToId]
                        }
                    }
                }
                */
            }
            else {

            }
        }
        else {
            if (Game.flags['link' + room.name] == undefined) {
                ifLink = false;
            }
        }

    }

    if (false) { // (ifLink) { // find the getter link in creep's room
        var link = Game.flags['link' + room.name].pos.findInRange(FIND_STRUCTURES, 1, { filter: s => s.structureType == STRUCTURE_LINK })[0];
        let range = creep.pos.getRangeTo(link) + 1;
        let energy = Math.min(link.energy, creep.carryCapacity - creep.carry.energy); // how much energy can be taken, min of stored energy or space of creep
        if (linkWeight * energy / range > resourceness) {
            resourceness = linkWeight * energy / range;
            goToId = link.id;
        }
    }
    // no need to find giver links, energy will be teleported in anyways
    /*if (ifLink) { // find energy in links
      var links = room.find(FIND_MY_STRUCTURES, {filter : c => c.structureType == STRUCTURE_LINK});
      for (let link of links) {
        let range = creep.pos.getRangeTo(link);
        let energy = Math.min( link.energy, creep.carryCapacity - creep.carry.energy ); // how much energy can be taken, min of stored energy or space of creep
        if (linkWeight*energy/range > resourceness) {
          resourceness = linkWeight*energy/range;
          goToId = link.id;
        }
      }
    }*/

    /*if (room.storage) { // season 2 symbol
        let symbctns = room.find(FIND_SYMBOL_CONTAINERS, { filter: s=> _.sum(s.store) > 0 });
        if (symbctns.length>0) {
            return [symbctns[0].id, false]
        }
    }*/

    if (ifDropped) { // find energy in links
        var droppeds = room.find(FIND_DROPPED_RESOURCES, { filter: c => ((c.resourceType == RESOURCE_ENERGY) && (c.pos.findInRange(FIND_HOSTILE_CREEPS, 3).length == 0)) });
        for (let dropped of droppeds) {
            if (dropped.energy > 1000) { // if dropped energy is quite a big amount, clear that dropped energy first
                let range = creep.pos.getRangeTo(dropped) + 1;
                let energy = Math.min(dropped.energy, creep.carryCapacity - creep.carry.energy); // how much energy can be taken, min of stored energy or space of creep
                if (supperDroppedWeight * energy / range > resourceness) {
                    resourceness = supperDroppedWeight * energy / range;
                    goToId = dropped.id;
                    energyDropped = true;
                }
            }
            else {
                let range = creep.pos.getRangeTo(dropped) + 1;
                let energy = Math.min(dropped.energy, creep.carryCapacity - creep.carry.energy); // how much energy can be taken, min of stored energy or space of creep
                if (droppedWeight * energy / range > resourceness) {
                    resourceness = droppedWeight * energy / range;
                    goToId = dropped.id;
                    energyDropped = true;
                }
            }
        }
        droppeds = room.find(FIND_TOMBSTONES, { filter: c => ((c.store.energy > 0) && (c.pos.findInRange(FIND_HOSTILE_CREEPS, 3).length == 0)) });
        for (let dropped of droppeds) {
            let range = creep.pos.getRangeTo(dropped) + 1;
            let energy = Math.min(dropped.store.energy, creep.carryCapacity - creep.carry.energy); // how much energy can be taken, min of stored energy or space of creep
            if (droppedWeight * energy / range > resourceness) {
                resourceness = droppedWeight * energy / range;
                goToId = dropped.id;
                energyDropped = false;
            }
        }
    }

    if (ifContainer) { // find energy in links
        var containers = room.find(FIND_STRUCTURES, { filter: c => ((c.structureType == STRUCTURE_CONTAINER) && (c.store.energy > creep.carryCapacity) && (c.pos.findInRange(FIND_HOSTILE_CREEPS, 3).length == 0)) });
        let sps = room.find(FIND_MY_STRUCTURES, { filter: o => o.structureType == STRUCTURE_SPAWN });
        for (let container of containers) {
            let range = creep.pos.getRangeTo(container) + 1;
            let energy = Math.min(container.store.energy, creep.carryCapacity - creep.carry.energy); // how much energy can be taken, min of stored energy or space of creep
            let takeThis = true;
            // check container not central containers
            if (sps.length > 0) { // my room
                // upgrade container
                if (container.pos.getRangeTo(room.controller) < 3) {
                    takeThis = false;
                }
                // middle place container
                for (let sp of sps) {
                    if (container.pos.getRangeTo(sp) < 3) {
                        takeThis = false;
                    }
                }
            }
            if (takeThis) {
                if (containerWeight * energy / range > resourceness) {
                    resourceness = containerWeight * energy / range;
                    goToId = container.id;
                    energyDropped = false;
                }
            }
        }
    }

    if (ifStorage) { // find energy in links
        var storage = room.storage;
        if (storage.store.energy == 0 && room.terminal) {
            storage = room.terminal;
            let range = creep.pos.getRangeTo(storage) + 1; // +1 tp prevent 0 in demoniator, if creep is standing on source
            let energy = Math.min(storage.store.energy, creep.carryCapacity - creep.carry.energy); // how much energy can be taken, min of stored energy or space of creep
            if (storageWeight * energy / range > resourceness) {
                resourceness = storageWeight * energy / range;
                goToId = storage.id;
                return [goToId, false]
            }
        }
        else {
            let range = creep.pos.getRangeTo(storage) + 1; // +1 tp prevent 0 in demoniator, if creep is standing on source
            let energy = Math.min(storage.store.energy, creep.carryCapacity - creep.carry.energy); // how much energy can be taken, min of stored energy or space of creep
            if (storageWeight * energy / range > resourceness) {
                resourceness = storageWeight * energy / range;
                goToId = storage.id;
                return [goToId, false]
            }
        }
    }

    return [goToId, energyDropped]
}

global.getTargetByFlag = function (flagName, targetType) {
    if (Game.flags[flagName] != undefined) {
        var targets = Game.flags[flagName].room.lookAt(Game.flags[flagName].pos);
        //console.log(targets);
        for (let target of targets) {
            //console.log(target['type'])
            if (target['type'] == targetType) {
                return Game.getObjectById(target[targetType].id);
            }
        }
        console.log('no ' + targetType + ' found');
    }
    else {
        console.log('set flag: ' + flagName);
    }
}

global.whichSpawnSpawns = function (mainSpawn, subSpawn) {
    if (subSpawn == undefined) { // if there is no subSpawn, use main spawn
        return mainSpawn;
    }
    else { // there are two spawns, determine which to use
        if (mainSpawn.spawning == null) { // spawn is busy creating creeps
            return mainSpawn;
        }
        else { // main spawn is free, use main spawn
            let totalTime = mainSpawn.spawning.needTime;
            let remainTime = mainSpawn.spawning.remainingTime;
            if ((totalTime - remainTime) > 2) { // calculation of find(FIND_MY_CREEPS) has 1 tick delay on creeps being spawned
                return subSpawn;
            }
            else {
                return mainSpawn;
            }
        }
    }
    //return mainSpawn;
}

global.updateCreepsInRoomWithSpawning = function (spawn) {
    let room = spawn.room;
    let creepsInRoom = room.find(FIND_MY_CREEPS);

    // add being-spawned creeps into creepsInRoom as well
    if (spawn.spawning != null) { // main spawn is spawning
        creepsInRoom.push(Game.creeps[spawn.spawning.name]); // add the spawning creep into creepsInRoom list
    }
    // for sub spawns
    var subSpawn = undefined;
    if (spawn.memory.subSpawn != undefined) {
        subSpawn = Game.spawns[spawn.memory.subSpawn];
        if (subSpawn.spawning != null) { // main spawn is spawning
            creepsInRoom.push(Game.creeps[subSpawn.spawning.name]); // add the spawning creep into creepsInRoom list
        }
    }
    return creepsInRoom
}

global.calculateMyCreepsInRoom = function (roomName) {
    if (Game.rooms[roomName] != undefined) {
        let room = Game.rooms[roomName];
        let creepsInRoom = room.find(FIND_MY_CREEPS);
        return [true, creepsInRoom]
    }
    else {
        return [false, undefined]
    }
}

global.getAllMyCreepsAlive = function () {
    let allMyCreeps = [];
    for (let name in Game.creeps) {
        allMyCreeps.push(Game.creeps[name]);
    }
    return allMyCreeps
}

global.findMyHero = function (uniqueMark, lover) {
    let allMyCreeps = [];
    for (let name in Game.creeps) {
        if ((Game.creeps[name].memory.uniqueString == uniqueMark) && (Game.creeps[name].memory.role == lover)) {
            return name
        }
    }
}

global.getAllMyCreepsWithSpawning = function (roomName) {
    let allMyCreeps = [];
    for (let name in Game.creeps) {
        allMyCreeps.push(Game.creeps[name]);
    }
    let room = Game.rooms[roomName];
    let spawns = room.find(FIND_MY_STRUCTURES, { filter: s => s.structureType == STRUCTURE_SPAWN });

    // add being-spawned creeps into creepsInRoom as well
    for (let spawn of spawns) {
        if (spawn.spawning != null) { // main spawn is spawning
            allMyCreeps.push(Game.creeps[spawn.spawning.name]); // add the spawning creep into creepsInRoom list
        }
    }
    return allMyCreeps
}

global.updateCreepsInRoomWithSpawningByRoom = function (room) {
    let creepsInRoom = room.find(FIND_MY_CREEPS);
    let spawns = room.find(FIND_MY_STRUCTURES, { filter: s => s.structureType == STRUCTURE_SPAWN });

    // add being-spawned creeps into creepsInRoom as well
    for (let spawn of spawns) {
        if (spawn.spawning != null) { // main spawn is spawning
            creepsInRoom.push(Game.creeps[spawn.spawning.name]); // add the spawning creep into creepsInRoom list
        }
    }
    return creepsInRoom
}

global.testSome = function () {
    room = Game.spawns['Spawn_E92N12'].room;
    var wanted = room.find(FIND_MY_CREEPS, { filter: c => c.memory.role == 'miner' });
    console.log(wanted[0].hits)
    for (var creep in wanted) {
        console.log(wanted[creep].hits);
    }
    /*if (!_.some(creepsInRoom, c => c.memory.role == 'miner' && c.memory.sourceID == source.id)) { // if there is no miner going to THE source
        let containers = source.pos.findInRange(FIND_STRUCTURES, 1, {filter: s => s.structureType == STRUCTURE_CONTAINER});
        if (containers.length>0) {
            spawningCreepName = this.createMiner(source.id, undefined, currentRCL, true);
            break;
        }
    }*/
}

global.assignController = function () {
    let creeps = Game.creeps;
    for (let creepName in creeps) {
        let creep = Game.creeps[creepName];
        if ((creep.memory.role == 'reserver') || (creep.memory.role == 'upgrader') || (creep.memory.role == 'pioneer') || (creep.memory.role == 'builder') || (creep.memory.role == 'superUpgrader')) {
            //creep.signController(creep.room.controller, 'Territory of the Twilight Kingdoms of the East')
            creep.signController(creep.room.controller, '‍♂‍♀ 💕 May the world full of peace and love 💕 ‍♀♂‍')
        }
    }
}

global.ifConstructionSiteInRoom = function (room) {
    /*let lvl = room.controller.level;
    let sps = room.find(FIND_MY_STRUCTURES, {filter: t=>t.structureType==STRUCTURE_SPAWN});
    let rpts = room.find(FIND_MY_STRUCTURES, {filter: t=>t.structureType==STRUCTURE_RAMPART});
    if ((lvl==1 && sps.length==0) || (lvl==2 && rpts.length==0)) {
        return false
    }*/
    let sites = room.find(FIND_MY_CONSTRUCTION_SITES);
    if (sites.length > 0) {
        let totalProgress = 0;
        for (let site of sites) {
            totalProgress += site.progressTotal;
        }
        return totalProgress
    }
    return false
}

global.ifConstructionSiteInRoom2 = function (roomName) {
    let constructionSites = Game.constructionSites;
    for (let constructionSiteId in constructionSites) {
        let constructionSite = Game.constructionSites[constructionSiteId];
        if (constructionSite.room.name == roomName) {
            return true;
        }
    }
}

global.towerRepairInPeace = function (room) {
    var towers = room.find(FIND_MY_STRUCTURES, { filter: s => s.structureType == STRUCTURE_TOWER });
    for (let tower of towers) {
        tower.repairNoneWalls(room);
    }
}

global.unspentEnergySendTo = function (storageRoomName, terminalRoomName) {
    room = Game.rooms[storageRoomName];
    let creepsInRoom = updateCreepsInRoomWithSpawningByRoom(room);
    /*if ( (Game.rooms[storageRoomName].storage.store.energy > 500000)&&(_.sum(creepsInRoom, c => c.memory.role == 'transporter')<1) ) {
        //Game.spawns['Spawn_E91N16'].createTransporter('energy');
        console.log('create transporter in room' + storageRoomName)
        Game.rooms[storageRoomName].memory.forSpawning.spawningQueue.push({memory:{role: 'transporter', resourceType: 'energy'},priority: 2});
    }*/

    let senderTerminalCapa = Game.rooms[storageRoomName].terminal.storeCapacity - _.sum(Game.rooms[storageRoomName].terminal.store);
    if (Game.rooms[storageRoomName].storage.store.energy > 200000 && Game.rooms[storageRoomName].terminal.store.energy > 50000 && senderTerminalCapa < 200000) {
        if (Game.rooms[storageRoomName].terminal.send('energy', howMuchEnergyToSend(storageRoomName, terminalRoomName), terminalRoomName, 'balance energy!') == 0) {
            console.log(storageRoomName + ' sent energy to ' + terminalRoomName);
        }
        else {
            console.log(storageRoomName + ' sent energy to ' + terminalRoomName + ' failed');
        }
    }
}

global.howMuchEnergyToSend = function (senderRoomName, GetterRoomName) {
    let dist = Game.map.getRoomLinearDistance(senderRoomName, GetterRoomName);
    let sendCapa = Game.rooms[senderRoomName].terminal.store.energy * 0.9;
    let sendAmount = sendCapa / (2 - Math.exp(-dist / 30));

    let getterCapa = (Game.rooms[GetterRoomName].terminal.storeCapacity - _.sum(Game.rooms[GetterRoomName].terminal.store)) * 0.9 - 30000;
    if (getterCapa > sendAmount) {
        return sendAmount
    }
    else {
        return getterCapa
    }

}

global.balanceEnergyInAllMyRooms = function (outRoomNames, getRoomNames) {
    for (let senderRoomName of outRoomNames) {
        for (let getterRoomName of getRoomNames) {
            unspentEnergySendTo(senderRoomName, getterRoomName)
        }
    }
}

global.upgraderBalancing = function (totalProgress) {
    if (totalProgress > 100000) {
        return 3
    }
    else if (totalProgress > 40000) {
        return 2
    }
    else if (totalProgress > 0) {
        return 1
    }
    else {
        return 0
    }
}

global.earlyRoomUpgraderBalancing = function (r, Ecap, upNumber) {
    if (upNumber < 0) {
        return 0
    }
    else if (upNumber >= 4) {
        return 4
    }
    else {
        if (upNumber == null || upNumber == undefined) {
            upNumber = 0;
        }
        if (Game.time % 1 == 0) {
            let droppedE = _.sum(r.find(FIND_DROPPED_RESOURCES, { filter: c => (c.resourceType == RESOURCE_ENERGY) }), 'amount');
            if (droppedE > 1500) {
                upNumber += 1;
            }
            else if (droppedE < 500) {
                upNumber -= 1;
            }
        }
        return upNumber
    }
}

global.newLinkSuperUpgraderPosisCach = function (rn) {
    let r = Game.rooms[rn];
    if (!r.memory.superUpgraderPosisCach) {
        r.memory.superUpgraderPosisCach = [];
    }

    if (r.memory.forLinks && r.memory.forLinks.receiverUpLinkId) {
        let posi = Game.getObjectById(r.memory.forLinks.receiverUpLinkId).pos;
        if ((!r.memory.superUpgraderPosisCach) || (r.memory.superUpgraderPosisCach.length == 0)) {
            let posis = returnALLAvailableLandCoords(r, posi)
            r.memory.superUpgraderPosisCach = posis;
        }
    }
    else {
        let ts = r.find(FIND_STRUCTURES, { filter: o => o.structureType == STRUCTURE_TOWER });
        for (let t of ts) {
            if (!(t.pos.findInRange(FIND_STRUCTURES, 3, { filter: o => o.resourceType == STRUCTURE_SPAWN }).length > 0)) {
                if ((!r.memory.superUpgraderPosisCach) || (r.memory.superUpgraderPosisCach.length == 0)) {
                    let posis = returnALLAvailableLandCoords(r, t.pos)
                    r.memory.superUpgraderPosisCach = posis;
                }
            }
        }
    }
    return
}

global.superUpgraderLookForAvailablePosis = function (r) {
    let okPosis = r.memory.superUpgraderPosisCach;
    for (let okPosi of okPosis) {
        let posiCreep = r.lookForAt(LOOK_CREEPS, okPosi.x, okPosi.y);
        if (posiCreep && posiCreep[0]) {
            ;//
        }
        else {
            return okPosi
        }
    }
}

global.superUpgraderPosisCach = function (rn) {
    let r = Game.rooms[rn];
    if (!r.memory.superUpgraderPosisCach) {
        r.memory.superUpgraderPosisCach = [];
    }

    if ((!r.memory.superUpgraderPosisCach) || (r.memory.superUpgraderPosisCach.length == 0)) {
        let stor = r.storage;
        let contr = r.controller;
        let goodPosis = []

        if ((stor) && (Math.max(Math.abs((stor.pos.x - contr.pos.x)), Math.abs((stor.pos.y - contr.pos.y))) < 3)) {
            let x = 0;
            let y = 0;
            let delta = [0, -1];
            // spiral width
            let width = 3;
            // spiral height
            let height = 3;

            for (let i = Math.pow(Math.max(width, height), 2); i > 0; i--) {
                if ((-width / 2 < x && x <= width / 2) && (-height / 2 < y && y <= height / 2)) {
                    let xp = stor.pos.x + x;
                    let yp = stor.pos.y + y;

                    if (!((x == 0) && (y == 0))) {


                        if (Math.abs(contr.pos.x - stor.pos.x) > 1) { // horizontal config
                            if (!(
                                ((xp > Math.max(contr.pos.x, stor.pos.x)) || (xp < Math.min(contr.pos.x, stor.pos.x)))
                                && (!(yp == stor.pos.y))
                            )) {
                                if ((r.lookForAt(LOOK_TERRAIN, xp, yp) == 'plain') || (r.lookForAt(LOOK_TERRAIN, xp, yp) == 'swamp')) {
                                    goodPosis.push({ x: xp, y: yp, roomName: rn });
                                }
                            }
                        }
                        else { // vertical config
                            if (!(((yp > Math.max(contr.pos.y, stor.pos.y)) || (yp < Math.min(contr.pos.y, stor.pos.y))) && (!(xp == stor.pos.x)))) {
                                if ((r.lookForAt(LOOK_TERRAIN, xp, yp) == 'plain') || (r.lookForAt(LOOK_TERRAIN, xp, yp) == 'swamp')) {
                                    goodPosis.push({ x: xp, y: yp, roomName: rn });
                                }
                            }
                        }
                    }
                }

                if (x === y
                    || (x < 0 && x === -y)
                    || (x > 0 && x === 1 - y)) {
                    // change direction
                    delta = [-delta[1], delta[0]]
                }

                x += delta[0];
                y += delta[1];
            }

            r.memory.superUpgraderPosisCach = goodPosis;
            return true
        }
        else { // storage and controller too far away, need another structure, link container or terminal etc...
            return false
        }
    }
    else { // if cach already registered
        return true
    }
}

global.superUpgraderBalancing = function (roomName) {
    //let upgradersNo = {E99N17:{0:1,1:2,2:4},E97N13:{0:1,1:2,2:4}};
    let room = Game.rooms[roomName];
    let lvl = room.controller.level;
    let totalProgress = ifConstructionSiteInRoom(room);
    let motherRoomName = room.memory.startMB;

    // cachSuperUpgrader positions
    if (superUpgraderPosisCach(roomName)) {
        if (motherRoomName) { // if shooter room start MBing
            room.memory.forSpawning.roomCreepNo.minCreeps.upgrader = upgraderBalancing(totalProgress);
            console.log(roomName + ' upgrader No set to ' + upgraderBalancing(totalProgress));
            if (lvl < 6 && !room.storage && !room.terminal) {
                if (room.storage != undefined) {
                    let storageEnergy = room.storage.store.energy;
                    if (storageEnergy > 300000) {
                        room.memory.forSpawning.roomCreepNo.minCreeps.superUpgrader = 3;
                        console.log(roomName + ' superUpgrader No set to ' + '3');
                    }
                    else if (storageEnergy > 200000) {
                        room.memory.forSpawning.roomCreepNo.minCreeps.superUpgrader = 2;
                        console.log(roomName + ' superUpgrader No set to ' + '2');
                    }
                    else if (storageEnergy > 100000) {
                        room.memory.forSpawning.roomCreepNo.minCreeps.superUpgrader = 1;
                        console.log(roomName + ' superUpgrader No set to ' + '1');
                    }
                    else {
                        room.memory.forSpawning.roomCreepNo.minCreeps.superUpgrader = 0;
                        console.log(roomName + ' superUpgrader No set to ' + '0');
                    }
                }
                else {
                    console.log(roomName + ' has started MBing.');
                }
            }
            else {
                room.memory.forSpawning.roomCreepNo.minCreeps.superUpgrader = 0;
            }
        }
        else {
            if (lvl != 8) {
                if (room.storage != undefined) { // 4 5 6 7
                    let storageEnergy = room.storage.store.energy;
                    let termic = 0;
                    if (room.terminal) {
                        termic = _.sum(room.terminal.store)
                    }
                    if (room.memory.mineralThresholds && room.memory.mineralThresholds.currentMineralStats) {
                        storageEnergy = room.memory.mineralThresholds.currentMineralStats.energy;
                    }
                    if (storageEnergy > 300000 || (_.sum(room.storage.store) + termic > 900000 + 260000)) { // room keeps being pumped
                        room.memory.forSpawning.roomCreepNo.minCreeps.superUpgrader = 3;
                        console.log(roomName + ' superUpgrader No set to ' + '3');
                    }
                    else if (storageEnergy > 200000) {
                        room.memory.forSpawning.roomCreepNo.minCreeps.superUpgrader = 2;
                        console.log(roomName + ' superUpgrader No set to ' + '2');
                    }
                    else if (storageEnergy > 100000) {
                        room.memory.forSpawning.roomCreepNo.minCreeps.superUpgrader = 1;
                        console.log(roomName + ' superUpgrader No set to ' + '1');
                    }
                    else {
                        room.memory.forSpawning.roomCreepNo.minCreeps.superUpgrader = 0;
                        console.log(roomName + ' superUpgrader No set to ' + '0');
                    }

                    room.memory.forSpawning.roomCreepNo.minCreeps.upgrader = 0;
                    console.log(roomName + ' upgrader No set to 0');
                }
                else { // <= 3
                    console.log(roomName + ' no storage and no super upgrading.');
                    // taken by funcSpawn
                    //room.memory.forSpawning.roomCreepNo.minCreeps.upgrader = upgraderBalancing(totalProgress);
                    //console.log(roomName + ' upgrader No set to ' + upgraderBalancing(totalProgress));
                }
            }
            else { // room lvl 8
                if (Game.time % 10000 < 666) {
                    room.memory.forSpawning.roomCreepNo.minCreeps.superUpgrader = 1;
                }
                else {
                    room.memory.forSpawning.roomCreepNo.minCreeps.superUpgrader = 0;
                }
                room.memory.forSpawning.roomCreepNo.minCreeps.upgrader = 0;
                console.log(roomName + ' superUpgrader and upgrader No set to 1 and 0');
                room.memory.forSpawning.roomCreepNo.creepEnergy.upgrader = 2400;
            }
        }
    }
    else {
        if (lvl < 5) {
            room.memory.forSpawning.roomCreepNo.minCreeps.superUpgrader = 0;
            let upgraderNo = earlyRoomUpgraderBalancing(room, room.memory.ECap, room.memory.forSpawning.roomCreepNo.minCreeps.upgrader);
            room.memory.forSpawning.roomCreepNo.minCreeps.upgrader = upgraderNo
            room.memory.forSpawning.roomCreepNo.creepEnergy.upgrader = room.memory.Ecap;
            console.log(roomName + ' upgrader No set to ' + upgraderNo);
        }
        else {
            room.memory.forSpawning.roomCreepNo.minCreeps.superUpgrader = 0;
            room.memory.forSpawning.roomCreepNo.minCreeps.upgrader = 0
            room.memory.forSpawning.roomCreepNo.creepEnergy.upgrader = room.memory.Ecap;
            console.log(roomName + ' upgrader No set to ' + 0);
        }
    }
}

global.calculateCPUUsageOfProcesses = function (previousCount, message, showMessage) {
    let currentCount = Game.cpu.getUsed();
    let procedureCount = currentCount - previousCount;
    if (showMessage) {
        console.log(message + ' used ' + procedureCount + ' CPUs.')
    }
    return currentCount
}

global.calculateTicksBetweenObjects = function (startSpawn, sourceObj) {
    let goal = { pos: sourceObj.pos, range: 1 }
    let ret = PathFinder.search(startSpawn.pos, goal,
        {
            // We need to set the defaults costs higher so that we
            // can set the road cost lower in `roomCallback`
            plainCost: 2,
            swampCost: 10,

            roomCallback: function (roomName) {

                let room = Game.rooms[roomName];
                // In this example `room` will always exist, but since
                // PathFinder supports searches which span multiple rooms
                // you should be careful!
                if (!room) return;
                let costs = new PathFinder.CostMatrix;

                room.find(FIND_STRUCTURES).forEach(function (struct) {
                    if (struct.structureType === STRUCTURE_ROAD) {
                        // Favor roads over plain tiles
                        costs.set(struct.pos.x, struct.pos.y, 1);
                    } else if (struct.structureType !== STRUCTURE_CONTAINER &&
                        (struct.structureType !== STRUCTURE_RAMPART ||
                            !struct.my)) {
                        // Can't walk through non-walkable buildings
                        costs.set(struct.pos.x, struct.pos.y, 0xff);
                    }
                });

                // Avoid creeps in the room
                room.find(FIND_CREEPS).forEach(function (creep) {
                    costs.set(creep.pos.x, creep.pos.y, 0xff);
                });

                return costs;
            },
        });
    //console.log(ret.path.length)
    return ret.path.length
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

global.massKill = function () {
    let creepsInRoom = Game.rooms['E92N11'].find(FIND_MY_CREEPS);
    for (let i = 0; i < 10; i++) {
        let creep = creepsInRoom[i];
        if (creep.memory.role == 'lorry') {
            console.log(creep.name, creep.suicide())
        }
    }
}

global.massRoleRemoval = function () {
    for (let roomName of myRoomList) {
        if (Game.rooms[roomName].controller.level == 8) {
            //console.log(Game.rooms[roomName].name, Game.rooms[roomName].memory.forSpawning.roomCreepNo.minCreeps.rampartRepairer);
            Game.rooms[roomName].memory.forSpawning.roomCreepNo.minCreeps.upgrader = 0;
            Game.rooms[roomName].memory.forSpawning.roomCreepNo.minCreeps.ultimateUpgrader = 1;
            Game.rooms[roomName].memory.forSpawning.roomCreepNo.minCreeps.builder = 0;
            Game.rooms[roomName].memory.forSpawning.roomCreepNo.minCreeps.repairer = 0;
        }
    }
}

global.destroyAllStructureInRoom = function (roomName, structureType) {
    let room = Game.rooms[roomName];
    let allWallsInRoom = room.find(FIND_STRUCTURES, { filter: f => (f.structureType == structureType) });

    for (let wall of allWallsInRoom) {
        wall.destroy();
    }

}

global.insertString = function (string, insert) {
    return string.slice(0, string.length - 1) + insert + string[string.length - 1]
}

global.generateRandomStrings = function () {
    return Math.random().toString(36).substr(2, 5)
}

global.getRandomInt = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

global.pickRandomElementFromList = function (list) {
    return list[getRandomInt(0, list.length - 1)]
}

global.removeUnusedMainRoomMemory = function () {
    currentShard = Game.shard.name;
    currentShardRooms = Memory.myRoomList;
    if (currentShardRooms) { // if current shard has rooms
        for (let roomName of currentShardRooms[currentShard]) {
            console.log(currentShard + ' ' + roomName);
            if (myRoomList().includes(roomName)) {
                console.log('Detected main room existed: ' + roomName)
            }
            else {
                console.log('Remove unused main room : ' + roomName)
                removeElementInArrayByElement(roomName, Memory.myRoomList[currentShard]);
            }
        }
    }
}

global.fo = function (x) {
    console.log(x);
}

global.randomIdGenerator = function () {
    let s4 = () => {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    //return id of format 'aaaaaaaa'-'aaaa'-'aaaa'-'aaaa'-'aaaaaaaaaaaa'
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

global.removeAllConstructionSitesInRoom = function (r, t) {
    let vs = r.find(FIND_CONSTRUCTION_SITES); {
        for (let v of vs) {
            if (v.structureType == t) {
                v.remove();
            }
        }
    }
}

global.findTotolNumberOfStructure = function (r, type) {
    let alreadyExisted = r.find(FIND_STRUCTURES, { filter: { structureType: type } }).length
    let ongoing = r.find(FIND_CONSTRUCTION_SITES, { filter: { structureType: type } }).length
    return alreadyExisted + ongoing;
}

global.recachAllConstructionSitesInRoom = function (r, t) {
    r.memory.cachedRoad = []
    let vs = r.find(FIND_STRUCTURES, { filter: { structureType: t } });
    let toCach = []
    for (let v of vs) {
        if (toCach) {
            toCach.push(v.pos);
        }
        else {
            toCach = [].concat(v.pos)
        }
    }
    //r.memory.cachedRoad = toCach;
}


global.getCreepCost = function (body) {
    let coste = 0;
    for (let b of body) {
        coste += BODYPART_COST[b.type];
    }
    return coste
}