global.clearPathCach = function () {
    for (let roomName in Game.rooms) {
        let room = Game.rooms[roomName];
        if (room.memory.costMatrix) {
            delete room.memory.costMatrix;
        }
        if (room.memory.costMatrixOutDated) {
            delete room.memory.costMatrixOutDated;
        }
    }
}

global.ifCreepFreezed = function (creep) {
    // load the time frame the last time this creep was checked
    let lastTimeChecked = creep.memory.lastTimeChecked;

    // if not defined, this will be the lastTimeChecked for the next check
    if (lastTimeChecked == undefined) {
        creep.memory.lastTimeChecked = { time: Game.time, posx: creep.pos.x, posy: creep.pos.y };
    }
    else { // compare the position of last time checked, if it is the same and time has passed for a while, find new path
        if ((creep.pos.x == lastTimeChecked.posx) && (creep.pos.y == lastTimeChecked.posy) && ((Game.time - lastTimeChecked.time) > 5)) {
            lastTimeChecked = { time: Game.time, pos: creep.pos }; // renew timer
            return true // need to find new path
        }
    }
}

global.costMatrizesInitialisation = function () {
    //Game.rooms['E92N11'].memory.costMatrizes = {}
    for (let roomName in Game.rooms) {
        let room = Game.rooms[roomName];

        var costs = new PathFinder.CostMatrix;
        room.find(FIND_STRUCTURES).forEach(function (struct) {
            if (struct.structureType == STRUCTURE_ROAD) {
                // Favor roads over plain tiles
                costs.set(struct.pos.x, struct.pos.y, 1);
            } else if (struct.structureType != STRUCTURE_CONTAINER &&
                (struct.structureType != STRUCTURE_RAMPART ||
                    !struct.my)) {
                // Can't walk through non-walkable buildings
                costs.set(struct.pos.x, struct.pos.y, 255);
            }
        });

        if (room.memory.construction == true) {
            room.find(FIND_CONSTRUCTION_SITES).forEach(function (struct) {
                if (struct.structureType === STRUCTURE_ROAD) {
                    // Favor roads over plain tiles
                    costs.set(struct.pos.x, struct.pos.y, 1);
                } else if (struct.structureType !== STRUCTURE_CONTAINER &&
                    (struct.structureType !== STRUCTURE_RAMPART ||
                        !struct.my)) {
                    // Can't walk through non-walkable buildings
                    costs.set(struct.pos.x, struct.pos.y, 255);
                }
            })
        }
        Game.rooms['E92N11'].memory.costMatrizes[roomName] = costs;
    }
}

global.travelToPrioHighwayWithClosestRoomExit = function (creep, tarRn, getRestRoom=false) {
    if (creep.room.name == tarRn) {
        return true
    }
    let route = Game.map.findRoute(creep.room, tarRn, {
        routeCallback(roomName, fromRoomName) {
            let parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
            let isHighway = (parsed[1] % 10 === 0) ||
                (parsed[2] % 10 === 0);
            let isMyRoom = Game.rooms[roomName] &&
                Game.rooms[roomName].controller &&
                Game.rooms[roomName].controller.my;
            if (Game.shard.name=='shardSeason' && (roomName=='W1S28'||roomName=='W2S28')) {
                return 1;
            }
            else if (Game.shard.name=='shardSeason' && (roomName=='W1S30'||roomName=='W2S30')) {
                return 4;
            }
            else if (isHighway) {
                return 2;
            }
            else if (isMyRoom) {
                return 1;
            }
            else if (Memory.rooms[roomName] && Memory.rooms[roomName].avoid) {
                return 255;
            }
            else {
                return 3.8;
            }
        }
    });
    
    if (route.length > 0) {
        if (getRestRoom) {
            if (creep.memory.restRoomInfo == undefined) {
                creep.memory.restRoomInfo = {rn: undefined, t:Game.time};
            }
            if (true || creep.memory.restRoomInfo.t+1500<Game.time) {
                if (route.length > 1) {
                    creep.memory.restRoomInfo['rn'] = route[route.length-2].room;
                }
                else {
                    creep.memory.restRoomInfo['rn'] = creep.room.name;
                }
            }
            return false
        }
        if (route[0] && route[0].room) {
            creep.travelTo(creep.pos.findClosestByRange(creep.room.findExitTo(route[0].room)), {maxRooms: 1});
        }
    }
    return false
}

global.moveInSafeCity = function(creep, goalPosi) {
    let ret = findPathInRoomSafeZone(creep.pos, goalPosi);
    if (!ret.incomplete) {
        let nexpos = getPositionFromOriginAndDirection(creep.pos, creep.pos.getDirectionTo(ret.path[0]));
        let frontCs = creep.room.lookForAt(LOOK_CREEPS, nexpos.x, nexpos.y);
        if (frontCs.length>0 && frontCs[0].my && frontCs[0].getActiveBodyparts(MOVE)>0) {
            frontCs[0].moveTo(creep);
        }
        creep.moveByPath(ret.path);
    }
}

global.moveRestrictedInRoom = function(creep, goalPosi) {
    let ret = findPathInRoomNoneBorder(creep.pos, goalPosi);
    if (!ret.incomplete) {
        let nexpos = getPositionFromOriginAndDirection(creep.pos, creep.pos.getDirectionTo(ret.path[0]));
        /*
        let frontCs = creep.room.lookForAt(LOOK_CREEPS, nexpos.x, nexpos.y);
        if (frontCs.length>0 && frontCs[0].my && frontCs[0].getActiveBodyparts(MOVE)>0) {
            frontCs[0].moveTo(creep);
        }
        */
        creep.moveByPath(ret.path);
    }
}

global.moveSafeWithDirectionNotCoord = function(creep, fpos) {
    let rangeTo = creep.pos.getRangeTo(fpos);
    if (rangeTo>1) {
        creep.travelTo(fpos, {maxRooms: 1});
    }
    else if (rangeTo==1) {
        creep.move(creep.pos.getDirectionTo(fpos));
    }
    else {
        fo('func path finding move to with direction failed because ditance is strange: ' + rangeTo);
    }
}

global.getPositionFromOriginAndDirection = function(origin, direction) {
    let offsetX = [0, 0, 1, 1, 1, 0, -1, -1, -1];
    let offsetY = [0, -1, -1, 0, 1, 1, 1, 0, -1];
    let x = origin.x + offsetX[direction];
    let y = origin.y + offsetY[direction];
    if (x > 49 || x < 0 || y > 49 || y < 0) {
        return;
    }
    return new RoomPosition(x, y, origin.roomName);
}

global.findPathInRoomSafeZone = function (posi, goalPosi, range = 0) {
    var roomName = posi.roomName;
    var goals = { pos: goalPosi, range: range };

    let ret = PathFinder.search(
        posi, goals,
        {
            // We need to set the defaults costs higher so that we
            // can set the road cost lower in `roomCallback`
            plainCost: 4,
            swampCost: 20,
            maxRooms: 1,

            roomCallback: function (roomName) {
                let room = Game.rooms[roomName];

                if (!room) return;
                let costs = new PathFinder.CostMatrix;

                let terrain = Game.map.getRoomTerrain(posi.roomName);
                // set oppo even/odd cost fucking high so they are not planned
                for (let i = 0; i < 50; i++) {
                    for (let j = 0; j < 50; j++) {
                        if ((terrain.get(i, j) == TERRAIN_MASK_WALL)) {
                            costs.set(i, j, 0xff);
                        }
                        else if ((terrain.get(i, j) == TERRAIN_MASK_SWAMP)) {
                            costs.set(i, j, 20);
                        }
                        else {
                            costs.set(i, j, 4);
                        }
                    }
                }
                
                room.find(FIND_STRUCTURES).forEach(function (site) {
                    if (site.structureType === STRUCTURE_ROAD) {
                        // Favor roads over plain tiles
                        costs.set(site.pos.x, site.pos.y, 2);
                    }
                });

                room.find(FIND_STRUCTURES).forEach(function (struct) {
                    if (struct.structureType !== STRUCTURE_CONTAINER &&
                        struct.structureType !== STRUCTURE_ROAD &&
                        (struct.structureType !== STRUCTURE_RAMPART || !struct.my)) {
                        // Can't walk through non-walkable buildings
                        costs.set(struct.pos.x, struct.pos.y, 0xff);
                    }
                });
                
                room.find(FIND_CONSTRUCTION_SITES).forEach(function (site) {
                    if (site.structureType !== STRUCTURE_ROAD && site.structureType !== STRUCTURE_CONTAINER && site.structureType !== STRUCTURE_RAMPART) {
                        costs.set(site.pos.x, site.pos.y, 0xff);
                    }
                });
                
                // filter melee enemies
                room.find(FIND_FLAGS).forEach(function (hsts) { // FIND_HOSTILE_CREEPS, {filter:h=>h.getActiveBodyparts(RANGED_ATTACK)>0}
                    for (let i = -1; i < 2; i++) {
                        for (let j = -1; j < 2; j++) {
                            let x = hsts.pos.x+i;
                            let y = hsts.pos.y+j;
                            if (x>0&&x<49&&y>0&&y<49) {
                                if (costs.get(x, y)<250) {
                                    costs.set(x, y, 250);
                                }
                            }
                        }
                    }
                });
                
                // filter ranged enemies
                room.find(FIND_HOSTILE_CREEPS, {filter:h=>h.getActiveBodyparts(RANGED_ATTACK)>0}).forEach(function (hsts) {
                    for (let i = -5; i < 6; i++) {
                        for (let j = -5; j < 6; j++) {
                            let x = hsts.pos.x+i;
                            let y = hsts.pos.y+j;
                            if (x>0&&x<49&&y>0&&y<49) {
                                if (hsts.pos.getRangeTo(x, y)==5) {
                                    if (costs.get(x, y)<80) {
                                        costs.set(x, y, 80);
                                    }
                                }
                                else if (hsts.pos.getRangeTo(x, y)==4) {
                                    if (costs.get(x, y)<160) {
                                        costs.set(x, y, 160);
                                    }
                                }
                                else {
                                    if (costs.get(x, y)<250) {
                                        costs.set(x, y, 250);
                                    }
                                }
                            }
                        }
                    }
                });
                
                // favour rampart
                room.find(FIND_STRUCTURES).forEach(function (site) {
                    if (site.structureType === STRUCTURE_RAMPART) {
                        // Favor roads over plain tiles
                        costs.set(site.pos.x, site.pos.y, 1);
                    }
                });
                
                try {
                    for (let i = 0; i < 50; i++) {
                        for (let j = 0; j < 50; j++) {
                            Game.rooms[room.name].visual.text(costs.get(i, j).toString(), i, j, {color: 'white', font: 0.4});
                        }
                    }
                }
                catch (err) {
                    fo('rv bug')
                }
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

global.findPathInRoomNoneBorder = function (posi, goalPosi, range = 1) {
    var roomName = posi.roomName;
    var goals = { pos: goalPosi, range: range };

    let ret = PathFinder.search(
        posi, goals,
        {
            // We need to set the defaults costs higher so that we
            // can set the road cost lower in `roomCallback`
            plainCost: 1,
            swampCost: 6,
            maxRooms: 1,

            roomCallback: function (roomName) {
                let room = Game.rooms[roomName];

                if (!room) return;
                let costs = new PathFinder.CostMatrix;

                let terrain = Game.map.getRoomTerrain(posi.roomName);
                // set oppo even/odd cost fucking high so they are not planned
                for (let i = 0; i < 50; i++) {
                    for (let j = 0; j < 50; j++) {
                        if ((terrain.get(i, j) == TERRAIN_MASK_WALL)) {
                            costs.set(i, j, 0xff);
                        }
                        else if ((terrain.get(i, j) == TERRAIN_MASK_SWAMP)) {
                            costs.set(i, j, 6);
                        }
                        else {
                            costs.set(i, j, 1);
                        }
                    }
                }
                
                room.find(FIND_STRUCTURES).forEach(function (site) {
                    if (site.structureType === STRUCTURE_ROAD) {
                        // Favor roads over plain tiles
                        costs.set(site.pos.x, site.pos.y, 1);
                    }
                });

                room.find(FIND_STRUCTURES).forEach(function (struct) {
                    if (struct.structureType !== STRUCTURE_CONTAINER &&
                        struct.structureType !== STRUCTURE_ROAD &&
                        (struct.structureType !== STRUCTURE_RAMPART || !struct.my)) {
                        // Can't walk through non-walkable buildings
                        costs.set(struct.pos.x, struct.pos.y, 0xff);
                    }
                });
                
                room.find(FIND_MY_CONSTRUCTION_SITES).forEach(function (site) {
                    if (site.structureType !== STRUCTURE_ROAD && site.structureType !== STRUCTURE_CONTAINER && site.structureType !== STRUCTURE_RAMPART) {
                        costs.set(site.pos.x, site.pos.y, 0xff);
                    }
                });
                
                // restrict border motion
                // second border very expensive
                for (let i = 0; i < 50; i++) {
                    costs.set(i, 1, 125);
                    costs.set(i, 48, 125);
                    costs.set(1, i, 125);
                    costs.set(48, i, 125);
                }
                // bordest no
                for (let i = 0; i < 50; i++) {
                    costs.set(i, 0, 0xff);
                    costs.set(i, 49, 0xff);
                    costs.set(0, i, 0xff);
                    costs.set(49, i, 0xff);
                }
                
                // Avoid creeps in the room
                room.find(FIND_CREEPS).forEach(function (creep) {
                    costs.set(creep.pos.x, creep.pos.y, 0xff);
                });
                
                // Avoid pcs in the room
                room.find(FIND_POWER_CREEPS).forEach(function (creep) {
                    costs.set(creep.pos.x, creep.pos.y, 0xff);
                });
                return costs;
            },
        }
    );
    return ret;
}

global.visualizePaths = function (posi, goalPosi, range = 1, ifEO = true, mr = 1) {
    let ret = findPathBasedOnGridEvenOddGlobal(posi, goalPosi, range, ifEO, mr);
    let path = ret.path
    for (let p = 0; p < path.length - 1; p++) {
        Game.rooms[path[p].roomName].visual.line(convertPosToRoompos(path[p]), convertPosToRoompos(path[p + 1]), { color: 'while', lineStyle: 'dashed' });
    }
}

global.visualizePathsPure = function (ps) {
    let initRoom = undefined;
    if (ps&&ps.length>0) {
        for (let p = 0; p < ps.length - 1; p++) {
            if (initRoom==undefined) {
                initRoom = ps[p].roomName;
            }
            if (rooms[ps[p].roomName]!=initRoom) {
                return
            }
            Game.rooms[ps[p].roomName].visual.line(convertPosToRoompos(ps[p]), convertPosToRoompos(ps[p + 1]), { color: 'while', lineStyle: 'dashed' });
        }
    }
}

var convertPosToRoompos = function (posi) {
    return new RoomPosition(posi.x, posi.y, posi.roomName)
}


global.findPathBasedOnGridEvenOddGlobal = function (posi, goalPosi, range = 1, ifEO = true, mr = 1) {
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

            maxRooms: mr,

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
                                if ((terrain.get(i, j) == TERRAIN_MASK_SWAMP)) {
                                    costs.set(i, j, 20);
                                }
                                else if (!(terrain.get(i, j) == TERRAIN_MASK_WALL)) { // plain
                                    costs.set(i, j, 8);
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
                        costs.set(struct.pos.x, struct.pos.y, 1);
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
                        costs.set(site.pos.x, site.pos.y, 1);
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

global.fleeTest = function () {
    return
    if (Game.shard.name=='shard2') {
        let ret = PathFinder.search(
        Game.getObjectById('59f1a4ff82100e1594f3ddda').pos, 
        _.map([Game.getObjectById('60c53ce080c11f49a46d763b')], i => ({pos: i.pos, range: 15})), 
        {
          plainCost: 2,
          swampCost: 10,
          flee: true,
        });
        visualizePathsPure(ret.path);
    }
}

global.findMaxInArrayWithUndefined = function (arr) {
    return arr.reduce(function(a,b){
                if (isNaN(a) || a === null || a === '') a = 0;
                if (isNaN(b) || b === null || b === '') b = 0;
                return Math.max(a,b)
            }, 0);
}

global.getCostMatrixForQuadsLeader = function (rn) {
    let rerun = false;
    let r = Game.rooms[rn];
    if (Memory.quadsPathCache==undefined) {
        Memory.quadsPathCache = {};
    }
    if (Memory.quadsPathCache[rn] == undefined) {
        Memory.quadsPathCache[rn] = {cm: undefined, t: Game.time, visited: false};
    }
    if (Memory.quadsPathCache[rn].cm) { // have cached matrix
        if (r) { // if we have room vision
            if (Memory.quadsPathCache[rn].visited) { // if visited
                if (Memory.quadsPathCache[rn].t+100<Game.time) { // update every 100 ticks
                    rerun = true;
                }
                else { // return cached matrix
                    return Memory.quadsPathCache[rn].cm
                }
            }
            else { // if never visited
                rerun = true;
            }
        }
        else { // we do not have room vision, return cached
            return Memory.quadsPathCache[rn].cm
        }
    }
    else { // never cached
        rerun = true;
    }
    if (rerun) {
        let room = Game.rooms[rn];
        // In this example `room` will always exist, but since 
        // PathFinder supports searches which span multiple rooms 
        // you should be careful!
        let complexSearch = false;
        if (room) {
            complexSearch = true;
        }
        let costs = new PathFinder.CostMatrix;
        let maparr = Array.from(Array(50), _ => Array(50).fill(000));
        let costM = Array.from(Array(50), _ => Array(50).fill(000));

        // set none walkable arr pos to 0, if 0, set cost to 0xff

        let terrain = Game.map.getRoomTerrain(rn);
        for (let i = 0; i < 50; i++) {
            for (let j = 0; j < 50; j++) {
                if (terrain.get(i, j) == TERRAIN_MASK_WALL) {
                    maparr[i][j] = maparr[i][j] | 100;
                }
                else if (terrain.get(i, j) == TERRAIN_MASK_SWAMP) {
                    maparr[i][j] = maparr[i][j] | 1;
                }
            }
        }
        
        if (complexSearch) {
            room.find(FIND_STRUCTURES).forEach(function (struct) {
                if (struct.structureType !== STRUCTURE_CONTAINER &&
                    (struct.structureType !== STRUCTURE_RAMPART || !struct.my) && 
                    struct.structureType !== STRUCTURE_ROAD
                    ) {
                    // Can't walk through non-walkable buildings
                    maparr[struct.pos.x][struct.pos.y] = maparr[struct.pos.x][struct.pos.y] | 100;
                }
            });
        }
        
        /*
        room.find(FIND_HOSTILE_CREEPS).forEach(function (struct) {
            // Can't walk through hostile creeps
            maparr[struct.pos.x][struct.pos.y] = 0;
            costs.set(struct.pos.x, struct.pos.y, 0xff);
        });
        */

        // combine matrix for quads
        for (let i = 0; i < 50; i++) {
            for (let j = 0; j < 50; j++) {
                if (i <= 1 || j >= 48 || i==49 || j==0) {
                    maparr[i][j] = maparr[i][j] | 1; // treat edge as swamp to avoid
                }
            }
        }
        
        for (let i = 0; i < 50; i++) {
            for (let j = 0; j < 50; j++) {
                let v1 = undefined;
                if (maparr[i] && maparr[i][j]) {
                    v1 = maparr[i][j];
                }
                let v2 = undefined;
                if (maparr[i-1] && maparr[i-1][j]) {
                    v2 = maparr[i-1][j];
                }
                let v3 = undefined;
                if (maparr[i] && maparr[i][j+1]) {
                    v3 = maparr[i][j+1];
                }
                let v4 = undefined;
                if (maparr[i-1] && maparr[i-1][j+1]) {
                    v4 = maparr[i-1][j+1];
                }
                let newval = findMaxInArrayWithUndefined([v1, v2, v3, v4]);
                if (newval*10+1>=255) {
                    costM[i][j] = 255;
                }
                else {
                    costM[i][j] = newval*10+1;
                }
            }
        }

        // Avoid creeps in the room
        /*room.find(FIND_CREEPS).forEach(function (creep) {
            costs.set(creep.pos.x, creep.pos.y, 0xff);
        });*/
        if (Memory.quadsPathCache[rn].visited != true) {
            if (complexSearch) {
                Memory.quadsPathCache[rn] = {cm: costM, t: Game.time, visited: true};
            }
            else {
                Memory.quadsPathCache[rn] = {cm: costM, t: Game.time, visited: false};
            }
        }
        else {
            Memory.quadsPathCache[rn] = {cm: costM, t: Game.time, visited: true};
        }
        return costM;
    }
    fo('quads matrix cach bug');
    return
}

global.addCreepsCostsForQuadsLeader = function(M, cpn) {
    let r = Game.creeps[cpn].room;
    let nonmecps = r.find(FIND_CREEPS, {filter:c=>c.name.slice(1,c.name.length)!=cpn.slice(1,cpn.length)});
    let pcs = r.find(FIND_POWER_CREEPS);
    let toavoids = nonmecps.concat(pcs);
    let leader = Game.creeps[cpn];
    
    for (let toavoid of toavoids) {
        let x = toavoid.pos.x;
        let y = toavoid.pos.y;
        if (toavoid.my) {
            M[x][y] = 255;
            let a = x+1<=49;
            let b = y-1>=0;
            if (a) {
                M[x+1][y] = 255;
            }
            if (b) {
                M[x][y-1] = 255;
            }
            if (a&&b) {
                M[x+1][y-1] = 255;
            }
        }
    }
    return M
}

global.addTowerDmgForQuadsLeader = function(M, cpn) {
    let myHeals = getMyHealsAround(Game.creeps[cpn]);
    if (cpn && Game.creeps[cpn] && Game.creeps[cpn].memory && Game.creeps[cpn].memory.tarTowerM == undefined) {
        let tdm = Array.from(Array(50), _ => Array(50).fill(0));
        for (let i = 0; i < 50; i++) {
            for (let j = 0; j < 50; j++) {
                tdm[i][j] = 0;
            }
        }
        Game.creeps[cpn].memory.tarTowerM = tdm;
    }
    if (cpn && Game.creeps[cpn] && Game.creeps[cpn].memory && Game.creeps[cpn].memory.tarTowerM) {
        let tdm = Game.creeps[cpn].memory.tarTowerM;
        for (let i = 0; i < 50; i++) {
            for (let j = 0; j < 50; j++) {
                if (tdm[i][j]>myHeals) {
                    if (tdm[i] && tdm[i][j]) {
                        M[i][j] = 255;
                    }
                    if (tdm[i-1] && tdm[i-1][j]) {
                        M[i-1][j] = 255;
                    }
                    if (tdm[i] && tdm[i][j+1]) {
                        M[i][j+1] = 255;
                    }
                    if (tdm[i-1] && tdm[i-1][j+1]) {
                        M[i-1][j+1] = 255;
                    }
                }
            }
        }
    }
    return M
}

global.findPathForQuadsLeader = function (posi, goalPosi, ifFlee = false, range=1, cpn=undefined, myHeals = 25) {
    var goals = [];

    goals.push({ pos: goalPosi, range: 1 });
    if (goalPosi.y > 1 && goalPosi.x < 48) {
        let auxGoal = new RoomPosition(goalPosi.x, goalPosi.y - 1, goalPosi.roomName);
        goals.push({ pos: auxGoal, range: 1 });

        let auxGoal1 = new RoomPosition(goalPosi.x + 1, goalPosi.y, goalPosi.roomName);
        goals.push({ pos: auxGoal1, range: 1 });

        let auxGoal2 = new RoomPosition(goalPosi.x + 1, goalPosi.y - 1, goalPosi.roomName);
        goals.push({ pos: auxGoal2, range: 1 });
    }

    let ret = PathFinder.search(
        posi, 
        _.map(goals, i => ({pos: i.pos, range: range})), 
        {
            // We need to set the defaults costs higher so that we
            // can set the road cost lower in `roomCallback`
            plainCost: 1,
            swampCost: 5,

            maxRooms: 2,
            flee: ifFlee,

            roomCallback: function (roomName) {

                let room = Game.rooms[roomName];
                let costM = getCostMatrixForQuadsLeader(roomName);
                costM = addCreepsCostsForQuadsLeader(costM, cpn);
                try {
                    //costM = addTowerDmgForQuadsLeader(costM, cpn);
                }
                catch (e) {
                    fo('tower quads cost matrix wrong');
                    fo(e.stack);
                }
                let costs = new PathFinder.CostMatrix;
                
                
                for (let i = 0; i < 50; i++) {
                    for (let j = 0; j < 50; j++) {
                        costs.set(i, j, costM[i][j]);
                        try {
                            if (Game.rooms[roomName]) {
                                let costVal = costs.get(i, j);
                                if (costVal<255) {
                                    Game.rooms[roomName].visual.text(costVal.toString(), i, j, {color: 'white', font: 0.3});
                                }
                                else {
                                    Game.rooms[roomName].visual.text('X',i,j+0.3, {color:'#000000'})
                                }
                            }
                        }
                        catch (e) {
                            fo('cost matrix visualization bug');
                        }
                    }
                }
                

                return costs;
            },
        }
    );
    //visualizePathsPure(ret.path);
    for (let p of ret.path) {
        if (Game.rooms[p.roomName]) {
            Game.rooms[p.roomName].visual.circle(p.x, p.y, {color: 'red', radius: 0.3});
        }
    }
    return ret;
}

// not working
global.ifReachableWithinRoom = function (pos1, pos2) {
    let ret = PathFinder.search(
        pos1, pos2,
        {
            // We need to set the defaults costs higher so that we
            // can set the road cost lower in `roomCallback`
            plainCost: 2,
            swampCost: 10,
            maxRooms: 1,

            roomCallback: function (roomName) {

                let room = Game.rooms[roomName];
                // In this example `room` will always exist, but since 
                // PathFinder supports searches which span multiple rooms 
                // you should be careful!
                if (!room) return;
                let costs = new PathFinder.CostMatrix;

                room.find(FIND_STRUCTURES).forEach(function (struct) {
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

                return costs;
            },
        }
    );
    if (ret.incomplete == true) {
        return false
    }
    else {
        let lastpath = ret.path[ret.path.length - 1];
        if (pos2.getRangeTo(lastpath) < 2) {
            return true
        }
        else {
            return false
        }
    }
}


global.travelToTarget = function (creep, trn) {
    // move to target
    if (creep.memory.foundRoute == undefined) {
        creep.memory.foundRoute = {};
    }
    if (creep.memory.foundRoute[creep.room.name+trn]) {
        let route = creep.memory.foundRoute[creep.room.name+trn];
        if (route.length > 0) {
            let next = route[0];
            let nextRoomTar = new RoomPosition(25, 25, next.room);
            creep.travelTo(nextRoomTar, {maxRooms: 1}); // , offRoad: true, ignoreRoads: true
        }
    }
    else {
        let route = Game.map.findRoute(creep.room, trn, {
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
                else if (Memory.rooms[roomName] && Memory.rooms[roomName].avoid) {
                    return 7.8
                }
                else {
                    return 3.14;
                }
            }});
        if (route.length > 0) {
            let next = route[0];
            let nextRoomTar = new RoomPosition(25, 25, next.room);
            creep.travelTo(nextRoomTar, {maxRooms: 1}); // , offRoad: true, ignoreRoads: true
        }
        creep.memory.foundRoute[creep.room.name+trn] = route;
    }
}
