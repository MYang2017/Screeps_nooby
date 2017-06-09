var actionRepair = require('action.repair');

module.exports = {
    run: function(creep) {
        var constructionSite = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES)
        if (constructionSite != undefined) {
            //console.log(creep.build(constructionSite));
            if (creep.build(constructionSite) == ERR_NOT_IN_RANGE) {
                creep.travelTo(constructionSite);
                //creep.build(constructionSite);
            }
        }
        else {
            actionRepair.run(creep);
        }
    }
};
