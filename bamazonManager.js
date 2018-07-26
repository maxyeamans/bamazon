// * List a set of menu options:
//     * View Products for Sale
//     * View Low Inventory
//     * Add to Inventory
//     * Add New Product
//   * If a manager selects `View Products for Sale`, the app should list every available item: the item IDs, names, prices, and quantities.
//   * If a manager selects `View Low Inventory`, then it should list all items with an inventory count lower than five.
//   * If a manager selects `Add to Inventory`, your app should display a prompt that will let the manager "add more" of any item currently in the store.
//   * If a manager selects `Add New Product`, it should allow the manager to add a completely new product to the store.

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
        // Switch statement to call other functions (eventually) based on user input
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
    let thisQuery = "SELECT product_name, department_name, price, stock_quantity FROM products";
    connection.query(thisQuery, (error, results) => {
        if (error) throw error;
        // Iterate through results with map
        results.map(result => {
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

// Displays all products with less than 6 units in stock
function viewLowInventory() {
    let thisQuery = "select product_name, department_name, price, stock_quantity from products WHERE stock_quantity < 6";
    connection.query(thisQuery, function (error, results) {
        if (error) throw error;
        // Iterate over results and print to console
        // ! Would it be better practice to do a forEach on this, since I'm not returning anything from the map function?
        results.map(result => {
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
    let thisQuery = "select item_id, product_name, department_name, price, stock_quantity from products WHERE stock_quantity < 6";
    connection.query(thisQuery, (error, results) => {
        if (error) throw error;

        // Quits out of this function if there's no low inventory items.
        else if (results.length === 0) {
            console.log("No low inventory. What's wrong with your sales?\n");
            displayManagerMenu();
        }

        else {
            // Map over the results and return an array of objects that will be used as Inquirer prompt choices
            /* Set this to return an object where
                name: string concatenating product name and units
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
                {
                    type: "list",
                    name: "itemID",
                    message: "Which low-inventory item would you like to re-order?",
                    choices: lowItems
                },
                {
                    type: "input",
                    name: "quantityToAdd",
                    message: "How many would you like to order?",
                    // Check to make sure the user entered a valid number
                    validate: function (input) {
                        // Make sure the value parses to an integer and is greater than zero
                        if (isNaN(parseInt(input)) === false && parseInt(input) > 0) {
                            return true
                        }
                        console.log("\nPlease enter a valid number greater than zero.");
                        return false;
                    }
                }]
            ).then(answer => {
                // Variable to store the index of the query result that matches the chosen product to restock
                let index;
                for (let i = 0; i < results.length; i++) {
                    if (results[i].item_id === answer.itemID) {
                        index = i;
                        break;
                    }
                };

                let updatedQuantity = parseInt(answer.quantityToAdd) + results[index].stock_quantity;
                let itemIDtoRestock = results[index].item_id;
                console.log("You said you want to order " + answer.quantityToAdd + " units of " + results[index].product_name + ".");
                // Update the database with the user-specified number of units
                connection.query("UPDATE products SET stock_quantity = ? WHERE item_id = ?", [updatedQuantity, itemIDtoRestock], function (error) {
                    console.log("There should now be " + updatedQuantity + " units of " + results[index].product_name + " in inventory.");
                    displayManagerMenu();
                });
            });
        };
    });
};

function AddProduct() {
    let thisQuery = "";
    connection.query(thisQuery, (error, results) => {
        if (error) throw error;
        // Code for adding an item goes below.
    });
};