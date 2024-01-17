import { BigNumber, ethers } from "ethers";

import { RelayOrder, RelayOrderInfo } from "./RelayOrder";

describe("RelayOrder", () => {
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
            token: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
            startAmount: BigNumber.from("1000000"),
            maxAmount: BigNumber.from("1000000"),
            recipient: "0x0000000000000000000000000000000000000000",
          },
        ],
      },
      data
    );
  };

  it("parses a serialized order", () => {
    const orderInfo = getOrderInfo({});
    const order = new RelayOrder(orderInfo, 1);
    const serialized = order.serialize();
    const parsed = RelayOrder.parse(serialized, 1);
    expect(parsed.info).toEqual(orderInfo);
  });

  it("valid signature over info", async () => {
    const order = new RelayOrder(getOrderInfo({}), 1);
    const wallet = ethers.Wallet.createRandom();

    const { domain, types, values } = order.permitData();
    const signature = await wallet._signTypedData(domain, types, values);
    expect(order.getSigner(signature)).toEqual(await wallet.getAddress());
  });

  describe("resolve", () => {
    it("resolves before decayStartTime", () => {
      const order = new RelayOrder(getOrderInfo({}), 1);
      let resolved = order.resolve({
        timestamp: order.info.decayStartTime - 100,
      });
      resolved.inputs.forEach((input, i) => {
        expect(input.token).toEqual(order.info.inputs[i].token);
        expect(input.amount).toEqual(order.info.inputs[i].startAmount);
      });
    });

    it("resolves at decayStartTime", () => {
      const order = new RelayOrder(getOrderInfo({}), 1);
      let resolved = order.resolve({ timestamp: order.info.decayStartTime });
      resolved.inputs.forEach((input, i) => {
        expect(input.token).toEqual(order.info.inputs[i].token);
        expect(input.amount).toEqual(order.info.inputs[i].startAmount);
      });
    });

    it("resolves at decayEndTime", () => {
      const order = new RelayOrder(getOrderInfo({}), 1);
      let resolved = order.resolve({
        timestamp: order.info.decayStartTime,
      });
      resolved.inputs.forEach((input, i) => {
        expect(input.token).toEqual(order.info.inputs[i].token);
        expect(input.amount).toEqual(order.info.inputs[i].maxAmount);
      });
    });

    it("resolves after decayEndTime", () => {
      const order = new RelayOrder(getOrderInfo({}), 1);
      let resolved = order.resolve({
        timestamp: order.info.decayEndTime + 100,
      });
      resolved.inputs.forEach((input, i) => {
        expect(input.token).toEqual(order.info.inputs[i].token);
        expect(input.amount).toEqual(order.info.inputs[i].maxAmount);
      });
    });
  });
});
