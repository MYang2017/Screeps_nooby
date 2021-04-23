var actionRunAway = require('action.flee');

module.exports = {
    run: function(creep) {
        creep.say('OMG!😨', true);
        
        let inR = creep.room;

        if (inR.name==creep.memory.target) {
            let tar = creep.room.find(FIND_HOSTILE_CREEPS);
            if (tar.length>0) {
                tar = tar[0]
            }
            else {
                tar = Game.rooms[inR.name].find(FIND_HOSTILE_STRUCTURES, {filter:s=>s.structureType==STRUCTURE_SPAWN})[0];
            }
            if (tar) {
                if (creep.pos.getRangeTo(tar)<=4) {
                    actionRunAway.run(creep);
                }
                else {
                    creep.moveTo(tar);
                }
                creep.rangedAttack(tar);
            }
        }
        else {
            creep.moveTo(new RoomPosition(25, 25, tarRName), {range: 10});
        }
        
        // replacing old logic with flags and uniqueString
        /*
        if (creep.hits > 0.9*creep.hitsMax) { // if full health
            let myNurseName = findMyHero(creep.memory.uniqueString, 'healer');
            let myNurse = Game.creeps[myNurseName];
            //if (creep.pos.findInRange(FIND_MY_CREEPS, 1, {filter: s => ((s.memory.role=='healer')&&(s.memory.uniqueString==creep.memory.uniqueString))}).length>0) {
            if ((creep.pos.getRangeTo(myNurse)<2)||(creep.pos.x==0)||(creep.pos.y==0)||(creep.pos.x==49)||(creep.pos.y==49)) {
                if (creep.room.name != creep.memory.target) { // if not in target room
                   creep.travelTo(Game.flags[creep.memory.target]);
                }
                else { // in target room
                    if (Game.flags[creep.memory.target+'attack'] != undefined) { // && creep.getActiveBodyparts(ATTACK)>0) {
                        creep.travelTo(Game.flags[creep.memory.target+'attack']); // gether at flag's position
                        let target = Game.flags[creep.memory.target+'attack'].pos.findInRange(FIND_STRUCTURES, 0)[0];

                        //var target = Game.getObjectById(Game.flags['attack'].room.lookAt(2,17)[0]['structure'].id);
                        //console.log(target)

                        if (creep.attack(target) == ERR_NOT_IN_RANGE) {
                            creep.rangedAttackattack(target)
                            creep.travelTo(target)
                        }

                        if (creep.pos.isEqualTo(Game.flags[creep.memory.target+'attack'])) {
                            Game.flags[creep.memory.target+'attack'].remove();
                        }
                    }
                    else {
                        let target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter: c => ((c.pos.getRangeTo(creep) < 2))});
                        if (target) {
                            if (creep.attack(target) == ERR_NOT_IN_RANGE) {
                                creep.rangedAttackattack(target);
                                creep.attack(target);
                                creep.travelTo(target);
                            }
                        }
                        else {
                            target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                            if (creep.attack(target) == ERR_NOT_IN_RANGE) {
                                creep.travelTo(target)
                            }
                            else {
                                let core = creep.room.find(FIND_STRUCTURES, {filter:c => c.structureType==STRUCTURE_SPAWN})[0];
                                if (core) {
                                    creep.travelTo(core);
                                    creep.attack(core);
                                    creep.rangedAttackattack(target);
                                }
                                else {
                                    core = creep.room.find(FIND_STRUCTURES, {filter:c => c.structureType==STRUCTURE_CONTAINER})[0];
                                    if (core) {
                                        creep.travelTo(core);
                                        creep.attack(core);
                                        creep.rangedAttackattack(target);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            else { // healer is not followed, go to healer, else escape point
                creep.travelTo(Game.flags[creep.memory.target+'esc']);
            }
        }
        else { // wounded
            creep.travelTo(Game.flags[creep.memory.target+'esc']);
        }
        */
    }
};
