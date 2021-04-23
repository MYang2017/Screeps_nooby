module.exports = {
    run: function(creep) {
        //creep.say('Yes, sir!', true);
        if (!creep.memory.boosted) { // if creep is not boosted, find a lab to boost
            let matToBoost = creep.memory.boostMat;
            let labMemory = creep.room.memory.forLab;
            if (labMemory) {
                let boostLabMemory = labMemory.boostLabs;
                if (boostLabMemory) {
                    let boostLabId = boostLabMemory[matToBoost];
                    if (boostLabId) {
                        let boostLab = Game.getObjectById(boostLabId);
                        if ( creep.pos.getRangeTo(boostLab) > 1 ) {
                            creep.moveTo(boostLab);
                        }
                        else {
                            if ( (boostLab.mineralAmount>750) && (boostLab.boostCreep(creep) == 0) ) {
                                creep.memory.boosted = true;
                            }
                        }
                    }
                }
            }
        }
        else {
            // team name
            let teamName = creep.memory.groupName;

            // check if followed
            let myCrew = Game.creeps[findTeamMate(teamName, 'crew')];
            if (creep.pos.getRangeTo(myCrew) < 2) {
                creep.memory.followed = true;
            }
            else {
                //creep.memory.followed = false;
            }

            // check if grouped
            let myCaptain = Game.creeps[findTeamMate(teamName, 'captain')];
            if (myCaptain) { // captain is alive
                let ungrouped = myCaptain.memory.ungrouped;

                if (ungrouped) { // check if grouped
                    creep.moveTo(Game.flags[teamName+'esc']);
                }
                else { // grouped
                    myCrew.moveTo(myCaptain);
                    let toHeal = lowestHealthAmongGroup(myCaptain,creep,myCrew);
                    if (creep.heal(toHeal)==0) {

                    }
                    else {
                       creep.rangedHeal(toHeal);
                    }

                    if (creep.memory.followed) { // if everyone is following

                    }
                    else {
                        // wait for everyone to follow up
                    }
                    /*if (healingEnough) {
                    // move forward
                    // first mate move to captain's current position
                    }
                    else {
                        // move backward to gathering point for healing
                    }*/
                }
            }
            else {
                creep.moveTo(Game.flags[teamName+'esc']);
                let toHeal = creep.pos.findClosestByRange(FIND_MY_CREEPS, { filter: (s) => (s.hits < s.hitsMax) } );
                if (creep.heal(toHeal)) {

                }
                else {
                    creep.rangedHeal(toHeal);
                }
            }
        }
    }
}
