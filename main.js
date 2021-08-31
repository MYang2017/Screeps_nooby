/// https://www.youtube.com/watch?v=BiIDH2Ui8L8&t=294s
// https://github.com/lodash/lodash/blob/3.10.1/doc/README.md
// GCL calculation: https://docs.google.com/spreadsheets/d/1Q6MfwRZb4kood_OE5_vwcIJgIzZUsx4-haWphEw6GqI/edit#gid=0
// so cool: https://www.youtube.com/watch?v=X-iSQQgOd1A
// FIXZT-6QV0J-KE5L7
// remove line 690 in funcBuildingPlanner
// 63's res display: HelperRoomResource.showAllRes()

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
//require('process.highway');
require('funcStats');
var pc = require('pc');
var runFac  = require('proccess.factory');
require('nukeDef');

// 63 codes
var HelperRoomResource = require('module.roomResourceManager'); // pretty print all res in a shard
//var massUpdateAllPrices = require('module.63price'); // get all commodities price situation

var roles = {
    sacrificer: require('role.sacrificer'),
    stranger: require('role.stranger'),
    pioneer: require('role.pioneer'),
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
    annoyer: require('role.annoyer'),
    asdpof: require('role.asdpof'),
    symbolFactorier: require('role.symbolFactorier'),
    dragonAss: require('role.dragonAss'),
    depoHarvester: require('role.depoHarvester'),
    depoHauler: require('role.depoHauler'),
    depoStorage: require('role.depoStorage'),
    dedicatedUpgraderHauler: require('role.dedicatedUpgraderHauler'),
    qiangWorker: require('role.qiangWorker'),
    recCtner: require('role.recCtner'),
    dickHeadpp: require('role.dickHeadpp'),
    newDickHead: require('role.newDickHead'),
    tester: require('role.tester'),
    stomper: require('role.stomper'),
    gays: require('role.gays'),
    hider: require('role.hider'),
    edger: require('role.edger'),
    trader: require('role.trader'),
    powerSourceJammer: require('role.powerSourceJammer'),
    deliveroo: require('role.deliveroo'),
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
// use this: _.sum(objects, function(o) { return o.value; });

module.exports.loop = function () {
    
    let too = Game.cpu.getUsed();

    let trackRoleCpuCost = true;
    let calcCpuProcesses = {'parse_mem': 0, 'symbol_scan': 0, 'role_recycle': 0, 'role': 0, 'tow_def': 0, 'pc_manage': 0, 'highway_harv': 0, 'misc_sp': 0, 'tasks': 0, 'roomPlan': 0, 'sp': 0, 'remote': 0, 'remoteRes': 0, 'misc': 0, 'mineralManage': 0, 'lab': 0, 'tower': 0, 'resFlow': 0, 'logPos': 0, 'link_misc': 0};
    
    let parse_count = Game.cpu.getUsed();
    
    // process pixels with unspent CPU in bucket
    if (Game.shard.name=='shard1') {
        if (Game.cpu.bucket == 10000) {
            Game.cpu.generatePixel();
        }
        return
    }
    
    // pixel in shard1 from scout in shard2
    if (Game.time%1501==0 && Game.shard.name == 'shard2') {
        Game.rooms.E31S49.memory.forSpawning.spawningQueue.push({ memory: { role: 'scouter', target: 'E30S50' }, priority: 0.01 });
    }
    
    // begin memhack
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
    
    try {
        let segmentToUse = 99;        //can be 0-99
        let commutint = 20;
        if(Game.shard.name === 'shard3' && Game.time % commutint === 0) {
            RawMemory.setPublicSegments([segmentToUse]);
            RawMemory.setDefaultPublicSegment(segmentToUse);
            RawMemory.setActiveSegments([segmentToUse]);
        }
        if(Game.shard.name === 'shard3' && Game.time % commutint === 1) {
            //RawMemory.segments[segmentToUse] = Math.floor(Game.rooms.E11S47.terminal.store.getFreeCapacity('energy')*0.9).toString();
            let toSendMsg = JSON.stringify({E11S47: Math.floor(Game.rooms.E11S47.terminal.store.getFreeCapacity('energy')*0.9)});
            if (Game.rooms.E29S51.terminal && Game.rooms.E29S51.terminal.store.energy<100000 && _.sum(Game.rooms.E29S51.terminal.store)<270000) {
                toSendMsg = JSON.stringify({E29S51: Math.floor(Game.rooms.E29S51.terminal.store.getFreeCapacity('energy')*0.9)});
            }
            else if (Game.rooms.W2S58.terminal && Game.rooms.W2S58.terminal.store.energy<150000 && _.sum(Game.rooms.W2S58.terminal.store)<270000) {
                toSendMsg = JSON.stringify({W2S58: Math.floor(Game.rooms.W2S58.terminal.store.getFreeCapacity('energy')*0.9)});
            }
            else if (Game.rooms.E1S41.terminal && Game.rooms.E1S41.terminal.store.energy<150000 && _.sum(Game.rooms.E1S41.terminal.store)<270000) {
                toSendMsg = JSON.stringify({E1S41: Math.floor(Game.rooms.E1S41.terminal.store.getFreeCapacity('energy')*0.9)});
            }
            else if (Game.rooms.E1S49.terminal && Game.rooms.E1S49.terminal.store.energy<100000 && _.sum(Game.rooms.E1S49.terminal.store)<270000) {
                toSendMsg = JSON.stringify({E1S49: Math.floor(Game.rooms.E1S49.terminal.store.getFreeCapacity('energy')*0.9)});
            }
            else if (Game.rooms.E11S1.terminal && Game.rooms.E11S1.terminal.store.energy<100000 && _.sum(Game.rooms.E11S1.terminal.store)<270000) {
                toSendMsg = JSON.stringify({E11S1: Math.floor(Game.rooms.E1S49.terminal.store.getFreeCapacity('energy')*0.9)});
            }
            else if (Game.rooms.W2S58.terminal && Game.rooms.W2S58.terminal.store.energy<100000 && _.sum(Game.rooms.W2S58.terminal.store)<270000) {
                toSendMsg = JSON.stringify({W2S58: Math.floor(Game.rooms.W2S58.terminal.store.getFreeCapacity('energy')*0.9)});
            }
            Memory.messageToSend = toSendMsg;
            RawMemory.segments[segmentToUse] = toSendMsg;
        }
    }
    catch (err) {
        fo('communication code bug');
    }
    
    try {
        if (Game.shard.name=='shard2') {
            let wr = Game.rooms.E8S48;
            if (wr && wr.controller && wr.controller.my && (wr.controller.ticksToDowngrade<5 || wr.controller.pos.findInRange(FIND_HOSTILE_CREEPS, 3, {filter: c=>c.getActiveBodyparts(CLAIM)>0}).length>0)) {
                wr.controller.unclaim();
            }
        }    
    }
    catch (err) {
        fo('bubble bug')
    }
    
    /*
    try {
        if (true) {
            logSymbolInfoInPublicRawMem();
            if(Game.time % 2 === 0) {
                RawMemory.setActiveForeignSegment('ManVsRice');
            }
            if(Game.time % 2 === 1) {
                console.log(RawMemory.foreignSegment);
            }
        }
        //visualizePaths(new RoomPosition(25,25,'E7S28'), new RoomPosition(15,15,'E8S29'), range = 1, ifEO = true, maxRooms = 3);
    }
    catch (err) {
        fo('WTF')
    }
    */
    
    try {
        if (Game.shard.name=='shard2') {
            if (Game.rooms.E11S53 && Game.rooms.E11S53.find(FIND_HOSTILE_CREEPS, {filter: h=>h.owner.username=='Tigga'}).length>1) {
                //Game.rooms.E11S53.controller.activateSafeMode();
            }
        }
    }
    catch (err) {
        fo('temp bubble bug');
    }

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
            
            // cpu per role track
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
        //scanForSymb(false);
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
        //levelEightHelpSevenSuperUp('E9S22', 'E11S16', 606, 1);
        
        

        /////////////////////////// old shit
        if (false) {
            //Game.rooms['E9S49'].memory.forSpawning.spawningQueue.push({memory:{role: 'oneWayInterSharder', targetShardName: 'shard3', portalRoomName: 'E10S50', portalId: '5c0e406c504e0a34e3d61d59', targetRoomName: 'E11S47', roleWillBe: 'claimer', body: [CLAIM, MOVE]},priority: 0.4});
            //Game.rooms['E9S49'].memory.forSpawning.spawningQueue.push({memory:{role: 'oneWayInterSharder', targetShardName: 'shard3', portalRoomName: 'E10S50', portalId: '5c0e406c504e0a34e3d61d59', targetRoomName: 'E11S47', roleWillBe: 'pioneer', body: [WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE]},priority: 0.4});
        }
        
        if (Game.shard.name=='shard2' && Game.time% 446 == 0 && (Game.rooms.E12S56 && Game.rooms.E12S56.find(FIND_HOSTILE_CREEPS).length==0)) { // block ikiris energy
            //kiterSpawner('E13S58', 'E12S56');
            //Game.rooms['E13S58'].memory.forSpawning.spawningQueue.push({ memory: { energy: 3000, role: 'pioneer', target: 'E12S56' , home: 'E13S58', superUpgrader: false, route:  undefined }, priority: 102 });
        }
        
        if (Game.shard.name=='shard2' && Game.time% 446 == 0 && Game.rooms.E25S43 && Game.rooms.E25S43.controller && Game.rooms.E25S43.controller.my) {
            Game.rooms['E28S45'].memory.forSpawning.spawningQueue.push({ memory: { energy: 1300, role: 'pioneer', target: 'E25S43' , home: 'E28S45', superUpgrader: false, route:  undefined }, priority: 102 });
        }
        
        let sneakhelproomname = 'W1S34';
        if (Game.shard.name=='shard3' && Game.time% 444 == 0 && (Game.rooms[sneakhelproomname] && Game.rooms[sneakhelproomname].find(FIND_HOSTILE_CREEPS).length==0)) {
            Game.rooms['E1S41'].memory.forSpawning.spawningQueue.push({ memory: { energy: 3000, role: 'pioneer', target: sneakhelproomname , home: 'E1S41', superUpgrader: false, route:  undefined }, priority: 102 });
        }
        
        if (Game.shard.name == 'shard2' && Game.time% 777 == 0) {
            Game.rooms['E31S49'].memory.forSpawning.spawningQueue.push({ memory: { energy: 500, role: 'pioneer', target: 'E21S49' , home: 'E31S49', superUpgrader: false, route:  undefined }, priority: 102 });
        }
        if (Game.shard.name == 'shard2' && Game.time% 1477 == 0) {
            Game.rooms['E19S51'].memory.forSpawning.spawningQueue.push({ memory: { energy: 1000, role: 'pioneer', target: 'E21S49' , home: 'E19S51', superUpgrader: false, route:  undefined }, priority: 102 });
        }
        if (Game.time% 1333 == 2 && Game.shard.name=='shard3') { // && Game.rooms.E1S41.find(FIND_HOSTILE_CREEPS).length==0
            //Game.rooms['E1S41'].memory.forSpawning.spawningQueue.push({memory:{targetShardName: 'shard2', portalRoomName: 'E0S40', portalId: '5c0e406c504e0a34e3d61dba', targetRoomName: 'W1S42', roleWillBe: 'kiter', body: 'big', route: {'?': '?'}, role: 'oneWayInterSharder'}, priority: 15});
            //Game.rooms['E1S41'].memory.forSpawning.spawningQueue.push({memory:{targetShardName: 'shard2', portalRoomName: 'E0S40', portalId: '5c0e406c504e0a34e3d61dba', targetRoomName: 'W1S42', roleWillBe: 'kiter', body: false, route: {'?': '?'}, role: 'oneWayInterSharder'}, priority: 15});
            //Game.rooms['E1S41'].memory.forSpawning.spawningQueue.push({memory:{targetShardName: 'shard2', portalRoomName: 'E0S40', portalId: '5c0e406c504e0a34e3d61dba', targetRoomName: 'W1S43', roleWillBe: 'kiter', body: false, route: {'?': '?'}, role: 'oneWayInterSharder'}, priority: 15});
            //Game.rooms['E1S41'].memory.forSpawning.spawningQueue.push({memory:{targetShardName: 'shard2', portalRoomName: 'E0S40', portalId: '5c0e406c504e0a34e3d61dba', targetRoomName: 'W1S42', roleWillBe: 'claimer', body: ['?'], route: {'?': '?'}, role: 'oneWayInterSharder'}, priority: 15});
            //Game.rooms['E11S47'].memory.forSpawning.spawningQueue.push({ memory: { energy: 2200, role: 'pioneer', target: 'E1S49' , home: 'E11S47', superUpgrader: false, route:  undefined }, priority: 102 });
            //Game.rooms['E1S49'].memory.forSpawning.spawningQueue.push({ memory: { energy: 3700, role: 'pioneer', target: 'E1S41' , home: 'E1S49', superUpgrader: false, route:  undefined }, priority: 102 });
        }
        if (Game.time% 333 == 2 && Game.shard.name=='shard3') { // && Game.rooms.E1S41.find(FIND_HOSTILE_CREEPS).length==0
            //Game.rooms['E1S41'].memory.forSpawning.spawningQueue.push({memory:{targetShardName: 'shard2', portalRoomName: 'E0S40', portalId: '5c0e406c504e0a34e3d61dba', targetRoomName: 'W1S42', roleWillBe: 'pioneer', body: ['?'], route: {'?': '?'}, role: 'oneWayInterSharder'}, priority: 15});
            //Game.rooms['E1S41'].memory.forSpawning.spawningQueue.push({memory:{targetShardName: 'shard2', portalRoomName: 'E0S40', portalId: '5c0e406c504e0a34e3d61dba', targetRoomName: 'W1S42', roleWillBe: 'claimer', body: ['?'], route: {'?': '?'}, role: 'oneWayInterSharder'}, priority: 15});
        }
        
        if (false) {
            if (Game.shard.name=='shard3') {
                let rsp = Game.getObjectById('60a6c33f7177ce8c2c91a791');
                if (rsp.store.energy>55) {
                    let cps = rsp.pos.findInRange(FIND_MY_CREEPS, 1, {filter:c=>c.ticksToLive<1450 && !(checkIfCreepIsBoosted(c) && c.ticksToLive>50)});
                    let toext;
                    let toextttl = 1500;
                    if (cps.length>0) {
                        for (let cp of cps) {
                            if (cp.ticksToLive<toextttl) {
                                toext = cp;
                                toextttl = cp.ticksToLive;
                            }
                        }
                        if (toext) {
                            rsp.renewCreep(toext);
                        }
                    }
                }
            }
            
            if (false) {
                if (_.sum(Game.rooms.E1S49.storage.store)>100000) {
                    if (Game.time % 110 == 0) { // 123 at most
                        sendSacrificer('E1S49', 'E1S41');
                    }
                }
                if (Game.time % 87 == 0) { // 123 at most
                    if (Game.cpu.bucket<5000) {
                        sendSacrificer('E11S47', 'E1S41');
                    }
                    else {
                        sendSacrificer('E11S47', 'E1S41', 'qiang');
                    }
                }
                //levelEightHelpSevenSuperUp('E11S47', 'E1S49', 517, 0);
            }
            
            if (Game.time%4000<300 && Game.shard.name == 'shard3' && Game.cpu.bucket>6000) {
                if (Game.time%49 == 0) { // 123 at most
                    //intershardsacrificer('shard3', 'E11S47', 'E13S53');
                }
            }
                    
            let pr = Game.rooms['E11S47'];
            if (Game.rooms.E11S47.memory.mineralThresholds.currentMineralStats.energy>144444) {
                Game.rooms['E11S47'].memory.frenzyMode = true;
                let psps = pr.find(FIND_MY_STRUCTURES, {filter: s=>s.structureType==STRUCTURE_SPAWN && (s.effects && s.effects.length>0 && s.effects[0].ticksRemaining>0)});
                let fucktigga = false && !(Game.time%4000<27.5*5) && Game.rooms.E1S49.controller.level<6;
                
                // builder
                //Game.rooms['E11S47'].memory.forSpawning.spawningQueue.push({memory:{targetShardName: 'shard2', portalRoomName: 'E10S50', portalId: '5c0e406c504e0a34e3d61d5a', targetRoomName: 'E8S48', roleWillBe: 'qiangWorker', body: ['?'], route: {'?': '?'}, role: 'oneWayInterSharder'}, priority: 15});

                // claimer
                //Game.getObjectById('60369f333df0b07a8f1ee34e').createOneWayInterSharder('shard2', 'E10S50', '5c0e406c504e0a34e3d61d5a', 'E8S48', 'claimer', [MOVE, MOVE, MOVE, MOVE, HEAL, MOVE, HEAL, MOVE, HEAL, MOVE, HEAL, MOVE, CLAIM, MOVE], { 'E10S50': 'E10S48', 'E10S48': 'E8S48'})
                
                // claim to defend
                //let bbb = createBody({WORK:5, CARRY:4, MOVE:9});
                //Game.rooms['E11S47'].memory.forSpawning.spawningQueue.push({memory:{targetShardName: 'shard2', portalRoomName: 'E10S50', portalId: '5c0e406c504e0a34e3d61d5a', targetRoomName: 'E9S48', roleWillBe: 'pioneer', body: bbb, route: {'E10S50': 'E10S48', 'E10S48': 'E9S48'}, role: 'oneWayInterSharder'},priority: 1.5});
                //Game.getObjectById('60369f333df0b07a8f1ee34e').createOneWayInterSharder('shard2', 'E10S50', '5c0e406c504e0a34e3d61d5a', 'E9S48', 'claimer', [MOVE, MOVE, MOVE, MOVE, HEAL, MOVE, HEAL, MOVE, HEAL, MOVE, HEAL, MOVE, CLAIM, MOVE], {'E10S50': 'E10S48', 'E10S48': 'E9S48'})
                
                
                if (Game.cpu.bucket>7000 && fucktigga) {
                    if (_.sum(Game.rooms.E1S49.storage.store)<950000) {
                        if (Game.time% Math.floor(123-(123-27)/3*psps.length) == 0) { // 123 at most
                            //sendSacrificer('E11S47', 'E1S49');
                        }
                    }
                    //levelEightHelpSevenSuperUp('E11S47', 'E1S49', 517, 0);
                }
                else {
                    if (Game.time%4000<90) {
                        if (Game.time% Math.floor(123-(123-27)/3*psps.length) == 0) { // 123 at most
                            for (let i = 0; i < 4; i++) {
                                //intershardsacrificer('shard3', 'E11S47', 'E7S48');
                            }
                            for (let i = 0; i < 2; i++) {
                                //intershardsacrificer('shard3', 'E11S47', 'E13S53');
                            }
                        }
                    }
                    else { // build tunnel
                        if (Game.time% Math.floor(744-(744-477)/3*psps.length) == 0) {
                            //let bbb = createBody({WORK:24, CARRY:1, MOVE:24});
                            //Game.rooms['E11S47'].memory.forSpawning.spawningQueue.push({memory:{targetShardName: 'shard2', portalRoomName: 'E10S50', portalId: '5c0e406c504e0a34e3d61d5a', targetRoomName: 'E8S48', roleWillBe: 'pioneer', body: bbb, route: { 'E10S50': 'E10S53', 'E10S53': 'E13S54', 'E13S54': 'E13S53'}, role: 'oneWayInterSharder'},priority: 1.5});
                            //Game.rooms['E11S47'].memory.forSpawning.spawningQueue.push({memory:{targetShardName: 'shard2', portalRoomName: 'E10S50', portalId: '5c0e406c504e0a34e3d61d5a', targetRoomName: 'E8S48', roleWillBe: 'qiangWorker', body: ['?'], route: {'?': '?'}, role: 'oneWayInterSharder'}, priority: 15});
                        }
                    }
                }
            }
            else {
                Game.rooms['E11S47'].memory.frenzyMode = false;
            }
        }
        else {
            if (Game.time%333==0) {
                //symbolStealerSpawner('E7S48', 'E7S49');
            }
        }
        
        if (Game.shard.name == 'shard2' && Game.time%1990==0) {
            //sendClaimer('E31S49', 'E25S49', false)
            //kiterSpawner('E31S49', 'E25S49');
            //kiterSpawner('E13S58', 'E12S56', 5);
            //sendClaimer('E13S58', 'E12S56', false, true);
            //kiterSpawner('E13S58', 'E12S56');
            //Game.rooms.E13S53.memory.forSpawning.spawningQueue.push({ memory: { role: 'reserver', target: 'E9S52', big: true, roomEnergyMax: Game.rooms.E13S53.energyCapacityAvailable }, priority: 1 });
        }
        
        if (Game.shard.name == 'shard2' && Game.time%294==1) {
            //Game.rooms['E31S49'].memory.forSpawning.spawningQueue.push({memory:{role: 'oneWayInterSharder', targetShardName: 'shard3', portalRoomName: 'E30S50', portalId: '5c0e406c504e0a34e3d61dd7', targetRoomName: 'E29S51', roleWillBe: 'pioneer', body: ['?']},priority: 0.4});
            //Game.rooms['E31S49'].memory.forSpawning.spawningQueue.push({memory:{role: 'oneWayInterSharder', targetShardName: 'shard3', portalRoomName: 'E30S50', portalId: '5c0e406c504e0a34e3d61dd7', targetRoomName: 'E29S51', roleWillBe: 'claimer', body: 'claim'}, priority: 0.4}); // claime for small, otherwise big
        }
        
        if (Game.time%466==0) {
            //Game.rooms['E31S49'].memory.forSpawning.spawningQueue.push({ memory: { energy: 3000, role: 'pioneer', target: 'e29s47' , home: 'E31S49', superUpgrader: false, route:  undefined }, priority: 102 });
        }
        
        if (Game.shard.name == 'shard3' && Game.time%1000==828) {
            //sendClaimer('E11S47', 'E13S51', false);
            //kiterSpawner('E11S47', 'E12S51');
            //sendClaimer('E11S47', 'E12S49', false);
            //kiterSpawner('E11S47', 'E12S49');
            // add dismantler
            //sendClaimer('E11S47', 'E12S51', false); // too far
            //sendClaimer('E1S49', 'W1S58', false, true)
        }
        
        if (Game.shard.name == 'shard2' && Game.time%1000==777) {
            sendClaimer('E28S45', 'E27S45', false, true);
            //sendClaimer('W1S42', 'W1S43', false, true);
        }
        
        if (Game.shard.name == 'shard2' && Game.time%1250==60) {
            //kiterSpawner('E13S58', 'E11S55', 6);
        }
        
        if (Game.shard.name == 'shard3' && Game.time%100==1 && Game.rooms.E29S51.memory.mineralThresholds.currentMineralStats.energy>50000) {
            //intershardsacrificer('shard3', 'E1S41', 'W1S42');
            intershardsacrificer('shard3', 'E29S51', 'E31S49');
        }
        
        if (Game.shard.name == 'shardSeason') {
            //let c0 = Game.cpu.getUsed();
            //findPathForQuadsLeader(new RoomPosition(19, 26, 'W19S18'), new RoomPosition(12, 12, 'W19S19'));
            //fo(Game.cpu.getUsed()-c0)
            /*
            runEdgeCampTask();
            
            hiderSpawner('W19S18', 'W20S13', 'W19S13');
            hiderSpawner('W19S18', 'W20S12', 'W19S12');
            hiderSpawner('W19S18', 'W20S11', 'W19S11');
            hiderSpawner('W19S18', 'W20S8', 'W21S8');
            hiderSpawner('W19S18', 'W20S15', 'W20S14');
            hiderSpawner('W19S18', 'W20S14', 'W20S15');
            hiderSpawner('W19S18', 'W19S16', 'W20S16');
            hiderSpawner('W19S18', 'W20S16', 'W19S16');
            //hiderSpawner('W19S18', 'W19S13', 'W19S12');
            //hiderSpawner('W19S18', 'W19S12', 'W19S13');
            */
            
            if (false) {
                if (Game.time%333 == 675) {
                    //kiterSpawner('W9S19', 'W2S29', 'x');
                }
                if (Game.time%900==0) {
                    //Game.rooms['W1S19'].memory.forSpawning.spawningQueue.push({memory:{role: 'dismantler', target: 'W2S29'},priority: 6});
                }
                if (Game.time%1000==411) {
                    //gaysSpawner('W1S19', 'W2S29');
                }
            }
            
            if (Game.time%333 == 675) {
                //Game.rooms.W19S18.createConstructionSite(41, 42, STRUCTURE_OBSERVER);
                //stomperSpawner('W19S18', 'W20S15');
                //kiterSpawner('W19S18', 'W19S15', 5);
                //kiterSpawner('W9S19', 'W2S29', 'x');
                //kiterSpawner('W19S18', 'W20S25', 5);
                //kiterSpawner('W19S18', 'W20S26', 5);
            }
            
            if (Game.time%633 == 675) {
                //stomperSpawner('W19S18', 'W20S15');
                //kiterSpawner('W19S18', 'W18S16', 5);
                //kiterSpawner('W19S18', 'W29S12', 7);
            }
            if (false) {
                if (Game.time%675==0) {
                    if (Game.rooms['W19S16'] == undefined || Game.rooms['W19S16'].find(FIND_HOSTILE_CREEPS, {filter:c=>c.owner.username=='QzarSTB'}).length>0) {
                        stomperSpawner('W19S18', 'W19S16');
                    }
                }
                if (Game.time%900==411) {
                    //if (Game.rooms['W19S16'] == undefined || ( Game.rooms['W19S16'].find(FIND_MY_CREEPS, {filter:c=>c.memory.role=='gays'}).length<2 && Game.rooms['W19S16'].find(FIND_HOSTILE_CREEPS, {filter:c=>c.owner.username=='QzarSTB' && (getActiveBodyparts(ATTACK)+c.getActiveBodyparts(RANGED_ATTACK)+c.getActiveBodyparts(HEAL)>10)}).length>0)) {
                        gaysSpawner('W19S18', 'W19S16');
                    //}
                }
                if (Game.time%1000==611) {
                    if (Game.rooms['W19S16'] && Game.rooms['W19S16'].controller && Game.rooms['W19S16'].controller.owner !==undefined && Game.rooms['W19S16'].find(FIND_HOSTILE_STRUCTURES, {filter:t=>t.structureType==STRUCTURE_RAMPART}).length<3) {
                        sendClaimer('W19S18', 'W19S16', false, false, 3);
                    }
                    //sendClaimer('W1S42', 'W1S43', false, true);
                    //kiterSpawner('W9S19', 'W19S16', 7);
                }
                if (Game.time%1333==0) {
                    //kiterSpawner('W19S18', 'W19S16', 5);
                    //kiterSpawner('W19S18', 'W20S16', 5);
                }
                //primitiveCamping('W9S19', 'W19S16');
                //primitiveCamping('W9S19', 'W20S14');
            }
            
            if (Game.time%585==300) {
                //Game.rooms['W1S19'].memory.forSpawning.spawningQueue.push({ memory: { role: 'attacker', target: 'E1S7', home: 'W1S19', uniqueString: 'tigga' }, priority: 0.2 });
                //Game.rooms['W1S19'].memory.forSpawning.spawningQueue.push({ memory: { energy: 1500, role: 'pioneer', target: 'W19S18' , home: 'W1S19', superUpgrader: false, route:  undefined }, priority: 10 });
                //Game.rooms['W9S19'].memory.forSpawning.spawningQueue.push({ memory: { energy: 1300, role: 'pioneer', target: 'W28S19' , home: 'W9S19', superUpgrader: false, route:  undefined }, priority: 10 });
                //helpSubroom('W19S18', 'W28S19')
                //Game.rooms['E1S29'].memory.forSpawning.spawningQueue.push({memory:{energy: 3200, role: 'pioneer', target: 'W9S28', home: 'E1S29', superUpgrader: false},priority: 0.4});
                //Game.rooms['W9S19'].memory.forSpawning.spawningQueue.push({memory:{energy: 3200, role: 'pioneer', target: 'W9S28', home: 'W9S19', superUpgrader: true},priority: 0.4});
                if (Game.rooms['W22S29'].find(FIND_MY_STRUCTURES, {filter:s=>s.structureType==STRUCTURE_SPAWN}).length==0) {
                    Game.rooms['W19S18'].memory.forSpawning.spawningQueue.push({memory:{energy: 3200, role: 'pioneer', target: 'W22S29', home: 'W19S18', superUpgrader: false},priority: 0.4});
                }
                else if (Game.rooms['W22S29'] && Game.rooms['W22S29'].controller && Game.rooms['W22S29'].controller.my && (!Game.rooms['W22S29'].terminal || !Game.rooms['W22S29'].storage || (!Game.rooms['W22S29'].terminal && Game.rooms['W22S29'].storage.store.energy<100000))) {
                    sendSacrificer('W19S18', 'W22S29', 'energy', 25);
                }
                //sendSacrificer('E1S29', 'W9S28', 'energy', 25);
                //sendSacrificer('W9S19', 'W9S28', 'energy', 25);
                //sendSacrificer('W9S19', 'W19S27', undefined, 25);
                //sendSacrificer('W9S19', 'W9S9', undefined, 10);
            }
            
            /*
            if (Game.time%2000==1401) {
                quadsSpawner('E1S29', 'W1S28', 'r-');
                //Game.rooms['E1S29'].memory.forSpawning.spawningQueue.push({memory:{role: 'dismantler', target: 'W1S28', boostMats: ['ZH2O']},priority: 5});
            }
            if (Game.time%1000==999) {
                if (Game.rooms['W1S28'] && Game.rooms['W1S28'].controller && Game.rooms['W1S28'].controller.owner !==undefined && Game.rooms['W1S28'].controller.owner.username !==undefined && !allyList().includes(Game.rooms['W1S28'].controller.owner.username) && Game.rooms['W1S28'].controller.pos.findInRange(FIND_HOSTILE_STRUCTURES, {filter:t=>t.structureType==STRUCTURE_RAMPART}).length<returnALLAvailableLandCoords(Game.rooms['W1S28'], Game.rooms['W1S28'].controller.pos).length) {
                    sendClaimer('E1S29', 'W1S28', false, false, 1);
                }
            }
            if (Game.time%1000==413) {
                gaysSpawner('W1S19', 'W1S28');
            }
            */
            
            /*
            if (Game.time%1000==222) {
                if (Game.rooms['W1S28'] && Game.rooms['W1S28'].controller && Game.rooms['W1S28'].controller.owner !==undefined && Game.rooms['W1S28'].find(FIND_HOSTILE_STRUCTURES, {filter:t=>t.structureType==STRUCTURE_RAMPART}).length<3) {
                    sendClaimer('E1S29', 'W1S28', false, false, 2);
                }
                //sendClaimer('W1S42', 'W1S43', false, true);
                //kiterSpawner('W9S19', 'W19S16', 7);
            }
            if (Game.time%1111==0) {
                if (Game.rooms['W1S28'] == undefined || Game.rooms['W1S28'].find(FIND_HOSTILE_CREEPS, {filter:c=>c.owner.username=='Trepidimous'}).length>0) {
                    stomperSpawner('E1S29', 'W1S28');
                    gaysSpawner('E1S29', 'W1S28');
                }
            }
            */
            
            if (Game.time%1000==230) {
                //kiterSpawner('W9S19', 'W10S28');
                if (Game.rooms.W9S28.find(FIND_HOSTILE_CREEPS, {filter: s=>!allyList().includes(s.owner.username) && s.owner.username!='Invader'}).length>1) {
                    gaysSpawner('W9S19', 'W9S28');
                    gaysSpawner('E1S29', 'W9S28');
                    supportRedneckSpawner('W9S19', 'W9S28');
                    supportRedneckSpawner('E1S29', 'W9S28');
                }
            }
            
            if (Game.time%1000==411) {
                //quadsSpawner('W1S19', 'W2S29', 'r');
                //gaysSpawner('W1S19', 'W3S28');
                //gaysSpawner('W1S19', 'W2S29');
                //gaysSpawner('W9S19', 'W11S23');
            }
            if (Game.time%2500==1411) {
                //kiterSpawner('E1S29', 'W8S29', 'x');
                //quadsSpawner('E1S29', 'W2S29', 'rx');
                //quadsSpawner('W9S19', 'W11S23', 'rx');
            }
            if (Game.time%5300==861) {
                //kiterSpawner('E1S29', 'W2S28', 'x');
            }
            if (Game.time%900==881) {
                //kiterSpawner('W1S19', 'W2S30', 'x');
            }
            if (Game.time%4100==61) {
                //kiterSpawner('W1S19', 'W2S27', 'x');
                //kiterSpawner('W9S19', 'W10S28', 'x');
            }
            if (Game.time%4100==661) {
                //kiterSpawner('W1S19', 'W3S28', 'x');
                //quadsSpawner('W1S19', 'W2S29', 'r');
            }
            if (Game.time%4500==1461) {
                //kiterSpawner('W9S19', 'W2S28', 'x');
                //quadsSpawner('W9S19', 'W11S23', 'r');
            }
            if (Game.time%4500==261) {
                //kiterSpawner('W9S19', 'W11S22', 'x');
                //quadsSpawner('W1S19', 'W11S23', 'r');
            }
            
            if (Game.time%1333==0 && Game.rooms.W29S12.memory.mineralThresholds.currentMineralStats.power<6000 && Game.rooms.W19S18.memory.mineralThresholds.currentMineralStats.power>4000) {
                //sendSacrificer('W19S18', 'W29S12', undefined, 25);
            }
            
            /*
            if (Game.gcl.level == 5 && Memory.tempto == undefined) {
                helpSubroom('W9S19', 'W9S9');
                Memory.tempto = true;
            }
            */
            /*
            if (Game.time%78==0) {
                if (Game.rooms.W19S18.createConstructionSite(7,33,STRUCTURE_EXTRACTOR) == OK) {
                    if (Game.rooms.W19S18.createConstructionSite(8,34,STRUCTURE_CONTAINER) == OK) {
                        Game.rooms.W19S18.createConstructionSite(36,35,STRUCTURE_TERMINAL);
                    }
                }
            }
            */
            
            if (false) {
                let defcross = false;
                for (let pid in Memory.storedSymbols.shardSeason) {
                    if (Memory.storedSymbols.shardSeason[pid].mrn == 'E1S29') {
                        defcross = true;
                        break
                    }
                }
                if (defcross) {
                    if (Game.time%1333==0) {
                        kiterSpawner('E1S29', 'W2S30', 'x');
                    }
                    if (Game.time%833==0) {
                        kiterSpawner('W1S19', 'W2S30', 'x');
                    }
                    if (Game.time%700==0) {
                        //gaysSpawner('W1S19', 'W2S27');
                        kiterSpawner('W1S19', 'W2S27', 'x');
                    }
                    if (Game.time%1300==433) {
                        //gaysSpawner('E1S29', 'W2S28');
                        kiterSpawner('E1S29', 'W2S28', 'x');
                    }
                }
                
                let defbot = false;
                for (let pid in Memory.storedSymbols.shardSeason) {
                    if (Memory.storedSymbols.shardSeason[pid].mrn == 'W9S28') {
                        defbot = true;
                        break
                    }
                }
                if (defbot) {
                    if (Game.time%700==0) {
                        //gaysSpawner('W9S28', 'W10S29');
                        kiterSpawner('W9S28', 'W10S29', 'x');
                    }
                    if (Game.time%700==350) {
                        //gaysSpawner('W9S28', 'W8S30');
                        kiterSpawner('W9S28', 'W8S30', 'x');
                    }
                }
            }
                

            if (false) {
                helpDefendRoom('W9S19', 'W19S18');
                helpDefendRoom('W1S19', 'W19S18');
                helpDefendRoom('W9S19', 'W9S9');
                helpDefendRoom('W1S19', 'W9S9')
            }
        }
        
        //fleeTest();
    }
    catch (err) {
        fo(err.stack)
    }
    calcCpuProcesses.misc_sp = Game.cpu.getUsed()-misc_sp;

    let pc_manage = Game.cpu.getUsed();
    //pc.powerCreepManaging(currentShard);
    try {
        pc.powerCreepManaging(currentShard);
    }
    catch (err) {
        fo('pc code bug')
        fo(err.stack)
    }
    calcCpuProcesses.pc_manage = Game.cpu.getUsed()-pc_manage;
    
    let highway_harv = Game.cpu.getUsed();
    //powerAllInOne(currentShard);
    //depositAllInOne(currentShard);
    try {
        if (Game.shard.name == 'shard3' || Game.shard.name == 'shardSeason') {
            // power
            powerAllInOne(currentShard);
            //depositAllInOne(currentShard);
        }
    }
    catch (err) {
        fo('power code bugged')
        fo(err.stack)
    }
    calcCpuProcesses.highway_harv = Game.cpu.getUsed()-highway_harv;
    
    //previousCPU = calculateCPUUsageOfProcesses(previousCPU, 'pre-room CPU usage', true);
    
        for (let roomNameIdx in Memory.myRoomList[currentShard]) {
            let roomName = Memory.myRoomList[currentShard][roomNameIdx];
            //if (currentShard=='shard2' || (currentShard=='shard3' && (Game.cpu.bucket>5000 || roomName=='E11S47' || roomName=='E1S49' || roomName=='E1S41'))) {
            if (true) {
                let room = Game.rooms[roomName];
                if (room.memory && room.memory.weird) {
                    
                }
                else if (Game.shard.name=='shard3' && !(roomName=='E11S47'||roomName=='E1S41'||roomName=='E1S49'||roomName=='E11S1'||roomName=='E29S51'||roomName=='W2S58')) { // 
                    
                }
                else if (Game.shard.name=='shardSeason' && roomName == 'W13S21') {
                    
                }
                /*
                else if (Game.time%10==0 && roomName == 'E1S41' && Game.shard.name=='shard3') {
                    if (false) {
                        if (Game.rooms.E1S41.terminal.store.energy<50000) {
                            if (Game.rooms.E11S47.terminal.cooldown == 0 && Game.rooms.E11S47.terminal.store.energy>30000) {
                                Game.rooms.E11S47.terminal.send('energy', 10000, 'E1S41');
                            }
                            if (Game.rooms.E1S49.terminal.cooldown == 0 && Game.rooms.E1S49.terminal.store.energy>30000) {
                                Game.rooms.E1S49.terminal.send('energy', 10000, 'E1S41');
                            }
                        }
                        if (Game.rooms.E1S41.terminal.store.energy<125000) {
                            checkTradingEnergyCostAndBuy('E1S41', 'energy', 10000);
                            //checkTradingPriceAndPostBuyOrder('E1S41','energy', 5000, 0.001);
                        }
                        if (Game.time%77==0) {
                            popBubble(Game.rooms.E1S41);
                        }
                    }
                }
                */
                else {
                    try {
                        let cpucnt = Game.cpu.getUsed();
                        // movement task manager
                        let taskScanInterv = 3;
                        if (room.memory.coreBaseReady) {
                            taskScanInterv = 20;
                        }
                        if ((room.controller.level<=3 || (room.find(FIND_MY_CREEPS, {filter:c=>c.memory.role=='miner'&&c.getActiveBodyparts(MOVE)==0}).length>0)) && Game.time%taskScanInterv==0) {
                            structureGetE(roomName);
                            resourceOfferE(roomName);
                            taskMove.moveTaskManager(roomName);
                            energyTaskManager(roomName);
                            energyGetTaskManager(roomName);
                        }
                        room.updateEnergyStructures();
                        calcCpuProcesses.tasks += Game.cpu.getUsed()-cpucnt;
                    }
                    catch (err) {
                        fo(roomName + ' room manage code bugged')
                    }
                    
                    try {
                        // update room build plan and place site
                        cpucnt = Game.cpu.getUsed();
                        if (Game.time%777 == 3 || room.memory.newAnchor == undefined || (room.controller.level<=3 && Game.time%55==0) || (room.memory.forSpawning && room.memory.forSpawning.roomCreepNo && room.memory.forSpawning.roomCreepNo.minCreeps['builder'] > 0 && Game.time%3 == 1)) {
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
                    }
                    catch (err) {
                        fo(roomName + ' spawning code bugged');
                        fo(err.stack);
                    }
                    
                    //manageRemoteRoomsResourceGetting(roomName);
                    try {
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
                    }
                    catch (err) {
                        fo(roomName + ' remote code bugged')
                    }
                    
                    // link misc CPU calc
                    try {
                        cpucnt = Game.cpu.getUsed();
                        initiateLinksInRoom(room); // has 50 interval
                        if (Game.time % 100 == 0) {
                            //checkIfCreepInfoUpdateRequired(roomName);
                            newLinkSuperUpgraderPosisCach(roomName);
                            superUpgraderBalancing(roomName);
                        }
                        
                        mainBuildSub(room, undefined);
                        
                        linkTransfer(room);

                        //season special
                        sendMappers(room); // <<<<<<<<<<<<<<<<<
                        calcCpuProcesses.link_misc += Game.cpu.getUsed()-cpucnt;
                    }
                    catch (err) {
                        fo(roomName + ' link/mapper code bugged')
                    }
                    
                    try {
                        cpucnt = Game.cpu.getUsed();
                        // high way
                        try {
                            //highwayManager(room);
                        }
                        catch (err) {
                            fo(room.name + ' highway bugged');
                        }
                    }
                    catch (err) {
                        fo(roomName + ' highway code bugged')
                    }

                    try {
                        // power
                        observerScanForPower(roomName);
                        powerspawnProcessPower(room);
                    }
                    catch (err) {
                        fo(roomName + ' power observing code bugged')
                    }
                    
                    // factory
                    //runFactory(room.name);
                    try {
                        runFactory(room.name);
                    }
                    catch (err) {
                        console.log('error: factory code');
                    }
                    
                    try {
                        // room defend activate bubble
                        if (room.name == 'E7S48' || Game.time%17==0) {
                            popBubble(room);
                        }
                        checkNuker(room);
                        calcCpuProcesses.misc += Game.cpu.getUsed()-cpucnt;
                    }
                    catch (err) {
                        fo(roomName + ' bubble code bugged')
                    }
                    
                    try {
                        cpucnt = Game.cpu.getUsed();
                        // initial mineral storage variables
                        initiateMineralKeepThresholdInRoom(room, false);
                        if (Game.time % 19 == 0) { // update all res situation
                            allMineralsSituation(room);
                            checkMineralAndSell(roomName);
                            if (Math.random()<0.1) {
                                cutStupidPrice(room);
                            }
                        }
                        calcCpuProcesses.mineralManage += Game.cpu.getUsed()-cpucnt;
                    }
                    catch (err) {
                        fo(roomName + ' res flow code bugged')
                    }
                    
                    try {    
                        cpucnt = Game.cpu.getUsed();
                        // labbing
                        if (Game.time%50==7) {
                            cacheLabsInAndOut(roomName); // for lab caching
                        }
                        if (Game.time%3333==0) { // change an available compound to produce
                            pickACompoundToProduce(roomName);
                        }
                        // labfilling memory manage
                        addLabFillTask(roomName);
                        //changeMineralProductionInRoom(roomName); // completely random choose to produce
                        if (Game.time % 777 == 0) {
                            if (startLabber(Game.rooms[roomName])) {
                                Game.rooms[roomName].memory.forSpawning.roomCreepNo.minCreeps.labber = 0;
                                Game.rooms[roomName].memory.forSpawning.roomCreepNo.creepEnergy.labber = 600;
                            }

                            if (Game.time % 678 == 0) {
                                mainBuildSub(room, undefined);
                            }
                        }
                        if ((Game.time+7) % reactionTimeInterval(Game.rooms[roomName]) == 0) {
                            labRun(Game.rooms[roomName]);
                        }
                        calcCpuProcesses.lab += Game.cpu.getUsed()-cpucnt;
                    }
                    catch (err) {
                        fo(roomName + ' lab code bugged')
                    }
                    
                    try {    
                        cpucnt = Game.cpu.getUsed();
                        //towerDefence(room);
                        
                        if (determineIfFucked(room)[0] < 1) {
                            towerRepairInPeace(room);
                        }
                        
                        rampartManagement(room.name);
                        calcCpuProcesses.tower += Game.cpu.getUsed()-cpucnt;
                    }
                    catch (err) {
                        fo(roomName + ' def code bugged')
                    }
                }
            }
            else {
                // pass
            }
            if (false) { // (!(roomName == 'E4S49') && !(roomName == 'E11S47') && !(roomName == 'E13S53')) {
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

                            if (Game.time % 49 == 0) {
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
                checkMineralStatsAndSend(1);
                let tempout = Game.cpu.getUsed()-cpucnt;
                fo('res flow took '+tempout+'CPUs');
            }
            calcCpuProcesses.resFlow += Game.cpu.getUsed()-cpucnt;
            
            if (Game.shard.name!='shardSeason' && (Game.time%47==0 || (Game.cpu.bucket>9950))) {
                estimateCommodityPrices();
            }
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
        showPowerStatsS3();
        //showSymPicPosi(); // s2
    }
    catch (err) {
        fo('stats show bug')
    }
    too = Game.cpu.getUsed()-too;
    new RoomVisual().text(too.toFixed(1), 45.5, 0, {align: 'right'}); 
};