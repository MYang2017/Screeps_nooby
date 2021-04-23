"use strict";

/**
 * Code for calculating the minCut in a room, written by Saruss
 * adapted for Typescript and flexible room subsets by Chobobobo,
 * a little debugging done by Muon
 */


Object.defineProperty(exports, "__esModule", { value: true });
exports.testSubset = exports.test = exports.pruneDeadEnds = exports.getCutTiles = exports.createGraph = exports.get2DArray = exports.Graph = void 0;
var UNWALKABLE = -1;
var NORMAL = 0;
var PROTECTED = 1;
var CANNOT_BUILD = 2;
var EXIT = 3;
var Graph = /** @class */ (function () {
    function Graph(totalVertices) {
        this.totalVertices = totalVertices;
        this.level = Array(totalVertices);
        // An array of edges for each vertex
        this.edges = Array(totalVertices).fill(0).map(function (x) { return []; });
    }
    /**
     * Create a new edge in the graph as well as a corresponding reverse edge on the residual graph
     * @param from - vertex edge starts at
     * @param to - vertex edge leads to
     * @param capacity - max flow capacity for this edge
     */
    Graph.prototype.newEdge = function (from, to, capacity) {
        // Normal forward Edge
        this.edges[from].push({ to: to, resEdge: this.edges[to].length, capacity: capacity, flow: 0 });
        // reverse Edge for Residual Graph
        this.edges[to].push({ to: from, resEdge: this.edges[from].length - 1, capacity: 0, flow: 0 });
    };
    /**
     * Uses Breadth First Search to see if a path exists to the vertex 'to' and generate the level graph
     * @param from - vertex to start from
     * @param to - vertex to try and reach
     */
    Graph.prototype.createLevelGraph = function (from, to) {
        if (to >= this.totalVertices) {
            return false;
        }
        this.level.fill(-1); // reset old levels
        this.level[from] = 0;
        var q = []; // queue with s as starting point
        q.push(from);
        var u = 0;
        var edge = null;
        while (q.length) {
            u = q.shift();
            for (var _i = 0, _a = this.edges[u]; _i < _a.length; _i++) {
                edge = _a[_i];
                if (this.level[edge.to] < 0 && edge.flow < edge.capacity) {
                    this.level[edge.to] = this.level[u] + 1;
                    q.push(edge.to);
                }
            }
        }
        return this.level[to] >= 0; // return if theres a path, no level, no path!
    };
    /**
     * Depth First Search-like: send flow at along path from from->to recursively while increasing the level of the
     * visited vertices by one
     * @param start - the vertex to start at
     * @param end - the vertex to try and reach
     * @param targetFlow - the amount of flow to try and achieve
     * @param count - keep track of which vertices have been visited so we don't include them twice
     */
    Graph.prototype.calcFlow = function (start, end, targetFlow, count) {
        if (start === end) { // Sink reached , abort recursion
            return targetFlow;
        }
        var edge;
        var flowTillHere = 0;
        var flowToT = 0;
        while (count[start] < this.edges[start].length) { // Visit all edges of the vertex one after the other
            edge = this.edges[start][count[start]];
            if (this.level[edge.to] === this.level[start] + 1 && edge.flow < edge.capacity) {
                // Edge leads to Vertex with a level one higher, and has flow left
                flowTillHere = Math.min(targetFlow, edge.capacity - edge.flow);
                flowToT = this.calcFlow(edge.to, end, flowTillHere, count);
                if (flowToT > 0) {
                    edge.flow += flowToT; // Add Flow to current edge
                    // subtract from reverse Edge -> Residual Graph neg. Flow to use backward direction of BFS/DFS
                    this.edges[edge.to][edge.resEdge].flow -= flowToT;
                    return flowToT;
                }
            }
            count[start]++;
        }
        return 0;
    };
    /**
     * Uses Breadth First Search to find the vertices in the minCut for the graph
     * - Must call calcMinCut first to prepare the graph
     * @param from - the vertex to start from
     */
    Graph.prototype.getMinCut = function (from) {
        var eInCut = [];
        this.level.fill(-1);
        this.level[from] = 1;
        var q = [];
        q.push(from);
        var u = 0;
        var edge;
        while (q.length) {
            u = q.shift();
            for (var _i = 0, _a = this.edges[u]; _i < _a.length; _i++) {
                edge = _a[_i];
                if (edge.flow < edge.capacity) {
                    if (this.level[edge.to] < 1) {
                        this.level[edge.to] = 1;
                        q.push(edge.to);
                    }
                }
                if (edge.flow === edge.capacity && edge.capacity > 0) { // blocking edge -> could be in min cut
                    eInCut.push({ to: edge.to, unreachable: u });
                }
            }
        }
        var minCut = [];
        var cutEdge;
        for (var _b = 0, eInCut_1 = eInCut; _b < eInCut_1.length; _b++) {
            cutEdge = eInCut_1[_b];
            if (this.level[cutEdge.to] === -1) {
                // Only edges which are blocking and lead to the sink from unreachable vertices are in the min cut
                minCut.push(cutEdge.unreachable);
            }
        }
        return minCut;
    };
    /**
     * Calculates min-cut graph using Dinic's Algorithm.
     * use getMinCut to get the actual verticies in the minCut
     * @param source - Source vertex
     * @param sink - Sink vertex
     */
    Graph.prototype.calcMinCut = function (source, sink) {
        if (source === sink) {
            return -1;
        }
        var ret = 0;
        var count = [];
        var flow = 0;
        while (this.createLevelGraph(source, sink)) {
            count = Array(this.totalVertices + 1).fill(0);
            do {
                flow = this.calcFlow(source, sink, Number.MAX_VALUE, count);
                if (flow > 0) {
                    ret += flow;
                }
            } while (flow);
        }
        return ret;
    };
    return Graph;
}());
exports.Graph = Graph;
/**
 * An Array with Terrain information: -1 not usable, 2 Sink (Leads to Exit)
 * @param room - the room to generate the terrain map from
 */
function get2DArray(roomName, bounds) {
    if (bounds === void 0) { bounds = { x1: 0, y1: 0, x2: 49, y2: 49 }; }
    var room2D = Array(50).fill(NORMAL).map(function (d) { return Array(50).fill(NORMAL); }); // Array for room tiles
    var x;
    var y;
    for (x = bounds.x1; x <= bounds.x2; x++) {
        for (y = bounds.y1; y <= bounds.y2; y++) {
            if (Game.map.getTerrainAt(x, y, roomName) === 'wall') {
                room2D[x][y] = UNWALKABLE; // Mark unwalkable
            }
            else if (x === bounds.x1 || y === bounds.y1 || x === bounds.x2 || y === bounds.y2) {
                room2D[x][y] = EXIT; // Mark exit tiles
            }
        }
    }
    // Marks tiles as unbuildable if they are proximate to exits
    for (y = bounds.y1 + 1; y <= bounds.y2 - 1; y++) {
        if (room2D[bounds.x1][y] === EXIT) {
            for (var _i = 0, _a = [-1, 0, 1]; _i < _a.length; _i++) {
                var dy = _a[_i];
                if (room2D[bounds.x1 + 1][y + dy] !== UNWALKABLE) {
                    room2D[bounds.x1 + 1][y + dy] = CANNOT_BUILD;
                }
            }
        }
        if (room2D[bounds.x2][y] === EXIT) {
            for (var _b = 0, _c = [-1, 0, 1]; _b < _c.length; _b++) {
                var dy = _c[_b];
                if (room2D[bounds.x2 - 1][y + dy] !== UNWALKABLE) {
                    room2D[bounds.x2 - 1][y + dy] = CANNOT_BUILD;
                }
            }
        }
    }
    for (x = bounds.x1 + 1; x <= bounds.x2 - 1; x++) {
        if (room2D[x][bounds.y1] === EXIT) {
            for (var _d = 0, _e = [-1, 0, 1]; _d < _e.length; _d++) {
                var dx = _e[_d];
                if (room2D[x + dx][bounds.y1 + 1] !== UNWALKABLE) {
                    room2D[x + dx][bounds.y1 + 1] = CANNOT_BUILD;
                }
            }
        }
        if (room2D[x][bounds.y2] === EXIT) {
            for (var _f = 0, _g = [-1, 0, 1]; _f < _g.length; _f++) {
                var dx = _g[_f];
                if (room2D[x + dx][bounds.y2 - 1] !== UNWALKABLE) {
                    room2D[x + dx][bounds.y2 - 1] = CANNOT_BUILD;
                }
            }
        }
    }
    return room2D;
}
exports.get2DArray = get2DArray;
/**
 * Function to create Source, Sink, Tiles arrays: takes a rectangle-Array as input for Tiles that are to Protect
 * @param room - the room to consider
 * @param toProtect - the coordinates to protect inside the walls
 * @param bounds - the area to consider for the minCut
 */
function createGraph(roomName, toProtect, bounds) {
    if (bounds === void 0) { bounds = { x1: 0, y1: 0, x2: 49, y2: 49 }; }
    var roomArray = get2DArray(roomName, bounds);
    // For all Rectangles, set edges as source (to protect area) and area as unused
    var r;
    var x;
    var y;
    for (var _i = 0, toProtect_1 = toProtect; _i < toProtect_1.length; _i++) {
        r = toProtect_1[_i];
        if (bounds.x1 >= bounds.x2 || bounds.y1 >= bounds.y2 ||
            bounds.x1 < 0 || bounds.y1 < 0 || bounds.x2 > 49 || bounds.y2 > 49) {
            return console.log('ERROR: Invalid bounds', JSON.stringify(bounds));
        }
        else if (r.x1 >= r.x2 || r.y1 >= r.y2) {
            return console.log('ERROR: Rectangle', JSON.stringify(r), 'invalid.');
        }
        else if (r.x1 < bounds.x1 || r.x2 > bounds.x2 || r.y1 < bounds.y1 || r.y2 > bounds.y2) {
            return console.log('ERROR: Rectangle', JSON.stringify(r), 'out of bounds:', JSON.stringify(bounds));
        }
        for (x = r.x1; x <= r.x2; x++) {
            for (y = r.y1; y <= r.y2; y++) {
                if (x === r.x1 || x === r.x2 || y === r.y1 || y === r.y2) {
                    if (roomArray[x][y] === NORMAL) {
                        roomArray[x][y] = PROTECTED;
                    }
                }
                else {
                    roomArray[x][y] = UNWALKABLE;
                }
            }
        }
    }
    var max;
    // ********************** Visualization
    if (true) {
        var visual = new RoomVisual(roomName);
        for (x = bounds.x1; x <= bounds.x2; x++) {
            for (y = bounds.y1; y <= bounds.y2; y++) {
                if (roomArray[x][y] === UNWALKABLE) {
                    visual.circle(x, y, { radius: 0.5, fill: '#111166', opacity: 0.3 });
                }
                else if (roomArray[x][y] === NORMAL) {
                    visual.circle(x, y, { radius: 0.5, fill: '#e8e863', opacity: 0.3 });
                }
                else if (roomArray[x][y] === PROTECTED) {
                    visual.circle(x, y, { radius: 0.5, fill: '#75e863', opacity: 0.3 });
                }
                else if (roomArray[x][y] === CANNOT_BUILD) {
                    visual.circle(x, y, { radius: 0.5, fill: '#b063e8', opacity: 0.3 });
                }
            }
        }
    }
    // initialise graph
    // possible 2*50*50 +2 (st) Vertices (Walls etc set to unused later)
    var g = new Graph(2 * 50 * 50 + 2);
    var infini = Number.MAX_VALUE;
    var surr = [[0, -1], [-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1]];
    // per Tile (0 in Array) top + bot with edge of c=1 from top to bott  (use every tile once!)
    // infini edge from bot to top vertices of adjacent tiles if they not protected (array =1)
    // (no reverse edges in normal graph)
    // per prot. Tile (1 in array) Edge from source to this tile with infini cap.
    // per exit Tile (2in array) Edge to sink with infini cap.
    // source is at  pos 2*50*50, sink at 2*50*50+1 as first tile is 0,0 => pos 0
    // top vertices <-> x,y : v=y*50+x   and x= v % 50  y=v/50 (math.floor?)
    // bot vertices <-> top + 2500
    var source = 2 * 50 * 50;
    var sink = 2 * 50 * 50 + 1;
    var top = 0;
    var bot = 0;
    var dx = 0;
    var dy = 0;
    max = 49;
    for (x = bounds.x1 + 1; x < bounds.x2; x++) {
        for (y = bounds.y1 + 1; y < bounds.y2; y++) {
            top = y * 50 + x;
            bot = top + 2500;
            if (roomArray[x][y] === NORMAL || roomArray[x][y] === PROTECTED) {
                if (roomArray[x][y] === NORMAL) {
                    g.newEdge(top, bot, 1);
                }
                else if (roomArray[x][y] === PROTECTED) { // connect this to the source
                    g.newEdge(source, top, infini);
                    g.newEdge(top, bot, 1);
                }
                for (var i = 0; i < 8; i++) { // attach adjacent edges
                    dx = x + surr[i][0];
                    dy = y + surr[i][1];
                    if (roomArray[dx][dy] === NORMAL || roomArray[dx][dy] === CANNOT_BUILD) {
                        g.newEdge(bot, dy * 50 + dx, infini);
                    }
                }
            }
            else if (roomArray[x][y] === CANNOT_BUILD) { // near Exit
                g.newEdge(top, sink, infini);
            }
        }
    } // graph finished
    return g;
}
exports.createGraph = createGraph;
/**
 * Main function to be called by user: calculate min cut tiles from room using rectangles as protected areas
 * @param room - the room to use
 * @param rectangles - the areas to protect, defined as rectangles
 * @param bounds - the area to be considered for the minCut
 */
function getCutTiles(roomName, toProtect, bounds) {
    if (bounds === void 0) { bounds = { x1: 0, y1: 0, x2: 49, y2: 49 }; }
    var graph = createGraph(roomName, toProtect, bounds);
    if (!graph) {
        return [];
    }
    var x;
    var y;
    var source = 2 * 50 * 50; // Position Source / Sink in Room-Graph
    var sink = 2 * 50 * 50 + 1;
    var count = graph.calcMinCut(source, sink);
    // console.log('Number of Tiles in Cut:', count);
    var positions = [];
    if (count > 0) {
        var cutVertices = graph.getMinCut(source);
        var v = void 0;
        for (var _i = 0, cutVertices_1 = cutVertices; _i < cutVertices_1.length; _i++) {
            v = cutVertices_1[_i];
            // x= vertex % 50  y=v/50 (math.floor?)
            x = v % 50;
            y = Math.floor(v / 50);
            positions.push({ x: x, y: y });
        }
    }
    // Visualise Result
    if (positions.length > 0) {
        var visual = new RoomVisual(roomName);
        for (var i = positions.length - 1; i >= 0; i--) {
            visual.circle(positions[i].x, positions[i].y, { radius: 0.5, fill: '#ff7722', opacity: 0.9 });
        }
    }
    else {
        return [];
    }
    var wholeRoom = bounds.x1 === 0 && bounds.y1 === 0 && bounds.x2 === 49 && bounds.y2 === 49;
    return wholeRoom ? positions : pruneDeadEnds(roomName, positions);
}
exports.getCutTiles = getCutTiles;
/**
 * Removes unnecessary tiles if they are blocking the path to a dead end
 * Useful if minCut has been run on a subset of the room
 * @param roomName - Room to work in
 * @param cutTiles - Array of tiles which are in the minCut
 */
function pruneDeadEnds(roomName, cutTiles) {
    // Get Terrain and set all cut-tiles as unwalkable
    var roomArray = get2DArray(roomName);
    var tile;
    for (var _i = 0, cutTiles_1 = cutTiles; _i < cutTiles_1.length; _i++) {
        tile = cutTiles_1[_i];
        roomArray[tile.x][tile.y] = UNWALKABLE;
    }
    // Floodfill from exits: save exit tiles in array and do a BFS-like search
    var unvisited = [];
    var y;
    var x;
    for (y = 0; y < 49; y++) {
        if (roomArray[0][y] === EXIT) {
            console.log('prune: toExit', 0, y);
            unvisited.push(50 * y);
        }
        if (roomArray[49][y] === EXIT) {
            console.log('prune: toExit', 49, y);
            unvisited.push(50 * y + 49);
        }
    }
    for (x = 0; x < 49; x++) {
        if (roomArray[x][0] === EXIT) {
            console.log('prune: toExit', x, 0);
            unvisited.push(x);
        }
        if (roomArray[x][49] === EXIT) {
            console.log('prune: toExit', x, 49);
            unvisited.push(2450 + x); // 50*49=2450
        }
    }
    // Iterate over all unvisited EXIT tiles and mark neigbours as EXIT tiles if walkable, add to unvisited
    var surr = [[0, -1], [-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1]];
    var currPos;
    var dx;
    var dy;
    while (unvisited.length > 0) {
        currPos = unvisited.pop();
        x = currPos % 50;
        y = Math.floor(currPos / 50);
        for (var i = 0; i < 8; i++) {
            dx = x + surr[i][0];
            dy = y + surr[i][1];
            if (dx < 0 || dx > 49 || dy < 0 || dy > 49) {
                continue;
            }
            if (roomArray[dx][dy] === NORMAL || roomArray[dx][dy] === CANNOT_BUILD) {
                unvisited.push(50 * dy + dx);
                roomArray[dx][dy] = EXIT;
            }
        }
    }
    // Remove min-Cut-Tile if there is no EXIT reachable by it
    var leadsToExit = false;
    var validCut = [];
    for (var _a = 0, cutTiles_2 = cutTiles; _a < cutTiles_2.length; _a++) {
        tile = cutTiles_2[_a];
        leadsToExit = false;
        for (var j = 0; j < 8; j++) {
            dx = tile.x + surr[j][0];
            dy = tile.y + surr[j][1];
            if (roomArray[dx][dy] === EXIT) {
                leadsToExit = true;
            }
        }
        if (leadsToExit) {
            validCut.push(tile);
        }
    }
    return validCut;
}
exports.pruneDeadEnds = pruneDeadEnds;
/**
 * Example function: demonstrates how to get a min cut with 2 rectangles, which define a "to protect" area
 * @param roomName - the name of the room to use for the test, must be visible
 */
function test(roomName, rectArray= []) {
    var room = Game.rooms[roomName];
    if (!room) {
        return 'O noes, no room';
    }
    var cpu = Game.cpu.getUsed();
    // Rectangle Array, the Rectangles will be protected by the returned tiles
    //var rectArray = [];
    //rectArray.push({ x1: 29, y1: 12, x2: 35, y2: 18 });
    // Get Min cut
    var positions = getCutTiles(roomName, rectArray); // Positions is an array where to build walls/ramparts
    // Test output
    console.log('Positions returned', positions.length);
    cpu = Game.cpu.getUsed() - cpu;
    console.log('Needed', cpu, ' cpu time');
    return 'Finished';
}
exports.test = test;
/**
 * Example function: demonstrates how to get a min cut with 2 rectangles, which define a "to protect" area
 * while considering a subset of the larger room.
 * @param roomName - the name of the room to use for the test, must be visible
 */
function testSubset(roomName) {
    var room = Game.rooms[roomName];
    if (!room) {
        return 'O noes, no room';
    }
    var cpu = Game.cpu.getUsed();
    // Rectangle Array, the Rectangles will be protected by the returned tiles
    var rectArray = [];
    rectArray.push({ x1: 29, y1: 12, x2: 35, y2: 18 });
    rectArray.push({ x1: 33, y1: 27, x2: 39, y2: 33 });
    // Get Min cut, returns the positions where ramparts/walls need to be
    var positions = getCutTiles(roomName, rectArray, { x1: 5, y1: 5, x2: 44, y2: 44 });
    // Test output
    console.log('Positions returned', positions.length);
    cpu = Game.cpu.getUsed() - cpu;
    console.log('Needed', cpu, ' cpu time');
    return 'Finished';
}

//////////////////////////////////////////////////////////////////////////////////////////// my funcs
exports.floodFill = floodFill;
/**
 * floodfill from https://files.slack.com/files-pri/T0HJCPP9T-F01CZ54SU2G/floodFill.js
 * @param roomName - the name of the room to use for the test, must be visible
 */
function floodFill(roomName) {

    const room = Game.rooms[roomName];

    const walls = room.find(FIND_STRUCTURES, {
        filter: structure => [STRUCTURE_WALL, STRUCTURE_RAMPART].includes(structure.structureType)
    }
    );

    const terrain = new Room.Terrain(roomName);

    const startTime = Game.cpu.getUsed();

    const matrix = new PathFinder.CostMatrix();

    walls.forEach(wall => {
        matrix.set(wall.pos.x, wall.pos.y, 255);
    });

    const queue = [];
    for (let i = 0; i < 49; i++) {
        if (terrain.get(i, 0) !== TERRAIN_MASK_WALL) {
            matrix.set(i, 0, 1);
            queue.push([i, 0]);
        }
        if (terrain.get(i, 49) !== TERRAIN_MASK_WALL) {
            matrix.set(i, 49, 1);
            queue.push([i, 49]);
        }
        if (terrain.get(0, i) !== TERRAIN_MASK_WALL) {
            matrix.set(0, i, 1);
            queue.push([0, i]);
        }
        if (terrain.get(49, i) !== TERRAIN_MASK_WALL) {
            matrix.set(49, i, 1);
            queue.push([49, i]);
        }
    }

    while (queue.length > 0) {
        const length = queue.length;
        for (let i = 0; i < length; i++) {
            const [x, y] = queue[i];

            for (let dx = x - 1; dx <= x + 1; dx++) {
                for (let dy = y - 1; dy <= y + 1; dy++) {
                    if (
                        dx > 0 && dx < 49 && dy > 0 && dy < 49 &&
                        matrix.get(dx, dy) === 0 &&
                        (terrain.get(dx, dy) & TERRAIN_MASK_WALL) === 0
                    ) {
                        matrix.set(dx, dy, 1);
                        queue.push([dx, dy]);
                    }
                }
            }
        }
        queue.splice(0, length);
    }

    console.log('cpu used:', Game.cpu.getUsed() - startTime);

    const visual = new RoomVisual(roomName);
    for (let x = 1; x < 49; x++) {
        for (let y = 1; y < 49; y++) {
            if (matrix.get(x, y) === 1) {
                visual.circle();
                visual.circle(x, y, { radius: 0.2, fill: 'white', opacity: 0.6 });
            }
        }
    }
};

// main func **************************************************************************************************** main func
exports.planEverythingInRoom = planEverythingInRoom;
/**
 * my own function
 * @param roomName - the name of the room to use for the test, must be visible
 */
function planEverythingInRoom(roomName) {
    let planL = 6

    let info = calcBaseTopLeftCorner(roomName, planL);
    //let info = calcBaseBotLeftCorner(roomName, planL);
    //let info = calcBaseTopRightCorner(roomName, planL);
    //let info = calcBaseBotRightCorner(roomName, planL);

    if (info) {
        let rectArray = [];
        rectArray.push({ x1: info[0][0], y1: info[0][1], x2: info[0][0] + planL, y2: info[0][1] + planL });
        rectArray.push({ x1: info[1][0], y1: info[1][1], x2: info[1][0] + planL, y2: info[1][1] + planL });

        test(roomName, rectArray);
    }
    else {
        fo('no valid location found');
	}
}


exports.unbi = unbi;
/**
 * my own function, calc two base square posibility of the top left corner
 * @param roomName - the name of the room to use for the test, must be visible
 */
function unbi(roomName) {
    let planL = 6;
    // scan x1, y1 in 0, 25-7
    for (let x1 = 0; x1 < 25; x1++) {
        for (let y1 = 0; y1 < 25; y1++) {
            // find a 6*6 box
            let emptyCount = 0;
            for (let xi = x1; xi < (x1 + planL); xi++) {
                for (let yi = y1; yi < (y1 + planL); yi++) {
                    let terrain = Game.map.getRoomTerrain(roomName);
                    if ((terrain.get(xi, yi) !== TERRAIN_MASK_WALL)) {
                        emptyCount++;
                    }
                }
            }
            if (emptyCount == planL ** 2) {
                fo(x1);
                fo(y1);
                return
            }
        }
    }
}

exports.rotateCC90Deg = rotateCC90Deg;
function rotateCC90Deg(t) {
    let newT = {}
    for (let x1 = 0; x1 < 49; x1++) {
        for (let y1 = 0; y1 < 49; y1++) {
            newT[convertIntXYToString(y1, 49 - x1 - 1)] = t[convertIntXYToString(x1, y1)];
        }
    }
    return newT
}

function convertIntXYToString(x, y) {
    return x.toString + '_' + y.toString()
}

function converStringToIntXy(s) {
    [x, y] = s.split('_');
    return [parseInt(x), parseInt(y)]
}

exports.generateRectArrayForMinCut = generateRectArrayForMinCut;
function generateRectArrayForMinCut(pos) {
    let rinc = 3;
    let x = pos.x;
    let y = pos.y
    let rec = [];
    // core res part
    rec.push({ x1: x-3-rinc, y1: y-3-rinc, x2: x+7+rinc, y2: y+3+rinc });
    // core energy part
    rec.push({ x1: x-1-rinc, y1: y-7-rinc, x2: x+5+rinc, y2: y+rinc });
    return rec
}

//////////////////////////////////////// dumb ///////////////////////////////////////////////
exports.calcBaseTopLeftCorner = calcBaseTopLeftCorner;
/**
 * my own function, calc two base square posibility of the top left corner
 * @param roomName - the name of the room to use for the test, must be visible
 */
function calcBaseTopLeftCorner(roomName, planL) {
    var cpu = Game.cpu.getUsed();
    // scan x1, y1 in 0, 25-7

    // let terrain_ori = Game.map.getRoomTerrain(roomName);
    // let terrain = rotateCC90Deg(terrain_ori, terrain_ori)
    
    let terrain = Game.map.getRoomTerrain(roomName);

    let excludeTiles = [];
    for (let i = 0; i < 49; i++) {
        if (terrain.get(i, 0) !== TERRAIN_MASK_WALL) {
            for (let dx = -3; dx < 4; dx++) {
                for (let dy = -3; dy < 4; dy++) {
                    let x = i + dx;
                    let y = 0 + dy;
                    if (((x >= 0) || (x <= 49)) && ((y >= 0) || (y <= 49))) {
                        excludeTiles.push(x.toString() + '_' +  y.toString());
					}
                }
			}
        }
        if (terrain.get(i, 49) !== TERRAIN_MASK_WALL) {
            for (let dx = -3; dx < 4; dx++) {
                for (let dy = -3; dy < 4; dy++) {
                    let x = i + dx;
                    let y = 49 + dy;
                    if (((x >= 0) || (x <= 49)) && ((y >= 0) || (y <= 49))) {
                        excludeTiles.push(x.toString() + '_' + y.toString());
                    }
                }
            }        }
        if (terrain.get(0, i) !== TERRAIN_MASK_WALL) {
            for (let dx = -3; dx < 4; dx++) {
                for (let dy = -3; dy < 4; dy++) {
                    let x = 0 + dx;
                    let y = i + dy;
                    if (((x >= 0) || (x <= 49)) && ((y >= 0) || (y <= 49))) {
                        excludeTiles.push(x.toString() + '_' + y.toString());
                    }
                }
            }        }
        if (terrain.get(49, i) !== TERRAIN_MASK_WALL) {
            for (let dx = -3; dx < 4; dx++) {
                for (let dy = -3; dy < 4; dy++) {
                    let x = 49 + dx;
                    let y = i + dy;
                    if (((x >= 0) || (x <= 49)) && ((y >= 0) || (y <= 49))) {
                        excludeTiles.push(x.toString() + '_' + y.toString());
                    }
                }
            }
        }
    }

    for (let x1 = 0; x1 < 25; x1++) {
        for (let y1 = 0; y1 < 25; y1++) {
            
                // find a 6*6 box
                let emptyCount = 0;
                for (let xi = x1; xi < (x1 + planL); xi++) {
                    for (let yi = y1; yi < (y1 + planL); yi++) {
                        if (!excludeTiles.includes(xi.toString() + '_' + yi.toString())) {
                            if ((terrain.get(xi, yi) !== TERRAIN_MASK_WALL)) {
                                emptyCount++;
                            }
                        }
                    }
                }
                if (emptyCount == planL ** 2) { // if found, find another 6*6 box in this quater
                    for (let x2 = x1 + planL; x2 < 25; x2++) {
                        for (let y2 = 0; y2 < 25; y2++) {
                            // find a 6*6 box
                            let emptyCount2 = 0;
                            for (let xii = x2; xii < (x2 + planL); xii++) {
                                for (let yii = y2; yii < (y2 + planL); yii++) {
                                    if (!excludeTiles.includes(xii.toString() + '_' + yii.toString())) {
                                        if (!(terrain.get(xii, yii) == TERRAIN_MASK_WALL)) {
                                            emptyCount2++;
                                        }
                                    }
                                }
                            }
                            if (emptyCount2 == planL ** 2) {
                                cpu = Game.cpu.getUsed() - cpu;
                                console.log('First type got. Needed', cpu, ' cpu time');
                                return [[x1, y1], [x2, y2]]
                            }
                        }
                    }
                    for (let x2 = 0; x2 < x1 + planL; x2++) {
                        for (let y2 = y1 + planL; y2 < 25; y2++) {
                            // find a 6*6 box
                            let emptyCount3 = 0;
                            for (let xii = x2; xii < (x2 + planL); xii++) {
                                for (let yii = y2; yii < (y2 + planL); yii++) {
                                    if (!excludeTiles.includes(xii.toString() + '_' + yii.toString())) {
                                        if (!(terrain.get(xii, yii) == TERRAIN_MASK_WALL)) {
                                            emptyCount2++;
                                        }
                                    }
                                }
                            }
                            if (emptyCount3 == planL ** 2) {
                                cpu = Game.cpu.getUsed() - cpu;
                                console.log('Second type got. Needed', cpu, ' cpu time');
                                return [[x1, y1], [x2, y2]]
                            }
                        }
                    }
                }
        }
    }
}



exports.testSubset = testSubset;
