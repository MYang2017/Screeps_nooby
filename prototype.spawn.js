var listOfRoles = [
    'harvester',
    'miner',
    'lorry',
    'upgrader',
    'builder',
    'repairer',
    'wallRepairer',
    'longDistanceHarvester',
    'longDistanceLorry',
    'longDistanceBuilder',
    'reserver',
    'claimer',
    'pickuper',
    'attacker',
    'scouter',
    'teezer',
    'rampartRepairer',
    'begger',
    'longDistanceUpgrader',
    'linkKeeper'
    ];

StructureSpawn.prototype.spawnCreepsIfNecessary = function() {
    let room = this.room;
    let creepsInRoom = room.find(FIND_MY_CREEPS);
    let NoOfCreeps = {};

    for (let role of listOfRoles) { // calculate number of creeps in current spawn room
        NoOfCreeps[role] = _.sum(creepsInRoom, (c) => c.memory.role == role);
    }

    let maxEnergy = room.energyCapacityAvailable;
    let spawningCreepName = undefined;

    let fuckness = determineIfFucked(room);

    if (fuckness<18) { // fuckness, equivilient to about 6 HEAL parts or 8 RANGED_ATTACK parts or 18 attack parts
        // AI in the current spawn's remote mining neighbours /////////////////////////////////////////////////////////////////////////////////////
        // back up code if wiped, from energy taking creeps first: miners, lorries, harvesters
        if (NoOfCreeps['harvester'] == 0 && NoOfCreeps['lorry'] == 0) { // if no harvester or lorries in current spawn room, recovering phase
            /*if (NoOfCreeps['miner'] > 0 || (room.storage != undefined && room.storage.store[RESOURCE_ENERGY] <= 550)) {
            //if (NoOfCreeps['miner'] > 0) {
                spawningCreepName = this.createLorry(150);
            }
            else { // if no miner and no lorries, start with harvesters
                spawningCreepName = this.createCustomCreep(room.energyAvailable, 'harvester');
            }*/
        }
        else { // everything works usual, with miners
            // spawn miners as highest priority
            let sources = room.find(FIND_SOURCES);
            for (let source of sources) {
                if (!_.some(creepsInRoom, c => c.memory.role == 'miner' && c.memory.sourceID == source.id)) {
                    let containers = source.pos.findInRange(FIND_STRUCTURES, 1, {filter: s => s.structureType == STRUCTURE_CONTAINER});
                    if (containers.length>0) {
                        spawningCreepName = this.createMiner(source.id, undefined);
                        break;
                    }
                }
            }
            let mineral = room.find(FIND_MINERALS)[0]; // find mineral deposite
            let extractor = room.find(FIND_MY_STRUCTURES ,{filter:c=>c.structureType==STRUCTURE_EXTRACTOR})[0]; // find extractor already built
            if (extractor != undefined && mineral.mineralAmount>0) {
              if (!_.some(creepsInRoom, c => c.memory.role == 'miner' && c.memory.sourceID == mineral.id)) {
                  let mineralContainer =  mineral.pos.findInRange(FIND_STRUCTURES, 1, {filter: s => s.structureType == STRUCTURE_CONTAINER});
                  if (mineralContainer.length>0) {
                      spawningCreepName = this.createMiner(mineral.id, undefined);
                  }
              }
            }
        }

        if (spawningCreepName == undefined) { // no energy problem, start other creeps building
            for (let role of listOfRoles) {
                if (role == 'claimer' && this.memory.claimRoom != undefined) { // if you want to spawn claimer and claim a room
                    spawningCreepName = this.createClaimer(this.memory.claimRoom);
                    if (!(spawningCreepName < 0)) { // if a claimer is successfully spawned, delete claimRoom variable
                        console.log('claimer created marching towards '+this.memory.claimRoom+'!');
                        delete this.memory.claimRoom;
                    }
                }
                else if (role == 'begger') { // if a begger is required (normally in new base rooms)
                    let Nobeggers = _.sum(Game.creeps, (c) => c.memory.role == 'begger');
                    //console.log(Nobeggers,this.memory.minCreeps['begger']);
                    if (Nobeggers < this.memory.minCreeps['begger']) { // not enough beggers
                        spawningCreepName = this.createBegger(maxEnergy, this.room.name, 'E92N11');
                    }
                }
                else if (role == 'longDistanceUpgrader') { // if a begger is required (normally in new base rooms)
                    if (NoOfCreeps[role] < this.memory.minCreeps[role]) { // not enough beggers
                        spawningCreepName = this.createLongDistanceUpgrader(maxEnergy, this.room.name, 'E92N11');
                    }
                }
                else if (NoOfCreeps[role] < this.memory.minCreeps[role]) { // loop through every roles and check with min number. if not enough, spawn other creeps
                    spawningCreepName = this.createCustomCreep(this.memory.creepEnergy[role], role);
                    //console.log(this.room.name,role,NoOfCreeps[role],this.memory.minCreeps[role],spawningCreepName);

                }
            }
        }

        let currentRoomName = room.name;
        // AI in the current spawn's remote mining neighbours /////////////////////////////////////////////////////////////////////////////////////
        if (spawningCreepName == undefined) { // if no creeps needed to spawn for the current room
            if (this.memory.remoteMode == 1) { // 1 for remote miner mining, 0 for remote harvester mining
                let neighbourRoomNames = calculateNeighbourNames(currentRoomName);
                let remoteRoomIdxs = this.memory.remoteRoomIdxs;
                for (let i = 0; i<remoteRoomIdxs.length; i++) {
                    let remoteMiningRoomName = neighbourRoomNames[remoteRoomIdxs[i]];
                    //console.log('scan all remoment mining rooms: '+remoteMiningRoomName);
                    // calculate No. of scouters in each reservable rooms around current spawn room, if no scouters there, spawn 1, if yes, send miners
                    let NoScouters = _.sum(Game.creeps, (c) => c.memory.role == 'scouter' && c.memory.target == remoteMiningRoomName);
                    //console.log(NoScouters);
                    if ( NoScouters < 1 ) { // if no scouter for the remote mining room in current spawn room and target room, spawn a scouter
                        spawningCreepName = this.createScouter(400, remoteMiningRoomName, remoteMiningRoomName);
                    }
                    else if (Game.creeps[remoteMiningRoomName].room.name == remoteMiningRoomName) { // scouter there or on its way, check if arrived in that room
                        let enemy = Game.creeps[remoteMiningRoomName].room.find(FIND_HOSTILE_CREEPS, {filter: s => (!allyList().includes(s.owner))});
                        //console.log(enemy + ' enemies in ' + remoteMiningRoomName);
                        if ( enemy.length == 0 ) { // if there is no enemy spawn builders then reservers then miners AND room is neutral
                            // calculate No. of long distance builders(repairers) in each reservable rooms around current spawn room
                            let NoLongDistanceBuilders = _.sum(Game.creeps, (c) => c.memory.role == 'longDistanceBuilder' && c.memory.target == remoteMiningRoomName);
                            //eval('var NoLongDistanceBuilders_'+remoteMiningRoomName+' = NoLongDistanceBuilders;');
                            //console.log(remoteMiningRoomName,NoLongDistanceBuilders);
                            if ( NoLongDistanceBuilders < this.memory.minNoRemoteBuilders[i]) { // if not enough long distance builders, spawn
                                spawningCreepName = this.createLongDistanceBuilder(600, remoteMiningRoomName);
                            }
                            else { // enough builder, then reserver
                                // calculate No. of reservers in each reservable rooms around current spawn room
                                let NoReservers = _.sum(Game.creeps, (c) => c.memory.role == 'reserver' && c.memory.target == remoteMiningRoomName);
                                //eval('var NoReservers_'+remoteMiningRoomName+' = NoReservers;');
                                //console.log(remoteMiningRoomName,NoReservers);
                                if ( NoReservers < this.memory.minNoRemoteReservers[i]) { // if not enough reservers, spawn {
                                    spawningCreepName = this.createReserver(remoteMiningRoomName);
                                }
                                else { // enough reservers, spawn miners
                                    //console.log(Game.creeps[remoteMiningRoomName]);
                                    let sources = Game.creeps[remoteMiningRoomName].room.find(FIND_SOURCES);
                                    for (let source of sources) { // only spawn a miner if it cannot be found both in the spawn room and destination room
                                        if ( !_.some(Game.creeps[remoteMiningRoomName].room.find(FIND_MY_CREEPS), c => c.memory.role == 'miner' && c.memory.sourceID == source.id) && !_.some(this.room.find(FIND_MY_CREEPS), c => c.memory.role == 'miner' && c.memory.sourceID == source.id) ) {
                                            // cannot find a miner in neighbour and current spawn, prepare to spawn
                                            let containers = source.pos.findInRange(FIND_STRUCTURES, 1, {filter: s => s.structureType == STRUCTURE_CONTAINER});
                                            if (containers.length>0) { // check which source needs miner
                                                spawningCreepName = this.createMiner(source.id, remoteMiningRoomName);
                                                break;
                                            }
                                        }
                                        else { // find a miner in neighbour or current spawn, lets harvest!, GO GO LORRIES!
                                            // calculate No. of lorries in each reservable rooms around current spawn room
                                            let NoLongDistanceLorries = _.sum(Game.creeps, (c) => c.memory.role == 'longDistanceLorry' && c.memory.target == remoteMiningRoomName);
                                            if ( NoLongDistanceLorries < this.memory.minNoRemoteLorries[i]) {
                                                spawningCreepName = this.createLongDistanceLorry(1350, this.room.name, remoteMiningRoomName);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        else if (enemy.length == 1) { // enemy is 1, probably an NPC, but scouter is in the room now, we need to think about if we need to send attackers or not
                            console.log(remoteMiningRoomName+ ' is under attack but there is a scouter, no attacker sent.');
                        }
                        else if (enemy.length > 1 && (room.owner == undefined || room.owner == username)) {
                                let energySpentOnAttacker = 800;
                                console.log('Remote mining ' +remoteMiningRoomName+ ' is under fucked! sending attackers...');
                                let spawningCreepName = this.createAttacker(energySpentOnAttacker, remoteMiningRoomName);
                        }
                    }
                }
            }
            else if (this.memory.remoteMode == 0) { // 0 for long distance harvester mining mode
              let neighbourRoomNames = calculateNeighbourNames(currentRoomName);
              let remoteRoomIdxs = this.memory.remoteRoomIdxs;
              for (let i = 0; i<remoteRoomIdxs.length; i++) {
                  let remoteMiningRoomName = neighbourRoomNames[remoteRoomIdxs[i]];
                  //console.log('scan all remoment mining rooms: '+remoteMiningRoomName);
                  // calculate No. of scouters in each reservable rooms around current spawn room, if no scouters there, spawn 1, if yes, send miners
                  let NoScouters = _.sum(Game.creeps, (c) => c.memory.role == 'scouter' && c.memory.target == remoteMiningRoomName);
                  //console.log(NoScouters);
                  if ( NoScouters < 1 ) { // if no scouter for the remote mining room in current spawn room and target room, spawn a scouter
                      spawningCreepName = this.createScouter(400, remoteMiningRoomName, remoteMiningRoomName);
                  }
                  /*else if (Game.creeps[remoteMiningRoomName].room.name == remoteMiningRoomName) { // scouter there or on its way, check if arrived in that room
                      let enemy = Game.creeps[remoteMiningRoomName].room.find(FIND_HOSTILE_CREEPS);
                      //console.log(enemy + ' enemies in ' + remoteMiningRoomName);
                      if (enemy.length == 0) { // if there is no enemy spawn builders then reservers then miners
                          // calculate No. of long distance harvesters in each reservable rooms around current spawn room
                          for (resourceIdx in [0,1]) {
                            let NoLongDistanceHarvesters = _.sum(Game.creeps, (c) => c.memory.role == 'longDistanceHarvester' && c.memory.target == remoteMiningRoomName && c.memory.sourceIndex == resourceIdx);
                            //eval('var NoLongDistanceBuilders_'+remoteMiningRoomName+' = NoLongDistanceBuilders;');
                            //console.log(remoteMiningRoomName,NoLongDistanceBuilders);
                            if ( NoLongDistanceHarvesters < this.memory.minNoRemoteHarvesters[resourceIdx]) { // if not enough long distance builders, spawn
                                spawningCreepName = this.createLongDistanceHarvester(600, this.room.name, remoteMiningRoomName, resourceIdx);
                            }
                          }
                      }
                      else if (enemy.length == 1) { // enemy is 1, probably an NPC, but scouter is in the room now, we need to think about if we need to send attackers or not
                          console.log(remoteMiningRoomName+ ' is under attack but there is a scouter, no attacker sent.');
                      }
                      else if (enemy.length > 1 && (room.owner == undefined || room.owner == username)) {
                              let energySpentOnAttacker = 400;
                              console.log(remoteMiningRoomName+ ' is under fucked! sending attackers...');
                              let spawningCreepName = this.createAttacker(energySpentOnAttacker, remoteMiningRoomName);
                      }
                  }*/
              }
            }
        }
        if (spawningCreepName == undefined) { // if nothing to spawn, spawn upgraders
            //let spawningCreepName = this.createCustomCreep(this.room.energyCapacityAvailable, 'upgrader');
            //spawningCreepName = this.createAttacker(maxEnergy, 'E91N12');
            //console.log('WOW, free spawn time, gogo upgraders/attackers!');
            //let spawningCreepName = this.createControllerAttacker('E91N12');
            //console.log(spawningCreepName);

            //console.log(room.name+' free spawning time!');
        }
    }
    else { // seriously fucked!!! send good defenders!
      console.log('Base ' +room.name+ ' is under fucked! sending attackers...');
      spawningCreepName = this.createAttacker(room.energyAvailable, room.name);
    }
}

StructureSpawn.prototype.createCustomCreep = function(energy, roleName) {
    if (roleName == 'lorry') {
        var NoParts = Math.floor(energy/150);
        var body = [];
        for (let i = 0; i < NoParts; i++) {
            body.push(CARRY);
            body.push(CARRY);
        }
        for (let i = 0; i < NoParts; i++) {
            body.push(MOVE);
        }
    return this.createCreep(body, undefined, {role: 'lorry', working: false});
    }
    else if ((roleName == 'pickuper') || (roleName == 'linkKeeper')) {
        var body = [];
        var NoCarryMoveParts = Math.floor(energy/100);

        for (let i = 0; i < NoCarryMoveParts; i++) {
            body.push(CARRY);
        }
        for (let i = 0; i < NoCarryMoveParts; i++) {
            body.push(MOVE);
        }
        if (energy%100 >= 50) {
            body.push(CARRY);
        }
        if (roleName == 'pickuper') {
            return this.createCreep(body, undefined, {role: 'pickuper', working: false});
        }
        else if (roleName == 'linkKeeper') {
            return this.createCreep(body, undefined, {role: 'linkKeeper', working: false});
        }
    }
    else {
        var NoParts = Math.floor(energy/200);
        var body = [];
        for (let i = 0; i < NoParts; i++) {
            body.push(WORK);
        }
        for (let i = 0; i < NoParts; i++) {
            body.push(CARRY);
        }
        for (let i = 0; i < NoParts; i++) {
            body.push(MOVE);
        }
        /*if (energy%200 >= 100) {
            body.unshift(WORK);
            if (energy%200 >= 150) {
                body.push(CARRY);
            }
        }*/
    return this.createCreep(body, undefined, {role: roleName, working: false});
    }
}

StructureSpawn.prototype.createLongDistanceHarvester = function(energy, home, target, sourceIndex) {
    var body = [WORK, WORK];
    var NoCarryMoveParts = Math.floor((energy - 200)/100);

    for (let i = 0; i < NoCarryMoveParts; i++) {
        body.push(CARRY);
    }
    for (let i = 0; i < NoCarryMoveParts; i++) {
        body.push(MOVE);
    }
    if (energy%100 >= 50) {
        body.push(CARRY);
    }
    return this.createCreep(body, undefined, {role: 'longDistanceHarvester', home: home, target: target, sourceIndex: sourceIndex, working: false});
}

StructureSpawn.prototype.createLongDistanceLorry = function(energy, home, target) {
    var body = [];
    var NoCarryMoveParts = Math.floor(energy/100);

    for (let i = 0; i < NoCarryMoveParts; i++) {
        body.push(CARRY);
    }
    for (let i = 0; i < NoCarryMoveParts; i++) {
        body.push(MOVE);
    }
    if (energy%100 >= 50) {
        body.push(CARRY);
    }
    return this.createCreep(body, undefined, {role: 'longDistanceLorry', home: home, target: target, working: false});
}

StructureSpawn.prototype.createBegger = function(energy, home, target) {
    var body = [];
    var NoCarryMoveParts = Math.floor(energy/100);

    for (let i = 0; i < NoCarryMoveParts; i++) {
        body.push(CARRY);
    }
    for (let i = 0; i < NoCarryMoveParts; i++) {
        body.push(MOVE);
    }
    if (energy%100 >= 50) {
        body.push(CARRY);
    }
    return this.createCreep(body, undefined, {role: 'begger', home: home, target: target, working: false});
}

StructureSpawn.prototype.createLongDistanceUpgrader = function(energy, home, target) {
    var NoParts = Math.floor(energy/200);
    var body = [];
    for (let i = 0; i < NoParts; i++) {
        body.push(WORK);
    }
    for (let i = 0; i < NoParts; i++) {
        body.push(CARRY);
    }
    for (let i = 0; i < NoParts; i++) {
        body.push(MOVE);
    }
    return this.createCreep(body, undefined, {role: 'longDistanceUpgrader', home: home, target: target, working: false});
}

StructureSpawn.prototype.createAttacker = function(energy, target) {
    var body = [];
    var NoAttackMoveParts = Math.floor(energy/250);

    for (let i = 0; i < NoAttackMoveParts*5; i++) {
        body.push(TOUGH);
    }
    for (let i = 0; i < NoAttackMoveParts; i++) {
        body.push(RANGED_ATTACK);
    }
    for (let i = 0; i < NoAttackMoveParts*1; i++) {
        body.push(MOVE);
    }
    if (energy%100 >= 50) {
        body.push(MOVE);
    }
    return this.createCreep(body, undefined, {role: 'attacker', target: target});
}

StructureSpawn.prototype.createControllerAttacker = function(target) {
    var body = [CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, MOVE];
    return this.createCreep(body, undefined, {role: 'controllerAttacker', target: target});
}

StructureSpawn.prototype.createTeezer = function(energy, target) {
    var body = [];
    var NoAttackMoveParts = Math.floor(energy/400);

    for (let i = 0; i < NoAttackMoveParts*20; i++) {
        body.push(TOUGH);
    }
    for (let i = 0; i < NoAttackMoveParts; i++) {
        body.push(RANGED_ATTACK);
    }
    for (let i = 0; i < NoAttackMoveParts; i++) {
        body.push(MOVE);
    }
    if (energy%100 >= 50) {
        body.push(MOVE);
    }
    return this.createCreep(body, undefined, {role: 'attacker', target: target});
}

StructureSpawn.prototype.createScouter = function(energy, scouterName, target) {
    var body = [];
    var NoAttackMoveParts = Math.floor(energy/200);

    for (let i = 0; i < NoAttackMoveParts*2; i++) {
        body.push(TOUGH);
    }
    for (let i = 0; i < NoAttackMoveParts*2; i++) {
        body.push(MOVE);
    }
    for (let i = 0; i < NoAttackMoveParts; i++) {
        body.push(ATTACK);
    }
    if (energy%100 >= 50) {
        body.push(MOVE);
    }
    return this.createCreep(body, scouterName, {role: 'scouter', target: target});
}

StructureSpawn.prototype.createLongDistanceBuilder = function(energy, target) {
    var body = [];
    var NoCarryMoveParts = Math.floor(energy/200);

    for (let i = 0; i < NoCarryMoveParts; i++) {
        body.push(WORK);
    }
    for (let i = 0; i < NoCarryMoveParts; i++) {
        body.push(CARRY);
    }
    for (let i = 0; i < NoCarryMoveParts; i++) {
        body.push(MOVE);
    }
    return this.createCreep(body, undefined, {role: 'longDistanceBuilder', target: target, working: false});
}

StructureSpawn.prototype.createClaimer = function(target) {
    return this.createCreep([WORK, CARRY, ATTACK, CLAIM, MOVE, MOVE, MOVE], undefined, {role: 'claimer', target: target});
}

StructureSpawn.prototype.createReserver = function(target) {
    return this.createCreep([CLAIM, MOVE], undefined, {role: 'reserver', target: target});
}

StructureSpawn.prototype.createMiner = function(sourceID, target) {
    return this.createCreep([WORK, WORK, WORK, WORK, WORK, MOVE, MOVE], undefined, {role: 'miner', sourceID: sourceID, target: target});
}

StructureSpawn.prototype.createLorry = function(energy) {
    return this.createCreep([CARRY,CARRY,MOVE], undefined, {role: 'lorry', working: false});
}

StructureSpawn.prototype.createTraveller = function(target) {
    return this.createCreep([MOVE], undefined, {role: 'traveller', target: target});
}

StructureSpawn.prototype.createTransporter = function(mineralType) {
    return this.createCreep([CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], undefined, {role: 'transporter', resourceType: mineralType, working: false});
}
