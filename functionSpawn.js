//Game.rooms['E94N17'].memory.forSpawning.spawningQueue.push({memory:{role:'claimer',target:'E94N17'},priority:10})

var dedebug = 0;

global.createBody = function (a) {
    let body = []
    for (let bt in a) {
        for (let i = 0; i < a[bt]; i++) {
            body.push(eval(bt));
        }
    }
    return body
}

global.changeRoomCreepTypeAndCost = function (roomName, role, no, cost) {
    let roomCreepInfo = Game.rooms[roomName].memory.forSpawning.roomCreepNo;
    roomCreepInfo.minCreeps[role] = no;
    roomCreepInfo.creepEnergy[role] = cost;
}

global.clearSpawnQueue = function (rn) {
    let r = Game.rooms[rn];
    if (r && r.controller.my) {
        console.log(rn + ' spawn queue cleared.')
        r.memory.forSpawning.spawningQueue = [];
    }
}

global.removeRepairerRoom = function () {
    for (let roomName of myRoomList()) {
        Game.rooms[roomName].memory.forSpawning.roomCreepNo.minCreeps['builder'] = 0;
    }
}

global.spawnCreepByRoomSpawnQueue = function (room) {
    let roomName = room.name;
    let availableSpawn = ifSpawnAvailable(roomName); // check spawn that is available for spawning
    let noOfAvailableSpawns = availableSpawn.length;
    //console.log(room.name+' spawn available '+noOfAvailableSpawns)

    for (let i = 0; i < noOfAvailableSpawns; i++) {
        let spawnToSpawn = availableSpawn[i];
        //console.log(spawnToSpawn.name, room.name)
        // check for renew
        let dyingC = spawnToSpawn.pos.findInRange(FIND_MY_CREEPS, 1, {filter:c=>(c.memory.role == 'linkKeeper'||c.memory.role == 'balancer'||c.memory.role == 'dickHeadpp'||c.memory.role == 'dickHead'||c.memory.role == 'newDickHead')&&c.ticksToLive<200});
        if (dyingC.length>0) {
            spawnToSpawn.renewCreep(dyingC[0]);
            return
        }
        else {
            if (spawnCreepWithHighestPriority(spawnToSpawn, room) != undefined) {
                return
            }
        }
    }
}

global.ifSpawnAvailable = function (roomName) {
    //let motherRoomName = Game.rooms[roomName].motherRoomName;
    //if (!motherRoomName) {
    let spawns = Game.rooms[roomName].find(FIND_MY_STRUCTURES, { filter: s => s.structureType == STRUCTURE_SPAWN });
    let availableSpawns = [];
    for (let spawn of spawns) {
        if (spawn.spawning == null) { // spawn is spawning
            availableSpawns.push(spawn); // return the free spawn
        }
        else if (spawn.spawning.remainingTime <= 1) { // spawn blocked
            if (spawn.room.memory.newBunker) {
                let found;
                if (spawn.spawning.remainingTime == 0 && spawn.spawning.directions && spawn.spawning.directions.length==1) {
                    if (spawn.spawning.directions.includes(TOP_LEFT) || spawn.spawning.directions.includes(TOP_RIGHT) || spawn.spawning.directions.includes(BOTTOM_LEFT) || spawn.spawning.directions.includes(BOTTOM_RIGHT)) {
                        if (spawn.room.memory.newBunker && spawn.room.memory.newBunker.orient) {
                            if (spawn.spawning.directions.includes(TOP_LEFT)) {
                                found = spawn.room.lookForAt(LOOK_CREEPS, spawn.pos.x - 1, spawn.pos.y - 1);
                                if (found.length==0) {
                                    found = spawn.room.lookForAt(LOOK_POWER_CREEPS, spawn.pos.x - 1, spawn.pos.y - 1);
                                }
                            }
                            else if (spawn.spawning.directions.includes(TOP_RIGHT)) {
                                found = spawn.room.lookForAt(LOOK_CREEPS, spawn.pos.x + 1, spawn.pos.y - 1);
                                if (found.length == 0) {
                                    found = spawn.room.lookForAt(LOOK_POWER_CREEPS, spawn.pos.x + 1, spawn.pos.y - 1);
                                }
                            }
                            else if (spawn.spawning.directions.includes(BOTTOM_LEFT)) {
                                found = spawn.room.lookForAt(LOOK_CREEPS, spawn.pos.x - 1, spawn.pos.y + 1);
                                if (found.length == 0) {
                                    found = spawn.room.lookForAt(LOOK_POWER_CREEPS, spawn.pos.x - 1, spawn.pos.y + 1);
                                }
                            }
                            else if (spawn.spawning.directions.includes(BOTTOM_RIGHT)) {
                                found = spawn.room.lookForAt(LOOK_CREEPS, spawn.pos.x + 1, spawn.pos.y + 1);
                                if (found.length == 0) {
                                    found = spawn.room.lookForAt(LOOK_POWER_CREEPS, spawn.pos.x + 1, spawn.pos.y + 1);
                                }
                            }
                            else {
                                fo('functionSpawn spawning diagonal unblock position wrong')
                            }
                        }
        
                        if (found && found.length > 0) {
                            if (!found[0].my || (found[0].powers == undefined && found[0].getActiveBodyparts(MOVE) == 0)) {
                                spawn.spawning.cancel();
                            }
                            else {
                                // check trapped creep
                                if ((found[0].powers==undefined || found[0].powers.length==0) && found[0].getActiveBodyparts(MOVE)>0) {
                                    if (spawn.room.memory.newBunker && spawn.room.memory.newBunker.orient && (spawn.spawning.directions.length==1)) {
                                        if (spawn.room.memory.newBunker.orient == 'L') {
                                            if (spawn.spawning.directions.includes(TOP_RIGHT) || spawn.spawning.directions.includes(BOTTOM_RIGHT)) {
                                                spawn.spawning.cancel();
                                            }
                                        }
                                        else if (spawn.room.memory.newBunker.orient == 'U') {
                                            if (spawn.spawning.directions.includes(BOTTOM_RIGHT) || spawn.spawning.directions.includes(BOTTOM_LEFT)) {
                                                spawn.spawning.cancel();
                                            }
                                        }
                                        else if (spawn.room.memory.newBunker.orient == 'D') {
                                            if (spawn.spawning.directions.includes(TOP_RIGHT) || spawn.spawning.directions.includes(TOP_LEFT)) {
                                                spawn.spawning.cancel();
                                            }
                                        }
                                        else if (spawn.room.memory.newBunker.orient == 'R') {
                                            if (spawn.spawning.directions.includes(TOP_LEFT) || spawn.spawning.directions.includes(BOTTOM_LEFT)) {
                                                spawn.spawning.cancel();
                                            }
                                        }
                                        else {
                                            fo('impossible spawning direction');
                                            //found[0].travelTo(spawn.room.controller);
                                        }
                                    }
                                    else { // no new bunker structure
                                        found[0].travelTo(spawn.room.controller);
                                    }
                                }
                                else { // power creeps
                                    found[0].travelTo(spawn.room.controller);
                                }
                            }
                        }
                    }
                }
                
                if (spawn.room.memory.newBunker && spawn.room.memory.newBunker.orient) {
                    if (spawn.room.memory.newBunker.orient == 'L') {
                        found = spawn.room.lookForAt(LOOK_CREEPS, spawn.pos.x - 1, spawn.pos.y);
                        if (found.length==0) {
                            found = spawn.room.lookForAt(LOOK_POWER_CREEPS, spawn.pos.x - 1, spawn.pos.y);
                        }
                    }
                    else if (spawn.room.memory.newBunker.orient == 'U') {
                        found = spawn.room.lookForAt(LOOK_CREEPS, spawn.pos.x, spawn.pos.y - 1);
                        if (found.length == 0) {
                            found = spawn.room.lookForAt(LOOK_POWER_CREEPS, spawn.pos.x, spawn.pos.y - 1);
                        }
                    }
                    else if (spawn.room.memory.newBunker.orient == 'D') {
                        found = spawn.room.lookForAt(LOOK_CREEPS, spawn.pos.x, spawn.pos.y + 1);
                        if (found.length == 0) {
                            found = spawn.room.lookForAt(LOOK_POWER_CREEPS, spawn.pos.x, spawn.pos.y + 1);
                        }
                    }
                    else if (spawn.room.memory.newBunker.orient == 'R') {
                        found = spawn.room.lookForAt(LOOK_CREEPS, spawn.pos.x + 1, spawn.pos.y);
                        if (found.length == 0) {
                            found = spawn.room.lookForAt(LOOK_POWER_CREEPS, spawn.pos.x + 1, spawn.pos.y);
                        }
                    }
                    else {
                        fo('functionSpawn spawning == 0 unblock position wrong')
                    }
                }

                if (found && found.length > 0) {
                    if (spawn.room.memory.newBunker.orient == 'L') {
                        if (Math.random()<0.5) {
                            found[0].move(TOP_LEFT);
                        }
                        else {
                            found[0].move(BOTTOM_LEFT);
                        }
                    }
                    else if (spawn.room.memory.newBunker.orient == 'U') {
                        if (Math.random()<0.5) {
                            found[0].move(TOP_LEFT);
                        }
                        else {
                            found[0].move(TOP_RIGHT);
                        }                    }
                    else if (spawn.room.memory.newBunker.orient == 'D') {
                        if (Math.random()<0.5) {
                            found[0].move(BOTTOM_LEFT);
                        }
                        else {
                            found[0].move(BOTTOM_RIGHT);
                        }
                    }
                    else if (spawn.room.memory.newBunker.orient == 'R') {
                        if (Math.random()<0.5) {
                            found[0].move(TOP_RIGHT);
                        }
                        else {
                            found[0].move(BOTTOM_RIGHT);
                        }
                    }
                    else {
                        fo('functionSpawn spawning == 0 unblock position wrong')
                    }
                }
            }
            else {
                let anch = spawn.room.memory.anchor;
                if (anch == undefined) {
                    anch = spawn.room.memory.newAnchor;
                }
                let found = spawn.room.lookForAt(LOOK_CREEPS, spawn.pos.x, spawn.pos.y + 1);
                
                if (found.length > 0) {
                    if (spawn.pos.x < anch.x) {
                        let f2 = spawn.room.lookForAt(LOOK_CREEPS, spawn.pos.x + 1, spawn.pos.y + 2);
                        if (f2.length > 0) {
                            f2[0].move(BOTTOM);
                        }
                        found[0].move(BOTTOM_RIGHT);
                    }
                    else if (spawn.pos.x > anch.x) {
                        let f2 = spawn.room.lookForAt(LOOK_CREEPS, spawn.pos.x - 1, spawn.pos.y + 2);
                        if (f2.length > 0) {
                            f2[0].move(BOTTOM);
                        }
                        found[0].move(BOTTOM_LEFT);
                    }
                    else {
                        found[0].move(getRandomInt(1, 8));
                    }
                }
                if (spawn.pos.x == anch.x) {
                    found = spawn.room.lookForAt(LOOK_CREEPS, spawn.pos.x, spawn.pos.y - 1);
                    if (found.length > 0 && found[0].my && found[0].getActiveBodyparts(MOVE) > 0) {
                        found[0].move(getRandomInt(1, 8));
                    }
                    found = spawn.room.lookForAt(LOOK_CREEPS, spawn.pos.x-1, spawn.pos.y - 1);
                    if (found.length > 0 && found[0].my && found[0].getActiveBodyparts(MOVE) > 0) {
                        found[0].move(getRandomInt(1, 8));
                    }
                    found = spawn.room.lookForAt(LOOK_CREEPS, spawn.pos.x+1, spawn.pos.y - 1);
                    if (found.length > 0 && found[0].my && found[0].getActiveBodyparts(MOVE) > 0) {
                        found[0].move(getRandomInt(1, 8));
                    }
                }
            }
        }
        else {
            if (spawn.spawning.name && Game.creeps[spawn.spawning.name] && Game.creeps[spawn.spawning.name].spawning && Game.creeps[spawn.spawning.name].memory.boostMats) {
                let botoprep = Game.creeps[spawn.spawning.name].memory.boostMats;
                for (let toprep of botoprep) {
                    if (toprep && toprep != true) {
                        //fo(toprep)
                        //cacheBoostLabs(roomName, toprep);
                    }
                }
            }
        }
    }
    return availableSpawns; // all spawns are busy
    //}
}

global.spawnCreepWithHighestPriority = function (spawnToSpawn, room) {
    let spawnQ = room.memory.forSpawning.spawningQueue;
    let lvl = room.controller.level;

    if (spawnQ.length > 0) { // if spawn queue is not empty
        let idleTimer = room.memory.forSpawning.idleTimer;
        if (idleTimer == undefined) {
            room.memory.forSpawning.idleTimer = 0;
        }
        room.memory.forSpawning.idleTimer++;
        if ((room.memory.mineralThresholds && room.memory.mineralThresholds.currentMineralStats.energy>1000) || room.find(FIND_MY_CREEPS, { filter: c => c.memory.role == 'miner' && c.pos.findInRange(FIND_SOURCES, 1).length > 0 }).length > 0) {
            room.memory.forSpawning.idleTimer = 0;
        }
    
        let spawnPriority = -1;
        let creepInfo;

        let anch = room.memory.anchor;
        if (anch == undefined) {
            anch = room.memory.newAnchor;
        }

        let totToSpawn = spawnQ.length;
        let maintainerCount = 0;
        let spawnFlag = false;
        
        // emergency check
        if (room.memory.forSpawning.idleTimer>50 && room.find(FIND_MY_CREEPS, {filter:c=>c.memory.role=='miner'}).length==0) {
            for (let creepToSpawn of spawnQ) {
                if (creepToSpawn.memory.role == 'miner' && creepToSpawn.memory.RCL!=0) {
                    creepToSpawn.priority += 1;
                }
            }
        }
        
        for (let creepToSpawn of spawnQ) {
            if (creepToSpawn.memory.role == 'maintainer') {
                maintainerCount++;
            }
            if (creepToSpawn.priority > spawnPriority) { // get creep with highest priority to spawn
                if (creepToSpawn.memory.role == 'maintainer' && ((creepToSpawn.memory.posiNum > 3 && spawnToSpawn.pos.x <= anch.x) || (creepToSpawn.memory.posiNum < 4 && spawnToSpawn.pos.x >= anch.x))) {
                    // pass
                }
                else {
                    spawnFlag = true
                    spawnPriority = creepToSpawn.priority;
                    creepInfo = creepToSpawn;
                }
            }
        }

        if (totToSpawn == maintainerCount && !spawnFlag) { // if only maintainer in queue, we pause to spawn
            return
        }

        let creepMemory = creepInfo.memory;

        if (dedebug) {
            fo(room.name)
            fo(JSON.stringify(creepMemory));
        }
        
        if (creepMemory.role == 'maintainer') {
            // remove exited maintainer at position first
            let foundi = room.find(FIND_MY_CREEPS, { filter: c => c.memory.role == 'maintainer' && c.memory.posiNum == creepMemory.posiNum });
            if (foundi && foundi.length > 0) {
                room.memory.maintainerCheck[parseInt(creepMemory.posiNum) - 1] = true;
                removeElementInArrayByElement(creepInfo, spawnQ);
                return
            }
            // check position then spawn with the corresponding spawn
            if (creepMemory.posiNum < 4) { // left spawn
                if (spawnToSpawn.pos.x < anch.x) {
                    if (!(spawnToSpawn.createMaintainer(creepMemory.posiNum) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                }
            }
            else { // right spawn
                if (spawnToSpawn.pos.x > anch.x) {
                    if (!(spawnToSpawn.createMaintainer(creepMemory.posiNum) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                }
            }
        }
        /*else if (creepMemory.role == 'linkKeeper') {
            if (room.controller.level>=7) {
                if (spawnToSpawn.pos.x < anch.x) {
                    if ( !(spawnToSpawn.createCustomCreep(creepMemory.energy, creepMemory.role, creepMemory.target)) < 0 ) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                }
            }
            else {
                if ( !(spawnToSpawn.createCustomCreep(creepMemory.energy, creepMemory.role, creepMemory.target)) < 0 ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                    return
                }
            }
        }
        else if (creepMemory.role == 'balancer') {
            if (room.controller.level>=7 && Object.keys(room.memory.forSpawning.defaultDir)>2) {
                if (spawnToSpawn.pos.x > anch.x) {
                    if ( !(spawnToSpawn.createBalancer()) < 0 ) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                }
            }
            else {
                if ( !(spawnToSpawn.createBalancer()) < 0 ) {
                    removeElementInArrayByElement(creepInfo, spawnQ);
                }
                return;
            }
        }*/
        else {
            switch (creepMemory.role) {
                case 'miner':
                    if (!(spawnToSpawn.createMiner(creepMemory.sourceID, creepMemory.target, creepMemory.currentRCL, creepMemory.ifMineEnergy, creepMemory.ifLink, creepMemory.ifKeeper, room.name, creepMemory.ifRescue, creepMemory.ifEarly) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'balancer':
                    if (!(spawnToSpawn.createBalancer() < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'mover':
                    if (!(spawnToSpawn.createMover(creepMemory.ifRescue, creepMemory.lvl) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'dickHead':
                    if (!(spawnToSpawn.createDickHead() < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'newDickHead':
                    if (!(spawnToSpawn.createNewDickHead() < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'dickHeadpp':
                    if (!(spawnToSpawn.createDickHeadpp(creepMemory.no, creepMemory.workingPos) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'loader':
                    if (!(spawnToSpawn.createLoader(room.memory.ECap) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'truck':
                    if (!(spawnToSpawn.createTruck(room.memory.ECap) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'digger':
                    if (!(spawnToSpawn.createDigger(room.memory.ECap, creepMemory.target, creepMemory.posi, creepMemory.toEatId) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'driver':
                    if (!(spawnToSpawn.createDriver(creepMemory.energy, creepMemory.path, creepMemory.purp, creepMemory.from, creepMemory.to) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'stealer':
                    if (!(spawnToSpawn.createStealer(room.memory.ECap, creepMemory.home, creepMemory.target, creepMemory.toTp, creepMemory.big, creepMemory.stc) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'trader':
                    if (!(spawnToSpawn.createTrader(creepMemory.home, creepMemory.target) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'dragonAss':
                    if (!(spawnToSpawn.createDragonAss(room.memory.ECap, creepMemory.home, creepMemory.target, creepMemory.big) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'asdpof':
                    if (!(spawnToSpawn.createAsdpof(room.memory.ECap, creepMemory.home, creepMemory.target, creepMemory.toTp) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'gays':
                    if (!(spawnToSpawn.createGays(creepMemory.home, creepMemory.target, creepMemory.uniqueString, creepMemory.mOrf) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'sacrificer':
                    if (!(spawnToSpawn.createSacrificer(room.memory.ECap, creepMemory.home, creepMemory.target, creepMemory.toTp, creepMemory.capa) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'kiter':
                    if (!(spawnToSpawn.createKiter(creepMemory.target, creepMemory.home, creepMemory.lvl) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'deliveroo':
                    if (!(spawnToSpawn.createDeliveroo(creepMemory.target, creepMemory.home, creepMemory.type, creepMemory.pcn) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'annoyer':
                    if (!(spawnToSpawn.createAnnoyer(creepMemory.target, creepMemory.home) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'drainer':
                    if (!(spawnToSpawn.createDrainer(room.memory.ECap, creepMemory.home, creepMemory.target) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'season2c':
                    if (!(spawnToSpawn.createSeason2c(creepMemory.stp, creepMemory.home, creepMemory.target, creepMemory.size) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'season2cnew':
                    if (!(spawnToSpawn.createSeason2cnew(creepMemory.stp, creepMemory.home, creepMemory.target, creepMemory.size) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'season2cPirate':
                    if (!(spawnToSpawn.createSeason2cPirate(creepMemory.stp, creepMemory.home, creepMemory.target) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'hider':
                    if (!(spawnToSpawn.createHider(creepMemory.target, creepMemory.hide) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'scouter':
                    if (creepMemory.pList) {
                        if (!(spawnToSpawn.createScouter(creepMemory.target, creepMemory.target, creepMemory.pList) < 0)) {
                            removeElementInArrayByElement(creepInfo, spawnQ);
                        }
                    }
                    else {
                        if (Game.rooms[creepMemory.target] == undefined) {
                            let spawnRes = spawnToSpawn.createScouter(creepMemory.target, creepMemory.target);
                            if (spawnRes == ERR_NAME_EXISTS) {
                                removeElementInArrayByElement(creepInfo, spawnQ);
                            }
                            else if (!(spawnRes < 0)) {
                                removeElementInArrayByElement(creepInfo, spawnQ);
                            }
                        }
                        else {
                            removeElementInArrayByElement(creepInfo, spawnQ);
                        }
                    }
                    return;
                case 'longDistanceBuilder':
                    if (!(spawnToSpawn.createLongDistanceBuilder(creepMemory.energy, creepMemory.target, creepMemory.home) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'longDistanceHarvester':
                    if (!(spawnToSpawn.createLongDistanceHarvester(creepMemory.energy, creepMemory.home, creepMemory.target, creepMemory.big) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'reserver':
                    if (!(spawnToSpawn.createReserver(creepMemory.target, creepMemory.big, creepMemory.roomEnergyMax) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'longDistanceLorry':
                    if (!(spawnToSpawn.createLongDistanceLorry(creepMemory.energy, creepMemory.home, creepMemory.target) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'ranger':
                    if (!(spawnToSpawn.createRanger(creepMemory.target, creepMemory.home, creepMemory.RCL) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'stomper':
                    if (!(spawnToSpawn.createStomper(creepMemory.target, creepMemory.home) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'attacker':
                    if (!(spawnToSpawn.createAttacker(creepMemory.target, creepMemory.home, creepMemory.uniqueString) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'claimer':
                    if (!(spawnToSpawn.createClaimer(creepMemory.target, creepMemory.attack, creepMemory.uniqueString, creepMemory.no) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'pioneer':
                    if (!(spawnToSpawn.createPioneer(creepMemory.energy, creepMemory.target, creepMemory.home, creepMemory.superUpgrader, creepMemory.route) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'teezer':
                    if (!(spawnToSpawn.createTeezer(creepMemory.energy, creepMemory.target, creepMemory.home, creepMemory.preferredLocation) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'mapper':
                    if (!(spawnToSpawn.createMapper(creepMemory.target) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'superUpgrader':
                    let superUpgraderEnergy = creepMemory.energyMax;
                    if (lvl == 8) {
                        superUpgraderEnergy = 2050;
                    }
                    if (!(spawnToSpawn.createSuperUpgrader(superUpgraderEnergy) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'transporter':
                    if (!(spawnToSpawn.createTransporter(creepMemory.resourceType, creepMemory.fromStorage) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'keeperLairMeleeKeeper':
                    if (!(spawnToSpawn.createKeeperLairMeleeKeeper(creepMemory.target, creepMemory.home, creepMemory.ranged) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'edger':
                    if (!(spawnToSpawn.createEdger(creepMemory.home, creepMemory.target, creepMemory.name) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'melee':
                    if (!(spawnToSpawn.createMelee(creepMemory.target, creepMemory.home) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'keeperLairInvaderAttacker':
                    if (!(spawnToSpawn.createKeeperLairInvaderAttacker(creepMemory.target, creepMemory.home, creepMemory.name) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'keeperLairInvaderHealer':
                    if (!(spawnToSpawn.createKeeperLairInvaderHealer(creepMemory.target, creepMemory.home, creepMemory.toHeal) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'keeperLairLorry':
                    if (!(spawnToSpawn.createKeeperLairLorry(creepMemory.target, creepMemory.home) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'captain':
                    if (!(spawnToSpawn.createCaptain(creepMemory.groupName) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'firstMate':
                    if (!(spawnToSpawn.createFirstMate(creepMemory.groupName, creepMemory.boostMat) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'crew':
                    if (!(spawnToSpawn.createCrew(creepMemory.groupName, creepMemory.boostMat) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'healer':
                    if (!(spawnToSpawn.createHealer(creepMemory.target, creepMemory.boosted) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'ultimateWorrior':
                    if (!(spawnToSpawn.createUltimateWorrior(creepMemory.target) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'quads':
                    if (!(spawnToSpawn.createQuads(creepMemory.target, creepMemory.quadsId, creepMemory.ifLead, creepMemory.us, creepMemory.dry) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                        return false
                    }
                    return;
                case 'dismantler':
                    if (!(spawnToSpawn.createDismantler(creepMemory.target, creepMemory.boostMats, creepMemory.tarId, creepMemory.dry) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'ultimateUpgrader':
                    if (!(spawnToSpawn.createUltimateUpgrader(false) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'powerSourceLorry':
                    if (!(spawnToSpawn.createPowerSourceLorry(creepMemory.target, creepMemory.home, creepMemory.sId) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'powerSourceAttacker':
                    if (!(spawnToSpawn.createPowerSourceAttacker(creepMemory.target, creepMemory.name, creepMemory.sId) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'powerSourceJammer':
                    /*
                    if (room.name=='W9S28' || room.name=='E1S29') {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                        return
                    }
                    */
                    if (!(spawnToSpawn.createPowerSourceJammer(creepMemory.target, creepMemory.sId) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'powerSourceHealer':
                    if (!(spawnToSpawn.createPowerSourceHealer(creepMemory.target, creepMemory.toHeal, creepMemory.sId) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return false;
                case 'powerSourceRanger':
                    /*
                    if (creepMemory.target=='W9S28' || creepMemory.target=='E1S29') {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    */
                    if (!(spawnToSpawn.createPowerSourceRanger(creepMemory.target, creepMemory.big) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return false;
                case 'wanderer':
                    if (!(spawnToSpawn.createWanderer(creepMemory.target) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'onlyMineralDefender':
                    if (!(spawnToSpawn.createOnlyMineralDefender(creepMemory.target, creepMemory.home) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'onlyMineralMiner':
                    if (!(spawnToSpawn.createOnlyMineralMiner(creepMemory.target, creepMemory.home) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'onlyMineralHauler':
                    if (!(spawnToSpawn.createOnlyMineralHauler(creepMemory.target, creepMemory.home) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'redneck':
                    if (!(spawnToSpawn.createRedneck(creepMemory.target, creepMemory.simp) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'oneWayInterSharder':
                    if (!(spawnToSpawn.createOneWayInterSharder(creepMemory.targetShardName, creepMemory.portalRoomName, creepMemory.portalId, creepMemory.targetRoomName, creepMemory.roleWillBe, creepMemory.body, creepMemory.route) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'noLegWorker':
                    if (!(spawnToSpawn.createNoLegWorker(creepMemory.energy) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'symbolPicker':
                    if (!(spawnToSpawn.createSymbolPicker(creepMemory.target, creepMemory.home, creepMemory.sybId) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'symbolFactorier':
                    if (!(spawnToSpawn.createSymbolFactorier() < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'depoHarvester':
                    if (!(spawnToSpawn.createDepoHarvester(creepMemory.target, creepMemory.home, creepMemory.depid) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'depoHauler':
                    if (!(spawnToSpawn.createDepoHauler(creepMemory.target, creepMemory.home, creepMemory.depid) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'depoStorage':
                    if (!(spawnToSpawn.createDepoStorage(creepMemory.target, creepMemory.home, creepMemory.depid) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'dedicatedUpgraderHauler':
                    if (!(spawnToSpawn.createDedicatedUpgraderHauler() < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'recCtner':
                    if (creepMemory.exts.length==0) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                        return
                    }
                    if (!(spawnToSpawn.createRecCtner(creepMemory.exts) < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                case 'tester':
                    if (!(spawnToSpawn.createTester() < 0)) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return;
                default:
                    if (spawnToSpawn.createCustomCreep(creepMemory.energy, creepMemory.role, creepMemory.target) == OK) {
                        removeElementInArrayByElement(creepInfo, spawnQ);
                    }
                    return
            }
        }
        return
    }
}

global.removeElementInArrayByElement = function (element, array) {
    let indexToRemove = array.indexOf(element);
    array.splice(indexToRemove, 1);
}

global.updateSpawnQueueTimer = function (room) {
    if (room.memory.spawnQueueTimer == undefined) {
        room.memory.spawnQueueTimer = 0;
        room.memory.forSpawning = {}
        room.memory.forSpawning.spawningQueue = []
        return false
    }
    else if (room.memory.forSpawning.spawningQueue.length > 44) {
        room.memory.forSpawning.spawningQueue = [];
        fo('bad spawning queue ' + room.name + ' cleared');
    }
    else {
        let spawnQueueTimer = room.memory.spawnQueueTimer;
        let noOfSpawns = room.find(FIND_STRUCTURES, { filter: s => s.structureType == STRUCTURE_SPAWN }).length;
        let spawnTimeThreshold = 6 * noOfSpawns;
        if (spawnQueueTimer > spawnTimeThreshold) { // spawn waiting for awhile
            room.memory.spawnQueueTimer = 0; // reset timer
            fo(room.name + ' run spawn check');
            return true // run spawn role check
            //clearSpawnQueue(room.name)
        }
        else { // spawn is busy
            let noOfAvailableSpawns = ifSpawnAvailable(room.name).length;
            room.memory.spawnQueueTimer += noOfAvailableSpawns + 0.05; // update free spawn #
            //console.log(room.name + ' timer ', spawnQueueTimer)
            return false
        }
    }
}

global.coreCtnNumTester = function (r) {
    let sps = r.find(FIND_MY_STRUCTURES, { filter: o => o.structureType == STRUCTURE_SPAWN });
    let conts = r.find(FIND_STRUCTURES, { filter: o => o.structureType == STRUCTURE_CONTAINER });
    let corconts = 0;
    for (let cont of conts) {
        // middle place container
        let countornot = false
        for (let sp of sps) {
            if (cont.pos.getRangeTo(sp) < 3) {
                countornot = true;
                break;
            }
        }
        if (countornot) {
            corconts++;
        }
    }
    return corconts
}

global.balanceNoLegWorkerAndMover = function (r) {
    let rn = r.name;
    let currentRCL = r.controller.level;
    let spq = r.memory.forSpawning.spawningQueue;

    if (r.memory.newBunker == undefined) { // old dickhead bunker core part
        if (r.memory.coreBaseReady == undefined) {
            if (Game.time % 77 <= 10) {
                let sps = r.find(FIND_MY_STRUCTURES, { filter: o => o.structureType == STRUCTURE_SPAWN });
                let conts = r.find(FIND_STRUCTURES, { filter: o => o.structureType == STRUCTURE_CONTAINER });
                let corconts = 0;
                for (let cont of conts) {
                    // middle place container
                    let countornot = false
                    for (let sp of sps) {
                        if (cont.pos.getRangeTo(sp) < 3) {
                            countornot = true;
                            break;
                        }
                    }
                    if (countornot) {
                        corconts++;
                    }
                }
                if (corconts == 2) {
                    r.memory.coreBaseReady = true;
                }
            }
        }
        else if (r.memory.coreBaseReady == true) {
            r.memory.forSpawning.roomCreepNo.minCreeps['dickHead'] = 4;
        }
    }
    else { // new dickhead bunker core part
        let ank = r.memory.newBunker.setPoint;
        let ori = r.memory.newBunker.orient;
        if (r.memory.newBunker.dicks1 == undefined) {
            if (ori == 'L') {
                r.memory.newBunker['dicks1'] = { x: ank.x + 1, y: ank.y - 1, ready: false };
                r.memory.newBunker['dicks2'] = { x: ank.x + 1, y: ank.y + 1, ready: false };
            }
            else if (ori == 'U') {
                r.memory.newBunker['dicks1'] = { x: ank.x + 1, y: ank.y + 1, ready: false };
                r.memory.newBunker['dicks2'] = { x: ank.x - 1, y: ank.y + 1, ready: false };
            }
            else if (ori == 'D') {
                r.memory.newBunker['dicks1'] = { x: ank.x + 1, y: ank.y - 1, ready: false };
                r.memory.newBunker['dicks2'] = { x: ank.x - 1, y: ank.y - 1, ready: false };
            }
            else if (ori == 'R') {
                r.memory.newBunker['dicks1'] = { x: ank.x - 1, y: ank.y + 1, ready: false };
                r.memory.newBunker['dicks2'] = { x: ank.x - 1, y: ank.y - 1, ready: false };
            }
            else {
                fo('function spawn wrong dicks positions ' + r.name);
            }
        }
        else {
            let foundexts = r.lookForAtArea(LOOK_STRUCTURES, r.memory.newBunker.dicks1.y - 1, r.memory.newBunker.dicks1.x - 1, r.memory.newBunker.dicks1.y + 1, r.memory.newBunker.dicks1.x + 1, true);
            if (foundexts && foundexts.length > 2) {
                r.memory.newBunker.dicks1.ready = true;
            }
            foundexts = r.lookForAtArea(LOOK_STRUCTURES, r.memory.newBunker.dicks2.y - 1, r.memory.newBunker.dicks2.x - 1, r.memory.newBunker.dicks2.y + 1, r.memory.newBunker.dicks2.x + 1, true);
            if (foundexts && foundexts.length > 2) {
                r.memory.newBunker.dicks2.ready = true;
            }
            if (r.memory.newBunker.dicks1.ready && r.memory.newBunker.dicks2.ready) {
                if (r.memory.newBunker && r.memory.newBunker.layout && r.memory.newBunker.layout.recCtn && r.memory.newBunker.layout.recCtn.length>0) {
                    r.memory.forSpawning.roomCreepNo.minCreeps['linkKeeper'] = 1;
                }
                else {
                    r.memory.forSpawning.roomCreepNo.minCreeps['linkKeeper'] = 0;
                }
            }
        }
    }
    
    
    r.memory.forSpawning.roomCreepNo.minCreeps['builder'] = updateBuilderNo(rn);
    r.memory.forSpawning.roomCreepNo.creepEnergy['builder'] = r.memory.ECap;
    
    if (Game.time % 50 == 5) {
        r.memory.forSpawning.roomCreepNo.minCreeps['wallRepairer'] = updateWallRampartRepairerNo(r.name);
        r.memory.forSpawning.roomCreepNo.creepEnergy['wallRepairer'] = r.memory.ECap;
    }
    
    if (currentRCL <= 3) {
        r.memory.forSpawning.roomCreepNo.minCreeps.noLegWorker = 0;
        r.memory.forSpawning.roomCreepNo.minCreeps.mover = 2;
        
        r.memory.forSpawning.roomCreepNo.creepEnergy['upgrader'] = r.memory.ECap;

        r.memory.forSpawning.roomCreepNo.minCreeps.lorry = 1;
        r.memory.forSpawning.roomCreepNo.creepEnergy['lorry'] = 300;

        if (r.memory.ECap < 550) {
            r.memory.forSpawning.roomCreepNo.minCreeps['repairer'] = 1;
            r.memory.forSpawning.roomCreepNo.creepEnergy['repairer'] = 300;
        }
        if (Game.time % 107 <= 10) {
            r.memory.forSpawning.roomCreepNo.minCreeps['upgrader'] = earlyRoomUpgraderBalancing(r, r.memory.ECap, r.memory.forSpawning.roomCreepNo.minCreeps['upgrader']);
        }
    }
    else {
        r.memory.forSpawning.roomCreepNo.minCreeps.mover = 0;
        // middle core structures
        if (r.memory.newBunker) {
            if (r.storage && r.memory.newBunker && r.memory.newBunker.layout && r.memory.newBunker.layout.recCtn && r.memory.newBunker.layout.recCtn.length>0) {
                r.memory.forSpawning.roomCreepNo.minCreeps['linkKeeper'] = 1;
            }
            
            if (r.memory.forSpawning.roomCreepNo.minCreeps['newDickHead'] == undefined || r.memory.forSpawning.roomCreepNo.minCreeps['newDickHead'] ==0) {
                let tws = r.find(FIND_MY_STRUCTURES, {filter:t=>t.structureType==STRUCTURE_TOWER});
                if (tws.length>0) {
                    for (let tw of tws) {
                        if (tw.pos.findInRange(FIND_MY_CREEPS, 1, {filter:c=>c.memory.role=='dickHeadpp'}).length>1) {
                            r.memory.forSpawning.roomCreepNo.minCreeps['newDickHead'] = 2;
                            break;
                        }
                    }  
                }
            }
        }

        if (r.storage == undefined) {
            if (r.memory.ECap < 550) {
                r.memory.forSpawning.roomCreepNo.minCreeps['repairer'] = 1;
                r.memory.forSpawning.roomCreepNo.creepEnergy['repairer'] = 300;
            }
            /*else {
                r.memory.forSpawning.roomCreepNo.creepEnergy.noLegWorker = r.memory.ECap;
                r.memory.forSpawning.roomCreepNo.creepEnergy.mover = r.memory.ECap;
                if (spq.length == 0) {
                    if (r.memory.forSpawning.roomCreepNo.minCreeps.noLegWorker<3) {
                        r.memory.forSpawning.roomCreepNo.minCreeps.noLegWorker++;
                        r.memory.forSpawning.roomCreepNo.minCreeps.mover = r.memory.forSpawning.roomCreepNo.minCreeps.noLegWorker;
                        r.memory.forSpawning.spawningQueue.push({ memory: { role: 'mover', ifRescue: false }, priority: 10 });
                        return false
                    }
                }
            }*/

            /*r.memory.forSpawning.roomCreepNo.minCreeps.noLegWorker = 0;
            r.memory.forSpawning.roomCreepNo.minCreeps['builder'] = updateBuilderNo(rn);
            r.memory.forSpawning.roomCreepNo.creepEnergy['builder'] = r.memory.ECap;
            
            r.memory.forSpawning.roomCreepNo.minCreeps['upgrader'] = earlyRoomUpgraderBalancing(r, r.memory.ECap, r.memory.forSpawning.roomCreepNo.creepEnergy['upgrader']);
            r.memory.forSpawning.roomCreepNo.creepEnergy['upgrader'] = r.memory.ECap;
            */

            ts = r.find(FIND_STRUCTURES, { filter: o => o.structureType == STRUCTURE_TOWER });

            if (ts.length > 0) {
                r.memory.forSpawning.roomCreepNo.minCreeps['attacker'] = 0;
            }
        }
        else { // storage defined
            r.memory.forSpawning.roomCreepNo.minCreeps.noLegWorker = 0;
            r.memory.forSpawning.roomCreepNo.minCreeps['repairer'] = 0;
            if (r.memory.coreBaseReady == true) {
                r.memory.forSpawning.roomCreepNo.minCreeps.lorry = 1;
                r.memory.forSpawning.roomCreepNo.minCreeps['loader'] = 1;
                if (currentRCL <= 7) {
                    r.memory.forSpawning.roomCreepNo.creepEnergy['loader'] = Math.min(400, r.memory.ECap);
                    r.memory.forSpawning.roomCreepNo.creepEnergy['lorry'] = Math.min(400, r.memory.ECap);
                    r.memory.forSpawning.roomCreepNo.creepEnergy['pickuper'] = Math.min(400, r.memory.ECap);
                    if (r.memory.maintainerCheck != undefined || Game.shard.name == 'shardSeason') {
                        r.memory.forSpawning.roomCreepNo.minCreeps['loader'] = 0;
                    }
                }
                else {
                    r.memory.forSpawning.roomCreepNo.creepEnergy['loader'] = Math.min(800, r.memory.ECap);
                    r.memory.forSpawning.roomCreepNo.creepEnergy['lorry'] = Math.min(800, r.memory.ECap);
                    r.memory.forSpawning.roomCreepNo.creepEnergy['pickuper'] = Math.min(800, r.memory.ECap);
                }
            }
            else {
                r.memory.forSpawning.roomCreepNo.minCreeps.lorry = 1;
                r.memory.forSpawning.roomCreepNo.minCreeps.pickuper = 1;
                r.memory.forSpawning.roomCreepNo.creepEnergy.lorry = Math.min(600, r.memory.ECap);
                r.memory.forSpawning.roomCreepNo.creepEnergy.pickuper = Math.min(600, r.memory.ECap);
            }
            
            if (Game.time % 50 == 5) {
                r.memory.forSpawning.roomCreepNo.minCreeps['upgrader'] = 0;
                r.memory.forSpawning.roomCreepNo.creepEnergy['upgrader'] = r.memory.ECap;

                ts = r.find(FIND_STRUCTURES, { filter: o => o.structureType == STRUCTURE_TOWER });
                if (ts.length > 0) {
                    r.memory.forSpawning.roomCreepNo.minCreeps['repairer'] = 0;
                }
                else {
                    r.memory.forSpawning.roomCreepNo.creepEnergy['repairer'] = 300;
                }
            }

            if (r.terminal || r.memory.powerSpawnId) {
                r.memory.forSpawning.roomCreepNo.minCreeps['balancer'] = 1;
            }

            if (currentRCL >= 7) {
                r.memory.forSpawning.roomCreepNo.minCreeps['loader'] = 1;

                r.memory.forSpawning.roomCreepNo.minCreeps['lorry'] = 1;
                r.memory.forSpawning.roomCreepNo.minCreeps['pickuper'] = 1;
                r.memory.forSpawning.roomCreepNo.minCreeps['balancer'] = 1;
            }
            if (currentRCL > 7) {
                r.memory.forSpawning.roomCreepNo.minCreeps['dickHead'] = 0;
                r.memory.forSpawning.roomCreepNo.minCreeps['loader'] = 0;
                r.memory.forSpawning.roomCreepNo.minCreeps['lorry'] = 1;
                r.memory.forSpawning.roomCreepNo.minCreeps['pickuper'] = 1;
                r.memory.forSpawning.roomCreepNo.minCreeps['balancer'] = 1;
                r.memory.forSpawning.roomCreepNo.creepEnergy['lorry'] = Math.min(800, r.memory.ECap);
                
                /*
                // extra lorry for scoring
                let thisDecoderTp = Memory.mapInfo[r.name].decoderInfo.t;
                if (r.storage.store[thisDecoderTp] > 50000) {
                    r.memory.forSpawning.roomCreepNo.minCreeps['lorry'] = 2;
                }
                */
            }
        }
    }
    return true
}

global.newEarlyRemoteMing = function (r) {

}

//////////////////////////////////////////////////////////////////////////////////////////

global.justForOnce = function () {
    let array = [1, 2, 3, 4];
    removeElementInArrayByElement(2, array);
    console.log(array)
}

global.changeAllMyCreeps = function () {
    /*for (let name in Game.creeps) {
        if (Game.creeps[name].memory.role == 'ultimateUpgrader') {
            Game.creeps[name].memory.boosted = true;
        }
    }*/
    for (let name in Game.creeps) {
        if (Game.creeps[name].memory.role == 'powerSourceLorry') {
            Game.creeps[name].memory.target = 'E94N12';
            Game.creeps[name].memory.role = 'begger';
        }
    }
}

global.spawnPowerLorries = function () {
    //Game.rooms['E92N12'].memory.forSpawning.spawningQueue.push({memory:{role: 'powerSourceLorry', target: 'E90N11', home: 'E92N11'},priority: 1.1});
    //Game.rooms['E92N12'].memory.forSpawning.spawningQueue.push({memory:{role: 'powerSourceLorry', target: 'E90N11', home: 'E92N11'},priority: 1.1});
    Game.rooms['E92N11'].memory.forSpawning.spawningQueue.push({ memory: { role: 'powerSourceLorry', target: 'E90N11', home: 'E92N11' }, priority: 1.1 });
    Game.rooms['E92N11'].memory.forSpawning.spawningQueue.push({ memory: { role: 'powerSourceLorry', target: 'E90N11', home: 'E92N11' }, priority: 1.1 });
    Game.rooms['E92N11'].memory.forSpawning.spawningQueue.push({ memory: { role: 'powerSourceLorry', target: 'E90N11', home: 'E92N11' }, priority: 1.1 });
}
