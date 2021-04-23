var actionRunAway = require('action.idle');
let getB = require('action.getBoost');
let gogo = require('action.attackAllInOne');
let dego = require('action.flee')

/*
urgent E6S17
soso E7S15
juicy E7S19
fake E9S17

11t 6ra 9m 23h 1m lvl 8
6t 22ra 9m 12h 1m lvl 7
*/

module.exports = {
    run: function(creep) {
        creep.say('Biu~', true);
        if (getB.run(creep)!=true) {
            return
        }
        else {
            creep.heal(creep);
            if ((creep.room.name == creep.memory.target)||(creep.memory.target==undefined)) { // if in target (giver) room, go withdraw from storage:
                if (creep.getActiveBodyparts(TOUGH<3)) {
                    if (storedTravelFromAtoB(creep, 'r')) { // not in target
                        // in target
                    }
                }
                else {
                    let flg = creep.room.find(FIND_FLAGS);
                    if (flg.length>0) {
                        creep.moveTo(flg[0]);
                        //creep.rangedMassAttack();
                    }
                    else {
                    
                            let hst = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter: s=>!allyList().includes(s.owner.username)} );
                            if (hst) {
                                let myheal = analyseCreepAttackAndHealWithDistance(creep)[1]['1'];
                                let mydmg = analyseCreepAttackAndHealWithDistance(creep)[0]['1'];
                                let enemyMdmg = analyseCreepAttackAndHealWithDistance(hst)[0]['1'];
                                let enemyRdmg = analyseCreepAttackAndHealWithDistance(hst)[0]['2'];
                                let enemyheal = analyseCreepAttackAndHealWithDistance(hst)[1]['1'];
                                
                                let dist = 3;
                                
                                if (enemyRdmg>=myheal) {
                                    dist = 4;
                                }
                                else if (enemyMdmg>myheal) {
                                    dist = 3;
                                }
                                else {
                                    dist = 2;
                                }
    
                                if (creep.pos.getRangeTo(hst)>dist) {
                                    creep.moveTo(hst, {maxRooms: 1});
                                }
                                else {
                                    if (creep.pos.getRangeTo(hst) == dist && hst.fatigue!=0) {
                                        
                                    }
                                    else {
                                        dego.run(creep);
                                    }
                                }
                            }
                            else {
                                hst = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {filter: s=>!allyList().includes(s.owner.username)});
                                if (hst) {
                                    if (creep.pos.getRangeTo(hst) > 2) {
                                        creep.moveTo(hst);
                                    }
                                    creep.rangedAttack(hst);
                                }
                                else {
                                    creep.moveTo(new RoomPosition(25, 25, creep.memory.target), {range: 23});
                                    actionRunAway.run(creep);
                                }
                                return
                            }
                    }
                }
                gogo.run(creep);
            }
            else { // if not in target room, move to target room
                if (storedTravelFromAtoB(creep, 'l')) { // not in target
                    // in target
                }
                //creep.rangedMassAttack();
            }
        }
    }
};
