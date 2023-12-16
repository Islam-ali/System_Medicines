class calculatePaymentFctory {

  addWasPaid(wasPaid , cashAmount){
    return wasPaid + cashAmount
  }

  RemoveWasPaid(wasPaid , cashAmount){
    return wasPaid - cashAmount
  }

  calculateBalance(totalCost , wasPaid){
    return totalCost - wasPaid
  }
}

module.exports = calculatePaymentFctory
