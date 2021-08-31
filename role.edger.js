var actionRunAway = require('action.flee');
var actionAvoid = require('action.idle');

require('funcExpand');

module.exports = {
    run: function(creep) {
        if (creep.room.name==creep.memory.target) {
            if (creep.memory.in==undefined) {
                //let exitDir = Game.map.findExit(creep.room, ?);
                let exit = creep.pos.findClosestByRange(FIND_EXIT_TOP);
                creep.moveTo(exit, {range: 1, maxRooms: 1});
                if (creep.pos.y==1) {
                    creep.memory.in=true;
                }
            }
            else {
                let xtobe = creep.memory.campx;
                if (xtobe) {
                    let posind = creep.name.slice(0,1);
                    if (posind=='1') {
                        if (creep.pos.x<xtobe-1) {
                            creep.move(RIGHT);
                        }
                        else if (creep.pos.x>xtobe-1) {
                            creep.move(LEFT);
                        }
                    }
                    else if (posind=='2') {
                        if (creep.pos.x<xtobe) {
                            creep.move(RIGHT);
                        }
                        else if (creep.pos.x>xtobe) {
                            creep.move(LEFT);
                        }
                    }
                    else if (posind=='3') {
                        if (creep.pos.x<xtobe+1) {
                            creep.move(RIGHT);
                        }
                        else if (creep.pos.x>xtobe+1) {
                            creep.move(LEFT);
                        }
                    }
                    else {
                        fo('impossible edger pos in functionWar');
                    }
                }
                else {
                    let rand = Math.random();
                    if (rand<0.5) {
                        creep.move(LEFT);
                    }
                    else {
                        creep.move(RIGHT);
                    }
                }
            }
        }
        else {
            creep.travelTo(new RoomPosition(25, 25, creep.memory.target));
        }
        
        let tars = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 1);
        if (tars.length>0) {
            creep.attack(tars[0]);
        }
        else {
            tars = creep.pos.findInRange(FIND_MY_CREEPS, 3, {filter:c=>c.hits<c.hitsMax});
            if (tars.length>0) {
                creep.heal(tars[0]);
            }
        }
    }
};