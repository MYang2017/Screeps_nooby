global.startRemoteMining = function (roomName, role, no, cost) {
    let roomCreepInfo = Game.rooms[roomName].memory.forSpawning.roomCreepNo;
    roomCreepInfo.minCreeps[role] = no;
    roomCreepInfo.creepEnergy[role] = cost;
}

global.initialRemoteMiningMemory = function (roomName, remoteRoomName) {
    let room = Game.rooms[roomName];
    let roomSpawningInfo = room.memory.forSpawning.roomCreepNo;

    if (roomSpawningInfo.remoteMode == undefined) {
        roomSpawningInfo.remoteMode = 1;
    }

    if (room.memory.remoteMiningRoomNames == undefined) {
        room.memory.remoteMiningRoomNames = [];
    }

    if (roomSpawningInfo.minNoRemoteLorries == undefined) {
        roomSpawningInfo.minNoRemoteLorries = [];
    }


    room.memory.remoteMiningRoomNames = room.memory.remoteMiningRoomNames.concat(remoteRoomName);

    // delete room from early stage minig earlyStageLongDistanceHarvesterInitiate
    if (room.memory.earlyHarv && room.memory.earlyHarv[remoteRoomName]) {
        delete room.memory.earlyHarv[remoteRoomName];
    }
}

global.initiateNoOfRemoteLorries = function (noOfSources, sourceTravelTime, roomECapacityAvailable) {
    // in 1500 seconds (a creep's life time):

    // there will be 5 refreshes of one source, which is 5*3000 = 15k resources
    let totalEGain = 15000*noOfSources;
    totalEGain = totalEGain*0.95; // considering degeneration and waste

    // capacity creep carry each time
    let eCarry = Math.floor((Math.min(roomECapacityAvailable*.875,2333)-150)/150) * 2 * 50; // see formula from prototype.spawn line 81
    // calculate average travel time between sources and home
    let oneTripTime = 0;
    for (let source_id in sourceTravelTime) {
        oneTripTime = oneTripTime + sourceTravelTime[source_id]/1.5; // there is a 1.5 factor (see prototype.room line 343)
    }
    let roundTripTime = oneTripTime * 2 / Object.keys(sourceTravelTime).length; // time of a round trip
    let roundTripNo = 1500/roundTripTime; // how many times a creep and go between source and homeName
    let EperLife = eCarry*roundTripNo;

    let noOfLorriesNeeded = Math.ceil(totalEGain/EperLife);

    return noOfLorriesNeeded
}

global.earlyStageLongDistanceHarvesterInitiate = function (roomName, targetName, noOfHarvesters) {
    let room = Game.rooms[roomName];
    if (room.memory.earlyHarv == undefined) {
        room.memory.earlyHarv = {}
    }
    room.memory.earlyHarv[targetName] = noOfHarvesters;
}

global.manageRemoteRoomsResourceGetting = function (roomName) {
    let room = Game.rooms[roomName];
    let keeperRoomNames = room.memory.keeperMiningRoomNames;
    let middleRoomName = room.memory.middleRoomName;

    if (keeperRoomNames) {
        for (let keeperRoomName of keeperRoomNames) {
            findAllResourcesNeedsToTakeInRoom(keeperRoomName);
            assignResourceToRemoteLorries(keeperRoomName);
        }
    }
    if (middleRoomName) {
        findAllResourcesNeedsToTakeInRoom(middleRoomName);
        assignResourceToRemoteLorries(middleRoomName);
    }
}

global.assignResourceToRemoteLorries = function (roomName) {
    let room = Game.rooms[roomName];
    if (room) {
        let resMem = room.memory.resMem;
        let keeperLairLorrys = room.find(FIND_MY_CREEPS, { filter: (s) => s.memory.role == 'keeperLairLorry' && s.memory.target == roomName });
        for (let keeperLairLorry of keeperLairLorrys) {
            if (!keeperLairLorry.memory.toGetId) {
                let resourcePrioV = 0;
                let toGetId = undefined;
                for (let resIdInResMem in resMem) {
                    if (resMem[resIdInResMem].takenCareOf == false
                        && (resMem[resIdInResMem].resType != 'c' || (resMem[resIdInResMem].resType == 'c' && resMem[resIdInResMem].resAmount > 100))
                    ) {
                        let res = Game.getObjectById(resIdInResMem);
                        let resWeight = 1;
                        if (_.sum(res.store) > 0 && (!res.store.energy || _.sum(res.store) - res.store.energy > 0)) {
                            resWeight = 200;
                        }
                        let distanceToRes = keeperLairLorry.pos.getRangeTo(res) + 1;
                        let currentResourcePrioV = resMem[resIdInResMem].resAmount * resWeight / distanceToRes;
                        if (currentResourcePrioV > resourcePrioV) {
                            resourcePrioV = currentResourcePrioV;
                            toGetId = resIdInResMem;
                        }
                    }
                }
                if (toGetId) {
                    keeperLairLorry.memory['toGetId'] = toGetId;
                    keeperLairLorry.memory['resType'] = resMem[toGetId].resType;
                    if ((resMem[toGetId].resAmount - 1600) > 1600) {
                        //resMem[toGetId].resAmount = Math.max(0, resMem[toGetId].resAmount - (keeperLairLorry.carryCapacity - _.sum(keeperLairLorry.carry)));
                    }
                    else {
                        resMem[toGetId].takenCareOf = true;
                    }
                }
                else { // no job to get
                    // to go a container with most amount in room
                    let containers = room.find(FIND_STRUCTURES, { filter: s => s.structureType == STRUCTURE_CONTAINER && _.sum(s.store) > 100 });
                    let containerId = undefined;
                    let containerAmount = 0;
                    for (let container of containers) {
                        let currentCAmout = _.sum(container.store);
                        if (currentCAmout > containerAmount) {
                            containerAmount = currentCAmout;
                            containerId = container.id;
                        }
                    }
                    if (containerId) {
                        keeperLairLorry.memory['toGetId'] = containerId;
                        //keeperLairLorry.memory['resType'] = resMem[toGetId].resType;
                        //resMem[toGetId].takenCareOf = true;
                    }
                    else {
                        // really no job to do, what to do?
                    }
                }

                /*if (!keeperLairLorry.memory['toGetId'] || keeperLairLorry.memory['toGetId'] == undefined) { // did not get a job after all resources scanned, assign a random job
                    keeperLairLorry.memory['toGetId'] = resIdInResMem;
                    keeperLairLorry.memory['resType'] = resMem[resIdInResMem].resType;
                }*/
            }
        }
    }
}

global.findAllResourcesNeedsToTakeInRoom = function(roomName) {
    let room = Game.rooms[roomName];
    if (room) { // if room has visibility
        let resMem = room.memory.resMem;
        if (resMem) {
            // erase resources that are not valid anymore
            for (let resIdInResMem in resMem) {
                let resObj = Game.getObjectById(resIdInResMem);
                let resAmount = resMem[resIdInResMem].resAmount;
                let resTakenCareOf = resMem[resIdInResMem].takenCareOf;
                let resType = resMem[resIdInResMem].resType;

                if (!resObj || resAmount == 0 || (resAmount < 100 && resType == 'c') || resTakenCareOf == true) {
                    delete resMem[resIdInResMem];
                }
            }

            // resources that creeps are already working on it
            let alreadyWorkingIds = [];
            let keeperLairLorrys = room.find(FIND_MY_CREEPS, { filter: (s) => s.memory.role == 'keeperLairLorry' && s.memory.target == roomName });
            for (let keeperLairLorry of keeperLairLorrys) {
                if (!keeperLairLorry.memory.toGetId) {
                    alreadyWorkingIds.push(keeperLairLorry.memory.toGetId);
                }
            }

            // add in resources to memory
            let droppeds = room.find(FIND_DROPPED_RESOURCES);
            for (dropped of droppeds) {
                if (!(dropped.id in resMem) && !alreadyWorkingIds.includes(dropped.id)) { // if resource not logged
                    resMem[dropped.id] = {};
                    resMem[dropped.id].resType = 'd';
                    resMem[dropped.id].resAmount = dropped.amount;
                    if (dropped.resourceType == 'energy') {
                        resMem[dropped.id].resIfE = 1;
                    }
                    else {
                        resMem[dropped.id].resIfE = 0;
                    }
                    resMem[dropped.id].takenCareOf = false;
                }
                else if (Game.time % 50 == 0 && dropped.id in resMem) {
                    resMem[dropped.id].resAmount = dropped.amount;
                }
            }
            let tombstones = room.find(FIND_TOMBSTONES, { filter: c => (_.sum(c.store) > 0) });
            for (let tombstone of tombstones) {
                if (!(tombstone.id in resMem) && !alreadyWorkingIds.includes(tombstone.id)) { // if resource not logged
                    resMem[tombstone.id] = {};
                    resMem[tombstone.id].resType = 't';
                    resMem[tombstone.id].resAmount = _.sum(tombstone.store);
                    if (tombstone.store['energy']) {
                        resMem[tombstone.id].resIfE = 1;
                    }
                    else {
                        resMem[tombstone.id].resIfE = 0;
                    }
                    resMem[tombstone.id].takenCareOf = false;
                }
            }
            let containers = room.find(FIND_STRUCTURES, { filter: s => s.structureType == STRUCTURE_CONTAINER && _.sum(s.store) > 100 });
            for (let container of containers) {
                if (!(container.id in resMem) && !alreadyWorkingIds.includes(container.id)) { // if resource not logged
                    resMem[container.id] = {};
                    resMem[container.id].resType = 'c';
                    resMem[container.id].resAmount = _.sum(container.store);
                    if (container.store['energy']) {
                        resMem[container.id].resIfE = 1;
                    }
                    else {
                        resMem[container.id].resIfE = 0;
                    }
                    resMem[container.id].takenCareOf = false;
                }
            }
        }
        else { // resource memory not defined
            room.memory.resMem = {};
        }
    }
}

global.initialOnlyMineralMiningMemory = function (roomName, remoteRoomName) {
    let room = Game.rooms[roomName];

    if (room.memory.onlyMineralInfo == undefined) {
        room.memory.onlyMineralInfo = {};
    }
    room.memory.onlyMineralInfo[remoteRoomName] = 0;

    // delete room from early stage minig earlyStageLongDistanceHarvesterInitiate
    /*if (room.memory.earlyHarv && room.memory.earlyHarv[remoteRoomName]) {
        delete room.memory.earlyHarv[remoteRoomName];
    }*/
}

global.checkIfMiddleRoom = function(roomName) {
    let roomNameDecomposed = decomposeRoomNameIntoFourParts(roomName);
    if (roomNameDecomposed[1]%5==0 && roomNameDecomposed[3]%5==0) {
        return true
    }
    else {
        return false
    }
}
