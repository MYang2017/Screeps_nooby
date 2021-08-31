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
global.findNSEWRooms = function(rn) {
    let currentRoomName = rn;
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
    let crn = creep.room.name;
    if (creep.memory.shern == undefined) {
        let x = creep.pos.x;
        let y = creep.pos.y;
        let nrn;
        let srn;
        let wrn;
        let ern;
        let dn = Math.abs(y-0);
        let ds = Math.abs(49-y);
        let dw = Math.abs(x-0);
        let de = Math.abs(49-x);
        
        let currentRoomCoords = parseRoomName(crn);
        let coordsX = currentRoomCoords.x;
        let coordsY = currentRoomCoords.y;
        
        let delt = [[0, -1], [0, 1], [-1, 0], [1, 0]];
        var dss = [dn, ds, dw, de];
        var len = dss.length;
        var indices = new Array(len);
        for (var i = 0; i < len; ++i) indices[i] = i;
        indices.sort(function (a, b) { return dss[a] < dss[b] ? -1 : dss[a] > dss[b] ? 1 : 0; });
        for (let ind of indices) {
            let nextrn = generateRoomName(coordsX+delt[ind][0],coordsY+delt[ind][1]);
            if (Game.map.findExit(crn, nextrn)<0) {
                //pass
            }
            else {
                creep.memory.shern = nextrn;
                break;
            }
        }
    }
    else {
        creep.travelTo(new RoomPosition(25, 25, creep.memory.shern), {range: 24});
    }
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

global.calcTowerDmgAtRange = function (range) {
    if (range > 20) {
        return 150;
    } else if (range < 5) {
        return 600;
    }
    return (25 - range) * 30;
}

global.analyseDamageAndHealAtAPosition = function (pos, cn) {
    let ecps = pos.findInRange(FIND_CREEPS, 3, { filter: c => c.owner.username == cn });
    let heal = 0;
    for (let ecp of ecps) {
        let dist = pos.getRangeTo(ecp) + '';
        if (dist == 0) {
            dist = 1;
        }
        heal = analyseCreepAttackAndHealWithDistance(ecp)[1][dist];
    }
    return heal
}

global.getMyHealsAround = function(cp) {
    if (cp) {
        if (cp.memory.myHealsAround == undefined || Game.time%4==0) {
            let myheals = 0;
            let mycps = cp.pos.findInRange(FIND_MY_CREEPS, 3);
            for (let ecp of mycps) {
                let dist = cp.pos.getRangeTo(ecp) + '';
                if (dist == 0) {
                    dist = 1;
                }
                else if (dist>3) {
                    continue;
                }
                myheals += analyseCreepAttackAndHealWithDistance(ecp)[1][dist];
            }
            cp.memory.myHealsAround = myheals;
        }
        return cp.memory.myHealsAround
    }
    else {
        return 0
    }
}

global.shouldIRetreat = function (cp, incdmg) {
    // calc available my healings nearby
    let myheals = getMyHealsAround(cp);
    if (myheals>incdmg) {
        return false
    }
    else {
        return true
    }
    // calc hostile damage nearby
    // if safe
        // return false
    // if dangerous
        // return true
}

global.analyseCreepAttackAndHealWithDistance = function(creep) {
    let body = creep.body;
    let rangedDistanceDmg = {1: 10, 2: 10, 3: 10};
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

global.checkIfCreepIsBoosted = function(creep, ptp=undefined) {
    let body = creep.body;

    for (let part of body) {
        let boostType = part.boost;
        if (ptp) {
            if (part.type==ptp) {
                if (boostType!=undefined) { // if boosted, calculate amplifier
                    return true
                }
            }
            else {
                continue;
            }
        }
        else {
            if (boostType!=undefined) { // if boosted, calculate amplifier
                return true
            }
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
        creep.travelTo(target, {maxRooms: 1})
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

global.isProtectedByRampart = function (pos) {
    let structs = Game.rooms[pos.roomName].lookForAt(LOOK_STRUCTURES, pos.x, pos.y);
    if (structs.length>0) {
        for (let struc of structs) {
            if (struc.structureType==STRUCTURE_RAMPART) {
                return true
            }
        }
    }
    return false
}

///////////////////////////// power surce code //////////////////////////////////////////////
global.addPowerGroupAtTime = function(time,target,roomName,sId, add=false) {
    //Game.rooms[roomName].memory.forSpawning.spawningQueue.push({memory:{role: 'powerSourceHealer', target: target, toHeal: target+time, sId: sId},priority: 9.6});
    if (add) {
        Game.rooms[roomName].memory.forSpawning.spawningQueue.push({ memory: { role: 'powerSourceAttacker', target: target, name: target + time + 0, sId: sId }, priority: 12.01 });
    }
    if (Game.rooms[roomName].memory.ECap >= 2600) {
        Game.rooms[roomName].memory.forSpawning.spawningQueue.push({ memory: { role: 'powerSourceAttacker', target: target, name: target + time, sId: sId }, priority: 12.01 });
    }
    else {
        Game.rooms[roomName].memory.forSpawning.spawningQueue.push({ memory: { role: 'powerSourceAttacker', target: target, name: target + time + 0, sId: sId }, priority: 12.01 });
        Game.rooms[roomName].memory.forSpawning.spawningQueue.push({ memory: { role: 'powerSourceAttacker', target: target, name: target + time + 1, sId: sId }, priority: 12.01 });
    }

}

global.addPowerLorryGroupAtTime = function(time,target,roomName,numLorries, sId) {
    let multi=2;
    if (Game.time>774079) {
        multi=1
    }
    for (let i = 0; i<numLorries*multi; i++) {
        Game.rooms[roomName].memory.forSpawning.spawningQueue.push({memory:{role: 'powerSourceLorry', target: target, home: roomName, sId: sId},priority: 12});
    }
}

global.addPowerSniperAtTime = function(time,target,roomName, sId, big=false) {
    quadsSpawner(roomName, target, 'rt1');
    //kiterSpawner(roomName, target, 'x');
    /*
    Game.rooms[roomName].memory.forSpawning.spawningQueue.push({ memory: { role: 'powerSourceRanger', target: target, big: big}, priority: 12.011 });
    Game.rooms[roomName].memory.forSpawning.spawningQueue.push({ memory: { role: 'powerSourceRanger', target: target, big: big}, priority: 12.011 });
    */
}

global.addPowerJammer = function(target,roomName, sId, lono) {
    for (let i = 0; i<lono; i++) {
        Game.rooms[roomName].memory.forSpawning.spawningQueue.push({ memory: { role: 'powerSourceJammer', target: target, sId: sId}, priority: 12.012 });
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

/////////////////////////////////////////////////////////////////////////////// room defence
global.towerDefence = function (r, enforce=false) {
    if (r.memory.towerDefence == undefined) {
        r.memory.towerDefence = {twIds: [], targetId: undefined};
    }
    let storedIds = r.memory.towerDefence.twIds;
    // recache tower ids
    if (r.controller.level >= 3 && (enforce || Game.time % 29 == 0 || storedIds==undefined)) {
        for (let twId of storedIds) {
            let tw = Game.getObjectById(twId);
            if (tw == null || !tw.isActive() || tw.structureType!=STRUCTURE_TOWER) {
                removeElementInArrayByElement(twId, r.memory.towerDefence.twIds);
            }
        }
        let tws = r.find(FIND_MY_STRUCTURES, { filter:c=>c.structureType==STRUCTURE_TOWER });
        for (let tw of tws) {
            if (tw.isActive() && !r.memory.towerDefence.twIds.includes(tw.id)) {
                r.memory.towerDefence.twIds.push(tw.id);
            }
        }
    }

    // heal pc first
    let toheal = r.find(FIND_MY_POWER_CREEPS, { filter: (s) => (s.hits < s.hitsMax / 5 * 4) });
    if (toheal.length > 0) {
        for (let twId of storedIds) {
            let tw = Game.getObjectById(twId);
            if (tw && tw.isActive() && tw.store.energy > 10) {
                tw.heal(toheal[0]);
            }
        }
    }
    else {
        // if stored target undefined or dead or some timer later
        if (r.memory.towerDefence.focusId == undefined || Game.getObjectById(r.memory.towerDefence.focusId) == null || Game.time % 11 == 0) {
            let crackable = undefined;
            let hosts = r.find(FIND_HOSTILE_CREEPS, { filter: c => !allyList().includes(c.owner.username) });
            for (let host of hosts) {
                let eheal = analyseDamageAndHealAtAPosition(host.pos, host.owner.username);
                let mydmg = 0;
                let storedIds = r.memory.towerDefence.twIds;
                for (let twId of storedIds) {
                    let tw = Game.getObjectById(twId);
                    if (tw && tw.isActive() && tw.store.energy > 10) {
                        mydmg += calcTowerDmgAtRange(tw.pos.getRangeTo(tw));
                    }
                }
                let reds = host.pos.findInRange(FIND_MY_CREEPS, 1, { filter: c => c.memory.role == 'redneck' });
                for (let red of reds) {
                    mydmg += red.getActiveBodyparts(ATTACK) * 30;
                }
                if (mydmg > eheal) {
                    crackable = host.id;
                    r.memory.towerDefence.focusId = crackable;
                    break;
                }
            }
        }
        if (r.memory.towerDefence.focusId) {
            let toatk = Game.getObjectById(r.memory.towerDefence.focusId);
            let storedIds = r.memory.towerDefence.twIds;
            if (toatk) {
                for (let twId of storedIds) {
                    let tw = Game.getObjectById(twId);
                    if (tw && tw.isActive() && tw.store.energy > 10) {
                        tw.attack(toatk);
                    }
                }
            }
            else {
                r.memory.towerDefence.focusId = undefined;
            }
        }
        else {
            if (r.memory.battleMode) {
                let rpts = r.find(FIND_MY_STRUCTURES, { filter: t => t.structureType == STRUCTURE_RAMPART || t.structureType == STRUCTURE_WALL });
                let lowest = 10000000000000;
                let torep;
                for (let rp of rpts) {
                    if (rp.hits < lowest) {
                        torep = rp;
                        lowest = rp.hits;
                    }
                }
                if (torep) {
                    for (let twId of storedIds) {
                        let tw = Game.getObjectById(twId);
                        if (tw && tw.isActive() && tw.store.energy > 10) {
                            tw.repair(torep);
                        }
                    }
                }
            }
            else {
                let target = r.find(FIND_MY_CREEPS, { filter: (s) => (s.hits < s.hitsMax) });
                if (target.length > 0) {
                    for (let twId of storedIds) {
                        let tw = Game.getObjectById(twId);
                        if (tw && tw.isActive() && tw.store.energy > 10) {
                            tw.heal(target[0]);
                        }
                    }
                }
                else {
                    for (let twId of storedIds) {
                        let tw = Game.getObjectById(twId);
                        if (tw && tw.isActive() && tw.store.energy > 10) {
                            tw.repairNoneWalls(r);
                        }
                    }
                }
            }
        }
        // if hostile 
            // update target
            // if target
                // all tower attack
            // else // cannot defeat
                // add active defender
                // if heal my creep
                // else repair
        // else if creep needs healing heal
        // else repair
    }
}

global.popBubble = function(r) {
    let enemies = r.find(FIND_HOSTILE_CREEPS, 
        {filter:s=>
            (s.owner.username!=='Invader')
            &&(!allyList().includes(s.owner.username)) 
            && (s.getActiveBodyparts(HEAL)+s.getActiveBodyparts(ATTACK)+s.getActiveBodyparts(RANGED_ATTACK)+s.getActiveBodyparts(TOUGH)>=4)
            && (s.pos.findInRange(FIND_MY_STRUCTURES, 1, {filter:s=>s.structureType==STRUCTURE_SPAWN||s.structureType==STRUCTURE_TOWER||s.structureType==STRUCTURE_STORAGE||s.structureType==STRUCTURE_TERMINAL||s.structureType==STRUCTURE_LAB}).legnth>1)
        }
        );
    if (enemies.length>0) {
        //r.memory.bubblePopped = true;
        fo(r.name + ' need bubble')
        r.controller.activateSafeMode();
        return true
    }
    if (r.find(FIND_HOSTILE_CREEPS, {filter:s=>s.owner.username=='Invader'&&(!allyList().includes(s.owner.username)) }).length>0 && r.find(FIND_MY_STRUCTURES, {filter:t=>t.structureType==STRUCTURE_TOWER}).legnth==0) {
        r.controller.activateSafeMode();
        return true
    }
}


// quads code <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
global.quadsSpawner = function (rn, tarrn, dry=8) {
    let quadsId = generateRandomStrings()+rn;
    let us = generateRandomStrings();
    // cacheBoostLabs(rn, 'ZH'); //prepare for boost
    Game.rooms[rn].memory.forSpawning.spawningQueue.push({memory:{role: 'quads', target: tarrn, quadsId: quadsId, us: us, ifLead: 1, dry: dry}, priority: 16});
    Game.rooms[rn].memory.forSpawning.spawningQueue.push({memory:{role: 'quads', target: tarrn, quadsId: quadsId, us: us, ifLead: 2, dry: dry}, priority: 15});
    Game.rooms[rn].memory.forSpawning.spawningQueue.push({memory:{role: 'quads', target: tarrn, quadsId: quadsId, us: us, ifLead: 3, dry: dry}, priority: 15});
    Game.rooms[rn].memory.forSpawning.spawningQueue.push({memory:{role: 'quads', target: tarrn, quadsId: quadsId, us: us, ifLead: 4, dry: dry}, priority: 15});
}

global.gaysSpawner = function (rn, tarrn) {
    let us = generateRandomStrings();
    Game.rooms[rn].memory.forSpawning.spawningQueue.push({memory: {role: 'gays', home: rn, target: tarrn, uniqueString: us, mOrf: 'm'}, priority: 12.02});
    Game.rooms[rn].memory.forSpawning.spawningQueue.push({memory: {role: 'gays', home: rn, target: tarrn, uniqueString: us, mOrf: 'f'}, priority: 12.02});
}

global.edgersSpawner = function (rn, tarrn, no=3) {
    let us = generateRandomStrings();
    if (no==2) {
        Game.rooms[rn].memory.forSpawning.spawningQueue.push({memory: {role: 'edger', home: rn, target: tarrn, name: 1+us}, priority: 11.01});
        //Game.rooms[rn].memory.forSpawning.spawningQueue.push({memory: {role: 'edger', home: rn, target: tarrn, name: 2+us}, priority: 11.01});
        Game.rooms[rn].memory.forSpawning.spawningQueue.push({memory: {role: 'edger', home: rn, target: tarrn, name: 3+us}, priority: 11.01});
    }
    else if (no==1) {
        Game.rooms[rn].memory.forSpawning.spawningQueue.push({memory: {role: 'edger', home: rn, target: tarrn, name: 2+us}, priority: 11.01});
    }
    else {
        Game.rooms[rn].memory.forSpawning.spawningQueue.push({memory: {role: 'edger', home: rn, target: tarrn, name: 1+us}, priority: 11.01});
        Game.rooms[rn].memory.forSpawning.spawningQueue.push({memory: {role: 'edger', home: rn, target: tarrn, name: 2+us}, priority: 11.01});
        Game.rooms[rn].memory.forSpawning.spawningQueue.push({memory: {role: 'edger', home: rn, target: tarrn, name: 3+us}, priority: 11.01});
    }
    return us
}
    
global.changeQuadsTarget = function (quadsId, target) {
    for (let cpn in Game.creeps) {
        let cp = Game.creeps[cpn];
        if (cp.memory.role == 'quads' && cp.memory.quadsId == quadsId) {
            cp.memory.target = target;
            cp.memory.restRn = undefined;
        }
    }
}

global.drainSpawner = function (rn, tarrn) {
    Game.rooms[rn].memory.forSpawning.spawningQueue.push({memory:{role: 'drainer', home: rn, target: tarrn},priority: 9.5});
}

global.supportRedneckSpawner = function (rn, tarrn) {
    Game.rooms[rn].memory.forSpawning.spawningQueue.push({memory:{role: 'redneck', target: tarrn, simp: true},priority: 9.5});
}

global.kiterSpawner = function (rn, tarrn, lvl=6) {
    Game.rooms[rn].memory.forSpawning.spawningQueue.push({memory:{role: 'kiter', home: rn, target: tarrn, lvl: lvl},priority: 9.5});
}

global.traderSpawner = function (rn, tarrn) {
    Game.rooms[rn].memory.forSpawning.spawningQueue.push({memory:{role: 'trader', home: rn, target: tarrn}, priority: 5});
}

global.stomperSpawner = function (rn, tarrn) {
    let no = 3;
    if (tarrn && Game.rooms[tarrn] && Game.rooms[tarrn].find(FIND_HOSTILE_CREEPS).length>1) {
        no = 6
    }
    for (let i = 0; i<no; i++) {
        Game.rooms[rn].memory.forSpawning.spawningQueue.push({memory:{role: 'stomper', home: rn, target: tarrn},priority: 9.45});
    }
    //Game.rooms[rn].memory.forSpawning.spawningQueue.push({ memory: { role: 'claimer', target: tarrn, attack: true }, priority: 18 });
}

global.hiderSpawner = function (rn, tar, hide) {
    let dist = Game.map.getRoomLinearDistance(rn, tar) + 1;
    if (Game.time % (1500-dist*50) == 0) {
        Game.rooms[rn].memory.forSpawning.spawningQueue.push({ memory: { role: 'hider', target: tar, hide: hide }, priority: 9.5 });
    }
}

global.labBoostTester = function (rn) {
    Game.rooms[rn].memory.forSpawning.spawningQueue.push({memory:{role: 'tester'}, priority: 19.5});
    //Game.rooms[rn].memory.forSpawning.spawningQueue.push({ memory: { role: 'claimer', target: tarrn, attack: true }, priority: 18 });
}

global.annoyerSpawner = function (rn, tarrn) {
     Game.rooms[rn].memory.forSpawning.spawningQueue.push({memory:{role: 'annoyer', home: rn, target: tarrn},priority: 9.5});
}

global.symbolStealerSpawner = function (rn, tarrn, big=false, stc=undefined) {
    Game.rooms[rn].memory.forSpawning.spawningQueue.push({memory:{role: 'stealer', home: rn, target: tarrn, big: big, stc: stc},priority: 9.5});
}

global.dragonAssSpawner = function (rn, tarrn, big=false) {
    Game.rooms[rn].memory.forSpawning.spawningQueue.push({memory:{role: 'dragonAss', home: rn, target: tarrn, big: big},priority: 9.5});
}

global.symbolAsdpofSpawner = function (rn, tarrn) {
    Game.rooms[rn].memory.forSpawning.spawningQueue.push({memory:{role: 'asdpof', home: rn, target: tarrn},priority: 9.5});
}

global.stealAtNight = function () {
    let d = new Date();
    let hrs = d.getHours();
    if (Game.time%1777==0) {
        //if (hrs>=19 && hrs<=24) {
            //symbolStealerSpawner('E4S23', 'E1S21');
            //symbolStealerSpawner('E7S28', 'E9S28');
            //symbolStealerSpawner('E7S28', 'E4S29');
            symbolStealerSpawner('E7S28', 'E5S27');
            //symbolStealerSpawner('E1S27', 'E1S24');
            //symbolStealerSpawner('E1S27', 'E3S26');
            symbolStealerSpawner('E7S28', 'E11S27');
            //symbolStealerSpawner('E7S28', 'E11S28');
        //}
    }
    if (Game.time%1777==0) { // digital
        //symbolStealerSpawner('E11S16', 'E7S15');
    }
}

global.teezerSpawner = function (rn, tarrn) {
    Game.rooms[rn].memory.forSpawning.spawningQueue.push({memory:{role: 'teezer', home: rn, target: tarrn, energy: Game.rooms[rn].memory.ECap},priority: 9.5});
}

global.thisIsWhatYouWanted = function () {
    //kiterSpawner('E19S19', 'E23S19')
    //kiterSpawner('E19S19', 'E23S16')
}

global.ifOnEdgeOfRoom = function (rp) {
    if (rp.x==0||rp.x==49||rp.y==0||rp.y==49) {
        return true
    }
    else {
        return false
    }
}

global.helpDefendRoom = function (supporter, underFuck, enforce=false) {
    let sr = Game.rooms[supporter];
    let ber = Game.rooms[underFuck];
    let sp = ber.find(FIND_MY_STRUCTURES, {structureType: STRUCTURE_SPAWN}).length>0;
    if (ber.memory.peaceTimer == undefined) {
        ber.memory.peaceTimer = Game.time;
    }
    if (true) {
        let nofucker = ber.find(FIND_HOSTILE_CREEPS, {filter:s=>s.owner.username!='Invader'}).length;
        let roomNeedDefender = nofucker>0;
        if (roomNeedDefender) {
            ber.memory.peaceTimer = Game.time;
        }
        let interv = Math.max(100, Math.floor(500/Math.max(1, nofucker)));
        let roomNeedBuilder = ber.find(FIND_MY_STRUCTURES, {structureType: STRUCTURE_SPAWN}).length==0;
        if ((ber.memory.peaceTimer+1500>Game.time) && roomNeedDefender && Game.time%interv==0) {
            sr.memory.forSpawning.spawningQueue.push({memory:{role: 'attacker', home: supporter, target: underFuck},priority: 9.5});
        }
        else if (ber.memory.peaceTimer+1500<Game.time && Game.time%1500==0) {
            sr.memory.forSpawning.spawningQueue.push({memory:{role: 'attacker', home: supporter, target: underFuck},priority: 9.5});
        }

        if (!sp && ((nofucker<=2 && Game.time%555==0)||enforce)) {
            sr.memory.forSpawning.spawningQueue.push({ memory: { energy: Math.min(1500, sr.memory.ECap), role: 'pioneer', target: underFuck , home: supporter, superUpgrader: false, route:  undefined }, priority: 10 });
        }
    }
    else {
    }
}

global.chainMotion = function (creep, tarpos, followerName, ifLead) {
    if (creep.room.name==creep.memory.home) {
        let rpos = roomWonderingPosi(creep.room);
        if (creep.memory.preGathered == undefined) {
            if (creep.pos.getRangeTo(rpos.x, rpos.y)>2) {
                creep.travelTo(new RoomPosition(rpos.x, rpos.y, creep.memory.home), {maxRooms: 1});
                return
            }
            else {
                creep.memory.preGathered = true;
            }
        }
    }
    let actionRunAway = require('action.idle');
    /*
    fo(creep.name)
    fo(tarpos)
    fo(followerName)
    fo(ifLead)
    */
    // if last one of chain
    if (followerName == undefined) {
        creep.moveTo(tarpos);
    }
    else {
        // find female
        let f = Game.creeps[followerName];
        // if female
        if (f==null || f.spawning) {
            actionRunAway.run(creep);
        }
        if (f) {
            if (ifOnEdgeOfRoom(creep.pos) || (f.room.name==creep.room.name && creep.pos.getRangeTo(f)<2)) {
                if (ifLead) { // go to target room with pathfinding
                    let route = Game.map.findRoute(creep.room, tarpos.roomName, {
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
                            else if (Game.shard.name=='shard3' && (roomName=='E11S49'||roomName=='E12S49'||roomName=='E11S51')) {
                                return 255;
                            }
                            else if (Memory.rooms[roomName] && Memory.rooms[roomName].avoid) {
                                return 255;
                            }
                            else {
                                return 2.8;
                            }
                        }
                    });

                    if (route.length > 0) {
                        let exit = creep.pos.findClosestByRange(route[0].exit);
                            creep.travelTo(exit, { maxRooms: 1 });
                    }
                    else { // already in same room
                        creep.moveTo(tarpos, {maxRooms: 1});
                    }
                }
                else { // move to target position
                    creep.moveTo(tarpos);
                }
            }
            else {
                // wait for f to come to the same room
                if (ifLead && creep.room.name == creep.memory.home) { // move to waiting position
                    let rrpos = roomWonderingPosi(creep.room);
                    creep.moveTo(rrpos.x, rrpos.y);
                    //roomWonderingPosi(creep.room);
                }
                else {
                    if (creep.memory.preGathered == undefined) {
                        actionRunAway.run(creep);
                    }
                }
            }
        }
    }
}

global.rampartManagement = function (rn) {
    let r = Game.rooms[rn];
    if (r.memory.cachedRamparts == undefined) {
        r.memory.cachedRamparts = [];
    }
    
    let friendsno = r.find(FIND_HOSTILE_CREEPS, {filter:c=>allyList().includes(c.owner.username)}).length;
    let totno = r.find(FIND_HOSTILE_CREEPS).length;
    let open = friendsno==totno && friendsno>0; // only friends in room
    
    if (Game.time%11==0 || open) {
        let rps = r.find(FIND_MY_STRUCTURES, {filter:t=>t.structureType==STRUCTURE_RAMPART});
        for (let rp of rps) {
            if (!r.memory.cachedRamparts.includes(rp.id)) {
                r.memory.cachedRamparts.push(rp.id);
            }
        }
    }
    for (let rid of r.memory.cachedRamparts) {
        let rp = Game.getObjectById(rid);
        if (rp == null || rp.structureType==undefined || rp.structureType!=STRUCTURE_RAMPART) {
            removeElementInArrayByElement(rid, r.memory.cachedRamparts)
        }
    }
    
    // if hostile in room
    if (totno>0 && totno>friendsno) {
        for (let rid of r.memory.cachedRamparts) {
            let rp = Game.getObjectById(rid);
            if (rp.isPublic) {
                rp.setPublic(false);
            }
        }
    }
    else {
        for (let rid of r.memory.cachedRamparts) {
            let rp = Game.getObjectById(rid);
            if (!rp.isPublic) {
                rp.setPublic(true);
            }
        }
    }
}

global.addEdgeCampTask = function (mrn, defrn, incrn, qrn, pcn, pn) {
    // addEdgeCampTask('W19S18', 'W20S16', 'W20S15', ['W20S13', 'W20S12', 'W20S11', 'W20S10', 'W20S9'], '艹艹', 'QzarSTB')
    if (Memory.EdgeCampTask == undefined) {
        Memory.EdgeCampTask = {};
    }
    let tid = generateRandomStrings();
    Memory.EdgeCampTask[tid] = {mrn: mrn, defrn: defrn, incrn: incrn, qrn: qrn, t0: undefined, edgers: [], pcn: pcn, pn: pn};
}

global.edgerMotionManager = function (ens, incrn, pcn, pn) {
    let engaged = [];
    for (let en of ens) {
        let edger = Game.creeps[en];
        if (edger && edger.memory && edger.memory.in) {
            engaged.push(edger.id);
        }
    }

    if (engaged.length>0) {
        // obtain watcher room
        let incr = Game.rooms[incrn];
        if (incr==undefined) {
            // pc watch
            let pc = Game.powerCreeps[pcn];
            if (pc) {
                
            }
        }
        else {
            // obtain closest creep x coord;
            let tars = incr.find(FIND_HOSTILE_CREEPS, {filter: c=>c.owner.username==pn && (c.getActiveBodyparts(ATTACK)+c.getActiveBodyparts(RANGED_ATTACK)+c.getActiveBodyparts(HEAL)+c.getActiveBodyparts(WORK)+c.getActiveBodyparts(CLAIM)>0)});
            if (tars.length>0) {
                let yest = 0;
                let xtobe = undefined;
                for (let tar of tars) {
                    if (tar.pos.y>yest) {
                        yest = tar.pos.y;
                        xtobe = tar.pos.x;
                    }
                }
                
                for (let eid of engaged) {
                    let edger = Game.getObjectById(eid);
                    edger.memory.campx = xtobe;
                }
            }
        }
    }
}

global.runEdgeCampTask = function () {
    // init camp timer, timer, edger names
    if (Memory.EdgeCampTask == undefined) {
        Memory.EdgeCampTask = {};
    }
    
    for (let tid in Memory.EdgeCampTask) {
        let task = Memory.EdgeCampTask[tid];
        let t0 = task.t0;
        let edgers = task.edgers;
        let pcn = task.pcn;
        let pn = task.pn;
        let mrn = task.mrn;
        
        let pc = Game.powerCreeps[pcn];
        if (!pc) {
            fo('edge camp task no watcher pc ' + pcn);
            continue;
        }
        
        // timing and spawning control
        if (task.t0 && Game.time<=task.t0+1300) {
            // fighting
        }
        else if (task.t0==undefined) {
            for (let watchname of task.qrn) { // loop rooms to watch
                let wr = Game.rooms[watchname];
                if (wr) {
                    let alarm = wr.find(FIND_HOSTILE_CREEPS, {filter: c=>c.owner.username==pn && ((c.getActiveBodyparts(CLAIM)>0)||(c.getActiveBodyparts(RANGED_ATTACK)+c.getActiveBodyparts(HEAL)+c.getActiveBodyparts(WORK)>5))}).length>0;
                    if (alarm) { // if find hostile, prespawn
                        let noofedgers = 3;
                        let hostcps = wr.find(FIND_HOSTILE_CREEPS, {filter: c=>c.owner.username==pn});
                        let attackParts = 0;
                        let workParts = 0;
                        for (let hostcp of hostcps) {
                            attackParts += hostcp.getActiveBodyparts(RANGED_ATTACK) + hostcp.getActiveBodyparts(ATTACK) + hostcp.getActiveBodyparts(HEAL);
                            workParts += hostcp.getActiveBodyparts(WORK);
                        }
                        if (attackParts>25) {
                            noofedgers = 3;
                        }
                        else if (workParts>10) {
                            noofedgers = 2;
                        }
                        else {
                            noofedgers = 1
                        }
                        // spawn
                        let us = edgersSpawner(task.mrn, task.defrn, noofedgers);
                        Memory.EdgeCampTask[tid].edgers.push(1+us);
                        Memory.EdgeCampTask[tid].edgers.push(2+us);
                        Memory.EdgeCampTask[tid].edgers.push(3+us);
                        // add to edger list
                        Memory.EdgeCampTask[tid]['t0'] = Game.time;
                        fo('send edgers from ' + mrn);
                        break;
                    }
                }
            }
        }
        else if (Game.time>task.t0+1300) {
            Memory.EdgeCampTask[tid].t0 = undefined;
        }
        else {
            fo('edger watching unreal case in functionWar');
        }

        // watching and motion control
        for (let en of edgers) {
            let edger = Game.creeps[en];
            let spq = Game.rooms[mrn].memory.forSpawning.spawningQueue;
            if (edger == undefined) {
                let removeFromQ = true;
                for (let spinfo of spq) {
                    if (spinfo.memory.name == en) {
                        removeFromQ = false;
                        break;
                    }
                }
                if (removeFromQ) {
                    removeElementInArrayByElement(en, Memory.EdgeCampTask[tid].edgers);
                }
            }
        }
        edgerMotionManager(edgers, task.incrn, pcn, pn);
    }
}

global.startCampTask = function (rn) {
    let r = Game.rooms[rn];
    if (Memory.campTask == undefined) {
        Memory.campTask = {};
    }
    if (Memory.campTask[rn] == undefined) {
        if (r) {
            let xcreeps = r.find(FIND_HOSTILE_CREEPS, {filter:s=>s.owner.username!='Invader' && !allyList().includes(s.owner.username) && (s.getActiveBodyparts(HEAL)+s.getActiveBodyparts(ATTACK)+s.getActiveBodyparts(RANGED_ATTACK)+s.getActiveBodyparts(WORK)+s.getActiveBodyparts(CLAIM)>0)});
            let na = 1;
            let nr = 1;
            for (let xc of xcreeps) {
                na += xc.getActiveBodyparts(ATTACK);
                nr += xc.getActiveBodyparts(RANGED_ATTACK);
            }
            Memory.campTask[rn] = {t0: Game.time, enemyInfo: {a: na, r: nr}};
        }
        else {
            Memory.campTask[rn] = {t0: Game.time, enemyInfo: {a: 1, r: 1}};
        }
    }
    else {
        if (r) {
            let xcreeps = r.find(FIND_HOSTILE_CREEPS, {filter:s=>s.owner.username!='Invader' && !allyList().includes(s.owner.username) && (s.getActiveBodyparts(HEAL)+s.getActiveBodyparts(ATTACK)+s.getActiveBodyparts(RANGED_ATTACK)+s.getActiveBodyparts(WORK)+s.getActiveBodyparts(CLAIM)>0)});
            let na = 1;
            let nr = 1;
            for (let xc of xcreeps) {
                na += xc.getActiveBodyparts(ATTACK);
                nr += xc.getActiveBodyparts(RANGED_ATTACK);
            }
            if (na>Memory.campTask[rn].na) {
                Memory.campTask[rn].na = na;
            }
            if (na>Memory.campTask[rn].nr) {
                Memory.campTask[rn].na = nr;
            }
        }
    }
}

global.primitiveCamping = function (rn, trn) {
    let tr = Game.rooms[trn];
    let dist = Game.map.findRoute(rn, trn).length+1;
    let nohost = 0;
    if (tr) {
        nohost = tr.find(FIND_HOSTILE_CREEPS, {filter:s=>s.owner.username!='Invader' && !allyList().includes(s.owner.username)}).length;
    }
    if ((tr==undefined||nohost==0) && Game.time%(1500-dist*50)==0) {
        kiterSpawner(rn, trn, 4);
    }
    else if (nohost>0) {
        if (tr==undefined && Game.time%(1500-Math.min(dist*50*2, 666))==0) {
            kiterSpawner(rn, trn, 5);
            kiterSpawner(rn, trn, 5);
        }
    }
}

// pcToBattleInitializer('艹艹艹', 'W2S29', 'E1S29', false)
global.pcToBattleInitializer = function (pcn, trn, hrn, reinit = true) {
    // pc memory init
    if (reinit) {
        Game.powerCreeps[pcn].memory.battleQ = {trn: trn, atkPos: {x: undefined, y: undefined}, restPos: {x: undefined, y: undefined, rn: undefined}};
        // deliveroos
        Game.rooms[hrn].memory.forSpawning.spawningQueue.push({memory:{role: 'deliveroo', target: trn, home: hrn, type: 'h', pcn: pcn}, priority: 10});
    }
    Game.rooms[hrn].memory.forSpawning.spawningQueue.push({memory:{role: 'deliveroo', target: trn, home: hrn, type: 'c', pcn: pcn}, priority: 10});
}