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