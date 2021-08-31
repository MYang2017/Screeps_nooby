StructureTower.prototype.defend = function () {
    if (this.room.memory.battleMode) {
        let toheal=this.room.find(FIND_MY_CREEPS, {filter:c=>c.hits<c.hitsMax});
        if (toheal.length>0) {
            this.heal(toheal[0]);
            return
        }
        toheal=this.room.find(FIND_MY_POWER_CREEPS, {filter:c=>c.hits<c.hitsMax});
        if (toheal.length>0) {
            this.heal(toheal[0]);
            return
        }
        let mreds = this.room.find(FIND_MY_CREEPS, {filter: r=>(r.memory.role=='redneck'||r.memory.role=='gays')&&r.memory.focusId});
        if (mreds.length>0) {
            if (mreds[0].memory.focusId && Game.getObjectById(mreds[0].memory.focusId) && true) { // <<<<< damage will do damage
                this.attack(Game.getObjectById(mreds[0].memory.focusId));
                return
            }
        }
        let rpts = this.room.find(FIND_STRUCTURES, {filter:t=>t.pos.findInRange(FIND_HOSTILE_CREEPS, 3).length>0&&(t.structureType==STRUCTURE_RAMPART || t.structureType==STRUCTURE_WALL)});
        let lowest = 10000000000000;
        let torep;
        for (let rp of rpts) {
            if (rp.hits<lowest) {
                torep = rp;
                lowest = rp.hits;
            }
        }
        if (torep) {
            this.repair(torep);
            return
        }
    }
    // always prioritise pc
    let toheal=this.room.find(FIND_MY_POWER_CREEPS, {filter:c=>c.hits<c.hitsMax});
    if (toheal.length>0) {
        this.heal(toheal[0]);
        return
    }
    // find any damaged attackers
    var target;
    if (this.room.find(FIND_HOSTILE_CREEPS, {filter:c=>!allyList().includes(c.owner.username)&&c.pos.findInRange(FIND_MY_CREEPS, 5).length>0 || c.pos.findInRange(FIND_MY_POWER_CREEPS, 5).length>0}).length==0) {
        target = this.pos.findClosestByRange(FIND_MY_CREEPS, { filter: (s) => ( (s.hits < s.hitsMax)&&(s.getActiveBodyparts(ATTACK)+s.getActiveBodyparts(HEAL)+s.getActiveBodyparts(RANGED_ATTACK)>0) ) } );
        if (target == undefined) { // if cannot find attacker, find civilians
            target = this.pos.findClosestByRange(FIND_MY_POWER_CREEPS, { filter: (s) => (s.hits < s.hitsMax/5*4) } );
            if (target == undefined) { // if cannot find attacker, find civilians
                target = this.pos.findClosestByRange(FIND_MY_CREEPS, { filter: (s) => (s.hits < s.hitsMax/2) } );
            }
        }
        if (target == undefined) { // if cannot find attacker, find civilians
            target = this.pos.findClosestByRange(FIND_MY_POWER_CREEPS, { filter: (s) => (s.hits < s.hitsMax) } );
            if (target == undefined) { // if cannot find attacker, find civilians
                target = this.pos.findClosestByRange(FIND_MY_CREEPS, { filter: (s) => (s.hits < s.hitsMax) } );
            }
        }
        if (target != undefined) { // if found damaged creeps
            this.heal(target);
        }
        else {
            let mreds = this.room.find(FIND_MY_CREEPS, {filter: r=>(r.memory.role=='redneck'||r.memory.role=='gays')&&r.memory.focusId});
            if (mreds.length>0) {
                if (mreds[0].memory.focusId && Game.getObjectById(mreds[0].memory.focusId) && true) { // <<<<< damage will do damage
                    this.attack(Game.getObjectById(mreds[0].memory.focusId));
                    return
                }
            }
            target = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
                filter: s => (
                    !allyList().includes(s.owner.username) && s.pos.getRangeTo(this)<15 
                )
            });
            if (target != undefined) { // found enemies!
                this.attack(target);
            }
        }
    }
    else { // cannot find any damaged creeps, find enemies!
        //target = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter: s => (!allyList().includes(s.owner))&&(s.getActiveBodyparts(HEAL) > 0)}); // find heal first
        if (this.room.memory.isUnderFucked && this.room.memory.isUnderFucked == true) {
            target = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
                filter: s => (
                    !allyList().includes(s.owner.username) 
                    && (s.getActiveBodyparts(HEAL)+s.getActiveBodyparts(ATTACK)+s.getActiveBodyparts(RANGED_ATTACK)+s.getActiveBodyparts(WORK)+s.getActiveBodyparts(CLAIM)>0) // season 2 special
                )
            });
            if (target == undefined) {
                target = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
                    filter: s => (
                        !allyList().includes(s.owner.username) 
                    )
                });
            }
            
            if (target == undefined) { // no enemies, keep healing the rest damaged creeps
                target = this.pos.findClosestByRange(FIND_MY_CREEPS, { filter: (s) => (s.hits < s.hitsMax) });
                if (target != undefined) { // if found damaged creeps
                    this.heal(target);
                    return
                }
                this.room.memory.isUnderFucked = false;
            }

            if (target != undefined) { // found enemies!
                if (target.owner.username!='JavaXCrow') {
                    if (target.pos.findInRange(FIND_MY_CREEPS, 3).length>0 || target.pos.findInRange(FIND_MY_STRUCTURES, 1).length>0) {
                        this.attack(target);
                    }
                    else {
                        this.attack(target);
                    }
                }
            }
        }
        else {
            target = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
                filter: s => (
                    (s.owner.username=='Invader') || 
                    ((!allyList().includes(s.owner.username)) &&
                    (s.getActiveBodyparts(HEAL)+s.getActiveBodyparts(ATTACK)+s.getActiveBodyparts(RANGED_ATTACK)+s.getActiveBodyparts(WORK)+s.getActiveBodyparts(CLAIM)>0) && // season 2 special
                    s.pos.getRangeTo(s.pos.findClosestByRange(FIND_MY_CREEPS)) < 4)
                )
            });
            
            if (target == undefined) {
                target = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
                    filter: s => (
                        !allyList().includes(s.owner.username) 
                    )
                });
            }

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
    let inter = 6;
    if (room.controller && room.controller.level<=6) {
        inter = 3;
    }
    if (Math.floor(Math.random() * inter) == 0) {
        if (this.store.energy>0.5*this.store.getCapacity('energy')) {
            if ( this.room.find(FIND_MY_CREEPS, {filter: (s) => (s.memory.role == 'loader' || s.memory.role == 'pickuper' || s.memory.role == 'lorry'|| s.memory.role == 'maintainer')}).length >= 1 ) {
                if (room.memory.toRepairId) {
                    let structure = Game.getObjectById(room.memory.toRepairId);
                    if (structure) { // if structure is defined
                        if (structure.hits < 0.5*structure.hitsMax) {
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
    }
};
