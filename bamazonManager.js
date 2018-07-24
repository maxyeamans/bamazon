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
function displayManagerMenu(){
    // Choices for the manager menu
    // name: What the choice is displayed as in the CLI
    // value: How the choice is named in the returned answer
    // short: Shows a confirmation of which option the user selected
    let mgrChoices = [
        { name: "View Products for Sale", value: "viewProducts", short: "View Products for Sale"},
        { name: "View Low Inventory", value: "viewLow", short: "View Low Inventory"},
        { name: "Add to Inventory", value: "addInventory", short: "Add to Inventory"},
        { name: "Add New Product", value: "addNew", short: "Add New Product"}
    ];

    inquirer.prompt([
        {
            type: "list",
            name: "mgrChoice",
            choices: mgrChoices,
            message: "Select a Manager function:"
        }
    ]).then( answer => {
        // Switch statement to call other functions (eventually) based on user input
        switch(answer.mgrChoice){
            case "viewProducts":
                console.log("View all products\n");
                viewProducts();
                break;
            case "viewLow":
                console.log("View low inventory");
                viewLowInventory();
                break;
            case "addInventory":
                console.log("Add to inventory");
                addInventory();
                break;
            case "addNew":
                console.log("Add new product");
                break;
            // no default since the user shouldn't be able to select anything besides the four options
        };
    });
};

function viewProducts(){
    let thisQuery = "SELECT product_name, department_name, price, stock_quantity FROM products";
    connection.query(thisQuery, function(error, results){
        if (error) throw error;
        results.map( result => {
            if (result.stock_quantity < 6) {
                result.stock_quantity += " (LOW INVENTORY)";
            };

            console.log("Product: " + result.product_name +
                        " | Department: " + result.department_name + 
                        " | Price: $" + result.price +
                        " | Quantity: " + result.stock_quantity);
        });
        manageSomethingElse();
    });
};

function manageSomethingElse(){
    inquirer.prompt({
        type: "confirm",
        name: "confirm",
        message: "Look up different info?" 
    }).then(answer => {
        if(answer.confirm) {
            displayManagerMenu();
        }
        else {
            console.log("Good luck with the manager thing!");
            connection.end();
        };
    });
};

function viewLowInventory(){
    let thisQuery = "select product_name, department_name, price, stock_quantity from products WHERE stock_quantity < 6";
    connection.query(thisQuery, function(error, results){
        if (error) throw error;
        results.map( result => {
            console.log("Product: " + result.product_name +
                        " | Department: " + result.department_name + 
                        " | Price: $" + result.price +
                        " | Quantity: " + result.stock_quantity);
        });
        manageSomethingElse();
    });
};

function addInventory(){
    let thisQuery = "select product_name, department_name, price, stock_quantity from products WHERE stock_quantity < 6";
    connection.query(thisQuery, function(error, results){
        if(error) throw error;
        // Prompt for which low inventory item to add
        let lowItems = results.map( result =>{
            return (result.product_name + ", Quantity: " + result.stock_quantity + " unit(s)");
        });
        inquirer.prompt(
            {
                type: "list",
                name: "inventoryAdd",
                message: "Which low-inventory item would you like to re-order?",
                choices: lowItems
            }
        ).then(answer => {
            console.log(answer);
            displayManagerMenu();
        });
    });
};