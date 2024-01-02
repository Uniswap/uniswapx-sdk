import { BigNumber } from "ethers";
import invariant from "tiny-invariant";

import { OrderType, REACTOR_ADDRESS_MAPPING } from "../constants";
import { MissingConfiguration } from "../errors";
import { RelayInput, RelayOrder, RelayOrderInfo, RelayOutput } from "../order";
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
      .validation({
        additionalValidationContract: order.info.additionalValidationContract,
        additionalValidationData: order.info.additionalValidationData,
      });

    for (const action of order.info.actions) {
      builder.action(action);
    }

    for (const input of order.info.inputs) {
      builder.input(input);
    }

    for (const output of order.info.outputs) {
      builder.output(output);
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
      outputs: [],
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

  input(input: RelayInput): RelayOrderBuilder {
    if (!this.info.inputs) {
      this.info.inputs = [];
    }
    invariant(
      input.startAmount.lte(input.endAmount),
      `startAmount must be less than or equal than endAmount: ${input.startAmount.toString()}`
    );
    invariant(
      input.decayStartTime < input.decayEndTime,
      `decayStartTime must be less than decayEndTime: ${input.decayStartTime}`
    );
    this.info.inputs.push(input);
    return this;
  }

  output(output: RelayOutput): RelayOrderBuilder {
    if (!this.info.outputs) {
      this.info.outputs = [];
    }
    invariant(
      output.startAmount.gte(output.endAmount),
      `startAmount must be greater than endAmount: ${output.startAmount.toString()}`
    );
    invariant(
      output.decayStartTime < output.decayEndTime,
      `decayStartTime must be less than decayEndTime: ${output.decayStartTime}`
    );
    this.info.outputs.push(output);
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

  // ensures that we only change non fee outputs
  nonFeeRecipient(
    newRecipient: string,
    feeRecipient?: string
  ): RelayOrderBuilder {
    invariant(
      newRecipient !== feeRecipient,
      `newRecipient must be different from feeRecipient: ${newRecipient}`
    );
    if (!this.info.outputs) {
      return this;
    }
    this.info.outputs = this.info.outputs.map((output) => {
      // if fee output then pass through
      if (
        feeRecipient &&
        output.recipient.toLowerCase() === feeRecipient.toLowerCase()
      ) {
        return output;
      }

      return {
        ...output,
        recipient: newRecipient,
      };
    });
    return this;
  }

  build(): RelayOrder {
    invariant(this.info.deadline !== undefined, "deadline not set");
    invariant(this.info.actions !== undefined, "actions not set");
    invariant(this.info.inputs !== undefined, "inputs not set");
    invariant(
      this.info.outputs !== undefined, // relay ordewrs allow no outputs
      "outputs not set"
    );
    invariant(this.info.inputs.length !== 0, "inputs must be non-empty");
    invariant(this.getOrderInfo().deadline !== undefined, "deadline not set");

    this.info.inputs.forEach((input) => {
      invariant(
        input.decayEndTime !== undefined ||
          this.orderInfo.deadline !== undefined,
        "Must set either deadline or decayEndTime"
      );
      invariant(
        !this.orderInfo.deadline ||
          input.decayStartTime <= this.orderInfo.deadline,
        `input decayStartTime must be before or same as deadline: ${input.decayStartTime}`
      );
      invariant(
        !this.orderInfo.deadline ||
          input.decayEndTime <= this.orderInfo.deadline,
        `decayEndTime must be before or same as deadline: ${input.decayEndTime}`
      );
    });

    this.info.outputs.forEach((output) => {
      invariant(
        output.decayEndTime !== undefined ||
          this.orderInfo.deadline !== undefined,
        "Must set either deadline or decayEndTime"
      );
      invariant(
        !this.orderInfo.deadline ||
          output.decayStartTime <= this.orderInfo.deadline,
        `input decayStartTime must be before or same as deadline: ${output.decayStartTime}`
      );
      invariant(
        !this.orderInfo.deadline ||
          output.decayEndTime <= this.orderInfo.deadline,
        `decayEndTime must be before or same as deadline: ${output.decayEndTime}`
      );
    });

    return new RelayOrder(
      Object.assign(this.getOrderInfo(), {
        actions: this.info.actions,
        inputs: this.info.inputs,
        outputs: this.info.outputs,
      }),
      this.chainId,
      this.permit2Address
    );
  }
}
