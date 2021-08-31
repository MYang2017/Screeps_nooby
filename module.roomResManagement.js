global.updateRoomResTasks = function (rn) {
    // {fromid: ,toid: ,tp: ,cps: [{id: amount}, {id: amount}], amount:}
    let r = Game.rooms[rn];
    if (!r || !r.my) return false
    if (r.memory.ultimateRoomResManagement == undefined) r.memory.ultimateRoomResManagement={};
    for (let rest of r.memory.ultimateRoomResManagement) {
        let tp = rest.tp;
        // check if task still valid
        // check from valid
        let fromid = rest.fromid;
        let from = Game.getObjectById(fromid);
        if (!fromid || !from) {
            removeElementInArrayByElement(rest, r.memory.ultimateRoomResManagement;
            return false;
        }
        // check to valid
        let toid = rest.toid;
        let to = Game.getObjectById(toid);
        if (!toid || !to) {
            removeElementInArrayByElement(rest, r.memory.ultimateRoomResManagement;
            return false;
        }
        // check to full
        if (to.store.getFreeCapacity(tp)==0) {
            removeElementInArrayByElement(rest, r.memory.ultimateRoomResManagement;
            return false
        }
        // update live creep
        let cps = rest.cps;
        for (let cp of cps) {
            if (Game.getObjectById(cp.id)==null) {
                removeElementInArrayByElement(cp, cps;
            }
        }
    }
    
    // search for new task
    // only lab for now
    if (r.memory.forLab && r.memory.forLab.toCreate) {
        // fill in labs
        let inLabs = r.memory.forLab.inLabs;
        for (let in of inLabs) {
            let inlab = Game.getObjectById(in);
            if (in && inlab) {
                //if (inlab.store.)
            }
            else { // lab gone
                removeElementInArrayByElement(in, inLabs);
                return false
            }
        }
        // empty out labs
        let outLabs = r.memory.forLab.outLabs;
        
    }
}