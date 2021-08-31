let dog = require('action.idle');
module.exports = {
    run: function(creep) {
        let dropped = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {filter: d=>d.resourceType != 'energy'});
        if (dropped) {
            if (creep.pos.getRangeTo(dropped)>1) {
                creep.travelTo(dropped, {maxRooms: 1});
            }
            else {
                creep.pickup(dropped);
            }
        }
        else {
            dropped = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {filter: d=>d.amount > creep.store.getFreeCapacity('energy')});
            if (dropped) {
                if (creep.pos.getRangeTo(dropped)>1) {
                    creep.travelTo(dropped, {maxRooms: 1})
                }
                else {
                    creep.pickup(dropped);
                }
            }
            else {
                dropped = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES);
                if (dropped) {
                    if (creep.pos.getRangeTo(dropped)>1) {
                        creep.travelTo(dropped, {maxRooms: 1})
                    }
                    else {
                        creep.pickup(dropped);
                    }
                }
                else {
                    dropped = creep.pos.findClosestByRange(FIND_RUINS, {filter: r=>r.store.energy>0});
                    if (dropped) {
                        if (creep.pos.getRangeTo(dropped)>1) {
                            creep.travelTo(dropped, {maxRooms: 1})
                        }
                        else {
                            creep.withdraw(dropped, 'energy');
                        }
                    }
                    else {
                        let totake = creep.room.storage;
                        if (totake) {
                            if (creep.pos.getRangeTo(totake)>1) {
                                creep.travelTo(totake, {maxRooms: 1})
                            }
                            else {
                                creep.withdraw(totake, 'energy');
                            }
                        }
                        else {
                            creep.travelTo(new RoomPosition(25, 25, creep.room.name), {range: 10});
                            dog.run(creep)
                        }
                    }
                }
            }
        }
    }
}