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
            /*let labToGo;
            let labs = creep.room.find(FIND_MY_STRUCTURES, {filter: c => c.structureType == STRUCTURE_LAB});
            for (let lab of labs) {
                let flag = creep.room.lookForAt(LOOK_FLAGS,lab)[0];
                if (flag != undefined) {
                    if (flag.color == COLOR_CYAN) { // 4 is cyan for out lab
                        let toBoostMineral = getMineralType(flag.name);
                        if (toBoostMineral == 'LO') {
                            labToGo = lab;
                        }
                    }
                }
            }
            if ( creep.pos.getRangeTo(labToGo) > 1 ) {
                creep.moveTo(labToGo);
            }
            else {
                if (labToGo.boostCreep(creep) == 0) {
                    creep.memory.boosted = true;
                }
            }*/
        }
        else {
            // team name
            let teamName = creep.memory.groupName;

            let myFirstMate = Game.creeps[findTeamMate(teamName, 'firstMate')];

            // check if grouped
            let myCaptain = Game.creeps[findTeamMate(teamName, 'captain')];
            if (myCaptain) { // captain is alive
                let ungrouped = myCaptain.memory.ungrouped;

                if (ungrouped) { // check if grouped
                    if (myFirstMate) {
                        creep.moveTo(myFirstMate);
                    }
                    else {
                        creep.moveTo(Game.flags[teamName+'esc']);
                    }
                }
                else { // grouped
                    let toHeal = lowestHealthAmongGroup(myCaptain,myFirstMate,creep);
                    if (creep.heal(toHeal)==0) {

                    }
                    else {
                       creep.rangedHeal(toHeal);
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
