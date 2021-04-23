/*var compoundFormulae = {
  'H': ['O','OH'],
  'O': ['H','OH'],
  'U': ['L','UL'],
  'L': ['U','UL'],
  'Z': ['K','ZK'],
  'K': ['Z','ZK'],
  'ZK': ['UL','G'],
  'UL': ['ZK','G'],
  'L': ['O','LO'],
  'O': ['L','LO'],
  'U': ['H','UH'],
  'H': ['U','UH']
};*/

var listOfCompoundsToCreateWithPriority_ = [
    "XUH2O",
    "XKHO2",
    "XLHO2",
    "XZH2O",
    "XZHO2",
    "XGHO2",

    //"UH2O",
    //"KHO2",
    //"LHO2",
    "ZH2O",
    "ZHO2",
    "GHO2",

    "OH",
    
    //"LO", // heal
    "ZO", // move
    //"GO", // defence
    "G",
    //"KO", // range
    
    //"ZK",
    //"UL",
    
    //"ZH", // dismantle
    //"UH", // melee
    
    "XGH2O", // upgrade
    "GH2O",
    //"GH",

    "XLH2O", // repaire, build
    //"LH2O",
    //"LH",

    // stop producing harvest boost
    /*"XUHO2",
    "UHO2",
    "UO",*/

    // stop producing carry boost
    "XKH2O",
    "KH2O",
    "KH",

];

var listOfCompoundsToCreateWithPriority = [
    'XZH2O',
    'XZHO2',
    'ZH2O',
    'ZHO2',
    'ZH',
    'ZO',
];

global.startLabber = function(room) {
    if (room.memory.forLab&&room.memory.forLab.toCreate) {
        if (
            //(room.terminal && _.sum(room.terminal.store) > 250000) ||
            (mineralTotalInRoom(room, inverseReaction(room.memory.forLab.toCreate)[0]) > 3000) && (mineralTotalInRoom(room, inverseReaction(room.memory.forLab.toCreate)[1]) > 3000)
        ) {
            return true
        }
        else {
            return false
        }
    }
}

global.labRun = function(room) {
    if (room.memory.forLab) {
        for (let outLabId of room.memory.forLab.outLabs) {
            let outLab = Game.getObjectById(outLabId);
            outLab.runReaction(Game.getObjectById(room.memory.forLab.inLabs[0]),Game.getObjectById(room.memory.forLab.inLabs[1]));
        }
        if (room.memory.forLab.boostLabs) {
            for (let tp in room.memory.forLab.boostLabs) {
                if (tp == room.memory.forLab.toCreate) { // boost mat happens to be the one we are creating now
                    let outBoostLab = Game.getObjectById(room.memory.forLab.boostLabs[tp]);
                    outBoostLab.runReaction(Game.getObjectById(room.memory.forLab.inLabs[0]),Game.getObjectById(room.memory.forLab.inLabs[1]));
                }
            }
        }
    }
}

global.reactionTimeInterval = function(room) {
    if (room.memory.forLab) {
        return REACTION_TIME[room.memory.forLab.toCreate]
    }
    else {
        return 100000000
    }
}

global.labWorkToDo = function (creep) {
    if (!creep.room.memory.forLab || !creep.room.memory.forLab.toCreate) {
        return false
    }
    else {
        if (creep.memory.labWork == undefined) {
            creep.memory.labWork = { target: undefined, mineralType: undefined, keep: undefined };
        }
        let room = creep.room;

        let inLabsId = room.memory.forLab.inLabs;
        let outLabsId = room.memory.forLab.outLabs;
        let boostLabsObj = room.memory.forLab.boostLabs;
        let toCreate = room.memory.forLab.toCreate;
        let inMinerals = [inverseReaction(toCreate)[0], inverseReaction(toCreate)[1]];

        for (let index of [0, 1]) { // check if inLabs have correct minerals
            let lab = Game.getObjectById(inLabsId[index]);
            let otherLab = Game.getObjectById(inLabsId[1 - index]);
            if ((lab.mineralType) && (lab.mineralType != inMinerals[index])) { // if lab mineral is not wanted
                creep.memory.labWork.target = room.storage.id; // get compound to storage
                creep.memory.labWork.keep = inLabsId[index]; // lab depleted
                creep.memory.labWork.mineralType = lab.mineralType;
                return true;
            }
        }

        for (let index of [0, 1]) { // check if inLabs have correct minerals
            let lab = Game.getObjectById(inLabsId[index]);
            let creeyCarryBonus = 0
            if (creep.carry[inMinerals[index]]) {
                creeyCarryBonus = creep.carry[inMinerals[index]];
            }
            if ((lab.mineralAmount < 2000) && (allMyResourceInStorageAndTerminal(creep.room, inMinerals[index]) + creeyCarryBonus > 0) ) {
                creep.memory.labWork.target = inLabsId[index]; // get in-resource to lab
                if (room.terminal.store[inMinerals[index]] && room.terminal.store[inMinerals[index]] > 0) {
                    creep.memory.labWork.keep = room.terminal.id;
                }
                else if (room.storage.store[inMinerals[index]] && room.storage.store[inMinerals[index]] > 0){ // terminal depleted, go storage
                    creep.memory.labWork.keep = room.storage.id;
                }
                else {
                    return false
                }
                creep.memory.labWork.mineralType = inMinerals[index];
                return true;
            }
        }

        for (let outLabId of outLabsId) { // check if outLabs have correct minerals
            let lab = Game.getObjectById(outLabId);
            if ((lab.mineralType) && (lab.mineralType != toCreate)) { // if lab mineral is not wanted
                creep.memory.labWork.target = room.terminal.id; // get compound to terminal
                creep.memory.labWork.keep = outLabId; // lab depleted
                creep.memory.labWork.mineralType = lab.mineralType;
                return true;
            }
            else {
                if (lab.mineralAmount > 2500) {
                    creep.memory.labWork.target = room.terminal.id; // get compound to terminal
                    creep.memory.labWork.keep = outLabId; // lab depleted
                    creep.memory.labWork.mineralType = toCreate;
                    return true;
                }
            }
        }
        
        if (boostLabsObj && Object.keys(boostLabsObj.length>0)) {
            for (let boostTp in boostLabsObj) { // check if boostlabs have correct minerals
                let lab = Game.getObjectById(boostLabsObj[boostTp]);
                if ((lab.mineralType) && (lab.mineralType != boostTp)) { // if lab mineral is not wanted
                    creep.memory.labWork.target = room.terminal.id; // get compound to terminal
                    creep.memory.labWork.keep = boostLabsObj[boostTp]; // lab depleted
                    creep.memory.labWork.mineralType = lab.mineralType;
                    return true;
                }
                else {
                    if (lab.mineralAmount > 2100) { // too much, get rid of some
                        creep.memory.labWork.target = room.terminal.id; // get compound to terminal
                        creep.memory.labWork.keep = boostLabsObj[boostTp]; // lab depleted
                        creep.memory.labWork.mineralType = boostTp;
                        return true;
                    }
                    else if (lab.mineralAmount <1500) { // not enough, put some
                        creep.memory.labWork.target = boostLabsObj[boostTp]; // get compound to terminal
                        creep.memory.labWork.keep = room.terminal.id; // lab depleted
                        creep.memory.labWork.mineralType = boostTp;
                        return true;
                    }
                }
            }
        }
        return false
    }
    /*if (creep.memory.labWork == undefined) {
        creep.memory.labWork = {target: undefined, mineralType: undefined, keep: undefined};
    }
    let room = creep.room;
    let labs = room.find(FIND_MY_STRUCTURES, {filter: c => c.structureType == STRUCTURE_LAB});

    let minInMineral = 1000000;

    for (let lab of labs) {
        let flag = room.lookForAt(LOOK_FLAGS,lab)[0];
        if (flag != undefined) {
            let wantedMineralType = getMineralType(flag.name);
            if ((lab.mineralType)&&(lab.mineralType!=wantedMineralType)) { // if lab mineral is not wanted
                creep.memory.labWork.target = room.terminal.id; // get compound to terminal
                creep.memory.labWork.keep = lab.id // lab depleted
                creep.memory.labWork.mineralType = lab.mineralType;
                return true;
            }
            else {
                if (flag.color == COLOR_CYAN) { // 4 is cyan for out lab
                    if (lab.mineralAmount>2500) {
                        creep.memory.labWork.target = room.terminal.id; // get compound to terminal
                        creep.memory.labWork.keep = lab.id // lab depleted
                        creep.memory.labWork.mineralType = wantedMineralType;
                        return true;
                    }
                }
                else if (flag.color == COLOR_GREEN) { // 5 is green for in labs
                    // labber termination code
                    //minInMineral = Math.min(mineralTotalInRoom(creep.room,flag.name),minInMineral);
                    //if (minInMineral<2000) {
                    //    //console.log(creep.room + 'lack mineral '+ flag.name);
                    //    creep.room.memory.forSpawning.roomCreepNo.minCreeps.labber = 0;
                    //}
                    if (lab.mineralAmount<2000) {
                        creep.memory.labWork.target = lab.id; // get in-resource to lab
                        creep.memory.labWork.keep = room.terminal.id; // terminal depleted
                        creep.memory.labWork.mineralType = wantedMineralType;
                        return true;
                    }
                }
            }
        }
    }
    return false*/
}

global.mineralTotalInRoom = function(room,mineralType) {
    let terminalStored = room.terminal.store[mineralType];
    if (terminalStored == undefined) {
        terminalStored = 0;
    }
    let storageStored = room.storage.store[mineralType];
    if (storageStored == undefined) {
        storageStored = 0;
    }
    return terminalStored+storageStored
}

global.getMineralType = function(stringM) {
    let len = stringM.length;
    return stringM.substring(1,len)
}

global.boostingMineralToKeepInLab = function() {
    //return ['XGH2O']
    return []
}

global.removelLabFlags = function(roomName) {
    let room = Game.rooms[roomName];
    let labs = room.find(FIND_MY_STRUCTURES, {filter: c => c.structureType == STRUCTURE_LAB});
    for (let lab of labs) {
        if (!boostingMineralToKeepInLab().includes(lab.mineralType)) {
            let flag = room.lookForAt(LOOK_FLAGS,lab)[0];
            if (flag != undefined) {
                flag.remove();
            }
        }
    }
}

global.cacheLabsInAndOut = function(roomName) {
    let room = Game.rooms[roomName];
    let labs = room.find(FIND_MY_STRUCTURES, {filter: c => c.structureType == STRUCTURE_LAB});
    let cachedLabs = room.memory.forLab;
    let labsno = labs.length;
    
    if (labsno < 3) {
        if (labsno == 1) { // possibly a GH lab
            if (labs[0].pos.getRangeTo(room.controller)<3) {
                room.memory.forLab = {inLabs:[], outLabs:[], boostLabs: {'XGH2O': labs[0].id}, toCreate:undefined};
            }
            else {
                if (room.memory.forLab) {
                    // pass
                }
                else {
                    room.memory.forLab = {inLabs:[], outLabs:[], boostLabs: {}, toCreate:undefined};
                }
            }
        }
        else {
            return
        }
    }
    else {
        let recache = false;
        if (cachedLabs == undefined || cachedLabs.inLabs == undefined || cachedLabs.outLabs == undefined) {
            room.memory.forLab = {inLabs:[], outLabs:[], toCreate:undefined};
            recache = true;
        }
        else {
            let labsnow = cachedLabs.inLabs.length + cachedLabs.outLabs.length;
            if (cachedLabs.inLabs.length>2 || cachedLabs.outLabs.length>8) { // check in and out labs overflow
                room.memory.forLab.inLabs = [];
                room.memory.forLab.outLabs = [];
                room.memory.forLab.boostLabs = {};
                recache = true;
            }
            if (room.memory.forLab.boostLabs) { // add in boost lab
                labsnow += Object.keys(room.memory.forLab.boostLabs).length;
            }
            if (labsnow>10) { // check all number over flow
                fo('o, o, ' + roomName + ' lab mem over flow...')
                room.memory.forLab.inLabs = [];
                room.memory.forLab.outLabs = [];
                room.memory.forLab.boostLabs = {};
                return
            }
            
            // if lab # changed, recache
            if (labsno !== labsnow) {
                recache = true;
            }
            else { // check if in labs are in range of others (newly built causing wrong cached)
                for (let oldinlabid of room.memory.forLab.inLabs) {
                    let oldinlab = Game.getObjectById(oldinlabid);
                    for (let labi of labs) {
                        if (labi != oldinlab) { // not myself
                            if (oldinlab.pos.getRangeTo(labi)>2) {
                                room.memory.forLab.inLabs = [];
                                room.memory.forLab.outLabs = [];
                                room.memory.forLab.boostLabs = {};
                                recache = true;
                                fo('wrong lab cached, recache')
                            }
                        }
                    }
                }
            }
        }
        
        if (recache) {
            let inlabno = 0;
            for (let lab of labs) {
                if (inlabno==2) { // if find enough inlabs, add to outlabs
                    room.memory.forLab.outLabs.push(lab.id);
                }
                else {
                    let addAsInLab = true;
                    // loop through all other labs, if all dist <=2, add to inlab and add inlabno count
                    for (let labi of labs) {
                        if (lab.pos.getRangeTo(labi)>2) {
                            addAsInLab = false;
                        }
                    }
                    if (addAsInLab) {
                        room.memory.forLab.inLabs.push(lab.id);
                        inlabno += 1;
                    }
                    else {
                        room.memory.forLab.outLabs.push(lab.id);
                    }
                }
                //room.memory.forLab.toCreate = toCreate;
            }
            Game.rooms[roomName].memory.forSpawning.roomCreepNo.creepEnergy.labber = 600;
        }
    }
}

global.inverseReaction = function(compound) {
    for(let a in REACTIONS){
        for(let b in REACTIONS[a]){
            if (compound == REACTIONS[a][b]) {
                return [a,b]
            }
        }
    }
}

global.pickACompoundToProduce = function (roomName) {
    let room = Game.rooms[roomName];
    let forLab = room.memory.forLab;
    let allMStatus = allAllMineralsSituations()
    
    if (forLab) {
        let mostlikely = 0;
        let picked = undefined;
        for (let toCreate of listOfCompoundsToCreateWithPriority) {
            //fo(toCreate)
            let [mat1, mat2] = inverseReaction(toCreate);
            let allMineralStituationObject = room.memory.mineralThresholds.currentMineralStats;
            let storageThreshold = room.memory.mineralThresholds.storageThreshold;
            let mat1Amount = allMineralStituationObject[mat1];
            let mat2Amount = allMineralStituationObject[mat2];
            let toCompound = allMineralStituationObject[toCreate];
            //fo(mat1Amount + ', ' + mat2Amount)
            if (mat1Amount>1500&&mat2Amount>1500&&(forLab.toCreate==undefined||allMStatus[toCreate])) {
                if (mat1Amount+mat2Amount>mostlikely) {
                    mostlikely = mat1Amount+mat2Amount;
                    picked = toCreate;
                }
            }
        }
        if (picked != undefined) {
            forLab.toCreate = picked;
            console.log(roomName + ' reaction changed to ' + picked);
            room.memory.forSpawning.roomCreepNo.minCreeps.labber=1;
            room.memory.forSpawning.roomCreepNo.creepEnergy.labber=600;
            return picked
        }
    }
    return fo('nothing to create')
}

// run every xxx ticks to check if current lab has finished and need to run new lab according to the materials storage in storage and terminal
global.changeMineralProductionInRoom = function(roomName) {
    let room = Game.rooms[roomName];
    let forLab = room.memory.forLab;
    // if room has forLab, start checking
    if (forLab) {
        let toCreate = forLab.toCreate;
        if (!toCreate || toCreate == 'KH' || toCreate == 'KH2O' || toCreate == 'XKH2O' || toCreate == 'UO' || toCreate == 'UHO2' || toCreate == 'XUHO2') {
            // get a random compound to create
            forLab.toCreate = pickRandomElementFromList();
        }
        let [mat1, mat2] = inverseReaction(toCreate);
        let allMineralStituationObject = room.memory.mineralThresholds.currentMineralStats;
        let storageThreshold = room.memory.mineralThresholds.storageThreshold;
        let mat1Amount = allMineralStituationObject[mat1];
        let mat2Amount = allMineralStituationObject[mat2];
        let toCompound = allMineralStituationObject[toCreate];

        // if raw mats not enough or compound over flow
        if (mat1Amount < 3000 || mat2Amount < 3000 || toCompound > storageThreshold[toCreate]) {
            console.log('roomName' + ' reaction ' + toCreate + ' not continuing ')
            for (let newToCreateID in listOfCompoundsToCreateWithPriority) {
                let newToCreate = listOfCompoundsToCreateWithPriority[newToCreateID];
                let [newMat1, newMat2] = inverseReaction(newToCreate);
                let newMat1Amount = allMineralStituationObject[newMat1];
                let newMat2Amount = allMineralStituationObject[newMat2];
                let newToCompound = allMineralStituationObject[newToCreate];
                if (newMat1Amount>15000&&newMat2Amount>15000&&newToCompound<storageThreshold[newToCreate]) {
                    forLab.toCreate = newToCreate;
                    console.log('roomName' + ' reaction changed to ' + newToCreate)
                    return
                }
            }
            // get a random compound to create
            let randCompoundToCreate = pickRandomElementFromList(listOfCompoundsToCreateWithPriority);
            forLab.toCreate = randCompoundToCreate;
            console.log('roomName' + ' no reaction and changed to create ',randCompoundToCreate);
            return
        }
        /*else if ((mat1Amount < 10000 || mat2Amount < 10000) && (toCompound < storageThreshold[toCreate])) { // raw mats not enough and have capacity to create
            // request from other rooms, else order or buy
        }*/
        else {
            console.log('roomName' + ' reaction ' + toCreate + ' continue ')
            return
        }
    }
    else { // room does not have labs, return false
        return false
    }
}

// for boosting
global.cacheBoostLabs = function (roomName, toBoost) {
    let room = Game.rooms[roomName];
    let labMemory = room.memory.forLab;
    if (!labMemory) {
        console.log('cache in/out labs first in room ' + roomName);
        cacheLabsInAndOut(roomName);
    }
    
    let boostLabs = room.memory.forLab.boostLabs;
    if (boostLabs == undefined) {
        room.memory.forLab.boostLabs = {};
    }
    
    // check if we already have the boosted lab tyoe
    if (room.memory.forLab.boostLabs[toBoost] != undefined) {
        fo(toBoost + ' is already boosted by one of the labs')
        return true
    }
    else {
        // change one of the out labs to boost labs
        let outLabs = labMemory.outLabs;
        if (outLabs.length < 1) {
            console.log('no valid labs for boosting');
            return false
        }
        else {
            // get one available lab from outLabs
            let boostLabId = outLabs[0];
            // remove it from out labs
            room.memory.forLab.outLabs.splice(0, 1);

            // assign boost lab memory
            room.memory.forLab.boostLabs[toBoost] = boostLabId;
            return true
        }
    }
}

global.checkIfCarryIsBoostLab = function (creep) {
    if (creep.room.memory.forLab && creep.room.memory.forLab.boostLabs) {
        for (let restp in creep.store) {
            if (Object.keys(creep.room.memory.forLab.boostLabs).includes(restp)) {
                let boostLab = Game.getObjectById(creep.room.memory.forLab.boostLabs[restp]);
                if (boostLab.mineralAmount < 1500 && creep.room.memory.mineralThresholds.currentMineralStats[restp]>0) {
                    return [creep.room.memory.forLab.boostLabs[restp], restp]
                }
            }
        }
        // if we are here, none of the carry type is in boostlab
        return [false, false]
    }
    else {
        return [false, false]
    }
}

global.checkRoomBoostLabState = function (room,filltake,tp=undefined) {
    let labMemory = room.memory.forLab;
    if (labMemory) {
        let boostLabMemory = labMemory.boostLabs;
        if (_.isEmpty(boostLabMemory)) {
            return [false, false, false]
        }
        else {
            if (tp == undefined) { // no specific
                for (let toBoost in boostLabMemory) {
                    let availableResourcesInRoom = allMyResourceInStorageAndTerminal(room, toBoost);
                    let boostLabId = boostLabMemory[toBoost];
                    let boostLab = Game.getObjectById(boostLabId);
                    let threshold
                    if (filltake == 'fill') {
                        threshold = 0
                    }
                    else {
                        threshold = 800
                    }
    
                    if ((boostLab.mineralAmount < 1500) && (availableResourcesInRoom > threshold)) { // 800 to avoid creep not carrying enough
                        return [true, toBoost, boostLabId];
                    }
                }
                return [false, false, false]
            }
            else { // specific
                let idd = boostLabMemory[tp];
                if (idd == undefined) { // no such lab
                    return [false, false, false]
                }
                else {
                    return [true, tp, idd];
                }
            }
        }
    }
    else {
        return [false, false, false]
    }
}