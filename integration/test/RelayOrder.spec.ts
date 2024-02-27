import hre, { ethers } from 'hardhat';
import { expect } from 'chai';
import { BigNumber, Signer } from 'ethers';

import { BlockchainTime } from './utils/time';

import RelayOrderReactorAbi from '../../abis/RelayOrderReactor.json';
import Permit2Abi from '../../abis/Permit2.json';
import MockERC20Abi from '../../abis/MockERC20.json';

import {
  Permit2,
  MockERC20,
  RelayOrderReactor,
} from '../../src/contracts';
import { RelayOrderBuilder } from '../../src';

describe('RelayOrder', () => {
  let reactor: RelayOrderReactor;
  let permit2: Permit2;
  let chainId: number;
  let swapper: ethers.Wallet;
  let tokenIn: MockERC20;
  let tokenOut: MockERC20;
  let admin: Signer;
  let filler: Signer;
  let inputRecipient: string;
  let feeRecipient: string;

  before(async () => {
    [admin, filler] = await ethers.getSigners();
    
    inputRecipient = ethers.utils.computeAddress("0xdead");
    feeRecipient = ethers.utils.computeAddress("0xbeef");

    const permit2Factory = await ethers.getContractFactory(
      Permit2Abi.abi,
      Permit2Abi.bytecode
    );
    permit2 = (await permit2Factory.deploy()) as Permit2;

    const reactorFactory = await ethers.getContractFactory(
      RelayOrderReactorAbi.abi,
      RelayOrderReactorAbi.bytecode
    );
    reactor = (await reactorFactory.deploy(
      permit2.address,
      ethers.constants.AddressZero
    )) as RelayOrderReactor;

    chainId = hre.network.config.chainId || 1;

    swapper = ethers.Wallet.createRandom().connect(ethers.provider);
    await admin.sendTransaction({
      to: await swapper.getAddress(),
      value: BigNumber.from(10).pow(18),
    });

    const tokenFactory = await ethers.getContractFactory(
      MockERC20Abi.abi,
      MockERC20Abi.bytecode
    );
    tokenIn = (await tokenFactory.deploy('TEST A', 'ta', 18)) as MockERC20;
    tokenOut = (await tokenFactory.deploy('TEST B', 'tb', 18)) as MockERC20;

    await tokenIn.mint(
      await swapper.getAddress(),
      BigNumber.from(10).pow(18).mul(100)
    );
    await tokenIn
      .connect(swapper)
      .approve(permit2.address, ethers.constants.MaxUint256);
  });

  it('correctly builds an order', async () => {
    const amount = BigNumber.from(10).pow(18);
    const deadline = await new BlockchainTime().secondsFromNow(1000);
    const swapperAddress = await swapper.getAddress();
    const preBuildOrder = new RelayOrderBuilder(
      chainId,
      reactor.address,
      permit2.address
    )
      .deadline(deadline)
      .swapper(swapperAddress)
      .nonce(BigNumber.from(100))
      .input({
        token: tokenIn.address,
        amount: amount,
        recipient: inputRecipient,
      })
      .fee({
        token: tokenOut.address,
        startAmount: amount,
        endAmount: BigNumber.from(10).pow(17).mul(9),
        startTime: deadline - 100,
        endTime: deadline,
      })
      .universalRouterCalldata('0x');

    let order = preBuildOrder.build();

    expect(order.info.deadline).to.eq(deadline);
    expect(order.info.swapper).to.eq(swapperAddress);
    expect(order.info.nonce.toNumber()).to.eq(100);

    expect(order.info.input.token).to.eq(tokenIn.address);
    expect(order.info.input.amount).to.eq(amount);
    expect(order.info.input.recipient).to.eq(inputRecipient);

    const fee = order.info.fee;

    expect(fee.token).to.eq(tokenOut.address);
    expect(fee.startAmount).to.eq(amount);
    expect(fee.endAmount.eq(BigNumber.from(10).pow(17).mul(9))).to.be
      .true;
    expect(fee.endTime).to.eq(deadline);
    expect(fee.startTime).to.eq(deadline - 100);

    order = preBuildOrder.universalRouterCalldata('0x1111111111111111111111111111111111111111').build();
    expect(order.info.universalRouterCalldata).to.eq('0x1111111111111111111111111111111111111111');
  });

  it('executes a serialized order with no decay', async () => {
    const amount = BigNumber.from(10).pow(18);
    const deadline = await new BlockchainTime().secondsFromNow(1000);
    
    const order = new RelayOrderBuilder(
        chainId,
        reactor.address,
        permit2.address
      )
        .deadline(deadline)
        .swapper(await swapper.getAddress())
        .nonce(BigNumber.from(100))
        .input({
          token: tokenIn.address,
          amount: amount,
          recipient: inputRecipient,
        })
        .fee({
          token: tokenOut.address,
          startAmount: amount,
          endAmount: BigNumber.from(10).pow(17).mul(9),
          startTime: deadline - 100,
          endTime: deadline,
        })
        .universalRouterCalldata('0x')
        .build();

    const { domain, types, values } = order.permitData();
    const signature = await swapper._signTypedData(domain, types, values);

    const swapperTokenInBalanceBefore = await tokenIn.balanceOf(
      await swapper.getAddress()
    );
    const fillerTokenInBalanceBefore = await tokenIn.balanceOf(
      await filler.getAddress()
    );
    const swapperTokenOutBalanceBefore = await tokenOut.balanceOf(
      await swapper.getAddress()
    );
    const fillerTokenOutBalanceBefore = await tokenOut.balanceOf(
      await filler.getAddress()
    );

    const res = await reactor
      .connect(filler)
      .execute(
        { order: order.serialize(), sig: signature },
      );

    const receipt = await res.wait();
    expect(receipt.status).to.equal(1);
    expect(
      (await tokenIn.balanceOf(await swapper.getAddress())).toString()
    ).to.equal(swapperTokenInBalanceBefore.sub(amount).toString());
    expect(
      (await tokenIn.balanceOf(await filler.getAddress())).toString()
    ).to.equal(fillerTokenInBalanceBefore.add(amount).toString());
    expect(
      (await tokenOut.balanceOf(await swapper.getAddress())).toString()
    ).to.equal(swapperTokenOutBalanceBefore.add(amount).toString());
    expect(
      (await tokenOut.balanceOf(await filler.getAddress())).toString()
    ).to.equal(fillerTokenOutBalanceBefore.sub(amount).toString());
  });

  it('executes a serialized order with decay', async () => {
    const amount = BigNumber.from(10).pow(18);
    const time = new BlockchainTime();
    const deadline = await time.secondsFromNow(1000);

    const order = new RelayOrderBuilder(
      chainId,
      reactor.address,
      permit2.address
    )
      .deadline(deadline)
      .swapper(await swapper.getAddress())
      .nonce(BigNumber.from(100))
      .input({
        token: tokenIn.address,
        amount: amount,
        recipient: inputRecipient,
      })
      .fee({
        token: tokenOut.address,
        startAmount: amount,
        endAmount: BigNumber.from(10).pow(17).mul(9),
        startTime: deadline - 2000,
        endTime: deadline,
      })
      .universalRouterCalldata('0x')
      .build();

    const { domain, types, values } = order.permitData();
    const signature = await swapper._signTypedData(domain, types, values);

    const swapperTokenInBalanceBefore = await tokenIn.balanceOf(
      await swapper.getAddress()
    );
    const fillerTokenInBalanceBefore = await tokenIn.balanceOf(
      await filler.getAddress()
    );

    const res = await reactor
      .connect(filler)
      .execute(
        { order: order.serialize(), sig: signature },
      );
    const receipt = await res.wait();
    expect(receipt.status).to.equal(1);
    
    const feeAmount = order.info.fee.startAmount
      .add(order.info.fee.endAmount)
      .div(2);
    // some variance in block timestamp so we need to use a threshold
    expectThreshold(
      await tokenIn.balanceOf(await swapper.getAddress()),
      swapperTokenInBalanceBefore.add(feeAmount),
      BigNumber.from(10).pow(15)
    );
    expectThreshold(
      await tokenIn.balanceOf(await filler.getAddress()),
      fillerTokenInBalanceBefore.sub(feeAmount),
      BigNumber.from(10).pow(15)
    );
  });

  function expectThreshold(
    a: BigNumber,
    b: BigNumber,
    threshold: BigNumber
  ): void {
    if (a.gt(b)) {
      expect(a.sub(b).lte(threshold)).to.equal(true);
    } else {
      expect(b.sub(a).lte(threshold)).to.equal(true);
    }
  }
});
