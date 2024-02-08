import { SignatureLike } from "@ethersproject/bytes";
import {
  PermitBatchTransferFrom,
  PermitBatchTransferFromData,
  SignatureTransfer,
  Witness,
} from "@uniswap/permit2-sdk";
import { BigNumber, ethers } from "ethers";

import { PERMIT2_MAPPING } from "../constants";
import { MissingConfiguration } from "../errors";
import { ResolvedRelayOrder } from "../utils/OrderQuoter";
import { getDecayedAmount } from "../utils/dutchDecay";

import { OrderInfo, Order, OrderResolutionOptions } from "./types";

export type RelayInput = {
  readonly token: string;
  readonly recipient: string;
  readonly startAmount: BigNumber;
  readonly maxAmount: BigNumber;
};

export type RelayInputJSON = Omit<RelayInput, "startAmount" | "maxAmount"> & {
  startAmount: string;
  maxAmount: string;
};

type RelayOrderNestedOrderInfo = Omit<
  OrderInfo,
  "additionalValidationContract" | "additionalValidationData"
>;

export type RelayOrderInfo = RelayOrderNestedOrderInfo & {
  inputs: RelayInput[];
  decayStartTime: number;
  decayEndTime: number;
  actions: string[];
};

export type RelayOrderInfoJSON = Omit<RelayOrderInfo, "nonce" | "inputs"> & {
  nonce: string;
  actions: string[];
  inputs: RelayInputJSON[];
};

type WitnessInfo = {
  reactor: string;
  swapper: string;
  startAmounts: BigNumber[];
  recipients: string[];
  decayStartTime: number;
  decayEndTime: number;
  actions: string[];
};

const RELAY_WITNESS_TYPES = {
  RelayOrder: [
    { name: "reactor", type: "address" },
    { name: "swapper", type: "address" },
    { name: "startAmounts", type: "uint256[]" },
    { name: "recipients", type: "address[]" },
    { name: "decayStartTime", type: "uint256" },
    { name: "decayEndTime", type: "uint256" },
    { name: "actions", type: "bytes[]" },
  ],
};

const RELAY_ORDER_ABI = [
  "tuple(" +
    [
      "tuple(address,address,uint256,uint256)",
      "tuple(address,address,uint256,uint256)[]",
      "uint256",
      "uint256",
      "bytes[]",
    ].join(",") +
    ")",
];

export class RelayOrder implements Order {
  public permit2Address: string;

  constructor(
    public readonly info: RelayOrderInfo,
    public readonly chainId: number,
    readonly _permit2Address?: string
  ) {
    if (_permit2Address) {
      this.permit2Address = _permit2Address;
    } else if (PERMIT2_MAPPING[chainId]) {
      this.permit2Address = PERMIT2_MAPPING[chainId];
    } else {
      throw new MissingConfiguration("permit2", chainId.toString());
    }
  }

  static fromJSON(
    json: RelayOrderInfoJSON,
    chainId: number,
    _permit2Address?: string
  ): RelayOrder {
    return new RelayOrder(
      {
        ...json,
        nonce: BigNumber.from(json.nonce),
        inputs: json.inputs.map((input) => ({
          token: input.token,
          startAmount: BigNumber.from(input.startAmount),
          maxAmount: BigNumber.from(input.maxAmount),
          recipient: input.recipient,
        })),
      },
      chainId,
      _permit2Address
    );
  }

  static parse(encoded: string, chainId: number, permit2?: string): RelayOrder {
    const abiCoder = new ethers.utils.AbiCoder();
    const decoded = abiCoder.decode(RELAY_ORDER_ABI, encoded);
    const [
      [
        [reactor, swapper, nonce, deadline],
        inputs,
        decayStartTime,
        decayEndTime,
        actions,
      ],
    ] = decoded;
    return new RelayOrder(
      {
        reactor,
        swapper,
        nonce,
        deadline: deadline.toNumber(),
        inputs: inputs.map(
          ([token, recipient, startAmount, maxAmount]: [
            string,
            number,
            number,
            string,
            boolean
          ]) => {
            return {
              token,
              startAmount,
              maxAmount,
              recipient,
            };
          }
        ),
        decayStartTime: decayStartTime.toNumber(),
        decayEndTime: decayEndTime.toNumber(),
        actions: actions,
      },
      chainId,
      permit2
    );
  }

  toJSON(): RelayOrderInfoJSON & {
    permit2Address: string;
    chainId: number;
  } {
    return {
      chainId: this.chainId,
      permit2Address: this.permit2Address,
      reactor: this.info.reactor,
      swapper: this.info.swapper,
      nonce: this.info.nonce.toString(),
      deadline: this.info.deadline,
      actions: this.info.actions,
      decayStartTime: this.info.decayStartTime,
      decayEndTime: this.info.decayEndTime,
      inputs: this.info.inputs.map((input) => ({
        token: input.token,
        startAmount: input.startAmount.toString(),
        maxAmount: input.maxAmount.toString(),
        recipient: input.recipient,
      })),
    };
  }

  serialize(): string {
    const abiCoder = new ethers.utils.AbiCoder();
    return abiCoder.encode(RELAY_ORDER_ABI, [
      [
        [
          this.info.reactor,
          this.info.swapper,
          this.info.nonce,
          this.info.deadline,
        ],
        this.info.inputs.map((input) => [
          input.token,
          input.recipient,
          input.startAmount,
          input.maxAmount,
        ]),
        this.info.decayStartTime,
        this.info.decayEndTime,
        this.info.actions,
      ],
    ]);
  }

  /**
   * @inheritdoc Order
   */
  getSigner(signature: SignatureLike): string {
    return ethers.utils.computeAddress(
      ethers.utils.recoverPublicKey(
        SignatureTransfer.hash(
          this.toPermit(),
          this.permit2Address,
          this.chainId,
          this.witness()
        ),
        signature
      )
    );
  }

  /**
   * @inheritdoc OrderInterface
   */
  permitData(): PermitBatchTransferFromData {
    return SignatureTransfer.getPermitData(
      this.toPermit(),
      this.permit2Address,
      this.chainId,
      this.witness()
    ) as PermitBatchTransferFromData;
  }

  /**
   * @inheritdoc OrderInterface
   */
  hash(): string {
    return ethers.utils._TypedDataEncoder
      .from(RELAY_WITNESS_TYPES)
      .hash(this.witnessInfo());
  }

  /**
   * Returns the resolved order with the given options
   * @return The resolved order
   */
  resolve(options: OrderResolutionOptions): ResolvedRelayOrder {
    return {
      inputs: this.info.inputs.map((input) => {
        return {
          token: input.token,
          amount: getDecayedAmount(
            {
              decayStartTime: this.info.decayStartTime,
              decayEndTime: this.info.decayEndTime,
              startAmount: input.startAmount,
              endAmount: input.maxAmount,
            },
            options.timestamp
          ),
          recipient: input.recipient,
        };
      }),
    };
  }

  private toPermit(): PermitBatchTransferFrom {
    return {
      permitted: this.info.inputs.map((input) => ({
        token: input.token,
        amount: input.maxAmount,
      })),
      spender: this.info.reactor,
      nonce: this.info.nonce,
      deadline: this.info.deadline,
    };
  }

  private witnessInfo(): WitnessInfo {
    return {
      reactor: this.info.reactor,
      swapper: this.info.swapper,
      startAmounts: this.info.inputs.map((input) => input.startAmount),
      recipients: this.info.inputs.map((input) => input.recipient),
      decayStartTime: this.info.decayStartTime,
      decayEndTime: this.info.decayEndTime,
      actions: this.info.actions,
    };
  }

  private witness(): Witness {
    return {
      witness: this.witnessInfo(),
      witnessTypeName: "RelayOrder",
      witnessType: RELAY_WITNESS_TYPES,
    };
  }
}
