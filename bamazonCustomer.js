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
    displayProducts();
});

// Function that displays all items for sale and their details, then prompts for purchase
function displayProducts() {
    // Hold the query as a string for easy changing later
    let thisQuery = "SELECT * FROM products";
    // Run the query
    connection.query(thisQuery, function (error, results) {
        console.log("Available products:");
        // Loop through the results of the query and display info with a sweet arrow function
        results.forEach(result => {
            console.log("Item ID:", result.item_id, "| Product", result.product_name, "| Dept:", result.department_name, "| $", result.price, "|", result.stock_quantity, "in stock");
        });
    });
    // Prompt the user for a purchase
    promptPurchase();
};

// Function to prompt the user for a purchase
function promptPurchase() {
    // Store the query as a string for easy updating later
    let thisQuery = "SELECT * FROM products";
    // !: Need to do inquirer within the connection.query() or it'll run before the query finishes
    connection.query(thisQuery, function (error, results) {
        // Prompt the user for the product ID and quantity
        inquirer.prompt([
            {
                type: "input",
                name: "productID",
                message: "Enter the product ID for what you'd like to buy."
            },
            {
                type: "input",
                name: "productQuantity",
                message: "How many do you want?"
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
                // !: The console log below can throw an error because the product ID hasn't been validated yet
                // console.log("Did you say " + answers.productID + "? You wanted " + results[thisIndex].product_name + "?");
                // TODO: Test this. If the user entered an invalid product ID
                if (thisIndex == undefined) {
                    console.log("We're sorry, you specified an invalid product ID.");
                }
                // Else if the user enter a higher quantity than what's available
                else if (answers.productQuantity > results[thisIndex].stock_quantity) {
                    console.log("We're sorry, we are short " + (answers.productQuantity - results[thisIndex].stock_quantity) + " unit(s) to fulfill your purchase.");
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
                        console.log("Great! Your purchase comes out to $" + totalPrice);
                    });
                };
                // Display products for another purchase.
                displayProducts();
            });
    });
};