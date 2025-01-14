const { getLogs } = require('../helper/cache/getLogs')

// https://github.com/poolshark-protocol/limit/blob/master/scripts/autogen/contract-deployments.json
const config = {
  arbitrum: { limitPoolFactory: '0x40E21Ce13f5089Bc421c063506bbB0dF02BcA07E', limitPoolFromBlock: 158864748 },
}

Object.keys(config).forEach(chain => {
  const { limitPoolFactory, limitPoolFromBlock, } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const logs = await getLogs({
        api,
        target: limitPoolFactory,
        eventAbi: 'event LimitPoolCreated(address pool, address token, address indexed token0, address indexed token1, uint16 indexed swapFee, int16 tickSpacing, uint16 poolTypeId)',
        onlyArgs: true,
        fromBlock: limitPoolFromBlock,
      })
      const ownerTokens = logs.map(log => [[log.token0, log.token1], log.pool])

      if (chain === 'arbitrum') {
        const logs = await getLogs({
          api,
          target: '0xd28d620853af6837d76f1360dc65229d57ba5435',
          eventAbi: 'event PoolCreated(address pool, address token, address indexed token0, address indexed token1, uint16 indexed swapFee, int16 tickSpacing, uint16 poolTypeId)',
          onlyArgs: true,
          fromBlock: 158864748,
          toBlock: 165105915,
        })
        ownerTokens.push(...logs.map(log => [[log.token0, log.token1], log.pool]))
      }
      return api.sumTokens({ ownerTokens })
    }
  }
})
