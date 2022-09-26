import { AddressZero } from "@ethersproject/constants";
import { Web3Provider } from "@ethersproject/providers";
import { expect } from "chai";
import { BigNumber, Contract, Wallet } from "ethers";
import { getAddress, keccak256, solidityPack } from "ethers/lib/utils";
import { waffle } from "hardhat";
import UniswapV2Factory from "./../build/contracts/uniswapv2/UniswapV2Factory.sol/UniswapV2Factory.json";
import UniswapV2Pair from "./../build/contracts/uniswapv2/UniswapV2Pair.sol/UniswapV2Pair.json";
const { deployContract } = waffle;

const TEST_ADDRESSES: [string, string] = [
  "0x1000000000000000000000000000000000000000",
  "0x2000000000000000000000000000000000000000",
];

describe("UniswapV2Factory", () => {
  const provider = waffle.provider;
  const [wallet, other] = provider.getWallets();

  const loadFixture = waffle.createFixtureLoader([wallet, other], provider);

  let factory: Contract;

  beforeEach(async () => {
    const fixture = await loadFixture(factoryFixture);
    factory = fixture.factory;
  });

  it("feeTo, feeToSetter, allPairsLength", async () => {
    expect(await factory.feeTo()).to.eq(AddressZero);
    expect(await factory.feeToSetter()).to.eq(wallet.address);
    expect(await factory.allPairsLength()).to.eq(0);
  });

  async function createPair(tokens: [string, string]) {
    const bytecode = `${UniswapV2Pair.bytecode}`;
    const create2Address = getCreate2Address(factory.address, tokens, bytecode);
    await expect(factory.createPair(...tokens))
      .to.emit(factory, "PairCreated")
      .withArgs(
        TEST_ADDRESSES[0],
        TEST_ADDRESSES[1],
        create2Address,
        BigNumber.from(1)
      );

    await expect(factory.createPair(...tokens)).to.be.reverted; // UniswapV2: PAIR_EXISTS
    await expect(factory.createPair(...tokens.slice().reverse())).to.be
      .reverted; // UniswapV2: PAIR_EXISTS
    expect(await factory.getPair(...tokens)).to.eq(create2Address);
    expect(await factory.getPair(...tokens.slice().reverse())).to.eq(
      create2Address
    );
    expect(await factory.allPairs(0)).to.eq(create2Address);
    expect(await factory.allPairsLength()).to.eq(1);

    const pair = new Contract(
      create2Address,
      JSON.stringify(UniswapV2Pair.abi),
      provider
    );
    expect(await pair.factory()).to.eq(factory.address);
    expect(await pair.token0()).to.eq(TEST_ADDRESSES[0]);
    expect(await pair.token1()).to.eq(TEST_ADDRESSES[1]);
  }

  it("createPair", async () => {
    await createPair(TEST_ADDRESSES);
  });

  it("createPair:reverse", async () => {
    await createPair(TEST_ADDRESSES.slice().reverse() as [string, string]);
  });

  it("createPair:gas", async () => {
    const tx = await factory.createPair(...TEST_ADDRESSES);
    const receipt = await tx.wait();
    expect(receipt.gasUsed).to.eq(2600198);
  });

  it("setFeeTo", async () => {
    await expect(
      factory.connect(other).setFeeTo(other.address)
    ).to.be.revertedWith("UniswapV2: FORBIDDEN");
    await factory.setFeeTo(wallet.address);
    expect(await factory.feeTo()).to.eq(wallet.address);
  });

  it("setFeeToSetter", async () => {
    await expect(
      factory.connect(other).setFeeToSetter(other.address)
    ).to.be.revertedWith("UniswapV2: FORBIDDEN");
    await factory.setFeeToSetter(other.address);
    expect(await factory.feeToSetter()).to.eq(other.address);
    await expect(factory.setFeeToSetter(wallet.address)).to.be.revertedWith(
      "UniswapV2: FORBIDDEN"
    );
  });
});

interface FactoryFixture {
  factory: Contract;
}

const overrides = {
  gasLimit: 9999999,
};

export async function factoryFixture( [wallet]: Wallet[], _: Web3Provider): Promise<FactoryFixture> {
  const factory = await deployContract(
    wallet,
    UniswapV2Factory,
    [wallet.address],
    overrides
  );
  return { factory };
}

export function getCreate2Address(
  factoryAddress: string,
  [tokenA, tokenB]: [string, string],
  bytecode: string
): string {
  const [token0, token1] =
    tokenA < tokenB ? [tokenA, tokenB] : [tokenB, tokenA];
  const create2Inputs = [
    "0xff",
    factoryAddress,
    keccak256(solidityPack(["address", "address"], [token0, token1])),
    keccak256(bytecode),
  ];
  const sanitizedInputs = `0x${create2Inputs.map((i) => i.slice(2)).join("")}`;
  return getAddress(`0x${keccak256(sanitizedInputs).slice(-40)}`);
}
