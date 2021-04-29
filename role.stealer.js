let doge = require('action.idle');
let rec = require('action.recycle');
let getB = require('action.getBoost');

module.exports = {
    run: function(creep) {
      creep.say('stealling');
        if (false) { // (creep.room.name == 'E11S27' && creep.room.controller.level == 8) {
            let full = _.sum(creep.store)>0;
            if (full) {
                creep.moveTo(Game.getObjectById('60285f514883687220e23d02'));
                creep.transfer(Game.getObjectById('60285f514883687220e23d02'), 'symbol_kaph');
            }
            else {
                let dps = creep.room.find(FIND_DROPPED_RESOURCES, {filter:c=>c.resouceType=='symbol_kaph'});
                if (dps.length>0) {
                    creep.moveTo(dps[0]);
                    creep.pickup(dps[0]);
                }
                else {
                    let dps = creep.room.find(FIND_TOMBSTONES, {filter:c=>c.store['symbol_kaph']>0});
                    if (dps.length>0) {
                        creep.moveTo(dps[0]);
                        creep.withdraw(dps[0], 'symbol_kaph');
                    }
                    else {
                        creep.moveTo(Game.getObjectById('606ddf3755002d18dfcecf38'));
                        creep.withdraw(Game.getObjectById('606ddf3755002d18dfcecf38'), 'symbol_kaph');
                    }
                }
            }
            return
        }
        if (getB.run(creep)!=true) {
            return
        }
<<<<<<< HEAD
        else {
            if (creep.memory.bornTime == undefined) {
                // creep born time = Game.time
                creep.memory.bornTime = Game.time;
            }
            else {
                if ((creep.memory.transferTime == undefined && creep.ticksToLive<800) && creep.memory.recycle == undefined) {
                    // creep lost 
                    creep.memory.recycle = true; // set recycle true
                }
                else { // not lost, on normal job
                    if (creep.memory.recycle) {
                        if (storedTravelFromAtoB(creep, 'r')) { // arrived or path not defined
                            if (_.sum(creep.store)>0) {
                                for (let mineralType in creep.store) {
                                    if (creep.transfer(creep.room.storage, mineralType) == ERR_NOT_IN_RANGE) {
                                        creep.travelTo(creep.room.storage, {maxRooms: 1, offRoad: true, ignoreRoads: true});
                                    }
                                }
                            }
                            else { // recycle
                                rec.run(creep);
                            }
                        }
                    }
                    else {
                        if (creep.memory.working == true && _.sum(creep.carry) == 0) {
                          creep.memory.working = false;
                        }
                        else if (creep.memory.working == false && _.sum(creep.carry) == creep.carryCapacity ) {
                          creep.memory.working = true;
                        }
                        
                        if (creep.memory.working == true) { // delivery
                            if (creep.room.name==creep.memory.home) {
                                let storage = creep.room.storage;
                                if (storage) {
                                    for(const resourceType in creep.store) {
                                        let transres = creep.transfer(storage, resourceType);
                                        if ( transres == ERR_NOT_IN_RANGE) {
                                            creep.moveTo(storage, {maxRooms: 1});
                                        }
                                        else if (transres==OK) {
                                            let dests = creep.memory.dests;
                                            if (dests) {
                                                for (let did in dests) {
                                                    creep.memory.dests[did].completed = undefined;
                                                }
                                            }
                                            if (creep.memory.transferTime != undefined) { // not first time
                                                if (creep.ticksToLive < 25 + (creep.memory.transferTime-creep.memory.bornTime)*2) { // creep cannot make a round trip
                                                    creep.memory.recycle = true;
                                                }
                                            }
                                        }
                                    }
                                    return
                                }
                                else {
                                      for(const resourceType in creep.carry) {
                                        if (resourceType==RESOURCE_ENERGY) { // carrying energy
                                              var structure = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: (s) => ( (s.structureType == STRUCTURE_TOWER || s.structureType == STRUCTURE_EXTENSION || s.structureType == STRUCTURE_SPAWN) && s.energy <s.energyCapacity) })
                                              if (structure == undefined) {
                                                  structure = creep.room.storage;
                                              }
                                              if (creep.transfer(structure, resourceType) == ERR_NOT_IN_RANGE) {
                                                  creep.moveTo(structure, {maxRooms: 1});
                                              }
                                        }
                                        else { // carrying minerals
                                              var structure = creep.room.storage;
                                              if (creep.transfer(structure, resourceType) == ERR_NOT_IN_RANGE) {
                                                  creep.moveTo(structure, {maxRooms: 1});
                                              }
                                        }
                                      }
                                    return
                                }
                            }
                            else if (creep.room.name==creep.memory.target) {
                                storedTravelFromAtoB(creep, 'r');
                                let dests = creep.memory.dests;
                                if (dests) {
                                    for (let did in dests) {
                                        creep.memory.dests[did].completed = undefined;
                                    }
                                }
                            }
                            else {
                                storedTravelFromAtoB(creep, 'r');
                            }
                        }
                        else { // working false, get things
                            if (creep.room.name == creep.memory.target) { // if in target room
                                if (_.sum(creep.store)>0) {
                                    let dests = creep.memory.dests;
                                    if (dests) {
                                        for (let did in dests) {
                                            creep.memory.dests[did].completed = undefined;
                                        }
                                    }
                                }
                                let tp = creep.memory.toTp;
                                if (tp) {
                                    let toTake;
                                    if (creep.room.storage.store[tp]>0) {
                                        toTake = creep.room.storage;
                                    }
                                    else {
                                        toTake = creep.room.terminal;
                                    }
                                    if (toTake) {
                                        if (creep.withdraw(toTake,tp) == ERR_NOT_IN_RANGE) {
                                            creep.moveTo(toTake);
                                            return
                                        }
                                    }
                                }
                                
                                let r = creep.room;
                                let scts = r.find(FIND_SYMBOL_CONTAINERS);
                                if (scts.length>0) {
                                    let sct = scts[0];
                                    for (let resType in sct.store) {
                                        let pickRes = creep.withdraw(sct, resType);
                                        if (pickRes== ERR_NOT_IN_RANGE) {
                                            creep.travelTo(sct, {maxRooms: 1, ignoreCreeps: false});
                                        }
                                        else if (pickRes == OK) {
                                            if (creep.memory.transferTime == undefined) {
                                                creep.memory.transferTime = Game.time;
                                            }
                                            let dests = creep.memory.dests;
                                            if (dests) {
                                                for (let did in dests) {
                                                    creep.memory.dests[did].completed = undefined;
                                                }
                                            }
                                        }
                                    }
                                    return
                                }
                                
                                let stor = creep.room.storage;
                                if (stor) {
                                    for (let syb in stor.store) {
                                        if (syb.slice(0,3)=='sym') {
                                            if (false) {
                                                continue;// pass
                                            }
                                            else {
                                                if (creep.pos.getRangeTo(stor)>1) {
                                                    creep.travelTo(stor, {offRoad: true, ignoreRoads: true});
                                                }
                                                else {
                                                    if (creep.withdraw(stor, syb)==OK && creep.memory.transferTime == undefined) {
                                                        let dests = creep.memory.dests;
                                                        if (dests) {
                                                            for (let did in dests) {
                                                                creep.memory.dests[did].completed = undefined;
                                                            }
                                                        }
                                                        creep.memory.transferTime = Game.time;
                                                    }
                                                }
                                            }
                                            return
                                        }
                                    }
                                }
                                stor = creep.room.terminal;
                                if (stor) {
                                    for (let syb in stor.store) {
                                        if (syb.slice(0,3)=='sym') {
                                            if (creep.pos.getRangeTo(stor)>1) {
                                                creep.travelTo(stor, {offRoad: true, ignoreRoads: true});
                                            }
                                            else {
                                                if (creep.withdraw(stor, syb)==OK && creep.memory.transferTime == undefined) {
                                                    let dests = creep.memory.dests;
                                                    if (dests) {
                                                        for (let did in dests) {
                                                            creep.memory.dests[did].completed = undefined;
                                                        }
                                                    }
                                                    creep.memory.transferTime = Game.time;
                                                }
                                            }
                                            return
                                        }
                                    }
                                }
                                let tmbs = creep.room.find(FIND_DROPPED_RESOURCES);
                                if (tmbs.length>0) {
                                    for (let tmb of tmbs) {
                                        let syb = tmb.resourceType;
                                        if (syb.slice(0,3)=='sym') {
                                            if (creep.pos.getRangeTo(tmb)>1) {
                                                creep.travelTo(tmb, {offRoad: true, ignoreRoads: true});
                                            }
                                            else {
                                                if (creep.pickup(tmb)==OK && creep.memory.transferTime == undefined) {
                                                    let dests = creep.memory.dests;
                                                    if (dests) {
                                                        for (let did in dests) {
                                                            creep.memory.dests[did].completed = undefined;
                                                        }
                                                    }
                                                    creep.memory.transferTime = Game.time;
                                                }
                                            }
                                            return
                                        }
                                    }
                                }
                                tmbs = creep.room.find(FIND_TOMBSTONES, {filter:t=>_.sum(t.store)>0});
                                if (tmbs.length>0) {
                                    for (let tmb of tmbs) {
                                        for (let syb in tmb.store) {
                                            if (syb.slice(0,3)=='sym') {
                                                if (creep.pos.getRangeTo(tmb)>1) {
                                                    creep.travelTo(tmb, {offRoad: true, ignoreRoads: true});
                                                }
                                                else {
                                                    creep.withdraw(tmb, syb);
                                                }
                                                return
                                            }
                                        }
                                    }
                                }
                                /*
                                let tmbs = creep.room.find(FIND_RUINS);
                                if (tmbs.length>0) {
                                    for (let tmb of tmbs) {
                                        let syb = tmb.resourceType;
                                        if (syb.slice(0,3)=='sym') {
                                            if (creep.pos.getRangeTo(tmb)>1) {
                                                creep.travelTo(tmb, {offRoad: true, ignoreRoads: true});
                                            }
                                            else {
                                                creep.withdraw(tmb, syb);
                                            }
                                            return
                                        }
                                    }
                                }*/
                                let target = creep.room.find(FIND_STRUCTURES, { filter: s => ((s.structureType == STRUCTURE_STORAGE) ||(s.structureType == STRUCTURE_TOWER)||(s.structureType == STRUCTURE_EXTENSION)||(s.structureType == STRUCTURE_SPAWN)||(s.structureType == STRUCTURE_CONTAINER))&&(s.store.energy>0)});
                              //let target = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {filter: s => (s.structureType == STRUCTURE_TOWER)});
                                //let target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter: s => (!allyList().includes(s.owner))});
                                //console.log(creep.withdrow(target));
                                if (target.length>0) { // found hostile creep
                                    for (let resourceType in target[0].store) {
                                        if (creep.withdraw(target[0],resourceType) == ERR_NOT_IN_RANGE) {
                                            creep.moveTo(target[0]);
                                            return
                                        }
                                    }
                                }
                                else {
                                    let droppeds = creep.room.find(FIND_DROPPED_RESOURCES);
                                    if (droppeds.length>0) {
                                        for (let dropped of droppeds) {
                                            if (ifReachableWithinRoom(creep.pos, dropped.pos)) {
                                                if (creep.pos.getRangeTo(dropped)>1) {
                                                    creep.travelTo(dropped, {maxRooms: 1, range: 1, offRoad: true, ignoreRoads: true})
                                                }
                                                else {
                                                    if (creep.pickup(dropped)==OK && creep.memory.transferTime == undefined) {
                                                        creep.memory.transferTime = Game.time;
                                                    }
                                                }
                                                return
                                            }
                                        }
                                        
                                    }
                                    else {
                                        creep.memory.recycle=true;
                                    }
                                }
                            }
                            else { // go to target room
                                let tmbs = creep.room.find(FIND_TOMBSTONES, {filter:t=>_.sum(t.store)>0});
                                if (tmbs.length>0) {
                                    for (let tmb of tmbs) {
                                        for (let syb in tmb.store) {
                                            if (syb.slice(0,3)=='sym') {
                                                if (creep.pos.getRangeTo(tmb)>1) {
                                                    creep.travelTo(tmb, {offRoad: true, ignoreRoads: true});
                                                }
                                                else {
                                                    creep.withdraw(tmb, syb);
                                                }
                                                return
                                            }
                                        }
                                    }
                                }
                                tmbs = creep.room.find(FIND_DROPPED_RESOURCES);
                                if (tmbs.length>0) {
                                    for (let tmb of tmbs) {
                                        let syb = tmb.resourceType;
                                        if (syb.slice(0,3)=='sym') {
                                            if (creep.pos.getRangeTo(tmb)>1) {
                                                creep.travelTo(tmb, {offRoad: true, ignoreRoads: true});
                                            }
                                            else {
                                                creep.pickup(tmb);
                                            }
                                            return
                                        }
                                    }
                                }
                                storedTravelFromAtoB(creep, 'l');
                            }
                        }
                    }
=======
      }
      else {
        if (creep.room.name == creep.memory.target) { // if in target room
            let target = creep.room.find(FIND_STRUCTURES, { filter: s => ((s.structureType == STRUCTURE_STORAGE) ||(s.structureType == STRUCTURE_TOWER)||(s.structureType == STRUCTURE_EXTENSION)||(s.structureType == STRUCTURE_SPAWN))&&(s.energy>0)});
          //let target = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {filter: s => (s.structureType == STRUCTURE_TOWER)});
            //let target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter: s => (!allyList().includes(s.owner))});
            //console.log(creep.withdrow(target));
            if (target) { // found hostile creep
                if (creep.withdraw(target[0],RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target[0])
>>>>>>> master
                }
            }
        }
    }
};
