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
                    
                    let route = creep.memory.route;
                    if (route) {
                        if (creep.room.name!=creep.memory.target) {
                            let emi = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 5, {filter: c=>c.owner.username=='Source Keeper'});
                            if (emi.length>0) {
                                creep.memory._trav = undefined;
                            }
                            
                            emi = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 3, {filter: c=>c.owner.username=='Source Keeper'});
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
                                    creep.travelTo(25, 25, {range: 23, maxRooms: 1, offRoad: true, ignoreRoads: true, ignoreSwamp: true});
                                }
                            }
                        }
                        else {
                            let parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(creep.memory.target);
                            let isMid = (parsed[1] % 10 === 5) && 
                                            (parsed[2] % 5 === 0);
                            if (isMid) {
                                
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