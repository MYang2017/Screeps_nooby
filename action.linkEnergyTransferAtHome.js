var passE = require('action.passEnergy');

module.exports = {
    run: function (creep) {
        let storage = creep.room.storage;
        let terminal = creep.room.terminal;
        if ((storage && storage.store.getUsedCapacity() > 980000) && (terminal && terminal.store.getUsedCapacity() > 290000)) {
            creep.drop(RESOURCE_ENERGY);
        }
        else {
            if (storage) {
                let structure = storage;
                if ((creep.room.terminal) && (_.sum(creep.room.terminal.store) < 222222)) {
                    structure = creep.room.terminal;
                }
                else {
                    structure = storage;
                    if (structure.store.getFreeCapacity('energy') == 0) {
                        structure = creep.room.terminal;
                    }
                }

                passE.run(creep);

                let roomEnergyFillers = creep.room.find(FIND_MY_CREEPS, { filter: (i) => i.memory.role == 'pickuper' || i.memory.role == 'lorry' || i.memory.role == 'mover' || i.memory.role == 'balancer' || i.memory.role == 'dickHead' || i.memory.role == 'maintainer' }).length;
                if (!(roomEnergyFillers > 2)) {
                    let toFill = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: (s) => ((s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION) && s.energy < s.energyCapacity || (s.structureType == STRUCTURE_TOWER && s.store.energy < 0.5 * _.sum(s.store))) })
                    if (toFill) { // cannot find spawn or extensions or tower or they are full, find the storage
                        structure = toFill;
                    }
                    for (let resT in creep.store) {
                        if (creep.transfer(structure, resT) == ERR_NOT_IN_RANGE) {
                            creep.travelTo(structure, { maxRooms: 1, creepCost: creep.memory.creepCost });
                        }
                    }
                }
                else {
                    for (let resT in creep.store) {
                        if (creep.transfer(structure, resT) == ERR_NOT_IN_RANGE) {
                            creep.travelTo(structure, { maxRooms: 1, creepCost: creep.memory.creepCost });
                        }
                    }
                }
            }
            else { // if storage is not defined
                let structure = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: (s) => ((s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION) && s.energy < s.energyCapacity) })
                if (structure) {
                    if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.travelTo(structure);
                    }
                }
            }
        }
    }
}
