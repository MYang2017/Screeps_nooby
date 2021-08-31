let doge = require('action.flee');
let idle = require('action.idle');
let kit = require('role.kiter');

module.exports = {
    run: function(creep) {
        if (creep.getActiveBodyparts(HEAL)>0) {
            creep.heal(creep);
            /*
            let toheal = [creep];
            if (!creep.hits<creep.hitsMax) {
                toheal=creep.pos.findInRange(FIND_MY_CREEPS, 3, {filter: c.hits<c.hitsMax});
            }
            if (toheal.length>0) {
                creep.heal(toheal[0]);
            }
            */
        }
        if (travelToPrioHighwayWithClosestRoomExit(creep, creep.memory.target)) { // if in target room
            let dangerous = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 3, {filter:c=>!allyList().includes(c.owner.username) && (c.getActiveBodyparts(RANGED_ATTACK)*10>creep.getActiveBodyparts(HEAL)*12)});
            dangerous = dangerous.concat(creep.pos.findInRange(FIND_HOSTILE_CREEPS, 2, {filter:c=>!allyList().includes(c.owner.username) && (c.getActiveBodyparts(ATTACK)>0)}));
            
            if (dangerous.length>0) {
                let ifmass = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 3).length>0;
                if (ifmass) {
                    creep.rangedMassAttack();
                }
                else {
                    creep.rangedAttack(dangerous[0]);
                }
                doge.run(creep);
            }
            else {
                let pb = creep.room.find(FIND_STRUCTURES, { filter: c => c.structureType == STRUCTURE_POWER_BANK && c.pos.findInRange(FIND_HOSTILE_CREEPS, 3, {filter: c=>!allyList().includes(c.owner.username)}).length>0});
                if (pb.length>0) { // if pb with hostile exist
                    pb = pb[0];
                    let toattack = undefined;
                    let tar = pb.pos.findInRange(FIND_HOSTILE_CREEPS, 1, {filter:c=>c.getActiveBodyparts(MOVE)>0 && !allyList().includes(c.owner.username)});
                    if (tar.length>0) {
                        toattack = tar[0];
                    }
                    else {
                        tar = pb.pos.findInRange(FIND_HOSTILE_CREEPS, 3, {filter:c=>c.getActiveBodyparts(HEAL)>0 && !allyList().includes(c.owner.username)});
                        if (tar.length>0) {
                            toattack = tar[0];
                        }
                        else {
                            tar = pb.pos.findInRange(FIND_HOSTILE_CREEPS, 2, {filter:c=>c.getActiveBodyparts(ATTACK)>0 && !allyList().includes(c.owner.username)});
                            if (tar.length>0) {
                                toattack = tar[0];
                            }
                            else {
                                tar = pb.pos.findInRange(FIND_HOSTILE_CREEPS, 3, {filter:c=>c.getActiveBodyparts(RANGED_ATTACK)>0 && !allyList().includes(c.owner.username)});
                                if (tar.length>0) {
                                    toattack = tar[0];
                                }
                                else {
                                    tar = pb.pos.findInRange(FIND_HOSTILE_CREEPS, 10, {filter:c=>c.getActiveBodyparts(CARRY)>0 && !allyList().includes(c.owner.username)});
                                    if (tar.length>0) {
                                        toattack = tar[0];
                                    }
                                    else {
                                        if (pb.hits<5000) {
                                            tar = pb.pos.findInRange(FIND_HOSTILE_CREEPS, 1, {filter:c=>!allyList().includes(c.owner.username)});
                                            if (tar.length>0) {
                                                toattack = tar[0];
                                            }
                                        }
                                        else {
                                            idle.run(creep);
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (toattack) {
                        if (creep.pos.getRangeTo(toattack)>3) {
                            creep.moveTo(toattack, {maxRooms: 1});
                        }
                        else if (creep.pos.getRangeTo(toattack)<3) {
                            doge.run(creep);
                            creep.rangedAttack(toattack);
                        }
                        else {
                            creep.rangedAttack(toattack);
                        }
                    }
                }
                else { // if pb with no hostile exist
                    let toheal = creep.pos.findClosestByRange(FIND_MY_CREEPS, {filter:c=>c.hits<c.hitsMax});
                    if (toheal) {
                        if (creep.pos.getRangeTo(toheal)>1) {
                            creep.moveTo(toheal, {maxRooms: 1});
                        }
                        else {
                            creep.heal(toheal);
                            
                        }
                        creep.rangedMassAttack();
                        return
                    }
                    let toattack = creep.room.find(FIND_STRUCTURES, { filter: c => c.structureType == STRUCTURE_POWER_BANK});
                    if (toattack.length==0) { // if no pb
                        toattack = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter:c=>!allyList().includes(c.owner.username)});
                    }
                    else { // if pb
                        toattack = toattack[0];
                    }
                    if (toattack) {
                        if (creep.pos.getRangeTo(toattack)>3) {
                            creep.moveTo(toattack, {maxRooms: 1});
                        }
                        else {
                            creep.rangedAttack(toattack);
                        }
                    }
                    else {
                        idle.run(creep);
                    }
                }
            }
        }
    }
};
