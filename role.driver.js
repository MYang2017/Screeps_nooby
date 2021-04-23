var dog = require('action.idle');
var passE = require('action.passEnergy');
var ontheway = require('action.ontheway');
var actionRecycle = require('action.recycle');

module.exports = {
    run: function(creep) {
        if (creep.room.controller.level<8) {
            let path = creep.memory.path; 
            let dir = creep.memory.dir;
            
            if (dir == undefined) {
                creep.memory.dir = -1;
            }
            
            var getPosId = function (pos, path) {
                for (let posId in path) {
                    let pathPos = path[posId];
                    if (pathPos.x == pos.x && pathPos.y == pos.y) {
                        return posId
                    }
                }
                return -1
            }
            
            // decide what resource/structure to take/fill
            // to fill: structure, creeps
            // to take: structure, dropped, (creeps? cross road transfer?)
            if (false) {
            let posTo = creep.memory.to;
            let toId = creep.memory.toId;
            let toAction = undefined;
            /*
            // look for creep first, then structure
            if (toId==undefined || Game.getObjectById(toId)==undefined || Game.getObjectById(toId).store.energy==0) { // no registered or registered no energy, look for another
                let lookeds = creep.room.lookAt(posTo.x, posTo.y);
                for (let looked of lookeds) {
                    if (looked && looked.type==LOOK_ENERGY) {
                        
                    }
                }
            }
            */

            let posFrom = creep.memory.from;
            // look for dropped first, then structure
            }
            
            let nowPosId = getPosId(creep.pos, path);
            
            let r = creep.room;
            
            if (nowPosId == -1) {
                creep.moveTo(path[0].x, path[0].y);
            }
            else { // on track
                let nextPosId = parseInt(nowPosId) + parseInt(creep.memory.dir);
                let nextPos = path[nextPosId];
                let toFill = creep.memory.toFill;
                if (toFill == undefined) {
                    let nbSs = r.lookForAt(LOOK_STRUCTURES, creep.memory.from.x, creep.memory.from.y);
                    for (let sId of nbSs) {
                        let c = Game.getObjectById(sId.id);
                        if (c&&(c.structureType==STRUCTURE_TOWER||c.structureType==STRUCTURE_CONTAINER||c.structureType==STRUCTURE_LINK||c.structureType==STRUCTURE_EXTENSION||c.structureType==STRUCTURE_SPAWN||c.structureType==STRUCTURE_TERMINAL||c.structureType==STRUCTURE_STORAGE||c.structureType==STRUCTURE_LAB)&&c.store.energy>0) {
                            creep.memory.toFill = c.id;
                            break;
                        }
                    }
                }
                
                let toTake = creep.memory.toTake;
                if (toTake == undefined) {
                    let nbSs = r.lookForAt(LOOK_STRUCTURES, creep.memory.to.x, creep.memory.to.y);
                    for (let sId of nbSs) {
                        let c = Game.getObjectById(sId.id);
                        if (c&&(c.structureType==STRUCTURE_TOWER||c.structureType==STRUCTURE_CONTAINER||c.structureType==STRUCTURE_LINK||c.structureType==STRUCTURE_EXTENSION||c.structureType==STRUCTURE_SPAWN||c.structureType==STRUCTURE_TERMINAL||c.structureType==STRUCTURE_STORAGE||c.structureType==STRUCTURE_LAB)) {
                            creep.memory.toTake = c.id;
                            break;
                        }
                    }
                }
                
                let ePassRes = undefined;
                let doMove = true
                // if creep at ends, transfer/take and move back, change moving dir
                // 0 pos is fill position
                // end pos is take position
                // 1 dir is going to take, make sure we are empty
                // -1 dir is going to fill, make sure we are full
                if (nowPosId == 0) {
                    creep.memory.dir = 1;
                    nextPos = path[1];
                    
                    let cps = creep.room.lookForAt(LOOK_CREEPS, nextPos.x, nextPos.y);
                    if (cps.length>0 && cps[0].memory.role == 'superUpgrader') {
                        let allups = creep.room.find(FIND_MY_CREEPS, {filter: c=>c.memory.role == 'superUpgrader'});
                        for (let lup of allups) {
                            lup.move(getRandomInt(1,8));
                        }
                    }
                    
                    ePassRes = creep.transfer(Game.getObjectById(creep.memory.toTake), 'energy');
                }
                else if (nowPosId == path.length-1) {
                    creep.memory.dir = -1;
                    nextPos = path[path.length-2];
                    if (Game.getObjectById(creep.memory.toFill).store.energy>creep.store.getCapacity('energy')) {
                        ePassRes = creep.withdraw(Game.getObjectById(creep.memory.toFill), 'energy');
                    }
                    else {
                        ePassRes = creep.withdraw(creep.room.terminal, 'energy');
                    }
                }
                else {
                    let cps = creep.room.lookForAt(LOOK_CREEPS, nextPos.x, nextPos.y);
                    if (cps.length>0 && cps[0].memory.role == 'driver') {
                        creep.memory.dir = parseInt(creep.memory.dir)*(-1); // turn
                        nextPosId = parseInt(nowPosId) + creep.memory.dir;
                        nextPos = path[nextPosId];
                        if (creep.memory.dir==1) {
                            ePassRes = creep.transfer(cps[0], 'energy')
                        }
                    }
                    else if (cps.length>0 && !(cps[0].memory.role == 'driver' || cps[0].memory.role == 'miner'|| cps[0].memory.role == 'longDistanceLorry')) {
                        cps[0].move(getRandomInt(1,8));
                        //cps[0].moveTo(creep.room.controller);
                    }
                }
                
                /*
                let nbCs = r.lookForAtArea(LOOK_CREEPS,Math.max(creep.pos.y-1,0),Math.max(creep.pos.x-1,0),Math.min(creep.pos.y+1, 49),Math.min(creep.pos.x+1,49), true);

                for (let cId of nbCs) {
                    let c = Game.getObjectById(cId.creep.id);
                    if (c.my && c.store.getFreeCapacity()>0 && (c.memory.role == 'superUpgrader' || c.memory.role == 'upgrader'|| c.memory.role == 'builder')) {
                        // ||(c.memory.role != 'lorry')||(c.memory.role != 'pickuper')||(c.memory.role != 'mover')
                        creep.transfer(c, 'energy') == OK;
                    }
                }
                */
                
                if (doMove){
                    creep.moveTo(nextPos.x, nextPos.y);
                }
                if (ePassRes != OK) {
                    //ontheway.run(creep);
                }
            }
        }
        else {
            actionRecycle.run(creep);
        }
    }
};
