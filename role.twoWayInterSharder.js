// for screeps travel to another shard through portal and never come back
// to become another role after portal

// createOneWayInterSharder = function(targetShardName, portalRoomName, portalId, targetRoomName, roleWillBe)
// role: targetShardName + '_' + targetRoomName + '_' + roleWillBe + '_' + generateRandomStrings()

// createPioneer = function(energy, target, home, superUpgrader, route)


// Game.getObjectById('5b7472d7b44c5d078a09fad7').createOneWayInterSharder('shard1', 'E40S0', '59f1c0062b28ff65f7f21507', 'E39S1', 'pioneer', [WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE])

module.exports = {
    run: function (creep) {
        let creepCarried = _.sum(creep.carry);
        if (creep.ticksToLive < 700) { // erase after intershard penalty is removed
            creep.memory.role = 'pickuper';
            creep.memory.working = true;
        }
        else { // creep has memory, either before or after transfering
            let currentShardName = Game.shard.name;
            if (creep.memory.homeShard == currentShardName) {
                let helpSource = creep.memory.homeSourceToCarry;
                let takenSource = creep.memory.targetSourceToCarry;
                let homeName = creep.memory.home;
                let home = Game.rooms[homeName];
                let toTake = home.terminal;
                if (!toTake) {
                    toTake = home.storage;
                }

                if (creepCarried == 0) { // travelling to get resources from home
                    if (creep.withdraw(toTake, helpSource) == ERR_NOT_IN_RANGE) {
                        creep.travelTo(toTake);
                    }
                }
                else if (creep.carry[helpSource] != creep.carryCapacity) {
                    if (creep.transfer(toTake, takenSource) == ERR_NOT_IN_RANGE) {
                        creep.travelTo(toTake);
                    }
                }
                else {
                    let portalRoomName = creep.memory.toTargetPortalRoomName;
                    let portalx = creep.memory.toTargetPortalX;
                    let portaly = creep.memory.toTargetPortalY;
                    creep.travelTo(new RoomPosition(portalx, portaly, portalRoomName));
                }
            }
            else if (creep.memory.targetShard == currentShardName) {
                let helpSource = creep.memory.targetSourceToCarry;
                let takenSource = creep.memory.homeSourceToCarry;
                let targetName = creep.memory.target;
                let target = Game.rooms[targetName];
                let toTake = target.terminal;
                if (!toTake) {
                    toTake = target.storage;
                }

                if (creepCarried == 0) { // travelling to get resources from target
                    if (creep.withdraw(toTake, helpSource) == ERR_NOT_IN_RANGE) {
                        creep.travelTo(toTake);
                    }
                }
                else if (creep.carry[helpSource] != creep.carryCapacity) {
                    if (creep.transfer(toTake, takenSource) == ERR_NOT_IN_RANGE) {
                        creep.travelTo(toTake);
                    }
                }
                else {
                    let portalRoomName = creep.memory.toHomePortalRoomName;
                    let portalx = creep.memory.toHomePortalX;
                    let portaly = creep.memory.toHomePortalY;
                    creep.travelTo(new RoomPosition(portalx, portaly, portalRoomName));
                }
            }
            else {
                console.log('check twowayintershader code for creep at ' + creep.pos);
            }
        }
    }
};
