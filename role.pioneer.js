var roleBuilder = require('role.builder');
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
<<<<<<< HEAD
        
        if (creep.hits < 0.818 * creep.hitsMax && creep.room.name != creep.memory.home) { // go back home to heal when injured
            creep.moveTo(new RoomPosition(25, 25, creep.memory.home));
            return
        }
        
        const avoidRadius = 6;
        if ((creep.pos.findInRange(FIND_HOSTILE_CREEPS, avoidRadius, {filter: c=> !allyList().includes(c.owner.username) }).length > 0)) { // self destroy if not useful damages by NPC
            actionRunAway.run(creep);
        }
        
        if (false) { //(creep.hits < creep.hitsMax) {
            creep.travelTo(new RoomPosition(25, 25, creep.memory.home));
        }
        else {
            if (creep.memory.loaded == undefined && creep.getActiveBodyparts(WORK)<22) {
                creep.moveTo(creep.room.storage);
                if (creep.withdraw(creep.room.storage, 'energy') == OK) {
                    creep.memory.loaded = true;
                }
            }
            else {
                if (creep.room.name != creep.memory.target) { // if not in target room yet
                    if (creep.memory.route) { // if there is a stored intermediate route, follow the route
                        let route = creep.memory.route;
                        if (creep.memory.intermediate == undefined) {
                            creep.memory.intermediate = route[creep.room.name];
                        }
                        else if (creep.room.name != creep.memory.intermediate) {
                            creep.travelTo(new RoomPosition(25, 25, creep.memory.intermediate));
                        }
                        else if ((creep.room.name == creep.memory.intermediate)) {
                            creep.memory.intermediate = route[creep.room.name];
                        }
                    }
                    else { // if there is not a stored route, do normal
                        storedTravelFromAtoB(creep, 'l');
                        return
                        if (creep.memory.target == 'E22S11') {
                            let dests = creep.memory.dests;
                            if (dests != undefined) {
                                for (let did in dests) {
                                    let dest = dests[did];
                                    if (dest.completed == undefined) {
                                        creep.travelTo(new RoomPosition(dest.x, dest.y, dest.roomName));
                                        if (creep.pos.x == dest.x && creep.pos.y==dest.y && creep.room.name == dest.roomName) {
                                            creep.memory.dests[did].completed = true;
                                        }
                                        return
                                    }
                                }
                                
                            }
                            else {
                                creep.memory.dests = [{x:48 ,y: 22, roomName: 'E16S20'}, {x: 26, y: 32, roomName: 'E20S10'}];
                            }
                        }
                        if (creep.memory.target == 'E23S27') {
                            let dests = creep.memory.dests;
                            if (dests != undefined) {
                                for (let did in dests) {
                                    let dest = dests[did];
                                    if (dest.completed == undefined) {
                                        creep.travelTo(new RoomPosition(dest.x, dest.y, dest.roomName));
                                        if (creep.pos.x == dest.x && creep.pos.y==dest.y && creep.room.name == dest.roomName) {
                                            creep.memory.dests[did].completed = true;
                                        }
                                        return
                                    }
                                }
                                
                            }
                            else {
                                creep.memory.dests = [{x:25 ,y: 44, roomName: 'E20S27'}];
                            }
                        }
                        if (creep.memory.target == 'E24S27') {
                            let dests = creep.memory.dests;
                            if (dests != undefined) {
                                for (let did in dests) {
                                    let dest = dests[did];
                                    if (dest.completed == undefined) {
                                        creep.travelTo(new RoomPosition(dest.x, dest.y, dest.roomName));
                                        if (creep.pos.x == dest.x && creep.pos.y==dest.y && creep.room.name == dest.roomName) {
                                            creep.memory.dests[did].completed = true;
                                        }
                                        return
                                    }
                                }
                                
                            }
                            else {
                                creep.memory.dests = [{x:25 ,y: 44, roomName: 'E20S27'},{x:25 ,y: 25, roomName: 'E23S27'},{x:25 ,y: 25, roomName: 'E25S29'}];
                            }
                        }
                        if (creep.memory.target == 'E19S19') {
                            let dests = creep.memory.dests;
                            if (dests != undefined) {
                                for (let did in dests) {
                                    let dest = dests[did];
                                    if (dest.completed == undefined) {
                                        creep.travelTo(new RoomPosition(dest.x, dest.y, dest.roomName));
                                        if (creep.pos.x == dest.x && creep.pos.y==dest.y && creep.room.name == dest.roomName) {
                                            creep.memory.dests[did].completed = true;
                                        }
                                        return
                                    }
                                }
                                
                            }
                            else {
                                creep.memory.dests = [{x:48 ,y: 22, roomName: 'E16S20'}];
=======
        if ((creep.pos.findInRange(FIND_HOSTILE_CREEPS, 3, {filter: c=> (c.getActiveBodyparts(ATTACK)+c.getActiveBodyparts(RANGED_ATTACK)>0)}).length > 0)) { // self destroy if not useful damages by NPC
            actionRunAway.run(creep);
        }
        else {
            if (creep.hits < creep.hitsMax) {
                creep.travelTo(new RoomPosition(25, 25, creep.memory.home));
            }
            else {
                if (false) {// (creep.pos.findInRange(FIND_HOSTILE_CREEPS, 3).length > 0) { // self destroy if not useful damages by NPC
                    actionRunAway.run(creep)
                }
                else {
                    if (creep.room.name != creep.memory.target) { // if not in target room yet
                        if (creep.memory.route) { // if there is a stored intermediate route, follow the route
                            let route = creep.memory.route;
                            if (creep.memory.intermediate == undefined) {
                                creep.memory.intermediate = route[creep.room.name];
                            }
                            else if (creep.room.name != creep.memory.intermediate) {
                                creep.travelTo(new RoomPosition(25, 25, creep.memory.intermediate));
                            }
                            else if ((creep.room.name == creep.memory.intermediate)) {
                                creep.memory.intermediate = route[creep.room.name];
                            }
                        }
                        else { // if there is not a stored route, do normal
                            if (creep.memory.workingPos) { // if stored target position
                                creep.travelTo(new RoomPosition(creep.memory.workingPos.x, creep.memory.workingPos.y, creep.memory.target));
                            }
                            else {
                                creep.travelTo(new RoomPosition(25, 25, creep.memory.target));
>>>>>>> master
                            }
                        }
                        
                        let route = Game.map.findRoute(creep.room, creep.memory.target, {
                            routeCallback(roomName, fromRoomName) {
                                if (roomName == 'E10S21' || roomName == 'E10S23') {    // avoid this room
                                    return 20;
                                }
                                if (roomName == 'E10S22' || roomName == 'E11S22' || roomName == 'E12S22') {    // favour this room
                                    return 0.5;
                                }
                                return 10;
                            }}
                        );
                        if (route.length > 0) {
                            let exit = new RoomPosition(25, 25, route[0].room);
                            creep.travelTo(exit, {maxRooms: 1});
                        }
                    }
                }
                else { // if in target room
                    
                    if (creep.memory.working == true && creep.carry.energy == 0) {
                        creep.memory.working = false;
                    }
                    else if (creep.memory.working == false && creep.carry.energy == creep.carryCapacity) {
                        creep.memory.working = true;
                    }
                    
                    if (creep.room.controller==undefined) { // middle rooms
                        roleBuilder.run(creep)
                    }
<<<<<<< HEAD
                    else {
                        if (creep.room.name!=creep.memory.home) {
                            creep.memory.home = creep.memory.target;
                        }
                        //console.log(!ifWaitForRenew(creep))
                        let needE = !creep.memory.working;
=======
                    else { // if in target room
                        //console.log(!ifWaitForRenew(creep))
>>>>>>> master
                        if (!ifWaitForRenew(creep)) {
                            if (creep.memory.role == 'longDistanceHarvester' && creep.memory.working == true) {
                                creep.travelTo(new RoomPosition(25, 25, creep.memory.home));
                            }
                            else {
<<<<<<< HEAD
                                if (creep.getActiveBodyparts(WORK) > 20) {
                                    creep.memory.working = false;
                                    creep.memory.role = 'superUpgrader';
                                }
                                
                                let css = creep.room.find(FIND_CONSTRUCTION_SITES, {filter:c=>c.structureType==STRUCTURE_RAMPART});
                                if (css && css.length>0) {
                                    if (needE) {
                                        getE.run(creep);
                                    }
                                    else {
                                        if (creep.build(css[0])==ERR_NOT_IN_RANGE) {
                                            creep.moveTo(css[0]);
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
                                        let rpts = creep.room.find(FIND_MY_STRUCTURES, {filter:c=>(c.structureType==STRUCTURE_RAMPART && c.hits<3000) || (c.structureType==STRUCTURE_CONTAINER && c.hits<225000)});
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
                                            if (creep.room.energyAvailable<creep.room.energyCapacityAvailable) {
                                                roleHarvester.run(creep);
                                            }
                                            else if (ifConstructionSiteInRoom(creep.room) || (creep.room.controller == undefined) || (creep.room.controller.level < 1)) { // if there is still construction sites (globally, which is bad, need change)
                                                roleBuilder.run(creep);
                                                //actionHarvestE.run(creep);
                                            }
                                            else {
                                                roleUpgrader.run(creep);
                                            }
                                        }
                                    }
=======
                                if (creep.room.energyCapacity<creep.room.energyCapacityAvailable) {
                                    roleHarvester.run(creep);
                                }
                                else if (ifConstructionSiteInRoom(creep.room) || (creep.room.controller == undefined) || (creep.room.controller.level < 1)) { // if there is still construction sites (globally, which is bad, need change)
                                    roleBuilder.run(creep);
                                    //actionHarvestE.run(creep);
                                }
                                else {
                                    roleUpgrader.run(creep);
>>>>>>> master
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
