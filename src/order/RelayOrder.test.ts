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
        additionalValidationContract: ethers.constants.AddressZero,
        additionalValidationData: "0x",
        actions: [],
        inputs: [
          {
            token: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
            decayStartTime,
            decayEndTime,
            startAmount: BigNumber.from("1000000"),
            endAmount: BigNumber.from("1000000"),
            recipient: "0x0000000000000000000000000000000000000000",
          },
        ],
        outputs: [
          {
            token: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
            decayStartTime,
            decayEndTime,
            startAmount: BigNumber.from("1000000000000000000"),
            endAmount: BigNumber.from("900000000000000000"),
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
        timestamp: order.inputsDecayStartTime() - 100,
      });
      resolved.inputs.forEach((input, i) => {
        expect(input.token).toEqual(order.info.inputs[i].token);
        expect(input.amount).toEqual(order.info.inputs[i].startAmount);
      });

      resolved = order.resolve({
        timestamp: order.outputsDecayStartTime(),
      });
      expect(resolved.outputs.length).toEqual(1);
      resolved.outputs.forEach((output, i) => {
        expect(output.token).toEqual(order.info.outputs[i].token);
        expect(output.amount).toEqual(order.info.outputs[i].startAmount);
      });
    });

    it("resolves at decayStartTime", () => {
      const order = new RelayOrder(getOrderInfo({}), 1);
      let resolved = order.resolve({ timestamp: order.inputsDecayStartTime() });
      resolved.inputs.forEach((input, i) => {
        expect(input.token).toEqual(order.info.inputs[i].token);
        expect(input.amount).toEqual(order.info.inputs[i].startAmount);
      });

      resolved = order.resolve({
        timestamp: order.outputsDecayStartTime(),
      });
      expect(resolved.outputs.length).toEqual(1);
      resolved.outputs.forEach((output, i) => {
        expect(output.token).toEqual(order.info.outputs[i].token);
        expect(output.amount).toEqual(order.info.outputs[i].startAmount);
      });
    });

    it("resolves at decayEndTime", () => {
      const order = new RelayOrder(getOrderInfo({}), 1);
      let resolved = order.resolve({
        timestamp: order.inputsDecayStartTime(),
      });
      resolved.inputs.forEach((input, i) => {
        expect(input.token).toEqual(order.info.inputs[i].token);
        expect(input.amount).toEqual(order.info.inputs[i].endAmount);
      });

      resolved = order.resolve({
        timestamp: order.outputsDecayEndTime(),
      });
      expect(resolved.outputs.length).toEqual(1);
      resolved.outputs.forEach((output, i) => {
        expect(output.token).toEqual(order.info.outputs[i].token);
        expect(output.amount).toEqual(order.info.outputs[i].endAmount);
      });
    });

    it("resolves after decayEndTime", () => {
      const order = new RelayOrder(getOrderInfo({}), 1);
      let resolved = order.resolve({
        timestamp: order.inputsDecayEndTime() + 100,
      });
      resolved.inputs.forEach((input, i) => {
        expect(input.token).toEqual(order.info.inputs[i].token);
        expect(input.amount).toEqual(order.info.inputs[i].endAmount);
      });

      resolved = order.resolve({
        timestamp: order.outputsDecayEndTime() + 100,
      });
      expect(resolved.outputs.length).toEqual(1);
      resolved.outputs.forEach((output, i) => {
        expect(output.token).toEqual(order.info.outputs[i].token);
        expect(output.amount).toEqual(order.info.outputs[i].endAmount);
      });
    });
  });
});
