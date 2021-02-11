module.exports = {
    run: function (creep) {
        // if creep in the destination room, change memory
        if (creep.memory.portalEndRoomName && creep.memory.portalEndRoomName == creep.room.name) {
            // change memory to anti-parsed value
            creep.memory = JSON.parse(creep.memory.parsedMemoryAfterTeleportation);
        }
        else if (creep.memory.portalRoomName == creep.room) {
             // if creep in its target portal room, find portal and go to portal, get portal id and desination
            let portalTogoID = creep.memory.portalID;
            if (portalTogoID) {
                creep.travelTo(Game.getObjectById(portalTogoID));
            }
            else {
                let portals = creep.room.find(FIND_STRUCTURES, { filter: c => c.structureType == STRUCTURE_PORTAL });
                if (portals) {
                    let portal = portals[0];
                    creep.memory.portalID = portal.id;
                    creep.memory.portalEndRoomName = portal.destination.roomName;
                }
            }
        }
        else { // if creep is not yet in the portal room, go to portal room
            creep.travelTo(new RoomPosition(25, 25, creep.memory.portalRoomName));
        }
    }
};
