require('myFunctions');

StructureSpawn.prototype.getDefaultSpawningDir = function () {
    if (this.room.memory.forSpawning && this.room.memory.forSpawning.defaultDir == undefined) {
        this.room.memory.forSpawning.defaultDir = {};
    }
    else if (this.room.memory.forSpawning.defaultDir[this.id]) {
        return this.room.memory.forSpawning.defaultDir[this.id]
    }
    else {
        if (this.room.memory.newBunker && this.room.memory.newBunker.orient) {
            if (this.room.memory.newBunker.orient == 'L') {
                this.room.memory.forSpawning.defaultDir[this.id] = [LEFT];
            }
            else if (this.room.memory.newBunker.orient == 'U') {
                this.room.memory.forSpawning.defaultDir[this.id] = [TOP];
            }
            else if (this.room.memory.newBunker.orient == 'D') {
                this.room.memory.forSpawning.defaultDir[this.id] = [BOTTOM];
            }
            else if (this.room.memory.newBunker.orient == 'R') {
                this.room.memory.forSpawning.defaultDir[this.id] = [RIGHT];
            }
            else {
                fo('prototype spawn spawning direction wrong')
            }
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
}

StructureSpawn.prototype.createCustomCreep = function (energy, roleName, home) {
    energy = this.room.energyCapacityAvailable;
    //console.log(home)
    let r = this.room;
    if ((roleName == 'lorry') || (roleName == 'pickuper') || (roleName == 'labber') || (roleName == 'scientist') || (roleName == 'linkKeeper' && !(r.memory.newBunker && r.memory.newBunker.layout && r.memory.newBunker.layout.recCtn && r.memory.newBunker.layout.recCtn.length>0))) {
        var NoParts = Math.floor(energy / 150);
        // var NoParts = Math.floor(Math.min(energy, this.room.energyAvailable) / 150);
        if (NoParts > 8) {
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
        if (roleName == 'lorry' && Game.cpu.bucket<6000 && (this.room.controller.level == 7 || this.room.controller.level == 6)) {
            body = [];
            for (let i = 0; i < NoParts; i++) {
                body.push(MOVE);
                body.push(CARRY);
                body.push(CARRY);
                body.push(MOVE);
                body.push(CARRY);
                body.push(CARRY);
            }
        }
        //console.log(energy, roleName, home,body);
        let idn = false;
        if (roleName == 'linkKeeper') {
            idn = true;
        }
        return this.spawnCreep(body, randomIdGenerator(), { memory: { role: roleName, working: false, target: home, isNeeded: idn, in: true, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
    }
    else if (roleName == 'linkKeeper') {
        var body = [CARRY, CARRY, CARRY, CARRY];
        if (this.room.controller.level>6) {
            body = [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY];
        }
        let sp = r.memory.newBunker.setPoint;
        let clock = r.memory.newBunker.STclock;
        let ori = r.memory.newBunker.orient;
        let wp = {};
        if (ori == 'L') {
            if (clock == true) {
                wp.x = sp.x - 1;
                wp.y = sp.y + 1;
            }
            else {
                wp.x = sp.x - 1;
                wp.y = sp.y - 1;
            }
        }
        else if (ori == 'U') {
            if (clock == true) {
                wp.x = sp.x - 1;
                wp.y = sp.y - 1;
            }
            else {
                wp.x = sp.x + 1;
                wp.y = sp.y - 1;
            }
        }
        else if (ori == 'D') {
            if (clock == true) {
                wp.x = sp.x + 1;
                wp.y = sp.y + 1;
            }
            else {
                wp.x = sp.x - 1;
                wp.y = sp.y + 1;
            }
        }
        else if (ori == 'R') {
            if (clock == true) {
                wp.x = sp.x + 1;
                wp.y = sp.y - 1;
            }
            else {
                wp.x = sp.x + 1;
                wp.y = sp.y + 1;
            }
        }
        else {
            fo('prototype spawn wrong baby setter position')
        }
        return this.spawnCreep(body, randomIdGenerator(), { memory: { role: roleName, working: false, target: home, isNeeded: true, spawnTime: 3 * body.length }, directions: [this.pos.getDirectionTo(wp.x, wp.y)] });
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
        var NoParts = Math.max(1, Math.floor(energy / 50));
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
        var NoParts = Math.floor(this.room.energyCapacityAvailable / 200);
        if (NoParts > 16) {
            NoParts = 16;
        }

        body = [];
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
        return this.spawnCreep(body, randomIdGenerator(), { memory: { role: roleName, working: false, target: home, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
    }
    else { // harvester, upgrader, builde etc... WORK CARRY MOVE creeps
        let boosted = true;
        let boostMats = undefined;
        
        if (roleName=='wallRepairer') {
            if (this.room.memory.nuked || this.room.memory.battleMode) {
                boosted = false;
                boostMats = ['LH'];
            }
        }
        
        var NoParts = Math.floor(energy / 200);
        if (NoParts > 16) {
            NoParts = 16;
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
        return this.spawnCreep(body, randomIdGenerator(), { memory: { role: roleName, working: false, boosted: boosted, boostMats: boostMats, target: home, home: home, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
    }
}

StructureSpawn.prototype.createMaintainer = function (posiNum) {
    var body = [CARRY, CARRY];
    if (posiNum==6 && this.room.memory.mineralThresholds && this.room.memory.mineralThresholds.currentMineralStats.power>10000) {
        body = [CARRY, CARRY, CARRY, CARRY];
    }
    let spDir = [undefined, [BOTTOM_LEFT], [TOP_LEFT], [TOP_RIGHT], [TOP_LEFT], [TOP_RIGHT], [BOTTOM_RIGHT]];
    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'maintainer', spawnTime: 3 * body.length, isNeeded: true, posiNum: posiNum, spawnedBy: this.id }, directions: spDir[posiNum] });
}

StructureSpawn.prototype.createAnnoyer = function (trn, hrn) {
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
    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'annoyer', home: hrn, target: trn, spawnTime: 3 * body.length, spawnedBy: this.id }, directions: this.getDefaultSpawningDir() });
}

StructureSpawn.prototype.createLoader = function (energy) {
    var body = [];
    var NoCarryMoveParts = Math.floor((energy) / 100);
    NoCarryMoveParts = Math.min(4, NoCarryMoveParts)

    for (let i = 0; i < NoCarryMoveParts; i++) {
        body.push(CARRY);
        body.push(MOVE);
    }
    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'loader', spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
}

StructureSpawn.prototype.createRecCtner = function (extIds) {
    var body = [WORK];
    if (extIds.length==1) {
        body = [MOVE];
    }
    let exts = [];
    for (let extId of extIds) {
        exts.push(Game.getObjectById(extId));
    }
    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'recCtner', spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir(), energyStructures: exts });
}

StructureSpawn.prototype.createTester = function () {
    var body = [];

    for (let i = 0; i < 1; i++) {
        body.push(WORK);
    }
    for (let i = 0; i < 1; i++) {
        body.push(MOVE);
    }
    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'tester', boosted: false, boostMats: ['ZH'], spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
}

StructureSpawn.prototype.createQuads = function (target, quadsId, ifLead, us, dry = 8) {
    var body = [];
    //var NoCarryMoveParts = Math.floor((energy)/100);
    let NoCarryMoveParts = 6; //Math.min(4, NoCarryMoveParts)
    
    if (dry == 0) {
        let commonName = us;
        let noparts = 1;
        let nohealparts = 1;
        //boosted = false;
        //boostMats = ['XLHO2'];
        
        if (ifLead == 1) {
            for (let i = 0; i < noparts; i++) {
                body.push(RANGED_ATTACK);
            }
            for (let i = 0; i < noparts; i++) {
                body.push(MOVE);
            }
            return this.spawnCreep(body, 1+commonName, { memory: { role: 'quads', target: target, ln: undefined, fn: 2+commonName, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: [true], spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
        }

        if (ifLead == 2) {
            for (let i = 0; i < noparts; i++) {
                body.push(RANGED_ATTACK);
            }
            for (let i = 0; i < noparts; i++) {
                body.push(MOVE);
            }
            return this.spawnCreep(body, 2+commonName, { memory: { role: 'quads', target: target, ln: 1+commonName, fn: 3+commonName, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: [true, true], spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
        }

        if (ifLead == 3) {
            for (let i = 0; i < noparts; i++) {
                body.push(RANGED_ATTACK);
            }
            for (let i = 0; i < noparts; i++) {
                body.push(MOVE);
            }
            return this.spawnCreep(body, 3+commonName, { memory: { role: 'quads', target: target, ln: 2+commonName, fn: 4+commonName, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: [true], spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
        }

        if (ifLead == 4) {
            for (let i = 0; i < noparts; i++) {
                body.push(RANGED_ATTACK);
            }
            for (let i = 0; i < noparts; i++) {
                body.push(MOVE);
            }
            return this.spawnCreep(body, 4+commonName, { memory: { role: 'quads', target: target, ln: 3+commonName, fn: undefined, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: [true], spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
        }
    }
    else if (dry == 1) {
        let commonName = us;
        let noparts = 20;
        let nohealparts = 12;
        //boosted = false;
        //boostMats = ['XLHO2'];
        
        if (ifLead == 1) {
            for (let i = 0; i < noparts; i++) {
                body.push(WORK);
            }
            for (let i = 0; i < noparts; i++) {
                body.push(MOVE);
            }
            return this.spawnCreep(body, 1+commonName, { memory: { role: 'quads', target: target, ln: undefined, fn: 2+commonName, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: [true], spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
        }

        if (ifLead == 2) {
            for (let i = 0; i < noparts; i++) {
                body.push(ATTACK);
            }
            for (let i = 0; i < noparts; i++) {
                body.push(MOVE);
            }
            return this.spawnCreep(body, 2+commonName, { memory: { role: 'quads', target: target, ln: 1+commonName, fn: 3+commonName, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: [true, true], spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
        }

        if (ifLead == 3) {
            for (let i = 0; i < nohealparts-1; i++) {
                body.push(MOVE);
            }
            body.push(MOVE);
            body.push(MOVE);
            body.push(RANGED_ATTACK);
            body.push(RANGED_ATTACK);
            for (let i = 0; i < nohealparts; i++) {
                body.push(HEAL);
            }
            body.push(MOVE);
            return this.spawnCreep(body, 3+commonName, { memory: { role: 'quads', target: target, ln: 2+commonName, fn: 4+commonName, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: [true], spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
        }

        if (ifLead == 4) {
            for (let i = 0; i < nohealparts-1; i++) {
                body.push(MOVE);
            }
            body.push(MOVE);
            body.push(MOVE);
            body.push(RANGED_ATTACK);
            body.push(RANGED_ATTACK);
            for (let i = 0; i < nohealparts; i++) {
                body.push(HEAL);
            }
            body.push(MOVE);
            return this.spawnCreep(body, 4+commonName, { memory: { role: 'quads', target: target, ln: 3+commonName, fn: undefined, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: [true], spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
        }
    }
    else if (dry == 'x') {
        let commonName = us;
        let noparts = 25;
        let nohealparts = 20;
        boosted = false;
        boostMats = [true];
        let spres = undefined;
        
        if (ifLead == 1) {
            for (let i = 0; i < 50-noparts*2; i++) {
                body.push(TOUGH);
            }
            for (let i = 0; i < noparts; i++) {
                body.push(WORK);
            }
            for (let i = 0; i < noparts; i++) {
                body.push(MOVE);
            }
            boostMats = ['ZHO2', 'ZH2O', 'GHO2'];
            boostMats = ['ZHO2', 'ZH2O'];
            spres =  this.spawnCreep(body, 1+commonName, { memory: { role: 'quads', target: target, ln: undefined, fn: 2+commonName, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: boostMats, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
        }

        if (ifLead == 2) {
            for (let i = 0; i < 50-noparts*2; i++) {
                body.push(TOUGH);
            }
            for (let i = 0; i < noparts; i++) {
                body.push(WORK);
            }
            for (let i = 0; i < noparts; i++) {
                body.push(MOVE);
            }
            boostMats = ['ZHO2', 'UH2O', 'GHO2'];
            boostMats = ['ZHO2', 'ZH2O'];
            spres = this.spawnCreep(body, 2+commonName, { memory: { role: 'quads', target: target, ln: 1+commonName, fn: 3+commonName, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: boostMats, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
        }

        if (ifLead == 3 || ifLead == 4) {
            for (let i = 0; i < 10; i++) {
                body.push(RANGED_ATTACK);
            }
            for (let i = 0; i < 0; i++) {
                body.push(TOUGH);
            }
            for (let i = 0; i < nohealparts-1; i++) {
                body.push(MOVE);
            }
            for (let i = 0; i < nohealparts; i++) {
                body.push(HEAL);
            }
            body.push(MOVE);
            boostMats = ['ZHO2', 'LHO2'];
            if (ifLead==3) {
                spres = this.spawnCreep(body, 3+commonName, { memory: { role: 'quads', target: target, ln: 2+commonName, fn: 4+commonName, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: boostMats, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
            }
            else {
                spres = this.spawnCreep(body, 4+commonName, { memory: { role: 'quads', target: target, ln: 3+commonName, fn: undefined, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: boostMats, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
            }
        }
        if (spres == OK) {
            if (boostMats.length>0) {
                for (let boostMat of boostMats) {
                    if (boostMat!==undefined && boostMat!==true) {
                        cacheBoostLabs(this.room.name, boostMat);
                    }
                }
            }
        }
        return spres
    }
    else if (dry == 'xs') { // t2 yellow green on swamp
        let commonName = us;
        boosted = false;
        boostMats = [true];
        let spres = undefined;
        
        if (ifLead == 1) {
            for (let i = 0; i < 15; i++) {
                body.push(MOVE);
            }
            for (let i = 0; i < 27; i++) {
                body.push(WORK);
            }
            for (let i = 0; i < 8; i++) {
                body.push(MOVE);
            }
            boostMats = ['ZHO2', 'ZH2O'];
            spres =  this.spawnCreep(body, 1+commonName, { memory: { role: 'quads', target: target, ln: undefined, fn: 2+commonName, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: boostMats, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
        }

        if (ifLead == 2) {
            for (let i = 0; i < 15; i++) {
                body.push(MOVE);
            }
            for (let i = 0; i < 27; i++) {
                body.push(WORK);
            }
            for (let i = 0; i < 8; i++) {
                body.push(MOVE);
            }
            boostMats = ['ZHO2', 'ZH2O'];
            spres = this.spawnCreep(body, 2+commonName, { memory: { role: 'quads', target: target, ln: 1+commonName, fn: 3+commonName, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: boostMats, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
        }

        if (ifLead == 3 || ifLead == 4) {
            for (let i = 0; i < 23-1; i++) {
                body.push(MOVE);
            }
            for (let i = 0; i < 27; i++) {
                body.push(HEAL);
            }
            body.push(MOVE);
            boostMats = ['ZHO2', 'LHO2'];
            if (ifLead==3) {
                spres = this.spawnCreep(body, 3+commonName, { memory: { role: 'quads', target: target, ln: 2+commonName, fn: 4+commonName, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: boostMats, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
            }
            else {
                spres = this.spawnCreep(body, 4+commonName, { memory: { role: 'quads', target: target, ln: 3+commonName, fn: undefined, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: boostMats, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
            }
        }
        if (spres == OK) {
            if (boostMats.length>0) {
                for (let boostMat of boostMats) {
                    if (boostMat!==undefined && boostMat!==true) {
                        cacheBoostLabs(this.room.name, boostMat);
                    }
                }
            }
        }
        return spres
    }
    else if (dry == 'x-') { // t2 litte yellow green on swamp
        let commonName = us;
        boosted = false;
        boostMats = [true];
        let spres = undefined;
        
        if (ifLead == 1) {
            for (let i = 0; i < 15; i++) {
                body.push(MOVE);
            }
            for (let i = 0; i < 10; i++) {
                body.push(WORK);
            }
            boostMats = ['ZH2O'];
            spres =  this.spawnCreep(body, 1+commonName, { memory: { role: 'quads', target: target, ln: undefined, fn: 2+commonName, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: boostMats, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
        }

        if (ifLead == 2) {
            for (let i = 0; i < 15; i++) {
                body.push(MOVE);
            }
            for (let i = 0; i < 10; i++) {
                body.push(WORK);
            }
            boostMats = ['ZH2O'];
            spres = this.spawnCreep(body, 2+commonName, { memory: { role: 'quads', target: target, ln: 1+commonName, fn: 3+commonName, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: boostMats, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
        }

        if (ifLead == 3 || ifLead == 4) {
            for (let i = 0; i < 26; i++) {
                body.push(MOVE);
            }
            for (let i = 0; i < 17; i++) {
                body.push(HEAL);
            }
            boostMats = ['LHO2'];
            if (ifLead==3) {
                spres = this.spawnCreep(body, 3+commonName, { memory: { role: 'quads', target: target, ln: 2+commonName, fn: 4+commonName, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: boostMats, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
            }
            else {
                spres = this.spawnCreep(body, 4+commonName, { memory: { role: 'quads', target: target, ln: 3+commonName, fn: undefined, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: boostMats, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
            }
        }
        if (spres == OK) {
            if (boostMats.length>0) {
                for (let boostMat of boostMats) {
                    if (boostMat!==undefined && boostMat!==true) {
                        cacheBoostLabs(this.room.name, boostMat);
                    }
                }
            }
        }
        return spres
    }
    else if (dry == 'wr') {
        let commonName = us;
        let noparts = 25;
        let nohealparts = 20;
        boosted = false;
        boostMats = [true];
        let spres = undefined;
        
        if (ifLead == 1) {
            for (let i = 0; i < 50-noparts*2; i++) {
                body.push(TOUGH);
            }
            for (let i = 0; i < noparts; i++) {
                body.push(WORK);
            }
            for (let i = 0; i < noparts; i++) {
                body.push(MOVE);
            }
            boostMats = ['ZHO2', 'ZH2O'];
            spres =  this.spawnCreep(body, 1+commonName, { memory: { role: 'quads', target: target, ln: undefined, fn: 2+commonName, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: boostMats, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
        }

        if (ifLead == 2 || ifLead == 3 || ifLead == 4) {
            for (let i = 0; i < 10; i++) {
                body.push(RANGED_ATTACK);
            }
            for (let i = 0; i < 0; i++) {
                body.push(TOUGH);
            }
            for (let i = 0; i < nohealparts-1; i++) {
                body.push(MOVE);
            }
            for (let i = 0; i < nohealparts; i++) {
                body.push(HEAL);
            }
            body.push(MOVE);
            boostMats = ['ZHO2', 'LHO2', 'KHO2'];
            if (ifLead==2) {
                spres = this.spawnCreep(body, 2+commonName, { memory: { role: 'quads', target: target, ln: 1+commonName, fn: 3+commonName, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: boostMats, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
            }
            else if (ifLead==3) {
                spres = this.spawnCreep(body, 3+commonName, { memory: { role: 'quads', target: target, ln: 2+commonName, fn: 4+commonName, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: boostMats, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
            }
            else if (ifLead==4) {
                spres = this.spawnCreep(body, 4+commonName, { memory: { role: 'quads', target: target, ln: 3+commonName, fn: undefined, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: boostMats, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
            }
        }
        if (spres == OK) {
            if (boostMats.length>0) {
                for (let boostMat of boostMats) {
                    if (boostMat!==undefined && boostMat!==true) {
                        cacheBoostLabs(this.room.name, boostMat);
                    }
                }
            }
        }
        return spres
    }
    else if (dry == 'r-') {
        let commonName = us;
        let noparts = 25;
        let nohealparts = 20;
        boosted = true;
        boostMats = [true];
        let spres = undefined;
        
        if (ifLead == 1) {
            for (let i = 0; i < 7; i++) {
                body.push(RANGED_ATTACK);
            }
            for (let i = 0; i < 19; i++) {
                body.push(MOVE);
            }
            for (let i = 0; i < 13; i++) {
                body.push(HEAL);
            }
            body.push(MOVE);
            spres =  this.spawnCreep(body, 1+commonName, { memory: { role: 'quads', target: target, ln: undefined, fn: 2+commonName, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: boostMats, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
        }

        if (ifLead == 2) {
            for (let i = 0; i < 7; i++) {
                body.push(RANGED_ATTACK);
            }
            for (let i = 0; i < 19; i++) {
                body.push(MOVE);
            }
            for (let i = 0; i < 13; i++) {
                body.push(HEAL);
            }
            body.push(MOVE);
            spres = this.spawnCreep(body, 2+commonName, { memory: { role: 'quads', target: target, ln: 1+commonName, fn: 3+commonName, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: boostMats, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
        }

        if (ifLead == 3 || ifLead == 4) {
            for (let i = 0; i < 7; i++) {
                body.push(RANGED_ATTACK);
            }
            for (let i = 0; i < 19; i++) {
                body.push(MOVE);
            }
            for (let i = 0; i < 13; i++) {
                body.push(HEAL);
            }
            body.push(MOVE);
            if (ifLead==3) {
                //boostMats = ['LHO2'];
                spres = this.spawnCreep(body, 3+commonName, { memory: { role: 'quads', target: target, ln: 2+commonName, fn: 4+commonName, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: boostMats, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
            }
            else {
                spres = this.spawnCreep(body, 4+commonName, { memory: { role: 'quads', target: target, ln: 3+commonName, fn: undefined, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: boostMats, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
            }
        }
        if (spres == OK) {
            if (boostMats.length>0) {
                for (let boostMat of boostMats) {
                    if (boostMat!==undefined && boostMat!==true) {
                        cacheBoostLabs(this.room.name, boostMat);
                    }
                }
            }
        }
        return spres
    }
    else if (dry == 'rt1') {
        let commonName = us;
        let noparts = 25;
        let nohealparts = 20;
        boosted = true;
        boostMats = [true];
        let spres = undefined;
        
        if (ifLead == 1) {
            for (let i = 0; i < 2; i++) {
                body.push(RANGED_ATTACK);
            }
            for (let i = 0; i < 10; i++) {
                body.push(RANGED_ATTACK);
            }
            for (let i = 0; i < 24; i++) {
                body.push(MOVE);
            }
            for (let i = 0; i < 13; i++) {
                body.push(HEAL);
            }
            body.push(MOVE);
            //boostMats = ['GHO2'];
            spres =  this.spawnCreep(body, 1+commonName, { memory: { role: 'quads', target: target, ln: undefined, fn: 2+commonName, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: boostMats, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
        }

        if (ifLead == 2) {
            for (let i = 0; i < 2; i++) {
                body.push(RANGED_ATTACK);
            }
            for (let i = 0; i < 10; i++) {
                body.push(RANGED_ATTACK);
            }
            for (let i = 0; i < 24; i++) {
                body.push(MOVE);
            }
            for (let i = 0; i < 13; i++) {
                body.push(HEAL);
            }
            body.push(MOVE);
            //boostMats = ['GHO2'];
            spres = this.spawnCreep(body, 2+commonName, { memory: { role: 'quads', target: target, ln: 1+commonName, fn: 3+commonName, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: boostMats, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
        }

        if (ifLead == 3 || ifLead == 4) {
            for (let i = 0; i < 2; i++) {
                body.push(RANGED_ATTACK);
            }
            for (let i = 0; i < 10; i++) {
                body.push(RANGED_ATTACK);
            }
            for (let i = 0; i < 24; i++) {
                body.push(MOVE);
            }
            for (let i = 0; i < 13; i++) {
                body.push(HEAL);
            }
            body.push(MOVE);
            //boostMats = ['GHO2'];
            if (ifLead==3) {
                //boostMats = ['LHO2'];
                spres = this.spawnCreep(body, 3+commonName, { memory: { role: 'quads', target: target, ln: 2+commonName, fn: 4+commonName, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: boostMats, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
            }
            else {
                spres = this.spawnCreep(body, 4+commonName, { memory: { role: 'quads', target: target, ln: 3+commonName, fn: undefined, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: boostMats, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
            }
        }
        if (spres == OK) {
            if (boostMats.length>0) {
                for (let boostMat of boostMats) {
                    if (boostMat!==undefined && boostMat!==true) {
                        cacheBoostLabs(this.room.name, boostMat);
                    }
                }
            }
        }
        return spres
    }
    else if (dry == 'r') {
        let commonName = us;
        let noparts = 25;
        let nohealparts = 20;
        boosted = true;
        boostMats = [true];
        let spres = undefined;
        
        if (ifLead == 1) {
            for (let i = 0; i < 5; i++) {
                body.push(RANGED_ATTACK);
            }
            for (let i = 0; i < 24; i++) {
                body.push(MOVE);
            }
            for (let i = 0; i < 20; i++) {
                body.push(HEAL);
            }
            body.push(MOVE);
            spres =  this.spawnCreep(body, 1+commonName, { memory: { role: 'quads', target: target, ln: undefined, fn: 2+commonName, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: boostMats, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
        }

        if (ifLead == 2) {
            for (let i = 0; i < 5; i++) {
                body.push(RANGED_ATTACK);
            }
            for (let i = 0; i < 24; i++) {
                body.push(MOVE);
            }
            for (let i = 0; i < 20; i++) {
                body.push(HEAL);
            }
            body.push(MOVE);
            spres = this.spawnCreep(body, 2+commonName, { memory: { role: 'quads', target: target, ln: 1+commonName, fn: 3+commonName, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: boostMats, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
        }

        if (ifLead == 3 || ifLead == 4) {
            for (let i = 0; i < 5; i++) {
                body.push(RANGED_ATTACK);
            }
            for (let i = 0; i < 24; i++) {
                body.push(MOVE);
            }
            for (let i = 0; i < 20; i++) {
                body.push(HEAL);
            }
            body.push(MOVE);
            if (ifLead==3) {
                //boostMats = ['LHO2'];
                spres = this.spawnCreep(body, 3+commonName, { memory: { role: 'quads', target: target, ln: 2+commonName, fn: 4+commonName, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: boostMats, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
            }
            else {
                spres = this.spawnCreep(body, 4+commonName, { memory: { role: 'quads', target: target, ln: 3+commonName, fn: undefined, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: boostMats, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
            }
        }
        if (spres == OK) {
            if (boostMats.length>0) {
                for (let boostMat of boostMats) {
                    if (boostMat!==undefined && boostMat!==true) {
                        cacheBoostLabs(this.room.name, boostMat);
                    }
                }
            }
        }
        return spres
    }
    else if (dry == 'rt') {
        let commonName = us;
        boosted = true;
        boostMats = [true];
        let spres = undefined;
        
        if (ifLead == 1) {
            for (let i = 0; i < 5; i++) {
                body.push(TOUGH);
            }
            for (let i = 0; i < 5; i++) {
                body.push(MOVE);
            }
            for (let i = 0; i < 8; i++) {
                body.push(RANGED_ATTACK);
            }
            for (let i = 0; i < 17; i++) {
                body.push(MOVE);
            }
            for (let i = 0; i < 14; i++) {
                body.push(HEAL);
            }
            body.push(MOVE);
            boostMats = ['ZHO2', 'GHO2', 'LHO2', 'KHO2'];
            spres =  this.spawnCreep(body, 1+commonName, { memory: { role: 'quads', target: target, ln: undefined, fn: 2+commonName, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: boostMats, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
        }

        if (ifLead == 2) {
            for (let i = 0; i < 5; i++) {
                body.push(TOUGH);
            }
            for (let i = 0; i < 5; i++) {
                body.push(MOVE);
            }
            for (let i = 0; i < 8; i++) {
                body.push(RANGED_ATTACK);
            }
            for (let i = 0; i < 17; i++) {
                body.push(MOVE);
            }
            for (let i = 0; i < 14; i++) {
                body.push(HEAL);
            }
            body.push(MOVE);
            boostMats = ['ZHO2', 'GHO2', 'LHO2', 'KHO2'];
            spres = this.spawnCreep(body, 2+commonName, { memory: { role: 'quads', target: target, ln: 1+commonName, fn: 3+commonName, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: boostMats, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
        }

        if (ifLead == 3 || ifLead == 4) {
            for (let i = 0; i < 5; i++) {
                body.push(TOUGH);
            }
            for (let i = 0; i < 5; i++) {
                body.push(MOVE);
            }
            for (let i = 0; i < 8; i++) {
                body.push(RANGED_ATTACK);
            }
            for (let i = 0; i < 17; i++) {
                body.push(MOVE);
            }
            for (let i = 0; i < 14; i++) {
                body.push(HEAL);
            }
            body.push(MOVE);
            boostMats = ['ZHO2', 'GHO2', 'LHO2', 'KHO2'];
            if (ifLead==3) {
                spres = this.spawnCreep(body, 3+commonName, { memory: { role: 'quads', target: target, ln: 2+commonName, fn: 4+commonName, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: boostMats, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
            }
            else {
                spres = this.spawnCreep(body, 4+commonName, { memory: { role: 'quads', target: target, ln: 3+commonName, fn: undefined, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: boostMats, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
            }
        }
        if (spres == OK) {
            if (boostMats.length>0) {
                for (let boostMat of boostMats) {
                    if (boostMat!==undefined && boostMat!==true) {
                        cacheBoostLabs(this.room.name, boostMat);
                    }
                }
            }
        }
        return spres
    }
    else if (dry == 'rx') {
        let commonName = us;
        let noparts = 25;
        let nohealparts = 20;
        boosted = true;
        boostMats = [true];
        let spres = undefined;
        
        if (ifLead == 1) {
            for (let i = 0; i < 20; i++) {
                body.push(RANGED_ATTACK);
            }
            for (let i = 0; i < 17; i++) {
                body.push(MOVE);
            }
            for (let i = 0; i < 12; i++) {
                body.push(HEAL);
            }
            body.push(MOVE);
            boostMats = ['ZHO2', 'LHO2', 'KHO2'];
            //boostMats = ['ZHO2', 'LHO2', 'KHO2'];
            spres =  this.spawnCreep(body, 1+commonName, { memory: { role: 'quads', target: target, ln: undefined, fn: 2+commonName, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: boostMats, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
        }

        if (ifLead == 2) {
            for (let i = 0; i < 20; i++) {
                body.push(RANGED_ATTACK);
            }
            for (let i = 0; i < 17; i++) {
                body.push(MOVE);
            }
            for (let i = 0; i < 12; i++) {
                body.push(HEAL);
            }
            body.push(MOVE);
            boostMats = ['ZHO2', 'LHO2'];
            //boostMats = ['ZHO2', 'LHO2', 'KHO2'];
            spres = this.spawnCreep(body, 2+commonName, { memory: { role: 'quads', target: target, ln: 1+commonName, fn: 3+commonName, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: boostMats, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
        }

        if (ifLead == 3 || ifLead == 4) {
            for (let i = 0; i < 20; i++) {
                body.push(RANGED_ATTACK);
            }
            for (let i = 0; i < 17; i++) {
                body.push(MOVE);
            }
            for (let i = 0; i < 12; i++) {
                body.push(HEAL);
            }
            body.push(MOVE);
            if (ifLead==3) {
                boostMats = ['ZHO2', 'LHO2'];
                spres = this.spawnCreep(body, 3+commonName, { memory: { role: 'quads', target: target, ln: 2+commonName, fn: 4+commonName, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: boostMats, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
            }
            else {
                boostMats = ['ZHO2', 'LHO2', 'KHO2'];
                spres = this.spawnCreep(body, 4+commonName, { memory: { role: 'quads', target: target, ln: 3+commonName, fn: undefined, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: boostMats, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
            }
        }
        if (spres == OK) {
            if (boostMats.length>0) {
                for (let boostMat of boostMats) {
                    if (boostMat!==undefined && boostMat!==true) {
                        cacheBoostLabs(this.room.name, boostMat);
                    }
                }
            }
        }
        return spres
    }
    else if (dry == 6) { // low level double yellow
        if (ifLead == 1) {
            for (let i = 0; i < 16; i++) {
                body.push(MOVE);
            }
            for (let i = 0; i < 10; i++) {
                //body.push(ATTACK);
                body.push(WORK);
            }
            for (let i = 0; i < 6; i++) {
                body.push(MOVE);
            }
            return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'quads', target: target, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: ['ZHO2', 'ZH2O'], spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
        }

        if (ifLead == 2) {
            for (let i = 0; i < 10; i++) {
                body.push(MOVE);
            }
            for (let i = 0; i < 16; i++) {
                body.push(ATTACK);
            }
            for (let i = 0; i < 6; i++) {
                body.push(MOVE);
            }
            return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'quads', target: target, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: ['ZHO2', 'UH'], spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
        }

        if (ifLead == 3) {
            for (let i = 0; i < 16; i++) {
                body.push(MOVE);
            }
            for (let i = 0; i < 16; i++) {
                body.push(HEAL);
            }
            return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'quads', target: target, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: ['ZHO2', 'LHO2'], spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
        }

        if (ifLead == 4) {
            for (let i = 0; i < 16; i++) {
                body.push(MOVE);
            }
            for (let i = 0; i < 16; i++) {
                body.push(HEAL);
            }
            return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'quads', target: target, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: ['ZHO2', 'LHO2'], spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
        }
    }
    else if (dry == 7) { // red yellow green
        if (ifLead == 1) {
            for (let i = 0; i < 33; i++) {
                body.push(ATTACK);
            }
            for (let i = 0; i < 17; i++) {
                body.push(MOVE);
            }
            return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'quads', target: target, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: ['ZO', 'XUH2O'], spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
        }

        if (ifLead == 2) {
            for (let i = 0; i < 33; i++) {
                body.push(WORK);
            }
            for (let i = 0; i < 17; i++) {
                body.push(MOVE);
            }
            return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'quads', target: target, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: ['ZO', 'XZH2O'], spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
        }

        if (ifLead == 3) {
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
            return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'quads', target: target, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: ['ZO', 'XLHO2'], spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
        }

        if (ifLead == 4) {
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
            return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'quads', target: target, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: ['ZO', 'XLHO2'], spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
        }
    }
    else { // double yellow
        if (ifLead == 1) {
            for (let i = 0; i < 10; i++) {
                body.push(TOUGH);
            }
            for (let i = 0; i < 30; i++) {
                //body.push(ATTACK);
                body.push(WORK);
            }
            for (let i = 0; i < 10; i++) {
                body.push(MOVE);
            }
            return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'quads', target: target, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: ['XZHO2', 'XZH2O', 'XGHO2'], spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
        }

        if (ifLead == 2) {
            for (let i = 0; i < 10; i++) {
                body.push(TOUGH);
            }
            for (let i = 0; i < 30; i++) {
                body.push(WORK);
            }
            for (let i = 0; i < 10; i++) {
                body.push(MOVE);
            }
            return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'quads', target: target, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: ['XZHO2', 'XGHO2', 'XZH2O'], spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
        }

        if (ifLead == 3) {
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
            return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'quads', target: target, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: ['XZHO2', 'XGHO2', 'XKHO2', 'XLHO2'], spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
        }

        if (ifLead == 4) {
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
            return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'quads', target: target, quadsId: quadsId, ifLead: ifLead, boosted: false, boostMats: ['XZHO2', 'XGHO2', 'XKHO2', 'XLHO2'], spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
        }
    }
}

StructureSpawn.prototype.createDigger = function (energy, target, posi, toEatId) {
    var body = [];
    var NoCarryMoveParts = Math.floor((energy) / 100);
    NoCarryMoveParts = Math.min(50, NoCarryMoveParts)

    for (let i = 0; i < 48; i++) {
        body.push(WORK);
    }
    body.push(CARRY);
    body.push(CARRY);
    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'digger', target: target, posi: posi, toEatId: toEatId, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
}

StructureSpawn.prototype.createTruck = function (energy) {
    var body = [];
    var NoCarryMoveParts = Math.floor((energy) / 100);
    NoCarryMoveParts = Math.min(50, NoCarryMoveParts)

    for (let i = 0; i < NoCarryMoveParts; i++) {
        body.push(MOVE);
    }
    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'truck', spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
}

StructureSpawn.prototype.createDickHead = function () {
    let level = this.room.controller.level;
    let body = [CARRY, CARRY, MOVE];
    if (level < 7) {
        body = [CARRY, MOVE];
    }
    if (Game.time % 3 == 0) {
        body.push(WORK);
    }
    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'dickHead', spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
}

StructureSpawn.prototype.createNewDickHead = function () {
    let level = this.room.controller.level;
    let body = [CARRY, CARRY, MOVE];
    if (level < 7) {
        body = [CARRY, MOVE];
    }
    if (Game.time % 3 == 0) {
        body.push(WORK);
    }
    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'newDickHead', spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
}

StructureSpawn.prototype.createDickHeadpp = function (no, wp) {
    let level = this.room.controller.level;
    let body = [CARRY, CARRY];
    if (level < 7) {
        body = [CARRY];
    }
    else if (level == 7) {
        body = [CARRY, CARRY];
    }
    else {
        body = [CARRY, CARRY, CARRY];
    }
    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'dickHeadpp', no: no, in: true, spawnTime: 3 * body.length }, directions: [this.pos.getDirectionTo(wp.x, wp.y)] });
}

StructureSpawn.prototype.createBalancer = function () {
    /*if (Object.keys(this.room.memory.forSpawning.defaultDir)>2) {
        let body = [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY];
        return this.spawnCreep(body, randomIdGenerator(), { memory: {role: 'balancer', spawnTime: 3*body.length, spawnedBy: this.id}, directions: [BOTTOM_RIGHT]});
    }
    else {*/
    if (Game.shard.name=='shardSeason') {
        let body = [CARRY, CARRY, CARRY, CARRY];
        if (this.room.terminal==undefined) {
            body = [CARRY];
        }
        else if (this.room.terminal.store.energy > 100000 || _.sum(this.room.terminal.store) > 200000 || (this.room.storage && _.sum(this.room.storage.store) > 800000)) {
            body = [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY];
        }
        
        let wp = {x: undefined, y: undefined};
        let sp = this.room.memory.newBunker.setPoint;
        let clock = this.room.memory.newBunker.STclock;
        let ori = this.room.memory.newBunker.orient;
        if (ori == 'L') {
            if (clock == false) {
                wp.x = sp.x - 1;
                wp.y = sp.y + 1;
            }
            else {
                wp.x = sp.x - 1;
                wp.y = sp.y - 1;
            }
        }
        else if (ori == 'U') {
            if (clock == false) {
                wp.x = sp.x - 1;
                wp.y = sp.y - 1;
            }
            else {
                wp.x = sp.x + 1;
                wp.y = sp.y - 1;
            }
        }
        else if (ori == 'D') {
            if (clock == false) {
                wp.x = sp.x + 1;
                wp.y = sp.y + 1;
            }
            else {
                wp.x = sp.x - 1;
                wp.y = sp.y + 1;
            }
        }
        else if (ori == 'R') {
            if (clock == false) {
                wp.x = sp.x + 1;
                wp.y = sp.y - 1;
            }
            else {
                wp.x = sp.x + 1;
                wp.y = sp.y + 1;
            }
        }
        else {
            fo('prototype spawn wrong balancer position')
        }
        return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'balancer', spawnTime: 3 * body.length, isNeeded: true, in: true, spawnedBy: this.id }, directions: [this.pos.getDirectionTo(wp.x, wp.y)] });
    }
    else {
        let body = [CARRY, CARRY, MOVE, CARRY, CARRY, MOVE];
        if (this.room.terminal.store.energy > 100000 && _.sum(this.room.terminal.store) > 200000) {
            body = [CARRY, CARRY, MOVE, CARRY, CARRY, MOVE, CARRY, CARRY, MOVE, CARRY, CARRY, MOVE];
        }
        return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'balancer', spawnTime: 3 * body.length, isNeeded: true, spawnedBy: this.id }, directions: this.getDefaultSpawningDir() });
        //}
    }
}

StructureSpawn.prototype.createDriver = function (energy, path, purp, from, to) {
    var body = [];
    var NoCarryMoveParts = Math.floor((energy) / 150);

    for (let i = 0; i < NoCarryMoveParts; i++) {
        body.push(CARRY);
        body.push(CARRY);
        body.push(MOVE);
    }
    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'driver', path: path, purp: purp, from: from, to: to, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
}


StructureSpawn.prototype.createNoLegWorker = function (energy) {
    var body = [];
    var NoCarryMoveParts = Math.floor((energy - 50) / 100);

    for (let i = 0; i < NoCarryMoveParts; i++) {
        body.push(WORK);
    }

    body.push(CARRY);

    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'noLegWorker', spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
}

StructureSpawn.prototype.createMapper = function (target) {
    var body = [MOVE];
    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'mapper', target: target, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
}

StructureSpawn.prototype.createSuperUpgrader = function (energyMax) {
    var body = [];
    body.push(CARRY);
    if (this.room.controller.level == 8) { // lvl 8
        for (let i = 0; i < 3; i++) {
            for (let i = 0; i < 5; i++) {
                body.push(WORK);
            }
            body.push(MOVE);
        }
    }
    else if (energyMax >= 4450) { // lvl 7
        for (let i = 0; i < 9; i++) {
            for (let i = 0; i < 4; i++) {
                body.push(WORK);
            }
            body.push(MOVE);
        }
        body.push(WORK);
        body.push(WORK);
        body.push(WORK);
        body.push(MOVE);
    }
    else if (energyMax <= 550) {
        let NoCarryMoveParts = Math.floor((energyMax - 100) / 100);
        for (let i = 0; i < NoCarryMoveParts; i++) {
            body.push(WORK);
        }
        body.push(MOVE);
    }
    else if (this.room.controller.level<4) {
        let NoCarryMoveParts = Math.floor((energyMax - 50) / 350);
        for (let i = 0; i < NoCarryMoveParts; i++) {
            body.push(WORK);
            body.push(WORK);
            body.push(WORK);
            body.push(MOVE);
        }
    }
    else {
        let NoCarryMoveParts = Math.min(9, Math.floor((energyMax - 50) / 450));
        /*
        // scaling with highway distance
        if (this.room.memory && this.room.memory.highways && this.room.memory.highways.upgrade && this.room.memory.highways.upgrade.path && this.room.memory.highways.upgrade.path.length > 0) {
            if (this.room.memory.highways.upgrade.path.length > 30) {
                NoCarryMoveParts = NoCarryMoveParts * (1 - this.room.memory.highways.upgrade.path.length / 168);
            }
        }
        */
        /*if (energyMax<2600) { // lvl <7
            NoCarryMoveParts = Math.min(3, NoCarryMoveParts);
        }*/
        for (let i = 0; i < NoCarryMoveParts; i++) {
            body.push(WORK);
            body.push(WORK);
            body.push(WORK);
            body.push(WORK);
            body.push(MOVE);
        }
    }
    let boosted = false;
    let boostMats = [superUpgraderBoostManager(this.room, body.length)];
    
    let spawnres = this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'superUpgrader', boosted: boosted, boostMats: boostMats, working: false, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
    try {
        if (spawnres == OK) {
            if (boostMats.length>0 && boostMats[0]!==undefined && boostMats[0]!==true) {
                cacheBoostLabs(this.room.name, boostMats[0]);
            }
        }
    }
    catch (e) {
        fo('superUpgrader pre boost cache wrong in prototype.spawn');
    }
    return spawnres
}

StructureSpawn.prototype.createLongDistanceHarvester = function (energy, home, target, big=false) {
    var body = [];
    var NoCarryMoveParts = 0;
    
    if (big) {
        NoCarryMoveParts = Math.floor((energy) / 250);
        for (let i = 0; i < NoCarryMoveParts; i++) {
            body.push(WORK);
            body.push(WORK);
            body.push(MOVE);
        }
    }
    else {
        NoCarryMoveParts = Math.floor((energy) / 100);
        for (let i = 0; i < NoCarryMoveParts; i++) {
            body.push(CARRY);
            body.push(MOVE);
        }
    }
    
    let rv = Game.rooms[target];
    if (rv && rv.controller && rv.controller.reservation && !(rv.controller.reservation.username == 'PythonBeatJava' )) {
        NoCarryMoveParts = Math.min(7, Math.floor((energy) / 100));
        body = [];
        for (let i = 0; i < NoCarryMoveParts; i++) {
            body.push(CARRY);
            body.push(MOVE);
        }
    }
    let spres = this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'longDistanceHarvester', home: home, target: target, working: false, toCentre: false, spawnTime: 3 * body.length, big: big }, directions: this.getDefaultSpawningDir() });
    return spres
}

StructureSpawn.prototype.createStealer = function (energy, home, target, toTp, big = false, stc = undefined) {
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
        return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'stealer', home: home, target: target, working: false, stc: stc, boosted: false, boostMats: boostMats, toTp: toTp, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
    }
    else {
        var NoCarryMoveParts = Math.min(16, Math.floor((energy) / 150));

        for (let i = 0; i < NoCarryMoveParts; i++) {
            body.push(CARRY);
            body.push(CARRY);
            body.push(MOVE);
        }
        return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'stealer', home: home, target: target, working: false, stc: stc, toTp: toTp, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
    }
}

StructureSpawn.prototype.createDeliveroo = function (target, home, type, mastern) {
    var body = [];
    let boosted = true;
    let boostMats = [true]; //, 'XKH2O'];
    let e = this.room.energyCapacityAvailable;
    
    if (type=='c') {
        let noparts = Math.min(25, Math.floor(e/100));
        for (let i = 0; i < noparts; i++) {
            body.push(CARRY);
        }
        for (let i = 0; i < noparts; i++) {
            body.push(MOVE);
        }
    }
    else if (type=='h') {
        var noparts = Math.min(24, Math.floor((e-300) / 300));
        for (let i = 0; i < noparts; i++) {
            body.push(HEAL);
        }
        for (let i = 0; i < noparts; i++) {
            body.push(MOVE);
        }
        body.push(HEAL);
        body.push(MOVE);
    }

    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'deliveroo', pcn: mastern, home: home, target: target, boosted: boosted, boostMats: boostMats, type: type, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
}

StructureSpawn.prototype.createTrader = function (home, target) {
    var body = [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY];

    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'trader', home: home, target: target, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
}

StructureSpawn.prototype.createDragonAss = function (energy, home, target, big = false) {
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
        return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'dragonAss', home: home, target: target, working: false, boosted: false, boostMats: boostMats, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
    }
    else {
        var NoCarryMoveParts = Math.min(25, Math.floor((energy) / 100));
        for (let i = 0; i < NoCarryMoveParts; i++) {
            body.push(CARRY);
            body.push(MOVE);
        }
        return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'dragonAss', home: home, target: target, working: false, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
    }
}

StructureSpawn.prototype.createAsdpof = function (energy, home, target) {
    var body = [];
    var NoCarryMoveParts = Math.min(25, Math.floor((energy) / 100));

    for (let i = 0; i < NoCarryMoveParts; i++) {
        body.push(CARRY);
        body.push(MOVE);
    }

    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'asdpof', home: home, target: target, working: false, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
}

StructureSpawn.prototype.createGays = function (home, target, uniqueString, mOrf) {
    var body = [];
    var NoCarryMoveParts = 1;
    let ecap = this.room.energyCapacityAvailable;
    let boosted = true;
    let boostMats = [true];
    
    if (mOrf == 'm') {
        if (false) {
            boosted = false;
            boostMats = ['UH2O'];
            NoCarryMoveParts = Math.min(8, Math.floor(ecap / (80+50*5)));
            for (let i = 0; i < NoCarryMoveParts*5-1; i++) {
                body.push(MOVE);
            }
            for (let i = 0; i < NoCarryMoveParts; i++) {
                body.push(ATTACK);
            }
            body.push(MOVE);
        }
        else if (false) {
            NoCarryMoveParts = Math.min(10, Math.floor(ecap / (80*2+50*3)));
            for (let i = 0; i < NoCarryMoveParts*3-1; i++) {
                body.push(MOVE);
            }
            for (let i = 0; i < NoCarryMoveParts*2; i++) {
                body.push(ATTACK);
            }
            body.push(MOVE);
        }
        else {
            NoCarryMoveParts = Math.min(25, Math.floor(ecap / (80+50)));
            if (NoCarryMoveParts==25) {
                for (let i = 0; i < 24; i++) {
                    body.push(MOVE);
                }
                for (let i = 0; i < 25; i++) {
                    body.push(ATTACK);
                }
                for (let i = 0; i < 1; i++) {
                    body.push(MOVE);
                }
            }
            else {
                for (let i = 0; i < NoCarryMoveParts; i++) {
                    body.push(ATTACK);
                }
                for (let i = 0; i < NoCarryMoveParts; i++) {
                    body.push(MOVE);
                }
            }
        }
    }
    else if (mOrf == 'f') {
        if (false) {
            boosted = false;
            boostMats = ['LHO2'];
            NoCarryMoveParts = Math.min(8, Math.floor(ecap / (250+50*5)));
            for (let i = 0; i < NoCarryMoveParts*5-1; i++) {
                body.push(MOVE);
            }
            for (let i = 0; i < NoCarryMoveParts; i++) {
                body.push(HEAL);
            }
            body.push(MOVE);
        }
        else if (false) {
            //boosted = false;
            //boostMats = ['LHO2'];
            NoCarryMoveParts = Math.min(10, Math.floor(ecap / (250*2+50*3)));
            for (let i = 0; i < NoCarryMoveParts*3-1; i++) {
                body.push(MOVE);
            }
            for (let i = 0; i < NoCarryMoveParts*2; i++) {
                body.push(HEAL);
            }
            body.push(MOVE);
        }
        else {
            NoCarryMoveParts = Math.min(22, Math.floor((ecap-(150+50)*1) / (250+50)));
            for (let i = 0; i < 1; i++) {
                body.push(RANGED_ATTACK);
            }
            for (let i = 0; i < 1; i++) {
                body.push(MOVE);
            }
            for (let i = 0; i < NoCarryMoveParts-1; i++) {
                body.push(MOVE);
            }
            for (let i = 0; i < NoCarryMoveParts; i++) {
                body.push(HEAL);
            }
            body.push(MOVE);
        }
    }
    else {
        fo('gay gender wrong');
    }
    return this.spawnCreep(body, mOrf+uniqueString, { memory: { role: 'gays', home: home, target: target, boosted: boosted, boostMats: boostMats, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
}

StructureSpawn.prototype.createEdger = function (home, target, name) {
    var body = [];
    var NoCarryMoveParts = 1;
    let ecap = this.room.energyCapacityAvailable;
    let boosted = true;
    let boostMats = [true];
    
    NoCarryMoveParts = Math.min(24, Math.floor((ecap-300) / (80+50)));
    for (let i = 0; i < NoCarryMoveParts; i++) {
        body.push(MOVE);
    }
    for (let i = 0; i < NoCarryMoveParts; i++) {
        body.push(ATTACK);
    }
    body.push(HEAL);
    body.push(MOVE);
    
    return this.spawnCreep(body, name, { memory: { role: 'edger', home: home, target: target, boosted: boosted, boostMats: boostMats, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
}

StructureSpawn.prototype.createSacrificer = function (energy, home, target, toTp = undefined, capa) {
    let boosted = true;
    let boostMats = [true];
    var body = [];
    
    if (toTp=='qiang') {
        body = createBody({CARRY:40, MOVE:10});
        boosted = false;
        boostMats = ['XZHO2', 'XKH2O'];
    }
    else {
        var NoCarryMoveParts = Math.min(25, Math.floor((energy) / 100));
        if (capa) {
            NoCarryMoveParts = Math.min(NoCarryMoveParts, capa);
        }
        
        for (let i = 0; i < NoCarryMoveParts; i++) {
            body.push(CARRY);
            body.push(MOVE);
        }
    }

    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'sacrificer', home: home, target: target, boosted: boosted, boostMats: boostMats, working: false, toTp: toTp, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
}

StructureSpawn.prototype.createDrainer = function (energy, home, target) {
    var body = [];
    var NoCarryMoveParts = Math.min(25, Math.floor((energy) / 100));

    for (let i = 0; i < NoCarryMoveParts; i++) {
        body.push(CARRY);
        body.push(MOVE);
    }

    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'drainer', home: home, target: target, working: false, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
}


StructureSpawn.prototype.createSeason2c = function (stp, home, target, size) {
    var body = [];
    var NoCarryMoveParts = 25; // Math.min(25, Math.floor((energy)/100));
    if (size != undefined) {
        NoCarryMoveParts = size;
    }
    for (let i = 0; i < NoCarryMoveParts; i++) {
        body.push(CARRY);
        body.push(MOVE);
    }

    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'season2c', stp: stp, home: home, target: target, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
}

StructureSpawn.prototype.createSeason2cPirate = function (stp, home, target) {
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
    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'season2cPirate', stp: stp, home: home, target: target, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
}

StructureSpawn.prototype.createSeason2cnew = function (stp, home, target, size) {
    var body = [];
    var NoCarryMoveParts = 25; // Math.min(25, Math.floor((energy)/100));
    if (size != undefined) {
        NoCarryMoveParts = size;
    }
    for (let i = 0; i < NoCarryMoveParts; i++) {
        body.push(CARRY);
        body.push(MOVE);
    }

    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'season2cnew', stp: stp, home: home, target: target, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
}

StructureSpawn.prototype.createDedicatedUpgraderHauler = function () {
    var body = [];
    let energy = this.room.memory.ECap;
    let nobp = Math.min(16, Math.floor((energy) / 150));
    
    if (this.room.terminal && Game.shard.name == 'shardSeason') {
        nobp = Math.min(6, nobp);
    }

    for (let i = 0; i < (nobp); i++) {
        body.push(CARRY);
        body.push(CARRY);
        body.push(MOVE);
    }

    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'dedicatedUpgraderHauler', working: false, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
}

StructureSpawn.prototype.createLongDistanceLorry = function (energy, home, target) {
    var body = [];
    let nobp = 0
    if (Game.shard.name == 'shardSeason') {
        if (energy>=2100) {
            nobp = Math.min(16, Math.floor((Game.rooms[home].memory.ECap) / 150));
        }
        else {
            nobp = Math.min(8, Math.floor((Game.rooms[home].memory.ECap) / 150));
        }
        let ifrep = false;
        if (this.room.controller.level>3) {
            if (Math.random()<0.1) {
                ifrep = true;
            }
        }
        if (ifrep) {
            body.push(WORK);
            body.push(MOVE);
            for (let i = 0; i < (nobp - 2); i++) {
                body.push(CARRY);
                body.push(CARRY);
                body.push(MOVE);
            }
        }
        else {
            for (let i = 0; i < (nobp - 1); i++) {
                body.push(CARRY);
                body.push(CARRY);
                body.push(MOVE);
            }
        }
        let spres = this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'longDistanceLorry', home: home, target: target, working: false, toCentre: false, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
        return spres
    }
    if (Game.rooms[home].memory.ECap > 1800) {
        nobp = Math.floor((energy - 150) / 200);
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
            nobp = Math.floor((energy - 150) / 150);
            for (let i = 0; i < (nobp - 1); i++) {
                body.push(CARRY);
                body.push(CARRY);
                body.push(MOVE);
            }
            body.push(WORK, MOVE);
            if (Game.rooms[home].memory.ECap > 700) {
                body.push(CARRY, CARRY, MOVE);
            }
        }
        else {
            nobp = Math.floor((energy) / 150);
            for (let i = 0; i < (nobp - 1); i++) {
                body.push(CARRY);
                body.push(CARRY);
                body.push(MOVE);
            }
            if (Game.rooms[home].memory.ECap > 1600) {
                body.push(WORK);
                body.push(MOVE);
            }
        }
    }

    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'longDistanceLorry', home: home, target: target, working: false, toCentre: false, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
}

StructureSpawn.prototype.createSymbolPicker = function (target, home, sybId, partsNo = undefined) {
    var body = [];
    var NoCarryMoveParts = Math.floor((Game.rooms[home].memory.ECap) / 100);
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
    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'symbolPicker', home: home, target: target, working: false, sybId: sybId, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
}

StructureSpawn.prototype.createSymbolFactorier = function () {
    var body = [CARRY, CARRY, MOVE, CARRY, CARRY, MOVE];
    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'symbolFactorier', spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
}

StructureSpawn.prototype.createBegger = function (energy, home, target) {
    var body = [];
    var NoCarryMoveParts = Math.floor(energy / 100);

    for (let i = 0; i < Math.min(NoCarryMoveParts, 16); i++) {
        body.push(CARRY);
        body.push(CARRY);
        body.push(MOVE);
    }
    body.push(CARRY, MOVE);
    return this.spawnCreep(body, 'MrHelloer' + '_' + 'CNMB' + '_' + generateRandomStrings(), { memory: { role: 'begger', home: home, target: target, working: false, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
}

StructureSpawn.prototype.createLongDistanceUpgrader = function (energy, home, target) {
    var NoParts = Math.floor(energy / 200);
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
    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'longDistanceUpgrader', home: home, target: target, working: false, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
}

StructureSpawn.prototype.createAttacker = function (target, home, uniqueString) {
    var body = [];
    let NoParts = 5;
    if (uniqueString=='tigga') {
        body.push(MOVE);
        body.push(MOVE);
        let de = Math.random();
        if (de<0.1) {
            body.push(HEAL);
        }
        else if (de<0.4) {
            body.push(RANGED_ATTACK);
        }
        else {
            body.push(ATTACK);
        }
        for (let i = 0; i < 5; i++) {
            body.push(MOVE);
        }
    }
    else {
        let ecap = this.room.memory.Ecap;
        let noheal = 0;
        if (ecap>3000) {
            noheal = Math.floor(Math.random()*6);
        }
        else if (ecap>1500) {
            noheal = Math.floor(Math.random()*3);
        }
        else if (ecap>1000) {
            noheal = Math.floor(Math.random()*2);
        }
        else {
            noheal = 0
        }
        
        NoParts = Math.floor((ecap-300*noheal) / 200);
        for (let i = 0; i < NoParts; i++) {
            body.push(RANGED_ATTACK);
        }
        for (let i = 0; i < NoParts; i++) {
            body.push(MOVE);
        }
        for (let i = 0; i < noheal; i++) {
            body.push(HEAL);
        }
        for (let i = 0; i < noheal; i++) {
            body.push(MOVE);
        }
    }
    return OK
    return fo(this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'attacker', target: target, home: home, uniqueString: uniqueString, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() }));
}

StructureSpawn.prototype.createHealer = function (target, boosted) {
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

    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'healer', target: target, boosted: boosted, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
}

StructureSpawn.prototype.createControllerAttacker = function (target) {
    var body = [CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, MOVE];
    return this.spawnCreep(body, undefined, { memory: { role: 'controllerAttacker', target: target, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
}

StructureSpawn.prototype.createTeezer = function (energy, target, home, preferredLocation) {
    var body = [];

    for (let i = 0; i < 4; i++) {
        body.push(TOUGH);
    }
    for (let i = 0; i < 4; i++) {
        body.push(MOVE);
    }

    var NoParts = Math.min(Math.floor((energy - (10 + 50) * 4) / 300), 9);

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
    fo(body)
    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'teezer', target: target, home: home, preferredLocation: preferredLocation, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
}

StructureSpawn.prototype.createScouter = function (scouterName, target, pList=undefined) {
    return this.spawnCreep([MOVE], scouterName, { memory: { role: 'scouter', target: target, pList: pList, spawnTime: 3 }, directions: this.getDefaultSpawningDir() });
}

StructureSpawn.prototype.createHider = function (target, hide) {
    return this.spawnCreep([MOVE], randomIdGenerator(), { memory: { role: 'hider', target: target, hide: hide, spawnTime: 3 }, directions: this.getDefaultSpawningDir() });
}

StructureSpawn.prototype.createStomper = function (target, home) {
    let b = [MOVE];
    if (target == 'W19S16') {
        if (Math.random()<0.4) {
            b = [ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE];
        }
        else if (Math.random()<0.6) {
            b = [RANGED_ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE];
        }
    }
    else {
        if (Math.random()<0.4) {
            b = [ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE];
        }
        else {
            b = [RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE];
        }
    }
    return this.spawnCreep(b, randomIdGenerator(), { memory: { role: 'stomper', target: target, home: home, spawnTime: b.length*3 }, directions: this.getDefaultSpawningDir() });
}

StructureSpawn.prototype.createLongDistanceBuilder = function (energy, target, home) {
    var body = [];
    var NoCarryMoveParts = Math.floor(energy / 200);

    for (let i = 0; i < NoCarryMoveParts; i++) {
        body.push(WORK);
    }
    for (let i = 0; i < NoCarryMoveParts; i++) {
        body.push(CARRY);
    }
    for (let i = 0; i < NoCarryMoveParts; i++) {
        body.push(MOVE);
    }
    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'longDistanceBuilder', target: target, home: home, working: false, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
}

StructureSpawn.prototype.createPioneer = function (energy, target, home, superUpgrader, route) {
    var body = [];
    let boosted = true;
    let boostMats = undefined;
    if (superUpgrader == 'self') {
        body = createBody({WORK:14, CARRY:6, MOVE:22, RANGED_ATTACK: 4, HEAL:4});
        boosted = true;
        boostMats = [true];
    }
    else if (superUpgrader == 'strange') {
        body = createBody({WORK:36, CARRY:5, MOVE:9});
        boosted = false;
        boostMats = ['XZHO2'];
    }
    else if (superUpgrader == 'redneck') {
        body = createBody({ATTACK:40, MOVE:10});
        boosted = false;
        boostMats = ['XZHO2'];
    }
    else if (superUpgrader == 'bluedick') {
        body = createBody({RANGED_ATTACK:40, MOVE:10});
        boosted = false;
        boostMats = ['XZHO2'];
    }
    else if (superUpgrader == 'qiang') {
        for (let i = 0; i < 36; i++) {
            body.push(WORK);
        }
        body.push(CARRY);
        body.push(CARRY);
        for (let i = 0; i < 12; i++) {
            body.push(MOVE);
        }
        boosted = false;
        boostMats = ['ZHO2', 'LH', 'KH2O'];
    }
    else if (superUpgrader) {
        for (let i = 0; i < 24; i++) {
            body.push(WORK);
        }
        body.push(CARRY);
        for (let i = 0; i < 24; i++) {
            body.push(MOVE);
        }
    }
    else {
        var NoCarryMoveParts = Math.min(Math.floor(energy / 250), 12);

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
    let count = 0;
    for (var i = 0; i < body.length; ++i) {
        if (body[i] == CARRY)
            count++;
    }
    if (count>8 && (Game.rooms[target]==undefined || Game.rooms[target].find(FIND_MY_CONSTRUCTION_SITES).length>0)) {
        boostMats = [pioneerBoostManager(this.room, body.length)];
    }
    
    let spawnres = this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'pioneer', target: target, home: home, working: false, boosted: boosted, boostMats: boostMats, spawnTime: 3 * body.length, route: route }, directions: this.getDefaultSpawningDir() });
    try {
        if (spawnres == OK) {
            if (boostMats != undefined && boostMats.length>0 && boostMats[0]!==undefined && boostMats[0]!==true) {
                cacheBoostLabs(this.room.name, boostMats[0]);
            }
        }
    }
    catch (e) {
        fo('superUpgrader pre boost cache wrong in prototype.spawn');
    }
    return spawnres
}

StructureSpawn.prototype.createClaimer = function (target, attack, uniqueString=undefined, no = 1) {
    //return this.spawnCreep([WORK, CARRY, ATTACK, CLAIM, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], undefined, {role: 'claimer', target: target});
    let body = [CLAIM, MOVE, MOVE];
    if (this.room.energyCapacityAvailable <= 600) {
        body = [CLAIM, MOVE];
    }
    else {
        if (this.room.energyCapacityAvailable >= 850) {
            body = [MOVE, MOVE, MOVE, MOVE, MOVE, CLAIM];
        }
    }
    if (attack != undefined) {
        let NoCarryMoveParts = Math.min(Math.floor(this.room.energyCapacityAvailable / 650), 16);
        body = [];
        for (let i = 0; i < NoCarryMoveParts; i++) {
            body.push(CLAIM);
            body.push(MOVE);
        }
    }
    let cname = uniqueString;
    if (cname == undefined) {
        cname = randomIdGenerator();
    }
    
    return this.spawnCreep(body, cname, { memory: { role: 'claimer', target: target, no: no, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
}

StructureSpawn.prototype.createReserver = function (target, big, roomEnergyMax) {
    let body;
    if (big) {
        if (roomEnergyMax > 9000) {
            body = [CLAIM, CLAIM, MOVE, MOVE, CLAIM, CLAIM, MOVE, MOVE, CLAIM, MOVE, CLAIM, CLAIM, MOVE, MOVE, CLAIM, MOVE];
        }
        else if (roomEnergyMax > 5000) {
            body = [CLAIM, CLAIM, MOVE, MOVE, CLAIM, CLAIM, MOVE, MOVE, CLAIM, MOVE];
        }
        else if (roomEnergyMax > 3000) {
            body = [CLAIM, CLAIM, MOVE, MOVE, CLAIM, CLAIM, MOVE, MOVE];
        }
        else {
            body = [CLAIM, CLAIM, MOVE, MOVE];
        }
    }
    else {
        body = [CLAIM, MOVE];

    }
    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'reserver', target: target, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
}

StructureSpawn.prototype.createMover = function (ifRescue, lvl = 1) {
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
    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'mover', ifRescue: ifRescue, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
}

StructureSpawn.prototype.createMiner = function (sourceID, target, RCL, ifMineEnergy, ifLink, ifKeeper, home, ifRescue, ifEarly) {
    let r = this.room;
    let eCap = Game.rooms[home].memory.ECap;
    /*
    if (r.memory.forSpawning.idleTimer>50 && ((r.storage==undefined||r.storage.store.energy==0)&&(r.terminal==undefined||r.terminal.store.energy==0)) ) { // early phase or rebuild phase
        var NoCarryMoveParts = Math.min(Math.floor((r.energyAvailable-50) / 100), 1);
        let body = [];

        for (let i = 0; i < NoCarryMoveParts; i++) {
            body.push(WORK);
        }
        
        body.push(CARRY);
        return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'miner', sourceID: sourceID, target: target, spawnTime: 3 * body.length, home: home, ifRescue: true, workingPos: { x: ifEarly.x, y: ifEarly.y } }, directions: this.getDefaultSpawningDir() });
        //this.room.memory.mineralThresholds && this.room.memory.mineralThresholds.currentMineralStats.power>10000
    }
    */
    if (ifEarly) {
        if (!ifRescue) {
            if (this.room.find(FIND_MY_CREEPS, {filter:c=>c.getActiveBodyparts(WORK)}).length==0 && this.room.find(FIND_STRUCTURES, {filter:c=>c.structureType==STRUCTURE_CONTAINER && c.store.energy>250}).length==0) {
                let body = [WORK, WORK]
                return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'miner', sourceID: sourceID, target: target, spawnTime: 3 * body.length, home: home, ifRescue: true }, directions: this.getDefaultSpawningDir() });
            }
            var NoCarryMoveParts = Math.min(Math.floor((eCap-50) / 100), 5);
            let body = [];

            for (let i = 0; i < NoCarryMoveParts; i++) {
                body.push(WORK);
            }
            
            body.push(MOVE);
            return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'miner', sourceID: sourceID, target: target, spawnTime: 3 * body.length, home: home, ifRescue: true, workingPos: { x: ifEarly.x, y: ifEarly.y } }, directions: this.getDefaultSpawningDir() });

        }
        else {
            let body = [WORK, WORK]
            return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'miner', sourceID: sourceID, target: target, spawnTime: 3 * body.length, home: home, ifRescue: true }, directions: this.getDefaultSpawningDir() });
        }
    }
    else {
        let body = [CARRY];
        if (ifMineEnergy) { // if mining energy
            let goBig = false;
            if (sourceID && Game.getObjectById(sourceID) && Game.getObjectById(sourceID).energyCapacity>3000) {
                goBig = true;
            }
            let extraWorkPairsDueToPc = 0;
            let superSourcePcs = Game.rooms[home].find(FIND_MY_POWER_CREEPS, {filter: p=>p.powers && p.powers[PWR_REGEN_SOURCE]});
            if (superSourcePcs.length>0) {
                extraWorkPairsDueToPc = Math.ceil(superSourcePcs[0].powers[PWR_REGEN_SOURCE].level*50/15/2/2);
            }
            if (ifKeeper) {
                body = [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, WORK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
                return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'miner', sourceID: sourceID, target: target, ifMineEnergy: true, ifKeeper: ifKeeper, ifEarly: false, spawnTime: 3 * body.length, home: home }, directions: this.getDefaultSpawningDir() });
            }
            else if (RCL == 0) { // if remote mining, run faster, more MOVE parts
                let NoWorkParts = Math.min(Math.floor((eCap - 50) / 250), 3);
                if (goBig) {
                    NoWorkParts = Math.min(Math.floor((eCap - 50) / 250), 6);
                }
                for (let i = 0; i < NoWorkParts; i++) {
                    body.push(WORK);
                    body.push(WORK);
                    body.push(MOVE);
                }
                return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'miner', sourceID: sourceID, target: target, ifMineEnergy: true, currentRCL: 0, ifEarly: false, spawnTime: 3 * body.length, home: home }, directions: this.getDefaultSpawningDir() });
            }
            else { // current room miner, no need to move very fast
                if (r.memory.forSpawning.idleTimer>50) {
                    eCap = r.energyAvailable;
                    NoWorkParts = Math.min(Math.floor((eCap - 50) / 250), 3 + extraWorkPairsDueToPc);
                    if (NoWorkParts==0) {
                        body.push(WORK);
                    }
                    else {
                        for (let i = 0; i < NoWorkParts; i++) {
                            body.push(WORK);
                            body.push(WORK);
                            body.push(MOVE);
                        }
                    }
                }
                else {
                    if (Game.cpu.bucket<7000 || goBig) {
                        NoWorkParts = Math.min(Math.floor((eCap - 50) / 250), 6 + extraWorkPairsDueToPc);
                        for (let i = 0; i < NoWorkParts; i++) {
                            body.push(WORK);
                            body.push(WORK);
                            body.push(MOVE);
                        }  
                    }
                    else {
                        NoWorkParts = Math.min(Math.floor((eCap - 50) / 250), 3 + extraWorkPairsDueToPc);
                        for (let i = 0; i < NoWorkParts; i++) {
                            body.push(WORK);
                            body.push(WORK);
                            body.push(MOVE);
                        }
                    }
                }
                let spawnRes = this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'miner', sourceID: sourceID, target: target, ifMineEnergy: true, ifLink: true, ifEarly: false, currentRCL: RCL, spawnTime: 3 * body.length, home: home }, directions: this.getDefaultSpawningDir() });
                if (spawnRes==OK) {
                    r.memory.forSpawning.idleTimer = 0;
                }
                return spawnRes
            }
        }
        else { // if mining minerals mine big!
            var NoCarryMoveParts = Math.min(16, Math.floor((Game.rooms[home].memory.ECap) / 250));
            let body = [];
            for (let i = 0; i < NoCarryMoveParts; i++) {
                body.push(WORK);
                body.push(WORK);
            }
            for (let i = 0; i < NoCarryMoveParts; i++) {
                body.push(MOVE);
            }

            return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'miner', sourceID: sourceID, target: target, ifEarly: false, spawnTime: 3 * body.length, home: home }, directions: this.getDefaultSpawningDir() });
        }
    }
}

StructureSpawn.prototype.createLorry = function (energy) {
    let body = [CARRY, CARRY, MOVE];
    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'lorry', working: false, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
}

StructureSpawn.prototype.createTraveller = function (target) {
    let body = [MOVE];
    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'traveller', target: target, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
}

StructureSpawn.prototype.createTransporter = function (mineralType, fromStorage) {
    var body = [];
    for (let i = 0; i < 4; i++) {
        body.push(MOVE);
        body.push(CARRY);
        body.push(CARRY);
    }
    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'transporter', resourceType: mineralType, working: false, fromStorage: fromStorage, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
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

StructureSpawn.prototype.createRanger = function (target, home, rcl = undefined) {
    if (target == home) {
        if (rcl && rcl <= 3) {
            let body = [MOVE, ATTACK, MOVE, RANGED_ATTACK];
            return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'ranger', target: target, home: home, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
        }
        else {
            var NoCarryMoveParts = Math.min(4, Math.floor((Game.rooms[home].memory.ECap - 200) / 130));
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
        if (rcl && rcl <= 3 || Game.rooms[home].memory.ECap < 900) {
            let body = [MOVE, ATTACK, MOVE, RANGED_ATTACK];
            return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'ranger', target: target, home: home, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
        }
        else {
            let body = [MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, RANGED_ATTACK];
            return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'ranger', target: target, home: home, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
        }
    }
}

StructureSpawn.prototype.createPowerSourceAttacker = function (target, name, sId) {
    var body = [];
    if (this.room.memory.ECap >= 2600) {
        for (let i = 0; i < 19; i++) {
            body.push(MOVE);
        }
        for (let i = 0; i < 20; i++) {
            body.push(ATTACK);
        }
        body.push(MOVE);
    }
    else {
        for (let i = 0; i < 9; i++) {
            body.push(MOVE);
        }
        for (let i = 0; i < 10; i++) {
            body.push(ATTACK);
        }
        body.push(MOVE);
    }

    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'powerSourceAttacker', target: target, home: this.room.name, sId: sId, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
}

StructureSpawn.prototype.createPowerSourceJammer = function (target, sId) {
    var body = [MOVE];
    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'powerSourceJammer', target: target, home: this.room.name, sId: sId, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
}

StructureSpawn.prototype.createPowerSourceHealer = function (target, toHeal, sId) {
    var body = [];

    for (let i = 0; i < 25; i++) {
        body.push(MOVE);
    }
    for (let i = 0; i < 25; i++) {
        body.push(HEAL);
    }

    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'powerSourceHealer', target: target, home: this.room.name, sId: sId, toHeal: toHeal, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
}

StructureSpawn.prototype.createPowerSourceRanger = function (target, big) {
    var body = [];
    
    let e = this.room.energyCapacityAvailable;
    let ps = Math.min(10, Math.floor(e/(150+50)));
    for (let j = 0; j < ps; j++) {
        body.push(RANGED_ATTACK);
    }
    for (let i = 0; i < ps; i++) {
        body.push(MOVE);
    }
    
    if (big) {
        ps = Math.min(23, Math.floor((e-(250+50)*2)/(150+50)));
        body = [];
        for (let j = 0; j < ps; j++) {
            body.push(RANGED_ATTACK);
        }
        for (let j = 0; j < ps; j++) {
            body.push(MOVE);
        }
        for (let j = 0; j < 2; j++) {
            body.push(HEAL);
            body.push(MOVE);
        }
    }
    
    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'powerSourceRanger', target: target, home: this.room.name, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
}

StructureSpawn.prototype.createPowerSourceLorry = function (target, home, sId) {
    var body = [];

    for (let i = 0; i < 8; i++) {
        body.push(CARRY);
        body.push(CARRY);
        body.push(MOVE);
    }
    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'powerSourceLorry', home: home, target: target, sId: sId, working: false, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
}

StructureSpawn.prototype.createKeeperLairMeleeKeeper = function (target, home, ranged) {
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
    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'keeperLairMeleeKeeper', target: target, home: home, ranged: ranged, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
}

StructureSpawn.prototype.createMelee = function (target, home) {
    var body = [];
    let eCap = Game.rooms[home].memory.ECap;

    var NoParts = Math.floor(eCap / 210);
    NoParts = Math.min(NoParts, 16);
    for (let i = 0; i < NoParts; i++) {
        body.push(ATTACK);
        body.push(ATTACK);
        body.push(MOVE);
    }

    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'melee', target: target, home: home, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
}

StructureSpawn.prototype.createKeeperLairInvaderAttacker = function (target, home, name) {
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

    return this.spawnCreep(body, name, { memory: { role: 'keeperLairInvaderAttacker', target: target, home: home, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
}

StructureSpawn.prototype.createKeeperLairInvaderHealer = function (target, home, toHeal) {
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

    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'keeperLairInvaderHealer', target: target, home: home, toHeal: toHeal, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
}

StructureSpawn.prototype.createKeeperLairLorry = function (target, home) {
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
    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'keeperLairLorry', target: target, home: home, working: false, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
}

StructureSpawn.prototype.createCaptain = function (groupName) {
    var body = [];

    for (let i = 0; i < 25; i++) {
        body.push(MOVE);
    }
    for (let i = 0; i < 25; i++) {
        body.push(ATTACK);
    }

    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'captain', groupName: groupName, followed: false, ungrouped: true, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
}

StructureSpawn.prototype.createFirstMate = function (groupName, boostMats) {
    var body = [];
    for (let i = 0; i < 25; i++) {
        body.push(MOVE);
    }
    for (let i = 0; i < 25; i++) {
        body.push(HEAL);
    }
    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'firstMate', groupName: groupName, followed: false, ungrouped: true, boosted: false, boostMats: boostMats, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
}

StructureSpawn.prototype.createCrew = function (groupName, boostMat) {
    var body = [];
    for (let i = 0; i < 25; i++) {
        body.push(MOVE);
    }
    for (let i = 0; i < 25; i++) {
        body.push(HEAL);
    }
    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'crew', groupName: groupName, followed: false, ungrouped: true, boosted: false, boostMat: boostMat, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
}

StructureSpawn.prototype.createUltimateWorrior = function (target) {
    var body = [];
    let ecap = this.room.memory.ECap;
    if (ecap>1100) {
        let multiplier = Math.min(3, Math.floor(ecap/1020));
        for (let i = 0; i < 2*multiplier; i++) { // 20
            body.push(TOUGH);
        }
        for (let i = 0; i < 3*multiplier; i++) { // 450
            body.push(RANGED_ATTACK);
        }
        for (let i = 0; i < 5*multiplier; i++) { // 250
            body.push(MOVE);
        }
        for (let i = 0; i < multiplier; i++) { // 300
            body.push(MOVE);
            body.push(HEAL);
        }
    }
    else {
        let noparts = Math.min(20, Math.floor((ecap-300)/200));
        for (let i = 0; i < noparts; i++) { // 150
            body.push(RANGED_ATTACK);
        }
        for (let i = 0; i < noparts; i++) { // 50
            body.push(MOVE);
        }
        body.push(HEAL);
        body.push(MOVE);
    }
    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'ultimateWorrior', target: target, boosted: false, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
}

StructureSpawn.prototype.createKiter = function (target, home, lvl = 5) {
    let body = [];
    let e = this.room.energyCapacityAvailable;
    
    if (lvl>5 && Game.shard.name!='shardSeason') {
        boostMats = ['XZHO2', 'XLHO2', 'XKHO2', 'XGHO2'];
        for (let boostMat of boostMats) {
            cacheBoostLabs(this.room.name, boostMat);
        }
    }
    else {
        boostMats = [true];
    }
    
    if (lvl=='rsp+') {
        boostMats = ['ZHO2', 'LHO2', 'KHO2'];
        for (let i = 0; i < 7; i++) {
            body.push(RANGED_ATTACK);
        }
        for (let i = 0; i < 22; i++) {
            body.push(MOVE);
        }
        for (let i = 0; i < 20; i++) {
            body.push(HEAL);
        }
        for (let i = 0; i < 1; i++) {
            body.push(MOVE);
        }
    }
    else if (lvl=='x') {
        let nbbp = Math.min(12, Math.floor((e-(150+50))/(150+250+50*2)));
        if (false && (this.room.name=='W9S28'||this.room.name=='E1S29'||this.room.name=='W9S19')) {
            boostMats = ['GHO2'];
            body.push(TOUGH);
        }
        else {
            body.push(RANGED_ATTACK);
        }
        for (let i = 0; i < nbbp; i++) {
            body.push(RANGED_ATTACK);
        }
        for (let i = 0; i < nbbp*2; i++) {
            body.push(MOVE);
        }
        for (let i = 0; i < nbbp; i++) {
            body.push(HEAL);
        }
        for (let i = 0; i < 1; i++) {
            body.push(MOVE);
        }
    }
    else if (lvl == 8) { // lvl 8, 11t 6ra 9m 23h 1m 
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
    else if (lvl == 7) { // lvl 7, 6t 22ra 9m 12h 1m
        for (let i = 0; i < 3; i++) {
            body.push(RANGED_ATTACK);
        }
        for (let i = 0; i < 2; i++) {
            body.push(HEAL);
        }
        for (let i = 0; i < 34; i++) {
            body.push(MOVE);
        }
        for (let i = 0; i < 2; i++) {
            body.push(HEAL);
        }
        body.push(MOVE);
        /*
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
        */
    }
    else if (lvl == 6) { // lvl 6, 4t 13ra 4m 8h 1m 
        let ras = Math.min(5, Math.floor((e-4*50-13*150-4*50-8*250-50)/(150*4+50)));
        
        for (let i = 0; i < 4; i++) {
            body.push(TOUGH);
        }
        for (let i = 0; i < 8; i++) {
            body.push(RANGED_ATTACK);
        }
        for (let i = 0; i < ras; i++) {
            body.push(RANGED_ATTACK);
            body.push(RANGED_ATTACK);
            body.push(RANGED_ATTACK);
            body.push(RANGED_ATTACK);
        }
        for (let i = 0; i < ras; i++) {
            body.push(MOVE);
        }
        for (let i = 0; i < 4; i++) {
            body.push(MOVE);
        }
        for (let i = 0; i < 8; i++) {
            body.push(HEAL);
        }
        body.push(MOVE);
    }
    else if (lvl == 5) {
        boostMats = [true];

        let protect = 2;
        let rt = 5;
        let noheal = 2;
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
    else if (lvl == 4) {
        boostMats = [true];
        body = [MOVE, RANGED_ATTACK, MOVE, HEAL];
    }
    else {
        boostMats = [true];
        body = [RANGED_ATTACK, MOVE];
    }
    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'kiter', target: target, home: home, boostMats: boostMats, boosted: false, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
}

StructureSpawn.prototype.createDismantler = function (target, boostMats, tarId = undefined, dry = undefined) {
    var body = [];
    let energy = this.room.energyCapacityAvailable;
    let NoParts = Math.min(Math.floor(energy / 150), 25);
    for (let i = 0; i < NoParts; i++) {
        body.push(WORK);
        body.push(MOVE);
    }
    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'dismantler', target: target, boosted: false, boostMats: boostMats, tarId: tarId, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });

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
    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'dismantler', target: target, boosted: false, boostMats: boostMats, tarId: tarId, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
}

StructureSpawn.prototype.createUltimateUpgrader = function (boosted) {
    var body = [];
    for (let i = 0; i < 15; i++) {
        body.push(WORK);
    }
    body.push(CARRY);
    for (let i = 0; i < 8; i++) {
        body.push(MOVE);
    }

    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'ultimateUpgrader', boosted: boosted, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
}

StructureSpawn.prototype.createWanderer = function (target) {
    var body = [MOVE];
    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'wanderer', target: target }, directions: this.getDefaultSpawningDir() });
}

StructureSpawn.prototype.createOneWayInterSharder = function (targetShardName, portalRoomName, portalId, targetRoomName, roleWillBe, body, route) {
    let boosted = undefined;
    let boostMats = undefined;
    if (roleWillBe=='sacrificer') {
        body = [];
        let NoParts = Math.min(16, Math.floor((this.room.energyCapacityAvailable) / 150));
        for (let i = 0; i < NoParts; i++) {
            body.push(CARRY);
            body.push(CARRY);
            body.push(MOVE);
        }
        if (this.room.energyCapacityAvailable>=2500) {
            body.push(CARRY);
            body.push(MOVE);
        }
        boosted = true;
        boostMats = [true];
    }
    else if (roleWillBe == 'qiangWorker') {
        body = [];
        for (let i = 0; i < 36; i++) {
            body.push(WORK);
        }
        body.push(CARRY);
        body.push(CARRY);
        for (let i = 0; i < 12; i++) {
            body.push(MOVE);
        }
        boosted = false;
        boostMats = ['ZHO2', 'LH', 'KH2O'];
    }
    else if (roleWillBe == 'pioneer') {
        body = [];
        for (let i = 0; i < 15; i++) {
            body.push(WORK);
        }
        for (let i = 0; i < 10; i++) {
            body.push(CARRY);
        }
        for (let i = 0; i < 25; i++) {
            body.push(MOVE);
        }
    }
    else if (roleWillBe == 'claimer') {
        if (body=='claim') {
            body = [];
            body.push(MOVE);
            body.push(MOVE);
            body.push(MOVE);
            body.push(MOVE);
            body.push(CLAIM);
            body.push(MOVE);
        }
        else {
            body = [];
            body.push(MOVE);
            body.push(CLAIM);
            body.push(MOVE);
            body.push(MOVE);
            body.push(CLAIM);
            body.push(MOVE);
            body.push(MOVE);
            body.push(CLAIM);
            body.push(MOVE);
            body.push(MOVE);
            body.push(CLAIM);
            body.push(MOVE);
        }
    }
    else if (roleWillBe == 'kiter') {
        if (body=='big') {
            body = [];
            for (let i = 0; i < 10; i++) {
                body.push(TOUGH);
            }
            for (let i = 0; i < 10; i++) {
                body.push(RANGED_ATTACK);
            }
            for (let i = 0; i < 9; i++) {
                body.push(MOVE);
            }
            for (let i = 0; i < 20; i++) {
                body.push(HEAL);
            }
            body.push(MOVE);
            boosted = false;
            boostMats = ['XZHO2', 'XLHO2', 'XGHO2', 'XKHO2'];
        }
        else {
            body = [];
            for (let i = 0; i < 20; i++) {
                body.push(RANGED_ATTACK);
            }
            for (let i = 0; i < 24; i++) {
                body.push(MOVE);
            }
            for (let i = 0; i < 5; i++) {
                body.push(HEAL);
            }
            body.push(MOVE);
            boosted = true;
            boostMats = [true];
        }
    }
    return this.spawnCreep(body, targetShardName + '_' + targetRoomName + '_' + roleWillBe + '_' + generateRandomStrings() + '_' + JSON.stringify(route), { memory: { role: 'oneWayInterSharder', targetShardName: targetShardName, boosted: boosted, boostMats: boostMats, portalRoomName: portalRoomName, portalId: portalId, targetRoomName: targetRoomName, roleWillBe: roleWillBe, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
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
    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'portalTransporter', portalRoomName: portalRoomName, parsedMemoryAfterTeleportation: parsedMemoryAfterTeleportation }, directions: this.getDefaultSpawningDir() });
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
    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'onlyMineralDefender', target: target, home: home, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
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

    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'onlyMineralMiner', target: target, home: home, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
}

StructureSpawn.prototype.createOnlyMineralHauler = function (target, home) {
    var body = [];
    for (let i = 0; i < 14; i++) {
        body.push(CARRY);
    }
    for (let i = 0; i < 14; i++) {
        body.push(MOVE);
    }
    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'onlyMineralHauler', target: target, home: home, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
}

StructureSpawn.prototype.createDepoHarvester = function (target, home, depid) {
    var body = [];
    for (let i = 0; i < 24; i++) {
        body.push(WORK);
    }
    for (let i = 0; i < 1; i++) {
        body.push(CARRY);
    }
    for (let i = 0; i < 24; i++) {
        body.push(MOVE);
    }

    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'depoHarvester', target: target, home: home, depid: depid, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
}

StructureSpawn.prototype.createDepoHauler = function (target, home, depid) {
    var body = [];
    for (let i = 0; i < 25; i++) {
        body.push(CARRY);
    }
    for (let i = 0; i < 25; i++) {
        body.push(MOVE);
    }
    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'depoHauler', target: target, home: home, depid: depid, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
}

StructureSpawn.prototype.createDepoStorage = function (target, home, depid) {
    var body = [];
    for (let i = 0; i < 37; i++) {
        body.push(CARRY);
    }
    for (let i = 0; i < 1; i++) {
        body.push(MOVE);
    }
    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'depoStorage', target: target, home: home, depid: depid, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
}


StructureSpawn.prototype.createRedneck = function (target, simp = false) {
    var body = [];
    let boosted = false;
    let boostMats = ['UH2O'];
    var NoParts = Math.floor(Game.rooms[target].memory.ECap / (80 * 2 + 50));
    if (!simp) {
        if (NoParts > 16) {
            NoParts = 16;
        }
        for (let i = 0; i < NoParts; i++) {
            body.push(MOVE);
        }
        for (let i = 0; i < NoParts; i++) {
            body.push(ATTACK);
            body.push(ATTACK);
        }
    }
    else {
        boosted = true;
        boostMats = [true];
        for (let i = 0; i < 25; i++) {
            body.push(ATTACK);
        }
        for (let i = 0; i < 25; i++) {
            body.push(MOVE);
        }
    }
    return this.spawnCreep(body, randomIdGenerator(), { memory: { role: 'redneck', boosted: boosted, boostMats: boostMats, target: target, spawnTime: 3 * body.length }, directions: this.getDefaultSpawningDir() });
}