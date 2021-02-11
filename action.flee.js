module.exports = {
    run: function(creep) {
        let enemies = creep.pos.findInRange(FIND_HOSTILE_CREEPS,7);
        let keeperLair = creep.pos.findInRange(FIND_STRUCTURES, 7, { filter: c => c.structureType == STRUCTURE_KEEPER_LAIR && c.ticksToSpawn < 3 });
        if (keeperLair) {
            enemies = enemies.concat(keeperLair);
        }

        try {
            if (enemies.length > 0) {
                let closestAvoidId = undefined;
                let closestDist = 100;
                for (let enemy of enemies) {
                    let currentRange = creep.pos.getRangeTo(enemy);
                    if (currentRange < closestDist) {
                        closestDist = currentRange;
                        closestAvoidId = enemy.id;
                    }
                    if (closestAvoidId) {
                        let enemyDir = creep.pos.getDirectionTo(Game.getObjectById(closestAvoidId));
                        let oppositeDir = (enemyDir + 4) % 8;
                        let possibleDir = [correctDirection(oppositeDir),
                                           correctDirection((oppositeDir + 1) % 8),
                                           correctDirection((oppositeDir - 1) % 8),
                                           correctDirection((oppositeDir + 2) % 8),
                                           correctDirection((oppositeDir - 2) % 8),
                                           correctDirection((oppositeDir + 3) % 8),
                                           correctDirection((oppositeDir - 3) % 8),
                                           correctDirection((oppositeDir + 4) % 8)];

                        //console.log(creep.room.name, enemyDir, possibleDir)

                        let nextDirToMove = undefined;
                        for (let dir of possibleDir) {
                            let nextPos = getPosByDir(creep.pos, dir);
                            if (isTerrainWalkableByPos(nextPos.roomName, nextPos.x, nextPos.y)) {
                                nextDirToMove = dir;
                                break
                            }
                            /*if (creep.move(dir) == 0) {
                                return
                            }*/
                        }

                        if (nextDirToMove) {
                            creep.move(nextDirToMove);
                        }
                        else {
                            // no where to move, follow old code
                            if (enemies.length > 0) {
                                // run away from hostile
                                var range = 6; // range to start dodging
                                var nearCreeps = creep.pos.findInRange(FIND_HOSTILE_CREEPS, range - 1, { filter: i => i.getActiveBodyparts(ATTACK) > 0 || i.getActiveBodyparts(RANGED_ATTACK) > 0 });
                                if (keeperLair) {
                                    nearCreeps = nearCreeps.concat(keeperLair);
                                }
                                if (nearCreeps.length > 0) {
                                    var ret = PathFinder.search(creep.pos, _.map(nearCreeps, i => ({ pos: i.pos, range: range })), {
                                        maxRooms: 1, flee: true, roomCallback(roomName) {
                                            if (!Game.rooms[roomName] || Game.rooms[roomName].time < Game.time) {
                                                Game.rooms[roomName] = {
                                                    costMatrix: Game.rooms.createCostMatrix(roomName),
                                                    time: Game.time
                                                };
                                            }
                                            return Game.rooms[roomName].costMatrix;
                                        }
                                    });
                                    if (ret.path.length) {
                                        creep.travelTo(ret.path[0]);
                                        creep.say('flee');
                                        return true;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        catch (err) {
            console.log('action flee error')
        }
    }
}
