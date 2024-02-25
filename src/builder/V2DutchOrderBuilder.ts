import { BigNumber, ethers } from "ethers";
import invariant from "tiny-invariant";

import { OrderType } from "../constants";
import {
  CosignedV2DutchOrder,
  CosignedV2DutchOrderInfo,
  CosignerData,
  DutchInput,
  DutchOutput,
  UnsignedV2DutchOrder,
} from "../order";
import { ValidationInfo } from "../order/validation";
import { getPermit2, getReactor } from "../utils";

import { OrderBuilder } from "./OrderBuilder";

/**
 * Helper builder for generating dutch limit orders
 */
export class V2DutchOrderBuilder extends OrderBuilder {
  private info: Pick<CosignedV2DutchOrderInfo, "baseOutputs"> &
    Partial<CosignedV2DutchOrderInfo>;
  private permit2Address: string;

  static fromOrder<O extends UnsignedV2DutchOrder>(
    order: O
  ): V2DutchOrderBuilder {
    const builder = new V2DutchOrderBuilder(order.chainId, order.info.reactor)
      .deadline(order.info.deadline)
      .swapper(order.info.swapper)
      .nonce(order.info.nonce)
      .baseInput(order.info.baseInput)
      .cosigner(order.info.cosigner)
      .validation({
        additionalValidationContract: order.info.additionalValidationContract,
        additionalValidationData: order.info.additionalValidationData,
      });

    for (const output of order.info.baseOutputs) {
      builder.baseOutput(output);
    }

    if (isCosigned(order)) {
      builder.cosignature(order.info.cosignature);
      builder.decayEndTime(order.info.cosignerData.decayEndTime);
      builder.decayStartTime(order.info.cosignerData.decayStartTime);
      builder.cosignerData(order.info.cosignerData);
    }

    return builder;
  }

  constructor(
    private chainId: number,
    reactorAddress?: string,
    _permit2Address?: string
  ) {
    super();

    this.reactor(getReactor(chainId, OrderType.Dutch_V2, reactorAddress));
    this.permit2Address = getPermit2(chainId, _permit2Address);

    this.info = {
      baseOutputs: [],
      cosignerData: {
        decayStartTime: 0,
        decayEndTime: 0,
        exclusiveFiller: ethers.constants.AddressZero,
        exclusivityOverrideBps: 0,
        inputAmount: BigNumber.from(0),
        outputAmounts: [],
      },
    };
  }

  decayStartTime(decayStartTime: number): this {
    if (!this.info.cosignerData) {
      this.initializeCosignerData({ decayStartTime });
    } else {
      this.info.cosignerData.decayStartTime = decayStartTime;
    }
    return this;
  }

  decayEndTime(decayEndTime: number): this {
    if (!this.info.cosignerData) {
      this.initializeCosignerData({ decayEndTime });
    } else {
      this.info.cosignerData.decayEndTime = decayEndTime;
    }
    if (!this.orderInfo.deadline) {
      super.deadline(decayEndTime);
    }
    return this;
  }

  baseInput(input: DutchInput): this {
    this.info.baseInput = input;
    return this;
  }

  baseOutput(output: DutchOutput): this {
    invariant(
      output.startAmount.gte(output.endAmount),
      `startAmount must be greater than endAmount: ${output.startAmount.toString()}`
    );
    this.info.baseOutputs.push(output);
    return this;
  }

  deadline(deadline: number): this {
    super.deadline(deadline);

    if (!this.info.cosignerData) {
      this.initializeCosignerData({ decayEndTime: deadline });
    } else if (!this.info.cosignerData.decayEndTime) {
      this.decayEndTime(deadline);
    }
    return this;
  }

  swapper(swapper: string): this {
    super.swapper(swapper);
    return this;
  }

  nonce(nonce: BigNumber): this {
    super.nonce(nonce);
    return this;
  }

  validation(info: ValidationInfo): this {
    super.validation(info);
    return this;
  }

  // ensures that we only change non fee outputs
  nonFeeRecipient(newRecipient: string, feeRecipient?: string): this {
    invariant(
      newRecipient !== feeRecipient,
      `newRecipient must be different from feeRecipient: ${newRecipient}`
    );
    if (!this.info.baseOutputs) {
      return this;
    }
    this.info.baseOutputs = this.info.baseOutputs.map((output) => {
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

  exclusiveFiller(exclusiveFiller: string): this {
    if (!this.info.cosignerData) {
      this.info.cosignerData = {
        decayStartTime: 0,
        decayEndTime: 0,
        exclusiveFiller: exclusiveFiller,
        exclusivityOverrideBps: 0,
        inputAmount: BigNumber.from(0),
        outputAmounts: [],
      };
    }
    this.info.cosignerData.exclusiveFiller = exclusiveFiller;
    return this;
  }

  inputAmount(inputAmount: BigNumber): this {
    if (!this.info.cosignerData) {
      this.initializeCosignerData({ inputAmount });
    } else {
      this.info.cosignerData.inputAmount = inputAmount;
    }
    return this;
  }

  outputAmounts(outputAmounts: BigNumber[]): this {
    if (!this.info.cosignerData) {
      this.initializeCosignerData({ outputAmounts });
    } else {
      this.info.cosignerData.outputAmounts = outputAmounts;
    }
    return this;
  }

  cosigner(cosigner: string): this {
    this.info.cosigner = cosigner;
    return this;
  }

  cosignature(cosignature: string | undefined): this {
    this.info.cosignature = cosignature;
    return this;
  }

  cosignerData(cosignerData: CosignerData): this {
    this.decayStartTime(cosignerData.decayStartTime);
    this.decayEndTime(cosignerData.decayEndTime);
    this.exclusiveFiller(cosignerData.exclusiveFiller);
    this.inputAmount(cosignerData.inputAmount);
    this.outputAmounts(cosignerData.outputAmounts);
    return this;
  }

  buildPartial(): UnsignedV2DutchOrder {
    invariant(this.info.cosigner !== undefined, "cosigner not set");
    invariant(this.info.baseInput !== undefined, "input not set");
    invariant(
      this.info.baseOutputs && this.info.baseOutputs.length > 0,
      "outputs not set"
    );
    invariant(this.info.baseInput !== undefined, "original input not set");
    invariant(
      !this.orderInfo.deadline ||
        (this.info.cosignerData &&
          this.info.cosignerData.decayStartTime <= this.orderInfo.deadline),
      `if present, decayStartTime must be before or same as deadline: ${this.info.cosignerData?.decayStartTime}`
    );
    invariant(
      !this.orderInfo.deadline ||
        (this.info.cosignerData &&
          this.info.cosignerData.decayEndTime <= this.orderInfo.deadline),
      `if present, decayEndTime must be before or same as deadline: ${this.info.cosignerData?.decayEndTime}`
    );

    return new UnsignedV2DutchOrder(
      Object.assign(this.getOrderInfo(), {
        baseInput: this.info.baseInput,
        baseOutputs: this.info.baseOutputs,
        cosigner: this.info.cosigner,
      }),
      this.chainId,
      this.permit2Address
    );
  }

  build(): CosignedV2DutchOrder {
    invariant(this.info.cosignature !== undefined, "cosignature not set");
    invariant(this.info.cosignerData !== undefined, "cosignerData not set");
    invariant(
      this.info.cosignerData.decayStartTime !== undefined,
      "decayStartTime not set"
    );
    invariant(
      this.info.cosignerData.decayEndTime !== undefined ||
        this.orderInfo.deadline !== undefined,
      "Neither decayEndTime or deadline not set"
    );
    invariant(
      this.info.cosignerData.exclusiveFiller !== undefined,
      "exclusiveFiller not set"
    );
    invariant(
      this.info.cosignerData.inputAmount !== undefined &&
        this.info.baseInput !== undefined &&
        this.info.cosignerData.inputAmount.gte(this.info.baseInput.startAmount),
      "cosigner input not set or smaller than baseInput"
    );
    invariant(
      this.info.cosignerData.outputAmounts.length > 0,
      "outputOverrides not set"
    );
    this.info.cosignerData.outputAmounts.forEach((override, idx) => {
      invariant(
        override.lte(this.info.baseOutputs![idx].startAmount),
        "cosigner output must not be larger than baseOutput"
      );
    });

    return CosignedV2DutchOrder.fromUnsignedOrder(
      this.buildPartial(),
      this.info.cosignerData,
      this.info.cosignature
    );
  }

  private initializeCosignerData(overrides: Partial<CosignerData>): void {
    this.info.cosignerData = {
      decayStartTime: 0,
      decayEndTime: 0,
      exclusiveFiller: ethers.constants.AddressZero,
      exclusivityOverrideBps: 0,
      inputAmount: BigNumber.from(0),
      outputAmounts: [],
      ...overrides,
    };
  }
}

function isCosigned(
  order: UnsignedV2DutchOrder | CosignedV2DutchOrder
): order is CosignedV2DutchOrder {
  return (order as CosignedV2DutchOrder).info.cosignature !== undefined;
}
