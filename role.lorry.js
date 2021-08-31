// lorry now only fill energy in room since v7
var actionAvoid = require('action.idle');
var noStoragePickuper = require('role.pickuper');
var getE = require('action.getEnergy');
var fillE = require('action.fillEnergy');
var evac = require('action.evacuate');
let dup = require('action.dupCheck');
let harv = require('role.harvester');
var fillReLab = require('action.fillReactionLabs');
let doge = require('action.flee');
let fillN = require('action.fillNuke');

module.exports = {
    run: function (creep) {
        //if ((creep.room.terminal == undefined)||(creep.room.find(FIND_MY_STRUCTURES, {filter:c=>c.structureType==STRUCTURE_LINK}).length==0)) {
        if (creep.memory.home==undefined) {
            creep.memory.home=creep.room.name;
        }
        if (evac.run(creep)) {
            return
        }
        else if (creep.room.name != creep.memory.home) {
            creep.travelTo(new RoomPosition(25, 25, creep.memory.home));
        }
        else {
            if (dup.run(creep, 2)) {
                return
            }
            
            if (Game.time%49==0) {
                if (creep.getActiveBodyparts(CARRY)<2) {
                    if (creep.room.energyAvailable>550) {
                        let sp = creep.room.find(FIND_MY_STRUCTURES, {filter: s=>s.structureType==STRUCTURE_SPAWN})[0];
                        let etouse = creep.room.energyAvailable;
                        let body = [];
                        for (let i = 0; i < Math.min(4, Math.floor(etouse/150)); i++) {
                            body.push(CARRY);
                            body.push(CARRY);
                            body.push(MOVE);
                        }
                        if (sp.spawnCreep(body, randomIdGenerator(), { memory: { role: 'lorry', working: false, target: creep.room.name, spawnTime: 3 * 2 }, directions: sp.getDefaultSpawningDir() })==OK) {
                            creep.memory.role='loader';
                        }
                    }
                }
            }
            
            if (creep.pos.findInRange(FIND_HOSTILE_CREEPS, 4, {filter:c=>!allyList().includes(c.owner.username)}).length>0) {
                doge.run(creep);
                return
            }
            let creepCarrying = _.sum(creep.store);
            if (creep.room.terminal == undefined) {
                if (creep.memory.working == undefined) {
                    creep.memory.working = false;
                }
                
                // recheck if we are rescue lorry
                if (creep.ticksToLive<=1113 && Game.time%57==0) {
                    if (creep.getActiveBodyparts(CARRY)<3) {
                        if (creep.room.find(FIND_MY_CREEPS, {filter:c=>c.memory.role=='miner'}).length>0) {
                            creep.memory.role='loader';
                        }
                    }
                }

                if (creep.memory.working == true && creepCarrying == 0) {
                    creep.memory.working = false;
                }
                else if (creep.memory.working == false && creepCarrying == creep.store.getCapacity()) {
                    creep.memory.working = true;
                }
                if (creep.memory.working) { // fill
                    if (false && creep.room.name == 'E7S48') {
                        let tof = creep.pos.findClosestByRange(FIND_MY_CREEPS, {filter:t=>t.memory.role=='builder' && t.store.getFreeCapacity('energy')>0});
                        if (tof) {
                            if (creep.pos.getRangeTo(tof)>1) {
                                creep.travelTo(tof, {maxRooms: 1});
                            }
                            else {
                                creep.transfer(tof, 'energy');
                            }
                            return
                        }
                    }
                    if (creep.store.energy == 0) { // carrying something else
                        if (creep.pos.getRangeTo(creep.room.storage)>1) {
                            creep.travelTo(creep.room.storage, {maxRooms: 1});
                        }
                        else {
                            for (let resType in creep.store) {
                                if (resType != 'energy') {
                                    creep.transfer(creep.room.storage, resType);
                                }
                            }
                        }
                    }
                    else {
                        fillE.run(creep);
                        return
                        //debug here
                        if (creep.room.energyAvailable<creep.room.energyCapacityAvailable || creep.room.find(FIND_STRUCTURES, {filter:s=>(s.structureType==STRUCTURE_TOWER || s.structureType==STRUCTURE_CONTAINER)&& s.pos.findInRange(FIND_MY_CREEPS, 1, {filter:c=>(c.memory.role=='dickHead'||c.memory.role=='linkKeeper'||c.memory.role=='dickHeadpp'||c.memory.role=='newDickHead'||c.memory.role=='maintainer'||c.memory.role=='balancer')&&c.getActiveBodyparts(CARRY)>0}).length==0}).legnth>0) {
                            fillE.run(creep);
                        }
                        else {
                            actionAvoid.run(creep);
                        }
                    }
                }
                else { // get
                    if (creep.getActiveBodyparts(WORK)>0) {
                        harv.run(creep);
                    }
                    let hasJobtd = false;

                    if (!hasJobtd) {
                        let c = creep.pos.findClosestByRange(FIND_STRUCTURES, { filter: s => (s.structureType == STRUCTURE_CONTAINER && s.pos.findInRange(FIND_SOURCES, 1).length>0) && ((s.store.energy>1000||s.store.energy>creep.store.getCapacity('energy'))||(s.store.energy>555 && s.pos.getRangeTo(creep)<4)) });
                        if (c) {
                            if (creep.pos.getRangeTo(c)>1) {
                                creep.travelTo(c, { maxRooms: 1 });
                            }
                            else {
                                creep.withdraw(c, 'energy');
                            }
                            return
                        }
                    }
                    if (!hasJobtd) {
                        if (creep.room.storage) {
                            let needfill = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                                    filter: (s) => (
                                        (((s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION) && (s.energy < s.energyCapacity)) ||
                                        ((s.structureType == STRUCTURE_TOWER) && (s.energy < s.energyCapacity * 0.8)) ||
                                        ((s.structureType == STRUCTURE_LAB) && (s.energy < s.energyCapacity * 0.9)) ||
                                        ((s.structureType == STRUCTURE_POWER_SPAWN) && (s.energy < s.energyCapacity * 0.618)))
                                        && ifNotBunkerBlocked(creep.room, s.pos)
                                        && s.pos.findInRange(FIND_MY_CREEPS, 1, {filter:c=>(c.memory.role=='dickHead'||c.memory.role=='linkKeeper'||c.memory.role=='dickHeadpp'||c.memory.role=='newDickHead'||c.memory.role=='maintainer'||c.memory.role=='balancer')&&c.getActiveBodyparts(CARRY)>0}).length==0
                                    )
                                });
                            if (needfill) {
                                if (creep.pos.getRangeTo(creep.room.storage)>1) {
                                    creep.travelTo(creep.room.storage, { maxRooms: 1 });
                                }
                                else {
                                    creep.withdraw(creep.room.storage, 'energy');
                                }
                            }
                            else {
                                let potents = creep.room.find(FIND_STRUCTURES, {filter:t=>t.structureType==STRUCTURE_CONTAINER && t.pos.getRangeTo(creep.room.controller)<4 && t.pos.findInRange(FIND_SOURCES).length==0});
                                if (potents.length>0) {
                                    if (potents[0].store.energy<1500) {
                                        if (creep.pos.getRangeTo(creep.room.storage)>1) {
                                            creep.travelTo(creep.room.storage, { maxRooms: 1 });
                                        }
                                        else {
                                            creep.withdraw(creep.room.storage, 'energy');
                                        }
                                        return
                                    }
                                }
                                actionAvoid.run(creep);
                            }
                            hasJobtd = true;
                        }
                        else {
                            noStoragePickuper.run(creep);
                        }
                    }
                }
            }
            else { // there is terminal
                let RCL = creep.room.controller.level;
                let r  = Game.rooms[creep.memory.target];
                
                if (creep.room.name == creep.memory.target) { // if in target room work
                    let terminal = creep.room.terminal;
                    let storage = creep.room.storage;
                    
                    /*
                    // lorry update lab job
                    if (Game.time%2==0 || creep.room.find(FIND_MY_CREEPS, {filter:c=>c.memory.boosted==false}).length>0) {
                        if (r.memory.forLab && r.memory.forLab.boostLabs) {
                            for (let btp in r.memory.forLab.boostLabs) {
                                let bolabid = r.memory.forLab.boostLabs[btp].id;
                                let bolab = Game.getObjectById(bolabid);
                                
                                if (bolab.mineralType==btp && bolab.store[btp]>=1500) {
                                    creep.memory.boostLabTask = undefined;
                                }
                                else {
                                    if (creep.room.memory.mineralThresholds.currentMineralStats[btp]>creep.store.getFreeCapacity(btp)) { // if we have mats for boost
                                        addLabFillTask(r.name, getATypeOfRes(creep.room, btp).id, bolabid, btp, Game.time);
                                    }
                                    else { // no mats for boost
                                        let marketable = false;
                                        if (marketable) { // ask from other rooms
                                            
                                        }
                                        else { // remove (season no market)
                                            r.memory.forLab.boostLabs[btp] = undefined;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    // lorry do lab job
                    let nowTask = creep.memory.boostLabTask;
                    // if there is task
                    if (nowTask == undefined && r.memory.labFillTask && Object.keys(r.memory.labFillTask).length>0) {
                        // take one
                        let totakeid = Object.keys(r.memory.labFillTask)[0];
                        if (totakeid && r.memory.labFillTask[totakeid]) {
                            //if (creep.room.name=='E31S49') fo(creep.pos)
                            creep.memory.boostLabTask = r.memory.labFillTask[totakeid];
                            creep.memory.boostLabTask['toId'] = totakeid;
                            nowTask = creep.memory.boostLabTask;
                        }
                        else {
                            r.memory.labFillTask[totakeid] = undefined;
                            nowTask = undefined;
                        }
                    }
                    
                    // if on a job
                    if (nowTask) {
                        let bolabid = nowTask.toId;
                        let botp = nowTask.tp;
                        let bolab = Game.getObjectById(bolabid);
                        // if fulfilled
                        if (bolab && bolab.store[botp]>=1500) {
                            // remove task in me and mem
                            r.memory.labFillTask[bolabid] = undefined;
                            creep.memory.boostLabTask = undefined;
                        }
                        // else do current job
                        else {
                            if (creep.room.memory.mineralThresholds.currentMineralStats[botp] + creep.store[botp]<1500) { // if room no this kind of res
                                if (Game.time%17==0) {
                                    fo(creep.room.name + ' lack of boost: ' + botp);
                                }
                                // later we require from other rooms or buy
                                r.memory.labFillTask[bolabid] = undefined;
                                creep.memory.boostLabTask = undefined;
                            }
                            else {
                                // if lab contain wrong type
                                if (bolab.mineralType && bolab.mineralType!=botp) {
                                    // if carry, deposit first
                                    if (creepCarrying>0) {
                                        if (creep.pos.getRangeTo(creep.room.storage)>1) {
                                            creep.travelTo(creep.room.storage);
                                            return
                                        }
                                        else {
                                            for (let tp in creep.store) {
                                                creep.transfer(creep.room.storage, tp);
                                                return
                                            }
                                        }
                                    }
                                    // else, take from lab
                                    else {
                                        if (creep.pos.getRangeTo(bolab)>1) {
                                            creep.travelTo(bolab);
                                            return
                                        }
                                        else {
                                            creep.withdraw(bolab, bolab.mineralType);
                                            return
                                        }
                                    }
                                }
                                // else if lab tp undefined or < 1500
                                else if (bolab.mineralType==undefined || bolab.store[botp]<1500) {
                                    // if empty
                                    if (creepCarrying==0) { // take tp
                                        let boostSource = Game.getObjectById(nowTask.from);
                                        if (boostSource && boostSource.store[botp]>0) {
                                            if (creep.pos.getRangeTo(boostSource)>1) {
                                                creep.travelTo(boostSource);
                                            }
                                            else {
                                                creep.withdraw(boostSource, botp);
                                            }
                                            return
                                        }
                                        else {
                                            // no this source, take from somewhere else
                                            let whereToTakeFrom = getATypeOfRes(creep.room, botp);
                                            if (creep.pos.getRangeTo(whereToTakeFrom)>1) {
                                                creep.travelTo(whereToTakeFrom);
                                            }
                                            else {
                                                creep.withdraw(whereToTakeFrom, botp);
                                            }
                                            return
                                        }
                                    }
                                    // else if carry other things
                                    else if (creepCarrying-creep.store[botp]>0) {
                                        // deposit
                                        if (creep.pos.getRangeTo(creep.room.storage)>1) {
                                            creep.travelTo(creep.room.storage);
                                            return
                                        }
                                        else {
                                            for (let tp in creep.store) {
                                                if (tp!=botp) {
                                                    creep.transfer(creep.room.storage, tp);
                                                    return
                                             W   }
                                            }
                                        }
                                    }
                                    // else carrying pure tp
                                    else {
                                        // fill lab
                                        if (creep.pos.getRangeTo(bolab)>1) {
                                            creep.travelTo(bolab);
                                            return
                                        }
                                        else {
                                            creep.transfer(bolab, botp);
                                            return
                                        }
                                    }
                                }
                            }
                        }
                    }
                    */
                    
                    // run reaction labs
                    if (fillReLab.run(creep)) {
                        return
                    }
                    
                    if (creep.room.energyAvailable==creep.room.energyCapacityAvailable && fillN.run(creep)) {
                        return
                    }
                    
                    if (creep.memory.working == undefined) {
                        creep.memory.working = false;
                    }

                    if (creep.memory.working == true && creepCarrying == 0) {
                        creep.memory.working = false;
                    }
                    else if ((creep.memory.working == false && creepCarrying == creep.carryCapacity) || creep.store.power>0) {
                        creep.memory.working = true;
                    }

                    if (creep.memory.working == true) { // if filled with energy, transfer to spawn, extensions or towers
                        //console.log('fill')
                        
                        /*  old lab code
                        let boostLabStates = checkRoomBoostLabState(creep.room, 'fill');
                        let ifBoostLabJob = boostLabStates[0];
                        let boostMat = boostLabStates[1];
                        let boostLabId = boostLabStates[2];
                        let boostLab = Game.getObjectById(boostLabId);

                        let newLabBoostBoo = checkIfCarryIsBoostLab(creep);
                        */
                        
                        /*  removed power, s2 symbols, old boost
                        let powerSpawn = Game.getObjectById(creep.room.memory.powerSpawnId);
                        if (RCL == 8 && Memory.mapInfo[creep.room.name].decoderInfo && creep.store[Memory.mapInfo[creep.room.name].decoderInfo.t] > 0) {
                            let decoder = creep.room.find(FIND_SYMBOL_DECODERS)[0];
                            if (creep.transfer(decoder, Memory.mapInfo[creep.room.name].decoderInfo.t) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(decoder);
                            }
                        }
                        else if (creep.carry[RESOURCE_POWER] > 0 && powerSpawn && powerSpawn.power < 40) {
                            if (creep.pos.getRangeTo(powerSpawn)>1) {
                                creep.travelTo(powerSpawn, { maxRooms: 1 });
                            }
                            else {
                                creep.transfer(powerSpawn, RESOURCE_POWER);
                            }
                        }
                        else if (newLabBoostBoo[0]) {
                            let restp = newLabBoostBoo[1];
                            let booId = newLabBoostBoo[0];
                            let booLab = Game.getObjectById(booId);
                            if (creep.pos.getRangeTo(booLab)>1) {
                                creep.travelTo(booLab, { maxRooms: 1 });
                            }
                            else {
                                creep.transfer(booLab, restp);
                            }

                        }
                        */
                        
                        if (creep.store[RESOURCE_ENERGY] == 0) { // carrying other minerals
                            for (const resourceType in creep.store) {
                                let ifShooterRoom = creep.room.memory.startMB;
                                if (ifShooterRoom && creep.room.terminal) {
                                    if (creep.pos.getRangeTo(terminal)>1) {
                                        creep.travelTo(terminal, { maxRooms: 1 });
                                    }
                                    else {
                                        creep.transfer(terminal, resourceType);
                                    }
                                }
                                else {
                                    let TorSToFill = terminal;
                                    if (terminal && _.sum(terminal.store) < terminal.storageCapacity * 0.95) { // if terminal is defined
                                        // pass
                                    }
                                    else {
                                        TorSToFill = storage;
                                    }
                                    if (creep.pos.getRangeTo(TorSToFill)>1) {
                                        creep.travelTo(TorSToFill);
                                    }
                                    else {
                                        creep.transfer(TorSToFill, resourceType);
                                    }
                                }
                                return
                            }
                        }
                        else { // only carrying energy
                            let sToFillEId = creep.memory.structureIdToFillWithEnergy;
                            if (sToFillEId == undefined || Game.time%10 == 0) {
                                sToFillE = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                                    filter: (s) => (
                                        (((s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION) && (s.energy < s.energyCapacity)) ||
                                        ((s.structureType == STRUCTURE_TOWER) && (s.energy < s.energyCapacity * 0.8)) ||
                                        ((s.structureType == STRUCTURE_LAB) && (s.energy < s.energyCapacity * 0.9)) ||
                                        ((s.structureType == STRUCTURE_POWER_SPAWN) && (s.energy < s.energyCapacity * 0.618)))
                                        && ifNotBunkerBlocked(creep.room, s.pos)
                                        && s.pos.findInRange(FIND_MY_CREEPS, 1, {filter:c=>(c.memory.role=='dickHead'||c.memory.role=='linkKeeper'||c.memory.role=='dickHeadpp'||c.memory.role=='newDickHead'||c.memory.role=='maintainer'||c.memory.role=='balancer')&&c.getActiveBodyparts(CARRY)>0}).length==0
                                    )
                                });
                                if (sToFillE) {
                                    creep.memory.structureIdToFillWithEnergy = sToFillE.id;
                                    sToFillEId = creep.memory.structureIdToFillWithEnergy = sToFillE.id;
                                }
                            }
                            
                            // nuker fill should be implemented her
                            if (sToFillEId && Game.getObjectById(sToFillEId)) { // if there is something to fill
                                if (creep.pos.getRangeTo(Game.getObjectById(sToFillEId))>1) {
                                    creep.travelTo(Game.getObjectById(sToFillEId), {maxRooms: 1});
                                }
                                else {
                                    if (creep.transfer(Game.getObjectById(sToFillEId), RESOURCE_ENERGY)==OK) {
                                        creep.memory.structureIdToFillWithEnergy = undefined;
                                    }
                                }
                                return
                            }
                            else { // no emergency filling
                                // fill upgrade container
                                let potents = creep.room.find(FIND_STRUCTURES, {filter:t=>t.structureType==STRUCTURE_CONTAINER && t.pos.getRangeTo(creep.room.controller)<4 && t.pos.findInRange(FIND_SOURCES).length==0});
                                if (potents.length>0) {
                                    if (potents[0].store.energy<1500) {
                                        if (creep.pos.getRangeTo(potents[0])>1) {
                                            creep.travelTo(potents[0], { maxRooms: 1 });
                                        }
                                        else {
                                            creep.transfer(potents[0], 'energy');
                                        }
                                        return
                                    }
                                }
                                // if mineral/e container needs clear
                                if (creep.room.find(FIND_STRUCTURES, {
                                        filter: (s) => (
                                            (s.structureType == STRUCTURE_CONTAINER) && (_.sum(s.store) > creep.store.getCapacity('energy')))
                                            && s.pos.findInRange(FIND_MY_CREEPS, 1, {filter:c=>(c.memory.role=='miner')}).length>0
                                    }).length>0) 
                                {
                                    if (creep.room.terminal && creep.room.terminal.store.getFreeCapacity('energy')>0) {
                                        if (creep.pos.getRangeTo(creep.room.terminal)>1) {
                                             creep.travelTo(creep.room.terminal, { maxRooms: 1 });
                                        }
                                        else {
                                            creep.transfer(creep.room.terminal, RESOURCE_ENERGY);
                                        }
                                    }
                                    else if (creep.room.storage && creep.room.storage.store.getFreeCapacity('energy')>0) {
                                        if (creep.pos.getRangeTo(creep.room.storage)>1) {
                                             creep.travelTo(creep.room.storage, { maxRooms: 1 });
                                        }
                                        else {
                                            creep.transfer(creep.room.terminal, RESOURCE_ENERGY);
                                        }
                                    }
                                }
                                else {
                                    actionAvoid.run(creep);
                                }
                                return
                            }
                        }
                    }
                    else { // if not working: find a none empty container and get energy from containers //
                        //console.log('take')fo(creep.pos)
                        if (creep.room.energyAvailable < 0.816 * creep.room.energyCapacityAvailable) {
                            let TorSToTake = terminal;
                            if (terminal && terminal.store.energy>20000) { // if terminal is defined
                                // pass
                            }
                            else {
                                TorSToTake = storage;
                            }
                            if (creep.pos.getRangeTo(TorSToTake)>1) {
                                creep.travelTo(TorSToTake);
                            }
                            else {
                                creep.withdraw(TorSToTake, 'energy');
                            }
                            return
                        }
                        else {
                            var containers = creep.room.find(FIND_STRUCTURES, { filter: c => (c.structureType == STRUCTURE_CONTAINER) && (_.sum(c.store) > creep.carryCapacity) && (c.pos.findInRange(FIND_MY_CREEPS, 1, { filter: c => (c.memory.role == 'dickHead' || c.memory.role == 'linkKeeper' || c.memory.role == 'dickHeadpp' || c.memory.role == 'newDickHead' || c.memory.role == 'maintainer' || c.memory.role == 'balancer') }).length == 0) });
                                    if (containers.length > 0) {
                                        // mineral container
                                        for (let container of containers) {
                                            for (let mineralType in container.store) {
                                                if (mineralType !== 'energy') { // accidental mineral drop
                                                    if (creep.pos.getRangeTo(container)>1) {
                                                        creep.travelTo(container);
                                                    }
                                                    else {
                                                        creep.withdraw(container, mineralType);
                                                    }
                                                    return
                                                }
                                            }
                                        }
                                        
                                        let sps = creep.room.find(FIND_MY_STRUCTURES, { filter: o => o.structureType == STRUCTURE_SPAWN });
                                        for (let container of containers) {
                                            let takeThis = true;
                                            // check container not central containers
                                            if (sps.length > 0) { // my room
                                                // upgrade container
                                                if (container.pos.getRangeTo(creep.room.controller) < 3) {
                                                    takeThis = false;
                                                }
                                                // middle place container
                                                for (let sp of sps) {
                                                    if (container.pos.getRangeTo(sp) < 3) {
                                                        takeThis = false;
                                                    }
                                                }
                                            }
                                            if (takeThis) {
                                                for (let mineralType in container.store) {
                                                    if (creep.pos.getRangeTo(container)>1) {
                                                        creep.travelTo(container);
                                                    }
                                                    else {
                                                        creep.withdraw(container, mineralType);
                                                    }
                                                    return
                                                }
                                            }
                                        }
                                    }
                                    
                                    /* season 2 special
                                    // scoring
                                    if (RCL == 8 && Memory.mapInfo[creep.room.name] && Memory.mapInfo[creep.room.name].decoderInfo && creep.store.getFreeCapacity() > 0 && creep.ticksToLive > 100) {
                                        let symdonor;
                                        if (creep.room.storage.store[Memory.mapInfo[creep.room.name].decoderInfo.t] > 0) {
                                            symdonor = creep.room.storage;
                                        }
                                        else if (creep.room.terminal.store[Memory.mapInfo[creep.room.name].decoderInfo.t] > 0) {
                                            symdonor = creep.room.terminal;
                                        }
                                        else {
                                            // pass
                                        }
                                        if (symdonor) {
                                            if (creep.withdraw(symdonor, Memory.mapInfo[creep.room.name].decoderInfo.t) == ERR_NOT_IN_RANGE) {
                                                creep.moveTo(symdonor);
                                            }
                                            return
                                        }
                                    }
                                    */

                                    if (true) {
                                        /*  power
                                        if (false && powerVariable && ((!creep.carry.power) || (creep.carry.power && creep.carry.power < 60)) && creep.ticksToLive>200) {
                                            // take power
                                            let toGo = powerVariable;
                                            let powerStoreAmout = toGo.store['power'];
                                            if (creep.withdraw(toGo, RESOURCE_POWER, Math.min(60, powerStoreAmout)) == ERR_NOT_IN_RANGE) {
                                                creep.travelTo(toGo);
                                            }
                                        }
                                        else {
                                        */
                                        let structure = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                                            filter: (s) => (
                                                (((s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION) && (s.energy < s.energyCapacity)) ||
                                                ((s.structureType == STRUCTURE_TOWER) && (s.energy < s.energyCapacity * 0.8)) ||
                                                ((s.structureType == STRUCTURE_LAB) && (s.energy < s.energyCapacity * 0.9)) ||
                                                ((s.structureType == STRUCTURE_POWER_SPAWN) && (s.energy < s.energyCapacity * 0.618)))
                                                && ifNotBunkerBlocked(creep.room, s.pos)
                                                && s.pos.findInRange(FIND_MY_CREEPS, 1, {filter:c=>(c.memory.role=='dickHead'||c.memory.role=='linkKeeper'||c.memory.role=='dickHeadpp'||c.memory.role=='newDickHead'||c.memory.role=='maintainer'||c.memory.role=='balancer')&&c.getActiveBodyparts(CARRY)>0}).length==0
                                            )
                                        });
                                        // nuker fill should be implemented here
                                        if (structure) { // if there is something to fill
                                            if (creep.room.storage && creep.room.storage.store.energy > 0) {
                                                if (creep.pos.getRangeTo(creep.room.storage)>1) {
                                                    creep.travelTo(creep.room.storage);
                                                }
                                                else {
                                                    creep.withdraw(creep.room.storage, RESOURCE_ENERGY);
                                                }
                                                return
                                            }
                                            else if (creep.room.terminal && creep.room.terminal.energy > 0) {
                                                if (creep.pos.getRangeTo(creep.room.terminal)>1) {
                                                    creep.travelTo(creep.room.terminal);
                                                }
                                                else {
                                                    creep.withdraw(creep.room.terminal, RESOURCE_ENERGY);
                                                }
                                                return
                                            }
                                            else {
                                                getE.run(creep);
                                                return
                                            }
                                        }
                                        else { // rooms does not need energy, we should idle, because resources balancing now takes over by balancer
                                            if (creep.room.find(FIND_MY_POWER_CREEPS).length==0 && creep.room.find(FIND_MY_CREEPS, {filter: c=>c.memory.role=='dedicatedUpgraderHauler'}).length==0) {
                                                let upctn = creep.room.find(FIND_STRUCTURES, {filter: t=>t.structureType==STRUCTURE_CONTAINER && t.pos.getRangeTo(creep.room.controller)<3 && t.pos.findInRange(FIND_SOURCES, 2).length==0});
                                                if (upctn.length>0) {
                                                    if (upctn[0].store.energy<1500) {
                                                        getE.run(creep);
                                                        return
                                                    }
                                                }
                                            }
                                            noStoragePickuper.run(creep);
                                            return
                                        }
                                    }
                                }
                    }
                }
                else {
                    creep.travelTo(new RoomPosition(25, 25, creep.memory.target));
                }
            }
        }
    }
};
