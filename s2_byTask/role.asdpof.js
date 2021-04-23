let rec = require('action.recycle');

module.exports = {
    run: function(creep) {
        creep.say('💕', true);
        
        let hn = creep.memory.home;
        let tn = creep.memory.target;
        
        if (creep.memory.ready == undefined || !creep.memory.ready) {// if not ready
            let totaketp = 'XGH2O';
            if (creep.room.terminal.store[totaketp]==0) {
                totaketp = 'XUH2O';
                if (creep.room.terminal.store[totaketp]==0) {
                    totaketp = 'XLHO2';
                    if (creep.room.terminal.store[totaketp]==0) {
                        totaketp = 'energy';
                    }
                }
            }
            let takeRes = creep.withdraw(creep.room.terminal, 'XGH2O', Math.floor(Math.random()*10)+1); 
            if (takeRes==OK || takeRes==ERR_NOT_ENOUGH_RESOURCES) { // if take mats OK
                creep.memory.ready = true; // ready = true
            }
            else { 
                creep.travelTo(creep.room.terminal); 
            }
        }
        else { // else ready
            if (creep.room.name == hn && creep.memory.todie) { // if creep at home and todie
                if (_.sum(creep.store)>0) { // if creep carry
                    if (creep.pos.getRangeTo(creep.room.terminal)>1) { // transfer to storage
                        creep.travelTo(creep.room.terminal);
                    }
                    else {
                        for (let tp in creep.store) {
                            creep.transfer(creep.room.terminal, tp);
                        }
                    }
                }
                else {// else
                    rec.run(creep);//recycle
                }
            }
            else if (creep.room.name != tn) { // else if not at target
                if (creep.memory.todie) {
                    storedTravelFromAtoB(creep, 'r'); // go to home
                }
                else {
                    storedTravelFromAtoB(creep, 'l'); // go to target
                }
            }
            else { // else at target
                    for (let did in creep.memory.dests) {
                        creep.memory.dests[did].completed = undefined;
                    }
                    
                    let fac = Game.getObjectById('60729a4075407b3bab8b6307');
                    
                    if (creep.memory.todie) {
                        storedTravelFromAtoB(creep, 'r'); // go to home
                        return
                    }
                    if (_.sum(creep.store)>0) { // if carry
                        let hasothers = false;
                        for (let tp in creep.store) {
                            if (!(tp.slice(0,3)=='sym')) {
                                hasothers = true;
                                break;
                            }
                        }
                        if (hasothers) { // if not symbol
                            if (creep.pos.getRangeTo(fac)>1) { // drop to container
                                creep.moveTo(fac, {maxRooms: 1})
                            }
                            else {
                                for (let tp in creep.store) {
                                    if (!(tp.slice(0,3)=='sym')) {
                                        creep.transfer(fac, tp);
                                    }
                                }
                            }
                        }
                        else { // carrying pure symbol
                            
                            if (_.sum(fac.store)==0 || creep.store.getFreeCapacity('energy') ==0 ) {
                                creep.memory.todie = true;
                            }
                            if (creep.store.getFreeCapacity('energy') > 0) {
                                for (let tp in fac.store) {
                                    if ((tp.slice(0,3)=='sym')) {
                                        creep.withdraw(fac, tp);
                                    }
                                }
                            }
                        }
                    }
                    else {// else no carry
                        let fac = Game.getObjectById('60729a4075407b3bab8b6307');
                        if (creep.pos.getRangeTo(fac)>1) {
                            creep.travelTo(fac)
                        }
                        else {
                            if (_.sum(fac.store)==0 || creep.store.getFreeCapacity('energy') ==0 ) {
                                creep.memory.todie = true;
                            }
                            if (creep.store.getFreeCapacity('energy') > 0) {
                                for (let tp in fac.store) {
                                    if ((tp.slice(0,3)=='sym')) {
                                        creep.withdraw(fac, tp);
                                    }
                                }
                            }
                        }
                    }
            }
        }
    }
};
