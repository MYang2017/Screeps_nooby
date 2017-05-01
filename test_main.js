//module.exports.loop = function () {
    // predifine and store preferred number of all creeps in CURRENT spawn, run ONCE right after claiming a new room
    Game.spawns.Spawn1.memory.minNoHarvesters = 1;
    Game.spawns.Spawn1.memory.minNoUpgraders = 1;
    Game.spawns.Spawn1.memory.minNoBuilders = 1;
    Game.spawns.Spawn1.memory.minNoRepairers = 1;
    Game.spawns.Spawn1.memory.minNoWallRepairers = 1;
    
    Game.spawns.Spawn1.createPickuper(500);
    Game.spawns.Spawn1.createAttacker(800,'attacker','E91N11');
    
    Game.spawns.Spawn1.memory.requiredWORKParts = 5*2; // 10 resource/5 WORK parts per second
    
    for (let spawnName in Game.spawns) {
        let spawn = Game.spawns[spawnName];
        let creepsInRoom = spawn.room.find(FIND_MY_CREEPS, { filter: (c) => c.memory.role == 'harvester' });
    }
        // calculate No of each roles
        var NoHarvesters = _.sum(creepsInRoom, (c) => c.memory.role == 'harvester');
        var NoUpgraders = _.sum(creepsInRoom, (c) => c.memory.role == 'upgrader');
        var NoBuilders = _.sum(creepsInRoom, (c) => c.memory.role == 'builder');
        var NoRepairers = _.sum(creepsInRoom, (c) => c.memory.role == 'repairer');
        var NoWallRepairers = _.sum(creepsInRoom, (c) => c.memory.role == 'wallRepairer');
        
        // calculate effective WORK parts
        
        
        // if effectove WORK parts < required WORK parts, spawn a new creep
//};

// north room
else if (NoReservers_E92N12 < minNoReservers_E92N12) {
    spawn.createReserver('E92N12');
}
else if (NoLongDistanceBuilders_E92N12 < minNoLongDistanceBuilders_E92N12) {
    spawn.createLongDistanceBuilder(energy, 'E92N12');
}
// east room
else if (NoReservers_E93N11 < minNoReservers_E93N11) {
    spawn.createReserver('E93N11');
}
else if (NoLongDistanceBuilders_E93N11 < minNoLongDistanceBuilders_E93N11) {
    spawn.createLongDistanceBuilder(energy, 'E93N11');
}
// west room
else if (NoReservers_E91N11 < minNoReservers_E91N11) {
    spawn.createReserver('E91N11');
}
else if (NoLongDistanceBuilders_E91N11 < minNoLongDistanceBuilders_E91N11) {
    spawn.createLongDistanceBuilder(energy, 'E91N11');
}


/*// calculate No. of long distance harvesters in each reservable rooms around current spawn room
let NoLongDistanceHarvesters = _.sum(Game.creeps, (c) => c.memory.role == 'longDistanceHarvester' && c.memory.target == remoteMiningRoomName);
eval('var NoLongDistanceHarvesters_'+remoteMiningRoomName+' = NoLongDistanceHarvesters;');
//console.log(remoteMiningRoomName,NoLongDistanceHarvesters);
*/

                // calculate No. of lorries in each reservable rooms around current spawn room
                let NoLongDistanceLorries = _.sum(Game.creeps, (c) => c.memory.role == 'longDistanceLorry' && c.memory.target == remoteMiningRoomName);
                eval('var NoLongDistanceLorries_'+remoteMiningRoomName+' = NoLongDistanceLorries;');
                //console.log(remoteMiningRoomName,NoLongDistanceLorries);

if (creep.room.name == creep.memory.home) {
                var structure = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: (s) => ( (s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION || s.structureType == STRUCTURE_TOWER) && s.energy < s.energyCapacity) })
                if (structure == undefined) {
                    structure = creep.room.storage;
                }
                if (structure == undefined) {
                    structure = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: s => s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0});
                }
                if (structure != undefined) {
                    if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(structure);
                    }
                }
            }
            else {
                creep.moveTo(new RoomPosition(25,25, creep.memory.home));
                //var exit = creep.room.findExitTo(creep.memory.home);
                //creep.moveTo(creep.pos.findClosestByRange(exit));
            }
            
            
            
            //find spawn, extensions and towers in local room, if there is one, fill it up
            var structure = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: (s) => ( (s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION || s.structureType == STRUCTURE_TOWER) && s.energy < s.energyCapacity) })
            if (structure == undefined) { // cannot find one
                if (creep.room.name == creep.memory.home) { // if it is in the home room and cannot find any unfilled spawn extensions or towers, find storage
                    structure = creep.room.storage;
                }
                else {
                    creep.moveTo(new RoomPosition(25,25, creep.memory.home));
                    //var exit = creep.room.findExitTo(creep.memory.home);
                    //creep.moveTo(creep.pos.findClosestByRange(exit));
                }
            }
            if (structure != undefined) { // if there is a storage, store energy in the storage
                if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(structure);
                }
            }
            
for (let creepName in Memory.creeps) {
    creep = Game.creeps[creepName];
    if (creep.memory.role == 'begger') {
        let temp = creep.memory.target;
        creep.memory.target = creep.memory.home;
        creep.memory.home = temp;
    }
}
    }
}








module.exports = {
    run: function(creep) {
        ifMineral = mineralNeedsCollect(creep.room);
        creepCarrying = _.sum(creep.carry);
        
        if (creep.memory.working == true && creepCarrying == 0) {
            creep.memory.working = false;
        }
        else if (creep.memory.working == false && creepCarrying == creep.carryCapacity) {
            creep.memory.working = true;
        }
        
        if (creep.memory.working == true) { // if filled with energy, transfer to spawn, extensions or towers
            if (creep.carry.energy>0) { // creep is tranfering energy
                creep.say('deli E');
                var structure = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: (s) => ( (s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION || s.structureType == STRUCTURE_TOWER) && s.energy < s.energyCapacity) })
                if (structure == undefined) { // if spawn extensions or towers are full, go find storage
                    structure = creep.room.storage;
                }
                if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) { // transfer energy to storage
                    creep.moveTo(structure);
                }
            }
            else { // if carrying something is not energy
                var resourceType = ifMineral[1];
                creep.say('deli '+resourceType);
                var structure = creep.room.storage;
                if (creep.transfer(structure, resourceType) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(structure);
                }
            }
        }
        else { // if not working: find a none empty container and get energy from containers // 
            if (ifMineral == undefined) { // creep is getting energy
                creep.say('deli E');
                let container = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: s => s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0});
                if (container == undefined) {
                    container = creep.room.storage;
                }
                if (container != undefined) { // if all containers are 0, take energy from storage
                    if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(container);
                    }
                }
            }
            else { // get minerals
                var resourceType = ifMineral[1];
                let container = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: s => s.structureType == STRUCTURE_CONTAINER && s.store[resourceType] > 0});
                if (container != undefined) { // if all containers are 0, take energy from storage
                    if (creep.withdraw(container, resourceType) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(container);
                    }
                }
            }
        }
    }
};


module.exports = {
    run: function(creep) {
        ifMineral = mineralNeedsCollect(creep.room);
        creepCarrying = creep.carry.energy;
        if ( (ifMineral == undefined) || creepCarrying>0 ) { // undefined for energy mining, or still carrying energy
            creep.say('deli E');
            if (creep.memory.working == true && creep.carry.energy == 0) {
                creep.memory.working = false;
            }
            else if (creep.memory.working == false && creep.carry.energy == creep.carryCapacity) {
                creep.memory.working = true;
            }
    
            if (creep.memory.working == true) { // if filled with energy, transfer to spawn, extensions or towers
                var structure = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: (s) => ( (s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION || s.structureType == STRUCTURE_TOWER) && s.energy < s.energyCapacity) })
                if (structure == undefined) { // if spawn extensions or towers are full, go find storage
                    structure = creep.room.storage;
                }
                if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) { // transfer energy to storage
                    creep.moveTo(structure);
                }
            }
            else { // if not working: find a none empty container and transfer energy to structures need energy (spawn, tower, extension)
                let container = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: s => s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0});
                if (container == undefined) {
                    container = creep.room.storage;
                }
                if (container != undefined) { // if all containers are 0, take energy from storage
                    if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(container);
                    }
                }
            }
        }
        else { // there is mineral in container > 500
            resourceType = ifMineral[1];
            creep.say('deli '+resourceType);
            if (creep.memory.working == true && _.sum(creep.carry) == 0) {
                creep.memory.working = false;
            }
            else if (creep.memory.working == false && _.sum(creep.carry) == creep.carryCapacity) {
                creep.memory.working = true;
            }
    
            if (creep.memory.working == true) {
                var structure = creep.room.storage;
                if (creep.transfer(structure, resourceType) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(structure);
                }
            }
            else { // if not working: find a none empty container and transfer energy to structures need energy (spawn, tower, extension)
                let container = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: s => s.structureType == STRUCTURE_CONTAINER && s.store[resourceType] > 0});
                if (container != undefined) { // if all containers are 0, take energy from storage
                    if (creep.withdraw(container, resourceType) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(container);
                    }
                }
            }
        }
            
    }
};

// initializing which wall to build
Game.rooms['E92N12'].memory.toBuild = whichWallToBuild(Game.rooms['E92N12']).;
