var doge = require('action.idle')

module.exports = {
    run: function(creep) {
        creep.memory.free=true;
        //return true
        // reverse LUT
        var partLUT = {'XZHO2': 'move', 
                        'ZHO2': 'move', 
                        'ZO': 'move', 
                        'XZH2O': 'work',
                        'ZH2O': 'work',
                        'ZH': 'work',
                        'XGHO2': 'tough', 
                        'GHO2': 'tough', 
                        'GO': 'tough', 
                        'XGH2O': 'work',
                        'GH2O': 'work',
                        'GH': 'work',
                        'XKHO2': 'ranged_attack', 
                        'KHO2': 'ranged_attack', 
                        'KO': 'ranged_attack', 
                        'XKH2O': 'carry',
                        'KH2O': 'carry',
                        'KH': 'carry',
                        'XUHO2': 'work', 
                        'UHO2': 'work', 
                        'UO': 'work', 
                        'XUH2O': 'attack',
                        'UH2O': 'attack',
                        'UH': 'attack',
        }
        
        // calc num of parts to boost for move
        var numToBoost = function(creep, tp) {
            return
            let tot = creep.body.length - creep.getActiveBodyparts(CARRY);
            let nom = creep.getActiveBodyparts(MOVE);
            let a;
            if (tp == 'ZO') {
                a = tot-2*nom;
            }
            else if (tp == 'ZHO2') {
                a = (tot-2*nom)/2;
            }
            else if (tp == 'XZHO2') {
                a = (tot-2*nom)/3;
            }
            fo(a!=undefined)
            if (a!=undefined) {
                a = Math.ceil(a);
            }
            return a
        }
        
        if (creep.ticksToLive<1040) { // too late to boost
            return true
        }
        
        if (creep.memory.boosted==undefined || creep.memory.boosted || (creep.room.controller && creep.room.controller.level<6)) {
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
                                if (boostLabMemory[matToBoost]==undefined) {
                                    creep.room.memory.forLab.boostLabs[matToBoost]==undefined;
                                    return true
                                }
                                let boostLabId = boostLabMemory[matToBoost].id;
                                if (boostLabId == undefined) {
                                    creep.room.memory.forLab.boostLabs[matToBoost]==undefined;
                                    return true
                                }
                                let boostLab = Game.getObjectById(boostLabId);
                                if (boostLabId && boostLab) {
                                    if (boostLab.mineralType==undefined || boostLab.mineralType!=matToBoost || boostLab.store[boostLab.mineralType]<30*creep.getActiveBodyparts(partLUT[matToBoost])) { // still loading
                                        if (['GH', 'GH2O', 'XGH2O'].includes(matToBoost)) {
                                            return true
                                        }
                                        doge.run(creep);
                                        /*
                                        let restp = roomWonderingPosi(creep.room);
                                        if (creep.pos.getRangeTo(restp.x, restp.y)>1) {
                                            creep.travelTo(new RoomPosition(restp.x, restp.y, creep.room.name), {range:2, maxRooms: 1});
                                        }
                                        */
                                        return false
                                    }
                                    if ( creep.pos.getRangeTo(boostLab) > 1 ) {
                                        creep.travelTo(boostLab);
                                        return false
                                    }
                                    else {
                                        let boostRes = boostLab.boostCreep(creep, numToBoost(creep, matToBoost));
                                        //let boostRes = boostLab.boostCreep(creep);
                                        if ( boostRes == OK) { // if successfully boosted
                                            creep.memory.boostMats[idMmatToBoost] = true;
                                            return false
                                        }
                                    }
                                }
                                else { // no available lab to have this type
                                    return true
                                }
                            }
                            else { // room run out of boost
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