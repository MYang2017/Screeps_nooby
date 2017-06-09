StructureTower.prototype.defend = function () {
    // find any damaged attackers
    var target = this.pos.findClosestByRange(FIND_MY_CREEPS, { filter: (s) => ( (s.hits < s.hitsMax)&&(s.getActiveBodyparts(ATTACK)>0) ) } );
    if (target == undefined) { // if cannot find attacker, find civilians
      target = this.pos.findClosestByRange(FIND_MY_CREEPS, { filter: (s) => (s.hits < s.hitsMax/2) } );
    }
    if (target != undefined) { // if found damaged creeps
      this.heal(target);
    }
    else { // cannot find any damaged creeps, find enemies!
      target = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter: s => (!allyList().includes(s.owner))&&(s.getActiveBodyparts(HEAL) > 0)}); // find heal first
      if (target == undefined) { // if cannot find healer, find hostile creeps
          target = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter: s => (!allyList().includes(s.owner))});
          if (target == undefined) { // no enemies, keep healing the rest damaged creeps
            target = this.pos.findClosestByRange(FIND_MY_CREEPS, { filter: (s) => (s.hits < s.hitsMax) } );
            if (target != undefined) { // if found damaged creeps
              this.heal(target);
            }
          }
      }
      if (target != undefined) { // found enemies!
          this.attack(target);
      }
      /*target = this.pos.findClosestByRange(FIND_MY_CREEPS, { filter: (s) => (s.hits < s.hitsMax) } );
      if (target != undefined) { // if found damaged creeps
        this.heal(target);
      }*/
    }
};

StructureTower.prototype.repairNoneWalls = function () {
    if (this.energy>0.5*this.energyCapacity) {
        var structure = this.room.find(FIND_STRUCTURES, { filter: (s) => (s.structureType != STRUCTURE_ROAD && s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART) && (s.hits<0.9*s.hitsMax) })[0];
        if (structure == undefined) {
            structure = this.room.find(FIND_STRUCTURES, { filter: (s) => s.hits < s.hitsMax && s.structureType == STRUCTURE_ROAD})[0];
        }
        if (structure != undefined) {
            this.repair(structure);
        }
    }
};
