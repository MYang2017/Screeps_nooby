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

global.findPathInRoomSafeZone = function (posi, goalPosi, range = 0) {
    var roomName = posi.roomName;
    var goals = { pos: goalPosi, range: range };

    let ret = PathFinder.search(
        posi, goals,
        {
            // We need to set the defaults costs higher so that we
            // can set the road cost lower in `roomCallback`
            plainCost: 1,
            swampCost: 2,

            roomCallback: function (roomName) {

                let room = Game.rooms[roomName];
                let cp = room.memory.anchor;
                // In this example `room` will always exist, but since 
                // PathFinder supports searches which span multiple rooms 
                // you should be careful!
                if (!room) return;
                let costs = new PathFinder.CostMatrix;

                let terrain = Game.map.getRoomTerrain(posi.roomName);
                // set oppo even/odd cost fucking high so they are not planned
                for (let i = 0; i < 50; i++) {
                    for (let j = 0; j < 50; j++) {
                        if ((terrain.get(i, j) == TERRAIN_MASK_SWAMP)) {
                            costs.set(i, j, (Math.abs(cp.x - i) + Math.abs(cp.y - j)) * 1 + 30);
                        }
                        else if ((terrain.get(i, j) == TERRAIN_MASK_WALL)) {
                            costs.set(i, j, 0xff);
                        }
                        else {
                            costs.set(i, j, (Math.abs(cp.x - i) + Math.abs(cp.y - j)) * 1 + 10);
                        }
                    }
                }

                /*room.find(FIND_STRUCTURES).forEach(function (site) {
                    if (site.structureType === STRUCTURE_ROAD) {
                        // Favor roads over plain tiles
                        costs.set(site.pos.x, site.pos.y, 1);
                    }
                });*/

                room.find(FIND_STRUCTURES).forEach(function (site) {
                    if ((site.structureType === STRUCTURE_WALL) || (site.structureType === STRUCTURE_EXTENSION) || (site.structureType === STRUCTURE_TOWER) || (site.structureType === STRUCTURE_SPAWN)) {
                        // Favor roads over plain tiles
                        costs.set(site.pos.x, site.pos.y, 0xff);
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

global.visualizePaths = function (posi, goalPosi, range = 1, ifEO = true, mr = 1) {
    let ret = findPathBasedOnGridEvenOddGlobal(posi, goalPosi, range, ifEO, mr);
    let path = ret.path
    for (let p = 0; p < path.length - 1; p++) {
        Game.rooms[path[p].roomName].visual.line(convertPosToRoompos(path[p]), convertPosToRoompos(path[p + 1]), { color: 'while', lineStyle: 'dashed' });
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

global.findPathForQuadsLeader = function (posi, goalPosi) {
    var roomName = posi.roomName;

    var goals = [];

    if (goalPosi.roomName !== roomName) { // if position in another room
        let route = Game.map.findRoute(roomName, goalPosi.roomName);
        goalPosi = new RoomPosition(25, 25, route[0].room);
    }

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
        posi, goals,
        {
            // We need to set the defaults costs higher so that we
            // can set the road cost lower in `roomCallback`
            plainCost: 4,
            swampCost: 10,

            maxRooms: 2,

            roomCallback: function (roomName) {

                let room = Game.rooms[roomName];
                // In this example `room` will always exist, but since 
                // PathFinder supports searches which span multiple rooms 
                // you should be careful!
                if (!room) return;
                let costs = new PathFinder.CostMatrix;
                let maparr = Array.from(Array(50), _ => Array(50).fill(1));
                let maparrsum;

                // set none walkable arr pos to 0, if 0, set cost to 0xff

                let terrain = Game.map.getRoomTerrain(posi.roomName);
                for (let i = 0; i < 50; i++) {
                    for (let j = 0; j < 50; j++) {
                        if (terrain.get(i, j) == TERRAIN_MASK_WALL) {
                            maparr[i][j] = 0;
                            costs.set(i, j, 0xff);
                        }
                        else if (terrain.get(i, j) == TERRAIN_MASK_SWAMP) {
                            maparr[i][j] = 4;
                        }
                        else {
                            maparr[i][j] = 1;
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
                        maparr[struct.pos.x][struct.pos.y] = 0;
                        costs.set(struct.pos.x, struct.pos.y, 0xff);
                    }
                });

                room.find(FIND_HOSTILE_CREEPS).forEach(function (struct) {
                    // Can't walk through hostile creeps
                    maparr[struct.pos.x][struct.pos.y] = 0;
                    costs.set(struct.pos.x, struct.pos.y, 0xff);
                });

                // combine matrix for quads
                for (let i = 0; i < 50; i++) {
                    for (let j = 0; j < 50; j++) {
                        if (i == 0 || j == 49) {
                            maparrsum = maparr[i][j];
                        }
                        else {
                            maparrsum = maparr[i][j] * maparr[i - 1][j] * maparr[i][j + 1] * maparr[i - 1][j + 1];
                        }
                        if (maparrsum == undefined || maparrsum == 0) {
                            costs.set(i, j, 0xff);
                        }
                        else {
                            costs.set(i, j, maparrsum);
                        }
                        Game.rooms[roomName].visual.circle(new RoomPosition(i, j, roomName), { fill: 0.8, radius: costs.get(i, j) / 255 * 0.05, stroke: 'whhite' });
                    }
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



