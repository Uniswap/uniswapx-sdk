import { Currency, CurrencyAmount, Token, TradeType } from "@uniswap/sdk-core";
import { BigNumber, ethers } from "ethers";

import { RelayOrderInfo } from "../order";

import { RelayOrderTrade } from "./RelayOrderTrade";

const USDC = new Token(
  1,
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  6,
  "USDC"
);
const DAI = new Token(
  1,
  "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  18,
  "DAI"
);

describe("RelayOrderTrade", () => {
  const FEE_INPUT_AMOUNT = BigNumber.from(100);
  const FEE_MAXIMUM_INPUT_AMOUNT = BigNumber.from(200);
  const NON_FEE_INPUT_AMOUNT = BigNumber.from(1000);
  const NON_FEE_MAXIMUM_INPUT_AMOUNT = BigNumber.from(2000);

  // 1000 DAI
  const MOCK_SWAP_OUTPUT_AMOUNT = CurrencyAmount.fromRawAmount(
    DAI,
    "1000000000000000000000"
  );
  const OUTPUT_AMOUNT = BigNumber.from("1000000000000000000000");

  const getOrderInfo = (data: Partial<RelayOrderInfo>): RelayOrderInfo => {
    const decayStartTime = Math.floor(new Date().getTime() / 1000);
    const decayEndTime = Math.floor(new Date().getTime() / 1000) + 1000;
    return Object.assign(
      {
        deadline: decayEndTime,
        reactor: "0x0000000000000000000000000000000000000000",
        swapper: "0x0000000000000000000000000000000000000000",
        nonce: BigNumber.from(10),
        decayStartTime,
        decayEndTime,
        actions: [],
        inputs: [
          {
            token: USDC.address,
            startAmount: FEE_INPUT_AMOUNT,
            maxAmount: FEE_MAXIMUM_INPUT_AMOUNT,
            recipient: ethers.constants.AddressZero,
          },
          {
            token: USDC.address,
            startAmount: NON_FEE_INPUT_AMOUNT,
            maxAmount: NON_FEE_MAXIMUM_INPUT_AMOUNT,
            recipient: "0x0000000000000000000000000000000000000001",
          },
        ],
      },
      data
    );
  };

  const orderInfo = getOrderInfo({});

  const trade = new RelayOrderTrade<Currency, Currency, TradeType>({
    currenciesIn: [USDC],
    outputAmount: MOCK_SWAP_OUTPUT_AMOUNT,
    orderInfo,
    tradeType: TradeType.EXACT_INPUT,
  });

  it("returns the right input amounts for an exact-in trade", () => {
    expect(trade.inputAmounts[0].quotient.toString()).toEqual("100");
    expect(trade.inputAmounts[1].quotient.toString()).toEqual("1000");
  });

  it("returns the correct output amount", () => {
    expect(trade.outputAmount.quotient.toString()).toEqual(
      OUTPUT_AMOUNT.toString()
    );
  });

  it("returns the correct maximumAmountIn", () => {
    expect(trade.maximumAmountIn.quotient.toString()).toEqual(
      NON_FEE_MAXIMUM_INPUT_AMOUNT.toString()
    );
  });

  it("returns the correct feeMaximumAmountIn", () => {
    expect(trade.maximumAmountInFee.quotient.toString()).toEqual(
      FEE_MAXIMUM_INPUT_AMOUNT.toString()
    );
  });

  describe("inputs are the same token", () => {
    it("returns the correct execution price", () => {
      // non fee inputs: 1000 = 1000
      // outputs: 1000
      // expected execution price: 1000 / 1000 = 1
      expect(trade.executionPrice.quotient.toString()).toEqual(
        "1000000000000000000"
      );
    });

    it("returns the correct worst execution price", () => {
      // sum of max non fee input amounts: 2000 = 2000
      // outputs: 1000
      // expected execution price: 1000 / 2000 = 0.5
      expect(trade.worstExecutionPrice().quotient.toString()).toEqual(
        "500000000000000000"
      );
    });
  });

  describe("inputs are different tokens", () => {
    const orderInfo = getOrderInfo({
      inputs: [
        {
          token: USDC.address,
          startAmount: FEE_INPUT_AMOUNT,
          maxAmount: FEE_MAXIMUM_INPUT_AMOUNT,
          recipient: ethers.constants.AddressZero,
        },
        {
          token: DAI.address,
          startAmount: NON_FEE_INPUT_AMOUNT,
          maxAmount: NON_FEE_MAXIMUM_INPUT_AMOUNT,
          recipient: "0x0000000000000000000000000000000000000001",
        },
      ],
    });
    const trade = new RelayOrderTrade<Currency, Currency, TradeType>({
      currenciesIn: [USDC, DAI],
      outputAmount: MOCK_SWAP_OUTPUT_AMOUNT,
      orderInfo,
      tradeType: TradeType.EXACT_INPUT,
    });

    it("returns the correct execution price", () => {
      // non fee inputs: 1000 = 1000
      // outputs: 1000
      // expected execution price: 1000 / 1000 = 1
      expect(trade.executionPrice.quotient.toString()).toEqual(
        "1000000000000000000"
      );
    });
  
    it("returns the correct worst execution price", () => {
      // sum of max non fee input amounts: 2000 = 2000
      // outputs: 1000
      // expected execution price: 1000 / 2000 = 0.5
      expect(trade.worstExecutionPrice().quotient.toString()).toEqual(
        "500000000000000000"
      );
    });
  });
});
