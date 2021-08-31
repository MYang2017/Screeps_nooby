var funcB = require('funcBuildingPlanner');

global.highwayManager = function (r) {
    let highways = r.memory.highways;
    
    if (highways == undefined) {
        r.memory.highways = {};
    }
    else {
        if (r.storage) {
            let lvl = r.controller.level
            // add upgrade highway
            if (lvl<7 || (r.controller.level==7 && r.memory.forSpawning.roomCreepNo.minCreeps.superUpgrader>0)) {
                if (r.storage) {
                    if (highways.upgrade == undefined) {
                        r.memory.highways.upgrade = {from: r.storage.pos, to: r.memory.upgradeVirtual, type: 'upgrade'};
                    }
                }
            }
            else if (r.storage.store.energy<150000) {
                r.memory.highways.upgrade = undefined;
            }
            
            // add resource highway
            /*if (lvl < 7) {
                for (let resId in Memory.mapInfo[r.name].eRes) {
                    let runCheck = false;
                    if (r.memory.highways[resId]) {
                        // already registered, pass
                        if (Game.time%1444 == 0) {
                            runCheck = true;
                        }
                        else {
                            runCheck = false;
                        }
                    }
                    else {
                        runCheck = true;
                    }
                    if (runCheck) {
                        let eRes = Game.getObjectById(resId);
                        let nearByStruc = eRes.pos.findInRange(FIND_STRUCTURES, 3);
                        let ifContainer = false;
                        let ifLink = false;
                        let cont
                        for (let struc of nearByStruc) {
                            if (struc.structureType == STRUCTURE_CONTAINER) {
                                ifContainer = true;
                                cont = struc;
                            }
                            if (struc.structureType == STRUCTURE_LINK) {
                                ifLink = true;
                            }
                        }
                        if (ifContainer && !ifLink) {
                            r.memory.highways[resId] = {from: cont.pos, to: r.storage.pos, type: resId};
                        }
                        else {
                            r.memory.highways[resId] = undefined;
                        }
                    }
                }
            }*/
            
            // maintain highway
            for (let hwName in r.memory.highways) {
                if (r.memory.highways[hwName]) {
                    let hw = r.memory.highways[hwName];
                    if (hw.path == undefined || (lvl>=7 && hw.seven == undefined)) {
                    //if (hw.path == undefined || ( lvl==7 )) {
                        initiateHighway(r, hw.from, hw.to, hw.type);
                        if (lvl>=7) {
                            r.memory.highways[hwName].seven = true;
                        }
                    }
                    else {
                        let paths = hw.path;
                        // remove mutual path in cached upgrade positions
                        if (hw.removeChecked == undefined) {
                            for (let upId in r.memory.superUpgraderPosisCach) {
                                for (let path of paths) {
                                    if (r.memory.superUpgraderPosisCach[upId].x == path.x && r.memory.superUpgraderPosisCach[upId].y == path.y) {
                                        r.memory.superUpgraderPosisCach.splice(upId, 1);
                                    }
                                }
                            }
                            r.memory.highways[hwName].removeChecked = true;
                        }
                        
                        // calculate drivers needed, add to memory for spawn
                        if (hwName!='upgrade') { // &&paths.length<30) { // res highway too short, we abandon it
                            r.memory.highways[hwName].no = 0;
                        }
                        else {
                            let noDrivers = Math.floor(paths.length/2);
                            if (noDrivers>6) {
                                noDrivers = Math.floor(paths.length/3.5);
                            }
                            r.memory.highways[hwName].no = noDrivers;
                        }
                    }
                }
            }
        }
    }
    
}

global.initiateHighway = function (r, from, to, type) {
    // find path
    // let dests = [new RoomPosition(from.x-1, from.y-1, r.name), new RoomPosition(from.x-1, from.y+1, r.name), new RoomPosition(from.x+1, from.y-1, r.name), new RoomPosition(from.x-1, from.y+1, r.name)];
    let dests = new RoomPosition(from.x, from.y, r.name);
    let start = new RoomPosition(to.x, to.y, r.name);
    //funcB.visualizePath(start, dests);
    
    let ret;
    if (r.controller.level>3) {
        if (type=='upgrade') {
            ret = funcB.findPathBasedOnGridEvenOddAndBankerBlockage(r, start, 1 , true, false);
            ret.path = ret.path.reverse();
        }
        else {
            ret = funcB.findPathBasedOnGridEvenOddAndBankerBlockage(r, dests, 1 , true, false);
        }
    }
    else {
        ret = funcB.findPathBasedOnGridEvenOdd(start, dests, 1 , true, false);
    }
    
    if (ret && ret.incomplete == false) {
        r.memory.highways[type].path = ret.path;
    }
    else {
        fo(r.name + ' high way road planning bugged');
    }
    
    // monitor spawn
    // controll creep motion
}
// let ret = funcB.findPathBasedOnGridEvenOdd(r.memory.anchor, generateLineBasedOnDir(r.name, r.memory.readyToRemoteMining[candidate]));
        
