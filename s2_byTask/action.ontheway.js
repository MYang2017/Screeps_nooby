module.exports = {
    run: function(creep) {
        let drops = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 1);
        if (drops.length>0) {
            creep.pickup(drops[0]);
            return true
        }
        else {
            let tombs = creep.pos.findInRange(FIND_TOMBSTONES, 1);
            if (tombs.length>0) {
                for (let tp in tombs[0]) {
                    if (tp=='energy') {
                        creep.withdraw(tombs[0], tp);
                        return true
                    }
                }
            }
        }
    }
};