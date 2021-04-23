var dog = require('action.idle');
var gogo = require('action.attackAllInOne');
var getB = require('action.getBoost');

module.exports = {
    run: function (creep) {
        //creep.travelTo(new RoomPosition(17, 10, 'E23S20'))
        //return
        // if need boost go boost
        // if boosted to go target room with range 1
        
        if (getB.run(creep)!=true) {
            return
        }
        else {creep.say(creep.memory.ifLead)
            if (creep.memory.home == undefined) {
                creep.memory.home = creep.room.name;
            }
            
            if (creep.memory.qtype == undefined) {
                if (creep.getActiveBodyparts(WORK)>0) {
                    creep.memory.qtype = 'chai';
                }
                else if (creep.getActiveBodyparts(ATTACK)>0) {
                    creep.memory.qtype = 'dong';
                }
                else {
                    creep.memory.qtype = 'nai';
                }
            }
            
            var swap = function (c1, c2) {
                let tmp = c1.memory.ifLead;
                c1.memory.ifLead = c2.memory.ifLead;
                c2.memory.ifLead = tmp;
                
                c1.moveTo(c2);
                c2.moveTo(c1);
            }
            
            var wannaBeAt = function (posnum, leaderpos) {
                let lx = leaderpos.x;
                let ly = leaderpos.y;
                let lrn = leaderpos.roomName;
                let tobe;
                let wx;
                let wy;
                let wrn = lrn;
    
                if (posnum==2) {
                    wx = lx-1;
                    wy = ly;
                }
                else if (posnum==3) {
                    wx = lx-1;
                    wy = ly+1;
                }
                else if (posnum==4) {
                    wx = lx;
                    wy = ly+1;
                }
                if (lx==0) {
                    wrn = generateRoomName(parseRoomName(lrn).x-1, parseRoomName(lrn).y);
                    wx = 49;
                }
                if (ly==49) {
                    wrn = generateRoomName(parseRoomName(lrn).x, parseRoomName(lrn).y+1);
                    wy = 0;
                }
                
                tobe = new RoomPosition(wx, wy, wrn);
                return tobe
            }
            
            var isAtPositionIfNotMove = function (cp, wanab) {
                if (cp.pos.x==wanab.x&&cp.pos.y==wanab.y&&cp.pos.roomName==wanab.roomName) {
                    return true
                }
                else {
                    cp.moveTo(wanab);
                    return false
                }
            }
            if (true) {
                //gogo.run(creep);
                if (creep.memory.quaded == undefined || creep.memory.quaded == false) {
                    if (creep.memory.target !== creep.room.name) { // not in target
                        // follow route
                        const route = Game.map.findRoute(creep.room, creep.memory.target);
                        let next = route[0];
                        if (route.length > 1) {
                            storedTravelFromAtoB(creep, 'l');
                            /*const exit = creep.pos.findClosestByRange(route[0].exit);
                            creep.travelTo(exit, {maxRooms: 1});*/
                        }
                        else if (route.length == 1) { // in waiting room, wait to be gathered
                            creep.memory.waitingRn = creep.room.name;
                            // wait for all to arrive
                            let allbross = creep.room.find(FIND_MY_CREEPS, {filter: c=>c.memory.role=='quads'&&c.memory.quadsId==creep.memory.quadsId});
                            let cuno = allbross.length;
                            //creep.moveTo(15, 6, {range: 3});
                            //return
                            if (cuno==4) {
                                
                                let mycps = creep.room.find(FIND_MY_CREEPS, {filter: c=>c.memory.role=='quads'&&c.memory.quadsId==creep.memory.quadsId&&c.memory.ifLead==1});
                                let quadsno = mycps.length;
                                if (quadsno==1) {
                                    let qeader = mycps[0]; // quads leader
                                    let myQosi = creep.memory.ifLead;
                                    if (myQosi == 2) { // move to position based on my quad position id
                                        if (creep.pos.getRangeTo(qeader.pos.x-1, qeader.pos.y)!=0) {
                                            creep.moveTo(qeader.pos.x-1, qeader.pos.y, {range: 0, maxRooms: 1});
                                        }
                                        else { // =0 , at position, quaded
                                            creep.memory.quaded = true;
                                            if (qeader.memory.cpIds==undefined||qeader.memory.cpIds.length==0) {
                                                qeader.memory.cpIds = [];
                                            }
                                            qeader.memory.cpIds.push(creep.id);
                                        }
                                    }
                                    else if (myQosi == 3) { // move to position based on my quad position id
                                        if (creep.pos.getRangeTo(qeader.pos.x-1, qeader.pos.y+1)!=0) {
                                            creep.moveTo(qeader.pos.x-1, qeader.pos.y+1, {range: 0, maxRooms: 1});
                                        }
                                        else { // =0 , at position, quaded
                                            creep.memory.quaded = true;
                                            if (qeader.memory.cpIds==undefined||qeader.memory.cpIds.length==0) {
                                                qeader.memory.cpIds = [];
                                            }
                                            qeader.memory.cpIds.push(creep.id);
                                        }
                                    }
                                    else if (myQosi == 4) { // move to position based on my quad position id
                                        if (creep.pos.getRangeTo(qeader.pos.x, qeader.pos.y+1)!=0) {
                                            creep.moveTo(qeader.pos.x, qeader.pos.y+1, {range: 0, maxRooms: 1});
                                        }
                                        else { // =0 , at position, quaded
                                            creep.memory.quaded = true;
                                            if (qeader.memory.cpIds==undefined||qeader.memory.cpIds.length==0) {
                                                qeader.memory.cpIds = [];
                                            }
                                            qeader.memory.cpIds.push(creep.id);
                                        }
                                    }
                                    else if (myQosi == 1) {
                                        if (creep.memory.cpIds&&creep.memory.cpIds.length==3) {
                                            creep.memory.quaded = true;
                                        }
                                        else {
                                            creep.moveTo(16, 5, {range: 3});
                                            return
                                            gogo.run(creep);
                                            return
                                            /*
                                            let bros = creep.room.find(FIND_MY_CREEPS, {filter: c=>c.memory.quadsId == creep.memory.quadsId && !creep.memory.quaded && c.memory.ifLead != creep.memory.ifLead});
                                            for (let bro of bros) {
                                                let myQosi = bro.memory.ifLead;
                                                if (myQosi == 2) { // move to position based on my quad position id
                                                    if (creep.pos.getRangeTo(qeader.pos.x-1, qeader.pos.y)!=0) {
                                                        creep.moveTo(qeader.pos.x-1, qeader.pos.y, {range: 0, maxRooms: 1});
                                                    }
                                                }
                                                if (myQosi == 3) { // move to position based on my quad position id
                                                    if (creep.pos.getRangeTo(qeader.pos.x-1, qeader.pos.y+1)!=0) {
                                                        creep.moveTo(qeader.pos.x-1, qeader.pos.y+1, {range: 0, maxRooms: 1});
                                                    }
                                                }
                                                if (myQosi == 4) { // move to position based on my quad position id
                                                    if (creep.pos.getRangeTo(qeader.pos.x, qeader.pos.y+1)!=0) {
                                                        creep.moveTo(qeader.pos.x, qeader.pos.y+1, {range: 0, maxRooms: 1});
                                                    }
                                                }
                                            }
                                            return
                                            */
                                        }
                                    }
                                }
                                else { // leader not here yet
                                    // wait
                                    //creep.moveTo(15, 6, {range: 3})
                                    gogo.run(creep);
                                    return
                                    //dog.run(creep);
                                }
                            }
                            else { // not gathered yet
                                let enemies = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter: s=>!allyList().includes(s.owner.username) });
                                if (enemies) {
                                    creep.moveTo(enemies, {maxRooms: 1});
                                }
                                else {
                                    creep.moveTo(16, 5, {range: 3});
                                }
                                gogo.run(creep);
                            }
                        }
                        else {
                            fo('in before quaded?! ohoh...');
                        }
                    }
                }
                else { // quaded
                    // register cpIds
                    if (creep.memory.cpIds == undefined) {
                        let ids = [];
                        let bros = creep.room.find(FIND_MY_CREEPS, {filter:c=>c.memory.quadsId == creep.memory.quadsId && c.memory.ifLead != creep.memory.ifLead});
                        for (let bro of bros) {
                            ids.push(bro.id);
                        }
                        creep.memory.cpIds = ids;
                    }
                    
                    if (creep.memory.attack==undefined || creep.memory.attack==true) {
                        if (creep.memory.ifLead == 1) {
                            // default moving target pos
                            let tar = new RoomPosition(10, 10, creep.memory.target);
                            // logic of leader that controls the motion of every one
                            // if flag
                            let flag = creep.room.find(FIND_FLAGS);
                            
                            if (flag.length>0) {
                                let tars = flag[0].pos.findInRange(FIND_STRUCTURES, 0);
                                if (tars.length>0) { // if struct at flag
                                    // save as mem.tarId
                                    for (let cpId of creep.memory.cpIds) {
                                        let cp = Game.getObjectById(cpId);
                                        cp.memory.tarId = tars[0].id;
                                    }
                                }
                                // move to flag
                                tar = flag[0].pos;
                            }
                            else { // room no flag
                                // if creep damaged badly, move back and heal
                                let healthy = true;
                                for (let cpId of creep.memory.cpIds) {
                                    let cp = Game.getObjectById(cpId);
                                    if (cp.hitsMax-cp.hits>400) {
                                        healthy = false;
                                        if (creep.memory.waitingRn) {
                                            tar = new RoomPosition(10, 10, creep.memory.waitingRn);
                                        }
                                        else {
                                            tar = new RoomPosition(25, 25, creep.memory.home);
                                        }
                                    }
                                }
                                if (healthy) { // all healthy
                                    // if not in target
                                    if (creep.room.name != creep.memory.target) {
                                        tar = new RoomPosition(10, 10, creep.memory.target); // move to target, tar unchanged
                                    }
                                    else { // in target
                                        let preStoredId = creep.memory.tarId;
                                        if ( preStoredId && Game.getObjectByIdobject(preStoredId) ) { // pre searched structure
                                            tar = Game.getObjectByIdobject(preStoredId);
                                        }
                                        else { // no prestored Id, find weakest accessable wall/rampt struct as tar
                                            fo('please select quads struct id');
                                        }
                                    }
                                }
                            }
                            // movement manage of all quads
                            // if at tricky position we just move
                            
                            if (creep.pos.y==0||creep.pos.y==1||creep.pos.y==49||creep.pos.y==48||creep.pos.x==1||creep.pos.x==0||creep.pos.x==49||creep.pos.x==48) {
                                let ret = findPathForQuadsLeader(creep.pos, tar)
                                let pos = ret.path[0];
                                for (let cpId of creep.memory.cpIds) {
                                    let cp = Game.getObjectById(cpId);
                                    cp.move(creep.pos.getDirectionTo(pos));
                                }
                                creep.move(creep.pos.getDirectionTo(pos));
                            }
                            else { // other normal quads positions, move like a quad and wait for behind
                                let ret = findPathForQuadsLeader(creep.pos, tar);
                                let moveall = true;
                                for (let cpId of creep.memory.cpIds) {
                                    let cp = Game.getObjectById(cpId);
                                    // check all individual position
                                    let myQosi = cp.memory.ifLead;
                                    let qeader = creep;
                                    if (myQosi !== 1) { // move to position based on my quad position id
                                        let wannabe = wannaBeAt(myQosi, qeader.pos);
                                        if (isAtPositionIfNotMove(cp, wannabe)) {
                                            //moveall = true;
                                        }
                                        else {
                                            moveall = false;
                                        }
                                    }
                                    if (cp.fatigue>0||cp.memory.quaded==undefined||cp.memory.quaded==false) {
                                        moveall = false;
                                    }
                                }
                                if (creep.fatigue>0) {
                                    moveall = false;
                                }
                                if (moveall) {
                                    if (ret.path.length>0) {
                                        // move path[0]
                                        let pos = ret.path[0];
                                        for (let cpId of creep.memory.cpIds) {
                                            let cp = Game.getObjectById(cpId);
                                            cp.move(creep.pos.getDirectionTo(pos));
                                        }
                                        creep.move(creep.pos.getDirectionTo(pos));
                                    }
                                    else { // at posi
                                        
                                        if (true) {//(tar.structureType) { // if target is structure
                                            let allOtherIds = [];
                                            for (let id of creep.memory.cpIds) {
                                                allOtherIds.push(id);
                                            }
                                            allOtherIds.push(creep.id);
                                            let toback = [];
                                            let toup = [];
                                            // look for in range creeps
                                            for (let cpId of allOtherIds) {
                                                let cp = Game.getObjectById(cpId);
                                                if (cp.memory.qtype=='nai' && cp.pos.getRangeTo(tar)<2) { // need to back
                                                    toback.push(cp.id);
                                                }
                                                else if (cp.memory.qtype=='dong' && cp.pos.getRangeTo(tar)>1) { // need to back
                                                    toup.push(cp.id);
                                                }
                                            }
                                            if (toback.length>1 && toup.length>1) {
                                                swap(Game.getObjectById(toback[1]), Game.getObjectById(toup[1]));
                                                swap(Game.getObjectById(toback[0]), Game.getObjectById(toup[0]));
                                            }
                                            else if (toback.length>0 && toup.length>0) {
                                                swap(Game.getObjectById(toback[0]), Game.getObjectById(toup[0]));
                                            }
                                        }
                                    }
                                }
                                else {
                                    // wait for others to get in position
                                }
                            }
                        }
                        else {
                            // not leader do nothing
                        }
                    }
                    else { // in room attack
                        
                    }
                }
            }
        }
        gogo.run(creep);
    }
};
