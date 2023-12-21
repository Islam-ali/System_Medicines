class calculatePaymentFctory {

  IncreaseWasPaid(wasPaid , cashAmount){
    return wasPaid + cashAmount
  }

  DecreaseWasPaid(wasPaid , cashAmount){
    if(wasPaid > cashAmount){
      return wasPaid - cashAmount
    }else{
      return cashAmount - wasPaid 
    }
  }

  calculateBalance(totalCost , wasPaid){
    return totalCost - wasPaid
  }
}

module.exports = calculatePaymentFctory
