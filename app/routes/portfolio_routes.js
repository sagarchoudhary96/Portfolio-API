// protfolio base route
const baseRoute =  '/portfolio/'

//controller for portfolio
const portfolio = require('../controllers/portfolioController')

module.exports = (app) => {

  // get Entire Portfolio
  app.get(baseRoute, portfolio.getPortfolio)

  // get holdings
  app.get(baseRoute + 'holdings', portfolio.getHoldings)

  // get Cuulative returns
  app.get(baseRoute + 'returns', portfolio.getReturns)

  // add trade
  app.post(baseRoute + 'addTrade', portfolio.addTrade)

  // update trade
  app.post(baseRoute + 'updateTrade/:id', portfolio.updateTrade)

  // remove trade
  app.post(baseRoute + 'removeTrade/:id', portfolio.removeTrade)
}
