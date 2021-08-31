var actionRunAway = require('action.idle');
let getB = require('action.getBoost');
let gogo = require('action.attackAllInOne');
let dego = require('action.flee');

/*
urgent E6S17
soso E7S15
juicy E7S19
fake E9S17

11t 6ra 9m 23h 1m lvl 8
6t 22ra 9m 12h 1m lvl 7
*/

module.exports = {
    run: function (creep) {
        creep.say('Biu~', true);
        if (getB.run(creep) != true) {
            return
        }
        else {
            //creep.heal(creep);
                if ((creep.room.name == creep.memory.target) || (creep.memory.target == undefined)) { // if in target (giver) room, go withdraw from storage:
                    if (false && creep.getActiveBodyparts(TOUGH < 3)) {
                        if (storedTravelFromAtoB(creep, 'r')) { // not in target
                            // in target
                        }
                    }
                    else {
                        let flg = creep.room.find(FIND_FLAGS);
                        if (flg.length > 0) {
                            creep.moveTo(flg[0]);
                            //creep.rangedAttack(Game.getObjectById('60cb4932a6e58c2f637f394e'));
                            //return
                            let dist = creep.pos.getRangeTo(flg[0]);
                            if (dist<=3) {
                                let structs = creep.room.lookForAt(LOOK_STRUCTURES, flg[0].pos.x, flg[0].pos.y);
                                if (structs.length>0) {
                                    for (let struc of structs) {
                                        creep.rangedAttack(struc);
                                        return
                                    }
                                }
                            }
                            creep.rangedMassAttack();
                            return
                        }
                        else {
                            if (creep.getActiveBodyparts(ATTACK) + creep.getActiveBodyparts(RANGED_ATTACK) == 0 && creep.getActiveBodyparts(HEAL)>0) {
                                let toHeal = creep.pos.findClosestByRange(FIND_MY_CREEPS, {filter:c=>c.hits<c.hitsMax});
                                if (toHeal) {
                                    creep.moveTo(toHeal, {maxRooms: 1});
                                    creep.heal(toHeal);
                                    return
                                }
                            }
                            if (false && creep.room.name=='W19S16' && creep.memory.capped == undefined) {
                                creep.heal(creep);
                                if (creep.pos.getRangeTo(14, 33)>0) {
                                    creep.travelTo(new RoomPosition(14, 33, 'W19S16'), {maxRooms: 1});
                                }
                                else {
                                    creep.memory.capped = true;
                                }
                                return
                            }
                            let hst = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, { filter: s => !allyList().includes(s.owner.username) });
                            if (hst) {
                                if (creep.getActiveBodyparts(ATTACK)>0) {
                                    if (creep.getActiveBodyparts(ATTACK)*30+creep.getActiveBodyparts(RANGED_ATTACK)*10>hst.getActiveBodyparts(HEAL)*12) {
                                        if (creep.pos.getRangeTo(hst) > 1) {
                                            creep.heal(creep);
                                            creep.moveTo(hst, { maxRooms: 1 });
                                            
                                        }
                                        gogo.run(creep);
                                        return
                                    }
                                }
                                let hsts = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 3, { filter: s => !allyList().includes(s.owner.username) });
                                let myheal = analyseCreepAttackAndHealWithDistance(creep)[1]['1'];
                                let mydmg = analyseCreepAttackAndHealWithDistance(creep)[0]['1'];
                                let enemyMdmg = 0;
                                let enemyRdmg = 0;
                                let enemyheal = 0;
                                for (let hcp of hsts) {
                                    enemyMdmg += analyseCreepAttackAndHealWithDistance(hcp)[0]['1'];
                                    enemyRdmg += analyseCreepAttackAndHealWithDistance(hcp)[0]['2'];
                                    enemyheal += analyseCreepAttackAndHealWithDistance(hcp)[1]['1'];
                                }
    
                                let dist = 3;
    
                                if (enemyRdmg >= myheal) {
                                    dist = 4;
                                }
                                else if (enemyMdmg > myheal) {
                                    dist = 3;
                                }
                                else {
                                    dist = 2;
                                }
    
                                if (creep.pos.getRangeTo(hst) > dist) {
                                    creep.moveTo(hst, { maxRooms: 1 });
                                }
                                else {
                                    if (creep.pos.getRangeTo(hst) == dist && hst.fatigue != 0) {
    
                                    }
                                    else {
                                        dego.run(creep);
                                    }
                                }
                            }
                            else {
                                hst = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, { filter: s => !allyList().includes(s.owner.username) && (s.structureType!=STRUCTURE_CONTROLLER) });
                                if (hst) {
                                    if (creep.pos.getRangeTo(hst) > 3) {
                                        creep.moveTo(hst);
                                    }
                                    creep.rangedAttack(hst);
                                }
                                else {
                                    hst = creep.pos.findClosestByRange(FIND_MY_CREEPS, { filter: s => s.hits<s.hitsMax });
                                    if (hst) {
                                        if (creep.pos.getRangeTo(hst) > 2) {
                                            creep.moveTo(hst);
                                        }
                                        creep.heal(hst);
                                    }
                                    else {
                                        hst = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES, { filter: s => !allyList().includes(s.owner.username) });
                                        if (hst) {
                                            if (creep.pos.getRangeTo(hst) > 0) {
                                                creep.moveTo(hst);
                                            }
                                        }
                                        else {
                                            if (creep.room.controller && creep.room.controller.my) {
                                                if (creep.pos.getRangeTo(25, 25) > 5) {
                                                    creep.moveTo(25, 25, { maxRooms: 1, range: 5 });
                                                }
                                                else {
                                                    actionRunAway.run(creep);
                                                }
                                                return
                                            }
                                            hst = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: s=>s.structureType!=STRUCTURE_CONTROLLER && s.structureType!=STRUCTURE_ROAD});
                                            if (hst) {
                                                if (creep.pos.getRangeTo(hst) > 3) {
                                                    creep.moveTo(hst, {maxRooms: 1});
                                                }
                                                else {
                                                    creep.rangedAttack(hst);
                                                }
                                            }
                                            else {
                                                hst = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: s=>s.structureType==STRUCTURE_ROAD});
                                                if (hst) {
                                                    if (creep.pos.getRangeTo(hst) > 3) {
                                                        creep.moveTo(hst, {maxRooms: 1});
                                                    }
                                                    else {
                                                        creep.rangedAttack(hst);
                                                    }
                                                }
                                                else {
                                                    if (creep.pos.getRangeTo(25, 25) > 5) {
                                                        creep.moveTo(25, 25, { maxRooms: 1, range: 5 });
                                                    }
                                                    else {
                                                        actionRunAway.run(creep);
                                                    }
                                                    return
                                                    creep.moveTo(new RoomPosition(25, 25, creep.memory.target), { range: 23 });
                                                    actionRunAway.run(creep);
                                                    return
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                else { // if not in target room, move to target room
                    if (creep.memory.foundRoute == undefined) {
                        creep.memory.foundRoute = {};
                    }
                    let route = Game.map.findRoute(creep.room, creep.memory.target, {
                        routeCallback(roomName, fromRoomName) {
                            let parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
                            let isHighway = (parsed[1] % 10 === 0) ||
                                (parsed[2] % 10 === 0);
                            let isMyRoom = Game.rooms[roomName] &&
                                Game.rooms[roomName].controller &&
                                Game.rooms[roomName].controller.my;
                            if (isHighway || isMyRoom) {
                                return 1;
                            }
                            else if (Game.shard.name=='shard3' && (roomName=='E11S49'||roomName=='E12S49'||roomName=='E11S51')) {
                                return 255;
                            }
                            else if (Memory.rooms[roomName] && Memory.rooms[roomName].avoid) {
                                return 255;
                            }
                            else {
                                return 2.8;
                            }
                        }
                    });
                    
                    if (route.length > 0) {
                        let exit = creep.pos.findClosestByRange(route[0].exit);
                            creep.travelTo(exit, { maxRooms: 1 });
                    }
                    gogo.run(creep);
                    return
                    
                    if (storedTravelFromAtoB(creep, 'l')) { // not in target
                        // in target
                    }
                    //creep.rangedMassAttack();
                }
                gogo.run(creep);
        }
    }
};
