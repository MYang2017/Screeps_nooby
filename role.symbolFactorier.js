let doge = require('action.idle');
let pic = require('role.pickuper');
module.exports = {
    run: function (creep) {
        let fac = Game.getObjectById('60783a4d08c231f0fd07f7a6');
        let carrybo = _.sum(creep.store)>0;
        if (carrybo) {
            for (let tp in creep.store) {
                if (creep.pos.getRangeTo(creep.room.terminal)>1) {
                    creep.travelTo(creep.room.terminal);
                    return
                }
                else {
                    creep.transfer(creep.room.terminal, tp);
                    return
                }
            }
        }
        else {
            if (_.sum(fac.store)>0) {
                for (let tp in fac.store) {
                    if (creep.pos.getRangeTo(fac)>1) {
                        creep.travelTo(fac);
                        return
                    }
                    else {
                        creep.withdraw(fac, tp);
                        return
                    }
                }
            }
            else {
                doge.run(creep);
            }
        }
        
        return
        
        let togives = Memory.symSitu;
        if (togives == undefined || Game.time%1666==0) {
            Memory.symSitu = getMySymSitu();
            togives = Memory.symSitu;
        }
        togives = togives.slice(0,5);
        
        let carry = _.sum(creep.store)>0;
        if (carry) {
            for (let tp in creep.store) {
                if (!togives.includes(tp)) {
                    if (creep.pos.getRangeTo(creep.room.terminal)>1) {
                        creep.travelTo(creep.room.terminal);
                        return
                    }
                    else {
                        creep.transfer(creep.room.terminal, tp);
                        return
                    }
                }
                else {
                    if (creep.pos.getRangeTo(fac)>1) {
                        creep.travelTo(fac);
                        return
                    }
                    else {
                        creep.transfer(fac, tp);
                        return
                    }
                }
            }
        }
        else {
            //if (creep.pos.getRangeTo(fac)<creep.pos.getRangeTo(creep.room.storage)) {
                for (let tra in fac.store) {
                    if (!togives.includes(tra)) {
                        if (creep.pos.getRangeTo(fac)>1) {
                            creep.travelTo(fac);
                            return
                        }
                        else {
                            creep.withdraw(fac, tra);
                            return
                        }
                    }
                }
            //}
            
            if (_.sum(fac.store)<15000) {
                for (let togive of togives) {
                    if (creep.room.storage.store[togive]>0) {
                        if (creep.pos.getRangeTo(creep.room.storage)>1) {
                            creep.travelTo(creep.room.storage);
                            return
                        }
                        else {
                            creep.withdraw(creep.room.storage, togive);
                            return
                        }
                    }
                    else if (creep.room.terminal.store[togive]>0) {
                        if (creep.pos.getRangeTo(creep.room.terminal)>1) {
                            creep.travelTo(creep.room.terminal);
                            return
                        }
                        else {
                            creep.withdraw(creep.room.terminal, togive);
                            return
                        }
                    }
                    else {
                        doge.run(creep);
                    }
                }
                doge.run(creep);
            }
            else {
                pic.run(creep);
            }
        }
    }
};
