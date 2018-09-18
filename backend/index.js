const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const socketio = require('@feathersjs/socketio');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');
const Web3 = require('web3');
const Eth = require('web3-eth');

const ethAccount = '0x53D69fF11FC57A4b66F2A77572C17BBb74F32A50';
const ethPassword = '1f3634e28b3b5b7248136792e204d22f14d21aa4cc99ed15e1a9c7df78fb8e30';
const smarbicoBase = require('../contracts/build/contracts/SmarbicoBase.json');

const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
web3.eth.defaultAccount = ethAccount;

console.log('unlocking account #' + ethAccount);
web3.eth.personal.unlockAccount(ethAccount, ethPassword, 600, () => {
    console.log('account unlocked, trying to claim ownership of contract');

    const smarbicoBaseContract = new web3.eth.Contract(smarbicoBase.abi, smarbicoBase.networks['5777'].address, {
        from: ethAccount, // default from address
        gasPrice: '1' // default gas price in wei, 20 gwei in this case
    });

    smarbicoBaseContract.methods.claimOwnership().send({
        gasPrice: '1',
        gas: '9999999999999'
    }).on('transactionHash', function (hash) {
        console.log('claimOwnership() - transactionHash: ' + hash);
    }).on('receipt', function (receipt) {
        console.log('claimOwnership() - receipt: ' + receipt);
    }).on('confirmation', function (confirmationNumber, receipt) {
        console.log('claimOwnership() - confirmation: ' + confirmationNumber + ' | receipt: ' + receipt);
    }).on('error', console.error);
});

// Creates an Express compatible Feathers application
const app = express(feathers());
// serve static files
app.use(express.static('public'));
// Parse HTTP JSON bodies
app.use(express.json());
// Parse URL-encoded params
app.use(express.urlencoded({extended: true}));
// Add REST API support
app.configure(express.rest());
// Configure Socket.io real-time APIs
app.configure(socketio());
// Register a nicer error handler than the default Express one
app.use(express.errorHandler());

var upload = multer({dest: 'uploads/'});

app.post('/new-contract', upload.single('file'), function (req, res, next) {
    // req.file is the file
    // req.body will hold the text fields, if there were any
    console.log(req.file);
    console.log(req.body);

    fs.readFile('uploads/' + req.file.filename, function (err, data) {
        if (err) throw err;

        const hash = crypto.createHash('sha256');
        hash.update(data);
        let hashedFile = hash.digest('hex');
        console.log("Hash: " + hashedFile);

        res.status(200).send({
            'hash': hashedFile,
            'status': 'OK'
        });
    });
});

// Add any new real-time connection to the `everybody` channel
app.on('connection', connection => app.channel('everybody').join(connection));
// Publish all events to the `everybody` channel
app.publish(data => app.channel('everybody'));

// Start the server
app.listen(3030).on('listening', () =>
    console.log('smarbico server listening on localhost:3030')
);
