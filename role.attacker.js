var actionRunAway = require('action.flee');
let doge = require('action.idle');

module.exports = {
    run: function(creep) {
        creep.say('😨', true);
        
        let inR = creep.room;
        
        // if bigger than me in range, flee
        // if flag position, go flag
        // if cs no protected and has progress larger than 1000, go stomp

        if (inR.name==creep.memory.target) {
            let tar = creep.room.find(FIND_FLAGS);
            
            if (tar.length>0) {
                tar = tar[0]
            }
            else {
                tar = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter:c=>c.getActiveBodyparts(RANGED_ATTACK)+c.getActiveBodyparts(ATTACK)+c.getActiveBodyparts(HEAL)>0});
                if (tar.length>0) {
                    tar = tar[0]
                }
                else {
                    tar = Game.rooms[inR.name].find(FIND_HOSTILE_STRUCTURES, {filter:s=>s.structureType==STRUCTURE_SPAWN})[0];
                }
            }
            if (tar) {
                if (creep.pos.getRangeTo(tar)<3) {
                    actionRunAway.run(creep);
                }
                else {
                    creep.moveTo(tar);
                }
            }
            else {
                doge.run(creep);
            }
            
            if (creep.getActiveBodyparts(HEAL)>0) {
                creep.heal(creep);
            }
            if (creep.getActiveBodyparts(RANGED_ATTACK)>0) {
                creep.rangedAttack(tar);
            }
            if (creep.getActiveBodyparts(ATTACK)>0) {
                creep.attack(tar);
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
                creep.travelTo(new RoomPosition(25, 25, route[0].room), { maxRooms: 1 });
            }
        }
    }
};
