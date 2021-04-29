 var actionRecycle = require('action.recycle');

module.exports = {
    run: function(creep) {
        creep.say('😨', true);
        
        if (creep.memory.home == undefined) {
            creep.memory.home = creep.room.name;
        }
        
        if (creep.hits<0.7*creep.hitsMax) {
            creep.travelTo(new RoomPosition(25,25,creep.memory.home));
            creep.heal(creep);;
        }
        else {
            if (creep.memory.recycle) {
                if (creep.room.name != creep.memory.home) {
                    creep.travelTo(new RoomPosition(25,25,creep.memory.home));
                }
                else {
                    actionRecycle.run(creep);
                    return
                }
            }
            else {
                if (creep.room.name == 'E88N14') {
                    let message = ['20k','Oxygen','to','E92N11','every','50k','ticks']
                    creep.say(message[Game.time%message.length], true);
                }
                else {
                    let message = ['CrazyPilot...','we','will','remember...']
                    creep.say(message[Game.time%message.length], true);
                }
        
                if (creep.room.name == creep.memory.target) {// if creep in target room
                    // attack any creeps on the way
                    let closestHostile = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter:s=>s.getActiveBodyparts(ATTACK)>0||s.getActiveBodyparts(RANGED_ATTACK)>0||s.getActiveBodyparts(HEAL)>0});
                    if (closestHostile == undefined) {
                      //closestHostile = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter:s=>s.getActiveBodyparts(CARRY)!=1});
                      closestHostile = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                    }
        
                    if (closestHostile) {
                        creep.rangedAttack(closestHostile);
                        let closestHealer = creep.pos.findClosestByRange(FIND_MY_CREEPS, {filter:s=>s.getActiveBodyparts(HEAL)>10&&s.name!=creep.name});
                            if (closestHealer&&creep.hits<0.9*creep.hitsMax) {
                                creep.moveTo(closestHealer);
                            }
                            else {
                                let core = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {filter:c => c.structureType==STRUCTURE_SPAWN});
                                if (core) {
                                    creep.moveTo(core);
                                    creep.rangedAttack(core);
                                }
                                else {
                                    let distanceToKeep = fightingDistanceToKeep(creep,closestHostile);
                                    keepAtDistance(creep, distanceToKeep, closestHostile);
                                }
                            }
                    }
                    else {
                        creep.memory.recycle = true;
                        creep.memory.target = creep.memory.home;
                    }
        
                    let toHeal = creep.pos.findClosestByRange(FIND_MY_CREEPS, { filter: (s) => (s.hits < s.hitsMax) } ); // find closest damaged creep
                    // go and heal damaged creep
                    if (toHeal) { // if there is damaged creep, go heal
                        if (creep.heal(toHeal) == ERR_NOT_IN_RANGE) {
                            creep.rangedHeal(toHeal);
                            //creep.memory.storedTarget.x = toHeal.pos.x;creep.memory.storedTarget.y = toHeal.pos.y;creep.memory.storedTarget.roomName = toHeal.room.name;
                        }
                    }
                }
                else {// go to target room
                    creep.moveTo( new RoomPosition(25, 25, creep.memory.target), {range:10} );
                }
            }
        }
    }
};
