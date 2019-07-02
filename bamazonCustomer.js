var mysql = require("mysql");
var inquirer = require("inquirer");

// create the connection information for the sql database
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "bootcamp",
    database: "bamazon"
});

// connect to the mysql server and sql database
connection.connect(function(err) {
    if (err) throw err;
    // run the start function after the connection is made to prompt the user
    start();
});

function start() {
    // query the database for all items
    connection.query("SELECT * FROM products", function(err, results) {
        if (err) throw err;

        // display products
        for (var i = 0; i < results.length; i++) {
            console.log("");
            console.log("Item ID: " + results[i].item_id);
            console.log("Product Name: " + results[i].product_name);
            console.log("Price: " + results[i].price);
            console.log("");
            console.log("----------");
        }

        inquirer
            .prompt([
                {
                    name: "choice",
                    type: "input",
                    message: "Which item would you like to buy?  Please enter the ID"
                },
                {
                    name: "quantity",
                    type: "input",
                    message: "How many would you like to buy?"
                }
            ])
            .then(function(answer) {
                // get the information of the chosen item
                var chosenItem;
                for (var i = 0; i < results.length; i++) {
                    if (results[i].item_id === parseInt(answer.choice)) {
                        chosenItem = results[i];
                    }
                }

                // determine if there is enough quantity
                if (parseInt(chosenItem.stock_quantity) >= parseInt(answer.quantity)) {
                    // quantity enough, so update db, let the user know, and start over
                    var newQuantity = (chosenItem.stock_quantity - answer.quantity);
                    connection.query(
                    "UPDATE products SET ? WHERE ?",
                        [
                            {
                                stock_quantity: newQuantity
                            },
                            {
                                item_id: chosenItem.item_id
                            }
                        ],
                        function(error) {
                            if (error) throw err;
                            console.log("");
                            console.log("Thanks for your order.  Your total cost is: " + Math.round((answer.quantity * chosenItem.price) * 100) / 100);
                            console.log("");
                            connection.end();
                        }
                    );
                }
                else {
                    // not enough quantity
                    console.log("");
                    console.log("Insufficient quantity!");
                    console.log("");
                    connection.end();
                }
            });
    });
  }