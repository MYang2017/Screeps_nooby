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
    scouter : 1,
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
    keeperLairLorry: 8
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
    'rampartRepairer',
    'begger',
    'longDistanceUpgrader',
    'labber',
    'superUpgrader',
    'keeperLairMeleeKeeper',
    'keeperLairLorry'
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
  let spawningQueue = room.memory.forSpawning.spawningQueue;

  let imaginaryCreepsInRoom = creepsInRoom.concat(spawningQueue); // combine real creeps in room with creeps in spawning queue

  let NoOfCreeps = {};

  for (let role of listOfRoles) { // calculate number of creeps in current spawn room
      NoOfCreeps[role] = _.sum(imaginaryCreepsInRoom, (c) => c.memory.role == role);
  }

  let maxEnergy = room.energyCapacityAvailable;

  let fuckness = determineIfFucked(room)[0];

  if (fuckness<1) { // fuckness, 18 equivilient to about 6 HEAL parts or 8 RANGED_ATTACK parts or 18 attack parts
      // AI in the current spawn's remote mining neighbours /////////////////////////////////////////////////////////////////////////////////////
      // back up code if wiped, from energy taking creeps first: miners, lorries, harvesters
      //towerRepairInPeace(room);
      if ( (creepsInRoom.length < 3) && (room.energyAvailable < 550) && (_.sum(imaginaryCreepsInRoom, (c) => c.memory.role == 'harvester') < 3 ) && (_.sum(imaginaryCreepsInRoom, (c) => c.memory.role == 'lorry') == 0) ) { // if no harvester or lorries in current spawn room, recovering phase
          if ( _.some(creepsInRoom, c => c.memory.role == 'miner' || c.memory.role == 'pickuper') ) {
          //if (NoOfCreeps['miner'] > 0) {
              console.log(this.name+' added rescue lorry')
              spawningQueue.push({memory:{energy: 200, role: 'lorry'},priority: 15});
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
            for (let source of sources) {
              if (!_.some(imaginaryCreepsInRoom,
                c => c.memory.role == 'miner' && c.memory.sourceID == source.id
                && (c.ticksToLive > (1500+3*6-Game.rooms[room.name].memory.sourceTravelTime[source.id]) || c.ticksToLive == undefined )
                )) { // if there is no miner going to THE source, and life is long enough for the next one to take place or live length is undefined (being spawned)
                    let sourceLink =  source.pos.findInRange(FIND_STRUCTURES, 2, {filter: s => s.structureType == STRUCTURE_LINK}); // find a link and determine if it is link or container mining
                    let containers = source.pos.findInRange(FIND_STRUCTURES, 1, {filter: s => s.structureType == STRUCTURE_CONTAINER});
                    if (sourceLink.length>0) {
                        //console.log('need to spawn '+source.id+' in room '+room.name+' in advance');
                        console.log(this.name+' added miner '+source.id)
                        spawningQueue.push({memory:{role: 'miner', sourceID: source.id, target: undefined, currentRCL: currentRCL, ifMineEnergy: true, ifLink: true, ifKeeper: false},priority: rolePriority['miner']});
                    }
                    else {
                        //console.log('need to spawn '+source.id+' in room '+room.name+' in advance');
                        console.log(this.name+' added miner '+source.id)
                        spawningQueue.push({memory:{role: 'miner', sourceID: source.id, target: undefined, currentRCL: currentRCL, ifMineEnergy: true, ifLink: false, ifKeeper: false},priority: rolePriority['miner']});
                    }
                }
            }
            let mineral = room.find(FIND_MINERALS)[0]; // find mineral deposite
            let extractor = room.find(FIND_MY_STRUCTURES ,{filter:c=>c.structureType==STRUCTURE_EXTRACTOR})[0]; // find extractor already built
            if (extractor != undefined && mineral.mineralAmount>0) {
              if (!_.some(imaginaryCreepsInRoom, c => c.memory.role == 'miner' && c.memory.sourceID == mineral.id)) {
                  let mineralContainer =  mineral.pos.findInRange(FIND_STRUCTURES, 1, {filter: s => s.structureType == STRUCTURE_CONTAINER});
                  if (mineralContainer.length>0) {
                      console.log(this.name+' added mineral miner')
                      spawningQueue.push({memory:{role: 'miner', sourceID: mineral.id, target: undefined, currentRCL: currentRCL, ifMineEnergy: false, ifLink: false, ifKeeper: false},priority: rolePriority['miner']});
                      /*spawner = whichSpawnSpawns(this, subSpawn);
                      spawningCreepName = spawner.createMiner(mineral.id, undefined, currentRCL, false);
                      if ((subSpawn!=undefined)&&(spawningCreepName==OK)) { // each time there is a creep successfully spawned, creeps in room need to be calculate again with the being-spawned creep added into the list
                        creepsInRoom = updateCreepsInRoomWithSpawning(this);
                      }*/
                  }
              }
            }
          }
      }

      if (true) { // }(spawningCreepName == undefined) { // no energy problem, start other creeps building
          for (let role of listOfRoles) {
              /*if (role == 'claimer' && this.memory.claimRoom != undefined) { // if you want to spawn claimer and claim a room
                  spawner = whichSpawnSpawns(this, subSpawn);
                  spawningCreepName = spawner.createClaimer(this.memory.claimRoom);
                  if (!(spawningCreepName < 0)) { // if a claimer is successfully spawned, delete claimRoom variable
                      console.log('claimer created marching towards '+this.memory.claimRoom+'!');
                      delete this.memory.claimRoom;
                  }
              }*/
              /*else if (role == 'begger') { // if a begger is required (normally in new base rooms)
                  let Nobeggers = _.sum(Game.creeps, (c) => c.memory.role == 'begger');
                  //console.log(Nobeggers,this.memory.minCreeps['begger']);
                  if (Nobeggers < this.memory.minCreeps['begger']) { // not enough beggers
                      spawner = whichSpawnSpawns(this, subSpawn);
                      spawningCreepName = spawner.createBegger(maxEnergy, this.room.name, 'E92N11');
                  }
              }
              else if (role == 'longDistanceUpgrader') { // if a begger is required (normally in new base rooms)
                  if (NoOfCreeps[role] < this.memory.minCreeps[role]) { // not enough beggers
                      spawner = whichSpawnSpawns(this, subSpawn);
                      spawningCreepName = spawner.createLongDistanceUpgrader(maxEnergy, this.room.name, 'E92N11');
                  }
              }*/
              if (NoOfCreeps[role] < roomSpawningInfo.minCreeps[role]) { // loop through every roles and check with min number. if not enough, spawn other creeps
                  console.log(this.name+' added '+role)
                  spawningQueue.push({memory:{energy: roomSpawningInfo.creepEnergy[role], role: role, target: room.name},priority: rolePriority[role]});
                  /*spawner = whichSpawnSpawns(this, subSpawn);
                  spawningCreepName = spawner.createCustomCreep(this.memory.creepEnergy[role], role);
                  //console.log(this.room.name,role,NoOfCreeps[role],this.memory.minCreeps[role],spawningCreepName);
                  if ((subSpawn!=undefined)&&(spawningCreepName==OK)) { // each time there is a creep successfully spawned, the number of creeps need to be calculate again for indicating sub-spawn the correct number of creeps
                    // calculate number of creeps in current spawn room
                    creepsInRoom = updateCreepsInRoomWithSpawning(this);
                    NoOfCreeps[role] = _.sum(imaginaryCreepsInRoom, (c) => c.memory.role == role);
                  }*/
              }
          }
      }

      let currentRoomName = room.name;
      // AI in the current spawn's remote mining neighbours /////////////////////////////////////////////////////////////////////////////////////
      if (true) { //}(spawningCreepName == undefined) { // if no creeps needed to spawn for the current room
          if (roomSpawningInfo.remoteMode == 1) { // 1 for remote miner mining, 0 for remote harvester mining
              let neighbourRoomNames = room.memory.remoteMiningRoomNames;
              for (let i = 0; i<neighbourRoomNames.length; i++) {
                  let remoteMiningRoomName = neighbourRoomNames[i];
                  //console.log('scan all remoment mining rooms: '+remoteMiningRoomName);
                  // calculate No. of scouters in each reservable rooms around current spawn room, if no scouters there, spawn 1, if yes, send miners
                  let NoScouters = _.sum(imaginaryCreepsInRoom, (c) => c.memory.role == 'scouter' && c.memory.target == remoteMiningRoomName);
                  //console.log((Game.creeps[remoteMiningRoomName] == undefined) , (NoScouters<1),remoteMiningRoomName);
                  if ( (Game.creeps[remoteMiningRoomName] == undefined) && (NoScouters<1) ) { // if no scouter for the remote mining room in current spawn room and target room, spawn a scouter
                      console.log(this.name+' added scouter '+remoteMiningRoomName)
                      spawningQueue.push({memory:{role: 'scouter', target: remoteMiningRoomName},priority: rolePriority['scouter']});
                      /*spawner = whichSpawnSpawns(this, subSpawn);
                      spawningCreepName = spawner.createScouter(50, remoteMiningRoomName, remoteMiningRoomName);
                      if ((subSpawn!=undefined)&&(spawningCreepName==OK)) { // each time there is a creep successfully spawned, creeps in room need to be calculate again with the being-spawned creep added into the list
                        creepsInRoom = updateCreepsInRoomWithSpawning(this);
                      }*/
                  }
                  else if (Game.rooms[remoteMiningRoomName] != undefined) { // scouter there or on its way, check if arrived in that room
                      var creepsInRemoteRoom = Game.rooms[remoteMiningRoomName].find(FIND_MY_CREEPS);
                      var creepsInHomeAndRemoteRoom = imaginaryCreepsInRoom.concat(creepsInRemoteRoom);
                      var netRemoteFuckness;
                      var enemyFuckness;
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
                      [netRemoteFuckness, enemyFuckness] = determineIfFuckedRemote(Game.rooms[remoteMiningRoomName],creepsInHomeAndRemoteRoom);
                      //[netRemoteFuckness, enemyFuckness] = determineIfFucked(Game.creeps[remoteMiningRoomName].room);
                      //let enemy = Game.creeps[remoteMiningRoomName].room.find(FIND_HOSTILE_CREEPS, {filter: s => (!allyList().includes(s.owner))});
                      //console.log(enemyFuckness, remoteMiningRoomName);
                      if ( enemyFuckness == 0 ) { // if there is no enemy spawn builders then reservers then miners AND room is neutral
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
                          if ( NoLongDistanceBuilders < roomSpawningInfo.minNoRemoteBuilders[i]) { // if not enough long distance builders, spawn
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
                                  NoReserversRequired = roomSpawningInfo.minNoRemoteReservers[i];
                              }
                              // calculate No. of reservers in each reservable rooms around current spawn room
                              let NoReservers = _.sum(creepsInHomeAndRemoteRoom, (c) => c.memory.role == 'reserver' && c.memory.target == remoteMiningRoomName);
                              if ( NoReservers < NoReserversRequired && ((Game.rooms[remoteMiningRoomName].controller.owner==undefined)||(Game.rooms[remoteMiningRoomName].controller.reservation.ticksToEnd<4200)) ) { // if not enough reservers, spawn {
                                  console.log(this.name+' added reserver '+remoteMiningRoomName)
                                  spawningQueue.push({memory:{role: 'reserver', target: remoteMiningRoomName, big: bigReserver},priority: rolePriority['reserver']});
                                  /*spawner = whichSpawnSpawns(this, subSpawn);
                                  spawningCreepName = spawner.createReserver(remoteMiningRoomName);
                                  if ((subSpawn!=undefined)&&(spawningCreepName==OK)) { // each time there is a creep successfully spawned, creeps in room need to be calculate again with the being-spawned creep added into the list
                                    creepsInRoom = updateCreepsInRoomWithSpawning(this);
                                  }*/
                              }
                              else { // enough reservers, spawn miners
                                  //console.log(Game.creeps[remoteMiningRoomName]);
                                  let sources = Game.rooms[remoteMiningRoomName].find(FIND_SOURCES);
                                  if (Game.rooms[remoteMiningRoomName].memory.sourceTravelTime) {
                                      for (let source of sources) { // only spawn a miner if it cannot be found both in the spawn room and destination room
                                        if ( !_.some(creepsInHomeAndRemoteRoom,
                                        c => c.memory.role == 'miner' && c.memory.sourceID == source.id
                                        && (c.ticksToLive > (1500+3*9-Game.rooms[remoteMiningRoomName].memory.sourceTravelTime[source.id]) || c.ticksToLive == undefined)
                                      ) && (room.energyCapacityAvailable>=950)
                                        ) {
                                                  if (currentRCL > 3) {
                                                      console.log(this.name+' added remote miner '+remoteMiningRoomName,source.id)
                                                      spawningQueue.push({memory:{role: 'miner', sourceID: source.id, target: remoteMiningRoomName, currentRCL: 0, ifMineEnergy: true, ifLink: false, ifKeeper: false},priority: rolePriority['miner']});
                                                  }
                                          }
                                          else { // find a miner in neighbour or current spawn, lets harvest!, GO GO LORRIES!
                                              // calculate No. of lorries in each reservable rooms around current spawn room
                                              let NoLongDistanceLorries = _.sum(creepsInHomeAndRemoteRoom, (c) => c.memory.role == 'longDistanceLorry' && c.memory.target == remoteMiningRoomName);
                                              /*if (remoteMiningRoomName=='E93N18') {
                                                  console.log(NoLongDistanceLorries)
                                              }*/
                                              if ( NoLongDistanceLorries < roomSpawningInfo.minNoRemoteLorries[i]) {
                                                  let lorryEnergySpent = roomSpawningInfo.remoteLorryEnergy;
                                                  if (lorryEnergySpent) { // remote lorry energy is predefined
                                                      lorryEnergySpent = lorryEnergySpent[i];
                                                  }
                                                  else {
                                                      if ((currentRCL>6)) {
                                                          lorryEnergySpent = 48*50;
                                                          if (sources.length<2) {
                                                              roomSpawningInfo.minNoRemoteLorries[i] = 1;
                                                          }
                                                          else {
                                                              roomSpawningInfo.minNoRemoteLorries[i] = 2;
                                                          }
                                                      }
                                                      else if ((currentRCL<5)||(sources.length<2)||(room.energyCapacityAvailable<1500)) {
                                                        lorryEnergySpent = 700;
                                                        //roomSpawningInfo.minNoRemoteLorries[i] = 4;
                                                      }
                                                      else {
                                                        lorryEnergySpent = 1500;
                                                        //roomSpawningInfo.minNoRemoteLorries[i] = 2;
                                                      }
                                                  }
                                                  console.log(this.name+' added longDistanceLorry '+remoteMiningRoomName)
                                                  spawningQueue.push({memory:{role: 'longDistanceLorry', energy: lorryEnergySpent, home: room.name, target: remoteMiningRoomName},priority: rolePriority['longDistanceLorry']});
                                                  /*spawner = whichSpawnSpawns(this, subSpawn);
                                                  spawningCreepName = spawner.createLongDistanceLorry(lorryEnergySpent, this.room.name, remoteMiningRoomName);
                                                  if ((subSpawn!=undefined)&&(spawningCreepName==OK)) { // each time there is a creep successfully spawned, creeps in room need to be calculate again with the being-spawned creep added into the list
                                                    creepsInRoom = updateCreepsInRoomWithSpawning(this);
                                                  }*/
                                              }
                                          }
                                      }
                                  }
                              }
                          }
                      }
                      /*else if (enemy.length == 1) { // enemy is 1, probably an NPC, but scouter is in the room now, we need to think about if we need to send attackers or not
                          console.log(remoteMiningRoomName+ ' is under attack but there is a scouter, no attacker sent.');
                      }*/
                      //else if (enemy.length >= 1 && (room.owner == undefined || room.owner == username)) { // abandoned aproach for enemy length
                      else if (enemyFuckness > 0 ) {
                              Game.rooms[remoteMiningRoomName].memory.ifPeace = false; // update evaculation boolean
                              if (Game.rooms[remoteMiningRoomName].memory.sameEvacuateRoom != undefined) { // if remote mining room has a related room
                                  for (let relatedRoomName of Game.rooms[remoteMiningRoomName].memory.sameEvacuateRoom) { // for every related same evacuation rooms, evacuate
                                      if (Game.rooms[relatedRoomName] != undefined) {
                                          Game.rooms[relatedRoomName].memory.ifPeace = false;
                                      }
                                  }
                              }
                              //let energySpentOnAttacker = 800;
                              if (netRemoteFuckness > 0) {
                                  console.log('Remote mining ' +remoteMiningRoomName+ ' is under fucked! sending rangers...');
                                  spawningQueue.push({memory:{role: 'ranger', home: room.name, target: remoteMiningRoomName},priority: rolePriority['ranger']});
                                  /*spawner = whichSpawnSpawns(this, subSpawn);
                                  let spawningCreepName = spawner.createRanger(remoteMiningRoomName, currentRoomName);*/
                              }
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
                      if (keeperMiningRoom) {
                          var creepsInRemoteRoom = keeperMiningRoom.find(FIND_MY_CREEPS);
                          var creepsInHomeAndRemoteRoom = imaginaryCreepsInRoom.concat(creepsInRemoteRoom);
                          var netRemoteFuckness;
                          var enemyFuckness;

                          if (keeperMiningRoom.memory.byPass) { // count creeps in the by-pass room
                              for (let byPassRoomName of keeperMiningRoom.memory.byPass) { // for every related same evacuation rooms, evacuate
                                  [ifAdd, creepsToAdd] = calculateMyCreepsInRoom(byPassRoomName);
                                  if (ifAdd) {
                                      creepsInHomeAndRemoteRoom = creepsInHomeAndRemoteRoom.concat(creepsToAdd);
                                  }
                              }
                          }
                          [netRemoteFuckness, enemyFuckness, enermyCount] = determineIfFuckedRemote(keeperMiningRoom,creepsInHomeAndRemoteRoom);
                          //console.log([netRemoteFuckness, enemyFuckness, enermyCount]);
                          // 177 for 5 invaders and 4 SKs
                          // 120 for 4 SKs
                          let allMyCreepsWithSpawningAndQueueInCurrentRoom = getAllMyCreepsWithSpawning(room.name).concat(spawningQueue);

                          // count keeper lair guardians
                          let noOfKeeperLairKeeper = _.sum(allMyCreepsWithSpawningAndQueueInCurrentRoom, (c) => c.memory.role == 'keeperLairMeleeKeeper' && c.memory.target == keeperMiningRoomName);
                          let noOfKeeperLairMeleeKeeper = _.sum(allMyCreepsWithSpawningAndQueueInCurrentRoom, (c) => c.memory.role == 'keeperLairMeleeKeeper' && c.memory.target == keeperMiningRoomName && c.memory.ranged == false);
                          let noOfKeeperLairRangedKeeper = _.sum(allMyCreepsWithSpawningAndQueueInCurrentRoom, (c) => c.memory.role == 'keeperLairMeleeKeeper' && c.memory.target == keeperMiningRoomName && c.memory.ranged == true);

                          //console.log(noOfKeeperLairMeleeKeeper)
                          if ((enemyFuckness<121)) { //(enermyCount-noOfKeeperLairMeleeKeeper<=3) {
                              if (noOfKeeperLairMeleeKeeper < 1) {
                                  console.log('Remote keeper mining added meleeKeeper ' +keeperRoomNames);
                                  spawningQueue.push({memory:{role: 'keeperLairMeleeKeeper', target: keeperMiningRoomName, ranged: false},priority: rolePriority['keeperLairMeleeKeeper']});
                              }
                              else if (noOfKeeperLairRangedKeeper < 1 ) {
                                  console.log('Remote keeper mining added rangedKeeper ' +keeperRoomNames);
                                  spawningQueue.push({memory:{role: 'keeperLairMeleeKeeper', target: keeperMiningRoomName, ranged: true},priority: 7});
                              }
                              else { // there is meleeKeeper, send lorries and miners!
                                  let noOfKeeperLairLorry = _.sum(allMyCreepsWithSpawningAndQueueInCurrentRoom, (c) => c.memory.role == 'keeperLairLorry' && c.memory.target == keeperMiningRoomName);
                                  //let noOfKeeperLairMiners = _.sum(allMyCreepsWithSpawningAndQueueInCurrentRoom, (c) => c.memory.role == 'miner' && c.memory.target == keeperMiningRoomName);
                                  // send lorries
                                  if (noOfKeeperLairLorry<1){
                                      console.log('Remote keeper mining added lorry ' +keeperRoomNames);
                                      spawningQueue.push({memory:{role: 'keeperLairLorry', target: keeperMiningRoomName, home: room.name,},priority: rolePriority['keeperLairLorry']});
                                      break;
                                  }
                                  else {// if more lorries, send miners
                                      let sources = keeperMiningRoom.find(FIND_SOURCES);//.concat(keeperMiningRoom.find(FIND_MINERALS));
                                      for (let source of sources) { // only spawn a miner if it cannot be found both in the spawn room and destination room
                                          if ((keeperMiningRoom.memory.sourceTravelTime)&&(keeperMiningRoom.memory.sourceTravelTime[source.id])) {
                                              //console.log(keeperMiningRoom.memory.sourceTravelTime[source.id]);
                                              if ( !_.some(allMyCreepsWithSpawningAndQueueInCurrentRoom,
                                              c => c.memory.role == 'miner' && c.memory.sourceID == source.id
                                              && (c.ticksToLive > (1500+3*9-keeperMiningRoom.memory.sourceTravelTime[source.id]) || c.ticksToLive == undefined)))
                                              {
                                                  console.log(this.name+' added remote miner '+keeperMiningRoomName,source.id)
                                                  spawningQueue.push({memory:{role: 'miner', sourceID: source.id, target: keeperMiningRoomName, currentRCL: 0, ifMineEnergy: true, ifLink: false, ifKeeper: true},priority: rolePriority['miner']});
                                              }
                                          }
                                      }
                                      if ( _.sum(allMyCreepsWithSpawningAndQueueInCurrentRoom, (c) => c.memory.role == 'pioneer' && c.memory.target == keeperMiningRoomName) < 1) { // create pioneer as repairer
                                          console.log('Remote keeper mining added pioneer repairer ' +keeperRoomNames);
                                          spawningQueue.push({memory:{energy: 800, role: 'pioneer', target: keeperMiningRoomName, home: room.name},priority: 9});
                                      }
                                      if ( noOfKeeperLairLorry < 3) {
                                          console.log('Remote keeper mining added lorry ' +keeperRoomNames);
                                          spawningQueue.push({memory:{role: 'keeperLairLorry', target: keeperMiningRoomName, home: room.name,},priority: rolePriority['keeperLairLorry']});
                                      }
                                      else {
                                          let mineral = keeperMiningRoom.find(FIND_MINERALS)[0];//.concat(keeperMiningRoom.find(FIND_MINERALS));
                                          if ((keeperMiningRoom.memory.sourceTravelTime)&&(keeperMiningRoom.memory.sourceTravelTime[mineral.id])) {
                                              //console.log(keeperMiningRoom.memory.sourceTravelTime[source.id]);
                                              if ( !_.some(allMyCreepsWithSpawningAndQueueInCurrentRoom,
                                              c => c.memory.role == 'miner' && c.memory.sourceID == mineral.id
                                              && (c.ticksToLive > (1500+3*9-keeperMiningRoom.memory.sourceTravelTime[mineral.id]) || c.ticksToLive == undefined)))
                                              {
                                                  console.log(this.name+' added remote miner '+keeperMiningRoomName,mineral.id)
                                                  spawningQueue.push({memory:{role: 'miner', sourceID: mineral.id, target: keeperMiningRoomName, currentRCL: 0, ifMineEnergy: false, ifLink: false, ifKeeper: true},priority: rolePriority['miner']});
                                              }
                                          }
                                      }
                                  }
                              }
                          }
                          else {
                              console.log('keeper room fucked '+keeperMiningRoomName)
                              if (noOfKeeperLairKeeper < 2) {
                                  console.log('keeper room added ranged ' +keeperMiningRoomName);
                                  spawningQueue.push({memory:{role: 'keeperLairMeleeKeeper', target: keeperMiningRoomName, ranged: true},priority: rolePriority['keeperLairMeleeKeeper']});
                              }
                          }
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
