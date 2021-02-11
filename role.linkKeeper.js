var rolePickuper = require('role.pickuper');
var actionAvoid = require('action.idle');

module.exports = {
    run: function(creep) {
        creep.say('linking');
        if (creep.memory.working == true && _.sum(creep.carry) == 0) {
            creep.memory.working = false;
        }
        else if ( creep.memory.working == false && _.sum(creep.carry) > 0) {//} == creep.carryCapacity ) {
            creep.memory.working = true;
        }

        if (creep.memory.working == true) { // put energy into structures
            for(const resourceType in creep.carry) {
                if (resourceType==RESOURCE_ENERGY) { // carrying energy
                    var structure = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: (s) => ( (s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION || s.structureType == STRUCTURE_NUKER) && s.energy < s.energyCapacity) })
                    if (structure == undefined||creep.room.energyAvailable>0.618*creep.room.energyCapacityAvailable) {
                        structure = creep.room.storage;
                        if (_.sum(structure.store)>900000||structure.store.energy>600000) { // storage is almost full
                            structure = creep.room.terminal;
                        }
                    }
                    if (creep.transfer(structure, resourceType) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(structure);
                    }
                }
                else { // carrying minerals
                    var structure = creep.room.storage;
                    if (creep.transfer(structure, resourceType) == ERR_NOT_IN_RANGE) {
                        creep.travelTo(structure);
                  }
               }
            }
        }
        else { // get energy from link
            let link = Game.getObjectById(creep.room.memory.forLinks.receiverLinkId);
            let storage = creep.room.storage;
            let terminal = creep.room.terminal;
            if (link.energy == 0) { // no link work to do
                if (creep.room.energyAvailable<1000) {
                    if (creep.withdraw(storage,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.travelTo(storage);
                    }
                }
                else {
                    actionAvoid.run(creep);
                    // as lorry is now in charge of balancing minerals between storage and terminal, linkKeepers do not need to balance energy fpor now
                    /*if (terminal && terminal.store.energy>100000&&_.sum(storage.store)<900000) {
                        if (creep.withdraw(terminal,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(terminal);
                        }
                    }
                    else if (_.sum(storage.store)>0.8*storage.storeCapacity) {
                        if (creep.withdraw(storage,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(storage);
                        }
                    }
                    else {
                        actionAvoid.run(creep);
                    }*/
                }
            }
            else {
                //console.log(creep.withdraw(link, RESOURCE_ENERGY))
                if (creep.withdraw(link, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.travelTo(link);
                }
            }
        }

        // re-spawn creep in advance
        /*if (creep.ticksToLive == creep.memory.spawnTime) {
            creep.room.memory.forSpawning.spawningQueue.push({memory:{energy: 1200, role: 'linkKeeper'},priority: 10});
            console.log('respawn linkKeeper in advance');
        }*/
    }
};
