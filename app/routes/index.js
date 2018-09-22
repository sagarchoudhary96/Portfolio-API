// App Routes
const portfolioRoutes = require('./portfolio_routes')

module.exports = (app, db) => {
  portfolioRoutes(app, db);
  // other app routes can come here
}
