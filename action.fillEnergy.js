module.exports = {
    run: function (creep, emergency=false) {
        if (creep.memory.working == true) {
            for (const resourceType in creep.carry) {
                if (resourceType == RESOURCE_ENERGY) { // carrying energy
                    if (emergency) {
                        let structure = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: (s) => ( s.isActive() && (((s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION || (s.structureType == STRUCTURE_TOWER && (s.energy < s.energyCapacity * 0.7))) ) || s.structureType == STRUCTURE_LAB) && s.energy < s.energyCapacity) })
                        if (creep.transfer(structure, resourceType) == ERR_NOT_IN_RANGE) {
                            creep.travelTo(structure, {maxRooms: 1});
                        }
                        return
                    }
                    let structure = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: (s) => ( s.isActive() && (((s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION || (s.structureType == STRUCTURE_TOWER && (s.energy < s.energyCapacity * 0.7))) && ( s.room.find(FIND_MY_CREEPS, {filter:c=>(c.memory.role=='linkKeeper')}).length==0 || s.pos.findInRange(FIND_MY_CREEPS, 1, {filter:c=>(c.memory.role=='dickHead'||c.memory.role=='linkKeeper'||c.memory.role=='dickHeadpp'||c.memory.role=='newDickHead'||c.memory.role=='maintainer'||c.memory.role=='balancer'||c.memory.role=='miner')&&c.getActiveBodyparts(CARRY)>0}).length==0)) || s.structureType == STRUCTURE_LAB) && s.energy < s.energyCapacity) })
                    // fill recctn
                    if (structure == undefined) {
                        let recctns = creep.room.find(FIND_STRUCTURES, {filter:t=>t.structureType==STRUCTURE_CONTAINER && t.pos.findInRange(FIND_STRUCTURES, 1, {filter: e=>e.structureType==STRUCTURE_SPAWN}).length>0});
                        if (recctns.length>0) {
                            if (recctns[0].store.energy<1500) {
                                structure = recctns[0];
                            }
                        }
                    }
                    // fill upgrade container
                    if (structure == undefined) {
                        let potents = creep.room.find(FIND_STRUCTURES, {filter:t=>t.structureType==STRUCTURE_CONTAINER && t.pos.getRangeTo(creep.room.controller)<4 && t.pos.findInRange(FIND_SOURCES).length==0});
                        if (potents.length>0) {
                            if (potents[0].store.energy<1500) {
                                structure = potents[0];
                            }
                        }
                    }
                    if (structure == undefined) {
                        structure = creep.room.storage;
                        if (structure) {
                            if (structure.store[RESOURCE_ENERGY] > 0.8 * structure.storeCapacity) { // storage is almost full
                                structure = creep.room.terminal;
                            }
                        }
                        else {
                            // storage is not defined, move to centre link point and drop resource
                            /*let imaginaryStorage = Game.flags['link'+creep.room.name];
                            if (creep.pos.getRangeTo(imaginaryStorage)>3) {
                                creep.travelTo(imaginaryStorage);
                            }
                            else {
                                creep.drop(RESOURCE_ENERGY);
                            }*/
                            //actionAvoid.run(creep);

                            // early level upgrader feeding
                            if (creep.room.memory.newBunker && creep.room.memory.newBunker.layout && creep.room.memory.newBunker.layout.recCtn && creep.room.memory.newBunker.layout.recCtn.length>0) {
                                let rec = Game.getObjectById(creep.room.memory.newBunker.layout.recCtn[0].id);
                                if (rec) {
                                    if (creep.pos.getRangeTo(rec)>0) {
                                        creep.travelTo(rec, {maxRooms:1});
                                    }
                                    else {
                                        creep.drop('energy');
                                    }
                                }
                                else {
                                    let linker = creep.room.find(FIND_MY_CREEPS, {filter:c=>c.memory.role=='linkKeeper'});
                                    if (linker.length>0) {
                                        if (creep.pos.getRangeTo(linker[0])>1) {
                                            creep.travelTo(linker[0], {maxRooms:1});
                                        }
                                        else {
                                            creep.transfer(linker[0], 'energy');
                                        }
                                    }
                                    else {
                                        let sps = creep.room.find(FIND_MY_STRUCTURES, {filter:c=>c.structureType==STRUCTURE_SPAWN});
                                        if (sps.length>0) {
                                            if (creep.pos.getRangeTo(sps[0])>1) {
                                                creep.travelTo(sps[0], {maxRooms:1});
                                            }
                                            else {
                                                creep.transfer(sps[0], 'energy');
                                            }
                                        }
                                        else {
                                            
                                        }
                                    }
                                }
                                return
                            }
                            else {
                                let babies = creep.pos.findClosestByRange(FIND_MY_CREEPS, { filter: c => c.memory.role == 'upgrader' && c.store.energy < 0.5 * c.store.getCapacity() })
                                if ((babies) && (creep.transfer(babies, resourceType) == ERR_NOT_IN_RANGE)) {
                                    creep.travelTo(babies, {maxRooms: 1});
                                }
                            }
                        }
                    }
                    if (creep.pos.getRangeTo(structure)>1) {
                        creep.travelTo(structure, {maxRooms: 1});
                    }
                    else {
                        creep.transfer(structure, resourceType);
                    }
                }
                else { // carrying minerals
                    var structure = creep.room.terminal;
                    if (structure == undefined || _.sum(structure.store) > 250000) {
                        structure = creep.room.storage;
                        if (structure == undefined) {
                            creep.memory.working = false; // no storage or terminal build yet, fuck minerals
                        }
                    }
                    if (creep.transfer(structure, resourceType) == ERR_NOT_IN_RANGE) {
                        creep.travelTo(structure, {maxRooms: 1});
                    }
                }
            }
        }
    }
};
