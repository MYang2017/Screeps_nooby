// Game.rooms[].memory.forSpawning.spawningQueue.push({memory:{role: 'superUpgrader'},priority: 5.1});

var rolePriority = {
    harvester : 14,
    miner : 11,
    lorry : 12,
    upgrader : 1,
    builder : 2,
    repairer : 7,
    wallRepairer : 1,
    longDistanceHarvester : 1,
    longDistanceLorry : 9,
    longDistanceBuilder : 11,
    reserver : 6,
    claimer : 1,
    pickuper : 10,
    attacker : 1,
    scouter : 0.01,
    teezer : 1,
    rampartRepairer : 1,
    begger : 1,
    longDistanceUpgrader : 1,
    controllerAttacker : 1,
    dismantler: 1,
    linkKeeper: 13,
    traveller: 1,
    transporter: 1,
    pioneer: 1,
    melee: 1,
    stealer: 1,
    ranger: 13,
    powerSourceAttacker: 1,
    powerSourceHealer: 1,
    powerSourceLorry: 1,
    labber: 0.5,
    superUpgrader: 0.8,
    keeperLairMeleeKeeper: 9,
    keeperLairInvaderAttacker: 9.1,
    keeperLairInvaderHealer: 9.2,
    keeperLairLorry: 8,
    ultimateUpgrader: 1,
    oneWayInterSharder: 1.1,
    transporter: 0.1,
    scientist: 0.2,
    wanker: 7,
    shooter: 0.1,
    onlyMineralDefender: 0.9,
    onlyMineralMiner: 0.8,
    onlyMineralHauler: 0.7,
};

var listOfRoles = [
    'harvester',
    'miner',
    'lorry',
    'pickuper',
    'builder',
    'upgrader',
    'linkKeeper',
    'repairer',
    'wallRepairer',
    'longDistanceHarvester',
    'longDistanceLorry',
    'longDistanceBuilder',
    'reserver',
    'claimer',
    'attacker',
    'scouter',
    'teezer',
    //'rampartRepairer',
    'begger',
    'labber',
    'superUpgrader',
    'ultimateUpgrader',
    'transporter',
    'scientist',
    'wanker',
    'shooter',
    'onlyMineralDefender',
    'onlyMineralMiner',
    'onlyMineralHauler',
    ];

Room.prototype.updateSpawnQueue = function() {
    let room = this;
    let currentRCL = room.controller.level;
    let creepsInRoom = updateCreepsInRoomWithSpawningByRoom(room);
    let roomSpawningInfo = room.memory.forSpawning.roomCreepNo;

    if (room.memory.forSpawning == undefined) {
      room.memory.forSpawning = {}
    }
    if (room.memory.forSpawning.spawningQueue == undefined) {
      room.memory.forSpawning.spawningQueue = [];
    }
    if (room.memory.forSpawning.roomCreepNo == undefined) {
        room.memory.forSpawning.roomCreepNo = {};
        room.memory.forSpawning.roomCreepNo.minCreeps = {};
        room.memory.forSpawning.roomCreepNo.creepEnergy = {};
        initiateCreepsSpawnInfo(this.name);
    }
    let spawningQueue = room.memory.forSpawning.spawningQueue;

    let imaginaryCreepsInRoom = creepsInRoom.concat(spawningQueue); // combine real creeps in room with creeps in spawning queue

    let NoOfCreeps = {};

    for (let role of listOfRoles) { // calculate number of creeps in current spawn room
        NoOfCreeps[role] = _.sum(imaginaryCreepsInRoom, (c) => c.memory.role == role && (c.ticksToLive==undefined||c.memory.spawnTime<c.ticksToLive));
    }

    let maxEnergy = room.energyCapacityAvailable;

    let fuckness = determineIfFucked(room)[0];

    if (true) { //(fuckness<1) { // fuckness, 18 equivilient to about 6 HEAL parts or 8 RANGED_ATTACK parts or 18 attack parts
        // AI in the current spawn's remote mining neighbours /////////////////////////////////////////////////////////////////////////////////////
        // back up code if wiped, from energy taking creeps first: miners, lorries, harvesters
        //towerRepairInPeace(room);
        if ((creepsInRoom.length < 3) && (room.energyAvailable < 550) && (_.sum(imaginaryCreepsInRoom, (c) => (c.memory.role == 'harvester') || (c.memory.role == 'pioneer')) < 1 ) && (_.sum(imaginaryCreepsInRoom, (c) => c.memory.role == 'lorry') == 0) ) { // if no harvester or lorries in current spawn room, recovering phase
            if ( _.some(creepsInRoom, c => c.memory.role == 'miner' || c.memory.role == 'pickuper') ) {
                //if (NoOfCreeps['miner'] > 0) {
                console.log(this.name+' added rescue lorry')
                spawningQueue.push({memory:{energy: 200, role: 'lorry', target: this.name},priority: 15});
            }
            else { // if no miner and no lorries, start with harvesters
                console.log(this.name+' added rescue harvester')
                spawningQueue.push({memory:{energy: 200, role: 'harvester'},priority: 16});
            }
        }
        else {
            if (room.energyCapacityAvailable >= 550) { // if there is energy to spawn miner
                // everything works usual, with miners
                // spawn miners as highest priority
                let sources = room.find(FIND_SOURCES);
                if (!Game.rooms[room.name].memory.sourceTravelTime) { // if time takes to travel is undefined
                    // define sourceTravelTime
                    Game.rooms[room.name].memory.sourceTravelTime = {}
                    // calculate time for miner to travel to source
                    for (let source of sources) {
                        Game.rooms[room.name].memory.sourceTravelTime[source.id] = 3.14 * calculateTicksBetweenObjects(room.find(FIND_MY_STRUCTURES, { filter: s => s.structureType == STRUCTURE_SPAWN })[0],source);
                    }
                }
                else { // source travel time is defined, spwan miners
                    for (let source of sources) {
                        if (!_.some(imaginaryCreepsInRoom, c => c.memory.role == 'miner'
                            && c.memory.sourceID == source.id
                            && (c.ticksToLive > (3 * 6 + Game.rooms[room.name].memory.sourceTravelTime[source.id]) || c.ticksToLive == undefined)
                            ))
                        { // if there is no miner going to THE source, and life is long enough for the next one to take place or live length is undefined (being spawned)
                            let sourceLink = source.pos.findInRange(FIND_STRUCTURES, 2, { filter: s => s.structureType == STRUCTURE_LINK }); // find a link and determine if it is link or container mining
                            let containers = source.pos.findInRange(FIND_STRUCTURES, 1, { filter: s => s.structureType == STRUCTURE_CONTAINER });
                            if (sourceLink.length > 0) {
                                //console.log('need to spawn '+source.id+' in room '+room.name+' in advance');
                                console.log(this.name + ' added miner ' + source.id)
                                spawningQueue.push({ memory: { role: 'miner', sourceID: source.id, target: undefined, currentRCL: currentRCL, ifMineEnergy: true, ifLink: true, ifKeeper: false }, priority: rolePriority['miner'] });
                            }
                            else {
                                //console.log('need to spawn '+source.id+' in room '+room.name+' in advance');
                                console.log(this.name + ' added miner ' + source.id)
                                spawningQueue.push({ memory: { role: 'miner', sourceID: source.id, target: undefined, currentRCL: currentRCL, ifMineEnergy: true, ifLink: false, ifKeeper: false }, priority: rolePriority['miner'] });
                            }
                        }
                    }
                    let mineral = room.find(FIND_MINERALS)[0]; // find mineral deposite
                    let extractor = room.find(FIND_MY_STRUCTURES, { filter: c => c.structureType == STRUCTURE_EXTRACTOR })[0]; // find extractor already built
                    if (extractor != undefined && extractor.isActive() && mineral.mineralAmount > 0) {
                        if (!_.some(imaginaryCreepsInRoom, c => c.memory.role == 'miner' && c.memory.sourceID == mineral.id)) {
                            let mineralContainer = mineral.pos.findInRange(FIND_STRUCTURES, 1, { filter: s => s.structureType == STRUCTURE_CONTAINER });
                            if (mineralContainer.length > 0) {
                                console.log(this.name + ' added mineral miner')
                                spawningQueue.push({ memory: { role: 'miner', sourceID: mineral.id, target: undefined, currentRCL: currentRCL, ifMineEnergy: false, ifLink: false, ifKeeper: false }, priority: rolePriority['miner'] });
                            }
                        }
                    }
                }
            }
        }

        if (true) { // }(spawningCreepName == undefined) { // no energy problem, start other creeps building
            for (let role of listOfRoles) {
                if (NoOfCreeps[role] < roomSpawningInfo.minCreeps[role]) { // loop through every roles and check with min number. if not enough, spawn other creeps
                    console.log(this.name + ' added ' + role + '.');
                    let creepEnergyCost = roomSpawningInfo.creepEnergy[role];
                    if (!creepEnergyCost || creepEnergyCost == 0) {
                        creepEnergyCost = room.memory.ECap;
                    }
                    spawningQueue.push({ memory: { energy: creepEnergyCost, role: role, target: room.name, RCL: currentRCL, energyMax: room.energyCapacityAvailable},priority: rolePriority[role]});
                }
            }
        }

        let currentRoomName = room.name;

        // AI in the current room's early state harvester mining
        if (room.memory.earlyHarv) { // if early state mining is active
            for (let earlyRoomName in room.memory.earlyHarv) {
                let minNoOfEarlyHarverster = room.memory.earlyHarv[earlyRoomName];
                if (Game.rooms[earlyRoomName]) {
                    let creepsInEarlyRoom = Game.rooms[earlyRoomName].find(FIND_MY_CREEPS);
                    var creepsInHomeAndRemoteRoom = imaginaryCreepsInRoom.concat(creepsInEarlyRoom);
                }
                else {
                    var creepsInHomeAndRemoteRoom = imaginaryCreepsInRoom;
                }

                let noOfEarlyHarverster = _.sum(creepsInHomeAndRemoteRoom, (c) => c.memory.role == 'longDistanceHarvester' && c.memory.target == earlyRoomName);

                if ( noOfEarlyHarverster < minNoOfEarlyHarverster ) { // if not enough long distance harvesters, spawn {
                    console.log(this.name+' added long distance harvester for '+earlyRoomName)
                    spawningQueue.push({memory:{role: 'longDistanceHarvester', target: earlyRoomName, energy: room.energyCapacityAvailable, home: currentRoomName} , priority: rolePriority['longDistanceHarvester']});
                }
            }
        }

        // AI in the current room's remote mining neighbours /////////////////////////////////////////////////////////////////////////////////////
        if (true) { //}(spawningCreepName == undefined) { // if no creeps needed to spawn for the current room
            if (roomSpawningInfo.remoteMode == 1) { // 1 for remote miner mining, 0 for remote harvester mining
                let neighbourRoomNames = room.memory.remoteMiningRoomNames;
                for (let i = 0; i<neighbourRoomNames.length; i++) {
                    let remoteMiningRoomName = neighbourRoomNames[i];

                    //console.log('scan all remoment mining rooms: '+remoteMiningRoomName);
                    if ( Game.rooms[remoteMiningRoomName] == undefined ) { // if no creeps in romote mining room or no scouter for the remote mining room in current spawn room and target room, spawn a scouter
                        // calculate No. of scouters in each reservable rooms around current spawn room, if no scouters there, spawn 1, if yes, send miners
                        let NoScouters = _.sum(imaginaryCreepsInRoom, (c) => c.memory.role == 'scouter' && c.memory.target == remoteMiningRoomName);
                        //console.log((Game.creeps[remoteMiningRoomName] == undefined) , (NoScouters<1),remoteMiningRoomName);
                        if (NoScouters<1) {
                            console.log(this.name+' added scouter '+remoteMiningRoomName)
                            spawningQueue.push({memory:{role: 'scouter', target: remoteMiningRoomName},priority: rolePriority['scouter']});
                        }
                    }
                    else { // scouter there or on its way, check if arrived in that room
                        var creepsInRemoteRoom = Game.rooms[remoteMiningRoomName].find(FIND_MY_CREEPS);
                        var creepsInHomeAndRemoteRoom = imaginaryCreepsInRoom.concat(creepsInRemoteRoom);
                        //var netRemoteFuckness;
                        //var enemyFuckness;
                        /*for (let each of creepsInHomeAndRemoteRoom) {
                        console.log(each.name)
                        }*/
                        if (Game.rooms[remoteMiningRoomName].memory.byPass != undefined) { // count creeps in the by-pass room
                            for (let byPassRoomName of Game.rooms[remoteMiningRoomName].memory.byPass) { // for every related same evacuation rooms, evacuate
                                [ifAdd, creepsToAdd] = calculateMyCreepsInRoom(byPassRoomName);
                                if (ifAdd) {
                                    creepsInHomeAndRemoteRoom = creepsInHomeAndRemoteRoom.concat(creepsToAdd);
                                }
                            }
                        }
                        //[netRemoteFuckness, enemyFuckness] = determineIfFuckedRemote(Game.rooms[remoteMiningRoomName],creepsInHomeAndRemoteRoom);
                        let invaderNum = determineIfRoomInvaded(Game.rooms[remoteMiningRoomName]);
                        //[netRemoteFuckness, enemyFuckness] = determineIfFucked(Game.creeps[remoteMiningRoomName].room);
                        //let enemy = Game.creeps[remoteMiningRoomName].room.find(FIND_HOSTILE_CREEPS, {filter: s => (!allyList().includes(s.owner))});
                        //console.log(enemyFuckness, remoteMiningRoomName);
                        if ( invaderNum==undefined || invaderNum < 3 ) { // if there is no enemy spawn builders then reservers then miners AND room is neutral
                            Game.rooms[remoteMiningRoomName].memory.ifPeace = true; // update evaculation boolean
                            if (Game.rooms[remoteMiningRoomName].memory.sameEvacuateRoom != undefined) { // if remote mining room has a related room
                                for (let relatedRoomName of Game.rooms[remoteMiningRoomName].memory.sameEvacuateRoom) { // for every related same evacuation rooms, evacuate
                                    if (Game.rooms[relatedRoomName] != undefined) {
                                        Game.rooms[relatedRoomName].memory.ifPeace = true;
                                    }
                                }
                            }
                            // calculate No. of long distance builders(repairers) in each reservable rooms around current spawn room
                            let NoLongDistanceBuilders = _.sum(creepsInHomeAndRemoteRoom, (c) => c.memory.role == 'longDistanceBuilder' && c.memory.target == remoteMiningRoomName);
                            //eval('var NoLongDistanceBuilders_'+remoteMiningRoomName+' = NoLongDistanceBuilders;');
                            //console.log(remoteMiningRoomName,NoLongDistanceBuilders);
                            if (Game.rooms[remoteMiningRoomName].find(FIND_MY_CONSTRUCTION_SITES, { filter: { structureType: STRUCTURE_CONTAINER } } ).length > 0 && NoLongDistanceBuilders<1) { // if not enough long distance builders, spawn
                            //if ( NoLongDistanceBuilders < roomSpawningInfo.minNoRemoteBuilders[i]) { // if not enough long distance builders, spawn
                                console.log(this.name+' added longDistanceBuilder '+remoteMiningRoomName)
                                spawningQueue.push({memory:{role: 'longDistanceBuilder', energy: 400, target: remoteMiningRoomName, home: currentRoomName},priority: rolePriority['longDistanceBuilder']});
                                /*spawner = whichSpawnSpawns(this, subSpawn);
                                spawningCreepName = spawner.createLongDistanceBuilder(600, remoteMiningRoomName);
                                if ((subSpawn!=undefined)&&(spawningCreepName==OK)) { // each time there is a creep successfully spawned, creeps in room need to be calculate again with the being-spawned creep added into the list
                                creepsInRoom = updateCreepsInRoomWithSpawning(this);
                                }*/
                            }
                            else { // enough builder, then reserver
                                let bigReserver;
                                let NoReserversRequired;
                                if (room.energyCapacityAvailable>=1300) { // if room can spawn big reservers
                                    bigReserver = true;
                                    NoReserversRequired = 1; // 1 big is enough
                                }
                                else {
                                    bigReserver = false;
                                    if (Game.rooms[remoteMiningRoomName]) { // if room available, check how many tiles available around controller
                                        let noOfTilesAroundController = tilesSurrounded(Game.rooms[remoteMiningRoomName].controller);
                                        if (noOfTilesAroundController > 1) {
                                            NoReserversRequired = 2;
                                        }
                                        else {
                                            NoReserversRequired = 1;
                                        }
                                    }
                                    else {
                                        NoReserversRequired = 1;
                                    }

                                }
                                // calculate No. of reservers in each reservable rooms around current spawn room
                                let NoReservers = _.sum(creepsInHomeAndRemoteRoom, (c) => c.memory.role == 'reserver' && c.memory.target == remoteMiningRoomName);
                                if ( NoReservers < NoReserversRequired && ((Game.rooms[remoteMiningRoomName].controller.reservation==undefined)||(Game.rooms[remoteMiningRoomName].controller.reservation.ticksToEnd<2000)) ) { // if not enough reservers, spawn {
                                    console.log(this.name+' added reserver '+remoteMiningRoomName)
                                    spawningQueue.push({memory:{role: 'reserver', target: remoteMiningRoomName, big: bigReserver, roomEnergyMax: room.energyCapacityAvailable},priority: rolePriority['reserver']});
                                    /*spawner = whichSpawnSpawns(this, subSpawn);
                                    spawningCreepName = spawner.createReserver(remoteMiningRoomName);
                                    if ((subSpawn!=undefined)&&(spawningCreepName==OK)) { // each time there is a creep successfully spawned, creeps in room need to be calculate again with the being-spawned creep added into the list
                                    creepsInRoom = updateCreepsInRoomWithSpawning(this);
                                    }*/
                                }
                                else { // enough reservers, spawn miners
                                    //console.log(Game.creeps[remoteMiningRoomName]);
                                    let sources = Game.rooms[remoteMiningRoomName].find(FIND_SOURCES);
                                    if (Game.rooms[remoteMiningRoomName].memory.sourceTravelTime && Object.keys(Game.rooms[remoteMiningRoomName].memory.sourceTravelTime).length > 0) {
                                        for (let source of sources) { // only spawn a miner if it cannot be found both in the spawn room and destination room
                                            if (!_.some(creepsInHomeAndRemoteRoom,
                                                c => c.memory.role == 'miner' && c.memory.sourceID == source.id
                                                    && (c.ticksToLive > (3 * 9 + Game.rooms[remoteMiningRoomName].memory.sourceTravelTime[source.id]) || c.ticksToLive == undefined)
                                            ) && (room.energyCapacityAvailable >= 950)
                                            ) {
                                                if (currentRCL > 3) {
                                                    console.log(this.name + ' added remote miner ' + remoteMiningRoomName, source.id)
                                                    spawningQueue.push({ memory: { role: 'miner', sourceID: source.id, target: remoteMiningRoomName, currentRCL: 0, ifMineEnergy: true, ifLink: false, ifKeeper: false }, priority: rolePriority['miner'] });
                                                }
                                            }
                                        }

                                        // calculate No. of lorries in each reservable rooms around current spawn room
                                        let NoLongDistanceLorries = _.sum(creepsInHomeAndRemoteRoom, (c) => c.memory.role == 'longDistanceLorry' && c.memory.target == remoteMiningRoomName);
                                        //if (currentRoomName=='E92N11') {
                                            //console.log(remoteMiningRoomName,NoLongDistanceLorries,roomSpawningInfo.minNoRemoteLorries[i])
                                        //}

                                        /*// initiate remote mining info: lorry E and lorry No.
                                        roomSpawningInfo.minNoRemoteLorries[i] = initiateNoOfRemoteLorries(sources.length, Game.rooms[remoteMiningRoomName].memory.sourceTravelTime, room.energyCapacityAvailable);
                                        roomSpawningInfo.remoteLorryEnergy[i] = room.energyCapacityAvailable*.875;
                                        console.log(room.name, remoteMiningRoomName, room.energyCapacityAvailable*.875, initiateNoOfRemoteLorries(sources.length, Game.rooms[remoteMiningRoomName].memory.sourceTravelTime, room.energyCapacityAvailable))
                                        */

                                        if (roomSpawningInfo.minNoRemoteLorries == undefined || (Game.time % 367 == 0)) { // not calculated # of remote lorries, calculate it now
                                        //if (true) {
                                            //roomSpawningInfo.minNoRemoteLorries = [];
                                            console.log(room.name + ' updated its remote lorry numbers')
                                            roomSpawningInfo.minNoRemoteLorries[i] = initiateNoOfRemoteLorries(sources.length, Game.rooms[remoteMiningRoomName].memory.sourceTravelTime, room.energyCapacityAvailable);

                                            // if rooms has too many dropped energy, send an extra lorry
                                            let droppedResources = Game.rooms[remoteMiningRoomName].find(FIND_DROPPED_RESOURCES);
                                            if (droppedResources.length > 0) {
                                                let droppedAmount = 0;
                                                for (let droppedResource of droppedResources) {
                                                    droppedAmount += droppedResource.amount;
                                                }
                                                if (droppedAmount > 4500) {
                                                    roomSpawningInfo.minNoRemoteLorries[i] += 3;
                                                }
                                                else if (droppedAmount >3000) {
                                                    roomSpawningInfo.minNoRemoteLorries[i] += 2;
                                                }
                                                else if (droppedAmount > 1500) {
                                                    roomSpawningInfo.minNoRemoteLorries[i] += 1;
                                                }
                                            }
                                        }
                                        else if (NoLongDistanceLorries < roomSpawningInfo.minNoRemoteLorries[i]) {
                                            let lorryEnergySpent = Math.min(room.energyCapacityAvailable * .875,2333);

                                            /*let lorryEnergySpent = roomSpawningInfo.remoteLorryEnergy;
                                            if (lorryEnergySpent) { // remote lorry energy is predefined
                                                lorryEnergySpent = lorryEnergySpent[i];
                                            }
                                            else {
                                                if ((currentRCL > 6)) {
                                                    lorryEnergySpent = 48 * 50;
                                                    if (sources.length < 2) {
                                                        roomSpawningInfo.minNoRemoteLorries[i] = 1;
                                                    }
                                                    else {
                                                        roomSpawningInfo.minNoRemoteLorries[i] = 2;
                                                    }
                                                }
                                                else if ((currentRCL < 5) || (room.energyCapacityAvailable < 1500)) {
                                                    lorryEnergySpent = room.energyCapacityAvailable*.875;
                                                    roomSpawningInfo.minNoRemoteLorries[i] = sources.length*3;
                                                }
                                                else {
                                                    lorryEnergySpent = 1500;
                                                    roomSpawningInfo.minNoRemoteLorries[i] = sources.length;
                                                }
                                            }*/
                                            console.log(this.name + ' added longDistanceLorry ' + remoteMiningRoomName)
                                            spawningQueue.push({ memory: { role: 'longDistanceLorry', energy: lorryEnergySpent, home: room.name, target: remoteMiningRoomName }, priority: rolePriority['longDistanceLorry'] });

                                            /*spawner = whichSpawnSpawns(this, subSpawn);
                                            spawningCreepName = spawner.createLongDistanceLorry(lorryEnergySpent, this.room.name, remoteMiningRoomName);
                                            if ((subSpawn!=undefined)&&(spawningCreepName==OK)) { // each time there is a creep successfully spawned, creeps in room need to be calculate again with the being-spawned creep added into the list
                                            creepsInRoom = updateCreepsInRoomWithSpawning(this);
                                            }*/
                                        }
                                    }
                                    else { // source travel time not calculated
                                        Game.rooms[remoteMiningRoomName].memory.sourceTravelTime = {};
                                        for (let source of sources) { // caculate source travel time
                                            Game.rooms[remoteMiningRoomName].memory.sourceTravelTime[source.id] = 1.5 * calculateTicksBetweenObjects(room.find(FIND_MY_STRUCTURES, { filter: s => s.structureType == STRUCTURE_SPAWN })[0], Game.getObjectById(source.id));
                                        }
                                    }
                                }
                            }
                        }
                        else {
                            Game.rooms[remoteMiningRoomName].memory.ifPeace = false; // update evaculation boolean
                            if (Game.rooms[remoteMiningRoomName].memory.sameEvacuateRoom != undefined) { // if remote mining room has a related room
                                for (let relatedRoomName of Game.rooms[remoteMiningRoomName].memory.sameEvacuateRoom) { // for every related same evacuation rooms, evacuate
                                    if (Game.rooms[relatedRoomName] != undefined) {
                                        Game.rooms[relatedRoomName].memory.ifPeace = false;
                                    }
                                }
                            }
                        }
                        /*else if (enemy.length == 1) { // enemy is 1, probably an NPC, but scouter is in the room now, we need to think about if we need to send attackers or not
                            console.log(remoteMiningRoomName+ ' is under attack but there is a scouter, no attacker sent.');
                        }*/
                        //else if (enemy.length >= 1 && (room.owner == undefined || room.owner == username)) { // abandoned aproach for enemy length
                        if (invaderNum > 2) { // to many invaders, do nothing for now
                            if ( currentRCL > 7 ) {
                                console.log('remoted room SERIOUSLY fucked '+remoteMiningRoomName+' sending invader killer (no group)');
                                let noOfKeeperLairInvaderAttacker = _.sum(creepsInHomeAndRemoteRoom, (c) => c.memory.role == 'keeperLairInvaderAttacker' && c.memory.target == remoteMiningRoomName);
                                let noOfKeeperLairInvaderHealer = _.sum(creepsInHomeAndRemoteRoom, (c) => c.memory.role == 'keeperLairInvaderHealer' && c.memory.target == remoteMiningRoomName);
                                let keeperLairInvaderAttackerName = Game.time+remoteMiningRoomName;

                                if (noOfKeeperLairInvaderAttacker < 1 && noOfKeeperLairInvaderHealer < 1) {
                                    console.log('Remote mining added invader killer (no group) ' +remoteMiningRoomName);
                                    spawningQueue.push({memory:{role: 'keeperLairInvaderHealer', target: remoteMiningRoomName, home: room.name, toHeal: keeperLairInvaderAttackerName},priority: rolePriority['ranger']+0.1});
                                    spawningQueue.push({memory:{role: 'keeperLairInvaderAttacker', target: remoteMiningRoomName, home: room.name, name: keeperLairInvaderAttackerName},priority: rolePriority['ranger']});
                                }
                            }
                            else {
                                console.log(remoteMiningRoomName+' too many invaders and room level too low, let it fuck');
                            }
                        }
                        else if ( invaderNum == 1) {
                            let NoRemoteDefenders = _.sum(creepsInHomeAndRemoteRoom, (c) => c.memory.role == 'ranger' && c.memory.target == remoteMiningRoomName) + _.sum(creepsInHomeAndRemoteRoom, (c) => c.memory.role == 'ultimateWorrior' && c.memory.target == remoteMiningRoomName);
                            if (NoRemoteDefenders < 1) {
                                console.log('Remote mining ' +remoteMiningRoomName+ ' is under fucked! sending rangers...');
                                spawningQueue.push({memory:{role: 'ranger', home: room.name, target: remoteMiningRoomName},priority: rolePriority['ranger']});
                            }
                        }
                        else if (invaderNum == 2 ) {
                            if ( currentRCL < 7 ) {
                                let NoRemoteDefenders = _.sum(creepsInHomeAndRemoteRoom, (c) => c.memory.role == 'ranger' && c.memory.target == remoteMiningRoomName) + _.sum(creepsInHomeAndRemoteRoom, (c) => c.memory.role == 'ultimateWorrior' && c.memory.target == remoteMiningRoomName);
                                if (NoRemoteDefenders < 1) {
                                    console.log('Remote mining ' +remoteMiningRoomName+ ' is under fucked! sending rangers...');
                                    spawningQueue.push({memory:{role: 'ranger', home: room.name, target: remoteMiningRoomName},priority: rolePriority['ranger']});
                                }
                            }
                            else {
                                let NoRemoteDefenders = _.sum(creepsInHomeAndRemoteRoom, (c) => c.memory.role == 'ultimateWorrior' && c.memory.target == remoteMiningRoomName);
                                if (NoRemoteDefenders < 1) {
                                    console.log('Remote mining ' +remoteMiningRoomName+ ' is under fucked! sending untimater...');
                                    spawningQueue.push({memory:{role: 'ultimateWorrior', target: remoteMiningRoomName},priority: rolePriority['ranger']});
                                }
                            }
                        }
                        else if (invaderNum == 0) {
                            // safe
                        }
                        else {
                            console.log('impossible!');
                        }
                    }
                }
            }

            // keeper room mining code section:
            if (true) {
                let keeperRoomNames = room.memory.keeperMiningRoomNames;
                if (keeperRoomNames) { // if it is defined
                    for (let i = 0; i<keeperRoomNames.length; i++) { // loop through every keeper room
                        let keeperMiningRoomName = keeperRoomNames[i];
                        let keeperMiningRoom = Game.rooms[keeperMiningRoomName];
                        //console.log(keeperRoomNames+' keeper scan')
                        if (keeperMiningRoom) { // if it is defined (some creep is in there)
                            var creepsInRemoteRoom = keeperMiningRoom.find(FIND_MY_CREEPS);
                            //var creepsInHomeAndRemoteRoom = imaginaryCreepsInRoom.concat(creepsInRemoteRoom);
                            //var netRemoteFuckness;
                            //var enemyFuckness;

                            /*if (keeperMiningRoom.memory.byPass) { // count creeps in the by-pass room
                                for (let byPassRoomName of keeperMiningRoom.memory.byPass) { // for every related same evacuation rooms, evacuate
                                    [ifAdd, creepsToAdd] = calculateMyCreepsInRoom(byPassRoomName);
                                    if (ifAdd) {
                                        creepsInHomeAndRemoteRoom = creepsInHomeAndRemoteRoom.concat(creepsToAdd);
                                    }
                                }
                            }*/
                            let invaderNum = determineIfRoomInvaded(keeperMiningRoom);
                            //[netRemoteFuckness, enemyFuckness, enermyCount] = determineIfFuckedRemote(keeperMiningRoom,creepsInHomeAndRemoteRoom);
                            //console.log([netRemoteFuckness, enemyFuckness, enermyCount]);
                            // 177 for 5 invaders and 4 SKs
                            // 120 for 4 SKs
                            let allMyCreepsWithSpawningAndQueueInCurrentRoom = getAllMyCreepsWithSpawning(room.name).concat(spawningQueue);

                            // byPass rooms
                            if (keeperMiningRoom && keeperMiningRoom.memory.byPass != undefined) { // count creeps in the by-pass room
                                for (let byPassRoomName of keeperMiningRoom.memory.byPass) { // for every related same evacuation rooms, evacuate
                                    [ifAdd, creepsToAdd] = calculateMyCreepsInRoom(byPassRoomName);
                                    if (ifAdd) {
                                        allMyCreepsWithSpawningAndQueueInCurrentRoom = allMyCreepsWithSpawningAndQueueInCurrentRoom.concat(creepsToAdd);
                                    }
                                }
                            }

                            // count keeper lair guardians
                            let noOfKeeperLairKeeper = _.sum(allMyCreepsWithSpawningAndQueueInCurrentRoom, (c) => c.memory.role == 'keeperLairMeleeKeeper' && c.memory.target == keeperMiningRoomName && (c.ticksToLive == undefined||c.ticksToLive>200));
                            let noOfKeeperLairInvaderAttacker = _.sum(allMyCreepsWithSpawningAndQueueInCurrentRoom, (c) => c.memory.role == 'keeperLairInvaderAttacker' && c.memory.target == keeperMiningRoomName && (c.ticksToLive == undefined||c.ticksToLive>200));
                            noOfKeeperLairKeeper += noOfKeeperLairInvaderAttacker;
                            //let noOfKeeperLairMeleeKeeper = _.sum(allMyCreepsWithSpawningAndQueueInCurrentRoom, (c) => c.memory.role == 'keeperLairMeleeKeeper' && c.memory.target == keeperMiningRoomName && c.memory.ranged == false);
                            //let noOfKeeperLairRangedKeeper = _.sum(allMyCreepsWithSpawningAndQueueInCurrentRoom, (c) => c.memory.role == 'keeperLairMeleeKeeper' && c.memory.target == keeperMiningRoomName && c.memory.ranged == true);

                            //console.log(noOfKeeperLairMeleeKeeper)
                            if (invaderNum==0) { //(enermyCount-noOfKeeperLairMeleeKeeper<=3) {
                                if (noOfKeeperLairKeeper < 1) {
                                    console.log('Remote keeper mining added meleeKeeper ' +keeperMiningRoomName);
                                    spawningQueue.push({memory:{role: 'keeperLairMeleeKeeper', target: keeperMiningRoomName, home: room.name, ranged: false},priority: rolePriority['keeperLairMeleeKeeper']});
                                }
                                else { // there is meleeKeeper, send lorries and miners!
                                    let noOfKeeperLairLorry = _.sum(allMyCreepsWithSpawningAndQueueInCurrentRoom, (c) => c.memory.role == 'keeperLairLorry' && c.memory.target == keeperMiningRoomName);
                                    //let noOfKeeperLairMiners = _.sum(allMyCreepsWithSpawningAndQueueInCurrentRoom, (c) => c.memory.role == 'miner' && c.memory.target == keeperMiningRoomName);
                                    // send lorries
                                    if (noOfKeeperLairLorry<1){
                                        console.log('Remote keeper mining added lorry ' +keeperMiningRoomName);
                                        let homeName = room.name;
                                        /*if (homeName=='E94N22') {
                                            homeName = 'E93N24';
                                        }*/
                                        spawningQueue.push({memory:{role: 'keeperLairLorry', target: keeperMiningRoomName, home: homeName},priority: rolePriority['keeperLairLorry']});
                                        break;
                                    }
                                    else {// if more lorries, send miners
                                        let sources = keeperMiningRoom.find(FIND_SOURCES);//.concat(keeperMiningRoom.find(FIND_MINERALS));
                                        let mineral = keeperMiningRoom.find(FIND_MINERALS)[0];//.concat(keeperMiningRoom.find(FIND_MINERALS));
                                        let noOfRequiredKeeperLairLorry = 0;
                                        for (let source of sources) { // only spawn a miner if it cannot be found both in the spawn room and destination room
                                            if (keeperMiningRoom.memory.sourceTravelTime) {
                                                if (keeperMiningRoom.memory.sourceTravelTime[source.id]) {
                                                    noOfRequiredKeeperLairLorry += 1;
                                                    //console.log(keeperMiningRoom.memory.sourceTravelTime[source.id]);
                                                    if ( !_.some(allMyCreepsWithSpawningAndQueueInCurrentRoom,
                                                    c => c.memory.role == 'miner' && c.memory.sourceID == source.id
                                                    && (c.ticksToLive > (3*9+keeperMiningRoom.memory.sourceTravelTime[source.id]) || c.ticksToLive == undefined)))
                                                    {
                                                        console.log(this.name+' added remote miner '+keeperMiningRoomName,source.id)
                                                        spawningQueue.push({memory:{role: 'miner', sourceID: source.id, target: keeperMiningRoomName, currentRCL: currentRCL, ifMineEnergy: true, ifLink: false, ifKeeper: true},priority: rolePriority['miner']});
                                                    }
                                                }
                                                else {
                                                    keeperMiningRoom.memory.sourceTravelTime[source.id] = 3 * calculateTicksBetweenObjects(room.find(FIND_MY_STRUCTURES, { filter: s => s.structureType == STRUCTURE_SPAWN })[0],source);
                                                }
                                            }
                                            else {
                                                keeperMiningRoom.memory.sourceTravelTime = {}
                                            }
                                        }

                                        // pioneer
                                        let pioneerNo = 1;
                                        let pioneerE = 1200;
                                        if (keeperMiningRoomName == 'E46S6') {
                                            pioneerE = 2200;
                                            pioneerNo = 1;
                                        }
                                        if (_.sum(allMyCreepsWithSpawningAndQueueInCurrentRoom, (c) => c.memory.role == 'pioneer' && c.memory.target == keeperMiningRoomName) < pioneerNo) { // create pioneer as repairer
                                            console.log('Remote keeper mining added pioneer repairer ' +keeperMiningRoomName);
                                            spawningQueue.push({ memory: { energy: pioneerE, role: 'pioneer', target: keeperMiningRoomName, home: room.name, superUpgrader: false},priority: 9});
                                        }

                                        // calculate number of required lorries depending on if mineral is harvested
                                        /*if (mineral.mineralAmount>0) {
                                            noOfRequiredKeeperLairLorry += 1;
                                        }*/

                                        // extra lorries
                                        /*if (keeperMiningRoom.memory.extraKeeperLairLorryNo) {
                                            noOfRequiredKeeperLairLorry += keeperMiningRoom.memory.extraKeeperLairLorryNo;
                                        }*/

                                        // if rooms has too many dropped energy, send an extra lorry
                                        /*let droppedResources = Game.rooms[keeperMiningRoomName].find(FIND_DROPPED_RESOURCES);
                                        if (droppedResources.length > 0) {
                                            let droppedAmount = 0;
                                            for (let droppedResource of droppedResources) {
                                                droppedAmount += droppedResource.amount;
                                            }
                                            if (droppedAmount > 6000) {
                                                noOfRequiredKeeperLairLorry += 3;
                                            }
                                            else if (droppedAmount > 4500) {
                                                noOfRequiredKeeperLairLorry += 2;
                                            }
                                            else if (droppedAmount > 3000) {
                                                noOfRequiredKeeperLairLorry += 1;
                                            }
                                        }*/

                                        if ( noOfKeeperLairLorry < noOfRequiredKeeperLairLorry) {
                                            console.log('Remote keeper mining added lorry ' +keeperMiningRoomName);
                                            let homeName = room.name;
                                            /*if (homeName=='E94N22') {
                                                homeName = 'E93N24';
                                            }*/
                                            spawningQueue.push({memory:{role: 'keeperLairLorry', target: keeperMiningRoomName, home: homeName},priority: (rolePriority['keeperLairLorry']-1)});
                                        }
                                        else {
                                            if (keeperMiningRoom.memory.sourceTravelTime[mineral.id]) {
                                                if ((mineral.mineralAmount>0)&&(keeperMiningRoom.memory.sourceTravelTime)) {
                                                    //console.log(keeperMiningRoom.memory.sourceTravelTime[source.id]);
                                                    if ( !_.some(allMyCreepsWithSpawningAndQueueInCurrentRoom,
                                                    c => c.memory.role == 'miner' && c.memory.sourceID == mineral.id
                                                    && (c.ticksToLive > (3*9+keeperMiningRoom.memory.sourceTravelTime[mineral.id]) || c.ticksToLive == undefined)))
                                                    {
                                                        console.log(this.name+' added remote mineral  miner '+keeperMiningRoomName,mineral.id)
                                                        spawningQueue.push({memory:{role: 'miner', sourceID: mineral.id, target: keeperMiningRoomName, currentRCL: currentRCL, ifMineEnergy: false, ifLink: false, ifKeeper: true},priority: rolePriority['miner']});
                                                    }
                                                }
                                            }
                                            else { // register mineral source travel time
                                                keeperMiningRoom.memory.sourceTravelTime[mineral.id] = 3 * calculateTicksBetweenObjects(room.find(FIND_MY_STRUCTURES, { filter: s => s.structureType == STRUCTURE_SPAWN })[0],mineral);
                                            }
                                        }
                                    }
                                }
                            }
                            else {
                                console.log('keeper room fucked '+keeperMiningRoomName+' sending invader killers group');
                                //let noOfKeeperLairInvaderAttacker = _.sum(allMyCreepsWithSpawningAndQueueInCurrentRoom, (c) => c.memory.role == 'keeperLairInvaderAttacker' && c.memory.target == keeperMiningRoomName);
                                let noOfKeeperLairInvaderHealer = _.sum(allMyCreepsWithSpawningAndQueueInCurrentRoom, (c) => c.memory.role == 'keeperLairInvaderHealer' && c.memory.target == keeperMiningRoomName);
                                let keeperLairInvaderAttackerName = Game.time+keeperMiningRoomName;

                                if (noOfKeeperLairInvaderAttacker < 1 && noOfKeeperLairInvaderHealer < 1) {
                                    console.log('Remote keeper mining added invader killers group ' +keeperMiningRoomName);
                                    spawningQueue.push({memory:{role: 'keeperLairInvaderAttacker', target: keeperMiningRoomName, home: room.name, name: keeperLairInvaderAttackerName},priority: rolePriority['keeperLairInvaderAttacker']});
                                    spawningQueue.push({memory:{role: 'keeperLairInvaderHealer', target: keeperMiningRoomName, home: room.name, toHeal: keeperLairInvaderAttackerName},priority: rolePriority['keeperLairInvaderHealer']});
                                }
                                else {
                                    if (noOfKeeperLairKeeper < 1 ) {
                                        console.log('Remote keeper mining added meleeKeeper ' +keeperMiningRoomName);
                                        spawningQueue.push({memory:{role: 'keeperLairMeleeKeeper', target: keeperMiningRoomName, home: room.name, ranged: false},priority: 7});
                                    }
                                }
                                /*if (noOfKeeperLairRangedKeeper < 1 ) {
                                    console.log('Remote keeper mining added rangedKeeper ' +keeperMiningRoomName);
                                    spawningQueue.push({memory:{role: 'keeperLairMeleeKeeper', target: keeperMiningRoomName, home: room.name, ranged: true},priority: 7});
                                }
                                else if (noOfKeeperLairMeleeKeeper < 1) {
                                    console.log('Remote keeper mining added meleeKeeper ' +keeperMiningRoomName);
                                    spawningQueue.push({memory:{role: 'keeperLairMeleeKeeper', target: keeperMiningRoomName, home: room.name, ranged: false},priority: rolePriority['keeperLairMeleeKeeper']});
                                }
                                else if (noOfKeeperLairKeeper < 3) {
                                    console.log('keeper room added ranged ' +keeperMiningRoomName);
                                    spawningQueue.push({memory:{role: 'keeperLairMeleeKeeper', target: keeperMiningRoomName, home: room.name, ranged: true},priority: rolePriority['keeperLairMeleeKeeper']});
                                }*/
                            }
                        }
                        else { // no creep is in there yet, send a melee keeper
                            let allMyCreepsWithSpawningAndQueueInCurrentRoom = getAllMyCreepsWithSpawning(room.name).concat(spawningQueue);
                            // count keeper lair guardians
                            //let noOfKeeperLairMeleeKeeper = _.sum(allMyCreepsWithSpawningAndQueueInCurrentRoom, (c) => c.memory.role == 'keeperLairMeleeKeeper' && c.memory.target == keeperMiningRoomName && c.memory.ranged == false);
                            let noOfKeeperLairMeleeKeeper = _.sum(allMyCreepsWithSpawningAndQueueInCurrentRoom, (c) => c.memory.role == 'keeperLairMeleeKeeper' && c.memory.target == keeperMiningRoomName && c.memory.ranged == false);
                            //console.log(keeperMiningRoomName,noOfKeeperLairMeleeKeeper)
                            if (noOfKeeperLairMeleeKeeper < 1 ) {
                                console.log('Remote keeper mining added meleeKeeper ' +keeperMiningRoomName);
                                spawningQueue.push({memory:{role: 'keeperLairMeleeKeeper', target: keeperMiningRoomName, home: room.name, ranged: false},priority: 7});
                            }
                        }
                    }
                }
            }

            // middle room mining code section:
            if (true) {
                let middleRoomName = room.memory.middleRoomName;
                if (middleRoomName) { // if it is defined
                    let middleRoom = Game.rooms[middleRoomName];
                    if (middleRoom) {
                        //var creepsInmiddleRoom = middleRoom.find(FIND_MY_CREEPS);
                        let invaderNum = determineIfRoomInvaded(middleRoom);
                        let allMyCreepsWithSpawningAndQueueInCurrentRoom = getAllMyCreepsWithSpawning(room.name).concat(spawningQueue);

                        if (invaderNum == 0) { // if no invader
                            let noOfKeeperLairLorry = _.sum(allMyCreepsWithSpawningAndQueueInCurrentRoom, (c) => c.memory.role == 'keeperLairLorry' && c.memory.target == middleRoomName);

                                let sources = middleRoom.find(FIND_SOURCES);//.concat(keeperMiningRoom.find(FIND_MINERALS));
                                let mineral = middleRoom.find(FIND_MINERALS)[0];//.concat(keeperMiningRoom.find(FIND_MINERALS));
                                let noOfRequiredKeeperLairLorry = 1;
                                for (let source of sources) { // only spawn a miner if it cannot be found both in the spawn room and destination room
                                    if (middleRoom.memory.sourceTravelTime) {
                                        if (middleRoom.memory.sourceTravelTime[source.id]) {
                                            noOfRequiredKeeperLairLorry += 1;
                                            //console.log(middleRoom.memory.sourceTravelTime[source.id]);
                                            if (!_.some(allMyCreepsWithSpawningAndQueueInCurrentRoom,
                                                c => c.memory.role == 'miner' && c.memory.sourceID == source.id
                                                    && (c.ticksToLive > (middleRoom.memory.sourceTravelTime[source.id])*4/5 || c.ticksToLive == undefined))) {
                                                console.log(this.name + ' added remote miner ' + middleRoomName, source.id)
                                                spawningQueue.push({ memory: { role: 'miner', sourceID: source.id, target: middleRoomName, currentRCL: currentRCL, ifMineEnergy: true, ifLink: false, ifKeeper: true }, priority: rolePriority['miner'] });
                                            }
                                        }
                                        else {
                                            middleRoom.memory.sourceTravelTime[source.id] = 3 * calculateTicksBetweenObjects(room.find(FIND_MY_STRUCTURES, { filter: s => s.structureType == STRUCTURE_SPAWN })[0], source);
                                        }
                                    }
                                    else {
                                        middleRoom.memory.sourceTravelTime = {}
                                    }
                                }

                                // pioneer
                                if (_.sum(allMyCreepsWithSpawningAndQueueInCurrentRoom, (c) => c.memory.role == 'pioneer' && c.memory.target == middleRoomName) < 1) { // create pioneer as repairer
                                    console.log('Remote middle room mining added pioneer repairer ' + middleRoomName);
                                    spawningQueue.push({ memory: { energy: 1200, role: 'pioneer', target: middleRoomName, home: room.name, superUpgrader: false }, priority: 9 });
                                }

                                // extra lorries
                                // if rooms has too many dropped energy, send an extra lorry
                                /*let droppedResources = Game.rooms[middleRoomName].find(FIND_DROPPED_RESOURCES);
                                if (droppedResources.length > 0) {
                                    let droppedAmount = 0;
                                    for (let droppedResource of droppedResources) {
                                        droppedAmount += droppedResource.amount;
                                    }
                                    if (droppedAmount > 6000) {
                                        noOfRequiredKeeperLairLorry += 3;
                                    }
                                    else if (droppedAmount > 4500) {
                                        noOfRequiredKeeperLairLorry += 2;
                                    }
                                    else if (droppedAmount > 3000) {
                                        noOfRequiredKeeperLairLorry += 1;
                                    }
                                }*/

                                // lorries
                                if (noOfKeeperLairLorry < noOfRequiredKeeperLairLorry) {
                                    console.log('Remote keeper mining added lorry ' + middleRoomName);
                                    let homeName = room.name;
                                    /*if (homeName=='E94N22') {
                                        homeName = 'E93N24';
                                    }*/
                                    spawningQueue.push({ memory: { role: 'keeperLairLorry', target: middleRoomName, home: homeName }, priority: (rolePriority['keeperLairLorry'] - 1) });
                                }
                                else {
                                    if (middleRoom.memory.sourceTravelTime[mineral.id]) {
                                        if ((mineral.mineralAmount > 0) && (middleRoom.memory.sourceTravelTime)) {
                                            //console.log(middleRoom.memory.sourceTravelTime[source.id]);
                                            if (!_.some(allMyCreepsWithSpawningAndQueueInCurrentRoom,
                                                c => c.memory.role == 'miner' && c.memory.sourceID == mineral.id
                                                    && (c.ticksToLive > (3 * 9 + middleRoom.memory.sourceTravelTime[mineral.id]) || c.ticksToLive == undefined))) {
                                                console.log(this.name + ' added remote mineral  miner ' + middleRoomName, mineral.id)
                                                spawningQueue.push({ memory: { role: 'miner', sourceID: mineral.id, target: middleRoomName, currentRCL: currentRCL, ifMineEnergy: false, ifLink: false, ifKeeper: true }, priority: rolePriority['miner'] });
                                            }
                                        }
                                    }
                                    else { // register mineral source travel time
                                        middleRoom.memory.sourceTravelTime[mineral.id] = 3 * calculateTicksBetweenObjects(room.find(FIND_MY_STRUCTURES, { filter: s => s.structureType == STRUCTURE_SPAWN })[0], mineral);
                                    }
                                }
                            }
                            else {
                                console.log('middle room fucked '+middleRoomName+' sending invader killers group');
                                let noOfKeeperLairInvaderAttacker = _.sum(allMyCreepsWithSpawningAndQueueInCurrentRoom, (c) => c.memory.role == 'keeperLairInvaderAttacker' && c.memory.target == middleRoomName);
                                let noOfKeeperLairInvaderHealer = _.sum(allMyCreepsWithSpawningAndQueueInCurrentRoom, (c) => c.memory.role == 'keeperLairInvaderHealer' && c.memory.target == middleRoomName);
                                let keeperLairInvaderAttackerName = Game.time+middleRoomName;

                                if (noOfKeeperLairInvaderAttacker < 1 && noOfKeeperLairInvaderHealer < 1) {
                                    console.log('Remote middle room mining added invader killers group ' +middleRoomName);
                                    spawningQueue.push({memory:{role: 'keeperLairInvaderAttacker', target: middleRoomName, home: room.name, name: keeperLairInvaderAttackerName},priority: rolePriority['keeperLairInvaderAttacker']});
                                    spawningQueue.push({memory:{role: 'keeperLairInvaderHealer', target: middleRoomName, home: room.name, toHeal: keeperLairInvaderAttackerName},priority: rolePriority['keeperLairInvaderHealer']});
                                }
                                else {
                                    if (noOfKeeperLairInvaderAttacker < 1 ) {
                                        console.log('Remote keeper mining added meleeKeeper ' +middleRoomName);
                                        spawningQueue.push({memory:{role: 'keeperLairInvaderAttacker', target: middleRoomName, home: room.name, name: keeperLairInvaderAttackerName},priority: rolePriority['keeperLairInvaderAttacker']});
                                    }
                                }
                            }
                    }
                    else { // send scouter there
                        let allMyCreepsWithSpawningAndQueueInCurrentRoom = getAllMyCreepsWithSpawning(room.name).concat(spawningQueue);
                        // count scouter
                        let noOfMiddleRoomScouter = _.sum(allMyCreepsWithSpawningAndQueueInCurrentRoom, (c) => c.memory.role == 'scouter' && c.memory.target == middleRoomName);
                        //console.log(keeperMiningRoomName,noOfKeeperLairMeleeKeeper)
                        if (noOfMiddleRoomScouter < 1 ) {
                            console.log(room.name+' creates remote middle mining added scouter ' +middleRoomName);
                            spawningQueue.push({memory:{role: 'scouter', target: middleRoomName},priority: rolePriority['scouter']});
                        }
                    }
                }
            }

            // keeper room only mineral mining code section:
            if (true) {
                let onlyMineralRoomNameAndTime = room.memory.onlyMineralInfo;
                if (onlyMineralRoomNameAndTime) { // if it is defined
                    for (let onlyMineralRoomName in onlyMineralRoomNameAndTime) {
                        let mineralCD = onlyMineralRoomNameAndTime[onlyMineralRoomName];
                        // if room has been accessed before
                        if (Memory.rooms[onlyMineralRoomName] && Memory.rooms[onlyMineralRoomName].hasOwnProperty('isSafe') && Memory.rooms[onlyMineralRoomName]['invaderCountDown'] && Memory.rooms[onlyMineralRoomName]['mineralCountDown']) {
                            let mineralRoom = Game.rooms[onlyMineralRoomName];
                            if (mineralRoom) { // room has vision
                                // update invader timer
                                let invaders = mineralRoom.find(FIND_HOSTILE_CREEPS, { filter: s => s.owner.username == 'Invader' });
                                let invadersNumber = invaders.length;
                                if (invadersNumber == 0) {
                                    Memory.rooms[onlyMineralRoomName]['isSafe'] = true;
                                    Memory.rooms[onlyMineralRoomName]['invaderCountDown'] = 1;
                                }
                                else {
                                    Memory.rooms[onlyMineralRoomName]['isSafe'] = false;
                                    Memory.rooms[onlyMineralRoomName]['invaderCountDown'] = invaders[0].ticksToLive + Game.time;
                                }
                                // update mineral id
                                if (!Memory.rooms[onlyMineralRoomName]['mineralId']) { // if mineral id not defined
                                    Memory.rooms[onlyMineralRoomName]['mineralId'] = mineralRoom.find(FIND_MINERALS)[0].id; // find mineral deposite
                                }
                                // update mineral timer
                                let mineralObj = Game.getObjectById(Memory.rooms[onlyMineralRoomName]['mineralId']);
                                if (mineralObj.ticksToRegeneration) {
                                    room.memory.onlyMineralInfo[onlyMineralRoomName] = mineralObj.ticksToRegeneration;
                                    Memory.rooms[onlyMineralRoomName]['mineralCountDown'] = mineralObj.ticksToRegeneration + Game.time;
                                }
                                else {
                                    room.memory.onlyMineralInfo[onlyMineralRoomName] = 1;
                                    Memory.rooms[onlyMineralRoomName]['mineralCountDown'] = 1;
                                }
                            }
                            else { // room dose not have vision

                            }
                        }
                        else { // room has not been accessed before
                            // initiate memory for mining
                            Memory.rooms[onlyMineralRoomName] = { 'isSafe': true, 'invaderCountDown': 1, 'mineralCountDown': 1 };
                        }

                        // if mineral and invader count down reached, spawn
                        if ((Memory.rooms[onlyMineralRoomName]['mineralCountDown'] - 150 < Game.time) && (Memory.rooms[onlyMineralRoomName]['invaderCountDown'] - 150 < Game.time)) {
                            Memory.rooms[onlyMineralRoomName]['isSafe'] = true;

                            // start spawning and mining
                            let allMyCreepsWithSpawningAndQueueInCurrentRoom = getAllMyCreepsWithSpawning(room.name).concat(spawningQueue);
                            // spawn defender
                            if (checkIfMiddleRoom(onlyMineralRoomName)) {
                                
                            }
                            else {
                                let noOfOnlyMineralRoomDefender = _.sum(allMyCreepsWithSpawningAndQueueInCurrentRoom, (c) => c.memory.role == 'onlyMineralDefender' && c.memory.target == onlyMineralRoomName);
                                if (noOfOnlyMineralRoomDefender < 1) {
                                    console.log('only mineral ' + onlyMineralRoomName + ' room added defender');
                                    spawningQueue.push({ memory: { role: 'onlyMineralDefender', target: onlyMineralRoomName, home: room.name }, priority: rolePriority['onlyMineralDefender'] });
                                }
                            }
                            // spawn miner
                            let noOfOnlyMineralRoomMiner = _.sum(allMyCreepsWithSpawningAndQueueInCurrentRoom, (c) => c.memory.role == 'onlyMineralMiner' && c.memory.target == onlyMineralRoomName);
                            if (noOfOnlyMineralRoomMiner < 1) {
                                console.log('only mineral ' + onlyMineralRoomName + ' room added miner');
                                spawningQueue.push({ memory: { role: 'onlyMineralMiner', target: onlyMineralRoomName, home: room.name }, priority: rolePriority['onlyMineralMiner'] });
                            }
                            // spawn mineralHauler
                            let noOfOnlyMineralRoomHauler = _.sum(allMyCreepsWithSpawningAndQueueInCurrentRoom, (c) => c.memory.role == 'onlyMineralHauler' && c.memory.target == onlyMineralRoomName);
                            if (noOfOnlyMineralRoomHauler < 1) {
                                console.log('only mineral ' + onlyMineralRoomName + ' room added Hauler');
                                spawningQueue.push({ memory: { role: 'onlyMineralHauler', target: onlyMineralRoomName, home: room.name }, priority: rolePriority['onlyMineralHauler'] });
                            }
                        }
                        else {
                            // mineral is cooling down or still being invaded, stop mining
                            Memory.rooms[onlyMineralRoomName]['isSafe'] = false;
                        }
                    }
                }
            }
        }
    }
    else { // seriously fucked!!! send good defenders!
    console.log('Base ' +room.name+ ' is under fucked ('+fuckness+')! NO sending attackers...');
    //spawningQueue.push({memory:{role: 'attacker', energy: 1000, target: room.name},priority: rolePriority['attacker']});
    /*spawner = whichSpawnSpawns(this, subSpawn);
    spawningCreepName = spawner.createAttacker(room.energyAvailable*0.5, room.name);*/
    }
}
