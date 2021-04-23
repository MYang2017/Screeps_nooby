var doge = require('action.idle')

module.exports = {
    run: function(creep) {
        
        // calc num of parts to boost for move
        var numToBoost = function(creep, tp) {
            let tot = creep.body.length;
            let nom = creep.getActiveBodyparts(MOVE);
            let a = undefined;
            if (tp == 'ZO') {
                a = tot-2*nom;
            }
            else if (tp == 'ZHO2') {
                a = (tot-2*nom)/2;
            }
            else if (tp == 'XZHO2') {
                a = (tot-2*nom)/3;
            }
            else if (tp == 'XLHO2' && creep.memory.role == 'quads') {
                a = 17;
            }
            if (a!=undefined) {
                a = Math.ceil(a);
            }
            return a
        }
        
        if (creep.memory.boosted==undefined || creep.memory.boosted) {
            return true
        }
        else {
            let matsToBoost = creep.memory.boostMats;
            if (matsToBoost==undefined) {
                return true
            }
            else {
                let fullyBoosted = true;
                for (let idMmatToBoost in matsToBoost) {
                    let matToBoost = matsToBoost[idMmatToBoost];
                    if (matToBoost !== true) {
                        fullyBoosted = false;
                    }
                }
                if (fullyBoosted) {
                    creep.memory.boosted = true;
                    return true
                }
            }
        }
        
        if (!creep.memory.boosted) { // if creep is not boosted, find a lab to boost
            let matsToBoost = creep.memory.boostMats;
            if (matsToBoost==undefined) {
                return true
            }
            else {
                for (let idMmatToBoost in matsToBoost) {
                    let matToBoost = matsToBoost[idMmatToBoost];
                    if (matToBoost == true) {
                        continue;
                    }
                    else {
                        let labMemory = creep.room.memory.forLab;
                        if (labMemory) {
                            if (cacheBoostLabs(creep.room.name, matToBoost)) { // room has/on the way to have boost lab
                                let boostLabMemory = labMemory.boostLabs;
                                let boostLabId = boostLabMemory[matToBoost];
                                if (boostLabId) {
                                    let boostLab = Game.getObjectById(boostLabId);
                                    if ( creep.pos.getRangeTo(boostLab) > 1 ) {
                                        creep.travelTo(boostLab);
                                        return false
                                    }
                                    else {
                                        let boostRes = boostLab.boostCreep(creep, numToBoost(creep, matToBoost));
                                        if ( boostRes == OK ) { // if successfully boosted
                                            creep.memory.boostMats[idMmatToBoost] = true;
                                            return false
                                        }
                                        else if (boostRes==ERR_NOT_ENOUGH_RESOURCES) { // && creep.room.memory.mineralThresholds.currentMineralStats[matToBoost]<600) { // if room has enough mats, waiting to get loaded
                                            creep.memory.boostMats[idMmatToBoost] = true;
                                            //doge.run(creep);
                                            return false
                                        }
                                        else {
                                            fo('boost res: ' + boostRes);
                                            return false
                                        }
                                    }
                                }
                                else { // no available lab to have this type
                                    return true
                                }
                            }
                            else { // no boost lab of this type
                                return true
                            }
                        }
                        else { // no labs
                            return true
                        }
                    }
                }
                // all boosted
                return true
            }
        }
    }
};