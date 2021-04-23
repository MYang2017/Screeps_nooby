var actionRunAway = require('action.flee');
var actionRecycle = require('action.recycle');

module.exports = {
    run: function(creep) {
          if (Game.cpu.bucket>1000) {
              
              /// stupid wipe ass
              if ((_.sum(creep.store)>0||creep.memory.recycle==true) && creep.room.name.slice(3,6)=='S20' && isInSameSector(creep.room.name, 'E19S21')) {
                  if (creep.pos.y<23) {
                      creep.memory.home='E19S19';
                  }
                  else if (creep.pos.y>27) {
                      creep.memory.home='E19S21';
                  }
              }
              
          var ret = function(creeppos, goals) { 
              return PathFinder.search(
            creeppos, goals, 
            {
              // We need to set the defaults costs higher so that we
              // can set the road cost lower in `roomCallback`
              plainCost: 2,
              swampCost: 10,
                visualizePathStyle: undefined, 
              roomCallback: function(roomName) {
        
                let room = Game.rooms[roomName];
                // In this example `room` will always exist, but since 
                // PathFinder supports searches which span multiple rooms 
                // you should be careful!
                if (!room) return;
                let costs = new PathFinder.CostMatrix;
        
                room.find(FIND_STRUCTURES).forEach(function(struct) {
                  if (struct.structureType === STRUCTURE_ROAD) {
                    // Favor roads over plain tiles
                    costs.set(struct.pos.x, struct.pos.y, 1);
                  } else if (struct.structureType !== STRUCTURE_CONTAINER &&
                             (struct.structureType !== STRUCTURE_RAMPART ||
                              !struct.my)) {
                    // Can't walk through non-walkable buildings
                    costs.set(struct.pos.x, struct.pos.y, 0xff);
                  }
                });
        
                // Avoid creeps in the room
                room.find(FIND_CREEPS).forEach(function(creep) {
                  costs.set(creep.pos.x, creep.pos.y, 0xff);
                });
        
                return costs;
              },
            }
          );
          }
        
        let avoidRadius = 3;
        let target = creep.memory.target;
        let home = creep.memory.home;
        let tar = Game.getObjectById(creep.memory.sybId);
        
        if (creep.memory.currentRn == undefined) {
            creep.memory.currentRn = creep.room.name;
        }
        else {
            if (creep.memory.currentRn != creep.room.name) {
                creep.memory.foundRoute = undefined;
                creep.memory.currentRn == creep.room.name;
            }
        }
        
        if (creep.memory.working == true && _.sum(creep.store) == 0 && (creep.memory.recycle==undefined)) {
            creep.memory.working = false;
        }
        else if (creep.memory.working == false && _.sum(creep.store) > 0) {
            creep.memory.working = true;
        }
        
        if (creep.ticksToLive<750 && creep.memory.picked == undefined) {
            creep.memory.target = home;
            creep.memory.recycle = true;
            creep.memory.working = true;
        }
        
        let keeperLair = creep.pos.findInRange(FIND_STRUCTURES, avoidRadius, { filter: c => c.structureType == STRUCTURE_KEEPER_LAIR && c.ticksToSpawn < 3 });
        //if ((Game.rooms[creep.memory.target]==undefined)||(Game.rooms[creep.memory.target].memory.ifPeace == false)) { // room under attack, run away
        if ((creep.pos.findInRange(FIND_HOSTILE_CREEPS, avoidRadius, {filter: c=>(c.owner.username == 'Source Keeper' || c.owner.username == 'Invader')}).length > 0) || keeperLair && (keeperLair.length > 0)) { // self destroy if not useful damages by NPC
            actionRunAway.run(creep);
        }
        else {
            if (creep.memory.working == true) { // full, go home
                let flag = creep.room.find(FIND_FLAGS);
                if (flag.length>0 && (creep.room.name == 'E16S20' || creep.room.name == 'E17S20') ) { // follow flag 
                    let tar = flag[0].pos;
                    if (creep.room.name==home) {
                        creep.travelTo(exit, {maxRooms: 1});
                    }
                    else {
                        creep.travelTo(tar, {maxRooms: 1, ignoreCreeps: false});
                    }
                }
                else {
                    if (creep.room.name != home) {
                        const route = Game.map.findRoute(creep.room, home, {
                            maxOps: 100,
                            routeCallback(roomName, fromRoomName) {
                                if (Memory.rooms[roomName] && Memory.rooms[roomName].avoid == true) {
                                    return Infinity;
                                }
                                if (roomName == 'E15S24') {
                                    return Infinity
                                }
                                return 1;
                            }}
                        );
                        let next = route[0];
                        if(route.length > 0) {
                            let exit = new RoomPosition(25, 25, route[0].room);
                            creep.travelTo(exit, {maxRooms: 1, ignoreCreeps: false}); // , obstacles: ['constructedWall'] signoreStructures: true, 
                        }
                        else { // not valid, generate another room target
                            // back to home mover
                        }
                    }
                    else {
                        if (_.sum(creep.store) == 0 && creep.memory.recycle) {
                            actionRecycle.run(creep);
                            return
                        }
                        else {
                            var structure = creep.room.storage;
                            for (let resType in creep.store) {
                                if (creep.transfer(structure, resType) == ERR_NOT_IN_RANGE) {
                                    creep.travelTo(structure);
                                }
                            }
                        }
                    }
                }
            }
            else { // empty and going to symb
                if (Memory.storedSymbols[creep.memory.sybId] == undefined) {
                    creep.memory.target = home;
                    creep.memory.recycle = true;
                    creep.memory.working = true;
                }
                if (creep.room.name != target) {
                    if (creep.memory.foundRoute == undefined) {
                        creep.memory.foundRoute = {};
                    }
                    let route = creep.memory.foundRoute[creep.room.name+target];
                    if (route && route!=-2) {
                        let next = route[0];
                        if (route.length > 0) {
                            if (creep.room.name==home || (home=='E19S21')) {
                                creep.travelTo(new RoomPosition(25, 25, route[0].room), {maxRooms: 1});
                            }
                            else {
                                creep.travelTo(new RoomPosition(25, 25, route[0].room), {maxRooms: 1, ignoreCreeps: false});
                            }
                        }
                    }
                    else {
                        let route = Game.map.findRoute(creep.room, target, {
                            maxOps: 100,
                            routeCallback(roomName, fromRoomName) {
                                if (Memory.rooms[roomName] && Memory.rooms[roomName].avoid == true) {
                                    return Infinity;
                                }
                                if (roomName == 'E15S24' && creep.memory.target!='E15S24') {
                                    return Infinity
                                }
                                return 1;
                            }}
                        );
                        let next = route[0];
                        if(route.length > 0) {
                            let exit = new RoomPosition(25, 25, route[0].room);
                            if (creep.room.name==home) {
                                creep.travelTo(exit, {maxRooms: 1});
                            }
                            else {
                                creep.travelTo(exit, {maxRooms: 1, ignoreCreeps: false});
                            }
                        }
                        creep.memory.foundRoute[creep.room.name+target] = route;
                    }
                }
                else {
                    if (tar == undefined) { // at target room and target not there
                        Memory.storedSymbols[creep.memory.sybId] = undefined;
                        creep.memory.target = home;
                        creep.memory.recycle = true;
                        creep.memory.working = true;
                        
                        if (_.sum(creep.store) == 0 && creep.memory.recycle) {
                            actionRecycle.run(creep);
                            return
                        }
                        else {
                            var structure = creep.room.storage;
                            for (let resType in creep.store) {
                                if (creep.transfer(structure, resType) == ERR_NOT_IN_RANGE) {
                                    creep.travelTo(structure);
                                }
                            }
                        }
                    }
                    else { // symbol ctn still there
                        // if not reachable recycle
                        if (false) { // (creep.memory.analyzed == undefined) {
                            let ifconnected = ret(creep.pos, { pos: tar.pos, range: 1 });
                            fo(ifconnected.incomplete)
                        }
                        else {
                            for (let resType in tar.store) {
                                let pickRes = creep.withdraw(tar, resType);
                                if (pickRes== ERR_NOT_IN_RANGE) {
                                    ret = creep.travelTo(tar, {maxRooms: 1, ignoreCreeps: false});
                                }
                                else if (pickRes == OK) {
                                    creep.memory.picked = true;
                                }
                            }
                        }
                    }
                }
            }
        }
          }
    }
};
