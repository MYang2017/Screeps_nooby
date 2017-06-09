var actionRunAway = require('action.flee');

module.exports = {
    run: function(creep) {
        if (creep.room.name == creep.memory.target) { // if in target room
            if (creep.memory.ranged) {
                creep.say('jiu~', true);
                let hostileCreep = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter: s => !allyList().includes(s.owner)});
                if (creep.hits > 0.9*creep.hitsMax) { // if full health
                    /*var scan = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter: s => (!allyList().includes(s.owner))&&(s.getActiveBodyparts(HEAL) > 0)}); // find healer first
                    if (scan == undefined) {
                        scan = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter: s => !allyList().includes(s.owner)}); // find other creeps
                    }*/
                    if (creep.attack(hostileCreep) == ERR_NOT_IN_RANGE) {
                        creep.rangedAttack(hostileCreep);
                        creep.attack(hostileCreep);
                        creep.travelTo(hostileCreep);
                    }
                    if (hostileCreep == undefined) {
                        let toHeal = creep.pos.findClosestByRange(FIND_MY_CREEPS, { filter: (s) => (s.hits < s.hitsMax) } );
                        if (toHeal) { // if there is damaged creep, go heal
                            if (creep.heal(toHeal) == ERR_NOT_IN_RANGE) {
                                //creep.heal(creep);
                                creep.travelTo(toHeal);
                            }
                        }
                        else { // move to flag and wait
                            creep.travelTo(Game.flags[creep.memory.target]);
                        }
                    }
                }
                else { // if wound go to base to heal, hit and run
                    actionRunAway.run(creep);
                    creep.rangedAttack(hostileCreep);
                    creep.heal(creep);
                }
            }
            else {
                creep.say('oh~', true);
                let posToGo = keeperLairToGo(creep, creep.memory.target); // find hostile or next spawning lair
                if (posToGo) {
                    let toHeal = creep.pos.findClosestByRange(FIND_MY_CREEPS, { filter: (s) => (s.hits < s.hitsMax) } );
                    if (toHeal) { // if there is damaged creep, go heal
                        if (creep.heal(toHeal) == ERR_NOT_IN_RANGE) {
                            creep.travelTo(toHeal);
                        }
                    }
                    let disToTarget =  creep.pos.getRangeTo(posToGo);
                    if (disToTarget==6 && creep.hits<creep.hitsMax) { // stop and heal
                        //creep.heal(creep);
                    }
                    else if (disToTarget>1) { // if far get to target position
                        //creep.heal(creep);
                        creep.travelTo(posToGo);
                    }
                    else { // if in range of attacking, attack
                        //creep.heal(creep);
                        creep.attack(posToGo);
                    }
                }
                else { // no hostile and spawn time is far
                    let toHeal = creep.pos.findClosestByRange(FIND_MY_CREEPS, { filter: (s) => (s.hits < s.hitsMax) } );
                    if (toHeal) { // if there is damaged creep, go heal
                        if (creep.heal(toHeal) == ERR_NOT_IN_RANGE) {
                            creep.heal(creep);
                            creep.travelTo(toHeal);
                        }
                    }
                    else { // move to flag and wait
                        creep.travelTo(Game.flags[creep.memory.target]);
                    }
                }
            }
        }
        else {
            creep.travelTo(Game.flags[creep.memory.target]);
        }

        // re-spawn creep in advance
        if (creep.ticksToLive-50 == creep.memory.spawnTime) {
            creep.room.memory.forSpawning.spawningQueue.push({memory:{role: 'keeperLairMeleeKeeper', target: creep.memory.target, ranged: creep.memory.ranged},priority: 8});
            console.log('respawn keeperLairMeleeKeeper in advance '+creep.memory.target);
        }
    }
};
