let pic = require('action.ontheway');
let pickuper = require('role.pickuper');
let immer = false;
let goe = require('action.idle');

/*
send 3 big pioneer
Game.rooms['E11S47'].memory.forSpawning.spawningQueue.push({ memory: { energy: 3700, role: 'pioneer', target: 'E1S41' , home: 'E11S47', superUpgrader: false, route:  undefined }, priority: 102 });
            
keep sending qiang sac
sendSacrificer('E11S47', 'E1S41', 'qiang');

send 3 strangers
Game.rooms['E11S47'].memory.forSpawning.spawningQueue.push({ memory: { energy: 2200, role: 'pioneer', target: 'E1S41' , home: 'E11S47', superUpgrader: 'strange',route:  undefined }, priority: 102 });

when pionner arrive, pop safe mode
build spawn
build container
assign stranger
spawn carry stranger
work normally
*/

module.exports = {
    run: function (creep) {
        let ectn = Game.getObjectById('60a6c494485c824985df5940');
        let spid = Game.getObjectById('60a6c33f7177ce8c2c91a791');
        let term = Game.getObjectById('60a7861b63bf462117a784c2');
        
        if (false && creep.getActiveBodyparts(WORK)==0) {
            if (creep.store.energy==0) {
                if (pic.run(creep)) {
                    // pick
                }
                else {
                    if (ectn && ectn.store.energy>0) {
                        creep.withdraw(ectn, 'energy');
                    }
                }
            }
            else {
                creep.transfer(spid, 'energy');
            }
        }
        else if (creep.getActiveBodyparts(ATTACK)>0) {
            if (immer) {
                creep.moveTo(13, 9);
                return
            }
            creep.memory.enforce = true;
            if (creep.ticksToLive<66) {
                creep.memory.renew = true;
            }
            else if (creep.ticksToLive>1300) {
                creep.memory.renew = false;
            }
            if (creep.memory.renew) {
                creep.travelTo(new RoomPosition(16, 13, 'E1S41'));
            }
            else {
                if (creep.pos.findInRange(FIND_MY_STRUCTURES, 1, {filter: t=>t.structureType==STRUCTURE_RAMPART}).length==0) {
                    creep.travelTo(new RoomPosition(13, 10, 'E1S41'));
                }
                else {
                    let closest = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                    if (closest) {
                        let rmpt = closest.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter: t=>t.structureType==STRUCTURE_RAMPART && (creep.room.lookForAt(LOOK_CREEPS, t.pos).length==0 || creep.room.lookForAt(LOOK_CREEPS, t.pos)[0].name==creep.name)});
                        if (rmpt && closest.pos.getRangeTo(rmpt)<2) {
                            let ret = findPathInRoomSafeZone(creep.pos, rmpt.pos);
                            creep.moveByPath(ret.path);
                            if (creep.pos.getRangeTo(closest)<=1) {
                                creep.attack(closest);
                            }
                        }
                        else {
                            creep.travelTo(new RoomPosition(13, 9, 'E1S41'));
                        }
                    }
                    else {
                        creep.travelTo(new RoomPosition(13, 9, 'E1S41'));
                    }
                    
                }
            }
        }
        else if (creep.getActiveBodyparts(RANGED_ATTACK)>0) {
            if (immer) {
                creep.moveTo(13, 10);
                return
            }
            creep.memory.enforce = true;
            if (creep.ticksToLive<66) {
                creep.memory.renew = true;
            }
            else if (creep.ticksToLive>1300) {
                creep.memory.renew = false;
            }
            if (creep.memory.renew) {
                creep.travelTo(new RoomPosition(16, 13, 'E1S41'));
            }
            else {
                if (creep.pos.findInRange(FIND_MY_STRUCTURES, 1, {filter: t=>t.structureType==STRUCTURE_RAMPART}).length==0) {
                    creep.travelTo(new RoomPosition(13, 10, 'E1S41'));
                }
                else {
                    let closest = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                    if (closest) {
                        let rmpt = closest.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter: t=>t.structureType==STRUCTURE_RAMPART && (creep.room.lookForAt(LOOK_CREEPS, t.pos).length==0 || creep.room.lookForAt(LOOK_CREEPS, t.pos)[0].name==creep.name)});
                        if (rmpt && closest.pos.getRangeTo(rmpt)<4) {
                            let ret = findPathInRoomSafeZone(creep.pos, rmpt.pos);
                            creep.moveByPath(ret.path);
                            if (creep.pos.getRangeTo(closest)<=3) {
                                creep.rangedMassAttack();
                            }
                        }
                        else {
                            creep.travelTo(new RoomPosition(13, 10, 'E1S41'));
                        }
                    }
                    else {
                        creep.travelTo(new RoomPosition(13, 10, 'E1S41'));
                    }
                }
            }
        }
        else if (creep.memory.in) {
            if (creep.memory.spe) {
                let load = 'XKHO2';
                let lab = Game.getObjectById('60a79113db59ab4c5de1edb1');
                if (creep.ticksToLive<49) {
                    creep.moveTo(16,13);
                }
                else if (creep.ticksToLive<1300) {
                    if (checkIfCreepIsBoosted(creep) && creep.memory.torep!='up') {
                        creep.moveTo(15,12);
                    }
                    else {// wait for renew
                        creep.moveTo(16,13);
                    }
                }
                else {
                    if (creep.memory.torep == 'up') {
                        if (creep.pos.findInRange(FIND_MY_CREEPS, 1, {filter: c=> c.name!=creep.name && c.memory.re}).length==0) {
                            creep.moveTo(16, 13);
                        }
                        else {
                            creep.moveTo(15,12);
                        }
                    }
                    else {
                        creep.moveTo(15,12);
                        if (lab && creep.ticksToLive>1300 && !checkIfCreepIsBoosted(creep)) {
                            lab.boostCreep(creep);
                        }
                    }
                }
                // fill lab
                if (lab && lab.store['LH']<1500) {
                    if (creep.store['energy']>0) {
                        creep.transfer(term, 'energy');
                    }
                    else if (creep.store['LH']) {
                        creep.transfer(lab, 'LH');
                    }
                    else {
                        creep.withdraw(term, 'LH');
                    }
                    creep.moveTo(15,12);
                }
                // fill tower
                else if (false && Game.getObjectById('60a791580e6ba446149e65a6').store.energy<800) {
                    if (creep.store['energy']) {
                        creep.transfer(Game.getObjectById('60a791580e6ba446149e65a6'), 'energy');
                    }
                    else {
                        creep.withdraw(term, 'energy');
                    }
                    creep.moveTo(15,12);
                }
                else if (lab && lab.store['energy']<2000) {
                    if (creep.store['LH']>0) {
                        creep.transfer(term, 'LH');
                    }
                    else if (creep.store['energy']) {
                        creep.transfer(lab, 'energy');
                    }
                    else {
                        creep.withdraw(term, 'energy');
                    }
                }
                // repair
                else {
                    if (creep.store['LH']>0) {
                        creep.transfer(term, 'LH');
                    }
                    else if (creep.getActiveBodyparts(WORK)>0) {
                        if (creep.store.energy<creep.getActiveBodyparts(WORK)*5) {
                            creep.withdraw(term, 'energy');
                        }
                        let css = creep.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 3);
                        if (css.length>0) {
                            creep.build(css[0]);
                        }
                        else {
                            if (creep.getActiveBodyparts(WORK) == 0 || creep.memory.torep == undefined || Game.time%100==0) {
                                css = creep.pos.findInRange(FIND_STRUCTURES, 3, {filter: c=>(c.structureType==STRUCTURE_RAMPART||c.structureType==STRUCTURE_WALL) && c.id!='60a791628f21719b1c5d75e5'});
                                let torep = undefined;
                                for (let cs of css) {
                                    if (cs.pos.getRangeTo(creep)==3 && cs.hits<4000000) {
                                        torep = cs;
                                        break;
                                    }
                                }
                                if (torep==undefined) {
                                    for (let cs of css) {
                                        if (cs.pos.getRangeTo(creep)==2 && cs.hits<2000000) {
                                            torep = cs;
                                            break;
                                        }
                                    }
                                }
                                if (torep==undefined) {
                                    for (let cs of css) {
                                        if (cs.pos.getRangeTo(creep)==1 && cs.hits<1000000) {
                                            torep = cs;
                                            break;
                                        }
                                    }
                                }
                                if (torep==undefined) {
                                    for (let cs of css) {
                                        if (cs.pos.getRangeTo(creep)==3 && cs.hits<5000000) {
                                            torep = cs;
                                            break;
                                        }
                                    }
                                }
                                if (torep==undefined) {
                                    for (let cs of css) {
                                        if (cs.pos.getRangeTo(creep)==3 && cs.hits<6000000) {
                                            torep = cs;
                                            break;
                                        }
                                    }
                                }
                                if (torep==undefined) {
                                    for (let cs of css) {
                                        if (cs.pos.getRangeTo(creep)==3 && cs.hits<7000000) {
                                            torep = cs;
                                            break;
                                        }
                                    }
                                }
                                if (torep==undefined) {
                                    for (let cs of css) {
                                        if (cs.pos.getRangeTo(creep)==3 && cs.hits<8000000) {
                                            torep = cs;
                                            break;
                                        }
                                    }
                                }
                                if (torep==undefined) {
                                    for (let cs of css) {
                                        if (cs.pos.getRangeTo(creep)==3 && cs.hits<10000000) {
                                            torep = cs;
                                            break;
                                        }
                                    }
                                }
                                if (torep) {
                                    creep.memory.torep = torep.id;
                                }
                                else {
                                    creep.memory.torep = 'up';
                                }
                            }
                            else {
                                if (creep.memory.torep && creep.memory.torep == 'up') {
                                    let ctrl = creep.room.controller;
                                    if (creep.room.terminal.store.energy>10000) {
                                        creep.upgradeController(ctrl)
                                    }
                                }
                                else {
                                    creep.repair(Game.getObjectById(creep.memory.torep));
                                }
                            }
                        }
                    }
                }
            }
            else if (creep.memory.deliveroo) {
                if (creep.ticksToLive<45) {
                    creep.memory.re = true;
                }
                else if (creep.ticksToLive>1300) {
                    creep.memory.re = false;
                }
                if (creep.memory.re) {
                    creep.travelTo(new RoomPosition(16,13, creep.room.name), {maxRooms: 1});
                }
                else {
                    let takefrom = creep.room.terminal;
                    if (takefrom && takefrom.store.energy>0) {
                        // pass
                    }
                    else {
                        takefrom = creep.room.storage;
                    }
                    
                    let putto = creep.room.find(FIND_MY_STRUCTURES, {filter: c=>c.structureType==STRUCTURE_TOWER&&c.store.getFreeCapacity('energy')>400});
                    if (putto.length>0) {
                        // pass
                        putto = putto[0];
                    }
                    else {
                        putto = creep.room.storage;
                        if (putto) {
                            // pass
                        }
                        else {
                            let workers = creep.room.find(FIND_MY_CREEPS, {filter: c=>c.memory.aio&&!c.memory.re});
                            if (workers.length>0) {
                                putto = workers[0];
                            }
                            else {
                                goe.run(creep);
                                return
                            }
                        }
                    }
                    if (creep.store.energy==0) {
                        if (creep.pos.getRangeTo(takefrom)>1) {
                            creep.travelTo(takefrom);
                        }
                        else {
                            creep.withdraw(takefrom, 'energy');
                        }
                    }
                    else { 
                        if (creep.pos.getRangeTo(putto)>1) {
                            creep.travelTo(putto);
                        }
                        else {
                            creep.transfer(putto, 'energy');
                        }
                    }
                }
            }
            else if (creep.memory.aio) {
                if (creep.ticksToLive<45) {
                    creep.memory.re = true;
                }
                else if (creep.ticksToLive>1300) {
                    creep.memory.re = false;
                }
                let lab = Game.getObjectById('60a79113db59ab4c5de1edb1');
                if (lab && creep.ticksToLive>1300 && !checkIfCreepIsBoosted(creep)) {
                    creep.travelTo(new RoomPosition(15,12, creep.room.name), {maxRooms: 1});
                    lab.boostCreep(creep);
                    return
                }
                // renew first
                let term = getATypeOfRes(creep.room, 'energy');
                if (creep.memory.re) {
                    creep.withdraw(term, 'energy');
                    creep.upgradeController(creep.room.controller);
                    creep.travelTo(new RoomPosition(16,13, creep.room.name), {maxRooms: 1});
                }
                else {
                    if (creep.store.energy == 0) {
                        let spare = Game.getObjectById('60ad253329f0d53fd0aa28d5');
                        if (false && spare && spare.store.energy>50 && creep.pos.getRangeTo(spare)<8) {
                            if (creep.pos.getRangeTo(spare)>1) {
                                creep.travelTo(spare);
                            }
                            else {
                                creep.withdraw(spare, 'energy');
                            }
                            return
                        }
                        if (creep.pos.getRangeTo(term)>1) {
                            creep.travelTo(term);
                        }
                        else {
                            creep.withdraw(term, 'energy');
                        }
                    }
                    else {
                        // repart endangered rampart first
                        let toreps = creep.room.find(FIND_MY_STRUCTURES, {filter: c=>c.structureType==STRUCTURE_RAMPART && c.hits<50000});
                        if (toreps.length>0) {
                            if (creep.pos.getRangeTo(toreps[0])>3) {
                                creep.travelTo(toreps[0]);
                            }
                            else {
                                creep.repair(toreps[0]);
                            }
                        }
                        // finish construction site
                        else {
                            toreps = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
                            if (toreps.length>0) {
                                if (creep.pos.getRangeTo(toreps[0])>3) {
                                    creep.travelTo(toreps[0]);
                                }
                                else {
                                    creep.build(toreps[0]);
                                }
                            }
                            // repart all wall/rampart to 500k
                            else {
                                toreps = creep.room.find(FIND_STRUCTURES, {filter: c=>(c.structureType==STRUCTURE_RAMPART || c.structureType==STRUCTURE_WALL) && c.hits<150000});
                                if (toreps.length>0) {
                                    if (creep.pos.getRangeTo(toreps[0])>3) {
                                        creep.travelTo(toreps[0]);
                                    }
                                    else {
                                        creep.repair(toreps[0]);
                                    }
                                }
                                // repair more 1M
                                else {
                                    toreps = creep.room.find(FIND_STRUCTURES, {filter: c=>(c.structureType==STRUCTURE_RAMPART || c.structureType==STRUCTURE_WALL) && c.hits<1000000});
                                    if (toreps.length>0) {
                                        if (creep.pos.getRangeTo(toreps[0])>3) {
                                            creep.travelTo(toreps[0]);
                                        }
                                        else {
                                            creep.repair(toreps[0]);
                                        }
                                    }
                                    // repair more
                                    else {
                                        fo('stranger need more work to do');
                                    }
                                }
                            }
                        }
                    }
                }
            }
            else {
                let ctrl = creep.room.controller; 
                let ifwork = creep.getActiveBodyparts(WORK)>0;
                if (creep.pos.x == 16) {
                    if (creep.store.energy<100 && pic.run(creep)) {
                        // pick
                    }
                    else if (creep.store.energy<100 && term) {
                        creep.withdraw(term, 'energy');
                        if (ifwork) {
                            if (creep.room.terminal.store.energy>10000) {
                                creep.upgradeController(ctrl)
                            }
                        }
                    }
                    else if (spid && spid.store.energy<100) {
                        if (ifwork) {
                            creep.transfer(spid, 'energy', Math.max(creep.store.energy-creep.getActiveBodyparts(WORK), spid.store.getFreeCapacity('energy')));
                        }
                        else {
                            creep.transfer(spid, 'energy');
                        }
                    }
                    else if (ectn && ectn.store.energy<1000) {
                        if (ifwork) {
                            creep.transfer(ectn, 'energy', Math.max(creep.store.energy-creep.getActiveBodyparts(WORK), 0));
                        }
                        else {
                            creep.transfer(ectn, 'energy');
                        }
                    }
                    else {
                        if (ifwork) {
                            let css = creep.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 3);
                            if (css.length>0) {
                                creep.build(css[0]);
                            }
                            else {
                                if (creep.room.terminal.store.energy>10000) {
                                    creep.upgradeController(ctrl)
                                }
                            }
                        }
                        if (ectn && ectn.store.energy>1500) {
                            creep.transfer(term, 'energy');
                        }
                    }
                }
                else if (creep.pos.x == 17) {
                    let ss = Game.getObjectById('5bbcad019099fc012e63674b');
                    if (ss.energy>0) {
                        creep.harvest(ss);
                    }
                    else if (pic.run(creep)) {
                        // pass
                    }
                    else if (ectn && ectn.store.energy>0) {
                        creep.withdraw(ectn, 'energy');
                    }
                    
                    if (creep.store.energy>0) {
                        if (spid && spid.store.energy<100) {
                            creep.transfer(spid, 'energy');
                            return
                        }
                        if (creep.ticksToLive<350) {
                            return
                        }
                        else if (ectn && ectn.hits<200000) {
                            creep.repair(ectn);
                        }
                        else {
                            let css = creep.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 3);
                            if (creep.store.energy>creep.getActiveBodyparts(WORK)*5 && css.length>0) {
                                creep.build(css[0]);
                            }
                            else {
                                if (true || creep.room.terminal.store.energy>10000) {
                                    creep.upgradeController(ctrl)
                                }
                            }
                        }
                    }
                }
                else {
                    if (creep.ticksToLive<350) {
                        return
                    }
                    if (creep.store.energy<creep.getActiveBodyparts(WORK)*2) {
                        if (ectn && ectn.store.energy>0) {
                            creep.withdraw(ectn, 'energy');
                        }
                    }
                    if (creep.store.energy>0) {
                        let css = creep.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 3);
                        if (css.length>0) {
                            creep.build(css[0]);
                        }
                        else {
                            if (creep.pos.y==14 && Game.getObjectById('60a792ef68f7ba25cfb02d53').hits<1000000) {
                                creep.repair(Game.getObjectById('60a792ef68f7ba25cfb02d53'));
                            }
                            if (creep.room.terminal.store.energy>10000) {
                                creep.upgradeController(ctrl)
                            }
                        }
                    }
                }
            }
        }
        else {
            let lk = creep.room.lookForAt(LOOK_CREEPS, 18, 14);
            if (lk.length==0) {
                creep.moveTo(18, 14);
            }
            else if (lk[0].name == creep.name) {
                creep.memory.in = true;
            }
            else {
                lk = creep.room.lookForAt(LOOK_CREEPS, 18, 15);
                if (lk.length==0) {
                    creep.moveTo(18, 15);
                }
                else if (lk[0].name == creep.name) {
                    creep.memory.in = true;
                }
                else {
                    lk = creep.room.lookForAt(LOOK_CREEPS, 17, 15);
                    if (lk.length==0) {
                        creep.moveTo(17, 15);
                    }
                    else if (lk[0].name == creep.name) {
                        creep.memory.in = true;
                    }
                    else {
                        lk = creep.room.lookForAt(LOOK_CREEPS, 16, 14);
                        if (lk.length==0) {
                            creep.moveTo(16, 14);
                        }
                        else if (lk[0].name == creep.name) {
                            creep.memory.in = true;
                        }
                        else {
                            lk = creep.room.lookForAt(LOOK_CREEPS, 15, 12);
                            if (lk.length==0) {
                                creep.moveTo(15, 12);
                            }
                            else if (lk[0].name == creep.name) {
                                creep.memory.in = true;
                                creep.memory.spe = true;
                            }
                            else {
                                fo('stranger no where to go');
                            }
                        }
                    }
                }
            }
        }
    }
};
