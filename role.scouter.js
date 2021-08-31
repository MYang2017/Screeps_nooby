var actionRunAway = require('action.flee');
var actionAvoid = require('action.idle');

require('funcExpand');

module.exports = {
    run: function(creep) {
        /*if (creep.room.name == creep.memory.target) { // if in target room
            creep.travelTo(Game.flags[creep.name].pos);
        }
        else { // go to target room
            var exit = creep.room.findExitTo(creep.memory.target);
            creep.travelTo(creep.pos.findClosestByRange(exit));
        }*/
        
        if (Game.cpu.bucket<9000 && Game.time%3!==0) {
            return
        }
        
        if (creep.memory.pList) {
            if (creep.memory.toVisit == undefined || Game.rooms[creep.memory.toVisit]) {
                creep.memory.toVisit = creep.memory.pList[Math.floor(Math.random()*creep.memory.pList.length)];
            }
            
            if (creep.memory.storedRoutes == undefined) {
                creep.memory.storedRoutes = {};
            }
            
            let route = creep.memory.storedRoutes[creep.room.name + creep.memory.toVisit];
            if (route == undefined) {
                route = Game.map.findRoute(creep.room, creep.memory.toVisit, {
                    routeCallback(roomName, fromRoomName) {
                        let parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
                        let isHighway = (parsed[1] % 10 === 0) ||
                            (parsed[2] % 10 === 0);
                        if (isHighway) {
                            return 2;
                        }
                        else if (Memory.rooms[roomName] && Memory.rooms[roomName].avoid) {
                            return 255;
                        }
                        else {
                            return 4;
                        }
                    }
                });
                creep.memory.storedRoutes[creep.room.name + creep.memory.toVisit] = route;
            }
            
            if (route.length > 0) {
                if (route[0] && route[0].room) {
                    creep.travelTo(new RoomPosition(25, 25, route[0].room));
                }
            }
            
            return
        }
        
        if (Game.shard.name == 'shard2' && creep.room.name == 'E30S50') {
            creep.moveTo(18, 22);
            return
        }
        
        if (creep.memory.home == undefined) {
            creep.memory.home = creep.room.name;
        }
        
        /*/
        let flag = creep.room.find(FIND_FLAGS);
        if (flag.length>0 && flag[0].name=='t' ) { // follow flag 
            let tar = flag[0].pos;
            creep.travelTo(tar, {maxRooms: 1, ignoreStructures: true, ignoreCreeps: false});
        }
        else {
        */
            if (creep.memory.attackedAtTime && creep.memory.attackedAtTime+200>Game.time) {
                if (creep.pos.getRangeTo(new RoomPosition(25, 25,creep.memory.home))>20) {
                    creep.moveTo(new RoomPosition(25, 25,creep.memory.home), {range: 19});
                }
                else {
                    actionAvoid.run(creep);
                }
            }
            else {
                    creep.memory.target = creep.name;
                    /*if (Memory.rooms[creep.memory.target]&&Memory.rooms[creep.memory.target].avoid) { // if target has stronghold
                        if (Game.time%5==0) { // avoid
                            actionAvoid.run(creep);
                            return
                        }
                    }*/
                    
                    /*
                    if (ifInsideThisSectorOfWall(creep.name, new RoomPosition(25, 25, 'E5S15'))) {
                        if (creep.room.name!=creep.memory.target) {
                            storedTravelFromAtoB(creep, 'l');
                        }
                        else {
                            creep.moveTo(25, 25, {range: 22, maxRooms: 1});
                            actionAvoid.run(creep);
                        }
                        return
                    }
                    */
                    
                    let route = creep.memory.route;
                    if (route) {
                        if (creep.room.name!=creep.memory.target) {
                            let emi = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 5, { filter: c => (!allyList().includes(c.owner.username)) && (c.getActiveBodyparts(ATTACK) + c.getActiveBodyparts(RANGED_ATTACK) > 0) });
                            if (emi.length>0) {
                                creep.memory._trav = undefined;
                            }
                            
                            emi = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 3, { filter: c => (!allyList().includes(c.owner.username)) && (c.getActiveBodyparts(ATTACK) + c.getActiveBodyparts(RANGED_ATTACK) > 0) });
                            if (emi.length>0) {
                                actionRunAway.run(creep);
                            }
                            else {
                                let curInd = undefined;
                                for (let ind in route) {
                                    if (creep.room.name == route[ind].room) {
                                        curInd = ind;
                                        break;
                                    }
                                    curInd = -1;
                                }
                                let nextRn = route[parseInt(curInd)+parseInt(1)];
                                
                                if (nextRn&&nextRn.room) {
                                    creep.travelTo(new RoomPosition(25, 25, nextRn.room), {maxRooms: 1, offRoad: true, ignoreRoads: true, ignoreSwamp: true});
                                }
                                else {
                                    creep.travelTo(25, 25, {range: 21, maxRooms: 1, offRoad: true, ignoreRoads: true, ignoreSwamp: true});
                                }
                            }
                        }
                        else { // in target, wonder around
                            /*
                            let parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(creep.memory.target);
                            let isMid = (parsed[1] % 10 === 5) && 
                                            (parsed[2] % 5 === 0);
                            if (isMid) {
                                
                            }
                            */
                            
                            if (Game.time % 7 == 0 && Game.map.getRoomLinearDistance(creep.memory.home, creep.memory.target) < 3) {
                                determineIfRoomIsSuitableForRemoteMining(Game.rooms[creep.memory.home], creep.memory.target);
                            }
                            creep.moveTo(25, 25, {range: 22, maxRooms: 1});
                            actionAvoid.run(creep);
                        }
                    }
                    else {
                        creep.memory.route = Game.map.findRoute(creep.room, creep.memory.target, {
                        routeCallback(roomName, fromRoomName) {
                            if(Memory.rooms[roomName]&&Memory.rooms[roomName].avoid && roomName!==creep.memory.target) {    // avoid this room
                                return Infinity;
                            }
                            return 1;
                        }});
                    }
            }
        //}
    }
};