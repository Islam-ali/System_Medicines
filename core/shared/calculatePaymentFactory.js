class calculatePaymentFctory {

  IncreaseWasPaid(wasPaid , cashAmount){
    return wasPaid + cashAmount
  }

  DecreaseWasPaid(wasPaid , cashAmount){
    return wasPaid - cashAmount
  }

  calculateBalance(totalCost , wasPaid){
    return totalCost - wasPaid
  }
}

module.exports = calculatePaymentFctory
