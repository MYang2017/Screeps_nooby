module.exports = {
    run: function(creep, other=false) {
        let drops = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 1, {filter: d=>d.resourceType=='energy'});
        if (drops.length>0) {
            creep.pickup(drops[0]);
            return true
        }
        else {
            let tombs = creep.pos.findInRange(FIND_TOMBSTONES, 1, {filter: t=>t.store.energy>0});
            if (tombs.length>0) {
                for (let tp in tombs[0].store) {
                    if (tp=='energy') {
                        creep.withdraw(tombs[0], tp);
                        return true
                    }
                }
            }
        }
    }
};