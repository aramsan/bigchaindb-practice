const driver = require('bigchaindb-driver')

// BigchainDB server instance (e.g. https://example.com/api/v1/)
const API_PATH = 'http://localhost:9984/api/v1/'

// Send the transaction off to BigchainDB
const conn = new driver.Connection(API_PATH)
main()

async function main() {
    // Create a new keypair.
    let alice = new driver.Ed25519Keypair()

    let data = {}
    data.asset = {
        city: 'Kawasaki, JP',
        temperature: 21,
        datetime: new Date().toString(),
    }
    data.meta = { what: 'My first BigchainDB transaction' }

    let result
    result = await writeToChain(conn, data, alice)
    //console.log(result)
    result = await queryAsset(conn, result.id)
    console.log(result)
}

async function writeToChain(conn, data, keypair) {
    // Construct a transaction payload
    const tx = driver.Transaction.makeCreateTransaction(
        // Define the asset to store
        data.asset,
        // Metadata contains information about the transaction itself
        // (can be `null` if not needed)
        data.meta,
        // A transaction needs an output
        [
            driver.Transaction.makeOutput(
                driver.Transaction.makeEd25519Condition(keypair.publicKey)
            ),
        ],
        keypair.publicKey
    )

    // Sign the transaction with private keys
    const txSigned = driver.Transaction.signTransaction(tx, keypair.privateKey)

    return await conn.postTransactionCommit(txSigned)
}

async function queryAsset(conn, query) {
    return await conn.searchAssets(query)
}
