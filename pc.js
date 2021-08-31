let doge = require('action.idle');
let runaway = require('action.flee');
let ded = require('role.dedicatedUpgraderHauler');
let fillE = require('action.fillEnergy');

/*
fo(JSON.stringify(Game.getObjectById('608c12a5de59bbc309a1c7a1').memory.missions={"target":"E9S52","todos":["steal"]}))
{"target":"E14S54","todos":["regenE"]}
*/

module.exports.powerCreepManaging = function (currentShard) {
    spawnPc(currentShard);
    for (let pcn in Game.powerCreeps) {
        let pc = Game.powerCreeps[pcn];
        let nowshard = pc.shard;
        if (pc && nowshard == currentShard) {
            if (Game.time%13==0 && pc.memory.home==pc.room.name && pc.room.controller && pc.room.controller.my) {
                roomFrenzyManager(pc.room.name)
            }
            runPc(pc);
        }
    }
    
    if (Game.time%50==0) {
        //Game.powerCreeps['囧囧囧囧囧囧'].upgrade(PWR_OPERATE_SPAWN); // 囧囧囧
        //Game.powerCreeps['囧囧囧囧囧囧'].upgrade(PWR_GENERATE_OPS);
        //Game.powerCreeps['艹艹艹'].upgrade(PWR_OPERATE_POWER);
        //Game.powerCreeps['艹艹艹'].upgrade(PWR_REGEN_SOURCE);
    }
    
    return
};

let spawnPc = function (sn) {
    let pc_spawnInfo = {'艹': {shard: 'shard3', rn: 'E11S47'}, 
                        '艹艹': {shard: 'shard3', rn: 'E1S41'},
                        '艹艹艹': {shard: 'shard3', rn: 'E1S49'},
                        '暴打小脑斧': {shard: 'shard2', rn: 'E13S53'},
                        '艹艹艹艹': {shard: 'shard2', rn: 'E13S53'}
                        };
    if (Game.shard.name=='shardSeason') {
        pc_spawnInfo = {'艹': {shard: 'shardSeason', rn: 'W1S19'},
                        '艹艹': {shard: 'shardSeason', rn: 'W19S18'},
                        '艹艹艹': {shard: 'shardSeason', rn: 'W9S19'},
                        '艹艹艹艹': {shard: 'shardSeason', rn: 'W9S9'},
                        '囧': {shard: 'shardSeason', rn: 'W28S19'},
                        '囧囧': {shard: 'shardSeason', rn: 'E1S29'},
                        '囧囧囧': {shard: 'shardSeason', rn: 'W29S12'},
                        '囧囧囧囧': {shard: 'shardSeason', rn: 'W19S27'},
                        '囧囧囧囧囧': {shard: 'shardSeason', rn: 'E1S29'},
                        '囧囧囧囧囧囧': {shard: 'shardSeason', rn: 'W9S28'},
        };
    }
        
    let myPcns = Object.keys(pc_spawnInfo);
    for (let mpcn of myPcns) {
        let pc = Game.powerCreeps[mpcn];
        if (pc.shard && pc.shard == sn) {
            // pass
        }
        else if (pc == undefined || pc.shard == null) {
            let pcinfo = pc_spawnInfo[mpcn];
            if (Game.shard.name==pcinfo.shard) {
                let r = Game.rooms[pcinfo.rn];
                if (r && r.memory.powerSpawnId && Game.getObjectById(r.memory.powerSpawnId)) {
                    pc.spawn(Game.getObjectById(r.memory.powerSpawnId));
                }
                else {
                    fo('pc powerspawn not ready yet in ' + pcinfo.shard + ' ' + pcinfo.rn);
                }
            }
        }
    }
}

let pcCheckWorkToDo = function (pc, helpRn) {
    if (pc.powers[PWR_REGEN_SOURCE].cooldown==0) {
//        pc.usePower(PWR_REGEN_SOURCE, );
    }
    else {
        return false
    }
}

let runPc = function (pc) {
            if (false && pc.name=='艹艹艹') {
                pc.travelTo(new RoomPosition(49, 33, 'W1S28'));
                generateOps(pc);
                //pc.drop('energy')
                return
            }
            if (pc.hits<0.8*pc.hitsMax && pc.room.controller && pc.room.controller==my) {
                pc.travelTo(pc.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter:t=>t.structureType==STRUCTURE_TOWER}), {maxRooms: 1});
                return
            }
            
            if (pcToBattle(pc)) {
                return
            }

            if (pc.pos.findInRange(FIND_HOSTILE_CREEPS, 4, {filter: c=> !allyList().includes(c.owner.username)}).length>0) {
                runaway.run(pc);
                return
            }
            let carryingOtherThings = _.sum(pc.store) - pc.store['ops'] > 0;
            if (pc.memory.home == undefined) {
                pc.memory.home = pc.room.name;
            }
            generateOps(pc);
            
            // Game.powerCreeps['艹'].memory.quests=[{type: PWR_REGEN_SOURCE, timer: Game.time, target:''}];
            let quests = pc.memory.quests
            if (pc.ticksToLive>1000 && quests && quests.length>0) {
                for (let quest of quests) {
                    if (quest.type==PWR_REGEN_SOURCE) {
                        if (quest.timer>Game.time) {
                            continue
                        }
                        else {
                            if (pc.room.name != quest.target) {
                                travelToTarget(pc, quest.target);
                                return
                            }
                            else {
                                if (pc.room.find(FIND_HOSTILE_CREEPS, {
                                    filter: s => (
                                        !allyList().includes(s.owner.username) 
                                        && (s.getActiveBodyparts(HEAL)+s.getActiveBodyparts(ATTACK)+s.getActiveBodyparts(RANGED_ATTACK)+s.getActiveBodyparts(WORK)+s.getActiveBodyparts(CLAIM)>0) // season 2 special
                                    )
                                    }).length>0) {
                                    quest.timer = Game.time+300;
                                }
                                else {
                                    if (regenE(pc)) {
                                        return
                                    }
                                    else {
                                        travelToTarget(pc, pc.memory.home);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            
            if (isHighway(pc.room.name)) {
                if (pc.memory.target) {
                    if (pc.ticksToLive<4500) {
                        let pbs = pc.room.find(FIND_STRUCTURES, {filter:s=>s.structureType==STRUCTURE_POWER_BANK&&s.pos.findInRange(FIND_CREEPS, 3)==0});
                        if (pbs.length>0) {
                            if (pc.pos.getRangeTo(pbs[0])>1) {
                                pc.travelTo(pbs[0], {maxRooms: 1});
                            }
                            else {
                                pc.renew(pbs[0]);
                            }
                            return
                        }
                    }
                }
                
                let route = Game.map.findRoute(pc.room, pc.memory.home, {
                    routeCallback(roomName, fromRoomName) {
                        let parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
                        let isHighway = (parsed[1] % 10 === 0) ||
                            (parsed[2] % 10 === 0);
                        let isMyRoom = Game.rooms[roomName] &&
                            Game.rooms[roomName].controller &&
                            Game.rooms[roomName].controller.my;
                        if (isHighway) {
                            return 2;
                        }
                        else if (isMyRoom) {
                            return 1;
                        }
                        else if (Game.shard.name=='shard3' && (roomName=='E11S49'||roomName=='E12S49'||roomName=='E11S51')) {
                            return 255;
                        }
                        else if (Memory.rooms[roomName] && Memory.rooms[roomName].avoid) {
                            return 255;
                        }
                        else {
                            return 2.8;
                        }
                    }
                });
                
                if (route.length > 0) {
                    if (route[0] && route[0].room) {
                        pc.travelTo(pc.pos.findClosestByRange(pc.room.findExitTo(route[0].room)), {maxRooms: 1});
                    }
                }
                return   
            }

            // when do we go back home
            if (pc.hits< 0.618*pc.hitsMax || pc.ticksToLive<1000 || 
                (pc.memory.missions && ((pc.room.name!==pc.memory.missions.target && _.sum(pc.store)>Math.min(199, 0.2*pc.store.getCapacity()))||(pc.room.name==pc.memory.missions.target && pc.store.getFreeCapacity('energy')<50))) || 
                 pc.room.find(FIND_HOSTILE_CREEPS, {filter: s=> (!allyList().includes(s.owner.username) && s.owner.username!='Source Keeper') && (s.getActiveBodyparts(ATTACK)+s.getActiveBodyparts(RANGED_ATTACK)>0) && s.pos.getRangeTo(pc)<4 }).length>0) {
                // if not at home
                if (pc.room.name != pc.memory.home) {
                    let route = Game.map.findRoute(pc.room, pc.memory.home, {
                        routeCallback(roomName, fromRoomName) {
                            let parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
                            let isHighway = (parsed[1] % 10 === 0) ||
                                (parsed[2] % 10 === 0);
                            let isMyRoom = Game.rooms[roomName] &&
                                Game.rooms[roomName].controller &&
                                Game.rooms[roomName].controller.my;
                            if (isHighway) {
                                return 2;
                            }
                            else if (isMyRoom) {
                                return 1;
                            }
                            else if (Game.shard.name=='shard3' && (roomName=='E11S49'||roomName=='E12S49'||roomName=='E11S51')) {
                                return 255;
                            }
                            else if (Memory.rooms[roomName] && Memory.rooms[roomName].avoid) {
                                return 255;
                            }
                            else {
                                return 2.8;
                            }
                        }
                    });
                    
                    if (route.length > 0) {
                        if (route[0] && route[0].room) {
                            pc.travelTo(pc.pos.findClosestByRange(pc.room.findExitTo(route[0].room)), {maxRooms: 1});
                        }
                    }
                    return
                    // if find pb
                        // renew at pb
                        //let powerBank = Game.getObjectById('XXX');
                        //Game.powerCreeps['PowerCreep1'].renew(powerBank);
                    // else 
                        // go back home
                }
                else { // at hoome
                    // renew
                    if (rewnewPc(pc, 2000)) {
                        // pass
                    }
                    else {
                        if (_.sum(pc.store)>Math.min(199, 0.2*pc.store.getCapacity()) || (_.sum(pc.store)>0&&pc.memory.missions&&pc.memory.missions.todos.includes('steal'))) {
                            // exchange ops and delivery product
                            for (let res in pc.store) {
                                let whereToPut = putATypeOfRes(pc.room, res);
                                if (whereToPut) {
                                    if (pc.pos.getRangeTo(whereToPut)>1) {
                                        pc.travelTo(whereToPut, {maxRooms: 1});
                                    }
                                    else {
                                        pc.transfer(whereToPut, res);
                                    }
                                }
                            }
                        }
                        else { // pass
                            doge.run(pc);
                            let restp = roomWonderingPosi(pc.room);
                            if (pc.pos.getRangeTo(restp.x, restp.y)>1) {
                                pc.travelTo(new RoomPosition(restp.x, restp.y, pc.memory.home), {range:2, maxRooms: 1});
                            }
                        }
                    }
                }
            }
            else { // do mission
                // .memory.missions = {target: 'E14S54', todos: ['regenE']};
                let missions = pc.memory.missions;
                if (missions) {
                    let target = missions.target;
                    if (Memory.rooms[target] && Memory.rooms[target].invaderCoreTimer && Game.time<Memory.rooms[target].invaderCoreTimer) {
                        doge.run(pc);
                        let restp = roomWonderingPosi(pc.room);
                        pc.travelTo(new RoomPosition(restp.x, restp.y, pc.room.name), {range:2, maxRooms: 1});
                        return
                    }
                    if (pc.room.name != target) {
                        travelToTarget(pc, target);
                    }
                    else {// else in target
                        let todos = missions.todos;
                        for (let todo of todos) {
                            if (todo == 'regenE') {
                                if (pc.room && pc.room.controller && !pc.room.controller.isPowerEnabled) { // enable first
                                    if (pc.pos.getRangeTo(pc.room.controller)>1) {
                                        pc.travelTo(pc.room.controller, {maxRooms: 1});
                                    }
                                    else {
                                        pc.enableRoom(pc.room.controller);
                                    }
                                }
                                else {
                                    if (regenE(pc)) {
                                        return
                                    }
                                }
                            }
                            else if (todo == 'steal') {
                                let tosteal = pc.pos.findClosestByRange(FIND_STRUCTURES, {filter:s=> (s.structureType==STRUCTURE_STORAGE || s.structureType==STRUCTURE_TERMINAL || s.structureType==STRUCTURE_CONTAINER || s.structureType==STRUCTURE_LINK) && _.sum(s.store)>0 && !isProtectedByRampart(s.pos)});
                                if (pc.pos.getRangeTo(tosteal)>1) {
                                    pc.travelTo(tosteal, {maxRooms: 1});
                                }
                                else {
                                    let totosteal = undefined;
                                    for (let tp in tosteal.store) {
                                        if (tp!='energy' && (tp.includes('X')||tp.length>2)) {
                                            totosteal = tp;
                                            break
                                        }
                                    }
                                    if (totosteal==undefined) {
                                        for (let tp in tosteal.store) {
                                            totosteal = tp;
                                            break
                                        }
                                    }
                                    pc.withdraw(tosteal, totosteal);
                                    return
                                }
                                return
                            }
                        }
                        if (pc.store.getFreeCapacity('energy')>50) {
                            // search for all nearby res
                            let dropped = pc.pos.findClosestByRange(FIND_DROPPED_RESOURCES);
                            let ds = [51, 51, 51];
                            if (dropped) {
                                ds[0] = pc.pos.getRangeTo(dropped);
                            }
                            let tmb = pc.pos.findClosestByRange(FIND_TOMBSTONES, {filter:t=>_.sum(t.store)>0});
                            if (tmb) {
                                ds[1] = pc.pos.getRangeTo(tmb);
                            }
                            let ctn = pc.pos.findClosestByRange(FIND_STRUCTURES, {filter: t=>t.structureType == STRUCTURE_CONTAINER && _.sum(t.store)>500});
                            if (ctn) {
                                ds[2] = pc.pos.getRangeTo(ctn);
                            }
                            // get closest
                            let index = 0;
                            let min = ds[index];
                    
                            for (let i=0; i<ds.length; i++) {
                                if (ds[i] < min) {
                                    min = ds[i];
                                    index = i;
                                }
                            }
                            
                            if (min==51) { // none found
                                doge.run(pc);
                                return
                            }
                            else {
                                if (index==0) { // pick
                                    if (pc.pos.getRangeTo(dropped)>1) {
                                        pc.travelTo(dropped, {offRoad: true, ignoreRoads: true, maxRooms: 1});
                                    }
                                    else {
                                        pc.pickup(dropped);
                                    }
                                    return
                                }
                                else { //withdraw
                                let towd;
                                    if (index==1) {
                                        towd = tmb;
                                    }
                                    else {
                                        towd = ctn;
                                    }
                                    if (pc.pos.getRangeTo(towd)>1) {
                                        pc.travelTo(towd, {offRoad: true, ignoreRoads: true, maxRooms: 1});
                                    }
                                    else {
                                        for (let syb in towd.store) {
                                            pc.withdraw(towd, syb);
                                            return
                                        }
                                    }
                                    return
                                }
                            }
                            return
                            let tmbs = pc.room.find(FIND_DROPPED_RESOURCES);
                            if (tmbs.length>0) {
                                for (let tmb of tmbs) {
                                    if (pc.pos.getRangeTo(tmb)>1) {
                                        pc.travelTo(tmb, {offRoad: true, ignoreRoads: true, maxRooms: 1});
                                    }
                                    else {
                                        pc.pickup(tmb);
                                    }
                                    break;
                                }
                            }
                            else {
                                tmbs = pc.room.find(FIND_TOMBSTONES, {filter:t=>_.sum(t.store)>0});
                                if (tmbs.length>0) {
                                    for (let tmb of tmbs) {
                                        for (let syb in tmb.store) {
                                            if (pc.pos.getRangeTo(tmb)>1) {
                                                pc.travelTo(tmb, {offRoad: true, ignoreRoads: true, maxRooms: 1});
                                            }
                                            else {
                                                pc.withdraw(tmb, syb);
                                            }
                                            break;
                                        }
                                    }
                                }
                                else {
                                    tmbs = pc.room.find(FIND_STRUCTURES, {filter: t=>t.structureType == STRUCTURE_CONTAINER && _.sum(t.store)>0});
                                    if (tmbs.length>0) {
                                        for (let tmb of tmbs) {
                                            for (let syb in tmb.store) {
                                                if (pc.pos.getRangeTo(tmb)>1) {
                                                    pc.travelTo(tmb, {offRoad: true, ignoreRoads: true, maxRooms: 1});
                                                }
                                                else {
                                                    pc.withdraw(tmb, syb);
                                                }
                                                break;
                                            }
                                        }
                                    }
                                    else {
                                        doge.run(pc);
                                    }
                                }
                            }
                        }
                        else {
                            doge.run(pc);
                        }
                    }
                }
                else { // home worker
                    pc.memory.target = pc.memory.home;
                    if (pc.memory.home!=pc.room.name) {
                        let route = Game.map.findRoute(pc.room, pc.memory.home, {
                            routeCallback(roomName, fromRoomName) {
                                let parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
                                let isHighway = (parsed[1] % 10 === 0) ||
                                    (parsed[2] % 10 === 0);
                                let isMyRoom = Game.rooms[roomName] &&
                                    Game.rooms[roomName].controller &&
                                    Game.rooms[roomName].controller.my;
                                if (isHighway) {
                                    return 2;
                                }
                                else if (isMyRoom) {
                                    return 1;
                                }
                                else if (Game.shard.name=='shard3' && (roomName=='E11S49'||roomName=='E12S49'||roomName=='E11S51')) {
                                    return 255;
                                }
                                else if (Memory.rooms[roomName] && Memory.rooms[roomName].avoid) {
                                    return 255;
                                }
                                else {
                                    return 2.8;
                                }
                            }
                        });
                        
                        if (route.length > 0) {
                            if (route[0] && route[0].room) {
                                pc.travelTo(pc.pos.findClosestByRange(pc.room.findExitTo(route[0].room)), {maxRooms: 1});
                            }
                        }
                        return
                    }
                    
                    // renew
                    if (rewnewPc(pc, 1500)) {
                        // pass
                    }
                    else {
                        // watch
                        if (watch(pc)) {
                            // pass
                        }
                        else {
                            // regen source
                            if (regenE(pc)) {
                                // pass
                            }
                            else {
                                if (superSpawn(pc)) {
                                    // pass
                                }
                                else {
                                    if (goldenFac(pc)) {
                                        // pass
                                    }
                                    else {
                                        if (goldenTerminal(pc)) {
                                            // pass
                                        }
                                        else {
                                            if (superPower(pc)) {
                                                // pass
                                            }
                                            else {
                                                if (regenM(pc)) {
                                                    // pass
                                                }
                                                else {
                                                    if (rewnewPc(pc, 4500)) {
                                                        // pass
                                                    }
                                                    else {
                                                        if (Game.shard.name=='shardSeason' && pc.room.controller && pc.room.controller.my && (pc.room.controller.level<8 || pc.room.find(FIND_MY_CREEPS, {filter:c=>c.memory.role=='superUpgrader'}).length>0)) {
                                                            // no mission assigned, do home work
                                                            if (pc.store.ops>pc.store.getCapacity('ops')*0.1 || (pc.store.getFreeCapacity('ops')==0 && pc.powers && pc.powers[PWR_GENERATE_OPS])) {
                                                                let whereToPut = putATypeOfRes(pc.room, 'ops'); 
                                                                if (pc.pos.getRangeTo(whereToPut)>1) {
                                                                    pc.travelTo(whereToPut, {maxRooms: 1});
                                                                }
                                                                else {
                                                                    // exchange ops and delivery product
                                                                    for (let res in pc.store) {
                                                                        if (res=='ops' && (pc.store['ops']>pc.store.getCapacity('ops')*0.1 || pc.store.getFreeCapacity('ops')==0)) {
                                                                            if (whereToPut) {
                                                                                pc.transfer(whereToPut, res);
                                                                                return
                                                                            }
                                                                        }
                                                                        else if (res!=='ops' && (pc.store['ops']>pc.store.getCapacity('ops')*0.1 || pc.store.getFreeCapacity('ops')==0)) {
                                                                            if (whereToPut) {
                                                                                let leaveCap = 1;
                                                                                if (pc.powers && pc.powers[PWR_GENERATE_OPS]) {
                                                                                    leaveCap += 3*POWER_INFO[PWR_GENERATE_OPS].level[pc.powers[PWR_GENERATE_OPS].level];
                                                                                }
                                                                                pc.transfer(whereToPut, res, Math.max(pc.store[res], pc.store[res]-leaveCap));
                                                                                return
                                                                            }
                                                                        }
                                                                        else {
                                                                            if (Game.shard.name == 'shardSeason' && pc.room.controller.my && pc.room.controller.level < 8) {
                                                                                ded.run(pc);
                                                                                return
                                                                            }
                                                                            else {
                                                                                let whereToPut = putATypeOfRes(pc.room, res);
                                                                                if (pc.pos.getRangeTo(whereToPut)>1) {
                                                                                    pc.travelTo(whereToPut, {maxRooms: 1});
                                                                                }
                                                                                else {
                                                                                    pc.transfer(whereToPut, res);
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                                return
                                                            }
                                                            
                                                            if (pc.store.energy==0) {
                                                                let toTakeE = pc.pos.findClosestByRange(FIND_STRUCTURES, {filter:c=>c.structureType==STRUCTURE_CONTAINER && c.pos.findInRange(FIND_SOURCES, 1).length>0 && c.store.energy>Math.min(1000, 1.5*pc.store.getFreeCapacity('energy'))});
                                                                if (undefined==toTakeE) {
                                                                    toTakeE = getATypeOfRes(pc.room, 'energy');
                                                                    if (!(toTakeE && toTakeE.store.energy>0)) {
                                                                        toTakeE = pc.room.storage;
                                                                        if (!(toTakeE && toTakeE.store.energy>0)) {
                                                                            ded.run(pc);
                                                                            return
                                                                        }
                                                                    }
                                                                }
                                                                if (pc.pos.getRangeTo(toTakeE)>1) {
                                                                    pc.travelTo(toTakeE, {maxRooms: 1});
                                                                }
                                                                else {
                                                                    let leaveCap = 1;
                                                                    if (pc.powers && pc.powers[PWR_GENERATE_OPS]) {
                                                                        leaveCap += 3*POWER_INFO[PWR_GENERATE_OPS].level[Math.max(0, pc.powers[PWR_GENERATE_OPS].level-1)] + 1;
                                                                    }
                                                                    pc.withdraw(toTakeE, 'energy', Math.min(toTakeE.store.energy, pc.store.getFreeCapacity('ops')-leaveCap));
                                                                }
                                                            }
                                                            else {
                                                                if (pc.room.find(FIND_MY_CREEPS, {filter:mc=>mc.memory.role=='quads'}).length>0 && pc.room.energyAvailable<pc.room.energyCapacityAvailable) {
                                                                    let tofill = pc.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter:c=>c.structureType==STRUCTURE_EXTENSION && c.store.getFreeCapacity('energy')>0});
                                                                    if (tofill) {
                                                                        if (pc.pos.getRangeTo(tofill)>1) {
                                                                            pc.travelTo(tofill, {maxRooms: 1});
                                                                        }
                                                                        else {
                                                                            pc.transfer(tofill, 'energy')
                                                                        }
                                                                        return
                                                                    }
                                                                }
                                                                ded.run(pc);
                                                                return
                                                            }
                                                        }
                                                        else {
                                                            if (pc.room.energyAvailable<pc.room.energyCapacityAvailable && pc.room.find(FIND_MY_CREEPS, { filter: c => c.memory.role == 'lorry' }).length == 0) {
                                                                if (pc.store.energy==0) {
                                                                    let toTakeE = pc.pos.findClosestByRange(FIND_STRUCTURES, {filter:c=>c.structureType==STRUCTURE_CONTAINER && c.pos.findInRange(FIND_SOURCES, 1).length>0 && c.store.energy>Math.min(1000, 1.5*pc.store.getFreeCapacity('energy'))});
                                                                    if (undefined==toTakeE) {
                                                                        toTakeE = getATypeOfRes(pc.room, 'energy');
                                                                        if (!(toTakeE && toTakeE.store.energy>0)) {
                                                                            toTakeE = pc.room.storage;
                                                                            if (!(toTakeE && toTakeE.store.energy>0)) {
                                                                                ded.run(pc);
                                                                                return
                                                                            }
                                                                        }
                                                                    }
                                                                    if (pc.pos.getRangeTo(toTakeE)>1) {
                                                                        pc.travelTo(toTakeE, {maxRooms: 1});
                                                                    }
                                                                    else {
                                                                        let leaveCap = 1;
                                                                        if (pc.powers && pc.powers[PWR_GENERATE_OPS]) {
                                                                            leaveCap += 3*POWER_INFO[PWR_GENERATE_OPS].level[pc.powers[PWR_GENERATE_OPS].level];
                                                                        }
                                                                        pc.withdraw(toTakeE, 'energy', Math.min(toTakeE.store.energy, pc.store.getFreeCapacity('ops')-leaveCap));
                                                                    }
                                                                }
                                                                else {
                                                                    fillE.run(pc);
                                                                }
                                                                return
                                                            }
                                                            
                                                            if (_.sum(pc.store) < pc.store.getCapacity('ops') * 0.8) {
                                                                let toTakeE = pc.pos.findClosestByRange(FIND_STRUCTURES, {filter:c=>c.structureType==STRUCTURE_CONTAINER && c.pos.findInRange(FIND_SOURCES, 1).length>0 && c.store.energy>Math.min(1000, 1.5*pc.store.getFreeCapacity('energy'))});
                                                                if (undefined==toTakeE) {
                                                                    doge.run(pc);
                                                                    return
                                                                    let restp = roomWonderingPosi(pc.room);
                                                                    if (pc.pos.getRangeTo(restp.x, restp.y)>1) {
                                                                        pc.travelTo(new RoomPosition(restp.x, restp.y, pc.memory.home), {range:2, maxRooms: 1});
                                                                    }
                                                                    toTakeE = pc.room.terminal;
                                                                    if (!(toTakeE && toTakeE.store.energy>0)) {
                                                                        let restp = roomWonderingPosi(pc.room);
                                                                        if (pc.pos.getRangeTo(restp.x, restp.y)>1) {
                                                                            pc.travelTo(new RoomPosition(restp.x, restp.y, pc.room.name), {range:2, maxRooms: 1});
                                                                        }
                                                                    }
                                                                }
                                                                else {
                                                                    if (pc.pos.getRangeTo(toTakeE)>1) {
                                                                        pc.travelTo(toTakeE, {maxRooms: 1});
                                                                    }
                                                                    else {
                                                                        let leaveCap = 0;
                                                                        if (pc.powers && pc.powers[PWR_GENERATE_OPS]) {
                                                                            leaveCap = 3*POWER_INFO[PWR_GENERATE_OPS].level[pc.powers[PWR_GENERATE_OPS].level];
                                                                        }
                                                                        pc.withdraw(toTakeE, 'energy', Math.min(toTakeE.store.energy, pc.store.getFreeCapacity('ops')-leaveCap));
                                                                    }
                                                                }
                                                            }
                                                            else { // full
                                                                let whereToPut = putATypeOfRes(pc.room, 'energy');
                                                                if (pc.pos.getRangeTo(whereToPut)>1) {
                                                                    pc.travelTo(whereToPut, {maxRooms: 1});
                                                                }
                                                                else {
                                                                    for (let res in pc.store) {
                                                                        pc.transfer(whereToPut, res);
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            
            if (true) {
                // ops
                if (pc.room && pc.room.controller && pc.room.controller.my && !pc.room.controller.isPowerEnabled && pc.room.memory.penab) {
                    if (pc.pos.getRangeTo(pc.room.controller)>1) {
                        pc.travelTo(pc.room.controller, {maxRooms: 1});
                    }
                    else {
                        pc.enableRoom(pc.room.controller);
                    }
                }
                else {
                    
                }
            }
}

// init tobattle
// pc.memory.battleQ = {trn: 'W2S30', atkPos: {x: undefined, y: undefined}, restPos: {x: undefined, y: undefined, rn: undefined}};

let pcToBattle = function(pc) {
    try {
        //return false
        if (pc.memory.battleQ) {
            if (false) { // for debugging
                travelToPrioHighwayWithClosestRoomExit(pc, pc.memory.home);
                if (false) { // really fucked up
                    pc.travelTo(new RoomPosition(25, 25, 'W2S28'));
                }
                return true
            }
            
            /*
            if (pc.hits<0.5*pc.hitsMax) {
                travelToPrioHighwayWithClosestRoomExit(pc, pc.memory.home);
                return true
            }
            */
            
            if (pc.room.name==pc.memory.home) {
                if (superSpawn(pc, true)) {
                    return true
                }
            }
            
            let trn = pc.memory.battleQ.trn;
            let tr = Game.rooms[trn];
            
            if (pc.room.name!=trn) {
                generateOps(pc);
            }
            
            // task termination condition: tar safemode or tar no spawn
            if (tr && ((tr.controller && tr.controller.safeMode) || (tr.find(FIND_HOSTILE_STRUCTURES, {filter: h=>h.structureType==STRUCTURE_SPAWN}).length==0))) { // finish task
                pc.memory.battleQ = undefined;
                pc.memory.target = pc.memory.home;
                return true
            }
            
            // pc self renew
            if (pc.room.name==pc.memory.home && pc.ticksToLive<4950) {
                rewnewPc(pc, 4951);
                return true
            }
            else if (pc.ticksToLive<(Game.map.getRoomLinearDistance(trn, pc.memory.home)+1)*50) {
                //if ) { // if in target room
                if (travelToPrioHighwayWithClosestRoomExit(pc, pc.memory.home)) { // pc at home
                    rewnewPc(pc);
                }
                else {
                    if (isHighway(pc.room.name)) {
                        let pbs = pc.room.find(FIND_STRUCTURES, {filter:s=>s.structureType==STRUCTURE_POWER_BANK&&s.pos.findInRange(FIND_CREEPS, 3)==0});
                        if (pbs.length>0) {
                            if (pc.pos.getRangeTo(pbs[0])>1) {
                                pc.travelTo(pbs[0], {maxRooms: 1});
                            }
                            else {
                                pc.renew(pbs[0]);
                            }
                            return true
                        }
                    }
                }
                return true
            }
            
            // load ops
            if (pc.room.name==pc.memory.home) { 
                if (pc.room.memory.mineralThresholds.currentMineralStats.ops>5000) {
                    if (pc.store.ops<0.9*pc.store.getCapacity('ops')) {
                        if (_.sum(pc.store)-pc.store.ops>0) { // have other
                            let whereTo = putATypeOfRes(pc.room, 'ops');
                            if (pc.pos.getRangeTo(whereTo)>1) {
                                pc.travelTo(whereTo);
                            }
                            else {
                                for (let un in pc.store) {
                                    if (un != 'ops') {
                                        pc.transfer(whereTo, un, Math.min(whereTo.store.getFreeCapacity(un), pc.store[un]));
                                        return true
                                    }
                                }
                            }
                        }
                        else {
                            if (pc.store.getFreeCapacity('ops')>0.1*pc.store.getCapacity('ops')) {
                                let whereTo = getATypeOfRes(pc.room, 'ops');
                                if (pc.pos.getRangeTo(whereTo)>1) {
                                    pc.travelTo(whereTo);
                                }
                                else {
                                    pc.withdraw(whereTo, 'ops', Math.min(whereTo.store.ops, Math.max(0, 0.9*pc.store.getCapacity('ops')-_.sum(pc.store))));
                                }
                            }
                            else {
                                // loaded and ready to go
                            }
                        }
                        return true
                    }
                    else {
                        // loaded and ready to go
                    }
                }
                else {
                    fo(pc.name + ' need ops in room '+pc.room.name+' need ops for battle quest');
                    return false
                }
            }
            
            // register battle rest room name
            if (pc.memory.battleQ.restPos.rn==undefined) {
                travelToPrioHighwayWithClosestRoomExit(pc, trn, true);
                if (pc.memory.restRoomInfo['rn']) {
                    pc.memory.battleQ.restPos.rn = pc.memory.restRoomInfo['rn'];
                }
                else {
                    fo(pc.name+' find rest room for battle bugged');
                    return false
                }
            }
            
            let rrn = pc.memory.battleQ.restPos.rn;
            /*
            pc.memory.battleQ.restPos.x=undefined;
            pc.memory.battleQ.atkPos.x=undefined;
            */
            /*
            fo(pc.memory.battleQ.restPos);
            fo(pc.memory.battleQ.atkPos);
            */
            // health check
            if (pc.hits>=0.911*pc.hitsMax) {
                // if pc attack pos not get or pos rn != target
                if (pc.memory.battleQ.atkPos.x == undefined) {
                    if (pc.room.name == trn) {
                        // analys and get attack pos
                        let sp = pc.room.find(FIND_HOSTILE_STRUCTURES, {filter: h=>h.structureType==STRUCTURE_SPAWN})[0];
                        let terrain = Game.rooms[trn].getTerrain();
                        if (pc.pos.x==0) {
                            if (pc.pos.y>24.5) {
                                for (let i=48; i>24.5; i--) {
                                    if (sp.pos.getRangeTo(1,i)<=20) {
                                        let dispos = new RoomPosition(1,i,trn);
                                        if (terrain.get(1,i)!==TERRAIN_MASK_WALL && dispos.findInRange(FIND_HOSTILE_STRUCTURES, 0).length==0 && dispos.findInRange(FIND_STRUCTURES, 0, {filter:s=>s.structureType==STRUCTURE_WALL}).length==0 ) {
                                            pc.memory.battleQ.atkPos.x = 1;
                                            pc.memory.battleQ.atkPos.y = i;
                                            pc.travelTo(new RoomPosition(25, 25, rrn));
                                            return true
                                        }
                                    }
                                }
                                fo(pc.name+' could not find good attack point in room '+trn);
                                return true
                            }
                            else {
                                for (let i=1; i<24.5; i++) {
                                    if (sp.pos.getRangeTo(1,i)<=20) {
                                        let dispos = new RoomPosition(1,i,trn);
                                        if (terrain.get(1,i)!==TERRAIN_MASK_WALL && dispos.findInRange(FIND_HOSTILE_STRUCTURES, 0).length==0 && dispos.findInRange(FIND_STRUCTURES, 0, {filter:s=>s.structureType==STRUCTURE_WALL}).length==0 ) {
                                            pc.memory.battleQ.atkPos.x = 1;
                                            pc.memory.battleQ.atkPos.y = i;
                                            pc.travelTo(new RoomPosition(25, 25, rrn));
                                            return true
                                        }
                                    }
                                }
                                fo(pc.name+' could not find good attack point in room '+trn);
                                return true
                            }
                        }
                        else if (pc.pos.x==49) {
                            if (pc.pos.y>24.5) {
                                for (let i=48; i>24.5; i--) {
                                    if (sp.pos.getRangeTo(48,i)<=20) {
                                        let dispos = new RoomPosition(48,i,trn);
                                        if (terrain.get(48,i)!==TERRAIN_MASK_WALL && dispos.findInRange(FIND_HOSTILE_STRUCTURES, 0).length==0 && dispos.findInRange(FIND_STRUCTURES, 0, {filter:s=>s.structureType==STRUCTURE_WALL}).length==0 ) {
                                            pc.memory.battleQ.atkPos.x = 48;
                                            pc.memory.battleQ.atkPos.y = i;
                                            pc.travelTo(new RoomPosition(25, 25, rrn));
                                            return true
                                        }
                                    }
                                }
                                fo(pc.name+' could not find good attack point in room '+trn);
                                return true
                            }
                            else {
                                for (let i=1; i<24.5; i++) {
                                    if (sp.pos.getRangeTo(48,i)<=20) {
                                        let dispos = new RoomPosition(48,i,trn);
                                        if (terrain.get(48,i)!==TERRAIN_MASK_WALL && dispos.findInRange(FIND_HOSTILE_STRUCTURES, 0).length==0 && dispos.findInRange(FIND_STRUCTURES, 0, {filter:s=>s.structureType==STRUCTURE_WALL}).length==0 ) {
                                            pc.memory.battleQ.atkPos.x = 48;
                                            pc.memory.battleQ.atkPos.y = i;
                                            pc.travelTo(new RoomPosition(25, 25, rrn));
                                            return true
                                        }
                                    }
                                }
                                fo(pc.name+' could not find good attack point in room '+trn);
                                return true
                            }
                        }
                        else if (pc.pos.y==0) {
                            if (pc.pos.x>24.5) {
                                for (let i=48; i>24.5; i--) {
                                    if (sp.pos.getRangeTo(i,1)<=20) {
                                        let dispos = new RoomPosition(i,1,trn);
                                        if (terrain.get(i,1)!==TERRAIN_MASK_WALL && dispos.findInRange(FIND_HOSTILE_STRUCTURES, 0).length==0 && dispos.findInRange(FIND_STRUCTURES, 0, {filter:s=>s.structureType==STRUCTURE_WALL}).length==0 ) {
                                            pc.memory.battleQ.atkPos.x = i;
                                            pc.memory.battleQ.atkPos.y = 1;
                                            pc.travelTo(new RoomPosition(25, 25, rrn));
                                            return true
                                        }
                                    }
                                }
                                fo(pc.name+' could not find good attack point in room '+trn);
                                return true
                            }
                            else {
                                for (let i=1; i<24.5; i++) {
                                    if (sp.pos.getRangeTo(i,1)<=20) {
                                        let dispos = new RoomPosition(i,1,trn);
                                        if (terrain.get(i,1)!==TERRAIN_MASK_WALL && dispos.findInRange(FIND_HOSTILE_STRUCTURES, 0).length==0 && dispos.findInRange(FIND_STRUCTURES, 0, {filter:s=>s.structureType==STRUCTURE_WALL}).length==0 ) {
                                            pc.memory.battleQ.atkPos.x = i;
                                            pc.memory.battleQ.atkPos.y = 1;
                                            pc.travelTo(new RoomPosition(25, 25, rrn));
                                            return true
                                        }
                                    }
                                }
                                fo(pc.name+' could not find good attack point in room '+trn);
                                return true
                            }
                        }
                        else if (pc.pos.y==49) {
                            if (pc.pos.x>24.5) {
                                for (let i=48; i>24.5; i--) {
                                    if (sp.pos.getRangeTo(i,48)<=20) {
                                        let dispos = new RoomPosition(i,48,trn);
                                        if (terrain.get(i,48)!==TERRAIN_MASK_WALL && dispos.findInRange(FIND_HOSTILE_STRUCTURES, 0).length==0 && dispos.findInRange(FIND_STRUCTURES, 0, {filter:s=>s.structureType==STRUCTURE_WALL}).length==0 ) {
                                            pc.memory.battleQ.atkPos.x = i;
                                            pc.memory.battleQ.atkPos.y = 48;
                                            pc.travelTo(new RoomPosition(25, 25, rrn));
                                            return true
                                        }
                                    }
                                }
                                fo(pc.name+' could not find good attack point in room '+trn);
                                return true
                            }
                            else {
                                for (let i=1; i<24.5; i++) {
                                    if (sp.pos.getRangeTo(i,48)<=20) {
                                        let dispos = new RoomPosition(i,48,trn);
                                        if (terrain.get(i,48)!==TERRAIN_MASK_WALL && dispos.findInRange(FIND_HOSTILE_STRUCTURES, 0).length==0 && dispos.findInRange(FIND_STRUCTURES, 0, {filter:s=>s.structureType==STRUCTURE_WALL}).length==0 ) {
                                            pc.memory.battleQ.atkPos.x = i;
                                            pc.memory.battleQ.atkPos.y = 48;
                                            pc.travelTo(new RoomPosition(25, 25, rrn));
                                            return true
                                        }
                                    }
                                }
                                fo(pc.name+' could not find good attack point in room '+trn);
                                return true
                            }
                        }
                    }
                    else { // not in target room
                        if (pc.pos.x==0||pc.pos.y==0||pc.pos.x==49||pc.pos.y==49) { // at tricky positions
                            travelToPrioHighwayWithClosestRoomExit(pc, trn);
                        }
                        else {
                            if (true||pc.pos.findInRange(FIND_MY_CREEPS, 2, {filter:c=>c.getActiveBodyparts(HEAL)>0}).length>0) {
                                travelToPrioHighwayWithClosestRoomExit(pc, trn);
                            }
                            else {
                                // wait for healer
                            }
                        }
                    }
                    return true
                }
                else { // attack pos got
                    if (pc.memory.battleQ.restPos.x) { // if rest pos get
                        if (pc.room.name==trn) {
                            // jam
                            let sp = pc.room.find(FIND_HOSTILE_STRUCTURES, {filter: h=>h.structureType==STRUCTURE_SPAWN})[0];
                            pc.usePower(PWR_DISRUPT_SPAWN, sp);
                            
                            if (pc.store.getFreeCapacity('ops')>100) {
                                let drops = pc.pos.findInRange(FIND_DROPPED_RESOURCES, 1, {filter: d=>d.resourceType=='ops'});
                                if (drops.length>0) {
                                    pc.pickup(drops[0]);
                                }
                                else {
                                    let tombs = pc.pos.findInRange(FIND_TOMBSTONES, 1, {filter: t=>t.store.ops>0});
                                    if (tombs.length>0) {
                                        for (let tp in tombs[0].store) {
                                            if (tp=='energy') {
                                                pc.withdraw(tombs[0], tp);
                                            }
                                        }
                                    }
                                    else {
                                        
                                    }
                                }
                            }
                            
                            // go to rest pos
                            pc.travelTo(new RoomPosition(pc.memory.battleQ.restPos.x, pc.memory.battleQ.restPos.y, rrn));
                            if (Game.rooms[rrn]) { // move any blockers
                                let blockers = new RoomPosition(pc.memory.battleQ.restPos.x, pc.memory.battleQ.restPos.y, rrn).findInRange(FIND_MY_CREEPS, 0);
                                if (blockers.length>0) {
                                    blockers[0].travelTo(new RoomPosition(25, 25, rrn));
                                }
                            }
                        }
                        else if (pc.room.name==rrn) { // in rest room
                            if (Game.time%5==0 && pc.hits>=0.911*pc.hitsMax && pc.store.ops>10) {
                                // go to tar pos
                                pc.travelTo(new RoomPosition(pc.memory.battleQ.atkPos.x, pc.memory.battleQ.atkPos.y, trn));
                            }
                            else {
                                pc.travelTo(new RoomPosition(pc.memory.battleQ.restPos.x, pc.memory.battleQ.restPos.y, rrn), {maxRooms: 1});
                                // withdraw ops from near
                                let suppliers = pc.room.find(FIND_MY_CREEPS, {filter:c=>c.store.ops>0});
                                if (suppliers.length>0 && pc.store.getFreeCapacity('ops')>50) {
                                    suppliers[0].travelTo(pc, {maxRooms: 1, range: 1});
                                    pc.withdraw(suppliers[0], 'ops');
                                    suppliers[0].transfer(pc, 'ops');
                                }
                                else {
                                    let drops = pc.pos.findInRange(FIND_DROPPED_RESOURCES, 1, {filter: d=>d.resourceType=='ops'});
                                    if (drops.length>0) {
                                        pc.pickup(drops[0]);
                                    }
                                    else {
                                        let tombs = pc.pos.findInRange(FIND_TOMBSTONES, 1, {filter: t=>t.store.ops>0});
                                        if (tombs.length>0) {
                                            for (let tp in tombs[0].store) {
                                                if (tp=='energy') {
                                                    pc.withdraw(tombs[0], tp);
                                                }
                                            }
                                        }
                                    }
                                }
                                // wait for heal or ops transfer
                            }
                        }
                        else {
                            pc.travelTo(new RoomPosition(25, 25, rrn));
                        }
                    }
                    else { // get res pos
                        // infer rest pos from attack pos and rest rn
                        let ax = pc.memory.battleQ.atkPos.x;
                        let ay = pc.memory.battleQ.atkPos.y;
                        let exitToRest = Game.map.findExit(trn, rrn);
                        if (exitToRest == FIND_EXIT_TOP) {
                            pc.memory.battleQ.restPos.x = ax;
                            pc.memory.battleQ.restPos.y = 49-ay;
                        }
                        else if (exitToRest == FIND_EXIT_BOTTOM) {
                            pc.memory.battleQ.restPos.x = ax;
                            pc.memory.battleQ.restPos.y = 49-ay;
                        }
                        else if (exitToRest == FIND_EXIT_LEFT) {
                            pc.memory.battleQ.restPos.x = 49-ax;
                            pc.memory.battleQ.restPos.y = ay;
                        }
                        else { // RIGHT
                            pc.memory.battleQ.restPos.x = 49-ax;
                            pc.memory.battleQ.restPos.y = ay;
                        }
                        // go to rest pos
                        pc.travelTo(new RoomPosition(pc.memory.battleQ.restPos.x, pc.memory.battleQ.restPos.y, rrn));
                        if (Game.room[rrn]) { // move any blockers
                            let blockers = new RoomPosition(pc.memory.battleQ.restPos.x, pc.memory.battleQ.restPos.y, rrn).findInRange(FIND_MY_CREEPS, 0);
                            if (blockers.length>0) {
                                blockers[0].travelTo(new RoomPosition(25, 25, rrn));
                            }
                        }
                    }
                    return true
                }
            }
            else { // injured, get safe
                if (pc.memory.battleQ.restPos.x) {
                    pc.travelTo(new RoomPosition(pc.memory.battleQ.restPos.x, pc.memory.battleQ.restPos.y, rrn));
                    if (Game.room[rrn]) { // move any blockers
                        let blockers = new RoomPosition(pc.memory.battleQ.restPos.x, pc.memory.battleQ.restPos.y, rrn).findInRange(FIND_MY_CREEPS, 0);
                        if (blockers.length>0) {
                            blockers[0].travelTo(new RoomPosition(25, 25, rrn));
                        }
                    }
                }
                else {
                   pc.travelTo(new RoomPosition(25, 25, rrn));
                }
                return true
            }
            return true
        }
        else {
            return false
        }
    }
    catch (e) {
        fo('pc battle code bug');
        fo(e.stack);
        pc.travelTo(new RoomPosition(25, 25, pc.memory.home), {range:23});
        return false
    }
    return false
}

let pcDoOffHomeWork = function (pc) {
    // if return true, does logic here, if false, do things at home (including renew)
    if (pc.room.name == pc.memory.home && pc.ticksToLive<4500) {
        return false
    }
    return false
}

let watch = function (pc) {
    // if creep has ob power
    //if (pc.powers[PWR_OPERATE_OBSERVER] && pc.powers[PWR_GENERATE_OPS].level>=3) {
    // if creep has watch mem
        // if watch room has vision
            // return false
        // else
            // if creep has use ob power
                // watch room
            // else 
                // if creep has enough
    return false
}

let rewnewPc = function (pc, thresh=2500) {
    if (pc.room.name != pc.memory.home) {
        travelToTarget(pc, pc.memory.home);
        return
    }
    if (pc.room.memory.powerSpawnId && Game.getObjectById(pc.room.memory.powerSpawnId)) {
        let ps = Game.getObjectById(pc.room.memory.powerSpawnId);
        if (pc.ticksToLive<thresh) {
            if (pc.pos.getRangeTo(ps)>1) {
                pc.travelTo(ps, {maxRooms:1});
            }
            else {
                pc.renew(ps)
            }
            return true
        }
        else {
            return false
        }
    }
    else {
        fo('danger! PC dying! ' + pc.pos);
    }
}

let goldenTerminal = function(pc) {
    if (false && pc.powers[PWR_OPERATE_TERMINAL]) { // flag to switch on terminal golden
        if (pc.store['ops']<100) {
            let whereTo = getATypeOfRes(pc.room, 'ops');
            if (pc.pos.getRangeTo(whereTo)>1) {
                pc.travelTo(whereTo);
            }
            else {
                pc.withdraw(whereTo, 'ops', 100);
            }
        }
        else {
            if (pc.pos.getRangeTo(pc.room.terminal)>3) {
                pc.travelTo(pc.room.terminal);
            }
            else {
                if (pc.powers[PWR_OPERATE_TERMINAL].cooldown==0) {
                    pc.usePower(PWR_OPERATE_TERMINAL, pc.room.terminal);
                }
            }
        }
    }
}

let superSpawn = function(pc, enforce=false) {
    if ((pc.room.memory.frenzyMode||enforce) && pc.powers[PWR_OPERATE_SPAWN] && pc.powers[PWR_GENERATE_OPS].level>=2) {
        if (pc.room.find(FIND_MY_POWER_CREEPS, {filter: p=>p.name!=pc.name&&p.powers[PWR_OPERATE_SPAWN]&&p.powers[PWR_OPERATE_SPAWN].level>pc.powers[PWR_OPERATE_SPAWN].level}).length>0) {
            return false // someone is higher than me
        }
        if (pc.room.memory.mineralThresholds.currentMineralStats.energy>100000) { // flag to switch on super spawn
                let sps = pc.room.find(FIND_MY_STRUCTURES, {filter: s=>s.structureType==STRUCTURE_SPAWN && (s.effects==undefined || s.effects.length==0 || (pc.pos.getRangeTo(s)-3>s.effects[0].ticksRemaining) )});
                if (sps.length>0) {
                    if (pc.pos.getRangeTo(sps[0])>3) {
                        pc.travelTo(sps[0]);
                    }
                    else {
                        if (pc.store['ops']<100) {
                            let whereTo = putATypeOfRes(pc.room, 'ops');
                            if (whereTo==undefined) { // not enough ops
                                return false
                            }
                            if (pc.store.getFreeCapacity('ops')<100) {
                                if (pc.pos.getRangeTo(whereTo)>1) {
                                    pc.travelTo(whereTo);
                                }
                                else {
                                    for (un in pc.store) {
                                        if (un != 'ops') {
                                            pc.transfer(whereTo, un, Math.min(101, pc.store[un]));
                                        }
                                    }
                                }
                            }
                            else {
                                if (pc.pos.getRangeTo(whereTo)>1) {
                                    pc.travelTo(whereTo);
                                }
                                else {
                                    pc.withdraw(whereTo, 'ops', 100);
                                }
                            }
                        }
                        else {if (sps[0].spawning==null || sps[0].spawning.remainingTime<=2) {
                                pc.usePower(PWR_OPERATE_SPAWN, sps[0]);
                            }
                            doge.run(pc);
                        }
                    }
                    return true
                }
                else { // all sps boosted
                    return false
                }
        }
        else { // e not enough
            return false
        }
    }
    else { // no frenzy mode
        return false
    }
}

let superPower = function(pc) {
    return false
    if (pc.room.memory.battleMode) {
        return false
    }
    let space = 0;
    if (pc.room.storage) {
        space += pc.room.storage.store.getFreeCapacity('ops');
    }
    if (pc.room.terminal) {
        space += pc.room.terminal.store.getFreeCapacity('ops');
    }
    if (space>150000) {
        //return false
    }
    if (pc.powers[PWR_OPERATE_POWER] && pc.powers[PWR_OPERATE_POWER].cooldown <= 15) { // pc ready to super power
        let psid = pc.room.memory.powerSpawnId;
        if (psid && pc.room.memory.mineralThresholds.currentMineralStats.ops+pc.store.ops>10000 && pc.room.memory.mineralThresholds.currentMineralStats.energy>240000 && pc.room.memory.mineralThresholds.currentMineralStats.power>15000) {
            let ps = Game.getObjectById(psid);
            if ( ps && (ps.effects==undefined || ps.effects.length==0 || ps.effects[0].ticksRemaining<=10)) { // ps is ready
                if (pc.pos.getRangeTo(ps)>3) {
                    pc.travelTo(ps);
                }
                else {
                    if (pc.store['ops']<200) {
                        if (pc.store.getFreeCapacity('ops')<200) {
                            let whereTo = putATypeOfRes(pc.room, 'ops');
                            if (pc.pos.getRangeTo(whereTo)>1) {
                                pc.travelTo(whereTo);
                            }
                            else {
                                for (un in pc.store) {
                                    if (un != 'ops') {
                                        pc.transfer(whereTo, un, Math.min(201, pc.store[un]));
                                    }
                                }
                            }
                        }
                        else {
                            let whereTo = getATypeOfRes(pc.room, 'ops');
                            if (pc.pos.getRangeTo(whereTo)>1) {
                                pc.travelTo(whereTo);
                            }
                            else {
                                pc.withdraw(whereTo, 'ops', 200);
                            }
                        }
                    }
                    else {
                        pc.usePower(PWR_OPERATE_POWER, ps);
                        doge.run(pc);
                    }
                }
                return true
            }
            else { // ps already boosted
                return false
            }
        }
        else { // no ps or no res
            return false
        }
    }
    else { // no super power or in cool down
        return false
    }
}

let roomFrenzyManager = function(mroomn) {
    let ongoingPs = 0;
    let sn = Game.shard.name;
    if (Memory.storedSymbols && Memory.storedSymbols[sn]) {
        for (let pId in Memory.storedSymbols[sn]) {
            let pobj = Memory.storedSymbols[sn][pId];
            if (pobj && pobj.mrn == mroomn && pobj.noPath==false && pobj.pairsSent) {
                ongoingPs++;
            }
        }
    }
    let pwno = 0;
    let sptime = 0;
    let wallno = 0;
    let ifExpanding = false;
    let spq = [];
    let battleFlag = false;
    let viplist = ['attacker', 'gays', 'sacrificer', 'quads', 'stomper', 'edger', 'redneck'];
    if (Game.rooms[mroomn] && Game.rooms[mroomn].memory) {
        spq = Game.rooms[mroomn].memory.forSpawning.spawningQueue;
        if (spq.length>0) {
            for (let cp of spq) {
                if (cp.memory.spawnTime) {
                    sptime += cp.memory.spawnTime;
                }
                if (cp.memory.role == 'powerSourceLorry' || cp.memory.role == 'powerSourceAttacker' || cp.memory.role == 'powerSourceRanger') {
                    pwno++;
                }
                if (['sacrificer', 'wallRepairer', 'redneck', 'deliveroo', 'dismantler', 'kiter'].includes(cp.memory.role)) {
                    wallno++;
                }
                if (cp.memory.role == 'pioneer') {
                    ifExpanding = true;
                }
                if (viplist.includes(cp.memory.role)) {
                    battleFlag = true;
                }
            }
        }
    }
    if (ongoingPs>2 || wallno>1 || pwno>4 || sptime>255 || (ifExpanding && spq.length>2) || battleFlag || spq.length>13) {
        Game.rooms[mroomn].memory.frenzyMode = true;
        return true
    }
    else {
        Game.rooms[mroomn].memory.frenzyMode = false;
        return false
    }
}

let goldenFac = function(pc) {
    let r = pc.room;
    if (r.memory.flvl && pc.powers[PWR_OPERATE_FACTORY] && pc.powers[PWR_OPERATE_FACTORY].level == r.memory.flvl) {
        if (r.memory.fobj) {
            let f = pc.room.find(FIND_MY_STRUCTURES, {filter: t=>t.structureType==STRUCTURE_FACTORY});
            if (f.cooldown>0) { // still has cool down, dont hurry
                return false
            }
            if (f.length>0) {
                if (f[0].level!=r.memory.flvl) { // if fac not firstly golden, go golden
                    if (pc.store['ops']<100) {
                        let whereTo = getATypeOfRes(pc.room, 'ops');
                        if (pc.pos.getRangeTo(whereTo)>1) {
                            pc.travelTo(whereTo);
                        }
                        else {
                            pc.withdraw(whereTo, 'ops', 100);
                        }
                    }
                    else {
                        if (pc.pos.getRangeTo(f[0])>3) {
                            pc.travelTo(f[0]);
                        }
                        else {
                            pc.usePower(PWR_OPERATE_FACTORY, f[0]);
                        }
                    }
                    return true
                }
                else { // factory set level, check for production then produce
                    if (r.memory.fobj.lvl && r.memory.fobj.lvl==pc.powers[PWR_OPERATE_FACTORY].level && (f[0].effects.length==0)) {
                        if (pc.powers[PWR_OPERATE_FACTORY].cooldown==0) {
                            // if there is fac level planning, pc has the power and room has a level commodity quest, and fac on cool down
                            if (pc.store['ops']<100) {
                                let whereTo = getATypeOfRes(pc.room, 'ops');
                                if (pc.pos.getRangeTo(whereTo)>1) {
                                    pc.travelTo(whereTo);
                                }
                                else {
                                    pc.withdraw(whereTo, 'ops', 100);
                                }
                            }
                            else {
                                if (pc.pos.getRangeTo(f[0])>3) {
                                    pc.travelTo(f[0]);
                                }
                                else {
                                    pc.usePower(PWR_OPERATE_FACTORY, f[0]);
                                }
                            }
                            return true
                        }
                        else { // pc no cooldown
                            return false
                        }
                    }
                    else { // room no commodity quest or fac is still on effect
                        return false
                    }
                }
            }
            else { // room not fac
                return false
            }
        }
        else { // room no flevel or pc no fac power or no match
            return false
        }
    }
}

let regenE = function(pc) {
    if (pc.room.memory.battleMode) {
        return false
    }
    if (pc.powers[PWR_REGEN_SOURCE] && pc.powers[PWR_REGEN_SOURCE].cooldown<30) {
        let ereses = pc.room.find(FIND_SOURCES);
        for (let eres of ereses) {
            let r = pc.pos.getRangeTo(eres);
            if (eres.effects==undefined || eres.effects.length==0) {
                if (r>3) {
                    pc.travelTo(eres, {range: 3});
                }
                else {
                    if (pc.powers[PWR_REGEN_SOURCE].cooldown==0) {
                        if (pc.usePower(PWR_REGEN_SOURCE, eres)==OK) {
                            if (pc.memory.quests && pc.memory.quests.length>0) {
                                for (let quest of quests) {
                                    if (quest.type == PWR_REGEN_SOURCE && quest.target == pc.room.name) {
                                        quest.timer = Game.time+300;
                                    }
                                }
                            }
                        }
                    }
                    else {
                        doge.run(pc);
                    }
                }
                return true
            }
            else if (eres.effects) {
                if (r-3>eres.effects[0].ticksRemaining) {
                    if (r>3) {
                        pc.travelTo(eres, {range: 3});
                        return true
                    }
                }
                else {
                    continue;
                }
                return true
            }
            else {
                fo('pc e regen bug');
            }
        }
    }
    return false
}

let regenM = function(pc) {
    if (pc.room.memory.battleMode) {
        return false
    }
    if (pc.room.controller && pc.room.controller.level>5) {
        let mineral = pc.room.find(FIND_MINERALS)[0];
        if (mineral && mineral.ticksToRegeneration==undefined) {
            if (pc.powers[PWR_REGEN_MINERAL] && pc.powers[PWR_REGEN_MINERAL].cooldown<20) {
                let r = pc.pos.getRangeTo(mineral);
                if (mineral.effects==undefined || mineral.effects.length==0) {
                    if (r>3) {
                        pc.travelTo(mineral, {range: 3, maxRooms: 1});
                    }
                    else {
                        if (pc.powers[PWR_REGEN_MINERAL].cooldown==0) {
                            pc.usePower(PWR_REGEN_MINERAL, mineral)
                        }
                        else {
                            doge.run(pc);
                        }
                    }
                    return true
                }
                else if (mineral.effects) {
                    if (r-3>mineral.effects[0].ticksRemaining) {
                        if (r>3) {
                            pc.travelTo(mineral, {range: 3, maxRooms: 1});
                            return true
                        }
                    }
                    return true
                }
            }
        }
    }
    return false
}

let generateOps = function (pc) {
    if (pc.powers[PWR_GENERATE_OPS] && pc.store.getFreeCapacity('ops')>0 && pc.powers[PWR_GENERATE_OPS].cooldown==0) {
        pc.usePower(PWR_GENERATE_OPS);
    }
}

global.pcAssignMission = function (pcn, tar, todo) {
    let pc = Game.powerCreeps[pcn]
    if (pc.memory.missions) {
        if (pc.memory.missions.target) {
            if (pc.memory.missions.target == tar) {
                if (pc.memory.missions.todos.includes(todo)) { // if already on it
                    // pass
                }
                else { // add new todo
                    pc.memory.missions.todos.push(todo);
                }
            }
            else { // mission tar different, refresh
                pc.memory.missions['target'] = tar;
                pc.memory.missions['todos'] = [todo];
            }
        }
        else { // no mission target, start
            pc.memory.missions['target'] = tar;
            pc.memory.missions['todos'] = [todo];
        }
    }
    else { // no mission object, start
        pc.memory.missions = {};
        pc.memory.missions['target'] = tar;
        pc.memory.missions['todos'] = [todo];
    }
}