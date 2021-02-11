global.sendClaimer = function (home, target) { // route function not ready yet!
    let room = Game.rooms[home];

    let spawningQueue = room.memory.forSpawning.spawningQueue;
    console.log('Room ' + home + ' sent claimer ' + target);
    spawningQueue.push({ memory: { role: 'claimer', target: target }, priority: 0.8 });

    //let route = { 'E39S1': 'E41N0', 'E41N0': 'E49N0', 'E49N0': 'E49N1' };
    // Game,creeps.Samantha.memory.route = {'E58S2': 'E58S3', 'E58S3': 'E55N3'};
    let route = undefined;
    if (target == 'E55N3') {
        route = {'E58S2': 'E58S3', 'E58S3': 'E55N3'};
    }

    room.memory.forSpawning.spawningQueue.push({ memory: { energy: room.energyCapacityAvailable*.875, role: 'pioneer', target: target, home: room.name, superUpgrader: false, route: route }, priority: 0.4 });
    console.log('Room '+home+' sent fitst pioneer to room ' + target);

    room.memory.startClaimRoom = true;
 }

// this is the main function
global.helpSubroom = function (home, target) { // send claimer and first pioneer to new unclaimed room
    let room = Game.rooms[home];

    room.memory.subRoom = target;

    let subRoom = Game.rooms[target];
    sendClaimer(home, target);
}

global.sendPioneer = function (roomName,toHelpName,ifSuper,energy) {
    Game.rooms[roomName].memory.forSpawning.spawningQueue.push({ memory: { energy: energy, role: 'pioneer', target: toHelpName, home: roomName, superUpgrader: ifSuper, route: undefined }, priority: 0.4 });
}

global.ifKeepHelping = function (home, target) { // if keep sending pioneers
    let room = Game.rooms[home];
    let helpedRoom = Game.rooms[target];

    if (room.memory.startClaimRoom) { // if in the process of claiming a sub room
        if ( helpedRoom == undefined || (ifSpawnAvailable(target).length < 1) ) { // if sub room spawn not ready
            return true
        }
        else { // if sub room mature, stop sending pioneers
            delete room.memory.subRoom;
            room.memory.startClaimRoom = false;
            return false
        }
    }
    else { // if not in the process of claiming a sub room
        return false
    }
}


global.startClaimRoom = function (home) {
    let room = Game.rooms[home];
    if (room.memory.startClaimRoom == undefined || room.memory.startClaimRoom == false) {
        return false
    }
    else {
        return true
    }
}

// check every xxx ticks to provid pioneers
global.mainBuildSub = function (room,route) {
    let subRoomName = room.memory.subRoom;

    if (subRoomName == undefined) {
        return false
    }
    else {
        if ( ifKeepHelping(room.name,subRoomName) ) {
            route = undefined;
            /*if (room.name == 'E31S1') {
                route = { 'E31S1': 'E23S0', 'E23S0': 'E24S4', 'E24S4': 'E23S4'};
            }*/

            room.memory.forSpawning.spawningQueue.push({ memory: { energy: room.energyCapacityAvailable, role: 'pioneer', target: subRoomName, home: room.name, superUpgrader: false, route: route }, priority: 0.4 });
            console.log('Room ' + room.name + ' sent pioneer to room ' + subRoomName);
        }
        else {
            return false
        }
    }
}

global.ifWaitForRenew = function (creep) {
    if (creep.memory.stayToBePumped == undefined) {
        creep.memory.stayToBePumped = false;
    }
    if (creep.memory.stayToBePumped == false) {
        if (creep.ticksToLive < 200) {
            creep.say('T_T');

            let roomSpawns = creep.room.find(FIND_STRUCTURES, { filter: s => s.structureType == STRUCTURE_SPAWN });

            if (roomSpawns.length > 0) {
                let roomSpawn = roomSpawns[0];

                if (roomSpawn.energy > 200) {
                    if (roomSpawn.renewCreep(creep) == -9) {
                        creep.travelTo(roomSpawn);
                        return true
                    }
                    else if (roomSpawn.renewCreep(creep) == 0) {
                        // stay and wait to be pumped
                        creep.memory.stayToBePumped = true;
                        creep.transfer(roomSpawn,'energy')
                        return true
                    }
                    else {
                        creep.memory.stayToBePumped = false;
                        return false
                    }
                }
                else {
                    creep.memory.stayToBePumped = false;
                    return false
                }
            }
            else {
                creep.memory.stayToBePumped = false;
                return false
            }

        }
        else {
            creep.memory.stayToBePumped = false;
            return false
        }
    }
    else {
        let roomSpawn = creep.room.find(FIND_STRUCTURES, { filter: s => s.structureType == STRUCTURE_SPAWN })[0];
        if ((creep.ticksToLive > 1300) || (roomSpawn.energy < 50)) {
            creep.memory.stayToBePumped = false;
            return false
        }
        else {
            // stay and wait to be pumped
            if (roomSpawn.renewCreep(creep) == 0) {
                creep.memory.stayToBePumped = true;
                return true
            }
            else {
                creep.memory.stayToBePumped = false;
                return false
            }
        }
    }

}

global.parseRoomName = function(roomName) {
  let kWorldSize=Game.map.getWorldSize();
  let room = /^([WE])([0-9]+)([NS])([0-9]+)$/.exec(roomName);
  if (!room) {
    throw new Error('Invalid room name '+roomName);
  }
  let rx = (kWorldSize >> 1) + (room[1] === 'W' ? -Number(room[2]) : Number(room[2]) + 1);
  let ry = (kWorldSize >> 1) + (room[3] === 'N' ? -Number(room[4]) : Number(room[4]) + 1);
  if (!(rx >=0 && rx <= kWorldSize && ry >= 0 && ry <= kWorldSize)) {
    throw new Error('Invalid room name '+roomName);
  }
  return { x: rx, y: ry };
}

global.generateRoomName = function(xx, yy) {
    let kWorldSize=Game.map.getWorldSize();
    if (!(xx >=0 && xx <= kWorldSize && yy >= 0 && yy <= kWorldSize)) {
       return false;
    }
    else {
        return (
          (xx <= kWorldSize >> 1 ? 'W'+ ((kWorldSize >> 1) - xx) : 'E'+ (xx - (kWorldSize >> 1) - 1))+
          (yy <= kWorldSize >> 1 ? 'N'+ ((kWorldSize >> 1) - yy) : 'S'+ (yy - (kWorldSize >> 1) - 1))
        );
    }
}

global.generateRoomnameWithDistance = function(roomName) {
    let cxy = parseRoomName(roomName);
    let cx = cxy.x;
    let cy = cxy.y;
    let worldsize = Game.map.getWorldSize();
    let randIntx = getRandomInt(0,30);
    let randInty = 30-randIntx;

    let targetx = cx+randIntx;
    let targety = cy+randInty;

    if (targetx > worldsize) {
        targetx = worldsize
    }
    if (targetx < 0) {
        targetx = 0
    }

    if (targety > worldsize) {
        targety = worldsize
    }
    if (targety < 0) {
        targety = 0
    }

    return generateRoomName(targetx,targety)
}

global.spawnScouterAround = function(roomName) {
    let room = Game.rooms[roomName];
    if (room.energyAvailable > 1500) { // if room has spare energy
        let target = generateRoomnameWithDistance(roomName)
        room.memory.forSpawning.spawningQueue.push({memory:{role: 'wanderer', target: target}, priority: 0.01});
        console.log(roomName + ' scouting to ' + target);
    }
}

// for intershade transfer and get creep memory
global.unpackCreepMemory = function (creepName) {
    [creepRole,n1,n2,n3,n4,n5,n6,n7,n8,n9,n10,n11,n12,n13] = creepName.split('_');
    if (creepRole == 'twoWayInterSharder') { // check if in correct destination shard
        homeShardName = n1;
        homeRoomName = n2;
        homeSourceToCarry = n3;
        toTargetPortalRoomName = n4;
        toTargetPortalX = n5;
        toTargetPortalY = n6;
        targetShardName = n7;
        targetRoomName = n8;
        targetSourceToCarry = n9;
        toHomePortalRoomName = n10;
        toHomePortalX = n11;
        toHomePortalY = n12;

        Game.creeps[creepName].memory.role = 'twoWayInterSharder';

        Game.creeps[creepName].memory.homeShard = homeShardName;
        Game.creeps[creepName].memory.home = homeRoomName;
        Game.creeps[creepName].memory.homeSourceToCarry = homeSourceToCarry;
        Game.creeps[creepName].memory.toTargetPortalRoomName = toTargetPortalRoomName;
        Game.creeps[creepName].memory.toTargetPortalX = toTargetPortalX;
        Game.creeps[creepName].memory.toTargetPortalY = toTargetPortalY;

        Game.creeps[creepName].memory.targetShard = targetShardName;
        Game.creeps[creepName].memory.target = targetRoomName;
        Game.creeps[creepName].memory.targetSourceToCarry = targetSourceToCarry;
        Game.creeps[creepName].memory.toHomePortalRoomName = toHomePortalRoomName;
        Game.creeps[creepName].memory.toHomePortalX = toHomePortalX;
        Game.creeps[creepName].memory.toHomePortalY = toHomePortalY;

    }
    else if (creepRole == 'oneWayInterSharder') {
        [targetShardName, targetRoomName, roleWillBe, randomString] = Game.creeps[name].name.split('_');
        if (targetShardName == Game.shard.name) { // check if in correct destination shard
            Game.creeps[creepName].memory.role = roleWillBe;
            Game.creeps[creepName].memory.target = targetRoomName;
            Game.creeps[creepName].memory.working = false;
        }
        else { // in the wrong shard, an error transfer
            console.log('intersharder ' + Game.creeps[creepName].name + ' in wrong shard: ' + Game.shard.name + Game.creeps[creepName].pos)
        }
    }
    else { // in the wrong shard, an error transfer
        console.log('intersharder ' + Game.creeps[creepName].name + ' memory re-initialization failed. In shard: ' + Game.shard.name + '. '+ Game.creeps[creepName].pos)
    }
}

global.manageShooterRoom = function (room) {
    let motherRoomName = room.memory.startMB;
    if (motherRoomName) {
        let renewSpawnId = room.memory.forSpawning.renewSpawnId;
        if (renewSpawnId) {
            let shootersPath = room.memory.shootersPath;
            if (shootersPath) {
                let shooterLabId = room.memory.shooterLabId;
                if (shooterLabId) {
                    //console.log('1')
                    managerShootersWankersNumber(room);
                    //console.log('2')
                    renewShooters(renewSpawnId);
                    //console.log('3')
                    boostShooters(shooterLabId);
                }
                else {
                    console.log('defined shooter lab id for shooter room: ' + room.name);
                    let shooterLabPos = cacheShootersLabId(room.storage.pos);
                    let shooterLabs = room.lookForAt(LOOK_STRUCTURES, shooterLabPos.x, shooterLabPos.y);
                    if (shooterLabs.length > 0 && shooterLabs[0].structureType == STRUCTURE_LAB) {
                        room.memory.shooterLabId = shooterLabs[0].id;
                    }
                }
            }
            else {
                room.memory.shootersPath = cacheShootersMovingPath(room.storage.pos);
            }
        }
        else {
            console.log('defined renew spawn id for shooter room: ' + room.name);
        }
    }
    else {
        console.log('defined mother room name for shooter room: ' + room.name);
    }
}

global.cacheShootersMovingPath = function(centrePos) {
    let x = centrePos.x;
    let y = centrePos.y;
    return [{'x':x-1,'y':y-1},{'x':x-1,'y':y},{'x':x-1,'y':y+1},{'x':x,'y':y+1},{'x':x+1,'y':y+1},{'x':x+1,'y':y},{'x':x,'y':y-1}]
}

global.cacheShootersMovingDirections = function () {
    /*TOP: 1,
    TOP_RIGHT: 2,
    RIGHT: 3,
    BOTTOM_RIGHT: 4,
    BOTTOM: 5,
    BOTTOM_LEFT: 6,
    LEFT: 7,
    TOP_LEFT: 8,*/

    // counter-clockwise
    //return [5, 5, 3, 3, 1, 8, 7]

    // clockwise
    return [3, 1, 1, 7, 7, 5, 4]
}

global.cacheShootersLabId = function (centrePos) {
    let x = centrePos.x;
    let y = centrePos.y;
    return { 'x': x, 'y': y - 2 }
}

global.renewShooters = function(renewSpawnId) {
    let renewSpawn = Game.getObjectById(renewSpawnId);

    let shooters = renewSpawn.room.find(FIND_MY_CREEPS, { filter: (s) => (s.memory.role == 'shooter') });
    let numOFShooters = shooters.length;
    let numOfShootersMax = renewSpawn.room.memory.forSpawning.roomCreepNo.minCreeps['shooter'];

     // help shootroom from mother room
    if ((renewSpawn.room.controller.level == 4) || (renewSpawn.room.controller.level == 5) && (renewSpawn.room.controller.progress < .85 * renewSpawn.room.controller.progressTotal)) {
        if ((Game.time + 34) % 266 < 40) {
            try {
                Game.getObjectById('5b9d7cb7702b8f4639c5ceed').createBegger(2200, 'E31S6', 'E31S4');
            }
            catch (err) {
                console.log('begger for shooter spawner full');
            }
        }
    }

    // if spawn is not spawning
    if (!renewSpawn.spawning) {
        // look for a creep at a spot
        let shooterCreeps = renewSpawn.room.lookForAt(LOOK_CREEPS, renewSpawn.pos.x - 1, renewSpawn.pos.y);
        if (!shooterCreeps.length > 0) {
            let shooterCreeps = renewSpawn.room.lookForAt(LOOK_CREEPS, renewSpawn.pos.x - 1, renewSpawn.pos.y + 1);
        }
        if (shooterCreeps.length > 0) {
            let shooterCreep = shooterCreeps[0];
            let roomMaxECap = shooterCreep.room.memory.ECap;
            // if creep life < ceil(1500/7) (time it takes to move a circle) or creep is unboosted, renew
            if (
                //(shooterCreep.memory.eCost && (Math.abs(shooterCreep.memory.eCost - roomMaxECap) < 100) || shooterCreep.memory.eCost == 4850) &&
                (shooterCreep.ticksToLive < shooterCreep.getActiveBodyparts(WORK) / 4 || !checkIfCreepIsBoosted(shooterCreep))) {
                if (numOFShooters <= numOfShootersMax) {
                    renewSpawn.renewCreep(shooterCreep);
                }
                else {
                    let minTTL = 1500;
                    let toGiveupId;
                    for (let shooter of shooters) {
                        if (minTTL > shooter.ticksToLive) {
                            minTTL = shooter.ticksToLive;
                            toGiveupId = shooter.id;
                        }
                    }
                    if (shooterCreep.id != toGiveupId) {
                        renewSpawn.renewCreep(shooterCreep);
                    }
                }
            }
        }
    }
}

global.boostShooters = function(shooterLabId) {
    let boostLab = Game.getObjectById(shooterLabId);
    // look for a creep at a spot

    // if room lvl 8 and prepare to restart
    if (boostLab.room.controller.level == 8) {
        // no. of boosted shooters
        let noOfBoostedShooters = boostLab.room.find(FIND_MY_CREEPS, { filter: (s) => (s.memory.role == 'shooter' && checkIfCreepIsBoosted(s)) }).length;
        let noOfShooters = boostLab.room.find(FIND_MY_CREEPS, { filter: (s) => (s.memory.role == 'shooter') }).length;

        if (noOfShooters == 7) {
            // creep to look at
            let shooterCreeps = boostLab.room.lookForAt(LOOK_CREEPS, boostLab.pos.x, boostLab.pos.y + 1);
            if (shooterCreeps.length > 0) {
                let shooterCreep = shooterCreeps[0];
                if (shooterCreep.memory.role == 'shooter') {
                    //if (shooterCreep.ticksToLive > 1450) {
                    boostLab.boostCreep(shooterCreep);
                    //}
                }
            }
        }
    }

    /*// unboost
    if (shooterCreeps.length > 0) {
        let shooterCreep = shooterCreeps[0];
        if (shooterCreep.memory.role == 'shooter') {
            if (shooterCreep.ticksToLive < Math.ceil((shooterCreep.getActiveBodyparts(WORK) - 7) / 4 + 1) * 7 + 1) {
                boostLab.unboostCreep(shooterCreep);
            }
        }
    }*/
}

global.managerShootersWankersNumber = function (room) {
    let terminal = room.terminal;
    let storage = room.storage;

    if (room.controller.level < 8) {
        if (terminal && storage && room.memory.shooterLabId) {
            //room.memory.startToShoot = true;
            room.memory.forSpawning.roomCreepNo.minCreeps['wanker'] = 1;
            room.memory.forSpawning.roomCreepNo.minCreeps['wallRepairer'] = 1;
            let OptimumNumShooters = Math.floor(storage.store.energy / 130000);
            if (terminal.isActive()) {
                OptimumNumShooters = Math.min(7,Math.floor((storage.store.energy +  terminal.store.energy)/ 130000));
            }
            room.memory.forSpawning.roomCreepNo.creepEnergy['wanker'] = Math.max(OptimumNumShooters * 50, terminal.store.energy / 250000 * 16 * 50);
            if (room.controller.level==5) {
                let OptimumNumShooters = Math.floor(storage.store.energy / 100000);
                if (room.controller.progress/room.controller.progressTotal>0.98) {
                    room.memory.forSpawning.roomCreepNo.creepEnergy['wanker'] = 800;
                }
            }
            room.memory.forSpawning.roomCreepNo.minCreeps['shooter'] = OptimumNumShooters;
        }
    }
    else { // room is lvlv 8
        room.memory.forSpawning.roomCreepNo.minCreeps['wanker'] = 1;
        let OptimumNumShooters = Math.floor(storage.store.energy / 130000);
        room.memory.forSpawning.roomCreepNo.creepEnergy['wanker'] = Math.max(OptimumNumShooters * 50, terminal.store.energy / 250000 * 16 * 50);
        room.memory.forSpawning.roomCreepNo.minCreeps['shooter'] = 1;
        if (_.sum(storage.store) > 990000 && _.sum(terminal.store) > 290000) {
            room.memory['prepareToReClaim'] = true;
            room.memory.forSpawning.roomCreepNo.minCreeps['shooter'] = 7;

            let roomMem = room.memory.forSpawning.roomCreepNo
            roomMem.minCreeps['harvester'] = 0;
            roomMem.minCreeps['miner'] = 0;
            roomMem.minCreeps['lorry'] = 1;
            roomMem.minCreeps['pickuper'] = 1;
            roomMem.minCreeps['builder'] = 0;
            roomMem.minCreeps['upgrader'] = 0;
            roomMem.minCreeps['linkKeeper'] = 0;
            roomMem.minCreeps['repairer'] = 0;
            roomMem.minCreeps['wallRepairer'] = 0;
            roomMem.minCreeps['longDistanceHarvester'] = 0;
            roomMem.minCreeps['longDistanceLorry'] = 0;
            roomMem.minCreeps['longDistanceBuilder'] = 0;
            roomMem.minCreeps['reserver'] = 0;
            roomMem.minCreeps['claimer'] = 0;
            roomMem.minCreeps['attacker'] = 0;
            roomMem.minCreeps['scouter'] = 0;
            roomMem.minCreeps['teezer'] = 0;
            roomMem.minCreeps['begger'] = 0;
            roomMem.minCreeps['labber'] = 0;
            roomMem.minCreeps['superUpgrader'] = 0;
            roomMem.minCreeps['ultimateUpgrader'] = 0;

            let noOfShooters = room.find(FIND_MY_CREEPS, { filter: (s) => (s.memory.role == 'shooter' && checkIfCreepIsBoosted(s)) }).length;
            if (noOfShooters && noOfShooters > 5) {
                let reClaimer = room.find(FIND_MY_CREEPS, { filter: (s) => (s.memory.role == 'claimer') });
                if (reClaimer.length > 0 && reClaimer[0].pos.getRangeTo(room.controller) < 2) {
                    console.log('WARNING! Reclaiming shooter room!');
                    room.controller.unclaim()
                    initiateCreepsSpawnInfo(room.name);
                    room.memory['prepareToReClaim'] = false;
                }
                else {
                    Game.getObjectById(room.memory.forSpawning.renewSpawnId).createCreep([CLAIM, MOVE], undefined, { role: 'claimer', target: room.name });
                }
            }
        }
    }
}

global.findCreepWithLowestTicksToLiveInCreeps = function (creeps) {

}
