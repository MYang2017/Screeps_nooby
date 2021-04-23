module.exports = {
    run: function(creep, tarPosi) {
        // long distance traveler moving and pass resources function. to replace travelTo for longDistanceLorry
        
        // functions
        var ifSamePosi = function (p1, p2) {
            if (p1.x==p2.x && p1.y==p2.y && p1.roomName==p2.roomName) {
                return true
            }
            return false
        }
        
        var findPathForLdl = function (posi, goalPosi, creep) {
            var roomName = posi.roomName;
            var goals = { pos: goalPosi, range: 1 };

            let ret = PathFinder.search(
                posi, goals,
                {
                    // We need to set the defaults costs higher so that we
                    // can set the road cost lower in `roomCallback`
                    plainCost: 4,
                    swampCost: 10,
                    
                    maxRooms: posi.roomName == goals.pos.roomName ? 1 : 3,
        
                    roomCallback: function (roomName) {
        
                        let room = Game.rooms[roomName];
                        // In this example `room` will always exist, but since 
                        // PathFinder supports searches which span multiple rooms 
                        // you should be careful!
                        if (!room) return;
                        let costs = new PathFinder.CostMatrix;
        
                        // set oppo even/odd cost fucking high so they are not planned
                        let terrain = Game.map.getRoomTerrain(posi.roomName);
                        // Fill CostMatrix with default terrain costs for future analysis:
                        for(let y = 0; y < 50; y++) {
                            for(let x = 0; x < 50; x++) {
                                const tile = terrain.get(x, y);
                                const weight =
                                    tile === TERRAIN_MASK_WALL  ? 255 : // wall  => unwalkable
                                    tile === TERRAIN_MASK_SWAMP ?   5 : // swamp => weight:  5
                                                                    1 ; // plain => weight:  1
                                costs.set(x, y, weight);
                            }
                        }
        
                        room.find(FIND_STRUCTURES).forEach(function (struct) {
                            if (struct.structureType === STRUCTURE_ROAD) {
                                // Favor roads over plain tiles
                                costs.set(struct.pos.x, struct.pos.y, 1);
                            } else if (struct.structureType !== STRUCTURE_CONTAINER &&
                                (struct.structureType !== STRUCTURE_RAMPART ||
                                    !struct.my)) {
                                // Can't walk through non-walkable buildings
                                costs.set(struct.pos.x, struct.pos.y, 0xff);
                            }
                        });
        
                        room.find(FIND_CONSTRUCTION_SITES).forEach(function (site) {
                            if (site.structureType === STRUCTURE_ROAD || site.structureType === STRUCTURE_CONTAINER || site.structureType === STRUCTURE_RAMPART) {
                                // Favor roads over plain tiles
                                costs.set(site.pos.x, site.pos.y, 5);
                            }
                        });
        
                        // Avoid creeps in the room
                        room.find(FIND_CREEPS).forEach(function (creep) {
                            if (creep.memory && creep.memory.ldlmove && creep.memory.ldlmove && creep.memory.ldlmove.stuckCount && creep.memory.ldlmove.stuckCount>2) {
                                
                            }
                            costs.set(creep.pos.x, creep.pos.y, 0xff);
                        });
        
                    return costs;
                    },
                }
            );
            return ret;
        }
        
        // initite memory
        let moveMem = creep.memory.ldlmove;
        
        if (ldlmove == undefined) {
            creep.memory.ldlmove = {path: [], prevPos: {}, tarPosi: tarPosi};
        }
        else {
            if (!ifSamePosi(tarPosi, moveMem.tarPosi)) { // target changed
                // refind path
            }
            else {
                // move and pass res
            }
        }
    }
};
