var roleBuilder = require('role.builder');
var roleUpgrader = require('role.upgrader')
var roleHarvester = require('role.harvester')
var actionRunAway = require('action.flee');

module.exports = {
    run: function(creep) {
        creep.say('pioneering');
        if (creep.pos.findInRange(FIND_HOSTILE_CREEPS, 4).length > 0) { // self destroy if not useful damages by NPC
            actionRunAway.run(creep)
        }
        else {
            var destination;
            if (creep.memory.target == 'E91N16') {
                /*if ( (creep.room.name == 'E92N11') || (creep.room.name =='E91N11') || (creep.room.name =='E90N11') || (creep.room.name =='E92N12') || (creep.room.name =='E91N12') ) { // go in sequence
                    destination = Game.flags['E90N12'].pos;
                    creep.travelTo(destination);
                }
                else if ( (creep.room.name == 'E90N12') || (creep.room.name == 'E90N13') || (creep.room.name == 'E90N14') || (creep.room.name == 'E90N15') || (creep.room.name == 'E90N16') ) { // go in sequence
                    destination = Game.flags['E90N17'].pos;
                    creep.travelTo(destination);
                }
                else if ( (creep.room.name == 'E90N17') || (creep.room.name == 'E91N17') ) { // go in sequence
                    destination = Game.flags['E91N16'].pos;
                    creep.travelTo(destination);
                }*/
                if (creep.room.name != creep.memory.target) {
                    destination = Game.flags['E91N16'].pos;
                    creep.travelTo(destination);
                }
                else if (creep.room.name == creep.memory.target) {
                    if ( (creep.room.find(FIND_MY_CREEPS, {filter: c => c.memory.role == 'miner'})).length == 0 ) {
                        roleHarvester.run(creep);
                    }
                    else if ( ifConstructionSiteInRoom(creep.room) ) { // if there is still construction sites (globally, which is bad, need change)
                        roleBuilder.run(creep);
                    }
                    else {
                        roleUpgrader.run(creep);
                    }
                }
            }
            else if (creep.memory.target == 'E94N17') {
                /*if (creep.memory.halfWay == undefined) {
                    creep.memory.halfWay = false;
                }
                if (creep.pos.getRangeTo(Game.flags['intern']) == 1) {
                    creep.memory.halfWay = true;
                }

                if ( (creep.room.name == 'E91N16') || (creep.room.name =='E92N16') || (creep.room.name =='E92N15') || (creep.room.name =='E93N15') || (creep.room.name =='E94N15') ) { // go in sequence
                    destination = Game.flags['intern'].pos;
                    creep.travelTo(destination);
                }
                else if ( (creep.room.name =='E94N16') && (creep.memory.halfWay == false) ) {
                  destination = Game.flags['intern'].pos;
                  creep.travelTo(destination);
                }
                else if ( (creep.room.name =='E94N16') && (creep.memory.halfWay == true) ) {
                  destination = Game.flags['E94N17'].pos;
                  creep.travelTo(destination);
                }
                else if (creep.room.name == 'E93N16') {
                    destination = Game.flags['E93N17'].pos;
                    creep.travelTo(destination);
                }
                else if (creep.room.name =='E93N17') {
                    destination = Game.flags['E94N17'].pos;
                    creep.travelTo(destination);
                }*/
                if (creep.room.name != creep.memory.target) {
                    destination = Game.flags['E94N17'].pos;
                    creep.travelTo(destination);
                }
                else if (creep.room.name == creep.memory.target) {
                    let toBeOrNotToBe = Math.random();
                    if (toBeOrNotToBe < 0.85)  {
                        creep.memory.target = 'E94N22';
                    }
                    else {
                        creep.memory.target = 'E97N14';
                    }
                    /*if ( (creep.room.find(FIND_MY_CREEPS, {filter: c => c.memory.role == 'miner'})).length == 0 ) {
                        roleHarvester.run(creep);
                    }
                    //else if ( Object.keys(Game.constructionSites).length > 0 ) { // if there is still construction sites (globally, which is bad, need change)
                    //    roleBuilder.run(creep);
                    //}
                    else {
                        roleUpgrader.run(creep);
                    }*/
                }
            }
            else if (creep.memory.target == 'E97N14') {
                if ( creep.room.name == 'E94N16' ) { // go in sequence
                    destination = Game.flags['E94N17'].pos;
                    creep.travelTo(destination);
                }
                else if ( (creep.room.name == 'E94N17') || (creep.room.name =='E95N17') || (creep.room.name =='E96N17') ) { // go in sequence
                    destination = Game.flags['E97N17'].pos;
                    creep.travelTo(destination);
                }
                else if ( (creep.room.name == 'E97N17') || (creep.room.name == 'E97N16') || (creep.room.name == 'E97N15') ) { // go in sequence
                    destination = Game.flags['E97N14'].pos;
                    creep.travelTo(destination);
                }
                else if (creep.room.name == creep.memory.target) {
                    if ( (creep.room.find(FIND_MY_CREEPS, {filter: c => c.memory.role == 'miner'})).length == 0 ) {
                        roleHarvester.run(creep);
                    }
                    else if ( ifConstructionSiteInRoom(creep.room) ) { // if there is still construction sites (globally, which is bad, need change)
                        roleBuilder.run(creep);
                    }
                    else {
                        roleUpgrader.run(creep);
                    }
                }
                else {
                    creep.travelTo(Game.flags['E97N14'].pos)
                }
            }
            else if (creep.memory.target == 'E94N22') {
                if ( (creep.room.name == 'E94N17') || (creep.room.name =='E94N18') ) { // go in sequence
                    destination = Game.flags['E93N18'].pos;
                    creep.travelTo(destination);
                }
                else if (creep.room.name != creep.memory.target) {
                    creep.travelTo(Game.flags['E94N22'].pos);
                }
                else {
                    /*if ( (creep.room.find(FIND_MY_CREEPS, {filter: c => c.memory.role == 'miner'})).length == 0 ) {
                        roleHarvester.run(creep);
                    }
                    else */if ( ifConstructionSiteInRoom(creep.room) ) { // if there is still construction sites (globally, which is bad, need change)
                        roleBuilder.run(creep);
                    }
                    else {
                        roleUpgrader.run(creep);
                    }
                }
            }
            else {
                if (creep.room.name != creep.memory.target) {
                    creep.travelTo(Game.flags[creep.memory.target]);
                }
                else {
                    /*if ( (creep.room.find(FIND_MY_CREEPS, {filter: c => c.memory.role == 'miner'})).length == 0 ) {
                        roleHarvester.run(creep);
                    }
                    else */if ( ifConstructionSiteInRoom(creep.room) || (creep.room.controller == undefined) || (creep.room.controller.level < 1) ) { // if there is still construction sites (globally, which is bad, need change)
                        roleBuilder.run(creep);
                    }
                    else {
                        roleUpgrader.run(creep);
                    }
                }
            }
        }
    }
};

/*if ((creep.room.name == creep.memory.home) && (creep.carry.energy < creep.carryCapacity)){ // if just borned, take some energy
  var structure = creep.room.storage;
  if (creep.withdraw(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      creep.travelTo(structure);
  }
}
else */
