/**
 * To start using Traveler, require it in main.js:
 * Example: var Traveler = require('Traveler.js');
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Traveler {
    /**
     * move creep to destination
     * @param creep
     * @param destination
     * @param options
     * @returns {number}
     */
    static travelTo(creep, destination, options = {}) {
        // uncomment if you would like to register hostile rooms entered
        this.updateRoomStatus(creep.room);
        if (!destination) {
            return ERR_INVALID_ARGS;
        }
        if (creep.fatigue && creep.fatigue > 0) {
            Traveler.circle(creep.pos, "aqua", .3);
            return ERR_TIRED;
        }
        destination = this.normalizePos(destination);
        // manage case where creep is nearby destination
        let rangeToDestination = creep.pos.getRangeTo(destination);
        if (options.range && rangeToDestination <= options.range) {
            return OK;
        }
        else if (rangeToDestination <= 1) {
            if (rangeToDestination === 1 && !options.range) {
                let direction = creep.pos.getDirectionTo(destination);
                if (options.returnData) {
                    options.returnData.nextPos = destination;
                    options.returnData.path = direction.toString();
                }
                return creep.move(direction);
            }
            return OK;
        }
        // for bypassing energy transfer
        if (options.creepCost) {
            if (creepCost == true) {
                creepCost = 1;
            }
            else {
                creepCost = options.creepCost;
            }
            if (creep&&creep.memory&&creep.memory._trav&&creep.memory._trav.state&&creep.memory._trav.state[2]>3) {
                creepCost += creep.memory._trav.state[2];
            }
        }
        else {
            creepCost = 0xff;
        }
        // initialize data object
        if (!creep.memory._trav) {
            delete creep.memory._travel;
            creep.memory._trav = {};
        }
        let travelData = creep.memory._trav;
        let state = this.deserializeState(travelData, destination);
        // uncomment to visualize destination
        // this.circle(destination, "orange");
        // check if creep is stuck
        if (this.isStuck(creep, state)) {
            state.stuckCount++;
            Traveler.circle(creep.pos, "magenta", state.stuckCount * .2);
        }
        else {
            state.stuckCount = 0;
        }
        // handle case where creep is stuck
        if (!options.stuckValue) {
            if (creep.memory.role == 'longDistanceLorry') {
                options.stuckValue = 3;
            }
            else {
                if (options === parseInt(options, 10)) { // very strange, giving me an integer instead of object
                    options = {};
                }
                options.stuckValue = DEFAULT_STUCK_VALUE;
            }
        }
        if (state.stuckCount >= options.stuckValue && Math.random() > .5) {
            options.ignoreCreeps = false;
            options.freshMatrix = true;
            delete travelData.path;
        }
        // TODO:handle case where creep moved by some other function, but destination is still the same
        // delete path cache if destination is different
        if (!this.samePos(state.destination, destination)) {
            if (options.movingTarget && state.destination.isNearTo(destination)) {
                travelData.path += state.destination.getDirectionTo(destination);
                state.destination = destination;
            }
            else {
                delete travelData.path;
            }
        }
        if (options.repath && Math.random() < options.repath) {
            // add some chance that you will find a new path randomly
            delete travelData.path;
        }
        // pathfinding
        let newPath = false;
        if (!travelData.path) {
            newPath = true;
            if (creep.spawning) {
                return ERR_BUSY;
            }
            state.destination = destination;
            let cpu = Game.cpu.getUsed();
            let ret = this.findTravelPath(creep.pos, destination, options);
            let cpuUsed = Game.cpu.getUsed() - cpu;
            state.cpu = _.round(cpuUsed + state.cpu);
            if (state.cpu > REPORT_CPU_THRESHOLD) {
                // see note at end of file for more info on this
                console.log(`TRAVELER: heavy cpu use: ${creep.name}, role: ${creep.memory.role}, cpu: ${state.cpu} origin: ${creep.pos}, dest: ${destination}`);
                if (creep.memory.role=='scouter') {
                    creep.suicide();
                }
                //creep.move(getRandomInt(1,8));
                //return
            }
            let color = "orange";
            if (ret.incomplete) {
                // uncommenting this is a great way to diagnose creep behavior issues
                // console.log(`TRAVELER: incomplete path for ${creep.name}`);
                color = "red";
            }
            if (options.returnData) {
                options.returnData.pathfinderReturn = ret;
            }
            travelData.path = Traveler.serializePath(creep.pos, ret.path, color);
            state.stuckCount = 0;
        }
        this.serializeState(creep, destination, state, travelData);
        if (!travelData.path || travelData.path.length === 0) {
            return ERR_NO_PATH;
        }
        // consume path
        if (state.stuckCount === 0 && !newPath) {
            // pre path for longDistanceLorries passEnergy
            if (creep.memory.pDirs==undefined || creep.memory.pDirs.length !== 3) {
                creep.memory.pDirs = [0, 0, 0];                                                                                                        
            }
            let tempD = creep.memory.pDirs;
            creep.memory.pDirs[0] = tempD[1];
            creep.memory.pDirs[1] = tempD[2];
            creep.memory.pDirs[2] = travelData.path[0];
            
            travelData.path = travelData.path.substr(1);
        }
        let nextDirection = parseInt(travelData.path[0], 10);
        
        let nextPos
        if (nextDirection == null) {
            nextPos = creep.pos.getDirectionTo(destination);
        }
        else {
            nextPos = Traveler.positionAtDirection(creep.pos, nextDirection);
        }
        
        // swap if front position is occupied by a working == true
        if (nextPos && nextPos.x && nextPos.y && creep.pos.getRangeTo(nextPos.x && nextPos.y)==1) {
            let frontCs = creep.room.lookForAt(LOOK_CREEPS, nextPos.x, nextPos.y);
            /*if (frontCs.length>0 && frontCs[0].my && (frontCs[0].memory.role=='powerSourceJammer' && ((creep.memory.role=='powerSourceAttacker')||(creep.memory.role=='powerSourceLorry')))) {
                frontCs[0].moveTo(creep);
            }
            else 
            */
            if ( creep.powers == undefined &&
                (frontCs.length>0 && frontCs[0].my) && 
                (!(creep.room.memory.battleMode && frontCs[0].memory.role=='redneck')) && 
                 (frontCs[0].memory.free || 
                  ((creep.memory.enforce || (state.stuckCount>0 && frontCs[0].memory.in==undefined && creep.memory.working != frontCs[0].memory.working)) && 
                  !(_.sum(creep.store)==0 && _.sum(frontCs[0].store)==0) && 
                  (!creep.memory.role=='newDickHead' && !(creep.store.getFreeCapacity('energy')==0 && frontCs[0].store.getFreeCapacity('energy')==0)) &&
                  (frontCs[0].memory.fixed==undefined)
                  )
                  || (creep.pos.x==0 || creep.pos.x==49 || creep.pos.y==0 || creep.pos.y==49)
                  || (!isSlave(creep) && isSlave(frontCs[0]))
                  || (creep.memory.role == 'newDickHead')
                  || ((frontCs[0].memory.role == 'lorry' || frontCs[0].memory.role == 'pickuper') && frontCs[0].memory.working==true)
                  || (creep.memory.role == 'claimer' && frontCs[0].memory.role !== 'claimer')
                  || (frontCs[0].memory.role == 'dedicatedUpgraderHauler' && frontCs[0].store.energy>0)
                  || (frontCs[0].memory.role == 'pickuper' && frontCs[0].memory.working==false)
                  || (frontCs[0].powers != undefined)
                  || (frontCs[0].memory.boosted==false)
                  || (frontCs[0].memory.free==true && frontCs[0].memory.role!=creep.memory.role && creep.memory.free!=true)
                  || (frontCs[0].memory.role=='sacrificer' && creep.memory.role !=='sacrificer')
                  || (frontCs[0].memory.role=='powerSourceLorry' && _.sum(frontCs[0].store)==0 && (!(creep.memory.role=='powerSourceLorry' && _.sum(creep.store)==0)))
                  || (frontCs[0].memory.role=='wallRepairer' && frontCs[0].store.energy>0)
                 )
            ) {
                frontCs[0].moveTo(creep);
            }
            else if (creep.powers && (frontCs.length>0 && frontCs[0].my) && frontCs[0].memory.working && frontCs[0].store.energy>0 && frontCs[0].store.getFreeCapacity('energy')>0 && (frontCs[0].getActiveBodyparts(WORK)==frontCs[0].getActiveBodyparts(CARRY))) {
                frontCs[0].moveTo(creep);
            }
            /*
            else if (creep.memory.role=='powerSourceAttacker' && ( frontCs[0].memory.role!=='powerSourceAttacker' || (frontCs[0].memory.role=='powerSourceAttacker' && creep.getActiveBodyparts(ATTACK)>frontCs[0].getActiveBodyparts(ATTACK)))) {
                creep.pull(frontCs[0]);
                creep.moveTo(frontCs[0]);
                frontCs[0].move(creep);
            }
            */
            else {
                frontCs = creep.room.lookForAt(LOOK_POWER_CREEPS, nextPos.x, nextPos.y);
                if ( (frontCs.length>0 && frontCs[0].my) /*&& 
                     (creep.memory.enforce || (state.stuckCount>0)) && 
                     !(_.sum(creep.store)==0 && _.sum(frontCs[0].store)==0) && 
                     !(creep.store.getFreeCapacity('energy')==0 && frontCs[0].store.getFreeCapacity('energy')==0) &&
                     (frontCs[0].memory.fixed==undefined)*/
                ) {
                    frontCs[0].moveTo(creep);
                }
            }
        }
        if (options.returnData) {
            if (nextDirection) {
                if (nextPos) {
                    options.returnData.nextPos = nextPos;
                }
            }
            options.returnData.state = state;
            options.returnData.path = travelData.path;
        }
        return creep.move(nextDirection);
    }
    /**
     * make position objects consistent so that either can be used as an argument
     * @param destination
     * @returns {any}
     */
    static normalizePos(destination) {
        if (!(destination instanceof RoomPosition)) {
            return destination.pos;
        }
        return destination;
    }
    /**
     * check if room should be avoided by findRoute algorithm
     * @param roomName
     * @returns {RoomMemory|number}
     */
    static checkAvoid(roomName) {
        return Memory.rooms && Memory.rooms[roomName] && Memory.rooms[roomName].avoid;
    }
    /**
     * check if a position is an exit
     * @param pos
     * @returns {boolean}
     */
    static isExit(pos) {
        return pos.x === 0 || pos.y === 0 || pos.x === 49 || pos.y === 49;
    }
    /**
     * check two coordinates match
     * @param pos1
     * @param pos2
     * @returns {boolean}
     */
    static sameCoord(pos1, pos2) {
        return pos1.x === pos2.x && pos1.y === pos2.y;
    }
    /**
     * check if two positions match
     * @param pos1
     * @param pos2
     * @returns {boolean}
     */
    static samePos(pos1, pos2) {
        return this.sameCoord(pos1, pos2) && pos1.roomName === pos2.roomName;
    }
    /**
     * draw a circle at position
     * @param pos
     * @param color
     * @param opacity
     */
    static circle(pos, color, opacity) {
        new RoomVisual(pos.roomName).circle(pos, {
            radius: .45, fill: "transparent", stroke: color, strokeWidth: .15, opacity: opacity
        });
    }
    /**
     * update memory on whether a room should be avoided based on controller owner
     * @param room
     */
    static updateRoomStatus(room) {
        if (!room) {
            return;
        }
        if (room.controller) {
            if (room.controller.owner && ((!room.controller.my)&&(!allyList().includes(room.controller.owner.username)))) {
                if (Memory.rooms == undefined) {
                    Memory.rooms = {};
                }
                if (Memory.rooms[room.name] == undefined) {
                    Memory.rooms[room.name] = {};
                }
                if (Memory.rooms[room.name].avoid == undefined) {
                    Memory.rooms[room.name]['avoid'] = 1;
                }
            }
            else {
                delete room.memory.avoid;
            }
        }
    }
    /**
     * find a path from origin to destination
     * @param origin
     * @param destination
     * @param options
     * @returns {PathfinderReturn}
     */
    static findTravelPath(origin, destination, options = {}) {
        _.defaults(options, {
            ignoreCreeps: true,
            maxOps: DEFAULT_MAXOPS,
            range: 1,
        });
        if (options.movingTarget) {
            options.range = 0;
        }
        origin = this.normalizePos(origin);
        destination = this.normalizePos(destination);
        let originRoomName = origin.roomName;
        let destRoomName = destination.roomName;
        // check to see whether findRoute should be used
        let roomDistance = Game.map.getRoomLinearDistance(origin.roomName, destination.roomName);
        let allowedRooms = options.route;
        if (!allowedRooms && (options.useFindRoute || (options.useFindRoute === undefined && roomDistance > 2))) {
            let route = this.findRoute(origin.roomName, destination.roomName, options);
            if (route) {
                allowedRooms = route;
            }
        }
        let roomsSearched = 0;
        let callback = (roomName) => {
            if (allowedRooms) {
                if (!allowedRooms[roomName]) {
                    return false;
                }
            }
            else if (!options.allowHostile && Traveler.checkAvoid(roomName)
                && roomName !== destRoomName && roomName !== originRoomName) {
                return false;
            }
            roomsSearched++;
            let matrix;
            let room = Game.rooms[roomName];
            if (room) {
                if (options.signoreStructures) {
                    matrix = new PathFinder.CostMatrix();
                    if (!options.ignoreCreeps) {
                        Traveler.addCreepsToMatrix(room, matrix, creepCost);
                    }
                }
                else if (options.ignoreCreeps || roomName !== originRoomName) {
                    matrix = this.getStructureMatrix(room, options.freshMatrix);
                }
                else {
                    matrix = this.getCreepMatrix(room);
                }
                if (options.obstacles) {
                    matrix = matrix.clone();
                    for (let obstacle of options.obstacles) {
                        if (obstacle.pos.roomName !== roomName) {
                            continue;
                        }
                        matrix.set(obstacle.pos.x, obstacle.pos.y, 0xff);
                    }
                }
                Traveler.addWallsToMatrix(room, matrix);
            }
            if (options.roomCallback) {
                if (!matrix) {
                    matrix = new PathFinder.CostMatrix();
                }
                let outcome = options.roomCallback(roomName, matrix.clone());
                if (outcome !== undefined) {
                    return outcome;
                }
            }
            return matrix;
        };
        
        let ret = PathFinder.search(origin, { pos: destination, range: options.range }, {
            maxOps: options.maxOps,
            maxRooms: options.maxRooms,
            plainCost: options.offRoad ? ROAD_COST_VAL : options.ignoreRoads ? ROAD_COST_VAL : ROAD_COST_VAL*2,
            swampCost: options.ignoreSwamp ? 0.1 : options.offRoad ? ROAD_COST_VAL*4 : options.ignoreRoads ? ROAD_COST_VAL*8 : ROAD_COST_VAL*16,
            roomCallback: callback,
        });
        if (ret.incomplete && options.ensurePath) {
            if (options.useFindRoute === undefined) {
                // handle case where pathfinder failed at a short distance due to not using findRoute
                // can happen for situations where the creep would have to take an uncommonly indirect path
                // options.allowedRooms and options.routeCallback can also be used to handle this situation
                if (roomDistance <= 2) {
                    console.log(`TRAVELER: path failed without findroute, trying with options.useFindRoute = true`);
                    console.log(`from: ${origin}, destination: ${destination}`);
                    options.useFindRoute = true;
                    ret = this.findTravelPath(origin, destination, options);
                    console.log(`TRAVELER: second attempt was ${ret.incomplete ? "not " : ""}successful`);
                    return ret;
                }
                // TODO: handle case where a wall or some other obstacle is blocking the exit assumed by findRoute
            }
            else {
            }
        }
        return ret;
    }
    /**
     * find a viable sequence of rooms that can be used to narrow down pathfinder's search algorithm
     * @param origin
     * @param destination
     * @param options
     * @returns {{}}
     */
    static findRoute(origin, destination, options = {}) {
        let restrictDistance = options.restrictDistance || Game.map.getRoomLinearDistance(origin, destination) + 10;
        let allowedRooms = { [origin]: true, [destination]: true };
        let highwayBias = 1;
        
        if (options.preferHighway) {
            highwayBias = 2.5;
            if (options.highwayBias) {
                highwayBias = options.highwayBias;
            }
        }
        let ret = Game.map.findRoute(origin, destination, {
            routeCallback: (roomName) => {
                if (options.routeCallback) {
                    let outcome = options.routeCallback(roomName);
                    if (outcome !== undefined) {
                        return outcome;
                    }
                }
                let rangeToRoom = Game.map.getRoomLinearDistance(origin, roomName);
                if (rangeToRoom > restrictDistance) {
                    // room is too far out of the way
                    return Number.POSITIVE_INFINITY;
                }
                if (!options.allowHostile && Traveler.checkAvoid(roomName) &&
                    roomName !== destination && roomName !== origin) {
                    // room is marked as "avoid" in room memory
                    return 255;
                }
                let parsed;
                if (options.preferHighway) {
                    parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
                    let isHighway = (parsed[1] % 10 === 0) || (parsed[2] % 10 === 0);
                    if (isHighway) {
                        return 1;
                    }
                }
                if (isSk(roomName)&&Traveler.checkAvoid(roomName)) {
                    return false
                }
                // SK rooms are avoided when there is no vision in the room, harvested-from SK rooms are allowed
                if (!options.allowSK && !Game.rooms[roomName]) {
                    if (!parsed) {
                        parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
                    }
                    let fMod = parsed[1] % 10;
                    let sMod = parsed[2] % 10;
                    let isSK = !(fMod === 5 && sMod === 5) &&
                        ((fMod >= 4) && (fMod <= 6)) &&
                        ((sMod >= 4) && (sMod <= 6));
                    if (isSK) {
                        return 10 * highwayBias;
                    }
                }
                return highwayBias;
            },
        });
        if (!_.isArray(ret)) {
            console.log(`couldn't findRoute to ${destination}`);
            return;
        }
        for (let value of ret) {
            allowedRooms[value.room] = true;
        }
        return allowedRooms;
    }
    /**
     * check how many rooms were included in a route returned by findRoute
     * @param origin
     * @param destination
     * @returns {number}
     */
    static routeDistance(origin, destination) {
        let linearDistance = Game.map.getRoomLinearDistance(origin, destination);
        if (linearDistance >= 32) {
            return linearDistance;
        }
        let allowedRooms = this.findRoute(origin, destination);
        if (allowedRooms) {
            return Object.keys(allowedRooms).length;
        }
    }
    /**
     * build a cost matrix based on structures in the room. Will be cached for more than one tick. Requires vision.
     * @param room
     * @param freshMatrix
     * @returns {any}
     */
    static getStructureMatrix(room, freshMatrix) {
        if (!this.structureMatrixTick) this.structureMatrixTick = {};
        if (!this.structureMatrixCache[room.name] || (freshMatrix && Game.time !== this.structureMatrixTick[room.name])) {
            this.structureMatrixTick[room.name] = Game.time;
            let matrix = new PathFinder.CostMatrix();
            this.structureMatrixCache[room.name] = Traveler.addStructuresToMatrix(room, matrix, ROAD_COST_VAL);
        }
        return this.structureMatrixCache[room.name];
    }
    /**
     * build a cost matrix based on creeps and structures in the room. Will be cached for one tick. Requires vision.
     * @param room
     * @returns {any}
     */
    static getCreepMatrix(room) {
        if (!this.creepMatrixTick) this.creepMatrixTick = {};
        if (!this.creepMatrixCache[room.name] || Game.time !== this.creepMatrixTick[room.name]) {
            this.creepMatrixTick[room.name] = Game.time;
            this.creepMatrixCache[room.name] = Traveler.addCreepsToMatrix(room, this.getStructureMatrix(room, true).clone(), creepCost);
        }
        return this.creepMatrixCache[room.name];
    }
    /**
     * add structures to matrix so that impassible structures can be avoided and roads given a lower cost
     * @param room
     * @param matrix
     * @param roadCost
     * @returns {CostMatrix}
     */
    static addStructuresToMatrix(room, matrix, roadCost) {
        let impassibleStructures = [];
        for (let structure of room.find(FIND_STRUCTURES)) {
            if (structure instanceof StructureRampart) {
                if (!structure.my && !structure.isPublic) {
                    impassibleStructures.push(structure);
                }
            }
            else if (structure instanceof StructureRoad) {
                matrix.set(structure.pos.x, structure.pos.y, roadCost);
            }
            else if (structure instanceof StructureContainer) {
                matrix.set(structure.pos.x, structure.pos.y, 5);
            }
            else {
                impassibleStructures.push(structure);
            }
        }
        for (let site of room.find(FIND_MY_CONSTRUCTION_SITES)) {
            if (site.structureType === STRUCTURE_CONTAINER || site.structureType === STRUCTURE_ROAD
                || site.structureType === STRUCTURE_RAMPART) {
                continue;
            }
            matrix.set(site.pos.x, site.pos.y, 0xff);
        }
        for (let structure of impassibleStructures) {
            matrix.set(structure.pos.x, structure.pos.y, 0xff);
        }
        // add middle point as unwalkable
        let anch = room.memory.newAnchor;
        if (anch==undefined) {
            anch = room.memory.anchor;
        }
        if (anch) {
            if (room.memory.coreBaseReady && room.find(FIND_MY_CREEPS, {filter:c=>c.memory.role == 'dickHead'}).length>3) {
                matrix.set(anch.x-1, anch.y-7, 0xff);
                matrix.set(anch.x-1, anch.y-9, 0xff);
                matrix.set(anch.x+1, anch.y-7, 0xff);
                matrix.set(anch.x+1, anch.y-9, 0xff);
            }
            matrix.set(anch.x, anch.y-8, 0xff);
        }
        // for maxRooms=1
        
        return matrix;
    }
    /**
     * add creeps to matrix so that they will be avoided by other creeps
     * @param room
     * @param matrix
     * @returns {CostMatrix}
     */
    static addCreepsToMatrix(room, matrix, creepCost) {
        room.find(FIND_CREEPS).forEach((creep) => {
            if (creep.my && creep.memory.role == 'powerSourceJammer') {
                matrix.set(creep.pos.x, creep.pos.y, 1)
            }
            else if (creep.my && (creep.memory.role == 'longDistanceLorry' || creep.memory.role == 'driver'|| creep.memory.role == 'symbolPicker')) {
                matrix.set(creep.pos.x, creep.pos.y, creepCost)
            }
            else if (creep.my && creep.memory.role && (creep.memory.role == 'linkKeeper' || creep.memory.role == 'balancer' || creep.memory.role == 'dickHead' || creep.memory.role == 'maintainer')) {
                matrix.set(creep.pos.x, creep.pos.y, 100)
            }
            /*else {
                let travelData = creep.memory._trav;
                let state = this.deserializeState(travelData, destination);
                // uncomment to visualize destination
                // this.circle(destination, "orange");
                // check if creep is stuck
                if (this.isStuck(creep, state)) {
                    matrix.set(creep.pos.x, creep.pos.y, 200);
                }
            }*/
            /*else if (creep&&creep.memory&&creep.memory._trav&&creep.memory._trav.state&&creep.memory._trav.state[2]>3) {
                matrix.set(creep.pos.x, creep.pos.y, 200);
            }*/
            else if (creep.owner.username == 'Source Keeper') {
                for (let i = -3; i<4; i++) {
                    for (let j = -3; j<4; j++) {
                        let bx = creep.pos.x+i;
                        let by = creep.pos.y+j;
                        if (bx>-1&&bx<50&&by>-1&&by<50) { // valid coord
                            matrix.set(bx, by, 255);
                        }
                    }
                }
            }
            else {
                matrix.set(creep.pos.x, creep.pos.y, 255);
            }
            
        });
        room.find(FIND_MY_POWER_CREEPS).forEach((creep) => { 
            matrix.set(creep.pos.x, creep.pos.y, 255);
        });
        return matrix;
    }
    /**
     * add walls to matrix so that they will be avoided
     * @param room
     * @param matrix
     */
    static addWallsToMatrix(room, matrix) {
        room.find(FIND_STRUCTURES).forEach((creep) => { 
            if (creep.structureType == 'STRUCTURE_WALL') {
                matrix.set(creep.pos.x, creep.pos.y, 255);
            }
        });
        return matrix;
    }
    /**
     * serialize a path, traveler style. Returns a string of directions.
     * @param startPos
     * @param path
     * @param color
     * @returns {string}
     */
    static serializePath(startPos, path, color = "orange") {
        let serializedPath = "";
        let lastPosition = startPos;
        this.circle(startPos, color);
        for (let position of path) {
            if (position.roomName === lastPosition.roomName) {
                new RoomVisual(position.roomName)
                    .line(position, lastPosition, { color: color, lineStyle: "dashed" });
                serializedPath += lastPosition.getDirectionTo(position);
            }
            lastPosition = position;
        }
        return serializedPath;
    }
    /**
     * returns a position at a direction relative to origin
     * @param origin
     * @param direction
     * @returns {RoomPosition}
     */
    static positionAtDirection(origin, direction) {
        let offsetX = [0, 0, 1, 1, 1, 0, -1, -1, -1];
        let offsetY = [0, -1, -1, 0, 1, 1, 1, 0, -1];
        let x = origin.x + offsetX[direction];
        let y = origin.y + offsetY[direction];
        if (x > 49 || x < 0 || y > 49 || y < 0) {
            return;
        }
        return new RoomPosition(x, y, origin.roomName);
    }
    /**
     * convert room avoidance memory from the old pattern to the one currently used
     * @param cleanup
     */
    static patchMemory(cleanup = false) {
        if (!Memory.empire) {
            return;
        }
        if (!Memory.empire.hostileRooms) {
            return;
        }
        let count = 0;
        for (let roomName in Memory.empire.hostileRooms) {
            if (Memory.empire.hostileRooms[roomName]) {
                if (!Memory.rooms[roomName]) {
                    Memory.rooms[roomName] = {};
                }
                Memory.rooms[roomName].avoid = 1;
                count++;
            }
            if (cleanup) {
                delete Memory.empire.hostileRooms[roomName];
            }
        }
        if (cleanup) {
            delete Memory.empire.hostileRooms;
        }
        console.log(`TRAVELER: room avoidance data patched for ${count} rooms`);
    }
    static deserializeState(travelData, destination) {
        let state = {};
        if (travelData.state) {
            state.lastCoord = { x: travelData.state[STATE_PREV_X], y: travelData.state[STATE_PREV_Y] };
            state.cpu = travelData.state[STATE_CPU];
            state.stuckCount = travelData.state[STATE_STUCK];
            state.destination = new RoomPosition(travelData.state[STATE_DEST_X], travelData.state[STATE_DEST_Y], travelData.state[STATE_DEST_ROOMNAME]);
        }
        else {
            state.cpu = 0;
            state.destination = destination;
        }
        return state;
    }
    static serializeState(creep, destination, state, travelData) {
        travelData.state = [creep.pos.x, creep.pos.y, state.stuckCount, state.cpu, destination.x, destination.y,
        destination.roomName];
    }
    static isStuck(creep, state) {
        let stuck = false;
        if (state.lastCoord !== undefined) {
            if (this.sameCoord(creep.pos, state.lastCoord)) {
                // didn't move
                stuck = true;
            }
            else if (this.isExit(creep.pos) && this.isExit(state.lastCoord)) {
                // moved against exit
                stuck = true;
            }
        }
        return stuck;
    }
}
Traveler.structureMatrixCache = {};
Traveler.creepMatrixCache = {};
exports.Traveler = Traveler;
// this might be higher than you wish, setting it lower is a great way to diagnose creep behavior issues. When creeps
// need to repath to often or they aren't finding valid paths, it can sometimes point to problems elsewhere in your code
const REPORT_CPU_THRESHOLD = 80;
const DEFAULT_MAXOPS = 2000;
const ROAD_COST_VAL = 1;
const DEFAULT_STUCK_VALUE = 2;  // time wait before find path again when stuck
const STATE_PREV_X = 0;
const STATE_PREV_Y = 1;
const STATE_STUCK = 2;
const STATE_CPU = 3;
const STATE_DEST_X = 4;
const STATE_DEST_Y = 5;
const STATE_DEST_ROOMNAME = 6;
var creepCost = 0xff;
// assigns a function to Creep.prototype: creep.travelTo(destination)
Creep.prototype.travelTo = function (destination, options) {
    return Traveler.travelTo(this, destination, options);
};

PowerCreep.prototype.travelTo = function (destination, options) {
    return Traveler.travelTo(this, destination, options);
};