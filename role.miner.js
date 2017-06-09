var actionRunAway = require('action.flee');

module.exports = {
    run: function(creep) {
      //if ((Game.rooms[creep.memory.target]==undefined)||(Game.rooms[creep.memory.target].memory.ifPeace == false)) { // room under attack, run away
        if (creep.pos.findInRange(FIND_HOSTILE_CREEPS, 5).length > 0) { // self destroy if not useful damages by NPC
            actionRunAway.run(creep)
        }
        else if (creep.memory.target == undefined || creep.room.name == creep.memory.target) {// if in target room or main room
          let source = Game.getObjectById(creep.memory.sourceID);
          let container = source.pos.findInRange(FIND_STRUCTURES, 1, { filter: s => s.structureType == STRUCTURE_CONTAINER})[0];

          if (creep.memory.link) { // if link mining
              let link = source.pos.findInRange(FIND_STRUCTURES, 2, { filter: s => s.structureType == STRUCTURE_LINK})[0];
              if (container) { // if there is a container
                  if (creep.pos.isEqualTo(container)) { // if creep on container, harvest source and transfer to link
                      creep.harvest(source);
                      //creep.travelTo(link);
                      creep.transfer(link, RESOURCE_ENERGY);
                  }
                  else { // go to container
                      creep.travelTo(container);
                  }
              }
              else { // pure link mining without container
                  let placeToStand = overlappedTiles(creep,source.pos,link.pos);
                  let x = placeToStand.x;
                  let y = placeToStand.y;
                  if (creep.pos.isEqualTo(x, y)) { // if not in range, move to source
                      creep.harvest(source);
                      //creep.travelTo(link);
                      creep.transfer(link, RESOURCE_ENERGY);
                  }
                  else {
                      creep.travelTo(new RoomPosition(x, y, creep.room.name));
                  }
              }
          }
          else { // container mining
              if (container == undefined) { // drop mining
                  if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                      creep.travelTo(source);
                  }
                  let containerSite = source.pos.findInRange(FIND_CONSTRUCTION_SITES, 1)[0];
                  if ((creep.carry.energy > 0) && (containerSite)) {
                      creep.build(containerSite);
                  }
              }

              if (creep.pos.isEqualTo(container)) {
                  creep.harvest(source)
                  if ((creep.carry.energy > 0) && ((container.hits<0.95*container.hitsMax))) {
                      creep.repair(container);
                  }
              }
              else {
                  creep.travelTo(container);

                  // calculate time travelling there for pre-spawn miners
                  /*var ticksThere = creep.ticksToLive;
                  if (creep.memory.target == undefined) {
                    var targetRoomName = creep.room.name;
                  }
                  else {
                    var targetRoomName = creep.memory.target;
                  }
                  if (Game.rooms[targetRoomName].memory.sourceTravelTime == undefined) {
                    Game.rooms[targetRoomName].memory.sourceTravelTime = {};
                  }
                  else if (Game.rooms[targetRoomName].memory.sourceTravelTime[creep.memory.sourceID] == undefined) {
                    Game.rooms[targetRoomName].memory.sourceTravelTime[creep.memory.sourceID] = ticksThere;
                  }
                  else {
                    Game.rooms[targetRoomName].memory.sourceTravelTime[creep.memory.sourceID] = Math.min(Game.rooms[targetRoomName].memory.sourceTravelTime[creep.memory.sourceID],ticksThere)
                  }*/
            }
          }
        }
        else { // go to target room
            //var exit = creep.room.findExitTo(creep.memory.target);
            //creep.travelTo(creep.pos.findClosestByRange(exit));
            creep.travelTo(Game.flags[creep.memory.target].pos);
        }
      }
};
