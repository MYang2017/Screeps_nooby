// lorry now only fill energy in room since v7
var actionAvoid = require('action.idle');
var noStoragePickuper = require('role.pickuper');
//var getE = require('action.getEnergy');
var getE = require('action.getEnergyByTask');

module.exports = {
    run: function (creep) {
        // clear long unfinished taskl
        creep.trackDeadTaskTimer();
        
        //if ((creep.room.terminal == undefined)||(creep.room.find(FIND_MY_STRUCTURES, {filter:c=>c.structureType==STRUCTURE_LINK}).length==0)) {
        if (creep.memory.target==undefined) {
            creep.memory.target = creep.room.name;
        }
        
        // working boolean
        if (creep.memory.working == undefined) {
            creep.memory.working == true;
        }
        let load = creep.store.getUsedCapacity();
        if ( creep.memory.working == true && load == 0 ) { // if no energy
            creep.memory.working = false; //  when false, get energy
        }
        else if (creep.memory.working == false && load == creep.carryCapacity) {
            creep.memory.working = true;
        }
        
        if ((creep.room.name != creep.memory.target) || ((creep.pos.x==0)||(creep.pos.y==0)||(creep.pos.x==49)||(creep.pos.y==49)) ) {
            creep.travelTo(new RoomPosition(25, 25, creep.memory.target))
        }
        else  { // at home
            if (creep.memory.working == false) { // without load, do move task first 
                // if movement task do movement task
                // else 
                    // if get task, do get task
                    // else avoid
            }
            else { // working true (has full energy), 
                // do fill task, 
                // if no fill task
                    // if move task
                        // drop and do move task
                    // else no move task idle
                let onTaskId = creep.memory.moveTaskId;
                let onTaskIdE = creep.memory.eTaskId;
                
                if (onTaskId !== undefined) { // creep have contract id
                    if (creep.room.memory.taskMove == undefined || creep.room.memory.taskMove.contracts == undefined) { // no contract structure
                        creep.memory.moveTaskId == undefined; // remove stored id
                        return
                    }
                    let contract = creep.room.memory.taskMove.contracts[onTaskId];
                    if (contract) { // task still there, do task
                        let askerName = contract.askerName;
                        let askerCreep = Game.creeps[askerName];
                        if (askerCreep) { // if asker still alive
                            if (creep.store.getUsedCapacity()>0) {
                                creep.drop(RESOURCE_ENERGY);
                            }
                            
                            if (creep.pos.getRangeTo(askerCreep) > 1) { // if not pull range to to asker
                                creep.travelTo(askerCreep);
                            }
                            else { // if in pull range move to target and pull
                                let tarPosi = contract.posi;
                                if ((creep.pos.x == tarPosi.x) && (creep.pos.y == tarPosi.y)) { // if at working position, last pull move
                                    creep.pull(askerCreep);
                                    creep.move(askerCreep);
                                }
                                else { // if not at working position go to it
                                    creep.pull(askerCreep);
                                    /*let foundi = creep.room.lookForAt(LOOK_CREEPS, tarPosi.x, tarPosi.y);
                                    if (foundi.length>0) {
                                        if (foundi[0].memory.role == 'mover') {
                                            actionAvoid.run(foundi[0]);
                                            creep.moveTo(new RoomPosition(tarPosi.x, tarPosi.y, creep.room.name));
                                        }
                                        else if (foundi[0].memory.role == 'noLegWorker') {
                                            creep.move(Math.floor(Math.random() * 8) +1);
                                        }
                                    }
                                    else {
                                        creep.moveTo(new RoomPosition(tarPosi.x, tarPosi.y, creep.room.name));
                                    }*/
                                    //creep.travelTo(new RoomPosition(tarPosi.x, tarPosi.y, creep.room.name));
        
                                    //creep.moveToWhenNeverTar(new RoomPosition(tarPosi.x, tarPosi.y, creep.room.name))
                                    //creep.travelTo(new RoomPosition(tarPosi.x, tarPosi.y, creep.room.name));
                                    creep.moveToAvoidAllOtherCreeps(new RoomPosition(tarPosi.x, tarPosi.y, creep.room.name));
                                }
                            }
                        }
                        else { // asker dead, remove task
                            creep.memory.moveTaskId = undefined;
                            delete creep.room.memory.taskMove.contracts[onTaskId];
                        }
                    }
                    else { // contract is not there, clear own task
                        creep.memory.moveTaskId = undefined;
                    }
                }
                else if (onTaskIdE !== undefined) { // creep have energy contract id
                    if (creep.room.memory.taskE == undefined || creep.room.memory.taskE.contracts == undefined) { // no contract structure
                        creep.memory.eTaskId == undefined; // remove stored id
                        return
                    }
                    let contract = creep.room.memory.taskE.contracts[onTaskIdE];
                    if (contract) { // task still there, do task
                        let askerId = contract.askerId;
                        let askerCreep = Game.getObjectById(askerId);
                        
                        creep.room.visual.circle(askerCreep.pos, {fill: 'transparent', radius: 0.55, stroke: 'white', strokeWidth: 0.5});
                        creep.room.visual.circle(creep.pos, {fill: 'transparent', radius: 0.55, stroke: 'red', strokeWidth: 0.5});
        
                        if (askerCreep) { // if asker still alive
                            if (creep.memory.working == true) { // if working
                                let esitu = askerCreep.store.getUsedCapacity('energy');
                                let emax = askerCreep.store.getCapacity('energy');
                                // give e to asker
                                if (creep.transfer(askerCreep, 'energy') == OK || creep.transfer(askerCreep, 'energy') == ERR_FULL || esitu == emax) { // transferred, remove task
                                    creep.travelTo(askerCreep, { maxRooms: 1 }); // to prevent walk away
                                    creep.memory.eTaskId = undefined;
                                    delete creep.room.memory.taskE.contracts[onTaskIdE];
                                }
                                else {
                                    creep.travelTo(askerCreep, { maxRooms: 1 });
                                }
                            }
                            else { // working == false, get e
                                getE.run(creep);
                            }
                        }
                        else { // asker dead, remove task
                            creep.memory.eTaskId = undefined;
                            delete creep.room.memory.taskE.contracts[onTaskIdE];
                        }
                    }
                    else { // contract is not there, clear own task
                        creep.memory.eTaskId = undefined;
                    }
                }
                else {
                    // publish offer, better logic dont take multiple tasks same time <<<<<<<<<<<<<<<<<<<<
                    if (!creep.room.memory.taskMove.offers.includes(creep.name)) {
                        creep.room.memory.taskMove.offers.push(creep.name);
                    }
                    if (!creep.room.memory.taskE.offers.includes(creep.id)) {
                        creep.room.memory.taskE.offers.push(creep.id);
                    }
                    getE.run(creep);
                }
            }
        }
    }
};
