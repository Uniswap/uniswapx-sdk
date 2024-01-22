import { BigNumber } from "ethers";
import invariant from "tiny-invariant";

import { OrderType, REACTOR_ADDRESS_MAPPING } from "../constants";
import { MissingConfiguration } from "../errors";
import { RelayInput, RelayOrder, RelayOrderInfo } from "../order";

/**
 * Helper builder for generating relay orders
 */
export class RelayOrderBuilder {
  protected info: Partial<RelayOrderInfo> = {};

  static fromOrder(order: RelayOrder): RelayOrderBuilder {
    // note chainId not used if passing in true reactor address
    const builder = new RelayOrderBuilder(order.chainId, order.info.reactor)
      .deadline(order.info.deadline)
      .swapper(order.info.swapper)
      .nonce(order.info.nonce)
      .decayStartTime(order.info.decayStartTime)
      .decayEndTime(order.info.decayEndTime);

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
    if (reactorAddress) {
      this.reactor(reactorAddress);
    } else if (
      REACTOR_ADDRESS_MAPPING[chainId] &&
      REACTOR_ADDRESS_MAPPING[chainId][OrderType.Relay]
    ) {
      const reactorAddress = REACTOR_ADDRESS_MAPPING[chainId][OrderType.Relay];
      this.reactor(reactorAddress);
    } else {
      throw new MissingConfiguration("reactor", chainId.toString());
    }

    this.info.actions = [];
  }

  protected reactor(reactor: string): RelayOrderBuilder {
    this.info.reactor = reactor;
    return this;
  }

  deadline(deadline: number): RelayOrderBuilder {
    this.info.deadline = deadline;
    return this;
  }

  nonce(nonce: BigNumber): RelayOrderBuilder {
    this.info.nonce = nonce;
    return this;
  }

  swapper(swapper: string): RelayOrderBuilder {
    this.info.swapper = swapper;
    return this;
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
    if (this.info.deadline === undefined) {
      this.info.deadline = decayEndTime;
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

  build(): RelayOrder {
    invariant(this.info.reactor !== undefined, "reactor not set");
    invariant(this.info.nonce !== undefined, "nonce not set");
    invariant(this.info.deadline !== undefined, "deadline not set");
    invariant(
      this.info.deadline > Date.now() / 1000,
      `Deadline must be in the future: ${this.info.deadline}`
    );
    invariant(this.info.swapper !== undefined, "swapper not set");
    invariant(this.info.decayStartTime !== undefined, "decayStartTime not set");
    invariant(this.info.decayEndTime !== undefined, "decayEndTime not set");
    invariant(this.info.actions !== undefined, "actions not set");
    invariant(this.info.inputs !== undefined, "inputs not set");
    invariant(this.info.inputs.length !== 0, "inputs must be non-empty");

    invariant(
      !this.info.deadline ||
        this.info.decayStartTime <= this.info.deadline,
      `input decayStartTime must be before or same as deadline: ${this.info.decayStartTime}`
    );
    invariant(
      !this.info.deadline ||
        this.info.decayEndTime <= this.info.deadline,
      `decayEndTime must be before or same as deadline: ${this.info.decayEndTime}`
    );

    return new RelayOrder(
      Object.assign(this.info, {
        reactor: this.info.reactor,
        swapper: this.info.swapper,
        nonce: this.info.nonce,
        deadline: this.info.deadline,
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
