var dog = require('action.idle');
var gogo = require('action.attackAllInOne');
var getB = require('action.getBoost');

module.exports = {
    run: function (creep) {
        creep.memory.free=undefined;
        /*
        creep.travelTo(new RoomPosition(17, 48, 'W17S26'))
        return
        */
        // if need boost go boost
        // if boosted to go target room with range 1
        
        if (creep.room.name=='W12S15') {
            creep.moveTo(9, 21)
            creep.rangedMassAttack();
            creep.heal(creep);
            return
        }
        
        let disband = false;
        
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
                
                try {
                    moveSafeWithDirectionNotCoord(c1, c2.pos);
                    moveSafeWithDirectionNotCoord(c2, c1.pos);
                }
                catch (e) {
                    c1.moveTo(c2);
                    c2.moveTo(c1);
                }
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
                //gogo.run(creep);chainMotion = function (creep, tarpos, followerName, ifLead)
                if (creep.memory.quaded == undefined || creep.memory.quaded == false) {
                    if (creep.memory.restRn == undefined) {
                        let route = Game.map.findRoute(creep.room.name, creep.memory.target, {
                            routeCallback(roomName, fromRoomName) {
                                let parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
                                let isHighway = (parsed[1] % 10 === 0) || 
                                                (parsed[2] % 10 === 0);
                                let isMyRoom = Game.rooms[roomName] &&
                                    Game.rooms[roomName].controller &&
                                    Game.rooms[roomName].controller.my;
                                if (isHighway || isMyRoom) {
                                    return 1;
                                }
                                else if (Game.shard.name=='shard3' && (roomName=='E11S49'||roomName=='E12S49'||roomName=='E11S51')) {
                                    return 255;
                                }
                                else if (Game.shard.name=='shardSeason' && (roomName=='W11S22'||roomName=='W2S30')) {
                                    return 6
                                }
                                else if (Memory.rooms[roomName] && Memory.rooms[roomName].avoid) {
                                    return 12;
                                }
                                else {
                                    return 3.8;
                                }
                            }});
                        let rest = route[route.length-2];
                        creep.memory.restRn = rest.room;
                    }
                    if (creep.room.name!=creep.memory.restRn) { // not in rest room
                        if (creep.memory.ifLead==1) { // find rest room for leader
                            chainMotion(creep, new RoomPosition(25, 25, creep.memory.restRn), creep.memory.fn, true);
                        }
                        else {
                            let tofollow = Game.creeps[creep.memory.ln];
                            if (tofollow==null) {
                                dog.run(creep);
                            }
                            else {
                                chainMotion(creep, tofollow.pos, creep.memory.fn, false);
                            }
                        }
                    }
                    else { // in rest room
                        if (creep.memory.ifLead==1) {
                            if (creep.memory.standByPosi == undefined) {
                                let rpos = roomWonderingPosi(creep.room, creep.pos);
                                creep.memory.standByPosi = {x:rpos.x, y:rpos.y};
                                //creep.memory.standByPosi = {x:5, y:27};
                                return
                                let terrain = new Room.Terrain(creep.room.name);
                                let exitdir = Game.map.findExit(creep.room.name, creep.memory.target);
                                if (exitdir == FIND_EXIT_TOP) {
                                    let okposis = 0;
                                    for (let x = 3; x < 49; i++) {
                                        if (terrain.get(x-1, 1)!==TERRAIN_MASK_WALL) {
                                            okposis += 1;
                                        }
                                        if (terrain.get(x-1, 2)!==TERRAIN_MASK_WALL) {
                                            okposis += 1;
                                        }
                                        if (terrain.get(x, 1)!==TERRAIN_MASK_WALL) {
                                            okposis += 1;
                                        }
                                        if (terrain.get(x, 2)!==TERRAIN_MASK_WALL) {
                                            okposis += 1;
                                        }
                                        if (okposis == 4) {
                                            creep.memory.standByPosi = {x:x, y:1};
                                            break;
                                        }
                                    }
                                }
                                else if (exitdir == FIND_EXIT_LEFT) {
                                    let okposis = 0;
                                    for (let y = 1; x < 48; i++) {
                                        if (terrain.get(1, y)!==TERRAIN_MASK_WALL) {
                                            okposis += 1;
                                        }
                                        if (terrain.get(2, y+1)!==TERRAIN_MASK_WALL) {
                                            okposis += 1;
                                        }
                                        if (terrain.get(1, y)!==TERRAIN_MASK_WALL) {
                                            okposis += 1;
                                        }
                                        if (terrain.get(2, y+1)!==TERRAIN_MASK_WALL) {
                                            okposis += 1;
                                        }
                                        if (okposis == 4) {
                                            creep.memory.standByPosi = {x:2, y:y};
                                            break;
                                        }
                                    }
                                }
                                
                            }
                            if (creep.memory.standBy == undefined) {
                                if (creep.pos.x == creep.memory.standByPosi.x && creep.pos.y == creep.memory.standByPosi.y) {
                                    creep.memory.standBy = true;
                                    creep.memory.quaded=true;
                                }
                                else {
                                    chainMotion(creep, new RoomPosition(creep.memory.standByPosi.x, creep.memory.standByPosi.y, creep.memory.restRn), creep.memory.fn, true);
                                }
                            }
                        }
                        else {
                            let mycps = creep.room.find(FIND_MY_CREEPS, {filter: c=>c.memory.role=='quads'&&c.memory.quadsId==creep.memory.quadsId&&c.memory.ifLead==1});
                            if (mycps && mycps.length>0 && mycps[0].memory.standBy) {
                                // move to quad position
                                let qeader = mycps[0];
                                // move to position based on my quad position id
                                let wannabe = wannaBeAt(creep.memory.ifLead, qeader.pos);
                                if (isAtPositionIfNotMove(creep, wannabe)) {
                                    creep.memory.quaded=true;
                                }
                            }
                            else {
                                let tofollow = Game.creeps[creep.memory.ln];
                                chainMotion(creep, tofollow.pos, creep.memory.fn, false);
                            }
                        }
                    }
                    gogo.run(creep);
                    return
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
                        if (creep.memory.ifLead == 1) {
                            // default moving target pos
                            let tar = new RoomPosition(25, 25, creep.memory.target);
                            /*
                            if (Game.rooms[creep.memory.target]) {
                                if (Game.rooms[creep.memory.target].controller) {
                                    tar = Game.rooms[creep.memory.target];
                                }
                            }
                            */
                            // logic of leader that controls the motion of every one
                            // if flag
                            let flag = creep.pos.findClosestByRange(FIND_FLAGS, {filter:f=>f.color!=COLOR_RED});
                            
                            /*
                            if (flag.length>0) {
                                if (flag[0].pos.findInRange(FIND_MY_CREEPS, 1).length>0) {
                                    flag[0].remove();
                                }
                            }
                            */
                            
                            let attackRangeForPb;
                            
                            if (flag) {
                                let tars = flag.pos.findInRange(FIND_STRUCTURES, 0);
                                // move to flag
                                tar = flag.pos;
                            }
                            else { // room no flag
                                /*
                                if (creep.memory.tempTar && Game.time%9!==0) {
                                    tar = new RoomPosition(creep.memory.tempTar.x, creep.memory.tempTar.y, creep.memory.tempTar.roomName);
                                }
                                */
                                if (creep.memory.target !== creep.room.name) {
                                    // tar unchanged to target room centre
                                }
                                else { // in tar room
                                    let tarobj;
                                    if (isHighway(creep.room.name)) {
                                        let pbs = creep.room.find(FIND_STRUCTURES, {filter:s=>s.structureType==STRUCTURE_POWER_BANK});
                                        if (pbs.length>0) {
                                            let hsts_near_pb = pbs[0].pos.findInRange(FIND_HOSTILE_CREEPS, 4);
                                            if (hsts_near_pb.length>0) {
                                                tarobj = hsts_near_pb;
                                                tar = hsts_near_pb[0].pos;
                                            }
                                            else {
                                                tarobj = tar;
                                                tar = pbs[0].pos;
                                                attackRangeForPb = 2;
                                            } 
                                        }
                                        else {
                                            let toprots = creep.room.find(FIND_DROPPED_RESOURCES, {filter: d=>d.resourceType=='power'});
                                            if (toprots.length>0) {
                                                tarobj = toprots;
                                                tar = toprots[0].pos;
                                            }
                                            else {
                                                for (let cpId of creep.memory.cpIds) {
                                                    let cp = Game.getObjectById(cpId);
                                                    if (cp) {
                                                        cp.memory.role='kiter';
                                                    }
                                                }
                                                creep.memory.role='kiter';
                                            }
                                        }
                                    }
                                    if (tarobj==undefined) {
                                        // check if structure in euclidean
                                        tarobj = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {filter: s=>s.structureType!=STRUCTURE_CONTROLLER && s.structureType!=STRUCTURE_ROAD && s.structureType!=STRUCTURE_POWER_BANK && s.pos.findInRange(FIND_HOSTILE_CREEPS, 3, {filter:cc=>cc.getActiveBodyparts(ATTACK)>0}).length==0 && false==shouldIRetreat(creep, calculateTowerDamageAtPoint(s.pos,creep.room.name))});
                                        if (tarobj == undefined) { // if not find non-euclidean others
                                            tarobj = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter: h=>h.fatigue>0 && h.hits<h.hitsMax});
                                            if (tarobj == undefined) {
                                                tarobj = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter: h=>h.body.length-h.getActiveBodyparts(CARRY)-h.getActiveBodyparts(MOVE)>=h.getActiveBodyparts(MOVE) && (h.pos.findInRange(FIND_SOURCES, 5).length>0 && h.getActiveBodyparts(WORK)>0)});
                                                if (tarobj == undefined) { // if not find non-euclidean others
                                                    tarobj = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter: h=>h.body.length-h.getActiveBodyparts(CARRY)-h.getActiveBodyparts(MOVE)>=h.getActiveBodyparts(MOVE) && h.getActiveBodyparts(WORK)>0});
                                                    if (tarobj == undefined) { // if not find non-euclidean others
                                                        tarobj = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter: h=>h.body.length-h.getActiveBodyparts(CARRY)-h.getActiveBodyparts(MOVE)>=h.getActiveBodyparts(MOVE)});
                                                        if (tarobj == undefined) { // if not find non-euclidean others
                                                            tarobj = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: s=>s.structureType==STRUCTURE_ROAD || s.structureType==STRUCTURE_CONTAINER});
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                        if (tarobj) {
                                            tar = tarobj.pos;
                                            creep.memory.tempTar = tar;
                                        }
                                        else {
                                            // if creep damaged badly, move back and heal
                                            let healthy = true;
                                            for (let cpId of creep.memory.cpIds) {
                                                let cp = Game.getObjectById(cpId);
                                                if (cp && cp.hitsMax-cp.hits>400) {
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
                                                    tar = new RoomPosition(25, 25, creep.memory.target); // move to target, tar unchanged
                                                }
                                                else { // in target
                                                    fo('please select quads struct id');
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            // movement manage of all quads
                            // if at tricky position we just move
                            if (creep.pos.y==0||creep.pos.y==49||creep.pos.y==48||creep.pos.x==1||creep.pos.x==0||creep.pos.x==49) {
                                if (creep.room.name!=creep.memory.target) {
                                    let ret = findPathForQuadsLeader(creep.pos, tar, false, 1, creep.name)
                                    let pos = ret.path[0];
                                    for (let cpId of creep.memory.cpIds) {
                                        let cp = Game.getObjectById(cpId);
                                        if (cp) {
                                            cp.move(creep.pos.getDirectionTo(pos));
                                        }
                                    }
                                    creep.move(creep.pos.getDirectionTo(pos));
                                }
                                else {
                                    let gather = true;
                                    for (let cpId of creep.memory.cpIds) {
                                        let cp = Game.getObjectById(cpId);
                                        if (cp && cp.room.name==creep.room.name && cp.pos.getRangeTo(creep)>1) {
                                            gather = false;
                                            break;
                                        }
                                    }
                                    if (gather) {
                                        let ret = findPathForQuadsLeader(creep.pos, tar, false, 1, creep.name)
                                        let pos = ret.path[0];
                                        for (let cpId of creep.memory.cpIds) {
                                            let cp = Game.getObjectById(cpId);
                                            if (cp) {
                                                cp.move(creep.pos.getDirectionTo(pos));
                                            }
                                        }
                                        creep.move(creep.pos.getDirectionTo(pos));
                                    }
                                    else {
                                        if (creep.pos.x<2) {
                                            creep.move(RIGHT);
                                        }
                                        else if (creep.pos.x>48) {
                                            creep.move(LEFT);
                                        }
                                        else if (creep.pos.y>47) {
                                            creep.move(TOP);
                                        }
                                        else if (creep.pos.y<1) {
                                            creep.move(BOTTOM);
                                        }
                                    }
                                }
                            }
                            else { // other normal quads positions, move like a quad and wait for behind
                                let ret;
                                let ifflee = false;
                                let fleeRange = 1;
                                let redheads = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 2, {filter:c=>c.getActiveBodyparts(ATTACK)>0});
                                if (redheads.length>0) {
                                    ifflee = true;
                                    tar = redheads[0].pos;
                                }
                                else {
                                    let theOtherGuy = new RoomPosition(creep.pos.x-1, creep.pos.y+1, creep.room.name);
                                    otherredheads = theOtherGuy.findInRange(FIND_HOSTILE_CREEPS, 2, {filter:c=>c.getActiveBodyparts(ATTACK)>0});
                                    if (otherredheads.length>0) {
                                        ifflee = true;
                                        fleeRange = 2;
                                        tar = otherredheads[0].pos;
                                    }
                                    else {
                                        theOtherGuy = new RoomPosition(creep.pos.x-1, creep.pos.y, creep.room.name);
                                        otherredheads = theOtherGuy.findInRange(FIND_HOSTILE_CREEPS, 2, {filter:c=>c.getActiveBodyparts(ATTACK)>0});
                                        if (otherredheads.length>0) {
                                            ifflee = true;
                                            fleeRange = 2;
                                            tar = otherredheads[0].pos;
                                        }
                                        else {
                                            theOtherGuy = new RoomPosition(creep.pos.x, creep.pos.y+1, creep.room.name);
                                            otherredheads = theOtherGuy.findInRange(FIND_HOSTILE_CREEPS, 2, {filter:c=>c.getActiveBodyparts(ATTACK)>0});
                                            if (otherredheads.length>0) {
                                                ifflee = true;
                                                fleeRange = 2;
                                                tar = otherredheads[0].pos;
                                            }
                                        }
                                    }
                                }
                                try {
                                    //fo(calculateTowerDamageAtPoint(tar, creep.room.name));
                                    new RoomVisual(creep.room.name).circle(tar.x, tar.y, {radius: 0.41, fill: 'red'});
                                }
                                catch (e) {
                                    fo('quads target wrong');
                                }
                                if (ifflee) { // endanger, need to fall back
                                    ret = findPathForQuadsLeader(creep.pos, tar, true, fleeRange, creep.name); // third parameter true for flee
                                }
                                else {
                                    if (attackRangeForPb) {
                                        ret = findPathForQuadsLeader(creep.pos, tar, false, attackRangeForPb, creep.name);
                                    }
                                    else {
                                        ret = findPathForQuadsLeader(creep.pos, tar, false, 1, creep.name);
                                    }
                                }
                                let moveall = true;
                                for (let cpId of creep.memory.cpIds) {
                                    let cp = Game.getObjectById(cpId);
                                    // check all individual position
                                    if (cp) {
                                        let myQosi = cp.memory.ifLead;
                                        let qeader = creep;
                                        if (qeader==undefined) {
                                            //disband = true;
                                        }
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
                                            if (cp) {
                                                cp.move(creep.pos.getDirectionTo(pos));
                                            }
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
                                            let ifAllRangers = true;
                                            let boostedNaiNo = 0;
                                            // look for in range creeps
                                            for (let cpId of allOtherIds) {
                                                let cp = Game.getObjectById(cpId);
                                                if (cp) {
                                                    if (cp.memory.qtype!=='nai') {
                                                        ifAllRangers = false;
                                                    }
                                                    else {
                                                        if (checkIfCreepIsBoosted(cp, RANGED_ATTACK)) {
                                                            boostedNaiNo += 1;
                                                        }
                                                    }
                                                    if (cp.memory.qtype=='nai' && cp.pos.getRangeTo(tar)<2) { // need to back
                                                        toback.push(cp.id);
                                                    }
                                                    else if (cp.memory.qtype=='dong' && cp.pos.getRangeTo(tar)>1) { // need to back
                                                        toup.push(cp.id);
                                                    }
                                                    else if (cp.memory.qtype=='chai' && cp.pos.getRangeTo(tar)>1) { // need to back
                                                        toup.push(cp.id);
                                                    }
                                                }
                                            }
                                            if (false && ifAllRangers && boostedNaiNo<4) {
                                                toback = [];
                                                toup = [];
                                                for (let cpId of allOtherIds) {
                                                    let cp = Game.getObjectById(cpId);
                                                    if (checkIfCreepIsBoosted(cp, RANGED_ATTACK)) { // need to back
                                                        toup.push(cp.id);
                                                    }
                                                    else {
                                                        toback.push(cp.id);
                                                    }
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
                            // if leader die, run as kiter
                            let ourleader = Game.creeps['1'+creep.name.slice(1,creep.name.length)];
                            if (ourleader==undefined) {
                                creep.memory.role='kiter';
                            }
                            // not leader do nothing
                        }
                }
            }
        }
        /*
        let ff = creep.room.find(FIND_FLAGS, {filter: f=>f.color==COLOR_RED});
        if (ff.length>0) {
            if (creep.pos.getRangeTo(ff[0])>1) {
                creep.travelTo(ff[0], {maxRooms: 1});
            }
        }
        else {
            if (disband || creep.room.find(FIND_STRUCTURES, {filter:t=>t.structureType==STRUCTURE_TOWER}).length==0) {
                
            }
        }
        */
        gogo.run(creep);
    }
};
