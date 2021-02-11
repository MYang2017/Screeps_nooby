/*
Game.rooms['E39S1'].memory.forSpawning.spawningQueue.push({memory:{role: 'captain', groupName: 'xw'}, priority: 9});
Game.rooms['E39S1'].memory.forSpawning.spawningQueue.push({memory:{role: 'firstMate', groupName: 'xw', boostMat: 'LO'}, priority: 9});
Game.rooms['E39S1'].memory.forSpawning.spawningQueue.push({memory:{role: 'crew', groupName: 'xw', boostMat: 'LO'}, priority: 9});

Game.rooms['E39S1'].memory.forSpawning.spawningQueue.push({memory:{role: 'dismantler', target: 'E45N2'},priority: 0.1});
*/

// captain crew attack at ticks 19833369 19833537 19833792, E98N17 19918519,
// Game.rooms['E94N17'].memory.forSpawning.spawningQueue.push({memory:{role: 'ultimateWorrior', target: 'E98N17'},priority: 0.4});
// Game.rooms['E94N22'].memory.forSpawning.spawningQueue.push({memory:{role: 'healer', target: 'E98N16', boosted: false},priority: 0.4});

var distanceDmg = {1: 10, 2: 4, 3: 1};
var actionRunAway = require('action.flee');

// ================================================ new important session ==================================================================================
global.findNSEWRooms = function(creep) {
    let currentRoomName = creep.room.name;
    let worldsize = Game.map.getWorldSize();
    let currentRoomCoords = parseRoomName(currentRoomName);
    let coordsX = currentRoomCoords.x;
    let coordsY = currentRoomCoords.y;
    let NSEWRoomNames = [];

    var index = [-1,0,1]
    for (let i = 0; i<3; i++) {
        for (let j = 0; j<3; j++) {
            if (Math.abs(index[i])!=Math.abs(index[j])) { // eliminate diagonal rooms
                let x = coordsX + index[i];
                let y = coordsY + index[j];

                if (x > worldsize) {
                    x = worldsize
                }
                if (x < 0) {
                    x = 0
                }
                if (y > worldsize) {
                    y = worldsize
                }
                if (y < 0) {
                    y = 0
                }

                neighbRoomName = generateRoomName(x,y);

                if ( (neighbRoomName != false) && !(Memory.rooms && Memory.rooms[neighbRoomName] && Memory.rooms[neighbRoomName].avoid) ) {
                    NSEWRoomNames.push(neighbRoomName);
                }

            }
        }
    }
    return NSEWRoomNames
}

global.retreatToNexRoom = function(creep) {

}

global.whichOneOfFourCoornersIsSafest = function(roomName) {
    let coordses = fourCoorners()
    let coordsToChoose;
    let minDamage = 600*5+1;

    for (let coords of coordses) {
        let objCoords = {'x':coords[0],'y':coords[1]};
        let damage = calculateTowerDamageAtPoint(objCoords,roomName);
        if (damage<minDamage) {
            minDamage = damage;
            coordsToChoose = objCoords;
        }
    }
    return coordsToChoose
}

global.fourCoorners = function() {
    return [[0,0],[0,49],[49,0],[49,49]];
}

global.calculateTowerDamageAtPoint = function(coords,roomName) {
    const pos = new RoomPosition(coords.x, coords.y, roomName);
    let towers = Game.rooms[roomName].find( FIND_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } }) ;
    let totalDamge = 0;

    for (let tower of towers) {
        let rangeToTower = pos.getRangeTo(tower);
        totalDamge = totalDamge + calculateTowerDamage(rangeToTower);
    }

    return totalDamge
}

global.calculateTowerDamage = function(dist) {
    if (dist<=5) {
        return 600
    }
    else if (dist >= 20) {
        return 150
    }
    else {
        return (600-150)/(20-5)*(20-dist)+150
    }
}

global.healingability = function(creep) {
    return 12*creep.getActiveBodyparts(HEAL)
}

// ================================================ end ====================================================================================================

global.canDefeat = function(creep, target) {
    let targetPos = target.pos;
    let x = targetPos.x;
    let y = targetPos.y;

    let top = y-3;
    if (top<0) {
        top = 0;
    }

    let left = x-3;
    if (left<0) {
        left = 0;
    }

    let bottom = y+3;
    if (bottom>49) {
        bottom = 49;
    }

    let right = x+3;
    if (right>49) {
        right = 49;
    }

    let creeps = creep.room.lookForAtArea(LOOK_CREEPS, top, left, bottom, right, true);

    let myDmg = {1: 0, 2: 0, 3: 0};
    let myHeal = {1: 0, 2: 0, 3: 0};
    let enemyDmg = {1: 0, 2: 0, 3: 0};
    let enemyHeal = {1: 0, 2: 0, 3: 0};

    for (let lookedCreep of creeps) {

        console.log(lookedCreep['creep'].getActiveBodyparts(ATTACK));
    }


}

global.analyseCreepAttackAndHealWithDistance = function(creep) {
    let body = creep.body;
    let rangedDistanceDmg = {1: 10, 2: 4, 3: 1};
    let meleeDistanceDmg = {1: 30, 2: 0, 3: 0};
    let healDistanceHeal = {1: 12, 2: 4, 3: 4};

    let creepDistanceDmg = {1: 0, 2: 0, 3: 0};
    let creepDistanceHeal = {1: 0, 2: 0, 3: 0};

    for (let part of body) {
        if (part.hits>0) { // if this part is still alive
            let bodyType = part.type;
            if (bodyType == ATTACK) {
                let boostType = part.boost;
                let coef = 1; // no boost default damage amplifier
                if (boostType) { // if boosted, calculate amplifier
                    coef = BOOSTS['attack'][boostType];
                }
                creepDistanceDmg['1'] += coef * meleeDistanceDmg['1'];
            }
            else if (bodyType == RANGED_ATTACK) {
                let boostType = part.boost;
                let coef = 1; // no boost default damage amplifier
                if (boostType) { // if boosted, calculate amplifier
                    coef = BOOSTS['ranged_attack'][boostType]['rangedAttack'];
                }
                for (let key of ['1','2','3']) {
                    creepDistanceDmg[key] += coef * rangedDistanceDmg[key];
                }
            }
            else if (bodyType == HEAL) {
                let boostType = part.boost;
                let coef = 1; // no boost default damage amplifier
                if (boostType) { // if boosted, calculate amplifier
                    coef = BOOSTS['heal'][boostType]['heal'];
                }
                for (let key of ['1','2','3']) {
                    creepDistanceHeal[key] += coef * healDistanceHeal[key];
                }
            }
        }
    }
    return [creepDistanceDmg, creepDistanceHeal]
}

global.checkIfCreepIsBoosted = function(creep) {
    let body = creep.body;

    for (let part of body) {
        let boostType = part.boost;
        if (boostType) { // if boosted, calculate amplifier
            return true
        }
    }

    return false
}

global.showDamageAndHeal = function(creep) {
    let [dmg, heal] = analyseCreepAttackAndHealWithDistance(creep);
    for (let key of ['1','2','3']) {
        console.log(dmg[key]);
    }
    for (let key of ['1','2','3']) {
        console.log(heal[key]);
    }
}

global.keepAtDistance = function(creep, distanceToKeep, target) {
    let ditance = creep.pos.getRangeTo(target);
    if (ditance>distanceToKeep) {
        creep.moveTo(target)
    }
    else if (ditance<=distanceToKeep) {
        actionRunAway.run(creep);
    }
}

global.runHealAttack = function(creep, target) {
    let toHeal = creep.pos.findClosestByRange(FIND_MY_CREEPS, { filter: (s) => (s.hits < s.hitsMax) } );
    if (toHeal) { // if there is damaged creep, go heal
        creep.heal(toHeal);
    }
    creep.attack(target);
    creep.rangedAttack(target);
    actionRunAway.run(creep);
}

global.findTeamMate = function(uniqueMark, role) {
    let allMyCreeps = [];
    for (let name in Game.creeps) {
        if ((Game.creeps[name].memory.groupName==uniqueMark)&&(Game.creeps[name].memory.role==role)) {
            return name
        }
    }
}

global.lowestHealthAmongGroup = function(creep1,creep2,creep3) {
    let heath1 = creep1.hitsMax - creep1.hits;
    let missedHealth = 0;
    let toHeal;

    for (let creep of [creep1,creep2,creep3]) {
        if ((creep.hitsMax - creep.hits)>missedHealth) {
            missedHealth = creep.hitsMax - creep.hits;
            toHeal = creep;
        }
    }

    if (toHeal) {
        return toHeal
    }
    else {
        return creep1
    }
}

global.lowestHealthInRoom = function(creep) {
    let creepsInRoom = creep.room.find(FIND_MY_CREEPS);

    let missedHealth = creep.hitsMax - creep.hits;
    let toHeal;

    for (let creepx of creepsInRoom) {
        if ((creepx.hitsMax - creepx.hits)>missedHealth) {
            missedHealth = creepx.hitsMax - creepx.hits;
            toHeal = creepx;
        }
    }
    if (toHeal) {
        return toHeal
    }
    else {
        return findVIPInRoom(creep)
    }

}

global.findVIPInRoom = function(creep) {
    let creepsInRoom = creep.room.find(FIND_MY_CREEPS);

    let VIP = creep;

    for (let creepx of creepsInRoom) {
        if (creepx.getActiveBodyparts(WORK)>0||creepx.getActiveBodyparts(RANGED_ATTACK)>0||creepx.getActiveBodyparts(ATTACK)>0) {
            VIP = creepx;
            break
        }
    }
    return VIP
}

global.fightingDistanceToKeep = function(creep, target) {
    let rangedNumber = target.getActiveBodyparts(RANGED_ATTACK);
    let meleeNumber = target.getActiveBodyparts(ATTACK);
    let moveNumber = target.getActiveBodyparts(MOVE);

    if (meleeNumber==0 && rangedNumber==0) {
        return 1
    }
    else if (meleeNumber>0 && moveNumber==0) {
        return 2
    }
    else {
        return 3
    }
}

global.correctDirection = function (dir) {
    if (dir == 0) {
        dir = 8
    }
    return dir
}

global.sendPirates = function(roomName,groupeName,healerBoostMat) {
    Game.rooms[roomName].memory.forSpawning.spawningQueue.push({memory:{role: 'captain', groupName: groupeName}, priority: 11.5});
    Game.rooms[roomName].memory.forSpawning.spawningQueue.push({memory:{role: 'firstMate', groupName: groupeName, boostMat: healerBoostMat}, priority: 11.5});
    Game.rooms[roomName].memory.forSpawning.spawningQueue.push({memory:{role: 'crew', groupName: groupeName, boostMat: healerBoostMat}, priority: 11.5});
}

global.getPosByDir = function (pos, dir) {
    let roomName = pos.roomName;
    if (dir == 1) {
        posx = pos.x;
        posy = pos.y - 1;
    }
    else if (dir == 2) {
        posx = pos.x + 1;
        posy = pos.y - 1;
    }
    else if (dir == 3) {
        posx = pos.x + 1;
        posy = pos.y;
    }
    else if (dir == 4) {
        posx = pos.x + 1;
        posy = pos.y + 1;
    }
    else if (dir == 5) {
        posx = pos.x;
        posy = pos.y + 1;
    }
    else if (dir == 6) {
        posx = pos.x - 1;
        posy = pos.y + 1;
    }
    else if (dir == 7) {
        posx = pos.x - 1;
        posy = pos.y;
    }
    else if (dir == 8) {
        posx = pos.x - 1;
        posy = pos.y - 1;
    }

    if (posx == -1) {
        // find west (left) room
        roomNameObj = parseRoomName(pos.roomName);
        roomName = generateRoomName(roomNameObj.x - 1, roomNameObj.y);
        posx = 49;
    }
    else if (posx == 50) {
        // find east (right) room
        roomNameObj = parseRoomName(pos.roomName);
        roomName = generateRoomName(roomNameObj.x + 1, roomNameObj.y);
        posx = 0
    }
    else if (posy == -1) {
        // find north (up) room
        roomNameObj = parseRoomName(pos.roomName);
        roomName = generateRoomName(roomNameObj.x, roomNameObj.y - 1);
        posy = 49;
    }
    else if (posy == 50) {
        // find south (down) room
        roomNameObj = parseRoomName(pos.roomName);
        roomName = generateRoomName(roomNameObj.x, roomNameObj.y + 1);
        posy = 0;
    }

    return new RoomPosition(posx, posy, roomName);
}

global.isTerrainWalkableByPos = function (roomName,posx,posy) {
    terrain = new Room.Terrain(roomName);
    switch (terrain.get(posx, posy)) {
        case TERRAIN_MASK_WALL:
            return false
        case TERRAIN_MASK_SWAMP:
            return true
        case 0:
            return true
    }
}

///////////////////////////// power surce code //////////////////////////////////////////////
global.addPowerGroupAtTime = function(time,target,roomName) {
    Game.rooms[roomName].memory.forSpawning.spawningQueue.push({memory:{role: 'powerSourceHealer', target: target, toHeal: target+time},priority: 9.5});
    Game.rooms[roomName].memory.forSpawning.spawningQueue.push({memory:{role: 'powerSourceAttacker', target: target, name: target+time},priority: 9.5});

}

global.addPowerLorryGroupAtTime = function(time,target,roomName,numLorries) {
    for (let i = 0; i<numLorries; i++) {
        Game.rooms[roomName].memory.forSpawning.spawningQueue.push({memory:{role: 'powerSourceLorry', target: target, home: roomName},priority: 9.5});
    }
}


///////////////////////////////////////////////////////////////////////////

global.yaRRRRR = function(roomName) {
    let creepsInRoom = Game.rooms[roomName].find(FIND_MY_CREEPS);

    for (let creepx of creepsInRoom) {
        if (creepx.getActiveBodyparts(WORK)>20||creepx.getActiveBodyparts(RANGED_ATTACK)>0||creepx.getActiveBodyparts(HEAL)>0) {
            creepx.memory.target = 'E98N16';
        }
    }
}
