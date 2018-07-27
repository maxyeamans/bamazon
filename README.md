# Bamazon

## What is Bamazon?
Bamazon is a CLI-only app for selling and managing products.
-Customers can easily make purchases from a list of in-stock products.
-Managers can view all products that Bamazon sells, view low inventory, re-stock their low inventory, and even add new products.

## What technologies are used?
The main technologies used for Bamazon are a MySQL database to keep track of products and Node for the CLI interface. The mysql npm package is used for make queries to the database, and the inquirer npm package.

## How do I set this up?
First, you'll need to have a MySQL server set up with the following settings:
- Host: localhost
- Port: 3306
- User: host
- Password: password

Once you have the server up and running, you'll need to run the following query to create the Bamazon database, create the Products table, and populate the table with products.

```sql
DROP DATABASE IF EXISTS bamazon ;
CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products (
    item_id INT(11) AUTO_INCREMENT NOT NULL,
    product_name VARCHAR(100),
    department_name VARCHAR(100),
    price DECIMAL(10,4),
    stock_quantity INT(11),
    PRIMARY KEY(item_id)
);

INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES ("Avengers [BLU-RAY]", "Video", 18.99, 10);
INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES ("Captain America: Civil War [BLU-RAY]", "Video", 20.99, 12);
INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES ("Thor: Ragnarok [BLU-RAY]", "Video", 21.99, 8);
INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES ("Spider-Man [PS4]", "Games", 62.99, 10);
INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES ("Kingdom Hearts 3 [PS4]", "Games", 69.99, 12);
INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES ("Harry Potter and the Deathly Hallows [Hardcover]", "Books", 20.99, 5);
INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES ("American Gods [Hardcover]", "Books", 22.99, 6);
INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES ("Horizon Zero Dawn", "Games", 20.95, 20);
INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES ("Percy Jackson and the Lightning Thief [Paperback]", "Books", 12.95, 12);
INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES ("Deadpool 2 [BLU-RAY]", "Video", 24.99, 10);
INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES ("Logan [Digital Download]", "Video", 18.99, 12);
INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES ("Star Wars: The Empire Strikes Back [BLU-RAY]", "Video", 19.99, 10);
```
(Don't worry, the query is saved in the git repo)

Assuming you cloned the full repo, you should be able to run both .js files by opening git bash in the cloned directory and typing `node bamazonCustomer.js` or `node bamazonManager.js`

## How do I use Bamazon?

### bamazonCustomer.js
The customer app presents a list of all of the in-stock products available for purchase. By default, 10 products are shown in the list at a time, and the user can use the arrow keys to scroll through it.

Once the user selects an item, they're asked how many of the product they'd like to buy. There's some user validation at this point: if the user enters a non-number or a number less than 1, they're prompted to re-enter a valid number.

After selecting their product and the number to purchase, they'll either see a success message showing their total purchase cost, or an error message stating that Bamazon doesn't have enough inventory to fulfill the purchase. In either case, the customer is asked if they'd like to make another purchase or quit out of the app.

### bamazonManager.js

The manager app allows you to...well, manage Bamazon inventory. The manager can select from five options:
- View Products for Sale: This option shows all products that Bamazon sells, with a warning at the end of each line if the inventory has fallen to 5 or fewer.
- View Low Inventory: This option shows just the products with 5 or fewer.
- Add to Inventory: This option allows the manager to select a low-inventory item to restock, and by how much. If there's no low inventory, the manager is admonished for not having good sales numbers.
- Add New Product: This option allows the manager to choose to stock a brand new item. The manager is asked for the product name, department, selling price, and how many units to initially stock. All fields have input validation to make sure an item can't be added with a blank name/department, no price, or no initial inventory.
- Nothing, I'm done here: Exits the app.

## Where to from here?

* Complete the optional third part of this assignment with a Supervisor View to keep track of sales and overhead costs.

* Change the customer file to allow the user to select multiple items per purchase instead of just being limited to one.

* Create a product_sales table to keep track of each individual purchase with an order_id.