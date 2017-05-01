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

global.determineIfFucked = function(myRoom) {
    var targets = myRoom.find(FIND_HOSTILE_CREEPS, {filter: s => (!allyList().includes(s.owner))});
    var partsCount = 0;
    for (let target of targets) {
        partsCount += target.getActiveBodyparts(ATTACK) + 2*target.getActiveBodyparts(RANGED_ATTACK) + 3*target.getActiveBodyparts(HEAL);
    }
    return partsCount
}

global.mineralNeedsCollect = function(myRoom) {
    var mineral = myRoom.find(FIND_MINERALS)[0]
    var mineralType = mineral.mineralType;
    var mineralContainer =  mineral.pos.findInRange(FIND_STRUCTURES, 1, {filter: s => s.structureType == STRUCTURE_CONTAINER})[0];
    if (mineralContainer != undefined) { // if there is a mineral mine (becaue there is container)
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
    var giver = Game.flags['link'+remoteMiningRoomName].pos.findInRange(FIND_STRUCTURES, 1, {filter: s => s.structureType == STRUCTURE_LINK})[0];
    var getter = Game.flags['link'+spawnName].pos.findInRange(FIND_STRUCTURES, 1, {filter: s => s.structureType == STRUCTURE_LINK})[0];
    //var resevior = Game.flags['link'+remoteMiningRoomName].pos.findInRange(FIND_STRUCTURES, 1, {filter: s => s.structureType == STRUCTURE_CONTAINER})[0];
    if (getter.energy < getter.energyCapacity) {
        if (giver.transferEnergy(getter, Math.min(giver.energy,getter.energyCapacity-getter.energy))==0) { // transfer giver energy or getter gap, whichever is smaller
          return true
        }
        else {
          return false
        }
    }
    return false
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

    var linkWeight = 1.5;
    var storageWeight = 1;
    var droppedWeight = 2;
    var containerWeight = 1;

    var goToId = undefined;
    var resourceness = 0;
    var energyDropped = false;

    if (ifLink) { // find the getter link in creep's room
      var link = Game.flags['link'+room.name].pos.findInRange(FIND_STRUCTURES, 1, {filter: s => s.structureType == STRUCTURE_LINK})[0];
      let range = creep.pos.getRangeTo(link);
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
      let range = creep.pos.getRangeTo(storage);
      let energy = Math.min( storage.store.energy, creep.carryCapacity - creep.carry.energy ); // how much energy can be taken, min of stored energy or space of creep
      if (storageWeight*energy/range > resourceness) {
        resourceness = storageWeight*energy/range;
        goToId = storage.id;
      }
    }

    if (ifDropped) { // find energy in links
      var droppeds = room.find(FIND_DROPPED_ENERGY);
      for (let dropped of droppeds) {
        if (dropped.energy>1000) { // if dropped energy is quite a big amount, clear that dropped energy first
          resourceness = 999999999999999999;
          goToId = dropped.id;
          energyDropped = true;
        }
        else {
          let range = creep.pos.getRangeTo(dropped);
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
      var containers = room.find(FIND_STRUCTURES, {filter : c => c.structureType == STRUCTURE_CONTAINER});
      for (let container of containers) {
        /*if (container.store.energy>1400) { // if container energy is quite a big amount, clear its energy first
          resourceness = 999999999999999999; // if creep is within 8 grids of a link with 300 capacity that is 1.5*300/8 = 500
          goToId = container.id;
          energyDropped = false;
        }
        else { // all containers are not very full, execute as usual*/
          let range = creep.pos.getRangeTo(container);
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

global.foo = function() {
    console.log('hahaha!')
}
