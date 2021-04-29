global.buildRoom = function (roomName) {
    let roomObj = Game.rooms[roomName];
    let lvl = roomObj.controller.level;
    // init build memory
    initBuildMemory(roomObj);
    addToBuildList(roomObj, lvl);
    //visualizePath({ x: 14, y: 33, roomName: 'E1S47' }, { x: 25, y: 25, roomName: 'E1S46'});
    // place build site
}

global.removeCss = function () {
    let css = Game.constructionSites;
    fo(JSON.stringify(css))
    for (let csid in css) {
        Game.getObjectById(csid).remove();
    }
}

var initBuildMemory = function (r) {
    if (!r.memory.anchor) {
        let s = getAnchorOfNewRoom(r);
        r.memory.anchor = s;
    }
    let newLands = {
        E1S47: { STRUCTURE_TOWER: [{ x: 7, y: 25 }], STRUCTURE_STORAGE: [{ x: 7, y: 33 }], STRUCTURE_TERMINAL: [{ x: 9, y: 33 }], STRUCTURE_SPAWN: [{ x: 9, y: 31 }], STRUCTURE_LAB: [{ x: 7, y: 31 }] }, // , { x: 10, y: 24 }
        E3S46: { STRUCTURE_TOWER: [{ x: 16, y: 37 }], STRUCTURE_STORAGE: [{ x: 7, y: 38}] },
        E5S47: { STRUCTURE_TOWER: [{ x: 29, y: 24 }], STRUCTURE_STORAGE: [{ x: 34, y: 8 }] },
        E9S49: { STRUCTURE_TOWER: [{ x: 30, y: 35 }], STRUCTURE_STORAGE: [{ x: 34, y: 33 }] },
        E1S43: { STRUCTURE_TOWER: [{ x: 29, y: 18 }], STRUCTURE_STORAGE: [{ x: 19, y: 3 }] },
        E2S42: { STRUCTURE_TOWER: [{ x: 30, y: 5 }], STRUCTURE_STORAGE: [{ x: 19, y: 14 }] },
        };
    if (!Memory.reservedLand || !(Memory.reservedLand==newLands)) {
        Memory.reservedLand = newLands
    }
}

var getAnchorOfNewRoom = function (r) {
    let spawnStructure = r.find(FIND_MY_STRUCTURES, {filter: { structureType: STRUCTURE_SPAWN } })
    if (spawnStructure.length>0) {
        return spawnStructure[0].pos
    }
    let spawnSite = r.find(FIND_MY_CONSTRUCTION_SITES, {filter: { structureType: STRUCTURE_SPAWN } })
    if (spawnSite.length>0) {
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
        if ((-width/2 < x && x <= width/2) && (-height/2 < y && y <= height/2) && (Math.abs((x+y)%2)===1)) {
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

var checkIfLandAvailable = function (r, x, y, t) {
    // not wall
    let terrain = Game.map.getRoomTerrain(r.name);
    if (!(terrain.get(x, y) == TERRAIN_MASK_WALL)) {
        // not in reserved land
        if (r.lookForAt(LOOK_STRUCTURES, x, y).length > 0 || r.lookForAt(LOOK_CONSTRUCTION_SITES, x, y).length > 0) {
            return false
        }
        else {
            r.createConstructionSite(x, y, eval(t));
            return true
        }
    }
    else {
        return false
    }
    
}

var lookForAvailableLand = function (r, t) {
    let ank = r.memory.anchor;
    if (ank) {
        spiralCoordsFromPoint(r, ank, t);
    }
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
                if (!(terrain.get(x, y) == TERRAIN_MASK_WALL)) {
                    return { x: x, y: y}
                }
            }
        }
    }
    return 
}

var placeSite = function (r, t) {
    if (['STRUCTURE_TOWER', 'STRUCTURE_STORAGE', 'STRUCTURE_TERMINAL', 'STRUCTURE_SPAWN', 'STRUCTURE_LAB'].includes(t)) {
        let reservedStructures = Memory.reservedLand[r.name]; // { STRUCTURE_TOWER: [{ x: 7, y: 24 }] };
        if (reservedStructures && reservedStructures[t]) {
            for (let posi of reservedStructures[t]) {
                if (checkIfLandAvailable(r, posi.x, posi.y, t)) {
                    return
                }
            }
        }
    }
    else {
        if (t == 'STRUCTURE_CONTAINER') {
            let energyResources = r.find(FIND_SOURCES);
            for (let energyResource of energyResources) {
                let posi = lookForNeighbourLandAvailable(energyResource)
                if (checkIfLandAvailable(r, posi.x, posi.y, t)) {
                    return
                }
            }
            if (r.controller.level >= 5) {
                let mResources = r.find(FIND_MINERALS)[0];
                let posi = lookForNeighbourLandAvailable(mResources)
                if (checkIfLandAvailable(r, posi.x, posi.y, t)) {
                    return
                }
            }
        }
        else if (t == 'STRUCTURE_EXTRACTOR') {
            let mResources = r.find(FIND_MINERALS)[0];
            let posi = mResources.pos
            if (r.createConstructionSite(posi.x, posi.y, eval(t))) {
                return
            }
        }
        else {
            lookForAvailableLand(r, t);
        }
    }
}

var buildOrder = function (r, roomLvl) {
    return {
        2: [{ STRUCTURE_EXTENSION: 5 }, { STRUCTURE_CONTAINER: r.find(FIND_SOURCES).length }, { STRUCTURE_ROAD: -1 }] ,
        3: [{ STRUCTURE_TOWER: 1 }, { STRUCTURE_EXTENSION: 10 }],
        4: [{ STRUCTURE_EXTENSION: 20 }, { STRUCTURE_STORAGE: 1 }],
        5: [{ STRUCTURE_EXTENSION: 30 }, { STRUCTURE_TOWER: 2 }],
        6: [{ STRUCTURE_TERMINAL: 1 },  { STRUCTURE_LAB: 1 }, { STRUCTURE_CONTAINER: r.find(FIND_SOURCES).length + 1 }, { STRUCTURE_EXTRACTOR : 1 }], // r.find(FIND_MINERALS).length
        7: [{ STRUCTURE_SPAWN: 2 }],
    }
}

var buildSheet = function () {
    // ************ big game plan *************
    // lvl1 create harvesters 4?
    // create pureWorker, create mover based on source space, harvester do not harvest and give way to pureWorker and mover
    // create upgraders, pickuper, builder, then stop harvester
    // lvl2 build extension around mineral
    // when 550, create pureWorker with 1 carry and build/maintain container
    // build road
    // 
    
    let coreCx = 0;
    let coreCy = 0;
    
    let listo = [
        {lvl: 1, t: STRUCTURE_SPAWN, x: coreCx + 0, y: coreCy},
        {lvl: 2, t: STRUCTURE_},
        ];
}

var seekBuildingToBuild = function (r, roomLvl) {
    let buildCheckList = buildOrder(r, roomLvl);
    for (let lvl = 2; lvl <= roomLvl; lvl++) {
        let buildList = buildCheckList[lvl.toString()]
        if (buildList) {
            for (let buildOrder of buildList) {
                let sType = Object.keys(buildOrder)[0];
                if (findTotolNumberOfStructure(r, eval(sType)) < buildOrder[sType]) {
                    placeSite(r, sType);
                    return
                }
                else if (sType == 'STRUCTURE_ROAD') {
                    if (!r.memory.cachedRoad) {
                        r.memory.cachedRoad = {};
                    }
                    if (true) { //(!r.memory.cachedRoad[lvl.toString()]) {
                        // container roads
                        let posisToCach = []
                        let spawnPosi = r.memory.anchor;
                        for (let eId in Memory.mapInfo[r.name].eRes) {
                            let containerPosi = Memory.mapInfo[r.name].eRes[eId].easyContainerPosi;
                            containerPosi.roomName = r.name;
                            posisToCach = posisToCach.concat(findPathBasedOnGridEvenOdd(spawnPosi, containerPosi).path);
                            visualizePath(spawnPosi, containerPosi);
                        }
                        // controller roads
                        let controllerPosi = r.controller.pos;
                        posisToCach = posisToCach.concat(findPathBasedOnGridEvenOdd(spawnPosi, controllerPosi, 3).path);
                        //visualizePath(spawnPosi, controllerPosi);
                        r.memory.cachedRoad = posisToCach;

                        // place site
                        for (let posiToCach of posisToCach) {
                            //fo(posiToCach.x + ' ' + posiToCach.y);
                            r.createConstructionSite(posiToCach.x, posiToCach.y, eval(sType));
                        }
                    }
                    //r.memory.cachedRoad
                }
            }
        }
    }
}

<<<<<<< HEAD
=======
var findTotolNumberOfStructure = function (r, type) {
    let alreadyExisted = r.find(FIND_STRUCTURES, {filter: { structureType: type } }).length
    let ongoing = r.find(FIND_CONSTRUCTION_SITES, {filter: { structureType: type } }).length
    return alreadyExisted + ongoing;
}


>>>>>>> master
var visualizePath = function (posi, goalPosi) {
    let ret = findPathBasedOnGridEvenOdd(posi, goalPosi);
    let path = ret.path
    for (let p = 0; p < path.length - 1; p++) {
        Game.rooms[path[0].roomName].visual.line(convertPosToRoompos(path[p]), convertPosToRoompos(path[p + 1]), { color: 'while', lineStyle: 'dashed' });
    }
}

var convertPosToRoompos = function (posi) {
    return new RoomPosition(posi.x, posi.y, posi.roomName)
}


<<<<<<< HEAD
var findPathBasedOnGridEvenOdd = function (posi, goalPosi, range = 1, ifEO = true, avoidRaod = false) {
    //if(roomName=='E8S28'){fo(1)}
    
=======
var findPathBasedOnGridEvenOdd = function (posi, goalPosi, range = 1, ifEO = true) {
>>>>>>> master
    var roomName = posi.roomName;

    if (goalPosi.length) { // if array of posis
        var goals = [];
            goalPosi.forEach((gp) => {
            goals.push({ pos: gp, range: range })
        });  
    }
    else {
        var goals = { pos: goalPosi, range: range };
    }

    

    let ret = PathFinder.search(
        posi, goals,
        {
            // We need to set the defaults costs higher so that we
            // can set the road cost lower in `roomCallback`
            plainCost: 4,
            swampCost: 10,
            
            maxRooms: 1,

            roomCallback: function (roomName) {

                let room = Game.rooms[roomName];
                // In this example `room` will always exist, but since 
                // PathFinder supports searches which span multiple rooms 
                // you should be careful!
                if (!room) return;
                let costs = new PathFinder.CostMatrix;

                // set oppo even/odd cost fucking high so they are not planned
                let terrain = Game.map.getRoomTerrain(posi.roomName);
                for (let i = 0; i < 50; i++) {
                    for (let j = 0; j < 50; j++) {
                        if (ifEO) {
                            if (!((i + j) % 2 == (posi.x + posi.y) % 2)) {
                                if (!(terrain.get(i, j) == TERRAIN_MASK_WALL)) {
                                    costs.set(i, j, 20);
                                }
                            }
                        }
                        else { // switch off even/odd grid
                            if (!(terrain.get(i, j) == TERRAIN_MASK_WALL)) {
                                costs.set(i, j, 20);
                            }
                        }
                    }
                }

                room.find(FIND_STRUCTURES).forEach(function (struct) {
                    if (struct.structureType === STRUCTURE_ROAD) {
                        // Favor roads over plain tiles
<<<<<<< HEAD
                        if (avoidRaod) {
                            costs.set(struct.pos.x, struct.pos.y, 5);
                        }
                        else {
                            costs.set(struct.pos.x, struct.pos.y, 0.1);
                        }
=======
                        costs.set(struct.pos.x, struct.pos.y, 1);
>>>>>>> master
                    } else if (struct.structureType !== STRUCTURE_CONTAINER &&
                        (struct.structureType !== STRUCTURE_RAMPART ||
                            !struct.my)) {
                        // Can't walk through non-walkable buildings
                        costs.set(struct.pos.x, struct.pos.y, 0xff);
                    }
                });

                room.find(FIND_CONSTRUCTION_SITES).forEach(function (site) {
                    if (site.structureType === STRUCTURE_ROAD) {
                        // Favor roads over plain tiles
<<<<<<< HEAD
                        costs.set(site.pos.x, site.pos.y, 0.1);
=======
                        costs.set(site.pos.x, site.pos.y, 1);
>>>>>>> master
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
    return ret;
}

<<<<<<< HEAD
var findPathBasedOnGridEvenOddAndBankerBlockage = function (r, goalPosi, range = 1, ifEO = true, avoidRoad = false) {
    var roomName = r.name;
    let anchx;
    let anchy;
    
    let roadCost = 1;
    if (avoidRoad) {
        roadCost = 5;
    }
    
    if (r.memory.anchor) {
        anchx = r.memory.anchor.x;
        anchy = r.memory.anchor.y-1;
    }
    else if (r.memory.newAnchor) {
        anchx = r.memory.newAnchor.x;
        anchy = r.memory.newAnchor.y-1;
    }
    else {
        fo('please set anchor or newAnchor memory of room ' + r.name);
        return false
    }
    
=======
var findPathBasedOnGridEvenOddAndBankerBlockage = function (r, goalPosi, range = 1, ifEO = true) {
    var roomName = r.name;
    let anchx = r.memory.anchor.x;
    let anchy = r.memory.anchor.y;
>>>>>>> master
    let posi= new RoomPosition(anchx, anchy, roomName);

    if (goalPosi.length) { // if array of posis
        var goals = [];
            goalPosi.forEach((gp) => {
            goals.push({ pos: gp, range: range })
        });  
    }
    else {
        var goals = { pos: goalPosi, range: range };
    }

    

    let ret = PathFinder.search(
        posi, goals,
        {
            // We need to set the defaults costs higher so that we
            // can set the road cost lower in `roomCallback`
            plainCost: 2,
<<<<<<< HEAD
            swampCost: 6,
=======
            swampCost: 5,
>>>>>>> master
            
            maxRooms: 1,

            roomCallback: function (roomName) {

                let room = Game.rooms[roomName];
                // In this example `room` will always exist, but since 
                // PathFinder supports searches which span multiple rooms 
                // you should be careful!
                if (!room) return;
                let costs = new PathFinder.CostMatrix;

                // set oppo even/odd cost fucking high so they are not planned
                let terrain = Game.map.getRoomTerrain(posi.roomName);
                for (let i = 0; i < 50; i++) {
                    for (let j = 0; j < 50; j++) {
                        if (ifEO) {
                            if (!((i + j) % 2 == (posi.x + posi.y) % 2)) {
                                if (!(terrain.get(i, j) == TERRAIN_MASK_WALL)) {
                                    costs.set(i, j, 10);
                                }
                            }
                        }
                        else { // switch off even/odd grid
                            if (!(terrain.get(i, j) == TERRAIN_MASK_WALL)) {
                                costs.set(i, j, 10);
                            }
                        }
                        // bunker block
                        if ((i>anchx-5)&&(i<anchx+5)&&(j>anchy-6)&&(j<anchy)) {
                            costs.set(i, j, 0xff);
                        }
                        if ((i>anchx-3)&&(i<anchx+3)&&(j>anchy-11)&&(j<anchy-5)) {
                            costs.set(i, j, 0xff);
                        }
                    }
                }

                room.find(FIND_STRUCTURES).forEach(function (struct) {
                    if (struct.structureType === STRUCTURE_ROAD) {
<<<<<<< HEAD
                        costs.set(struct.pos.x, struct.pos.y, roadCost);
                    }
                    else if (struct.structureType == STRUCTURE_CONTAINER) {
                        costs.set(struct.pos.x, struct.pos.y, 0xff);
                    }
                    else if (struct.structureType !== STRUCTURE_CONTAINER &&
=======
                        // Favor roads over plain tiles
                        costs.set(struct.pos.x, struct.pos.y, 1);
                    } else if (struct.structureType !== STRUCTURE_CONTAINER &&
>>>>>>> master
                        (struct.structureType !== STRUCTURE_RAMPART ||
                            !struct.my)) {
                        // Can't walk through non-walkable buildings
                        costs.set(struct.pos.x, struct.pos.y, 0xff);
                    }
                });

                room.find(FIND_CONSTRUCTION_SITES).forEach(function (site) {
                    if (site.structureType === STRUCTURE_ROAD) {
                        // Favor roads over plain tiles
<<<<<<< HEAD
                        costs.set(site.pos.x, site.pos.y, roadCost);
=======
                        costs.set(site.pos.x, site.pos.y, 1);
>>>>>>> master
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
    return ret;
}

///////////////////////////////////////// new /////////////////////////////////////////////
//global.removeAllConstructionSitesInRoom = function (r) {

global.findUpgradePosition = function (r) {
    let ctrpos = r.controller.pos;
    let numOpenSpot = 0;
    let res = {}
            
    for (let i = -2; i < 3; i++) {
        for (let j = -2; j < 3; j++) {
            let lx = ctrpos.x+i;
            let ly = ctrpos.y+j;
            
            if ((lx>1 && lx<48) && (ly>1 && ly<48) && (Math.abs(i)==2 || Math.abs(j)==2) ) { // linear range 2 to controller
                let freeSpace = 0;
<<<<<<< HEAD
                let ts = r.lookForAtArea(LOOK_TERRAIN, ly-1, lx-1, ly+1, lx+1, true)

                for (let t of ts) {
                    if (t.terrain!=='wall') { // all around posis
                        freeSpace++;
                    }
                }
                fo(freeSpace)
=======
                let ts = r.lookForAtArea(LOOK_TERRAIN, 39, 19, 41, 21, true)

                for (let t of ts) {
                    if (t.terrain!==TERRAIN_MASK_WALL) { // all around posis
                        freeSpace++;
                    }
                }
>>>>>>> master
                if (freeSpace>numOpenSpot) {
                    numOpenSpot = freeSpace;
                    res = {x: lx, y: ly}
                }
            }
        }
    }
    return res
}

<<<<<<< HEAD
global.checkIfRoomNeedRerunPlan = function(r) { // depricated
    return Game.time%1==0
=======
global.checkIfRoomNeedRerunPlan = function(r) {
    return Game.time%111==0 // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
>>>>>>> master
}

global.updateRoomPlan = function(rn) {
    // update to build memory
    let r = Game.rooms[rn];
    let roomPlanList = r.memory.roomLayout;
    
<<<<<<< HEAD
    if (checkIfRoomNeedRerunPlan(r) || r.memory.newAnchor == undefined) { // set condition to run room plan <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< for example: when building destroyed or finished...
=======
    if (checkIfRoomNeedRerunPlan(r)) { // set condition to run room plan <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< for example: when building destroyed or finished...
>>>>>>> master
        runUltraToBuildPlan(r);
    }
    
    if (roomPlanList) {
        for (let toBuild of roomPlanList) {
            let found = r.lookForAt(LOOK_STRUCTURES, toBuild.posi.x, toBuild.posi.y);
<<<<<<< HEAD
            if (toBuild.posi.x<2||toBuild.posi.x>47||toBuild.posi.y<2||toBuild.posi.y>47) {
                // pass
            }
            else if ((found.length>0 && found[0].structureType == toBuild.t) || (found.length>1 && found[1].structureType == toBuild.t)) {
                // next
            }
            else {
                let placeRes = r.createConstructionSite(toBuild.posi.x, toBuild.posi.y, toBuild.t);
                if (toBuild.t==STRUCTURE_ROAD) {
                    // pass
                }
                else if ( placeRes == OK) {
                    fo('placed CS ' + toBuild.t + ' in room  ' + rn + ' at ' + JSON.stringify(toBuild.posi) );
                    let anch = r.memory.anchor;
                    if (anch == undefined) {
                        anch = r.memory.newAnchor;
                    }
                    if (toBuild.posi.x == anch.x+2 && toBuild.posi.y == anch.y-8) {
                        r.memory.coreBaseReady = true;
                    }
                    return
                }
                else if ( placeRes == ERR_INVALID_TARGET) {
                    return
                }
=======
            if (found.length>0 && found[0].structureType == toBuild.t) {
                // next
            }
            else {
                if (r.createConstructionSite(toBuild.posi.x, toBuild.posi.y, toBuild.t) == OK) {
                    fo('try to creat CS ' + toBuild.t + ' in room  ' + rn + ' at ' + JSON.stringify(toBuild.posi) );
                }
                return
>>>>>>> master
            }
        }
    }
    else {
        //initial room plan list
        r.memory.roomLayout = [];
        r.memory.toFillE = {};
    }
    
}

<<<<<<< HEAD
global.fantacyRoomPlanStored = function(anchor, r) { // anchor is first spawn position
    let x = anchor.x;
    let y = anchor.y;
    let pl = [];
    let lvl = r.controller.level;
    
    if (r.name=='E23S16') {
    }
    else { 
        pl.push({posi: {x: x, y: y-6}, t: STRUCTURE_EXTENSION}); // 20
        pl.push({posi: {x: x+1, y: y-7}, t: STRUCTURE_EXTENSION}); // 23
        pl.push({posi: {x: x+4, y: y-7}, t: STRUCTURE_EXTENSION}); // 35
        pl.push({posi: {x: x, y: y-7}, t: STRUCTURE_EXTENSION}); // 34
    }
    pl.push({posi: {x: x+2, y: y-6}, t: STRUCTURE_EXTENSION}); // 21
    pl.push({posi: {x: x+4, y: y-6}, t: STRUCTURE_EXTENSION}); // 22
    pl.push({posi: {x: x+3, y: y-7}, t: STRUCTURE_EXTENSION}); // 24
    
    
    pl.push({posi: {x: x+2, y: y+2}, t: STRUCTURE_STORAGE});  // 1
    if (r.storage && r.memory.startRemoteMining) { // level 4
        pl.push({posi: {x: x, y: y-5}, t: STRUCTURE_CONTAINER}); // 25
        pl.push({posi: {x: x+4, y: y-5}, t: STRUCTURE_CONTAINER}); // 25
        
        pl.push({posi: {x: x, y: y-3}, t: STRUCTURE_EXTENSION}); // 36
        pl.push({posi: {x: x+4, y: y-3}, t: STRUCTURE_EXTENSION}); // 38
        pl.push({posi: {x: x+2, y: y-3}, t: STRUCTURE_EXTENSION}); // 37
        pl.push({posi: {x: x, y: y+1}, t: STRUCTURE_ROAD});  // 4
        pl.push({posi: {x: x+1, y: y+2}, t: STRUCTURE_ROAD});
        pl.push({posi: {x: x+2, y: y+3}, t: STRUCTURE_ROAD});
        pl.push({posi: {x: x+3, y: y+2}, t: STRUCTURE_ROAD}); // 7
        pl.push({posi: {x: x+4, y: y+1}, t: STRUCTURE_ROAD});
        pl.push({posi: {x: x+1, y: y-3}, t: STRUCTURE_EXTENSION}); // 13
        pl.push({posi: {x: x+3, y: y-3}, t: STRUCTURE_EXTENSION}); // 14
        pl.push({posi: {x: x+2, y: y-4}, t: STRUCTURE_EXTENSION}); // 15
        pl.push({posi: {x: x+1, y: y-5}, t: STRUCTURE_EXTENSION}); // 18
        pl.push({posi: {x: x+3, y: y-5}, t: STRUCTURE_EXTENSION}); // 19
        pl.push({posi: {x: x, y: y+2}, t: STRUCTURE_LINK}); // 25
        
        if (lvl>5) {
            pl.push({posi: {x: x+2, y: y-5}, t: STRUCTURE_LINK}); // 25
            pl.push({posi: {x: x+4, y: y+2}, t: STRUCTURE_TERMINAL}); // 25
            
            if (lvl>5) {
                pl.push({posi: {x: x, y: y-4}, t: STRUCTURE_EXTENSION}); // 16
                pl.push({posi: {x: x+4, y: y-4}, t: STRUCTURE_EXTENSION}); // 17
                
                if (lvl>6) {
                    pl.push({posi: {x: x+2, y: y-7}, t: STRUCTURE_SPAWN}); // 11
                    pl.push({posi: {x: x, y: y}, t: STRUCTURE_SPAWN}); // 11 
                    pl.push({posi: {x: x+2, y: y}, t: STRUCTURE_TOWER}); // season nuke, mmo factory
                    pl.push({posi: {x: x-2, y: y-1}, t: STRUCTURE_EXTENSION});
                    pl.push({posi: {x: x, y: y-2}, t: STRUCTURE_EXTENSION});
                    pl.push({posi: {x: x+2, y: y-2}, t: STRUCTURE_EXTENSION});
                    pl.push({posi: {x: x+4, y: y-1}, t: STRUCTURE_EXTENSION}); // 41
                    pl.push({posi: {x: x+5, y: y}, t: STRUCTURE_EXTENSION}); // 42
                    pl.push({posi: {x: x+6, y: y+1}, t: STRUCTURE_EXTENSION}); // 43
                    pl.push({posi: {x: x+5, y: y+2}, t: STRUCTURE_EXTENSION}); // 44
                    pl.push({posi: {x: x+1, y: y-2}, t: STRUCTURE_EXTENSION}); // 11
                    pl.push({posi: {x: x+3, y: y-2}, t: STRUCTURE_EXTENSION}); // 12
                    pl.push({posi: {x: x+1, y: y}, t: STRUCTURE_EXTENSION}); // 2
                    pl.push({posi: {x: x+2, y: y+1}, t: STRUCTURE_EXTENSION}); // 3
                    pl.push({posi: {x: x+3, y: y}, t: STRUCTURE_EXTENSION}); // 9
                    pl.push({posi: {x: x-1, y: y+2}, t: STRUCTURE_EXTENSION}); // 26
                    if (r.name !='E23S16') {
                        pl.push({posi: {x: x-2, y: y+2}, t: STRUCTURE_EXTENSION}); // 27
                    }
                    pl.push({posi: {x: x-2, y: y+1}, t: STRUCTURE_EXTENSION}); // 28
                    pl.push({posi: {x: x-2, y: y}, t: STRUCTURE_EXTENSION}); // 29
                    pl.push({posi: {x: x-1, y: y}, t: STRUCTURE_EXTENSION}); // 30
                    pl.push({posi: {x: x-2, y: y-2}, t: STRUCTURE_EXTENSION}); // 31
                    pl.push({posi: {x: x-1, y: y-2}, t: STRUCTURE_EXTENSION}); // 32
                    pl.push({posi: {x: x, y: y-1}, t: STRUCTURE_EXTENSION}); // 33
                    pl.push({posi: {x: x+2, y: y-1}, t: STRUCTURE_EXTENSION}); // 10
                    
                    if (lvl>7) {
                        pl.push({posi: {x: x+5, y: y-2}, t: STRUCTURE_EXTENSION}); // 39
                        pl.push({posi: {x: x+4, y: y}, t: STRUCTURE_SPAWN});
                        pl.push({posi: {x: x+6, y: y}, t: STRUCTURE_EXTENSION});
                        pl.push({posi: {x: x+6, y: y+2}, t: STRUCTURE_EXTENSION});
                        pl.push({posi: {x: x+4, y: y-2}, t: STRUCTURE_EXTENSION});
                        pl.push({posi: {x: x, y: y-2}, t: STRUCTURE_EXTENSION});
                        pl.push({posi: {x: x+6, y: y-1}, t: STRUCTURE_EXTENSION});
                        pl.push({posi: {x: x+6, y: y-2}, t: STRUCTURE_EXTENSION}); // 40
                    }
                }
            }
        }
    }
=======
global.fantacyRoomPlanStored = function(anchor) { // anchor is first spawn position
    let x = anchor.x;
    let y = anchor.y;
    let pl = [];
    
    pl.push({posi: {x: x+2, y: y+2}, t: STRUCTURE_STORAGE});  // 1
    pl.push({posi: {x: x+1, y: y}, t: STRUCTURE_EXTENSION}); // 2
    pl.push({posi: {x: x+2, y: y+1}, t: STRUCTURE_EXTENSION}); // 3
    pl.push({posi: {x: x, y: y+1}, t: STRUCTURE_ROAD});  // 4
    pl.push({posi: {x: x+1, y: y+2}, t: STRUCTURE_ROAD});
    pl.push({posi: {x: x+2, y: y+3}, t: STRUCTURE_ROAD});
    pl.push({posi: {x: x+3, y: y+2}, t: STRUCTURE_ROAD}); // 7
    pl.push({posi: {x: x+4, y: y+1}, t: STRUCTURE_ROAD});
    pl.push({posi: {x: x+3, y: y}, t: STRUCTURE_EXTENSION}); // 9
    pl.push({posi: {x: x+2, y: y-1}, t: STRUCTURE_EXTENSION}); // 10
    pl.push({posi: {x: x+1, y: y-2}, t: STRUCTURE_EXTENSION}); // 11
    pl.push({posi: {x: x+3, y: y-2}, t: STRUCTURE_EXTENSION}); // 12
    pl.push({posi: {x: x+1, y: y-3}, t: STRUCTURE_EXTENSION}); // 13
    pl.push({posi: {x: x+3, y: y-3}, t: STRUCTURE_EXTENSION}); // 14
    pl.push({posi: {x: x+2, y: y-4}, t: STRUCTURE_EXTENSION}); // 15
    pl.push({posi: {x: x, y: y-4}, t: STRUCTURE_EXTENSION}); // 16
    pl.push({posi: {x: x+4, y: y-4}, t: STRUCTURE_EXTENSION}); // 17
    pl.push({posi: {x: x+1, y: y-5}, t: STRUCTURE_EXTENSION}); // 18
    pl.push({posi: {x: x+3, y: y-5}, t: STRUCTURE_EXTENSION}); // 19
    pl.push({posi: {x: x, y: y-6}, t: STRUCTURE_EXTENSION}); // 20
    pl.push({posi: {x: x+2, y: y-6}, t: STRUCTURE_EXTENSION}); // 21
    pl.push({posi: {x: x+4, y: y-6}, t: STRUCTURE_EXTENSION}); // 22
    pl.push({posi: {x: x+1, y: y-7}, t: STRUCTURE_EXTENSION}); // 23
    pl.push({posi: {x: x+3, y: y-7}, t: STRUCTURE_EXTENSION}); // 24
    pl.push({posi: {x: x, y: y+2}, t: STRUCTURE_LINK}); // 25
    pl.push({posi: {x: x-1, y: y+2}, t: STRUCTURE_EXTENSION}); // 26
    pl.push({posi: {x: x-2, y: y+2}, t: STRUCTURE_EXTENSION}); // 27
    pl.push({posi: {x: x-2, y: y+1}, t: STRUCTURE_EXTENSION}); // 28
    pl.push({posi: {x: x-2, y: y}, t: STRUCTURE_EXTENSION}); // 29
    pl.push({posi: {x: x-1, y: y}, t: STRUCTURE_EXTENSION}); // 30

>>>>>>> master
    return pl
}

global.runUltraToBuildPlan = function(r) {
    let rn = r.name;
    let bigPlan = [];
    let containerCount = 0;
    let extensionCount = 0;
<<<<<<< HEAD
    let flagO = Game.flags[rn+'_anch']; // true anch (below storage position)
    let sp = undefined;
    
    // initial spawn 
    if (flagO) {
        // pass
    }
    else {
        sp = r.find(FIND_MY_STRUCTURES, {filter: o=>o.structureType == STRUCTURE_SPAWN});
        if (sp.length>0) {
            bigPlan.push({posi: sp[0].pos, t: STRUCTURE_SPAWN});
        }
        else {
            let cti = r.find(FIND_CONSTRUCTION_SITES, {filter: o=>o.structureType == STRUCTURE_SPAWN});
            if (cti.length>0) {
                
            }
            else  {
                fo('Please build first spawn ' + r.name + ' to initiate room build plan');
            }
            return
        }
=======
    
    // initial spawn 
    let sp = r.find(FIND_MY_STRUCTURES, {filter: o=>o.structureType == STRUCTURE_SPAWN});
    if (sp.length>0) {
        bigPlan.push({posi: sp[0].pos, t: STRUCTURE_SPAWN});
    }
    else {
        fo('Please build first spawn to initiate room build plan');
        return
>>>>>>> master
    }
    
    // extension first
    for (let sourceId in Memory.mapInfo[rn].eRes) {
        let containerPosi = Memory.mapInfo[rn].eRes[sourceId].easyContainerPosi
        //bigPlan.push({posi: containerPosi, t: STRUCTURE_CONTAINER});
        //containerCount++;
        let containerSurroundings = returnALLAvailableNoStructureLandCoords(r, containerPosi);
        if (containerSurroundings.length>2) { // should be at least 2, will have mistake when mine only open to 1 free spot
            for (let i = 2; i < containerSurroundings.length-1; i++) { // 0 for road, 1 for link, start from 2
                if (extensionCount<5) {
                    bigPlan.push({posi: containerSurroundings[i], t: STRUCTURE_EXTENSION});
                    extensionCount ++;
                }
            }
        } 
    }
    
<<<<<<< HEAD
=======
    // if extension not 5, place on planned site
    if (extensionCount<5) { // <<<<<<<<<<<<<<<<<<<<<<<<<<<<< load pre-planned layout
        //bigPlan.push({posi: containerSurroundings[i], t: STRUCTURE_EXTENSION});
        //extensionCount ++;
    }
    
>>>>>>> master
    // upgrade tower
    if (r.memory.upgradeVirtual == undefined) {
        r.memory.upgradeVirtual = findUpgradePosition(r);
    }
    else {
<<<<<<< HEAD
        if (r.controller.level>=3) {
            if ( r.memory.forLinks == undefined || (_.isEmpty(r.memory.forLinks) == true) ) {
                bigPlan.push({posi: r.memory.upgradeVirtual, t: STRUCTURE_TOWER}); // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< canceled here
            }
            else {
                deleteElementFromArray(bigPlan, {posi: r.memory.upgradeVirtual, t: STRUCTURE_TOWER});
                let toDes = r.lookForAt(LOOK_STRUCTURES, r.memory.upgradeVirtual.x, r.memory.upgradeVirtual.y);
                if (toDes.length>0 && toDes.structureType==STRUCTURE_TOWER) {
                    toDes.destroy();
                }
            }
        }
    }
    
    // now build room plan
    let plannedList = [];
    
    if (r.memory.anchor == undefined) {
        r.memory.newAnchor = new RoomPosition(sp[0].pos.x, sp[0].pos.y+10, sp[0].pos.roomName);
        plannedList = fantacyRoomPlanStored({x: sp[0].pos.x-2, y: sp[0].pos.y+7}, r);
    }
    
    if (r.memory.newAnchor == undefined) {
        if (flagO) {
            r.memory.anchor = new RoomPosition(flagO.pos.x, flagO.pos.y, flagO.pos.roomName);
            plannedList = fantacyRoomPlanStored({x: flagO.pos.x-2, y: flagO.pos.y-3}, r);
        }
        else {
            r.memory.anchor = new RoomPosition(sp[0].pos.x+2, sp[0].pos.y+3, sp[0].pos.roomName);
            plannedList = fantacyRoomPlanStored(sp[0].pos, r);
        }
    }
    
    // if extension not 5, place on planned site
    if (extensionCount<5) { // <<<<<<<<<<<<<<<<<<<<<<<<<<<<< load pre-planned layout
        for (let i = 0; i < 5-extensionCount; i++) {
            bigPlan.push(plannedList[i]);
        }
    }
    
    // source container
    for (let sourceId in Memory.mapInfo[rn].eRes) {
        let containerPosi = Memory.mapInfo[rn].eRes[sourceId].easyContainerPosi
        bigPlan.push({posi: containerPosi, t: STRUCTURE_CONTAINER});
        containerCount++;
    }
    
    for (let plannedStruct of plannedList) {
        bigPlan.push({posi: plannedStruct.posi, t: plannedStruct.t});
    }
    
    // continue building extensions around e source;
    // extension first
    /*for (let sourceId in Memory.mapInfo[rn].eRes) {
=======
        if ( r.memory.forLinks == undefined || (_.isEmpty(r.memory.forLinks) == true) ) {
            bigPlan.push({posi: r.memory.upgradeVirtual, t: STRUCTURE_TOWER});
        }
        else {
            deleteElementFromArray(bigPlan, {posi: r.memory.upgradeVirtual, t: STRUCTURE_TOWER});
            /*myArray = myArray.filter(function( obj ) {
                return obj.field !== 'money';
            });*/
        }
    }
    
    // continue building extensions around e source;
    // extension first
    for (let sourceId in Memory.mapInfo[rn].eRes) {
>>>>>>> master
        let containerPosi = Memory.mapInfo[rn].eRes[sourceId].easyContainerPosi
        //bigPlan.push({posi: containerPosi, t: STRUCTURE_CONTAINER});
        //containerCount++;
        let containerSurroundings = returnALLAvailableNoStructureLandCoords(r, containerPosi);
        if (containerSurroundings.length>2) { // should be at least 2, will have mistake when mine only open to 1 free spot
            for (let i = 2; i < containerSurroundings.length; i++) { // 0 for road, 1 for link, start from 2
                bigPlan.push({posi: containerSurroundings[i], t: STRUCTURE_EXTENSION});
                extensionCount ++;
            }
        } 
<<<<<<< HEAD
    }*/
=======
    }
    
    // source container
    for (let sourceId in Memory.mapInfo[rn].eRes) {
        let containerPosi = Memory.mapInfo[rn].eRes[sourceId].easyContainerPosi
        bigPlan.push({posi: containerPosi, t: STRUCTURE_CONTAINER});
        containerCount++;
    }
    
    // now build room plan
    let plannedList = [];
    let flagO = Game.flags[rn+'_anch']; // true anch (below storage position)
    if (flagO) {
        r.memory.anchor = new RoomPosition(flagO.pos.x, GflagO.pos.y, flagO.pos.roomName);
        plannedList = fantacyRoomPlanStored({x: flagO.pos.x-2, y: flagO.pos.y-3});
    }
    else {
        r.memory.anchor = new RoomPosition(sp[0].pos.x+2, sp[0].pos.y+3, sp[0].pos.roomName);
        plannedList = fantacyRoomPlanStored(sp[0].pos);
    }
    
    for (let plannedStruct of plannedList) {
        bigPlan.push({posi: plannedStruct.posi, t: plannedStruct.t});
    }
>>>>>>> master
    
    if (true) { // check if link is ready
        initiateLinksInRoom(r);
        // build tower (postion now chosen by hand) ###############################################
        // destroy upgrade tower 
        // build upgrade link
        bigPlan.push({posi: r.memory.upgradeVirtual, t: STRUCTURE_LINK});
        // build another tower
    }
    
    r.memory.roomLayout = bigPlan;
    return 
}

global.manageUpgradeSupplier = function(r) {
    // phase 1 drop res on tower posi
    // phase 2 build tower
    // phase 3 build another tower, destroy tower, build link, build link, build tower
    // 
}





module.exports = { visualizePath, findPathBasedOnGridEvenOdd, findPathBasedOnGridEvenOddAndBankerBlockage};