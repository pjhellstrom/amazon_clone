# Jamazon
Jamazon consists of three command line node apps that interact to a mySQL database to read and write information. Each app provides functionality customized for the respective user with varying levels of database access. The database has two underlying tables. A products table that stores product details and sales figures and a departments table that contains department details and overhead cost figures. The node applications use the mysql package to interact with mySQL and the inquirer package to handle user input.

### Demo (on YouTube)
<a href="http://www.youtube.com/watch?feature=player_embedded&v=W1brMi3FY7U
" target="_blank"><img src="http://img.youtube.com/vi/W1brMi3FY7U/0.jpg" 
alt="IMAGE ALT TEXT HERE" width="480" height="360" border="5" /></a>

### Requirements

  * [Node.js](https://nodejs.org/) LTS (v10)
  
### Dependencies

   * [mysql](https://www.npmjs.com/package/mysql) - node driver for mySQL
    
   * [Inquirer](https://www.npmjs.com/package/inquirer) - Handles user input
   
   * [table](https://www.npmjs.com/package/table) - Renders tables in console
   
   * [number-to-words](https://www.npmjs.com/package/number-to-words) - Converts numbers into words
   
   * [Chalk](https://www.npmjs.com/package/chalk) - Formatting

### Launch

Download repo into a new directory and use schema and seed files to create the necessary SQL database and tables along with placeholder data. Use the npm i command to install dependencies. Run the following commands one at a time:

```console
# Install dependencies
npm i mysql
npm i inquirer
npm i table
npm i number-to-words
npm i chalk
```
Next, you can run any of the three jamazon js files. For example, to run the customer view:

```console
# Run app
node jamazonCustomer.js

```

### How to - Customer View (jamazonCustomer.js)

- Upon launch, the user will be presented with a database extract (filtered by items currently in stock) and is prompted to select a product that they would like to purchase. 
- Once a selection has been made, the user is asked to select a quantity and is then prompted to confirm purchase. 
- If the requested quantity exceeds the available stock, user will be alerted and taken back to the initial view.
- The customer view interacts with the products database to read product listings and to write updates to stock and sales numbers when purchases are made.

### How to - Manager View (jamazonManager.js)

- The user can selection one of four options:
  - View Products for Sale:
    - Renders a detailed table of items available on storefront with product ID, product name, department, price and available stock
  - View Low Inventory
    - Renders detailed table of items with stock lower than a specified threshold (variable low_inventory_threshold)
  - Add to Inventory
    - Presents user with a series of prompts to replenish stock of an existing product
  - Add New Product
    - Walks user through a series of prompts to add a new product in an existing department (new departments can be added in the supervisor view)
  - The manager view interacts with the products database to retrieve product and stock reports and to add/update rows when adding products/stock

### How to - Supervisor View (jamazonSupervisor.js)

- The user can selection one of two options:
  - View Product Sales by Department:
    - Renders a profitability report by department (by joining the revenue data in the products table and the expense data in the departments table)
  - Create New Department
    - Walks user through a series of prompts to add a new department (that becomes accessible to Managers for adding new products)
  - The manager view reads from both tables to generate reports and writes to the departments table when adding new departments

### Author

* Jonas Hellstrom

