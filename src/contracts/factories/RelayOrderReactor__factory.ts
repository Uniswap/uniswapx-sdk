/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../common";
import type {
  RelayOrderReactor,
  RelayOrderReactorInterface,
} from "../RelayOrderReactor";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_universalRouter",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "DeadlineBeforeEndTime",
    type: "error",
  },
  {
    inputs: [],
    name: "DeadlinePassed",
    type: "error",
  },
  {
    inputs: [],
    name: "EndTimeBeforeStartTime",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidAmounts",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidReactor",
    type: "error",
  },
  {
    inputs: [],
    name: "UnsafeCast",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "orderHash",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "filler",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "swapper",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "nonce",
        type: "uint256",
      },
    ],
    name: "Fill",
    type: "event",
  },
  {
    inputs: [],
    name: "PERMIT2",
    outputs: [
      {
        internalType: "contract IPermit2",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "bytes",
            name: "order",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "sig",
            type: "bytes",
          },
        ],
        internalType: "struct SignedOrder",
        name: "signedOrder",
        type: "tuple",
      },
    ],
    name: "execute",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "bytes",
            name: "order",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "sig",
            type: "bytes",
          },
        ],
        internalType: "struct SignedOrder",
        name: "signedOrder",
        type: "tuple",
      },
      {
        internalType: "address",
        name: "feeRecipient",
        type: "address",
      },
    ],
    name: "execute",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes[]",
        name: "data",
        type: "bytes[]",
      },
    ],
    name: "multicall",
    outputs: [
      {
        internalType: "bytes[]",
        name: "results",
        type: "bytes[]",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract ERC20",
        name: "token",
        type: "address",
      },
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
      {
        internalType: "uint8",
        name: "v",
        type: "uint8",
      },
      {
        internalType: "bytes32",
        name: "r",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "s",
        type: "bytes32",
      },
    ],
    name: "permit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "universalRouter",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const _bytecode =
  "0x60a03461007057601f611cfa38819003918201601f19168301916001600160401b038311848410176100755780849260209460405283398101031261007057516001600160a01b038116810361007057608052604051611c6e908161008c823960805181818160bf0152610ca10152f35b600080fd5b634e487b7160e01b600052604160045260246000fdfe6080604052600436101561001257600080fd5b6000803560e01c90816335a9e4df1461007a575080633f62192e146100755780636afdd85014610070578063ac9650d81461006b578063d339056d146100665763e956bbdf1461006157600080fd5b610667565b61033a565b610294565b610164565b610109565b346100e857807ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc3601126100e85773ffffffffffffffffffffffffffffffffffffffff7f00000000000000000000000000000000000000000000000000000000000000001660805260206080f35b80fd5b60009103126100f657565b600080fd5b908160409103126100f65790565b346100f65760207ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc3601126100f65760043567ffffffffffffffff81116100f65761015b6101629136906004016100fb565b3390610b1c565b005b346100f65760007ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc3601126100f65760206040516e22d473030f116ddee9f6b43ac78ba38152f35b60005b8381106101bf5750506000910152565b81810151838201526020016101af565b907fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0601f60209361020b815180928187528780880191016101ac565b0116010190565b6020808201906020835283518092526040830192602060408460051b8301019501936000915b8483106102485750505050505090565b9091929394958480610284837fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc086600196030187528a516101cf565b9801930193019194939290610238565b346100f65760207ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc3601126100f65767ffffffffffffffff6004358181116100f657366023820112156100f65780600401359182116100f6573660248360051b830101116100f65761031891602461030c920161094e565b60405191829182610212565b0390f35b73ffffffffffffffffffffffffffffffffffffffff8116036100f657565b346100f6576101007ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc3601126100f6576004356103768161031c565b6024356103828161031c565b60443561038e8161031c565b60a43560843560643560ff831683036100f65760c4359360e435956040516020808201917f3644e515000000000000000000000000000000000000000000000000000000008352600481526103e28161072f565b60009283838d829373ffffffffffffffffffffffffffffffffffffffff82169573c02aaa39b223fe8d0a0e5c4f27ead9083c756cc28703610647575b5050505061043a575b5050501561043157005b610162976116f0565b919250907fdbb8cf42e1ecb028be3f3dbc922e1d878b963f411dc388ced501601c60f7c6f7036105bc576040517f7ecebe0000000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff84166004820152908290829060249082905afa9182156105b757866105786000948594859161058a575b506040517f8fcbaf0c000000000000000000000000000000000000000000000000000000008582015273ffffffffffffffffffffffffffffffffffffffff80891660248301528916604482015260648101919091526084810192909252600160a483015260ff8a1660c483015260e482018b905261010482018c90528161012481015b037fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe08101835282610783565b905b81519101828c5af1388080610427565b6105aa9150843d86116105b0575b6105a28183610783565b810190610ce0565b386104c9565b503d610598565b610cef565b506040517fd505accf000000000000000000000000000000000000000000000000000000008183015273ffffffffffffffffffffffffffffffffffffffff808416602483015284166044820152606481018590526084810186905260ff871660a482015260c4810188905260e48101899052600091829161064181610104810161054c565b9061057a565b5192945090611388fa823d149351938415151616809390838d388061041e565b346100f65760407ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc3601126100f65760043567ffffffffffffffff81116100f6576106b96101629136906004016100fb565b602435906106c68261031c565b610b1c565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6080810190811067ffffffffffffffff82111761071657604052565b6106cb565b67ffffffffffffffff811161071657604052565b6040810190811067ffffffffffffffff82111761071657604052565b6060810190811067ffffffffffffffff82111761071657604052565b60a0810190811067ffffffffffffffff82111761071657604052565b90601f7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0910116810190811067ffffffffffffffff82111761071657604052565b604051906107d18261074b565b565b604051906107d1826106fa565b604051906107d18261072f565b67ffffffffffffffff81116107165760051b60200190565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b9035907fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe1813603018212156100f6570180359067ffffffffffffffff82116100f6576020019181360383136100f657565b908210156108a05761089c9160051b810190610834565b9091565b610805565b908092918237016000815290565b67ffffffffffffffff811161071657601f017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe01660200190565b3d15610918573d906108fe826108b3565b9161090c6040519384610783565b82523d6000602084013e565b606090565b8051156108a05760200190565b8051600110156108a05760400190565b80518210156108a05760209160051b010190565b91909161095a836107ed565b90604061096a6040519384610783565b8483527fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0610997866107ed565b0160005b818110610a0f575050829460005b8181106109b7575050505050565b6000806109c5838588610885565b906109d48751809381936108a5565b0390305af46109e16108ed565b9015610a0757906001916109f5828861093a565b52610a00818761093a565b50016109a9565b602081519101fd5b80606060208093880101520161099b565b91908260609103126100f6576040516060810181811067ffffffffffffffff8211176107165760405260408082948035610a598161031c565b845260208101356020850152013591610a718361031c565b0152565b91908260a09103126100f65760405160a0810181811067ffffffffffffffff8211176107165760405260808082948035610aae8161031c565b84526020810135602085015260408101356040850152606081013560608501520135910152565b81601f820112156100f657803590610aec826108b3565b92610afa6040519485610783565b828452602083830101116100f657816000926020809301838601378301015290565b90610b278280610834565b819391019260209384828203126100f657813567ffffffffffffffff928382116100f6570193848203926101a084126100f6576040956080875195610b6b876106fa565b126100f6578651610b7b816106fa565b8135610b868161031c565b815288820135610b958161031c565b898201528782013588820152606082013560608201528552610bba8460808301610a20565b88860152610bcb8460e08301610a75565b878601526101808101359182116100f6578693610c1b92610bec9201610ad5565b9160608501928352610bfd85610cfb565b610c13610c09866110d5565b9689810190610834565b918787611468565b518581519182610c96575b50505073ffffffffffffffffffffffffffffffffffffffff90610c827f78ad7ec0e9f89e74012afa58738b6b661c024cb0fd185ee2f616c0a28924bd6693519687015173ffffffffffffffffffffffffffffffffffffffff1690565b9501519351938452909316923392602090a4565b6000935083929101827f00000000000000000000000000000000000000000000000000000000000000005af1610cca6108ed565b9015610cd95780858592610c26565b8481519101fd5b908160209103126100f6575190565b6040513d6000823e3d90fd5b60608151015160806040830151015111610d5957515173ffffffffffffffffffffffffffffffffffffffff163003610d2f57565b60046040517f4ddf4a64000000000000000000000000000000000000000000000000000000008152fd5b60046040517f773a6187000000000000000000000000000000000000000000000000000000008152fd5b6040517f52656c61794f726465722800000000000000000000000000000000000000000060208201527f4f72646572496e666f20696e666f2c0000000000000000000000000000000000602b8201527f496e70757420696e7075742c0000000000000000000000000000000000000000603a8201527f466565457363616c61746f72206665652c00000000000000000000000000000060468201527f627974657320756e6976657273616c526f7574657243616c6c64617461290000605782015260558152610e51816106fa565b90565b6040517f466565457363616c61746f72280000000000000000000000000000000000000060208201527f6164647265737320746f6b656e2c000000000000000000000000000000000000602d8201527f75696e74323536207374617274416d6f756e742c000000000000000000000000603b8201527f75696e7432353620656e64416d6f756e742c0000000000000000000000000000604f8201527f75696e7432353620737461727454696d652c000000000000000000000000000060618201527f75696e7432353620656e6454696d652900000000000000000000000000000000607382015260638152610e5181610767565b6040517f496e70757428000000000000000000000000000000000000000000000000000060208201527f6164647265737320746f6b656e2c00000000000000000000000000000000000060268201527f75696e7432353620616d6f756e742c000000000000000000000000000000000060348201527f6164647265737320726563697069656e74290000000000000000000000000000604382015260358152610e518161074b565b6040517f4f72646572496e666f280000000000000000000000000000000000000000000060208201527f616464726573732072656163746f722c00000000000000000000000000000000602a8201527f6164647265737320737761707065722c00000000000000000000000000000000603a8201527f75696e74323536206e6f6e63652c000000000000000000000000000000000000604a8201527f75696e7432353620646561646c696e6529000000000000000000000000000000605882015260498152610e51816106fa565b906110d1602092828151948592016101ac565b0190565b6110dd610d83565b906111c96110e9610e54565b926110f2610f48565b936111636110fe610ff0565b91604051809360209889938461111d818601998a8151938492016101ac565b8401611131825180938880850191016101ac565b01611144825180938780850191016101ac565b01611157825180938680850191016101ac565b01038084520182610783565b5190209261054c61117484516118b2565b9361118183820151611932565b9060606111916040830151611990565b91015184815191012091604051968795860198899192608093969594919660a084019784526020840152604083015260608201520152565b51902090565b611299610e516111dd610e54565b61054c6111e8610f48565b60336111f2610ff0565b916111fb610d83565b906112d16040519461120c8661074b565b602e86526020927f546f6b656e5065726d697373696f6e73286164647265737320746f6b656e2c75848801527f696e7432353620616d6f756e74290000000000000000000000000000000000006040880152856040519b8c809b7f52656c61794f72646572207769746e6573732900000000000000000000000000888301528781519485930191016101ac565b89016112ad82518093878a850191016101ac565b016112c0825180938689850191016101ac565b0191835193849186850191016101ac565b0101906110be565b90815180825260208080930193019160005b8281106112f9575050505090565b909192938260408261132e60019489516020809173ffffffffffffffffffffffffffffffffffffffff81511684520151910152565b019501939291016112eb565b601f82602094937fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0938186528686013760008582860101520116010190565b9593909796949160c087526101208701988051606060c08a01528051809b5261014089019a60208092019160005b82811061142657505050506113e7610e51999a611418969594936040848c60e0602061140698015191015201516101008c01528a820360208c01526112d9565b73ffffffffffffffffffffffffffffffffffffffff9094166040890152565b606087015285820360808701526101cf565b9260a081850391015261133a565b9091929c8260408f9261145c81600195516020809173ffffffffffffffffffffffffffffffffffffffff81511684520151910152565b019e01939291016113a7565b93909360408051936114798561074b565b6002855260005b8281106115db5750602061151c6115589282860151836114b4825173ffffffffffffffffffffffffffffffffffffffff1690565b9101516114de6114c26107e0565b73ffffffffffffffffffffffffffffffffffffffff9093168352565b848201526114eb8961091d565b526114f58861091d565b5061150285870151611b21565b61150b8961092a565b526115158861092a565b5085611a30565b938051606085820151910151906115316107c4565b988952838901528488015251015173ffffffffffffffffffffffffffffffffffffffff1690565b936115616111cf565b916e22d473030f116ddee9f6b43ac78ba394853b156100f65760009788946115b793519a8b998a9889977ffe8ec1a700000000000000000000000000000000000000000000000000000000895260048901611379565b03925af180156105b7576115c85750565b806115d56107d19261071b565b806100eb565b6020906115e6611a17565b82828901015201611480565b519065ffffffffffff821682036100f657565b908160609103126100f657805161161b8161031c565b91610e51604061162d602085016115f2565b93016115f2565b92917fff00000000000000000000000000000000000000000000000000000000000000916040519460208601526040850152166060830152604182526107d1826106fa565b6040610e5194936101009373ffffffffffffffffffffffffffffffffffffffff8091168452815181815116602086015281602082015116848601526060848201519165ffffffffffff80931682880152015116608085015260208201511660a0840152015160c08201528160e082015201906101cf565b6040517f927da10500000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff8381166004830152918216602482018190529184166044820152909791966e22d473030f116ddee9f6b43ac78ba39690959294909391906060826064818b5afa9182156105b75760009261187a575b5061178490611ad6565b61178c6107d3565b73ffffffffffffffffffffffffffffffffffffffff909a168a5273ffffffffffffffffffffffffffffffffffffffff1660208a015265ffffffffffff60408a015265ffffffffffff1660608901526117e26107c4565b97885273ffffffffffffffffffffffffffffffffffffffff166020880152604087015260f81b7fff00000000000000000000000000000000000000000000000000000000000000169061183492611634565b90803b156100f6576115b79360008094604051968795869485937f2b67b57000000000000000000000000000000000000000000000000000000000855260048501611679565b6117849192506118a19060603d6060116118ab575b6118998183610783565b810190611605565b915050919061177a565b503d61188f565b6118ba610ff0565b602081519101209073ffffffffffffffffffffffffffffffffffffffff908181511691602082015116906060604082015191015191604051936020850195865260408501526060840152608083015260a082015260a0815260c0810181811067ffffffffffffffff8211176107165760405251902090565b61193a610f48565b602081519101209073ffffffffffffffffffffffffffffffffffffffff9081815116916040602083015192015116906040519260208401948552604084015260608301526080820152608081526111c981610767565b611998610e54565b602081519101209073ffffffffffffffffffffffffffffffffffffffff8151169060208101519060408101516080606083015192015192604051946020860196875260408601526060850152608084015260a083015260c082015260c0815260e0810181811067ffffffffffffffff8211176107165760405251902090565b60405190611a248261072f565b60006020838281520152565b919060409060405191611a428361074b565b6002835260005b818110611abf57505090611aad611abc92604083966020810151602073ffffffffffffffffffffffffffffffffffffffff8483015116910151611a8d6114c26107e0565b6020820152611a9b8661091d565b52611aa58561091d565b500151611b5e565b611ab68261092a565b5261092a565b50565b602090611aca611a17565b82828701015201611a49565b73ffffffffffffffffffffffffffffffffffffffff90818111611af7571690565b60046040517fc4bd89a9000000000000000000000000000000000000000000000000000000008152fd5b611b29611a17565b50604073ffffffffffffffffffffffffffffffffffffffff82511691015160405191611b548361072f565b8252602082015290565b611b66611a17565b5060208101516040820151916080606082015191015190838311600014611bb15760046040517fd856fc5a000000000000000000000000000000000000000000000000000000008152fd5b80821015611be35760046040517f43133453000000000000000000000000000000000000000000000000000000008152fd5b428211611c01575050505b611bf96114c26107e0565b602082015290565b919290919083428310611c175750505050611bee565b82611c2794039242039103611c2d565b01611bee565b817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0481118202158302156100f65702049056fea164736f6c6343000818000a";

type RelayOrderReactorConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: RelayOrderReactorConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class RelayOrderReactor__factory extends ContractFactory {
  constructor(...args: RelayOrderReactorConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    _universalRouter: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<RelayOrderReactor> {
    return super.deploy(
      _universalRouter,
      overrides || {}
    ) as Promise<RelayOrderReactor>;
  }
  override getDeployTransaction(
    _universalRouter: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(_universalRouter, overrides || {});
  }
  override attach(address: string): RelayOrderReactor {
    return super.attach(address) as RelayOrderReactor;
  }
  override connect(signer: Signer): RelayOrderReactor__factory {
    return super.connect(signer) as RelayOrderReactor__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): RelayOrderReactorInterface {
    return new utils.Interface(_abi) as RelayOrderReactorInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): RelayOrderReactor {
    return new Contract(address, _abi, signerOrProvider) as RelayOrderReactor;
  }
}
