import { BigNumber } from "ethers";

import { DutchOrderBuilder } from "../builder";
import { OrderType } from "../constants";
import { DutchOrder } from "../order";

import { getOrderType, getOrderTypeFromEncoded, parseOrder } from "./order";

describe("order utils", () => {
  let dutchOrder: DutchOrder;
  let dutchOrderExactOut: DutchOrder;
  let limitOrder: DutchOrder;
  let chainId: number;

  beforeEach(() => {
    chainId = 1;
    const dutchBuilder = new DutchOrderBuilder(chainId);
    const deadline = Math.floor(Date.now() / 1000) + 1000;
    const input = {
      token: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      startAmount: BigNumber.from("1000000"),
      endAmount: BigNumber.from("1000000"),
    };
    dutchOrder = dutchBuilder
      .deadline(deadline)
      .decayEndTime(deadline)
      .decayStartTime(deadline - 100)
      .swapper("0x0000000000000000000000000000000000000001")
      .nonce(BigNumber.from(100))
      .input(input)
      .output({
        token: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        startAmount: BigNumber.from("1000000000000000000"),
        endAmount: BigNumber.from("900000000000000000"),
        recipient: "0x0000000000000000000000000000000000000000",
      })
      .build();
    const dutchBuilderExactOut = new DutchOrderBuilder(chainId);
    dutchOrderExactOut = dutchBuilderExactOut
      .deadline(deadline)
      .decayEndTime(deadline)
      .decayStartTime(deadline - 100)
      .swapper("0x0000000000000000000000000000000000000001")
      .nonce(BigNumber.from(100))
      .input({
        token: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        startAmount: BigNumber.from("900000"),
        endAmount: BigNumber.from("1000000"),
      })
      .output({
        token: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        startAmount: BigNumber.from("1000000000000000000"),
        endAmount: BigNumber.from("1000000000000000000"),
        recipient: "0x0000000000000000000000000000000000000000",
      })
      .build();
    const limitBuilder = new DutchOrderBuilder(chainId);
    limitOrder = limitBuilder
      .deadline(deadline)
      .decayEndTime(deadline)
      .decayStartTime(deadline - 100)
      .swapper("0x0000000000000000000000000000000000000001")
      .nonce(BigNumber.from(100))
      .input(input)
      .output({
        token: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        startAmount: BigNumber.from("1000000000000000000"),
        endAmount: BigNumber.from("1000000000000000000"),
        recipient: "0x0000000000000000000000000000000000000000",
      })
      .build();
  });

  describe("parseOrder", () => {
    it("parses DutchOrder with single output", () => {
      const encodedOrder = dutchOrder.serialize();
      expect(parseOrder(encodedOrder, chainId)).toEqual(dutchOrder);
    });

    it("parses DutchOrder with multiple outputs", () => {
      dutchOrder.info.outputs.push({
        token: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        startAmount: BigNumber.from("100000000000000000"),
        endAmount: BigNumber.from("90000000000000000"),
        recipient: "0x0000000000000000000000000000000000000123",
      });
      const encodedOrder = dutchOrder.serialize();
      expect(parseOrder(encodedOrder, chainId)).toEqual(dutchOrder);
    });
  });

  describe("getOrderType", () => {
    it("parses DutchOrder type", () => {
      expect(getOrderType(dutchOrder)).toEqual(OrderType.Dutch);
    });
    it("parses DutchOrder exact out type", () => {
      expect(getOrderType(dutchOrderExactOut)).toEqual(OrderType.Dutch);
    });
    it("parses LimitOrder type", () => {
      expect(getOrderType(limitOrder)).toEqual(OrderType.Limit);
    });
  });

  describe("getOrderTypeFromEncoded", () => {
    it("parses DutchOrder type", () => {
      expect(getOrderTypeFromEncoded(dutchOrder.serialize(), chainId)).toEqual(
        OrderType.Dutch
      );
    });
    it("parses DutchOrder exact out type", () => {
      expect(
        getOrderTypeFromEncoded(dutchOrderExactOut.serialize(), chainId)
      ).toEqual(OrderType.Dutch);
    });
    it("parses LimitOrder type", () => {
      expect(getOrderTypeFromEncoded(limitOrder.serialize(), chainId)).toEqual(
        OrderType.Limit
      );
    });
  });
});