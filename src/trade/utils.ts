import { Currency } from "@uniswap/sdk-core";

export const NATIVE_ADDRESS = "0x0000000000000000000000000000000000000000";

export function areCurrenciesEqual(
  currency: Currency,
  address: string | null,
  chainId: number
) {
  if (currency.chainId !== chainId) return false;

  if (currency.isNative) {
    return address === NATIVE_ADDRESS;
  }

  return currency.address.toLowerCase() === address?.toLowerCase();
}
