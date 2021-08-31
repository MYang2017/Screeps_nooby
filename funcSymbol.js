var season3PowerHarvRadius = 6; // if more than x we stop

global.digitalFlag = function() {
    return false
}

global.dzFlag = function() {
    return false
}

global.scanForSymb = function(dontDo) {
    let foundSs = listeningToSymbol();
    checkDuplicated(foundSs);
    monitorPickers(dontDo);
}

global.powerAllInOne = function (sn) {
    let foundPs = listeningToPower(sn);
    checkDuplicatedPower(sn, foundPs)
    monitorPowerPickers(sn)
}

global.depositAllInOne = function (sn) {
    let foundPs = listeningToDeposit(sn);
    checkDuplicatedDeposit(sn, foundPs)
    monitorDepoPickers(sn)
}

// generateRoomnameWithDistance -> generateAllRoomnameWithinDistance(rn, 5);
// isInSameSector(rn1, rn2);

global.observerScanForPower = function (rn) {
    let r = Game.rooms[rn];
    let scanDist = season3PowerHarvRadius;
    if (r.controller.level>7) {
        // check the room's mapinfo, if not controlled by other rooms, and timer not defind or timer>time:
        let observerId = r.memory.observerId; // find cached observer ID
        if (observerId == undefined) {
            let obs = r.find(FIND_MY_STRUCTURES, {filter: c=> c.structureType == STRUCTURE_OBSERVER});
            if (obs.length>0) {
                observerId = obs[0].id;
                r.memory.observerId = observerId;
            }
            else {
                if (Game.time%43==0) {
                    fo(r.name + ' need to build ob');
                }
                return
            }
        }

        let observer = Game.getObjectById(observerId);
        
        let allRns = r.memory.toObRoomNamesForPower;
        if (allRns == undefined || Game.time%99==0) {
            allRns = generateAllRoomnamesWithinDistance(rn, scanDist);
            r.memory.toObRoomNamesForPower = allRns;
        }

        for (let ind in allRns) {
            let posiRn = allRns[ind];
            if (Game.rooms[posiRn] == undefined && Game.time%((scanDist*2+1)**2)==ind) {
                observer.observeRoom(posiRn);
                //observer.observeRoom('E8S50');
                //fo(r.name + ' watching ' + posiRn);
            }
        }
    }
}

global.sendMappers = function(r, interv = 321) {
    let mrns = Memory.myRoomList.shardSeason;
    let scanDist = season3PowerHarvRadius;
    
    if (r.controller.level>7 && r.memory.observerId!==undefined) {
        return
        // check the room's mapinfo, if not controlled by other rooms, and timer not defind or timer>time:
        let observerId = r.memory.observerId; // find cached observer ID
        if (observerId == undefined) {
            let obs = r.find(FIND_MY_STRUCTURES, {filter: c=> c.structureType == STRUCTURE_OBSERVER});
            if (obs.length>0) {
                observerId = obs[0].id;
                r.memory.observerId = observerId;
            }
            else {
                if (Game.time%43==0) {
                    fo(r.name + ' need to build ob');
                }
                return
            }
        }

        let observer = Game.getObjectById(observerId);
        
        let allRns = generateAllRoomnamesWithinDistance(r.name, scanDist);
        for (let ind in allRns) {
            let posiRn = allRns[ind];
            if (Game.rooms[posiRn] == undefined && Game.time%((scanDist*2+1)**2)==ind && isInSameSector(posiRn, r.name)) {
                observer.observeRoom(posiRn);
                //fo(r.name + ' watching ' + posiRn);
            }
        }
    }
    else if (r.storage && r.energyCapacityAvailable>=1300) {
        if (Game.time%interv==0) {
            if (r.memory.powerRoomList== undefined) {
                r.memory.powerRoomList = [];
                let rn = r.name;
                let allRns = generateAllRoomnamesWithinDistance(rn, scanDist);
                for (let bern of allRns) {
                    let parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(bern);
                    let isHighway = (parsed[1] % 10 === 0) ||
                        (parsed[2] % 10 === 0);
                    if (Game.rooms[bern] == undefined && isHighway) {
                        if (Memory.symbolRoutes == undefined) {
                            Memory.symbolRoutes = {};
                        }
                        let savedPath = Memory.symbolRoutes[rn + bern];
                        if (savedPath == undefined) {
                            Memory.symbolRoutes[rn + bern] = Game.map.findRoute(rn, bern);
                            savedPath = Memory.symbolRoutes[rn + bern];
                        }
                        let proc = true;
                        for (let step of savedPath) {
                            let steprn = step.room;
                            if (Memory.rooms[steprn] && Memory.rooms[steprn].avoid) {
                                proc = false;
                                break;
                            }
                        }
                        if (proc && savedPath.length<6 && (Memory.rooms[bern]==undefined || (Memory.rooms[bern]&&(Memory.rooms[bern].avoid==undefined||Memory.rooms[bern].avoid==false||Memory.rooms[bern].avoid==0)))) {
                            if (Game.creeps[bern]==undefined) {
                                fo(rn + ' send lvl4-7 power scout to ' + bern);
                                r.memory.powerRoomList.push(bern);
                                //r.memory.forSpawning.spawningQueue.push({memory:{role: 'scouter', target: bern}, priority: 0.00001});
                            }
                        }
                    }
                    else if (digitalFlag() && r.name=='E11S16' && ifInsideThisSectorOfWall(bern, new RoomPosition(25, 25, 'E5S15'))) { // special case for digital's sector
                        let savedPath = Memory.symbolRoutes[rn + bern];
                        if (savedPath == undefined) {
                            Memory.symbolRoutes[rn + bern] = Game.map.findRoute(rn, bern);
                            savedPath = Memory.symbolRoutes[rn + bern];
                        }
                        let proc = true;
                        for (let step of savedPath) {
                            let steprn = step.room;
                            if (Memory.rooms[steprn] && Memory.rooms[steprn].avoid) {
                                proc = false;
                                break;
                            }
                        }
                        if (proc && savedPath.length<7 && (Memory.rooms[bern]==undefined || (Memory.rooms[bern]&&(Memory.rooms[bern].avoid==undefined||Memory.rooms[bern].avoid==false||Memory.rooms[bern].avoid==0)))) {
                            if (Game.creeps[bern]==undefined) {
                                fo(rn + ' send lvl7 symbol scout to ' + bern);
                                r.memory.forSpawning.spawningQueue.push({memory:{role: 'scouter', target: bern}, priority: 0.00001});
                            }
                        }
                    }
                }
            }
            // send paroller
            r.memory.forSpawning.spawningQueue.push({ memory: { role: 'scouter', target: randomIdGenerator(), pList: r.memory.powerRoomList}, priority: 12});
        }
    }
}

global.listeningToSymbolDry = function (x, y, trn) {
    let sctpos = new RoomPosition(x,y,trn);
    
    let mrns = Memory.myRoomList.shardSeason;
    let dist = 1000;
    let mrn;
    for (let mroomn of mrns) {
        if (Game.rooms[mroomn].controller.level>=7 && !mrns.includes(trn) && ifInsideThisSectorOfWall(mroomn, sctpos)) {
            if (Memory.symbolRoutes == undefined) {
                Memory.symbolRoutes = {};
            }
            else {
                let savedPath = Memory.symbolRoutes[mroomn + sctpos.roomName];
                let thisDist;
                if (savedPath == undefined) {
                    Memory.symbolRoutes[mroomn + sctpos.roomName] = Game.map.findRoute(mroomn, sctpos.roomName);
                    savedPath = Memory.symbolRoutes[mroomn + sctpos.roomName];
                }
                thisDist = savedPath.length;
                fo(mroomn)
                fo(ifInsideThisSectorOfWall(mroomn, sctpos))
                fo(thisDist)
                fo('----')
                if (thisDist<dist) {
                    dist = thisDist;
                    mrn = mroomn;
                }
            }
        }
    }
    if (mrn!=undefined) {
        fo(mrn)
    }
}

global.listeningToPower = function (sn) {
    let harvRad = season3PowerHarvRadius;
    let foundSs = [];
    for (let rn in Game.rooms) {
        let parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(rn);
        let isHighway = (parsed[1] % 10 === 0) || 
                        (parsed[2] % 10 === 0);
        if (isHighway) { // only scan symbol in highway
            let r = Game.rooms[rn];
            let scts = r.find(FIND_STRUCTURES, {filter:s=>s.structureType==STRUCTURE_POWER_BANK});

            if (scts.length>0) {
                for (let sct of scts) {
                    let symbId = sct.id;
                    let amount = sct.power;
                    let mrns = Memory.myRoomList[sn];
                    let dist = 1000;
                    let mrn;
                    for (let mroomn of mrns) {
                        // check if room is already on a power harvesting, decide whether we go frenzy
                        let ongoingPs = 0;
                        if (Memory.storedSymbols && Memory.storedSymbols[sn]) {
                            for (let pId in Memory.storedSymbols[sn]) {
                                let pobj = Memory.storedSymbols[sn][pId];
                                if (pobj && pobj.mrn == mroomn && pobj.noPath==false && pobj.pairsSent) {
                                    ongoingPs++;
                                }
                            }
                        }
                        if (ongoingPs>2 && Game.rooms[mroomn].find(FIND_MY_POWER_CREEPS, {filter: p=>p.powers && p.powers[PWR_OPERATE_SPAWN]}).length==0) {
                            continue;
                        }
                        
                        if (Game.rooms[mroomn].storage && Game.rooms[mroomn].energyCapacityAvailable>=1300 && !mrns.includes(sct.pos.roomName) && Game.map.getRoomLinearDistance(mroomn, sct.pos.roomName)<=harvRad) {
                            let thisDist = findRouteForPowDep(mroomn, sct.pos.roomName).length;
                            if (thisDist<dist) {
                                dist = thisDist;
                                mrn = mroomn;
                            }
                        }
                    }
                    if (mrn!=undefined) {
                        let tilesRound = tilesSurrounded(sct);
                        if (sct.ticksToDecay > 4600) {
                            foundSs.push({id: symbId, a: amount, nospots: tilesRound, hp: sct.hits, time: sct.ticksToDecay+Game.time, dist: dist, rn: sct.pos.roomName, ts: Game.time, mrn: mrn, x: sct.pos.x, y: sct.pos.y, lono: Math.ceil(amount / 800)});
                        }
                    }
                }
            }
        }
    }
    return foundSs
}

global.listeningToDeposit = function (sn) {
    let foundSs = [];
    for (let rn in Game.rooms) {
        let parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(rn);
        let isHighway = (parsed[1] % 10 === 0) || 
                        (parsed[2] % 10 === 0);
        if (isHighway) { // only scan symbol in highway
            let r = Game.rooms[rn];
            let scts = r.find(FIND_DEPOSITS);

            if (scts.length>0) {
                for (let sct of scts) {
                    let symbId = sct.id;
                    let cd = sct.cooldown;
                    let lcd = sct.lastCooldown;
                    let ttd = sct.ticksToDecay;
                    let mrns = Memory.myRoomList[sn];
                    let dist = 1000;
                    let mrn;
                    for (let mroomn of mrns) {
                        if (Game.rooms[mroomn].controller.level==8 && Game.rooms[mroomn].energyCapacityAvailable>9999 && !mrns.includes(sct.pos.roomName) && Game.map.getRoomLinearDistance(mroomn, sct.pos.roomName)<10) {
                            let thisDist = findRouteForPowDep(mroomn, sct.pos.roomName).length;
                            if (thisDist<dist) {
                                dist = thisDist;
                                mrn = mroomn;
                            }
                        }
                    }
                    if (mrn!=undefined) {
                        let tilesRound = tilesSurrounded(sct);
                        if (tilesRound > 0 && (lcd==undefined || lcd<33)) { // lcd?
                            foundSs.push({id: symbId, cd: cd, ttd: ttd, lcd: lcd, dist: dist, rn: sct.pos.roomName, ts: Game.time, mrn: mrn, x: sct.pos.x, y: sct.pos.y, nospots: tilesRound});
                        }
                    }
                }
            }
        }
    }
    return foundSs
}

global.listeningToSymbol = function () {
    let foundSs = [];
    for (let rn in Game.rooms) {
        let r = Game.rooms[rn];
        let scts = r.find(FIND_SYMBOL_CONTAINERS);
        if (scts.length>0) {
            for (let sct of scts) {
                let symbId = sct.id;
                let amount = _.sum(sct.store);
                let mrns = Memory.myRoomList.shardSeason;
                let dist = 1000;
                let mrn;
                for (let mroomn of mrns) {
                    if (Game.rooms[mroomn].controller.level>=7 && !mrns.includes(sct.pos.roomName) && ifInsideThisSectorOfWall(mroomn, sct.pos)) {
                        if (Memory.symbolRoutes == undefined) {
                            Memory.symbolRoutes = {};
                        }
                        else {
                            let savedPath = Memory.symbolRoutes[mroomn + sct.pos.roomName];
                            let thisDist;
                            if (savedPath == undefined) {
                                Memory.symbolRoutes[mroomn + sct.pos.roomName] = Game.map.findRoute(mroomn, sct.pos.roomName);
                                savedPath = Memory.symbolRoutes[mroomn + sct.pos.roomName];
                            }
                            thisDist = savedPath.length;
                            if (thisDist<dist) {
                                dist = thisDist;
                                mrn = mroomn;
                            }
                        }
                    }
                }
                if (mrn!=undefined) {
                    foundSs.push({id: symbId, a: amount, time: sct.ticksToDecay, dist: dist, rn: sct.pos.roomName, t0: Game.time, mrn: mrn, x: sct.pos.x, y: sct.pos.y});
                }
                else if (digitalFlag() && ifInsideThisSectorOfWall('E5S15', sct.pos)) {
                    if (Memory.symbolRoutes == undefined) {
                        Memory.symbolRoutes = {};
                    }
                    else {
                        let savedPath = Memory.symbolRoutes['E11S16' + sct.pos.roomName];
                        let thisDist;
                        if (savedPath == undefined) {
                            Memory.symbolRoutes['E11S16' + sct.pos.roomName] = Game.map.findRoute('E11S16', sct.pos.roomName);
                            savedPath = Memory.symbolRoutes['E11S16' + sct.pos.roomName];
                        }
                        dist = savedPath.length;
                    }
                    foundSs.push({id: symbId, a: amount, time: sct.ticksToDecay, dist: dist, rn: sct.pos.roomName, t0: Game.time, mrn: 'E11S16', x: sct.pos.x, y: sct.pos.y, digi: 'dg'});
                }
                else if (dzFlag() && ifInsideThisSectorOfWall('E5S35', sct.pos)) {
                    if (Memory.symbolRoutes == undefined) {
                        Memory.symbolRoutes = {};
                    }
                    else {
                        let savedPath = Memory.symbolRoutes['E1S27' + sct.pos.roomName];
                        let thisDist;
                        if (savedPath == undefined) {
                            Memory.symbolRoutes['E1S27' + sct.pos.roomName] = Game.map.findRoute('E1S27', sct.pos.roomName);
                            savedPath = Memory.symbolRoutes['E1S27' + sct.pos.roomName];
                        }
                        dist = savedPath.length;
                    }
                    foundSs.push({id: symbId, a: amount, time: sct.ticksToDecay, dist: dist, rn: sct.pos.roomName, t0: Game.time, mrn: 'E1S27', x: sct.pos.x, y: sct.pos.y, digi: 'dz'});
                }
            }
        }
    }
    return foundSs
}

global.checkDuplicatedPower = function (sn, foundSs) {
    if (Memory.storedSymbols == undefined) {
        Memory.storedSymbols = {};
        Memory.storedSymbols[sn] = {};
    }
    let storedSymbols = Memory.storedSymbols[sn];
    for (let sId in storedSymbols) { // update
        let sStoredObj =Memory.storedSymbols[sn][sId];
        /*fo(sId)
        fo(sStoredObj)
        fo(sStoredObj)*/
        if ((sStoredObj==undefined)||(Game.rooms[sStoredObj.rn]&&Game.getObjectById(sId)==undefined)) {
            delete Memory.storedSymbols[sn][sId];
        }
    }
    
    for (let s of foundSs) {
        // check if blocked by wall
        let tr = Game.rooms[s.rn];
        let goon = true;
        let dedi = ['W20S12', 'W20S13', 'W20S14', 'W20S15', 'W20S16', 'W20S17'];
        if (dedi.includes(s.rn) || s.dist>season3PowerHarvRadius || ((Game.rooms[s.mrn].memory.ECap < 2600 && s.nospots<2)||(Game.rooms[s.mrn].memory.ECap<1300)) || (Game.cpu.bucket<6000 && s.lono<3 && s.pairsSent==undefined) || (Game.cpu.bucket<4000 && s.pairsSent==undefined)) { // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
            goon = false;
        }
        let ctnposi = new RoomPosition(s.x, s.y, s.rn);
        
        if (goon) {
            if (storedSymbols[s.id] == undefined) { // not logged
                Memory.storedSymbols[sn][s.id] = {a: s.a, time: s.time, nospots: s.nospots, hp: s.hp, dist: s.dist, rn: s.rn, ts: s.ts, gotIt: false, noPath: false, mrn: s.mrn, digi: s.digi, x: s.x, y: s.y, lono: s.lono};
            }
            else { // already logged, update amount and time
                Memory.storedSymbols[sn][s.id].hp = s.hp;
            }
        }
        else { // too far or too less
            if (storedSymbols[s.id] == undefined) { // not logged
                Memory.storedSymbols[sn][s.id] = {a: s.a, time: s.time,  dist: s.dist, rn: s.rn, ts: s.ts, gotIt: false, noPath: true, mrn: s.mrn, digi: s.digi, x: s.x, y: s.y, lono: s.lono};
            }
            else { // already logged
                // check converting to sniper mode
                if (tr && Memory.storedSymbols[sn][s.id].snipeMode == undefined) {
                    let pb = Game.getObjectById(s.id);
                    if (pb && (pb.hits<1000000 || pb.hits/pb.hitsMax<pb.ticksToDecay/5000)) {
                        Memory.storedSymbols[sn][s.id].snipeMode = true;
                    }
                }

            }
        }
    }
}

global.checkDuplicatedDeposit = function (sn, foundSs) {
    if (Memory.storedDepos == undefined) {
        Memory.storedDepos = {};
        Memory.storedDepos[sn] = {};
    }
    let storedDepos = Memory.storedDepos[sn];
    for (let sId in storedDepos) { // update
        if (Game.rooms[storedDepos[sId].rn] && (Game.getObjectById(sId)==undefined || (Game.getObjectById(sId).lastCooldown>33))) {
            Memory.storedDepos[sn][sId] = {};
        }
    }
    
    for (let s of foundSs) {
        if (s.lcd>33) { // if last cd too long, we remove it
            Memory.storedDepos[sn][s.id] = undefined;
        }
        else { // worth harvesting
            // check if blocked by wall
            let tr = Game.rooms[s.rn];
            let goon = true;
            if (s.dist>10) { // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
                goon = false;
            }
            let ctnposi = new RoomPosition(s.x, s.y, s.rn);
            
            if (goon) {
                if (storedDepos[s.id] == undefined) { // not logged
                    Memory.storedDepos[sn][s.id] = {cd: s.cd, ts: s.ts, ts: s.ts, ttd: s.ttd, lcd: s.lcd, dist: s.dist, rn: s.rn, ts: s.t0, t0: s.t0, gotIt: false, noPath: false, mrn: s.mrn, digi: s.digi, x: s.x, y: s.y, nospots: s.nospots};
                }
                else { // already logged, update amount and time
                    Memory.storedDepos[sn][s.id].lcd = s.lcd;
                }
            }
            else { // too far
                if (storedDepos[s.id] == undefined) { // not logged
                    Memory.storedDepos[sn][s.id] = {cd: s.cd, ts: s.ts, ts: s.ts, ttd: s.ttd, lcd: s.lcd, dist: s.dist, rn: s.rn, ts: s.t0, t0: s.t0, gotIt: false, noPath: true, mrn: s.mrn, digi: s.digi, x: s.x, y: s.y, nospots: s.nospots};
                }
                else { // already logged
                    Memory.storedDepos[sn][s.id].noPath = true;
                    Memory.storedDepos[sn][s.id].lcd = s.lcd;
                }
            }
        }
    }
}

global.checkDuplicated = function (foundSs) {
    let storedSymbols = Memory.storedSymbols;
    if (storedSymbols == undefined) {
        Memory.storedSymbols = {};
    }
    else {
        for (let sId in storedSymbols) { // update
            let sStoredObj =Memory.storedSymbols[sId];
            /*fo(sId)
            fo(sStoredObj)
            fo(sStoredObj)*/
            if ((sStoredObj==undefined)||(Game.time>sStoredObj.t0+sStoredObj.time)) {
                delete Memory.storedSymbols[sId];
            }
        }
    }
    
    for (let s of foundSs) {
        if (s.a == 0 || s.a == null) { // if empty, remove
            Memory.storedSymbols[s.id] = undefined;
        }
        else { // not empty
            // check if blocked by wall
            let tr = Game.rooms[s.rn];
            let goon = true;
            if (s.dist>13 || !cacheInvaderCore(tr)) { // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
                goon = false;
            }
            let ctnposi = new RoomPosition(s.x, s.y, s.rn);
            
            if (goon) {
                if (storedSymbols[s.id] == undefined) { // not logged
                    Memory.storedSymbols[s.id] = {a: s.a, time: s.time, dist: s.dist, rn: s.rn, t0: s.t0, gotIt: false, noPath: false, mrn: s.mrn, digi: s.digi, x: s.x, y: s.y};
                }
                else { // already logged, update amount
                    Memory.storedSymbols[s.id].a = s.a;
                    Memory.storedSymbols[s.id].time = s.time;
                    Memory.storedSymbols[s.id].t0 = s.t0;
                    Memory.storedSymbols[s.id].mrn = s.mrn;
                    Memory.storedSymbols[s.id].digi = s.digi;
                }
            }
            else { // no path
                if (storedSymbols[s.id] == undefined) { // not logged
                    Memory.storedSymbols[s.id] = {a: s.a, time: s.time, dist: s.dist, rn: s.rn, t0: s.t0, gotIt: false, noPath: true, mrn: s.mrn, digi: s.digi, x: s.x, y: s.y};
                }
                else { // already logged
                    Memory.storedSymbols[s.id].gotIt = false;
                    Memory.storedSymbols[s.id].noPath = true;
                    Memory.storedSymbols[s.id].a = s.a;
                    Memory.storedSymbols[s.id].t0 = s.t0;
                    Memory.storedSymbols[s.id].digi = s.digi;
                }
            }
        }
    }
}

global.monitorDepoPickers = function (sn) {
    for (let sId in Memory.storedDepos[sn]) {
        let s = Memory.storedDepos[sn][sId];
        
        // delete dead jobs
        if (Game.rooms[s.rn] && Game.getObjectById(sId)==undefined) { // if empty, remove
            Memory.storedDepos[sn][sId] = undefined;
        }
        if (Memory.storedDepos[sn][sId] && Memory.storedDepos[sn][sId].noPath == undefined) {
            delete Memory.storedDepos[sn][sId]
        }
        
        if (true) {
            if (!Memory.storedDepos[sn][sId].noPath) { /// there is path to that place
                let tothvs = s.nospots;
                let nowhvs = s.hvs;
                if (nowhvs==undefined) {
                    Memory.storedDepos[sn][sId].hvs = [];
                    nowhvs = [];
                }
                let dingno = 0;
                for (let hvid of nowhvs) { // remove dead harvesters
                    let hver = Game.getObjectById(hvid);
                    if ( hver == undefined) {
                        removeElementInArrayByElement(hvid, Memory.storedDepos[sn][sId].hvs);
                    }
                    else { // do not count dying harvesters
                        if (hver.ticksToLive<s.dist*50) {
                            dingno++;
                        }
                    }
                }
                //if (nowhvs.length-dingno<tothvs) {
                if (Memory.storedDepos[sn][sId].sent) {
                    // spawn harvester
                    //for (let i=0; i<(tothvs-nowhvs.length+dingno); i++) {
                    if (Game.time%(Math.floor((1500-Math.min(1, s.dist-1.1)*50)/(s.nospots)))==0) {
                        Game.rooms[s.mrn].memory.forSpawning.spawningQueue.push({memory: {role: 'depoHarvester', target: s.rn, home: s.mrn, depid: sId}, priority: 3});
                    }
                    // spawn hauler
                    if (Game.time%(Math.floor((1500-Math.min(1, s.dist-1.1)*50)/Math.ceil(s.nospots/2.314)))==0) {
                        Game.rooms[s.mrn].memory.forSpawning.spawningQueue.push({memory: {role: 'depoHauler', target: s.rn, home: s.mrn, depid: sId}, priority: 3});
                    }
                    // spawn storage
                    if (Game.time%(Math.floor((1500-Math.min(1, s.dist-1.1)*50)/Math.ceil(s.nospots/6.618)))==0) {
                        Game.rooms[s.mrn].memory.forSpawning.spawningQueue.push({memory: {role: 'depoStorage', target: s.rn, home: s.mrn, depid: sId}, priority: 3});
                    }
                    // spawn transmitter
                }
                else {
                    for (let i=0; i<(tothvs); i++) {
                        Game.rooms[s.mrn].memory.forSpawning.spawningQueue.push({memory: {role: 'depoHarvester', target: s.rn, home: s.mrn, depid: sId}, priority: 3});
                    }
                    // spawn hauler
                    Game.rooms[s.mrn].memory.forSpawning.spawningQueue.push({memory: {role: 'depoHauler', target: s.rn, home: s.mrn, depid: sId}, priority: 3});
                    // spawn storage
                    Game.rooms[s.mrn].memory.forSpawning.spawningQueue.push({memory: {role: 'depoStorage', target: s.rn, home: s.mrn, depid: sId}, priority: 3});
                    Memory.storedDepos[sn][sId].sent = true;
                    // spawn transmitter
                }
            }
            else { // no path ignore
                
            }
        }
    }
}

global.monitorPowerPickers = function (sn) {
    for (let sId in Memory.storedSymbols[sn]) {
        let s = Memory.storedSymbols[sn][sId];
        if (true) {
            let pb = Game.getObjectById(sId);
            if (Memory.storedSymbols[sn][sId].jammersSent == undefined && pb && pb.hits<Math.max(200000*s.dist)) {
                if (pb.pos.findInRange(FIND_HOSTILE_CREEPS, 5, {filter: c=>['TheLastPiece', 'Mirroar', 'Mitsuyoshi'].includes(c.owner.username)}).length>0) {
                    addPowerJammer(s.rn, s.mrn, sId, s.nospots+1);
                    Memory.storedSymbols[sn][sId].jammersSent = true;
                }
            }
            let ps = Memory.storedSymbols[sn][sId].pairsSent;
            if (Game.time > s.ts+5000 || ((Game.time > s.ts+5000-s.dist*50-150) && (ps==undefined || ps.length<3)) || Game.rooms[s.mrn].memory.battleMode ) {
                delete Memory.storedSymbols[sn][sId];
                return
            }
            
            if (Memory.storedSymbols[sn][sId].attackedAtTime && Memory.storedSymbols[sn][sId].attackedAtTime<=Game.time) {
                // add ranged defender
                addPowerSniperAtTime(Game.time, s.rn, s.mrn, sId, true);
                // delay next spawn
                Memory.storedSymbols[sn][sId].attackedAtTime = Game.time + 1500-200;
            }
            
            if (Memory.storedSymbols[sn][sId].snipeMode && (Memory.storedSymbols[sn][sId].pickersSent == undefined)) {
                // check if someone else is harvesting so we can just spawn haulers
                if (pb && pb.room) {
                    let attks = pb.pos.findInRange(FIND_CREEPS, 1, {filter:c=>c.my || allyList().includes(c.owner.username)});
                    let dmg = 0;
                    let ette = 5000;
                    let dpt = 0;
                    for (let attk of attks) {
                        dmg += attk.getActiveBodyparts(ATTACK) * 30 * attk.ticksToLive;
                        dpt += attk.getActiveBodyparts(ATTACK) * 30;
                    }
                    if (dpt>0) {
                        ette = pb.hits/dpt;
                    }
                    if (dmg>pb.hits && (pb.hits<335000 || ette<s.lono*78/4+s.dist*50)) {
                        addPowerSniperAtTime(Game.time, s.rn, s.mrn, sId);
                        fo('sniping ' + pb.room.name )
                        addPowerLorryGroupAtTime(Game.time, s.rn, s.mrn, s.lono, sId);
                        Memory.storedSymbols[sn][sId].pickersSent = Game.time;
                        fo('advancing lorry ' + pb.room.name);
                        return
                    }
                }
            }
            else if (!Memory.storedSymbols[sn][sId].noPath) { /// there is path to that place
                let interval = 1500-Memory.storedSymbols[sn][sId].dist*50-100;
                let extraPairs = 0;
                if (Memory.storedSymbols[sn][sId].dist>5) {
                    extraPairs = 1;
                }
                /*
                fo(s.rn)
                fo(s.ts+1+interval*2+666)
                fo(Game.time)
                */
                
                if (ps==undefined) {
                    Memory.storedSymbols[sn][sId].pairsSent = [];
                    ps = Memory.storedSymbols[sn][sId].pairsSent;
                }
                
                if (ps.length == 0) {
                    addPowerGroupAtTime(Game.time,s.rn,s.mrn, sId);
                    if (pb && pb.pos.findInRange(FIND_HOSTILE_CREEPS, 5, {filter: c=>['TheLastPiece', 'Mirroar', 'Mitsuyoshi'].includes(c.owner.username)}).length>0) {
                        addPowerJammer(s.rn, s.mrn, sId, s.nospots+1);
                    }
                    Memory.storedSymbols[sn][sId].pairsSent.push(Game.time);
                    return
                }
                else if (ps.length > 0 && Memory.storedSymbols[sn][sId].pickersSent == undefined ) {
                    // check if someone else is harvesting so we can just spawn haulers
                    let pb = Game.getObjectById(sId);
                    if (pb && pb.room) {
                        let attks = pb.pos.findInRange(FIND_CREEPS, 1, {filter:c=>c.my || allyList().includes(c.owner.username)});
                        let dmg = 0;
                        let ette = 5000;
                        let dpt = 0;
                        for (let attk of attks) {
                            dmg += attk.getActiveBodyparts(ATTACK) * 30 * attk.ticksToLive;
                            dpt += attk.getActiveBodyparts(ATTACK) * 30;
                        }
                        if (dpt>0) {
                            ette = pb.hits/dpt;
                        }
                        if (dmg>pb.hits && (pb.hits<335000 || ette<s.lono*78/4+s.dist*50)) {
                            addPowerLorryGroupAtTime(Game.time, s.rn, s.mrn, s.lono, sId);
                            Memory.storedSymbols[sn][sId].pickersSent = Game.time;
                            fo('advancing lorry ' + pb.room.name);
                            return
                        }
                    }
                    if ((Game.time-Memory.storedSymbols[sn][sId].ts)/interval>ps.length && ps.length<3+extraPairs) {
                        addPowerGroupAtTime(Game.time,s.rn,s.mrn, sId);
                        if (pb && pb.pos.findInRange(FIND_HOSTILE_CREEPS, 5, {filter: c=>['TheLastPiece', 'Mirroar', 'Mitsuyoshi'].includes(c.owner.username)}).length>0) {
                            addPowerJammer(s.rn, s.mrn, sId, s.nospots+1);
                        }
                        Memory.storedSymbols[sn][sId].pairsSent.push(Game.time);
                    }
                    else if ((Game.time-Memory.storedSymbols[sn][sId].ts)/interval+0.477>ps.length && ps.length>2+extraPairs) { // calc amount and send extra?
                        let pb = Game.getObjectById(sId);
                        if (pb && pb.hits>300000) {
                            addPowerGroupAtTime(Game.time,s.rn,s.mrn, sId);
                            if (pb.pos.findInRange(FIND_HOSTILE_CREEPS, 5, {filter: c=>['TheLastPiece', 'Mirroar', 'Mitsuyoshi'].includes(c.owner.username)}).length>0) {
                                addPowerJammer(s.rn, s.mrn, sId, s.nospots+1);
                            }
                            Memory.storedSymbols[sn][sId].pairsSent.push(Game.time);
                        }
                        addPowerLorryGroupAtTime(Game.time, s.rn, s.mrn, s.lono, sId);
                        Memory.storedSymbols[sn][sId].pickersSent = Game.time;
                    }
                    else { // check and resend attackers or pickers
                        if (pb && pb.ticksToDecay && pb.ticksToDecay<2000&&pb.hits>pb.hitsMax*2000/5000&&Memory.storedSymbols[sn][sId].exextraPairsent==undefined) {
                            addPowerGroupAtTime(Game.time,s.rn,s.mrn, sId);
                            if (pb && pb.pos.findInRange(FIND_HOSTILE_CREEPS, 5, {filter: c=>['TheLastPiece', 'Mirroar', 'Mitsuyoshi'].includes(c.owner.username)}).length>0) {
                                addPowerJammer(s.rn, s.mrn, sId, s.nospots+1);
                            }
                            Memory.storedSymbols[sn][sId].exextraPairsent = Game.time;
                            fo('extra extra attacker sent ' + pb.room.name);
                            return
                        }
                    }
                }
            }
            else { // no path ignore
                
            }
        }
    }
}

global.monitorPickers = function (dontDo) {
    for (let sId in Memory.storedSymbols) {
        let s = Memory.storedSymbols[sId];
        
        if (s==undefined) {
            // passe
        }
        else {
            // delete dead jobs
            if (s.a == undefined || s.a == 0 || s.a == null) { // if empty, remove
                Memory.storedSymbols[sId] = undefined;
            }
            if (Game.time>s.t0+s.time) {
                delete Memory.storedSymbols[sId];
            }
            
            if (!dontDo) {
                if (s.gotIt == false) {
                    // send symbol lorries to pick
                    if (Memory.storedSymbols[sId].gotIt) {
                        // check lorry and time, if need resend or reinforce
                    }
                    else if (!Memory.storedSymbols[sId].noPath) { /// there is path to that place
                        let noToSend = 0;
                        let priority = 9;
                        let creepcapa = 600;
                        if (s.dist<3) {
                        	noToSend = s.a/2/(Math.floor((1500-100)/(s.dist*2*50))*creepcapa);
                        }
                        else {
                        	noToSend = s.a/(Math.floor((1500-100)/(s.dist*2*50))*creepcapa);
                        }
                        if (s.time>4000) {
                        	priority = 8;
                        }
                        else if (s.time>2000) {
                        	priority = 9;
                        }
                        else {
                        	priority = 10.9;
                        }
                        
                        noToSend = Math.ceil(noToSend);
                        let closestRn = s.mrn;
                        
                        let homename = closestRn;
                        
                        noToSend = Math.max(1, Math.floor(noToSend/2));
                        
                        if (s.digi==undefined) {
                            for (let i=0; i<noToSend; i++) {
                                Game.rooms[closestRn].memory.forSpawning.spawningQueue.push({memory: {role: 'symbolPicker', target: s.rn, home: homename, sybId: sId}, priority: priority});
                            }
                            fo(closestRn + ' sent ' + noToSend + ' symbol pickers to ' +s.rn+ ' ^_^');
                            Memory.storedSymbols[sId].gotIt = true;
                        }
                        else if (s.digi == 'dg') {
                            fo(s.id)
                            for (let i=0; i<noToSend; i++) {
                                if (homename=='E11S16') {
                                    symbolStealerSpawner(homename, s.rn, false, {x: s.x, y: s.y});
                                }
                                else {
                                    fo('digital wrong E11S16 room name');
                                }
                            }
                            fo(closestRn + ' sent ' + noToSend + ' symbol pickers to ' +s.rn+ ' ^_^ (special digital)');
                            Memory.storedSymbols[sId].gotIt = true;
                        }
                        else if (s.digi == 'dz') {
                            fo(s.id)
                            for (let i=0; i<noToSend; i++) {
                                if (homename=='E1S27') {
                                    symbolStealerSpawner(homename, s.rn, false, {x: s.x, y: s.y});
                                }
                                else {
                                    fo('dead zone wrong E1S27 room name');
                                }
                            }
                            fo(closestRn + ' sent ' + noToSend + ' symbol pickers to ' +s.rn+ ' ^_^ (dead zone)');
                            Memory.storedSymbols[sId].gotIt = true;
                        }
                        else {
                            fo('impossible digital bug');
                        }
                    }
                    else { // no path ignore
                        
                    }
                }
                else { // already sent, check if need update
                    
                }
            }
        }
    }
}

global.getMySymSitu = function () {
    let res = Game.symbols;
    let orded = undefined;
    for (let rn in Game.rooms) {
        let r = Game.rooms[rn];
        if (r&&r.controller&&r.controller.my&&r.storage) {
            for (let tp in r.storage.store) {
                if (tp.slice(0,3)=='sym') {
                    res[tp] += r.storage.store[tp]*243;
                }
            }
        }
    }
    orded = Object.keys(res).sort(function(a,b){return res[a]-res[b]})
    revorded = Object.keys(res).sort(function(a,b){return -res[a]+res[b]})
    fo(JSON.stringify(res))
    fo(JSON.stringify(orded))
    return revorded
}

global.logSymbolInfoInPublicRawMem = function () {
    if(Game.shard.name === 'shardSeason') {
        const segmentToUse = 99; //can be 0-99
        if(Game.time % 100 === 0) {
            RawMemory.setPublicSegments([segmentToUse]);
            RawMemory.setDefaultPublicSegment(segmentToUse);
            RawMemory.setActiveSegments([segmentToUse]);
        }
        if(Game.time % 100 === 1) {
            let toStore = {}
            for (let rn in Game.rooms) {
                let r = Game.rooms[rn];
                if (r && r.controller && r.controller.my) {
                    if (Memory.mapInfo[rn].decoderInfo && Memory.mapInfo[rn].decoderInfo.t) {
                        toStore[rn] = Memory.mapInfo[rn].decoderInfo.t;
                    }
                    else {
                        logSymbolInfoToMem(r);
                    }
                }
            }
            RawMemory.segments[segmentToUse] = JSON.stringify(toStore);
        }
    }
}

global.storedTravelFromAtoB = function (creep, dir='l') {
    let tar;
    let home;
    if (dir == 'l') {
        tar = creep.memory.target;
        home = creep.memory.home;
    }
    else {
        tar = creep.memory.home;
        home = creep.memory.target;
    }
    let gonormal = true;
    if (tar==undefined || home==undefined) {
        fo('long travel needs home and target');
        return true
    }
    let dests = creep.memory.dests;
    if (creep.room.name!=tar) { // on the way
        if (true) {
            if (dir == 'r' && dests) {
                dests = dests.slice().reverse();
            }
            if (dests != undefined) {
                for (let did in dests) {
                    let dest = dests[did];
                    if (dest.completed == undefined || dest.completed == false) {
                        let route = Game.map.findRoute(creep.room, dest.roomName, {
                        routeCallback(roomName, fromRoomName) {
                            let parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
                            let isHighway = (parsed[1] % 10 === 0) || 
                                            (parsed[2] % 10 === 0);
                            let isMyRoom = Game.rooms[roomName] &&
                                Game.rooms[roomName].controller &&
                                Game.rooms[roomName].controller.my;
                            
                            if (isHighway || isMyRoom) {
                                return 1;
                            }
                            else if (isSk(roomName)) {
                                return 3
                            }
                            else {
                                return 1.5;
                            }
                            if (roomName=='') {
                                return 100
                            }
                        }});
                        if (route.length > 0) {
                            let next = route[0];
                            let nextRoomTar = new RoomPosition(25, 25, next.room);
                            creep.travelTo(nextRoomTar, {maxRooms: 1, offRoad: true, ignoreRoads: true});
                        }
                        else {
                            creep.travelTo(new RoomPosition(dest.x, dest.y, dest.roomName), {maxRooms: 1, offRoad: true, ignoreRoads: true});
                            if (creep.pos.x == dest.x && creep.pos.y==dest.y && creep.room.name == dest.roomName) {
                                if (dir=='l') {
                                    creep.memory.dests[did].completed = true;
                                }
                                else {
                                    creep.memory.dests[dests.length-1-did].completed = true;
                                }
                            }
                        }
                        return false
                    }
                }
                // finished all sub target
                let route = Game.map.findRoute(creep.room, tar, {
                    routeCallback(roomName, fromRoomName) {
                        let parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
                        let isHighway = (parsed[1] % 10 === 0) || 
                                        (parsed[2] % 10 === 0);
                        let isMyRoom = Game.rooms[roomName] &&
                            Game.rooms[roomName].controller &&
                            Game.rooms[roomName].controller.my;
                        if (isHighway || isMyRoom) {
                            return 1;
                        } 
                        else if (isSk(roomName)) {
                            return 3
                        }
                        else {
                            if (false) { // (roomName=='E21S15')||(tar!=='E21S16' && roomName=='E21S16')
                                return Infinity
                            }
                            return 1.4;
                        }
                        
                    }});
                if (route.length > 0) {
                    let next = route[0];
                    let nextRoomTar = new RoomPosition(25, 25, next.room);
                    creep.travelTo(nextRoomTar, {maxRooms: 1, offRoad: true, ignoreRoads: true});
                    return false
                }
            }
            else {
                if (home+tar == 'E19S21E21S25' || tar+home == 'E19S21E21S25') {
                    creep.memory.dests = [{x:21 ,y: 43, roomName: 'E20S27'}, {x:29 ,y: 43, roomName: 'E20S27'},];
                }
                else if (home+tar == 'E19S21E22S29' || tar+home == 'E19S21E22S29') {
                    creep.memory.dests = [{x:21 ,y: 43, roomName: 'E20S27'}, {x:29 ,y: 43, roomName: 'E20S27'},];
                }
                else if (home+tar == 'E19S19E11S16' || tar+home == 'E19S19E11S16') {
                    creep.memory.dests = [{x:42, y: 8, roomName: 'E10S20'}];
                }
                else if (home+tar == 'E9S22E11S16' || tar+home == 'E9S22E11S16') {
                    creep.memory.dests = [{x:28 ,y: 17, roomName: 'E10S22'}];
                }
                else if (home+tar == 'E19S19E23S21' || tar+home == 'E19S19E23S21') { // mem
                    creep.memory.dests = [{x:22 ,y: 18, roomName: 'E20S20'}, {x:28 ,y: 13, roomName: 'E20S20'}, {x:29 ,y: 21, roomName: 'E23S20'}, {x:31 ,y: 29, roomName: 'E23S20'}];
                }
                else if (home+tar == 'E9S22E10S20' || tar+home == 'E9S22E10S20') { // digital dig
                    creep.memory.dests = [{x:28 ,y: 17, roomName: 'E10S22'}];
                }
                else if (home+tar == 'E9S22E10S16' || tar+home == 'E9S22E10S16') { // digital dig de other side
                    creep.memory.dests = [{x:28 ,y: 17, roomName: 'E10S22'}, {x:29 ,y: 15, roomName: 'E10S22'}, {x:29, y:22, roomName: 'E10S20'}, {x:18, y:17, roomName: 'E10S20'}];
                }
                else if (home+tar == 'E9S22E6S17' || tar+home == 'E9S22E6S17') { // digital room 8 urgent
                    creep.memory.dests = [{x:28 ,y: 17, roomName: 'E10S22'}, {x:29, y:22, roomName: 'E10S20'}, {x:18, y:17, roomName: 'E10S20'}];
                }
                else if (home+tar == 'E9S22E9S17' || tar+home == 'E9S22E9S17') { // digital room 8 fake
                    creep.memory.dests = [{x:28 ,y: 17, roomName: 'E10S22'}, {x:29, y:22, roomName: 'E10S20'}, {x:18, y:17, roomName: 'E10S20'}];
                }
                else if (home+tar == 'E9S22E7S15' || tar+home == 'E9S22E7S15') { // digital room 7 soso
                    creep.memory.dests = [{x:28 ,y: 17, roomName: 'E10S22'}, {x:29, y:22, roomName: 'E10S20'}, {x:18, y:17, roomName: 'E10S20'}];
                }
                else if (home+tar == 'E9S22E7S19' || tar+home == 'E9S22E7S19') { // digital room 7 juicy
                    creep.memory.dests = [{x:28 ,y: 17, roomName: 'E10S22'}, {x:29, y:22, roomName: 'E10S20'}, {x:18, y:17, roomName: 'E10S20'}];
                }
                else if (home+tar == 'E19S19E11S17' || tar+home == 'E19S19E11S17') {
                    creep.memory.dests = [{x:42, y: 8, roomName: 'E10S20'}];
                }
                else if (home+tar == 'E23S16E22S12' || tar+home == 'E23S16E22S12') { // system new expansion
                    creep.memory.dests = [{x:20, y: 34, roomName: 'E22S14'}];
                }
                else if (home+tar == 'E19S21E29S20' || tar+home == 'E19S21E29S20') {
                    creep.memory.dests = [{x:22 ,y: 43, roomName: 'E20S27'}, {x:28 ,y: 43, roomName: 'E20S27'},{x:31 ,y: 28, roomName: 'E23S20'},{x:31 ,y: 22, roomName: 'E23S20'}];
                }
                else if (home+tar == 'E23S19E19S21' || tar+home == 'E23S19E19S21') { // asdpof
                    creep.memory.dests = [{x:48 ,y: 27, roomName: 'E16S20'}, {x:48 ,y: 23, roomName: 'E16S20'}, {x:22 ,y: 18, roomName: 'E20S20'}, {x:28 ,y: 13, roomName: 'E20S20'}];
                }
                else if (home+tar == 'E23S19E19S19' || tar+home == 'E23S19E19S19') { 
                    creep.memory.dests = [{x:22 ,y: 18, roomName: 'E20S20'}, {x:28 ,y: 13, roomName: 'E20S20'}];
                }
                else if (home+tar == 'E21S16E19S19' || tar+home == 'E21S16E19S19') { 
                    creep.memory.dests = [{x:22 ,y: 18, roomName: 'E20S20'}, {x:28 ,y: 13, roomName: 'E20S20'}];
                }
                else if (home+tar == 'E23S16E19S19' || tar+home == 'E23S16E19S19') { 
                    creep.memory.dests = [{x:22 ,y: 18, roomName: 'E20S20'}, {x:28 ,y: 13, roomName: 'E20S20'}];
                }
                else if (home+tar == 'E21S8E23S16' || tar+home == 'E21S8E23S16') { // new expansion in asdpof's sector
                    creep.memory.dests = [{x:18 ,y: 25, roomName: 'E22S10'}];
                }
                else if (home+tar == 'E19S19E21S11' || tar+home == 'E19S19E21S11') { // asdpof factory
                    creep.memory.dests = [{x:22 ,y: 18, roomName: 'E20S20'}, {x:28 ,y: 13, roomName: 'E20S20'}, {x:47 ,y: 10, roomName: 'E20S12'}, {x:4 ,y: 2, roomName: 'E21S12'}];
                }
                else if (home+tar == 'E19S21E22S19' || tar+home == 'E19S21E22S19') { // asdpof bk room
                    creep.memory.dests = [{x:48 ,y: 27, roomName: 'E16S20'}, {x:48 ,y: 23, roomName: 'E16S20'}, {x:22 ,y: 18, roomName: 'E20S20'}, {x:28 ,y: 13, roomName: 'E20S20'}];
                }
                else if (home+tar == 'E22S20E19S19' || tar+home == 'E22S20E19S19') { // asdpof bk room
                    creep.memory.dests = [{x:48 ,y: 27, roomName: 'E16S20'}, {x:48 ,y: 23, roomName: 'E16S20'}, {x:22 ,y: 18, roomName: 'E20S20'}, {x:28 ,y: 13, roomName: 'E20S20'}];
                }
                else if (home+tar == 'E7S28E11S27' || tar+home == 'E7S28E11S27') { // last piece other sector
                    creep.memory.dests = [{x:20 ,y: 31, roomName: 'E10S27'}, {x:33 ,y: 34, roomName: 'E10S27'}];
                }
                else if (home+tar == 'E11S16E15S13' || tar+home == 'E11S16E15S13') { // dragonAss deep room
                    creep.memory.dests = [{x:47 ,y: 24, roomName: 'E12S12'}, {x:4 ,y: 28, roomName: 'E14S12'}];
                }
                else if (home=='E11S16' && tar!='E10S16' && creep.memory.stc && ifInsideThisSectorOfWall('E5S15', new RoomPosition(creep.memory.stc.x, creep.memory.stc.y, tar))) { // digital symbol collection
                    creep.memory.dests = [{x:29 ,y: 14, roomName: 'E10S16'}, {x:21 ,y: 13, roomName: 'E10S16'}];
                }
                else if (home=='E11S16' && tar!='E10S16' && ifInsideThisSectorOfWall('E5S15', new RoomPosition(25, 25, tar))) { // digital symbol collection
                    creep.memory.dests = [{x:29 ,y: 14, roomName: 'E10S16'}, {x:21 ,y: 13, roomName: 'E10S16'}];
                }
                else if (home=='E1S27' && tar!='E1S30' && ifInsideThisSectorOfWall('E5S35', new RoomPosition(25, 25, tar))) { // south dead zone collection
                    creep.memory.dests = [{x:37 ,y: 30, roomName: 'E1S30'}, {x:21 ,y: 13, roomName: 'E10S16'}];
                }
                else if (isInSameSector(creep.memory.target, 'E23S19')) {
                    creep.memory.dests = [{x: 25 ,y: 16, roomName: 'E20S20'}];
                }
                else {
                    let route = Game.map.findRoute(creep.room, tar, {
                    routeCallback(roomName, fromRoomName) {
                        let parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
                        let isHighway = (parsed[1] % 10 === 0) || 
                                        (parsed[2] % 10 === 0);
                        let isMyRoom = Game.rooms[roomName] &&
                            Game.rooms[roomName].controller &&
                            Game.rooms[roomName].controller.my;
                        if (isHighway || isMyRoom) {
                            return 1;
                        }
                        else if (isSk(roomName)) {
                            return 3
                        }
                        else {
                            return 1.4;
                        }
                        if (false) { // (roomName=='E21S15')||(tar!=='E21S16' && roomName=='E21S16')
                            return Infinity
                        }
                    }});
                    if (route.length > 0) {
                        let next = route[0];
                        let nextRoomTar = new RoomPosition(25, 25, next.room);
                        creep.travelTo(nextRoomTar, {maxRooms: 1, offRoad: true, ignoreRoads: true});
                        return false
                    }
                }
            }
            return false
        }
        // not a pre-pathed route
        return true
    }
    else { // arrived
        if (dests) {
            for (let did in dests) {
                creep.memory.dests[did].completed = undefined;
            }
        }
        creep.moveTo(new RoomPosition(25, 25, tar))
        return true
    }
}

global.ifInsideThisSectorOfWall = function(rn, posi) {
    let tarrn = posi.roomName;
    if (isInSameSector(rn, tarrn)) {
        let compo = decomposeRoomNameIntoFourParts(tarrn);
        let rx = parseInt(compo[1]);
        let ry = parseInt(compo[3]);
        let tarxy = parseRoomName(tarrn);
        let obxy = parseRoomName(rn);
        if (isHighway(tarrn)) {
            if (rx % 10 === 0) {
                if (ry % 10 === 0) { // if corner highway
                    if (tarxy.x<obxy.x) { // tar left
                        if (tarxy.y<obxy.y) { // tar tl
                            if (posi.x>25 && posi.y>25) {
                                return true
                            }
                        }
                        else { // tar br
                            if (posi.x>25 && posi.y<25) {
                                return true
                            }
                        }
                    }
                    else { // tar right
                        if (tarxy.y<obxy.y) { // tar tr
                            if (posi.x<25 && posi.y>25) {
                                return true
                            }
                        }
                        else { // tar br
                            if (posi.x<25 && posi.y<25) {
                                return true
                            }
                        }
                    }
                    return false
                }
                else { // only vertical
                    if (tarxy.x<obxy.x) {
                        if (posi.x>25) {
                            return true
                        }
                        else {
                            return false
                        }
                    }
                    else {
                        if (posi.x<25) {
                            return true
                        }
                        else {
                            return false
                        }
                    }
                }
            }
            else {
                if (ry% 10 === 0) { // only horizontal highway
                    if (tarxy.y<obxy.y) {
                        if (posi.y>25) {
                            return true
                        }
                        else {
                            return false
                        }
                    }
                    else {
                        if (posi.y<25) {
                            return true
                        }
                        else {
                            return false
                        }
                    }
                }
                else { // not high way
                    return true
                }
            }
        }
        else { // yes, if not highway, should be this side
            return true
        }
    }
    else {
        return false
    }
}

global.moveBetweenWalledSectors = function (creep) {
    let tar = creep.memory.target;
    let home = creep.memory.home;
    if (tar==undefined || home==undefined) {
        return false
    }
    
    let route = creep.memory.wallRoute;
    if (route) { // if pre found, move
        // dir
    }
    else { // find route
        // if terms are not highway and in different sectors
        if (isHighway(tar)==false && isHighway(home)==false && isInSameSector(tar, home)==false) {
            // find route normally
            // if route contains highway
                // add in break points rooms
                // find route again
        }
    }
}

global.getAllCorridors = function (rn) {
    let all = [];
    let compo = decomposeRoomNameIntoFourParts(rn);
    let x = parseInt(compo[1]);
    let y = parseInt(compo[3]);
    let abxy = parseRoomName(rn);
    
    if (x % 10 === 0) {
        // add all vertical rooms
        for (let i=-10; i<=10; i++) {
            if (i!=0) {
                all.push(generateRoomName(abxy.x, abxy.y+i));
            }
        }
    }
    if (y % 10 === 0) { // only y in highway
        // add all horizontal rooms
        for (let i=-10; i<=10; i++) {
            if (i!=0) {
                all.push(generateRoomName(abxy.x+i, abxy.y));
            }
        }
    }
    return all
}

global.praytest = function() {
    let c = Game.cpu.getUsed();
    let from = new RoomPosition(25, 25, 'E19S26');
    let to = new RoomPosition(25, 25, 'E21S26');
    findRouteBetweenSectorsWithBreakPoints(from, to);
    return Game.cpu.getUsed()-c
}

global.findRouteBetweenSectorsWithBreakPoints = function (from, to) {
    // Use `findRoute` to calculate a high-level plan for this path,
    // prioritizing highways and owned rooms
    let allowedRooms = { [ from.roomName ]: true };
    let init = Game.map.findRoute(from.roomName, to.roomName);
    init.forEach(function(info) {
        let allhighways = getAllCorridors(info.room);
        for (let hwn of allhighways) {
            allowedRooms[hwn] = true;
        }
        allowedRooms[info.room] = true;
    });
    
    // Invoke PathFinder, allowing access only to rooms from `findRoute`
    let ret = PathFinder.search(from, to, {
        roomCallback(roomName) {
            if (allowedRooms[roomName] === undefined) {
                return false;
            }
            else {
                
            }
        }
    });
    
    console.log(ret.path);
}

global.canGoTo = function (posSym) {
    let rn = posSym.roomName;
    let neibRns = generateTDLRRoomnames(rn);
    let out;
    // loop through neighbour
    for (let neibRn of neibRns) {
        if (!isInSameSector(rn, neibRn)) { // get the one not same sector
            out = neibRn;
            break;
        }
    }
    fo(out)
    // find closest exit to
    let exitDir = Game.rooms[rn].findExitTo(out);
    if (exitDir == FIND_EXIT_TOP) {
        if (posSym.y<25) {
            return false
        }
    }
    else if (exitDir == FIND_EXIT_RIGHT) {
        if (posSym.x>25) {
            return false
        }
    }
    else if (exitDir == FIND_EXIT_BOTTOM) {
        if (posSym.y>25) {
            return false
        }
    }
    else if (exitDir == FIND_EXIT_LEFT) {
        if (posSym.x<25) {
            return false
        }
    }
    else {
        fo('symbol func imposi')
    }
    return true
}

global.convertRnToCoords = function (rn) {
    return [1, 2]
}

global.logSymbolInfoToMem = function (r) {
    let info = Memory.mapInfo[r.name];
    if (info == undefined) {
        logGrandeRoomInfo(r);
    }
    else {
        let symbInfo = Memory.mapInfo[r.name].decoderInfo;
        if (symbInfo == undefined || Game.time%377 == 0) {
            let decoders = Game.rooms[r.name].find(FIND_SYMBOL_DECODERS);
            if (decoders.length>0) {
                let dec = decoders[0];
                fo('logged room ' + r.name + ' sym info');
                Memory.mapInfo[r.name].decoderInfo = {k: dec.scoreMultiplier, t: dec.resourceType};
            }
        }
    }
}

global.simplePF = function (cp, pos) {
    let goals =  { pos: pos, range: 1 };

    let ret = PathFinder.search(
    cp.pos, goals,
    {
      // We need to set the defaults costs higher so that we
      // can set the road cost lower in `roomCallback`
      plainCost: 2,
      swampCost: 10,

      roomCallback: function(roomName) {

        let room = Game.rooms[roomName];
        // In this example `room` will always exist, but since 
        // PathFinder supports searches which span multiple rooms 
        // you should be careful!
        if (!room) return;
        let costs = new PathFinder.CostMatrix;

        room.find(FIND_STRUCTURES).forEach(function(struct) {
          if (struct.structureType === STRUCTURE_ROAD) {
            // Favor roads over plain tiles
            costs.set(struct.pos.x, struct.pos.y, 1);
          } else if (struct.structureType !== STRUCTURE_CONTAINER &&
                     (struct.structureType !== STRUCTURE_RAMPART ||
                      !struct.my)) {
            // Can't walk through non-walkable buildings
            costs.set(struct.pos.x, struct.pos.y, 0xff);
          }
        });

        // Avoid creeps in the room
        room.find(FIND_CREEPS).forEach(function(creep) {
          costs.set(creep.pos.x, creep.pos.y, 0xff);
        });

        return costs;
      },
    }
  );

  let pos = ret.path[0];
  creep.move(creep.pos.getDirectionTo(pos));
}

global.logWallInfo = function(rn) {
    let r = Game.rooms[rn];
    
    let posi = new RoomPosition(23, 15, rn);
    let goalPosi = new RoomPosition(23, 42, rn);
    
    
    let goals = { pos: goalPosi, range: 1 };

    let ret = PathFinder.search(
        posi, goals,
        {
            // We need to set the defaults costs higher so that we
            // can set the road cost lower in `roomCallback`
            plainCost: 1,
            swampCost: 1,
            
            maxRooms: 1,

            roomCallback: function (roomName) {

                let room = r;
                // In this example `room` will always exist, but since 
                // PathFinder supports searches which span multiple rooms 
                // you should be careful!
                if (!room) return;
                let costs = new PathFinder.CostMatrix;

                room.find(FIND_STRUCTURES).forEach(function (struct) {
                    if (struct.structureType === STRUCTURE_WALL) {
                        costs.set(struct.pos.x, struct.pos.y, struct.hits/1000000);
                    }
                });

                // Avoid creeps in the room
                /*room.find(FIND_CREEPS).forEach(function (creep) {
                    costs.set(creep.pos.x, creep.pos.y, 0xff);
                });*/

            return costs;
            },
        }
    );
    fo(ret.incomplete)
    Memory.temp = ret.path;
}

global.howAboutThis = function (srn, frn) {
// Start location will be in the following format:
// [distanceFromTop, distanceFromLeft]
var findShortestPath = function(startCoordinates, grid) {
  var distanceFromTop = startCoordinates[0];
  var distanceFromLeft = startCoordinates[1];

  // Each "location" will store its coordinates
  // and the shortest path required to arrive there
  var location = {
    distanceFromTop: distanceFromTop,
    distanceFromLeft: distanceFromLeft,
    path: [],
    status: 'Start'
  };

  // Initialize the queue with the start location already inside
  var queue = [location];

  // Loop through the grid searching for the goal
  while (queue.length > 0) {
    // Take the first location off the queue
    var currentLocation = queue.shift();

    // Explore North
    var newLocation = exploreInDirection(currentLocation, 'North', grid);
    if (newLocation.status === 'Goal') {
      return newLocation.path;
    } else if (newLocation.status === 'Valid') {
      queue.push(newLocation);
    }

    // Explore East
    var newLocation = exploreInDirection(currentLocation, 'East', grid);
    if (newLocation.status === 'Goal') {
      return newLocation.path;
    } else if (newLocation.status === 'Valid') {
      queue.push(newLocation);
    }

    // Explore South
    var newLocation = exploreInDirection(currentLocation, 'South', grid);
    if (newLocation.status === 'Goal') {
      return newLocation.path;
    } else if (newLocation.status === 'Valid') {
      queue.push(newLocation);
    }

    // Explore West
    var newLocation = exploreInDirection(currentLocation, 'West', grid);
    if (newLocation.status === 'Goal') {
      return newLocation.path;
    } else if (newLocation.status === 'Valid') {
      queue.push(newLocation);
    }
  }

  // No valid path found
  return false;

};

// This function will check a location's status
// (a location is "valid" if it is on the grid, is not an "obstacle",
// and has not yet been visited by our algorithm)
// Returns "Valid", "Invalid", "Blocked", or "Goal"
var locationStatus = function(location, grid) {
  var gridSize = grid.length;
  var dft = location.distanceFromTop;
  var dfl = location.distanceFromLeft;

  if (location.distanceFromLeft < 0 ||
      location.distanceFromLeft >= gridSize ||
      location.distanceFromTop < 0 ||
      location.distanceFromTop >= gridSize) {

    // location is not on the grid--return false
    return 'Invalid';
  } else if (grid[dft][dfl] === 'Goal') {
    return 'Goal';
  } else if (grid[dft][dfl] !== 'Empty') {
    // location is either an obstacle or has been visited
    return 'Blocked';
  } else {
    return 'Valid';
  }
};


// Explores the grid from the given location in the given
// direction
var exploreInDirection = function(currentLocation, direction, grid) {
  var newPath = currentLocation.path.slice();
  newPath.push(direction);

  var dft = currentLocation.distanceFromTop;
  var dfl = currentLocation.distanceFromLeft;

  if (direction === 'North') {
    dft -= 1;
  } else if (direction === 'East') {
    dfl += 1;
  } else if (direction === 'South') {
    dft += 1;
  } else if (direction === 'West') {
    dfl -= 1;
  }

  var newLocation = {
    distanceFromTop: dft,
    distanceFromLeft: dfl,
    path: newPath,
    status: 'Unknown'
  };
  newLocation.status = locationStatus(newLocation, grid);

  // If this new location is valid, mark it as 'Visited'
  if (newLocation.status === 'Valid') {
    grid[newLocation.distanceFromTop][newLocation.distanceFromLeft] = 'Visited';
  }

  return newLocation;
};


// OK. We have the functions we need--let's run them to get our shortest path!

    [sx, sy] = convertRnToCoords(srn);
    [fx, fy] = convertRnToCoords(frn);
    
    Memory.mapMaze[sx][sy] = "Start";
    Memory.mapMaze[fx][fy] = "Goal";
    
    /*grid[1][1] = "Obstacle";
    grid[1][2] = "Obstacle";
    grid[1][3] = "Obstacle";
    grid[2][1] = "Obstacle";
    
    console.log(findShortestPath([0,0], grid));
    */
}

global.mapMazeInit = function () {
    // initialize memory of map maze info
    let mapw = 62;
    let maph = 62;
    
    let lx = mapw*2+1;
    let ly = maph*2+1;
    if (Memory.mapMaze == undefined) {
        let laMaze = []
        for (let i=0; i<mapw; i++) {
            laMaze[i] = [];
            for (let j=0; j<maph; j++) {
                laMaze[i][j] = 'Obstacle';
            }
        }
        Memory.mapMaze = laMaze;
    }
}

global.findRouteForPowDep = function (start, tar) {
    let route = Game.map.findRoute(start, tar, {
        routeCallback(roomName, fromRoomName) {
            let parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
            let isHighway = (parsed[1] % 10 === 0) || 
                            (parsed[2] % 10 === 0);
            let isMyRoom = Game.rooms[roomName] &&
                Game.rooms[roomName].controller &&
                Game.rooms[roomName].controller.my;
            if (isHighway || isMyRoom) {
                return 1;
            } 
            else if (isSk(roomName)) {
                return 30
            }
            else if (Memory.rooms.roomName && Memory.rooms.roomName.avoid) {
                return 18.8
            }
            else {
                return 3.14;
            }
            
    }});
    return route
}
