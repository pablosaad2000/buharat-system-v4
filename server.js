const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost/mydatabase', { useNewUrlParser: true, useUnifiedTopology: true });

// Define a schema for customer
const customerSchema = new mongoose.Schema({
    name: String,
    phone: String
});

// Create a model for customer
const Customer = mongoose.model('Customer', customerSchema);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Route to add a customer
app.post('/addCustomer', (req, res) => {
    const newCustomer = new Customer({
        name: req.body.name,
        phone: req.body.phone
    });

    newCustomer.save().then(() => {
        res.send('Customer data saved successfully!');
    }).catch((err) => {
        res.status(500).send('Error saving data!');
    });
});

// Route to get all customers
app.get('/customers', (req, res) => {
    Customer.find().then((customers) => {
        res.json(customers);
    }).catch((err) => {
        res.status(500).send('Error retrieving data!');
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
