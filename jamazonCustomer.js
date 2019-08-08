var mysql = require('mysql');
var inquirer = require('inquirer');
const {table} = require('table');
var converter = require('number-to-words');
var chalk = require('chalk');

// require("dotenv").config();
// var keys = require("./keys.js");

const log = console.log;
let customer_balance = 0;
let customer_items = [];
let items_quantity = [];
let shopping_cart = "";

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
    listProducts();
});

//Function declarations
function welcome() {
    log(chalk.bgKeyword('orange').black.bold(`\n----------------------------------------------------\n Welcome to Jamazon!                                \n----------------------------------------------------\n`))
};

function listProducts() {
    // Load current list of products in stock
    let query = "SELECT product_name, department_name, price, stock_quantity, product_sales FROM products WHERE stock_quantity > 0"
    connection.query(query, function(err, res) {
        // log errors
        if(err) {
            log(err);
        }

    // construct table for all available products - table npm uses arrays for each row contained w/i an outer array
    const prod_table = [
        ['Product', 'Category', 'Our price']
    ];

    for ( let product of res ) {
        let prod_row = [];
        prod_row.push(product.product_name);
        prod_row.push(product.department_name);
        prod_row.push(product.price);
        prod_table.push(prod_row);
    }

    log(table(prod_table));

    // create empty array to hold products in stock for inquirer list
    const products = [];
        // add products to products array
        for ( let product of res ) {
            products.push(product.product_name);
        }

        // prompt user to select from products array and input quantity
        inquirer.prompt([
            {
            type: "list",
            message: "What product would you like to order?\n",
            choices: products,
            name: "order_selection" 
            },
            {
            type: "input",
            message: "How many do you need?\n",
            name: "order_quantity" 
            }
        ])
        .then(function(answer){

            // Pull availability of selection
            let availability = 0;

            for ( let product of res ) {
                if (product.product_name == answer.order_selection) {
                    availability = product.stock_quantity;
                }
            }

            // Pull price of selection
            let price = 0;

            for ( let product of res ) {
                if (product.product_name == answer.order_selection) {
                    price = product.price;
                }
            }

            // Pull current sales
            let sales = 0;

            for ( let product of res ) {
                if (product.product_name == answer.order_selection) {
                    sales = product.product_sales;
                }
            }
            // if order quantity is available
            if (answer.order_quantity < availability) {
                // confirm order with customer
                inquirer.prompt([
                    {
                        type: "list",
                        message: `Ok to proceed with order of ${converter.toWords(answer.order_quantity)} ${answer.order_selection}(s)?\n`,
                        choices: ["Checkout", "Cancel"],
                        name: "order_confirmation"
                    }
                ])
                .then(function(confirmation){
                    // if customer confirms order
                    if (confirmation.order_confirmation === "Checkout") {

                        // update quantity in DB
                        let update_quantity = `UPDATE products SET stock_quantity = ${availability - parseInt(answer.order_quantity)} WHERE product_name = "${answer.order_selection}"`;
                        connection.query(update_quantity, function(err, res) {
                            // log errors
                            if(err) {
                                log(err);
                            }
                        });
                        // update product sales in DB
                        let update_sales = `UPDATE products SET product_sales = ${sales + (parseInt(answer.order_quantity) * price)} WHERE product_name = "${answer.order_selection}"`;
                        connection.query(update_sales, function(err, res) {
                            // log errors
                            if(err) {
                                log(err);
                            }
                        });

                        // update customer total balance
                        customer_balance += (answer.order_quantity * price);
                        // log order confirmation
                        log(chalk.bgKeyword('orange')(`\n-----------------------------------------------------\nYour order is on it's way! You'll be charged $${customer_balance}.\n-----------------------------------------------------\n`))

                        // // update item and quantity arrays
                        // customer_items.push(answer.order_selection);
                        // items_quantity.push(answer.order_quantity);

                        // // clear out string to avoid double counting
                        // shopping_cart = "";

                        // // add items to shopping_cart
                        // for (let i = 0; i < customer_items.length; i++) {
                        //     shopping_cart = shopping_cart.concat(customer_items[i], ' (', items_quantity[i], ') \n')
                        // }
                        // log(shopping_cart);

                        // // prompt for more selections or checkout
                        // inquirer.prompt([
                        //     {
                        //         type: "list",
                        //         message: `Your shopping cart contains:\n${shopping_cart}\nBalance due: $${customer_balance}\nWould you like to add more items?\n`,
                        //         choices: ["Keep browsing", "Check out"],
                        //         name: "stay_check"
                        //     }
                        // ])
                        // .then(function(stay){
                        //     if (stay.stay_check === "Keep browsing") {
                        //         listProducts();
                        //     }
                        //     else if (stay.stay_check === "Check out") {
                        //         log(`Your order is on it's way! You'll be charged $${customer_balance}.`);
                        //         shopping_cart = "";
                        //         customer_balance = 0;
                        //         return;
                        //     }
                        // });
                    }
                    // if customer cancels
                    else if (confirmation.order_confirmation === "Cancel") {
                        listProducts();
                    }
                });
            // if order quantity is not available
            } else {
                log(`Sorry, current stock of ${answer.order_selection} is ${availability}, please update your order.`); 
                listProducts();               
            }

        });
    });//end connection

}// end listProducts();
