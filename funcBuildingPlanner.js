global.buildRoom = function (roomName) {
    let roomObj = Game.rooms[roomName];
    let lvl = roomObj.controller.level;
    // init build memory
    initBuildMemory(roomObj)
    addToBuildList(roomObj, lvl)
    // place build site
}

var initBuildMemory = function (r) {
    if (!r.memory.anchor) {
        let s = getAnchorOfNewRoom(r);
        r.memory.anchor = s;
    }
    if (!Memory.reservedLand) {
        Memory.reservedLand = { E1S47 : { STRUCTURE_TOWER: [{ x: 7, y: 24 }, { x: 9, y: 24 }] } };
    }
}

var getAnchorOfNewRoom = function (r) {
    let spawnStructure = r.find(FIND_MY_STRUCTURES, {filter: { structureType: STRUCTURE_SPAWN } })
    if (spawnStructure) {
        return spawnStructure[0].pos
    }
    let spawnSite = r.find(FIND_MY_CONSTRUCTION_SITES, {filter: { structureType: STRUCTURE_SPAWN } })
    if (spawnSite) {
        return spawnSite[0].pos
    }
}

var ifStillBuilding = function (r) {
    // return false
    let ongoing = r.find(FIND_MY_CONSTRUCTION_SITES).length
    if (ongoing > 0){
        return true
    }
    else {
        return false
    }
}

var addToBuildList = function (r, lvl) {
    if (!ifStillBuilding(r)) {
        seekBuildingToBuild(r, lvl);
    }
}

var spiralCoordsFromPoint = function (r, posi, t) {
    let x = 0;
    let y = 0;
    let delta = [0, -1];
    // spiral width
    let width = 12;
    // spiral height
    let height = 12;

    for (let i = Math.pow(Math.max(width, height), 2); i>0; i--) {
        if ((-width/2 < x && x <= width/2) && (-height/2 < y && y <= height/2) && ((x+y)%2===1)) {
            let cx = posi.x+x
            let cy = posi.y+y
            if (checkIfLandAvailable(r, cx, cy, t)) {
                return
            }
        }
    
        if (x === y 
                || (x < 0 && x === -y) 
                || (x > 0 && x === 1-y)){
            // change direction
            delta = [-delta[1], delta[0]]            
        }
    
        x += delta[0];
        y += delta[1];        
    }
}

var checkIfLandAvailable = function(r, x, y, t) {
    // not in reserved land
    if (r.lookForAt(LOOK_STRUCTURES, x, y).length>0 || r.lookForAt(LOOK_CONSTRUCTION_SITES, x, y).length>0) {
        return false
    }
    else {
        r.createConstructionSite(x, y, eval(t));
        return true
    }
}

var lookForAvailableLand = function (r, t) {
    let ank = r.memory.anchor;
    if (ank) {
        spiralCoordsFromPoint(r, ank, t);
    }
}

var specialStructure = function (r, t) {
    // if (speciaList.includes(t)) {
        
    // }
}


var lookForNeighbourLandAvailable = function (obj) {
    let cx = obj.pos.x;
    let cy = obj.pos.y;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (!(i==1) && !(j==1)) {
                let x = cx + i - 1;
                let y = cy + j - 1;
                let terrain = Game.map.getRoomTerrain(obj.room.name);
                if (!terrain.get(x, y) == TERRAIN_MASK_WALL) {
                    return { x: x, y: y}
                }
            }
        }
    }
    return 
}

var placeSite = function (r, t) {
    if (t == 'STRUCTURE_CONTAINER') {
        let energyResources = r.find(FIND_SOURCES);
        for (let energyResource of energyResources) {
            let posi = lookForNeighbourLandAvailable(energyResource)
            if (checkIfLandAvailable(r, posi.x, posi.y, t)) {
                return
            }
        }
    }
    else if (t == 'STRUCTURE_TOWER') {
        let reservedStructures = Memory.reservedLand[r.name]; // { STRUCTURE_TOWER: [{ x: 7, y: 24 }] };
        if (reservedStructures && reservedStructures[t]) {
            for (let posi of reservedStructures[t]) {
                if (checkIfLandAvailable(r, posi.x, posi.y, t)) {
                    return
                }
            }
        }
    }
    else{
        lookForAvailableLand(r, t);
    }
}

var buildOrder = function (r, roomLvl) {
    return {
        2: [{ STRUCTURE_EXTENSION: 5 }, { STRUCTURE_CONTAINER: r.find(FIND_SOURCES).length}] ,
        3: [{ STRUCTURE_TOWER: 1 }, { STRUCTURE_EXTENSION: 10 }] ,
    }
}

var seekBuildingToBuild = function (r, roomLvl) {
    let buildCheckList = buildOrder(r, roomLvl);
    for (let lvl = 2; lvl<=roomLvl; lvl++) {
        let buildList = buildCheckList[lvl]
        for (let buildOrder of buildList) {
            for (let sType in buildOrder) {
                if (findTotolNumberOfStructure(r, eval(sType)) < buildOrder[sType]) {
                    placeSite(r, sType);
                }
            }
        }
    }
}

var findTotolNumberOfStructure = function (r, type) {
    let alreadyExisted = r.find(FIND_MY_STRUCTURES, {filter: { structureType: type } }).length
    let ongoing = r.find(FIND_MY_CONSTRUCTION_SITES, {filter: { structureType: type } }).length
    return alreadyExisted + ongoing;
}