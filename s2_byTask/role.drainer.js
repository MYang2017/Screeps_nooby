module.exports = {
    run: function(creep) {
        let tarRn = creep.memory.target;
        let homeRn = creep.memory.home;
        let wRn = creep.memory.waitingRn;
        let curRn = creep.room.name;
        
        if (creep.hits<creep.hitsMax) { // if not health
            let healers = creep.room.find(FIND_MY_CREEPS, {filter: c=>c.getActiveBodyparts(HEAL)>0});
            if (healers.length>0) { // if room has healer
                creep.travelTo(healers[0]); // go to healer
            }
            else {
                // go back home
                storedTravelFromAtoB(creep, 'r');
            }
        }
        else { // health
            if (curRn == tarRn) { // if in target room
                // find energy structures with energy
                let drain = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {filter: t=>t.store&&t.store.energy>0});
                if (drain) { // if find
                    if (creep.store.getFreeCapacity('energy')>0) { // if not full
                        if (creep.pos.getRangeTo(drain)>1) { 
                            creep.travelTo(drain);
                        }
                        else {
                            creep.withdraw(drain, 'energy');
                        }
                    }
                    else { // else, full
                        for(const resourceType in creep.store) {
                            creep.drop(resourceType);
                        }
                    }
                }
                else {// else no structure with energy
                    // find closest dropped energy
                    let dropped = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES);
                    if (dropped) { // if find
                        if (creep.store.getFreeCapacity('energy')>0) { // if not full
                            if (creep.pos.getRangeTo(dropped)>1) { 
                                creep.travelTo(dropped);
                            }
                            else {
                                creep.pickup(dropped);
                            }
                        }
                        else { // else, full
                            creep.travelTo(new RoomPosition(25, 25, wRn));
                        }
                    }
                    else { // no dropped, no structure
                        creep.travelTo(new RoomPosition(25, 25, wRn));
                    }
                }
            }
            else if (wRn && (curRn == wRn)) { // else if in shelter room
                if (_.sum(creep.store)==0) { // if carry nothing
                    // go to target
                    creep.travelTo(new RoomPosition(25, 25, tarRn));
                }
                else { // else if carry
                    // drop
                    creep.travelTo(new RoomPosition(25, 25, wRn), {range: 23, maxRooms: 1});
                    for(const resourceType in creep.store) {
                        creep.drop(resourceType);
                    }
                }
            }
            else { // else, move to target
                if (creep.memory.target !== creep.room.name) { // not in target
                    // follow route
                    const route = Game.map.findRoute(creep.room, creep.memory.target);
                    let next = route[0];
                    if (route.length > 1) {
                        storedTravelFromAtoB(creep, 'l');
                    }
                    else if (route.length == 1) { // in waiting room, wait to be gathered
                        creep.memory.waitingRn = creep.room.name;
                        // keep moveing to target
                        creep.travelTo(new RoomPosition(25, 25, tarRn), {maxRooms: 1});
                    }
                    else {
                        fo('drainer bugged, code should not reach here');
                    }
                }
            }
        }
    }
};
