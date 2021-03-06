const mysql = require("mysql");
const inquirer = require("inquirer");

// Specify database connection
const connection = mysql.createConnection({
    host: "localhost",

    port: 3306,
    user: "root",

    password: "password",
    database: "bamazon"
});
// Connect to database and begin app by displaying products
connection.connect(function (err) {
    if (err) throw err;
    promptPurchase();
});

// Function to prompt the user for a purchase
function promptPurchase() {
    // Store the query as a string for easy updating later
    let thisQuery = "SELECT * FROM products WHERE stock_quantity > 0";
    connection.query(thisQuery, function (error, results) {

        // Create the list of choices for the Inquirer prompt
        let currentInventory = results.map(result => {
            return {
                name: "Item ID: " + result.item_id +
                    " | Product: " + result.product_name +
                    " | Dept: " + result.department_name +
                    " | $" + result.price +
                    " | " + result.stock_quantity + " in stock",
                value: result.item_id,
                short: result.product_name,
            };
        });

        // Prompt the user for the product ID and quantity
        inquirer.prompt([
            {
                type: "list",
                name: "productID",
                message: "Select the item you'd like to purchase.",
                choices: currentInventory,
                pageSize: 10
            },
            {
                type: "input",
                name: "productQuantity",
                message: "How many do you want?",
                validate: function (input) {
                    // Make sure the value parses to an integer and is greater than zero
                    if (isNaN(parseInt(input)) === false && parseInt(input) > 0) {
                        return true
                    }
                    console.log("\nPlease enter a valid number greater than zero.");
                    return false;
                }
            }])
            // Booya, another arrow function!
            .then(answers => {
                // This will hold the index of the query results we're working with
                let thisIndex;
                // Set the variable above to the matching item_ID, if it exists
                for (let i = 0; i < results.length; i++) {
                    if (answers.productID == results[i].item_id) {
                        thisIndex = i;
                    }
                };
                // If the user entered a quantity greater than what's in stock
                if (answers.productQuantity > results[thisIndex].stock_quantity) {
                    console.log("We're sorry, we are short " + (answers.productQuantity - results[thisIndex].stock_quantity) + " unit(s) to fulfill your purchase.\n");
                    // Ask the user if they want to buy anything else
                    buySomethingElse();
                }
                // Else display confirmation message with total cost
                else {
                    // Calculate the total price
                    let totalPrice = answers.productQuantity * results[thisIndex].price;
                    // Calculate the new quantity to push to the table
                    newQuantity = results[thisIndex].stock_quantity - answers.productQuantity;
                    // Store the query as a string for easy updating later
                    updateQuery = "UPDATE products SET stock_quantity = ? WHERE item_id = ?";
                    // Store the update query params: [the new quantity, the item_ID]
                    updateParams = [newQuantity, results[thisIndex].item_id]
                    // We're not doing anything with the results of the SQL query, so the anonymous function only gets one arg.
                    connection.query(updateQuery, [newQuantity, answers.productID], function (error) {
                        console.log("Great! Your purchase of " + answers.productQuantity + " units of " + results[thisIndex].product_name 
                                    + " comes out to $" + totalPrice.toFixed(2) + ".\n");
                        // Ask the user if they want to buy anything else
                        buySomethingElse();
                    });
                };
            });
    });
};

function buySomethingElse(){
    inquirer.prompt(
        {
            type: "confirm",
            name: "confirm",
            message: "Would you like to buy something else?"
        }
    )
        .then( answer => {
            if (answer.confirm) {
                promptPurchase();
            }
            else {
                console.log("Thanks for shopping!");
                connection.end();
            }
        })
}