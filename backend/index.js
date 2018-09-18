const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const socketio = require('@feathersjs/socketio');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');
const Web3 = require('web3');
const MongoDb = require('mongodb');
const MongoClient = MongoDb.MongoClient;

// using SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey('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');

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

const fetchDocumentFromDb = (docId) => {
    return new Promise((resolve, reject) => {
        mongoDbClient.then(client => {
            const db = client.db(dbName);

            // Get the documents collection
            const collection = db.collection('documents');
            console.log('Search for document with id: #' + docId);

            collection.findOne({_id: MongoDb.ObjectId(docId)}, (err, result) => {
                if (err) {
                    reject(err);
                } else if (result !== null) {
                    console.log('Found document with id: #' + docId);
                    resolve(result);
                } else {
                    console.log('Unable to find document with id: #' + docId);
                    resolve(null);
                }
            });
        });
    });
};

const replaceDocumentInDb = (docId, document) => {
    return new Promise((resolve, reject) => {
        mongoDbClient.then(client => {
            const db = client.db(dbName);

            // Get the documents collection
            const collection = db.collection('documents');
            console.log('Search (& replace) for document with id: #' + docId);

            collection.findOneAndReplace({_id: MongoDb.ObjectId(docId)}, document, (err, result) => {
                if (err) {
                    return reject(err);
                } else {
                    return resolve(result);
                }
            });
        }).catch((err) => {
            return reject(err);
        });
    });
};

const ethAccount = '0x53D69fF11FC57A4b66F2A77572C17BBb74F32A50';
const ethPassword = '1f3634e28b3b5b7248136792e204d22f14d21aa4cc99ed15e1a9c7df78fb8e30';
const smarbicoBase = require('../contracts/build/contracts/SmarbicoBase.json');
const smarbicoBaseAddress = smarbicoBase.networks["5777"].address;
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
    }).catch((err) => {
        throw err;
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

const addContract = (contractId, contractHash) => {
    return new Promise((resolve, reject) => {
        smarbicoBaseContract.methods.addContract('0x' + contractId, '0x' + contractHash).send(ethTransactionConfig).on('transactionHash', (hash) => {
            console.log('addContract() - transactionHash: ' + hash);
        }).on('receipt', (receipt) => {
            console.log('addContract() - receipt: ' + JSON.stringify(receipt));
            resolve(true);
        }).on('error', () => {
            resolve(false);
        });
    });
};

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

app.get('/contract/:contractId', (req, res, next) => {
    const docId = req.params.contractId;

    fetchDocumentFromDb(docId).then(doc => {
        res.status(200).send(doc);
    }).catch(err => {
        res.status(500).send({
            'status': 'ERROR',
            'error': err
        });
    });
});

app.post('/contract/:contractId', upload.single('file'), function (req, httpRes, next) {
    const docId = req.params.contractId;

    // req.file is the file
    // req.body will hold the text fields, if there were any
    fs.readFile('uploads/' + req.file.filename, function (err, data) {
        if (err) throw err;

        const hash = crypto.createHash('sha256');
        hash.update(data);
        let hashedFile = hash.digest('hex');

        fetchDocumentFromDb(docId).then((oldDoc) => {
            console.log(oldDoc);

            const newDoc = {
                ...oldDoc,
                files: [
                    ...oldDoc.files,
                    {
                        'class': 'additional',
                        'type': req.file.mimetype,
                        'filename': req.file.originalname,
                        'data': data,
                        'hash': hashedFile
                    }
                ]
            };

            replaceDocumentInDb(docId, newDoc).then((res) => {
                console.log('Successfully replace document #' + docId + ' with a newer version');

                httpRes.status(200).send({
                    'status': 'OK'
                });
            });
        }).catch((err) => {
            httpRes.status(500).send({
                'status': 'ERROR'
            });

            throw err;
        });
    });
});

app.post('/new-contract', upload.single('file'), function (req, res, next) {
    console.log(JSON.stringify(req.body));

    // req.file is the file
    // req.body will hold the text fields, if there were any
    fs.readFile('uploads/' + req.file.filename, function (err, data) {
        if (err) throw err;

        const hash = crypto.createHash('sha256');
        hash.update(data);
        let hashedFile = hash.digest('hex');

        const dbInsert = insertDocument2Db({
            'createdAt': new Date().getTime(),
            'files': [
                {
                    'class': 'contract',
                    'type': req.file.mimetype,
                    'filename': req.file.originalname,
                    'data': data,
                    'hash': hashedFile
                }
            ],
            'contacts': [
                {
                    'contact': 'seller',
                    'email': req.body.emailSeller
                },
                {
                    'contact': 'buyer',
                    'email': req.body.emailBuyer
                }
            ]
        });

        dbInsert.then(result => {
            const addContractPromise = addContract(result.insertedId, hashedFile);
            addContractPromise.then(() => {
                const subject = 'Your contract is now secure #' + result.insertedId;

                const msgSeller = {
                    to: req.body.emailSeller,
                    from: 'no-replay@smarbico.com',
                    subject: subject,
                    text: 'now you can manage all of your claims on SmArbiCo.com'
                };

                sgMail.send(msgSeller);

                const msgBuyer = {
                    to: req.body.emailBuyer,
                    from: 'no-replay@smarbico.com',
                    subject: subject,
                    text: 'now you can manage all of your claims on SmArbiCo.com'
                };

                sgMail.send(msgBuyer);

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
app.listen(3030, '127.0.0.1').on('listening', () =>
    console.log('smarbico server listening on 127.0.0.1:3030')
);
