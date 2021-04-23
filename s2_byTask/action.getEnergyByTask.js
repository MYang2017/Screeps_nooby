var noStoragePickuper = require('role.pickuper');

module.exports = {
    run: function (creep) {
        
        let onTaskIdE = creep.memory.eGetTaskId;

        if (onTaskIdE !== undefined) {
            if (creep.room.memory.taskGetE == undefined || creep.room.memory.taskGetE.contracts == undefined) { // no contract structure
                creep.memory.eGetTaskId == undefined; // remove stored id
                // no task at all, be pickuper?
                noStoragePickuper.run(creep);
                return false
            }
            
            if (_.sum(creep.store) == creep.store.getCapacity()) { // energy full, remove task
                creep.memory.eGetTaskId = undefined;
                delete creep.room.memory.taskGetE.contracts[onTaskIdE];
                return false
            }
            else {
                let contract = creep.room.memory.taskGetE.contracts[onTaskIdE];
                if (contract) { // task still there, do task
                    let offererId = contract.offerId;
                    let offerer = Game.getObjectById(offererId);
                        
                    if (offerer) { // if offer still alive
                        creep.room.visual.circle(offerer.pos, {fill: 'transparent', radius: 0.55, stroke: 'green', strokeWidth: 0.5});
                        creep.room.visual.circle(creep.pos, {fill: 'transparent', radius: 0.55, stroke: 'blue', strokeWidth: 0.5});
                    
                        
                        if (contract.t == 'd') {
                            let droppedRes = Game.getObjectById(contract.offerId);
                            let pickupRes = creep.pickup(droppedRes);
                            if ( pickupRes == ERR_NOT_IN_RANGE) {
                                creep.travelTo(droppedRes, { maxRooms: 1, range: 1 });
                            }
                            else if (pickupRes == OK || pickupRes == ERR_FULL || pickupRes == ERR_INVALID_TARGET) {
                                creep.room.memory.resourcePrototype[contract.offerId].eGetTaskId = undefined;
                                delete creep.room.memory.taskGetE.contracts[onTaskIdE];
                            }
                        }
                        else if (contract.t == 't') {
                            let tombObj = Game.getObjectById(contract.offerId);
                            if (_.sum(tombObj.store) == 0) {
                                creep.room.memory.resourcePrototype[contract.offerId].eGetTaskId = undefined;
                                delete creep.room.memory.taskGetE.contracts[onTaskIdE];
                            }
                            else {
                                for (let mineralType in tombObj.store) {
                                    if (creep.withdraw(tombObj, mineralType) == ERR_NOT_IN_RANGE) {
                                        creep.travelTo(tombObj, { maxRooms: 1, range: 1 });
                                    }
                                }
                            }
                        }
                        else if (contract.t == 'c' || contract.t ==  's' || contract.t ==  'ter') {
                            let tarStoreObj = Game.getObjectById(contract.offerId);
                            let withdrawRes = creep.withdraw(tarStoreObj, 'energy');
                            if ( withdrawRes == ERR_NOT_IN_RANGE) {
                                creep.travelTo(tarStoreObj, { maxRooms: 1, range: 1 });
                            }
                            else if (withdrawRes == OK || withdrawRes == ERR_FULL || withdrawRes == ERR_NOT_ENOUGH_RESOURCES || withdrawRes == ERR_INVALID_TARGET) {
                                creep.room.memory.resourcePrototype[contract.offerId].eGetTaskId = undefined;
                                delete creep.room.memory.taskGetE.contracts[onTaskIdE];
                            }
                        }
                        else { // other energy requirement structures
                            fo('other fancy structrues?')
                        }
                        return true
                    }
                    else { // offer dead, remove task
                        creep.memory.eGetTaskId = undefined;
                        delete creep.room.memory.taskGetE.contracts[onTaskIdE];
                        return false
                    }
                }
                else { // I do not have contract take contract task
                    creep.memory.eGetTaskId = undefined;
                    return false
                }
            }
        }
        else {
            if (!creep.room.memory.taskMove.offers.includes(creep.name)) {
                creep.room.memory.taskMove.offers.push(creep.name);
            }
            if (!creep.room.memory.taskE.offers.includes(creep.id)) {
                creep.room.memory.taskE.offers.push(creep.id);
            }
            if (!creep.room.memory.taskGetE.asks.includes(creep.id)) {
                creep.room.memory.taskGetE.asks.push(creep.id);
            }
            return false
        }
    }
};
