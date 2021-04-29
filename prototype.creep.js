var roles = {
    attacker : require('role.attacker'),
    healer : require('role.healer'),
    harvester : require('role.harvester'),
    miner : require('role.miner'),
    lorry : require('role.lorry'),
    upgrader : require('role.upgrader'),
    builder : require('role.builder'),
    repairer : require('role.repairer'),
    wallRepairer : require('role.wallRepairer'),
    longDistanceHarvester : require('role.longDistanceHarvester'),
    longDistanceLorry : require('role.longDistanceLorry'),
    longDistanceBuilder : require('role.longDistanceBuilder'),
    reserver : require('role.reserver'),
    claimer : require('role.claimer'),
    pickuper : require('role.pickuper'),
    scouter : require('role.scouter'),
    teezer : require('role.teezer'),
    rampartRepairer : require('role.rampartRepairer'),
    begger : require('role.begger'),
    longDistanceUpgrader : require('role.longDistanceUpgrader'),
    controllerAttacker : require('role.controllerAttacker'),
    dismantler: require('role.dismantler'),
    linkKeeper: require('role.linkKeeper'),
    traveller: require('role.traveller'),
    transporter: require('role.transporter'),
    antiTransporter: require('role.antiTransporter'),
    pioneer: require('role.pioneer'),
    melee: require('role.melee'),
    stealer: require('role.stealer'),
    ranger: require('role.ranger'),
    powerSourceAttacker: require('role.powerSourceAttacker'),
    powerSourceHealer: require('role.powerSourceHealer'),
    powerSourceLorry: require('role.powerSourceLorry'),
    powerSourceRanger: require('role.powerSourceRanger'),
    labber: require('role.labber'),
    superUpgrader: require('role.superUpgrader'),
    keeperLairMeleeKeeper: require('role.keeperLairMeleeKeeper'),
    keeperLairInvaderAttacker: require('role.keeperLairInvaderAttacker'),
    keeperLairInvaderHealer: require('role.keeperLairInvaderHealer'),
    keeperLairLorry: require('role.keeperLairLorry'),
    captain: require('role.captain'),
    firstMate: require('role.firstMate'),
    crew: require('role.crew'),
    nothinger: require('role.nothinger'),
    ultimateWorrior: require('role.ultimateWorrior'),
    ultimateUpgrader: require('role.ultimateUpgrader'),
    oneWayInterSharder: require('role.oneWayInterSharder'),
    wanderer: require('role.wanderer'),
    portalTransporter: require('role.portalTransporter'),
    twoWayInterSharder: require('role.twoWayInterSharder'),
    scientist: require('role.scientist'),
    wanker: require('role.wanker'),
    shooter: require('role.shooter'),
    onlyMineralDefender: require('role.onlyMineralDefender'),
    onlyMineralMiner: require('role.onlyMineralMiner'),
    onlyMineralHauler: require('role.onlyMineralHauler'),
    redneck: require('role.redneck'),
    mover: require('role.mover'),
    kiter: require('role.kiter'),
    noLegWorker: require('role.noLegWorker'),
};

Creep.prototype.runRole = function () {
    //roles[this.memory.role].run(this);
    try {
        roles[this.memory.role].run(this);
    }
    catch(err) {
        unpackCreepMemory(this.name);
        console.log('error: role name fault: '+this.memory.role+this.pos);
    }
};

Creep.prototype.smartHeal = function (anotherCreep) {
    let ditance = this.pos.getRangeTo(anotherCreep);
    if (distance <= 1) {
        this.heal(anotherCreep);
    }
    else {
        this.rangedHeal(anotherCreep);
    }
}

Creep.prototype.trackDeadTaskTimer = function () {
    if (this.memory.timer == undefined) { // timer structure defined
        this.memory.timer = {};
    }
    
    // tick the clock
    if (this.memory.moveTaskId) { // if has move task on going
        if (this.memory.timer == undefined) { // check if timer logged this
            this.memory.timer[this.memory.moveTaskId] = 1; // initiate
        }
        else { // if has timer
            if (this.memory.timer[this.memory.moveTaskId]) { // if same task id
                this.memory.timer[this.memory.moveTaskId]++; // track time spent on this id
            }
            else { // on different task now
                this.memory.timer = {} // restart counting
                this.memory.timer[this.memory.moveTaskId] = 1 // initiate new timer
            }
        }
        
        // check clock and remove contract if too long
        if (this.memory.timer[this.memory.moveTaskId]>103) { // even if going from one end to another end won't take this long
            let taskId = this.memory.moveTaskId
            this.room.memory.taskMove.contracts[taskId] = undefined;
            this.memory.moveTaskId = undefined;
        }
        
        // remove possible duplicated task
        let myContract = this.room.memory.taskMove.contracts[this.memory.moveTaskId];
        if (myContract != undefined) {
            for (let contractId in this.room.memory.taskMove.contracts) {
                let contract = this.room.memory.taskMove.contracts[contractId]
                if ( (contract.offerName == myContract.offerName) && (contractId !== this.memory.moveTaskId) ) { // different contract id but same offer, bad contract remove
                    this.room.memory.taskMove.contracts[contractId] = undefined;
                    this.memory.moveTaskId = undefined;
                }
            }
        }
    }
}

Creep.prototype.moveToWhenNeverTar = function (posis) {
    let r = this.room;
    let dist = this.pos.getRangeTo(posis.x, posis.y)
    if (dist !== 1) {
        this.moveTo(posis);
    }
    else {
        let myArounds = returnALLAvailableNoStructureCreepLandCoords(r, this.pos);
        let tarArounds = returnALLAvailableNoStructureCreepLandCoords(r, posis);
        let common = []
        for (let p of myArounds) {
            if (tarArounds.includes(p)) {
                common = p;
                break;
            }
        }
        this.move(this.pos.getDirectionTo(common));
    }
}

Creep.prototype.moveToAvoidAllOtherCreeps = function (posis) {
    let r = this.room;
    let roomName = r.name;
    let goals = { pos: posis, range: 0 };

    let ret = PathFinder.search(
        this.pos, goals,
        {
            // We need to set the defaults costs higher so that we
            // can set the road cost lower in `roomCallback`
            plainCost: 1,
            swampCost: 3,
            maxOps: 5,

            roomCallback: function (roomName) {

                let room = Game.rooms[roomName];
                // In this example `room` will always exist, but since 
                // PathFinder supports searches which span multiple rooms 
                // you should be careful!
                if (!room) return;
                let costs = new PathFinder.CostMatrix;
                
                let terrain = Game.map.getRoomTerrain(roomName);
                
                for (let i = 0; i < 50; i++) {
                    for (let j = 0; j < 50; j++) {
                        if ((terrain.get(i, j) == TERRAIN_MASK_WALL)) {
                            costs.set(i, j, 0xff);
                        }
                    }
                }
                room.find(FIND_STRUCTURES).forEach(function (struct) {
                    if (struct.structureType === STRUCTURE_ROAD) {
                        // Favor roads over plain tiles
                        costs.set(struct.pos.x, struct.pos.y, 1);
                    } else if (struct.structureType !== STRUCTURE_CONTAINER &&
                        (struct.structureType !== STRUCTURE_RAMPART ||
                            !struct.my)) {
                        // Can't walk through non-walkable buildings
                        costs.set(struct.pos.x, struct.pos.y, 0xff);
                    }
                });

                // Avoid creeps in the room
                room.find(FIND_CREEPS).forEach(function (creep) {
                    if (this.name !== creep.name) {
                        costs.set(creep.pos.x, creep.pos.y, 0xff);
                    }
                });

                return costs;
            },
        }
    );
    let path = ret.path;
    /*for (let p = 0; p < path.length - 1; p++) {
        Game.rooms[path[0].roomName].visual.line(convertPosToRoompos(path[p]), convertPosToRoompos(path[p + 1]), { color: 'while', lineStyle: 'dashed' });
    }*/
    let pos = path[0];
    this.move(this.pos.getDirectionTo(pos));
}
