const inquirer = require("inquirer");
const mysql = require("mysql");

const connection = mysql.createConnection({
    host: "localhost",

    port: 3306,
    user: "root",

    password: "password",
    database: "bamazon"
});
// Connect to database and begin app by displaying the manager menu
connection.connect(function (err) {
    if (err) throw err;
    displayManagerMenu();
});

// Function that displays manager menu and calls manager functions
function displayManagerMenu() {
    // Choices for the manager menu
    // name: What the choice is displayed as in the CLI
    // value: How the choice is named in the returned answer
    // short: Shows a confirmation of which option the user selected
    let mgrChoices = [
        { name: "View Products for Sale", value: "viewProducts", short: "View Products for Sale" },
        { name: "View Low Inventory", value: "viewLow", short: "View Low Inventory" },
        { name: "Add to Inventory", value: "addInventory", short: "Add to Inventory" },
        { name: "Add New Product", value: "addNew", short: "Add New Product" },
        { name: "Nothing, I'm done here", value: "endConnection", short: "Closing connection..." }
    ];

    inquirer.prompt([
        {
            type: "list",
            name: "mgrChoice",
            choices: mgrChoices,
            message: "Select a Manager function:"
        }
    ]).then(answer => {
        // Switch statement to call other functions based on user input
        switch (answer.mgrChoice) {
            case "viewProducts":
                console.log("\nAll Available Products:\n");
                viewProducts();
                break;
            case "viewLow":
                console.log("\nProducts with low inventory (5 units or less):\n");
                viewLowInventory();
                break;
            case "addInventory":
                console.log("\nAdding stock to to low inventory:\n");
                addInventory();
                break;
            case "addNew":
                console.log("Add new product");
                AddProduct();
                break;
            case "endConnection":
                connection.end();
                break;

            // no default since the user shouldn't be able to select anything besides the four options
        };
    });
};

// Display all of the available products for purchase
function viewProducts() {
    // Set query in a variable for easy updating later
    let thisQuery = "SELECT product_name, department_name, price, stock_quantity FROM products";
    // Do stuff with the query
    connection.query(thisQuery, (error, results) => {
        if (error) throw error;
        // Iterate through results with map
        results.forEach(result => {
            // Appends (LOW INVENTORY) to any low inventory items
            if (result.stock_quantity < 6) {
                result.stock_quantity += " (LOW INVENTORY)";
            };
            // Print the results to the console
            console.log("Product: " + result.product_name +
                " | Department: " + result.department_name +
                " | Price: $" + result.price +
                " | Quantity: " + result.stock_quantity);
        });
        // Ask the user if they want to go back to the Manager Menu
        manageSomethingElse();
    });
};

// Displays all products with less than 6 units in stock
function viewLowInventory() {
    // Store the query in a variable for easy updating later
    let thisQuery = "select product_name, department_name, price, stock_quantity from products WHERE stock_quantity < 6";
    connection.query(thisQuery, function (error, results) {
        if (error) throw error;
        // Iterate over results and print to console
        results.forEach(result => {
            console.log("Product: " + result.product_name +
            " | Department: " + result.department_name +
            " | Price: $" + result.price +
            " | Quantity: " + result.stock_quantity);
        });
        manageSomethingElse();
    });
};

// Allows the user to view low inventory items and add more
function addInventory() {
    // Store query in a variable for easy updating later
    let thisQuery = "select item_id, product_name, department_name, price, stock_quantity from products WHERE stock_quantity < 6";
    connection.query(thisQuery, (error, results) => {
        if (error) throw error;
        // Quits out of this function if there's no low inventory items.
        else if (results.length === 0) {
            console.log("No low inventory. Are you actually selling anything?\n");
            displayManagerMenu();
        }
        
        else {
            // Map over the results and return an array of objects that will be used as Inquirer prompt choices
            /* Each result returns an object where
                name: string concatenating product name and in-stock units
                value: product id
                short: the product name */
            let lowItems = results.map(result => {
                return {
                    name: result.product_name + ", Quantity: " + result.stock_quantity + " unit(s)",
                    value: result.item_id,
                    short: result.product_name
                };
            });
            inquirer.prompt([
                // Choose the low inventory item to re-stock
                {
                    type: "list",
                    name: "itemID",
                    message: "Which low-inventory item would you like to re-order?",
                    choices: lowItems
                },
                // Indicate how many to re-stock
                {
                    type: "input",
                    name: "quantityToAdd",
                    message: "How many would you like to order?",
                    // Check to make sure the user entered a valid number
                    validate: function (input) {
                        // Make sure the value parses to an integer and is greater than zero
                        if ( isNaN( parseInt(input) ) === false && parseInt( input ) > 0) {
                            return true
                        }
                        console.log("\nPlease enter a valid number greater than zero.");
                        return false;
                    }
                }]
            ).then(answer => {
                // Variable to store the index of the query result that matches the chosen product to restock
                let index;
                // Iterate through the results and find the index matching the chosen product
                for (let i = 0; i < results.length; i++) {
                    if (results[i].item_id === answer.itemID) {
                        index = i;
                        // I *think* this breaks out of the for loop when a match is found, saving time
                        break;
                    }
                };
                
                // Store the new stock quantity as a variable. Apparently parsing the answer from Inquirer is very important here
                let updatedQuantity = parseInt(answer.quantityToAdd) + results[index].stock_quantity;
                let itemIDtoRestock = results[index].item_id;
                // Update the database with the user-specified number of units
                connection.query("UPDATE products SET ? WHERE ?",
                [
                    {stock_quantity: updatedQuantity},
                    {item_id: itemIDtoRestock}
                ],
                 function (error) {
                // connection.query("UPDATE products SET stock_quantity = ? WHERE item_id = ?", [updatedQuantity, itemIDtoRestock], function (error) {
                    console.log("There should now be " + updatedQuantity + " units of " + results[index].product_name + " in inventory.");
                    displayManagerMenu();
                });
            });
        };
    });
};

function AddProduct() {
    inquirer.prompt([
        // Ask for the new product name
        {
            type: "input",
            name: "name",
            message: "What's the name of the new product?",
            // Check to make sure the user entered a valid product
            validate: function (input) {
                if (input !== "") {
                    return true;
                }
                console.log("\nPlease enter a valid product name.");
                return false;
            }
        },
        // Ask for the new product department
        {
            type: "input",
            name: "department",
            message: "Which department does this product belong in?",
            // Check to make sure the user entered a valid department name
            validate: function (input) {
                if (input !== "") {
                    return true;
                }
                console.log("\nPlease enter a valid department name.");
            }
        },
        {
            type: "input",
            name: "price",
            message: "What is the sell price of this item?",
            // Check to make sure the user entered a valid price
            validate: function (input) {
                // A valid price parses as a legit float and is greater than zero
                if (isNaN(parseFloat(input)) === false && parseFloat(input) > 0.0) {
                    return true;
                }
                console.log("\nPlease enter a valid price greater than zero.");
                return false;
            }
        },
        {
            type: "input",
            name: "quantity",
            message: "How many do you want to initially order?",
            // Check to make sure the user entered a valid number
            validate: function (input) {
                // A valid number parses as an integer and is greater than zero
                if (isNaN(parseInt(input)) === false && parseInt(input) > 0) {
                    return true
                }
                console.log("\nPlease enter a valid number greater than zero.");
                return false;
            }
        }
    ]).then(answer => {
        // Store the query as a variable for easy updating later
        // Putting the placeholders in the parentheses IS MANDATORY. I found out the hard way after this kept failing.
        let thisQuery = "INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES (?, ?, ?, ?)";
        // Query parameters that will be passed in where the question marks are about
        let queryParams = [answer.name, answer.department, parseFloat( answer.price ), parseInt( answer.quantity )];
        connection.query(thisQuery, queryParams, (error) => {
            if (error) throw error;
            // Display an update confirmation to the user
            console.log(queryParams[3] + " unit(s) of " + queryParams[0] + " have been added to the "
                        + queryParams[1] + " department at a price of $" + queryParams[2] + " each.");
            manageSomethingElse();
        });
    });
};

// Quit out of the app if the user says they're all done
function manageSomethingElse() {
    inquirer.prompt({
        type: "confirm",
        name: "confirm",
        message: "Go back to the Manager menu?"
    }).then(answer => {
        if (answer.confirm) {
            displayManagerMenu();
        }
        else {
            console.log("Good luck with the manager thing!");
            connection.end();
        };
    });
};