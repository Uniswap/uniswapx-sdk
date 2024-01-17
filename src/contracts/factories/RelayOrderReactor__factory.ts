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
        internalType: "contract IPermit2",
        name: "_permit2",
        type: "address",
      },
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
    name: "CallFailed",
    type: "error",
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
    name: "IncorrectAmounts",
    type: "error",
  },
  {
    inputs: [],
    name: "InputAndOutputDecay",
    type: "error",
  },
  {
    inputs: [],
    name: "InsufficientEth",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidReactor",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidToken",
    type: "error",
  },
  {
    inputs: [],
    name: "OrderEndTimeBeforeStartTime",
    type: "error",
  },
  {
    inputs: [],
    name: "ReactorCallbackNotSupported",
    type: "error",
  },
  {
    inputs: [],
    name: "UnsupportedAction",
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
        name: "order",
        type: "tuple",
      },
    ],
    name: "execute",
    outputs: [],
    stateMutability: "payable",
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
        internalType: "struct SignedOrder[]",
        name: "orders",
        type: "tuple[]",
      },
    ],
    name: "executeBatch",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "permit2",
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
  {
    stateMutability: "payable",
    type: "receive",
  },
];

const _bytecode =
  "0x60c03461009157601f611bca38819003918201601f19168301916001600160401b038311848410176100965780849260409485528339810103126100915780516001600160a01b039182821682036100915760200151918216820361009157600160005560805260a052604051611b1d90816100ad82396080518181816101e00152610849015260a0518161024f0152f35b600080fd5b634e487b7160e01b600052604160045260246000fdfe6080604052600436101561001b575b361561001957600080fd5b005b6000803560e01c9081630d7a16c31461005e5750806312261ee71461005957806335a9e4df1461005457633f62192e0361000e57610273565b610204565b610195565b60207ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc3601126101825760043567ffffffffffffffff80821161017e573660238301121561017e57816004013590811161017e576024600591368282851b8601011161017a57916100d3600286541415610311565b600285556100e08361059f565b9385917fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff9d82360301925b85811061013a578761012d8861011f8161082f565b61012881610773565b610ab3565b6101376001600055565b80f35b8481831b8401013590848212156101765761015a86600193860101610d8c565b610164828a61063b565b5261016f818961063b565b500161010a565b8880fd5b8480fd5b8280fd5b80fd5b600091031261019057565b600080fd5b346101905760007ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc36011261019057602060405173ffffffffffffffffffffffffffffffffffffffff7f0000000000000000000000000000000000000000000000000000000000000000168152f35b346101905760007ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc36011261019057602060405173ffffffffffffffffffffffffffffffffffffffff7f0000000000000000000000000000000000000000000000000000000000000000168152f35b7ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc602081360112610190576004359067ffffffffffffffff8211610190576040908236030112610190576102cc60026000541415610311565b60026000556102e56102dc610563565b91600401610d8c565b81511561030c57602082015280511561030c578061011f6103059261082f565b6001600055005b61060c565b1561031857565b60646040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601f60248201527f5265656e7472616e637947756172643a207265656e7472616e742063616c6c006044820152fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b60c0810190811067ffffffffffffffff8211176103c157604052565b610376565b6080810190811067ffffffffffffffff8211176103c157604052565b67ffffffffffffffff81116103c157604052565b60a0810190811067ffffffffffffffff8211176103c157604052565b6040810190811067ffffffffffffffff8211176103c157604052565b6060810190811067ffffffffffffffff8211176103c157604052565b610100810190811067ffffffffffffffff8211176103c157604052565b90601f7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0910116810190811067ffffffffffffffff8211176103c157604052565b604051906104b5826103f6565b565b604051906104b5826103c6565b604051906104b582610412565b604051906104b58261042e565b67ffffffffffffffff81116103c15760051b60200190565b6040519060a0820182811067ffffffffffffffff8211176103c15780604052608083610521836103a5565b6000928381528360c08301528360e083015283610100830152836101208301526060610140830152815260606020820152606060408201526060808201520152565b6040519061057082610412565b600182528160005b6020908181101561059a5760209161058e6104f6565b90828501015201610578565b505050565b906105a9826104de565b6105b66040519182610467565b8281527fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe06105e482946104de565b019060005b8281106105f557505050565b6020906106006104f6565b828285010152016105e9565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b805182101561030c5760209160051b010190565b73ffffffffffffffffffffffffffffffffffffffff81160361019057565b67ffffffffffffffff81116103c157601f017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe01660200190565b60005b8381106106ba5750506000910152565b81810151838201526020016106aa565b90916060828403126101905781516106e18161064f565b9260208301519260408101519067ffffffffffffffff8211610190570181601f820112156101905780516107148161066d565b926107226040519485610467565b818452602082840101116101905761074091602080850191016106a7565b90565b3d1561076e573d906107548261066d565b916107626040519384610467565b82523d6000602084013e565b606090565b80519060005b82811061078557505050565b602080610792838561063b565b5101908151519160005b8381106107af5750505050600101610779565b6000806107cf6107c084865161063b565b518680825183010191016106ca565b919073ffffffffffffffffffffffffffffffffffffffff888451940192165af16107f7610743565b50156108055760010161079c565b60046040517f3204506f000000000000000000000000000000000000000000000000000000008152fd5b805173ffffffffffffffffffffffffffffffffffffffff917f000000000000000000000000000000000000000000000000000000000000000083169160005b81811061087c575050505050565b61088a81849795969761063b565b519286845151163003610a895760609283855101514211610a5f576108ad6118d3565b50604091828601966108c0885151611904565b9960005b89518051821015610976579061096b818e8d8261091e6109056108ea836109719a61063b565b515173ffffffffffffffffffffffffffffffffffffffff1690565b73ffffffffffffffffffffffffffffffffffffffff1690565b9161092d60209283925161063b565b5101519061095861093c6104c4565b73ffffffffffffffffffffffffffffffffffffffff9094168452565b820152610965838361063b565b5261063b565b50611991565b6108c4565b5050989750989593929094919584519183818401519301516109966104d1565b92835260209384840152818301526109cf6109b0876119ed565b9387510173ffffffffffffffffffffffffffffffffffffffff90511690565b956080810151946109de6116af565b910151908a3b1561019057600095610a22935198899687967ffe8ec1a7000000000000000000000000000000000000000000000000000000008852600488016117db565b038183895af1918215610a5a57600192610a41575b500191909161086e565b80610a4e610a54926103e2565b80610185565b38610a37565b6118c7565b60046040517f70f65caa000000000000000000000000000000000000000000000000000000008152fd5b60046040517f4ddf4a64000000000000000000000000000000000000000000000000000000008152fd5b80519060005b828110610ac557505050565b80610ad26001928461063b565b516080610adf838661063b565b51015190516020917f78ad7ec0e9f89e74012afa58738b6b661c024cb0fd185ee2f616c0a28924bd6673ffffffffffffffffffffffffffffffffffffffff84840151169360408094015193519384523393a401610ab9565b9035907fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe181360301821215610190570180359067ffffffffffffffff82116101905760200191813603831361019057565b929192610b948261066d565b91610ba26040519384610467565b829481845281830111610190578281602093846000960137010152565b9080601f830112156101905781602061074093359101610b88565b919060c0838203126101905760405190610bf3826103a5565b81938035610c008161064f565b83526020810135610c108161064f565b602084015260408101356040840152606081013560608401526080810135610c378161064f565b608084015260a08101359167ffffffffffffffff83116101905760a092610c5e9201610bbf565b910152565b9080601f8301121561019057813590610c7b826104de565b92610c896040519485610467565b828452602092838086019160051b8301019280841161019057848301915b848310610cb75750505050505090565b823567ffffffffffffffff8111610190578691610cd984848094890101610bbf565b815201920191610ca7565b81601f8201121561019057803590610cfb826104de565b92604092610d0b84519586610467565b808552602091828087019260071b85010193818511610190578301915b848310610d385750505050505090565b60808383031261019057836080918751610d51816103c6565b8535610d5c8161064f565b81528286013583820152888601358982015260608087013590610d7e8261064f565b820152815201920191610d28565b610d946104f6565b50610d9f8180610b37565b819291019060208383031261019057823567ffffffffffffffff93848211610190570160a08184031261019057610dd46104a8565b9080358581116101905784610dea918301610bda565b825260208201926020820135845260408301946040830135865260608301358781116101905781610e1c918501610c63565b9660608501978852608084013590811161019057610e9a95610e49610e7593610e6a93610e7d9701610ce4565b9760808701988952610e5a87611a9c565b8651995198519151905191610ecc565b916020810190610b37565b9290936114f8565b94610e866104a8565b968752602087015260408601523691610b88565b6060830152608082015290565b60405190610eb4826103c6565b60006060838281528260208201528260408201520152565b9290835190610eda826104de565b90604094610eea86519384610467565b8383527fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0610f17856104de565b0160005b8181106110c1575050829660005b858110610f3a575050505050509050565b610f44818361063b565b51610f4d610ea7565b506020808201918251928b820193845110611098575183519088881015610f975760048d517f43133453000000000000000000000000000000000000000000000000000000008152fd5b9a9b9a60019594936110399390929091428a1161105857505b815173ffffffffffffffffffffffffffffffffffffffff16945190610fed60608094015173ffffffffffffffffffffffffffffffffffffffff1690565b93611015610ff96104b7565b73ffffffffffffffffffffffffffffffffffffffff9098168852565b8601528c85015283019073ffffffffffffffffffffffffffffffffffffffff169052565b611043828861063b565b5261104e818761063b565b5001969596610f29565b90428b106110665750610fb0565b8a8a03428c90038380841015611088579261108193036110de565b9003610fb0565b61109293036110de565b01610fb0565b60048c517f7c1f8113000000000000000000000000000000000000000000000000000000008152fd5b6020906110cf989798610ea7565b82828801015201969596610f1b565b817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff04811182021583021561019057020490565b6040519061111f826103a5565b608d82527f6c69646174696f6e44617461290000000000000000000000000000000000000060a0837f4f72646572496e666f28616464726573732072656163746f722c61646472657360208201527f7320737761707065722c75696e74323536206e6f6e63652c75696e743235362060408201527f646561646c696e652c61646472657373206164646974696f6e616c56616c696460608201527f6174696f6e436f6e74726163742c6279746573206164646974696f6e616c566160808201520152565b604051906111f0826103c6565b605982527f416d6f756e742c6164647265737320726563697069656e7429000000000000006060837f496e707574546f6b656e57697468526563697069656e7428616464726573732060208201527f746f6b656e2c75696e7432353620616d6f756e742c75696e74323536206d617860408201520152565b9061127b602092828151948592016106a7565b0190565b60ad61074061128c611112565b6113e96112976111e3565b6040519485937f52656c61794f726465722800000000000000000000000000000000000000000060208601527f4f72646572496e666f20696e666f2c0000000000000000000000000000000000602b8601527f75696e74323536206465636179537461727454696d652c000000000000000000603a8601527f75696e74323536206465636179456e6454696d652c000000000000000000000060518601527f62797465735b5d20616374696f6e732c0000000000000000000000000000000060668601527f496e707574546f6b656e57697468526563697069656e745b5d20696e7075747360768601527f2c0000000000000000000000000000000000000000000000000000000000000060968601527f4f7574707574546f6b656e5b5d206f757470757473290000000000000000000060978601526113e081518092602085890191016106a7565b84010190611268565b037fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe08101835282610467565b907fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0601f602093611451815180928187528780880191016106a7565b0116010190565b969594929390919360c08801928852602094858901526040880152606087015260c06080870152815180915260e08601928060e08360051b8901019301936000905b8382106114ae575050505060a09150930152565b9091929383806114e8837fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff208d600196030186528951611415565b970192019201909493929161149a565b61150061127f565b906115c48251602080940120926113e9835161151a611112565b8381519101209073ffffffffffffffffffffffffffffffffffffffff808251169181868201511691604082015160a0606084015192608085015116930151888151910120936040519589870197885260408701526060860152608085015260a084015260c083015260e082015260e081526115948161044a565b51902093828101519060408101516115b4608060608401519301516115ca565b926040519788968701998a611458565b51902090565b8051600590811b926115db8461066d565b6115f56040956115ed87519384610467565b80835261066d565b936020927fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0848401960136873760005b82518110156116a2578061163b6001928561063b565b516116446111e3565b8781519101209073ffffffffffffffffffffffffffffffffffffffff815116908b89820151910151908c51928a84019485528d8401526060830152608090818301528152611691816103f6565b5190208682891b8701015201611625565b5095505091505051902090565b61176b61074060336116bf61127f565b6040516116cb8161042e565b602e815260208101907f546f6b656e5065726d697373696f6e73286164647265737320746f6b656e2c7582527f696e7432353620616d6f756e742900000000000000000000000000000000000060408201526040519586937f52656c61794f72646572207769746e6573732900000000000000000000000000602086015261175c81518092602089890191016106a7565b840191518093868401906106a7565b01036013810184520182610467565b90815180825260208080930193019160005b82811061179a575050505090565b90919293826040826117cf60019489516020809173ffffffffffffffffffffffffffffffffffffffff81511684520151910152565b0195019392910161178c565b9491969593909660c08652610120860197805190606060c08901528151809a5261014088019960208093019060005b81811061188757505050610740989961187996959493836040848c60e06118679861184898015191015201516101008c01528a8303908b015261177a565b73ffffffffffffffffffffffffffffffffffffffff9094166040880152565b60608601528482036080860152611415565b9160a0818403910152611415565b90919b846040828f6001946118bc91516020809173ffffffffffffffffffffffffffffffffffffffff81511684520151910152565b019d0192910161180a565b6040513d6000823e3d90fd5b604051906060820182811067ffffffffffffffff8211176103c1576040526000604083606081528260208201520152565b9061190e826104de565b604061191c81519283610467565b8382527fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe061194a83956104de565b01906000805b83811061195e575050505050565b8251908382019180831067ffffffffffffffff8411176103c1576020928552838152828481830152828801015201611950565b7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff81146119be5760010190565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b604001906119fc825151611904565b916000805b82518051821015611a96579080611a41610905611a7d94611a25606094859261063b565b51015173ffffffffffffffffffffffffffffffffffffffff1690565b611a825750335b602080611a5684885161063b565b51015190611a6561093c6104c4565b820152611a72828861063b565b5261096b818761063b565b611a01565b611a9190611a2583875161063b565b611a48565b50505050565b6060815101516040820190815111611ae6576020905191015111611abc57565b60046040517f48fee69c000000000000000000000000000000000000000000000000000000008152fd5b60046040517f773a6187000000000000000000000000000000000000000000000000000000008152fdfea164736f6c6343000813000a";

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
    _permit2: PromiseOrValue<string>,
    _universalRouter: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<RelayOrderReactor> {
    return super.deploy(
      _permit2,
      _universalRouter,
      overrides || {}
    ) as Promise<RelayOrderReactor>;
  }
  override getDeployTransaction(
    _permit2: PromiseOrValue<string>,
    _universalRouter: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(
      _permit2,
      _universalRouter,
      overrides || {}
    );
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
