var roles = {
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
    attacker : require('role.attacker'),
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
    labber: require('role.labber'),
    superUpgrader: require('role.superUpgrader'),
    keeperLairMeleeKeeper: require('role.keeperLairMeleeKeeper'),
    keeperLairLorry: require('role.keeperLairLorry')
};

Creep.prototype.runRole = function () {
    //roles[this.memory.role].run(this);
    try {
        roles[this.memory.role].run(this);
    }
    catch(err) {
        console.log('error: role name fault: '+this.memory.role+this.pos);
    }
};

Creep.prototype.myMoveTo = function (target) {
    // if no path planned yet, plan
    if (this.memory._move == undefined) {
        this.moveTo(target);
    }
    // if already path planned
    else {
        // if creep stucked for a while, re-find path
        if (ifCreepFreezed(this)) {
        //if (true) {
            this.moveTo(target);
        }
        else { // creep is moving soothly as ususal
            let planned = this.memory._move;
            // if same target, used old path
            if ( (target.pos.x == planned.dest.x)&&(target.pos.y == planned.dest.y) ) {
                this.moveByPath(planned.path);
                //this.moveTo(target);
            }
            else {
                // if different target, establish new path
                this.moveTo(target);
            }
        }
    }
};

Creep.prototype.findPathTo = function(target)
{
  if(this.memory.cachedPath != undefined && this.memory.unsuccesfulsteps > 10) // if there is cached path and old path has not been updated for 10 ticks
  {
    this.memory.cachedPath = undefined; // set cached path to undefined to prepare to search for new path
  }

  if(this.memory.cachedPath != undefined && this.memory.cachedPath.length > 0) // if there is cached path and its length is > 0
  {
    // get the next step and last step stored in path
    path = this.memory.cachedPath;
    nextstep = path[0];
    var pos = new RoomPosition(nextstep.x,nextstep.y,nextstep.roomName);
    if(path.length > 1)
    {
    var lastpos = new RoomPosition(path[path.length-1].x,path[path.length-1].y,path[path.length-1].roomName);
    }
    else
    {
      lastpos = pos;
    }

    if(pos.roomName == this.pos.roomName) // if next step is in the same room
    {
      if(lastpos.inRangeTo(target,2) == true) // if last step is in 2 range to target position
      {
        //console.log('yuhu')
        if(this.pos.inRangeTo(pos,2)) // if current position is in 2 range to next position
        {
          path.shift(); // delete the next position

          var dir = this.pos.getDirectionTo(pos);
          if(dir != undefined) // move towards pos
          {
              this.move(dir);
              this.memory.cachedPath = path
          }
          else
          {
              this.moveTo(pos);
              this.memory.cachedPath = path
          }
        }
        else
        {
          this.moveTo(pos,{reusePath: 0});
        }
      }
      else // found last step is out of 2 range of target
      {
        this.memory.cachedPath = undefined;
        path = undefined;
      }
    }
    else // next step is not in the same room
    {
      this.moveTo(pos);
      this.memory.cachedPath = path
      return;
    }
    this.memory.unsuccesfulsteps += 1; // accumelating ticks to renew path
  }

  if(this.memory.cachedPath == undefined || this.memory.cachedPath.length == 0)
  {
      var creep = this;
      var targets = target;
      var valid = false;
      var Roomsreach = 16;
      var range = 1;
      var room
      var ops = 1000;
      /*if(opts != undefined)
      {
        if(opts.maxRooms != undefined)
        {
          Roomsreach = opts.maxRooms;
        }
        if(opts.range != undefined)
        {
          range = opts.range;
        }
        if(opts.ops != undefined)
        {
          ops = opts.ops;
        }
      }*/
  //  console.log(ops);
          let goals = targets;
      //    console.log(ops);
          let ret = PathFinder.search(
            this.pos, goals,
            {
              // We need to set the defaults costs higher so that we
              // can set the road cost lower in `roomCallback`
              plainCost: 2,
              swampCost: 10,
              maxOps: ops,
              maxRooms: Roomsreach,
              roomCallback: function(roomName) {
                    room = Game.rooms[roomName];
                    if(!room)
                    return
                    if(costMatrizes[roomName] != undefined)
                    {
                      console.log(2)
                      return costMatrizes[roomName];
                    }
                    if(room.memory.costMatrix != undefined && room.memory.costMatrixOutDated == false)
                    {
                      var cost = PathFinder.CostMatrix.deserialize(room.memory.costMatrix);

                      room.find(FIND_CREEPS).forEach(c => cost.set(c.pos.x,c.pos.y,255));
                      costMatrizes[roomName] = cost;
                      return cost;
                    }
                    else
                    {
                      if (!room) return;
                      var costs = new PathFinder.CostMatrix;
                      room.find(FIND_STRUCTURES).forEach(function(struct) {
                        if (struct.structureType == STRUCTURE_ROAD) {
                          // Favor roads over plain tiles
                          costs.set(struct.pos.x, struct.pos.y, 1);
                        } else if (struct.structureType != STRUCTURE_CONTAINER &&
                                   (struct.structureType != STRUCTURE_RAMPART ||
                                    !struct.my)) {
                          // Can't walk through non-walkable buildings
                          costs.set(struct.pos.x, struct.pos.y, 255);
                        }
                      });

                      if(room.memory.construction == true)
                      {
                      room.find(FIND_CONSTRUCTION_SITES).forEach(function(struct) {
                        if (struct.structureType === STRUCTURE_ROAD) {
                          // Favor roads over plain tiles
                          costs.set(struct.pos.x, struct.pos.y, 1);
                        } else if (struct.structureType !== STRUCTURE_CONTAINER &&
                                   (struct.structureType !== STRUCTURE_RAMPART ||
                                    !struct.my)) {
                          // Can't walk through non-walkable buildings
                          costs.set(struct.pos.x, struct.pos.y, 255);
                        }})
                      }
                      room.memory.costMatrix = costs.serialize();
                      room.memory.costMatrixOutDated = false;
                      return costs;
                    }
                  }
                }
          );
        //  console.log(ret.ops);
        // let pos = ret.path[0];
         creep.move(creep.pos.getDirectionTo(ret.path.shift()));
         creep.memory.cachedPath = ret.path;
         creep.memory.unsuccesfulsteps = 0;
  //  }
  }
}
