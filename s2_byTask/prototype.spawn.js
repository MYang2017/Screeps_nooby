require('myFunctions');

StructureSpawn.prototype.getDefaultSpawningDir = function () {
    if (this.room.memory.forSpawning && this.room.memory.forSpawning.defaultDir == undefined) {
        this.room.memory.forSpawning.defaultDir = {};
    }
    else if (this.room.memory.forSpawning.defaultDir[this.id]) {
        return this.room.memory.forSpawning.defaultDir[this.id]
    }
    else {
        let anch = this.room.memory.anchor;
        if (anch == undefined) {
            anch = this.room.memory.newAnchor;
        }
        if (this.pos.x == anch.x) {
            this.room.memory.forSpawning.defaultDir[this.id] = [TOP_RIGHT, TOP, TOP_LEFT];
            return [TOP_RIGHT, TOP, TOP_LEFT]
        }
        else {
            this.room.memory.forSpawning.defaultDir[this.id] = [BOTTOM];
            return [BOTTOM]
        }
    }
}

StructureSpawn.prototype.createCustomCreep = function (energy, roleName, home) {
    //console.log(home)
    if ((roleName == 'lorry') || (roleName == 'pickuper') || (roleName == 'labber') || (roleName == 'linkKeeper') || (roleName == 'scientist')) {
        var NoParts = Math.floor(energy / 150);
        // var NoParts = Math.floor(Math.min(energy, this.room.energyAvailable) / 150);
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
        if (Game.shard.name == 'shardSeason' && this.room.controller.level>4 && roleName == 'lorry' && this.room.storage) {
            for (let i = 0; i < NoParts; i++) {
                body.push(MOVE);
            }
        }
        //console.log(energy, roleName, home,body);
        return this.spawnCreep(body, randomIdGenerator(), { memory: { role: roleName, working: false, target: home, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir()});
    }
    /*else if (roleName == 'linkKeeper') {
        let lvl = Game.rooms[home].controller.level;
        if (lvl>=7 && Object.keys(this.room.memory.forSpawning.defaultDir)>1) {
            return this.spawnCreep([CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY], randomIdGenerator(), { memory: { role: 'linkKeeper', working: false, target: home, spawnTime: 3 * 8, spawnedBy: this.id }, directions: [BOTTOM_RIGHT]});
        }
        else {
            var NoParts = Math.floor(energy / 150);
            // var NoParts = Math.floor(Math.min(energy, this.room.energyAvailable) / 150);
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
            return this.spawnCreep(body, randomIdGenerator(), { memory: { role: roleName, working: false, target: home, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir()});
        }
    }*/
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
    else if (roleName == 'upgrader') {
        var NoParts = Math.floor(this.room.energyCapacityAvailable/250);
        if (NoParts>15) {
            NoParts = 10;
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
            body.push(MOVE);
        }
        /*if (energy%200 >= 100) {
            body.unshift(WORK);
            if (energy%200 >= 150) {
                body.push(CARRY);
            }
        }*/
        //console.log(energy, roleName, home, body);
        return this.spawnCreep(body, randomIdGenerator(), { memory: {role: roleName, working: false, target: home, spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
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
        return this.spawnCreep(body, randomIdGenerator(), { memory: {role: roleName, working: false, target: home, spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
    }
}

StructureSpawn.prototype.createMaintainer = function(posiNum) {
    var body = [CARRY, CARRY];
    let spDir = [undefined, [BOTTOM_LEFT], [TOP_LEFT], [TOP_RIGHT], [TOP_LEFT], [TOP_RIGHT], [BOTTOM_RIGHT]];
    return this.spawnCreep(body, randomIdGenerator(), { memory: {role: 'maintainer', spawnTime: 3*body.length, posiNum: posiNum, spawnedBy: this.id}, directions: spDir[posiNum]});
}

StructureSpawn.prototype.createAnnoyer = function(trn, hrn) {
    var body = [];
    for (let i = 0; i < 9; i++) {
        body.push(TOUGH);
    }
    for (let i = 0; i < 9; i++) {
        body.push(MOVE);
    }
    for (let i = 0; i < 16; i++) {
        body.push(HEAL)
        body.push(MOVE)
    }
    return this.spawnCreep(body, randomIdGenerator(), { memory: {role: 'annoyer', home: hrn, target: trn, spawnTime: 3*body.length, spawnedBy: this.id}, directions: this.getDefaultSpawningDir()});
}

StructureSpawn.prototype.createLoader = function(energy) {
    var body = [];
    var NoCarryMoveParts = Math.floor((energy)/100);
    NoCarryMoveParts = Math.min(4, NoCarryMoveParts)
    
    for (let i = 0; i < NoCarryMoveParts; i++) {
        body.push(CARRY);
        body.push(MOVE);
    }
    return this.spawnCreep(body, randomIdGenerator(), { memory: {role: 'loader', spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
}

StructureSpawn.prototype.createQuads = function(target, quadsId, ifLead, dry=false) {
    var body = [];
    //var NoCarryMoveParts = Math.floor((energy)/100);
    let NoCarryMoveParts = 6; //Math.min(4, NoCarryMoveParts)
    
    if (dry) {
        if (ifLead==1) {
            for (let i = 0; i < 1; i++) {
                body.push(ATTACK);
            }
            for (let i = 0; i < 1; i++) {
                body.push(MOVE);
            }
            return this.spawnCreep(body, randomIdGenerator(), { memory: {role: 'quads', target: target, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: [true , true], spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
        }
        
        if (ifLead==2) {
            for (let i = 0; i < 1; i++) {
                body.push(WORK);
            }
            for (let i = 0; i < 1; i++) {
                body.push(MOVE);
            }
            return this.spawnCreep(body, randomIdGenerator(), { memory: {role: 'quads', target: target, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: [true , true], spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
        }
        
        if (ifLead==3) {
            for (let i = 0; i < 1; i++) {
                body.push(RANGED_ATTACK);
            }
            for (let i = 0; i < 1; i++) {
                body.push(MOVE);
            }
            return this.spawnCreep(body, randomIdGenerator(), { memory: {role: 'quads', target: target, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: [true, true, true], spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
        }
        
        if (ifLead==4) {
            for (let i = 0; i < 1; i++) {
                body.push(RANGED_ATTACK);
            }
            for (let i = 0; i < 1; i++) {
                body.push(MOVE);
            }
            return this.spawnCreep(body, randomIdGenerator(), { memory: {role: 'quads', target: target, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: [true, true, true], spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
        }
    }
    
    if (true) {
        if (ifLead==1) {
            for (let i = 0; i < 33; i++) {
                body.push(ATTACK);
            }
            for (let i = 0; i < 17; i++) {
                body.push(MOVE);
            }
            return this.spawnCreep(body, randomIdGenerator(), { memory: {role: 'quads', target: target, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: ['ZO' , 'XUH2O'], spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
        }
        
        if (ifLead==2) {
            for (let i = 0; i < 33; i++) {
                body.push(WORK);
            }
            for (let i = 0; i < 17; i++) {
                body.push(MOVE);
            }
            return this.spawnCreep(body, randomIdGenerator(), { memory: {role: 'quads', target: target, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: ['ZO', 'XZH2O'], spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
        }
        
        if (ifLead==3) {
            for (let i = 0; i < 8; i++) {
                body.push(RANGED_ATTACK);
            }
            for (let i = 0; i < 8; i++) {
                body.push(MOVE);
            }
            for (let i = 0; i < 25; i++) {
                body.push(HEAL);
            }
            for (let i = 0; i < 9; i++) {
                body.push(MOVE);
            }
            return this.spawnCreep(body, randomIdGenerator(), { memory: {role: 'quads', target: target, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: ['ZO', 'XLHO2'], spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
        }
        
        if (ifLead==4) {
            for (let i = 0; i < 8; i++) {
                body.push(RANGED_ATTACK);
            }
            for (let i = 0; i < 8; i++) {
                body.push(MOVE);
            }
            for (let i = 0; i < 25; i++) {
                body.push(HEAL);
            }
            for (let i = 0; i < 9; i++) {
                body.push(MOVE);
            }
            return this.spawnCreep(body, randomIdGenerator(), { memory: {role: 'quads', target: target, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: ['ZO', 'XLHO2'], spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
        }
    }
    else if (this.room.controller.level == 8) {
        if (ifLead==1) {
            for (let i = 0; i < 10; i++) {
                body.push(TOUGH);
            }
            for (let i = 0; i < 30; i++) {
                body.push(ATTACK);
            }
            for (let i = 0; i < 10; i++) {
                body.push(MOVE);
            }
            return this.spawnCreep(body, randomIdGenerator(), { memory: {role: 'quads', target: target, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: ['XZHO2' , 'XUH2O'], spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
        }
        
        if (ifLead==2) {
            for (let i = 0; i < 10; i++) {
                body.push(TOUGH);
            }
            for (let i = 0; i < 30; i++) {
                body.push(WORK);
            }
            for (let i = 0; i < 10; i++) {
                body.push(MOVE);
            }
            return this.spawnCreep(body, randomIdGenerator(), { memory: {role: 'quads', target: target, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: ['XZHO2', 'GO', 'XZH2O'], spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
        }
        
        if (ifLead==3) {
            for (let i = 0; i < 10; i++) {
                body.push(TOUGH);
            }
            for (let i = 0; i < 5; i++) {
                body.push(RANGED_ATTACK);
            }
            for (let i = 0; i < 25; i++) {
                body.push(HEAL);
            }
            for (let i = 0; i < 10; i++) {
                body.push(MOVE);
            }
            return this.spawnCreep(body, randomIdGenerator(), { memory: {role: 'quads', target: target, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: ['XZHO2', 'GO', 'XLHO2'], spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
        }
        
        if (ifLead==4) {
            for (let i = 0; i < 10; i++) {
                body.push(TOUGH);
            }
            for (let i = 0; i < 5; i++) {
                body.push(RANGED_ATTACK);
            }
            for (let i = 0; i < 25; i++) {
                body.push(HEAL);
            }
            for (let i = 0; i < 10; i++) {
                body.push(MOVE);
            }
            return this.spawnCreep(body, randomIdGenerator(), { memory: {role: 'quads', target: target, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: ['XZHO2', 'GO', 'XLHO2'], spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
        }
    }
}

StructureSpawn.prototype.createDigger = function(energy, target, posi, toEatId) {
    var body = [];
    var NoCarryMoveParts = Math.floor((energy)/100);
    NoCarryMoveParts = Math.min(50, NoCarryMoveParts)
    
    for (let i = 0; i < NoCarryMoveParts; i++) {
        body.push(WORK);
    }
    return this.spawnCreep(body, randomIdGenerator(), { memory: {role: 'digger', target: target, posi: posi, toEatId: toEatId, spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
}

StructureSpawn.prototype.createTruck = function(energy) {
    var body = [];
    var NoCarryMoveParts = Math.floor((energy)/100);
    NoCarryMoveParts = Math.min(50, NoCarryMoveParts)
    
    for (let i = 0; i < NoCarryMoveParts; i++) {
        body.push(MOVE);
    }
    return this.spawnCreep(body, randomIdGenerator(), { memory: {role: 'truck', spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
}

StructureSpawn.prototype.createDickHead = function() {
    let level = this.room.controller.level;
    let body = [CARRY, CARRY, MOVE];
    if (level<7) {
        body = [CARRY, MOVE];
    }
    if (Game.time%3==0) {
        body.push(WORK);
    }
    return this.spawnCreep(body, randomIdGenerator(), { memory: {role: 'dickHead', spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
}

StructureSpawn.prototype.createBalancer = function() {
    /*if (Object.keys(this.room.memory.forSpawning.defaultDir)>2) {
        let body = [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY];
        return this.spawnCreep(body, randomIdGenerator(), { memory: {role: 'balancer', spawnTime: 3*body.length, spawnedBy: this.id}, directions: [BOTTOM_RIGHT]});
    }
    else {*/
        let body = [CARRY, CARRY, MOVE, CARRY, CARRY, MOVE];
        if (this.room.terminal.store.energy>100000 && _.sum(this.room.terminal.store)>200000) {
            body = [CARRY, CARRY, MOVE, CARRY, CARRY, MOVE, CARRY, CARRY, MOVE, CARRY, CARRY, MOVE];
        }
        return this.spawnCreep(body, randomIdGenerator(), { memory: {role: 'balancer', spawnTime: 3*body.length, spawnedBy: this.id}, directions: this.getDefaultSpawningDir()});
    //}
}

StructureSpawn.prototype.createDriver = function(energy, path, purp, from, to) {
    var body = [];
    var NoCarryMoveParts = Math.floor((energy)/100);
    
    for (let i = 0; i < NoCarryMoveParts; i++) {
        body.push(CARRY);
        body.push(MOVE);
    }
    return this.spawnCreep(body, randomIdGenerator(), { memory: {role: 'driver', path: path, purp: purp, from: from, to: to, spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
}


StructureSpawn.prototype.createNoLegWorker = function(energy) {
    var body = [];
    var NoCarryMoveParts = Math.floor((energy-50)/100);

    for (let i = 0; i < NoCarryMoveParts; i++) {
        body.push(WORK);
    }
    
    body.push(CARRY);

    return this.spawnCreep(body, randomIdGenerator(), { memory: {role: 'noLegWorker', spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
}

StructureSpawn.prototype.createMapper = function(target) {
    var body = [MOVE];
    return this.spawnCreep(body, randomIdGenerator(), { memory: {role: 'mapper', target: target, spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
}

StructureSpawn.prototype.createSuperUpgrader = function(energyMax) {
    var body = [];
    body.push(CARRY);
    if (energyMax>5600) { // lvl 8
        for (let i = 0; i < 3; i++) {
            for (let i = 0; i < 5; i++) {
                body.push(WORK);
            }
            body.push(MOVE);
        }
    }
    else if (energyMax>=4650) { // lvl 7
        let NoCarryMoveParts = Math.floor((4650 - 100)/650);
        for (let i = 0; i < NoCarryMoveParts; i++) {
            for (let i = 0; i < 6; i++) {
                body.push(WORK);
            }
            body.push(MOVE);
        }
    }
    else if (energyMax<=550) {
        let NoCarryMoveParts = Math.floor((energyMax - 100)/100);
        for (let i = 0; i < NoCarryMoveParts; i++) {
                body.push(WORK);
        }
        body.push(MOVE);
    }
    else {
        let NoCarryMoveParts = Math.floor((energyMax - 100)/350);
        if (this.room.memory && this.room.memory.highways && this.room.memory.highways.upgrade && this.room.memory.highways.upgrade.path && this.room.memory.highways.upgrade.path.length>0) {
            if (this.room.memory.highways.upgrade.path.length>30) {
                NoCarryMoveParts = NoCarryMoveParts*(1-this.room.memory.highways.upgrade.path.length/100);
            }
        }
        /*if (energyMax<2600) { // lvl <7
            NoCarryMoveParts = Math.min(3, NoCarryMoveParts);
        }*/
        for (let i = 0; i < NoCarryMoveParts; i++) {
            body.push(WORK);
            body.push(WORK);
            body.push(WORK);
            body.push(MOVE);
        }
        body.push(MOVE);
    }
    return this.spawnCreep(body, randomIdGenerator(), { memory: {role: 'superUpgrader', working: false, spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
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

    return this.spawnCreep(body, randomIdGenerator(), { memory: {role: 'longDistanceHarvester', home: home, target: target, working: false, toCentre: false, spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
}

StructureSpawn.prototype.createStealer = function(energy, home, target, toTp, big=false, stc=undefined) {
    var body = [];
    
    if (big) {
        boostMats = ['XZHO2']; //, 'XKH2O'];
    
        for (let boostMat of boostMats) {
            cacheBoostLabs(this.room.name, boostMat);
        }
        for (let i = 0; i < 40; i++) {
            body.push(CARRY);
        }
        for (let i = 0; i < 10; i++) {
            body.push(MOVE);
        }
        return this.spawnCreep(body, randomIdGenerator(), { memory: {role: 'stealer', home: home, target: target, working: false, stc: stc, boosted: false, boostMats: boostMats, toTp: toTp, spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
    }
    else {
        var NoCarryMoveParts = Math.min(25, Math.floor((energy)/100));

        for (let i = 0; i < NoCarryMoveParts; i++) {
            body.push(CARRY);
            body.push(MOVE);
        }
        return this.spawnCreep(body, randomIdGenerator(), { memory: {role: 'stealer', home: home, target: target, working: false, stc: stc, toTp: toTp, spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
    }
}

StructureSpawn.prototype.createDragonAss = function(energy, home, target, big=false) {
    var body = [];
    
    if (big) {
        boostMats = ['XZHO2']; //, 'XKH2O'];
    
        for (let boostMat of boostMats) {
            cacheBoostLabs(this.room.name, boostMat);
        }
        for (let i = 0; i < 40; i++) {
            body.push(CARRY);
        }
        for (let i = 0; i < 10; i++) {
            body.push(MOVE);
        }
        return this.spawnCreep(body, randomIdGenerator(), { memory: {role: 'dragonAss', home: home, target: target, working: false, boosted: false, boostMats: boostMats, spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
    }
    else {
        var NoCarryMoveParts = Math.min(25, Math.floor((energy)/100));
        for (let i = 0; i < NoCarryMoveParts; i++) {
            body.push(CARRY);
            body.push(MOVE);
        }
        return this.spawnCreep(body, randomIdGenerator(), { memory: {role: 'dragonAss', home: home, target: target, working: false, spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
    }
}

StructureSpawn.prototype.createAsdpof = function(energy, home, target) {
    var body = [];
    var NoCarryMoveParts = Math.min(25, Math.floor((energy)/100));

    for (let i = 0; i < NoCarryMoveParts; i++) {
        body.push(CARRY);
        body.push(MOVE);
    }

    return this.spawnCreep(body, randomIdGenerator(), { memory: {role: 'asdpof', home: home, target: target, working: false, spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
}

StructureSpawn.prototype.createSacrificer = function(energy, home, target, toTp=energy) {
    var body = [];
    var NoCarryMoveParts = Math.min(25, Math.floor((energy)/100));

    for (let i = 0; i < NoCarryMoveParts; i++) {
        body.push(CARRY);
        body.push(MOVE);
    }

    return this.spawnCreep(body, randomIdGenerator(), { memory: {role: 'sacrificer', home: home, target: target, working: false, toTp: toTp, spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
}

StructureSpawn.prototype.createDrainer = function(energy, home, target) {
    var body = [];
    var NoCarryMoveParts = Math.min(25, Math.floor((energy)/100));

    for (let i = 0; i < NoCarryMoveParts; i++) {
        body.push(CARRY);
        body.push(MOVE);
    }

    return this.spawnCreep(body, randomIdGenerator(), { memory: {role: 'drainer', home: home, target: target, working: false, spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
}


StructureSpawn.prototype.createSeason2c = function(stp, home, target, size) {
    var body = [];
    var NoCarryMoveParts = 25; // Math.min(25, Math.floor((energy)/100));
    if (size != undefined) {
        NoCarryMoveParts = size;
    }
    for (let i = 0; i < NoCarryMoveParts; i++) {
        body.push(CARRY);
        body.push(MOVE);
    }

    return this.spawnCreep(body, randomIdGenerator(), { memory: {role: 'season2c', stp: stp, home: home, target: target, spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
}

StructureSpawn.prototype.createSeason2cPirate = function(stp, home, target) {
    var body = [];
    var NoCarryMoveParts = 10; // Math.min(25, Math.floor((energy)/100));
    var NoCarryAtkParts = 5; // Math.min(25, Math.floor((energy)/100));
    var NoCarryRatkParts = 4; // Math.min(25, Math.floor((energy)/100));
    for (let i = 0; i < NoCarryAtkParts; i++) {
        body.push(ATTACK);
    }
    for (let i = 0; i < NoCarryMoveParts; i++) {
        body.push(CARRY);
    }
    for (let i = 0; i < NoCarryRatkParts; i++) {
        body.push(RANGED_ATTACK);
    }
    for (let i = 0; i < NoCarryMoveParts; i++) {
        body.push(MOVE);
    }
    for (let i = 0; i < NoCarryAtkParts; i++) {
        body.push(MOVE);
    }
    for (let i = 0; i < NoCarryRatkParts; i++) {
        body.push(MOVE);
    }
    return this.spawnCreep(body, randomIdGenerator(), { memory: {role: 'season2cPirate', stp: stp, home: home, target: target, spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
}

StructureSpawn.prototype.createSeason2cnew = function(stp, home, target, size) {
    var body = [];
    var NoCarryMoveParts = 25; // Math.min(25, Math.floor((energy)/100));
    if (size != undefined) {
        NoCarryMoveParts = size;
    }
    for (let i = 0; i < NoCarryMoveParts; i++) {
        body.push(CARRY);
        body.push(MOVE);
    }

    return this.spawnCreep(body, randomIdGenerator(), { memory: {role: 'season2cnew', stp: stp, home: home, target: target, spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
}

StructureSpawn.prototype.createLongDistanceLorry = function(energy, home, target) {
    var body = [];
    let nobp = 0
    if (Game.rooms[home].memory.ECap>1800) {
        nobp = Math.floor((Game.rooms[home].memory.ECap-150)/200);
        nobp = Math.min(16, nobp)
        body.push(WORK);
        for (let i = 0; i < (nobp); i++) {
            body.push(CARRY);
            body.push(CARRY);
        }
        for (let i = 0; i < (nobp); i++) {
            body.push(MOVE);
        }
        body.push(MOVE);
    }
    else {
        if (Game.time % 4 == 0) {
            nobp = Math.floor((energy-150)/150);
            for (let i = 0; i < (nobp-1); i++) {
                body.push(CARRY);
                body.push(CARRY);
                body.push(MOVE);
            }
            body.push(WORK, MOVE);
            if (Game.rooms[home].memory.ECap>700) {
                body.push(CARRY, CARRY, MOVE);
            }
        }
        else {
            nobp = Math.floor((energy)/150);
            for (let i = 0; i < (nobp-1); i++) {
                body.push(CARRY);
                body.push(CARRY);
                body.push(MOVE);
            }
            if (Game.rooms[home].memory.ECap>1600) {
                body.push(WORK);
                body.push(MOVE);
            }
        }
    }

    return this.spawnCreep(body, randomIdGenerator(), { memory: {role: 'longDistanceLorry', home: home, target: target, working: false, toCentre: false, spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
}

StructureSpawn.prototype.createSymbolPicker = function(target, home, sybId, partsNo=undefined) {
    var body = [];
    var NoCarryMoveParts = Math.floor((Game.rooms[home].memory.ECap)/100);
    if (partsNo) {
        NoCarryMoveParts = partsNo;
    }
    else {
        NoCarryMoveParts = Math.min(25, NoCarryMoveParts);
    }
    for (let i = 0; i < (NoCarryMoveParts); i++) {
        body.push(CARRY);
    }
    for (let i = 0; i < (NoCarryMoveParts); i++) {
        body.push(MOVE);
    }
    return this.spawnCreep(body, randomIdGenerator(), { memory: {role: 'symbolPicker', home: home, target: target, working: false, sybId: sybId, spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
}

StructureSpawn.prototype.createSymbolFactorier = function() {
    var body = [CARRY, CARRY, MOVE, CARRY, CARRY, MOVE];
    return this.spawnCreep(body, randomIdGenerator(), { memory: {role: 'symbolFactorier', spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
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
    return this.spawnCreep(body, 'MrHelloer' + '_' + 'CNMB' + '_' + generateRandomStrings(), { memory: {role: 'begger', home: home, target: target, working: false, spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
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
    return this.spawnCreep(body, randomIdGenerator(), { memory: {role: 'longDistanceUpgrader', home: home, target: target, working: false, spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
}

StructureSpawn.prototype.createAttacker = function(target, home, uniqueString) {
    var body = [];
    var NoParts = Math.floor(Game.rooms[target].memory.ECap / 200);
    for (let i = 0; i < NoParts; i++) {
        body.push(RANGED_ATTACK);
    }
    for (let i = 0; i < NoParts; i++) {
        body.push(MOVE);
    }
    return this.spawnCreep(body, randomIdGenerator(), { memory: {role: 'attacker', target: target, home: home, uniqueString: uniqueString, spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
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

      return this.spawnCreep(body, randomIdGenerator(), { memory: {role: 'healer', target: target, boosted: boosted, spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
}

StructureSpawn.prototype.createControllerAttacker = function(target) {
    var body = [CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, MOVE];
    return this.spawnCreep(body, undefined, { memory: {role: 'controllerAttacker', target: target, spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
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

    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'teezer', target: target, home: home, preferredLocation: preferredLocation, spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
}

StructureSpawn.prototype.createScouter = function(scouterName, target) {
    return this.spawnCreep([MOVE], scouterName, { memory: {role: 'scouter', target: target, spawnTime: 3}, directions: this.getDefaultSpawningDir()});
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
    return this.spawnCreep(body, randomIdGenerator(), { memory: {role: 'longDistanceBuilder', target: target, home: home, working: false, spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
}

StructureSpawn.prototype.createPioneer = function(energy, target, home, superUpgrader, route) {
    var body = [];
    if (superUpgrader) {
        for (let i = 0; i < 24; i++) {
            body.push(WORK);
        }
        body.push(CARRY);
        for (let i = 0; i < 24; i++) {
            body.push(MOVE);
        }
    }
    else {
        var NoCarryMoveParts = Math.min(Math.floor(energy/250),12);

        for (let i = 0; i < NoCarryMoveParts; i++) {
            body.push(WORK);
        }
        for (let i = 0; i < NoCarryMoveParts; i++) {
            body.push(CARRY);
        }
        for (let i = 0; i < NoCarryMoveParts; i++) {
            body.push(MOVE);
            body.push(MOVE);
        }
    }
    return this.spawnCreep(body, randomIdGenerator(), { memory: {role: 'pioneer', target: target, home: home, working: false, spawnTime: 3*body.length, route: route}, directions: this.getDefaultSpawningDir()});
}

StructureSpawn.prototype.createClaimer = function(target, attack) {
  //return this.spawnCreep([WORK, CARRY, ATTACK, CLAIM, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], undefined, {role: 'claimer', target: target});
    let body = [CLAIM, MOVE, MOVE];
    if (this.room.energyCapacityAvailable<=600) {
        body = [CLAIM, MOVE];
    }
    else {
        if (this.room.energyCapacityAvailable>1000) {
            body = [MOVE, MOVE, MOVE, MOVE, MOVE, CLAIM];
        }
    }
    if (attack!=undefined) {
        let NoCarryMoveParts = Math.min(Math.floor(this.room.energyCapacityAvailable/700), 16);
        body = [];
        for (let i = 0; i < NoCarryMoveParts; i++) {
            body.push(CLAIM);
            body.push(MOVE, MOVE);
        }
    }
    return this.spawnCreep(body, randomIdGenerator(), { memory: {role: 'claimer', target: target, spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
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
    return this.spawnCreep(body, randomIdGenerator(), { memory: {role: 'reserver', target: target, spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
}

StructureSpawn.prototype.createMover = function (ifRescue, lvl=1) {
    let body = [];
    let level = this.room.controller.level;
    if (level == 8 || level == 7) {
        body = [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY];
    }
    else if (ifRescue) {
        body = [MOVE, CARRY];
    }
    else {
        body = [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY];
    }
    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'mover', ifRescue: ifRescue, spawnTime: 3 * body.length}, directions: this.getDefaultSpawningDir()});
}

StructureSpawn.prototype.createMiner = function(sourceID, target, RCL, ifMineEnergy, ifLink, ifKeeper, home, ifRescue, ifEarly) {
    let eCap = Game.rooms[home].memory.ECap;
    if (ifEarly) {
        if (!ifRescue){
            var NoCarryMoveParts = Math.min(Math.floor(eCap/100),5);
            let body = [];
            
            for (let i = 0; i < NoCarryMoveParts; i++) {
                body.push(WORK);
            }
            if (eCap>550) {
                body.push(CARRY);
            }
            else if (eCap>=650) {
                body.push(CARRY);
                body.push(WORK);
            }
            return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'miner', sourceID: sourceID, target: target, spawnTime: 3 * body.length, home: home , ifRescue: true, workingPos: {x: ifEarly.x, y: ifEarly.y}}, directions: this.getDefaultSpawningDir()});

        }
        else {
            let body = [WORK]
            return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'miner', sourceID: sourceID, target: target, spawnTime: 3 * body.length, home: home , ifRescue: true}, directions: this.getDefaultSpawningDir()});
        }
    }
    else {
        let body = [];
        if (ifMineEnergy) { // if mining energy
            if (ifKeeper) {
                body = [WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, WORK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
                return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'miner', sourceID: sourceID, target: target, spawnTime: 3 * body.length, home: home }, directions: this.getDefaultSpawningDir() });
            }
            else if (RCL == 0) { // if remote mining, run faster, more MOVE parts
                if (eCap<1700) {
                    var NoWorkParts = Math.min(Math.floor((eCap-200)/100), 5);
                    let body = [MOVE, CARRY, MOVE, MOVE];
                    for (let i = 0; i < NoWorkParts; i++) {
                        body.push(WORK);
                    }
                    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'miner', sourceID: sourceID, target: target, spawnTime: 3 * body.length, home: home }, directions: this.getDefaultSpawningDir() });
                }
                else {
                    let body = [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, WORK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
                    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'miner', sourceID: sourceID, target: target, spawnTime: 3 * body.length, home: home }, directions: this.getDefaultSpawningDir() });
                }
            }
            else { // current room miner, no need to move very fast
                if (ifLink) { // if link mining
                    if (RCL >= 7) {
                        body = [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, CARRY, MOVE, MOVE, MOVE];
                    }
                    else {
                        body = [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE];
                    }
                    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'miner', sourceID: sourceID, target: target, link: true, spawnTime: 3 * body.length, home: home }, directions: this.getDefaultSpawningDir() });
                }
                else {
                    body = [WORK, WORK, WORK, WORK, WORK, MOVE];
                    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'miner', sourceID: sourceID, target: target, link: false, spawnTime: 3 * body.length, home: home }, directions: this.getDefaultSpawningDir() });
                }
            }
        }
        else { // if mining minerals mine big!
            var NoCarryMoveParts = Math.min(16,Math.floor((Game.rooms[home].memory.ECap - 150) / 250));
            let body = [];
            for (let i = 0; i < NoCarryMoveParts; i++) {
                body.push(WORK);
                body.push(WORK);
            }
            for (let i = 0; i < NoCarryMoveParts; i++) {
                body.push(MOVE);
            }
            if (target) {
                body.push(HEAL);
            }
            else {
                body.push(WORK);
            }
            body.push(MOVE);

            return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'miner', sourceID: sourceID, target: target, spawnTime: 3 * body.length, home: home }, directions: this.getDefaultSpawningDir() });
        }
    }
}

StructureSpawn.prototype.createLorry = function(energy) {
    let body = [CARRY,CARRY,MOVE];
    return this.spawnCreep(body, randomIdGenerator(), { memory: {role: 'lorry', working: false, spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
}

StructureSpawn.prototype.createTraveller = function(target) {
    let body = [MOVE];
    return this.spawnCreep(body, randomIdGenerator(), { memory: {role: 'traveller', target: target, spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
}

StructureSpawn.prototype.createTransporter = function (mineralType, fromStorage) {
    var body = [];
    for (let i = 0; i < 4; i++) {
        body.push(MOVE);
        body.push(CARRY);
        body.push(CARRY);
    }
    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'transporter', resourceType: mineralType, working: false, fromStorage: fromStorage, spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
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

StructureSpawn.prototype.createRanger = function (target, home, rcl=undefined) {
    if (target == home) {
        if (rcl && rcl <= 3) {
            let body = [MOVE, ATTACK, MOVE, RANGED_ATTACK];
            return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'ranger', target: target, home: home, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
        }
        else {
            var NoCarryMoveParts = Math.min(4,Math.floor((Game.rooms[home].memory.ECap - 200) / 130));
            let body = [];
            for (let i = 0; i < NoCarryMoveParts; i++) {
                body.push(ATTACK);
                body.push(MOVE);
            }
            body.push(RANGED_ATTACK);
            body.push(MOVE);
            return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'ranger', target: target, home: home, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
        }
    }
    else {
        if (rcl && rcl <= 3 || Game.rooms[home].memory.ECap<900) {
            let body = [MOVE, ATTACK, MOVE, RANGED_ATTACK];
            return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'ranger', target: target, home: home, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
        }
        else {
            let body = [MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, RANGED_ATTACK];
            return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'ranger', target: target, home: home, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
        }
    }
}

StructureSpawn.prototype.createPowerSourceAttacker = function(target,name) {
    var body = [];

    for (let i = 0; i < 20; i++) {
        body.push(MOVE);
    }
    for (let i = 0; i < 20; i++) {
        body.push(ATTACK);
    }

    return this.spawnCreep(body, name, { memory: {role: 'powerSourceAttacker', target: target, home: this.room.name, spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
}

StructureSpawn.prototype.createPowerSourceHealer = function(target, toHeal) {
    var body = [];

    for (let i = 0; i < 25; i++) {
        body.push(MOVE);
    }
    for (let i = 0; i < 25; i++) {
        body.push(HEAL);
    }

    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'powerSourceHealer', target: target, home: this.room.name, toHeal: toHeal, spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
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

    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'powerSourceRanger', target: target, home: this.room.name, spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
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
    return this.spawnCreep(body, randomIdGenerator(), { memory: {role: 'powerSourceLorry', home: home, target: target, working: false, spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
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
        for (let i = 0; i < 24; i++) {
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
        body.push(MOVE);
    }
    return this.spawnCreep(body, randomIdGenerator(), { memory: {role: 'keeperLairMeleeKeeper', target: target, home: home, ranged: ranged, spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
}

StructureSpawn.prototype.createMelee = function(target, home) {
    var body = [];
    let eCap = Game.rooms[home].memory.ECap;
    
    var NoParts = Math.floor(eCap / 210);
    NoParts = Math.min(NoParts, 16);
    for (let i = 0; i < NoParts; i++) {
        body.push(ATTACK);
        body.push(ATTACK);
        body.push(MOVE);
    }
    
    return this.spawnCreep(body, randomIdGenerator(), { memory: {role: 'melee', target: target, home: home, spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
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

    return this.spawnCreep(body, name, { memory: {role: 'keeperLairInvaderAttacker', target: target, home: home, spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
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

    return this.spawnCreep(body, randomIdGenerator(), { memory: {role: 'keeperLairInvaderHealer', target: target, home: home, toHeal: toHeal, spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
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
    return this.spawnCreep(body, randomIdGenerator(), { memory: {role: 'keeperLairLorry', target: target, home: home, working: false, spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
}

StructureSpawn.prototype.createCaptain = function(groupName) {
      var body = [];

      for (let i = 0; i < 25; i++) {
          body.push(MOVE);
      }
      for (let i = 0; i < 25; i++) {
          body.push(ATTACK);
      }

      return this.spawnCreep(body, randomIdGenerator(), { memory: {role: 'captain', groupName: groupName, followed: false, ungrouped: true, spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
}

StructureSpawn.prototype.createFirstMate = function(groupName, boostMats) {
      var body = [];
      for (let i = 0; i < 25; i++) {
          body.push(MOVE);
      }
      for (let i = 0; i < 25; i++) {
          body.push(HEAL);
      }
      return this.spawnCreep(body, randomIdGenerator(), { memory: {role: 'firstMate', groupName: groupName, followed: false, ungrouped: true, boosted: false, boostMats: boostMats, spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
}

StructureSpawn.prototype.createCrew = function(groupName, boostMat) {
      var body = [];
      for (let i = 0; i < 25; i++) {
          body.push(MOVE);
      }
      for (let i = 0; i < 25; i++) {
          body.push(HEAL);
      }
      return this.spawnCreep(body, randomIdGenerator(), { memory: {role: 'crew', groupName: groupName, followed: false, ungrouped: true, boosted: false, boostMat: boostMat, spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
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
      return this.spawnCreep(body, randomIdGenerator(), { memory: {role: 'ultimateWorrior', target: target, boosted: false, spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
}

StructureSpawn.prototype.createKiter = function(target, home, lvl=6) {
    let body = [];
    boostMats = ['XZHO2', 'XLHO2', 'XKHO2', 'XGHO2'];
    
    for (let boostMat of boostMats) {
        cacheBoostLabs(this.room.name, boostMat);
    }
    
    if (lvl==8) { // lvl 8, 11t 6ra 9m 23h 1m 
        for (let i = 0; i < 11; i++) {
            body.push(TOUGH);
        }
        for (let i = 0; i < 6; i++) {
            body.push(RANGED_ATTACK);
        }
        for (let i = 0; i < 9; i++) {
            body.push(MOVE);
        }
        for (let i = 0; i < 23; i++) {
            body.push(HEAL);
        }
        body.push(MOVE);
    }
    else if (lvl==7) { // lvl 7, 6t 22ra 9m 12h 1m 
        for (let i = 0; i < 6; i++) {
            body.push(TOUGH);
        }
        for (let i = 0; i < 22; i++) {
            body.push(RANGED_ATTACK);
        }
        for (let i = 0; i < 9; i++) {
            body.push(MOVE);
        }
        for (let i = 0; i < 12; i++) {
            body.push(HEAL);
        }
        body.push(MOVE);
    }
    else {
        boostMats = [true];
        
        let protect = 1;
        let rt = 2;
        let noheal = 1;
        for (let i = 0; i < protect; i++) {
            body.push(TOUGH);
        }
        for (let i = 0; i < rt; i++) {
            body.push(RANGED_ATTACK);
        }
        for (let i = 0; i < rt; i++) {
            body.push(MOVE);
        }
        for (let i = 0; i < protect; i++) {
            body.push(MOVE);
        }
        for (let i = 0; i < noheal; i++) {
            body.push(MOVE);
            body.push(HEAL);
        }
        body.push(MOVE);
        body.push(HEAL);
    }
    return this.spawnCreep(body, randomIdGenerator(), { memory: {role: 'kiter', target: target, home: home, boostMats: boostMats, boosted: false, spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
}

StructureSpawn.prototype.createDismantler = function(target, boostMats, tarId=undefined, dry=undefined) {
      var body = [];
      if (boostMats == false) {
          for (let i = 0; i < 5; i++) {
              body.push(WORK);
          }
          for (let i = 0; i < 5; i++) {
              body.push(MOVE);
          }
          body.push(CARRY);
      }
      else if (boostMats.includes('XZHO2')) {
          for (let boostMat of boostMats) {
              cacheBoostLabs(this.room.name, boostMat);
          }
          let energy = this.room.energyCapacityAvailable;
          let NoParts = Math.min(Math.floor(energy / 450), 10);
          for (let i = 0; i < NoParts; i++) {
              body.push(WORK);
              body.push(WORK);
              body.push(WORK);
              body.push(WORK);
          }
          for (let i = 0; i < NoParts; i++) {
              body.push(MOVE);
          }
      }
      else if (boostMats.length == 2) {
          // prepare for the boost lab
          for (let boostMat of boostMats) {
              cacheBoostLabs(this.room.name, boostMat);
          }
          for (let i = 0; i < 32; i++) {
              body.push(WORK);
          }
          for (let i = 0; i < 16; i++) {
              body.push(MOVE);
          }
          body.push(WORK);
          body.push(MOVE);
      }
      else {
          let energy = this.room.energyCapacityAvailable;
          let NoParts = Math.min(Math.floor(energy / 150), 25);
          for (let i = 0; i < NoParts; i++) {
              body.push(WORK);
          }
          for (let i = 0; i < NoParts; i++) {
              body.push(MOVE);
          }
      }
      if (dry) {
          body = [WORK, MOVE];
      }
      return this.spawnCreep(body, randomIdGenerator(), { memory: {role: 'dismantler', target: target, boosted: false, boostMats: boostMats, tarId: tarId, spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
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

      return this.spawnCreep(body, randomIdGenerator(), { memory: {role: 'ultimateUpgrader', boosted: boosted, spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
}

StructureSpawn.prototype.createWanderer = function(target) {
      var body = [MOVE];
      return this.spawnCreep(body, randomIdGenerator(), { memory: {role: 'wanderer', target: target}, directions: this.getDefaultSpawningDir()});
}

StructureSpawn.prototype.createOneWayInterSharder = function(targetShardName, portalRoomName, portalId, targetRoomName, roleWillBe, body, route) {
    return this.spawnCreep(body, targetShardName + '_' + targetRoomName + '_' + roleWillBe + '_' + generateRandomStrings() + '_' + JSON.stringify(route), {memory: {role: 'oneWayInterSharder', targetShardName: targetShardName, portalRoomName: portalRoomName, portalId: portalId, targetRoomName: targetRoomName, roleWillBe: roleWillBe, spawnTime: 3*body.length}, directions: this.getDefaultSpawningDir()});
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
    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'portalTransporter', portalRoomName: portalRoomName, parsedMemoryAfterTeleportation: parsedMemoryAfterTeleportation }, directions: this.getDefaultSpawningDir()});
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
    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'onlyMineralDefender', target: target, home: home, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir()});
}

StructureSpawn.prototype.createOnlyMineralMiner = function (target, home) {
    var body = [];
    for (let i = 0; i < 18; i++) {
        body.push(WORK);
    }
    for (let i = 0; i < 14; i++) {
        body.push(CARRY);
    }
    for (let i = 0; i < 18; i++) {
        body.push(MOVE);
    }
    
    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'onlyMineralMiner', target: target, home: home, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir()});
}

StructureSpawn.prototype.createOnlyMineralHauler = function (target, home) {
    var body = [];
    for (let i = 0; i < 14; i++) {
        body.push(CARRY);
    }
    for (let i = 0; i < 14; i++) {
        body.push(MOVE);
    }
    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'onlyMineralHauler', target: target, home: home, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir()});
}

StructureSpawn.prototype.createRedneck = function (target, home) {
    var body = [];
    var NoParts = Math.floor(Game.rooms[target].memory.ECap / (80*2+50));
    if (NoParts>16){
        NoParts = 16;
    } 
    for (let i = 0; i < NoParts; i++) {
        body.push(MOVE);
    }
    for (let i = 0; i < NoParts; i++) {
        body.push(ATTACK);
        body.push(ATTACK);
    }
    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'redneck', target: target, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
}