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
};

Creep.prototype.runRole = function () {
    //roles[this.memory.role].run(this);
    try {
        roles[this.memory.role].run(this);
    }
    catch(err) {
        //unpackCreepMemory(this.name);
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
