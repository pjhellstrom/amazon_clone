var mysql = require('mysql');
var inquirer = require('inquirer');
const {table} = require('table');
var converter = require('number-to-words');
var chalk = require('chalk');

// require("dotenv").config();
// var keys = require("./keys.js");

const log = console.log;
let low_inventory_threshold = 5;

// View Products for Sale
// View Low Inventory
// Add to Inventory
// Add New Product

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "r00tr00t",
    database: "jamazon"
  });
  
// establish connection and call functions
connection.connect(function(err) {
    if (err) throw err;
    welcome();
    listActions();
});

//Function declarations
//Function declarations
function welcome() {
    log(chalk.bgKeyword('orange').black.bold(`\n----------------------------------------------------\n Welcome to Jamazon Supervisor View!                \n----------------------------------------------------\n`))
};

function listActions() {

        // prompt user to select from products array and input quantity
        inquirer.prompt([
            {
            type: "list",
            message: "What would you like to do?\n",
            choices: ["View Products Sales by Department","Create New Department", "Exit"],
            name: "selection"
            }
        ])
        .then(function(resp){
            if (resp.selection === "View Products Sales by Department") {
                // Read current list of products in stock
                let query = `SELECT departments.department_id, 
                departments.department_name, 
                departments.over_head_costs, 
                SUM(products.product_sales) AS total_department_sales, 
                (SUM(products.product_sales) - departments.over_head_costs) AS total_department_profit 
                FROM departments 
                INNER JOIN products 
                ON departments.department_name = products.department_name 
                GROUP BY departments.department_id;`;

                connection.query(query, function(err, res) {
                    // log errors
                    if(err) {log(err)};

                    // Create empty table array with headers
                    const sales_table = [
                        ['ID', 'Department', 'Overhead Costs', 'Product Sales', 'Total Profit']
                    ];
                    
                    // loop through SQL response and create table arrays
                    for ( let field of res ) {
                        let sales_row = [];
                        sales_row.push(field.department_id);
                        sales_row.push(field.department_name);
                        sales_row.push(field.over_head_costs);
                        sales_row.push(field.total_department_sales);
                        sales_row.push(field.total_department_profit);
                        sales_table.push(sales_row);
                    }
                
                    log(table(sales_table));
                    
                });// end connection
            }// end if
            else if (resp.selection === "Create New Department") {
                // get input from user
                inquirer.prompt([
                    {
                    type: "input",
                    message: "Department name:\n",
                    name: "new_department" 
                    },
                    {
                    type: "input",
                    message: "Overhead costs:\n",
                    name: "new_oh_costs"
                    }
                ])
                .then(function(input){
                    // check if product already exists in stock

                    // Push to DB
                    let push_db = `INSERT INTO departments VALUES (0,"${input.new_department}",${parseInt(input.new_oh_costs)})`;
                    connection.query(push_db, function(err, res) {
                        // log errors
                        if(err) {
                            log(err);
                        }
                    log(`The ${input.new_department} department has been added to the database.`);
                    });
                });// end call back
            }// end else if
            else if (resp.selection === "Exit") {
                process.exit();
            };
        })// end .then

}// end listActions();
