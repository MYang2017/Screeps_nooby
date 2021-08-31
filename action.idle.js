module.exports = {
    run: function(creep) {
        let thingUnderFeet = creep.room.lookForAt(LOOK_STRUCTURES, creep)[0];
        if (thingUnderFeet && thingUnderFeet.structureType && thingUnderFeet.structureType == STRUCTURE_ROAD) {
            var range = 2; // range to start dodging
            var nearCreeps = creep.pos.findInRange(FIND_MY_CREEPS, range-1, {filter:s=> s.name != creep.name});
            var nearPc = creep.pos.findInRange(FIND_MY_POWER_CREEPS, range-1, {filter:s=> s.name != creep.name});
            nearCreeps = nearCreeps.concat(nearPc);
            if(nearCreeps.length > 0) {
                creep.move(getRandomInt(1,8));
                return
              var ret = PathFinder.search(creep.pos, _.map(nearCreeps, i => ({pos: i.pos, range: range})), { maxRooms: 1, flee: true, roomCallback(roomName) {
                if(!Game.rooms[roomName] || Game.rooms[roomName].time < Game.time) {
                  Game.rooms[roomName] = {
                      costMatrix: Game.rooms.createCostMatrix(roomName),
                      time: Game.time,
                  };
                }
                return Game.rooms[roomName].costMatrix;
              }});
              if(ret.path.length) {
                creep.moveTo(ret.path[0]);
                creep.say('avoid');
                return true;
              }
            }
        }
        else { // avoid blocking middle dickheads
            if (creep.room.controller && creep.room.controller.my) {
                if (creep.pos.findInRange(FIND_MY_STRUCTURES, 2, {filter: t=>t.structureType==STRUCTURE_TOWER && t.pos.findInRange(FIND_MY_STRUCTURES, 2, {filter: p=>p.structureType==STRUCTURE_SPAWN}).length>0}).length>0) {
                    creep.move(getRandomInt(1,8));
                    return
                }
            }
        }
  }
};
