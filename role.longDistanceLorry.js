var rolePickuper = require('role.pickuper');

module.exports = {
    run: function(creep) {
      //console.log(creep.pos,creep.name)
       if ((Game.rooms[creep.memory.target]==undefined)||(Game.rooms[creep.memory.target].memory.ifPeace == false)) { // room under attack, run away
          creep.say('run away');
          //creep.travelTo(Game.flags[creep.memory.target+'_shelter'].pos);
          if (creep.room.name != creep.memory.home) { // if not at home base
              creep.travelTo(Game.flags[creep.memory.home]);
          }
          else if (creep.room.name == creep.memory.home) {
              rolePickuper.run(creep);
          }
       }
       else {
          creep.say('take away');
          if (creep.memory.working == true && creep.carry.energy == 0) {
              creep.memory.toCentre = false;
              creep.memory.working = false;
          }
          else if (creep.memory.working == false && creep.carry.energy == creep.carryCapacity) {
              creep.memory.working = true;
          }

          if (creep.memory.working == true) {
              if (creep.room.name != creep.memory.home) { // if not at home base
                  creep.travelTo(Game.flags['link'+creep.memory.home]);
              }
              else { // creep at home
                if (Game.flags['link'+creep.memory.target] != undefined) { // if there is link delivering
                    if (creep.memory.toCentre == false) {
                          var structure = Game.flags['link'+creep.memory.target].pos.findInRange(FIND_STRUCTURES, 1, {filter: s => s.structureType == STRUCTURE_LINK})[0];
                          if (structure.energy<structure.energyCapacity) { // link is not full
                              var linkSpace = structure.energyCapacity-structure.energy;
                              if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                  creep.travelTo(structure);
                              }
                              /*if ( (structure.energy<structure.energyCapacity)&&(creep.carry.energy<creep.carryCapacity) ) { // link is still not full and creep still has space
                                  var container = Game.flags['link'+creep.memory.target].pos.findInRange(FIND_STRUCTURES, 1, {filter: s => s.structureType == STRUCTURE_CONTAINER})[0];
                                  if (container.store.energy >= linkSpace) {// if container has the energy to fillin the link shortage getActiveBodyparts
                                    if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                        creep.travelTo(container);
                                    }
                                    if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                        creep.travelTo(structure);
                                    }
                                  }
                              }*/
                          }
                          else { // link is full
                              // find the resevoir container
                              structure = Game.flags['link'+creep.memory.target].pos.findInRange(FIND_STRUCTURES, 1, {filter: s => s.structureType == STRUCTURE_CONTAINER})[0];
                              if (structure == undefined) { // if container undefined
                                  structure = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: (s) => ( (s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION) && s.energy < s.energyCapacity) })
                                  if (structure == undefined) { // cannot find spawn or extensions or tower or they are full, find the storage
                                      structure = creep.room.storage;
                                  }
                                  if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                      creep.travelTo(structure);
                                  }
                              }
                              else if (structure.store[RESOURCE_ENERGY]<structure.storeCapacity) { // resevoir container is not full
                                  if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                      creep.travelTo(structure);
                                  }
                              }
                              else { // resevoir is full
                                  creep.memory.toCentre = true;
                              }
                          }
                     }
                     else { // all full go staight to centre
                         //creep.drop(RESOURCE_ENERGY);
                         structure = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: (s) => ( (s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION) && s.energy < s.energyCapacity) })
                         if (structure == undefined) { // cannot find spawn or extensions or tower or they are full, find the storage
                             structure = creep.room.storage;
                         }
                         if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                             creep.travelTo(structure);
                         }
                     }
                }
                else { // no link delivering
                  var structure = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: (s) => ( (s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION) && s.energy < s.energyCapacity) })
                  if (structure == undefined) { // cannot find spawn or extensions or tower or they are full, find the storage
                      structure = creep.room.storage;
                      if (structure != undefined) { // if there is storage
                          if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                              creep.travelTo(structure);
                          }
                      }
                      else {
                          let centreLinkFlag = Game.flags['link'+creep.memory.home];
                          let range = creep.pos.getRangeTo(centreLinkFlag);
                          if (range<3) {
                              creep.drop(RESOURCE_ENERGY);
                          }
                          else {
                              creep.travelTo(centreLinkFlag);
                          }
                      }
                  }
                  else {
                      if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                          creep.travelTo(structure);
                      }
                  }
                }
              }
          }
          else { // working is false, take energy
              if (creep.room.name == creep.memory.target) { // if not in target room go to target room, if in:
                  let energy = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {filter: {resourceType: RESOURCE_ENERGY}});
                  if (creep.pickup(energy) == ERR_NOT_IN_RANGE) {
                      creep.travelTo(energy);
                  }
                  else {
                      let container = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: s => s.structureType == STRUCTURE_CONTAINER && (s.store[RESOURCE_ENERGY] > 0.618*creep.carryCapacity)});
                      if (container != undefined) { // if all containers are 0, take energy from storage
                          if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                              creep.travelTo(container);
                          }
                      }
                  }
              }
              else {
                  creep.travelTo(Game.flags[creep.memory.target]);
                  //var exit = creep.room.findExitTo(creep.memory.target);
                  //creep.travelTo(creep.pos.findClosestByRange(exit));
              }
          }
       }
    }
};
