module.exports = {
    run: function(creep) {
        var range = 2; // range to start dodging
        var nearCreeps = creep.pos.findInRange(FIND_MY_CREEPS, range-1, {filter:s=> s.name != creep.name});
        if(nearCreeps.length > 0) {
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
};
