var roleLorry = require('role.lorry');

module.exports = {
    run: function (creep) {
        creepCarrying = _.sum(creep.carry);
        let toLab = labWorkToDo(creep);
        if (toLab == false) {
            roleLorry.run(creep);
        }
        else {
            if (creepCarrying == 0) {
                creep.memory.working = false;
            }
            else if (creep.memory.working == false && creepCarrying == creep.carryCapacity) {
                creep.memory.working = true;
            }

            let carryMineral = creep.memory.labWork.mineralType;

            if (creep.memory.working == true) { // if filled with mineral, transfer to terminal or lab depending on the lab action of creep
                let target = Game.getObjectById(creep.memory.labWork.target);
                creep.say('labin ' + carryMineral);
                for (const resourceType in creep.carry) {
                    if (resourceType == carryMineral) {
                        if (creep.transfer(target, resourceType) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(target);
                        }
                    }
                    else {
                        if (creep.transfer(creep.room.terminal, resourceType) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(creep.room.terminal);
                        }
                    }
                }
                //}
            }
            else { // if not working, carrying 0 mineral: find mineral
                // get minerals
                creep.say('labout ' + carryMineral);
                let keep = Game.getObjectById(creep.memory.labWork.keep);
                if ((keep.structureType == STRUCTURE_TERMINAL) && (keep.store[carryMineral] < creep.carryCapacity)) { // if terminal in-mineral is not enough
                    keep = creep.room.storage;
                    //console.log(keep.store[carryMineral],creep.carryCapacity)
                    if (keep.store[carryMineral] < creep.carryCapacity) { // not enough in-minerals
                        //creep.memory.role='lorry'; // become a lorry
                        roleLorry.run(creep);
                    }
                }
                //for (const resourceType in creep.carry) {
                if (creep.withdraw(keep, carryMineral) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(keep);
                }
                //}
            }
        }
    }
};

// if creep carry
    // if creep carry power
    // if creep carry labin material
    // if creep carry energy
    // if creep carry other material
// if creep not carry
    // if labout need take
    // if labin need fill
    // power need fill
    // if energy need fill
    // balancing

/*var roleScientist = require('role.scientist');

module.exports = {
    run: function(creep) {
        creepCarrying = _.sum(creep.carry);

        let toLab = labWorkToDo(creep);

        if (toLab == false || !creep.memory.labWork.mineralType || creep.carry.power) { // if nothing to do, be a sudo scientist
            roleScientist.run(creep);
        }
        else {
            if (creepCarrying == 0) {
                creep.memory.working = false;
            }
            else if (creep.memory.working == false && creepCarrying == creep.carryCapacity) {
                creep.memory.working = true;
            }

            let carryMineral = creep.memory.labWork.mineralType;

            if (creep.memory.working == true) { // if filled with mineral, transfer to terminal or lab depending on the lab action of creep
                let target = Game.getObjectById(creep.memory.labWork.target);
                creep.say('labin '+carryMineral);
                for (const resourceType in creep.carry) {
                    if (resourceType == 'energy') {
                        roleScientist.run(creep);
                    }
                    else {
                        if (resourceType == carryMineral) {
                            if (creep.transfer(target, resourceType) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(target);
                            }
                        }
                        else { // transfer mineral to terminal or storage depending on mineral type and fillness of terminal
                            let toStore = creep.room.terminal;
                            if (toStore.store[resourceType] > 50000) {
                                toStore = creep.room.storage;
                            }
                            if (creep.transfer(toStore, resourceType) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(toStore);
                            }
                        }
                    }
                }
                //}
            }
            else { // if not working, carrying 0 mineral: find mineral
                // get minerals
                creep.say('labout '+carryMineral);
                let keep = Game.getObjectById(creep.memory.labWork.keep);
                if ((keep.structureType == STRUCTURE_STORAGE) && keep.store[carryMineral] && (keep.store[carryMineral] < creep.carryCapacity)) { // if storage in-mineral is not enough
                    keep = creep.room.terminal;
                    if (creep.withdraw(keep, carryMineral) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(keep);
                    }
                }
                else if ((keep.structureType == STRUCTURE_TERMINAL) && keep.store[carryMineral] && (keep.store[carryMineral] < creep.carryCapacity)) { // if storage in-mineral is not enough
                    keep = creep.room.storage;
                    if (creep.withdraw(keep, carryMineral) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(keep);
                    }
                }
                else {
                    roleScientist.run(creep);
                }
            }
        }
    }
};
*/