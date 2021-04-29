var actionRunAway = require('action.flee');

module.exports = {
    run: function (creep) {
        const avoidRadius = 5;

        if (creep.memory.storedTarget == undefined) {
            creep.memory.storedTarget = {};
        }

        if (creep.getActiveBodyparts(MOVE) == 0) {
            // early WORK only miner or damaged miner
            let source = Game.getObjectById(creep.memory.sourceID);
            // get working position
            if (creep.memory.workingPos == undefined || Object.keys(creep.memory.workingPos).length === 0) { // if working position is not found yet, find working position
                creep.memory.workingPos = {};
                let ezpos = Memory.mapInfo[creep.room.name].eRes[source.id].easyContainerPosi
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
                            if (found.length > 0 && found[0].memory.role == 'miner' && found[0].name !== creep.name) {
                                let miningPosis = Memory.mapInfo[creep.room.name].eRes[creep.memory.sourceID].posis;
                                for (let miningPosInd in miningPosis) {
                                    let miningPos = miningPosis[miningPosInd];
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
                                    let containerSite = source.pos.findInRange(FIND_CONSTRUCTION_SITES, 1)[0];
                                    if ((creep.carry.energy > 0) && (containerSite)) {
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
                            if (creep.memory.toFillIds == undefined || Game.time%5019 == 0) { // check if anything build of destroyed
                                let toFillIds = []
                                let lands = returnALLAvailableLandCoords(creep.room, creep.pos);
                                for (let land of lands) {
                                     let lound = creep.room.lookForAt(LOOK_STRUCTURES, land.x, land.y);
                                     if (lound.length>0 && lound[0].structureType == STRUCTURE_EXTENSION) {
                                         toFillIds.push(lound[0].id);
                                     }
                                }
                                creep.memory.toFillIds = toFillIds;
                            }
                            // fill extensions
                            for (let toFillId of creep.memory.toFillIds) {
                                let exten = Game.getObjectById(toFillId);
                                if (exten && (exten.store.getUsedCapacity('energy') < exten.store.getCapacity('energy')) && (creep.store.energy==creep.store.getCapacity())) {
                                    creep.transfer(exten, 'energy');
                                    return
                                }
                            }
                            
                            if ((creep.memory.containerID) && (creep.carry.energy > 0)) {
                                let container = Game.getObjectById(creep.memory.containerID);
                                if ((container.hits < 0.85 * container.hitsMax) || source.energy == 0) {
                                    creep.repair(container);
                                }
                            }
                            else {
                                let containerSite = source.pos.findInRange(FIND_CONSTRUCTION_SITES, 1)[0];
                                if ((creep.carry.energy > 0) && (containerSite)) {
                                    creep.build(containerSite);
                                }
                            }
                        }
                    }
                    else { // publish task
                        let asksList = creep.room.memory.taskMove.asks;
                        if (asksList.length == 0) { // no task, add me
                            creep.room.memory.taskMove.asks.push({posi: {x: creep.memory.workingPos.x,y:creep.memory.workingPos.y}, askerName: creep.name});
                            return
                        }
                        else { // there is task, check if I have it
                            for (let askI of asksList) {
                                if ((askI.posi.x==creep.memory.workingPos.x)&&(askI.posi.y==creep.memory.workingPos.y)&&(askI.askerName==creep.name)) {
                                    return
                                }
                            }
                        }
                        creep.room.memory.taskMove.asks.push({posi: {x: creep.memory.workingPos.x,y:creep.memory.workingPos.y}, askerName: creep.name});
                    }
                }  
            }
        }
        else { // normal miner
            if (creep.hits < 0.618 * creep.hitsMax && creep.room.name != creep.memory.home) { // go back home to heal when injured
                creep.moveTo(new RoomPosition(25, 25, creep.memory.home));
            }
            else {
                let keeperLair = creep.pos.findInRange(FIND_STRUCTURES, avoidRadius, { filter: c => c.structureType == STRUCTURE_KEEPER_LAIR && c.ticksToSpawn < 3 });
                //if ((Game.rooms[creep.memory.target]==undefined)||(Game.rooms[creep.memory.target].memory.ifPeace == false)) { // room under attack, run away
                if ((creep.pos.findInRange(FIND_HOSTILE_CREEPS, avoidRadius).length > 0) || keeperLair && (keeperLair.length > 0)) { // self destroy if not useful damages by NPC
                    for (const resourceType in creep.carry) {
                        creep.drop(resourceType);
                    }
                    actionRunAway.run(creep);
                }
                else if (creep.memory.target == undefined || creep.room.name == creep.memory.target) {// if in target room or main room
                    if (true) { // creep.name == 'Aaron'
                        let source = Game.getObjectById(creep.memory.sourceID);
                        // get working position
                        if (creep.memory.workingPos == undefined) { // if working position is not found yet, find working position
                            creep.memory.workingPos = {};
                            let container = source.pos.findInRange(FIND_STRUCTURES, 1, { filter: s => s.structureType == STRUCTURE_CONTAINER })[0];
                            if (container) { // if a container is found, working position = container position
                                creep.memory.workingPos.x = container.pos.x;
                                creep.memory.workingPos.y = container.pos.y;
                                creep.memory.containerID = container.id;
                                if (creep.memory.link) { // if link mining
                                    // if link mining, calculate working position based on source and link
                                    let link = source.pos.findInRange(FIND_STRUCTURES, 2, { filter: s => s.structureType == STRUCTURE_LINK })[0];
                                    creep.memory.linkID = link.id;
                                }
                            }
                            else if (creep.memory.link) { // if link mining
                                // if link mining, calculate working position based on source and link
                                let link = source.pos.findInRange(FIND_STRUCTURES, 2, { filter: s => s.structureType == STRUCTURE_LINK })[0];
                                creep.memory.linkID = link.id;
                                let placeToStand = overlappedTiles(creep, source.pos, link.pos);
                                creep.memory.workingPos.x = placeToStand.x;
                                creep.memory.workingPos.y = placeToStand.y;
                            }
                            else { // drop mining, find an available tile round source
                                let toStand = validSurrounds(source);
                                creep.memory.workingPos.x = toStand[0];
                                creep.memory.workingPos.y = toStand[1];
                            }
                        }
                        else { // if working position get
                            if ((creep.pos.x == creep.memory.workingPos.x) && (creep.pos.y == creep.memory.workingPos.y)) { // if at working position, mine
                                creep.harvest(source); // harvest
                                if (creep.memory.link) {// if a link is nearby (link is stored), transfer energy
                                    creep.transfer(Game.getObjectById(creep.memory.linkID), RESOURCE_ENERGY);
                                }
                                if ((creep.memory.containerID) && (creep.carry.energy > 0)) {
                                    let container = Game.getObjectById(creep.memory.containerID);
                                    if ((container.hits < 0.85 * container.hitsMax) || source.energy == 0) {
                                        creep.repair(container);
                                    }
                                }
                                else {
                                    let containerSite = source.pos.findInRange(FIND_CONSTRUCTION_SITES, 1)[0];
                                    if ((creep.carry.energy > 0) && (containerSite)) {
                                        creep.build(containerSite);
                                    }
                                }
                            }
                            else {// go to working position
                                if (creep.memory.target) {
                                    creep.travelTo(new RoomPosition(creep.memory.workingPos.x, creep.memory.workingPos.y, creep.memory.target));
                                }
                                else {
                                    creep.travelTo(new RoomPosition(creep.memory.workingPos.x, creep.memory.workingPos.y, creep.memory.home));
                                }
                            }
                        }
                    }
                    else {
                        let source = Game.getObjectById(creep.memory.sourceID);
                        let container = source.pos.findInRange(FIND_STRUCTURES, 1, { filter: s => s.structureType == STRUCTURE_CONTAINER })[0];

                        if (creep.memory.link) { // if link mining
                            let link = source.pos.findInRange(FIND_STRUCTURES, 2, { filter: s => s.structureType == STRUCTURE_LINK })[0];
                            if (container) { // if there is a container
                                if (creep.pos.isEqualTo(container)) { // if creep on container, harvest source and transfer to link
                                    creep.harvest(source);
                                    //creep.travelTo(link);
                                    creep.transfer(link, RESOURCE_ENERGY);
                                }
                                else { // go to container
                                    creep.memory.storedTarget.x = container.pos.x; creep.memory.storedTarget.y = container.pos.y; creep.memory.storedTarget.roomName = container.room.name;
                                    creep.travelTo(container);
                                }
                            }
                            else { // pure link mining without container
                                let placeToStand = overlappedTiles(creep, source.pos, link.pos);
                                let x = placeToStand.x;
                                let y = placeToStand.y;
                                if (creep.pos.isEqualTo(x, y)) { // if not in range, move to source
                                    creep.harvest(source);
                                    //creep.travelTo(link);
                                    creep.transfer(link, RESOURCE_ENERGY);
                                }
                                else {
                                    creep.travelTo(new RoomPosition(x, y, creep.room.name));
                                }
                            }
                        }
                        else { // container mining
                            if (container == undefined) { // drop mining
                                if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                                    creep.travelTo(source);
                                    creep.memory.storedTarget.x = source.pos.x; creep.memory.storedTarget.y = source.pos.y; creep.memory.storedTarget.roomName = source.room.name;
                                }
                                let containerSite = source.pos.findInRange(FIND_CONSTRUCTION_SITES, 1)[0];
                                if ((creep.carry.energy > 0) && (containerSite)) {
                                    creep.build(containerSite);
                                }
                            }

                            if (creep.pos.isEqualTo(container)) {
                                creep.harvest(source)
                                if ((creep.carry.energy > 0) && ((container.hits < 0.95 * container.hitsMax))) {
                                    creep.repair(container);
                                }
                            }
                            else {
                                creep.travelTo(container);
                                if (container) {
                                    creep.memory.storedTarget.x = container.pos.x; creep.memory.storedTarget.y = container.pos.y; creep.memory.storedTarget.roomName = container.room.name;
                                }
                            }
                        }
                    }
                }
                else { // go to target room
                    if (creep.memory.workingPos) { // if stored target position
                        creep.travelTo(new RoomPosition(creep.memory.workingPos.x, creep.memory.workingPos.y, creep.memory.target));
                    }
                    else {
                        creep.travelTo(new RoomPosition(25, 25, creep.memory.target));
                    }
                }
            }
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
