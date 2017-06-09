StructureSpawn.prototype.createCustomCreep = function(energy, roleName, home) {
    if ((roleName == 'lorry') || (roleName == 'pickuper') || (roleName == 'linkKeeper') || (roleName == 'labber')) {
        var NoParts = Math.floor(energy/150);
        var body = [];
        for (let i = 0; i < NoParts; i++) {
            body.push(CARRY);
            body.push(CARRY);
        }
        for (let i = 0; i < NoParts; i++) {
            body.push(MOVE);
        }
        return this.createCreep(body, undefined, {role: roleName, working: false, spawnTime: 3*body.length});
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
        return this.createCreep(body, undefined, {role: roleName, working: false, target: home, spawnTime: 3*body.length});
    }
}

StructureSpawn.prototype.createSuperUpgrader = function() {
    var body = [];
    for (let i = 0; i < 36; i++) {
        body.push(WORK);
    }
    body.push(CARRY);
    for (let i = 0; i < 12; i++) {
        body.push(MOVE);
    }
    return this.createCreep(body, undefined, {role: 'superUpgrader', working: false, spawnTime: 3*body.length});
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
    return this.createCreep(body, undefined, {role: 'longDistanceHarvester', home: home, target: target, sourceIndex: sourceIndex, working: false, toCentre: false, spawnTime: 3*body.length});
}

StructureSpawn.prototype.createLongDistanceLorry = function(energy, home, target) {
    var body = [];
    var NoCarryMoveParts = Math.floor(energy/150);

    for (let i = 0; i < NoCarryMoveParts; i++) {
        body.push(CARRY);
        body.push(CARRY);
        body.push(MOVE);
    }
    /*for (let i = 0; i < NoCarryMoveParts; i++) {
        body.push(MOVE);
    }*/
    if (energy%100 >= 50) {
        body.push(CARRY, MOVE);
    }
    return this.createCreep(body, undefined, {role: 'longDistanceLorry', home: home, target: target, working: false, toCentre: false, spawnTime: 3*body.length});
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
    return this.createCreep(body, undefined, {role: 'begger', home: home, target: target, working: false, spawnTime: 3*body.length});
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
    return this.createCreep(body, undefined, {role: 'longDistanceUpgrader', home: home, target: target, working: false, spawnTime: 3*body.length});
}

StructureSpawn.prototype.createAttacker = function(energy, target) {
    var body = [];
    var NoAttackMoveParts = Math.floor(energy/320);

    for (let i = 0; i < NoAttackMoveParts*2; i++) {
        body.push(TOUGH);
    }
    for (let i = 0; i < NoAttackMoveParts; i++) {
        body.push(RANGED_ATTACK);
    }
    for (let i = 0; i < NoAttackMoveParts*3; i++) {
        body.push(MOVE);
    }
    if (energy%320 >= 50) {
        body.push(MOVE);
    }
    return this.createCreep(body, undefined, {role: 'attacker', target: target, spawnTime: 3*body.length});
}

StructureSpawn.prototype.createControllerAttacker = function(target) {
    var body = [CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, MOVE];
    return this.createCreep(body, undefined, {role: 'controllerAttacker', target: target, spawnTime: 3*body.length});
}

StructureSpawn.prototype.createTeezer = function(energy, target, home) {
    var body = [];
    var NoAttackMoveParts = Math.floor(energy/60);

    for (let i = 0; i < NoAttackMoveParts; i++) {
        body.push(TOUGH);
    }

    body.push(ATTACK);
    body.push(MOVE);
    body.push(ATTACK);
    body.push(MOVE);

    for (let i = 0; i < NoAttackMoveParts; i++) {
        body.push(MOVE);
    }
    return this.createCreep(body, undefined, {role: 'teezer', target: target, home: home, spawnTime: 3*body.length});
}

StructureSpawn.prototype.createScouter = function(scouterName, target) {
    return this.createCreep([MOVE], scouterName, {role: 'scouter', target: target, spawnTime: 3});
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
    return this.createCreep(body, undefined, {role: 'longDistanceBuilder', target: target, home: home, working: false, spawnTime: 3*body.length});
}

StructureSpawn.prototype.createPioneer = function(energy, target, home) {
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
    return this.createCreep(body, undefined, {role: 'pioneer', target: target, home: home, working: false, spawnTime: 3*body.length});
}

StructureSpawn.prototype.createClaimer = function(target) {
  //return this.createCreep([WORK, CARRY, ATTACK, CLAIM, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], undefined, {role: 'claimer', target: target});
    let body = [CLAIM, MOVE, MOVE];
    return this.createCreep(body, undefined, {role: 'claimer', target: target, spawnTime: 3*body.length});
}

StructureSpawn.prototype.createReserver = function(target, big) {
    let body;
    if (big) {
        body = [CLAIM, CLAIM, MOVE, MOVE];
        return this.createCreep(body, undefined, {role: 'reserver', target: target, spawnTime: 3*body.length});
    }
    else {
        body = [CLAIM, MOVE];
        return this.createCreep(body, undefined, {role: 'reserver', target: target, spawnTime: 3*body.length});
    }
}

StructureSpawn.prototype.createMiner = function(sourceID, target, RCL, ifMineEnergy, ifLink, ifKeeper) {
    let body;
    if (ifMineEnergy) { // if mining energy
        if (ifKeeper) {
            body = [WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, WORK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
            return this.createCreep(body, undefined, {role: 'miner', sourceID: sourceID, target: target, spawnTime: 3*body.length});
        }
        else if (RCL == 0) { // if remote mining, run faster, more MOVE parts
            body = [WORK, WORK, WORK, WORK, WORK, CARRY, WORK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
            return this.createCreep(body, undefined, {role: 'miner', sourceID: sourceID, target: target, spawnTime: 3*body.length});
        }
        else { // current room miner, no need to move very fast
            if (ifLink) { // if link mining
                body = [WORK, WORK, WORK, WORK, WORK, CARRY, MOVE];
                return this.createCreep(body, undefined, {role: 'miner', sourceID: sourceID, target: target, link: true, spawnTime: 3*body.length});
            }
            else {
                body = [WORK, WORK, WORK, WORK, WORK, MOVE];
                return this.createCreep(body, undefined, {role: 'miner', sourceID: sourceID, target: target, link: false, spawnTime: 3*body.length});
            }
        }
    }
    else { // if mining minerals mine big!
        if (ifKeeper) {
            body = [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
            return this.createCreep(body, undefined, {role: 'miner', sourceID: sourceID, target: target, spawnTime: 3*body.length});
        }
        else {
            body = [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE, MOVE];
            return this.createCreep(body, undefined, {role: 'miner', sourceID: sourceID, target: target, spawnTime: 3*body.length});
        }
    }
}

StructureSpawn.prototype.createLorry = function(energy) {
    let body = [CARRY,CARRY,MOVE];
    return this.createCreep(body, undefined, {role: 'lorry', working: false, spawnTime: 3*body.length});
}

StructureSpawn.prototype.createTraveller = function(target) {
    let body = [MOVE];
    return this.createCreep(body, undefined, {role: 'traveller', target: target, spawnTime: 3*body.length});
}

StructureSpawn.prototype.createTransporter = function(mineralType) {
    let body = [CARRY, CARRY, CARRY, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, MOVE, MOVE, MOVE];
    return this.createCreep(body, undefined, {role: 'transporter', resourceType: mineralType, working: false, spawnTime: 3*body.length});
}
StructureSpawn.prototype.createAntiTransporter = function(mineralType) {
    let body = [CARRY, CARRY, CARRY, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, MOVE, MOVE, MOVE];
    return this.createCreep(body, undefined, {role: 'antiTransporter', resourceType: mineralType, working: false, spawnTime: 3*body.length});
}

StructureSpawn.prototype.createRanger = function(target, home) {
    let body = [MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, RANGED_ATTACK];
    return this.createCreep(body, undefined, {role: 'ranger', target: target, home: home, spawnTime: 3*body.length});
}

StructureSpawn.prototype.createPowerSourceAttacker = function(target) {
    var body = [];

    for (let i = 0; i < 20; i++) {
        body.push(MOVE);
    }
    for (let i = 0; i < 20; i++) {
        body.push(ATTACK);
    }

    return this.createCreep(body, undefined, {role: 'powerSourceAttacker', target: target, spawnTime: 3*body.length});
}

StructureSpawn.prototype.createPowerSourceHealer = function(target) {
    var body = [];

    for (let i = 0; i < 7; i++) {
        body.push(MOVE);
    }
    for (let i = 0; i < 7; i++) {
        body.push(HEAL);
    }

    return this.createCreep(body, undefined, {role: 'powerSourceHealer', target: target, spawnTime: 3*body.length});
}

StructureSpawn.prototype.createPowerSourceLorry = function(target, home) {
    var body = [];
    var NoCarryMoveParts = Math.floor(2500/150);

    for (let i = 0; i < NoCarryMoveParts; i++) {
        body.push(CARRY);
        body.push(CARRY);
        body.push(MOVE);
    }
    return this.createCreep(body, undefined, {role: 'powerSourceLorry', home: home, target: target, working: false, spawnTime: 3*body.length});
}

StructureSpawn.prototype.createKeeperLairMeleeKeeper = function(target, ranged) {
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
        for (let i = 0; i < 13; i++) {
            body.push(ATTACK);
        }
        for (let i = 0; i < 12; i++) {
            body.push(HEAL);
        }
    }
    return this.createCreep(body, undefined, {role: 'keeperLairMeleeKeeper', target: target, ranged: ranged, spawnTime: 3*body.length});
}

StructureSpawn.prototype.createKeeperLairLorry = function(target, home) {
    var body = [];
    for (let i = 0; i < 1; i++) {
        body.push(WORK);
        body.push(MOVE);
    }
    for (let i = 0; i < 15; i++) {
        body.push(CARRY);
        body.push(CARRY);
        body.push(MOVE);
    }
    /*for (let i = 0; i < 16; i++) {
        body.push(CARRY);
        body.push(CARRY);
        body.push(MOVE);
    }*/
    return this.createCreep(body, undefined, {role: 'keeperLairLorry', target: target, home: home, working: false, spawnTime: 3*body.length});
}
