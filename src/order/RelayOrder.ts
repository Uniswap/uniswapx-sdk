import { SignatureLike } from "@ethersproject/bytes";
import { keccak256 } from "@ethersproject/keccak256";
import { toUtf8Bytes } from "@ethersproject/strings";
import {
  PermitBatchTransferFrom,
  PermitTransferFromData,
  SignatureTransfer,
  Witness,
} from "@uniswap/permit2-sdk";
import { BigNumber, ethers } from "ethers";

import { PERMIT2_MAPPING } from "../constants";
import { MissingConfiguration } from "../errors";
import { ResolvedRelayOrder } from "../utils/OrderQuoter";
import { getDecayedAmount } from "../utils/dutchDecay";

import { Order, OrderInfo, OrderResolutionOptions } from "./types";

export function id(text: string): string {
  return keccak256(toUtf8Bytes(text));
}

export type RelayOutput = {
  readonly token: string;
  readonly startAmount: BigNumber;
  readonly endAmount: BigNumber;
  readonly decayStartTime: number;
  readonly decayEndTime: number;
  readonly recipient: string;
};

export type RelayOutputJSON = Omit<RelayOutput, "startAmount" | "endAmount"> & {
  startAmount: string;
  endAmount: string;
};

export type RelayInput = {
  readonly token: string;
  readonly startAmount: BigNumber;
  readonly endAmount: BigNumber;
  readonly decayStartTime: number;
  readonly decayEndTime: number;
  readonly recipient: string;
};

export type RelayInputJSON = Omit<RelayInput, "startAmount" | "endAmount"> & {
  startAmount: string;
  endAmount: string;
};

export type RelayOrderInfo = OrderInfo & {
  actions: string[];
  inputs: RelayInput[];
  outputs: RelayOutput[];
};

export type RelayOrderInfoJSON = Omit<
  RelayOrderInfo,
  "nonce" | "inputs" | "outputs"
> & {
  nonce: string;
  actions: string[];
  inputs: RelayInputJSON[];
  outputs: RelayOutputJSON[];
};

type WitnessInfo = {
  info: OrderInfo;
  actions: string[];
  inputs: RelayInput[];
  outputs: RelayOutput[];
};

const RELAY_ORDER_TYPES = {
  RelayOrder: [
    { name: "info", type: "OrderInfo" },
    { name: "actions", type: "bytes[]" },
    { name: "inputs", type: "RelayInput[]" },
    { name: "outputs", type: "RelayOutput[]" },
  ],
  OrderInfo: [
    { name: "reactor", type: "address" },
    { name: "swapper", type: "address" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint256" },
    { name: "additionalValidationContract", type: "address" },
    { name: "additionalValidationData", type: "bytes" },
  ],
  RelayInput: [
    { name: "token", type: "address" },
    { name: "decayStartTime", type: "uint256" },
    { name: "decayEndTime", type: "uint256" },
    { name: "startAmount", type: "uint256" },
    { name: "endAmount", type: "uint256" },
    { name: "recipient", type: "address" },
  ],
  RelayOutput: [
    { name: "token", type: "address" },
    { name: "decayStartTime", type: "uint256" },
    { name: "decayEndTime", type: "uint256" },
    { name: "startAmount", type: "uint256" },
    { name: "endAmount", type: "uint256" },
    { name: "recipient", type: "address" },
  ],
};

const RELAY_ORDER_ABI = [
  "tuple(" +
    [
      "tuple(address,address,uint256,uint256,address,bytes)",
      "bytes[]",
      "tuple(address,uint256,uint256,uint256,uint256,address)[]",
      "tuple(address,uint256,uint256,uint256,uint256,address)[]",
    ].join(",") +
    ")",
];

export class RelayOrder extends Order {
  public permit2Address: string;

  constructor(
    public readonly info: RelayOrderInfo,
    public readonly chainId: number,
    readonly _permit2Address?: string
  ) {
    super();
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
          decayStartTime: input.decayStartTime,
          decayEndTime: input.decayEndTime,
          startAmount: BigNumber.from(input.startAmount),
          endAmount: BigNumber.from(input.endAmount),
          recipient: input.recipient,
        })),
        outputs: json.outputs.map((output) => ({
          token: output.token,
          decayStartTime: output.decayStartTime,
          decayEndTime: output.decayEndTime,
          startAmount: BigNumber.from(output.startAmount),
          endAmount: BigNumber.from(output.endAmount),
          recipient: output.recipient,
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
        [
          reactor,
          swapper,
          nonce,
          deadline,
          additionalValidationContract,
          additionalValidationData,
        ],
        actions,
        inputs,
        outputs,
      ],
    ] = decoded;
    return new RelayOrder(
      {
        reactor,
        swapper,
        nonce,
        deadline: deadline.toNumber(),
        additionalValidationContract,
        additionalValidationData,
        actions: actions,
        inputs: inputs.map(
          ([
            token,
            decayStartTime,
            decayEndTime,
            startAmount,
            endAmount,
            recipient,
          ]: [
            string,
            BigNumber,
            BigNumber,
            number,
            number,
            string,
            boolean
          ]) => {
            return {
              token,
              decayStartTime: decayStartTime.toNumber(),
              decayEndTime: decayEndTime.toNumber(),
              startAmount,
              endAmount,
              recipient,
            };
          }
        ),
        outputs: outputs.map(
          ([
            token,
            decayStartTime,
            decayEndTime,
            startAmount,
            endAmount,
            recipient,
          ]: [
            string,
            BigNumber,
            BigNumber,
            number,
            number,
            string,
            boolean
          ]) => {
            return {
              token,
              decayStartTime: decayStartTime.toNumber(),
              decayEndTime: decayEndTime.toNumber(),
              startAmount,
              endAmount,
              recipient,
            };
          }
        ),
      },
      chainId,
      permit2
    );
  }

  /**
   * @inheritdoc order
   */
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
      additionalValidationContract: this.info.additionalValidationContract,
      additionalValidationData: this.info.additionalValidationData,
      actions: this.info.actions,
      inputs: this.info.inputs.map((input) => ({
        token: input.token,
        decayStartTime: input.decayStartTime,
        decayEndTime: input.decayEndTime,
        startAmount: input.startAmount.toString(),
        endAmount: input.endAmount.toString(),
        recipient: input.recipient,
      })),
      outputs: this.info.outputs.map((output) => ({
        token: output.token,
        decayStartTime: output.decayStartTime,
        decayEndTime: output.decayEndTime,
        startAmount: output.startAmount.toString(),
        endAmount: output.endAmount.toString(),
        recipient: output.recipient,
      })),
    };
  }

  /**
   * @inheritdoc order
   */
  serialize(): string {
    const abiCoder = new ethers.utils.AbiCoder();
    return abiCoder.encode(RELAY_ORDER_ABI, [
      [
        [
          this.info.reactor,
          this.info.swapper,
          this.info.nonce,
          this.info.deadline,
          this.info.additionalValidationContract,
          this.info.additionalValidationData,
        ],
        this.info.actions,
        this.info.inputs.map((input) => [
          input.token,
          input.decayStartTime,
          input.decayEndTime,
          input.startAmount,
          input.endAmount,
          input.recipient,
        ]),
        this.info.outputs.map((output) => [
          output.token,
          output.decayStartTime,
          output.decayEndTime,
          output.startAmount,
          output.endAmount,
          output.recipient,
        ]),
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
   * @inheritdoc Order
   */
  permitData(): PermitTransferFromData {
    return SignatureTransfer.getPermitData(
      this.toPermit(),
      this.permit2Address,
      this.chainId,
      this.witness()
    ) as PermitTransferFromData;
  }

  /**
   * @inheritdoc Order
   */
  hash(): string {
    return ethers.utils._TypedDataEncoder
      .from(RELAY_ORDER_TYPES)
      .hash(this.witnessInfo());
  }

  /**
   * @inheritdoc Order
   */
  resolve(options: OrderResolutionOptions): ResolvedRelayOrder {
    return {
      actions: this.info.actions,
      inputs: this.info.inputs.map((input) => {
        return {
          token: input.token,
          amount: getDecayedAmount(
            {
              decayStartTime: input.decayStartTime,
              decayEndTime: input.decayEndTime,
              startAmount: input.startAmount,
              endAmount: input.endAmount,
            },
            options.timestamp
          ),
          recipient: input.recipient,
        };
      }),
      outputs: this.info.outputs.map((output) => {
        return {
          token: output.token,
          amount: getDecayedAmount(
            {
              decayStartTime: output.decayStartTime,
              decayEndTime: output.decayEndTime,
              startAmount: output.startAmount,
              endAmount: output.endAmount,
            },
            options.timestamp
          ),
          recipient: output.recipient,
        };
      }),
    };
  }

  private toPermit(): PermitBatchTransferFrom {
    return {
      permitted: this.info.inputs.map((input) => ({
        token: input.token,
        amount: input.endAmount,
      })),
      spender: this.info.reactor,
      nonce: this.info.nonce,
      deadline: this.info.deadline,
    };
  }

  private witnessInfo(): WitnessInfo {
    return {
      info: {
        reactor: this.info.reactor,
        swapper: this.info.swapper,
        nonce: this.info.nonce,
        deadline: this.info.deadline,
        additionalValidationContract: this.info.additionalValidationContract,
        additionalValidationData: this.info.additionalValidationData,
      },
      actions: this.info.actions,
      inputs: this.info.inputs,
      outputs: this.info.outputs,
    };
  }

  private witness(): Witness {
    return {
      witness: this.witnessInfo(),
      witnessTypeName: "RelayOrder",
      witnessType: RELAY_ORDER_TYPES,
    };
  }
}
