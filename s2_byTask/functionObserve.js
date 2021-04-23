global.scanCoridorAndHarvestPower = function(roomName) {
    let room = Game.rooms[roomName];
    let toHarvestInfo = room.memory.goPower;
    if (toHarvestInfo) { // if there is power to harvest already
        console.log('power group spawn timer sat!');
        //harvestPowerSource(toHarvestInfo.time,toHarvestInfo.lorryNum,roomName,toHarvestInfo.powerRoom,1300);
    }
    else { // no power to harvest yet, keep scanning
        watchPowerSource(roomName);
    }
}

global.watchPowerSource = function(roomName) {
    analysePowerInRoom(roomName);
    observerScanCoridorRooms(roomName);
}

global.analysePowerInRoom = function(roomName) {
    let room = Game.rooms[roomName];
    let observedRoomName = room.memory.observedRoomName;
    let toObserveRoom = Game.rooms[observedRoomName];

    if (toObserveRoom) {
        let powerBank = toObserveRoom.find(FIND_STRUCTURES, {filter:s=>s.structureType==STRUCTURE_POWER_BANK});
        if (powerBank.length>0) {
            powerBank = powerBank[0];
            let tilesRound = tilesSurrounded(powerBank);
            if (powerBank.power>4000&&tilesRound>1&&powerBank.ticksToDecay>4950) {
                room.memory.goPower = {'powerRoom':observedRoomName, 'lorryNum': Math.ceil(powerBank.power/1650), 'time': Game.time};
            }
        }
    }
    else {
        console.log(roomName + ' not observed ' + observedRoomName + ' yet!');
    }
}

global.observerScanCoridorRooms = function(observerRoomName) {
    let room = Game.rooms[observerRoomName];
    let toObserveRoomNames = room.memory.powerRoomNames;
    if (toObserveRoomNames==undefined) { // if to observe conridor is not defined
        calcHarvestablePowerRoomName(room);
    }
    else {
        let timeNow = Game.time;
        let iterNum = toObserveRoomNames.length;
        let toObserveRoomName = toObserveRoomNames[timeNow%iterNum];

        let observerId = room.memory.observerId; // find cached observer ID
        if (observerId == undefined) {
            observerId = room.find(FIND_MY_STRUCTURES, {filter: c=> c.structureType == STRUCTURE_OBSERVER})[0].id;
            room.memory.observerId = observerId;
        }

        let observer = Game.getObjectById(observerId);
        observer.observeRoom(toObserveRoomName);
        room.memory.observedRoomName = toObserveRoomName;
    }
}

/*global.observerObserveRoom = function(observerRoomName, toObserveRoomName) {
    let currentTick = Game.time;
    let observerRoom = Game.rooms[observerRoomName];
    if (observerRoom.memory.observedTick&&observerRoom.memory.observedTick+1==currentTick) {
        //console.log(Game.rooms[observerRoom.memory.observedRoomName].find(FIND_CREEPS)[0].owner.username);
        let observedRoomName = observerRoom.memory.observedRoomName;
        let observedRoom = Game.rooms[observedRoomName];
        if (observedRoom) {
            let powerBank = observedRoom.find(FIND_STRUCTURES, {filter:s=>s.structureType==STRUCTURE_POWER_BANK});
            if (powerBank.length>0) {
                powerBank = powerBank[0];
                console.log('found power bank in ' + observedRoomName + ' with ' + tilesSurrounded(powerBank) + ' spaces.');
                observerRoom.memory.observing = false;
                observerRoom.memory.powerBankInRoomName = observedRoomName;
            }
        }
    }
    let observer = observerRoom.find(FIND_MY_STRUCTURES, {filter: c=> c.structureType == STRUCTURE_OBSERVER})[0];
    observer.observeRoom(toObserveRoomName);
    observerRoom.memory.observedTick = currentTick;
    observerRoom.memory.observedRoomName = toObserveRoomName;
}*/

global.calcHarvestablePowerRoomName = function(roomName) {
    let powerRoomNames = [];
    let index = [-3,-2,-1,0,1,2,3];
    let roomCoords = parseRoomName(roomName);
    let worldsize = Game.map.getWorldSize();
    for (let i = 0; i<7; i++) {
        for (let j = 0; j<7; j++) {
            let xx = roomCoords.x+index[i];
            let yy = roomCoords.y+index[j];
            let powerRoomName = generateRoomName(xx,yy);
            if (powerRoomName) {
                let NESWnum = getNumberInRoomName(powerRoomName);
                let EWnum = NESWnum.x;
                let NSnum = NESWnum.y;
                if ( (EWnum%10==0)||(NSnum%10==0) ) {
                    powerRoomNames.push(powerRoomName);
                }
            }
        }
    }
    Game.rooms[roomName].memory.powerRoomNames = powerRoomNames;
}

global.getNumberInRoomName = function(roomName) {
    let roomNameSeparated = roomName.match(/[a-zA-Z]+|[0-9]+/g);

    let EWnum = parseInt(roomNameSeparated[1]);
    let NSnum = parseInt(roomNameSeparated[3]);

    return { x: EWnum, y: NSnum };
}

global.powerspawnProcessPower = function(room) {
    let storage = room.storage;
    let terminal = room.terminal;
    let powerSpawn = Game.getObjectById(room.memory.powerSpawnId);
    if (powerSpawn && powerSpawn.power > 0 && powerSpawn.energy > 50 && terminal.store.energy > 15000 && storage.store.energy>100000) {
        powerSpawn.processPower();
    }
}

global.harvestPowerSource = function(time,numOfLorries,hostRoomName,targetRoomName,interval) {
    if (interval==undefined) {
        interval = 1200;
    }
    if (Game.time == time+5) {
        console.log(hostRoomName+ ' added power group to '+targetRoomName)
        addPowerGroupAtTime(Game.time,targetRoomName,hostRoomName);
    }
    if (Game.time == time+5+interval) {
        console.log(hostRoomName+ ' added power group to '+targetRoomName)
        addPowerGroupAtTime(Game.time,targetRoomName,hostRoomName);
    }
    if (Game.time == time+5+interval*2) {
        console.log(hostRoomName+ ' added power group to '+targetRoomName)
        addPowerGroupAtTime(Game.time,targetRoomName,hostRoomName);
    }
    if (Game.time == time+5+interval*2+666) {
        console.log(hostRoomName+ ' added power lorry group to '+targetRoomName)
        addPowerLorryGroupAtTime(Game.time,targetRoomName,hostRoomName,numOfLorries);
        delete Game.rooms[hostRoomName].memory.goPower;
    }
}

// main function to scan power rooms and maintain power harvesting code
global.powerHarvestingAndScanningMaintainner = function(room){
    let roomName = room.name;
    if (room.memory.mineralThresholds.currentMineralStats.energy > 20000) {
        // if room has observer (and has enough energy to spawn healer creep), start scanning
        let observerId = room.memory.observerId; // find cached observer ID
        if (observerId) {
            // if room in the process of power harvestering, leave it
            let toHarvestInfo = room.memory.goPower;
            if (toHarvestInfo) {
                harvestPowerSource(toHarvestInfo.time, toHarvestInfo.lorryNum, roomName, toHarvestInfo.powerRoom, 1100);
            }
            else { // else, {if room has power room scanning list, get previous scanned room name
                let toObserveRoomNames = room.memory.powerRoomNames;
                if (toObserveRoomNames) {
                    let timeNow = Game.time;
                    let iterNum = toObserveRoomNames.length;
                    let observedRoomNameLastTick = toObserveRoomNames[(timeNow - 1) % iterNum];
                    let observedRoomLastTick = Game.rooms[observedRoomNameLastTick];
                    if (observedRoomLastTick) {
                        // if previous scanned room accessble, get previous room object
                        // check if previous room available for power harvestring, if good
                        let powerBank = observedRoomLastTick.find(FIND_STRUCTURES, { filter: s => s.structureType == STRUCTURE_POWER_BANK });
                        if (powerBank.length > 0) {
                            powerBank = powerBank[0];
                            let tilesRound = tilesSurrounded(powerBank);
                            if (powerBank.power > 1649 * 2 && tilesRound > 1 && powerBank.ticksToDecay > 4900) {
                                console.log(roomName + ' starts to harvest power room ' + observedRoomNameLastTick);
                                room.memory.goPower = { 'powerRoom': observedRoomNameLastTick, 'lorryNum': Math.ceil(powerBank.power / 1650), 'time': timeNow };
                            }
                            else { // there is power but not suitable, keep scanning
                                let toObserveRoomName = toObserveRoomNames[timeNow % iterNum];
                                Game.getObjectById(observerId).observeRoom(toObserveRoomName);
                            }
                        }
                        else { // no power bank found keep scanning
                            let toObserveRoomName = toObserveRoomNames[timeNow % iterNum];
                            Game.getObjectById(observerId).observeRoom(toObserveRoomName);
                        }
                    }
                    else {
                        // else no previously observed room keep scanning
                        let toObserveRoomName = toObserveRoomNames[timeNow % iterNum];
                        Game.getObjectById(observerId).observeRoom(toObserveRoomName);
                    }
                }
                else {
                    //else register scanning list
                    calcHarvestablePowerRoomName(roomName);
                }
            }
            // else register observer
        }
        else {
            let findObserver = room.find(FIND_MY_STRUCTURES, { filter: c => c.structureType == STRUCTURE_OBSERVER });
            if (findObserver.length > 0) {
                observerId = findObserver[0].id;
                room.memory.observerId = observerId;
            }
            else {
                return
            }
        }
    }
    else {
        //console.log(roomName + ' not enough energy to sustain power harvesting');
    }
}

global.hasPowerJobToDo = function (room) {
    let storage = room.storage;
    let terminal = room.terminal;
    let powerSpawnId = room.memory.powerSpawnId;
    if (!powerSpawnId) { // power spawn id not registered, register
        // register power spawn id
        let powerSpawnOBJs = room.find(FIND_MY_STRUCTURES, { filter: c => c.structureType == 'powerSpawn' });
        if (powerSpawnOBJs.length > 0) {
            room.memory['powerSpawnId'] = powerSpawnOBJs[0].id;
            return false
        }
        else {
            return false
        }
    }
    else {
        let powerSpawn = Game.getObjectById(powerSpawnId);
        if (allMyResourceInStorageAndTerminal(room, 'power')>61 && powerSpawn && powerSpawn.power < 40) {
            // go to terminal first, if terminal does not have enough, go to storage
            let powerStoreAmout = terminal.store['power'];
            let toGo = undefined;
            if (powerStoreAmout && powerStoreAmout > 0) {
                return terminal
            }
            else {
                let powerStoreAmout = storage.store['power'];
                if (powerStoreAmout && powerStoreAmout > 0) {
                    return storage;
                }
                else {
                    return false;
                }
            }
        }
        else {
            return false
        }
    }
}

global.cacheInvaderCore = function (r) {
    let invc = r.find(FIND_STRUCTURES, {filter: c=>c.structureType == STRUCTURE_TOWER && c.owner.username=='Invader'});
    let invaders = r.find(FIND_HOSTILE_CREEPS, {filter: s=>s.owner.username=='Invader'});
    
    // new invader core room, avoid
    if (invc.length + invaders.length >0) {
        Memory.rooms[r.name].avoid = true;
        return false
    }
    else { // clear dissapeared invc rooms
        if (Memory.rooms[r.name]) {
            if (Memory.rooms[r.name].avoid) {
                Memory.rooms[r.name].avoid = false;
            }
        }
        else {
            Memory.rooms[r.name] = {'avoid': false};
        }
        return true
    }
}