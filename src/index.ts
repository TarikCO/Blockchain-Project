import { Blockchain } from './blockchain';

const blockchain = new Blockchain(Number(process.argv[2] || 4))
const blockNumber = +process.argv[3] || 10
let chain = blockchain.chain

for (let i = 1; i <= blockNumber; i++){
  const block = blockchain.createBlock(`Block ${i}`)
  const mineInfo = blockchain.mineBlock(block)
  chain = blockchain.pushBlock(mineInfo.minedBlock)
}

console.log('--- BLOCKCHAIN ---\n')
console.log(chain)


