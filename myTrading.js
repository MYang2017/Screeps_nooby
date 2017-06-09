
var idealMineralBuyingPrices = {
  'H': 0.01,
  'O': 0.076,
  'U': 0.01
};

var idealMineralSellingPrices = {
  'H': 0.14, // show up as 0.6 on market and people tend to buy 0.6 than 0.7
  'O': 2,
  'U': 0.18
};

var minMineralKeep = {
  'H': 0,
  'O': 30000,
  'U': 0
};

var maxMineralKeep = {
  'H': 0,
  'O': 10000,
  'U': 0
};

var energyPrice = 0.02;

global.checkTradingEnergyCostAndSell = function(roomName,mineralType) {
    if (Game.rooms[roomName].terminal.cooldown == 0) {
      var terminalAmount = Game.rooms[roomName].terminal.store[mineralType];
      if (terminalAmount>minMineralKeep[mineralType]) {
        const amountToSell = 2000;
        const orders = Game.market.getAllOrders({type: ORDER_BUY, resourceType: mineralType});

        for(let i=0; i<orders.length; i++) {
          const transferEnergyCost = Game.market.calcTransactionCost(amountToSell, roomName, orders[i].roomName);
          var mineralPrice = orders[i]['price'];
          var transferCost = transferEnergyCost*energyPrice;
          var totalInCome = amountToSell*mineralPrice;
          var equivilantMineralPrice = (totalInCome-transferCost)/amountToSell;

          if ( equivilantMineralPrice > idealMineralSellingPrices[mineralType] ) {
              console.log('super value to sell '+mineralType+'! '+orders[i]['roomName']+' for '+equivilantMineralPrice+'('+mineralPrice+'). order number: '+orders[i].id);
              console.log(Game.market.deal(orders[i].id, amountToSell, roomName));
              break;
          }
        }
      }
      else {
        //console.log('not enough '+mineralType);
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
              console.log('super value to buy '+mineralType+'! '+orders[i]['roomName']+' for '+equivilantMineralPrice+'('+mineralPrice+'). order number: '+orders[i].id);
              console.log(Game.market.deal(orders[i].id, amountToBuy, roomName));
              break;
          }
        }
      }
      else {
        //console.log('not enough '+mineralType);
      }
    }
}

global.ex = function() {
    console.log('hahaha!')
}

// selling order
// Game.market.createOrder(ORDER_SELL, RESOURCE_HYDROGEN, 0.064, 3000, "E92N11");

// send minerals via terminal
//Game.rooms['E91N16'].terminal.send('U',xxx,'E93N13','have fun!')
