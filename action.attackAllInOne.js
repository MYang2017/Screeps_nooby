module.exports = {
    run: function(creep) {
        
        if (creep.getActiveBodyparts(ATTACK)>9) {
            let eni = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 1, {filter: s=>(!allyList().includes(s.owner.username))});
            if (eni.length>0) {
                creep.attack(eni[0]);
                return
            }
            let preStoredId = creep.memory.tarId; // in range of prestored
            if (preStoredId && Game.getObjectById(preStoredId) && creep.pos.getRangeTo(Game.getObjectById(preStoredId))<2) {
                if (creep.attack(Game.getObjectById(preStoredId))==OK) {
                    return
                }
            }
            else {
                let struc = creep.pos.findInRange(FIND_HOSTILE_STRUCTURES, 1);
                if (creep.room.name==creep.memory.target) {
                    struc = creep.pos.findInRange(FIND_STRUCTURES, 1);
                }
                let hp = 300000000;
                let ruo = undefined;
                for (let da of struc) {
                    if (da.hits<hp) {
                        ruo = da;
                        hp = da.hits;
                    }
                }
                if (ruo) {
                    creep.attack(ruo);
                    return
                }
                else {
                    if (struc.length>0) {
                        creep.attack(struc[0]);
                        if (creep.hits>creep.hitsMax*0.6) {
                            return
                        }
                    }
                    else {
                        if (creep.room.controller && ( (!creep.room.controller.my) || (!allyList().includes(creep.room.controller.reservation.username)) ) ) {
                            struc = creep.pos.findInRange(FIND_STRUCTURES, 1);
                            if (struc.length>0) {
                                if (creep.attack(struc[0])==OK) {
                                    return
                                }
                            }
                        }
                    }
                }
            }
        }
        
        if (creep.getActiveBodyparts(RANGED_ATTACK)>0) {
            let eni = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 3, {filter: s=>(!allyList().includes(s.owner.username))});
            if (eni.length>1) {
                creep.rangedMassAttack();
            }
            else if (eni.length==1) {
                creep.rangedAttack(eni[0]);
            }
            else {
                let preStoredId = creep.memory.tarId; // in range of prestored
                if (preStoredId && Game.getObjectById(preStoredId) && creep.pos.getRangeTo(Game.getObjectById(preStoredId))<2) {
                    creep.rangedAttack(Game.getObjectById(preStoredId));
                }
                else {
                    let struc = creep.pos.findInRange(FIND_HOSTILE_STRUCTURES, 1, {filter: t=>t.structureType!==STRUCTURE_ROAD});
                    if (struc.length>3) {
                        creep.rangedMassAttack();
                    }
                    else if (struc.length>0) {
                        creep.rangedAttack(struc[0]);
                    }
                    else {
                        if (creep.room.controller && ( (!creep.room.controller.my) || (!allyList().includes(creep.room.controller.reservation.username)) ) ) {
                            struc = creep.pos.findInRange(FIND_STRUCTURES, 3, {filter: t=>t.structureType!==STRUCTURE_ROAD});
                            if (struc.length>3) {
                                creep.rangedMassAttack();
                            }
                            else if (struc.length>0) {
                                creep.rangedAttack(struc[0]);
                            }
                            else {
                                struc = creep.pos.findInRange(FIND_STRUCTURES, 3);
                                if (struc.length>0) {
                                    creep.rangedAttack(struc[0]);
                                }
                            }
                        }
                    }
                }
            }
        }
        
        if (creep.getActiveBodyparts(HEAL)>0) {
            let lostHp = 0;
            let toHeal = undefined;
            let neabyCps = creep.pos.findInRange(FIND_MY_CREEPS, 3);
            for (let cp of neabyCps) {
                let lost = cp.hitsMax - cp.hits;
                if (lost>lostHp) {
                    lostHp = lost;
                    toHeal = cp;
                }
            }
            if (toHeal) {
                if (creep.heal(toHeal)==OK) {
                    return
                }
            }
            else {
                if (creep.hits<creep.hitsMax) {
                    if (creep.heal(creep)==OK) {
                        return
                    }
                }
            }
        }
        
        if (creep.getActiveBodyparts(WORK)>0) {
            let preStoredId = creep.memory.tarId; // in range of prestored
            if (preStoredId && Game.getObjectById(preStoredId) && creep.pos.getRangeTo(Game.getObjectById(preStoredId))<2) {
                creep.dismantle(Game.getObjectById(preStoredId));
                if (creep.hits>creep.hitsMax*0.6) {
                    return
                }
            }
            else {
                let struc = creep.pos.findInRange(FIND_HOSTILE_STRUCTURES, 1);
                if (struc.length>0) {
                    creep.dismantle(struc[0]);
                }
                else {
                    if (creep.room.controller && ( (!creep.room.controller.my) || (!allyList().includes(creep.room.controller.reservation.username)) ) ) {
                        struc = creep.pos.findInRange(FIND_STRUCTURES, 1);
                        if (struc.length>0) {
                            creep.dismantle(struc[0]);
                        }
                    }
                }
            }
        }
    }
}
