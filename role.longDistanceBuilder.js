var roleBuilder = require('role.builder');
var roleDismantler = require('role.dismantler');
var actionBuild = require('action.build');
var actionRunAway = require('action.flee');

module.exports = {
    run: function(creep) {
        
        let sites = creep.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 3);
        if (sites.length > 0) {
            creep.build(sites[0]);
        }
            
        if (creep.pos.findInRange(FIND_HOSTILE_CREEPS, 4, {filter: c=>(!allyList().includes(c.owner.username) )}).length > 0) { // self destroy if not useful damages by NPC
            creep.memory._trav = undefined;
            actionRunAway.run(creep)
        }
        else {
            if (creep.hits<creep.hitsMax) {
                creep.travelTo(new RoomPosition(25,25, creep.memory.home));
                return
            }
            if (creep.memory.needhelp==true) {
                if (_.sum(creep.store) == 0) {
                    if (creep.room.name != creep.memory.home) {
                        creep.travelTo(new RoomPosition(25,25, creep.memory.home), { ignoreCreeps: false});
                    }
                    else {
                        let takres = creep.withdraw(creep.room.storage, 'energy');
                        if (takres!=OK) {
                            creep.travelTo(creep.room.storage)
                        }
                        else {
                            creep.memory.needhelp = undefined;
                        }
                    }
                }
                else {
                    creep.travelTo(new RoomPosition(25,25, creep.memory.target));
                }
                return
            }
          if (false) { //((Game.rooms[creep.memory.target]==undefined)||(Game.rooms[creep.memory.target].memory.ifPeace == false)) { // room under attack, run away
             creep.say('run away');
               if (creep.room.name != creep.memory.home) { // if not at home base
                   creep.travelTo(new RoomPosition(25,25, creep.memory.home), { ignoreCreeps: false});
               }
               else if (creep.room.name == creep.memory.home) {
                   roleBuilder.run(creep);
               }
          }
          else {
            creep.say('build here die here');
            if (creep.room.name == creep.memory.target) {
                let mino = creep.room.find(FIND_MY_CREEPS, {filter: c=>c.memory.role=='miner'})
                if (_.sum(creep.store) == 0 && mino.length==0) {
                    creep.memory.needhelp = true;
                    return
                }
                /*if (creep.room.name == 'E91N12') { // if invading room
                    roleDismantler.run(creep);
                }
                else {
                // if creep in target room then work
                    roleBuilder.run(creep);
                }*/
                roleBuilder.run(creep);
            }
            else { // go to target room
                //var exit = creep.room.findExitTo(creep.memory.target);
                //creep.travelTo(creep.pos.findClosestByRange(exit));
                //creep.travelTo(Game.flags[creep.memory.target].pos);
                creep.travelTo(new RoomPosition(25, 25, creep.memory.target), { ignoreCreeps: false});
            }
          }
        }
    }
};
