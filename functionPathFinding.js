global.clearPathCach = function() {
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

global.ifCreepFreezed = function(creep) {
    // load the time frame the last time this creep was checked
    let lastTimeChecked = creep.memory.lastTimeChecked;

    // if not defined, this will be the lastTimeChecked for the next check
    if (lastTimeChecked == undefined) {
        creep.memory.lastTimeChecked = {time: Game.time, posx: creep.pos.x, posy: creep.pos.y};
    }
    else { // compare the position of last time checked, if it is the same and time has passed for a while, find new path
        if ( (creep.pos.x == lastTimeChecked.posx) && (creep.pos.y == lastTimeChecked.posy) && ( (Game.time-lastTimeChecked.time)>5 ) ) {
            lastTimeChecked = {time: Game.time, pos: creep.pos}; // renew timer
            return true // need to find new path
        }
    }
}

global.costMatrizesInitialisation = function() {
    //Game.rooms['E92N11'].memory.costMatrizes = {}
    for (let roomName in Game.rooms) {
        let room = Game.rooms[roomName];

        var costs = new PathFinder.CostMatrix;
        room.find(FIND_STRUCTURES).forEach(function(struct) {
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

        if(room.memory.construction == true)
        {
        room.find(FIND_CONSTRUCTION_SITES).forEach(function(struct) {
          if (struct.structureType === STRUCTURE_ROAD) {
            // Favor roads over plain tiles
            costs.set(struct.pos.x, struct.pos.y, 1);
          } else if (struct.structureType !== STRUCTURE_CONTAINER &&
                     (struct.structureType !== STRUCTURE_RAMPART ||
                      !struct.my)) {
            // Can't walk through non-walkable buildings
            costs.set(struct.pos.x, struct.pos.y, 255);
          }})
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
                    if ((site.structureType === STRUCTURE_WALL) ||(site.structureType === STRUCTURE_EXTENSION) ||(site.structureType === STRUCTURE_TOWER)||(site.structureType === STRUCTURE_SPAWN)) {
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
