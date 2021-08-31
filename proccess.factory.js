global.allCommoList = function () {
    return ['metal', RESOURCE_ALLOY, RESOURCE_TUBE, RESOURCE_FIXTURES, RESOURCE_FRAME, RESOURCE_HYDRAULICS, RESOURCE_MACHINE, 
            "biomass", RESOURCE_CELL, RESOURCE_PHLEGM, RESOURCE_TISSUE, RESOURCE_MUSCLE, RESOURCE_ORGANOID, RESOURCE_ORGANISM, 
            "silicon", RESOURCE_WIRE, RESOURCE_SWITCH, RESOURCE_TRANSISTOR, RESOURCE_MICROCHIP, RESOURCE_CIRCUIT, RESOURCE_DEVICE, 
            "mist", RESOURCE_CONDENSATE, RESOURCE_CONCENTRATE, RESOURCE_EXTRACT, RESOURCE_SPIRIT, RESOURCE_EMANATION, RESOURCE_ESSENCE]
}

global.higherOrderCommoList = function () {
    return [RESOURCE_ALLOY, RESOURCE_TUBE, RESOURCE_FIXTURES, RESOURCE_FRAME, RESOURCE_HYDRAULICS, RESOURCE_MACHINE, 
            RESOURCE_CELL, RESOURCE_PHLEGM, RESOURCE_TISSUE, RESOURCE_MUSCLE, RESOURCE_ORGANOID, RESOURCE_ORGANISM, 
            RESOURCE_WIRE, RESOURCE_SWITCH, RESOURCE_TRANSISTOR, RESOURCE_MICROCHIP, RESOURCE_CIRCUIT, RESOURCE_DEVICE, 
            RESOURCE_CONDENSATE, RESOURCE_CONCENTRATE, RESOURCE_EXTRACT, RESOURCE_SPIRIT, RESOURCE_EMANATION, RESOURCE_ESSENCE]
}

global.allCommoObj = function () {
    return {'metal': [RESOURCE_ALLOY, RESOURCE_TUBE, RESOURCE_FIXTURES, RESOURCE_FRAME, RESOURCE_HYDRAULICS, RESOURCE_MACHINE], 
            "biomass": [RESOURCE_CELL, RESOURCE_PHLEGM, RESOURCE_TISSUE, RESOURCE_MUSCLE, RESOURCE_ORGANOID, RESOURCE_ORGANISM], 
            "silicon": [RESOURCE_WIRE, RESOURCE_SWITCH, RESOURCE_TRANSISTOR, RESOURCE_MICROCHIP, RESOURCE_CIRCUIT, RESOURCE_DEVICE], 
            "mist": [RESOURCE_CONDENSATE, RESOURCE_CONCENTRATE, RESOURCE_EXTRACT, RESOURCE_SPIRIT, RESOURCE_EMANATION, RESOURCE_ESSENCE]
    }
}


global.commodityShoppingList = function () {
    return {
        'silicon': {'U': 'utrium_bar'}, 
        'biomass': {'L': 'lemergium_bar'},
        'metal': {'Z': 'zynthium_bar'}, 
        'mist': {'K': 'keanium_bar'}
    }
}

global.convertRawToBar = function () {
    return {
        'U': 'utrium_bar', 
        'L': 'lemergium_bar',
        'Z': 'zynthium_bar', 
        'K': 'keanium_bar',
        'O': 'oxidant',
        'H': 'reductant',
        'X': 'purifier',
        'G': 'ghodium_melt'
    }
}

global.convertBarToRaw = function () {
    return {
        'utrium_bar': 'U', 
        'lemergium_bar': 'L',
        'zynthium_bar': 'Z', 
        'keanium_bar': 'K',
        'oxidant': 'O',
        'reductant': 'H',
        'purifier': 'X',
        'ghodium_melt': 'G'
    }
}

global.basicCompressables = function () {
    return ['utrium_bar', 'lemergium_bar', 'zynthium_bar', 'keanium_bar', 'oxidant', 'reductant', 'purifier']
}

global.commodityFlowTable = function () {
    return {
        'shard3': {
            'cell': {'E11S47': 2, 'E1S41': 1},
            'phlegm': {'E1S41': 10, 'E1S49': 3},
            'tissue': {'E1S49': 1}
        }
    }
}

global.roomNeedMatForFac = function () {
    return {
        'shard3': {
            'E11S47': {'L': false},
            'E1S41': {'zynthium_bar': 'E1S49'},
            'E1S49': {'reductant': 'E1S41'}
        }
    }
}

global.runFactory = function (rn) {
    let r = Game.rooms[rn];
    if (r.controller.level==8 || (r.memory.mineralMining&&r.memory.mineralThresholds.currentMineralStats.energy>350000&&r.memory.mineralThresholds.currentMineralStats[r.memory.mineralMining]>10000)) {
        let f = r.find(FIND_MY_STRUCTURES, {filter: s=>s.structureType==STRUCTURE_FACTORY});
        if (f.length>0) {
            f = f[0];
            if (f.store.getFreeCapacity('energy')<10000) { // emergency full move out
                addResFlowTask(r.name, f.id, r.storage.id, 'energy', f.store['energy'], true);
                return
            }
            else {
                whatComToProduce(r, f);
            }
        }
    }
    else if (r.controller.level==7) {
        let f = r.find(FIND_MY_STRUCTURES, {filter: s=>s.structureType==STRUCTURE_FACTORY});
        if (f.length>0) {
            f = f[0];
            if (f.cooldown == 0) {
                let term = r.terminal;
                let stor = r.storage;
                // manage res flow
                if (f.store.battery<1000) {
                    let whereTo = getATypeOfRes(r, 'battery');
                    if (whereTo == undefined) {
                        //fo(r.name + ' run out of battery');
                        return
                    }
                    else {
                        addResFlowTask(r.name, whereTo.id, f.id, 'battery', Math.min(1000-f.store['battery'], whereTo.store['battery']), true);
                    }
                }
                for (let res in f.store) {
                    if (res != 'energy') {
                        if (f.store[res]<1000) {
                            addResFlowTask(r.name, term.id, f.id, res, Math.min(1000-f.store[res], term.store[res]));
                        }
                        else {
                            addResFlowTask(r.name, f.id, term.id, res, f.store[res]-1000);
                        }
                    }
                    else { // energy
                        if (f.store.energy<10000) {
                            let whereTo = getATypeOfRes(r, res);
                            addResFlowTask(r.name, whereTo.id, f.id, 'energy', Math.min(whereTo.store['energy'], 10000-f.store.energy));
                        }
                        else if (f.store.energy>20000) {
                            if (term.store.getFreeCapacity('energy')>20000) {
                                addResFlowTask(r.name, f.id, term.id, 'energy', Math.min(term.store.getFreeCapacity('energy'), -20000+f.store.energy), true);
                            }
                            else {
                                addResFlowTask(r.name, f.id, stor.id, 'energy', Math.min(term.store.getFreeCapacity('energy'), -20000+f.store.energy), true);
                            }
                        }
                    }
                }
                // run production
                f.produce('energy');
            }
        }
    }
}

let whatComToProduce = function (r, f) {
    if (r.memory.mineralThresholds.currentMineralStats.energy<150000 && r.memory.mineralThresholds.currentMineralStats.battery>0) { // if room low in energy, unpack battery
        if (f.store.energy>20000) {
            addResFlowTask(r.name, f.id, r.storage.id, 'energy', Math.min(-20000+f.store['energy'], r.storage.store.getFreeCapacity('energy')), true);
        }
        if (f.store.battery<1000) {
            let whereTo = getATypeOfRes(r, 'battery');
            if (whereTo == undefined) {
                fo(r.name + ' run out of battery');
                return
            }
            else {
                addResFlowTask(r.name, whereTo.id, f.id, 'battery', Math.min(1000-f.store['battery'], whereTo.store['battery']), true);
            }
        }
        f.produce('energy');
        return
    }
    let fobj = r.memory.fobj;
    if (fobj) {
        if (checkFobjStillValid(r, f)) {
            // run
        }
        else {
            pickNewFobj(r, f);
        }
    }
    else {
        pickNewFobj(r, f);
    }
    
}

let checkFobjStillValid = function (r, f) {
    let fobj = r.memory.fobj;
    if (fobj.tnext<Game.time) {
        return false
    }
    else {
        if (f.cooldown==0) {
            let toProd = fobj.toProd;
            if (toProd!=undefined) {
                let pres = f.produce(toProd);
                let resins = r.memory.fobj.ins;
                if (pres==-6 || pres==OK) {
                    // -6 not enough
                    for (let resin of resins) {
                        if (f.store[resin]<COMMODITIES[toProd].components[resin]*2) {
                            let whereTo = getATypeOfRes(r, resin);
                            addResFlowTask(r.name, whereTo.id, f.id, resin, Math.min(COMMODITIES[toProd].components[resin]*3, whereTo.store[resin]), true);
                        }
                    }
                    //r.memory.fobj.tnext += r.memory.fobj.cd;
                }
                
                if (pres!=OK && r.memory.mineralThresholds.currentMineralStats.energy>200000) {
                    if (f.store.energy<20000) {
                        let whereTo = getATypeOfRes(r, 'energy');
                        addResFlowTask(r.name, whereTo.id, f.id, 'energy', Math.min(20000-f.store.energy, whereTo.store['energy']), true);
                    }
                    if (r.controller.level==8) {
                        f.produce('battery');
                    }
                }
                
                // move out unrelated product
                for (let out in f.store) {
                    if (!resins.includes(out)) {
                        addResFlowTask(r.name, f.id, r.terminal.id, out, f.store[out], true);
                    }
                }
            }
            else if (r.controller.level==8) { // no mats for fac, do battery
                // basic energy level
                if (f.store.energy<20000) {
                    let whereTo = getATypeOfRes(r, 'energy');
                    addResFlowTask(r.name, whereTo.id, f.id, 'energy', Math.min(20000-f.store.energy, whereTo.store['energy']), true);
                }
                else {
                    addResFlowTask(r.name, f.id, r.storage.id, 'energy', Math.min(-20000+f.store.energy, r.storage.store.getFreeCapacity['energy']), true);
                }
                // if room energy overwhelm, do battery 
                if (r.memory.mineralThresholds.currentMineralStats.energy>200000) {
                    if (f.store.battery>0) {
                        addResFlowTask(r.name, f.id, r.storage.id, 'battery', f.store['battery'], true);
                    }
                    f.produce('battery');
                }
            }
        }
        return true
    }
}

let createCommoList = function () {
    //list.sort((a, b) => (a.color > b.color) ? 1 : -1)
    //fo(JSON.stringify(COMMODITIES.sort((a, b) => (a.level > b.level) ? 1 : -1)))
}

global.sendSemifinishedCommoditiesToOtherRooms = function (r) {
    let sendlist = commodityFlowTable()[Game.shard.name];
    for (let commo in sendlist) {
        if (r.memory.mineralThresholds.currentMineralStats[toshop]>0) {
            let sendinfo = sendlist[commo];
            if (Object.keys(sendinfo).includes(r.name)) {
                // pass, dont send to self
            }
            else {
                if (r.storage.store[commo]>0) {
                    addResFlowTask(r.name, r.storage.id, r.terminal.id, commo, r.storage.store[commo], true);
                }
                if (r.terminal.store[commo]>0) {
                    addResFlowTask(r.name, r.storage.id, r.terminal.id, commo, r.storage.store[commo], true);
                }
            }
        }
    }
}

global.shoppingRawMaterialsForCommodity = function (r) {
    // shop for unharvestable raw mineral or transfer mats (non commodity) between rooms
    let shopList = roomNeedMatForFac()[Game.shard.name];
    if (shopList) {
        shopList = shopList[r.name];
        if (shopList) {
            for (let toshop in shopList) {
                if (r.memory.mineralThresholds.currentMineralStats[toshop]<10000) {
                    let from = shopList[toshop];
                    if (from) { // we can produce
                        let fromR = Game.rooms[from];
                        if (fromR.terminal.cooldown==0 && fromR.terminal.store[toshop]>0) {
                            fromR.terminal.send(toshop, fromR.terminal.store[toshop], r.name);
                        }
                        else {
                            if (fromR.storage.store[toshop]>0) {
                                addResFlowTask(from, fromR.storage.id, fromR.terminal.id, toshop, Math.max(10000,fromR.storage.store[toshop]), true);
                            }
                        }
                        fo(r.name + ' needs ' + toshop + ' from ' + from);
                    }
                    else { // buy from market
                        if (r.memory.mineralThresholds.currentMineralStats[toshop]<10000) {
                            let amt = Math.max(0, 10000-r.memory.mineralThresholds.currentMineralStats[toshop]);
                            fo(r.name + ' shop ' + toshop + amt + ' for commod');
                            checkTradingEnergyCostAndBuy(r.name, toshop, amt);
                        }
                        fo(r.name + ' buy ' + toshop + ' from market');
                    }
                }
            }
        }
    }
    return
    
    let shoppingList = {silicon: ['U'], metal: ['Z'], biomass: ['L'], mist: ['K']};
    for (let prod in shoppingList) {
        if (r.memory.mineralThresholds.currentMineralStats[prod]>1000) {
            for (let raw of shoppingList[prod]) {
                if (r.memory.mineralThresholds.currentMineralStats[raw]<10000) {
                    let amt = Math.max(0, 10000-r.memory.mineralThresholds.currentMineralStats[raw]);
                    fo(r.name + ' shop ' + raw + amt + ' for commod ' + prod);
                    checkTradingEnergyCostAndBuy(r.name, raw, amt);
                }
            }
        }
    }
}

let pickNewFobj = function (r, f) {
    let toProd = undefined;
    let np;
    let cd;
    let lvl;
    
    let thisRoomCommo = r.memory.facCommo;
    if (r.memory.flvl && thisRoomCommo==undefined) {
        //r.memory.facCommo =  ();
    }

    //shoppingRawMaterialsForCommodity(r);
    
    for (let prod in COMMODITIES) {
        if (prod.length>1 && prod != 'energy' && prod != 'battery') {
            np = 100000000;
            let citem = COMMODITIES[prod];
            let proceed = true;
            if (citem.level==undefined || (citem.level == f.level)) {
                if (r.memory.mineralThresholds.currentMineralStats[prod]<10000) {
                    for (let comp in citem.components) {
                        if (r.memory.mineralThresholds.currentMineralStats[comp]<citem.components[comp]) {
                            // not enough in res
                            proceed = false;
                        }
                        else { // one enough, estimated production times
                            np = Math.min(np, r.memory.mineralThresholds.currentMineralStats[comp]/citem.components[comp]);
                        }
                    }
                }
                else { // too much out product
                    proceed = false;
                }
            }
            else { // level not correct
                proceed = false;
            }
            if (proceed) {
                toProd = prod;
                cd = citem.cooldown;
                lvl = citem.level;
                break;
            }
        }
    }
    
    if (toProd) {
        r.memory.fobj = {tchecked: Game.time, tnext: Game.time+Math.floor(np)*cd, cd: cd, toProd: toProd, ins: Object.keys(COMMODITIES[toProd].components), lvl: lvl};
    }
    else {
        r.memory.fobj = {tchecked: Game.time, tnext: Game.time+100};
    }
}