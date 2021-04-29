// send minerals via terminal
//Game.rooms['E94N17'].terminal.send('GH',12013,'E91N16','have fun!')

// Game.rooms['E33S16'].terminal.send('H',46000,'E37S5')

// selling order
// Game.market.createOrder(ORDER_SELL, 'L', 0.15, 27000, "E92N11");

// deal
// Game.market.deal('5bc5a76dd4400e0258aa1b48', amountToSell, roomName)

var idealMineralBuyingPrices = {
  'H': 0.01,
  'O': 0.076,
  'U': 0.01
};

var idealMineralSellingPrices = {
  'H': 0.14, // show up as 0.6 on market and people tend to buy 0.6 than 0.7
  'O': 2,
  'U': 0.18,
  'energy': 0.01,
  'L': 0.1
};

var basicMinerals = ['H','O','Z','U','L','K','X','energy'];

var maxResourceKeep = {
  'energy': 60000,
  'basicMinerals': 16000,
  'valuableCompounds': 200000,
};

var energyPrice = 0.011;

global.checkMineralAndSell = function (roomName) {
    let room = Game.rooms[roomName];
    if (room.memory.mineralMining == undefined) {
        room.memory['mineralMining'] = room.find(FIND_MINERALS)[0].mineralType
    }
    else {
        let mineralType = room.memory.mineralMining;
        if (Game.rooms[roomName].terminal && Game.rooms[roomName].terminal.cooldown == 0) {
            for (const resourceType in Game.rooms[roomName].terminal.store) {
                var minMineralKeep;
                if (resourceType == 'energy') { // determine which type of resource and the maximum amount to keep in terminal
                    minMineralKeep = maxResourceKeep.energy;
                }
                else if (basicMinerals.includes(resourceType)) {
                    minMineralKeep = maxResourceKeep['basicMinerals'];
                }
                else {
                    minMineralKeep = maxResourceKeep['valuableCompounds'];
                }

                let mineralAmount = Game.rooms[roomName].terminal.store[resourceType];

                if (mineralAmount > minMineralKeep || _.sum(Game.rooms[roomName].terminal.store) > 270000) {
                    console.log(mineralAmount,minMineralKeep,resourceType);
                    const amountToSell = 5000;
                    let orders = Game.market.getAllOrders({ type: ORDER_BUY, resourceType: resourceType });
                    orders = _.filter(orders, o => o.amount > 5000);
                    let income = 0;
                    let orderId = undefined;

                    for (let i = 0; i < orders.length; i++) {
                        const transferEnergyCost = Game.market.calcTransactionCost(amountToSell, roomName, orders[i].roomName);
                        var mineralPrice = orders[i]['price'];
                        var transferCost = transferEnergyCost * energyPrice;
                        var totalInCome = amountToSell * mineralPrice;
                        if (totalInCome > income) {
                            income = totalInCome;
                            orderId = orders[i].id;
                        }
                        //var equivilantMineralPrice = (totalInCome-transferCost)/amountToSell;
                    }

                    if (orderId) {
                        if (Game.market.deal(orderId, amountToSell, roomName) == OK) {
                            console.log('no fucking way...')
                            console.log('super value sold ' + resourceType + '! ' + roomName + ' got ' + income + '(' + mineralPrice + '). order number: ' + orderId);
                        }
                    }
                }
                else {
                    //console.log('not enough '+mineralType);
                }
            }
        }
    }
}

global.checkTradingEnergyCostAndBuy = function(roomName,mineralType) {
    if (Game.rooms[roomName].terminal.cooldown == 0) {
      var terminalAmount = Game.rooms[roomName].terminal.store[mineralType];
      if (terminalAmount<maxMineralKeep[mineralType]) { // if stored amount is less than required amount
        const amountToBuy = 2000;
        const orders = Game.market.getAllOrders({type: ORDER_SELL, resourceType: mineralType});

        for(let i=0; i<orders.length; i++) {
          const transferEnergyCost = Game.market.calcTransactionCost(amountToBuy, roomName, orders[i].roomName);
          var mineralPrice = orders[i]['price'];
          var transferCost = transferEnergyCost*energyPrice;
          var moneySpendOnMineral = amountToBuy*mineralPrice;
          var equivilantMineralPrice = (transferCost + moneySpendOnMineral)/amountToBuy;

          if ( equivilantMineralPrice < idealMineralBuyingPrices[mineralType] ) {
              if (Game.market.deal(orders[i].id, amountToBuy, roomName)==OK) {
                  console.log('super value to buy '+mineralType+'! '+orders[i]['roomName']+' for '+equivilantMineralPrice+'('+mineralPrice+'). order number: '+orders[i].id);
                  break;
              }
          }
        }
      }
      else {
        //console.log('not enough '+mineralType);
      }
    }
}

/*global.getBasicMineralDeposite = function() {
    let basicMinerals = {'H':0,'O':0,'U':0,'L':0,'Z':0,'K':0,'X':0};
    for (let roomName of myRoomList()) {
        let room = Game.rooms[roomName];
        let terminal = room.terminal;
        for (let mineralType in basicMinerals) {
            if (terminal.store[mineralType]!=undefined) {
                basicMinerals[mineralType] += terminal.store[mineralType];
            }
        }
    }
    for (let mineralType in basicMinerals) {
        console.log(mineralType, basicMinerals[mineralType]);
    }
}
*/

global.balancingXGH2O = function() {
    let giver = Game.rooms.E91N16.terminal;
    let getter = Game.rooms.E99N17.terminal;
    if (giver.cooldown==0&&giver.store['XGH2O']>0) {
        Game.rooms['E91N16'].terminal.send('XGH2O',giver.store['XGH2O'],'E99N17','chu chu!')
    }
}

///////////////////////// move minerals between rooms  /////////////////////////////////////////////////////////////////////////
var mineralManagement = {
    'shard2': {
        'E39S1': [{ sendTo: ['E33S5'], mineralType: 'Z' }, { sendTo: ['E31S4'], mineralType: 'G' }],
        'E31S11': [{sendTo:['E31S1','E31S4'],mineralType:'H'}],
        'E35S7': [{sendTo:['E39S1'],mineralType:'UL'},{sendTo:['E33S5'],mineralType:'K'}],
        'E33S5': [{ sendTo: ['E39S1'], mineralType: 'ZK' }, { sendTo: ['E35S7'], mineralType: 'L' }],
        'E33S16': [{ sendTo: ['E35S7'], mineralType: 'U' }],
        'E31S4': [{ sendTo: ['E33S16'], mineralType: 'LHO2' },{ sendTo: ['E35S3'], mineralType: 'GH' }],
        'E31S1': [{ sendTo: ['E35S3'], mineralType: 'OH' }],
        'E35S3': [{ sendTo: ['E31S4','E31S1'], mineralType: 'H'},{ sendTo: ['E31S4'], mineralType: 'G'},],
    },

    'shard1': {
        'E49N1': [{ sendTo: ['E39S1'], mineralType: 'H' }],
        'E39S1': [{ sendTo: ['E49N1'], mineralType: 'energy' }],
    },
};

global.mineralFlow = function(giverRoomName, getterRoomName, mineralType) {
    let giver = Game.rooms[giverRoomName].terminal;
    let getter = Game.rooms[getterRoomName].terminal;
    let err_message = undefined;

    if ( (giver.store[mineralType] > 10000) && (_.sum(getter.store) < 250000) && (getter.store[mineralType]==undefined||getter.store[mineralType] < 50000)) {
        err_message = giver.send(mineralType,10000,getterRoomName,'trans mineral');
        console.log(giverRoomName+' sent '+mineralType+' to '+getterRoomName+': '+err_message);
    }
    return err_message
}

global.manageMineral = function(shardName) {
    let mineralManagementInShard = mineralManagement[shardName];
    for (let giverRoomName in mineralManagementInShard) {
        console.log('check '+giverRoomName+' mineral and prepare to send...');
        for (let task of mineralManagementInShard[giverRoomName]) {
            let err_message=undefined;
            for (let getterRoomName of task.sendTo) {
                //console.log(giverRoomName+' send '+task.mineralType+' to '+getterRoomName);
                err_message = mineralFlow(giverRoomName,getterRoomName,task.mineralType);
                console.log('send '+task.mineralType+' to '+getterRoomName+' '+err_message);
            }
            if (err_message==0) { // if mineral sent, break
                break;
            }
        }
    }
}

global.distributeMineralFromOneRoomToAllOtherRooms = function(mineralType,giverRoomName) {
    for (let roomName of myRoomList()) {
        let terminal = Game.rooms[roomName].terminal;
        if (terminal&&roomName!=giverRoomName&&(terminal.store[mineralType]==undefined||terminal.store[mineralType]<5000)) {
            if (Game.rooms[giverRoomName].terminal.send(mineralType,5000,roomName,'BOOM!')==0) {
                console.log(giverRoomName+' sent '+mineralType+' to '+ roomName);
                break;
            }
        }
    }
}

global.allMyResourceInStorageAndTerminal = function (room, resourceType) {
    let value = 0;
    if (room.terminal) {
        if (room.terminal.store[resourceType]) {
            value = value + room.terminal.store[resourceType];
        }
    }
    if (room.storage) {
        if (room.storage.store[resourceType]) {
            value = value + room.storage.store[resourceType];
        }
    }
    return value
}

///////////////////////////////// new mineral management code ///////////////////////////////////

// define minerals keep variables
// terminal threshold: mineral to store in terminal, if higher, move to storage, transfer to other rooms, sell
// storage store threshold: minerals to store in storage, if higher, move to terminal and transfer to other rooms or start placing sell orders
// market threshold: if total minerals too high in room, sell imediately
global.initiateMineralKeepThresholdInRoom = function (room,reassign) {
    let mineralThresholdObject = room.memory.mineralThresholds;
    if (!mineralThresholdObject||reassign) {
    //if (true) {
        room.memory.mineralThresholds = {};
        room.memory.mineralThresholds.terminalThreshold = {
            "energy": 20000,
            "power": 10000,

            "H": 10000,
            "O": 10000,
            "U": 10000,
            "L": 10000,
            "K": 10000,
            "Z": 10000,
            "X": 10000,
            "G": 10000,

            "OH": 5000,
            "ZK": 5000,
            "UL": 5000,

            "UH": 3000,
            "UO": 3000,
            "KH": 3000,
            "KO": 3000,
            "LH": 3000,
            "LO": 3000,
            "ZH": 3000,
            "ZO": 3000,
            "GH": 3000,
            "GO": 3000,

            "UH2O": 3000,
            "UHO2": 3000,
            "KH2O": 3000,
            "KHO2": 3000,
            "LH2O": 3000,
            "LHO2": 3000,
            "ZH2O": 3000,
            "ZHO2": 3000,
            "GH2O": 3000,
            "GHO2": 3000,

            "XUH2O": 3000,
            "XUHO2": 3000,
            "XKH2O": 3000,
            "XKHO2": 3000,
            "XLH2O": 3000,
            "XLHO2": 3000,
            "XZH2O": 3000,
            "XZHO2": 3000,
            "XGH2O": 3000,
            "XGHO2": 3000,
        };

        room.memory.mineralThresholds.storageThreshold = {
            "energy": 300000,
            "power": 50000,

            "H": 30000,
            "O": 30000,
            "U": 30000,
            "L": 30000,
            "K": 30000,
            "Z": 30000,
            "X": 30000,
            "G": 30000,

            "OH": 15000,
            "ZK": 15000,
            "UL": 15000,

            "UH": 10000,
            "UO": 10000,
            "KH": 10000,
            "KO": 10000,
            "LH": 10000,
            "LO": 10000,
            "ZH": 10000,
            "ZO": 10000,
            "GH": 10000,
            "GO": 10000,

            "UH2O": 10000,
            "UHO2": 10000,
            "KH2O": 10000,
            "KHO2": 10000,
            "LH2O": 10000,
            "LHO2": 10000,
            "ZH2O": 10000,
            "ZHO2": 10000,
            "GH2O": 10000,
            "GHO2": 10000,

            "XUH2O": 6000,
            "XUHO2": 6000,
            "XKH2O": 6000,
            "XKHO2": 6000,
            "XLH2O": 6000,
            "XLHO2": 6000,
            "XZH2O": 6000,
            "XZHO2": 6000,
            "XGH2O": 6000,
            "XGHO2": 6000,
        };

        /*room.memory.mineralThresholds.storageThreshold = {
            "energy": 600000,
            "power": 100000,

            "H": 10000,
            "O": 10000,
            "U": 10000,
            "L": 10000,
            "K": 10000,
            "Z": 10000,
            "X": 10000,
            "G": 10000,

            "OH": 10000,
            "ZK": 5000,
            "UL": 5000,

            "UH": 5000,
            "UO": 5000,
            "KH": 5000,
            "KO": 5000,
            "LH": 5000,
            "LO": 5000,
            "ZH": 5000,
            "ZO": 5000,
            "GH": 5000,
            "GO": 5000,

            "UH2O": 5000,
            "UHO2": 5000,
            "KH2O": 5000,
            "KHO2": 5000,
            "LH2O": 5000,
            "LHO2": 5000,
            "ZH2O": 5000,
            "ZHO2": 5000,
            "GH2O": 5000,
            "GHO2": 5000,

            "XUH2O": 5000,
            "XUHO2": 5000,
            "XKH2O": 5000,
            "XKHO2": 5000,
            "XLH2O": 5000,
            "XLHO2": 5000,
            "XZH2O": 5000,
            "XZHO2": 5000,
            "XGH2O": 5000,
            "XGHO2": 5000,
        };*/

        room.memory.mineralThresholds.marketThreshold = {
            "energy": 1000000,
            "power": 1000000,

            "H": 1000000,
            "O": 1000000,
            "U": 1000000,
            "L": 1000000,
            "K": 1000000,
            "Z": 1000000,
            "X": 1000000,
            "G": 1000000,

            "OH": 1000000,
            "ZK": 1000000,
            "UL": 1000000,

            "UH": 1000000,
            "UO": 1000000,
            "KH": 1000000,
            "KO": 1000000,
            "LH": 1000000,
            "LO": 1000000,
            "ZH": 1000000,
            "ZO": 1000000,
            "GH": 1000000,
            "GO": 1000000,

            "UH2O": 1000000,
            "UHO2": 1000000,
            "KH2O": 1000000,
            "KHO2": 1000000,
            "LH2O": 1000000,
            "LHO2": 1000000,
            "ZH2O": 1000000,
            "ZHO2": 1000000,
            "GH2O": 1000000,
            "GHO2": 1000000,

            "XUH2O": 1000000,
            "XUHO2": 1000000,
            "XKH2O": 1000000,
            "XKHO2": 1000000,
            "XLH2O": 1000000,
            "XLHO2": 1000000,
            "XZH2O": 1000000,
            "XZHO2": 1000000,
            "XGH2O": 1000000,
            "XGHO2": 1000000,
        };
    }
}

// for shooter rooms
global.initiateMineralKeepThresholdForShooterRoom = function (room,reassign) {
    let mineralThresholdObject = room.memory.mineralThresholds;
    if (!mineralThresholdObject||reassign) {
    //if (true) {
        room.memory.mineralThresholds = {};
        room.memory.mineralThresholds.terminalThreshold = {
            "energy": 250000,
            "power": 0,

            "H": 0,
            "O": 0,
            "U": 0,
            "L": 0,
            "K": 0,
            "Z": 0,
            "X": 0,
            "G": 0,

            "OH": 0,
            "ZK": 0,
            "UL": 0,

            "UH": 0,
            "UO": 0,
            "KH": 0,
            "KO": 0,
            "LH": 0,
            "LO": 0,
            "ZH": 0,
            "ZO": 0,
            "GH": 0,
            "GO": 0,

            "UH2O": 0,
            "UHO2": 0,
            "KH2O": 0,
            "KHO2": 0,
            "LH2O": 0,
            "LHO2": 0,
            "ZH2O": 0,
            "ZHO2": 0,
            "GH2O": 0,
            "GHO2": 0,

            "XUH2O": 0,
            "XUHO2": 0,
            "XKH2O": 0,
            "XKHO2": 0,
            "XLH2O": 0,
            "XLHO2": 0,
            "XZH2O": 0,
            "XZHO2": 0,
            "XGH2O": 20000,
            "XGHO2": 0,
        };

        room.memory.mineralThresholds.storageThreshold = {
            "energy": 1300000,
            "power": 0,

            "H": 0,
            "O": 0,
            "U": 0,
            "L": 0,
            "K": 0,
            "Z": 0,
            "X": 0,
            "G": 0,

            "OH": 0,
            "ZK": 0,
            "UL": 0,

            "UH": 0,
            "UO": 0,
            "KH": 0,
            "KO": 0,
            "LH": 0,
            "LO": 0,
            "ZH": 0,
            "ZO": 0,
            "GH": 0,
            "GO": 0,

            "UH2O": 0,
            "UHO2": 0,
            "KH2O": 0,
            "KHO2": 0,
            "LH2O": 0,
            "LHO2": 0,
            "ZH2O": 0,
            "ZHO2": 0,
            "GH2O": 0,
            "GHO2": 0,

            "XUH2O": 0,
            "XUHO2": 0,
            "XKH2O": 0,
            "XKHO2": 0,
            "XLH2O": 0,
            "XLHO2": 0,
            "XZH2O": 0,
            "XZHO2": 0,
            "XGH2O": 300000,
            "XGHO2": 0,
        };

        /*room.memory.mineralThresholds.storageThreshold = {
            "energy": 600000,
            "power": 100000,

            "H": 10000,
            "O": 10000,
            "U": 10000,
            "L": 10000,
            "K": 10000,
            "Z": 10000,
            "X": 10000,
            "G": 10000,

            "OH": 10000,
            "ZK": 5000,
            "UL": 5000,

            "UH": 5000,
            "UO": 5000,
            "KH": 5000,
            "KO": 5000,
            "LH": 5000,
            "LO": 5000,
            "ZH": 5000,
            "ZO": 5000,
            "GH": 5000,
            "GO": 5000,

            "UH2O": 5000,
            "UHO2": 5000,
            "KH2O": 5000,
            "KHO2": 5000,
            "LH2O": 5000,
            "LHO2": 5000,
            "ZH2O": 5000,
            "ZHO2": 5000,
            "GH2O": 5000,
            "GHO2": 5000,

            "XUH2O": 5000,
            "XUHO2": 5000,
            "XKH2O": 5000,
            "XKHO2": 5000,
            "XLH2O": 5000,
            "XLHO2": 5000,
            "XZH2O": 5000,
            "XZHO2": 5000,
            "XGH2O": 5000,
            "XGHO2": 5000,
        };*/

        room.memory.mineralThresholds.marketThreshold = {
            "energy": 1300000,
            "power": 1000000,

            "H": 1000000,
            "O": 1000000,
            "U": 1000000,
            "L": 1000000,
            "K": 1000000,
            "Z": 1000000,
            "X": 1000000,
            "G": 1000000,

            "OH": 1000000,
            "ZK": 1000000,
            "UL": 1000000,

            "UH": 1000000,
            "UO": 1000000,
            "KH": 1000000,
            "KO": 1000000,
            "LH": 1000000,
            "LO": 1000000,
            "ZH": 1000000,
            "ZO": 1000000,
            "GH": 1000000,
            "GO": 1000000,

            "UH2O": 1000000,
            "UHO2": 1000000,
            "KH2O": 1000000,
            "KHO2": 1000000,
            "LH2O": 1000000,
            "LHO2": 1000000,
            "ZH2O": 1000000,
            "ZHO2": 1000000,
            "GH2O": 1000000,
            "GHO2": 1000000,

            "XUH2O": 1000000,
            "XUHO2": 1000000,
            "XKH2O": 1000000,
            "XKHO2": 1000000,
            "XLH2O": 1000000,
            "XLHO2": 1000000,
            "XZH2O": 1000000,
            "XZHO2": 1000000,
            "XGH2O": 1000000,
            "XGHO2": 1000000,
        };
    }
}

global.changeThresholdOfAParticularResource = function (roomName, res, Tthresh, Sthresh, Mthresh) {
    let mineralThresholds = room.memory.mineralThresholds;
    if (!mineralThresholds) {
        console.log('define room mineral threshold object first!')
    }

    else {
        room.memory.mineralThresholds.terminalThreshold = Tthresh;
        room.memory.mineralThresholds.storageThreshold = Sthresh;
        room.memory.mineralThresholds.marketThreshold = Mthresh;
    }
}

global.allMineralsSituation = function (room) {
    let storageSituation = {};
    for (let mineralType in room.memory.mineralThresholds.storageThreshold) {
        storageSituation[mineralType] = allMyResourceInStorageAndTerminal(room, mineralType);
    }
    room.memory.mineralThresholds['currentMineralStats'] = storageSituation;
    /*for (let mineralType in storageSituation) {
        console.log(mineralType + ' ' + storageSituation[mineralType]);
    }*/
    return storageSituation
}

// managing minerals main function
global.superEverthingManagement = function (room) {
    //console.log('in superEverthingManagement function of room ' + room.name);
    let shardName = Game.shard.name;
    let roomName = room.name;
    let terminal = room.terminal;
    let storage = room.storage;

    let terminalThreshold = room.memory.mineralThresholds.terminalThreshold;
    let storageThreshold = room.memory.mineralThresholds.storageThreshold;
    let marketThreshold = room.memory.mineralThresholds.marketThreshold;

    if (terminal && storage) { // if room has terminal and storage
        // calculate all mineral situation
        let allMineralStituationObject = room.memory.mineralThresholds.currentMineralStats;

        // check each mineral in terminal

        for (let mineralType in terminal.store) {
            if (mineralType == 'XGH2O') {
                if (Memory.myShooterRoomList) {
                    let myShooterRoomsInShard = Memory.myShooterRoomList[shardName].slice();
                    // before sending XGH2O to shooter rooms, send to low lvl rooms first
                    let myOtherNoneShooterRoomsInShard = Memory.myRoomList[shardName].slice();
                    let myOtherNoneShooterRoomsInShardLvl67 = [];
                    for (let myOtherNoneShooterRoomInShard of myOtherNoneShooterRoomsInShard) {
                        if (Game.rooms[myOtherNoneShooterRoomInShard].controller.level == 6 || Game.rooms[myOtherNoneShooterRoomInShard].controller.level == 7) {
                            myOtherNoneShooterRoomsInShardLvl67.concat(myOtherNoneShooterRoomInShard);
                        }
                    }
                    if (myOtherNoneShooterRoomsInShardLvl67.length > 0) {
                        // send XGH2O to none lvl 8 normal rooms
                        for (let shooterRoomName of myOtherNoneShooterRoomsInShardLvl67) {
                            if (shooterRoomName != roomName) { // avoid self-transfer
                                let shooterRoom = Game.rooms[shooterRoomName];
                                if (shooterRoom.terminal && shooterRoom.storage && shooterRoom.terminal.isActive()) {
                                    // if find room that has storage allwance, transfer to that room
                                    //console.log(roomName,otherRoomName, mineralType, otherRoom.memory.mineralThresholds.currentMineralStats[mineralType], otherRoomStorageThreshold[mineralType])
                                    let otherRoomStorageThreshold = shooterRoom.memory.mineralThresholds.storageThreshold;
                                    let mineralLackageInOtherRoom = otherRoomStorageThreshold[mineralType] - shooterRoom.memory.mineralThresholds.currentMineralStats[mineralType];
                                    let availableMineralAmountToSend = terminal.store[mineralType]; // - terminalThreshold[mineralType];
                                    if (availableMineralAmountToSend > 100 && mineralLackageInOtherRoom > 0 && shooterRoom.memory.mineralThresholds.currentMineralStats[mineralType] < otherRoomStorageThreshold[mineralType]) {
                                        let spareSpaceInOtherStorage = (300000 - _.sum(shooterRoom.terminal.store)) / 2;
                                        // special case for energy
                                        let amountToSend = Math.min(spareSpaceInOtherStorage, availableMineralAmountToSend, mineralLackageInOtherRoom);
                                        if (amountToSend < 100) {
                                            amountToSend = 100;
                                        }
                                        if (terminal.send(mineralType, amountToSend, shooterRoomName) == OK) {
                                            console.log(roomName + ' sent ' + amountToSend + ' ' + mineralType + ' to ' + shooterRoomName);
                                            return
                                        }
                                        else {
                                            console.log(roomName + ' sent ' + amountToSend + ' ' + mineralType + ' to ' + shooterRoomName + ' failed.');
                                            return
                                        }
                                    }
                                }
                                else {
                                    console.log('shooter room ' + shooterRoomName + ' does not have storage or terminal');
                                }
                            }
                        }
                    }

                    // send XGH2O to shooter rooms after none lvl 8 normal rooms are fed
                    for (let shooterRoomName of myShooterRoomsInShard) {
                        if (shooterRoomName != roomName) { // avoid self-transfer
                            let shooterRoom = Game.rooms[shooterRoomName];
                            if (shooterRoom.terminal && shooterRoom.storage && shooterRoom.terminal.isActive()) {
                                // if find room that has storage allwance, transfer to that room
                                //console.log(roomName,otherRoomName, mineralType, otherRoom.memory.mineralThresholds.currentMineralStats[mineralType], otherRoomStorageThreshold[mineralType])
                                let otherRoomStorageThreshold = shooterRoom.memory.mineralThresholds.storageThreshold;
                                let mineralLackageInOtherRoom = otherRoomStorageThreshold[mineralType] - shooterRoom.memory.mineralThresholds.currentMineralStats[mineralType];
                                let availableMineralAmountToSend = terminal.store[mineralType]; // - terminalThreshold[mineralType];
                                if (availableMineralAmountToSend > 100 && mineralLackageInOtherRoom > 0 && shooterRoom.memory.mineralThresholds.currentMineralStats[mineralType] < otherRoomStorageThreshold[mineralType]) {
                                    let spareSpaceInOtherStorage = (300000 - _.sum(shooterRoom.terminal.store)) / 2;
                                    // special case for energy
                                    let amountToSend = Math.min(spareSpaceInOtherStorage, availableMineralAmountToSend, mineralLackageInOtherRoom);
                                    if (amountToSend < 100) {
                                        amountToSend = 100;
                                    }
                                    if (terminal.send(mineralType, amountToSend, shooterRoomName) == OK) {
                                        console.log(roomName + ' sent ' + amountToSend + ' ' + mineralType + ' to ' + shooterRoomName);
                                        return
                                    }
                                    else {
                                        console.log(roomName + ' sent ' + amountToSend + ' ' + mineralType + ' to ' + shooterRoomName + ' failed.');
                                        return
                                    }
                                }
                            }
                            else {
                                console.log('shooter room ' + shooterRoomName + ' does not have storage or terminal');
                            }
                        }
                    }
                }
            }
            else {
                // if one is higher than the threshold
                if (terminal.store[mineralType] > terminalThreshold[mineralType]) {
                    // if greater than market threshold
                    if (allMineralStituationObject[mineralType] > marketThreshold[mineralType]) {
                        console.log('Please finish coding marketThreshold section in myTrading.js');
                        // if find room that has storage allwance, transfer to that room
                        // else, sell
                    }
                    // else if greater than storage threshold
                    else if (allMineralStituationObject[mineralType] > storageThreshold[mineralType]) {
                        //console.log(room.name, mineralType)
                        let myRoomsInShard = Memory.myRoomList[shardName].slice();
                        let myOtherRoomsInShard = shuffleArray(deleteElementFromArray(myRoomsInShard, roomName));
                        if (myOtherRoomsInShard.length !== 0) { // if there are other main rooms
                            for (let otherRoomName of myOtherRoomsInShard) {
                                let otherRoom = Game.rooms[otherRoomName];
                                let otherRoomStorageThreshold = otherRoom.memory.mineralThresholds.storageThreshold;
                                if (otherRoom.terminal && otherRoom.storage && otherRoom.terminal.isActive()) {
                                    // if find room that has storage allwance, transfer to that room
                                    //console.log(roomName,otherRoomName, mineralType, otherRoom.memory.mineralThresholds.currentMineralStats[mineralType], otherRoomStorageThreshold[mineralType])
                                    let mineralLackageInOtherRoom = otherRoomStorageThreshold[mineralType] - otherRoom.memory.mineralThresholds.currentMineralStats[mineralType];
                                    let availableMineralAmountToSend = terminal.store[mineralType] - terminalThreshold[mineralType];
                                    if ((availableMineralAmountToSend > 100 && mineralLackageInOtherRoom > 0 && otherRoom.memory.mineralThresholds.currentMineralStats[mineralType] < otherRoomStorageThreshold[mineralType])
                                        && _.sum(terminal.store) < 290000) {
                                        let spareSpaceInOtherStorage = (300000 - _.sum(otherRoom.terminal.store)) / 2;
                                        // special case for energy
                                        /*if (mineralType == 'energy') {
                                            availableMineralAmountToSend = Math.max(5000, availableMineralAmountToSend);
                                        }*/
                                        let amountToSend = Math.min(20000, spareSpaceInOtherStorage, availableMineralAmountToSend, mineralLackageInOtherRoom);
                                        if (amountToSend < 100) {
                                            amountToSend = 100;
                                        }
                                        if (terminal.send(mineralType, amountToSend, otherRoomName) == OK) {
                                            console.log(roomName + ' sent ' + amountToSend + ' ' + mineralType + ' to ' + otherRoomName);
                                            return
                                        }
                                        else {
                                            console.log(roomName + ' sent ' + amountToSend + ' ' + mineralType + ' to ' + otherRoomName + ' failed.');
                                            return
                                        }
                                    }
                                    // else cannot find rooms that has storage allwance (we have too many this type of mineral)
                                    else { // research price and place a sell order
                                        //console.log(room.name, mineralType, basicMinerals.includes(mineralType))
                                        if (basicMinerals.includes(mineralType)) {
                                            let mineralAmount = Game.rooms[roomName].terminal.store[mineralType];
                                            let minMineralKeep = maxResourceKeep['basicMinerals'];
                                            //onsole.log(mineralAmount, minMineralKeep, mineralType)
                                            if (mineralAmount > minMineralKeep) {
                                                //console.log(mineralAmount, minMineralKeep, mineralType);
                                                const amountToSell = 5000;
                                                let orders = Game.market.getAllOrders({ type: ORDER_BUY, resourceType: mineralType });
                                                //orders = _.filter(orders, o => o.amount > 5000);
                                                let income = 5000 * estimatedUnitPrice(mineralType); // avoid rediculously low prices;
                                                let orderId = undefined;

                                                for (let i = 0; i < orders.length; i++) {
                                                    const transferEnergyCost = Game.market.calcTransactionCost(amountToSell, roomName, orders[i].roomName);
                                                    var mineralPrice = orders[i]['price'];
                                                    var transferCost = transferEnergyCost * energyPrice;
                                                    var totalInCome = amountToSell * mineralPrice - transferCost;
                                                    if (totalInCome > income) {
                                                        income = totalInCome;
                                                        orderId = orders[i].id;
                                                    }
                                                    //var equivilantMineralPrice = (totalInCome-transferCost)/amountToSell;
                                                }
                                                if (orderId) {
                                                    if (Game.market.deal(orderId, amountToSell, roomName) == OK) {
                                                        console.log('super value sold ' + mineralType + '! ' + roomName + ' got ' + income + '(' + mineralPrice + '). order number: ' + orderId);
                                                        return
                                                    }
                                                }
                                                else {
                                                    console.log('no juicy buy orders found for: ' + mineralType)
                                                }
                                            }
                                            /*else {
                                                console.log('impossible mistake for minMineralKeep');
                                                console.log(roomName, mineralType, mineralAmount, minMineralKeep);
                                            }*/
                                        }
                                        else {
                                            // trading compounds/power/X need to be implemented here
                                        }
                                    }
                                }
                                else {
                                    //console.log(otherRoomName + ' lvl too low to be tranferred');
                                }
                            }
                        }
                        else { // there is no other main rooms, just 1 room in this shard
                            // research price and place a sell order
                            //console.log(room.name, mineralType, basicMinerals.includes(mineralType))
                            if (basicMinerals.includes(mineralType)) {
                                let mineralAmount = Game.rooms[roomName].terminal.store[mineralType];
                                let minMineralKeep = maxResourceKeep['basicMinerals'];
                                //console.log(mineralAmount, minMineralKeep, mineralType)
                                if (mineralAmount > minMineralKeep) {
                                    //console.log(mineralAmount, minMineralKeep, mineralType);
                                    const amountToSell = 5000;
                                    let orders = Game.market.getAllOrders({ type: ORDER_BUY, resourceType: mineralType });
                                    //orders = _.filter(orders, o => o.amount > 5000);
                                    let income = 5000 * estimatedUnitPrice(mineralType); // avoid rediculously low prices;
                                    let orderId = undefined;

                                    for (let i = 0; i < orders.length; i++) {
                                        const transferEnergyCost = Game.market.calcTransactionCost(amountToSell, roomName, orders[i].roomName);
                                        var mineralPrice = orders[i]['price'];
                                        var transferCost = transferEnergyCost * energyPrice;
                                        var totalInCome = amountToSell * mineralPrice - transferCost;
                                        if (totalInCome > income) {
                                            income = totalInCome;
                                            orderId = orders[i].id;
                                        }
                                        //var equivilantMineralPrice = (totalInCome-transferCost)/amountToSell;
                                    }
                                    if (orderId) {
                                        if (Game.market.deal(orderId, amountToSell, roomName) == OK) {
                                            console.log('super value sold ' + mineralType + '! ' + roomName + ' got ' + income + '(' + mineralPrice + '). order number: ' + orderId);
                                            return
                                        }
                                    }
                                    else {
                                        console.log('no juicy buy orders found for: ' + mineralType)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    else { // room doesn't have terminal or storage
        //console.log(shardName + ' ' + roomName + ' is too low for mineral flow');
    }
}

global.estimatedUnitPrice = function (mineralType) {
    if (mineralType == 'energy') {
        return 0.002
    }
    else {
        return 0.01
    }
}

// where to fill
global.whereToFill = function (room, mineralType) { // WARNING: market threshold not set!
    let roomName = room.name;
    let terminal = room.terminal;
    let storage = room.storage;

    let terminalThreshold = room.memory.mineralThresholds.terminalThreshold;
    let storageThreshold = room.memory.mineralThresholds.storageThreshold;
    let marketThreshold = room.memory.mineralThresholds.marketThreshold;

    let allMineralStituationObject = room.memory.mineralThresholds.currentMineralStats;

    if (terminal.store[mineralType]<terminalThreshold[mineralType]) {
        return terminal
        /*if (allMineralStituationObject[mineralType]<storageThreshold[mineralType]) {
            return terminal
        }
        else {
            return terminal
        }*/
    }
    else if (terminal.store[mineralType]==terminalThreshold[mineralType]) {
        if (allMineralStituationObject[mineralType]<storageThreshold[mineralType]) {
            return storage
        }
        else if (allMineralStituationObject[mineralType]==storageThreshold[mineralType]) {
            return false
        }
        else {
            return terminal
        }
    }
    else { // terminal storing over its threshold
        if (allMineralStituationObject[mineralType]<storageThreshold[mineralType]) {
            return storage
        }
        /*else if (allMineralStituationObject[mineralType]==storageThreshold[mineralType]) {
            return terminal
        }*/
        else { // all over threshold, put in terminal for transfer/sell
            return terminal
        }
    }
}

// where to take
global.whereToTake = function (room, mineralType) { // WARNING: market threshold not set!
    let roomName = room.name;
    let terminal = room.terminal;
    let storage = room.storage;

    let terminalThreshold = room.memory.mineralThresholds.terminalThreshold;
    let storageThreshold = room.memory.mineralThresholds.storageThreshold;
    let marketThreshold = room.memory.mineralThresholds.marketThreshold;

    let allMineralStituationObject = room.memory.mineralThresholds.currentMineralStats;

    if (!terminal.store[mineralType] && !storage.store[mineralType]) {
        return false
    }
    else {
        if (terminal.store[mineralType]<=terminalThreshold[mineralType]) { // terminal stored less than its threshold
            if (allMineralStituationObject[mineralType]<=storageThreshold[mineralType]) { // if all stored less than storage threshold
                return false
            }
            else { // stored mineral larger than storage threshold
                return storage
            }
        }
        else { // terminal storing over its threshold or terminal store nothing
            if (terminal.store[mineralType]) {
                if (allMineralStituationObject[mineralType]<=storageThreshold[mineralType]) {
                    return terminal
                }
                /*else if (allMineralStituationObject[mineralType]==storageThreshold[mineralType]) {
                    return terminal
                }*/
                else { // all over threshold, put in terminal for transfer/sell
                    return storage
                }
            }
            else { // terminal store 0 this type
                return false
            }
        }
    }
}

// place an order (need smart thinking in the future)
global.placeSellOrderWithOverFlowingMineralsCalculatedPrice = function (terminal, mineralType) {
    //let sellOrders = Game.market.
}
global.placeSellOrderWithOverFlowingMinerals = function (terminal, mineralType) {
}

// sell one mineral imediately
global.sellOneMineralImediately = function (rn, mineralType) {
    const amountToSell = 300, maxTransferEnergyCost = 200;
    const orders = Game.market.getAllOrders({ type: ORDER_BUY, resourceType: mineralType });

    for (let i = 0; i < orders.length; i++) {
        const transferEnergyCost = Game.market.calcTransactionCost(
            amountToSell, rn, orders[i].roomName);

        if (transferEnergyCost < maxTransferEnergyCost && orders[i].price > 0.1) {
            if (Game.market.deal(orders[i].id, amountToSell, rn) == 0) {
                fo('sold ' + mineralType);
                return true
            }
        }
    }
}

// desparate all sell
global.desparateHouseWife = function (rn) {
    let t = Game.rooms[rn].terminal;
    for (let tp in t.store) {
        if (tp !== 'energy') {
            let res = sellOneMineralImediately(rn, tp);
            if (res) {
                return
            }
        }
    }

    let e = sellOneMineralImediately(rn, 'energy');
    if (e) {
        fo(rn + ' true dead');
    }
}

// dependent functions:
global.deleteElementFromArray = function (array, element) {
    var index = array.indexOf(element);
    if (index > -1) {
    array.splice(index, 1);
    }
    return array
}

global.shuffleArray = function (a) {
    // Use the modern version of the Fisher–Yates shuffle algorithm:
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}
