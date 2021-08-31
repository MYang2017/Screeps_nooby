module.exports = {
    run: function(creep) {
        
        if (creep.getActiveBodyparts(ATTACK)>0) {
            let eni = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 1, {filter: s=>(!allyList().includes(s.owner.username))});
            if (eni.length>0) {
                creep.attack(eni[0]);
                if (creep.getActiveBodyparts(RANGED_ATTACK)>0) {
                    creep.rangedMassAttack();
                }
            }
            else {
                eni = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 3, {filter: s=>(!allyList().includes(s.owner.username))});
                if (eni.length>0) {
                    creep.rangedAttack(eni[0]);
                }
                if (creep.room.controller == undefined || ( ( (creep.room.controller && creep.room.controller.level && creep.room.controller.level>0 && !creep.room.controller.my) || (creep.room.controller.reservation && !allyList().includes(creep.room.controller.reservation.username)) )) ) {
                    let struc = creep.pos.findInRange(FIND_STRUCTURES, 1);
                    if (struc.length>0) {
                        creep.attack(struc[0]);
                    }
                    if (creep.getActiveBodyparts(RANGED_ATTACK)>0) {
                        creep.rangedMassAttack();
                    }
                }
            }
            return
            eni = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 1, {filter: s=>(!allyList().includes(s.owner.username))});
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
                        if (creep.room.controller && ( (!creep.room.controller.my) || (creep.room.controller.reservation && !allyList().includes(creep.room.controller.reservation.username)) ) ) {
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
        
        if (creep.getActiveBodyparts(WORK)>0) {
            if (creep.getActiveBodyparts(RANGED_ATTACK)>0) {
                creep.rangedMassAttack();
            }
            // find euclidean
            // find near
            // attack

            if (creep.room.controller == undefined || (( (!creep.room.controller.my) || (creep.room.controller.reservation && !allyList().includes(creep.room.controller.reservation.username)) )) ) {
                let struc = creep.pos.findInRange(FIND_STRUCTURES, 1);
                if (struc.length>0) {
                    creep.dismantle(struc[0]);
                }
            }
            return
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
                    if (creep.room.controller && ( (!creep.room.controller.my) || (creep.room.controller.reservation && !allyList().includes(creep.room.controller.reservation.username)) ) ) {
                        struc = creep.pos.findInRange(FIND_STRUCTURES, 1);
                        if (struc.length>0) {
                            creep.dismantle(struc[0]);
                        }
                    }
                }
            }
            if (creep.getActiveBodyparts(RANGED_ATTACK)>0) {
                creep.rangedMassAttack();
            }
        }
        
        if (creep.getActiveBodyparts(RANGED_ATTACK)>0) {
            if (creep.room.controller == undefined || (creep.room.controller && ( (!creep.room.controller.my) || (creep.room.controller.reservation && !allyList().includes(creep.room.controller.reservation.username)) )) ) {
                // find creeps not protected
                if (creep.pos.findInRange(FIND_HOSTILE_CREEPS, 1, {filter: s=>(!allyList().includes(s.owner.username))}).length>0 || creep.pos.findInRange(FIND_HOSTILE_STRUCTURES, 1, {filter: s=>(!allyList().includes(s.owner.username))}).length>0) {
                    creep.rangedMassAttack();
                }
                else if (creep.pos.findInRange(FIND_HOSTILE_CREEPS, 2, {filter: s=>(!allyList().includes(s.owner.username))}).length + creep.pos.findInRange(FIND_HOSTILE_STRUCTURES, 2, {filter: s=>(!allyList().includes(s.owner.username))}).length>2) {
                    creep.rangedMassAttack();
                }
                else if (creep.pos.findInRange(FIND_HOSTILE_CREEPS, 3, {filter: s=>(!allyList().includes(s.owner.username))}).length + creep.pos.findInRange(FIND_HOSTILE_STRUCTURES, 3, {filter: s=>(!allyList().includes(s.owner.username))}).length>7) {
                    creep.rangedMassAttack();
                }
                else {
                    let torange = undefined;
                    let unprotecteds = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 3, {filter: s=>(!allyList().includes(s.owner.username))&&(s.pos.findInRange(FIND_STRUCTURES, 0, {filter:p=>p.structureType==STRUCTURE_RAMPART}).length==0)});
                    if (unprotecteds.length>0) {
                        torange = unprotecteds[0];
                    }
                    else {// find non rampart hosttile structure not protected
                        unprotecteds = creep.pos.findInRange(FIND_HOSTILE_STRUCTURES, 3, {filter: s=>(!allyList().includes(s.owner.username))&&(s.structureType!=STRUCTURE_CONTROLLER&&s.structureType!=STRUCTURE_POWER_BANK)&&(s.pos.findInRange(FIND_STRUCTURES, 0, {filter:p=>p.structureType==STRUCTURE_RAMPART}).length==0)});
                        if (unprotecteds.length>0) {
                            torange = unprotecteds[0];
                        }
                        else { // find non wall/controller/bank/container structure not protected
                            unprotecteds = creep.pos.findInRange(FIND_STRUCTURES, 3, {filter: s=>s.hits>0});
                            if (unprotecteds.length>0) {
                                torange = unprotecteds[0];
                            }
                            else {
                            }
                        }
                    }
                    if (torange && torange.pos.getRangeTo(creep)>1) {
                        creep.rangedAttack(torange);
                    }
                    else if (torange && torange.pos.getRangeTo(creep)<4) {
                        if (torange.structureType==STRUCTURE_ROAD||torange.structureType==STRUCTURE_WALL||torange.structureType==STRUCTURE_CONTAINER) {
                            creep.rangedAttack(torange);
                        }
                        else {
                            creep.rangedMassAttack();
                        }
                    }
                    else {
                        creep.rangedMassAttack();
                    }
                }
            }
            /*
            let eni = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 3, {filter: s=>(!allyList().includes(s.owner.username))});
            if (eni.length>1) {
                creep.rangedMassAttack();
            }
            else {
                let enistru = creep.pos.findInRange(FIND_HOSTILE_STRUCTURES, 3, {filter: s=>(!allyList().includes(s.owner.username))});
                if (enistru.length+eni.length>1) {
                    creep.rangedMassAttack();
                }
                else if (eni.length==1) {
                    if (eni[0].pos.getRangeTo(creep)==1) {
                        creep.rangedMassAttack();
                    }
                    else {
                        creep.rangedAttack(eni[0]);
                    }
                }
                else {
                    let preStoredId = creep.memory.tarId; // in range of prestored
                    if (preStoredId && Game.getObjectById(preStoredId) && creep.pos.getRangeTo(Game.getObjectById(preStoredId))<2) {
                        if (creep.pos.getRangeTo(Game.getObjectById(preStoredId))>1) {
                            creep.rangedAttack(Game.getObjectById(preStoredId));
                        }
                        else {
                            creep.rangedMassAttack();
                        }
                    }
                    else {
                        let struc = creep.pos.findInRange(FIND_HOSTILE_STRUCTURES, 3, {filter: t=>t.structureType!==STRUCTURE_ROAD});
                        if (struc.length>2) {
                            creep.rangedMassAttack();
                        }
                        else if (struc.length>0) {
                            creep.rangedAttack(struc[0]);
                        }
                        else {
                            if (creep.room.controller && ( (!creep.room.controller.my) || (creep.room.controller.reservation && !allyList().includes(creep.room.controller.reservation.username)) ) ) {
                                struc = creep.pos.findInRange(FIND_STRUCTURES, 3, {filter: t=>t.structureType!==STRUCTURE_ROAD});
                                if (struc.length>3) {
                                    creep.rangedMassAttack();
                                }
                                else if (struc.length>0) {
                                    creep.rangedAttack(struc[0]);
                                }
                                else {
                                    struc = creep.pos.findInRange(FIND_STRUCTURES, 3, {filter: t=>t.structureType!==STRUCTURE_ROAD});
                                    if (struc.length>0) {
                                        creep.rangedAttack(struc[0]);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            */
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
                creep.heal(toHeal);
            }
            else {
                // find a random creep to preheal;
                if (neabyCps.length>0) {
                    let randint = Math.floor(Math.random() * neabyCps.length-1);
                    creep.heal(neabyCps[randint]);
                }
            }
        }
    }
}
