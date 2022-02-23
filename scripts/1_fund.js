// This script will
  // Fund the deployer account to create a new pool of WETH/IERC20
  // Fund the sniper bot that will buy tokens with WETH

// Grab our token contract (the interface for our basic ERC20 token from openzeppelin)
const IERC20 = require('@openzeppelin/contracts/build/contracts/ERC20.json')

// Grab WETH contract to use as pair for our Uniswap pool
const WETH = new web3.eth.Contract(IERC20.abi, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2')

// An account from the mainnet that has WETH in it for us to use
  // We are pretending to be this account
const UNLOCKED_ACCOUNT = '0x2fEb1512183545f48f6b9C5b4EbfCaF49CfCa6F3'

module.exports = async function (callback) {
    // Deployer is one of our accounts on ganache that runs the 'Uniswap LP'
      // We fund it with WETH and our ERC20 token
    // Sniper is the trading bot that will buy the token in the 'Uniswap LP'
      // We buy the tokens with WITH
    const [deployer, sniper] = await web3.eth.getAccounts()

    // We declare an amount...
    const amount = web3.utils.toWei('10', 'ether')
    // ...to transfer from unlocked account to deployer...
    await WETH.methods.transfer(deployer, amount).send({ from: UNLOCKED_ACCOUNT })
    // .. and also from the unlocked account to the sniper
    await WETH.methods.transfer(sniper, amount).send({ from: UNLOCKED_ACCOUNT })

    // Check bal of pool
    const deployerBalance = await WETH.methods.balanceOf(deployer).call()
    console.log(`WETH amount in deployer: ${deployerBalance / 1e18}\n`)

    // Check bal of sniper
    const sniperBalance = await WETH.methods.balanceOf(sniper).call()
    console.log(`WETH amount in sniper: ${sniperBalance / 1e18}\n`)

    callback()
}