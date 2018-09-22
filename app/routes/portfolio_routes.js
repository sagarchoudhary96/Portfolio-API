// protfolio routes
const baseRoute =  '/portfolio/'
module.exports = (app, db) => {

  // get Entire Portfolio
  app.get(baseRoute, (req, res) => {
    res.send("Welcome to the portfolio API")
  })

  // get holdings
  app.get(baseRoute + 'holdings', (req, res) => {
    res.send("Holdings")
  })

  // get Cuulative returns
  app.get(baseRoute + 'returns', (req, res) => {
    res.send("Returns")
  })

  // add trade
  app.post(baseRoute + 'addTrade', (req, res) => {
    res.send("add Trade")
  })

  // update trade
  app.post(baseRoute + 'updateTrade', (req, res) => {
    res.send("update Trade")
  })

  // remove trade
  app.post(baseRoute + 'removeTrade', (req, res) => {
    res.send("Remove Trade")
  })
}
