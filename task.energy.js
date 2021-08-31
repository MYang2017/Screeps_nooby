'use strict'

const STRUCTURE_FILL_LEVEL = {spawn: 1, extension: 1, tower: 0.7, container: 1};


global.structureGetE = function (rn) {
    let r = Game.rooms[rn];
    if (r.memory.taskE == undefined) {
        r.memory.taskE = {};
    }
    
    let offers = r.memory.taskE.offers;
    if (offers == undefined) {
        r.memory.taskE.offers = [];
    }
    
    let asks = r.memory.taskE.asks;
    if (asks == undefined) {
        r.memory.taskE.asks = [];
    }
    
    let contracts = r.memory.taskE.contracts;
    if (contracts == undefined) {
        r.memory.taskE.contracts = {};
    }
    
    if (r.memory.structurePrototype == undefined) { // initiate structure 'memory'
        r.memory.structurePrototype = {};
    }
    
    let hungers = r.memory.toFillE;

    if (hungers == undefined || true) { // condition to update hunger list <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
        r.memory.toFillE = [];
    }
    // ORDER MATTERS! implement priority later <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    // core containers
    let sps = r.find(FIND_MY_STRUCTURES, {filter: o=>o.structureType==STRUCTURE_SPAWN});
    let conts = r.find(FIND_STRUCTURES, {filter: o=>o.structureType==STRUCTURE_CONTAINER});
    for (let cont of conts) {
        // upgrade container
        if (cont.pos.getRangeTo(r.controller) < 3) {
            r.memory.toFillE.push({id: cont.id, posi: cont.pos, t: cont.structureType});
        }
        // middle place container
        for (let sp of sps) {
            if (cont.pos.getRangeTo(sp) < 3 && cont.pos.findInRange(FIND_SOURCES, 1).length==0) {
                r.memory.toFillE.push({id: cont.id, posi: cont.pos, t: cont.structureType});
                break;
            }
        }
    }
    
    // spawns
    for (let sp of sps) {
        r.memory.toFillE.push({id: sp.id, posi: sp.pos, t: sp.structureType});
    }
    
    // extensions
    let exts = r.find(FIND_MY_STRUCTURES, {filter: o=>o.structureType==STRUCTURE_EXTENSION});
    for (let ext of exts) {
        if (!(ext.pos.getRangeTo(ext.pos.findClosestByRange(FIND_SOURCES)) < 3)) {
            r.memory.toFillE.push({id: ext.id, posi: ext.pos, t: ext.structureType});
        }
    }
    
    // towers
    let towers = r.find(FIND_MY_STRUCTURES, {filter: o=>o.structureType==STRUCTURE_TOWER});
    for (let tower of towers) {
        r.memory.toFillE.push({id: tower.id, posi: tower.pos, t: tower.structureType});
    }
    
    // asker working logic

    for (let needFill of r.memory.toFillE) {
        let structObj = Game.getObjectById(needFill.id);
        if (r.memory.structurePrototype[needFill.id] == undefined) {// initiate structure memory
            r.memory.structurePrototype[needFill.id] = {};
        }
        
        let onTaskIdE = r.memory.structurePrototype[needFill.id].eTaskId;
        let esitu = structObj.store.getUsedCapacity('energy');
        let emax = STRUCTURE_FILL_LEVEL[structObj.structureType.toString()]*structObj.store.getCapacity('energy');

        if (onTaskIdE !== undefined) { // there is stored energy taskId
            if (r.memory.taskE == undefined || r.memory.taskE.contracts == undefined) { // no contract structure
                r.memory.structurePrototype[needFill.id].eTaskId = undefined; // remove stored id
                return
            }
            let contract = r.memory.taskE.contracts[onTaskIdE];
            if (contract) { // task still there, do task
                // wait for offerer comeand fill
                // do nothing <<<<<<<<<<<<<<<<<<<< possibly in future do anything else, for example, power process
                let offerId = contract.offerId;
                let offerCreep = Game.getObjectById(offerId);
                if (offerCreep) { // if asker still alive
                    if (r.memory.taskE.contracts == undefined) { // if contracts not any more, move
                        r.memory.structurePrototype[needFill.id].eTaskId == undefined;
                        return
                    }
                    
                    // if energy < ? , pickup withdraw or publish require energy task
                    
                    // do usual jobs, upgrade or construct
                    
                    if (emax<=esitu) { // has enough energy
                        // remove need energy task
                        r.memory.structurePrototype[needFill.id].energyTaskId = undefined;
                        delete r.memory.taskE.contracts[onTaskIdE];
                    }
                    // <<<<<<<<<<<<<<<<<<<<<<<<<<<< in future in crease task priority if waiting for too long?
                } 
                else { // offer creep dead, remove task
                    r.memory.structurePrototype[needFill.id].eTaskId = undefined;
                    delete r.memory.taskE.contracts[onTaskIdE];
                }
            }
            else { // contracts structure not there, clear own task
                r.memory.structurePrototype[needFill.id].eTaskId = undefined;
            }
        }
        else { // I have not registered energy task
            if (emax>esitu) { // need fill
                // publish require energy task
                let asksList = r.memory.taskE.asks;
                if (asksList.length == 0) { // no task, add me
                    r.memory.taskE.asks.push({askerId: needFill.id}); // <<<<<<<<<<<<< e mount
                    return
                } // has a lot of tasks
                else { // there is task, check if I have it
                    let addOr = true;
                    for (let askI of asksList) {
                        if (askI.askerId==needFill.id) {
                            addOr = false;
                        }
                    }
                    if (addOr) { // if here, we looped through all tasks but I have not published, pusblish
                        r.memory.taskE.asks.push({askerId: needFill.id}); 
                    }
                }
            }
            // do job, do nothing
        }
    }
}

global.resourceOfferE = function (rn) {
    let r = Game.rooms[rn];
    if (r.memory.taskGetE == undefined) {
        r.memory.taskGetE = {};
    }
    
    let offers = r.memory.taskGetE.offers;
    if (offers == undefined) {
        r.memory.taskGetE.offers = [];
    }
    else { // clean up tombstone or dropped gone
        for (let offerInd in offers) { 
            let offer = r.memory.taskGetE.offers[offerInd];
            if (Game.getObjectById(offer.offerId) == undefined) {
                r.memory.taskGetE.offers.splice(offerInd, 1)
            }
        }
    }
    
    let asks = r.memory.taskGetE.asks;
    if (asks == undefined) {
        r.memory.taskGetE.asks = [];
    }
    
    let contracts = r.memory.taskGetE.contracts;
    if (contracts == undefined) {
        r.memory.taskGetE.contracts = {};
    }
    
    if (r.memory.resourcePrototype == undefined) { // initiate structure 'memory'
        r.memory.resourcePrototype = {};
    }
    else { // clean up tombstone or dropped gone
        for (let objId in r.memory.resourcePrototype) { 
            if (Game.getObjectById(objId) == undefined) {
                delete r.memory.resourcePrototype[objId];
            }
        }
    }

    if (r.memory.toOfferE == undefined || true) { // condition to update hunger list <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
        r.memory.toOfferE = [];
    }
    // ORDER MATTERS! implement priority later <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    // add in resources to memory
    let droppeds = r.find(FIND_DROPPED_RESOURCES);
    for (let dropped of droppeds) {
        r.memory.toOfferE.push({id: dropped.id, posi: dropped.pos, t: 'd', amount: dropped.amount>0});
    }
    let tombstones = r.find(FIND_TOMBSTONES, { filter: c => (_.sum(c.store) > 0) });
    for (let tombstone of tombstones) {
        r.memory.toOfferE.push({id: tombstone.id, posi: tombstone.pos, t: 't', amount: _.sum(tombstone.store)});
    }
    for (let eId in Memory.mapInfo[r.name].eRes) {
        let containers = Game.getObjectById(eId).pos.findInRange(FIND_STRUCTURES, 1, { filter: s => s.structureType == STRUCTURE_CONTAINER });
        if (containers.length>0) {
            r.memory.toOfferE.push({id: containers[0].id, posi: containers[0].pos, t: 'c', amount: _.sum(containers[0].store)});
        }
    }
    // if no more offering E
    if (r.memory.toOfferE.length == 0) {
        if (r.storage) {
            r.memory.toOfferE.push({id: r.storage.id, posi: r.storage.pos, t: 's', amount: r.storage.store.energy});
        }
        if (r.terminal) {
            r.memory.toOfferE.push({id: r.terminal.id, posi: r.terminal.pos, t: 'ter', amount: r.terminal.store.energy});
        }
    }
    
    // offerer working logic
    for (let toOffer of r.memory.toOfferE) {
        let Id = toOffer.id;
        let resObj = Game.getObjectById(Id);
        
        if (r.memory.resourcePrototype[Id] == undefined) {// initiate structure memory
            r.memory.resourcePrototype[Id] = {};
        }
        
        let onTaskIdEGet = r.memory.resourcePrototype[Id].eGetTaskId;
        
        if (onTaskIdEGet !== undefined) { // there is stored energy taskId
            if (r.memory.taskGetE == undefined || r.memory.taskGetE.contracts == undefined) { // no contract structure
                r.memory.resourcePrototype[Id].eGetTaskId = undefined; // remove stored id
                return
            }
            
            let contract = r.memory.taskGetE.contracts[onTaskIdEGet];
            if (contract) { // task still there, do task
                // wait for asker come and take
                // do nothing <<<<<<<<<<<<<<<<<<<< possibly in future do anything else, for example, power process
                let askerId = contract.askerId;
                let askerCreep = Game.getObjectById(askerId);
                if (askerCreep) { // if asker still alive
                    if (r.memory.taskGetE.contracts == undefined) { // if contracts not any more, move
                        r.memory.resourcePrototype[Id].eGetTaskId == undefined;
                        return
                    }
                    
                    // clean myself up if offer amount is 0
                    if (toOffer.amount==0) { // nothing to offer, empty object, clean myself
                        r.memory.toOfferE = r.memory.toOfferE.filter(function( obj ) {
                            return obj.amount !== 0;
                        });
                        delete r.memory.taskGetE.contracts[onTaskIdEGet];
                    }
                    // <<<<<<<<<<<<<<<<<<<<<<<<<<<< in future in crease task priority if waiting for too long?
                } // asker dead, remove task
                else { // asker creep dead, remove task
                    delete r.memory.taskGetE.contracts[onTaskIdEGet];
                }
            }
            else { // contracts structure not there, clear own task
                r.memory.resourcePrototype[Id].eGetTaskId = undefined;
            }
        }
        else { // I have not registered energy task
            // publish require energy task
            if (toOffer.amount>0) {
                let offersList = r.memory.taskGetE.offers;
                if (offersList.length == 0) { // no task, add me
                    r.memory.taskGetE.offers.push({offerId: Id, t: toOffer.t, a: toOffer.amount}); 
                    return
                } // has a lot of tasks
                else { // there is task, check if I have it
                    let addOr = true;
                    for (let offerI of offersList) {
                        if (offerI.offerId==Id) {
                            addOr = false;
                        }
                    }
                    if (addOr) { // if here, we looped through all tasks but I have not published, pusblish
                        r.memory.taskGetE.offers.push({offerId: Id, t: toOffer.t, a: toOffer.amount}); 
                    }
                }
            }
            else { // nothing to offer, empty object, clean myself
                r.memory.toOfferE = r.memory.toOfferE.filter(function( obj ) {
                    return obj.amount !== 0;
                });
            }
        }
    }
}

global.energyTaskManager = function(rn) {
    let r = Game.rooms[rn];
    
    if (r.memory.taskE == undefined) {
        r.memory.taskE = {};
    }
    
    let offers = r.memory.taskE.offers;
    if (offers == undefined) {
        r.memory.taskE.offers = [];
    }
    
    let asks = r.memory.taskE.asks;

    if (asks == undefined) {
        r.memory.taskE.asks = [];
    }
    
    let contracts = r.memory.taskE.contracts;
    if (contracts == undefined) {
        r.memory.taskE.contracts = {};
    }
    
    if (r.memory.structurePrototype == undefined) { // initiate structure 'memory'
        r.memory.structurePrototype = {};
    }
    
    // clean dead contracts
    for (let contractId in contracts) {
        let contract = contracts[contractId];
        let offerCreep = Game.getObjectById(contract.offerId);
        if (offerCreep==undefined) {
            contracts[contractId] = undefined;
        }
        else {
            let askerCreep = Game.getObjectById(contract.askerId);
            if (askerCreep==undefined) {
                contracts[contractId] = undefined;
            }
        }
    }
    
    for (let offer of offers) {
        for (let ask of asks) {
            let asker = Game.getObjectById(ask.askerId);
            if (asker) { // asker exist
                let esitu = asker.store.getUsedCapacity('energy');
                let emax = 0;
                if (asker.structureType != undefined) { // creep
                    emax = STRUCTURE_FILL_LEVEL[asker.structureType.toString()]*asker.store.getCapacity('energy');
                }
                else { // structure
                    emax = asker.store.getCapacity();
                }
                
                if (emax<=esitu) { // has enough energy
                    if (asker.structureType != undefined) { // creep
                        // remove need energy task
                        r.memory.structurePrototype[asker.id].energyTaskId = undefined;
                        deleteElementFromArray(r.memory.taskE.asks, ask);
                    }
                    else { // structure
                        // remove need energy task
                        asker.memory.eTaskId = undefined;
                        deleteElementFromArray(r.memory.taskE.asks, ask);
                    }
                }
                else { // not enough energy, ask for energy
                    let offerer = Game.getObjectById(offer);
                    if (offerer) { // offerer exist
                        if (offerer.memory.eTaskId || offerer.memory.moveTaskId || offerer.memory.eGetTaskId ) { // if already on a task
                            // pass
                        }
                        else { // free now, take task
                            let taskId = randomIdGenerator();
                            r.memory.taskE.contracts[taskId] = {offerId: offer, askerId: ask.askerId}; // assign closest <<<<<<<<<<<<<<<<<<<<<<
                            
                            if (asker.structureType != undefined) { // creep has memory
                                r.memory.structurePrototype[ask.askerId].eTaskId = taskId;
                            }
                            else { // structure does not
                                asker.memory.eTaskId = taskId;
                            }
                            offerer.memory.eTaskId = taskId;
        
                            deleteElementFromArray(r.memory.taskE.asks, ask);
                            deleteElementFromArray(r.memory.taskE.offers, offer);
                        
                            return
                        }
                    }
                    else { // offer dead, remove
                        deleteElementFromArray(r.memory.taskE.offers, offer);
                    }
                }
            }
            else { // ask do not exist remove
                deleteElementFromArray(r.memory.taskE.asks, ask);
            }

            
        }
        // if here not enough ask, let mover be pickuper
    }
    // offer not enough, find a way to detect if there is too many asks and not enough movers, we spawn movers
}

global.energyGetTaskManager = function(rn) {
    let r = Game.rooms[rn];
    
    if (r.memory.taskGetE == undefined) {
        r.memory.taskGetE = {};
    }
    
    let offers = r.memory.taskGetE.offers;
    if (offers == undefined) {
        r.memory.taskGetE.offers = [];
    }
    
    let asks = r.memory.taskGetE.asks;
    if (asks == undefined) {
        r.memory.taskGetE.asks = [];
    }
    
    let contracts = r.memory.taskGetE.contracts;
    if (contracts == undefined) {
        r.memory.taskGetE.contracts = {};
    }
    
    if (r.memory.resourcePrototype == undefined) { // initiate structure 'memory'
        r.memory.resourcePrototype = {};
    }
    
    // clean dead contracts
    for (let contractId in contracts) {
        let contract = contracts[contractId];
        if (contract == undefined) {
            contracts[contractId] = undefined;
            continue
        }
        let offerCreep = Game.getObjectById(contract.offerId);
        if (offerCreep==undefined) {
            contracts[contractId] = undefined;
        }
        else {
            let askerCreep = Game.getObjectById(contract.askerId);
            if (askerCreep==undefined) {
                contracts[contractId] = undefined;
            }
        }
    }
    
    for (let offer of offers) {
        for (let askId of asks) {
            let asker = Game.getObjectById(askId);
            if (asker) {
                if (asker.memory.moveTaskId || asker.memory.eGetTaskId ) {
                    // pass
                }
                else {
                    let offerer = Game.getObjectById(offer.offerId);
                    if (offerer) {
                        let taskId = randomIdGenerator();
                        r.memory.taskGetE.contracts[taskId] = {offerId: offer.offerId, askerId: askId, t: offer.t}; // assign closest <<<<<<<<<<<<<<<<<<<<<<
                        asker.memory.eGetTaskId = taskId;
                        r.memory.resourcePrototype[offer.offerId].eGetTaskId = taskId;
                        deleteElementFromArray(r.memory.taskGetE.asks, askId);
                        deleteElementFromArray(r.memory.taskGetE.offers, offer);
                        return
                    }
                    else { // offer dead
                        deleteElementFromArray(r.memory.taskGetE.offers, offer);
                    }
                }
            }
            else {
                deleteElementFromArray(r.memory.taskGetE.asks, askId);
            }
            
        }
        // if here not enough ask, let mover be pickuper
    }
    // offer not enough, find a way to detect if there is too many asks and not enough movers, we spawn movers
}


global.allTaskManager = function (taskname) {
    if (Memory.task == undefined) {
        Memory.task = {};
    }

    if (Memory.task[taskname] == undefined) {
        Memory.task[taskname] = {};
    }

    let offers = Memory.task[taskname].offers;
    if (offers == undefined) {
        Memory.task[taskname].offers = [];
    }

    let asks = Memory.task[taskname].asks;
    if (asks == undefined) {
        Memory.task[taskname].asks = [];
    }

    let contracts = Memory.task[taskname].contracts;
    if (contracts == undefined) {
        Memory.task[taskname].contracts = {};
    }

    if (Memory.task[taskname].memory == undefined) { // initiate structure 'memory'
        Memory.task[taskname].memory = {};
    }

    // clean dead contracts
    for (let contractId in Memory.task[taskname].contracts) {
        let contract = contracts[contractId];
        let offerObj = Game.getObjectById(contract.offerId);
        if (offerObj == undefined) {
            Memory.task[taskname].contracts[contractId] = undefined;
        }
        else {
            let askerObj = Game.getObjectById(contract.askerId);
            if (askerObj == undefined) {
                Memory.task[taskname].contracts[contractId] = undefined;
            }
        }
    }

    for (let offer of offers) {
        for (let ask of asks) {
            let offerer = Game.getObjectById(offer.id);
            let asker = Game.getObjectById(ask.id);
            if (asker) { // check if asker still there <<<<<<<<<<<<<<<<<<<<<<<<<< AND asker amount matched?
                if (offerer) { // check if asker still there <<<<<<<<<<<<<<<<<<<<<<<<<< AND asker amount matched?
                    let ready = true;
                    for (let otherTask in Memory.task) { // check if on other tasks
                        if (otherTask && Memory.task[otherTask] && Memory.task[otherTask].memory && Memory.task[otherTask].memory[taskname.toString + 'TaskId']) {
                            ready = false
                        }
                    }
                    if (ready) { // if not on other tasks, take task
                        let taskId = randomIdGenerator();
                        Memory.task[taskname].contracts[taskId] = { offerId: offer, askerId: ask.askerId }; // assign closest <<<<<<<<<<<<<<<<<<<<<<

                        if (asker.memory != undefined) { // creep has memory
                            asker.memory.eTaskId = taskId;
                        }
                        else { // structure does not
                            r.memory.structurePrototype[ask.askerId].eTaskId = taskId;
                        }
                        offerer.memory.eTaskId = taskId;

                        deleteElementFromArray(r.memory.taskE.asks, ask);
                        deleteElementFromArray(r.memory.taskE.offers, offer);
                        return
                    }
                    else {
                        // pass
                    }   
                }
                else {
                    deleteElementFromArray(r.memory.taskE.offers, offer);
                }
            }
            else {
                deleteElementFromArray(r.memory.taskE.asks, ask);
            }


        }
        // if here not enough ask, let mover be pickuper
    }
    // offer not enough, find a way to detect if there is too many asks and not enough movers, we spawn movers
}

