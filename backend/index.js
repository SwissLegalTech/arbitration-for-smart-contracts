const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const socketio = require('@feathersjs/socketio');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');
const Web3 = require('web3');
const MongoClient = require('mongodb').MongoClient;

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'smarbico';

const mongoDbClient = new Promise((resolve, reject) => {
    // Use connect method to connect to the server
    MongoClient.connect(url, (err, client) => {
        if (err) {
            console.error(err);
            reject(err);
        }

        console.log("Connected successfully to mongoDB server");
        resolve(client);
    });
});

const insertDocument2Db = (document) => {
    return new Promise((resolve, reject) => {
        mongoDbClient.then(client => {
            const db = client.db(dbName);

            // Get the documents collection
            const collection = db.collection('documents');

            collection.insertOne(document, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    });
};

const ethAccount = '0x53D69fF11FC57A4b66F2A77572C17BBb74F32A50';
const ethPassword = '1f3634e28b3b5b7248136792e204d22f14d21aa4cc99ed15e1a9c7df78fb8e30';
const smarbicoBase = require('../contracts/build/contracts/SmarbicoBase.json');
const smarbicoBaseAddress = '0x679d4cfcaaea1b273fb42a5af7243c32709d9a14';
const ethTransactionConfig = {
    from: ethAccount,
    gasPrice: '0',
    gas: '7900000'
};

const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));
web3.eth.defaultAccount = ethAccount;

console.log('unlocking account #' + ethAccount);
web3.eth.personal.unlockAccount(ethAccount, ethPassword, 6000, () => {
    console.log('account unlocked, trying to claim ownership of contract');
    initializeBlockchain().then(() => {
        console.log("blockchain initialization successful");
    });
});

async function initializeBlockchain() {
    let contractCount = await getContractCount;
    console.log("current contract count: " + contractCount);

    let currentOwner = await determineOwnership;
    console.log("Owner was already set on: " + currentOwner);

    if (currentOwner !== ethAccount) {
        let claimOwnershipResult = await claimOwnership;

        if (claimOwnershipResult) {
            console.log("claimOwnership was successul");
        } else {
            console.log("claimOwnership was not successul");
            throw "Ownership already set on different account";
        }
    }
}

const smarbicoBaseContract = new web3.eth.Contract(smarbicoBase.abi, smarbicoBaseAddress, ethTransactionConfig);

const getContractCount = new Promise((resolve, reject) => {
    smarbicoBaseContract.methods.getContractCount().call(ethTransactionConfig).then((result) => {
      resolve(result);
    });
});

const claimOwnership = new Promise((resolve, reject) => {
    smarbicoBaseContract.methods.claimOwnership().send(ethTransactionConfig).on('transactionHash', (hash) => {
        console.log('claimOwnership() - transactionHash: ' + hash);
    }).on('receipt', (receipt) => {
        console.log('claimOwnership() - receipt: ' + JSON.stringify(receipt));
        resolve(true);
    }).on('error', () => {
        resolve(false);
    });
});

const determineOwnership = new Promise((resolve, reject) => {
    smarbicoBaseContract.methods.owner().call(ethTransactionConfig).then((result) => {
        resolve(result);
    });
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
    console.log(JSON.stringify(req.file));

    // req.file is the file
    // req.body will hold the text fields, if there were any
    fs.readFile('uploads/' + req.file.filename, function (err, data) {
        if (err) throw err;

        const hash = crypto.createHash('sha256');
        hash.update(data);
        let hashedFile = hash.digest('hex');

        const dbInsert = insertDocument2Db({
            'files': [
                {
                    'type': req.file.mimetype,
                    'filename': req.file.originalname,
                    'data': data,
                    'hash': hashedFile
                }
            ],
            'contacts': [
                {
                    'email': 'test@test.de',
                    'phone': 'test@test.de'
                }
            ]
        });

        dbInsert.then(result => {
            res.status(200).send({
                'id': result.insertedId,
                'hash': hashedFile,
                'status': 'OK'
            });
        }).catch(err => {
            return res.status(500).send({
                'hash': hashedFile,
                'status': 'ERROR',
                'error': err
            });
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
