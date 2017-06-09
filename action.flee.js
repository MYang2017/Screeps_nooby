module.exports = {
    run: function(creep) {
      var enemies = creep.room.find(FIND_HOSTILE_CREEPS);
      if (enemies.length > 0) {
        // run away from hostile
        var range = 6; // range to start dodging
        var nearCreeps = creep.pos.findInRange(FIND_HOSTILE_CREEPS, range-1, {filter: i => i.getActiveBodyparts(ATTACK) > 0 || i.getActiveBodyparts(RANGED_ATTACK) > 0});
        if(nearCreeps.length > 0) {
          var ret = PathFinder.search(creep.pos, _.map(nearCreeps, i => ({pos: i.pos, range: range})), { maxRooms: 1, flee: true, roomCallback(roomName) {
            if(!Game.rooms[roomName] || Game.rooms[roomName].time < Game.time) {
              Game.rooms[roomName] = {
                costMatrix: Game.rooms.createCostMatrix(roomName),
                time: Game.time
              };
            }
            return Game.rooms[roomName].costMatrix;
          }});
          if(ret.path.length) {
            creep.travelTo(ret.path[0]);
            creep.say('flee');
            return true;
          }
        }
      }
  }
};
