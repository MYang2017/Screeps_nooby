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

/* to rewrite
cacheLabsInAndOut // erase everything, a in and out labs location detector
labWorkToDo
cacheBoostLabs // assign in/out labs to boost labs, does not change in/out lab number
action.getBoost
*/

var listOfCompoundsToCreateWithPriority = [
    "XUH2O",
    "XKHO2",
    "XLHO2",
    //"XZH2O",
    "XZHO2",
    "XGHO2",
    //"XGH2O", // upgrade
    
    "UH2O",
    "KHO2",
    "LHO2",
    "ZH2O",
    "ZHO2",
    "GHO2",

    "OH",
    
    "LO", // heal
    "ZO", // move
    "GO", // defence
    "G",
    "KO", // range
    
    "UH", // melee

    //"XLH2O", // repaire, build
    "LH2O",
    "LH",

    // stop producing harvest boost
    /*"XUHO2",
    "UHO2",
    "UO",*/

    // stop producing carry boost
    /*
    "XKH2O",
    "KH2O",
    "KH",
    */
    
    "ZK",
    "UL",
    
    "ZH", // dismantle
    
    "GH2O",
    "GH",
];

var listOfCompoundsToCreateWithPriority_ = [
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
            if (!(room.memory.labFillTask && room.memory.labFillTask[outLabId] && room.memory.labFillTask[outLabId].mat!==room.memory.forLab.toCreate)) {
                if (!(Memory.stopReaction && Memory.stopReaction[outLabId] && Memory.stopReaction[outLabId]+2>Game.time)) {
                    outLab.runReaction(Game.getObjectById(room.memory.forLab.inLabs[0]),Game.getObjectById(room.memory.forLab.inLabs[1]));
                }
            }
        }
        if (room.memory.forLab.boostLabs) {
            for (let tp in room.memory.forLab.boostLabs) {
                if (tp == room.memory.forLab.toCreate) { // boost mat happens to be the one we are creating now
                    let outBoostLab = Game.getObjectById(room.memory.forLab.boostLabs[tp].id);
                    if (!(Memory.stopReaction && Memory.stopReaction[room.memory.forLab.boostLabs[tp].id] && Memory.stopReaction[room.memory.forLab.boostLabs[tp].id]+2<Game.time)) {
                        outBoostLab.runReaction(Game.getObjectById(room.memory.forLab.inLabs[0]),Game.getObjectById(room.memory.forLab.inLabs[1]));
                    }
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

global.addLabFillTask = function (rn, enforce=false) {
    // call 1 time per room, look at all labs and decide what should be in and out;
    if (!(enforce || Game.time%49==0)) { // run every 49 seconds or enforce when we add boost labs
        return
    }

    let r = Game.rooms[rn];
    if (r==undefined || r.controller==undefined || !r.controller.my || r.controller.level<6) {
        return
    }
    
    if (r.memory.forLab == undefined) {
        cacheLabsInAndOut(rn);
        return
    }
    
    let bolabobj = r.memory.forLab.boostLabs;
    let labtaskobj = {};
    let bolabsids = [];
    if (bolabobj) {
        for (let boostTp in bolabobj) { // check if boostlabs have correct minerals
            let lab = Game.getObjectById(bolabobj[boostTp].id);
            if (lab == null) {
                r.memory.forLab.boostLabs[boostTp] = undefined;
                cacheLabsInAndOut(rn);
                return
            }
            if (r.memory.forLab.boostLabs[boostTp].t0+2998<Game.time) { // boost lab not used for long
                r.memory.forLab.boostLabs[boostTp] = undefined; // remove
            }
            else {
                bolabsids.push(bolabobj[boostTp].id);
                labtaskobj[bolabobj[boostTp].id] = {act: 'in', mat: boostTp};
            }
        }
    }
    
    let toCreate = r.memory.forLab.toCreate;
    let outlabs = r.memory.forLab.outLabs;
    let inlabs = r.memory.forLab.inLabs;

    if (toCreate!=undefined) {
        if (outlabs.length>0) {
            for (let outlabid of outlabs) {
                let outlab = Game.getObjectById(outlabid);
                if (outlab == null) {
                    cacheLabsInAndOut(rn);
                    return
                }
                if (!bolabsids.includes(outlabid)) {
                    labtaskobj[outlabid] = {act: 'out', mat: toCreate};
                }
            }
        }
        if (inlabs.length>0) {
            if (inlabs.length!=2) {
                fo('in labs no cannot be none 2');
                return
            }
            let inlab0 = Game.getObjectById(inlabs[0]);
            let inlab1 = Game.getObjectById(inlabs[1]);
            if (inlab0 == null || inlab1 == null) {
                cacheLabsInAndOut(rn);
                return
            }
            if (bolabsids.includes(inlabs[0]) || bolabsids.includes(inlabs[1])) {
                // at least 1 in lab used for boost, not going to create any more, both will be unused
            }
            else {
                let inMinerals = [inverseReaction(toCreate)[0], inverseReaction(toCreate)[1]];
                if (inlab0.mineralType == inMinerals[0]) {
                    labtaskobj[inlabs[0]] = {act: 'in', mat: inMinerals[0]};
                    labtaskobj[inlabs[1]] = {act: 'in', mat: inMinerals[1]};
                }
                else if (inlab1.mineralType == inMinerals[0]) {
                    labtaskobj[inlabs[0]] = {act: 'in', mat: inMinerals[1]};
                    labtaskobj[inlabs[1]] = {act: 'in', mat: inMinerals[0]};
                }
                else if (inlab0.mineralType == inMinerals[1]) {
                    labtaskobj[inlabs[0]] = {act: 'in', mat: inMinerals[1]};
                    labtaskobj[inlabs[1]] = {act: 'in', mat: inMinerals[0]};
                }
                else if (inlab1.mineralType == inMinerals[1]) {
                    labtaskobj[inlabs[0]] = {act: 'in', mat: inMinerals[0]};
                    labtaskobj[inlabs[1]] = {act: 'in', mat: inMinerals[1]};
                }
                else {
                    labtaskobj[inlabs[0]] = {act: 'in', mat: inMinerals[0]};
                    labtaskobj[inlabs[1]] = {act: 'in', mat: inMinerals[1]};
                }
            }
        }
    }
    r.memory.labFillTask = labtaskobj;
}

global.labWorkToDo = function (creep) {
    // check room lab fill task
    // pick and do
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
            if (lab==null) {
                cacheLabsInAndOut(creep.room.name);
                return false
            }
            if (boostLabsObj && boostLabsObj[lab.mineralType] && boostLabsObj[lab.mineralType].id == lab.id) {
                return false
            }
            let otherLab = Game.getObjectById(inLabsId[1 - index]);
            if (lab) {
                if ((lab.mineralType) && (lab.mineralType != inMinerals[index])) { // if lab mineral is not wanted
                    creep.memory.labWork.target = room.storage.id; // get compound to storage
                    creep.memory.labWork.keep = inLabsId[index]; // lab depleted
                    creep.memory.labWork.mineralType = lab.mineralType;
                    return true;
                }
            }
            else { // labs not enough to have 2 inlabs or all used for boosts
                return false
            }
        }
        
        for (let index of [0, 1]) { // check if inLabs have correct minerals
            let lab = Game.getObjectById(inLabsId[index]);
            if (boostLabsObj && boostLabsObj[toCreate] && boostLabsObj[toCreate].id == lab.id) {
                return false
            }
            let creeyCarryBonus = 0
            if (creep.store[inMinerals[index]]) {
                creeyCarryBonus = creep.store[inMinerals[index]];
            }
            if ((lab.mineralAmount < 2000) && (allMyResourceInStorageAndTerminal(creep.room, inMinerals[index]) + lab.store[inMinerals[index]] + creeyCarryBonus > 0) ) {
                creep.memory.labWork.target = inLabsId[index]; // get in-resource to lab
                if (room.terminal.store[inMinerals[index]] && room.terminal.store[inMinerals[index]] > 0) {
                    creep.memory.labWork.keep = room.terminal.id;
                }
                else if (room.storage.store[inMinerals[index]] && room.storage.store[inMinerals[index]] > 0){ // terminal depleted, go storage
                    creep.memory.labWork.keep = room.storage.id;
                }
                else if (creep.store[inMinerals[index]]){
                    return true
                }
                else {
                    if (creep.id=='60fc88e796011e139ddd5b66') fo(1)
                    return false
                }
                creep.memory.labWork.mineralType = inMinerals[index];
                return true;
            }
            else if (allMyResourceInStorageAndTerminal(creep.room, inMinerals[index]) + lab.store[inMinerals[index]] + creeyCarryBonus < 1500) {
                if (creep.memory.rerunlab==undefined) {
                    pickACompoundToProduce(creep.room.name);
                    creep.memory.rerunlab = true;
                }
                return false
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
                // if it is a boost lab
                if (boostLabsObj && boostLabsObj[toCreate] && boostLabsObj[toCreate].id == lab.id) {
                    return false
                }
                if (lab.mineralAmount > 2500) {
                    creep.memory.labWork.target = room.terminal.id; // get compound to terminal
                    creep.memory.labWork.keep = outLabId; // lab depleted
                    creep.memory.labWork.mineralType = toCreate;
                    return true;
                }
            }
        }
        
        if (false && boostLabsObj && Object.keys(boostLabsObj.length>0)) {
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
    
    if (room.memory.forLab == undefined)  {
        room.memory.forLab = {inLabs:[], outLabs:[], boostLabs: [], toCreate:undefined};
    }

    let recache = false;
    if (cachedLabs == undefined || cachedLabs.inLabs == undefined || cachedLabs.outLabs == undefined) {
        room.memory.forLab = {inLabs:[], outLabs:[], toCreate:undefined};
        recache = true;
    }
    else {
        let labsnow = cachedLabs.inLabs.length + cachedLabs.outLabs.length;
        if (cachedLabs.inLabs.length>2 || cachedLabs.outLabs.length>8 || labsnow>10 || labsno !== labsnow) { // check in and out labs overflow
            room.memory.forLab.inLabs = [];
            room.memory.forLab.outLabs = [];
            room.memory.forLab.boostLabs = {};
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
        if (labsno==0) {
            return
        }
        else if (labsno<=2) {
            for (let lab of labs) {
                room.memory.forLab.outLabs.push(lab.id);
            }
        }
        else {
            let inlabids = [];
            for (let lab of labs) {
                // loop through all other labs, if all dist <=2, add to inlab and add inlabno count
                let addAsInLab = true;
                for (let labi of labs) {
                    if (lab.pos.getRangeTo(labi)>2) {
                        addAsInLab = false;
                        break
                    }
                }
                if (addAsInLab) {
                    if (room.memory.forLab.inLabs.length<2) {
                        room.memory.forLab.inLabs.push(lab.id);
                        continue;
                    }
                }
                room.memory.forLab.outLabs.push(lab.id);
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
            room.memory.forSpawning.roomCreepNo.minCreeps.labber=0;
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
    if (room.controller == undefined || room.controller.level<6) { // no lab
        return false
    }
    let labMemory = room.memory.forLab;
    if (!labMemory) {
        console.log('cache in/out labs first in room ' + roomName);
        cacheLabsInAndOut(roomName);
    }
    
    let boostLabs = room.memory.forLab.boostLabs;
    if (boostLabs == undefined) {
        room.memory.forLab.boostLabs = {};
        boostLabs = room.memory.forLab.boostLabs;
    }
    
    // check if we already have the boosted lab type
    if (room.memory.forLab.boostLabs[toBoost] != undefined) {
        room.memory.forLab.boostLabs[toBoost].t0 = Game.time;
        if (room.memory.forLab.boostLabs[toBoost].id == undefined || Game.getObjectById(room.memory.forLab.boostLabs[toBoost].id) == null) {
            // lab destroyed
            room.memory.forLab.boostLabs[toBoost] = undefined;
            cacheLabsInAndOut(roomName);
        }
        else { // we have boost lab for this type, check if we have enough mats
            //
            if (room.memory.mineralThresholds.currentMineralStats[toBoost]>=30 || Game.getObjectById(room.memory.forLab.boostLabs[toBoost].id).store[toBoost]>=30) {
                return true
            }
            else {
                fo(room.name + ' need ' + toBoost + ' for boosting!');
                return false
            }
        }
    }
    
    boostLabs = room.memory.forLab.boostLabs;
    
    // reuse in/out labs that already has boost type to boost
    let outLabs = labMemory.outLabs;
    let inLabs = labMemory.inLabs;
    // if lab already has the boost and not assigned, assign
    for (let labidtouse of outLabs.concat(inLabs)) {
        let labtouse = Game.getObjectById(labidtouse);
        if (labtouse == null) {
            cacheLabsInAndOut(roomName);
            return true
        }
        if (labtouse && labtouse.mineralType==toBoost) {
            boostLabs[toBoost] = {id: labidtouse, t0: Game.time};
            fo(roomName + ' reused lab to boost lab ' + toBoost);
            return true
        }
    }
    let outno = outLabs.length;
    let inno = inLabs.length;
    let bono = Object.keys(boostLabs).length;
    let totno = outno + inno;
    if ( totno < 1) {
        //console.log(roomName + ' no lab built for boosting');
        return false
    }
    else {
        // if all lab length == boost lab length, we use all labs, find the one that has not been used for long time to boost lab
        if (totno == bono) {
            // remove oldest
            let timer = 100000000000000000000000;
            let bolabtouse = undefined;
            let bolabmat = undefined;
            for (let bomat in boostLabs) {
                let labtouse = boostLabs[bomat];
                if (labtouse.t0 == undefined || labtouse.t0 < timer) {
                    timer = labtouse.t0;
                    bolabtouse = labtouse.id;
                    bolabmat = bomat;
                }
            }
            if (bolabtouse) {
                room.memory.forLab.boostLabs[bolabmat] = undefined;
                room.memory.forLab.boostLabs[toBoost] = { id: bolabtouse, t0: Game.time };
                addLabFillTask(roomName, true);
                return true
            }
            else {
                fo('lab all boosted but none boosted?');
                return false
            }
        }
        // else we have unused lab
        else {
            if (boostLabs) {
                let usedlabids = [];
                for (let bomat in boostLabs) {
                    let labtouse = boostLabs[bomat];
                    if (labtouse && labtouse.id && Game.getObjectById(labtouse.id)) {
                        usedlabids.push(labtouse.id); 
                    }
                    else {
                        room.memory.forLab.boostLabs[bomat] = undefined;
                        return true
                    }
                }
                for (let labidtouse of outLabs.concat(inLabs)) {
                    if (!usedlabids.includes(labidtouse)) {
                        boostLabs[toBoost] = {id: labidtouse, t0: Game.time};
                        fo(roomName + ' add unused lab to boost lab ' + toBoost);
                        addLabFillTask(roomName, true);
                        return true
                    }
                }
            }
            else {
                cacheLabsInAndOut(roomName);
                return true
            }
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