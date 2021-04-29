var addToQ = require('action.addToSQ');

Creep.prototype.runRole = function (roles) {
    //roles[this.memory.role].run(this);
    try {
        roles[this.memory.role].run(this);
        if (this.memory.isNeeded) {
            addToQ.run(this);
        }
    }
    catch (err) {
        console.log('error: role name fault: ' + this.memory.role + this.pos);
        //unpackCreepMemory(this.name);
    }
};

Creep.prototype.longRangeCachedTravelTo = function (fromPos, toPos) {
    let creep = this;
    if (creep.memory.cachedLongPath == undefined) {
        creep.memory.cachedLongPath = {}
        // Use `findRoute` to calculate a high-level plan for this path,
        // prioritizing highways and owned rooms
        let allowedRooms = { [from.roomName]: true };
        Game.map.findRoute(from.roomName, to.roomName, {
            routeCallback(roomName) {
                let parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
                let isHighway = (parsed[1] % 10 === 0) ||
                    (parsed[2] % 10 === 0);
                let isMyRoom = Game.rooms[roomName] &&
                    Game.rooms[roomName].controller &&
                    Game.rooms[roomName].controller.my;
                if (isHighway || isMyRoom) {
                    return 1;
                } else {
                    return 2.5;
                }
            }
        }).forEach(function (info) {
            allowedRooms[info.room] = true;
        });
        let allByPassRoomNames = allowedRooms.keys();
        for (let byPassRn in allByPassRoomNames) {
            let parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(byPassRn);
            let isHighway = (parsed[1] % 10 === 0) ||
                (parsed[2] % 10 === 0);
            if (isHighway) {
                allowedRooms['E17S20'] = true;
                allowedRooms['E16S20'] = true;
                allowedRooms['E19S20'] = true;
                allowedRooms['E18S20'] = true;
                break;
            }
        }
        // Invoke PathFinder, allowing access only to rooms from `findRoute`
        let ret = PathFinder.search(from, to, {
            roomCallback(roomName) {
                if (allowedRooms[roomName] === undefined) {
                    return false;
                }
            }
        });
        if (!ret.incomplete) {
            creep.memory.cachedLongPath = ret.path;
        }
    }
    else {
        let prePath = creep.memory.cachedLongPath;
        if (creep.pos.x == prePath[0].x && creep.pos.y == prePath[0].y && creep.pos.roomName == prePath[0].roomName) {
            creep.moveTo(prePath[1].x, prePath[1].y);
            creep.memory.cachedLongPath.shift();
        }
        else {
            creep.moveTo(prePath[0].x, prePath[0].y);
        }
    }
}

Creep.prototype.smartHeal = function (anotherCreep) {
    let ditance = this.pos.getRangeTo(anotherCreep);
    if (distance <= 1) {
        this.heal(anotherCreep);
    }
    else {
        this.rangedHeal(anotherCreep);
    }
}

Creep.prototype.travelToWithCachedPath = function (tarPosi, param = {}) {
    this.travelTo(tarPosi, param);
    return
    let cachedPathMemo = Memory.cachedPathMemo;
    if (cachedPathMemo == undefined) {
        Memory.cachedPathMemo = {}
    }
    else {
        let beginx = this.pos.x;
        let beginy = this.pos.y;
        let beginr = this.pos.roomName;
        let finx = tarPosi.x;
        let finy = tarPosi.y;
        let finr = tarPosi.roomName;
        let cachedString = beginx.toString() + '_' + beginy.toString() + '_' + beginr + '_' + finx.toString() + '_' + finy.toString() + '_' + finr;
        if (Memory.cachedPathMemo[cachedString] != undefined) {
            this.memory._trav = Memory.cachedPathMemo[cachedString];

            let path = this.memory._trav.path.substr(1);
            let nextDirection = parseInt(path[0], 10);
            if (!(this.move(nextDirection) == OK)) {
                this.travelTo(tarPosi, param);
            }
        }
        else {
            this.travelTo(tarPosi, param);
            Memory.cachedPathMemo[cachedString] = this.memory._trav;
        }
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
        if (this.memory.timer[this.memory.moveTaskId] > 103) { // even if going from one end to another end won't take this long
            let taskId = this.memory.moveTaskId
            this.room.memory.taskMove.contracts[taskId] = undefined;
            this.memory.moveTaskId = undefined;
        }

        // remove possible duplicated task
        let myContract = this.room.memory.taskMove.contracts[this.memory.moveTaskId];
        if (myContract != undefined) {
            for (let contractId in this.room.memory.taskMove.contracts) {
                let contract = this.room.memory.taskMove.contracts[contractId]
                if ((contract == undefined) || (contract.offerName == myContract.offerName) && (contractId !== this.memory.moveTaskId)) { // different contract id but same offer, bad contract remove
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
