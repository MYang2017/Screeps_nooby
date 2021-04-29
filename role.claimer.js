var selfRecycling = require('action.selfRecycle');
require('funcExpand');

module.exports = {
    run: function (creep) {
        if (creep.memory.home == undefined) {
            creep.memory.home = creep.room.name;
        }

        if (false) { //(creep.memory.prepareToDie && creep.memory.prepareToDie == true) {
            selfRecycling.run(creep);
            //console.log(creep.room.name)
            let baseFlag = Game.flags['base' + creep.memory.target];
            if (baseFlag) {
                Game.rooms[creep.memory.target].createConstructionSite(baseFlag.pos.x, baseFlag.pos.y, STRUCTURE_SPAWN, 'Spawn_' + creep.memory.target + '_1')
            }
            else {
                console.log('Please set spawn position for room: ' + creep.memory.target + ' (depricated code in claimer)');
            }
        }
        else {
            if (creep.room.name == creep.memory.target) { // if in target room
                // log room info
                if (!creep.memory.logged) {
                    logGrandeRoomInfo(creep.room);
                    creep.memory.logged = true;
                }
                if (creep.room.controller.my) {

                    creep.memory.prepareToDie = true;
                }
                else {
                    if (creep.room.controller && creep.room.controller.owner && creep.room.controller.owner.username != 'PythonBeatJava') {
                        if (creep.attackController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                            creep.travelTo(creep.room.controller, { maxRooms: 1 });
                        }
                        creep.signController(creep.room.controller, '💕 Friendship comes in both ways, if you treat me well, I will treat you twice as better  ----- Shuren Zhou 💕 ');
                    }
                    else {
                        if (creep.claimController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                            creep.travelTo(creep.room.controller, { maxRooms: 1 });
                        }
                        creep.signController(creep.room.controller, '💕 Your friendly neighbour open for collaboration, whisper me to add to white list 💕 ');
                    }
                }
            }
            else { // go to target room
                storedTravelFromAtoB(creep, 'l');
                return
                let flag = creep.room.find(FIND_FLAGS);

                if (flag.length > 0) {
                    tar = flag[0].pos;
                    creep.travelTo(tar, { maxRooms: 1 });
                }
                else {
                    let route = Game.map.findRoute(creep.room, creep.memory.target, {
                        routeCallback(roomName, fromRoomName) {
                            if (roomName == 'E11S22' || roomName == 'E11S23') {    // avoid this room
                                return Infinity;
                            }
                            let parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
                            let isHighway = (parsed[1] % 10 === 0) ||
                                (parsed[2] % 10 === 0);
                            let isMyRoom = Game.rooms[roomName] &&
                                Game.rooms[roomName].controller &&
                                Game.rooms[roomName].controller.my;
                            if (isHighway || isMyRoom) {
                                return 1;
                            } else {
                                return 2.5;
                            }
                        }
                    }
                    );
                    if (route.length > 0) {
                        let exit = creep.pos.findClosestByRange(route[0].exit);
                        creep.travelTo(exit, { maxRooms: 1 });
                    }
                }
            }
        }
    }
};
