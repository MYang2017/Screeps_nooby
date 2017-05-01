// https://www.youtube.com/watch?v=BiIDH2Ui8L8&t=294s

require('prototype.spawn');
require('prototype.creep');
require('prototype.tower');
require('myFunctions');
require('funcAlly');
require('myTrading');

module.exports.loop = function () {
    // clear memory
    for (let name in Memory.creeps) {
        if (Game.creeps[name] == undefined) {
            delete Memory.creeps[name];
        }
    }

    // let different creep do its job
    for (let name in Game.creeps) {
        Game.creeps[name].runRole();
    }

    // tower fill energy
    var towers = _.filter( Game.structures, c => c.structureType == STRUCTURE_TOWER );
    for (let tower of towers) {
        tower.defend();
    }

    // spawn creeps
    for (let spawnName in Game.spawns) {
        spawn = Game.spawns[spawnName];
        // link transfer energy first
        let neighbourRoomNames = calculateNeighbourNames(spawn.room.name);
        let remoteRoomIdxs = spawn.memory.remoteRoomIdxs;
        for (let i = 0; i<remoteRoomIdxs.length; i++) {
            let remoteMiningRoomName = neighbourRoomNames[remoteRoomIdxs[i]];
            if ( linkTransfer(spawn,remoteMiningRoomName) ) { // link transfer success, break
              break;
            }
        }

        // claimer creation
        //Game.spawns.Spawn1.memory.claimRoom = 'E90N14';
        //console.log(spawnName);
        spawningCreepName = spawn.spawnCreepsIfNecessary();
    }
};
