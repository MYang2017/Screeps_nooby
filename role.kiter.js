var actionRunAway = require('action.idle');
<<<<<<< HEAD
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
=======
>>>>>>> master

module.exports = {
    run: function(creep) {
        creep.say('Biu~', true);
<<<<<<< HEAD
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
=======
        //if (creep.hits > 0.9*creep.hitsMax) { // if full health
        
        // 
        
        
        if (true) {
          if (creep.room.name == creep.memory.target) { // if in target room
              /*var target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter: s => (!allyList().includes(s.owner))&&(s.getActiveBodyparts(HEAL) > 0)}); // find healer first
              if (target == undefined) { // if no healer, find hostile creeps
                  target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter: s => (!allyList().includes(s.owner))});
                  //console.log('attack '+target);
                  if (target == undefined) { // if no hostile creeps
                      creep.moveTo(Game.flags[creep.memory.target].pos); // gether at romote room flag
                  }
              }*/
              // find healer first
              var scan = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter: s => (!allyList().includes(s.owner))&&(s.getActiveBodyparts(HEAL) > 0)}); // find healer first
              if (scan == undefined) {
                  scan = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter: s => !allyList().includes(s.owner)}); // find other creeps
              }
              if (creep.attack(scan) == ERR_NOT_IN_RANGE) {
                  creep.rangedAttack(scan);
                  creep.moveTo(scan, { maxRooms: 1 });
              }
              if (scan == undefined) {
                  //creep.moveTo(Game.flags[creep.memory.target].pos);
                  actionRunAway.run(creep);
                  //creep.travelTo(new RoomPosition(25, 25, creep.memory.target), { range: 24 });
              }
          }
          else { // go to target room
              //var exit = creep.room.findExitTo(creep.memory.target);
              //creep.moveTo(Game.flags[creep.memory.target].pos);
              creep.travelTo(new RoomPosition(25, 25, creep.memory.target), { range: 24 });
          }
      }
      else { // if wound go to base to heal, hit and run
          var targets = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 3, {filter: s => (!allyList().includes(s.owner))});
          if(targets.length > 1) { // if more than 1 hostile targets, mass attack
              creep.rangedMassAttack();
              creep.attack(targets[0]);
              creep.moveTo(Game.flags[creep.memory.home]);
          }
          else if(targets.length == 1) { // if 1 hostile target, ranged attack it
              creep.rangedAttack(targets[0]);
              creep.attack(targets[0]);
              creep.moveTo(Game.flags[creep.memory.home]);
          }
      }
>>>>>>> master
    }
};
