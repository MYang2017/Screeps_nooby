var rolePioneer = require('role.pioneer');
var roleHarvester = require('role.harvester');
var roleUp = require('role.upgrader');
var actionBuild = require('action.build');
var actionUpgradeController = require('action.upgradeController');
var avoidd = require('action.idle')
var actionPassE = require('action.passEnergy');
var actionGetEnergy = require('action.getEnergy');
var roleLoader = require('role.loader');
var tak = require('action.lootAll');
var fillE = require('action.fillEnergy');

module.exports = {
    run: function (creep) {
        /*if (Game.rooms[creep.memory.target].memory.ifPeace == false) { // room under attack, run away
           creep.say('run away');
           creep.moveTo(Game.flags[creep.memory.target+'_shelter'].pos);
        }
        else {*/
        if (creep.memory.attackedAtTime && (creep.memory.attackedAtTime + 50) > Game.time) {
            if (Game.rooms[creep.memory.target] && Game.rooms[creep.memory.target].find(FIND_HOSTILE_CREEPS).length==0) {
                creep.memory.attackedAtTime = undefined;
            }
            creep.moveTo(new RoomPosition(25, 25, creep.memory.home), { range: 20 });
            dog.run(creep);
        }
        else {
            /*if (creep.room.controller && creep.room.controller.my) {
                creep.memory.underAttack = undefined;
            }
            else {*/
                let enemy = creep.room.find(FIND_HOSTILE_CREEPS, { filter: c => (!allyList().includes(c.owner.username)) && (c.getActiveBodyparts(ATTACK) + c.getActiveBodyparts(RANGED_ATTACK) > 0) });
                if (enemy && enemy.length > 0) {
                    creep.memory.attackedAtTime = Game.time;
                }
                else {
                    creep.memory.underAttack = undefined;
                }
            //}

            if (creep.memory.working == true && creep.carry.energy == 0) {
                creep.memory.working = false;
            }
            else if (creep.memory.working == false && _.sum(creep.store) > 0.95 * creep.store.getCapacity('energy')) {
                creep.memory.working = true;
            }

            if (creep.memory.working == true) { // if working act as upgrader
                if (creep.room.name == creep.memory.home) {
                    actionPassE.run(creep);
                    let r = creep.room;
                    if (r.memory.newBunker && r.memory.newBunker.layout && r.memory.newBunker.layout.recCtn && r.memory.newBunker.layout.recCtn.length>0) {
                        fillE.run(creep);
                    }
                    else {
                        if (r.memory.newBunker && r.memory.newBunker.setPoint) {
                            if (creep.pos.getRangeTo(r.memory.newBunker.setPoint.x, r.memory.newBunker.setPoint.y)>1) {
                                creep.travelTo(new RoomPosition(r.memory.newBunker.setPoint.x, r.memory.newBunker.setPoint.y, creep.room.name), {maxRooms:1});
                            }
                            else {
                                creep.drop('energy');
                            }
                        }
                        else {
                            let sp = creep.room.find(FIND_MY_STRUCTURES, {structureType: STRUCTURE_SPAWN});
                            if (sp.length==0) {
                                fo(creep.room.name + ' need spawn!');
                            }
                            else {
                                if (creep.pos.getRangeTo(sp[0])>1) {
                                    creep.travelTo(sp[0], {maxRooms:1});
                                }
                                else {
                                    creep.drop('energy');
                                }
                            }
                        }
                    }
                }
                else {
                    if (false && creep.room.name=='E8S48') {
                        let tr = Game.getObjectById('6004c5cbfec40a62792b18f5');
                        if (creep.pos.getRangeTo(tr)>2) {
                            creep.travelTo(tr);
                        }
                        else {
                            fo(creep.repair(tr));
                        }
                        return
                    }
                    creep.travelTo(new RoomPosition(25, 25, creep.memory.home), { range: 10 });
                    //var exit = creep.room.findExitTo(creep.memory.home);
                    //creep.moveTo(creep.pos.findClosestByRange(exit));
                }
            }
            else { // working is false, find energy
                if (creep.room.name == creep.memory.target) {
                    if (creep.getActiveBodyparts(WORK)<=1) {
                        tak.run(creep);
                    }
                    else {
                        creep.memory.big = true;
                        if (!creep.memory.in) {
                            if (Memory.mapInfo && Memory.mapInfo[creep.memory.target] && Memory.mapInfo[creep.memory.target].eRes) {
                                for (let resId in Memory.mapInfo[creep.memory.target].eRes) {
                                    let res = Game.getObjectById(resId);
                                    if (creep.pos.getRangeTo(res)>1 && res.pos.findInRange(FIND_MY_CREEPS, 1, {filter:c=>c.getActiveBodyparts(WORK)>0}).length == Memory.mapInfo[creep.memory.target].eRes[resId].posis.length) {
                                        continue
                                    }
                                    else {
                                        creep.memory.in = resId;
                                    }
                                }
                            }
                            else {
                                let ctn = creep.room.find(FIND_STRUCTURES, { filter: t => t.structureType == STRUCTURE_CONTAINER && t.store.energy > 0 });
                                if (ctn.length > 0) {
                                    if (creep.pos.getRangeTo(ctn[0]) > 1) {
                                        creep.travelTo(ctn[0]);
                                    }
                                    else {
                                        creep.withdraw(ctn[0], 'energy');
                                    }
                                    return
                                }
                                actionGetEnergy.run(creep);
                            }
                        }
                        else {
                            let res = Game.getObjectById(creep.memory.in)
                            if (creep.pos.getRangeTo(res)>1) {
                                creep.travelTo(res, {maxRooms: 1});
                            }
                            else {
                                creep.harvest(res);
                            }
                        }
                    }
                    /*
                    let energyResources = creep.room.find(FIND_SOURCES)
                    let energySource = creep.pos.findClosestByPath(FIND_SOURCES);// find closest energy source
                    let goToId = undefined;
                    if (energyResources.length>1) { // 2 source room
                        if (energySource) {
                            if (((energySource.energy>0)&&(ifSurrounded(energySource) == null)&&(creep.pos.getRangeTo(energySource)>1))||(energySource.energy==0)) { // if full
                                let indexOfCurrent = energyResources.indexOf(energySource); // go to the other one
                                goToId = energyResources[1-indexOfCurrent].id;
                            }
                            else { // not full go to the nearest one
                                goToId = energySource.id;
                            }
                        }
                    }
                    else { // 1 source room
                        if (energySource) {
                            if (((energySource.energy>0)&&(ifSurrounded(energySource) == null)&&(creep.pos.getRangeTo(energySource)>1))||(energySource.energy==0)) { // if full
                                goToId = undefined;
                            }
                            else {
                                goToId = energySource.id;
                            }
                        }
                    }
                    
                    if (goToId) {
                        let tar = Game.getObjectById(goToId)
                        if(creep.harvest(tar) == ERR_NOT_IN_RANGE) {
                            creep.travelTo(tar, {maxRooms: 1});
                        }
                    }
                    else {
                        avoidd.run(creep);
                    }
                    */
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
                        creep.travelTo(creep.pos.findClosestByRange(creep.room.findExitTo(route[0].room)), {maxRooms: 1});
                    }
                }
            }
        }
    }
    //}
};
