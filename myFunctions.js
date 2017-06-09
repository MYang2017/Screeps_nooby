global.calculateNeighbourNames = function(roomName) {
        var neighbours = [];
        var index = [-1,0,1];
        var roomNameSeparated = roomName.match(/[a-zA-Z]+|[0-9]+/g);
        for (let i = 0; i<3; i++) {
            for (let j = 0; j<3; j++) {
                neighbours.push( roomNameSeparated[0]+
                                 ''+(parseInt(roomNameSeparated[1])+index[i])+
                                 roomNameSeparated[2]+
                                 ''+(parseInt(roomNameSeparated[3])+index[j])
                                );
            }
        }
        return neighbours
    }

global.ifSurrounded = function(creep) {
    var index = [-1,0,1]
    for (let i = 0; i<3; i++) {
        for (let j = 0; j<3; j++) {
            // if terrain is plain or swamp and it is not occupied by other creeps
            x = creep.pos.x + index[i];
            y = creep.pos.y + index[j];
            //console.log(x,y)
            if (((creep.room.lookForAt(LOOK_TERRAIN,x,y)=='plain')||(creep.room.lookForAt(LOOK_TERRAIN,x,y)=='swamp'))
                &&(creep.room.lookForAt(LOOK_CREEPS,x,y)[0]==undefined)) {
                    return [x,y]
            }
        }
    }
    return null
}

global.overlappedTiles = function(creep,pos1,pos2) {
    let pos1_neibs = [];
    let pos2_neibs = [];
    var index = [-1,0,1]
    for (let i = 0; i<3; i++) {
        for (let j = 0; j<3; j++) {
            // if terrain is plain or swamp and it is not occupied by other creeps
            let x1 = pos1.x + index[i];
            let y1 = pos1.y + index[j];
            let x2 = pos2.x + index[i];
            let y2 = pos2.y + index[j];
            if ((creep.room.lookForAt(LOOK_TERRAIN,x1,y1)=='plain')||(creep.room.lookForAt(LOOK_TERRAIN,x1,y1)=='swamp')) {
                pos1_neibs.push({x: x1, y: y1});
            }
            if ((creep.room.lookForAt(LOOK_TERRAIN,x2,y2)=='plain')||(creep.room.lookForAt(LOOK_TERRAIN,x2,y2)=='swamp')) {
                pos2_neibs.push({x: x2, y: y2});
            }
        }
    }
    //console.log(pos1_neibs)
    for (let xy1 of pos1_neibs) {
        x1 = xy1.x;
        y1 = xy1.y;
        for (let xy2 of pos2_neibs) {
            x2 = xy2.x;
            y2 = xy2.y;
            if (x1 == x2 && y1 == y2) {
              //console.log(x1,y1);
              return xy1
            }
        }
    }

}

global.validSurrounds = function(obj) {
    var index = [-1,0,1]
    for (let i = 0; i<3; i++) {
        for (let j = 0; j<3; j++) {
            // if terrain is plain or swamp
            x = obj.pos.x + index[i];
            y = obj.pos.y + index[j];
            //console.log(x,y)
            if (((obj.room.lookForAt(LOOK_TERRAIN,x,y)=='plain')||(creep.room.lookForAt(LOOK_TERRAIN,x,y)=='swamp'))) {
                    return [x,y]
            }
        }
    }
    return null
}

global.determineIfFucked = function(myRoom) {
    var targets = myRoom.find(FIND_HOSTILE_CREEPS, {filter: s => (!allyList().includes(s.owner.username))});
    //var mines = myRoom.find(FIND_MY_CREEPS);
    var enemyPartsCount = 0;
    var myPartsCount = 0;
    for (let target of targets) {
        enemyPartsCount += target.getActiveBodyparts(ATTACK) + 2*target.getActiveBodyparts(RANGED_ATTACK) + 3*target.getActiveBodyparts(HEAL);
    }
    for (let name in Game.creeps) {
        var mine = Game.creeps[name];
        if (mine.memory.target == myRoom.name) { // if my solder is going to the room under attack
          myPartsCount += mine.getActiveBodyparts(ATTACK) + 2*mine.getActiveBodyparts(RANGED_ATTACK) + 3*mine.getActiveBodyparts(HEAL);
        }
    }
    /*for (let mine of mines) {
        partsCount -= mine.getActiveBodyparts(ATTACK) + 2*mine.getActiveBodyparts(RANGED_ATTACK) + 3*mine.getActiveBodyparts(HEAL);
    }*/
    return [enemyPartsCount-myPartsCount, enemyPartsCount]
}

global.determineIfFuckedRemote = function(myRoom,creepsInHomeAndRemoteRoom) {
    var targets = myRoom.find(FIND_HOSTILE_CREEPS, {filter: s => (!allyList().includes(s.owner.username))});
    //var mines = myRoom.find(FIND_MY_CREEPS);
    var enemyPartsCount = 0;
    let enermyCount = 0;
    var myPartsCount = 0;
    for (let target of targets) {
        enemyPartsCount += target.getActiveBodyparts(ATTACK) + 2*target.getActiveBodyparts(RANGED_ATTACK) + 3*target.getActiveBodyparts(HEAL);
        enermyCount += 1;
    }
    for (let myCreep of creepsInHomeAndRemoteRoom) {
        if (myCreep.memory.target == myRoom.name) { // if my solder is going to the room under attack
          if (myCreep.name == undefined) { // imaginary creep in spawning queue
              if (myCreep.memory.role == 'ranger') { // if it's ranger than 3 range parts
                  myPartsCount += (2*3+1)*6; // 3 melee, 1 ranged, and the power is 6 times
              }
          }
          else {
            myPartsCount += myCreep.getActiveBodyparts(ATTACK) + 2*myCreep.getActiveBodyparts(RANGED_ATTACK) + 3*myCreep.getActiveBodyparts(HEAL);
          }
        }
    }
    /*for (let mine of mines) {
        partsCount -= mine.getActiveBodyparts(ATTACK) + 2*mine.getActiveBodyparts(RANGED_ATTACK) + 3*mine.getActiveBodyparts(HEAL);
    }*/
    return [enemyPartsCount-myPartsCount, enemyPartsCount, enermyCount]
}

global.mineralNeedsCollect = function(myRoom) {
    var mineral = myRoom.find(FIND_MINERALS)[0]
    var mineralType = mineral.mineralType;
    var mineralContainer =  mineral.pos.findInRange(FIND_STRUCTURES, 1, {filter: s => s.structureType == STRUCTURE_CONTAINER})[0];
    if ((mineralContainer != undefined)&&(mineral.mineralAmount>0)) { // if there is a mineral mine (becaue there is container)
        //console.log(mineralType,mineralContainer.store);
        //console.log(JSON.stringify(mineralContainer ))
        var mineralStored = mineralContainer.store[mineralType];
        return [mineralStored, mineralType];
    }
    else { // there is no mineral mine RCL<6
        return undefined;
    }
}
global.bornToBeWrong = function() {
    try {
        asd+ok;
    }
    catch(err) {
        console.log('error: role name fault');
    }
}

global.linkTransfer = function(spawn,remoteMiningRoomName) {
    spawnName = spawn.room.name;
    if ((Game.flags['link'+remoteMiningRoomName]!=undefined)&&(Game.flags['link'+spawnName]!=undefined)) { // if links are there
      var giver = Game.flags['link'+remoteMiningRoomName].pos.findInRange(FIND_STRUCTURES, 1, {filter: s => s.structureType == STRUCTURE_LINK})[0];
      var getter = Game.flags['link'+spawnName].pos.findInRange(FIND_STRUCTURES, 1, {filter: s => s.structureType == STRUCTURE_LINK})[0];
      //var resevior = Game.flags['link'+remoteMiningRoomName].pos.findInRange(FIND_STRUCTURES, 1, {filter: s => s.structureType == STRUCTURE_CONTAINER})[0];
      if (getter.energy < getter.energyCapacity) { // if getter has space
          if (giver.transferEnergy(getter, Math.min(giver.energy,getter.energyCapacity-getter.energy))==0) { // transfer giver energy or getter gap, whichever is smaller
            return true
          }
          else {
            return false
          }
      } // getter is full no need to transfer
      return false
    }
    else { // no links there
      return false
    }
}

global.linkTransferToCentre = function(getter,givers) {
    for (let giver of givers) { // loop through all giver-links
      if (getter.energy < getter.energyCapacity) { // if getter has space
          if (giver.transferEnergy(getter, Math.min(giver.energy,getter.energyCapacity-getter.energy))==0) { // transfer giver energy or getter gap, whichever is smaller
            return
          }
      } // getter is full no need to transfer
    }
}

global.whichWallToBuild = function(room) {
    var walls = room.find(FIND_STRUCTURES, {filter:c => c.structureType == STRUCTURE_WALL});
    //for (let wall of walls) {
    //    console.log(wall.hits);
    //}
    var byHits = walls.slice(0);
    byHits.sort(function(a,b) {
        return a.hits - b.hits;
    });
    //console.log('by hits:');
    //console.log(byHits);
    //for (let wall of byHits) {
    //   console.log(wall.hits);
    //}
    return byHits[0]
}

global.whichRampartToBuild = function(room) {
    var walls = room.find(FIND_MY_STRUCTURES, {filter:c => c.structureType == STRUCTURE_RAMPART});
    //for (let wall of walls) {
    //    console.log(wall.hits);
    //}
    var byHits = walls.slice(0);
    byHits.sort(function(a,b) {
        return a.hits - b.hits;
    });
    //console.log('by hits:');
    //console.log(byHits);
    //for (let wall of byHits) {
    //   console.log(wall.hits);
    //}
    return byHits[0]
}

global.runEveryTicks = function(ticks) {
    // on average, run a command every 'ticks' ticks
    rnd = Math.random();
    if (rnd<1/ticks) {
        return true;
    }
    else {
        return false;
    }
}

global.evaluateEnergyResources = function(creep, ifLink, ifStorage, ifDropped, ifContainer) { // determine which resource to get
    var room = creep.room;
    var RCL;
    if (creep.room.controller) {
        RCL = creep.room.controller.level;
    }
    else {
        RCL = 0; // for keeper room
    }

    var linkWeight = 1.5;
    var storageWeight = 1;
    var droppedWeight = 2; var supperDroppedWeight = 4;
    var containerWeight = 1;

    var goToId = undefined;
    var resourceness = 0;
    var energyDropped = false;

    if ((creep.memory.role == 'longDistanceBuilder')||(creep.memory.role == 'harvester')||(creep.memory.role == 'keeperLairLorry')) {
      var containers = room.find(FIND_STRUCTURES, {filter : c => c.structureType == STRUCTURE_CONTAINER});
      let containersResource = 0;
      for (let container of containers) {
          containersResource += container.store.energy;
      }
      if (containersResource>0) {
        ifLink = false;
        ifStorage = false;
      }
      else {
        var dropped = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {filter: c => ((c.resourceType == RESOURCE_ENERGY) && (c.pos.findInRange(FIND_HOSTILE_CREEPS, 3).length == 0))});
        if (dropped != undefined) {
          return [dropped.id,true]
        }
        else {
          let energyResources = room.find(FIND_SOURCES)
          let energySource = creep.pos.findClosestByRange(FIND_SOURCES);// find closest energy source
          if (((energySource.energy>0)&&(ifSurrounded(energySource) == null)&&(creep.pos.getRangeTo(energySource)>1))||(energySource.energy==0)) { // if full
              let indexOfCurrent = energyResources.indexOf(energySource); // go to the other one
              goToId = energyResources[1-indexOfCurrent].id;
          }
          else { // not full go to the nearest one
              goToId = energySource.id;
          }
          return [undefined, goToId]
        }
      }
    }
    else {
        if ((RCL<2)||(_.sum(updateCreepsInRoomWithSpawningByRoom(creep.room), (c) => c.memory.role == 'miner'||c.memory.role == 'lorry'||c.memory.role == 'pickuper') < 2 )) { // no container mining, find dropped energy first
            var dropped = room.find(FIND_DROPPED_RESOURCES, {filter: {resourceType: RESOURCE_ENERGY}})[0];
            if (dropped != undefined) {
              return [dropped.id,true]
            }
            else { // if no dropped find energy sources
                let energyResources = room.find(FIND_SOURCES)
                let energySource = creep.pos.findClosestByPath(FIND_SOURCES);// find closest energy source
                if (((energySource.energy>0)&&(ifSurrounded(energySource) == null)&&(creep.pos.getRangeTo(energySource)>1))||(energySource.energy==0)) { // if full
                    let indexOfCurrent = energyResources.indexOf(energySource); // go to the other one
                    goToId = energyResources[1-indexOfCurrent].id;
                }
                else { // not full go to the nearest one
                    goToId = energySource.id;
                }
                return [undefined, goToId]
            }
        }

      if ((RCL<5)||(_.sum(Game.rooms[creep.room.name].find(FIND_MY_STRUCTURES, {filter:c=> c.structureType==STRUCTURE_LINK}))==0)) { // no storage no link mining
        ifLink = false;
        if (creep.room.storage == undefined) {
          ifStorage = false;
        }
      }
      else {
        if (Game.flags['link'+room.name]== undefined) {
          ifLink = false;
        }
      }

    }

    if (ifLink) { // find the getter link in creep's room
      var link = Game.flags['link'+room.name].pos.findInRange(FIND_STRUCTURES, 1, {filter: s => s.structureType == STRUCTURE_LINK})[0];
      let range = creep.pos.getRangeTo(link)+1;
      let energy = Math.min( link.energy, creep.carryCapacity - creep.carry.energy ); // how much energy can be taken, min of stored energy or space of creep
      if (linkWeight*energy/range > resourceness) {
        resourceness = linkWeight*energy/range;
        goToId = link.id;
      }
    }
    // no need to find giver links, energy will be teleported in anyways
    /*if (ifLink) { // find energy in links
      var links = room.find(FIND_MY_STRUCTURES, {filter : c => c.structureType == STRUCTURE_LINK});
      for (let link of links) {
        let range = creep.pos.getRangeTo(link);
        let energy = Math.min( link.energy, creep.carryCapacity - creep.carry.energy ); // how much energy can be taken, min of stored energy or space of creep
        if (linkWeight*energy/range > resourceness) {
          resourceness = linkWeight*energy/range;
          goToId = link.id;
        }
      }
    }*/

    if (ifStorage) { // find energy in links
      var storage = room.storage;
      let range = creep.pos.getRangeTo(storage)+1; // +1 tp prevent 0 in demoniator, if creep is standing on source
      let energy = Math.min( storage.store.energy, creep.carryCapacity - creep.carry.energy ); // how much energy can be taken, min of stored energy or space of creep
      if (storageWeight*energy/range > resourceness) {
        resourceness = storageWeight*energy/range;
        goToId = storage.id;
      }
    }

    if (ifDropped) { // find energy in links
      var droppeds = room.find(FIND_DROPPED_RESOURCES, {filter: c => ((c.resourceType == RESOURCE_ENERGY) && (c.pos.findInRange(FIND_HOSTILE_CREEPS, 3).length == 0))});
      for (let dropped of droppeds) {
        if (dropped.energy>1000) { // if dropped energy is quite a big amount, clear that dropped energy first
          let range = creep.pos.getRangeTo(dropped)+1;
          let energy = Math.min( dropped.energy, creep.carryCapacity - creep.carry.energy ); // how much energy can be taken, min of stored energy or space of creep
          if (supperDroppedWeight*energy/range > resourceness) {
            resourceness = droppedWeight*energy/range;
            goToId = dropped.id;
            energyDropped = true;
          }
        }
        else {
          let range = creep.pos.getRangeTo(dropped)+1;
          let energy = Math.min( dropped.energy, creep.carryCapacity - creep.carry.energy ); // how much energy can be taken, min of stored energy or space of creep
          if (droppedWeight*energy/range > resourceness) {
            resourceness = droppedWeight*energy/range;
            goToId = dropped.id;
            energyDropped = true;
          }
        }
      }
    }

    if (ifContainer) { // find energy in links
      var containers = room.find(FIND_STRUCTURES, {filter : c => ((c.structureType == STRUCTURE_CONTAINER)&& (c.pos.findInRange(FIND_HOSTILE_CREEPS, 3).length == 0))});
      for (let container of containers) {
        /*if (container.store.energy>1400) { // if container energy is quite a big amount, clear its energy first
          resourceness = 999999999999999999; // if creep is within 8 grids of a link with 300 capacity that is 1.5*300/8 = 500
          goToId = container.id;
          energyDropped = false;
        }
        else { // all containers are not very full, execute as usual*/
          let range = creep.pos.getRangeTo(container)+1;
          let energy = Math.min( container.store.energy, creep.carryCapacity - creep.carry.energy ); // how much energy can be taken, min of stored energy or space of creep
          if (containerWeight*energy/range > resourceness) {
            resourceness = containerWeight*energy/range;
            goToId = container.id;
            energyDropped = false;
          }
        //}
      }
    }

    return [goToId,energyDropped]
}

global.getTargetByFlag = function(flagName, targetType) {
  if (Game.flags[flagName] != undefined) {
    var targets = Game.flags[flagName].room.lookAt(Game.flags[flagName].pos);
    //console.log(targets);
    for (let target of targets) {
      //console.log(target['type'])
      if (target['type'] == targetType) {
        return Game.getObjectById(target[targetType].id);
      }
    }
    console.log('no '+targetType+' found');
  }
  else {
    console.log('set flag: '+flagName);
  }
}

global.whichSpawnSpawns = function(mainSpawn,subSpawn) {
    if (subSpawn == undefined) { // if there is no subSpawn, use main spawn
      return mainSpawn;
    }
    else { // there are two spawns, determine which to use
        if (mainSpawn.spawning == null) { // spawn is busy creating creeps
          return mainSpawn;
        }
        else { // main spawn is free, use main spawn
            let totalTime = mainSpawn.spawning.needTime;
            let remainTime = mainSpawn.spawning.remainingTime;
            if ((totalTime - remainTime)>2) { // calculation of find(FIND_MY_CREEPS) has 1 tick delay on creeps being spawned
              return subSpawn;
            }
            else {
              return mainSpawn;
            }
        }
    }
    //return mainSpawn;
}

global.updateCreepsInRoomWithSpawning = function(spawn) {
    let room = spawn.room;
    let creepsInRoom = room.find(FIND_MY_CREEPS);

    // add being-spawned creeps into creepsInRoom as well
    if (spawn.spawning != null) { // main spawn is spawning
        creepsInRoom.push(Game.creeps[spawn.spawning.name]); // add the spawning creep into creepsInRoom list
    }
    // for sub spawns
    var subSpawn = undefined;
    if (spawn.memory.subSpawn != undefined) {
        subSpawn = Game.spawns[spawn.memory.subSpawn];
        if (subSpawn.spawning != null) { // main spawn is spawning
          creepsInRoom.push(Game.creeps[subSpawn.spawning.name]); // add the spawning creep into creepsInRoom list
        }
    }
    return creepsInRoom
}

global.calculateMyCreepsInRoom = function(roomName) {
    if (Game.rooms[roomName] != undefined) {
        let room = Game.rooms[roomName];
        let creepsInRoom = room.find(FIND_MY_CREEPS);
        return [true,creepsInRoom]
    }
    else {
        return [false,undefined]
    }
}

global.getAllMyCreepsWithSpawning = function(roomName) {
    let allMyCreeps = [];
    for (let name in Game.creeps) {
        allMyCreeps.push(Game.creeps[name]);
    }
    let room = Game.rooms[roomName];
    let spawns = room.find(FIND_MY_STRUCTURES, {filter:s=>s.structureType==STRUCTURE_SPAWN});

    // add being-spawned creeps into creepsInRoom as well
    for (let spawn of spawns) {
        if (spawn.spawning != null) { // main spawn is spawning
            allMyCreeps.push(Game.creeps[spawn.spawning.name]); // add the spawning creep into creepsInRoom list
        }
    }
    return allMyCreeps
}

global.updateCreepsInRoomWithSpawningByRoom = function(room) {
      let creepsInRoom = room.find(FIND_MY_CREEPS);
      let spawns = room.find(FIND_MY_STRUCTURES, {filter:s=>s.structureType==STRUCTURE_SPAWN});

      // add being-spawned creeps into creepsInRoom as well
      for (let spawn of spawns) {
          if (spawn.spawning != null) { // main spawn is spawning
              creepsInRoom.push(Game.creeps[spawn.spawning.name]); // add the spawning creep into creepsInRoom list
          }
      }
      return creepsInRoom
}

global.testSome = function() {
  room = Game.spawns['Spawn_E92N12'].room;
  var wanted = room.find(FIND_MY_CREEPS, {filter:c => c.memory.role == 'miner'});
  console.log(wanted[0].hits)
  for(var creep in wanted) {
 	console.log(wanted[creep].hits);
  }
  /*if (!_.some(creepsInRoom, c => c.memory.role == 'miner' && c.memory.sourceID == source.id)) { // if there is no miner going to THE source
      let containers = source.pos.findInRange(FIND_STRUCTURES, 1, {filter: s => s.structureType == STRUCTURE_CONTAINER});
      if (containers.length>0) {
          spawningCreepName = this.createMiner(source.id, undefined, currentRCL, true);
          break;
      }
  }*/
}

global.assignController = function() {
    let creeps = Game.creeps;
    for (let creepName in creeps) {
        let creep = Game.creeps[creepName];
        if (creep.memory.role == 'reserver') {
            creep.signController(creep.room.controller, 'Territory of the Twilight Kingdoms of the East')
        }
    }
}

global.ifConstructionSiteInRoom = function(room) {
    if (room.find(FIND_MY_CONSTRUCTION_SITES).length > 0) {
        return true
    }
    return false
}

global.ifConstructionSiteInRoom2 = function(roomName) {
    let constructionSites = Game.constructionSites;
    for (let constructionSiteId in constructionSites) {
        let constructionSite = Game.constructionSites[constructionSiteId];
        if (constructionSite.room.name == roomName) {
            return true;
        }
    }
}

global.towerRepairInPeace = function(room) {
  var towers = room.find(FIND_MY_STRUCTURES, {filter:s=>s.structureType==STRUCTURE_TOWER});
  for (let tower of towers) {
      tower.repairNoneWalls();
  }
}

global.unspentEnergySendTo = function(storageRoomName, terminalRoomName) {
    room = Game.rooms[storageRoomName];
    let creepsInRoom = updateCreepsInRoomWithSpawningByRoom(room);
    if ( (Game.rooms[storageRoomName].storage.store.energy > 500000)&&(_.sum(creepsInRoom, c => c.memory.role == 'transporter')<1) ) {
        //Game.spawns['Spawn_E91N16'].createTransporter('energy');
        console.log('create transporter in room' + storageRoomName)
        Game.rooms[storageRoomName].memory.forSpawning.spawningQueue.push({memory:{role: 'transporter', resourceType: 'energy'},priority: 2});
    }

    if ( (Game.rooms[storageRoomName].terminal.store.energy > 120000) ) {
      console.log(storageRoomName + 'sent energy to ' + terminalRoomName);
        Game.rooms[storageRoomName].terminal.send('energy',100000,terminalRoomName,'have fun!')
    }
}

global.superUpgraderBalancing = function(roomName) {
    let room = Game.rooms[roomName];
    let storageEnergy = room.storage.store.energy;
    if (storageEnergy>400000) { // more energy, should be used for upgrading!
        room.memory.forSpawning.roomCreepNo.minCreeps.superUpgrader = 2;
    }
    else if (storageEnergy<150000){
        room.memory.forSpawning.roomCreepNo.minCreeps.superUpgrader = 0;
    }
    else if (storageEnergy<200000){
        room.memory.forSpawning.roomCreepNo.minCreeps.superUpgrader = 1;
    }
}



global.creepTest = function() {
    let x = {memory:{role:'fucker'}, priority:1};
    console.log(x.memory.role);
}

global.foo = function() {
    console.log('hahaha!')
}

global.aa = function() {
    var attackers = Game.rooms['E95N17'].find(FIND_MY_CREEPS);
    for (let attacker of attackers) {
      if ((attacker.memory.role == 'melee')) {
        attacker.memory.target = 'E93N17';
      }
    }
}

global.bb = function() {
  let room = Game.rooms['E92N11'];
  let labs = room.find(FIND_MY_STRUCTURES, {filter: c => c.structureType == STRUCTURE_LAB});
  for (let lab of labs) {
    let flag = room.lookForAt(LOOK_FLAGS,lab)[0];
    console.log(flag.name,flag.color)
  }
}

global.cc = function() {
    let test = '12345';
    let len = test.length;
    console.log(test.substring(1,len))
}

global.massKill = function() {
    let creepsInRoom = Game.rooms['E92N11'].find(FIND_MY_CREEPS);
    for (let i = 0; i<10; i++) {
        let creep = creepsInRoom[i];
            if (creep.memory.role == 'lorry') {
                console.log(creep.name,creep.suicide())
            }
    }
}

global.ee = function() {
    for (let i = 0; i<10; i++) {
    }
}

global.ff = function(x,y) {
    if (y) {
        return x+y
    }
    else {
        return x
    }
}
