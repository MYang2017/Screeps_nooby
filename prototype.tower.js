StructureTower.prototype.defend = function () {
    // find any damaged attackers
    var target = this.pos.findClosestByRange(FIND_MY_CREEPS, { filter: (s) => ( (s.hits < s.hitsMax)&&(s.getActiveBodyparts(ATTACK)>0) ) } );
    if (target == undefined) { // if cannot find attacker, find civilians
      target = this.pos.findClosestByRange(FIND_MY_CREEPS, { filter: (s) => (s.hits < s.hitsMax) } );
    }
    if (target != undefined) { // if found damaged creeps
      this.heal(target);
    }
    else { // cannot find any damaged creeps, find enemies!
      target = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter: s => (!allyList().includes(s.owner))&&(s.getActiveBodyparts(HEAL) > 0)}); // find heal first
      if (target == undefined) { // if cannot find healer, find hostile creeps
          target = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter: s => (!allyList().includes(s.owner))});
      }
      if (target != undefined) { // found enemies!
          this.attack(target);
      }
    }
};
