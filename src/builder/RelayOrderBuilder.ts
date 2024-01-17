import { BigNumber } from "ethers";
import invariant from "tiny-invariant";

import { OrderType, REACTOR_ADDRESS_MAPPING } from "../constants";
import { MissingConfiguration } from "../errors";
import { RelayOrder, RelayOrderInfo, RelayInput } from "../order";
import { ValidationInfo } from "../order/validation";

import { OrderBuilder } from "./OrderBuilder";

/**
 * Helper builder for generating relay orders
 */
export class RelayOrderBuilder extends OrderBuilder {
  private info: Partial<RelayOrderInfo>;

  static fromOrder(order: RelayOrder): RelayOrderBuilder {
    // note chainId not used if passing in true reactor address
    const builder = new RelayOrderBuilder(order.chainId, order.info.reactor)
      .deadline(order.info.deadline)
      .swapper(order.info.swapper)
      .nonce(order.info.nonce)
      .decayStartTime(order.info.decayStartTime)
      .decayEndTime(order.info.decayEndTime)

    for (const action of order.info.actions) {
      builder.action(action);
    }

    for (const input of order.info.inputs) {
      builder.input(input);
    }

    return builder;
  }

  constructor(
    private chainId: number,
    reactorAddress?: string,
    private permit2Address?: string
  ) {
    super();

    if (reactorAddress) {
      this.reactor(reactorAddress);
    } else if (
      REACTOR_ADDRESS_MAPPING[chainId] &&
      REACTOR_ADDRESS_MAPPING[chainId][OrderType.Dutch]
    ) {
      const reactorAddress = REACTOR_ADDRESS_MAPPING[chainId][OrderType.Dutch];
      this.reactor(reactorAddress);
    } else {
      throw new MissingConfiguration("reactor", chainId.toString());
    }

    this.info = {
      actions: [],
    };
  }

  // TODO: perform some calldata validation here
  action(action: string): RelayOrderBuilder {
    if (!this.info.actions) {
      this.info.actions = [];
    }
    this.info.actions.push(action);
    return this;
  }

  decayStartTime(decayStartTime: number): RelayOrderBuilder {
    this.info.decayStartTime = decayStartTime;
    return this;
  }

  decayEndTime(decayEndTime: number): RelayOrderBuilder {
    if (this.orderInfo.deadline === undefined) {
      super.deadline(decayEndTime);
    }

    this.info.decayEndTime = decayEndTime;
    return this;
  }

  input(input: RelayInput): RelayOrderBuilder {
    if (!this.info.inputs) {
      this.info.inputs = [];
    }
    invariant(
      input.startAmount.lte(input.maxAmount),
      `startAmount must be less than or equal than maxAmount: ${input.startAmount.toString()}`
    );
    this.info.inputs.push(input);
    return this;
  }

  deadline(deadline: number): RelayOrderBuilder {
    super.deadline(deadline);
    return this;
  }

  swapper(swapper: string): RelayOrderBuilder {
    super.swapper(swapper);
    return this;
  }

  nonce(nonce: BigNumber): RelayOrderBuilder {
    super.nonce(nonce);
    return this;
  }

  validation(info: ValidationInfo): RelayOrderBuilder {
    super.validation(info);
    return this;
  }

  build(): RelayOrder {
    invariant(this.info.actions !== undefined, "actions not set");
    invariant(this.info.inputs !== undefined, "inputs not set");
    invariant(this.info.inputs.length !== 0, "inputs must be non-empty");
    invariant(this.getOrderInfo().deadline !== undefined, "deadline not set");
    invariant(this.info.decayStartTime !== undefined, "decayStartTime not set");
    invariant(this.info.decayEndTime !== undefined, "decayEndTime not set");
      
    invariant(
      !this.orderInfo.deadline ||
        this.info.decayStartTime <= this.orderInfo.deadline,
      `input decayStartTime must be before or same as deadline: ${this.info.decayStartTime}`
    );
    invariant(
      !this.orderInfo.deadline ||
        this.info.decayEndTime <= this.orderInfo.deadline,
      `decayEndTime must be before or same as deadline: ${this.info.decayEndTime}`
    );

    return new RelayOrder(
      Object.assign(this.getOrderInfo(), {
        actions: this.info.actions,
        inputs: this.info.inputs,
        decayStartTime: this.info.decayStartTime,
        decayEndTime: this.info.decayEndTime,
      }),
      this.chainId,
      this.permit2Address
    );
  }
}
