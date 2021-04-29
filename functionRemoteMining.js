var funcB = require('funcBuildingPlanner');

global.remoteMiningProcess = function (rn) {

}

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
        room.memory.remoteMiningRoomNames = {};
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
    let totalEGain = 15000 * noOfSources;
    totalEGain = totalEGain * 0.95; // considering degeneration and waste

    // capacity creep carry each time
    let eCarry = Math.floor((Math.min(roomECapacityAvailable * .875, 2333) - 150) / 150) * 2 * 50; // see formula from prototype.spawn line 81
    // calculate average travel time between sources and home
    let oneTripTime = 0;
    for (let source_id in sourceTravelTime) {
        oneTripTime = oneTripTime + sourceTravelTime[source_id] / 1.5; // there is a 1.5 factor (see prototype.room line 343)
    }
    let roundTripTime = oneTripTime * 2 / Object.keys(sourceTravelTime).length; // time of a round trip
    let roundTripNo = 1500 / roundTripTime; // how many times a creep and go between source and homeName
    let EperLife = eCarry * roundTripNo;

    let noOfLorriesNeeded = Math.ceil(totalEGain / EperLife);

    return noOfLorriesNeeded
}

global.manageRemoteRoomsResourceGetting = function (roomName) {
    let room = Game.rooms[roomName];
    let keeperRoomNames = room.memory.keeperMiningRoomNames;
    let middleRoomName = room.memory.middleRoomName;

    if (room.memory.readyToRemoteMining) {
        for (let remoteMiningRoomName in room.memory.readyToRemoteMining) {
            findAllResourcesNeedsToTakeInRoom(remoteMiningRoomName);
            assignResourceToRemoteLorries(remoteMiningRoomName);
        }
    }

    if (room.memory.reremoteMiningRoomNames) {
        for (let reremoteMiningRoomName in room.memory.reremoteMiningRoomNames) {
            findAllResourcesNeedsToTakeInRoom(reremoteMiningRoomName);
            assignResourceToRemoteLorries(reremoteMiningRoomName);
        }
    }

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
        let keeperLairLorrys = room.find(FIND_MY_CREEPS, { filter: (s) => (((s.memory.role == ('keeperLairLorry')) || (s.memory.role == ('longDistanceLorry'))) && (s.memory.target == roomName)) });
        for (let keeperLairLorry of keeperLairLorrys) {
            if (!keeperLairLorry.memory.toGetId) {
                let resourcePrioV = 0;
                let toGetId = undefined;
                for (let resIdInResMem in resMem) {
                    if (resMem[resIdInResMem].takenCareOf == false
                        && (resMem[resIdInResMem].resType != 'c' || (resMem[resIdInResMem].resType == 'c' && resMem[resIdInResMem].resAmount > 300))
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
                            break;
                        }
                    }
                    if (resMem[resIdInResMem].takenCareOf == undefined) {
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
                            break;
                        }
                    }
                }
                if (toGetId) {
                    keeperLairLorry.memory['toGetId'] = toGetId;
                    keeperLairLorry.memory['resType'] = resMem[toGetId].resType;
                    if ((resMem[toGetId].resAmount - 500) > 500) {
                        //resMem[toGetId].resAmount = Math.max(0, resMem[toGetId].resAmount - (keeperLairLorry.carryCapacity - _.sum(keeperLairLorry.carry)));
                    }
                    else {
                        resMem[toGetId].takenCareOf = true;
                    }
                }
                else { // no job to get
                    // to go a container with most amount in room
                    let containers = room.find(FIND_STRUCTURES, { filter: s => s.structureType == STRUCTURE_CONTAINER && _.sum(s.store) > 300 });
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

global.findAllResourcesNeedsToTakeInRoom = function (roomName) {
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
            let keeperLairLorrys = room.find(FIND_MY_CREEPS, { filter: (s) => (((s.memory.role == ('keeperLairLorry')) || (s.memory.role == ('longDistanceLorry'))) && (s.memory.target == roomName)) });
            for (let keeperLairLorry of keeperLairLorrys) {
                if (!keeperLairLorry.memory.toGetId) {
                    alreadyWorkingIds.push(keeperLairLorry.memory.toGetId);
                }
            }

            // add in resources to memory
            // season 2 symbol
            let symbctns = room.find(FIND_SYMBOL_CONTAINERS, { filter: s => _.sum(s.store) > 0 });
            for (let symbctn of symbctns) {
                if (!(symbctn.id in resMem) && !alreadyWorkingIds.includes(symbctn.id)) { // if resource not logged
                    resMem[symbctn.id] = {};
                    resMem[symbctn.id].resType = 'c';
                    resMem[symbctn.id].resAmount = _.sum(symbctn.store);
                    resMem[symbctn.id].resIfE = 0;
                    resMem[symbctn.id].takenCareOf = false;
                }
                else { // update amount
                    resMem[symbctn.id].resAmount = _.sum(symbctn.store);
                }
            }

            // dropped non energy
            let droppeds = room.find(FIND_DROPPED_RESOURCES);
            for (dropped of droppeds) {
                if (!(dropped.id in resMem) && !alreadyWorkingIds.includes(dropped.id)) { // if resource not logged
                    resMem[dropped.id] = {};
                    resMem[dropped.id].resType = 'd';
                    resMem[dropped.id].resAmount = dropped.amount;
                    if (dropped.resourceType !== 'energy') {
                        resMem[dropped.id].resIfE = 0;
                        resMem[dropped.id].takenCareOf = false;
                    }
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
                else { // update amount
                    resMem[container.id].resAmount = _.sum(container.store);
                }
            }

            // dropped energy
            for (dropped of droppeds) {
                if (!(dropped.id in resMem) && !alreadyWorkingIds.includes(dropped.id)) { // if resource not logged
                    resMem[dropped.id] = {};
                    resMem[dropped.id].resType = 'd';
                    resMem[dropped.id].resAmount = dropped.amount;
                    if (dropped.resourceType == 'energy') {
                        resMem[dropped.id].resIfE = 1;
                        resMem[dropped.id].takenCareOf = false;
                    }
                }
                else if (Game.time % 50 == 0 && dropped.id in resMem) {
                    resMem[dropped.id].resAmount = dropped.amount;
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

global.checkIfMiddleRoom = function (roomName) {
    let roomNameDecomposed = decomposeRoomNameIntoFourParts(roomName);
    if (roomNameDecomposed[1] % 5 == 0 && roomNameDecomposed[3] % 5 == 0) {
        return true
    }
    else {
        return false
    }
}


/******************************************************************/

global.earlyAndLateRemoteMiningManager = function (roomName) {
    let r = Game.rooms[roomName];
    if (r == undefined) {
        fo(roomName + ' ?')
    }
    else {
        if (r.storage != undefined) {
            remoteMiningManager(r);
        }
        else {
            earlyStageLongDistanceRemoteMiningManager(roomName);
        }
    }
}

global.earlyStageLongDistanceRemoteMiningManager = function (roomName) {
    let room = Game.rooms[roomName];
    let r = room;
    if (room.memory.earlyHarv == undefined) {
        room.memory.earlyHarv = {}
    }
    if (!Memory.mapInfo) {
        Memory.mapInfo = {}
    }

    if (!room.memory.readyToRemoteMining) { r.memory.readyToRemoteMining = searchForAdjacentConnectedRoomnames(r); }

    for (let candidate in r.memory.readyToRemoteMining) {
        if (room.memory.earlyHarv[candidate] == undefined) {
            room.memory.earlyHarv[candidate] = 0;
            return
        }
        else { // send scout to register
            if (!Memory.mapInfo[candidate]) {
                if (Game.rooms[candidate]) {
                    if (Game.rooms[candidate]) {
                        logGrandeRoomInfo(Game.rooms[candidate]);
                    }
                }
                else { // spawn a scouter
                    console.log(roomName + ' added scouter ' + candidate)
                    r.memory.forSpawning.spawningQueue.push({ memory: { role: 'scouter', target: candidate }, priority: 0.01 });
                }
            }
            else { // analyze if room is suitable for remote mining
                if (determineIfRoomIsSuitableForRemoteMining(r, candidate) == false) {
                    room.memory.readyToRemoteMining[candidate] = undefined;
                    room.memory.earlyHarv[candidate] = undefinedl
                }
                else {
                    room.memory.earlyHarv[candidate] = 2 * Object.keys(Memory.mapInfo[candidate].eRes).length;
                }
            }
        }
    }

    if (true) {
        // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< switch of reremote early mining
    }
    else {
        for (let candidate in r.memory.readyToRemoteMining) {
            let cr = Game.rooms[candidate];

            // if candiate not defined, send scout
            if (cr == undefined) {
                console.log(roomName + ' added scouter ' + candidate)
                r.memory.forSpawning.spawningQueue.push({ memory: { role: 'scouter', target: candidate }, priority: 0.01 });
            }
            else { // else // have vision
                // find cacandi name that is not main
                let cacandis = searchForAdjacentConnectedRoomnames(cr); // {rn: dir}
                for (let cacandi in cacandis) {
                    if (true) {
                        //<<<<<<<<<<<<<<<<<<<<<<<<<< new logic to stop sending scouts
                    }
                    else {
                        if (cacandi !== r.name) { // if not main room
                            // delete room from early stage minig earlyStageLongDistanceHarvesterInitiate
                            if (r.memory.earlyHarv && room.memory.earlyHarv[cacandi]) {
                                delete room.memory.earlyHarv[cacandi];
                            }
                            let ccr = Game.rooms[cacandi];
                            if (ccr == undefined) {
                                if (Game.creeps[cacandi] == undefined) {
                                    // if no vision send scout
                                    console.log(roomName + ' added scouter ' + cacandi)
                                    r.memory.forSpawning.spawningQueue.push({ memory: { role: 'scouter', target: cacandi }, priority: 0.01 });
                                }
                            }
                            else { // have vision
                                // log grand map info
                                logGrandeRoomInfo(Game.rooms[cacandi]);
                                if (Memory.mapInfo[cacandi]) {
                                    // analyze if room is suitable for remote mining
                                    determineIfRoomIsSuitableForRemoteMining(r, cacandi);
                                    if (room.memory.earlyHarv) {
                                        room.memory.earlyHarv[cacandi] = 2 * Object.keys(Memory.mapInfo[cacandi].eRes).length;
                                    }
                                    else {
                                        room.memory.earlyHarv = {};
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

global.remoteMiningManager = function (r, execute = false) {
    if (!execute) {
        return
    }
    else {
        itsReadyToStartRemoteMining(r)
        if (r.memory.readyToRemoteMining) {
            let reremoteMiningchecker = false;
            for (let candidate in r.memory.readyToRemoteMining) {
                if (!r.memory.remoteMiningRoomNames) {
                    r.memory.remoteMiningRoomNames = {}
                    return
                }
                if (!r.memory.remoteMiningRoomNames[candidate]) {
                    r.memory.remoteMiningRoomNames[candidate] = { finishedAllInfanstructures: false };
                }
                else {
                    if (!r.memory.remoteMiningRoomNames[candidate].subRoomRoadReady && (Memory.mapInfo[candidate].managedBy == undefined || Memory.mapInfo[candidate].managedBy == r.name)) {
                        // send scout to register
                        if (!Memory.mapInfo[candidate]) {
                            if (Game.rooms[candidate]) {
                                if (Game.rooms[candidate]) {
                                    logGrandeRoomInfo(Game.rooms[candidate]);
                                    Memory.mapInfo[candidate].managedBy = r.name;
                                }
                            }
                            else { // spawn a scouter
                                console.log(r.name + ' added scouter ' + candidate)
                                r.memory.forSpawning.spawningQueue.push({ memory: { role: 'scouter', target: candidate }, priority: 0.01 });
                            }
                        }
                        else { // analyze if room is suitable for remote mining
                            // remove early mining info
                            if (r.memory.earlyHarv && r.memory.earlyHarv[candidate] && r.memory.earlyHarv[candidate] > 0) {
                                r.memory.earlyHarv[candidate] = 0;
                            }
                            determineIfRoomIsSuitableForRemoteMining(r, candidate);

                            if (buildRoadInMainRoomForRemoteMining(r, candidate, r.memory.readyToRemoteMining[candidate])) {
                                return
                            }
                            if (r.memory.remoteMiningRoomNames[candidate] && r.memory.remoteMiningRoomNames[candidate].mainRoomRoadReady == true) {
                                startRemoteMinigTeezing(r);
                                buildContainerInRemoteMiningRoom(r, candidate, r.memory.readyToRemoteMining[candidate]);
                            }
                        }
                    }
                    else {
                        // check container if there
                        let cr = Game.rooms[candidate];
                        if (cr) {
                            if (findTotolNumberOfStructure(cr, STRUCTURE_CONTAINER) < Object.keys(Memory.mapInfo[candidate].eRes).length) {
                                fo('recovering remote room ' + candidate);
                                r.memory.remoteMiningRoomNames[candidate].subRoomRoadReady = false;
                            }
                        }
                    }
                }
                if (r.memory.remoteMiningRoomNames[candidate]) {
                    reremoteMiningchecker = true && r.memory.remoteMiningRoomNames[candidate].subRoomRoadReady;
                }
            }

            // reremote mining
            if (reremoteMiningchecker) {
                for (let candidate in r.memory.readyToRemoteMining) {
                    reremoteMining(r, candidate);
                }
            }
        }
        else {

        }
    }
}

global.reremoteMining = function (r, candidate) {
    let cr = Game.rooms[candidate];

    // if candiate not defined, send scout
    if (cr == undefined) {
        console.log(r.name + ' added scouter ' + candidate)
        r.memory.forSpawning.spawningQueue.push({ memory: { role: 'scouter', target: candidate }, priority: 0.01 });
    }
    else { // else // have vision
        // find cacandi name that is not main
        let cacandis = searchForAdjacentConnectedRoomnames(cr); // {rn: dir}
        for (let cacandi in cacandis) {
            if (cacandi !== r.name) { // if not main room
                let ccr = Game.rooms[cacandi];
                if (ccr == undefined) {
                    if (Game.creeps[cacandi] == undefined) {
                        // if no vision send scout
                        console.log(r.name + ' added scouter ' + cacandi)
                        r.memory.forSpawning.spawningQueue.push({ memory: { role: 'scouter', target: cacandi }, priority: 0.01 });
                    }
                }
                else { // have vision
                    if (r.memory.reremoteMiningRoomNames == undefined) {
                        r.memory.reremoteMiningRoomNames = {};
                    }
                    if (r.memory.reremoteMiningRoomNamesBuilt && r.memory.reremoteMiningRoomNamesBuilt[cacandi] == true) {
                        // check if need to rebuild
                        // check container if there
                        if (Game.time % 1777 == 0) {
                            if (ccr) {
                                if ((Object.keys(Memory.mapInfo[cacandi].eRes).length > 0 && Object.keys(Memory.mapInfo[cacandi].eRes).length < 3) && findTotolNumberOfStructure(ccr, STRUCTURE_CONTAINER) < Object.keys(Memory.mapInfo[cacandi].eRes).length) {
                                    fo('recovering reremote room ' + cacandi);
                                    r.memory.reremoteMiningRoomNamesBuilt[cacandi].subRoomRoadReady = false;
                                }
                            }
                        }
                    }
                    else { // rebuild infanstructure
                        // log grand map info
                        logGrandeRoomInfo(Game.rooms[cacandi]);
                        let eResNum = determineIfRoomIsSuitableForReremoteMining(r, cacandi);
                        if (Memory.mapInfo[cacandi].managedBy == undefined || Memory.mapInfo[cacandi].managedBy == r.name) {
                            Memory.mapInfo[cacandi].managedBy = r.name;
                            if (eResNum == 2) { // is a 2 sources reremote room, we take it regardless
                                // get access point from main to sub and sub to subsub
                                let anch = undefined;
                                if (r.memory.anchor) {
                                    anch = r.memory.anchor;
                                }
                                else if (r.memory.newAnchor) {
                                    anch = r.memory.newAnchor;
                                }
                                let ret = funcB.findPathBasedOnGridEvenOdd(anch, generateLineBasedOnDir(r.name, r.memory.readyToRemoteMining[candidate]));
                                let lastPosi = ret.path.pop();
                                let [x, y] = convertPosiIntoNextRoomPosi(lastPosi.x, lastPosi.y);
                                let newStartPoint = new RoomPosition(x, y, candidate);

                                if (planRoadRAtoRB(newStartPoint, cacandi, cacandis[cacandi])) {
                                    let ret2 = funcB.findPathBasedOnGridEvenOdd(newStartPoint, generateLineBasedOnDir(cr.name, cacandis[cacandi]));
                                    let lastPosi2 = ret2.path.pop();
                                    let [x2, y2] = convertPosiIntoNextRoomPosi(lastPosi2.x, lastPosi2.y);
                                    let newStartPoint2 = new RoomPosition(x2, y2, cacandi);
                                    let completed = buildContainerInReremoteMiningRoom(cr, cacandi, cacandis[cacandi], newStartPoint2);
                                    if (completed) {
                                        r.memory.reremoteMiningRoomNames[cacandi] = cacandis[cacandi];
                                        if (Game.rooms[cacandi].memory.byPass == undefined) {
                                            Game.rooms[cacandi].memory.byPass = [];
                                            Game.rooms[cacandi].memory.byPass.push(candidate);
                                        }
                                        else {
                                            if (Game.rooms[cacandi].memory.byPass.includes(candidate)) {
                                                // pass
                                            }
                                            else {
                                                Game.rooms[cacandi].memory.byPass.push(candidate);
                                            }
                                        }
                                        // set build flag to true
                                        if (r.memory.reremoteMiningRoomNamesBuilt == undefined) {
                                            r.memory.reremoteMiningRoomNamesBuilt = {};
                                        }
                                        else {
                                            r.memory.reremoteMiningRoomNamesBuilt[cacandi] = true;
                                        }
                                    }
                                }
                            }
                            else if (r.storage && eResNum == 1) { // if it is a 1 source room, we evaluate it by path length
                                // get access point from main to sub and sub to subsub
                                let anch = undefined;
                                if (r.memory.anchor) {
                                    anch = r.memory.anchor;
                                }
                                else if (r.memory.newAnchor) {
                                    anch = r.memory.newAnchor;
                                }

                                // get remote room path length
                                let ret = funcB.findPathBasedOnGridEvenOdd(anch, generateLineBasedOnDir(r.name, r.memory.readyToRemoteMining[candidate]));
                                let lastPosi = ret.path.pop(); // main room exit
                                let [x, y] = convertPosiIntoNextRoomPosi(lastPosi.x, lastPosi.y); // remote room start
                                let newStartPoint = new RoomPosition(x, y, candidate);
                                let p1 = ret.path.length;
                                // get reremote room path length
                                let ret2 = funcB.findPathBasedOnGridEvenOdd(newStartPoint, generateLineBasedOnDir(cr.name, cacandis[cacandi]));
                                let lastPosi2 = ret2.path.pop(); // remote room exit
                                let [x2, y2] = convertPosiIntoNextRoomPosi(lastPosi2.x, lastPosi2.y); // reremot room start
                                let newStartPoint2 = new RoomPosition(x2, y2, cacandi);
                                let p2 = 0;
                                for (let eResId in Memory.mapInfo[cacandi].eRes) {
                                    let containerInfo = Memory.mapInfo[cacandi].eRes[eResId].easyContainerPosi;
                                    let reto = funcB.findPathBasedOnGridEvenOdd(newStartPoint2, new RoomPosition(containerInfo.x, containerInfo.y, cacandi));
                                    p2 = reto.path.length
                                };
                                // if length<30 we proceed, else give up
                                if (p2 <= 13) { // hardcoded to prevent MvsR going further is season 2
                                    if (planRoadRAtoRB(newStartPoint, cacandi, cacandis[cacandi])) { // remote room start to exit
                                        let ret2 = funcB.findPathBasedOnGridEvenOdd(newStartPoint, generateLineBasedOnDir(cr.name, cacandis[cacandi]));
                                        let lastPosi2 = ret2.path.pop(); // remote room exit
                                        let [x2, y2] = convertPosiIntoNextRoomPosi(lastPosi2.x, lastPosi2.y); // reremot room start
                                        let newStartPoint2 = new RoomPosition(x2, y2, cacandi);
                                        let completed = buildContainerInReremoteMiningRoom(cr, cacandi, cacandis[cacandi], newStartPoint2); // reremote room road
                                        if (completed) {
                                            r.memory.reremoteMiningRoomNames[cacandi] = cacandis[cacandi];
                                            if (Game.rooms[cacandi].memory.byPass == undefined) {
                                                Game.rooms[cacandi].memory.byPass = [];
                                                Game.rooms[cacandi].memory.byPass.push(candidate);
                                            }

                                            if (Game.rooms[cacandi].memory.byPass.includes(candidate)) {
                                                // pass
                                            }
                                            else {
                                                Game.rooms[cacandi].memory.byPass.push(candidate);
                                            }

                                            // set build flag to true
                                            if (r.memory.reremoteMiningRoomNamesBuilt == undefined) {
                                                r.memory.reremoteMiningRoomNamesBuilt = {};
                                            }
                                            else {
                                                r.memory.reremoteMiningRoomNamesBuilt[cacandi] = true;
                                            }
                                        }
                                    }
                                }
                                else { // road too long, we give up
                                    if (r.memory.reremoteMiningRoomNames) {
                                        r.memory.reremoteMiningRoomNames[cacandi] = undefined;
                                    }
                                    else {
                                        r.memory.reremoteMiningRoomNames = {};
                                    }
                                    if (r.memory.earlyHarv) {
                                        r.memory.earlyHarv[cacandi] = undefined;
                                    }
                                }
                            }
                            else { // not suitable for reremote mining

                            }
                        }
                    }
                }
            }
        }
    }
}

global.startRemoteMinigTeezing = function (r) {
    if (true) { // main room not fucked
        r.memory['startRemoteMining'] = 1;
    }
    else {
        r.memory['startRemoteMining'] = 0;
    }
}

global.itsReadyToStartRemoteMining = function (r) {
    if (r.memory.readyToRemoteMining == undefined || Object.keys(r.memory.readyToRemoteMining).length == 0) {
        r.memory.readyToRemoteMining = searchForAdjacentConnectedRoomnames(r);
    }
}

global.returnRoomnameByDirectionNum = function (roomName, dirInd) {
    let dx;
    let dy;
    let roomNameSeparated = roomName.match(/[a-zA-Z]+|[0-9]+/g);

    if (dirInd == 1) {
        dx = 0;
        dy = -1;
    }
    else if (dirInd == 3) {
        dx = 1;
        dy = 0;
    }
    else if (dirInd == 5) {
        dx = 0;
        dy = 1;
    }
    else if (dirInd == 7) {
        dx = -1;
        dy = 0;
    }

    return roomNameSeparated[0] + '' + (parseInt(eval(roomNameSeparated[1]) + eval(dx))) + roomNameSeparated[2] + '' + (parseInt(eval(roomNameSeparated[3]) + eval(dy)))
}

global.searchForAdjacentConnectedRoomnames = function (r, neib = false) {
    let connectedDirections = new Set();
    let candidates = calculateNeighbourNames(r.name)
    for (let candidate of candidates) {
        let exitNum = r.findExitTo(candidate)
        if (exitNum > 0) {
            connectedDirections.add(exitNum);
        }
    }
    connectedDirections = Array.from(connectedDirections);
    let connectedRoomInfoObj = {}
    for (let ind in connectedDirections) {
        let connectedRoomName = returnRoomnameByDirectionNum(r.name, connectedDirections[ind]);
        if (neib) {
            connectedRoomInfoObj[connectedRoomName] = -1;
        }
        else {
            connectedRoomInfoObj[connectedRoomName] = connectedDirections[ind];
        }
    }
    return connectedRoomInfoObj
}

global.determineIfRoomIsSuitableForRemoteMining = function (r, candidate) {
    // if 4, middle room, other ppl's room, remove
    let candider = Game.rooms[candidate];
    if (candider && candider.controller && candider.controller.owner) {
        r.memory.readyToRemoteMining[candidate] = undefined;
        return false
    }
    let numERes = Object.keys(Memory.mapInfo[candidate].eRes).length;
    if (numERes > 2 || numERes == 0) {
        r.memory.readyToRemoteMining[candidate] = undefined;
        if (r.memory.remoteMiningRoomNames) {
            r.memory.remoteMiningRoomNames[candidate] = undefined;
        }
        if (r.memory.earlyHarv) {
            r.memory.earlyHarv[candidate] = 0;
        }
        return false
    }
    else { // 1 or 2
        // let's just take the room regardless, will fix the valuation of resource quality later
        return true
    }
}

global.determineIfRoomIsSuitableForReremoteMining = function (r, cacandi) {
    // if 4, middle room, other ppl's room, remove
    let candider = Game.rooms[cacandi];

    if (candider) {
        if ((candider.controller == undefined) || ((candider.controller && candider.controller.reservation && candider.controller.reservation.username != 'PythonBeatJava') || (candider.controller && candider.controller.owner && candider.controller.owner.username != 'PythonBeatJava'))) {
            r.memory.reremoteMiningRoomNames[cacandi] = undefined;
            return -1
        }

        let numERes = Object.keys(Memory.mapInfo[cacandi].eRes).length;
        if (numERes > 2 || numERes == 0) {
            if (r.memory.reremoteMiningRoomNames) {
                r.memory.reremoteMiningRoomNames[cacandi] = undefined;
            }
            else {
                r.memory.reremoteMiningRoomNames = {};
            }
            if (r.memory.earlyHarv) {
                r.memory.earlyHarv[cacandi] = undefined;
            }
            if (r.memory.forSpawning.roomCreepNo.minCreeps && r.memory.forSpawning.roomCreepNo.minCreeps.minNoRemoteLorries && r.memory.forSpawning.roomCreepNo.minCreeps.minNoRemoteLorries.cacandi) {
                r.memory.forSpawning.roomCreepNo.minCreeps.minNoRemoteLorries.cacandi = undefined;
            }
            return -1
        }
        else { // 1 or 2
            // let's just take the room regardless, will fix the valuation of resource quality later
            return numERes
        }
    }
    else {
        return -1
    }
}

global.buildRoadInMainRoomForRemoteMining = function (r, candidate, dir) {
    if (!(r.memory.remoteMiningRoomNames[candidate] && r.memory.remoteMiningRoomNames[candidate].mainRoomRoadReady)) {
        if (r.memory.remoteMiningRoomNames[candidate]) {
            r.memory.remoteMiningRoomNames[candidate].mainRoomRoadReady = false;
            planRoadLocally(r, candidate, dir)
            return true
        }
    }
    else {
        return false
    }
}

global.planRoadLocally = function (r, candidate, dir) {
    let spawn = r.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_SPAWN } })[0];
    let ret = funcB.findPathBasedOnGridEvenOddAndBankerBlockage(r, generateLineBasedOnDir(r.name, dir));
    let path = ret.path;

    if (ret.incomplete == false) {

        let posisToCach = r.memory.cachedRoad;

        // place site
        for (let posiToCach of path) {
            let placeSiteAction = r.createConstructionSite(posiToCach.x, posiToCach.y, STRUCTURE_ROAD);
            if (placeSiteAction == OK) {
                //posisToCach.concat(posiToCach)
            }
            else if (placeSiteAction == ERR_FULL) {
                r.memory.remoteMiningRoomNames[candidate].mainRoomRoadReady = false;
                return
            }
        }
        r.memory.remoteMiningRoomNames[candidate].mainRoomRoadReady = true;

        //fo(r.storage.pos)
        //fo(convertToEO(r.storage.pos))
        //funcB.visualizePath(r.storage.pos, generateLineBasedOnDir(r.name, dir), 1, false);
    }
}

global.planRoadRAtoRB = function (pos1, candidate, dir) {
    let r = Game.rooms[pos1.roomName];
    let ret = funcB.findPathBasedOnGridEvenOdd(pos1, generateLineBasedOnDir(r.name, dir));
    let path = ret.path;

    if (ret.incomplete == false) {

        // place site
        for (let posiToCach of path) {
            let placeSiteAction = r.createConstructionSite(posiToCach.x, posiToCach.y, STRUCTURE_ROAD);
            if (placeSiteAction == OK || placeSiteAction == ERR_INVALID_TARGET) {
                //posisToCach.concat(posiToCach)
            }
            else if (placeSiteAction == ERR_FULL) {
                return false;
            }
        }
        return true;
    }
}

global.convertToEO = function (posi) {
    let terrain = Game.map.getRoomTerrain(posi.roomName);
    let ds = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    for (let d in ds) {
        let dd = ds[d];
        let newx = posi.x + dd[0];
        let newy = posi.y + dd[1];
        if (!(terrain.get(newx, newy) == TERRAIN_MASK_WALL)) {
            return new RoomPosition(newx, newy, posi.roomName)
        }
    }
}

global.generateLineBasedOnDir = function (rName, dir) {
    let exits = [];
    let terrain = Game.map.getRoomTerrain(rName);
    if (dir == TOP) {
        for (let i = 0; i < 50; i++) {
            if (!terrain.get(i, 0) == TERRAIN_MASK_WALL) {
                exits.push(new RoomPosition(i, 0, rName));
            }
        }
    }
    else if (dir == BOTTOM) {
        for (let i = 0; i < 50; i++) {
            if (!terrain.get(i, 49) == TERRAIN_MASK_WALL) {
                exits.push(new RoomPosition(i, 49, rName));
            }
        }
    }
    else if (dir == LEFT) {
        for (let i = 0; i < 50; i++) {
            if (!terrain.get(0, i) == TERRAIN_MASK_WALL) {
                exits.push(new RoomPosition(0, i, rName));
            }
        }
    }
    else {
        for (let i = 0; i < 50; i++) {
            if (!terrain.get(49, i, 0) == TERRAIN_MASK_WALL) {
                exits.push(new RoomPosition(49, i, rName));
            }
        }
    }
    return exits
}

global.convertPosiIntoNextRoomPosi = function (x, y) {
    if (x == 1) {
        x = 49;
    }
    else if (x == 48) {
        x = 0;
    }
    else if (y == 1) {
        y = 49;
    }
    else if (y == 48) {
        y = 0;
    }
    return [x, y]
}

global.buildContainerInRemoteMiningRoom = function (r, candidate, dir) {
    let red = Game.rooms[candidate];
    if (red) { //red && red.controller && red.controller.reservation &&   // .controller.reservation.username == r.controller.owner)
        let allReadyCount = 0;
        let numReady = 0;
        for (let eResId in Memory.mapInfo[candidate].eRes) {
            allReadyCount += 1;
            let containerInfo = Memory.mapInfo[candidate].eRes[eResId].easyContainerPosi;
            let conti = red.lookForAt(LOOK_STRUCTURES, containerInfo.x, containerInfo.y);
            let contiCs = red.lookForAt(LOOK_CONSTRUCTION_SITES, containerInfo.x, containerInfo.y);

            if ((conti.length + contiCs.length) !== 1) {
                red.createConstructionSite(containerInfo.x, containerInfo.y, STRUCTURE_CONTAINER);
            }
            else {
                numReady += 1;
            }
        }

        if (allReadyCount == numReady) {
            let roadPlanned = true;
            if (!r.memory.remoteMiningRoomNames[candidate].subRoomRoadReady) {
                for (let eResId in Memory.mapInfo[candidate].eRes) {
                    let containerInfo = Memory.mapInfo[candidate].eRes[eResId].easyContainerPosi;
                    let ret;
                    if (r.memory.anchor) {
                        ret = funcB.findPathBasedOnGridEvenOdd(r.memory.anchor, generateLineBasedOnDir(r.name, dir));
                    }
                    else {
                        ret = funcB.findPathBasedOnGridEvenOdd(r.memory.newAnchor, generateLineBasedOnDir(r.name, dir));
                    }
                    let lastPosi = ret.path.pop();
                    let xy = convertPosiIntoNextRoomPosi(lastPosi.x, lastPosi.y);
                    let x = xy[0];
                    let y = xy[1];
                    let newStartPoint = new RoomPosition(x, y, candidate);
                    //fo(newStartPoint)
                    //fo(new RoomPosition(containerInfo.x, containerInfo.y, candidate))
                    if (planRoadRemotely(r, candidate, newStartPoint, containerInfo)) {
                    }
                    else {
                        roadPlanned = false
                    }
                }
            }
            if (roadPlanned) {
                r.memory.remoteMiningRoomNames[candidate].subRoomRoadReady = true;
            }
        }
    }
}

global.buildContainerInReremoteMiningRoom = function (r, candidate, dir, startPos) {
    let red = Game.rooms[candidate];
    if (red) { //red && red.controller && red.controller.reservation &&   // .controller.reservation.username == r.controller.owner)
        let allReadyCount = 0;
        let numReady = 0;
        for (let eResId in Memory.mapInfo[candidate].eRes) {
            allReadyCount += 1;
            let containerInfo = Memory.mapInfo[candidate].eRes[eResId].easyContainerPosi;
            let conti = red.lookForAt(LOOK_STRUCTURES, containerInfo.x, containerInfo.y);
            let contiCs = red.lookForAt(LOOK_CONSTRUCTION_SITES, containerInfo.x, containerInfo.y);

            if ((conti.length + contiCs.length) !== 1) {
                red.createConstructionSite(containerInfo.x, containerInfo.y, STRUCTURE_CONTAINER);
            }
            else {
                numReady += 1;
            }
        }

        if (allReadyCount == numReady) {
            let roadPlanned = false;
            for (let eResId in Memory.mapInfo[candidate].eRes) {
                let containerInfo = Memory.mapInfo[candidate].eRes[eResId].easyContainerPosi;
                let reto = funcB.findPathBasedOnGridEvenOdd(startPos, new RoomPosition(containerInfo.x, containerInfo.y, candidate));
                if (reto.incomplete == false) {
                    funcB.visualizePath(startPos, new RoomPosition(containerInfo.x, containerInfo.y, candidate));
                    let pasto = reto.path.reverse();
                    let checkRoadPlaced = true;
                    for (let posiToCach of pasto) {
                        let placeSiteAction = Game.rooms[candidate].createConstructionSite(posiToCach.x, posiToCach.y, STRUCTURE_ROAD);

                        if (placeSiteAction == OK || placeSiteAction == ERR_INVALID_TARGET) {
                            //posisToCach.concat(posiToCach)
                        }
                        else if (placeSiteAction == ERR_FULL) {
                            return false
                        }
                    }
                }
            }
        }
    }
    return true
}

global.planRoadRemotely = function (r, candidate, newStartPoint, containerInfo) {
    let reto = funcB.findPathBasedOnGridEvenOdd(newStartPoint, new RoomPosition(containerInfo.x, containerInfo.y, candidate));
    if (reto.incomplete == false) {
        funcB.visualizePath(newStartPoint, new RoomPosition(containerInfo.x, containerInfo.y, candidate));
        let pasto = reto.path.reverse();
        let checkRoadPlaced = true;
        for (let posiToCach of pasto) {
            let placeSiteAction = Game.rooms[candidate].createConstructionSite(posiToCach.x, posiToCach.y, STRUCTURE_ROAD);
            /*let lookedObj = Game.rooms[candidate].lookAt(posiToCach.x, posiToCach.y);
            let ifPlaced = lookedObj.forEach(function (lookObject) {
                fo(lookObject.type == LOOK_STRUCTURES)
                if (lookObject.type && lookObject.type == LOOK_STRUCTURES) {
                    return true
                }
            });
    
            fo(ifPlaced)*/

            if (placeSiteAction == OK || placeSiteAction == -7) {
                //posisToCach.concat(posiToCach)
            }
            else if (placeSiteAction == ERR_FULL) {
                r.memory.remoteMiningRoomNames[candidate].subRoomRoadReady = false;
                checkRoadPlaced = false
                //return
            }
        }

        if (checkRoadPlaced) {
            return true
        }
        else {
            return false
        }
        //r.memory.remoteMiningRoomNames[candidate].subRoomRoadReady = true;
    }
}