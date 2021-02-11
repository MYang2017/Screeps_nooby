var actionAvoid = require('action.idle');

module.exports = {
    run: function(creep) {
        //creep.say('Yarrr!', true);

        // team name
        let teamName = creep.memory.groupName;

        if (creep.hits>0.67*creep.hitsMax) { // captain is healthy
            // check if followed
            let myFirstMate = Game.creeps[findTeamMate(teamName, 'firstMate')];
            let myCrew = Game.creeps[findTeamMate(teamName, 'crew')];

            if (creep.pos.getRangeTo(myFirstMate) < 2) {
                creep.memory.followed = true;
            }
            else {
                //creep.memory.followed = false;
            }

            // check if grouped
            if ((creep.memory.followed)||(myFirstMate.memory.followed)) { // captain is followed by first mate, firstMate is followed by crew
                creep.memory.ungrouped = false;
            }

            if (creep.memory.ungrouped) {
                // check if grouped
                creep.moveTo(Game.flags[teamName+'esc']);
            }
            else { // grouped
                myFirstMate.moveTo(creep.pos);
                myCrew.moveTo(creep.pos);
                let toHeal = lowestHealthAmongGroup(creep,myFirstMate,myCrew);
                if ( toHeal.hits > 0.618*toHeal.hitsMax ) { // if group is chained , gogo
                    if ((creep.memory.followed)&&(myFirstMate.memory.followed)) { // if everyone is following
                        if (creep.room.name == Game.flags[teamName].pos.roomName) { // if in target room
                            if (Game.flags[teamName+'attack'] != undefined) { // && creep.getActiveBodyparts(ATTACK)>0) {
                                creep.moveTo(Game.flags[teamName+'attack']); // gether at flag's position
                                let target = Game.flags[teamName+'attack'].pos.findInRange(FIND_STRUCTURES, 0)[0];

                                //var target = Game.getObjectById(Game.flags['attack'].room.lookAt(2,17)[0]['structure'].id);
                                //console.log(target)

                                if (creep.attack(target) == ERR_NOT_IN_RANGE) {
                                    creep.moveTo(target)
                                }

                                if (creep.pos.isEqualTo(Game.flags[teamName+'attack'])) {
                                    //Game.flags[teamName+'attack'].remove();
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
                                    let core = creep.room.find(FIND_STRUCTURES, {filter:c => c.structureType==STRUCTURE_SPAWN})[0];
                                    if (core) {
                                        creep.moveTo(core);
                                        creep.attack(core);
                                    }
                                    else {

                                    }
                                }
                            }
                        }
                        else {
                            creep.moveTo(Game.flags[teamName]);
                        }
                    }
                    else {
                        // wait for everyone to follow up
                    }
                }
                else { // gourp is not chained
                   // wait
                }
            }
        }
        else { // captain is wounded
            creep.moveTo(Game.flags[teamName+'esc']);
        }
    }
};
