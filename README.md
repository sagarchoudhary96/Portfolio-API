# Portfolio-API
A portfolio tracking API which allows adding/deleting/updating trades and can do basic return calculations etc.
The API is live [here](https://sheltered-cliffs-65361.herokuapp.com/).

## How To Run:
   * [Clone](https://github.com/sagarchoudhary96/Portfolio-API.git) or [Download](https://github.com/sagarchoudhary96/Portfolio-API/archive/master.zip) the Repository.
   * Make sure to replace `DB_URL_HERE` in `config/db.js` file with the url of your database.
   * Install the dependencies using `npm install`.
   * run the server using `npm run dev`.

## The following endpoints are available:

    * GET /portfolio
        USAGE:
          Get all of the Portfolio

    * GET /portfolio/holdings
        USAGE:
          Get holdings of all stocks in an aggregate view

    * GET /pportfolio/returns
        USAGE:
          Get cumulative returns

    * POST /portfolio/addTrade
        USAGE:
          Add a new Trade
        PARAMS:
          stockId - Unique stock id
          date - date on which trade is made in format (DD/MM/YYYY)
          price - price of trade
          quantity - quantity of stocks
          type - either buy/sell

    * POST /portfolio/updateTrade/:id
        USAGE:
          Update the specific Trade
        PARAMS:
          the values to be updated from (stockId, date, price, quantity, type)

    * POST /portfolio/removeTrade/:id
        USAGE:
          Remove the specific Trade
 
