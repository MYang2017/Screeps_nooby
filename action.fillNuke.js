module.exports = {
    run: function (creep) {
        if (creep.room.memory.nukid && Game.getObjectById(creep.room.memory.nukid)) {
            let nuker = Game.getObjectById(creep.room.memory.nukid);
            if (nuker.store.getFreeCapacity('energy')>0) {
                if (_.sum(creep.store)-creep.store.energy>0) {
                    let whereTo = putATypeOfRes(creep.room, 'energy');
                    if (whereTo) {
                        if (creep.pos.getRangeTo(whereTo)>1) {
                            creep.travelTo(whereTo, {maxRooms: 1});
                            return true
                        }
                        else {
                            for (let restp in creep.store) {
                                if (restp!='energy') {
                                    creep.transfer(whereTo, restp);
                                    return true
                                }
                            }
                        }
                        return true
                    }
                    else {
                        fo(creep.pos + 'serious lorry exploding mistake that blocks lab fill in action.fillReactionLabs');
                        return false;
                    }
                }
                else if (creep.store.energy>0) {
                    if (creep.pos.getRangeTo(nuker)>1) {
                        creep.travelTo(nuker, {maxRooms: 1});
                        return true
                    }
                    else {
                        creep.transfer(nuker, 'energy');
                        return true
                    }
                }
                else { // empty, go take energy
                    let whereTo = getATypeOfRes(creep.room, 'energy');
                    if (creep.pos.getRangeTo(whereTo)>1) {
                        creep.travelTo(whereTo, {maxRooms: 1});
                        return true
                    }
                    else {
                        creep.withdraw(whereTo, 'energy');
                        return true
                    }
                }
            }
            else if (nuker.store.getFreeCapacity('G')>0) {
                if (_.sum(creep.store)-creep.store['G']>0) {
                    let whereTo = putATypeOfRes(creep.room, 'energy');
                    if (whereTo) {
                        if (creep.pos.getRangeTo(whereTo)>1) {
                            creep.travelTo(whereTo, {maxRooms: 1});
                            return true
                        }
                        else {
                            for (let restp in creep.store) {
                                if (restp!='G') {
                                    creep.transfer(whereTo, restp);
                                    return true
                                }
                            }
                        }
                        return true
                    }
                    else {
                        fo(creep.pos + 'serious lorry exploding mistake that blocks lab fill in action.fillReactionLabs');
                        return false;
                    }
                }
                else if (creep.store['G']>0) {
                    if (creep.pos.getRangeTo(nuker)>1) {
                        creep.travelTo(nuker, {maxRooms: 1});
                        return true
                    }
                    else {
                        creep.transfer(nuker, 'G');
                        return true
                    }
                }
                else { // empty, go take energy
                    let whereTo = getATypeOfRes(creep.room, 'G');
                    if (whereTo) {
                        if (creep.pos.getRangeTo(whereTo)>1) {
                            creep.travelTo(whereTo, {maxRooms: 1});
                            return true
                        }
                        else {
                            creep.withdraw(whereTo, 'G');
                            return true
                        }
                    }
                    else {
                        fo(creep.room.name + ' not enough G for nuker');
                        return false
                    }
                }
            }
            else {
                return false
            }
        }
        else if (Game.time%500==0 && (creep.room.memory.nukid == undefined || Game.getObjectById(creep.room.memory.nukid)==null) && creep.room.controller && creep.room.controller.level==8) {
            let nuk = creep.room.find(FIND_MY_STRUCTURES, {filter: s=>s.structureType==STRUCTURE_NUKER});
            if (nuk.length>0) {
                creep.room.memory.nukid = nuk[0].id;
            }
            return false
        }
        return false
    }

};