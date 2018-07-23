CREATE DATABASE bamazon;

USE bamazon;

DROP TABLE products IF EXISTS;
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