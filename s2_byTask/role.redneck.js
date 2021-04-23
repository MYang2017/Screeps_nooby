module.exports = {
    run: function (creep) {
        creep.say('OMG!😨', true);

        let enemyTargets = FIND_HOSTILE_CREEPS;

        let inR = creep.room;
        let tarRName = creep.memory.target;

        if (inR.name == creep.memory.target) {
            // get rampart positions, that closest to enemy and not occupied

            let ramparts = creep.room.find(FIND_STRUCTURES, { filter: o => ((o.structureType == STRUCTURE_RAMPART) && ((creep.room.lookForAt(LOOK_CREEPS, o.pos.x, o.pos.y) == 0) || (creep.room.lookForAt(LOOK_CREEPS, o.pos.x, o.pos.y)[0].name==creep.name))) });
            
            let toProtect = ramparts[0];
            let tar = undefined;
            
            for (let rampart of ramparts) {
                let diren = rampart.pos.findInRange(enemyTargets, 1);
                if (diren.length > 0) {
                    tar = diren[0]
                    toProtect = rampart;
                }
            }
            
            // move to rampart position within safe area
            let ret = findPathInRoomSafeZone(creep.pos, toProtect.pos);
            creep.moveByPath(ret.path)

            if (tar) {
                creep.attack(tar);
            }
        }
        else {
            creep.travelTo(new RoomPosition(25, 25, tarRName));
        }
    }
};
