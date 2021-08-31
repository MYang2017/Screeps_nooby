var passE = require('action.passEnergy');
let lod = require('role.loader');

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

                let roomEnergyFillers = creep.room.find(FIND_MY_CREEPS, { filter: (i) => i.memory.role == 'pickuper' || i.memory.role == 'lorry' || i.memory.role == 'mover' || i.memory.role == 'balancer' || i.memory.role == 'dickHead' || i.memory.role == 'dickHeadpp' || i.memory.role == 'newDickHead' || i.memory.role == 'maintainer' }).length;
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
                passE.run(creep);
                if (creep.room.memory.newBunker && creep.room.memory.newBunker.layout && creep.room.memory.newBunker.layout.recCtn && creep.room.memory.newBunker.layout.recCtn.length>0) {
                    let rc = Game.getObjectById(creep.room.memory.newBunker.layout.recCtn[0].id);
                    if (rc==null) {
                        let posi = creep.room.memory.newBunker.layout.coreSp[0].posi;
                        if (creep.pos.getRangeTo(posi.x, posi.y)>1) {
                            creep.travelTo(new RoomPosition(posi.x, posi.y, creep.memory.home));
                        }
                        else {
                            creep.drop('energy');
                        }
                        return
                    }
                    if (rc.store.getFreeCapacity.energy>Math.min(500,creep.store.energy/2)) {
                        if (creep.pos.getRangeTo(rc)>1) {
                            creep.travelTo(rc, {maxRooms: 1});
                        }
                        else {
                            creep.transfer(rc, 'energy');
                        }
                    }
                    else {
                        if (creep.pos.getRangeTo(rc)>0) {
                            creep.travelTo(rc, {maxRooms: 1});
                        }
                        else {
                            creep.drop('energy');
                        }
                    }
                }
            }
        }
    }
}
