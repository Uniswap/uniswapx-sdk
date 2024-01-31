/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  PayableOverrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type {
  FunctionFragment,
  Result,
  EventFragment,
} from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "./common";

export type SignedOrderStruct = {
  order: PromiseOrValue<BytesLike>;
  sig: PromiseOrValue<BytesLike>;
};

export type SignedOrderStructOutput = [string, string] & {
  order: string;
  sig: string;
};

export interface RelayOrderReactorInterface extends utils.Interface {
  functions: {
    "execute((bytes,bytes))": FunctionFragment;
    "executeBatch((bytes,bytes)[])": FunctionFragment;
    "permit2()": FunctionFragment;
    "universalRouter()": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "execute"
      | "executeBatch"
      | "permit2"
      | "universalRouter"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "execute",
    values: [SignedOrderStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "executeBatch",
    values: [SignedOrderStruct[]]
  ): string;
  encodeFunctionData(functionFragment: "permit2", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "universalRouter",
    values?: undefined
  ): string;

  decodeFunctionResult(functionFragment: "execute", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "executeBatch",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "permit2", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "universalRouter",
    data: BytesLike
  ): Result;

  events: {
    "Fill(bytes32,address,address,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "Fill"): EventFragment;
}

export interface FillEventObject {
  orderHash: string;
  filler: string;
  swapper: string;
  nonce: BigNumber;
}
export type FillEvent = TypedEvent<
  [string, string, string, BigNumber],
  FillEventObject
>;

export type FillEventFilter = TypedEventFilter<FillEvent>;

export interface RelayOrderReactor extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: RelayOrderReactorInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    execute(
      order: SignedOrderStruct,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    executeBatch(
      orders: SignedOrderStruct[],
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    permit2(overrides?: CallOverrides): Promise<[string]>;

    universalRouter(overrides?: CallOverrides): Promise<[string]>;
  };

  execute(
    order: SignedOrderStruct,
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  executeBatch(
    orders: SignedOrderStruct[],
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  permit2(overrides?: CallOverrides): Promise<string>;

  universalRouter(overrides?: CallOverrides): Promise<string>;

  callStatic: {
    execute(order: SignedOrderStruct, overrides?: CallOverrides): Promise<void>;

    executeBatch(
      orders: SignedOrderStruct[],
      overrides?: CallOverrides
    ): Promise<void>;

    permit2(overrides?: CallOverrides): Promise<string>;

    universalRouter(overrides?: CallOverrides): Promise<string>;
  };

  filters: {
    "Fill(bytes32,address,address,uint256)"(
      orderHash?: PromiseOrValue<BytesLike> | null,
      filler?: PromiseOrValue<string> | null,
      swapper?: PromiseOrValue<string> | null,
      nonce?: null
    ): FillEventFilter;
    Fill(
      orderHash?: PromiseOrValue<BytesLike> | null,
      filler?: PromiseOrValue<string> | null,
      swapper?: PromiseOrValue<string> | null,
      nonce?: null
    ): FillEventFilter;
  };

  estimateGas: {
    execute(
      order: SignedOrderStruct,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    executeBatch(
      orders: SignedOrderStruct[],
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    permit2(overrides?: CallOverrides): Promise<BigNumber>;

    universalRouter(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    execute(
      order: SignedOrderStruct,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    executeBatch(
      orders: SignedOrderStruct[],
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    permit2(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    universalRouter(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}