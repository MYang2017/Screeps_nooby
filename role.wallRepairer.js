var roleBuilder = require('role.builder');

module.exports = {
    run: function(creep) {
        creep.say('wall...');
        if (creep.memory.working == true && creep.carry.energy == 0) {
            creep.memory.working = false;
        }
        else if (creep.memory.working == false && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
        }

        if (creep.memory.working == true) {
            var target = Game.getObjectById(Game.rooms[creep.room.name].memory.toBuild);
            if (runEveryTicks(500) == true) {
                Game.rooms[creep.room.name].memory.toBuild = whichWallToBuild(creep.room).id;
            }
            if (target != undefined) {
                //console.log(creep.room.name,target);
                if (creep.repair(target) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target);
                        //creep.repair(target)
                    }
            }
            else {
                roleBuilder.run(creep);
            }

        }
        else {
          var [resourceID, ifDropped] = evaluateEnergyResources(creep, true, true, true, true); // find energy functoin in myFunctoins
          if (resourceID != undefined) {
            energy = Game.getObjectById(resourceID);
            if (ifDropped) { // if energy is dropped
              if (creep.pickup(energy) == ERR_NOT_IN_RANGE) {
                  creep.moveTo(energy);
              }
            }
            else { // energy is from container, storage or link
              if (creep.withdraw(energy, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                  creep.moveTo(energy);
              }
            }
          }
        }
    }
};
