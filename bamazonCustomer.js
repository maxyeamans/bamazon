const mysql = require("mysql");
// const inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",

    port: 3306,
    user: "root",

    password: "password",
    database: "bamazon"
});

connection.connect( function(err) {
    if(err) throw err;
    displayProducts();
});
// First, display all of the items for sale
// Prompt the user with two messages:
// Ask the ID of the product the would like to buy.
// Ask how many units of the product they'd like to buy.
// Check to see if the store has enough of the product
// If there's not enough product, display an error.
// If there *is* enough product, fulfill the customer's order by updating the database
// On successful purchase, show the total cost of the purchase

// Function that displays all items for sale and their details
function displayProducts(){
    let thisQuery = "SELECT * FROM products";
    connection.query(thisQuery, function(error, results) {
        console.log("Available products:");
        results.forEach(result => {
            console.log("Item ID:", result.item_id, "| Product",result.product_name, "| Dept:", result.department_name, "| $", result.price, "|", result.stock_quantity, "in stock");
        });
    });
};