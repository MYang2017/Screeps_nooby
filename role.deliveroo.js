var actionRunAway = require('action.flee');
var actionAvoid = require('action.idle');
var addToQ = require('action.addToSQ');

require('funcExpand');

module.exports = {
    run: function(creep) {
        // not at home 0 ops need to load or recycle
        if (creep.getActiveBodyparts(CARRY)>0 && creep.store.ops==0 && creep.room.name!=creep.memory.home) {
            if (travelToPrioHighwayWithClosestRoomExit(creep, creep.memory.home)) {
                if (creep.memory.travelTime && creep.ticksToLive>creep.memory.travelTime+50) {
                    let whereTo = getATypeOfRes(creep.room, 'ops');
                    if (creep.pos.getRangeTo(whereTo)>1) {
                        creep.travelTo(whereTo, {maxRooms: 1});
                    }
                    else {
                        creep.withdraw(whereTo, 'ops');
                    }
                }
                else {
                    creep.memory.target = creep.memory.home;
                    creep.memory.role='ranger';
                }
            }
            return
        }
        
        // healers heal around
        if (creep.getActiveBodyparts(HEAL)>0) {
            if (creep.hits<creep.hitsMax) {
                creep.heal(creep);
            }
            else {
                let mypcs = creep.pos.findInRange(FIND_MY_POWER_CREEPS, 3, {filter: p=>p.hits<p.hitsMax});
                if (mypcs.length>0) {
                    creep.heal(mypcs[0]);
                }
                else {
                    let mycps = creep.pos.findInRange(FIND_MY_CREEPS, 3, {filter: p=>p.hits<p.hitsMax});
                    if (mycps.length>0) {
                        creep.heal(mycps[0]);
                    }
                    else {
                        creep.heal(creep);
                    }
                }
            }
        }
        
        // get main pc
        let master = Game.powerCreeps[creep.memory.pcn];
        if (master) {
            if (master.memory.battleQ==undefined) { // quest cancel
                creep.memory.role='ranger';
                creep.memory.target=creep.memory.home;
                return
            }
            
            // reload when at home
            if (creep.getActiveBodyparts(CARRY)>0 && creep.room.name==creep.memory.home && creep.store.getFreeCapacity('ops')>0) {
                let whereTo = getATypeOfRes(creep.room, 'ops');
                if (creep.pos.getRangeTo(whereTo)>1) {
                    creep.travelTo(whereTo, {maxRooms: 1});
                }
                else {
                    creep.withdraw(whereTo, 'ops');
                }
                return
            }
            
            let rrn = master.memory.battleQ.restPos.rn;
            // resend fuel or add sp for new one
            if (creep.memory.travelTime) {
                if (creep.memory.asked == undefined) {
                    if (creep.ticksToLive<creep.memory.travelTime) {
                        addToQ.run(creep, creep.ticksToLive);
                        creep.memory.asked = true;
                    }
                }
            }
            else { // register travel time
                if (rrn && creep.room.name==rrn) {
                    creep.memory.travelTime = 1500-creep.ticksToLive;
                }
            }
            
            // resend fuel if empty
            if (rrn && creep.memory.type=='c' && creep.memory.asked == undefined && creep.room.name == rrn && creep.store.getFreeCapacity('ops')>100) {
                addToQ.run(creep, creep.ticksToLive);
                creep.memory.asked = true;
            }
            
            let rx = master.memory.battleQ.restPos.x;
            let ry = master.memory.battleQ.restPos.y;
            
            // pickup drops
            if (creep.getActiveBodyparts(CARRY)>0 && creep.store.getFreeCapacity('ops')>0) {
                let dps = creep.room.find(FIND_DROPPED_RESOURCES, {filter: d=>d.resourceType=='ops'});
                if (dps.length>0) {
                    if (creep.pos.getRangeTo(dps[0])>1) {
                        creep.travelTo(dps[0], {maxRooms:1});
                    }
                    else {
                        creep.pickup(dps[0]);
                    }
                    return
                }
            }
            
            // if master rest pos x got
            if (rx) {
                if (travelToPrioHighwayWithClosestRoomExit(creep, rrn)) { // if in rest room
                    if (creep.pos.getRangeTo(rx, ry)>1) {
                        moveRestrictedInRoom(creep, new RoomPosition(rx, ry, rrn));
                    }
                    // transfer ops to pc
                    if (master.room.name==rrn) {
                        if (creep.store.ops>0 && master.store.getFreeCapacity('ops')>50) {
                            creep.transfer(master, 'ops');
                        }
                    }
                }
            }
            else if (rrn) { // master rest room name get
                if (travelToPrioHighwayWithClosestRoomExit(creep, rrn)) { // if in rest room
                    creep.travelTo(new RoomPosition(25, 25, rrn), {range:22, maxRooms:1});
                }
            }
            else { // follow master
                if (master.room.name!=master.memory.target) { // never follow to target!
                    creep.moveTo(master);
                }
            }
        }
        else { // main pc dead, go back recycle
            creep.memory.role='ranger';
            creep.memory.target=creep.memory.home;
        }
    }
};