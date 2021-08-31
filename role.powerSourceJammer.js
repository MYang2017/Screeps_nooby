let doge = require('action.flee');

module.exports = {
    run: function(creep) {
            //creep.travelTo(new RoomPosition(25,25,creep.memory.target),{range:5});
            if (creep.room.name == creep.memory.target) { // if in target room
                let tar = Game.getObjectById(creep.memory.sId);
                if (tar == undefined) { // no pb
                    tar = creep.room.find(FIND_RUINS, {filter:t=>t.store.power>0});
                    if (tar.length>0) {
                        tar = tar[0];
                    }
                    else {
                        tar = creep.room.find(FIND_DROPPED_RESOURCES, {filter:d=>d.resourceType=='power'});
                        if (tar.length>0) {
                            tar = tar[0];
                        }
                        else {
                            tar = creep.room.find(FIND_TOMBSTONES, {filter:t=>t.store.power>0});
                            if (tar.length>0) {
                                tar = tar[0];
                            }
                            else {
                                creep.suicide();
                            }
                        }
                    }
                }
                
                if (creep.pos.getRangeTo(tar)<2) {
                    let toshifts = creep.pos.findInRange(FIND_MY_CREEPS, 1, {filter: c=>(c.memory.role=='powerSourceLorry'&&((c.store.power>0&&c.pos.getRangeTo(tar)==1)||(c.store.power==0&&c.pos.getRangeTo(tar)>=1)))||c.memory.role=='powerSourceAttacker'});
                    if (toshifts.length>0) {
                        for (let toshift of toshifts) {
                            creep.moveTo(toshift);
                        }
                        return
                    }
                }
                else if (creep.pos.getRangeTo(tar)==2) {
                    let toshifts = creep.pos.findInRange(FIND_MY_CREEPS, 1, {filter: c=>(c.memory.role=='powerSourceLorry'&&((c.store.power>0&&c.pos.getRangeTo(tar)==1)||(c.store.power==0&&c.pos.getRangeTo(tar)>=2)))||c.memory.role=='powerSourceAttacker'});
                    if (toshifts.length>0) {
                        for (let toshift of toshifts) {
                            creep.moveTo(toshift);
                        }
                        return
                    }
                }
                else if (creep.pos.getRangeTo(tar)==3) {
                    let toshifts = creep.pos.findInRange(FIND_MY_CREEPS, 1, {filter: c=>(c.memory.role=='powerSourceLorry'&&((c.store.power>0&&c.pos.getRangeTo(tar)==2)||(c.store.power==0&&c.pos.getRangeTo(tar)>=3)))||c.memory.role=='powerSourceAttacker'});
                    if (toshifts.length>0) {
                        for (let toshift of toshifts) {
                            creep.moveTo(toshift);
                        }
                        return
                    }
                }
                else if (creep.pos.getRangeTo(tar)==4) {
                    let toshifts = creep.pos.findInRange(FIND_MY_CREEPS, 1, {filter: c=>(c.memory.role=='powerSourceLorry'&&((c.store.power>0&&c.pos.getRangeTo(tar)==3)||(c.store.power==0&&c.pos.getRangeTo(tar)>=4)))||c.memory.role=='powerSourceAttacker'});
                    if (toshifts.length>0) {
                        for (let toshift of toshifts) {
                            creep.moveTo(toshift);
                        }
                        return
                    }
                }
                
                let disttotar = creep.pos.getRangeTo(tar);
                if (disttotar==1) {
                    
                }
                else {
                    let dis1spot = returnCreepStandableSpotAroundAPoint(tar.pos);
                    if (dis1spot) {
                        if (disttotar>1) {
                            creep.moveTo(new RoomPosition(dis1spot[0], dis1spot[1], creep.room.name), {maxRooms: 1});
                        }
                    }
                    else {
                        if (disttotar==2) {
                            
                        }
                        else {
                            let dis2spot = returnCreepStandableSpotAroundAPoint(tar.pos, 2);
                            if (dis2spot) {
                                if (creep.pos.getRangeTo(dis2spot[0], dis2spot[1])>0) {
                                    creep.moveTo(new RoomPosition(dis2spot[0], dis2spot[1], creep.room.name), {maxRooms: 1});
                                }
                                else {
                                    
                                }
                            }
                        }
                    }
                }
            }
            else { // go to target room
                // move to target
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
                return
            }
    }
};
