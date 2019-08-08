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
function welcome() {
    log(chalk.bgKeyword('orange').black.bold(`\n----------------------------------------------------\n Welcome to Jamazon Manager View!                   \n----------------------------------------------------\n`))
};

function listActions() {

        // prompt user to select from products array and input quantity
        inquirer.prompt([
            {
            type: "list",
            message: "What would you like to do?\n",
            choices: ["View Products for Sale","View Low Inventory","Add to Inventory","Add New Product", "Exit"],
            name: "selection" 
            }
        ])
        .then(function(resp){
            if (resp.selection === "View Products for Sale") {
                // Read current list of products in stock
                let query = "SELECT product_name, department_name, price, stock_quantity FROM products WHERE stock_quantity > 0";
                connection.query(query, function(err, res) {
                    // log errors
                    if(err) {log(err)};
                    // Output list of products
                    log(`This is the current inventory:\n`)
                    for ( let product of res ) {
                        log(`ID: ${product.item_id}, Product: ${product.product_name}, Dept.: ${product.department_name}, Price: ${product.price}, Stock: ${product.stock_quantity}\n`);
                    }
                });// end connection
                // listActions();
            }
            else if (resp.selection === "View Low Inventory") {
                // Read current list of products in stock
                let query = `SELECT product_name, department_name, price, stock_quantity FROM products WHERE stock_quantity < ${low_inventory_threshold} `;
                connection.query(query, function(err, res) {
                    // log errors
                    if(err) {log(err)};
                    // return if no items match criteria
                    if (res.length == 0) {
                        log(`\n-----------------------------------\nNo items with inventory below ${low_inventory_threshold} to display\n-----------------------------------\n`);
                        return;
                    }
                    // Output list of products
                    log(`These are the inventory products that are running out of stock:\n`);
                    for ( let product of res ) {
                        log(`ID: ${product.item_id}, Product: ${product.product_name}, Dept.: ${product.department_name}, Price: ${product.product_name}, Stock: ${product.stock_quantity}\n`);
                    }
                });// end connection
                // listActions();
            }
            else if (resp.selection === "Add to Inventory") {
                // pull current list of all products 
                let query = "SELECT product_name, department_name, price, stock_quantity FROM products"
                connection.query(query, function(err, res) {
                        // log errors
                        if(err) {
                            log(err);
                        }
                    // create empty array to hold products in stock
                    const products = [];
                        // add products to products array
                        for ( let product of res ) {
                            products.push(product.product_name);
                        }
                    // get input from user
                    inquirer.prompt([
                        {
                        type: "list",
                        message: "What product are you restocking?\n",
                        choices: products,
                        name: "restock_selection" 
                        },
                        {
                        type: "input",
                        message: "How many units are you restocking?\n",
                        name: "restock_quantity" 
                        }
                    ])
                    .then(function(input){
                        // Pull availability of selection
                        let availability = 0;

                        for ( let product of res ) {
                            if (product.product_name == input.restock_selection) {
                                availability = product.stock_quantity;
                            }
                            log(`typeof availability: ${typeof(availability)}`)
                        }
                        
                        // Push to DB
                        let update_db = `UPDATE products SET stock_quantity = ${availability + parseInt(input.restock_quantity)} WHERE product_name = "${input.restock_selection}"`;
                        connection.query(update_db, function(err, res) {
                            // log errors
                            if(err) {
                                log(err);
                            }
                        log(`${input.restock_selection} has been restocked to ${availability + parseInt(input.restock_quantity)} units (prev. ${availability} units).`);
                        });
                    });// end call back
                });// end connection

                // listActions();
            }
            else if (resp.selection === "Add New Product") {
                // pull current list of all departments 
                let query = "SELECT department_name FROM departments"
                connection.query(query, function(err, res) {
                    // log errors
                    if(err) {
                        log(err);
                    }
                    // create empty array to hold departments
                    const departments = [];
                    // add departments to departments array
                    for ( department of res ) {
                        departments.push(department.department_name);
                    }
                // get input from user
                inquirer.prompt([
                    {
                    type: "input",
                    message: "Product name:\n",
                    name: "new_product" 
                    },
                    {
                    type: "list",
                    message: "Department:\n",
                    choices: departments,
                    name: "new_department"
                    },
                    {
                    type: "input",
                    message: "Price (CAD):\n",
                    name: "new_price" 
                    },
                    {
                    type: "input",
                    message: "Initial stock:\n",
                    name: "new_quantity" 
                    },
                ])
                .then(function(input){
                    // Push to DB
                    let push_db = `INSERT INTO products VALUES (0,"${input.new_product.trim()}","${input.new_department}", ${input.new_price.trim()}, ${input.new_quantity.trim()},0)`;
                    connection.query(push_db, function(err, res) {
                        // log errors
                        if(err) {
                            log(err);
                        }
                    log(`${input.new_quantity} units of ${input.new_product} have been added to the ${input.new_department} category at a price of $${input.new_price} per unit.`);
                    });
                });// end call back
                // listActions();
            });// end outer connection
            }
            else if (resp.selection === "Exit") {
                process.exit();
            };
        })

}// end listActions();
