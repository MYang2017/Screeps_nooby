let dog = require('action.idle');

module.exports = {
    run: function (creep) {
        let ifShooterRoom = creep.room.memory.startMB;
        if (ifShooterRoom && creep.room.terminal) {
            if (creep.withdraw(creep.room.terminal, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.travelTo(creep.room.terminal, { maxRooms: 1 });
                return
            }
        }
        else {
            var [resourceID, ifDropped] = evaluateEnergyResources(creep, true, true, true, true); // find energy function in myFunctoins
            if (resourceID != undefined) {
                energy = Game.getObjectById(resourceID);
                if (ifDropped) { // if energy is dropped
                    if (creep.pickup(energy) == ERR_NOT_IN_RANGE) {
                        if (creep.memory.storedTarget) {
                            creep.memory.storedTarget.x = energy.pos.x; creep.memory.storedTarget.y = energy.pos.y; creep.memory.storedTarget.roomName = energy.room.name;
                        }
                        creep.travelTo(energy, { maxRooms: 1 });
                        return
                    }
                }
                else { // energy is from container, storage or link
                    if (creep.withdraw(energy, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        if (creep.memory.storedTarget) {
                            creep.memory.storedTarget.x = energy.pos.x; creep.memory.storedTarget.y = energy.pos.y; creep.memory.storedTarget.roomName = energy.room.name;
                        }
                        creep.travelTo(energy, { maxRooms: 1 });
                        return
                    }
                }
            }
            else { // room level too low, go for resources
                let toMua = Game.getObjectById(ifDropped);
                if (creep.pos.getRangeTo(toMua)>1) {
                    if (creep.memory.storedTarget) {
                        creep.memory.storedTarget.x = Game.getObjectById(ifDropped).pos.x; creep.memory.storedTarget.y = Game.getObjectById(ifDropped).pos.y; creep.memory.storedTarget.roomName = Game.getObjectById(ifDropped).room.name;
                    }
                    creep.travelTo(Game.getObjectById(ifDropped), { maxRooms: 1 });
                }
                else {
                    if (creep.room.controller&&creep.pos.getRangeTo(creep.room.controller)<4) {
                        creep.upgradeController(creep.room.controller);
                    }
                    creep.harvest(toMua);
                }
                return
            }
        }
        //dog.run(creep);
    }
};
