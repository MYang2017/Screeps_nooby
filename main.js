// https://www.youtube.com/watch?v=BiIDH2Ui8L8&t=294s
// https://github.com/lodash/lodash/blob/3.10.1/doc/README.md
// GCL calculation: https://docs.google.com/spreadsheets/d/1Q6MfwRZb4kood_OE5_vwcIJgIzZUsx4-haWphEw6GqI/edit#gid=0
// so cool: https://www.youtube.com/watch?v=X-iSQQgOd1A

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
var findMinCut = require('funcRoomPlan');
var taskMove = require('task.move');
require('task.energy');
var creepLogPosi = require('action.logPosi');
require('process.highway');
require('funcStats');

var roles = {
    attacker : require('role.attacker'),
    healer : require('role.healer'),
    harvester : require('role.harvester'),
    miner : require('role.miner'),
    lorry : require('role.lorry'),
    upgrader : require('role.upgrader'),
    builder : require('role.builder'),
    repairer : require('role.repairer'),
    wallRepairer : require('role.wallRepairer'),
    longDistanceHarvester : require('role.longDistanceHarvester'),
    longDistanceLorry : require('role.longDistanceLorry'),
    longDistanceBuilder : require('role.longDistanceBuilder'),
    reserver : require('role.reserver'),
    claimer : require('role.claimer'),
    pickuper : require('role.pickuper'),
    scouter : require('role.scouter'),
    teezer : require('role.teezer'),
    rampartRepairer : require('role.rampartRepairer'),
    begger : require('role.begger'),
    longDistanceUpgrader : require('role.longDistanceUpgrader'),
    controllerAttacker : require('role.controllerAttacker'),
    dismantler: require('role.dismantler'),
    linkKeeper: require('role.linkKeeper'),
    traveller: require('role.traveller'),
    transporter: require('role.transporter'),
    antiTransporter: require('role.antiTransporter'),
    pioneer: require('role.pioneer'),
    melee: require('role.melee'),
    stealer: require('role.stealer'),
    ranger: require('role.ranger'),
    powerSourceAttacker: require('role.powerSourceAttacker'),
    powerSourceHealer: require('role.powerSourceHealer'),
    powerSourceLorry: require('role.powerSourceLorry'),
    powerSourceRanger: require('role.powerSourceRanger'),
    labber: require('role.labber'),
    superUpgrader: require('role.superUpgrader'),
    keeperLairMeleeKeeper: require('role.keeperLairMeleeKeeper'),
    keeperLairInvaderAttacker: require('role.keeperLairInvaderAttacker'),
    keeperLairInvaderHealer: require('role.keeperLairInvaderHealer'),
    keeperLairLorry: require('role.keeperLairLorry'),
    captain: require('role.captain'),
    firstMate: require('role.firstMate'),
    crew: require('role.crew'),
    nothinger: require('role.nothinger'),
    ultimateWorrior: require('role.ultimateWorrior'),
    ultimateUpgrader: require('role.ultimateUpgrader'),
    oneWayInterSharder: require('role.oneWayInterSharder'),
    wanderer: require('role.wanderer'),
    portalTransporter: require('role.portalTransporter'),
    twoWayInterSharder: require('role.twoWayInterSharder'),
    scientist: require('role.scientist'),
    wanker: require('role.wanker'),
    shooter: require('role.shooter'),
    onlyMineralDefender: require('role.onlyMineralDefender'),
    onlyMineralMiner: require('role.onlyMineralMiner'),
    onlyMineralHauler: require('role.onlyMineralHauler'),
    redneck: require('role.redneck'),
    mover: require('role.mover'),
    kiter: require('role.kiter'),
    noLegWorker: require('role.noLegWorker'),
    symbolPicker: require('role.symbolPicker'),
    mapper: require('role.mapper'),
    loader: require('role.loader'),
    driver: require('role.driver'),
    dickHead: require('role.dickHead'),
    digger: require('role.digger'),
    truck: require('role.truck'),
    balancer: require('role.balancer'),
    quads: require('role.quads'),
    season2c: require('role.season2c'),
    maintainer: require('role.maintainer'),
    season2cnew: require('role.season2cnew'),
    drainer: require('role.drainer'),
    season2cPirate: require('role.season2cPirate'),
    sacrificer: require('role.sacrificer'),
    annoyer: require('role.annoyer'),
    asdpof: require('role.asdpof'),
    symbolFactorier: require('role.symbolFactorier'),
    dragonAss: require('role.dragonAss'),
};

//require('funcSymbol');
try {
    require('funcSymbol');
    //mapMazeInit()
}
catch (err) {
    fo('map maze failed');
}

//const profiler = require('screeps-profiler');
//profiler.enable();

module.exports.loop = function () {
    
    let too = Game.cpu.getUsed();

    let trackRoleCpuCost = true;
    let calcCpuProcesses = {'parse_mem': 0, 'symbol_scan': 0, 'role_recycle': 0, 'role': 0, 'tow_def': 0, 'misc_sp': 0, 'tasks': 0, 'roomPlan': 0, 'sp': 0, 'remote': 0, 'remoteRes': 0, 'misc': 0, 'mineralManage': 0, 'lab': 0, 'tower': 0, 'resFlow': 0, 'logPos': 0};
    
    let parse_count = Game.cpu.getUsed();
    //Make sure we have a valid memory in global, both in structure and in time (the last tick), if not we will nee to re-parse the memory
    if (global.last_tick && global.last_memory && Game.time === (global.last_tick + 1)) {
        delete global.Memory //delete our memory to insure it wont parse
        global.Memory = global.last_memory //set the memory to our global
        RawMemory._parsed = global.last_memory //override the parsed data to our global
    } else {
        // we don't have memory on heap, let it parse normally and
        // get a reference for use next tick
        Memory //parse memory
        global.last_memory = RawMemory._parsed //set the memory to the global
    }
    
    global.last_tick = Game.time //set a global to the last updated tick
    //end memhack
    calcCpuProcesses.parse_mem = Game.cpu.getUsed() - parse_count;
    
    /*
    try {
        if (true) {
            logSymbolInfoInPublicRawMem();
            if(Game.time % 100 === 0) {
                RawMemory.setActiveForeignSegment('ManVsRice');
            }
            if(Game.time % 100 === 1) {
                console.log(RawMemory.foreignSegment);
            }
        }
        //visualizePaths(new RoomPosition(25,25,'E7S28'), new RoomPosition(15,15,'E8S29'), range = 1, ifEO = true, maxRooms = 3);
    }
    catch (err) {
        fo('WTF')
    }*/

    //assignController()

    //console.log('=== '+Game.time+' ticks === '+Game.cpu.bucket+' CPUs left ============================================================================')
    //let previousCPU = 0;
    
    let role_recycle_count = Game.cpu.getUsed();
    // clear memory
    if (Game.time%99==0) {
        for (let name in Memory.creeps) {
            if (Game.creeps[name] == undefined) {
                delete Memory.creeps[name];
            }
            else if (_.isEmpty(Game.creeps[name].memory)) {
                unpackCreepMemory(name);
            }
        }
    }
    calcCpuProcesses.role_recycle = Game.cpu.getUsed() - role_recycle_count;

    // let different creep do its job
    let rolecpucount = Game.cpu.getUsed();
    let roleCPU = {};
    let roleNum = {};
    let roleCPU_n = {};

    for (let name in Game.creeps) {
        let cpuCount = Game.cpu.getUsed();
        let thisCreep = Game.creeps[name];
        if (thisCreep!=undefined) {
            if (!thisCreep.spawning) {
                thisCreep.runRole(roles);
            }
            
            // cpu per fole track
            if (trackRoleCpuCost) {
                //previousCPU = calculateCPUUsageOfProcesses(previousCPU, thisCreep.memory.role);
                if (Object.keys(roleCPU) == 0) {
                    roleCPU['init'] = Game.cpu.getUsed()-cpuCount;
                    roleNum['init'] = 1;
                    cpuCount = Game.cpu.getUsed();
                }
                else {
                    if (roleCPU[thisCreep.memory.role] == undefined) {
                        roleCPU[thisCreep.memory.role] = 0;
                    }
                    if (roleNum[thisCreep.memory.role] == undefined) {
                        roleNum[thisCreep.memory.role] = 0;
                    }
                    roleCPU[thisCreep.memory.role] = roleCPU[thisCreep.memory.role] + Game.cpu.getUsed()-cpuCount;
                    roleNum[thisCreep.memory.role] ++ ;
                }
            }
        }
    }
    
    if (trackRoleCpuCost) {
        for (let disrole in roleCPU) {
            roleCPU_n[disrole] = roleCPU[disrole]/roleNum[disrole];
        }
        //fo(JSON.stringify(roleCPU));
    }
    calcCpuProcesses.role = Game.cpu.getUsed() - rolecpucount;
    
    let scancpucount = Game.cpu.getUsed();
    //previousCPU = calculateCPUUsageOfProcesses(previousCPU, 'all role usage', true);
    // loop through rooms over shard
    currentShard = Game.shard.name;
    Memory.myRoomList = {}
    let myRoomList = [];
    for (let roomName in Game.rooms) {
        let r = Game.rooms[roomName];
        try {
            
            cacheInvaderCore(r);
            
            if (r!==undefined && r.controller && r.controller.my) {
                myRoomList.push(roomName);
            }
        }
        catch (err) {
            fo(roomName + ' shard rooming failed')
        }
    }
    Memory.myRoomList[currentShard] = myRoomList;
    
    // season 2 special
    //scanForSymb(false);
    try { 
        scanForSymb(false);
    }
    catch (err) {
        fo('symbol scanning failed')
    }
    calcCpuProcesses.symbol_scan = Game.cpu.getUsed() - scancpucount;
    
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
    let towdefcnt = Game.cpu.getUsed();
    var towers = _.filter( Game.structures, c => c.structureType == STRUCTURE_TOWER );
            for (let tower of towers) {
                tower.defend();
            }
    calcCpuProcesses.tow_def = Game.cpu.getUsed()-towdefcnt;
    
    let misc_sp = Game.cpu.getUsed();
    try {
        //var funcB = require('funcBuildingPlanner')
        //funcB.visualizePath(Game.getObjectById('60257847c5cd6d17f41a52e6').pos, generateLineBasedOnDir('E3S46', 5));
        //removeAllConstructionSitesInRoom(Game.rooms['E1S47']);
        //removeAllConstructionSitesInRoom(Game.rooms['E5S47']);
        //recachAllConstructionSitesInRoom(Game.rooms['E1S47'], STRUCTURE_ROAD);
        /*if (Game.time%1298==0) {
            fo('awu');
            Game.rooms['E7S28'].memory.forSpawning.spawningQueue.push({memory:{role: 'digger', target: 'E10S22', posi: {x:23, y:20}, toEatId: '602c72a062f1b63ed41e47d6'},priority: 15});
            Game.rooms['E7S28'].memory.forSpawning.spawningQueue.push({memory:{role: 'truck'}, priority: 16});
        }
        */
        
        //levelEightHelpSevenSuperUp('E5S21', 'E9S22', 717, 577);
        //levelEightHelpSevenSuperUp('E9S22', 'E19S21', 911, 111);
        //levelEightHelpSevenSuperUp('E9S22', 'E19S19', 911, 111);
        //levelEightHelpSevenSuperUp('E19S19', 'E23S16', 1011, 1);
        levelEightHelpSevenSuperUp('E9S22', 'E11S16', 606, 1);
        
        // harras
        stealAtNight();
        let asdpofFac = Game.getObjectById('60729a4075407b3bab8b6307');
        if (asdpofFac) {
            if (_.sum(asdpofFac.store)>40000) {
                Memory.asdpofTimer = 117;
            }
            else if (_.sum(asdpofFac.store)>25000) {
                Memory.asdpofTimer = 277;
            }
            else if (_.sum(asdpofFac.store)>15000) {
                Memory.asdpofTimer = 1377;
            }
            else if (_.sum(asdpofFac.store)>5000) {
                Memory.asdpofTimer = 2377;
            }
        }
        let asdpofTimer = Memory.asdpofTimer;
        if (!asdpofTimer) {
            Memory.asdpofTimer = 377;
            asdpofTimer = 377;
        }
        
        if (Game.time%asdpofTimer==0) {
            //thisIsWhatYouWanted();
            //annoyerSpawner('E19S19', 'E21S16')
            //symbolAsdpofSpawner('E19S19', 'E21S11');
        }
        
        if (Game.time%1300==0) {
            //kiterSpawner('E24S27', 'E25S27', 6);
            //kiterSpawner('E24S27', 'E26S27', 6);
            //kiterSpawner('E24S27', 'E26S28', 6);
            //kiterSpawner('E24S27', 'E26S29', 6);
        }
        
        /*
        if (Game.time%1500==0) {
            traderSpawner('E11S16', 'E11S18');
        }
        if (Game.time%1500==500) {
            traderSpawner('E11S16', 'E12S12');
        }
        if (Game.time%1500==1000) {
            traderSpawner('E11S16', 'E15S13')
        }
        */
        
        if (Game.time%1250==0 && !Memory.rooms['E25S16'].avoid) {
            Game.rooms.E23S16.memory.forSpawning.spawningQueue.push({memory:{role: 'keeperLairMeleeKeeper', target: 'E25S16', home: 'E23S16', ranged: false}, priority: 5});
        }
        
        if (Game.time%717==277) { // pioneer
            //Game.rooms['E5S21'].memory.forSpawning.spawningQueue.push({memory:{role: 'reserver', target: 'E7S22', big: true, roomEnergyMax: 2000},priority: 6});
            //Game.rooms['E5S21'].memory.forSpawning.spawningQueue.push({memory:{energy: 1900, role: 'pioneer', target: 'E7S22', home: 'E5S21', superUpgrader: false},priority: 20});
        }
        if (Game.time%163==7) { // pioneer
            //sendSacrificer('E19S19', 'E23S16')
            //sendSacrificer('E19S19', 'E11S17')
            //Game.rooms['E19S21'].memory.forSpawning.spawningQueue.push({memory:{energy: 900, role: 'pioneer', target: 'E22S11', home: 'E19S21', superUpgrader: false},priority: 10});
        }
        
        if (Game.time%10==0) {
            if (Game.cpu.bucket>9300) {
                if (Game.rooms.E9S22.memory.hasFreeSpawnCapa == true) {
                    sendSeason2c('E9S22', 'E12S25', 'symbol_ayin', 1, 0, 25);
                    sendSeason2c('E9S22', 'E12S26', 'symbol_zayin', 1, 0, 25);
                    sendSeason2c('E9S22', 'E14S21', 'symbol_kaph', 1, 0, 25);
                    sendSeason2c('E9S22', 'E12S22', 'symbol_res', 1, 0, 25);
                    Game.rooms.E9S22.memory.hasFreeSpawnCapa = false;
                }
                sendSeason2c('E7S28', 'E9S28', 'symbol_taw', 1, 0, 25);
                sendSeason2c('E7S28', 'E4S29', 'symbol_teth', 1, 0, 25);
                sendSeason2c('E4S23', 'E1S21', 'symbol_qoph', 1, 0, 25);
            }
            if (Game.cpu.bucket>9100) {
                if (Game.rooms.E19S21.memory.hasFreeSpawnCapa == true) {
                    sendSeason2c('E19S21', 'E18S28', 'symbol_yodh', 1, 0, 25);
                    sendSeason2c('E19S21', 'E17S24', 'symbol_aleph', 1, 0, 25);
                    sendSeason2cnew('E19S21', 'E21S25', 'symbol_sim', 1, 0, 25);
                    sendSeason2cnew('E19S21', 'E22S29', 'symbol_gimmel', 1, 0, 25);
                    Game.rooms.E19S21.memory.hasFreeSpawnCapa = false;
                }
                if (Game.rooms.E1S27.memory.hasFreeSpawnCapa == true) {
                    sendSeason2c('E1S27', 'E3S26', 'symbol_he', 1, 0, 25);
                    sendSeason2c('E1S27', 'E1S24', 'symbol_daleth', 1, 0, 25);
                    Game.rooms.E1S27.memory.hasFreeSpawnCapa = false;
                }
                if (Game.rooms.E19S19.memory.hasFreeSpawnCapa == true) {
                    sendSeason2cnew('E19S19', 'E23S21', 'symbol_mem', 1, 0, 25);
                    Game.rooms.E19S19.memory.hasFreeSpawnCapa = false;
                }
            }
            if (Game.cpu.bucket>9000) {
                if (Game.rooms.E24S27.memory.hasFreeSpawnCapa == true) {
                    sendSeason2cnew('E24S27', 'E28S24', 'symbol_tsade', 1, 0, 25);
                    sendSeason2cnew('E24S27', 'E25S29', 'symbol_samekh', 1, 0, 25);
                    Game.rooms.E24S27.memory.hasFreeSpawnCapa = false;
                }
            }
        }
        
        if (Game.time%1000==666) {
            //sendSeason2cPirate('E19S21', 'E21S25', 'symbol_sim', 1, 0);
        }
        
        if (Game.time%3333==0) { // tunneller // 1321s best for digging
            //Game.rooms['E7S28'].memory.forSpawning.spawningQueue.push({memory:{role: 'dismantler', target: 'E10S22', boostMats: false, tarId: ['602c72a062f1b63ed41e47a2']},priority: 15});
            //Game.rooms['E7S28'].memory.forSpawning.spawningQueue.push({memory:{role: 'dismantler', target: 'E10S22', boostMats: 'ZH', tarId: ['602c72a062f1b63ed41e4839', '602c72a062f1b63ed41e486a']},priority: 15});
        }
        
        if (Game.time%933==0) { // digger
            //Game.rooms['E9S22'].memory.forSpawning.spawningQueue.push({memory:{role: 'dismantler', target: 'E20S20', boostMats: ['ZH'], tarId: ['602c72a762f1b63ed41f1e20', '602c72a762f1b63ed41f1e51', '602c72a762f1b63ed41f1e82', '602c72a762f1b63ed41f1eb3', '602c72a762f1b63ed41f1ee4']},priority: 15});
        }
        
        /*
        if (Game.rooms.E1S30&&Game.getObjectById('602c729a62f1b63ed41d957e')==undefined) {
            
        }
        if (Memory.dz) {
            // pass
        }
        else {
            if (Game.time%1387==0) { // digger
                Game.rooms['E1S27'].memory.forSpawning.spawningQueue.push({memory:{role: 'dismantler', target: 'E1S30', boostMats: ['XZHO2', 'XZH2O'], tarId: ['602c729a62f1b63ed41d957f', '602c729a62f1b63ed41d9585', '602c729a62f1b63ed41d9586', '602c729a62f1b63ed41d9582', '602c729a62f1b63ed41d957e']},priority: 15});
            }
        }
        */
        
        if (Game.time%1106==0) { // digger
            //Game.rooms['E19S21'].memory.forSpawning.spawningQueue.push({memory:{role: 'dismantler', target: 'E20S20', boostMats: ['ZH', 'ZO'], tarId: ['602c72a762f1b63ed41f1e20', '602c72a762f1b63ed41f1e51', '602c72a762f1b63ed41f1e82', '602c72a762f1b63ed41f1eb3', '602c72a762f1b63ed41f1ee4']},priority: 15});
            //Game.rooms['E19S21'].memory.forSpawning.spawningQueue.push({memory:{role: 'dismantler', target: 'E20S20', boostMats: [true], tarId: ['602c72a762f1b63ed41f1e20', '602c72a762f1b63ed41f1e51', '602c72a762f1b63ed41f1e82', '602c72a762f1b63ed41f1eb3', '602c72a762f1b63ed41f1ee4']},priority: 15});
            //Game.rooms['E9S22'].memory.forSpawning.spawningQueue.push({memory:{role: 'dismantler', target: 'E10S20', boostMats: ['XZHO2', 'XZH2O'], tarId: ['602c72a062f1b63ed41e462e', '602c72a062f1b63ed41e460a', '602c72a062f1b63ed41e45d8', '602c72a062f1b63ed41e45a6']},priority: 15});
            //Game.rooms['E9S22'].memory.forSpawning.spawningQueue.push({memory:{role: 'dismantler', target: 'E10S16', boostMats: ['XZHO2'], tarId: ['602c72a062f1b63ed41e40c5', '602c72a062f1b63ed41e40f7', '602c72a062f1b63ed41e4129', '602c72a062f1b63ed41e415c', '602c72a062f1b63ed41e418a', '602c72a062f1b63ed41e4196']},priority: 15});
            //Game.rooms['E19S21'].memory.forSpawning.spawningQueue.push({memory:{role: 'dismantler', target: 'E20S20', boostMats: ['ZO'], tarId: ['602c72a762f1b63ed41f1e20', '602c72a762f1b63ed41f1e51', '602c72a762f1b63ed41f1e82', '602c72a762f1b63ed41f1eb3', '602c72a762f1b63ed41f1ee4']},priority: 15});
            //Game.rooms['E19S21'].memory.forSpawning.spawningQueue.push({memory:{role: 'dismantler', target: 'E20S20', boostMats: ['ZH2O'], tarId: ['602c72a762f1b63ed41f1e20', '602c72a762f1b63ed41f1e51', '602c72a762f1b63ed41f1e82', '602c72a762f1b63ed41f1eb3', '602c72a762f1b63ed41f1ee4']},priority: 15});
            //Game.rooms['E19S21'].memory.forSpawning.spawningQueue.push({memory:{role: 'dismantler', target: 'E20S20', boostMats: ['XZH2O'], tarId: ['602c72a762f1b63ed41f1e20', '602c72a762f1b63ed41f1e51', '602c72a762f1b63ed41f1e82', '602c72a762f1b63ed41f1eb3', '602c72a762f1b63ed41f1ee4']},priority: 15});
        }
        if (Game.time%1446==1) { // stealer for dismanted wall
            //Game.rooms['E11S16'].memory.forSpawning.spawningQueue.push({memory:{role: 'stealer', home: 'E11S16', target: 'E10S16'}, priority: 13.5});
            //symbolStealerSpawner('E9S22', 'E7S19')
        }
    }
    catch (err) {
        fo(err)
    }
    calcCpuProcesses.tow_def = Game.cpu.getUsed()-misc_sp;

    //previousCPU = calculateCPUUsageOfProcesses(previousCPU, 'pre-room CPU usage', true);
    
        for (let roomNameIdx in Memory.myRoomList[currentShard]) {
            let roomName = Memory.myRoomList[currentShard][roomNameIdx];
            if (true) {
                let room = Game.rooms[roomName];
                    try {
                        let cpucnt = Game.cpu.getUsed();
                        // movement task manager
                        let taskScanInterv = 3;
                        if (room.memory.coreBaseReady) {
                            taskScanInterv = 20;
                        }
                        if (Game.time%taskScanInterv==0) {
                            structureGetE(roomName);
                            resourceOfferE(roomName);
                            taskMove.moveTaskManager(roomName);
                            energyTaskManager(roomName);
                            energyGetTaskManager(roomName);
                        }
                        calcCpuProcesses.tasks += Game.cpu.getUsed()-cpucnt;

                        // update room build plan and place site
                        cpucnt = Game.cpu.getUsed();
                        if (Game.time%777 == 3 || room.memory.newAnchor == undefined || (room.controller.level<=3 && Game.time%55==0) || (room.memory.forSpawning && room.memory.forSpawning.roomCreepNo && room.memory.forSpawning.roomCreepNo.minCreeps['builder'] > 0 && Game.time%7 == 3)) {
                            updateRoomPlan(roomName);
                        }
                        calcCpuProcesses.roomPlan += Game.cpu.getUsed()-cpucnt;
                        
                        // update spawn queue and spawn
                        cpucnt = Game.cpu.getUsed();
                        if (updateSpawnQueueTimer(Game.rooms[roomName])) {
                            room.newUpdateSpawnQueue();
                            if (Game.rooms[roomName].memory.forSpawning.spawningQueue.length == 0) { // still have spawn capacity after spawn check
                                Game.rooms[roomName].memory.hasFreeSpawnCapa = true;
                            }
                        }
                        if (room.memory.forSpawning.spawningQueue.length > 0 && ifSpawnAvailable(roomName).length > 0) { // if there is some creeps waiting to be spawned in the queue and spawn is free, then spawn
                            spawnCreepByRoomSpawnQueue(room);
                        }
                        calcCpuProcesses.sp += Game.cpu.getUsed()-cpucnt;
                        
                        // remote mining
                        cpucnt = Game.cpu.getUsed();
                        try {
                            if (Game.time%111==1) {
                                earlyAndLateRemoteMiningManager(roomName);
                            }
                        }
                        catch (err) {
                            fo(roomName + ' remote failed');
                        }
                        calcCpuProcesses.remote += Game.cpu.getUsed()-cpucnt;
                        
                        // remote res allocate
                        cpucnt = Game.cpu.getUsed();
                        manageRemoteRoomsResourceGetting(roomName);
                        calcCpuProcesses.remoteRes += Game.cpu.getUsed()-cpucnt;
                        
                        cpucnt = Game.cpu.getUsed();
                        if (Game.time % 499 == 0) {
                            //checkIfCreepInfoUpdateRequired(roomName);
                            newLinkSuperUpgraderPosisCach(roomName);
                            superUpgraderBalancing(roomName);
                        }
                        
                        if (Game.time % 678 == 0) {
                            mainBuildSub(room, undefined);
                        }
                        
                        linkTransfer(room);

                        //season 2 special
                        sendMappers(room);
                        
                        // high way
                        try {
                            highwayManager(room);
                        }
                        catch (err) {
                            fo(room.name + ' highway bugged');
                        }
                        
                        // power
                        try {
                            //powerHarvestingAndScanningMaintainner(room);
                        }
                        catch (err) {
                            console.log('error: power harvesting code!');
                        }
                        
                        // room defend activate bubble
                        if (Game.time%77==0) {
                            popBubble(room);
                        }
                        calcCpuProcesses.misc += Game.cpu.getUsed()-cpucnt;
                        
                        cpucnt = Game.cpu.getUsed();
                        // initial mineral storage variables
                        initiateMineralKeepThresholdInRoom(room, false);
                        if (Game.time % 19 == 0) { // update all res situation
                            allMineralsSituation(room);
                        }
                        calcCpuProcesses.mineralManage += Game.cpu.getUsed()-cpucnt;
                        
                        cpucnt = Game.cpu.getUsed();
                        // labbing
                        if (Game.time%50==7) {
                            cacheLabsInAndOut(roomName); // for lab caching
                        }
                        if (Game.time%3333==0) { // change an available compound to produce
                            pickACompoundToProduce(roomName);
                        }
                        //changeMineralProductionInRoom(roomName); // completely random choose to produce
                        if (Game.time % 777 == 0) {
                            if (startLabber(Game.rooms[roomName])) {
                                Game.rooms[roomName].memory.forSpawning.roomCreepNo.minCreeps.labber = 1;
                                Game.rooms[roomName].memory.forSpawning.roomCreepNo.creepEnergy.labber = 600;
                            }
                            else {
                                Game.rooms[roomName].memory.forSpawning.roomCreepNo.minCreeps.labber = 0;
                            }
                        }
                        if ((Game.time+7) % reactionTimeInterval(Game.rooms[roomName]) == 0) {
                            labRun(Game.rooms[roomName]);
                        }
                        calcCpuProcesses.lab += Game.cpu.getUsed()-cpucnt;
                        
                        cpucnt = Game.cpu.getUsed();
                        if (determineIfFucked(room)[0] < 1) {
                            towerRepairInPeace(room);
                        }
                       calcCpuProcesses.tower += Game.cpu.getUsed()-cpucnt;
                    }
                    catch (err) {
                        fo(roomName + ' new code bugged')
                    }
            }

            else { // (!(roomName == 'E4S49') && !(roomName == 'E11S47') && !(roomName == 'E13S53')) {
                let r = Game.rooms[roomName];
                if (r.controller && r.controller.my) {
                    let room = r;
                    //removeAllConstructionSitesInRoom(r)
                    if (room) {
                        // separate shooter and normal room management
                        let motherRoomName = room.memory.startMB;
                        if (!motherRoomName) { // normal room
                            //cacheLabsInAndOut(roomName); // for lab caching
                            //if (Game.ticks % 1234 == 0) { // need to find link complete event
                            initiateLinksInRoom(room); // for links caching
                            //}
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

                            if (!room.memory.needHelp) {  // for subroom spawning
                                if (updateSpawnQueueTimer(room)) {
                                    //if (Game.time % 11 == 0) { //
                                    //if (true) {
                                    room.updateSpawnQueue();
                                }
                                if (room.memory.forSpawning.spawningQueue.length > 0 && ifSpawnAvailable(roomName).length > 0) { // if there is some creeps waiting to be spawned in the queue and spawn is free, then spawn
                                    spawnCreepByRoomSpawnQueue(room);
                                }
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
                                superUpgraderPosisCach(roomName);
                                superUpgraderBalancing(roomName);
                            }

                            if (Game.time % 678 == 0) {
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
                            if (Game.time % 223 == 0) {
                                //spawnScouterAround(roomName);
                                Game.getObjectById('602bac4ed3e25b0b8653b1e8').spawnCreep([MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY,], randomIdGenerator(), { memory: { role: 'stealer', working: false, target: 'E9S46', home: 'E9S49' } });
                            }

                            try {
                                earlyAndLateRemoteMiningManager(roomName);
                            }
                            catch (err) {
                                fo(roomName + ' remote failed');
                            }

                            //desparateHouseWife('E1S47');

                            buildRoom(roomName);
                            

                            /*if (Game.time % 1650 == 0) {
                                Game.rooms['E1S47'].memory.forSpawning.spawningQueue.push({ memory: { role: 'transporter', fromStorage: true, resourceType: 'energy' }, priority: 0.001 });

                            }*/
                            
                            
                            
                            /*if (Game.rooms['E1S47'].storage.store.getUsedCapacity() < 900000) { //(Game.time % 1601 == 0) {
                                // terminal all send energy to E1S47
                                if (roomName !== 'E1S47' ) {
                                    if (room.terminal) {
                                        room.terminal.send('energy',5000,'E1S47','chu chu!');
                                    }
                                }
                                // move res from terminal to storage
                                else if (Game.time % 2331 == 0 && roomName == 'E1S47') {
                                    if (Game.rooms['E1S47'].terminal.store.energy > 135000) {
                                        console.log('preparing transporters');
                                        Game.rooms['E1S47'].memory.forSpawning.spawningQueue.push({ memory: { role: 'transporter', fromStorage: false, resourceType: 'energy' }, priority: 0.4 });
                                    }
                                }
                            }*/
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
            }
        }
        
        try {
            cpucnt = Game.cpu.getUsed();
            if (Game.time%(Math.ceil(-0.003*Game.cpu.bucket+40))==7) { // 
                checkMineralStatsAndSend(1)
            }
            calcCpuProcesses.resFlow += Game.cpu.getUsed()-cpucnt;
            //checkMineralStatsAndSend()
        }
        catch (err) {
            fo('resource management code bugged');
        }
        
    //fo(JSON.stringify(calcCpuProcesses));
    
    //previousCPU = calculateCPUUsageOfProcesses(previousCPU, 'post-room CPU usage', true);

    //findMinCut.floodFill('E1S47')
    //findMinCut.test('E11S47', findMinCut.generateRectArrayForMinCut({x:15, y:16}));
    //findMinCut.planEverythingInRoom('E3S46');
    //findMinCut.unbi('E3S46');
    
    /*try {
    //taskMove.moveTaskManager('E4S49');
    //updateRoomPlan('E4S49');
    }
    catch (err) {
        fo('taskmanager bug')
    }*/
    
    //}); // end of profiler function

    // power creep section
    //Game.powerCreeps['dildologist'].usePower(PWR_GENERATE_OPS);
    //Game.powerCreeps['dildologist'].renew(Game.getObjectById('5b9147f1b28154501b85703e'));
    
    let xxxx = Game.cpu.getUsed();
    // refresh creeps position log
    for (let name in Game.creeps) {
        let thisCreep = Game.creeps[name];
        if (!thisCreep.spawning) {
            creepLogPosi.run(thisCreep);
        }
        //previousCPU = calculateCPUUsageOfProcesses(previousCPU, thisCreep.memory.role, true);
    }
    calcCpuProcesses.logPos += Game.cpu.getUsed()-xxxx;
    
    try {
    showGameStats(roleCPU, roleCPU_n, roleNum);
    showUltiMateGameStats(calcCpuProcesses);
    showSymPicPosi();
    }
    catch (err) {
        fo('stats show bug')
    }
    too = Game.cpu.getUsed()-too;
    new RoomVisual().text(too.toFixed(1), 45.5, 0, {align: 'right'}); 
};

