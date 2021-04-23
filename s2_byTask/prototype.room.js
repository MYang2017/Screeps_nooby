var rolePriority = {
    harvester : 14,
    miner : 11,
    lorry : 12,
    upgrader : 1,
    builder : 7,
    repairer : 7,
    wallRepairer : 1,
    longDistanceHarvester : 0.9,
    longDistanceLorry : 6.9,
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
    linkKeeper: 12.6,
    traveller: 1,
    transporter: 1,
    pioneer: 1,
    melee: 7,
    stealer: 1,
    ranger: 13,
    powerSourceAttacker: 1,
    powerSourceHealer: 1,
    powerSourceLorry: 1,
    labber: 0.5,
    superUpgrader: 0.95,
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
    onlyMineralDefender: 7.9,
    onlyMineralMiner: 7.8,
    onlyMineralHauler: 7.7,
    redneck: 11.5,
    mover: 12,
    noLegWorker: 1,
    symbolPicker: 11,
    mapper:1.1,
    loader: 11.5,
    driver: 9.5, // dynamic, now lower than superUpgrader
    dickHead: 12.3,
    balancer: 12.5,
    maintainer: 12.4,
    season2c: 4,
    symbolFactorier: 2,
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
    'redneck',
    'ranger',
    'mover',
    'noLegWorker',
    'symbolPicker',
    'mapper',
    'loader',
    'dickHead',
    'balancer',
    'maintainer',
    'season2c',
    'symbolFactorier',
    ];

Room.prototype.newUpdateSpawnQueue = function () {
    let room = this;
    let rn = room.name;
    let currentRCL = room.controller.level;
    let creepsInRoom = updateCreepsInRoomWithSpawningByRoom(room);
    
    if (!Memory.mapInfo) {
        logGrandeRoomInfo(room);
    }
    
    if (room.memory.forSpawning == undefined) {
        room.memory.forSpawning = {}
        newInitiateBlankRoomCreepsSpawnInfo(rn)
    }
    if (room.memory.forSpawning.spawningQueue == undefined) {
        room.memory.forSpawning.spawningQueue = [];
    }

    if (room.memory.forSpawning.roomCreepNo == undefined) {
        room.memory.forSpawning.roomCreepNo = {};
        room.memory.forSpawning.roomCreepNo.minCreeps = {};
        room.memory.forSpawning.roomCreepNo.creepEnergy = {};
        newInitiateBlankRoomCreepsSpawnInfo(room.name);
    }
    let roomSpawningInfo = room.memory.forSpawning.roomCreepNo;

    // structure memory for tasks id
    if (room.memory.structurePrototype == undefined) {
        room.memory.structurePrototype = {};
    }
    
    if (room.memory.taskMove == undefined) {
        room.memory.taskMove = {};
    }
    if (room.memory.taskE == undefined) {
        room.memory.taskE = {};
    }
    if (room.memory.taskGetE == undefined) {
        room.memory.taskGetE = {};
    }
    
    room.memory.ECap = room.energyCapacityAvailable;

    let spawningQueue = room.memory.forSpawning.spawningQueue;

    let imaginaryCreepsInRoom = creepsInRoom.concat(spawningQueue); // combine real creeps in room with creeps in spawning queue

    let NoOfCreeps = {};

    for (let role of listOfRoles) { // calculate number of creeps in current spawn room
        NoOfCreeps[role] = _.sum(imaginaryCreepsInRoom, (c) => c.memory.role == role && (c.ticksToLive == undefined || c.memory.spawnTime < c.ticksToLive));
    }

    let maxEnergy = room.energyCapacityAvailable;

    let fuckness = determineIfFucked(room)[1];

    if (fuckness < 50) { //(fuckness<1) { // fuckness, 18 equivilient to about 6 HEAL parts or 8 RANGED_ATTACK parts or 18 attack parts
        roomSpawningInfo.minCreeps['redneck'] = 0;
        roomSpawningInfo.minCreeps['ranger'] = 0;
        
        // endangered region
        let endangerFlag = room.find(FIND_MY_CREEPS, {filter: c=> c.memory.role == 'harvester' || c.memory.role == 'pickuper' || c.memory.role == 'lorry' || c.memory.role == 'loader' || c.memory.role == 'balancer' || c.memory.role == 'dickHead' || c.memory.role == 'maintainer' || c.memory.role == 'mover'});

        if (currentRCL>2 && endangerFlag.length<2 && room.find(FIND_MY_CREEPS).length<8) {
            room.memory.needRescue = true;
        }
        else {
            room.memory.needRescue = false;
        }
        
        if (room.memory.needRescue == true) {
            clearSpawnQueue(room.name);
            let sp = room.find(FIND_MY_STRUCTURES, {filter: c=>c.structureType == STRUCTURE_SPAWN})[0];
            if (room.storage) {
                fo(room.name + ' need recue lorry');
                sp.spawnCreep([MOVE, CARRY], randomIdGenerator(), { memory: { role: 'lorry', working: false, target: room.name, spawnTime: 3 * 2 }, directions: sp.getDefaultSpawningDir()});
            }
            else {
                // simple harvester
                sp.spawnCreep([WORK, MOVE, CARRY], randomIdGenerator(), { memory: { role: 'harvester', working: false, target: room.name, spawnTime: 3 * 2 }, directions: sp.getDefaultSpawningDir()});
            }
            room.memory.needRescue = false;
            return
        }
        
        if (creepsInRoom.length == 0) { // endanger situation
            if (room.energyCapacityAvailable < 550) { // early rooms
                let rescueMiner = _.sum(imaginaryCreepsInRoom, (c) => c.memory.role == 'miner' && (c.ticksToLive == undefined || c.memory.spawnTime < c.ticksToLive) && c.memory.ifRescue);
                if (rescueMiner < 1) {
                    let source = room.find(FIND_SOURCES)[0];
                    spawningQueue.push({ memory: { role: 'miner', sourceID: source.id, target: undefined, currentRCL: currentRCL, ifMineEnergy: true, ifLink: false, ifKeeper: false, ifRescue: true, ifEarly: true }, priority: rolePriority['miner']+10 });
                }
                let rescueMover = _.sum(imaginaryCreepsInRoom, (c) => c.memory.role == 'mover' && (c.ticksToLive == undefined || c.memory.spawnTime < c.ticksToLive) && c.memory.ifRescue);
                if (rescueMover < 1) {
                    spawningQueue.push({ memory: { role: 'mover', ifRescue: true, lvl: currentRCL }, priority: rolePriority['mover'] });
                }
            }
            else { // normal rooms
                if (_.some(creepsInRoom, c => c.memory.role == 'miner' || c.memory.role == 'pickuper')) {
                    //if (NoOfCreeps['miner'] > 0) {
                    console.log(this.name + ' added rescue lorry')
                    spawningQueue.push({ memory: { energy: 200, role: 'lorry', target: this.name }, priority: 15 });
                }
                else { // if no miner and no lorries, start with harvesters
                    console.log(this.name + ' added rescue harvester')
                    spawningQueue.push({ memory: { energy: 200, role: 'harvester' }, priority: 16 });
                }
            }
        }
        else { // back to normal
            if (room.energyCapacityAvailable < 550) { // early rooms
                let moverNum = _.sum(imaginaryCreepsInRoom, (c) => c.memory.role == 'mover' && (c.ticksToLive == undefined || c.memory.spawnTime < c.ticksToLive));
                if (moverNum < 2) {
                    spawningQueue.push({ memory: { role: 'mover', ifRescue: false, lvl: currentRCL }, priority: rolePriority['mover'] });
                }
                else {
                    let count = 0;
                    let sources = room.find(FIND_SOURCES);
                    if (!Game.rooms[room.name].memory.sourceTravelTime) { // if time takes to travel is undefined
                        // define sourceTravelTime
                        Game.rooms[room.name].memory.sourceTravelTime = {}
                        // calculate time for miner to travel to source
                        for (let source of sources) {
                            Game.rooms[room.name].memory.sourceTravelTime[source.id] = 3.14 * calculateTicksBetweenObjects(room.find(FIND_MY_STRUCTURES, { filter: s => s.structureType == STRUCTURE_SPAWN })[0], source);
                        }
                    }
                    else { // source travel time is defined, spwan miners
                        for (let source of sources) {
                            let sourceIndCount = 0
                            let minersNo = 0;
                            for (let miner of imaginaryCreepsInRoom) {
                                if (miner.memory.sourceID == source.id && miner.memory.role == 'miner') {
                                    minersNo ++;
                                }
                            }
                            
                            let sourcePosis = Memory.mapInfo[rn].eRes[source.id].posis
                            let minersRequired = sourcePosis.length;
                            if (minersRequired>2) {
                                sourceIndCount = 1-minersNo;
                                minersRequired = 2;
                            }
                            if (minersNo < minersRequired) {
                                spawningQueue.push({ memory: { role: 'miner', sourceID: source.id, target: undefined, currentRCL: currentRCL, ifMineEnergy: true, ifLink: false, ifKeeper: false, ifRescue: false, ifEarly: sourcePosis[sourceIndCount] }, priority: rolePriority['miner'] });
                                return
                            }
                        }
                        if (balanceNoLegWorkerAndMover(room)) {
                            /*earlyAndLateRemoteMiningManager(rn);
                            
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
                                        spawningQueue.push({memory:{role: 'longDistanceHarvester', target: earlyRoomName, energy: room.energyCapacityAvailable, home: rn} , priority: rolePriority['longDistanceHarvester']});
                                    }
                                }
                            }*/
                        }
                    }
                }
            }
            else { // late rooms
                let moverNum = _.sum(imaginaryCreepsInRoom, (c) => c.memory.role == 'mover' && (c.ticksToLive == undefined || c.memory.spawnTime < c.ticksToLive));
                let requiredMover = 2;
                if (room.storage) {
                    room.memory.forSpawning.roomCreepNo.minCreeps['attacker'] = 0;
                    requiredMover = 0;
                }
                if (moverNum < requiredMover) {
                    spawningQueue.push({ memory: { role: 'mover', ifRescue: false, lvl: currentRCL }, priority: rolePriority['mover'] });
                }
                else {
                    let sources = Memory.mapInfo[rn].eRes;
                    for (let sourceId in sources) {
                        let source = Game.getObjectById(sourceId);
                        if (!_.some(imaginaryCreepsInRoom, c => c.memory.role == 'miner'
                            && c.memory.sourceID == source.id
                            //&& (c.ticksToLive > (3 * 6 + Game.rooms[room.name].memory.sourceTravelTime[source.id]) || c.ticksToLive == undefined)
                            ))
                        { // if there is no miner going to THE source, and life is long enough for the next one to take place or live length is undefined (being spawned)
                                //console.log('need to spawn '+source.id+' in room '+room.name+' in advance');
                            if (room.memory.ECap >= 750) {
                                    //console.log('need to spawn '+source.id+' in room '+room.name+' in advance');
                                    console.log(this.name + ' added miner ' + source.id)
                                    spawningQueue.push({ memory: { role: 'miner', sourceID: source.id, target: undefined, currentRCL: currentRCL, ifMineEnergy: true, ifLink: true, ifKeeper: false, ifRescue: false, ifEarly: false }, priority: rolePriority['miner'] });
                            }
                            else {
                                console.log(this.name + ' added miner ' + source.id)
                                spawningQueue.push({ memory: { role: 'miner', sourceID: source.id, target: undefined, currentRCL: currentRCL, ifMineEnergy: true, ifLink: false, ifKeeper: false, ifRescue: false, ifEarly: false }, priority: rolePriority['miner'] });
                            }
                        }
                    }
                    
                    
                    let mineral = room.find(FIND_MINERALS)[0]; // find mineral deposite
                    let mtp = mineral.mineralType;
                    if (room.memory.mineralThresholds==undefined || (room.memory.mineralThresholds.currentMineralStats[mtp]<100000)) {
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
                    else {
                        fo(room.name + ' ' + mtp + ' exploding, stopped mineral mining');
                    }
                }
                if (balanceNoLegWorkerAndMover(room)) {
                    // AI in the current room's early state harvester mining
                    if (room.memory.earlyHarv) { // if early state mining is active
                        for (let earlyRoomName in room.memory.earlyHarv) {
                            let proceedEh = true
                            
                            let minNoOfEarlyHarverster = room.memory.earlyHarv[earlyRoomName];
                            
                            if (room.memory.earlyHarv[earlyRoomName] > 0) {
                                // check invader core
                                
                                if (Game.rooms[earlyRoomName]) {
                                    let creepsInEarlyRoom = Game.rooms[earlyRoomName].find(FIND_MY_CREEPS);
                                    var creepsInHomeAndRemoteRoom = imaginaryCreepsInRoom.concat(creepsInEarlyRoom);
                                    let invcs = Game.rooms[earlyRoomName].find(FIND_STRUCTURES, {filter: o=> o.structureType == STRUCTURE_INVADER_CORE});
                                    let invt = Game.rooms[earlyRoomName].find(FIND_STRUCTURES, {filter: c=>c.structureType == STRUCTURE_TOWER && c.owner.username=='Invader'});
                                    
                                    if (invt>0) {
                                        proceedEh = false;
                                    }
                                    else {
                                        let invt = Game.rooms[earlyRoomName].find(FIND_STRUCTURES, {filter: c=>c.structureType == STRUCTURE_TOWER && c.owner.username=='Invader'});
                                        if (invcs.length>0) {
                                            let noMelees = _.sum(creepsInHomeAndRemoteRoom, (c) => c.memory.role == 'melee' && c.memory.target == earlyRoomName);
                                            if (noMelees<1) {
                                                console.log(this.name+' added melee to attack invader core '+earlyRoomName)
                                                spawningQueue.push({memory:{role: 'melee', target: earlyRoomName, home: rn}, priority: rolePriority['melee']});
                                            }
                                            proceedEh = false;
                                        }
                                    }
                                }
                                else {
                                    let NoScouters = _.sum(imaginaryCreepsInRoom, (c) => c.memory.role == 'scouter' && c.memory.target == earlyRoomName);
                                    if (NoScouters<1) {
                                        console.log(this.name+' added scouter '+earlyRoomName)
                                        spawningQueue.push({memory:{role: 'scouter', target: earlyRoomName}, priority: rolePriority['scouter']});
                                    }
                                    var creepsInHomeAndRemoteRoom = imaginaryCreepsInRoom;
                                }
                            }
                            else {
                                proceedEh = false;
                            }
                            
                            if (proceedEh) {
                                let noOfEarlyHarverster = _.sum(creepsInHomeAndRemoteRoom, (c) => c.memory.role == 'longDistanceHarvester' && c.memory.target == earlyRoomName);
                
                                if ( noOfEarlyHarverster < minNoOfEarlyHarverster ) { // if not enough long distance harvesters, spawn {
                                    console.log(this.name+' added long distance harvester for '+earlyRoomName)
                                    spawningQueue.push({memory:{role: 'longDistanceHarvester', target: earlyRoomName, energy: room.energyCapacityAvailable, home: rn} , priority: rolePriority['longDistanceHarvester']});
                                }
                            }
                        }
                    }
                    // AI in the current room's remote mining neighbours /////////////////////////////////////////////////////////////////////////////////////
                    if (Game.cpu.bucket>6000){ // (room.memory.forSpawning.spawningQueue.length<6) { //}(spawningCreepName == undefined) { // if no creeps needed to spawn for the current room
                        if (room.memory.startRemoteMining == 1) { // 1 for remote miner mining, 0 for remote harvester mining
                            let remoteMiningRoomNames = Object.keys(room.memory.remoteMiningRoomNames);
                            if (room.memory.reremoteMiningRoomNames !=undefined && room.name!='E23S16') {
                                remoteMiningRoomNames = remoteMiningRoomNames.concat(Object.keys(room.memory.reremoteMiningRoomNames));

                            }
                            for (let remoteMiningRoomName of remoteMiningRoomNames) {
                                if (remoteMiningRoomName == 'E6S22'||remoteMiningRoomName == 'E7S22'||remoteMiningRoomName == 'E6S23'||remoteMiningRoomName == 'E3S22'||remoteMiningRoomName == 'E2S26'||remoteMiningRoomName == 'E5S24'||remoteMiningRoomName == 'E3S21'||remoteMiningRoomName == 'E8S21'||(Game.rooms[remoteMiningRoomName]&&Game.rooms[remoteMiningRoomName].controller==undefined)) {
                                    // pass
                                }
                                else if ( (Memory.mapInfo[remoteMiningRoomName].managedBy == undefined || Memory.mapInfo[remoteMiningRoomName].managedBy==room.name) && (determineIfRoomIsSuitableForRemoteMining(room, remoteMiningRoomName))) {
                                    if (room.memory.remoteAlarm==undefined || room.memory.remoteAlarm[remoteMiningRoomName] == undefined || (room.memory.remoteAlarm[remoteMiningRoomName] < Game.time)) {
                                        //console.log('scan all remoment mining rooms: '+remoteMiningRoomName);
                                        if ( Game.rooms[remoteMiningRoomName] == undefined ) { // if no creeps in romote mining room or no scouter for the remote mining room in current spawn room and target room, spawn a scouter
                                            // calculate No. of scouters in each reservable rooms around current spawn room, if no scouters there, spawn 1, if yes, send miners
                                            let NoScouters = _.sum(imaginaryCreepsInRoom, (c) => c.memory.role == 'scouter' && c.memory.target == remoteMiningRoomName);
                                            //console.log((Game.creeps[remoteMiningRoomName] == undefined) , (NoScouters<1),remoteMiningRoomName);
                                            if (NoScouters<1) {
                                                console.log(this.name+' added scouter '+remoteMiningRoomName)
                                                spawningQueue.push({memory:{role: 'scouter', target: remoteMiningRoomName}, priority: rolePriority['scouter']});
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
                                            
                                            // check invader core
                                            let invcs = Game.rooms[remoteMiningRoomName].find(FIND_STRUCTURES, {filter: o=> o.structureType == STRUCTURE_INVADER_CORE});
                                            // check rebuild
                                            if (Game.time%3333 == 0) {
                                                room.memory.reremoteMiningRoomNamesBuilt[remoteMiningRoomName] = false;
                                            }
                                            
                                            if (invcs.length>0) {
                                                let noMelees = _.sum(creepsInHomeAndRemoteRoom, (c) => c.memory.role == 'melee' && c.memory.target == remoteMiningRoomName);
                                                if (noMelees<1) {
                                                    console.log(this.name+' added melee to attack invader core '+remoteMiningRoomName)
                                                    spawningQueue.push({memory:{role: 'melee', target: remoteMiningRoomName, home: rn}, priority: rolePriority['melee']});
                                                }
                                                if (Game.rooms[remoteMiningRoomName]) { // if have vision, rebuild
                                                    if (room.memory.reremoteMiningRoomNamesBuilt == undefined) {
                                                        room.memory.reremoteMiningRoomNamesBuilt = {};
                                                    }
                                                    room.memory.reremoteMiningRoomNamesBuilt[remoteMiningRoomName] = false;
                                                }
                                                
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
                                                if (NoReservers < NoReserversRequired && ((Game.rooms[remoteMiningRoomName].controller == undefined) ||(Game.rooms[remoteMiningRoomName].controller.reservation==undefined)||(Game.rooms[remoteMiningRoomName].controller.reservation.ticksToEnd<2000)) ) { // if not enough reservers, spawn {
                                                    console.log(this.name+' added reserver '+remoteMiningRoomName)
                                                    spawningQueue.push({memory:{role: 'reserver', target: remoteMiningRoomName, big: bigReserver, roomEnergyMax: room.energyCapacityAvailable},priority: rolePriority['reserver']});
                                                    /*spawner = whichSpawnSpawns(this, subSpawn);
                                                    spawningCreepName = spawner.createReserver(remoteMiningRoomName);
                                                    if ((subSpawn!=undefined)&&(spawningCreepName==OK)) { // each time there is a creep successfully spawned, creeps in room need to be calculate again with the being-spawned creep added into the list
                                                    creepsInRoom = updateCreepsInRoomWithSpawning(this);
                                                    }*/
                                                }
                                            }
                                            else {
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
                                                    if (Game.rooms[remoteMiningRoomName].find(FIND_MY_CONSTRUCTION_SITES, { filter: o => o.structureType == STRUCTURE_CONTAINER || STRUCTURE_ROAD }).length > 0 && NoLongDistanceBuilders < 1) { // if not enough long distance builders, spawn
                                                        //if ( NoLongDistanceBuilders < roomSpawningInfo.minNoRemoteBuilders[i]) { // if not enough long distance builders, spawn
                                                        console.log(this.name+' added longDistanceBuilder '+remoteMiningRoomName)
                                                        spawningQueue.push({memory:{role: 'longDistanceBuilder', energy: 400, target: remoteMiningRoomName, home: rn},priority: rolePriority['longDistanceBuilder']});
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
                                                        if (NoReservers < NoReserversRequired && ((Game.rooms[remoteMiningRoomName].controller == undefined) ||(Game.rooms[remoteMiningRoomName].controller.reservation==undefined)||(Game.rooms[remoteMiningRoomName].controller.reservation.ticksToEnd<2000)) ) { // if not enough reservers, spawn {
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
                                                                    ) ) {
                                                                        console.log(this.name + ' added remote miner ' + remoteMiningRoomName, source.id)
                                                                        spawningQueue.push({ memory: { role: 'miner', sourceID: source.id, target: remoteMiningRoomName, currentRCL: 0, ifMineEnergy: true, ifLink: false, ifKeeper: false }, priority: rolePriority['miner'] });
                                                                    }
                                                                }
                                                                
                                                                // only start lorries when room is built
                                                                if ( findTotolNumberOfStructure(Game.rooms[remoteMiningRoomName], STRUCTURE_CONTAINER)>0 ) {
                        
                                                                    // calculate No. of lorries in each reservable rooms around current spawn room
                                                                    let NoLongDistanceLorries = _.sum(creepsInHomeAndRemoteRoom, (c) => c.memory.role == 'longDistanceLorry' && c.memory.target == remoteMiningRoomName);
                                                     
                                                                    if (roomSpawningInfo.minNoRemoteLorries == undefined || (Game.time % 277 == 0) || roomSpawningInfo.minNoRemoteLorries[remoteMiningRoomName] == undefined) { // not calculated # of remote lorries, calculate it now
                                                                    //if (true) {
                                                                        //roomSpawningInfo.minNoRemoteLorries = [];
                                                                        console.log(room.name + ' updated its remote lorry numbers')
                                                                        if (!roomSpawningInfo.minNoRemoteLorries) {
                                                                            roomSpawningInfo.minNoRemoteLorries = {};
                                                                        }
                                                                        roomSpawningInfo.minNoRemoteLorries[remoteMiningRoomName] = initiateNoOfRemoteLorries(sources.length, Game.rooms[remoteMiningRoomName].memory.sourceTravelTime, room.energyCapacityAvailable);
                            
                                                                        // if rooms has too many dropped energy, send an extra lorry
                                                                        let remoteMiners = Game.rooms[remoteMiningRoomName].find(FIND_MY_CREEPS, {filter: c=>c.memory.role=='miner'});
                                                                        let accumedSpareTime = 0;
                                                                        let mineno = 0;
                                                                        for (let remoteMiner of remoteMiners) {
                                                                            if (remoteMiner.memory.spareTime) {
                                                                                accumedSpareTime += remoteMiner.memory.spareTime;
                                                                            }
                                                                            mineno += 1;
                                                                        }
                                                                        if (mineno > 0) {
                                                                            accumedSpareTime = accumedSpareTime/mineno;
                                                                        }
                                                                        
                                                                        if (accumedSpareTime > 0) {
                                                                            if (accumedSpareTime > 600) {
                                                                                roomSpawningInfo.minNoRemoteLorries[remoteMiningRoomName] += 1;
                                                                            }
                                                                            else if (accumedSpareTime<100) {
                                                                                roomSpawningInfo.minNoRemoteLorries[remoteMiningRoomName] -= 1;
                                                                            }
                                                                            if (roomSpawningInfo.minNoRemoteLorries[remoteMiningRoomName] < 1) {
                                                                                roomSpawningInfo.minNoRemoteLorries[remoteMiningRoomName] = 1;
                                                                            }
                                                                            if (roomSpawningInfo.minNoRemoteLorries[remoteMiningRoomName] > 6) {
                                                                                roomSpawningInfo.minNoRemoteLorries[remoteMiningRoomName] = 6;
                                                                            }
                                                                        }
                                                                        if (currentRCL < 7) {
                                                                            roomSpawningInfo.minNoRemoteLorries[remoteMiningRoomName] = Math.floor(roomSpawningInfo.minNoRemoteLorries[remoteMiningRoomName] * 1.45 * (Math.exp(Game.cpu.bucket/10000)-1)/(Math.exp(1)-1));
                                                                        }
                                                                        else {
                                                                            roomSpawningInfo.minNoRemoteLorries[remoteMiningRoomName] = Object.keys(Memory.mapInfo[remoteMiningRoomName].eRes).length;
                                                                        }
                                                                    }
                                                                    else if (NoLongDistanceLorries < roomSpawningInfo.minNoRemoteLorries[remoteMiningRoomName]) {
                                                                        let lorryEnergySpent = Math.min(room.energyCapacityAvailable * .875,1933);
                                                                        if (currentRCL < 7) {
                                                                            lorryEnergySpent = Math.min(room.energyCapacityAvailable, 800);
                                                                        }
                            
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
                                                                else {
                                                                    if (room.memory.reremoteMiningRoomNamesBuilt[remoteMiningRoomName] != undefined) {
                                                                        room.memory.reremoteMiningRoomNamesBuilt[remoteMiningRoomName] = false;
                                                                    }
                                                                    else {
                                                                        room.memory.remoteMiningRoomNames[remoteMiningRoomName].subRoomRoadReady = false;
                                                                    }
                                                                    fo(remoteMiningRoomName + ' wait for infanstrcuture to be completed.')
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
                                                        if (room.memory.remoteAlarm == undefined) {
                                                            room.memory.remoteAlarm = {};
                                                        }
                                                        else {
                                                            let fkers = room.find(FIND_HOSTILE_CREEPS, {filter: o=> (o.getActiveBodyparts(ATTACK)+o.getActiveBodyparts(RANGED_ATTACK)+o.getActiveBodyparts(HEAL)>0)});
                                                            let timer = 1500;
                                                            if (fkers.length>0 && fkers[0]) {
                                                                timer = fkers[0].ticksToLive;
                                                            }
                                                            room.memory.remoteAlarm[remoteMiningRoomName] = Game.time + timer;
                                                        }
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
                                    else {
                                        if (Game.time%77==0) {
                                            fo(remoteMiningRoomName + ' is waiting for invaders to go away, reassigned ldl to other remote rooms');
                                        }
                                        for (let crna in Game.creeps) {
                                            let crn = Game.creeps[crna];
                                            if (crn.memory.role == 'longDistanceLorry' && crn.memory.target == remoteMiningRoomName) {
                                                crn.memory.target = remoteMiningRoomNames[Math.floor(Math.random() * remoteMiningRoomNames.length)];
                                            }
                                        }
                                    }
                                }
                                else {
                                    fo(room.name + 'remote overlap wrong management ' + remoteMiningRoomName);
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
                                                    if (_.sum(allMyCreepsWithSpawningAndQueueInCurrentRoom, (c) => c.memory.role == 'longDistanceBuilder' && c.memory.target == keeperMiningRoomName) < pioneerNo) { // create pioneer as repairer
                                                        console.log('Remote middle room mining added ldl builder repairer ' + keeperMiningRoomName);
                                                        spawningQueue.push({memory:{role: 'longDistanceBuilder', energy: pioneerE, target: keeperMiningRoomName, home: room.name},priority: rolePriority['longDistanceBuilder']});
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
                            let allMyCreepsWithSpawningAndQueueInCurrentRoom = getAllMyCreepsWithSpawning(room.name).concat(spawningQueue);

                            if (middleRoomName) { // if it is defined
                                let middleRoom = Game.rooms[middleRoomName];
                                let allSafe = true;
                                
                                if (room.memory.middleRoomByPass==undefined) {
                                    // need to find route better
                                    if (room.name == 'E24S27') {
                                        room.memory.middleRoomByPass = ['E24S25', 'E25S26'];
                                        //room.memory.middleRoomByPass = ['E24S26', 'E24S25'];
                                    }
                                }
                                else {
                                    for (let midpassrn of room.memory.middleRoomByPass) {
                                        if (Memory.rooms[middleRoomName] && Memory.rooms[middleRoomName].avoid) {
                                            allSafe = false;
                                            break;
                                        }
                                        else {
                                            let midpassr = Game.rooms[midpassrn];
                                            if (midpassr) {
                                                [ifAdd, creepsToAdd] = calculateMyCreepsInRoom(midpassrn);
                                                if (ifAdd) {
                                                    allMyCreepsWithSpawningAndQueueInCurrentRoom = allMyCreepsWithSpawningAndQueueInCurrentRoom.concat(creepsToAdd);
                                                }
                                                let cssby = midpassr.find(FIND_MY_CONSTRUCTION_SITES);
                                                if (cssby.length>0) {
                                                    if (_.sum(allMyCreepsWithSpawningAndQueueInCurrentRoom, (c) => c.memory.role == 'longDistanceBuilder' && c.memory.target == midpassrn) < 1) { // create pioneer as repairer
                                                        console.log('Remote middle room mining added ldl builder repairer ' + middleRoomName);
                                                        spawningQueue.push({memory:{role: 'longDistanceBuilder', energy: 1800, target: midpassrn, home: room.name},priority: rolePriority['longDistanceBuilder']});
                                                    }
                                                }
                                            }
                                            else {
                                                // send scout
                                                let noOfMiddleRoomScouter = _.sum(allMyCreepsWithSpawningAndQueueInCurrentRoom, (c) => c.memory.role == 'scouter' && c.memory.target == midpassrn);
                                                //console.log(keeperMiningRoomName,noOfKeeperLairMeleeKeeper)
                                                if (noOfMiddleRoomScouter < 1 ) {
                                                    console.log(room.name+' middle remote middle mining added bypass vision scouter ' +midpassrn);
                                                    spawningQueue.push({memory:{role: 'scouter', target: midpassrn},priority: rolePriority['scouter']});
                                                }
                                            }
                                        }
                                    }
                                }

                                if (allSafe) {
                                    if (Memory.rooms[middleRoomName] == undefined) { // never visited before
                                        // send scout
                                        let noOfMiddleRoomScouter = _.sum(allMyCreepsWithSpawningAndQueueInCurrentRoom, (c) => c.memory.role == 'scouter' && c.memory.target == middleRoomName);
                                        //console.log(keeperMiningRoomName,noOfKeeperLairMeleeKeeper)
                                        if (noOfMiddleRoomScouter < 1 ) {
                                            console.log(room.name+' remote middle mining added all safe scouter ' +middleRoomName);
                                            spawningQueue.push({memory:{role: 'scouter', target: middleRoomName},priority: rolePriority['scouter']});
                                        }
                                    }
                                    else { // visited before
                                        if (middleRoom) { // have vision continue
                                            if (Memory.rooms[middleRoomName] && !Memory.rooms[middleRoomName].avoid) { // if room in not invaded
                                                if (middleRoom) {
                                                    //var creepsInmiddleRoom = middleRoom.find(FIND_MY_CREEPS);
                                                    let invaderNum = determineIfRoomInvaded(middleRoom);
                                                    if (invaderNum == 0 || (room.memory.middleRoomTimer==undefined || room.memory.middleRoomTimer<Game.time)) { // if no invader
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
                                                                                && (c.ticksToLive > (middleRoom.memory.sourceTravelTime[source.id])*3/5 || c.ticksToLive == undefined))) {
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
                                                            if (_.sum(allMyCreepsWithSpawningAndQueueInCurrentRoom, (c) => c.memory.role == 'longDistanceBuilder' && c.memory.target == middleRoomName) < 1) { // create pioneer as repairer
                                                                console.log('Remote middle room mining added ldl builder repairer ' + middleRoomName);
                                                                spawningQueue.push({memory:{role: 'longDistanceBuilder', energy: 800, target: middleRoomName, home: room.name},priority: rolePriority['longDistanceBuilder']});
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
                                                            
                                                            let ctns = middleRoom.find(FIND_STRUCTURES, {filter:c=>c.structureType==STRUCTURE_CONTAINER});
                                                            
                                                            if (ctns.length>1) {
                                                            
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
                                                                    /*
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
                                                                    */
                                                                }
                                                            }
                                                            else {
                                                                fo(middleRoomName + ' middle room wait for container to finish');
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
                                                        console.log(room.name+' creates remote middle mining added vision 2 scouter ' +middleRoomName);
                                                        spawningQueue.push({memory:{role: 'scouter', target: middleRoomName},priority: rolePriority['scouter']});
                                                    }
                                                }
                                            }
                                            else { // room invaded
                                                let invaderNum = determineIfRoomInvaded(middleRoom);
                                                if (invaderNum == 0) { // if no invader
                                                    room.memory.middleRoomTimer = Game.time-1;
                                                }
                                                else {
                                                    console.log('middle room fucked '+middleRoomName+' sending invader killers group');
                                                    
                                                    room.memory.middleRoomTimer = Game.time + 1100;
                                                    
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
                                                fo(middleRoomName + ' middle room mining waiting for stronghold to despawn');
                                            }
                                        }
                                        else { // room no vision
                                            if ((Memory.rooms[middleRoomName] && Memory.rooms[middleRoomName].avoid) || Game.time%1500==0) { // if there is avoid
                                                if (room.memory.middleRoomTimer==undefined || room.memory.middleRoomTimer<Game.time) { // in no invader timer or time up
                                                    // send scout
                                                    let noOfMiddleRoomScouter = _.sum(allMyCreepsWithSpawningAndQueueInCurrentRoom, (c) => c.memory.role == 'scouter' && c.memory.target == middleRoomName);
                                                    //console.log(keeperMiningRoomName,noOfKeeperLairMeleeKeeper)
                                                    if (noOfMiddleRoomScouter < 1 ) {
                                                        console.log(room.name+' creates remote middle mining added avoid scouter ' +middleRoomName);
                                                        spawningQueue.push({memory:{role: 'scouter', target: middleRoomName},priority: rolePriority['scouter']});
                                                    }
                                                }
                                                else {
                                                    // wait for timer to do down
                                                }
                                            }
                                        }
                                    }
                                }
                                else {
                                    if ((Memory.rooms[middleRoomName] && Memory.rooms[middleRoomName].avoid) || Game.time%1500==0) { // if there is avoid
                                        if (room.memory.middleRoomTimer==undefined || room.memory.middleRoomTimer<Game.time) { // in no invader timer or time up
                                            // send scout
                                            let noOfMiddleRoomScouter = _.sum(allMyCreepsWithSpawningAndQueueInCurrentRoom, (c) => c.memory.role == 'scouter' && c.memory.target == middleRoomName);
                                            //console.log(keeperMiningRoomName,noOfKeeperLairMeleeKeeper)
                                            if (noOfMiddleRoomScouter < 1 ) {
                                                console.log(room.name+' creates remote middle mining added danger scouter ' +middleRoomName);
                                                spawningQueue.push({memory:{role: 'scouter', target: middleRoomName},priority: rolePriority['scouter']});
                                            }
                                        }
                                        else {
                                            // wait for timer to do down
                                        }
                                    }
                                    else {
                                        fo(middleRoomName + ' middle room mining waiting for by pass room stronghold to despawn');
                                    }
                                }
                            }
                        }
            
                        // keeper room only mineral mining code section:
                        if (room.memory.mineralThresholds.currentMineralStats.energy>80000) {
                            let onlyMineralRoomNameAndTime = room.memory.onlyMineralInfo;
                            if (onlyMineralRoomNameAndTime) { // if it is defined
                                for (let onlyMineralRoomName in onlyMineralRoomNameAndTime) {
                                    let mineralCD = onlyMineralRoomNameAndTime[onlyMineralRoomName];
                                    // if room has been accessed before
                                    if (Memory.rooms[onlyMineralRoomName] && (!Memory.rooms[onlyMineralRoomName].avoid) && Memory.rooms[onlyMineralRoomName].hasOwnProperty('isSafe') && Memory.rooms[onlyMineralRoomName]['invaderCountDown'] && Memory.rooms[onlyMineralRoomName]['mineralCountDown']) {
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
                                        if (Memory.rooms[onlyMineralRoomName]==undefined) {
                                            Memory.rooms[onlyMineralRoomName] = {};
                                        }
                                        Memory.rooms[onlyMineralRoomName].isSafe = true;
                                        Memory.rooms[onlyMineralRoomName].invaderCountDown = 1;
                                        Memory.rooms[onlyMineralRoomName].mineralCountDown = 1;
                                    }
            
                                    // if mineral and invader count down reached, spawn
                                    if ((!Memory.rooms[onlyMineralRoomName].avoid) && (Memory.rooms[onlyMineralRoomName]['mineralCountDown'] - 150 < Game.time) && (Memory.rooms[onlyMineralRoomName]['invaderCountDown'] - 150 < Game.time)) {
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
            }
        }

        if (true) { // }(spawningCreepName == undefined) { // no energy problem, start other creeps building
            if (room.storage) { // superupgrader
                if (room.storage.store.energy<100000) {
                    rolePriority['superUpgrader'] = 0.01;
                }
                else if (room.storage.store.energy>400000) {
                    rolePriority['superUpgrader'] = 8;
                }
            }
            
            /*if (Game.cpu.bucket<9500) {
                roomSpawningInfo.minCreeps['superUpgrader'] = Math.min(1, roomSpawningInfo.minCreeps['superUpgrader']);
            }*/
            
            // normal roles
            for (let role of listOfRoles) {
                if (NoOfCreeps[role] < roomSpawningInfo.minCreeps[role]) { // loop through every roles and check with min number. if not enough, spawn other creeps
                    console.log(this.name + ' added ' + role + '.');
                    let creepEnergyCost = roomSpawningInfo.creepEnergy[role];
                    if (!creepEnergyCost || creepEnergyCost == 0) {
                        creepEnergyCost = room.memory.ECap;
                    }
                    spawningQueue.push({ memory: { energy: creepEnergyCost, role: role, target: room.name, RCL: currentRCL, energyMax: room.energyCapacityAvailable }, priority: rolePriority[role] });
                }
            }
            
            // maintainers
            if (currentRCL==7 && room.find(FIND_MY_STRUCTURES, {filter:s=>s.structureType==STRUCTURE_SPAWN}).length>1) {
                if (room.memory.maintainerCheck == undefined) {
                    room.memory.maintainerCheck = [false, false, false, true, true, true];
                }
                for (let checkerInd in room.memory.maintainerCheck) {
                    if (room.memory.maintainerCheck[checkerInd] == false) {
                        let posiNum = parseInt(checkerInd)+1;
                        spawningQueue.push({ memory: { role: 'maintainer', posiNum: posiNum }, priority: rolePriority['maintainer'] });
                        room.memory.maintainerCheck[checkerInd] = true;
                        fo(room.name + ' spawn maintainer ' + posiNum);
                    }
                }
            }
            else if (currentRCL==8 && room.find(FIND_MY_STRUCTURES, {filter:s=>s.structureType==STRUCTURE_SPAWN}).length>2) {
                if (room.memory.maintainerCheck == undefined) {
                    room.memory.maintainerCheck = [false, false, false, false, false, false];
                }
                let anch = room.memory.anchor;
                if (anch == undefined) {
                    anch = room.memory.newAnchor;
                }
                let numToPos = [[anch.x-3, anch.y-2],[anch.x-3, anch.y-4],[anch.x-1, anch.y-4],[anch.x+1, anch.y-4],[anch.x+3, anch.y-4],[anch.x+3, anch.y-2]];
                for (let checkerInd in room.memory.maintainerCheck) {
                    if (room.lookForAt(LOOK_TERRAIN, numToPos[checkerInd][0], numToPos[checkerInd][1]) == 'wall') {
                        room.memory.maintainerCheck[checkerInd] = true;
                    }
                    else if (room.memory.maintainerCheck[checkerInd] == false || room.find(FIND_MY_CREEPS, {filter: c=>c.memory.role=='maintainer'&&c.memory.posiNum==parseInt(checkerInd)+1}).length<1) {
                        let posiNum = parseInt(checkerInd)+1;
                        spawningQueue.push({ memory: { role: 'maintainer', posiNum: posiNum }, priority: rolePriority['maintainer'] });
                        room.memory.maintainerCheck[checkerInd] = true;
                        fo(room.name + ' spawn maintainer ' + posiNum);
                    }
                    
                }
            }
            
            // high way roles
            let hws = room.memory.highways
            if (hws && Game.cpu.bucket>5000) {
                for (let hwPurp in hws) {
                    let hw = hws[hwPurp]
                    if (hw) {
                        let numDriver = hw.no;
                        let purp = hwPurp;
                        let proceed = true;
                        if (purp == 'upgrade') {
                            if (room.memory.forSpawning.roomCreepNo.minCreeps['superUpgrader']>1) { // (NoOfCreeps['superUpgrader']>1) {
                                // proceed
                                rolePriority['driver'] = rolePriority['superUpgrader'] - 0.001;
                            }
                            else {
                                proceed = false;
                            }
                        }
                        if (proceed) {
                            let nowHas =  _.sum(imaginaryCreepsInRoom, (c) => c.memory.role == 'driver' && (c.ticksToLive == undefined || c.memory.spawnTime < c.ticksToLive) && c.memory.purp == purp);
                            let edrive = 200;
                            if (currentRCL==8) {
                                edrive = 100;
                            }
                            else if (currentRCL>6) {
                                edrive = Math.max(300, 400*room.memory.forSpawning.roomCreepNo.minCreeps['superUpgrader']);
                            }
                            else if (currentRCL>5) {
                                edrive = Math.max(300, 250*room.memory.forSpawning.roomCreepNo.minCreeps['superUpgrader']);
                            }
                            else if (currentRCL > 4) {
                                edrive = 300;
                            }
                            if (nowHas < numDriver) {
                                spawningQueue.push({ memory: { energy: edrive, role: 'driver', purp: purp, path: hw.path, from: hw.from, to: hw.to }, priority: rolePriority['driver'] });
                                console.log(this.name + ' added ' + purp + ' driver.');
                            }
                        }
                    }
                }
            }
        }
    }
    else if (fuckness > 300) { // seriously fucked!!! send good defenders!
        roomSpawningInfo.minCreeps['redneck'] = 2;
        // repairer
        // cancel other spawning

        console.log('Base ' + room.name + ' is under fucked (' + fuckness + ')! Sending rednecks...');

        for (let role of ['lorry', 'pickuper', 'redneck']) {
            if (NoOfCreeps[role] < roomSpawningInfo.minCreeps[role]) { // loop through every roles and check with min number. if not enough, spawn other creeps
                console.log(this.name + ' added ' + role + '.');
                let creepEnergyCost = roomSpawningInfo.creepEnergy[role];
                if (!creepEnergyCost || creepEnergyCost == 0) {
                    creepEnergyCost = room.memory.ECap;
                }
                spawningQueue.push({ memory: { energy: creepEnergyCost, role: role, target: room.name, RCL: currentRCL, energyMax: room.energyCapacityAvailable }, priority: rolePriority[role] });
            }
        }
        //spawningQueue.push({memory:{role: 'attacker', energy: 1000, target: room.name},priority: rolePriority['attacker']});
        /*spawner = whichSpawnSpawns(this, subSpawn);
        spawningCreepName = spawner.createAttacker(room.energyAvailable*0.5, room.name);*/
    }
    else { // slightly fucked
        let defRole = 'ranger';
        roomSpawningInfo.minCreeps[defRole] = Math.floor(fuckness/99);
        // repairer
        // cancel other spawning

        console.log('Base ' + room.name + ' is under danger (' + fuckness + ')! Sending ' + defRole + 's...');

        for (let role of [defRole]) {
            if (NoOfCreeps[role] < roomSpawningInfo.minCreeps[role]) { // loop through every roles and check with min number. if not enough, spawn other creeps
                console.log(this.name + ' added ' + role + '.');
                let creepEnergyCost = roomSpawningInfo.creepEnergy[role];
                if (!creepEnergyCost || creepEnergyCost == 0) {
                    creepEnergyCost = room.memory.ECap;
                }
                fo('added 1 ' + defRole);
                room.memory.forSpawning.spawningQueue.push({ memory: { energy: creepEnergyCost, role: role, target: room.name, home: room.name, RCL: currentRCL, energyMax: room.energyCapacityAvailable }, priority: 255 });
            }
        }
    }
}

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

    let fuckness = determineIfFucked(room)[1];

    if (fuckness < 50) { //(fuckness<1) { // fuckness, 18 equivilient to about 6 HEAL parts or 8 RANGED_ATTACK parts or 18 attack parts
        // AI in the current spawn's remote mining neighbours /////////////////////////////////////////////////////////////////////////////////////
        // back up code if wiped, from energy taking creeps first: miners, lorries, harvesters
        //towerRepairInPeace(room);
        roomSpawningInfo.minCreeps['redneck'] = 0;
        roomSpawningInfo.minCreeps['ranger'] = 0;

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
                                if (room.energyAvailable >= 750) {
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
            if (room.memory.startRemoteMining == 1) { // 1 for remote miner mining, 0 for remote harvester mining
                let neighbourRoomNames = room.memory.remoteMiningRoomNames;
                var indx = 0
                for (let remoteMiningRoomName in neighbourRoomNames) {
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
                            
                            // if container destroyed build container first
                            let containersRequired = Object.keys(Memory.mapInfo[remoteMiningRoomName].eRes).length;
                            let containersCount = Game.rooms[remoteMiningRoomName].find(FIND_MY_CONSTRUCTION_SITES, {filter: o=>o.structureType == STRUCTURE_CONTAINER}).length + Game.rooms[remoteMiningRoomName].find(FIND_STRUCTURES, {filter: o=>o.structureType == STRUCTURE_CONTAINER}).length;
                            if (containersCount<containersRequired){
                                room.memory.remoteMiningRoomNames[remoteMiningRoomName].subRoomRoadReady = false;
                            }
                            if (Game.rooms[remoteMiningRoomName].find(FIND_MY_CONSTRUCTION_SITES, { filter: o => o.structureType == STRUCTURE_CONTAINER || STRUCTURE_ROAD }).length > 0 && NoLongDistanceBuilders < 1) { // if not enough long distance builders, spawn
                                //if ( NoLongDistanceBuilders < roomSpawningInfo.minNoRemoteBuilders[i]) { // if not enough long distance builders, spawn
                                console.log(this.name+' added longDistanceBuilder '+remoteMiningRoomName)
                                spawningQueue.push({memory:{role: 'longDistanceBuilder', energy: 400, target: remoteMiningRoomName, home: rn},priority: rolePriority['longDistanceBuilder']});
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
                                if (NoReservers < NoReserversRequired && ((Game.rooms[remoteMiningRoomName].controller == undefined) ||(Game.rooms[remoteMiningRoomName].controller.reservation==undefined)||(Game.rooms[remoteMiningRoomName].controller.reservation.ticksToEnd<2000)) ) { // if not enough reservers, spawn {
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
                                            if (!roomSpawningInfo.minNoRemoteLorries) {
                                                roomSpawningInfo.minNoRemoteLorries = {};
                                            }
                                            roomSpawningInfo.minNoRemoteLorries[remoteMiningRoomName] = initiateNoOfRemoteLorries(sources.length, Game.rooms[remoteMiningRoomName].memory.sourceTravelTime, room.energyCapacityAvailable);

                                            // if rooms has too many dropped energy, send an extra lorry
                                            let droppedResources = Game.rooms[remoteMiningRoomName].find(FIND_DROPPED_RESOURCES);
                                            if (droppedResources.length > 0) {
                                                let droppedAmount = 0;
                                                for (let droppedResource of droppedResources) {
                                                    droppedAmount += droppedResource.amount;
                                                }
                                                if (droppedAmount > 4500) {
                                                    roomSpawningInfo.minNoRemoteLorries[indx] += 3;
                                                }
                                                else if (droppedAmount >3000) {
                                                    roomSpawningInfo.minNoRemoteLorries[indx] += 2;
                                                }
                                                else if (droppedAmount > 1500) {
                                                    roomSpawningInfo.minNoRemoteLorries[indx] += 1;
                                                }
                                            }
                                        }
                                        else if (NoLongDistanceLorries < roomSpawningInfo.minNoRemoteLorries[indx]) {
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
                    indx += 1;
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
    else if (fuckness>300) { // seriously fucked!!! send good defenders!
        roomSpawningInfo.minCreeps['redneck'] = 1;
        roomSpawningInfo.minCreeps['superUpgrader'] = 0;
        // repairer
        // cancel other spawning
        
        if (Game.time%47==0) {
            console.log('Base ' + room.name + ' is under fucked (' + fuckness + ')! Sending rednecks...');
        }
        for (let role of ['lorry', 'pickuper', 'redneck']) {
            if (NoOfCreeps[role] < roomSpawningInfo.minCreeps[role]) { // loop through every roles and check with min number. if not enough, spawn other creeps
                console.log(this.name + ' added ' + role + '.');
                let creepEnergyCost = roomSpawningInfo.creepEnergy[role];
                if (!creepEnergyCost || creepEnergyCost == 0) {
                    creepEnergyCost = room.memory.ECap;
                }
                spawningQueue.push({ memory: { energy: creepEnergyCost, role: role, target: room.name, RCL: currentRCL, energyMax: room.energyCapacityAvailable }, priority: rolePriority[role] });
            }
        }
        //spawningQueue.push({memory:{role: 'attacker', energy: 1000, target: room.name},priority: rolePriority['attacker']});
        /*spawner = whichSpawnSpawns(this, subSpawn);
        spawningCreepName = spawner.createAttacker(room.energyAvailable*0.5, room.name);*/
    }
    else { // slightly fucked
        let defRole = 'ranger';
        roomSpawningInfo.minCreeps[defRole] = Math.floor(fuckness/100);
        // repairer
        // cancel other spawning

        console.log('Base ' + room.name + ' is under danger (' + fuckness + ')! Sending '+defRole+'s...');
        for (let role of ['lorry', 'pickuper', defRole]) {
            if (NoOfCreeps[role] < roomSpawningInfo.minCreeps[role]) { // loop through every roles and check with min number. if not enough, spawn other creeps
                console.log(this.name + ' added ' + role + '.');
                let creepEnergyCost = roomSpawningInfo.creepEnergy[role];
                if (!creepEnergyCost || creepEnergyCost == 0) {
                    creepEnergyCost = room.memory.ECap;
                }
                fo('added 1 ' + defRole);
                spawningQueue.push({ memory: { energy: creepEnergyCost, role: role, target: room.name, home: room.name, RCL: currentRCL, energyMax: room.energyCapacityAvailable }, priority: 11.5 });
            }
        }
    }
}
