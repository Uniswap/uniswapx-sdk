import { OrderType, REVERSE_REACTOR_MAPPING } from "../constants";
import { MissingConfiguration } from "../errors";
import { DutchOrder, Order, RelayOrder, V2DutchOrder } from "../order";

import { stripHexPrefix } from ".";

const UNISWAPX_FIRST_FIELD_OFFSET = 664;
const RELAY_FIRST_FIELD_OFFSET = 88;
const ADDRESS_LENGTH = 40;

abstract class OrderParser {
  abstract offset: number;

  abstract parseOrder(order: string, chainId: number): Order;

  /**
   * Parses a serialized order based on the order shape
   * @dev called by derived classes which set the offset
   */
  protected _parseOrder(order: string): OrderType {
    const reactor =
      "0x" +
      stripHexPrefix(order)
        .slice(this.offset, this.offset + ADDRESS_LENGTH)
        .toLowerCase();

    if (!REVERSE_REACTOR_MAPPING[reactor]) {
      throw new MissingConfiguration("reactor", reactor);
    }

    return REVERSE_REACTOR_MAPPING[reactor].orderType;
  }

  /**
   * Helper function to determine the OrderType from a serialized order
   */
  getOrderTypeFromEncoded(order: string, chainId: number): OrderType {
    const parsedOrder = this.parseOrder(order, chainId);
    return this.getOrderType(parsedOrder);
  }

  /**
   * Determines the OrderType from an Order object
   * @return OrderType
   */
  abstract getOrderType(order: Order): OrderType;
}

export class UniswapXOrderParser extends OrderParser {
  offset = UNISWAPX_FIRST_FIELD_OFFSET;

  /**
   * Parses a serialized order
   */
  parseOrder(order: string, chainId: number): Order {
    const orderType = this._parseOrder(order);
    switch (orderType) {
      case OrderType.Dutch:
        return DutchOrder.parse(order, chainId);
      case OrderType.Dutch_V2:
        return V2DutchOrder.parse(order, chainId);
      default:
        throw new MissingConfiguration("orderType", orderType);
    }
  }

  /**
   * Determine the order type of a UniswapX order
   * @dev Special cases limit orders which are dutch orders with no output decay
   */
  getOrderType(order: Order): OrderType {
    const { orderType } =
      REVERSE_REACTOR_MAPPING[order.info.reactor.toLowerCase()];

    if (orderType == OrderType.Dutch) {
      const input = (order as DutchOrder).info.input;
      const outputs = (order as DutchOrder).info.outputs;
      const isLimit =
        input.startAmount.eq(input.endAmount) &&
        outputs.every((output) => output.startAmount.eq(output.endAmount));

      return isLimit ? OrderType.Limit : OrderType.Dutch;
    }

    return orderType;
  }
}

export class RelayOrderParser extends OrderParser {
  offset = RELAY_FIRST_FIELD_OFFSET;

  /**
   * Parses a serialized order
   */
  parseOrder(order: string, chainId: number): Order {
    return RelayOrder.parse(order, chainId);
  }

  /**
   * Determine the order type of a Relay order
   * @dev no additional logic required 
   */
  getOrderType(order: Order): OrderType {
    const { orderType } =
      REVERSE_REACTOR_MAPPING[order.info.reactor.toLowerCase()];
    return orderType;
  }
}
