var roleLorry = require('role.lorry');

module.exports = {
    run: function(creep) {
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
                creep.say('labin '+carryMineral);
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
                creep.say('labout '+carryMineral);
                let keep = Game.getObjectById(creep.memory.labWork.keep);
                if ((keep.structureType==STRUCTURE_TERMINAL)&&(keep.store[carryMineral]<creep.carryCapacity)) { // if terminal in-mineral is not enough
                    keep = creep.room.storage;
                    //console.log(keep.store[carryMineral],creep.carryCapacity)
                    if (keep.store[carryMineral]<creep.carryCapacity) { // not enough in-minerals
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
