// https://www.youtube.com/watch?v=BiIDH2Ui8L8&t=294s
// https://github.com/lodash/lodash/blob/3.10.1/doc/README.md
// GCL calculation: https://docs.google.com/spreadsheets/d/1Q6MfwRZb4kood_OE5_vwcIJgIzZUsx4-haWphEw6GqI/edit#gid=0

require('prototype.spawn');
require('prototype.creep');
require('prototype.tower');
require('prototype.room');
require('myFunctions');
require('funcAlly');
require('myTrading');
require('functionSpawn');
require('functionLab');
require('functionPathFinding');
var Traveler = require('Traveler');
require('functionKeeperMining');
require('functionObserve');
require('functionWar');
require('functionRemoteMining');
require('funcExpand');
require('funcBuildingPlanner')

//const profiler = require('screeps-profiler');
//profiler.enable();

module.exports.loop = function () {

    //profiler.wrap(function() {

        //assignController()

        //console.log('=== '+Game.time+' ticks === '+Game.cpu.bucket+' CPUs left ============================================================================')
        let previousCPU = 0;

        // clear memory
        for (let name in Memory.creeps) {
            if (Game.creeps[name] == undefined) {
                delete Memory.creeps[name];
            }
            else if (_.isEmpty(Game.creeps[name].memory)) {
                unpackCreepMemory(name);
            }
        }

        // let different creep do its job
        for (let name in Game.creeps) {
            /*if (Game.creeps[name].memory.spawnTime == undefined||Game.creeps[name].memory.spawnTime == null) {
                Game.creeps[name].memory.spawnTime = 3*Game.creeps[name].getActiveBodyparts();
            }*/
            let thisCreep = Game.creeps[name];
            if (!thisCreep.spawning) {
                thisCreep.runRole();
            }
            //previousCPU = calculateCPUUsageOfProcesses(previousCPU, thisCreep.memory.role, true);
        }
        previousCPU = calculateCPUUsageOfProcesses(previousCPU, 'Run all roles');

        // loop through rooms over shard
        //currentShard = Game.shard.name;
        //currentShardRooms = Memory.myRoomList;

        // temp section for tower placing
        /*if (currentShard == 'shard1') {
            Game.rooms.E45N2.createConstructionSite(36,7,STRUCTURE_TOWER);
        }*/
        
        // place a site
        /*
        try {
            if (currentShard == 'shard2') {
                Game.rooms.E46S6.createConstructionSite(9, 17, STRUCTURE_CONTAINER);
                //Game.rooms.E46S6.createConstructionSite(34, 16, STRUCTURE_CONTAINER);
            }
        }
        catch (err) {
            console.log('error: E31S6 construction placement wrong.');
        }*/

        var towers = _.filter( Game.structures, c => c.structureType == STRUCTURE_TOWER );
                for (let tower of towers) {
                    tower.defend();
                }

        _.forEach(Game.rooms, function (r) {
            if (r.controller.my) {
                
    
            let roomName = r.name;
                let room = r;
                if (room) {
                    // separate shooter and normal room management
                    let motherRoomName = room.memory.startMB;
                    if (!motherRoomName) { // normal room
                        //cacheLabsInAndOut(roomName); // for lab caching
                        //initiateLinksInRoom(room); // for links caching
                        //initiateCreepsSpawnInfo(roomName);
    
                        // initial mineral storage variables
                        initiateMineralKeepThresholdInRoom(room, false);
                        if (Game.time % 1 == 0) {
                            allMineralsSituation(room);
                        }
    
                        // link transfer
                        //previousCPU = calculateCPUUsageOfProcesses(previousCPU, ' link transfer cost of '+roomName);
                        try {
                            linkTransfer(room);
                        }
                        catch (err) {
                            console.log(room.name + ' link transfer error');
                        }
                        //previousCPU = calculateCPUUsageOfProcesses(previousCPU, ' link transfer cost of '+roomName,true);
    
                        if (updateSpawnQueueTimer(room)) {
                            //if (Game.time % 11 == 0) { //
                            //if (true) {
                            room.updateSpawnQueue();
                        }
                        if (room.memory.forSpawning.spawningQueue.length > 0 && ifSpawnAvailable(roomName).length > 0) { // if there is some creeps waiting to be spawned in the queue and spawn is free, then spawn
                            spawnCreepByRoomSpawnQueue(room);
                        }
    
                        if (determineIfFucked(room)[0] < 1) {
                            towerRepairInPeace(room);
                        }
    
                        // manage remote resource getting order and assign tasks to remote lorries
                        manageRemoteRoomsResourceGetting(roomName);
                            
                        try {
                            powerHarvestingAndScanningMaintainner(room);
                        }
                        catch (err) {
                            console.log('error: power harvesting code!');
                        }
                        //powerspawnProcessPower(room);
    
                        if (Game.time % 499 == 0) {
                            checkIfCreepInfoUpdateRequired(roomName);
                            superUpgraderBalancing(roomName);
                        }
    
                        if (Game.time % 1478 == 0) {
                            mainBuildSub(room, undefined);
                        }
    
                        let tradingTimeInterval = 17;
                        //let sellingFrequency = 15;
                        if (Game.time % tradingTimeInterval == 0) {
                            /*if (Game.time % (tradingTimeInterval * sellingFrequency) == 0) {
                                checkMineralAndSell(roomName)
                            }
                            else {*/
                            try {
                                superEverthingManagement(room);
                            }
                            catch (err) {
                                console.log('error: super mineral management bug!');
                            }
                            //}
                        }
    
                        if (Game.time % 7676 == 0) {
                            try {
                                changeMineralProductionInRoom(roomName);
                            }
                            catch (err) {
                                console.log('error: change lab reaction bug!');
                            }
                        }
                            
                        // labbing
                        /*if (Game.time % 1439 == 0) {
                            if (startLabber(Game.rooms[roomName])) {
                                Game.rooms[roomName].memory.forSpawning.roomCreepNo.minCreeps.labber = 1;
                            }
                            else {
                                Game.rooms[roomName].memory.forSpawning.roomCreepNo.minCreeps.labber = 0;
                            }
                        }
                        if ((Game.time+7) % reactionTimeInterval(Game.rooms[roomName]) == 0) {
                            labRun(Game.rooms[roomName]);
                        }*/
    
                        // disabled due to Traveler stucking issue
                        /*if (Game.time % 2223 == 0) {
                            spawnScouterAround(roomName);
                        }*/
                            
                        buildRoom(roomName);
                            
                    }
                    else {
                        // shooter room
    
                        if (Game.time % 1 == 0) {
                            allMineralsSituation(room);
                        }
    
                        if (updateSpawnQueueTimer(room)) {
                            //if (Game.time % 11 == 0) { //
                            //if (true) {
                            room.updateSpawnQueue();
                        }
                        if (room.memory.forSpawning.spawningQueue.length > 0 && ifSpawnAvailable(roomName).length > 0) { // if there is some creeps waiting to be spawned in the queue and spawn is free, then spawn
                            spawnCreepByRoomSpawnQueue(room);
                        }
    
                        if (determineIfFucked(room)[0] < 1) {
                            towerRepairInPeace(room);
                        }
    
                        if (Game.time % 499 == 0) {
                            checkIfCreepInfoUpdateRequired(roomName);
                            superUpgraderBalancing(roomName);
                        }
    
                        // link transfer
                        //previousCPU = calculateCPUUsageOfProcesses(previousCPU, ' link transfer cost of '+roomName);
                        try {
                            linkTransfer(room);
                        }
                        catch (err) {
                            console.log(room.name + ' link transfer error');
                        }
    
                        let tradingTimeInterval = 17;
                        //let sellingFrequency = 15;
                        if (Game.time % tradingTimeInterval == 0) {
                            /*if (Game.time % (tradingTimeInterval * sellingFrequency) == 0) {
                                checkMineralAndSell(roomName)
                            }
                            else {*/
                            try {
                                superEverthingManagement(room);
                            }
                            catch (err) {
                                console.log('error: super mineral management bug!');
                            }
                            //}
                        }
    
                        // shooter room MB management
                        try {
                            manageShooterRoom(room);
                        }
                        catch (err) {
                            console.log('error: shooter room bug!');
                        }
    
                    }
                }
                else {
                    console.log(roomName + ' does not have access');
                    removeElementInArrayByElement(roomName, Memory.myRoomList[currentShard]);
                    console.log('delete main room memory of room ' + roomName + ' in shard ' + currentShard);
                }
                }
                previousCPU = calculateCPUUsageOfProcesses(previousCPU, 'Check and spawn roles');
    
                //////////// temperory code section ////////////////////////////////////////////////
                // tranposrter
                // anti tranporter in 8lvl-below rooms, bring energy from terminal to storage
                /*if (currentShard == 'shard2') {
                    if (Game.time % 1601 == 0) {
                        if ((Game.rooms['E38S6'].terminal.store.energy > 35000) && (_.sum(updateCreepsInRoomWithSpawningByRoom(Game.rooms['E38S6']), c => c.memory.role == 'transporter' && c.memory.resourceType == 'energy') < 1)) {
                            console.log('preparing transporters');
                            Game.rooms['E38S6'].memory.forSpawning.spawningQueue.push({ memory: { role: 'transporter', fromStorage: false, resourceType: 'energy' }, priority: 0.4 });
                        }
                    }
                }*/
    
                // cross portal portalTransporter pioneer
                // let pioneerEnergy = 200;
                // let pioneerRoleInfo = JSON.stringify({ energy: pioneerEnergy, role: 'pioneer', target: 'E31S11', home: 'E31S1', superUpgrader: false, route: undefined });
                //Game.getObjectById('5b897f2d0dd350179449ba84').createPortalTransporter('E35S5',pioneerEnergy,pioneerRoleInfo);
    
                // remote superUpgrader code
                /*if (Game.time % 801 == 0) {
                    Game.rooms['E33S5'].memory.forSpawning.spawningQueue.push({memory:{energy: 3200, role: 'pioneer', target: 'E31S4', home: 'E33S5', superUpgrader: true},priority: 0.4});
                }*/
    
                //Game.rooms.E39S1.memory.forSpawning.spawningQueue.push({ memory: { role: 'transporter', fromStorage:false, resourceType: 'G' }, priority: 0.4 });
    
                // intershard pionneer
                //if (true) {
                /*if (Game.time % 1400 <20) { // && Game.rooms['E99N17'].storage.store.energy>200000) {
                    Game.getObjectById('5b7472d7b44c5d078a09fad7').createOneWayInterSharder('shard1', 'E40S0', '59f1c0062b28ff65f7f21507', 'E39S1', 'pioneer', [WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE])
                }*/
                //Game.getObjectById('5b897f2d0dd350179449ba84').createOneWayInterSharder('shard2', 'E35S5', '5b8285e24203d968c6de6ee9', 'W3N36', 'pioneer', [WORK, CARRY, MOVE])
                // two-way intersharder
                //Game.getObjectById('5b7472d7b44c5d078a09fad7').createCreep([MOVE,CARRY], 'twoWayInterSharder_shard2_E39S1_LO_E40S0_19_39_shard1_E39S1_Z_E40S0_7_16_' + generateRandomStrings(), undefined);
                //[MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,]
                //[MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,]
    
                // remote builder (newest version)
                /*if (Game.time % 800 == 0) { // && Game.rooms['E99N17'].storage.store.energy>200000) {
                    Game.rooms.E31S1.memory.forSpawning.spawningQueue.push({ memory: { energy: 1800, role: 'pioneer', target: 'E31S11', home: 'E31S1', superUpgrader: false, route: undefined }, priority: 0.4 });
                    console.log('remote pioneer upgrader condition meet, spawning: pioneer upgraders to room E31S11');
                }/*
    
                // remote super upgrader spawning
                /*if (Game.time % 470 == 0) { // && Game.rooms['E99N17'].storage.store.energy>200000) {
                    Game.rooms['E94N22'].memory.forSpawning.spawningQueue.push({memory:{energy: 3200, role: 'pioneer', target: 'E93N24', home: 'E94N22', superUpgrader: true},priority: 0.4});
                    console.log('remote pioneer upgrader condition meet, spawning: pioneer upgraders to room E94N22');
                }*/
    
                // pioneer and ultimateWorrior
                /*if (Game.time % 650 == 0) {
                    Game.rooms['E92N11'].memory.forSpawning.spawningQueue.push({memory:{energy: 3000, role: 'pioneer', target: 'E96N7', home: 'E97N14', superUpgrader: false},priority: 0.3});
                    //Game.rooms['E94N17'].memory.forSpawning.spawningQueue.push({memory:{energy: 3000, role: 'pioneer', target: 'E99N17', home: 'E97N14', superUpgrader: false},priority: 0.3});
    
                    //Game.rooms['E97N14'].memory.forSpawning.spawningQueue.push({memory:{role: 'ultimateWorrior', target: 'E98N17'},priority: 0.4});
                    console.log('remote pioneer upgrader condition meet, spawning: pioneer upgraders to room E93N24');
                }*/
    
                // teezer dismantler
                /*if ((currentShard=='shard1')&&(Game.time+500) % 1502 == 0) {
                    Game.rooms['E39S1'].memory.forSpawning.spawningQueue.push({memory:{role: 'teezer', energy: 5600, target: 'E45N2', home: 'E39S1', preferredLocation: {'x':0,'y':41}},priority: 0.1});
                    //Game.rooms['E94N17'].memory.forSpawning.spawningQueue.push({memory:{role: 'dismantler', target: 'E99N18'},priority: 0.1});
                    //Game.rooms['E97N14'].memory.forSpawning.spawningQueue.push({memory:{role: 'dismantler', target: 'E99N18'},priority: 0.1});
                }*/
    
    
                //Game.getObjectById('5b7056e5aba5a56a61046ed7').createBegger(2000, 'E31S11', 'E30S10');
                //Game.getObjectById('5b82f9f7f417ed6b6e05ca36').createBegger(2000, 'E31S11', 'E30S10');
    
                /*if (_.sum(getAllMyCreepsWithSpawning('E99N17'), c => c.memory.role == 'begger' && c.memory.target == 'E99N18')<2 ) {
                    Game.spawns['Spawn_E99N17'].createBegger(800,'E99N17','E99N18');
                }*/
    
                // bring x from storage to terminal
                /*if (_.sum(getAllMyCreepsWithSpawning('E91N16'), c => c.memory.role == 'transporter' && c.memory.resourceType == 'U')<1 ) {
                    Game.spawns['Spawn_'].createTransporter('U');
                }*/
    
                /*if (Game.time % 89 == 0 && Game.rooms.E93N24.controller.level<8) { // moving energy around
                    balanceEnergyInAllMyRooms(myRoomList, ['W1S21']);
                    //'E92N11'
                }*/
    
                /*if (Game.time % 2729 == 0) { // control superUpgrader of new rooms
                    if (Game.rooms.E93N24.controller.level==8) {
                        Game.rooms.E93N24.memory.forSpawning.roomCreepNo.minCreeps.superUpgrader = 0;
                        Game.rooms.E93N24.memory.forSpawning.roomCreepNo.minCreeps.ultimateUpgrader = 1;
                    }
                    else {
                        superUpgraderBalancing('E93N24');
                    }
                }*/
    
                // anti tranporter in 8lvl-below rooms, bring energy from terminal to storage
                /*if (Game.time % 66 == 0) {
                    if ( (Game.rooms['E93N24'].terminal.store.energy > 100000) && (_.sum(getAllMyCreepsWithSpawning('E93N24'), c => c.memory.role == 'antiTransporter')<1) ) {
                        Game.spawns['Spawn_E93N24'].createAntiTransporter('energy');
                    }
                }*/
    
                previousCPU = calculateCPUUsageOfProcesses(previousCPU, 'Energy management');
    
                previousCPU = calculateCPUUsageOfProcesses(previousCPU, 'Run labs');
    
                // trading
                //if (Game.time % 39 == 0) {
                    //checkTradingEnergyCostAndSell('E92N11','H');
                    //checkTradingEnergyCostAndSell('E94N17','H');
                    //checkTradingEnergyCostAndSell('E91N16','U');
                    //checkTradingEnergyCostAndBuy('E92N11','O');
                    //checkTradingEnergyCostAndSell = function(roomName,mineralType)
                //}
    
                // distribute XGH2O
                /*if (Game.time % 1999 == 0) {
                    distributeMineralFromOneRoomToAllOtherRooms('XGH2O','E97N13');
                }*/
    
                // manage mineral flow
                /*if (Game.time % 137 == 0) {
                    //balancingXGH2O();
                    manageMineral(currentShard);
                }*
    
                // deplete room E92N12
                /*if ( (_.sum(getAllMyCreepsWithSpawning('E92N11'), c => c.memory.role == 'antiTransporter' && c.room.name == 'E92N11')<1) ) {
                    Game.spawns['Spawn_E92N11'].createAntiTransporter('energy');
                }*/
    
                previousCPU = calculateCPUUsageOfProcesses(previousCPU, 'Trading');
    
                //scanCoridorAndHarvestPower('E92N11');
                //scanCoridorAndHarvestPower('E91N16');
    
                //harvestPowerSource(9150078,6,'E35S7','E33S10',700);
    
                // observer code
                /*let powerRoomNames = Game.rooms.E92N11.memory.powerRoomNames;
                if ((powerRoomNames) && ((Game.rooms.E92N11.memory.powerBankInRoomName == undefined)||(Game.rooms.E92N11.memory.powerBankInRoomName == true))) {
                    observerObserveRoom('E92N11',powerRoomNames[Game.time%powerRoomNames.length]);
                }
                else {
                    observerObserveRoom('E92N11',Game.rooms.E92N11.memory.powerBankInRoomName);
                }*/
    
                /*if (Game.time > 20165117+1200) {
                    Game.rooms.E95N25.memory.startMining = true;
                    Game.rooms.E95N25.memory.sourceTravelTime['58dbc96b03d440ea4e4dbac3'] = 1420;
                }*/
        });
    
    // process pixels with unspent CPU in bucket
    if (Game.cpu.bucket == 10000) {
        Game.cpu.generatePixel();
    }

    //}); // end of profiler function

    // power creep section
    //Game.powerCreeps['dildologist'].usePower(PWR_GENERATE_OPS);
    //Game.powerCreeps['dildologist'].renew(Game.getObjectById('5b9147f1b28154501b85703e'));
};
