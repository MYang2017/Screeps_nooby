global.checkNuker = function (r) {
    if (Game.time%100==0) {
        let nuker = r.find(FIND_NUKES);
        let tofix = whichWorRtoRepairUnderNuke(r);
        if (nuker.length>0 && tofix) {
            r.memory.nuked = true;
        }
        else {
            r.memory.nuked = false;
        }
    }
}

global.whichWorRtoRepairUnderNuke = function(r) {
    let nukes = r.find(FIND_NUKES);
    if (nukes.length>0) {
        for (let nuke of nukes) {
            let ss = r.lookForAt(LOOK_STRUCTURES, nuke.pos.x, nuke.pos.y);
            for (let s of ss) {
                if (s.structureType==STRUCTURE_RAMPART && s.hits<666000) {
                    return s.id
                }
            }
            ss = r.lookForAtArea(LOOK_STRUCTURES, nuke.pos.y-3, nuke.pos.x-3, nuke.pos.y+3, nuke.pos.x+3, true);
            for (let s of ss) {
                if (s.structure && s.structure.structureType==STRUCTURE_RAMPART && s.structure.hits<5100000) {
                    return s.structure.id
                }
            }
        }
    }
    
    let rampwallhitfac = function (r, t) {
        if (r.memory.attackedPoint) {
            let x = r.memory.attackedPoint.x;
            let y = r.memory.attackedPoint.y;
            let dist = t.pos.getRangeTo(x, y)+1;
            if (dist<4) {
                return 1
            }
            else if (dist<6) {
                return 0.5
            }
            else if (dist<9) {
                return 0.2
            }
            else {
                return 0.1
            }
            return 
        }
        else {
            return 1
        }
    }
    let low = r.find(FIND_STRUCTURES, {filter: t=> (t.structureType==STRUCTURE_WALL||t.structureType==STRUCTURE_RAMPART)&&(t.hits<26000)});
    if (low.length>0) {
        return low[0].id;
    }
    else {
        if (r.memory.battleMode && Math.random()<0.15) {
            for (let ev of r.getEventLog()) {
                if (ev.event==EVENT_ATTACK && ev.data && ev.data.targetId && Game.getObjectById(ev.data.targetId) && (Game.getObjectById(ev.data.targetId).structureType==STRUCTURE_RAMPART || Game.getObjectById(ev.data.targetId).structureType==STRUCTURE_WALL)) {
                    r.memory.attackedPoint = {x: Game.getObjectById(ev.data.targetId).pos.x, y: Game.getObjectById(ev.data.targetId).pos.y};
                    break;
                }
            }
        }
        low = r.find(FIND_STRUCTURES, {filter: t=> (t.structureType==STRUCTURE_WALL||t.structureType==STRUCTURE_RAMPART)&&(t.hits<66000*rampwallhitfac(r, t))});
        if (low.length>0) {
            return low[0].id;
        }
        else {
            low = r.find(FIND_STRUCTURES, {filter: t=> (t.structureType==STRUCTURE_WALL||t.structureType==STRUCTURE_RAMPART)&&(t.hits<166000*rampwallhitfac(r, t))});
            if (low.length>0) {
                return low[0].id;
            }
            else {
                low = r.find(FIND_STRUCTURES, {filter: t=> (t.structureType==STRUCTURE_WALL||t.structureType==STRUCTURE_RAMPART)&&(t.hits<266000*rampwallhitfac(r, t))});
                if (low.length>0) {
                    return low[0].id;
                }
                else {
                    low = r.find(FIND_STRUCTURES, {filter: t=> (t.structureType==STRUCTURE_WALL||t.structureType==STRUCTURE_RAMPART)&&(t.hits<1000000*rampwallhitfac(r, t))});
                    if (low.length>0) {
                        return low[0].id;
                    }
                    else {
                        low = r.find(FIND_STRUCTURES, {filter: t=> (t.structureType==STRUCTURE_WALL||t.structureType==STRUCTURE_RAMPART)&& (t.pos.x<=2 || t.pos.x>=47 || t.pos.y<=2 || t.pos.y>=47) && (t.hits<5000000*rampwallhitfac(r, t))});
                        if (low.length>0) {
                            return low[0].id;
                        }
                        else {
                            low = r.find(FIND_STRUCTURES, {filter: t=> (t.structureType==STRUCTURE_WALL||t.structureType==STRUCTURE_RAMPART)&&(t.hits<2000000*rampwallhitfac(r, t))});
                            if (low.length>0) {
                                return low[0].id;
                            }
                            else {
                                low = r.find(FIND_STRUCTURES, {filter: t=> (t.structureType==STRUCTURE_WALL||t.structureType==STRUCTURE_RAMPART)&&(t.hits<4000000*rampwallhitfac(r, t))});
                                if (low.length>0) {
                                    return low[0].id;
                                }
                                else {
                                    low = r.find(FIND_STRUCTURES, {filter: t=> (t.structureType==STRUCTURE_WALL||t.structureType==STRUCTURE_RAMPART)&&(t.hits<5000000*rampwallhitfac(r, t))});
                                    if (low.length>0) {
                                        return low[0].id;
                                    }
                                    else {
                                        low = r.find(FIND_STRUCTURES, {filter: t=> (t.structureType==STRUCTURE_WALL||t.structureType==STRUCTURE_RAMPART)&&(t.hits<7000000*rampwallhitfac(r, t))});
                                        if (low.length>0) {
                                            return low[0].id;
                                        }
                                        else {
                                            low = r.find(FIND_STRUCTURES, {filter: t=> (t.structureType==STRUCTURE_WALL||t.structureType==STRUCTURE_RAMPART)&&(t.hits<10000000*rampwallhitfac(r, t))});
                                            if (low.length>0) {
                                                return low[0].id;
                                            }
                                            else {
                                                low = r.find(FIND_STRUCTURES, {filter: t=> (t.structureType==STRUCTURE_WALL||t.structureType==STRUCTURE_RAMPART)&&(t.hits<20000000*rampwallhitfac(r, t))});
                                                if (low.length>0) {
                                                    return low[0].id;
                                                }
                                                else {
                                                    return undefined
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}