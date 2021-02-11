require('myFunctions');
var randomCreepName = randomIdGenerator()

StructureSpawn.prototype.createCustomCreep = function (energy, roleName, home) {
    //console.log(home)
    if ((roleName == 'lorry') || (roleName == 'pickuper') || (roleName == 'linkKeeper') || (roleName == 'labber') || (roleName == 'scientist')) {
        var NoParts = Math.floor(energy / 150);
        if (NoParts>8) {
            NoParts = 8;
        }
        var body = [];
        for (let i = 0; i < NoParts; i++) {
            body.push(CARRY);
            body.push(CARRY);
        }
        for (let i = 0; i < NoParts; i++) {
            body.push(MOVE);
        }
        //console.log(energy, roleName, home,body);
        return this.spawnCreep(body, randomCreepName, { memory: { role: roleName, working: false, target: home, spawnTime: 3 * body.length } });
    }
    else if (roleName == 'wanker') {
        body = [];
        var NoParts = Math.max(1,Math.floor(energy/50));
        for (let i = 0; i < NoParts; i++) {
            body.push(CARRY);
        }
        return this.spawnCreep(body, roleName + '_' + generateRandomStrings(), { memory: { role: roleName, spawnTime: 3 * body.length }, directions: [TOP_LEFT] });
    }
    else if (roleName == 'shooter') {
        body = [CARRY, MOVE, MOVE];
        if (this.room.controller.level < 8) {
            var NoParts = Math.floor((energy - 150) / 100);
            if (NoParts > 47) {
                NoParts = 47;
            }
        }
        else { // room lvl 8
            var NoParts = 15;
            let prepareToReClaim = this.room.memory.prepareToReClaim;
            if (prepareToReClaim == true) {
                NoParts = 47;
            }
        }
        for (let i = 0; i < NoParts; i++) {
            body.push(WORK);
        }
        let eCost = 150 + 100 * NoParts;

        return this.spawnCreep(body, roleName + '_' + generateRandomStrings(), { memory: { role: roleName, spawnTime: 3 * body.length, eCost: eCost }, directions: [LEFT, BOTTOM_LEFT] });
    }
    else { // harvester, upgrader, builde etc... WORK CARRY MOVE creeps
        var NoParts = Math.floor(energy/200);
        if (NoParts>15) {
            NoParts = 15;
        }
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
        //console.log(energy, roleName, home, body);
        return this.spawnCreep(body, randomCreepName, { memory: {role: roleName, working: false, target: home, spawnTime: 3*body.length}});
    }
}

StructureSpawn.prototype.createSuperUpgrader = function(energyMax) {
    var body = [];
    body.push(CARRY);
    if (energyMax>=4650) {
        let NoCarryMoveParts = Math.floor((4650 - 100)/650);
        for (let i = 0; i < NoCarryMoveParts; i++) {
            for (let i = 0; i < 6; i++) {
                body.push(WORK);
            }
            body.push(MOVE);
        }
    }
    else {
        let NoCarryMoveParts = Math.floor((energyMax - 50)/550);
        for (let i = 0; i < NoCarryMoveParts; i++) {
            for (let i = 0; i < 5; i++) {
                body.push(WORK);
            }
            body.push(MOVE);
        }
    }
    return this.spawnCreep(body, randomCreepName, { memory: {role: 'superUpgrader', working: false, spawnTime: 3*body.length}});
}

StructureSpawn.prototype.createLongDistanceHarvester = function(energy, home, target) {
    var body = [];
    var NoCarryMoveParts = Math.floor((energy)/250);

    for (let i = 0; i < NoCarryMoveParts; i++) {
        body.push(WORK);
        body.push(CARRY);
        body.push(MOVE);
        body.push(MOVE);
    }

    return this.spawnCreep(body, randomCreepName, { memory: {role: 'longDistanceHarvester', home: home, target: target, working: false, toCentre: false, spawnTime: 3*body.length}});
}

StructureSpawn.prototype.createLongDistanceLorry = function(energy, home, target) {
    var body = [];
    var NoCarryMoveParts = Math.floor((energy-150)/150);

    for (let i = 0; i < (NoCarryMoveParts-1); i++) {
        body.push(CARRY);
        body.push(CARRY);
        body.push(MOVE);
    }
    body.push(WORK, MOVE);

    return this.spawnCreep(body, randomCreepName, { memory: {role: 'longDistanceLorry', home: home, target: target, working: false, toCentre: false, spawnTime: 3*body.length}});
}

StructureSpawn.prototype.createBegger = function(energy, home, target) {
    var body = [];
    var NoCarryMoveParts = Math.floor(energy/100);

    for (let i = 0; i < Math.min(NoCarryMoveParts,16); i++) {
        body.push(CARRY);
        body.push(CARRY);
        body.push(MOVE);
    }
    body.push(CARRY, MOVE);
    return this.spawnCreep(body, 'MrHelloer' + '_' + 'CNMB' + '_' + generateRandomStrings(), { memory: {role: 'begger', home: home, target: target, working: false, spawnTime: 3*body.length}});
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
    return this.spawnCreep(body, randomCreepName, { memory: {role: 'longDistanceUpgrader', home: home, target: target, working: false, spawnTime: 3*body.length}});
}

StructureSpawn.prototype.createAttacker = function(target, home, uniqueString) {
      var body = [];
      for (let i = 0; i < 5; i++) {
          body.push(TOUGH);
      }
      for (let i = 0; i < 5; i++) {
          body.push(MOVE);
      }
      for (let i = 0; i < 19; i++) {
          body.push(ATTACK);
      }
      body.push(RANGED_ATTACK);
      for (let i = 0; i < 20; i++) {
          body.push(MOVE);
      }

      return this.spawnCreep(body, randomCreepName, { memory: {role: 'attacker', target: target, home: home, uniqueString: uniqueString, spawnTime: 3*body.length}});
}

StructureSpawn.prototype.createHealer = function(target, boosted) {
      var body = [];
      for (let i = 0; i < 25; i++) {
          body.push(MOVE);
      }
      for (let i = 0; i < 25; i++) {
          body.push(HEAL);
      }

      /*var body = [];
      for (let i = 0; i < 6; i++) {
          body.push(MOVE);
      }
      for (let i = 0; i < 6; i++) {
          body.push(HEAL);
      }

      body.push(ATTACK);
      body.push(MOVE);
      */

      return this.spawnCreep(body, randomCreepName, { memory: {role: 'healer', target: target, boosted: boosted, spawnTime: 3*body.length}});
}

StructureSpawn.prototype.createControllerAttacker = function(target) {
    var body = [CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, MOVE];
    return this.spawnCreep(body, undefined, { memory: {role: 'controllerAttacker', target: target, spawnTime: 3*body.length}});
}

StructureSpawn.prototype.createTeezer = function (energy, target, home, preferredLocation) {
    var body = [];

    for (let i = 0; i < 4; i++) {
        body.push(TOUGH);
    }
    for (let i = 0; i < 4; i++) {
        body.push(MOVE);
    }

    var NoParts = Math.min( Math.floor((energy-(10+50)*4)/300), 9 );

    for (let i = 0; i < NoParts; i++) {
        body.push(HEAL);
        body.push(MOVE);
    }

    /*if (withAttack) {
        for (let i = 0; i < 10; i++) {
            body.push(TOUGH);
        }
        for (let i = 0; i < 10; i++) {
            body.push(MOVE);
        }
        for (let i = 0; i < 5; i++) {
            body.push(ATTACK);
            body.push(MOVE);
        }
        for (let i = 0; i < 5; i++) {
            body.push(HEAL);
            body.push(MOVE);
        }
    }
    else {
        for (let i = 0; i < 25; i++) {
            body.push(MOVE);
        }
        for (let i = 0; i < 25; i++) {
            body.push(HEAL);
        }
    }*/

    return this.spawnCreep(body, randomCreepName, { memory: { role: 'teezer', target: target, home: home, preferredLocation: preferredLocation, spawnTime: 3*body.length}});
}

StructureSpawn.prototype.createScouter = function(scouterName, target) {
    return this.spawnCreep([MOVE], scouterName, { memory: {role: 'scouter', target: target, spawnTime: 3}});
}

StructureSpawn.prototype.createLongDistanceBuilder = function(energy, target, home) {
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
    return this.spawnCreep(body, randomCreepName, { memory: {role: 'longDistanceBuilder', target: target, home: home, working: false, spawnTime: 3*body.length}});
}

StructureSpawn.prototype.createPioneer = function(energy, target, home, superUpgrader, route) {
    var body = [];
    if (superUpgrader) {
        for (let i = 0; i < 32; i++) {
            body.push(WORK);
        }
        body.push(CARRY);
        body.push(CARRY);
        for (let i = 0; i < 16; i++) {
            body.push(MOVE);
        }
    }
    else {
        var NoCarryMoveParts = Math.min(Math.floor(energy/200),16);

        for (let i = 0; i < NoCarryMoveParts; i++) {
            body.push(WORK);
        }
        for (let i = 0; i < NoCarryMoveParts; i++) {
            body.push(CARRY);
        }
        for (let i = 0; i < NoCarryMoveParts; i++) {
            body.push(MOVE);
        }
    }
    return this.spawnCreep(body, randomCreepName, { memory: {role: 'pioneer', target: target, home: home, working: false, spawnTime: 3*body.length, route: route}});
}

StructureSpawn.prototype.createClaimer = function(target) {
  //return this.spawnCreep([WORK, CARRY, ATTACK, CLAIM, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], undefined, {role: 'claimer', target: target});
    let body = [CLAIM, MOVE, MOVE];
    return this.spawnCreep(body, randomCreepName, { memory: {role: 'claimer', target: target, spawnTime: 3*body.length}});
}

StructureSpawn.prototype.createReserver = function(target, big, roomEnergyMax) {
    let body;
    if (big) {
        if (roomEnergyMax>9000) {
            body = [CLAIM, CLAIM, MOVE, MOVE, CLAIM, CLAIM, MOVE, MOVE, CLAIM, MOVE, CLAIM, CLAIM, MOVE, MOVE, CLAIM, MOVE];
        }
        else if (roomEnergyMax>5000) {
            body = [CLAIM, CLAIM, MOVE, MOVE, CLAIM, CLAIM, MOVE, MOVE, CLAIM, MOVE];
        }
        else if (roomEnergyMax>3000) {
            body = [CLAIM, CLAIM, MOVE, MOVE, CLAIM, CLAIM, MOVE, MOVE];
        }
        else {
            body = [CLAIM, CLAIM, MOVE, MOVE];
        }
    }
    else {
        body = [CLAIM, MOVE];

    }
    return this.spawnCreep(body, randomCreepName, { memory: {role: 'reserver', target: target, spawnTime: 3*body.length}});
}

StructureSpawn.prototype.createMiner = function(sourceID, target, RCL, ifMineEnergy, ifLink, ifKeeper, home) {
    let body = [];
    if (ifMineEnergy) { // if mining energy
        if (ifKeeper) {
            body = [WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, WORK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
            return this.spawnCreep(body, randomCreepName, { memory: {role: 'miner', sourceID: sourceID, target: target, spawnTime: 3*body.length, home: home}});
        }
        else if (RCL == 0) { // if remote mining, run faster, more MOVE parts
            body = [WORK, WORK, WORK, WORK, WORK, CARRY, WORK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
            return this.spawnCreep(body, randomCreepName, { memory: { role: 'miner', sourceID: sourceID, target: target, spawnTime: 3 * body.length, home: home}});
        }
        else { // current room miner, no need to move very fast
            if (ifLink) { // if link mining
                body = [WORK, WORK, WORK, WORK, WORK, CARRY, MOVE];
                return this.spawnCreep(body, randomCreepName, { memory: { role: 'miner', sourceID: sourceID, target: target, link: true, spawnTime: 3 * body.length, home: home}});
            }
            else {
                body = [WORK, WORK, WORK, WORK, WORK, MOVE];
                return this.spawnCreep(body, randomCreepName, { memory: { role: 'miner', sourceID: sourceID, target: target, link: false, spawnTime: 3 * body.length, home: home}});
            }
        }
    }
    else { // if mining minerals mine big!
        if (RCL>=7) {
            for (let i = 0; i < 16; i++) {
                body.push(WORK);
                body.push(WORK);
                body.push(MOVE);
            }
            body.push(WORK);
            body.push(MOVE);
        }
        else {
            body = [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE, MOVE];
        }
        return this.spawnCreep(body, randomCreepName, { memory: { role: 'miner', sourceID: sourceID, target: target, spawnTime: 3 * body.length, home: home}});
    }
}

StructureSpawn.prototype.createLorry = function(energy) {
    let body = [CARRY,CARRY,MOVE];
    return this.spawnCreep(body, randomCreepName, { memory: {role: 'lorry', working: false, spawnTime: 3*body.length}});
}

StructureSpawn.prototype.createTraveller = function(target) {
    let body = [MOVE];
    return this.spawnCreep(body, randomCreepName, { memory: {role: 'traveller', target: target, spawnTime: 3*body.length}});
}

StructureSpawn.prototype.createTransporter = function (mineralType, fromStorage) {
    var body = [];
    for (let i = 0; i < 4; i++) {
        body.push(MOVE);
        body.push(CARRY);
        body.push(CARRY);
    }
    return this.spawnCreep(body, randomCreepName, { memory: { role: 'transporter', resourceType: mineralType, working: false, fromStorage: fromStorage, spawnTime: 3*body.length}});
}

/*
StructureSpawn.prototype.createAntiTransporter = function(mineralType) {
    var body = [];
    for (let i = 0; i < 10; i++) {
        body.push(MOVE);
        body.push(CARRY);
        body.push(CARRY);
    }
    return this.spawnCreep(body, undefined, {role: 'antiTransporter', resourceType: mineralType, working: false, spawnTime: 3*body.length});
}
*/

StructureSpawn.prototype.createRanger = function(target, home) {
    let body = [MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, RANGED_ATTACK];
    return this.spawnCreep(body, randomCreepName, { memory: {role: 'ranger', target: target, home: home, spawnTime: 3*body.length}});
}

StructureSpawn.prototype.createPowerSourceAttacker = function(target,name) {
    var body = [];

    for (let i = 0; i < 20; i++) {
        body.push(MOVE);
    }
    for (let i = 0; i < 20; i++) {
        body.push(ATTACK);
    }

    return this.spawnCreep(body, name, { memory: {role: 'powerSourceAttacker', target: target, home: this.room.name, spawnTime: 3*body.length}});
}

StructureSpawn.prototype.createPowerSourceHealer = function(target, toHeal) {
    var body = [];

    for (let i = 0; i < 25; i++) {
        body.push(MOVE);
    }
    for (let i = 0; i < 25; i++) {
        body.push(HEAL);
    }

    return this.spawnCreep(body, randomCreepName, { memory: { role: 'powerSourceHealer', target: target, home: this.room.name, toHeal: toHeal, spawnTime: 3*body.length}});
}

StructureSpawn.prototype.createPowerSourceRanger = function(target) {
    var body = [];

    for (let i = 0; i < 17; i++) {
        body.push(MOVE);
    }
    for (let i = 0; i < 1; i++) {
        for (let j = 0; j < 5; j++) {
            body.push(HEAL);
        }
        for (let j = 0; j < 12; j++) {
            body.push(RANGED_ATTACK);
        }
    }

    return this.spawnCreep(body, randomCreepName, { memory: { role: 'powerSourceRanger', target: target, home: this.room.name, spawnTime: 3*body.length}});
}

StructureSpawn.prototype.createPowerSourceLorry = function(target, home) {
    var body = [];
    var NoCarryMoveParts = Math.floor(2500/150);

    for (let i = 0; i < NoCarryMoveParts; i++) {
        body.push(CARRY);
        body.push(CARRY);
        body.push(MOVE);
    }
    body.push(CARRY);
    body.push(MOVE);
    return this.spawnCreep(body, randomCreepName, { memory: {role: 'powerSourceLorry', home: home, target: target, working: false, spawnTime: 3*body.length}});
}

StructureSpawn.prototype.createKeeperLairMeleeKeeper = function(target, home, ranged) {
    var body = [];
    if (ranged) {
        for (let i = 0; i < 18; i++) {
            body.push(MOVE);
        }
        for (let i = 0; i < 6; i++) {
            body.push(ATTACK);
        }
        for (let i = 0; i < 6; i++) {
            body.push(RANGED_ATTACK);
        }
        for (let i = 0; i < 6; i++) {
            body.push(HEAL);
        }
    }
    else {
        for (let i = 0; i < 25; i++) {
            body.push(MOVE);
        }
        for (let i = 0; i < 19; i++) {
            body.push(ATTACK);
        }
        /*for (let i = 0; i < 1; i++) {
            body.push(RANGED_ATTACK);
        }*/
        for (let i = 0; i < 6; i++) {
            body.push(HEAL);
        }
    }
    return this.spawnCreep(body, randomCreepName, { memory: {role: 'keeperLairMeleeKeeper', target: target, home: home, ranged: ranged, spawnTime: 3*body.length}});
}

StructureSpawn.prototype.createKeeperLairInvaderAttacker = function(target, home, name) {
    var body = [];

    for (let i = 0; i < 25; i++) {
        body.push(MOVE);
    }
    for (let i = 0; i < 20; i++) {
        body.push(ATTACK);
    }
    for (let i = 0; i < 5; i++) {
        body.push(RANGED_ATTACK);
    }

    return this.spawnCreep(body, name, { memory: {role: 'keeperLairInvaderAttacker', target: target, home: home, spawnTime: 3*body.length}});
}

StructureSpawn.prototype.createKeeperLairInvaderHealer = function(target, home, toHeal) {
    var body = [];

    for (let i = 0; i < 4; i++) {
        body.push(TOUGH);
    }
    for (let i = 0; i < 16; i++) {
        body.push(MOVE);
    }
    for (let i = 0; i < 12; i++) {
        body.push(HEAL);
    }

    return this.spawnCreep(body, randomCreepName, { memory: {role: 'keeperLairInvaderHealer', target: target, home: home, toHeal: toHeal, spawnTime: 3*body.length}});
}

StructureSpawn.prototype.createKeeperLairLorry = function(target, home) {
    var body = [];
    for (let i = 0; i < 1; i++) {
        body.push(WORK);
        body.push(MOVE);
    }
    for (let i = 0; i < 16; i++) {
        body.push(CARRY);
        body.push(CARRY);
        body.push(MOVE);
    }
    /*for (let i = 0; i < 16; i++) {
        body.push(CARRY);
        body.push(CARRY);
        body.push(MOVE);
    }*/
    return this.spawnCreep(body, randomCreepName, { memory: {role: 'keeperLairLorry', target: target, home: home, working: false, spawnTime: 3*body.length}});
}

StructureSpawn.prototype.createCaptain = function(groupName) {
      var body = [];

      for (let i = 0; i < 25; i++) {
          body.push(MOVE);
      }
      for (let i = 0; i < 25; i++) {
          body.push(ATTACK);
      }

      return this.spawnCreep(body, randomCreepName, { memory: {role: 'captain', groupName: groupName, followed: false, ungrouped: true, spawnTime: 3*body.length}});
}

StructureSpawn.prototype.createFirstMate = function(groupName, boostMat) {
      var body = [];
      for (let i = 0; i < 25; i++) {
          body.push(MOVE);
      }
      for (let i = 0; i < 25; i++) {
          body.push(HEAL);
      }
      return this.spawnCreep(body, randomCreepName, { memory: {role: 'firstMate', groupName: groupName, followed: false, ungrouped: true, boosted: false, boostMat: boostMat, spawnTime: 3*body.length}});
}

StructureSpawn.prototype.createCrew = function(groupName, boostMat) {
      var body = [];
      for (let i = 0; i < 25; i++) {
          body.push(MOVE);
      }
      for (let i = 0; i < 25; i++) {
          body.push(HEAL);
      }
      return this.spawnCreep(body, randomCreepName, { memory: {role: 'crew', groupName: groupName, followed: false, ungrouped: true, boosted: false, boostMat: boostMat, spawnTime: 3*body.length}});
}

StructureSpawn.prototype.createUltimateWorrior = function(target) {
      var body = [];
      for (let i = 0; i < 6; i++) {
          body.push(TOUGH);
      }
      for (let i = 0; i < 9; i++) {
          body.push(RANGED_ATTACK);
      }
      for (let i = 0; i < 15; i++) {
          body.push(MOVE);
      }
      for (let i = 0; i < 3; i++) {
          body.push(MOVE);
          body.push(HEAL);
      }
      return this.spawnCreep(body, randomCreepName, { memory: {role: 'ultimateWorrior', target: target, boosted: false, spawnTime: 3*body.length}});
}

StructureSpawn.prototype.createDismantler = function(target) {
      var body = [];
      for (let i = 0; i < 25; i++) {
          body.push(WORK);
      }
      for (let i = 0; i < 25; i++) {
          body.push(MOVE);
      }
      return this.spawnCreep(body, randomCreepName, { memory: {role: 'dismantler', target: target, boosted: false, spawnTime: 3*body.length}});
}

StructureSpawn.prototype.createUltimateUpgrader = function(boosted) {
      var body = [];
      for (let i = 0; i < 15; i++) {
          body.push(WORK);
      }
      body.push(CARRY);
      for (let i = 0; i < 8; i++) {
          body.push(MOVE);
      }

      return this.spawnCreep(body, randomCreepName, { memory: {role: 'ultimateUpgrader', boosted: boosted, spawnTime: 3*body.length}});
}

StructureSpawn.prototype.createWanderer = function(target) {
      var body = [MOVE];
      return this.spawnCreep(body, randomCreepName, { memory: {role: 'wanderer', target: target}});
}

StructureSpawn.prototype.createOneWayInterSharder = function(targetShardName, portalRoomName, portalId, targetRoomName, roleWillBe, body) {
    return this.spawnCreep(body, targetShardName + '_' + targetRoomName + '_' + roleWillBe + '_' + generateRandomStrings(), {role: 'oneWayInterSharder', targetShardName: targetShardName, portalRoomName: portalRoomName, portalId: portalId, targetRoomName: targetRoomName, roleWillBe: roleWillBe, spawnTime: 3*body.length});
}

StructureSpawn.prototype.createPortalTransporter = function (portalRoomName, energy, parsedMemoryAfterTeleportation) {
    var body = [];
    var NoParts = Math.floor(energy / 200);
    for (let i = 0; i < NoParts; i++) {
        body.push(WORK);
    }
    for (let i = 0; i < NoParts; i++) {
        body.push(CARRY);
    }
    for (let i = 0; i < NoParts; i++) {
        body.push(MOVE);
    }
    return this.spawnCreep(body, randomCreepName, { memory: { role: 'portalTransporter', portalRoomName: portalRoomName, parsedMemoryAfterTeleportation: parsedMemoryAfterTeleportation }});
}

StructureSpawn.prototype.createOnlyMineralDefender = function (target, home) {
    var body = [];
    for (let i = 0; i < 25; i++) {
        body.push(MOVE);
    }
    for (let i = 0; i < 22; i++) {
        body.push(ATTACK);
    }
    for (let i = 0; i < 3; i++) {
        body.push(HEAL);
    }
    return this.spawnCreep(body, randomCreepName, { memory: { role: 'onlyMineralDefender', target: target, home: home, spawnTime: 3 * body.length }});
}

StructureSpawn.prototype.createOnlyMineralMiner = function (target, home) {
    var body = [];
    for (let i = 0; i < 18; i++) {
        body.push(MOVE);
    }
    for (let i = 0; i < 18; i++) {
        body.push(WORK);
    }
    for (let i = 0; i < 14; i++) {
        body.push(CARRY);
    }
    return this.spawnCreep(body, randomCreepName, { memory: { role: 'onlyMineralMiner', target: target, home: home, spawnTime: 3 * body.length }});
}

StructureSpawn.prototype.createOnlyMineralHauler = function (target, home) {
    var body = [];
    for (let i = 0; i < 14; i++) {
        body.push(MOVE);
    }
    for (let i = 0; i < 14; i++) {
        body.push(CARRY);
    }
    return this.spawnCreep(body, randomCreepName, { memory: { role: 'onlyMineralHauler', target: target, home: home, spawnTime: 3 * body.length }});
}
