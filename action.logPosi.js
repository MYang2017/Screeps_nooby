module.exports = {
    run: function(creep) {
        if (creep.memory && creep.memory._trav && creep.memory._trav.state) {
            let prvPosi = creep.memory.prvPosi;
            let currentPosi = creep.pos;
            if (prvPosi) {
                if (prvPosi.x == currentPosi.x && prvPosi.y == currentPosi.y) { // stuck
                    // pass 
                }
                else {
                    creep.memory.prvPosi = currentPosi;
                }
            }
            else {
                creep.memory.prvPosi = currentPosi;
            }
        }
    }
};
