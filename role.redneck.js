let idl = require('action.idle');

module.exports = {

    run: function (creep) {
        creep.say('OMG!😨', true);

        let inR = creep.room;
        let tarRName = creep.memory.target;
        

        if (travelToPrioHighwayWithClosestRoomExit(creep, tarRName)) { // if in target room
            // get rampart positions, that closest to enemy and not occupied
            
            if (inR.controller.safeMode && false) {
                let hs = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                if (hs) {
                    creep.travelTo(hs);
                    creep.attack(hs);
                }
                return
            }
            
            let enemy = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 1);
            if (enemy.length>0) {
                creep.attack(enemy[0]);
                creep.memory.focusId = enemy[0].id;
            }
            else {
                creep.memory.focusId = undefined;
            }

            let ramparts = creep.room.find(FIND_MY_STRUCTURES, { filter: o => ((o.structureType == STRUCTURE_RAMPART) && 
                                                                               (o.pos.findInRange(FIND_MY_CREEPS, 0, {filter:c=>c.id!=creep.id}).length==0) &&
                                                                               (o.pos.findInRange(FIND_MY_STRUCTURES, 0).length==1) &&
                                                                               ((o.pos.findInRange(FIND_HOSTILE_CREEPS, 1).length>0) || o.pos.findInRange(FIND_FLAGS, 1).length>0)
                                                                              ) });
            
            if (ramparts.length==0) {
                ramparts = creep.room.find(FIND_MY_STRUCTURES, { filter: o => ((o.structureType == STRUCTURE_RAMPART) && 
                                                                               (o.pos.findInRange(FIND_MY_CREEPS, 0, {filter:c=>c.id!=creep.id}).length==0) &&
                                                                               (o.pos.findInRange(FIND_MY_STRUCTURES, 0).length==1) &&
                                                                               ((o.pos.findInRange(FIND_HOSTILE_CREEPS, 2).length>0) || o.pos.findInRange(FIND_FLAGS, 2).length>0)
                                                                              ) });
            }

            let toProtect = ramparts[0];
            
            // move to rampart position within safe area
            if (toProtect) {
                moveInSafeCity(creep, toProtect.pos);
            }
            else {
                idl.run(creep);
            }
        }
    }
};
