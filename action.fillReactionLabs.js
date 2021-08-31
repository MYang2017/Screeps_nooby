//let fillN = require('action.fillNuke');

module.exports = {
    run: function (creep) {
        /*
        if (fillN.run(creep)) {
            return
        }
        */
        if (creep.room.memory == undefined || creep.room.memory.labFillTask == undefined) {
            return false
        }
        
        let labtaskobj = creep.room.memory.labFillTask;

        // fill lab with creep already carrying
        for (let labid in labtaskobj) {
            if (labid == undefined || Game.getObjectById(labid)==null) {
                continue;
            }
            let lab = Game.getObjectById(labid);
            let act = labtaskobj[labid].act;
            let mat = labtaskobj[labid].mat;
            if (act == 'in') {
                if (lab.mineralType==undefined||(lab.store[mat]>0&&lab.store[mat]<1500)) {
                    if (creep.store[mat]>0) {
                        if (creep.pos.getRangeTo(lab)>1) {
                            creep.travelTo(lab, {maxRooms: 1});
                            return true
                        }
                        else {
                            creep.transfer(lab, mat);
                            return true
                        }
                    }
                }
            }
        }
        // at this point, creep does not carry what we need to fill

        // check if any lab has unwanted mats or almost full
        for (let labid in labtaskobj) {
            if (labid == undefined || Game.getObjectById(labid)==null) {
                continue;
            }
            let lab = Game.getObjectById(labid);
            let act = labtaskobj[labid].act;
            let mat = labtaskobj[labid].mat;
            if (lab.mineralType && (lab.mineralType != mat || lab.store[mat]>2500)) { // ((act=='out'&&lab.store[mat]>creep.store.getFreeCapacity(mat))||lab.store[mat]>2900))
                if (_.sum(creep.store)>0) {
                    let whereTo = putATypeOfRes(creep.room, 'energy');
                    if (whereTo) {
                        if (creep.pos.getRangeTo(whereTo)>1) {
                            creep.travelTo(whereTo, {maxRooms: 1});
                            return true
                        }
                        else {
                            for (let restp in creep.store) {
                                creep.transfer(whereTo, restp);
                                return true
                            }
                        }
                        return true
                    }
                    else {
                        fo(creep.pos + 'serious lorry exploding mistake that blocks lab fill in action.fillReactionLabs');
                        return false;
                    }
                }
                else { // empty, go take tab
                    if (creep.pos.getRangeTo(lab)>1) {
                        creep.travelTo(lab, {maxRooms: 1});
                        return true
                    }
                    else {
                        creep.withdraw(lab, lab.mineralType);
                        return true
                    }
                }
            }
        }
        // at this point, all lab are empty or has right mat

        // check if need fill, take mats
        for (let labid in labtaskobj) {
            if (labid == undefined || Game.getObjectById(labid)==null) {
                continue;
            }
            let lab = Game.getObjectById(labid);
            let act = labtaskobj[labid].act;
            let mat = labtaskobj[labid].mat;
            if (act == 'in') {
                if (creep.room.memory.mineralThresholds.currentMineralStats[mat]>0) {
                    if (lab.mineralType==undefined||(lab.store[mat]>0&&lab.store[mat]<1500)) {
                        if (_.sum(creep.store)>0 && creep.store[mat]==0) {
                            let whereTo = putATypeOfRes(creep.room, 'energy');
                            if (whereTo) {
                                if (creep.pos.getRangeTo(whereTo)>1) {
                                    creep.travelTo(whereTo, {maxRooms: 1});
                                    return true
                                }
                                else {
                                    for (let restp in creep.store) {
                                        creep.transfer(whereTo, restp);
                                        return true
                                    }
                                }
                                return true
                            }
                            else {
                                fo(creep.pos + 'serious lorry exploding mistake that blocks lab fill in action.fillReactionLabs');
                                return false;
                            }
                        }
                        else { // empty, go take tab
                            let whereTo = getATypeOfRes(creep.room, mat);
                            if (creep.pos.getRangeTo(whereTo)>1) {
                                creep.travelTo(whereTo, {maxRooms: 1});
                                return true
                            }
                            else {
                                creep.withdraw(whereTo, mat);
                                return true
                            }
                        }
                    }
                }
                else { // not enough mat
                    continue;
                }
            }
        }
        // now we either finish or we dont have mats

        return false

        for (let labid in labtaskobj) {
            if (labid == undefined || Game.getObjectById(labid)==null) {
                continue;
            }
            let lab = Game.getObjectById(labid);
            let act = labtaskobj[labid].act;
            let mat = labtaskobj[labid].mat;
            
            if (act == 'in') {
                if (lab.mineralType==undefined || lab.mineralType == mat) { // if empty or has the right mat
                    if (lab.store[mat]>2500) { // full
                        // 
                    }
                    else if (lab.store[mat]<2000) { // fill
                        if (_.sum(creep.store)>0 && creep.store[mat]==0) { // carrying rubbish
                            let whereTo = putATypeOfRes(creep.room, 'energy');
                            if (whereTo) {
                                if (creep.pos.getRangeTo(whereTo)>1) {
                                    creep.travelTo(whereTo, {maxRooms: 1});
                                    return true
                                }
                                else {
                                    for (let restp in creep.store) {
                                        creep.transfer(whereTo, restp);
                                        return true
                                    }
                                }
                                return true
                            }
                            else {
                                fo(creep.pos + 'serious lorry exploding mistake that blocks lab fill in action.fillReactionLabs');
                                return false;
                            }
                        }
                        else if (creep.store[mat]>0) {
                            if (creep.pos.getRangeTo(lab)>1) {
                                creep.travelTo(lab, {maxRooms: 1});
                                return true
                            }
                            else {
                                creep.transfer(lab, mat);
                                return true
                            }
                        }
                        else { // carry nothing, get
                            if (creep.room.memory.mineralThresholds.currentMineralStats[mat]==0) {
                                // 
                            }
                            else {
                                let whereTo = getATypeOfRes(creep.room, mat);
                                if (creep.pos.getRangeTo(whereTo)>1) {
                                    creep.travelTo(whereTo, {maxRooms: 1});
                                    return true
                                }
                                else {
                                    creep.withdraw(whereTo, mat);
                                    return true
                                }
                            }
                        }
                    }
                    else { // ok level
                        // 
                    }
                }
                else { // has wrong mats
                    if (_.sum(creep.store)!==0) { // if creep full
                        let whereTo = putATypeOfRes(creep.room, 'energy');
                        if (whereTo) {
                            if (creep.pos.getRangeTo(whereTo)>1) {
                                creep.travelTo(whereTo, {maxRooms: 1});
                                return true
                            }
                            else {
                                for (let restp in creep.store) {
                                    creep.transfer(whereTo, restp);
                                    return true
                                }
                            }
                        }
                        else {
                            fo(creep.pos + 'serious lorry exploding mistake that blocks lab fill in action.fillReactionLabs');
                            return false;
                        }
                    }
                    else { // if empty, go take
                        if (creep.pos.getRangeTo(lab)>1) {
                            creep.travelTo(lab, {maxRooms: 1});
                            return true
                        }
                        else {
                            creep.withdraw(lab, lab.mineralType);
                            return true
                        }
                    }
                }
            }
            else if (act == 'out') {
                if (lab.mineralType==undefined || lab.mineralType == mat) { // if empty or has the right mat
                    if (lab.store[mat]>2500) { // full, moveout
                        if (_.sum(creep.store)!==0) { // if creep full
                            let whereTo = putATypeOfRes(creep.room, 'energy');
                            if (whereTo) {
                                if (creep.pos.getRangeTo(whereTo)>1) {
                                    creep.travelTo(whereTo, {maxRooms: 1});
                                    return true
                                }
                                else {
                                    for (let restp in creep.store) {
                                        creep.transfer(whereTo, restp);
                                        return true
                                    }
                                }
                            }
                            else {
                                fo(creep.pos + 'serious lorry exploding mistake that blocks lab fill in action.fillReactionLabs');
                                return false;
                            }
                        }
                        else {
                            if (creep.pos.getRangeTo(lab)>1) {
                                creep.travelTo(lab, {maxRooms: 1});
                                return true
                            }
                            else {
                                creep.withdraw(lab, mat);
                                return true
                            }
                        }
                    }
                    else { // ok level
                        // 
                    }
                }
                else { // has wrong mat
                    if (creep.pos.getRangeTo(lab)>1) {
                        creep.travelTo(lab, {maxRooms: 1});
                        return true
                    }
                    else {
                        creep.withdraw(lab, lab.mineralType);
                        return true
                    }
                }
            }
            else {
                fo(creep.room.name + 'weired lab action');
                return false
            }
        }
        
        return false
        
        
        let carryMineral = creep.memory.labWork.mineralType;
        
        let creepCarrying = _.sum(creep.carry);
        if (creepCarrying == 0) {
            creep.memory.working = false;
        }
        else if (creep.memory.working == false && creepCarrying>0) {
            creep.memory.working = true;
        }

        if (creep.memory.working == true) { // if filled with mineral, transfer to terminal or lab depending on the lab action of creep
            if (creep.store[carryMineral]>0) {
                let target = Game.getObjectById(creep.memory.labWork.target);
                if (target) {
                    if (creep.pos.getRangeTo(target)>1) {
                        creep.travelTo(target, {maxRooms: 1});
                    }
                    else {
                        creep.transfer(target, carryMineral);
                    }
                    return true
                }
                else {
                    return false
                }
            }
            else {
                let whereTo = putATypeOfRes(creep.room, 'energy');
                if (whereTo) {
                    if (creep.pos.getRangeTo(whereTo)>1) {
                        creep.travelTo(whereTo, {maxRooms: 1});
                    }
                    else {
                        for (let restp in creep.store) {
                            if (restp!=carryMineral) {
                                creep.transfer(whereTo, restp);
                                return true
                            }
                        }
                    }
                    return true
                }
                else {
                    return false
                }
            }
            let target = Game.getObjectById(creep.memory.labWork.target);
            creep.say('labin ' + carryMineral);
            for (const resourceType in creep.store) {
                if (resourceType == carryMineral) {
                    if (creep.transfer(target, resourceType) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target);
                    }
                    return true
                }
                else {
                    return false
                }
            }
        }
        else { // if not working, carrying 0 mineral: find mineral
            // get minerals
            creep.say('labout ' + carryMineral);
            let keep = Game.getObjectById(creep.memory.labWork.keep);
            if ((keep.structureType == STRUCTURE_TERMINAL) && (keep.store[carryMineral] == 0)) { // if terminal in-mineral is not enough
                keep = creep.room.storage;
                //console.log(keep.store[carryMineral],creep.carryCapacity)
                if (keep.store[carryMineral] == 0) { // not enough in-minerals
                    //creep.memory.role='lorry'; // become a lorry
                    return false
                }
            }
            if (creep.pos.getRangeTo(keep)>1) {
                creep.travelTo(keep, {maxRooms: 1});
            }
            else {
                creep.withdraw(keep, carryMineral);
            }
            return true
        }
    }
};