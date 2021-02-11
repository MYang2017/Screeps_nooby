module.exports = {
    run: function(creep) {
        if (!creep.memory.healingAbility) {
            creep.memory.healingAbility = healingability(creep);
        }

        let preferredLocation = creep.memory.preferredLocation;
        if (preferredLocation) {
            // if preferred location is found, start teezing
            if (creep.hits >= creep.hitsMax - creep.memory.healingAbility) {
                // if creep is full health
                // move to location
                creep.moveTo(new RoomPosition(preferredLocation.x,preferredLocation.y, creep.memory.target));
            }
            else { // else wounded
                if (creep.room.name == creep.memory.target) {
                    // if in target room
                    // move to escape point
                    const exit = creep.pos.findClosestByRange(exitDir);
                    creep.moveTo(exit);
                }
                else { // else if not in target room
                    // stay until fully healed
                }
            }
        }
        else { // else if creep preferred location is undefined
            if (creep.room.name != creep.memory.target) {
            // if creep is not in target room
                // move to target
                creep.travelTo(new RoomPosition(25,25, creep.memory.target));
            }
            else { // else decide preferred location
                creep.memory.preferredLocation = whichOneOfFourCoornersIsSafest(creep.memory.room);
            }
        }

        creep.heal(creep);
        /*let toHeal = creep.pos.findClosestByRange(FIND_MY_CREEPS, { filter: (s) => (s.hits < s.hitsMax) } );
        if (toHeal) { // if there is damaged creep, go heal
            creep.heal(toHeal);
        }
        if (creep.hits > 0.9*creep.hitsMax) { // if full health
            if (creep.room.name != creep.memory.target) { // if not in target room
               creep.travelTo(Game.flags[creep.memory.target]);
               creep.heal(creep);
            }
            else { // in target room
                if (Game.flags[creep.memory.target+'attack'] != undefined) { // && creep.getActiveBodyparts(ATTACK)>0) {
                    creep.moveTo(Game.flags[creep.memory.target+'attack']); // gether at flag's position
                    let target = Game.flags[creep.memory.target+'attack'].pos.findInRange(FIND_STRUCTURES, 0)[0];

                    //var target = Game.getObjectById(Game.flags['attack'].room.lookAt(2,17)[0]['structure'].id);
                    //console.log(target)

                    if (creep.attack(target) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target)
                    }

                    if (creep.pos.isEqualTo(Game.flags[creep.memory.target+'attack'])) {
                        Game.flags[creep.memory.target+'attack'].remove();
                    }
                }
                else {
                    if (creep.getActiveBodyparts(HEAL)>0) {
                        let myAlly = creep.pos.findClosestByRange(FIND_MY_CREEPS, {filter:s=>s.getActiveBodyparts(HEAL)==0});
                        if (myAlly&&myAlly.hits<myAlly.hitsMax) {
                            creep.moveTo(myAlly);
                        }
                        else {
                            creep.moveTo(Game.flags[creep.memory.target]);
                        }
                    }
                    else {
                        let target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter: c => ((c.pos.getRangeTo(creep) < 2))});
                        if (target) {
                            if (creep.attack(target) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(target)
                            }
                        }
                        else {
                            let core = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {filter:c => c.structureType==STRUCTURE_SPAWN});
                            if (core==undefined) {
                                core = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {filter:c => c.structureType==STRUCTURE_EXTENSION});
                                if (core ==undefined) {
                                    core = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {filter:c => c.structureType==STRUCTURE_TOWER||c.structureType==STRUCTURE_LINK||c.structureType==STRUCTURE_LAB});
                                }
                            }
                            if (core) {
                                creep.moveTo(core);
                                creep.attack(core);
                            }
                        }
                    }
                }
            }
        }
        else { // wounded
            if (creep.hits < 0.5*creep.hitsMax) {
                creep.moveTo(Game.flags[creep.memory.target+'esc']);
            }
            //var exit = creep.room.findExitTo(creep.memory.home);
            //creep.moveTo(creep.pos.findClosestByRange(exit));
            if (creep.getActiveBodyparts(HEAL)>0) { // if creep itself is a healer
                creep.moveTo(Game.flags[creep.memory.target+'esc']); // go back home and heal itself
            }
            else { // find a healer to seek for heal
                let allMyCreeps = getAllMyCreepsAlive();
                let healer;
                for (let myCreep of allMyCreeps) {
                    if ((myCreep.memory.role == 'teezer')&&(myCreep.getActiveBodyparts(HEAL)>0)&&(myCreep.target == creep.target)) {
                        healer = myCreep;
                    }
                }
                if (healer) { // if a healer is found
                    creep.moveTo(healer);
                }
                else { // go back home
                    creep.moveTo(Game.flags[creep.memory.target+'esc']);
                }
            }
        }*/
    }
};
