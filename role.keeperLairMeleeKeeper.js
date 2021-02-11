var actionRunAway = require('action.flee');
var actionAvoid = require('action.idle');

module.exports = {
    run: function(creep) {

        if (creep.memory.storedTarget == undefined) {
            creep.memory.storedTarget = {};
        }
        let hostileCreep = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter: s => !allyList().includes(s.owner)});
        let toHeal = creep.pos.findClosestByRange(FIND_MY_CREEPS, { filter: (s) => (s.hits < s.hitsMax) } );

        if (creep.room.name == creep.memory.target) { // if in target room
            if ( hostileCreep&&hostileCreep.owner.username == 'Invader' ) { // if invader is near by, run away
                let numMyKiller = creep.room.find(FIND_MY_CREEPS, {filter:c=>c.memory.role=='keeperLairInvaderHealer'}).length;
                if (numMyKiller==0||creep.hits<0.618*creep.hitsMax) {
                    creep.say('Ai~', true);
                    creep.attack(hostileCreep);
                    creep.heal(creep);
                    actionRunAway.run(creep);
                }
                else {
                    creep.say('Tucf!', true);
                    if (creep.attack(hostileCreep)==ERR_NOT_IN_RANGE) {
                        creep.heal(creep);
                        creep.travelTo(hostileCreep, { maxRooms: 1 });
                    }
                }
            }
            else {
                creep.say('oh~', true);
                let posToGo = keeperLairToGo(creep, creep.memory.target); // find hostile or next spawning lair
                if (posToGo) { // if source keeper lair needs to be cleared
                    let disToTarget = creep.pos.getRangeTo(posToGo);
                    if (disToTarget == 6 && creep.hits < creep.hitsMax) { // stop and heal
                        creep.heal(creep);
                        creep.attack(hostileCreep);
                    }
                    else if (disToTarget > 1) { // if far get to target position
                        //creep.heal(creep);
                        creep.travelTo(posToGo, { maxRooms: 1 });
                        creep.heal(creep);
                        creep.attack(hostileCreep);
                        //creep.rangedMassAttack();
                        //creep.rangedAttack(hostileCreep);
                        creep.memory.storedTarget.x = posToGo.pos.x; creep.memory.storedTarget.y = posToGo.pos.y; creep.memory.storedTarget.roomName = posToGo.room.name;
                    }
                    else { // if in range of attacking, attack
                        //console.log(creep.name, creep.attack(hostileCreep), creep.heal(creep))
                        creep.attack(hostileCreep);
                        creep.heal(creep);
                        //creep.rangedMassAttack();
                    }
                }
                else { // no source keeper hostile and spawn time is far
                    let toHeal = creep.pos.findClosestByRange(FIND_MY_CREEPS, { filter: (s) => (s.hits < s.hitsMax) } );
                    if (toHeal) { // if there is damaged creep, go heal
                        if (creep.heal(toHeal) == ERR_NOT_IN_RANGE) {
                            creep.travelTo(toHeal, { maxRooms: 1 });
                            creep.attack(hostileCreep);
                        }
                    }
                    else { // move to flag and wait
                        //creep.travelTo(new RoomPosition(25,25, creep.memory.target));
                        // avoid
                        creep.attack(hostileCreep);
                        actionAvoid.run(creep);
                    }
                }
            }
        }
        else { // not in target room, go to target room
            if (creep.memory.storedTarget.roomName) { // if stored target position
                creep.travelTo(new RoomPosition(creep.memory.storedTarget.x,creep.memory.storedTarget.y, creep.memory.storedTarget.roomName));
            }
            else {
                creep.travelTo(new RoomPosition(25,25, creep.memory.target));
            }
        }
    }
};
