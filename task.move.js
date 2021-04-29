exports.moveTaskManager = moveTaskManager;
/**
 * my own function, calc two base square posibility of the top left corner
 * @param roomName - the name of the room to use for the test, must be visible
 */
function moveTaskManager(rn) {
    let r = Game.rooms[rn];
<<<<<<< HEAD

=======
    
>>>>>>> master
    if (r.memory.taskMove == undefined) {
        r.memory.taskMove = {};
    }
    
    let offers = r.memory.taskMove.offers;
    if (offers == undefined) {
        r.memory.taskMove.offers = [];
    }
    
    let asks = r.memory.taskMove.asks;
    if (asks == undefined) {
        r.memory.taskMove.asks = [];
    }
    
    let contracts = r.memory.taskMove.contracts;
    if (contracts == undefined) {
        r.memory.taskMove.contracts = {};
    }
    
    // clean dead contracts
    for (let contractId in contracts) {
        let contract = contracts[contractId];
        if (contract) {
            let offerCreep = Game.creeps[contract.offerName];
            if (offerCreep==undefined) {
                contracts[contractId] = undefined;
            }
            else {
                let askerCreep = Game.creeps[contract.askerName];
                if (askerCreep==undefined) {
                    contracts[contractId] = undefined;
                }
            }
        }
    }
<<<<<<< HEAD

=======
    
>>>>>>> master
    for (let offer of offers) {
        for (let ask of asks) {
            if (Game.creeps[ask.askerName]) {
                if (Game.creeps[offer]) {
<<<<<<< HEAD
                    if ( Game.creeps[offer].memory.moveTaskId ) { // Game.creeps[offer].memory.eTaskId || 
=======
                    if (Game.creeps[offer].memory.moveTaskId ) {
>>>>>>> master
                        // pass
                    }
                    else {
                        let taskId = randomIdGenerator();
                        r.memory.taskMove.contracts[taskId] = {posi: ask.posi, offerName: offer, askerName: ask.askerName}; // assign closest
                        Game.creeps[ask.askerName].memory.moveTaskId = taskId;
                        Game.creeps[offer].memory.moveTaskId = taskId;
                        deleteElementFromArray(r.memory.taskMove.asks, ask);
                        deleteElementFromArray(r.memory.taskMove.offers, offer);
                        return
                    }
                }
                else {
                    deleteElementFromArray(r.memory.taskMove.offers, offer);
                }
            }
            else {
                deleteElementFromArray(r.memory.taskMove.asks, ask);
            }

            
        }
        // if here not enough ask, let mover be pickuper
    }
    // offer not enough, find a way to detect if there is too many asks and not enough movers, we spawn movers

}