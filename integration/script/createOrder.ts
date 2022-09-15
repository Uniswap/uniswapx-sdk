import hre, { ethers } from 'hardhat';
import { splitSignature } from '@ethersproject/bytes';

const { BigNumber } = ethers;

import DutchLimitOrderReactorAbi from '../../abis/DutchLimitOrderReactor.json';
import PermitPostAbi from '../../abis/PermitPost.json';
import MockERC20Abi from '../../abis/MockERC20.json';
import OrderQuoterAbi from '../../abis/OrderQuoter.json';
import { DutchLimitOrderBuilder, OrderValidator } from '../../';
import {
  PermitPost,
  DutchLimitOrderReactor,
  OrderQuoter,
  MockERC20,
} from '../../src/contracts';


async function main() {
  const [maker, taker] = await ethers.getSigners();
  console.log('maker', await maker.getAddress());
  console.log('taker', await taker.getAddress());
  const chainId = 31337;
  // const chainId = 12341234;
  const addresses: { [key: string]: string } = {
    PermitPost: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    Reactor: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    Quoter: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
    Executor: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
    tokenA: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
    tokenB: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
  };


  const permitPostFactory = await ethers.getContractFactory(
    PermitPostAbi.abi,
    PermitPostAbi.bytecode
  );
  const permitPost: PermitPost = permitPostFactory.attach(addresses.PermitPost) as PermitPost;

  const reactorFactory = await ethers.getContractFactory(
    DutchLimitOrderReactorAbi.abi,
    DutchLimitOrderReactorAbi.bytecode
  );
  const reactor: DutchLimitOrderReactor = reactorFactory.attach(addresses.Reactor) as DutchLimitOrderReactor;

  const quoterFactory = await ethers.getContractFactory(
    OrderQuoterAbi.abi,
    OrderQuoterAbi.bytecode
  );
  const quoter: OrderQuoter = quoterFactory.attach(addresses.Quoter) as OrderQuoter;

  const tokenFactory = await ethers.getContractFactory(
    MockERC20Abi.abi,
    MockERC20Abi.bytecode
  );
  const tokenIn: MockERC20 = tokenFactory.attach(addresses.tokenA) as MockERC20;
  const tokenOut: MockERC20 = tokenFactory.attach(addresses.tokenB) as MockERC20;

  const validator = new OrderValidator(ethers.provider, chainId, quoter.address);

  const fillContract = addresses.Executor;
  console.log('fillContract', fillContract);

  await tokenIn.mint(
    await maker.getAddress(),
    BigNumber.from(10)
      .pow(18)
      .mul(100)
  );
  await tokenIn
  .connect(maker)
  .approve(permitPost.address, ethers.constants.MaxUint256);

  await tokenOut.mint(
    await taker.getAddress(),
    BigNumber.from(10)
      .pow(18)
      .mul(100)
  );
  await tokenOut
  .connect(taker)
  .approve(fillContract, ethers.constants.MaxUint256);

  const amount = BigNumber.from(10).pow(18);
  const deadline = Math.floor(new Date().getTime() / 1000) + 1000;
  const order = new DutchLimitOrderBuilder(
    chainId,
    reactor.address,
    permitPost.address
  )
  .deadline(deadline)
  .endTime(deadline)
  .startTime(deadline - 100)
  .nonce(BigNumber.from(0))
  .input({
    token: tokenIn.address,
    amount,
  })
  .output({
    token: tokenOut.address,
    startAmount: amount,
    endAmount: BigNumber.from(10)
    .pow(17)
    .mul(9),
    recipient: await maker.getAddress(),
  })
  .build();

  const { domain, types, values } = order.permitData();
  const signature = await maker._signTypedData(domain, types, values);
  console.log(await validator.validate({ order, signature }));
  const { v, r, s } = splitSignature(signature);
  const fillData = new ethers.utils.AbiCoder().encode(
    ['address', 'address'],
    [await taker.getAddress(), reactor.address]
  );

  const res = await reactor.execute(
    { order: order.serialize(), sig: { v, r, s } },
    fillContract,
    fillData,
    { gasLimit: 100000000 }
  );
  const receipt = await res.wait();
  console.log(receipt);
  console.log('order', order.serialize());
  console.log('sig', { v, r, s });
}


void main();
