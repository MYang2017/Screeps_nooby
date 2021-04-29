// move resource from storage to terminal for sell

module.exports = {
    run: function(creep) {
        //creep.say('begging');
        var load = _.sum(creep.carry);
        var resourceType = creep.memory.resourceType;

        // check the direction of material flow
        if (creep.memory.fromStorage) {
            var from = creep.room.storage;
            var to = creep.room.terminal;
            var left = 0;
        }
        else {
            var from = creep.room.terminal;
            var to = creep.room.storage;
            var left = 0;
        }

        if ( creep.memory.working == true && load == 0 ) {
            creep.memory.working = false;
        }
        else if (creep.memory.working == false && load == creep.carryCapacity) {
            creep.memory.working = true;
        }

        if (creep.memory.working == true) { // if working
            for (let mineralType in creep.store) {
                if (creep.transfer(to, mineralType) == ERR_NOT_IN_RANGE) {
                    creep.travelTo(to, mineralType, { maxRooms: 1 });
                }
            }
        }
        else { // working == false, get minerals
            if (from.store[resourceType]<=left) {
                creep.memory.target = creep.room.name;
                for (let ty in from.store) {
                    creep.memory.resourceType = ty;
                    return
                }
            }
            else {
                if (creep.withdraw(from, resourceType) == ERR_NOT_IN_RANGE) { // go to storage and put energy
                    creep.moveTo(from);
                }
            }
        }
    }
};
