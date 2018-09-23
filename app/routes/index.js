// App Routes
const portfolioRoutes = require('./portfolio_routes')

module.exports = (app) => {
  portfolioRoutes(app)
  // other app routes can come here
}
