var mysql = require('mysql');
var inquirer = require('inquirer');
const {table} = require('table');
var converter = require('number-to-words');
var chalk = require('chalk');

// require("dotenv").config();
// var keys = require("./keys.js");

const log = console.log;
let low_inventory_threshold = 50;

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
    log(chalk.bgKeyword('orange').black.bold(`\n--------------------------------------------------------------------\n Welcome to Jamazon Manager View!                                   \n--------------------------------------------------------------------\n`))
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
                let query = "SELECT item_id, product_name, department_name, price, stock_quantity FROM products WHERE stock_quantity > 0";
                connection.query(query, function(err, res) {
                    // log errors
                    if(err) {
                        log(err)
                        setTimeout(listActions, 0);
                    };

                    // construct table for all available products - table npm uses arrays for each row contained w/i an outer array
                    const inventory_table = [
                        ['Product ID', 'Product Name', 'Department', 'Price', 'Stock']
                    ];

                    for ( let product of res ) {
                        let inv_row = [];
                        inv_row.push(product.item_id);
                        inv_row.push(product.product_name);
                        inv_row.push(product.department_name);
                        inv_row.push(product.price);
                        inv_row.push(product.stock_quantity);
                        inventory_table.push(inv_row);
                    }
                    log(chalk.bgKeyword('orange').black.bold(`\n--------------------------------------------------------------------\n These are the products available on the store front:               \n--------------------------------------------------------------------\n`))
                    log(table(inventory_table));
                });// end connection
                setTimeout(listActions, 0);
            }
            else if (resp.selection === "View Low Inventory") {
                // Read current list of products in stock
                let query = `SELECT product_name, department_name, price, stock_quantity FROM products WHERE stock_quantity < ${low_inventory_threshold} `;
                connection.query(query, function(err, res) {
                    // log errors
                    if(err) {
                        log(err)
                        setTimeout(listActions, 0);
                    };
                    // return if no items match criteria
                    if (res.length == 0) {
                        log(`\n-------------------------------------------\nNo items with inventory below ${low_inventory_threshold} to display\n-------------------------------------------\n`);
                        setTimeout(listActions, 0);
                    }
                    // Output list of products
                    // construct table for all available products - table npm uses arrays for each row contained w/i an outer array
                    const inventory_table = [
                        ['Product Name', 'Department', 'Price', 'Stock']
                    ];

                    for ( let product of res ) {
                        let inv_row = [];
                        inv_row.push(product.product_name);
                        inv_row.push(product.department_name);
                        inv_row.push(product.price);
                        inv_row.push(product.stock_quantity);
                        inventory_table.push(inv_row);
                    }
                    log(chalk.bgKeyword('orange').black.bold(`\n--------------------------------------------------------------------\n These are the products with stock below ${low_inventory_threshold} units:                  \n--------------------------------------------------------------------\n`))
                    log(table(inventory_table));
                    setTimeout(listActions, 0);
                });// end connection
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
                        }
                        
                        // Push to DB
                        let update_db = `UPDATE products SET stock_quantity = ${availability + parseInt(input.restock_quantity)} WHERE product_name = "${input.restock_selection}"`;
                        connection.query(update_db, function(err, res) {
                            // log errors
                            if(err) {
                                log(err);
                            };

                            // construct and log table with details on restocked inventory
                            const restock_table = 
                            [
                                ['Product Name', 'New Stock', 'Prev. Stock'],
                                [`${input.restock_selection}`, `${availability + parseInt(input.restock_quantity)}`, `${availability}`]
                            ];
                            log(chalk.bgKeyword('orange').black.bold(`\n--------------------------------------------------------------------\n This product has been restocked:                                   \n--------------------------------------------------------------------\n`));
                            log(table(restock_table));

                            setTimeout(listActions, 0);
                        });
                    });// end call back
                });// end connection
            }
            else if (resp.selection === "Add New Product") {
                // pull current list of all departments 
                let query = "SELECT department_name FROM departments"
                connection.query(query, function(err, res) {
                    // log errors
                    if(err) {
                        log(err);
                        setTimeout(listActions, 0);
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
                            setTimeout(listActions, 0);
                        }
                        

                        log(chalk.bgKeyword('orange').black.bold(`\n--------------------------------------------------------------------\n This product has been added to the storefront:                     \n--------------------------------------------------------------------\n`));
                        // construct and log table with details on new product
                        const new_prod_table = [
                            ['Product Name', 'Department', 'Price', 'Stock'],
                            [`${input.new_product}`,`${input.new_department}`,`${input.new_price}`,`${input.new_quantity}`]
                        ];
                        log(table(new_prod_table));
                        setTimeout(listActions, 0);
                    });
                });// end call back


            });// end outer connection
            }
            else if (resp.selection === "Exit") {
                process.exit();
            };
        })

}// end listActions();
