global.checkTradingEnergyCost = function() {
  const amountToSell = 1000, maxTransferEnergyCost = 500;
  const orders = Game.market.getAllOrders({type: ORDER_BUY, resourceType: RESOURCE_HYDROGEN});

  for(let i=0; i<orders.length; i++) {
    const transferEnergyCost = Game.market.calcTransactionCost(amountToSell, 'W1N1', orders[i].roomName);
    console.log(transferEnergyCost)

    /*if(transferEnergyCost < maxTransferEnergyCost) {
        Game.market.deal(orders[i].id, amountToSell, "W1N1");
        break;*/
    }
}

global.ex = function() {
    console.log('hahaha!')
}
