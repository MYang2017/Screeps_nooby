// for screeps travel to another shard through portal and never come back
// to become another role after portal

// createOneWayInterSharder = function(targetShardName, portalRoomName, portalId, targetRoomName, roleWillBe)
// role: targetShardName + '_' + targetRoomName + '_' + roleWillBe + '_' + generateRandomStrings()

// createPioneer = function(energy, target, home, superUpgrader, route)


// Game.getObjectById('5b7472d7b44c5d078a09fad7').createOneWayInterSharder('shard1', 'E40S0', '59f1c0062b28ff65f7f21507', 'E39S1', 'pioneer', [WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE])

module.exports = {
    run: function(creep) {
        if (creep.memory == undefined) { // creep memory cleared due to inter shard transfer
            // code moved
            console.log('check onewayintershader code');
        }
        else { // creep has memory, either before or after transfering
            // for sacrificer
            if (creep.memory.roleWillBe && creep.memory.roleWillBe == 'sacrificer' && creep.store.getFreeCapacity('energy')>0 && creep.room.storage && creep.room.storage.my) {
                let ships = ['energy']; //'battery', 
                if (creep.name.slice(0,20).includes('E13S53')||creep.name.slice(0,20).includes('E31S49')) {
                    ships = ['battery', 'energy'];
                }
                for (let ship of ships) {
                    let whereTo = getATypeOfRes(creep.room, ship);
                    if (whereTo) {
                        if (creep.pos.getRangeTo(whereTo)>1) {
                            creep.travelTo(whereTo);
                        }
                        else {
                            creep.withdraw(whereTo, ship);
                        }
                        return
                    }
                }
                return
            }
            if (creep.memory.role == 'oneWayInterSharder') { // still before transportal
                if (creep.room.name == creep.memory.portalRoomName) { // if in target portal room
                    creep.travelTo(Game.getObjectById(creep.memory.portalId)); // go to portal with ID prestored
                }
                else { // go to target room
                    creep.travelTo(new RoomPosition(25, 25, creep.memory.portalRoomName));
                }
            }
            else { // creep has changed role in the working shard
                console.log('intershard portal transfer finished');
            }
        }
    }
};
