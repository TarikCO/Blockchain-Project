import { hash, isHashProofed } from './helpers'

export interface Block {
    header: {
        nonce: number
        blockHash: string
    }
    payload: {
        sequence: number
        timestamp: number
        data: any
        previousHash: string
    }
}

export class Blockchain {
    #chain: Block[] = []
    private prefixPow = '0'

    constructor(private readonly difficulty: number = 4) {
        this.#chain.push(this.createGenesisBlock())
    }

    private createGenesisBlock() {
        const payload = {
            sequence: 0,
            timestamp: +new Date(),
            data: 'Genesis Block',
            previousHash: ''
        }
        return {
            header: {
                nonce: 0,
                blockHash: hash(JSON.stringify(payload))
            },
            payload
        }
    }

    get chain () {
        return this.#chain
    }

    private get lastBlock (): Block {
        return this.#chain.at(-1) as Block
    }

    private previousBlockHash () {
        return this.lastBlock.header.blockHash
    }

    createBlock (data: any) {
        const newBlock = {
            sequence: this.lastBlock.payload.sequence + 1,
            timestamp: +new Date(),
            data,
            previousHash: this.previousBlockHash()
        }

        console.log(`Block #${newBlock.sequence} created: ${JSON.stringify(newBlock, null, 2)}`)
        return newBlock
    }

    mineBlock (block: Block['payload']) {
        let nonce = 0
        let startTime = +new Date()

        while (true) {
            const blockHash = hash(JSON.stringify(block))
            const hashPow = hash(blockHash + nonce)

            if (isHashProofed({
                hash: hashPow, 
                difficulty: this.difficulty,
                prefix: this.prefixPow
            })) {
                const finalTime = +new Date()
                const shortHash = blockHash.slice(0, 12)
                const timeMined = (finalTime - startTime) / 1000

                console.log(`Block #${block.sequence} mined in ${timeMined}s. 
                Hash ${shortHash} (${nonce} attempts)`)

                return {
                    minedBlock: {payload: {...block}, header: {nonce, blockHash}},
                    minedHash: hashPow,
                    shortHash,
                    timeMined
                }
            }
            nonce++
        }
    }
    

    verifyBlock (block: Block) {
        if (block.payload.previousHash !== this.previousBlockHash()) {
            console.error(`Block #${block.payload.sequence} invalid: previous block hash is "${this.previousBlockHash().slice(0,12)}" and not "${block.payload.previousHash.slice(0,12)}"`)
            return
        }

        if (!isHashProofed({
            hash: hash(hash(JSON.stringify(block.payload)) + block.header.nonce),
            difficulty: this.difficulty, 
            prefix: this.prefixPow
        })) {
            console.error(`Block #${block.payload.sequence} invalid: Hash not proofed, nonce ${block.header.nonce} is invalid and cannot be verified`)
            return 
        }

        return true
    }

    pushBlock (block: Block) {
        if (this.verifyBlock(block)) this.#chain.push(block)
        console.log(`Pushed block #${JSON.stringify(block, null, 2)}`)
        return this.#chain
    }
}























