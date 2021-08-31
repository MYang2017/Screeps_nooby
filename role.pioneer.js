var roleBuilder = require('role.builder');
var roleRepairer = require('role.repairer');
var roleUpgrader = require('role.upgrader')
var actionRunAway = require('action.flee');
//var actionHarvestE = require('action.getEnergy');
var roleHarvester = require('role.harvester');
var fillE = require('action.fillEnergy');
var getE = require('action.getEnergy');
var up = require('action.upgradeController');

module.exports = {
    run: function(creep) {
        creep.say('pioneering');
        
        if (creep.hits < 0.818 * creep.hitsMax && creep.room.name != creep.memory.home) { // go back home to heal when injured
            creep.moveTo(new RoomPosition(25, 25, creep.memory.home));
            return
        }
        
        let safeMining = creep.room.controller && creep.room.controller.my && creep.room.controller.safeMode;
        
        if (!safeMining) {
            const avoidRadius = 6;
            let pohos = creep.pos.findInRange(FIND_HOSTILE_CREEPS, avoidRadius, {filter: c=> !allyList().includes(c.owner.username) });
            if (pohos.length > 0) { // self destroy if not useful damages by NPC
                if (creep.getActiveBodyparts(WORK)>5) {
                    if (creep.getActiveBodyparts(RANGED_ATTACK)>0) {
                        let neq = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 3);
                        if (neq.length>0) {
                            creep.rangedMassAttack();
                        }
                    }
                    if (creep.getActiveBodyparts(HEAL)>0) {
                        creep.heal(creep);
                    }
                    else {
                        actionRunAway.run(creep);
                    }
                }
            }
        }
        
        let fs = creep.room.find(FIND_FLAGS, {filter:f=>f.color==COLOR_PURPLE});
        if (fs.length>0) {
            creep.travelTo(fs[0]);
            return
        }
        
        if (false) { //(creep.hits < creep.hitsMax) {
            creep.travelTo(new RoomPosition(25, 25, creep.memory.home));
        }
        else {
            if (creep.memory.loaded == undefined && creep.getActiveBodyparts(MOVE)>=creep.body.length/2) {
                if (creep.room.storage&& creep.room.storage.store.energy>0) {
                    creep.moveTo(creep.room.storage);
                    if (creep.withdraw(creep.room.storage, 'energy') == OK) {
                        creep.memory.loaded = true;
                    }
                }
                else {
                    creep.memory.loaded = true;
                }
            }
            else {
                if (creep.room.name != creep.memory.target) { // if not in target room yet
                    // move to target
                    if (creep.memory.foundRoute == undefined) {
                        creep.memory.foundRoute = {};
                    }
                    if (creep.memory.foundRoute[creep.room.name+creep.memory.target]) {
                        let route = creep.memory.foundRoute[creep.room.name+creep.memory.target];
                        if (route.length > 0) {
                            let next = route[0];
                            let nextRoomTar = new RoomPosition(25, 25, next.room);
                            creep.travelTo(nextRoomTar, {maxRooms: 1, offRoad: true, ignoreRoads: true});
                        }
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
                                if (isHighway || isMyRoom) {
                                    return 1;
                                }
                                else if (Memory.rooms[roomName] && Memory.rooms[roomName].avoid) {
                                    return 18.8
                                }
                                else {
                                    return 5.14;
                                }
                            }});
                        if (route.length > 0) {
                            let next = route[0];
                            let nextRoomTar = new RoomPosition(25, 25, next.room);
                            creep.travelTo(nextRoomTar, {maxRooms: 1, offRoad: true, ignoreRoads: true});
                        }
                        creep.memory.foundRoute[creep.room.name+creep.memory.target] = route;
                    }
                }
                else { // if in target room
                
                    if (creep.getActiveBodyparts(WORK)>20 && creep.getActiveBodyparts(CARRY)<3) {
                        creep.memory.role = 'superUpgrader';
                        creep.memory.home = creep.memory.target;
                    }
                    
                    if (creep.memory.working == true && creep.carry.energy == 0) {
                        creep.memory.working = false;
                    }
                    else if (creep.memory.working == false && creep.store.energy == creep.store.getCapacity('energy')) {
                        creep.memory.working = true;
                    }
                    
                    if (creep.room.controller==undefined || creep.room.controller.owner == undefined) { // middle rooms
                        roleBuilder.run(creep);
                    }
                    else if (creep.room.controller.owner == undefined) {
                        roleRepairer.run(creep);
                    }
                    else {
                        if (creep.room.name!=creep.memory.home) {
                            creep.memory.home = creep.memory.target;
                        }
                        //console.log(!ifWaitForRenew(creep))
                        
                        if (creep.ticksToLive==400 && creep.room.find(FIND_STRUCTURES, {filter:t=>(t.structureType==STRUCTURE_CONTAINER||t.structureType==STRUCTURE_ROAD) &&t.hits<0.5*t.hitsMax}).length>0 && creep.room.find(FIND_MY_CREEPS, {filter:c=>c.memory.role=='repairer'}).length==0) {
                            creep.memory.role = 'repairer';
                        }

                        let needE = !creep.memory.working;
                        
                        if (creep.store.energy>creep.getActiveBodyparts(WORK)*5) {
                            let nbcs = creep.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 3);
                            if (nbcs.length>0) {
                                creep.build(nbcs[0]);
                            }
                        }
                        
                        if (creep.room.find(FIND_MY_STRUCTURES, {structureType: STRUCTURE_SPAWN}).length>0 && creep.room.find(FIND_MY_CREEPS, {filter:c=>c.memory.role=='miner'&&c.pos.findInRange(FIND_SOURCES, 1).length>0}).length==0) {
                            if (creep.room.energyAvailable<creep.room.energyCapacityAvailable && creep.memory.working == true) {
                                fillE.run(creep, true);
                                return
                            }
                        }
                        
                        /*
                        if (creep.room.controller && creep.room.controller.level<3) {
                            if (needE) {
                                getE.run(creep);
                            }
                            else {
                                up.run(creep);
                            }
                            return
                        }
                        */
                        
                        let cswrpts = creep.room.find(FIND_CONSTRUCTION_SITES, {filter:c=>c.structureType==STRUCTURE_RAMPART||c.structureType==STRUCTURE_WALL||STRUCTURE_TOWER});
                        if (cswrpts && cswrpts.length>0) {
                            if (needE) {
                                getE.run(creep);
                            }
                            else {
                                if (creep.build(cswrpts[0])==ERR_NOT_IN_RANGE) {
                                    creep.travelTo(cswrpts[0], {maxRooms: 1});
                                }
                            }
                            return
                        }
                        
                        cswrpts = creep.room.find(FIND_MY_STRUCTURES, {filter:c=>c.structureType==STRUCTURE_RAMPART && c.hits<10000 && c.hits<c.hitsMax});
                        if (cswrpts && cswrpts.length>0) {
                            if (needE) {
                                getE.run(creep);
                            }
                            else {
                                if (creep.repair(cswrpts[0])==ERR_NOT_IN_RANGE) {
                                    creep.moveTo(cswrpts[0], {maxRooms: 1});
                                }
                            }
                            return
                        }
                        else {
                            cswrpts = creep.room.find(FIND_MY_STRUCTURES, {filter:c=>c.structureType==STRUCTURE_RAMPART && c.hits<100000 && c.hits<c.hitsMax});
                            if (cswrpts && cswrpts.length>0) {
                                if (needE) {
                                    getE.run(creep);
                                }
                                else {
                                    if (creep.repair(cswrpts[0])==ERR_NOT_IN_RANGE) {
                                        creep.moveTo(cswrpts[0], {maxRooms: 1});
                                    }
                                }
                                return
                            }
                            else {
                                cswrpts = creep.room.find(FIND_MY_STRUCTURES, {filter:c=>c.structureType==STRUCTURE_RAMPART && c.hits<200000 && c.hits<c.hitsMax});
                                if (cswrpts && cswrpts.length>0) {
                                    if (needE) {
                                        getE.run(creep);
                                    }
                                    else {
                                        if (creep.repair(cswrpts[0])==ERR_NOT_IN_RANGE) {
                                            creep.moveTo(cswrpts[0], {maxRooms: 1});
                                        }
                                    }
                                    return
                                }
                                else {
                                    // build spawn when rampart ready
                                    cswrpts = creep.room.find(FIND_MY_STRUCTURES, {filter:c=>c.structureType==STRUCTURE_RAMPART && c.hits>=10000 && c.hits<c.hitsMax});
                                    if (cswrpts && cswrpts.length > 0) {
                                        if (needE) {
                                            getE.run(creep);
                                            return
                                        }
                                        else {
                                            let spcs = creep.room.find(FIND_CONSTRUCTION_SITES, { filter: c => c.structureType == STRUCTURE_SPAWN });
                                            if (spcs && spcs.length > 0) {
                                                if (creep.build(spcs[0]) == ERR_NOT_IN_RANGE) {
                                                    creep.moveTo(spcs[0], { maxRooms: 1 });
                                                }
                                                return
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        
                        if  ((creep.room.controller && creep.room.controller.ticksToDowngrade && ( creep.room.controller.level <= 2 || creep.room.controller.ticksToDowngrade<5333))) {
                            if (needE) {
                                getE.run(creep);
                            }
                            else {
                                let spcs = creep.room.find(FIND_CONSTRUCTION_SITES, {structureType: STRUCTURE_EXTENSION||STRUCTURE_TOWER||STRUCTURE_ROAD});
                                if (spcs && spcs.length > 0) {
                                    if (creep.build(spcs[0]) == ERR_NOT_IN_RANGE) {
                                        creep.moveTo(spcs[0], { maxRooms: 1 });
                                    }
                                    return
                                }
                                up.run(creep);
                            }
                            return
                        }
                        else if (creep.room.controller && creep.room.controller.my && creep.room.controller.level>=6) {
                            cswrpts = creep.room.find(FIND_STRUCTURES, {filter:c=>c.structureType==STRUCTURE_WALL && c.hits<2000000 && c.hits<c.hitsMax});
                            if (cswrpts && cswrpts.length>0) {
                                if (needE) {
                                    getE.run(creep);
                                }
                                else {
                                    if (creep.repair(cswrpts[0])==ERR_NOT_IN_RANGE) {
                                        creep.moveTo(cswrpts[0], {maxRooms: 1});
                                    }
                                }
                                return
                            }
                            else {
                                cswrpts = creep.room.find(FIND_MY_STRUCTURES, {filter:c=>c.structureType==STRUCTURE_RAMPART && c.hits<2000000 && c.hits<c.hitsMax});
                                if (cswrpts && cswrpts.length>0) {
                                    if (needE) {
                                        getE.run(creep);
                                    }
                                    else {
                                        if (creep.repair(cswrpts[0])==ERR_NOT_IN_RANGE) {
                                            creep.moveTo(cswrpts[0], {maxRooms: 1});
                                        }
                                    }
                                    return
                                }
                            }
                        }
                        if (!ifWaitForRenew(creep)) {
                            if (creep.memory.role == 'longDistanceHarvester' && creep.memory.working == true) {
                                creep.travelTo(new RoomPosition(25, 25, creep.memory.home));
                            }
                            else {
                                let css = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES, {filter:c=>c.structureType==STRUCTURE_RAMPART && c.hits<c.hitsMax});
                                if (css && css.length>0) {
                                    if (needE) {
                                        getE.run(creep);
                                    }
                                    else {
                                        if (creep.build(css[0])==ERR_NOT_IN_RANGE) {
                                            creep.travelTo(css[0], {maxRooms: 1});
                                        }
                                    }
                                }
                                else {
                                    if (creep.room.controller.level < 2) {
                                        if (needE) {
                                            getE.run(creep);
                                        }
                                        else {
                                            if (creep.upgradeController(creep.room.controller)==ERR_NOT_IN_RANGE) {
                                                creep.moveTo(creep.room.controller);
                                            }
                                        }
                                    }
                                    else {
                                        let rpts = creep.room.find(FIND_MY_STRUCTURES, {filter:c=>(c.structureType==STRUCTURE_RAMPART && c.hits<3000 && c.hits<c.hitsMax) || (c.structureType==STRUCTURE_CONTAINER && c.hits<225000)});
                                        if (rpts.length>0) {
                                            if (needE) {
                                                getE.run(creep);
                                            }
                                            else {
                                                if (creep.repair(rpts[0])==ERR_NOT_IN_RANGE) {
                                                    creep.moveTo(rpts[0]);
                                                }
                                            }
                                        }
                                        else {
                                            if (creep.room.energyAvailable<creep.room.energyCapacityAvailable || creep.room.find(FIND_MY_STRUCTURES, {filter: t=>t.structureType==STRUCTURE_TOWER&&t.store.energy<500}).length>0) {
                                                roleHarvester.run(creep);
                                            }
                                            else {
                                                if (needE) {
                                                    getE.run(creep);
                                                }
                                                else {
                                                    if (ifConstructionSiteInRoom(creep.room) || (creep.room.controller == undefined) || (creep.room.controller.level < 1)) { // if there is still construction sites (globally, which is bad, need change)
                                                        roleBuilder.run(creep);
                                                        //actionHarvestE.run(creep);
                                                    }
                                                    else {
                                                        roleUpgrader.run(creep);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        else {
                            creep.travelTo(creep.room.find(FIND_STRUCTURES, { filter: s => s.structureType == STRUCTURE_SPAWN })[0]);
                        }
                    }
                }
            }
        }
    }
};

/*if ((creep.room.name == creep.memory.home) && (creep.carry.energy < creep.carryCapacity)){ // if just borned, take some energy
  var structure = creep.room.storage;
  if (creep.withdraw(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      creep.travelTo(structure);
  }
}
else */
