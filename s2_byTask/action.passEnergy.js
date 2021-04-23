module.exports = {
    run: function(creep) {
        let r = creep.room;
        
        let carryNo = creep.getActiveBodyparts(CARRY);
        
        let creepPass = carryNo<10 && Game.cpu.bucket>9000;
        
        if (creepPass) { //(creep.pos.x > 1 &&  creep.pos.x < 48 && creep.pos.y > 1 && creep.pos.y < 48) {
            if (creep.memory._trav && creep.memory._trav.path) {
                let nextPos = getPosByDir(creep.pos, creep.memory._trav.path[1]);
                creep.room.visual.circle(creep.pos, {fill: 'transparent', radius: 0.55, stroke: 'red'});
                creep.room.visual.circle(nextPos.x, nextPos.y, {fill: 'transparent', radius: 0.55, stroke: 'green'});
                let pastPos = new RoomPosition(creep.memory.prvPosi.x, creep.memory.prvPosi.y, creep.memory.prvPosi.roomName);
                creep.room.visual.circle(pastPos, {fill: 'transparent', radius: 0.55, stroke: 'blue'});
            }
                        
            var revertDir = function (v) {
                return (v + 3) % 8 + 1
            }
            
            var swapMovementHistory = function (c) {
                if (c.memory.pDirs && c.memory._trav) {
                    let temp = c.memory.pDirs;
                    c.memory.pDirs = [revertDir(c.memory._trav.path[2]), revertDir(c.memory._trav.path[1]), revertDir(c.memory._trav.path[0])];
                    if (temp[2]) {
                        c.memory._trav.path[0] = revertDir(temp[2].toString());
                    }
                    else {
                        c.memory._trav.path[0] = 0;
                    }
                    if (temp[1]) {
                        c.memory._trav.path[1] = revertDir(temp[1].toString());
                    }
                    else {
                        c.memory._trav.path[1] = 0;
                    }
                    if (temp[0]) {
                        c.memory._trav.path[2] = revertDir(temp[0].toString());
                    }
                    else {
                        c.memory._trav.path[2] = 0;
                    }
                }
            }
            if (true) { // only do this when we have enough CPU
                if (creep.store.energy >= creep.store.getCapacity()/2 && creep.memory._trav && creep.memory._trav.path) { //        
                    let nextPos = getPosByDir(creep.pos, creep.memory._trav.path[1]);
                    let cools = r.lookForAt(LOOK_CREEPS, nextPos.x, nextPos.y);
                    
                    if (cools.length>0) {
                        let cool = cools[0];
                        if (!((cool.memory.role == 'miner')||(cool.memory.role == 'longDistanceHarvester')||(cool.memory.role == 'longDistanceLorry')||(cool.memory.role == 'symbolPicker')||(cool.memory.role == 'pioneer'))) {
                            if (cool.my && creep.memory && creep.memory._trav && creep.memory._trav.path && cool.memory && cool.memory._trav && cool.memory._trav.path && (creep.memory._trav.path[1]!=cool.memory._trav.path[1]) && (creep.memory.lastWorked == undefined || creep.memory.lastWorked!= cool.name) && cool.store.energy <= cool.store.getCapacity()/2 && (cool.memory.role == 'longDistanceLorry')) {
                                creep.room.visual.circle(creep.pos, {fill: 'transparent', radius: 0.55, stroke: 'red'});
                                creep.room.visual.circle(nextPos.x, nextPos.y, {fill: 'transparent', radius: 0.55, stroke: 'green'});
                                let pastPos = new RoomPosition(creep.memory.prvPosi.x, creep.memory.prvPosi.y, creep.memory.prvPosi.roomName);
                                creep.room.visual.circle(pastPos, {fill: 'transparent', radius: 0.55, stroke: 'blue'});
                                if  (creep.memory.working == true && cool.memory.working == false && creep.transfer(cool, 'energy') == OK) {
                                    
                                    /*creep.memory.working = false;
                                    creep.travelTo(new RoomPosition(creep.memory._trav.state[0], creep.memory._trav.state[1], creep.memory._trav.state[6]));
                                    let tempt = creep.memory._trav;
                                    creep.memory._trav = cool.memory._trav;
                                    creep.memory._trav.path = creep.memory._trav.path.substr(0);
                                    
                                    cool.travelTo(new RoomPosition(cool.memory._trav.state[0], cool.memory._trav.state[1], cool.memory._trav.state[6]));
                                    cool.memory._trav = tempt;
                                    cool.memory._trav.path = cool.memory._trav.path.substr(0);
                                    if (cool.store.energy >= cool.store.getCapacity()*0.8) {
                                        cool.memory.working = true;
                                    }
                                    */
                                    
                                    let tempMem = creep.memory;
                                    
                                    creep.memory.lastWorked = cool.name;
                                    cool.memory.lastWorked = creep.name;
                                    
                                    //creep.moveTo(new RoomPosition(creep.memory._trav.state[0], creep.memory._trav.state[1], creep.memory._trav.state[6]));
                                    //cool.moveTo(new RoomPosition(cool.memory._trav.state[0], cool.memory._trav.state[1], cool.memory._trav.state[6]));
                                    
                                    creep.moveTo(creep.memory.prvPosi.x, creep.memory.prvPosi.y, {range: 0});
                                    cool.moveTo(cool.memory.prvPosi.x, cool.memory.prvPosi.y, {range: 0});
                                    creep.memory.working = false;
                                    cool.memory.working = true;
                                    /*
                                    creep.memory = cool.memory;
                                    cool.memory = tempMem;
                                    
                                    creep.memory._trav.path = creep.memory._trav.path.substr(1);
                                    cool.memory._trav.path = cool.memory._trav.path.substr(1);
                                    */
                                    
                                    return true
                                }
                            }
                        }
                    }
                }
            }
        
            if (creep.store.energy < creep.store.getCapacity()/2 && creep.memory._trav && creep.memory._trav.path) { //        
                let nextPos = getPosByDir(creep.pos, creep.memory._trav.path[1]);
                let cools = r.lookForAt(LOOK_CREEPS, nextPos.x, nextPos.y);
                
                if (cools.length>0) {
                    let cool = cools[0];
                    if (cool.my && creep.memory && creep.memory._trav && creep.memory._trav.path && cool.memory && cool.memory._trav && cool.memory._trav.path && (creep.memory._trav.path[1]!=cool.memory._trav.path[1]) && (creep.memory.lastWorked == undefined || creep.memory.lastWorked!= cool.name) && cool.store.energy > cool.store.getCapacity()/2 && (cool.memory.role == 'longDistanceLorry')) {
                        creep.room.visual.circle(creep.pos, {fill: 'transparent', radius: 0.55, stroke: 'red'});
                        creep.room.visual.circle(nextPos.x, nextPos.y, {fill: 'transparent', radius: 0.55, stroke: 'green'});
                        let pastPos = new RoomPosition(creep.memory.prvPosi.x, creep.memory.prvPosi.y, creep.memory.prvPosi.roomName);
                        creep.room.visual.circle(pastPos, {fill: 'transparent', radius: 0.55, stroke: 'blue'});
                        if  (creep.memory.working == false && cool.memory.working == true && cool.transfer(creep, 'energy') == OK) {
                            /*creep.memory.working = false;
                            creep.travelTo(new RoomPosition(creep.memory._trav.state[0], creep.memory._trav.state[1], creep.memory._trav.state[6]));
                            let tempt = creep.memory._trav;
                            creep.memory._trav = cool.memory._trav;
                            creep.memory._trav.path = creep.memory._trav.path.substr(0);
                            
                            cool.travelTo(new RoomPosition(cool.memory._trav.state[0], cool.memory._trav.state[1], cool.memory._trav.state[6]));
                            cool.memory._trav = tempt;
                            cool.memory._trav.path = cool.memory._trav.path.substr(0);
                            if (cool.store.energy >= cool.store.getCapacity()*0.8) {
                                cool.memory.working = true;
                            }
                            */
                            
                            //creep.moveTo(new RoomPosition(creep.memory._trav.state[0], creep.memory._trav.state[1], creep.memory._trav.state[6]));
                            //cool.moveTo(new RoomPosition(cool.memory._trav.state[0], cool.memory._trav.state[1], cool.memory._trav.state[6]));
                            
                            creep.moveTo(creep.memory.prvPosi.x, creep.memory.prvPosi.y, {range: 0});
                            cool.moveTo(cool.memory.prvPosi.x, cool.memory.prvPosi.y, {range: 0});
                            
                            let tempMem = creep.memory;
                            
                            creep.memory.lastWorked = cool.name
                            cool.memory.lastWorked = creep.name;
                            
                            creep.memory.working = true;
                            cool.memory.working = false;
                            
                            /*creep.memory = cool.memory;
                            cool.memory = tempMem;
                            
                            creep.memory._trav.path = creep.memory._trav.path.substr(1);
                            cool.memory._trav.path = cool.memory._trav.path.substr(1);
                            */
                            
                            return true
                        }
                    }
                }
            }
        }
        
        let nbSs = r.lookForAtArea(LOOK_STRUCTURES,Math.max(creep.pos.y-1,0),Math.max(creep.pos.x-1,0),Math.min(creep.pos.y+1, 49),Math.min(creep.pos.x+1,49), true);

        for (let sId of nbSs) {
            let c = Game.getObjectById(sId.structure.id);
            if (c&&(c.structureType==STRUCTURE_TOWER||c.structureType==STRUCTURE_LINK||c.structureType==STRUCTURE_EXTENSION||c.structureType==STRUCTURE_SPAWN||c.structureType==STRUCTURE_TERMINAL||c.structureType==STRUCTURE_STORAGE||c.structureType==STRUCTURE_LAB)&&c.store.getFreeCapacity(RESOURCE_ENERGY)>0) {
                if (creep.transfer(c, 'energy') == OK) {
                    return
                }
            }
            if (c&&c.structureType==STRUCTURE_CONTAINER && c.store.getFreeCapacity('energy')>0) {
                if (c.pos.findInRange(FIND_SOURCES, 3).length>0 || c.pos.findInRange(FIND_MINERALS, 3).length>0) {
                    // pass, dont put into resource container
                }
                else {
                    if (creep.transfer(c, 'energy') == OK) {
                        return
                    }
                }
            }
        }
        
        if (creepPass) {
            let nbCs = r.lookForAtArea(LOOK_CREEPS,Math.max(creep.pos.y-1,0),Math.max(creep.pos.x-1,0),Math.min(creep.pos.y+1, 49),Math.min(creep.pos.x+1,49), true);
                
            for (let cId of nbCs) {
                let c = Game.getObjectById(cId.creep.id);
                if (c.my && c.store.getFreeCapacity()>0 && !((c.memory.role == 'miner')||(c.memory.role == 'longDistanceHarvester')||(c.memory.role == 'longDistanceLorry')||(c.memory.role == 'symbolPicker')||(c.memory.role == 'pioneer')||(c.memory.role == 'season2c'))) {
                    // ||(c.memory.role != 'lorry')||(c.memory.role != 'pickuper')||(c.memory.role != 'mover')
                    if (creep.transfer(c, 'energy') == OK) {
                        return
                    }
                }
            }
        }
    }
};
