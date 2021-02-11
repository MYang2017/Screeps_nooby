StructureTower.prototype.defend = function () {
    // find any damaged attackers
    var target = this.pos.findClosestByRange(FIND_MY_CREEPS, { filter: (s) => ( (s.hits < s.hitsMax)&&(s.getActiveBodyparts(ATTACK)>0) ) } );
    if (target == undefined) { // if cannot find attacker, find civilians
      target = this.pos.findClosestByRange(FIND_MY_CREEPS, { filter: (s) => (s.hits < s.hitsMax/2) } );
    }
    if (target != undefined) { // if found damaged creeps
        this.heal(target);
        return
    }
    else { // cannot find any damaged creeps, find enemies!
        //target = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter: s => (!allyList().includes(s.owner))&&(s.getActiveBodyparts(HEAL) > 0)}); // find heal first
        if (this.room.memory.isUnderFucked && this.room.memory.isUnderFucked == true) {
            target = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
                filter: s => (
                    !allyList().includes(s.owner.username)
                )
            });
            if (target == undefined) { // no enemies, keep healing the rest damaged creeps
                target = this.pos.findClosestByRange(FIND_MY_CREEPS, { filter: (s) => (s.hits < s.hitsMax) });
                if (target != undefined) { // if found damaged creeps
                    this.heal(target);
                    return
                }
                this.room.memory.isUnderFucked = false;
            }

            if (target != undefined) { // found enemies!
                this.room.memory.isUnderFucked = true;
                this.attack(target);
            }
        }
        else {
            target = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
                filter: s => (
                    !allyList().includes(s.owner.username) &&
                    s.pos.getRangeTo(s.pos.findClosestByRange(FIND_MY_CREEPS)) < 4
                )
            });

            if (target == undefined) { // no enemies, keep healing the rest damaged creeps
                target = this.pos.findClosestByRange(FIND_MY_CREEPS, { filter: (s) => (s.hits < s.hitsMax) });
                if (target != undefined) { // if found damaged creeps
                    this.heal(target);
                    return
                }
            }

            if (target != undefined) { // found enemies!
                this.room.memory.isUnderFucked = true;
                this.attack(target);
            }
        }
    }
};

StructureTower.prototype.repairNoneWalls = function(room) {
    if (this.energy>0.5*this.energyCapacity) {
        if ( room.find(FIND_MY_CREEPS, {filter: (s) => (s.memory.role == 'miner' || s.memory.role == 'pickuper' || s.memory.role == 'lorry' || s.memory.role == 'scientist')}).length > 1 ) {
            if (room.memory.toRepairId) {
                let structure = Game.getObjectById(room.memory.toRepairId);
                if (structure) { // if structure is defined
                    if (structure.hits < 0.95*structure.hitsMax) {
                        this.repair(structure);
                    }
                    else { //if ( Game.time%10 == 0) { // if structure is healthy, find another to repair
                        cacheContainerOrRoadToBuild(room,0.777,0.618);
                    }
                }
                else { // stored structure is no longer exist (destroyed or removed), find a new one
                    cacheContainerOrRoadToBuild(room,0.777,0.618);
                }
            }
            else { // no repair ID cached yet, cache road or container ID to repaire
                cacheContainerOrRoadToBuild(room,0.777,0.618);
            }
        }
    }
};
