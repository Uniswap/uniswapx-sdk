import { SignatureLike } from "@ethersproject/bytes";
import {
  PermitBatchTransferFromData,
  PermitTransferFromData,
} from "@uniswap/permit2-sdk";
import { BigNumber } from "ethers";

import { ResolvedOrder } from "../utils/OrderQuoter";

import { CustomOrderValidation, parseValidation } from "./validation";

// General interface implemented by off chain orders
export interface Order {
  /**
   * Returns the abi encoded order
   * @return The abi encoded serialized order which can be submitted on-chain
   */
  serialize(): string;
  /**
   * Recovers the given signature, returning the address which created it
   *  * @param signature The signature to recover
   *  * @returns address The address which created the signature
   */
  getSigner(signature: SignatureLike): string;
  /**
   * Returns the data for generating the maker EIP-712 permit signature
   * @return The data for generating the maker EIP-712 permit signature
   */
  permitData(): PermitTransferFromData | PermitBatchTransferFromData;
  /**
   * Returns the order hash
   * @return The order hash which is used as a key on-chain
   */
  hash(): string;
}

// Base class for a UniswapX order
export abstract class UniswapXOrder implements Order {
  abstract info: OrderInfo;

  abstract chainId: number;

  abstract serialize(): string;

  abstract getSigner(signature: SignatureLike): string;

  abstract permitData(): PermitTransferFromData;

  abstract hash(): string;

  /**
   * Returns the parsed validation
   * @return The parsed validation data for the order
   */
  get validation(): CustomOrderValidation {
    return parseValidation(this.info);
  }

  /**
   * Returns the resolved order with the given options
   * @return The resolved order
   */
  abstract resolve(options: OrderResolutionOptions): ResolvedOrder;
}

export abstract class V2Order extends UniswapXOrder {
  /**
   * Recovers the signer (user) that signed over the inner order
   *  * @param signature The signature to recover
   *  * @returns address The address which created the signature
   */
  abstract getSigner(signature: SignatureLike): string;

  /**
   * Returns the abi encoded full order, including cosigned data, cosignature, etc
   * @return The abi encoded serialized order which can be submitted on-chain
   */
  abstract serialize(): string;

  /**
   * Recovers the cosigner address that signed over the full order
   * @param fullOrderHash The full order hash over (orderHash || cosignerData)
   * @returns address The cosigner address
   */
  abstract recoverCosigner(fullOrderHash: string): string;

  /**
   * @return Returns the full order hash over (orderHash || cosignerData)
   */
  abstract hashFullOrder(): string;
}

export type TokenAmount = {
  readonly token: string;
  readonly amount: BigNumber;
};

export type ResolvedRelayFee = {
  readonly token: string;
  readonly amount: BigNumber;
  readonly recipient: string;
};

export type OrderInfo = {
  reactor: string;
  swapper: string;
  nonce: BigNumber;
  deadline: number;
  additionalValidationContract: string;
  additionalValidationData: string;
};

// options to resolve an order
export type OrderResolutionOptions = {
  timestamp: number;
  filler?: string;
};

export type DutchOutput = {
  readonly token: string;
  readonly startAmount: BigNumber;
  readonly endAmount: BigNumber;
  readonly recipient: string;
};

export type DutchOutputJSON = Omit<DutchOutput, "startAmount" | "endAmount"> & {
  startAmount: string;
  endAmount: string;
};

export type DutchInput = {
  readonly token: string;
  readonly startAmount: BigNumber;
  readonly endAmount: BigNumber;
};

export type DutchInputJSON = Omit<DutchInput, "startAmount" | "endAmount"> & {
  startAmount: string;
  endAmount: string;
};
