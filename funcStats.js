global.showGameStats = function (roleCPU, roleCPU_n, roleNum) {
    new RoomVisual().text(Game.cpu.bucket, 0, 0, {align: 'left'}); 
    
    keysSorted = Object.keys(roleCPU).sort(function(a,b){return -roleCPU[a]+roleCPU[b]});
    
    new RoomVisual().text('tot', 6, 0, {align: 'left'}); 
    new RoomVisual().text('num', 8, 0, {fill: 'transparent', align: 'left', stroke: '#f00'}); 
    new RoomVisual().text('avg', 10, 0, {align: 'left'}); 
    
    // all sum
    let tot = 0;
    for (let id in roleCPU) {
        tot += roleCPU[id];
    }
    new RoomVisual().text('All', 0, 1, {align: 'left'}); 
    new RoomVisual().text(tot.toFixed(1), 6, 1, {align: 'left'}); 
        
    let offset = 2;
    for (let i=0; i<=keysSorted.length-1; i++) {
        new RoomVisual().text(keysSorted[i], 0, i+offset, {align: 'left'}); 
        new RoomVisual().text(roleCPU[keysSorted[i]].toFixed(1), 6, i+offset, {align: 'left'}); 
        new RoomVisual().text(roleNum[keysSorted[i]], 8, i+offset, {align: 'left'}); 
        new RoomVisual().text(roleCPU_n[keysSorted[i]].toFixed(2), 10, i+offset, {align: 'left'}); 

        new RoomVisual().rect(0, i+offset-1+0.3, (roleNum[keysSorted[i]].toFixed(1))/3, 1, {fill: 'transparent', stroke: '#f00'})
        new RoomVisual().rect(0, i+offset-1+0.3, roleCPU[keysSorted[i]].toFixed(1), 1, {opacity: 0.16})
    }
}

global.showUltiMateGameStats = function(tot) {
    keysSorted = Object.keys(tot).sort(function(a,b){return -tot[a]+tot[b]});
    let total = 0;
    for (let k in tot) {
        total += tot[k];
    }
    
    // total
    new RoomVisual().text('total', 47, 0, {align: 'right'}); 
    new RoomVisual().text(total.toFixed(1), 49, 0, {align: 'right'}); 
    
    // break down
    for (let i=0; i<=6; i++) {
        let vPos = i+1;
        new RoomVisual().text(keysSorted[i], 47, vPos, {align: 'right'}); 
        new RoomVisual().text(tot[keysSorted[i]].toFixed(1), 49, vPos, {align: 'right'}); 

        new RoomVisual().rect(49.5-(tot[keysSorted[i]].toFixed(1))/10, vPos-0.6, (tot[keysSorted[i]].toFixed(1))/10, 1, {fill: 'transparent', stroke: '#f00'})
    }
}

global.showPowerStatsS3 = function () {
    let rerun = Memory.s3powerStats && Game.time%50
    
    // power stats
    let powerStats = {};
    let powerEnabled = {};
    if (rerun) {
        for (let rn of Memory.myRoomList[Game.shard.name]) {
            if (Game.rooms[rn].memory.mineralThresholds && Game.rooms[rn].memory.mineralThresholds.currentMineralStats) {
                let p = Game.rooms[rn].memory.mineralThresholds.currentMineralStats.power;
                if (p>=0) {
                    powerStats[rn] = p;
                    if (Game.rooms[rn].memory.powerSpawnId && Game.getObjectById(Game.rooms[rn].memory.powerSpawnId) && Game.getObjectById(Game.rooms[rn].memory.powerSpawnId).effects && Game.getObjectById(Game.rooms[rn].memory.powerSpawnId).effects.length>0 ) {
                        powerEnabled[rn] = true;
                    }
                    else {
                        powerEnabled[rn] = false;
                    }
                }
            }
        }
        Memory.s3powerStats.pStats = powerStats;
        Memory.s3powerStats.powerEnabled = powerEnabled;
    }
    else {
        powerStats = Memory.s3powerStats.pStats;
        powerEnabled = Memory.s3powerStats.powerEnabled;
    }
    
    // sorted key
    let keysSorted = [];
    if (rerun) {
        keysSorted = Object.keys(powerStats).sort(function(a,b){return -powerStats[a]+powerStats[b]});
        Memory.s3powerStats.order = keysSorted;
    }
    else {
        keysSorted = Memory.s3powerStats.order;
    }
    
    // display
    let it = 0;
    for (let rn of keysSorted) {
        let ifP = false;
        if (powerEnabled && powerEnabled[rn]) {
            ifP = true
        }
        if (ifP) {
            new RoomVisual().text(rn, 43, it, {align: 'right', color: '#7f00e0', backgroundPadding: 0.5});
        }
        else {
            if (Memory.s3powerStats.processing && Memory.s3powerStats.processing[rn]) {
                new RoomVisual().text(rn, 43, it, {align: 'right'});
            }
            else {
                new RoomVisual().text(rn, 43, it, {align: 'right', color: '#4159C9'});
            }
        }
        let hoursToProcess = powerStats[rn]/3600;
        new RoomVisual().text(hoursToProcess.toFixed(1), 40, it, {align: 'right'});
        
        // visual energy level as well
        let eink = Game.rooms[rn].memory.mineralThresholds.currentMineralStats.energy/1000;
        new RoomVisual().text(eink.toFixed(0), 38.5, it, {align: 'right', color: 'yellow'});
        it++
    }
    
    // init
    if (Memory.s3powerStats == undefined) {
        Memory.s3powerStats = {};
        Memory.s3powerStats.pStats = powerStats;
        Memory.s3powerStats.order = keysSorted;
        Memory.s3powerStats.powerEnabled = powerEnabled;
    }
}

global.showBoostStats = function() {
    let v = {'heal': 0, 'dism': 0, 'rang': 0, 'attk': 0, 'move': 0};
    let h = {'XLHO2': 0, 'LHO2': 0, 'LO': 0};
    let d = {'XZH2O': 0, 'ZH2O': 0, 'ZH': 0};
    let ra = {'XKHO2': 0, 'KHO2': 0, 'KO': 0};
    let a = {'XUH2O': 0, 'UH2O': 0, 'UH': 0};
    let m = {'XZHO2': 0, 'ZHO2': 0, 'ZO': 0};
    let t = {'XGHO2': 0, 'GHO2': 0, 'GO': 0};
    for (let rn of Memory.myRoomList[Game.shard.name]) {
        let r = Game.rooms[rn];
        if (r && r.memory.mineralThresholds && r.memory.mineralThresholds.currentMineralStats) {
            let ms = r.memory.mineralThresholds.currentMineralStats;
            for (let m in h) {
                h[m] += ms[m];
            }
        }
    }
}

global.showSymPicPosi = function() {
    let s = new Set();
    let des = new Set();
    for (let cn in Game.creeps) {
        let c = Game.creeps[cn];
        if (c && c.memory.role == 'symbolPicker') {
            s.add(c.pos.roomName);
            des.add(c.memory.target);
        }
    }
    
    new RoomVisual().text('pickers', 41, 0, {align: 'left'}); 
    // current location
    let it = 0;
    for (let rn of s) {
        let co = 'white';
        new RoomVisual().text(rn, 41, it+1, {align: 'left', fill: co}); 
        it++;
    }
    
    // destination
    new RoomVisual().text('dst.', 38, 0, {align: 'left'}); 
    it = 0;
    for (let rn of des) {
        let co = 'white';
        new RoomVisual().text(rn, 38, it+1, {align: 'left', fill: co}); 
        it++;
    }
}