import { BigNumber } from "ethers";

import { RelayOrder } from "../order/RelayOrder";

import { RelayOrderBuilder } from "./RelayOrderBuilder";

describe("RelayOrderBuilder", () => {
  let builder: RelayOrderBuilder;

  beforeEach(() => {
    builder = new RelayOrderBuilder(1);
  });

  it("Builds a valid order", () => {
    const deadline = Math.floor(Date.now() / 1000) + 1000;
    const order = builder
      .deadline(deadline)
      .swapper("0x0000000000000000000000000000000000000001")
      .nonce(BigNumber.from(100))
      .decayStartTime(deadline - 100)
      .decayEndTime(deadline)
      .action("")
      .input({
        token: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        startAmount: BigNumber.from("1000000"),
        maxAmount: BigNumber.from("1000000"),
        recipient: "0x0000000000000000000000000000000000000000",
      })
      
      .build();

    expect(order.info.decayStartTime).toEqual(deadline - 100);
    expect(order.info.inputs.length).toEqual(1);
  });

  // TODO: add any relay order specific validation here
  it("Builds a valid order with validation", () => {
    const deadline = Math.floor(Date.now() / 1000) + 1000;
    const order = builder
      .deadline(deadline)
      .swapper("0x0000000000000000000000000000000000000001")
      .nonce(BigNumber.from(100))
      .decayStartTime(deadline - 100)
      .decayEndTime(deadline)
      .action("")
      .input({
        token: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        
        startAmount: BigNumber.from("1000000"),
        maxAmount: BigNumber.from("1000000"),
        recipient: "0x0000000000000000000000000000000000000000",
      })
      
      .build();

    expect(order.info.decayStartTime).toEqual(deadline - 100);
    expect(order.info.inputs.length).toEqual(1);
  });

  it("Regenerates builder from order", () => {
    const deadline = Math.floor(Date.now() / 1000) + 1000;
    const order = builder
      .deadline(deadline)

      .swapper("0x0000000000000000000000000000000000000001")
      .action("")
      .nonce(BigNumber.from(100))
      .decayStartTime(deadline - 100)
      .decayEndTime(deadline)
      .input({
        token: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        
        startAmount: BigNumber.from("1000000"),
        maxAmount: BigNumber.from("1000000"),
        recipient: "0x0000000000000000000000000000000000000000",
      })
      
      .build();

    const regenerated = RelayOrderBuilder.fromOrder(order).build();
    expect(regenerated.toJSON()).toMatchObject(order.toJSON());
  });

  it("Regenerates builder from order json", () => {
    const deadline = Math.floor(Date.now() / 1000) + 1000;
    const order = builder
      .deadline(deadline)
      .swapper("0x0000000000000000000000000000000000000001")
      .nonce(BigNumber.from(100))
      .decayStartTime(deadline - 100)
      .decayEndTime(deadline)
      .action("")
      .input({
        token: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        startAmount: BigNumber.from("1000000"),
        maxAmount: BigNumber.from("1000000"),
        recipient: "0x0000000000000000000000000000000000000000",
      })      
      .build();

    const json = order.toJSON();
    const regenerated = RelayOrderBuilder.fromOrder(
      RelayOrder.fromJSON(json, 1)
    ).build();
    expect(regenerated.toJSON()).toMatchObject(order.toJSON());
  });

  it("Regenerates builder allows modification", () => {
    const deadline = Math.floor(Date.now() / 1000) + 1000;
    const order = builder
      .deadline(deadline)
      .swapper("0x0000000000000000000000000000000000000001")
      .nonce(BigNumber.from(100))
      .decayStartTime(deadline - 100)
      .decayEndTime(deadline)
      .action("")
      .input({
        token: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        startAmount: BigNumber.from("1000000"),
        maxAmount: BigNumber.from("1000000"),
        recipient: "0x0000000000000000000000000000000000000000",
      })
      .build();

    const regenerated = RelayOrderBuilder.fromOrder(order)
      .action("new action")
      .build();
    expect(regenerated.info.actions).toStrictEqual(["", "new action"]);
  });

  it("startAmount >= maxAmount", () => {
    const deadline = Math.floor(Date.now() / 1000) + 1000;
    expect(() =>
      builder
        .deadline(deadline)
        .swapper("0x0000000000000000000000000000000000000001")
        .nonce(BigNumber.from(100))
        .decayStartTime(deadline - 100)
        .decayEndTime(deadline)
        .input({
          token: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
          startAmount: BigNumber.from("100"),
          maxAmount: BigNumber.from("99"),
          recipient: "0x0000000000000000000000000000000000000000",
        })
        .build()
    ).toThrow("startAmount must be less than or equal than maxAmount: 100");
  });

  it("Deadline already passed", () => {
    const expiredDeadline = 1234;
    expect(() => builder.deadline(expiredDeadline)).not.toThrow();
    expect(() =>
      builder
        .deadline(expiredDeadline)
        .swapper("0x0000000000000000000000000000000000000001")
        .nonce(BigNumber.from(100))
        .decayStartTime(expiredDeadline - 100)
        .decayEndTime(expiredDeadline)
        .input({
          token: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
          startAmount: BigNumber.from("1000000"),
          maxAmount: BigNumber.from("1000000"),
          recipient: "0x0000000000000000000000000000000000000000",
        })
        .build()
    ).toThrow(`Deadline must be in the future: ${expiredDeadline}`);
  });

  it("Start time must be before deadline", () => {
    const deadline = Math.floor(Date.now() / 1000) + 1000;
    const order = builder
      .deadline(deadline)
      .swapper("0x0000000000000000000000000000000000000000")
      .nonce(BigNumber.from(100))
      .decayStartTime(deadline + 1)
      .decayEndTime(deadline + 1)
      .input({
        token: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        startAmount: BigNumber.from("1000000"),
        maxAmount: BigNumber.from("1200000"),
        recipient: "0x0000000000000000000000000000000000000000",
      })

    expect(() => order.build()).toThrow(
      `decayStartTime must be before or same as deadline: ${deadline + 1}`
    );
  });

  it("Does not throw before an order has not been finished building", () => {
    const deadline = Math.floor(Date.now() / 1000) + 1000;
    expect(() =>
      // input with invalid maxAmount
      builder.deadline(deadline).input({
        token: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        startAmount: BigNumber.from("1000000"),
        maxAmount: BigNumber.from("0"),
        recipient: "0x0000000000000000000000000000000000000000",
      })
    ).not.toThrowError();
  });

  it("Unknown chainId", () => {
    const chainId = 99999999;
    expect(() => new RelayOrderBuilder(chainId)).toThrow(
      `Missing configuration for reactor: ${chainId}`
    );
  });

  it("Must set swapper", () => {
    const deadline = Math.floor(Date.now() / 1000) + 1000;
    expect(() =>
      builder
        .deadline(deadline)
        .nonce(BigNumber.from(100))
        .decayStartTime(deadline - 100)
        .decayEndTime(deadline)
        .input({
          token: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
          startAmount: BigNumber.from("1000000"),
          maxAmount: BigNumber.from("1000000"),
          recipient: "0x0000000000000000000000000000000000000000",
        })
        .build()
    ).toThrow("Invariant failed: swapper not set");
  });

  it("decayEndTime after deadline", () => {
    const deadline = Math.floor(Date.now() / 1000) + 1000;
    expect(() =>
      builder
        .deadline(deadline)
        .swapper("0x0000000000000000000000000000000000000000")
        .nonce(BigNumber.from(100))
        .decayStartTime(deadline - 100)
        .decayEndTime(deadline + 1)
        .input({
          token: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
          startAmount: BigNumber.from("1000000"),
          maxAmount: BigNumber.from("1000000"),
          recipient: "0x0000000000000000000000000000000000000000",
        })
        .build()
    ).toThrow(
      `Invariant failed: decayEndTime must be before or same as deadline: ${
        deadline + 1
      }`
    );
  });

  it("Must set nonce", () => {
    const deadline = Math.floor(Date.now() / 1000) + 1000;
    expect(() =>
      builder
        .deadline(deadline)
        .swapper("0x0000000000000000000000000000000000000000")
        .decayStartTime(deadline - 100)
        .decayEndTime(deadline)
        .input({
          token: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
          startAmount: BigNumber.from("1000000"),
          maxAmount: BigNumber.from("1000000"),
          recipient: "0x0000000000000000000000000000000000000000",
        })
        .build()
    ).toThrow("Invariant failed: nonce not set");
  });
});
