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
