import { Currency, CurrencyAmount, Price, TradeType } from "@uniswap/sdk-core";

import { RelayOrder, RelayOrderInfo } from "../order";

import { areCurrenciesEqual } from "./utils";
import { RELAY_SENTINEL_RECIPIENT } from "../constants";

/// A high level Trade object that representes a Relay order
/// It requires an output amount to be provided in order to calculate execution price
export class RelayOrderTrade<
  TInput extends Currency,
  TOutput extends Currency,
  TTradeType extends TradeType
> {
  public readonly tradeType: TTradeType;
  public readonly order: RelayOrder;

  private _inputAmounts: CurrencyAmount<TInput>[] | undefined;
  private _outputAmount: CurrencyAmount<TOutput>;

  private _currenciesIn: TInput[];

  // Since Relay orders have no concept of an output amount, it must be provided as a constructor param
  // this is the output amount from the encoded swap, or the value to be used for execution price
  public constructor({
    currenciesIn,
    outputAmount,
    orderInfo,
    tradeType,
  }: {
    currenciesIn: TInput[];
    outputAmount: CurrencyAmount<TOutput>;
    orderInfo: RelayOrderInfo;
    tradeType: TTradeType;
  }) {
    this._currenciesIn = currenciesIn;
    this._outputAmount = outputAmount;
    this.tradeType = tradeType;

    // assume single chain
    this.order = new RelayOrder(orderInfo, outputAmount.currency.chainId);
  }

  public get inputAmounts(): CurrencyAmount<TInput>[] {
    if (this._inputAmounts) return this._inputAmounts;

    const amounts = this.order.info.inputs.map((input) => {
      // assume single chain ids across all outputs for now
      const currencyIn = this._currenciesIn.find((currency) =>
        areCurrenciesEqual(currency, input.token, currency.chainId)
      );

      if (!currencyIn) {
        throw new Error("currency not found in output array");
      }

      return CurrencyAmount.fromRawAmount(
        currencyIn,
        input.startAmount.toString()
      );
    });

    this._inputAmounts = amounts;
    return amounts;
  }

  public get outputAmount(): CurrencyAmount<TOutput> {
    return this._outputAmount;
  }

  private _firstFeeInputStartEndAmount:
    | {
        startAmount: CurrencyAmount<TInput>;
        endAmount: CurrencyAmount<TInput>;
      }
    | undefined;
  
  private _firstNonFeeInputStartEndAmount:
    | {
        startAmount: CurrencyAmount<TInput>;
        endAmount: CurrencyAmount<TInput>;
      }
    | undefined;

  // This is the "tip" given to fillers of the order
  private getFirstFeeInputStartEndAmount(): {
    startAmount: CurrencyAmount<TInput>;
    endAmount: CurrencyAmount<TInput>;
  } {
    if (this._firstFeeInputStartEndAmount)
      return this._firstFeeInputStartEndAmount;

    if (this.order.info.inputs.length === 0) {
      throw new Error("there must be at least one input token");
    }
    const input = this.order.info.inputs.find((input) =>
      input.recipient === RELAY_SENTINEL_RECIPIENT
    )

    // The order does not contain a tip for the filler
    if(!input) {
      throw new Error("no fee input found")
    };
    
    // assume single chain ids across all outputs for now
    const currencyIn = this._currenciesIn.find((currency) =>
      areCurrenciesEqual(currency, input.token, currency.chainId)
    );

    if (!currencyIn) {
      throw new Error(
        "currency output from order must exist in currenciesOut list"
      );
    }

    const startEndAmounts = {
      startAmount: CurrencyAmount.fromRawAmount(
        currencyIn,
        input.startAmount.toString()
      ),
      endAmount: CurrencyAmount.fromRawAmount(
        currencyIn,
        input.maxAmount.toString()
      ),
    };

    this._firstFeeInputStartEndAmount = startEndAmounts;
    return startEndAmounts;
  }

  // This is usually the input sent to UR
  // Not guaranteed, so the recipipent MUST be checked
  private getFirstNonFeeInputStartEndAmount(): {
    startAmount: CurrencyAmount<TInput>;
    endAmount: CurrencyAmount<TInput>;
  } {
    if (this._firstNonFeeInputStartEndAmount)
      return this._firstNonFeeInputStartEndAmount;

    if (this.order.info.inputs.length === 0) {
      throw new Error("there must be at least one input token");
    }

    // Not going to filler (denoted by sentinel address)
    const input = this.order.info.inputs.find((input) =>
      input.recipient !== RELAY_SENTINEL_RECIPIENT
    )

    if(!input) {
      throw new Error("no non-fee input found");
    };
    
    // assume single chain ids across all outputs for now
    const currencyIn = this._currenciesIn.find((currency) =>
      areCurrenciesEqual(currency, input.token, currency.chainId)
    );

    if (!currencyIn) {
      throw new Error(
        "currency input from order must exist in currenciesIn list"
      );
    }

    const startEndAmounts = {
      startAmount: CurrencyAmount.fromRawAmount(
        currencyIn,
        input.startAmount.toString()
      ),
      endAmount: CurrencyAmount.fromRawAmount(
        currencyIn,
        input.maxAmount.toString()
      ),
    };

    this._firstNonFeeInputStartEndAmount = startEndAmounts;
    return startEndAmounts;
  }

  // Gets the start amount for the first non-fee input
  // Relay order inputs only increase, so maximum denotes endAmount
  public get amountIn(): CurrencyAmount<TInput> {
    return this.getFirstNonFeeInputStartEndAmount().startAmount;
  }

  public get maximumAmountIn(): CurrencyAmount<TInput> {
    return this.getFirstNonFeeInputStartEndAmount().endAmount;
  }

  public get amountInFee(): CurrencyAmount<TInput> {
    return this.getFirstFeeInputStartEndAmount().startAmount;
  }

  public get maximumAmountInFee(): CurrencyAmount<TInput> {
    return this.getFirstFeeInputStartEndAmount().endAmount;
  }

  public get canAggregateInputs(): boolean {
    // all inputs must be the same currency
    return this.inputAmounts.every((input) =>
      input.currency.equals(this.inputAmounts[0].currency)
    );
  }

  public aggregateInputAmounts(): CurrencyAmount<TInput> {
    if (!this.canAggregateInputs) {
      throw new Error("cannot aggregate inputs");
    }
    return this.inputAmounts.reduce((prev, curr) => prev.add(curr));
  }

  public aggregateMaximumAmountIn(): CurrencyAmount<TInput> {
    if (!this.canAggregateInputs) {
      throw new Error("cannot aggregate inputs");
    }
    return this.maximumAmountInFee.add(this.maximumAmountIn);
  }

  private _executionPrice: Price<TInput, TOutput> | undefined;

  /**
   * The price expressed in terms of output amount/input amount.
   * @dev this is only valid if all of the inputs are the same currency
   */
  public get executionPrice(): Price<TInput, TOutput> {
    if(!this.canAggregateInputs) {
      throw new Error("cannot aggregate inputs for executionPrice")
    }
    return (
      this._executionPrice ??
      (this._executionPrice = new Price(
        this.aggregateInputAmounts().currency,
        this.outputAmount.currency,
        this.aggregateInputAmounts().quotient,
        this.outputAmount.quotient
      ))
    );
  }

  /**
   * Return the execution price after accounting for slippage tolerance
   * @returns The execution price
   */
  public worstExecutionPrice(): Price<TInput, TOutput> {
    return new Price(
      this.aggregateInputAmounts().currency,
      this.outputAmount.currency,
      this.aggregateMaximumAmountIn().quotient,
      this.outputAmount.quotient
    );
  }
}
