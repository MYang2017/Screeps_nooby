// https://www.youtube.com/watch?v=BiIDH2Ui8L8&t=294s
// https://github.com/lodash/lodash/blob/3.10.1/doc/README.md
//https://docs.google.com/spreadsheets/d/1Q6MfwRZb4kood_OE5_vwcIJgIzZUsx4-haWphEw6GqI/edit#gid=0

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

module.exports.loop = function () {
    // clear memory
    for (let name in Memory.creeps) {
        if (Game.creeps[name] == undefined) {
            delete Memory.creeps[name];
        }
    }

    // let different creep do its job
    for (let name in Game.creeps) {
        /*if (Game.creeps[name].memory.spawnTime == undefined||Game.creeps[name].memory.spawnTime == null) {
            Game.creeps[name].memory.spawnTime = 3*Game.creeps[name].getActiveBodyparts();
        }*/
        Game.creeps[name].runRole();
    }

    // tower fill energy
    var towers = _.filter( Game.structures, c => c.structureType == STRUCTURE_TOWER );
    for (let tower of towers) {
        tower.defend();
    }

    // test room spawn queue function
    //for (let roomName of []) {
    for (let roomName of myRoomList()) {
        //console.log(roomName);
        let room = Game.rooms[roomName];
        // link transfer
        let receiverLink = Game.flags['link'+roomName].pos.findInRange(FIND_STRUCTURES, 1, {filter: s => s.structureType == STRUCTURE_LINK})[0];
        if (receiverLink && receiverLink.energy < 700) {
            let linksInRoom = room.find(FIND_MY_STRUCTURES, {filter: f => (f.structureType == STRUCTURE_LINK)&&(f.id != receiverLink.id)});
            linkTransferToCentre(receiverLink,linksInRoom);
        }

        if (Game.time % 11 == 0) { //
            room.updateSpawnQueue();
        }
        if (room.memory.forSpawning.spawningQueue.length>0 && ifSpawnAvailable(roomName).length>0) { // if there is some creeps waiting to be spawned in the queue and spawn is free, then spawn
            spawnCreepByRoomSpawnQueue(room);
        }

        if (determineIfFucked(room)[0]<1) {
            towerRepairInPeace(room);
        }
        /*if ((Game.spawns['Spawn_E97N14'].spawning == null)&&((Game.rooms['E97N14'].find(FIND_MY_CREEPS, {filter:s=>s.memory.role=='upgrader'})).length<1)&&(Game.rooms['E97N14'].energyAvailable > 1600)&&(Game.rooms['E97N14'].storage.store.energy > 300000)) { // all spawns in room E91N16 are free
            Game.spawns['Spawn_E97N14'].createCustomCreep(1000,'upgrader'); // create upgrader
            console.log('more upgraders!');
        }*/
    }
      /*}
      else { // for the new room
        if (_.sum(spawn.room.find(FIND_MY_CREEPS), (c) => c.memory.role == 'harvester') < spawn.memory.minCreeps['harvester']) { // loop through every roles and check with min number. if not enough, spawn other creeps
            spawningCreepName = spawn.createCreep([WORK,CARRY,MOVE], undefined, {role: 'harvester', sourceIndex: 0, working: false});
        }
        if ((spawningCreepName == undefined)&&(_.sum(spawn.room.find(FIND_MY_CREEPS), (c) => c.memory.role == 'upgrader') < spawn.memory.minCreeps['upgrader'])) { // loop through every roles and check with min number. if not enough, spawn other creeps
            spawningCreepName = spawn.createCustomCreep(spawn.room.energyCapacityAvailable, 'upgrader');
        }
        if ((spawningCreepName == undefined)&&(_.sum(spawn.room.find(FIND_MY_CREEPS), (c) => c.memory.role == 'builder') < spawn.memory.minCreeps['builder'])) { // loop through every roles and check with min number. if not enough, spawn other creeps
            spawningCreepName = spawn.createCustomCreep(spawn.room.energyCapacityAvailable, 'builder');
        }
      }*/
    // temperory code section:
    // to steal energy from neighbours
    /*if (_.sum(getAllMyCreepsWithSpawning(), c => c.memory.role == 'teezer')<2 ) {
        Game.spawns['Spawn_E94N17_1'].createTeezer(1000,'E93N17','E94N17');
    }*/

    if (Game.time % 200 == 0 && Game.rooms['E94N22'].storage.store.energy>200000) {
        Game.rooms['E91N16'].memory.forSpawning.spawningQueue.push({memory:{energy: 2000, role: 'pioneer', target: 'E94N22', home: 'E91N16'},priority: 0.4});
        console.log('remote pioneer upgrader condition meet, spawning: pioneer upgraders to room E94N22');
    }

    if (!_.some(getAllMyCreepsWithSpawning('E92N12'), c => c.memory.role == 'begger' && c.memory.target == 'E94N12') ) {
        Game.spawns['Spawn_E92N12_1'].createBegger(2500,'E92N12','E94N12');
    }

    if (Game.time % 1000 == 0) {
        /*unspentEnergySendTo('E92N11','E97N14');
        unspentEnergySendTo('E91N16','E97N14');
        unspentEnergySendTo('E92N12','E97N14');*/
        unspentEnergySendTo('E92N11','E94N17');
        unspentEnergySendTo('E91N16','E94N17');
        unspentEnergySendTo('E92N12','E94N17');
    }

    if (Game.time % 1001 == 0) {
        superUpgraderBalancing('E94N17');
        superUpgraderBalancing('E97N14');
    }

    if ( (Game.rooms['E94N17'].terminal.store.energy > 150000) && (_.sum(getAllMyCreepsWithSpawning('E94N17'), c => c.memory.role == 'antiTransporter')<1) ) {
        Game.spawns['Spawn_E94N17'].createAntiTransporter('energy');
    }
    if ( (Game.rooms['E97N14'].terminal.store.energy > 150000) && (_.sum(getAllMyCreepsWithSpawning('E97N14'), c => c.memory.role == 'antiTransporter')<1) ) {
        Game.spawns['Spawn_E97N14'].createAntiTransporter('energy');
    }
    /*if (!_.some(getAllMyCreepsWithSpawning(), c => c.memory.role == 'begger' && c.memory.target == 'E91N9') ) {
        Game.spawns['Spawn_E92N11'].createBegger(2500,'E92N11','E91N9');
    }*/
    // to use over harvested unspent energy in room E91N16 by sending upgraders from room E92N11
    /*if (runEveryTicks(100) == true) {
        if ( (Game.rooms['E91N16'].storage.store.energy > 600000) && (Game.rooms['E92N11'].storage.store.energy > 100000) ) { // if room E91N16 has too much energy in storage accumelating and cannot be spent
            if ((Game.spawns['Spawn1'].spawning == null)&&(Game.spawns['Spawn_E92N11'].spawning == null)) { // all spawns in room E92N11 are free
                if (Game.rooms['E92N11'].energyAvailable > 5000) {
                    let remotePioneerUpgrader = Game.spawns['Spawn_E92N11'].createPioneer(2000,'E91N16','E92N11'); // create pioneer
                    console.log('remote pioneer upgrader condition meet, Spawn_E92N11 spawning: '+remotePioneerUpgrader);
                }
            }
        }
        if ( (Game.rooms['E91N16'].storage.store.energy > 600000) && (Game.rooms['E92N12'].storage.store.energy > 100000) ) { // if room E91N16 has too much energy in storage accumelating and cannot be spent
            if ((Game.spawns['Spawn_E92N12'].spawning == null)&&(Game.spawns['Spawn_E92N12_1'].spawning == null)) { // all spawns in room E92N11 are free
                if (Game.rooms['E92N12'].energyAvailable > 5000) {
                    let remotePioneerUpgrader = Game.spawns['Spawn_E92N12_1'].createPioneer(2000,'E91N16','E92N12'); // create pioneer
                    console.log('remote pioneer upgrader condition meet, Spawn_E92N12_1 spawning: '+remotePioneerUpgrader);
                }
            }
        }
    }*/
    // send workers to E94N17 from room E97N14
    /*if (runEveryTicks(35) == true) {
        if ((Game.spawns['Spawn_E91N16'].spawning == null)&&(Game.spawns['Spawn_'].spawning == null)&&(Game.rooms['E91N16'].energyAvailable > 3000) && (Game.rooms['E94N17'].storage.store.energy > 100000)) { // all spawns in room E91N16 are free
            let remotePioneerUpgrader = Game.spawns['Spawn_'].createPioneer(2000,'E94N17','E91N16'); // create pioneer
            console.log('remote pioneer upgrader condition meet, spawning: '+remotePioneerUpgrader);
        }
    }*/

    // for bringing power source points
    /*if (Game.time > 19408170) {
        // do nothing
    }
    else if (Game.time > 19408000) {
        Game.spawns['Spawn1'].createPowerSourceLorry('E90N11','E92N11');
        Game.spawns['Spawn_E92N11'].createPowerSourceLorry('E90N11','E92N11');
        Game.spawns['Spawn_E92N12'].createPowerSourceLorry('E90N11','E92N11');
        Game.spawns['Spawn_E92N12_1'].createPowerSourceLorry('E90N11','E92N11');
    }*/

    // labbing
    //if (runEveryTicks(10) == true) {
        for (let roomName of ['E92N11']) {
            labRun(Game.rooms[roomName]);
        }
    //}

    // trading
    if (Game.time % 30 == 0) {
        checkTradingEnergyCostAndSell('E92N11','H');
        checkTradingEnergyCostAndSell('E92N12','H');
        checkTradingEnergyCostAndSell('E94N17','H');
        checkTradingEnergyCostAndSell('E91N16','U');

        checkTradingEnergyCostAndBuy('E92N11','O');
    }
};
