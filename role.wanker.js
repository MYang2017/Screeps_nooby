module.exports = {
    run: function (creep) {
        creep.say('ah...');
        let ifCreepCarry = _.sum(creep.carry);
        let storage = creep.room.storage;
        let terminal = creep.room.terminal;
        let renewSpawn = Game.getObjectById(creep.room.memory.forSpawning.renewSpawnId);
        let shooterLab = Game.getObjectById(creep.room.memory.shooterLabId);
        let toFill = terminal;
        if (_.sum(terminal.store) == 300000) {
            toFill = storage;
        }

        if (ifCreepCarry) {
            for (let mineralType in creep.carry) {
                if (mineralType == 'energy') {
                    if (shooterLab.energy < 1200) {
                        creep.transfer(shooterLab, mineralType);
                    }
                    else if (renewSpawn.energy < 200) {
                        creep.transfer(renewSpawn, mineralType);
                    }
                    else {
                        creep.transfer(storage, mineralType);
                    }
                }
                else if (mineralType == 'XGH2O') {
                    if (shooterLab.mineralAmount < 2200) {
                        creep.transfer(shooterLab, mineralType);
                    }
                    else {
                        creep.transfer(storage, mineralType);
                    }
                }
                else {
                    creep.transfer(toFill, mineralType);
                }
            }
        }
        else {
            if (shooterLab.energy < 1200 || renewSpawn.energy < 200) {
                if (terminal.store.energy) {
                    creep.withdraw(terminal, 'energy');
                }
                else {
                    creep.withdraw(storage, 'energy');
                }
            }
            else if (shooterLab.mineralAmount < 2200 && creep.room.memory.mineralThresholds.currentMineralStats['XGH2O'] > 0) {
                if (terminal.store['XGH2O']) {
                    creep.withdraw(terminal, 'XGH2O');
                }
                else {
                    creep.withdraw(storage, 'XGH2O');
                }
            }
            else {
                let droppedXGH2O = creep.room.lookForAt(LOOK_RESOURCES, creep.pos.x, creep.pos.y+1);
                if (droppedXGH2O.length>0) {
                    creep.pickup(droppedXGH2O[0]);
                }
                else {
                    if (terminal.store.energy > 20000) {
                        creep.withdraw(terminal, 'energy');
                    }
                    else if (terminal.store['XGH2O'] > 0) {
                        creep.withdraw(terminal, 'XGH2O');
                    }
                }
            }
        }
    }
};
