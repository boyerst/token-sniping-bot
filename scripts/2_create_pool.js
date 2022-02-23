// Fetches our token artifact 
const Token = artifacts.require("Token")
// Fetch the Uniswap Router interface
const IUniswapV2Router02 = require('@uniswap/v2-periphery/build/IUniswapV2Router02.json')
// Fetch the IERC20 artifact
const IERC20 = require('@openzeppelin/contracts/build/contracts/ERC20.json')

// Create a new version of Uniswap router with the actual mainnet address
  // This is the JS version created with the router artifact declared above
const uRouter = new web3.eth.Contract(IUniswapV2Router02.abi, '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D')

module.exports = async function (callback) {
    console.log(`Preparing to create Uniswap pool...\n`)

    // Declare deployer as the logged in user?
    const [deployer] = await web3.eth.getAccounts()

    // Declare and fetch the WETH contract we are forking to our local env
    const WETH = new web3.eth.Contract(IERC20.abi, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2')
    // Declare and fetch our token we declared in this project
    const DAPPU = await Token.deployed()

    // Declare an equal ratio of tokens
      // Where 250 tokens = 1 WETH
      // Denominated in ether but this really just means 'tokens'
      // Both DAPP and WETH have 18 decimals places
    const DAPPUAmount = web3.utils.toWei('250', 'ether')
    const WETHAmount = web3.utils.toWei('1', 'ether')

    console.log(`Approving WETH...`)

    // Approve the WETH so Uniswap can spend it on your behalf
    await WETH.methods.approve(uRouter._address, WETHAmount).send({ from: deployer })

    console.log(`Approving DAPPU...\n`)
    // Approve DAPP contract so Uniswap can spend it on your behalf
    await DAPPU.approve(uRouter._address, DAPPUAmount, { from: deployer })

    console.log(`Creating Uniswap pool...\n`)

    // Estimate gas so can calculate proper amount for the addLiquidity tx
    const gas = await uRouter.methods.addLiquidity(
        // address pool TokenA 
        DAPPU.address,
        // address pool TokenB
        WETH._address,
        // The amount of tokenA to add as liquidity if the B/A price is <= amountBDesired/amountADesired (A depreciates)
        DAPPUAmount,
        // The amount of tokenB to add as liquidity if the A/B price is <= amountADesired/amountBDesired (B depreciates)
        WETHAmount,
        // uint amountAMin
        DAPPUAmount,
        // unit amountBMin
        WETHAmount,
        // Deployer address
        deployer,
        // Deadline (Unix timestamp after which the transaction will revert)
        Math.floor(Date.now() / 1000) + 60 * 10
    ).estimateGas({ from: deployer })

    // Add liquidity to the pool
    await uRouter.methods.addLiquidity(
        DAPPU.address,
        WETH._address,
        DAPPUAmount,
        WETHAmount,
        DAPPUAmount,
        WETHAmount,
        deployer,
        Math.floor(Date.now() / 1000) + 60 * 10
    // Gas = gas amount that was estimated above
    ).send({ from: deployer, gas: gas })

    console.log(`Pool successfully created!\n`)

    callback()
}



