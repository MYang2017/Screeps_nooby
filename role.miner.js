var actionRunAway = require('action.flee');
let dog = require('action.idle');
let addToSq = require('action.addToSQ');

module.exports = {
    run: function (creep) {
        const avoidRadius = 4;
        
        if (creep.memory.home == undefined) {
            creep.memory.home = creep.room.name;
        }
        
        if (creep.memory.target == undefined) {
            creep.memory.target = creep.memory.home;
        }
        
        if (!(isSk(creep.memory.target)) && !(creep.room.controller&&creep.room.controller.my) && (creep.memory.attackedAtTime && creep.memory.attackedAtTime + 200 > Game.time) ) {
            creep.travelTo(new RoomPosition(25, 25, creep.memory.home), { range: 20 });
            actionRunAway.run(creep);
        }
        else if ((creep.memory.target == undefined) && (creep.pos.findInRange(FIND_HOSTILE_CREEPS, 4, { filter: c => (!allyList().includes(c.owner.username) && c.getActiveBodyparts(ATTACK) + c.getActiveBodyparts(RANGED_ATTACK) > 0) }).length > 0) && creep.room.controller.safeMode == undefined && creep.pos.findInRange(FIND_MY_STRUCTURES, 0, {filter:t=>t.structureType==STRUCTURE_RAMPART}).length==0) {
            actionRunAway.run(creep);
        }
        else {
            //let lvl = creep.room.controller.level;
            if (creep.memory.storedTarget == undefined) {
                creep.memory.storedTarget = {};
            }

            if (creep.ticksToLive < 2) creep.drop(RESOURCE_ENERGY);

            if (!creep.room.terminal || Game.cpu.bucket > 1000 || creep.room.name=='E29S51' || creep.room.name=='W2S58') {

                if (creep.getActiveBodyparts(MOVE) == 0) {
                    // early WORK only miner or damaged miner
                    let source = Game.getObjectById(creep.memory.sourceID);
                    // get working position
                    if (creep.memory.workingPos == undefined || Object.keys(creep.memory.workingPos).length === 0) { // if working position is not found yet, find working position
                        creep.memory.workingPos = {};
                        let ezpos = Memory.mapInfo[creep.room.name].eRes[source.id].easyContainerPosi
                        if (ezpos == undefined) {
                            logGrandeRoomInfo(creep.room, true);
                            ezpos = Memory.mapInfo[creep.room.name].eRes[source.id].easyContainerPosi
                        }
                        creep.memory.workingPos.x = ezpos.x;
                        creep.memory.workingPos.y = ezpos.y;
                    }
                    else { // if working position get
                        let onTaskId = creep.memory.moveTaskId;
                        if (onTaskId !== undefined) { // there is stored taskId
                            if (creep.room.memory.taskMove == undefined || creep.room.memory.taskMove.contracts == undefined) { // no contract structure
                                creep.memory.moveTaskId = undefined; // remove stored id
                                return
                            }
                            let contract = creep.room.memory.taskMove.contracts[onTaskId];
                            if (contract) { // task still there, do task
                                let offerName = contract.offerName;
                                let offerCreep = Game.creeps[offerName];
                                if (offerCreep) { // if asker still alive
                                    if (creep.room.memory.taskMove.contracts == undefined) {
                                        creep.memory.moveTaskId == undefined;
                                        return
                                    }
                                    // if position occupied by another creep, find another spot
                                    let found = creep.room.lookForAt(LOOK_CREEPS, creep.memory.workingPos.x, creep.memory.workingPos.y);
                                    let miningPosis = returnALLAvailableNoStructureLandCoords(creep.room, Game.getObjectById(creep.memory.sourceID).pos);
                                    if (found.length > 0 && found[0].memory.role == 'miner' && found[0].name !== creep.name) {
                                        for (let miningPosInd in miningPosis) {
                                            let miningPos = miningPosis[miningPosInd];
                                            let s = creep.room.lookForAt(LOOK_STRUCTURES, creep.memory.workingPos.x, creep.memory.workingPos.y, { filter: c => c.structureType != STRUCTURE_CONTAINER }).length + creep.room.lookForAt(LOOK_CONSTRUCTION_SITES, creep.memory.workingPos.x, creep.memory.workingPos.y).length;
                                            if (s > 0) {
                                                continue;
                                            }
                                            if ((miningPos.x == found[0].pos.x) && (miningPos.y == found[0].pos.y)) {
                                                // pass
                                            }
                                            else {
                                                creep.memory.workingPos.x = miningPos.x;
                                                creep.memory.workingPos.y = miningPos.y;
                                                creep.room.memory.taskMove.contracts[onTaskId].posi = miningPos;
                                                return
                                            }
                                        }
                                    }
                                    else if (found.length > 0 && found[0] && (found[0].memory.role !== 'miner' && found[0].memory.role !== 'mover')) {
                                        dog.run(found[0]);
                                    }

                                    if ((creep.pos.x == creep.memory.workingPos.x) && (creep.pos.y == creep.memory.workingPos.y)) { // if at working position, mine, remove task
                                        // at position remove task
                                        creep.memory.moveTaskId == undefined;
                                        delete creep.room.memory.taskMove.contracts[onTaskId];
                                        // do usual jobs
                                        creep.harvest(source); // harvest
                                        if ((creep.memory.containerID) && (creep.carry.energy > 0)) {
                                            let container = Game.getObjectById(creep.memory.containerID);
                                            if ((container.hits < 0.85 * container.hitsMax) || source.energy == 0) {
                                                creep.repair(container);
                                            }
                                        }
                                        else {
                                            let containerSite = source.pos.findInRange(FIND_CONSTRUCTION_SITES, 3)[0];
                                            if ((containerSite) && (Game.time % 4 == 0)) {
                                                creep.build(containerSite);
                                            }
                                        }
                                    }
                                    else { // not at target position follow
                                        creep.move(offerCreep);
                                    }
                                }
                                else { // offer creep dead, remove task
                                    creep.memory.moveTaskId = undefined;
                                    delete creep.room.memory.taskMove.contracts[onTaskId];
                                }
                            }
                            else { // contracts not there, clear own task
                                creep.memory.moveTaskId = undefined;
                            }
                        }
                        else { // no registered task
                            if ((creep.pos.x == creep.memory.workingPos.x) && (creep.pos.y == creep.memory.workingPos.y)) { // if at working position, do job
                                creep.harvest(source); // harvest
                                if (creep.getActiveBodyparts(CARRY) > 0) {
                                    // register extensions around
                                    if (creep.memory.toFillIds == undefined || Game.time % 5019 == 0) { // check if anything build of destroyed
                                        let toFillIds = []
                                        let lands = returnALLAvailableLandCoords(creep.room, creep.pos);
                                        for (let land of lands) {
                                            let lound = creep.room.lookForAt(LOOK_STRUCTURES, land.x, land.y);
                                            if (lound.length > 0 && lound[0].structureType == STRUCTURE_EXTENSION) {
                                                toFillIds.push(lound[0].id);
                                            }
                                        }
                                        creep.memory.toFillIds = toFillIds;
                                    }
                                    // fill extensions
                                    for (let toFillId of creep.memory.toFillIds) {
                                        let exten = Game.getObjectById(toFillId);
                                        if (exten && (exten.store.getUsedCapacity('energy') < exten.store.getCapacity('energy'))) {
                                            if (creep.store.energy > 0) {
                                                creep.transfer(exten, 'energy');
                                                return
                                            }
                                            else {
                                                let container = Game.getObjectById(creep.memory.containerID);
                                                if (container.store !== null && container.store.energy > 0) {
                                                    creep.withdraw(Game.getObjectById(creep.memory.containerID), 'energy');
                                                    return
                                                }
                                            }
                                        }
                                    }

                                    if ((creep.memory.containerID) && (creep.carry.energy > 0)) {
                                        let container = Game.getObjectById(creep.memory.containerID);
                                        if (source.energy == 0 || (container.hits < 0.85 * container.hitsMax)) {
                                            creep.repair(container);
                                        }
                                    }
                                    else if (creep.memory.containerID == undefined) {
                                        let mineCtns = source.pos.findInRange(FIND_STRUCTURES, 1);
                                        for (let ctn of mineCtns) {
                                            if (ctn.structureType == STRUCTURE_CONTAINER) {
                                                creep.memory.containerID = ctn.id;
                                            }
                                        }
                                    }


                                    let containerSite = source.pos.findInRange(FIND_CONSTRUCTION_SITES, 1)[0];
                                    if ((containerSite) && (Game.time % 4 == 0)) {
                                        creep.build(containerSite);
                                    }
                                }
                            }
                            else { // publish task
                                let asksList = creep.room.memory.taskMove.asks;
                                if (asksList.length == 0) { // no task, add me
                                    creep.room.memory.taskMove.asks.push({ posi: { x: creep.memory.workingPos.x, y: creep.memory.workingPos.y }, askerName: creep.name });
                                    return
                                }
                                else { // there is task, check if I have it
                                    for (let askI of asksList) {
                                        if ((askI.posi.x == creep.memory.workingPos.x) && (askI.posi.y == creep.memory.workingPos.y) && (askI.askerName == creep.name)) {
                                            return
                                        }
                                    }
                                }
                                creep.room.memory.taskMove.asks.push({ posi: { x: creep.memory.workingPos.x, y: creep.memory.workingPos.y }, askerName: creep.name });
                            }
                        }
                    }
                }
                else { // normal miner
                    if (creep.hits < 0.818 * creep.hitsMax && creep.room.name != creep.memory.home) { // go back home to heal when injured
                        creep.moveTo(new RoomPosition(25, 25, creep.memory.home));
                        return
                    }
                    else {
                        let keeperLair = creep.pos.findInRange(FIND_STRUCTURES, avoidRadius, { filter: c => c.structureType == STRUCTURE_KEEPER_LAIR && c.ticksToSpawn < 3 });
                        //if ((Game.rooms[creep.memory.target]==undefined)||(Game.rooms[creep.memory.target].memory.ifPeace == false)) { // room under attack, run away
                        if (
                            ((creep.pos.findInRange(FIND_HOSTILE_CREEPS, avoidRadius, { filter: f => !allyList().includes(f.owner.username) && (f.getActiveBodyparts(ATTACK) + f.getActiveBodyparts(RANGED_ATTACK) > 0) }).length > 0) ||
                            (creep.memory.target !== undefined && (keeperLair && (keeperLair.length > 0)))) &&
                            (creep.pos.findInRange(FIND_MY_STRUCTURES, 0, {filter:t=>t.structureType==STRUCTURE_RAMPART}).length==0)
                        ) { // self destroy if not useful damages by NPC
                            for (const resourceType in creep.carry) {
                                creep.drop(resourceType);
                            }
                            actionRunAway.run(creep);
                            return
                        }
                        else if (creep.memory.target == undefined || creep.room.name == creep.memory.target) {// if in target room or main room
                            // remote miners add back
                            if (creep.memory.tickTouched && (creep.memory.ifMineEnergy != undefined && creep.memory.ifMineEnergy)) {
                                addToSq.run(creep, (1500-creep.memory.tickTouched)+creep.memory.spawnTime)
                            }
                            if (true) { // creep.name == 'Aaron'
                                let source = Game.getObjectById(creep.memory.sourceID);
                                // get working position
                                if (creep.memory.workingPos == undefined || Object.keys(creep.memory.workingPos).length==0) { // if working position is not found yet, find working position
                                    creep.memory.workingPos = {};
                                    let containers = source.pos.findInRange(FIND_STRUCTURES, 1, { filter: s => s.structureType == STRUCTURE_CONTAINER });
                                    if (containers.length>0) { // if a container is found, working position = container position
                                        let container = undefined;
                                        let contdist = 5000;
                                        for (let conta of containers) { // find shortest eulidean dist container
                                            let nowcontdist = (source.pos.x-conta.pos.x)**2 + (source.pos.y-conta.pos.y)**2;
                                            if (nowcontdist<contdist) {
                                                container = conta;
                                                contdist = nowcontdist;
                                            }
                                        }
                                        creep.memory.workingPos.x = container.pos.x;
                                        creep.memory.workingPos.y = container.pos.y;
                                        creep.memory.containerID = container.id;
                                        if ((creep.memory.ifLink && creep.memory.linkID == undefined) || Game.time%50==0) { // if link mining
                                            // if link mining, calculate working position based on source and link
                                            let links = source.pos.findInRange(FIND_STRUCTURES, 2, { filter: s => s.structureType == STRUCTURE_LINK });
                                            if (links.length > 0) {
                                                let link = undefined;
                                                let linkdist = 5000;
                                                for (let linko of links) { // find shortest eulidean dist link
                                                    let nowlinkdist = (container.pos.x-linko.pos.x)**2 + (container.pos.y-linko.pos.y)**2;
                                                    if (nowlinkdist<linkdist) {
                                                        link = linko;
                                                        linkdist = nowlinkdist;
                                                    }
                                                }
                                                creep.memory.linkID = link.id;
                                            }
                                        }
                                        else {
                                            creep.memory.ifLink = false;
                                        }
                                        if (container&&((container.hits < 0.85 * container.hitsMax) || source.energy == 0)) {
                                            creep.repair(container);
                                        }
                                    }
                                    else { // drop mining, find an available tile round source
                                        let toStand = validSurrounds(source);
                                        creep.memory.workingPos.x = toStand[0];
                                        creep.memory.workingPos.y = toStand[1];
                                    }
                                    // only execute for 1 tick that working pos has just been decided
                                    creep.moveTo(creep.memory.workingPos.x, creep.memory.workingPos.y, {maxRooms: 1});
                                }
                                else { // if working position get
                                    // early miner check if we can go big
                                    let nows = creep.getActiveBodyparts(WORK).length;
                                    if (nows<6 && creep.room.energyCapacityAvailable>=nows*250+50 && creep.room.energyAvailable>0.8*creep.room.energyCapacityAvailable) {
                                        Game.rooms[creep.memory.home].memory.forSpawning.spawningQueue.push({ memory: { role: 'miner', sourceID: creep.memory.sourceID, target: undefined, currentRCL: creep.room.controller.level, ifMineEnergy: true, ifLink: false, ifKeeper: false, ifRescue: false, ifEarly: false}, priority: 20 });
                                    }
                                    if ((creep.pos.x == creep.memory.workingPos.x) && (creep.pos.y == creep.memory.workingPos.y)) { // if at working position, mine
                                        creep.memory.in = true;
                                        let container = Game.getObjectById(creep.memory.containerID);
                                        if (source.energy > 0 || (source.mineralAmount > 0 && Game.time % 6 == 3)) { //&&container.store.getFreeCapacity('energy')>0)) {
                                            if (container && container.store.getFreeCapacity('energy') == 0 && creep.store.getFreeCapacity('energy')==0) { // stop mining when full
                                                // upgrade
                                                if (creep.pos.getRangeTo(creep.room.controller) < 4) {
                                                    if ((creep.room.controller && creep.room.controller.level<8) || Game.time%50==0) {
                                                        if (creep.store.energy == 0) {
                                                            creep.withdraw(container, 'energy');
                                                        }
                                                        creep.upgradeController(creep.room.controller);
                                                    }
                                                }
                                                
                                                // fill extensions
                                                let extToFill;
                                                for (let toFillId of creep.memory.toFillIds) {
                                                    let exten = Game.getObjectById(toFillId);
                                                    if (exten && (exten.store.getUsedCapacity('energy') < exten.store.getCapacity('energy'))) {
                                                        extToFill = exten;
                                                        break;
                                                    }
                                                }
                                                if (extToFill) {
                                                    if (creep.store.energy > 0) {
                                                        creep.transfer(extToFill, 'energy');
                                                        return
                                                    }
                                                    else {
                                                        if (container && container.store.energy > 0) {
                                                            creep.withdraw(container, 'energy');
                                                            return
                                                        }
                                                    }
                                                }
                                                else { // extensions all full
                                                    if (creep.getActiveBodyparts(CARRY)>0 && creep.memory.toFillIds.length>0 && Game.rooms[creep.memory.home].memory.forSpawning.spawningQueue.length==0) {
                                                        Game.rooms[creep.memory.home].memory.spawnQueueTimer += 3;
                                                        Game.rooms[creep.memory.home].memory.forSpawning.spawningQueue.push({ memory: { role: 'recCtner', exts: creep.memory.toFillIds }, priority: 0.4 });
                                                    }
                                                }
                                                
                                                if (Game.time % 4 == 0 || creep.store.getFreeCapacity('energy') == 0) {
                                                    //let rpts = creep.pos.findInRange(FIND_MY_STRUCTURES, 3, {filter:c=>c.structureType==STRUCTURE_RAMPART && c.hits<c.hitsMax && c.hits<1000000*((6/56)*(lvl)**2+(1-90/56)*(lvl))});
                                                    let rpts = creep.pos.findInRange(FIND_MY_STRUCTURES, 3, {filter:c=>c.structureType==STRUCTURE_RAMPART && c.hits<c.hitsMax && c.hits<30000});
                                                    if (rpts.length>0) {
                                                        creep.repair(rpts[0]);
                                                    }
                                                    else {
                                                        // build
                                                        let containerSite = source.pos.findInRange(FIND_CONSTRUCTION_SITES, 3)[0];
                                                        if ((containerSite) && (Game.time % 4 == 0)) {
                                                            creep.build(containerSite);
                                                        }
                                                    }
                                                }
                                                
                                                // if link, transfer to link
                                                if (creep.memory.linkID) {// if a link is nearby (link is stored), transfer energy
                                                    creep.transfer(Game.getObjectById(creep.memory.linkID), RESOURCE_ENERGY);
                                                }
                                                
                                                // update spare timer
                                                if (creep.memory.spareTime == undefined) {
                                                    creep.memory.spareTime = 1;
                                                }
                                                else {
                                                    // check if timer too large, ask for lorry
                                                    if (creep.memory.spareTime > 250) {
                                                        if (creep.room.controller && creep.room.controller.my && Game.cpu.bucket>5000) {
                                                            /*if (creep.room.controller.level>3 && creep.room.controller.level<8) {
                                                                Game.rooms[creep.memory.home].memory.forSpawning.spawningQueue.push({ memory: { role: 'lorry', energy: Game.rooms[creep.memory.home].memory.ECap, home: creep.memory.home, target: creep.memory.target }, priority: 4.4 });
                                                            }
                                                            else*/ if (creep.room.controller.level<4) {
                                                                Game.rooms[creep.memory.home].memory.forSpawning.spawningQueue.push({ memory: { energy: creep.room.energyCapacityAvailable, role: 'upgrader', target: creep.room.name, RCL: creep.room.controller.level, energyMax: creep.room.energyCapacityAvailable }, priority: 1 });
                                                            }
                                                            creep.memory.spareTime = 0;
                                                            return
                                                        }
                                                        else {
                                                            Game.rooms[creep.memory.home].memory.forSpawning.spawningQueue.push({ memory: { role: 'longDistanceLorry', energy: Math.min(800, Game.rooms[creep.memory.home].memory.ECap), home: creep.memory.home, target: creep.memory.target }, priority: 4.4 });
                                                            creep.memory.spareTime = 0;
                                                            return
                                                        }
                                                    }
                                                    creep.memory.spareTime += 1;
                                                    if (creep.room.controller && !creep.room.controller.my) {
                                                        if (source && source.energy && (source.energy>400) && (source.energy/source.energyCapacity>source.ticksToRegeneration/300)) {
                                                            creep.memory.spareTime += 1;
                                                        }
                                                    }
                                                }
                                                return
                                            }
                                            else {
                                                //if (creep.store.getFreeCapacity('energy')>=creep.getActiveBodyparts(WORK)*2 || creep.getActiveBodyparts(CARRY)==0) {
                                                if (creep.harvest(source)==OK) { // harvest
                                                    if (creep.memory.tickTouched == undefined) {
                                                        creep.memory.tickTouched = creep.ticksToLive;
                                                    }
                                                }
                                                //}
                                                // upgrade
                                                if ((creep.room.controller && creep.room.controller.level<8) || Game.time%50==0) {
                                                    if (creep.pos.getRangeTo(creep.room.controller) < 4 && creep.store.energy > 0) {
                                                        creep.upgradeController(creep.room.controller);
                                                    }
                                                }
                                            }
                                        }
                                        else {
                                            if (source.mineralAmount == 0) { // no mineral, recycle
                                                creep.memory.target = creep.memory.home;
                                                creep.memory.role = 'ranger';
                                            }
                                            if (source.energy == 0) {
                                                return
                                            }
                                        }

                                        // register extensions around
                                        if (creep.memory.toFillIds == undefined || Game.time % 5019 == 0) { // check if anything build of destroyed
                                            let toFillIds = []
                                            let lands = returnALLAvailableLandCoords(creep.room, creep.pos);
                                            for (let land of lands) {
                                                let lound = creep.room.lookForAt(LOOK_STRUCTURES, land.x, land.y);
                                                if (lound.length > 0 && lound[0].structureType == STRUCTURE_EXTENSION) {
                                                    toFillIds.push(lound[0].id);
                                                }
                                            }
                                            creep.memory.toFillIds = toFillIds;
                                        }

                                        // fill extensions
                                        let extToFill;
                                        for (let toFillId of creep.memory.toFillIds) {
                                            let exten = Game.getObjectById(toFillId);
                                            if (exten && (exten.store.getUsedCapacity('energy') < exten.store.getCapacity('energy'))) {
                                                extToFill = exten;
                                                break;
                                            }
                                        }
                                        
                                        let containerSite = source.pos.findInRange(FIND_CONSTRUCTION_SITES, 3)[0];
                                        if (extToFill) {
                                            if (creep.store.energy > 0) {
                                                creep.transfer(extToFill, 'energy');
                                                return
                                            }
                                            else {
                                                if (container && container.store.energy > 0) {
                                                    creep.withdraw(container, 'energy');
                                                    return
                                                }
                                            }
                                        }
                                        else if (containerSite==undefined && creep.memory.linkID==undefined) {
                                            if (creep.getActiveBodyparts(CARRY)>0) {
                                                if (creep.room.controller && creep.room.controller.my && creep.room.controller.level<4) {
                                                    if (source.energy > creep.memory.toFillIds.length*75) {
                                                        if (Game.rooms[creep.memory.home].memory.forSpawning.spawningQueue.length==0) {
                                                            Game.rooms[creep.memory.home].memory.forSpawning.spawningQueue.push({ memory: { role: 'recCtner', exts: creep.memory.toFillIds }, priority: 0.4 });
                                                        }
                                                        else if (Game.time%10<3 && Game.rooms[creep.memory.home].memory.newBunker.layout && Game.rooms[creep.memory.home].memory.newBunker.layout.coreSp && Game.rooms[creep.memory.home].memory.newBunker.layout.coreSp.length>0) {
                                                            let spid = Game.rooms[creep.memory.home].memory.newBunker.layout.coreSp[0].id;
                                                            let sp = Game.getObjectById(spid);
                                                            if (sp && sp.spawning===null) {
                                                                Game.rooms[creep.memory.home].memory.forSpawning.spawningQueue.push({ memory: { role: 'recCtner', exts: creep.memory.toFillIds }, priority: 20 });
                                                            }
                                                        }
                                                    } 
                                                }
                                                else {
                                                    if (Game.rooms[creep.memory.home].memory.spawnQueueTimer<4 && creep.memory.toFillIds.length>0 && source.energy > creep.memory.toFillIds.length*75 && Game.rooms[creep.memory.home].memory.forSpawning.spawningQueue.length==0) {
                                                        if (creep.memory.holdoffTimer == undefined) {
                                                            creep.memory.holdoffTimer = 0;
                                                        }
                                                        if (creep.memory.holdoffTimer>7) {
                                                            Game.rooms[creep.memory.home].memory.spawnQueueTimer += 3;
                                                            Game.rooms[creep.memory.home].memory.forSpawning.spawningQueue.push({ memory: { role: 'recCtner', exts: creep.memory.toFillIds }, priority: 0.4 });
                                                            creep.memory.holdoffTimer = 0;
                                                        }
                                                        else {
                                                            creep.memory.holdoffTimer += 1;
                                                        }
                                                    }
                                                }
                                            }
                                        }

                                        if ((creep.memory.containerID) && (Game.time % Math.max(1, Math.floor(creep.getActiveBodyparts(CARRY)*50/creep.getActiveBodyparts(WORK)/2)) == 0)) {
                                            let container = Game.getObjectById(creep.memory.containerID);
                                            if (container && (container.hits < 0.85 * container.hitsMax) || source.energy == 0) {
                                                creep.repair(container);
                                            }
                                            else {
                                                if (creep.memory.linkID) {// if a link is nearby (link is stored), transfer energy
                                                    creep.transfer(Game.getObjectById(creep.memory.linkID), RESOURCE_ENERGY);
                                                }
                                            }
                                        }
                                        
                                        if (Game.time % 4 == 0 || creep.store.getFreeCapacity('energy') == 0) {
                                            //(FIND_MY_STRUCTURES, 3, {filter:c=>c.structureType==STRUCTURE_RAMPART && c.hits<c.hitsMax && c.hits<1000000*((6/56)*(lvl)**2+(1-90/56)*(lvl))});
                                            let rpts = creep.pos.findInRange(FIND_MY_STRUCTURES, 3, {filter:c=>c.structureType==STRUCTURE_RAMPART && c.hits<c.hitsMax && c.hits<30000});
                                            if (rpts.length>0) {
                                                creep.repair(rpts[0]);
                                            }
                                            else {
                                                if (creep.memory.containerID == undefined) {
                                                    let containerSite = source.pos.findInRange(FIND_CONSTRUCTION_SITES, 3)[0];
                                                    if ((containerSite)) {
                                                        creep.build(containerSite);
                                                    }
                                                }
                                                
                                                // build
                                                if ((containerSite)) {
                                                    creep.build(containerSite);
                                                }
                                            }
                                        }
                                        
                                        // for remote miner call more lorries
                                        if (creep.room.controller && !creep.room.controller.my) {
                                            if (creep.memory.spareTime == undefined) {
                                                creep.memory.spareTime = 1;
                                            }
                                            else {
                                                // check if timer too large, ask for lorry
                                                if (Game.cpu.bucket>5000) {
                                                    if (creep.memory.spareTime > 250) {
                                                        Game.rooms[creep.memory.home].memory.forSpawning.spawningQueue.push({ memory: { role: 'longDistanceLorry', energy: Math.min(800, Game.rooms[creep.memory.home].memory.ECap), home: creep.memory.home, target: creep.memory.target }, priority: 4.4 });
                                                        creep.memory.spareTime = 0;
                                                        return
                                                    }
                                                    if (creep.memory.spareTime%49==0) {
                                                        //Game.rooms[creep.memory.home].memory.forSpawning.spawningQueue.push({ memory: { role: 'longDistanceLorry', energy: Math.min(600, Game.rooms[creep.memory.home].memory.ECap), home: creep.memory.home, target: creep.memory.target }, priority: 4.4 });
                                                    }
                                                }
                                                if (source && source.energy && (source.energy>400) && (source.energy/source.energyCapacity>source.ticksToRegeneration/300)) {
                                                    creep.memory.spareTime += 1;
                                                }
                                            }
                                        }
                                    }
                                    else {// go to working position
                                        if (creep.pos.getRangeTo(creep.memory.workingPos.x, creep.memory.workingPos.y)<3) {
                                            let annoyer = creep.room.lookForAt(LOOK_CREEPS, creep.memory.workingPos.x, creep.memory.workingPos.y);
                                            if (annoyer.length > 0 && annoyer[0].my && annoyer[0].memory.role != 'miner') {
                                                creep.moveTo(annoyer[0]);
                                                annoyer[0].moveTo(creep);
                                            }
                                            else if (annoyer.length > 0 && annoyer[0].my && annoyer[0].memory.role == 'miner' && annoyer[0].memory.sourceID == creep.memory.sourceID && annoyer[0].ticksToLive < creep.ticksToLive) { // duplicated
                                                annoyer[0].memory.role = 'ranger';
                                                annoyer[0].memory.target = creep.memory.home;
                                                annoyer[0].drop('energy');
                                            }
                                        }
                                        if (creep.memory.target) {
                                            creep.travelTo(new RoomPosition(creep.memory.workingPos.x, creep.memory.workingPos.y, creep.memory.target), { creepCost: 1, maxRooms: 1 });
                                        }
                                        else {
                                            creep.travelTo(new RoomPosition(creep.memory.workingPos.x, creep.memory.workingPos.y, creep.memory.home), { creepCost: 1, maxRooms: 1 });
                                        }
                                    }
                                }
                            }
                        }
                        else { // go to target room
                            if (creep.memory.target && Game.rooms[creep.memory.target] && creep.memory.sourceID && Game.getObjectById(creep.memory.sourceID)) {
                                creep.moveTo(Game.getObjectById(creep.memory.sourceID));
                            }
                            else {
                                let route = Game.map.findRoute(creep.room, creep.memory.target, {
                                    routeCallback(roomName, fromRoomName) {
                                        let parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
                                        let isHighway = (parsed[1] % 10 === 0) ||
                                            (parsed[2] % 10 === 0);
                                        let isMyRoom = Game.rooms[roomName] &&
                                            Game.rooms[roomName].controller &&
                                            Game.rooms[roomName].controller.my;
                                        if (isHighway) {
                                            return 2;
                                        }
                                        else if (isMyRoom) {
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
                                    if (route[0] && route[0].room) {
                                        creep.travelTo(creep.pos.findClosestByRange(creep.room.findExitTo(route[0].room)), {maxRooms: 1});
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        if (Game.time % 6 != 3 && creep.getActiveBodyparts(HEAL) > 0 && creep.hits < creep.hitsMax) {
            creep.heal(creep);
        }
    }
};

                    // calculate time travelling there for pre-spawn miners
/*var ticksThere = creep.ticksToLive;
if (creep.memory.target == undefined) {
  var targetRoomName = creep.room.name;
}
else {
  var targetRoomName = creep.memory.target;
}
if (Game.rooms[targetRoomName].memory.sourceTravelTime == undefined) {
  Game.rooms[targetRoomName].memory.sourceTravelTime = {};
}
else if (Game.rooms[targetRoomName].memory.sourceTravelTime[creep.memory.sourceID] == undefined) {
  Game.rooms[targetRoomName].memory.sourceTravelTime[creep.memory.sourceID] = ticksThere;
}
else {
  Game.rooms[targetRoomName].memory.sourceTravelTime[creep.memory.sourceID] = Math.min(Game.rooms[targetRoomName].memory.sourceTravelTime[creep.memory.sourceID],ticksThere)
}*/
