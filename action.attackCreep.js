var actionRunAway = require('action.flee');

module.exports = {
    run: function(creep) {
        if (creep.hits < creep.hitsMax) { // self-healing if damaged
            creep.heal(creep);
        }
        let nearEnemies = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 8, {filter: s => !allyList().includes(s.owner)});
        if (nearEnemies.length > 2) { // if to many enemies around, kite
            let enemy = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter: s => !allyList().includes(s.owner)} );
            creep.rangedAttack(enemy);
            creep.attack(enemy);
            actionRunAway.run(creep);
        }
        else {
            var enemies = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 1, {filter: s => !allyList().includes(s.owner)});
            if (enemies.length) {
                enemies.sort(function (a, b) { // find the creep with lowest health
                    return a.hits - b.hits;
                });
                creep.attack(enemies[0]);
            }
            var enemies = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 3, {filter: s => !allyList().includes(s.owner)});
            if (enemies.length) {
                var massDmg = 0, distanceDmg = {1: 10, 2: 4, 3: 1};
                for (var i in enemies) {
                    var distance = Math.max(Math.abs(enemies[i].pos.x - creep.pos.x), Math.abs(enemies[i].pos.y - creep.pos.y));
                    massDmg += distanceDmg[distance];
                }
                if (massDmg > 13) {
                    creep.rangedMassAttack();
                }
                else {
                    enemies.sort(function (a, b) { return a.hits - b.hits; });
                    creep.rangedAttack(enemies[0]);
                }
            }
            else {
                let toHeal = creep.pos.findClosestByRange(FIND_MY_CREEPS, { filter: (s) => (s.hits < s.hitsMax) } );
                if (toHeal) { // if there is damaged creep, go heal
                    if (creep.heal(toHeal) == ERR_NOT_IN_RANGE) {
                        creep.heal(creep);
                        creep.travelTo(toHeal);
                    }
                }
            }
        }
    }
}
