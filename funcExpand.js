global.sendClaimer = function (home, target, sendP = true, bigClaim = undefined, no = 1) { // route function not ready yet!
    let room = Game.rooms[home];

    let spawningQueue = room.memory.forSpawning.spawningQueue;
    console.log('Room ' + home + ' sent claimer ' + target);
    if (no == 1) {
       spawningQueue.push({ memory: { role: 'claimer', target: target, attack: bigClaim }, priority: 18 });
    }
    else {
        let us = generateRandomStrings();
        let tr = Game.rooms[target];
        if (tr) {
            if (tr && tr.controller && tr.controller.level == 1) {
                let ttd = tr.controller.ticksToDowngrade;
                if (ttd>0) {
                    let noclaimpart = (tr.controller.ticksToDowngrade-1300)/300;
                    if (noclaimpart>0) {
                        let euse = noclaimpart * (600+50);
                        no = Math.min(3, Math.ceil(euse/room.energyCapacityAvailable));
                    }
                    else {
                        return
                    }
                }
            }
        }
        for (let i = 0; i < no; i++) {
            let cn = i + us;
            spawningQueue.push({ memory: { role: 'claimer', target: target, attack: bigClaim, uniqueString: cn, no: no }, priority: 18 });
        }
    }
    
    if (sendP) {
        room.memory.forSpawning.spawningQueue.push({ memory: { energy: room.energyCapacityAvailable * .875, role: 'pioneer', target: target, home: room.name, superUpgrader: false, route: route }, priority: 8 });
        console.log('Room ' + home + ' sent fitst pioneer to room ' + target);
    }
}

// this is the main function
global.helpSubroom = function (home, target) { // send claimer and first pioneer to new unclaimed room
    let room = Game.rooms[home];

    if (room.memory.subRoom == undefined) {
        room.memory.subRoom = [target];
    }
    else {
        room.memory.subRoom.push(target);
    }

    sendClaimer(home, target);
}

global.sendPioneer = function (roomName, toHelpName, ifSuper, energy) {
    Game.rooms[roomName].memory.forSpawning.spawningQueue.push({ memory: { energy: energy, role: 'pioneer', target: toHelpName, home: roomName, superUpgrader: ifSuper, route: undefined }, priority: 16 });
}

global.sendSacrificer = function (rn, tarrn, tp=undefined, capa=undefined) {
    Game.rooms[rn].memory.forSpawning.spawningQueue.push({ memory: { role: 'sacrificer', home: rn, target: tarrn, toTp: tp, capa: capa }, priority: 9.5 });
}

global.ifKeepHelping = function (home, target) { // if keep sending pioneers
    let room = Game.rooms[home];
    let helpedRoom = Game.rooms[target];

    if (room.memory.subRoom && room.memory.subRoom.length>0) { // if in the process of claiming a sub room
        if (helpedRoom == undefined || (ifSpawnAvailable(target).length < 1)) { // if sub room spawn not ready
            return true
        }
        else { // if sub room mature, stop sending pioneers
            removeElementInArrayByElement(target, room.memory.subRoom);
            helpedRoom.memory.needHelp = false;
            return false
        }
    }
    else { // if not in the process of claiming a sub room
        return false
    }
}


global.startClaimRoom = function (home) {
    let room = Game.rooms[home];
    if (room.memory.subRoom == undefined || room.memory.subRoom.length == 0) {
        return false
    }
    else {
        return true
    }
}

// check every xxx ticks to provid pioneers
global.mainBuildSub = function (room, route) {
    let subRoomNames = room.memory.subRoom;
    if (subRoomNames && subRoomNames.length>0) {
        for (let subRoomName of subRoomNames) {
    
            let subRoom = Game.rooms[subRoomName];
        
        
            if (subRoomName == undefined) {
                return false
            }
            else {
                if (ifKeepHelping(room.name, subRoomName)) {
                    route = undefined;
        
                    if (subRoom == undefined && Game.time%1500==111) { // if decayed and lost
                        console.log('Room ' + room.name + ' sent claimer ' + subRoomName);
                        room.memory.forSpawning.spawningQueue.push({ memory: { role: 'claimer', target: subRoomName }, priority: 18 });
                    }
                    
                    let rdist = Game.map.getRoomLinearDistance(room.name, subRoomName);
                    let ttt = rdist*50+50;
                    
                    if (Game.time%(Math.max(399, 1500-ttt))==0) {
                        let ecap = room.energyCapacityAvailable;
                        let eReses = Memory.mapInfo[subRoomName].eRes;
                        if (Game.shard.name=='shardSeason') { // 1 big in season3
                            room.memory.forSpawning.spawningQueue.push({ memory: { energy: ecap, role: 'pioneer', target: subRoomName, home: room.name, superUpgrader: false, route: route }, priority: 0.4 });
                            console.log('Room ' + room.name + ' sent pioneer to room ' + subRoomName);
                        }
                        else {
                            for (let eRes in eReses) {
                                room.memory.forSpawning.spawningQueue.push({ memory: { energy: ecap, role: 'pioneer', target: subRoomName, home: room.name, superUpgrader: false, route: route }, priority: 0.4 });
                                console.log('Room ' + room.name + ' sent pioneer to room ' + subRoomName);
                            }
                        }
                    }
                }
                else {
                    return false
                }
            }
        }
    }
}

global.ifWaitForRenew = function (creep) {
    if (creep.memory.stayToBePumped == undefined) {
        creep.memory.stayToBePumped = false;
    }
    if (creep.room.name=='E29S51' && Game.shard.name=='shard3') {
        creep.memory.stayToBePumped = false;
        return false
    }
    if (creep.memory.stayToBePumped == false) {
        if (creep.ticksToLive < 200) {
            creep.say('T_T');

            let roomSpawns = creep.room.find(FIND_STRUCTURES, { filter: s => s.structureType == STRUCTURE_SPAWN });

            if (roomSpawns.length > 0) {
                let roomSpawn = roomSpawns[0];

                if (roomSpawn.energy > 200) {
                    if (roomSpawn.renewCreep(creep) == -9) {
                        creep.travelTo(roomSpawn);
                        return true
                    }
                    else if (roomSpawn.renewCreep(creep) == 0) {
                        // stay and wait to be pumped
                        creep.memory.stayToBePumped = true;
                        creep.transfer(roomSpawn, 'energy')
                        return true
                    }
                    else {
                        creep.memory.stayToBePumped = false;
                        return false
                    }
                }
                else {
                    creep.memory.stayToBePumped = false;
                    return false
                }
            }
            else {
                creep.memory.stayToBePumped = false;
                return false
            }

        }
        else {
            creep.memory.stayToBePumped = false;
            return false
        }
    }
    else {
        let roomSpawn = creep.room.find(FIND_STRUCTURES, { filter: s => s.structureType == STRUCTURE_SPAWN })[0];
        if ((creep.ticksToLive > 1300) || (roomSpawn.energy < 50)) {
            creep.memory.stayToBePumped = false;
            return false
        }
        else {
            // stay and wait to be pumped
            if (roomSpawn.renewCreep(creep) == 0) {
                creep.memory.stayToBePumped = true;
                return true
            }
            else {
                creep.memory.stayToBePumped = false;
                return false
            }
        }
    }

}

global.logGrandeRoomInfo = function (r, rerun = false) {
    let rName = r.name;

    if (!Memory.mapInfo) {
        Memory.mapInfo = {};
    }

    if (!Memory.mapInfo[rName] || rerun) {
        Memory.mapInfo[rName] = {};

        // energy res
        if (!Memory.mapInfo[rName]['eRes']) {
            Memory.mapInfo[rName]['eRes'] = {};
        }
        let energyResources = r.find(FIND_SOURCES);
        if (energyResources) {
            for (let energyResource of energyResources) {
                if (true) { //(energyResource.resourceType == RESOURCE_ENERGY) {
                    let posi = returnFirstAvailableNoStructureLandCoords(r, energyResource.pos);
                    let posis = returnALLAvailableNoStructureLandCoords(r, energyResource.pos);
                    if (posi) {
                        Memory.mapInfo[rName]['eRes'][energyResource.id] = { posi: energyResource.pos, easyContainerPosi: posi, }
                    }
                    if (posis.length > 0) {
                        Memory.mapInfo[rName]['eRes'][energyResource.id]['posis'] = posis;
                    }
                }
                else { // other resource

                }
            }
        } else {
            Memory.mapInfo[rName]['eRes'] = undefined
        }

        // controller

        if (r.controller) {
            let controObj = r.controller;

            if (!Memory.mapInfo[rName]['contreId']) {
                Memory.mapInfo[rName]['contreId'] = {};
            }

            Memory.mapInfo[rName]['contreId'] = controObj.id;

            // owner
            if (!Memory.mapInfo[rName]['owner']) {
                Memory.mapInfo[rName]['owner'] = {};
            }
            if (controObj) {
                Memory.mapInfo[rName]['owner'] = controObj.owner;
            }

            // RCL
            if (!Memory.mapInfo[rName]['RCL']) {
                Memory.mapInfo[rName]['RCL'] = {};
            }
            if (controObj && controObj.owner) {
                Memory.mapInfo[rName]['RCL'] = controObj.level;
            }
        }
    }
    else {
        let controObj = r.controller;
        if (Memory.mapInfo[rName]['owner'] && Memory.mapInfo[rName]['owner'] !== controObj.owner) {
            Memory.mapInfo[rName]['owner'] = controObj.owner;
            Memory.mapInfo[rName]['RCL'] = controObj.level;
        }
    }
}

global.returnFirstAvailableNoStructureLandCoords = function (r, posi) {
    let cx = posi.x;
    let cy = posi.y;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (!(i == 1) && !(j == 1)) {
                let x = cx + i - 1;
                let y = cy + j - 1;
                let terrain = Game.map.getRoomTerrain(r.name);
                if (!(terrain.get(x, y) == TERRAIN_MASK_WALL)) {
                    return { x: x, y: y }
                }
            }
        }
    }
    return
}

global.returnALLAvailableNoStructureLandCoords = function (r, posi) {
    let cx = posi.x;
    let cy = posi.y;
    let posis = [];
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (!((i == 1) && (j == 1))) {
                let x = cx + i - 1;
                let y = cy + j - 1;
                let terrain = Game.map.getRoomTerrain(r.name);
                if (!(terrain.get(x, y) == TERRAIN_MASK_WALL)) {
                    let structs = r.lookForAt(LOOK_STRUCTURES, x, y);
                    if (structs.length == 0) {
                        let sites = r.lookForAt(LOOK_CONSTRUCTION_SITES, x, y);
                        if (sites.length == 0) {
                            posis.push({ x: x, y: y });
                        }
                    }
                }
            }
        }
    }
    return posis
}

global.returnALLAvailableLandCoords = function (r, posi) {
    let cx = posi.x;
    let cy = posi.y;
    let posis = [];
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (!((i == 1) && (j == 1))) {
                let x = cx + i - 1;
                let y = cy + j - 1;
                let terrain = Game.map.getRoomTerrain(r.name);
                if (!(terrain.get(x, y) == TERRAIN_MASK_WALL)) {
                    posis.push({ x: x, y: y });
                }
            }
        }
    }
    return posis
}

global.shuffleArray = function (arr) {
    arr.sort(() => Math.random() - 0.5);
}

global.returnALLAvailableNoStructureLandCoords3 = function (r, posi) {
    let cx = posi.x;
    let cy = posi.y;
    let posis = [];
    for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
            if ((!(i == 3) && !(j == 3))) {
                let x = cx + i - 3;
                let y = cy + j - 3;
                if ((x > 1 && x < 48) && (y > 1 && y < 48)) {
                    let terrain = Game.map.getRoomTerrain(r.name);
                    if (!(terrain.get(x, y) == TERRAIN_MASK_WALL)) {
                        posis.push({ x: x, y: y });
                    }
                }
            }
        }
    }
    //return
    return shuffleArray(posis)
}

global.returnALLAvailableNoStructureCreepLandCoords = function (r, posi) {
    let cx = posi.x;
    let cy = posi.y;
    let posis = [];
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (!((i == 1) && (j == 1))) {
                let x = cx + i - 1;
                let y = cy + j - 1;
                let terrain = Game.map.getRoomTerrain(r.name);
                let found = r.lookForAt(LOOK_CREEPS, posi.x, posi.y);
                if ((found.length == 0) && ((terrain.get(x, y) !== TERRAIN_MASK_WALL))) {
                    posis.push({ x: x, y: y });
                }
            }
        }
    }
    return posis
}

global.generateTDLRRoomnames = function (rn) {
    let ok = parseRoomName(rn);
    let ret = []
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (Math.abs(i) + Math.abs(j) == 1) {
                ret.push(generateRoomName(ok.x + i, ok.y + j));
            }
        }
    }
    return ret
}

global.areRoomsDirectlyConnected = function (rn1, rn2) {
    let route = Game.map.findRoute(rn1, rn2);
    if (route && route.length==1) {
        return true
    }
    else {
        return false
    }
}

global.parseRoomName = function (roomName) {
    let kWorldSize = Game.map.getWorldSize();
    let room = /^([WE])([0-9]+)([NS])([0-9]+)$/.exec(roomName);
    if (!room) {
        throw new Error('Invalid room name ' + roomName);
    }
    let rx = (kWorldSize >> 1) + (room[1] === 'W' ? -Number(room[2]) : Number(room[2]) + 1);
    let ry = (kWorldSize >> 1) + (room[3] === 'N' ? -Number(room[4]) : Number(room[4]) + 1);
    if (!(rx >= 0 && rx <= kWorldSize && ry >= 0 && ry <= kWorldSize)) {
        throw new Error('Invalid room name ' + roomName);
    }
    return { x: rx, y: ry };
}

global.reduceArrayOfRoomnamesToMinRectBoundRoomnames = function (rns) {
    // run normally
    let minrns = reduceRectangleRoomArea(rns);
    // if room names contain 0s
    let check = false;
    let rerun = true;
    for (let rn of minrns) {
        if (rn.includes('W0')) {
            check = true;
            break
        }
    }
    if (check) {
        for (let rn of minrns) {
            if (rn.includes('E0')) {
                rerun = false;
                break
            }
        }
    }
    if (rerun) {
        let additionrns = [];
        for (let rn of rns) {
            if (rn.includes('W0')) {
                
            }
            else {
                additionrns.push(rn);
            }
        }
        additionrns = reduceRectangleRoomArea(additionrns);
        for (let additionrn of additionrns) {
            if (minrns.includes(additionrn)) {
                
            }
            else {
                minrns.push(additionrn)
            }
        }
    }
    return minrns
}

global.reduceRectangleRoomArea = function (rns) {
    if (rns.length<=2) {
        return rns
    }
    else {
        let minrns = [];
        let xmin;
        let xmax;
        let ymin;
        let ymax;
        let rn1 = parseRoomName(rns[0]);
        let rn2 = parseRoomName(rns[1]);
        // initial bound
        if (rn1.x <= rn2.x) {
            xmin = rn1.x;
            xmax = rn2.x;
        }
        else {
            xmin = rn2.x;
            xmax = rn1.x;
        }
        if (rn1.y <= rn2.y) {
            ymin = rn1.y;
            ymax = rn2.y;
        }
        else {
            ymin = rn2.y;
            ymax = rn1.y;
        }
        // update boundary by all room names
        for (rn of rns) {
            [xmin, xmax, ymin, ymax] = updateBoundByRoomnameAndBound(rn, xmin, xmax, ymin, ymax);
        }
        // only keep room names at boundary
        for (rn of rns) {
            let pn = parseRoomName(rn);
            if ((pn.x == xmin || pn.x == xmax) && (pn.y == ymin || pn.y == ymax)) {
                minrns.push(rn);
            }
        }
        return minrns
    }
}

global.updateBoundByRoomnameAndBound = function(rn, xmin, xmax, ymin, ymax) {
    let pn = parseRoomName(rn);
    if (pn.x<=xmin) {
        xmin = pn.x;
    }
    else if (pn.x>=xmax) {
        xmax = pn.x;
    }
    if (pn.y<=ymin) {
        ymin = pn.y;
    }
    else if (pn.y>=ymax) {
        ymax = pn.y;
    }
    return [xmin, xmax, ymin, ymax]
}

global.isHighway = function (rn) {
    let parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(rn);
    return (parsed[1] % 10 === 0) || (parsed[2] % 10 === 0);
}

global.isSk = function (rn) {
    let parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(rn);
    return ((parsed[1] % 10 >= 4 && parsed[1] % 10 <= 6) && (parsed[2] % 10 >= 4 && parsed[2] % 10 <= 6));
}

global.generateRoomName = function (xx, yy) {
    let kWorldSize = Game.map.getWorldSize();
    if (!(xx >= 0 && xx <= kWorldSize && yy >= 0 && yy <= kWorldSize)) {
        return false;
    }
    else {
        return (
            (xx <= kWorldSize >> 1 ? 'W' + ((kWorldSize >> 1) - xx) : 'E' + (xx - (kWorldSize >> 1) - 1)) +
            (yy <= kWorldSize >> 1 ? 'N' + ((kWorldSize >> 1) - yy) : 'S' + (yy - (kWorldSize >> 1) - 1))
        );
    }
}

global.isInSameSector = function (rn1, rn2) {
    let de1 = decomposeRoomNameIntoFourParts(rn1);
    let de2 = decomposeRoomNameIntoFourParts(rn2);

    // direction same
    if (de1[0] == de2[0] && de1[2] == de2[2] && isInSameSectorxy(de1[1], de2[1]) && isInSameSectorxy(de1[3], de2[3])) {
        return true
    }
    else {
        return false
    }
}

global.isInSameSectorxy = function (a, b) {
    if (a % 10 != 0) {
        if (b >= a - a % 10 && b <= a - a % 10 + 10) {
            return true
        }
    }
    else if (b % 10 != 0) {
        if (a >= b - b % 10 && a <= b - b % 10 + 10) {
            return true
        }
    }
    else {
        if (Math.abs(a - b) == 10 || a == b) {
            return true
        }
    }
    return false
}

global.generateRoomnameWithDistance = function (roomName) {
    let cxy = parseRoomName(roomName);
    let cx = cxy.x;
    let cy = cxy.y;
    let worldsize = Game.map.getWorldSize();
    let randIntx = getRandomInt(0, 10);
    let randInty = getRandomInt(0, 10);

    let targetx = cx + randIntx;
    let targety = cy + randInty;

    if (targetx > worldsize) {
        targetx = worldsize
    }
    if (targetx < 0) {
        targetx = 0
    }

    if (targety > worldsize) {
        targety = worldsize
    }
    if (targety < 0) {
        targety = 0
    }

    return generateRoomName(targetx, targety)
}

global.generateAllRoomnamesWithinDistance = function (roomName, dist) {
    let cxy = parseRoomName(roomName);
    let cx = cxy.x;
    let cy = cxy.y;

    let rns = [];

    for (let i = -dist; i <= dist; i++) {
        for (let j = -dist; j <= dist; j++) {
            let rn = generateRoomName(cx + i, cy + j);
            if (rn && Game.map.getRoomStatus(rn) && Game.map.getRoomStatus(rn).status && Game.map.getRoomStatus(rn).status=='normal') {
                rns.push(rn);
            }
        }
    }

    return rns
}

global.generateRoomnameWithinDistrict = function (roomName) {
    let cxy = parseRoomName(roomName);
    let x = cxy.x;
    let y = cxy.y;
    let cx = Math.floor((x - 21) / 10) * 10 + 21;
    let cy = Math.floor((y - 21) / 10) * 10 + 21;
    let worldsize = Game.map.getWorldSize();
    let randIntx = getRandomInt(0, 10);
    let randInty = getRandomInt(0, 10);

    let targetx = cx + randIntx;
    let targety = cy + randInty;

    if (targetx > worldsize) {
        targetx = worldsize
    }
    if (targetx < 0) {
        targetx = 0
    }

    if (targety > worldsize) {
        targety = worldsize
    }
    if (targety < 0) {
        targety = 0
    }

    return generateRoomName(targetx, targety)
}

global.spawnScouterAround = function (roomName) {
    let room = Game.rooms[roomName];
    if (room.energyAvailable > 1500) { // if room has spare energy
        let target = generateRoomnameWithDistance(roomName)
        room.memory.forSpawning.spawningQueue.push({ memory: { role: 'wanderer', target: target }, priority: 0.01 });
        console.log(roomName + ' scouting to ' + target);
    }
}

// for intershade transfer and get creep memory
global.unpackCreepMemory = function (creepName) {
    /*[creepRole,n1,n2,n3,n4,n5,n6,n7,n8,n9,n10,n11,n12,n13] = creepName.split('_');
    if (creepRole == 'twoWayInterSharder') { // check if in correct destination shard
        homeShardName = n1;
        homeRoomName = n2;
        homeSourceToCarry = n3;
        toTargetPortalRoomName = n4;
        toTargetPortalX = n5;
        toTargetPortalY = n6;
        targetShardName = n7;
        targetRoomName = n8;
        targetSourceToCarry = n9;
        toHomePortalRoomName = n10;
        toHomePortalX = n11;
        toHomePortalY = n12;

        Game.creeps[creepName].memory.role = 'twoWayInterSharder';

        Game.creeps[creepName].memory.homeShard = homeShardName;
        Game.creeps[creepName].memory.home = homeRoomName;
        Game.creeps[creepName].memory.homeSourceToCarry = homeSourceToCarry;
        Game.creeps[creepName].memory.toTargetPortalRoomName = toTargetPortalRoomName;
        Game.creeps[creepName].memory.toTargetPortalX = toTargetPortalX;
        Game.creeps[creepName].memory.toTargetPortalY = toTargetPortalY;

        Game.creeps[creepName].memory.targetShard = targetShardName;
        Game.creeps[creepName].memory.target = targetRoomName;
        Game.creeps[creepName].memory.targetSourceToCarry = targetSourceToCarry;
        Game.creeps[creepName].memory.toHomePortalRoomName = toHomePortalRoomName;
        Game.creeps[creepName].memory.toHomePortalX = toHomePortalX;
        Game.creeps[creepName].memory.toHomePortalY = toHomePortalY;

    }
    else if (creepRole == 'oneWayInterSharder') {*/
    [targetShardName, targetRoomName, roleWillBe, randomString, route] = creepName.split('_');
    if (targetShardName == Game.shard.name) { // check if in correct destination shard
        Game.creeps[creepName].memory.role = roleWillBe;
        Game.creeps[creepName].memory.target = targetRoomName;
        Game.creeps[creepName].memory.working = false;
        //Game.creeps[creepName].memory.route = JSON.parse(route);
    }
    else if (false) { // in the wrong shard, an error transfer
        console.log('intersharder ' + Game.creeps[creepName].name + ' in wrong shard: ' + Game.shard.name + Game.creeps[creepName].pos)
        let sp = Game.creeps[creepName].pos.findInRange(FIND_MY_STRUCTURES, 1, { filter: s => s.structureType == STRUCTURE_SPAWN });
        if (sp.length > 0) {
            fo('recycling this no memory creep');
            sp[0].recycleCreep(Game.creeps[creepName]);
        }
        else {
            fo('this creep is really lost');
        }
    }
    /*}
    else { // in the wrong shard, an error transfer
        console.log('intersharder ' + Game.creeps[creepName].name + ' memory re-initialization failed. In shard: ' + Game.shard.name + '. '+ Game.creeps[creepName].pos)
    }*/
}

global.manageShooterRoom = function (room) {
    let motherRoomName = room.memory.startMB;
    if (motherRoomName) {
        let renewSpawnId = room.memory.forSpawning.renewSpawnId;
        if (renewSpawnId) {
            let shootersPath = room.memory.shootersPath;
            if (shootersPath) {
                let shooterLabId = room.memory.shooterLabId;
                if (shooterLabId) {
                    //console.log('1')
                    managerShootersWankersNumber(room);
                    //console.log('2')
                    renewShooters(renewSpawnId);
                    //console.log('3')
                    boostShooters(shooterLabId);
                }
                else {
                    console.log('defined shooter lab id for shooter room: ' + room.name);
                    let shooterLabPos = cacheShootersLabId(room.storage.pos);
                    let shooterLabs = room.lookForAt(LOOK_STRUCTURES, shooterLabPos.x, shooterLabPos.y);
                    if (shooterLabs.length > 0 && shooterLabs[0].structureType == STRUCTURE_LAB) {
                        room.memory.shooterLabId = shooterLabs[0].id;
                    }
                }
            }
            else {
                room.memory.shootersPath = cacheShootersMovingPath(room.storage.pos);
            }
        }
        else {
            console.log('defined renew spawn id for shooter room: ' + room.name);
        }
    }
    else {
        console.log('defined mother room name for shooter room: ' + room.name);
    }
}

global.cacheShootersMovingPath = function (centrePos) {
    let x = centrePos.x;
    let y = centrePos.y;
    return [{ 'x': x - 1, 'y': y - 1 }, { 'x': x - 1, 'y': y }, { 'x': x - 1, 'y': y + 1 }, { 'x': x, 'y': y + 1 }, { 'x': x + 1, 'y': y + 1 }, { 'x': x + 1, 'y': y }, { 'x': x, 'y': y - 1 }]
}

global.cacheShootersMovingDirections = function () {
    /*TOP: 1,
    TOP_RIGHT: 2,
    RIGHT: 3,
    BOTTOM_RIGHT: 4,
    BOTTOM: 5,
    BOTTOM_LEFT: 6,
    LEFT: 7,
    TOP_LEFT: 8,*/

    // counter-clockwise
    //return [5, 5, 3, 3, 1, 8, 7]

    // clockwise
    return [3, 1, 1, 7, 7, 5, 4]
}

global.getNextElementInArrayInCircle = function (ele, arr) {
    for (let ind in arr) {
        if (arr[ind].x == ele.x && arr[ind].y == ele.y) {
            let nextInd = (eval(ind) + 1) % arr.length;
            return arr[nextInd]
        }
    }
}

global.cacheShootersLabId = function (centrePos) {
    let x = centrePos.x;
    let y = centrePos.y;
    return { 'x': x, 'y': y - 2 }
}

global.renewShooters = function (renewSpawnId) {
    let renewSpawn = Game.getObjectById(renewSpawnId);

    let shooters = renewSpawn.room.find(FIND_MY_CREEPS, { filter: (s) => (s.memory.role == 'shooter') });
    let numOFShooters = shooters.length;
    let numOfShootersMax = renewSpawn.room.memory.forSpawning.roomCreepNo.minCreeps['shooter'];

    // help shootroom from mother room
    if ((renewSpawn.room.controller.level == 4) || (renewSpawn.room.controller.level == 5) && (renewSpawn.room.controller.progress < .85 * renewSpawn.room.controller.progressTotal)) {
        if ((Game.time + 34) % 266 < 40) {
            try {
                Game.getObjectById('5b9d7cb7702b8f4639c5ceed').createBegger(2200, 'E31S6', 'E31S4');
            }
            catch (err) {
                console.log('begger for shooter spawner full');
            }
        }
    }

    // if spawn is not spawning
    if (!renewSpawn.spawning) {
        // look for a creep at a spot
        let shooterCreeps = renewSpawn.room.lookForAt(LOOK_CREEPS, renewSpawn.pos.x - 1, renewSpawn.pos.y);
        if (!shooterCreeps.length > 0) {
            let shooterCreeps = renewSpawn.room.lookForAt(LOOK_CREEPS, renewSpawn.pos.x - 1, renewSpawn.pos.y + 1);
        }
        if (shooterCreeps.length > 0) {
            let shooterCreep = shooterCreeps[0];
            let roomMaxECap = shooterCreep.room.memory.ECap;
            // if creep life < ceil(1500/7) (time it takes to move a circle) or creep is unboosted, renew
            if (
                //(shooterCreep.memory.eCost && (Math.abs(shooterCreep.memory.eCost - roomMaxECap) < 100) || shooterCreep.memory.eCost == 4850) &&
                (shooterCreep.ticksToLive < shooterCreep.getActiveBodyparts(WORK) / 4 || !checkIfCreepIsBoosted(shooterCreep))) {
                if (numOFShooters <= numOfShootersMax) {
                    renewSpawn.renewCreep(shooterCreep);
                }
                else {
                    let minTTL = 1500;
                    let toGiveupId;
                    for (let shooter of shooters) {
                        if (minTTL > shooter.ticksToLive) {
                            minTTL = shooter.ticksToLive;
                            toGiveupId = shooter.id;
                        }
                    }
                    if (shooterCreep.id != toGiveupId) {
                        renewSpawn.renewCreep(shooterCreep);
                    }
                }
            }
        }
    }
}

global.boostShooters = function (shooterLabId) {
    let boostLab = Game.getObjectById(shooterLabId);
    // look for a creep at a spot

    // if room lvl 8 and prepare to restart
    if (boostLab.room.controller.level == 8) {
        // no. of boosted shooters
        let noOfBoostedShooters = boostLab.room.find(FIND_MY_CREEPS, { filter: (s) => (s.memory.role == 'shooter' && checkIfCreepIsBoosted(s)) }).length;
        let noOfShooters = boostLab.room.find(FIND_MY_CREEPS, { filter: (s) => (s.memory.role == 'shooter') }).length;

        if (noOfShooters == 7) {
            // creep to look at
            let shooterCreeps = boostLab.room.lookForAt(LOOK_CREEPS, boostLab.pos.x, boostLab.pos.y + 1);
            if (shooterCreeps.length > 0) {
                let shooterCreep = shooterCreeps[0];
                if (shooterCreep.memory.role == 'shooter') {
                    //if (shooterCreep.ticksToLive > 1450) {
                    boostLab.boostCreep(shooterCreep);
                    //}
                }
            }
        }
    }

    /*// unboost
    if (shooterCreeps.length > 0) {
        let shooterCreep = shooterCreeps[0];
        if (shooterCreep.memory.role == 'shooter') {
            if (shooterCreep.ticksToLive < Math.ceil((shooterCreep.getActiveBodyparts(WORK) - 7) / 4 + 1) * 7 + 1) {
                boostLab.unboostCreep(shooterCreep);
            }
        }
    }*/
}

global.managerShootersWankersNumber = function (room) {
    let terminal = room.terminal;
    let storage = room.storage;

    if (room.controller.level < 8) {
        if (terminal && storage && room.memory.shooterLabId) {
            //room.memory.startToShoot = true;
            room.memory.forSpawning.roomCreepNo.minCreeps['wanker'] = 1;
            room.memory.forSpawning.roomCreepNo.minCreeps['wallRepairer'] = 1;
            let OptimumNumShooters = Math.floor(storage.store.energy / 130000);
            if (terminal.isActive()) {
                OptimumNumShooters = Math.min(7, Math.floor((storage.store.energy + terminal.store.energy) / 130000));
            }
            room.memory.forSpawning.roomCreepNo.creepEnergy['wanker'] = Math.max(OptimumNumShooters * 50, terminal.store.energy / 250000 * 16 * 50);
            if (room.controller.level == 5) {
                let OptimumNumShooters = Math.floor(storage.store.energy / 100000);
                if (room.controller.progress / room.controller.progressTotal > 0.98) {
                    room.memory.forSpawning.roomCreepNo.creepEnergy['wanker'] = 800;
                }
            }
            room.memory.forSpawning.roomCreepNo.minCreeps['shooter'] = OptimumNumShooters;
        }
    }
    else { // room is lvlv 8
        room.memory.forSpawning.roomCreepNo.minCreeps['wanker'] = 1;
        let OptimumNumShooters = Math.floor(storage.store.energy / 130000);
        room.memory.forSpawning.roomCreepNo.creepEnergy['wanker'] = Math.max(OptimumNumShooters * 50, terminal.store.energy / 250000 * 16 * 50);
        room.memory.forSpawning.roomCreepNo.minCreeps['shooter'] = 1;
        if (_.sum(storage.store) > 990000 && _.sum(terminal.store) > 290000) {
            room.memory['prepareToReClaim'] = true;
            room.memory.forSpawning.roomCreepNo.minCreeps['shooter'] = 7;

            let roomMem = room.memory.forSpawning.roomCreepNo
            roomMem.minCreeps['harvester'] = 0;
            roomMem.minCreeps['miner'] = 0;
            roomMem.minCreeps['lorry'] = 1;
            roomMem.minCreeps['pickuper'] = 1;
            roomMem.minCreeps['builder'] = 0;
            roomMem.minCreeps['upgrader'] = 0;
            roomMem.minCreeps['linkKeeper'] = 0;
            roomMem.minCreeps['repairer'] = 0;
            roomMem.minCreeps['wallRepairer'] = 0;
            roomMem.minCreeps['longDistanceHarvester'] = 0;
            roomMem.minCreeps['longDistanceLorry'] = 0;
            roomMem.minCreeps['longDistanceBuilder'] = 0;
            roomMem.minCreeps['reserver'] = 0;
            roomMem.minCreeps['claimer'] = 0;
            roomMem.minCreeps['attacker'] = 0;
            roomMem.minCreeps['scouter'] = 0;
            roomMem.minCreeps['teezer'] = 0;
            roomMem.minCreeps['begger'] = 0;
            roomMem.minCreeps['labber'] = 0;
            roomMem.minCreeps['superUpgrader'] = 0;
            roomMem.minCreeps['ultimateUpgrader'] = 0;

            let noOfShooters = room.find(FIND_MY_CREEPS, { filter: (s) => (s.memory.role == 'shooter' && checkIfCreepIsBoosted(s)) }).length;
            if (noOfShooters && noOfShooters > 5) {
                let reClaimer = room.find(FIND_MY_CREEPS, { filter: (s) => (s.memory.role == 'claimer') });
                if (reClaimer.length > 0 && reClaimer[0].pos.getRangeTo(room.controller) < 2) {
                    console.log('WARNING! Reclaiming shooter room!');
                    room.controller.unclaim()
                    initiateCreepsSpawnInfo(room.name);
                    room.memory['prepareToReClaim'] = false;
                }
                else {
                    Game.getObjectById(room.memory.forSpawning.renewSpawnId).createCreep([CLAIM, MOVE], undefined, { role: 'claimer', target: room.name });
                }
            }
        }
    }
}

global.findCreepWithLowestTicksToLiveInCreeps = function (creeps) {

}

global.levelEightHelpSevenSuperUp = function (rn8, rn7, inter, rem) {
    if (Game.time % inter == rem && (Game.rooms[rn7].memory.forSpawning.roomCreepNo.minCreeps.superUpgrader > 0) && Game.rooms[rn7].controller.level < 8) {
        fo(rn8 + ' send superupgrader to ' + rn7);
        Game.rooms[rn8].memory.forSpawning.spawningQueue.push({ memory: { energy: 3200, role: 'pioneer', target: rn7, home: rn8, superUpgrader: true }, priority: 40 });
    }
    //Game.rooms['E5S21'].memory.forSpawning.spawningQueue.push({memory:{energy: 3200, role: 'pioneer', target: 'E4S23', home: 'E5S21', superUpgrader: true},priority: 40});
}

global.intershardsacrificer = function (mainshardn, rn, tn) {
    if (Game.shard.name == mainshardn) {
        //Game.rooms[rn].memory.forSpawning.spawningQueue.push({memory:{targetShardName: 'shard2', portalRoomName: 'E10S50', portalId: '5c0e406c504e0a34e3d61d5a', targetRoomName: tn, roleWillBe: 'sacrificer', body: body, route: { 'E10S50': 'E10S53', 'E10S53': 'E13S54', 'E13S54': 'E13S53'}, role: 'oneWayInterSharder'},priority: 1.5});
        if (rn=='E11S47') {
            Game.rooms[rn].memory.forSpawning.spawningQueue.push({memory:{targetShardName: 'shard2', portalRoomName: 'E0S40', portalId: '5c0e406c504e0a34e3d61dba', targetRoomName: tn, roleWillBe: 'sacrificer', body: undefined, route: { 'E10S50': 'E10S53', 'E10S53': 'E13S54', 'E13S54': 'E13S53'}, role: 'oneWayInterSharder'},priority: 1.5});
        }
        else if (rn=='E29S51') {
            Game.rooms[rn].memory.forSpawning.spawningQueue.push({memory:{targetShardName: 'shard2', portalRoomName: 'E30S50', portalId: '5c0e406c504e0a34e3d61dd8', targetRoomName: tn, roleWillBe: 'sacrificer', body: undefined, route: { 'E10S50': 'E10S53', 'E10S53': 'E13S54', 'E13S54': 'E13S53'}, role: 'oneWayInterSharder'},priority: 1.5});
        }
        else {
            fo('no portal info');
        }
    }
}

global.getATypeOfRes = function (r, res) {
    let tm = r.terminal;
    let st = r.storage;
    if (tm) {
        if (tm.store[res]>1000) {
            return tm
        }
        else {
            if (st && st.store[res]>1000) {
                return st
            }
            else {
                if (tm.store[res]>0) {
                    return tm
                }
                else {
                    if (st && st.store[res]>0) {
                        return st
                    }
                    else {
                        return false    
                    }
                }
            }
        }
    }
    else {
        if (st && st.store[res]>0) {
            return st
        }
        else {
            return false
        }
    }
}

global.putATypeOfRes = function (r, res) {
    let tm = r.terminal;
    let st = r.storage;
    if (tm) {
        if (tm.store.getFreeCapacity(res)>0) {
            return tm
        }
        else {
            if (st && st.store.getFreeCapacity(res)>0) {
                return st
            }
        }
    }
    else {
        if (st && st.store.getFreeCapacity(res)>0) {
            return st
        }
        else {
            return false
        }
    }
}

global.superUpgraderBoostManager = function (r, noparts) {
    // if room no lab
    if (r.controller.level<6) {
        return true
    }
    
    let labs = r.find(FIND_MY_STRUCTURES, {filter: l=>l.structureType==STRUCTURE_LAB});
    if (labs.length==0) {
        return true
    }
    
    let hasFreeLab = false;
    for (lab of labs) {
        if (lab.cooldown<=noparts*3) {
            hasFreeLab = true;
            break
        }
    }
    if (hasFreeLab == false) {
        return true
    }
    
    /*
    if (r.memory.mineralThresholds.currentMineralStats['XGH2O']>0) {
        return 'XGH2O'
    }
    */
    if (r.memory.mineralThresholds.currentMineralStats['GH2O']>0) {
        return 'GH2O'
    }
    if (r.memory.mineralThresholds.currentMineralStats['GH']>0) {
        return 'GH'
    }
    return true
}

global.pioneerBoostManager = function (r, noparts) {
    // if room no lab
    if (r.controller.level<6) {
        return true
    }
    
    let labs = r.find(FIND_MY_STRUCTURES, {filter: l=>l.structureType==STRUCTURE_LAB});
    if (labs.length==0) {
        return true
    }
    
    let hasFreeLab = false;
    for (lab of labs) {
        if (lab.cooldown<=noparts*3) {
            hasFreeLab = true;
            break
        }
    }
    if (hasFreeLab == false) {
        return true
    }

    if (r.memory.mineralThresholds.currentMineralStats['XLH2O']>0) {
        return 'XLH2O'
    }
    if (r.memory.mineralThresholds.currentMineralStats['LH2O']>0) {
        return 'LH2O'
    }
    if (r.memory.mineralThresholds.currentMineralStats['LH']>0) {
        return 'LH'
    }
    return true
}
