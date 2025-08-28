const { expect } = require("chai");

const NAME = "TokenMaster";
const SYMBOL = "TMK";

const OCCASION_NAME = "ETH Texas";
const OCCASION_COST = ethers.utils.parseUnits("1", "ether");
const OCCASION_TICKETS = 100;
const OCCASION_MAX_TICKETS = 100;
const OCCASION_DATE = "Apr 27";
const OCCASION_TIME = "10:00AM CST";
const OCCASION_LOCATION = "Austin, Texas";

describe("TokenMaster", () => {
  let TokenMaster, tokenmaster;
  let deployer, buyer;
  beforeEach(async () => {
    [deployer, buyer] = await ethers.getSigners();
    TokenMaster = await ethers.getContractFactory(NAME);
    tokenmaster = await TokenMaster.deploy(NAME, SYMBOL);

    const trasaction = await tokenmaster
      .connect(deployer)
      .list(
        OCCASION_NAME,
        OCCASION_COST,
        OCCASION_TICKETS,
        OCCASION_MAX_TICKETS,
        OCCASION_DATE,
        OCCASION_TIME,
        OCCASION_LOCATION
      );
    await trasaction.wait();
  });
  describe("Deployment", () => {
    it("set the name", async () => {
      expect(await tokenmaster.name()).to.be.equal(NAME);
    });
    it("set the symbol", async () => {
      expect(await tokenmaster.symbol()).to.be.equal(SYMBOL);
    });
    it("set the owner", async () => {
      expect(await tokenmaster.owner()).to.be.equal(deployer.address);
    });
  });
  describe("Occasion", () => {
    it("Returns occasions attributes", async () => {
      const occasion = await tokenmaster.getOccasion(1);
      expect(occasion.id).to.be.equal(1);
      expect(occasion.name).to.be.equal(OCCASION_NAME);
      expect(occasion.cost).to.be.equal(OCCASION_COST);
      expect(occasion.tickets).to.be.equal(OCCASION_MAX_TICKETS);
      expect(occasion.date).to.be.equal(OCCASION_DATE);
      expect(occasion.time).to.be.equal(OCCASION_TIME);
      expect(occasion.location).to.be.equal(OCCASION_LOCATION);
    });
    it("Updates Occasions count", async () => {
      expect(await tokenmaster.totalOccasions()).to.be.equal(1);
    });
  });
  describe("Minting", () => {
    const ID = 1;
    const SEAT = 50;
    const AMOUNT = ethers.utils.parseUnits("1", "ether");

    beforeEach(async () => {
      const transaction = await tokenmaster
        .connect(buyer)
        .mint(ID, SEAT, { value: AMOUNT });
      await transaction.wait();
    });

    it("updates ticket count", async () => {
      const occasion = await tokenmaster.getOccasion(ID);
      expect(occasion.tickets).to.equal(OCCASION_MAX_TICKETS - 1);
    });

    it("updates buying status", async () => {
      const hasBought = await tokenmaster.hasBought(ID, buyer.address);
      expect(hasBought).to.equal(true);
    });
    it("updates seat status", async () => {
      const owner = await tokenmaster.seatTaken(ID, SEAT);
      expect(owner).to.equal(buyer.address);
    });
    it("updates overall seating status", async () => {
      const seats = await tokenmaster.getSeatsTaken(ID);
      expect(seats.length).to.be.equal(1);
      expect(seats[0]).to.be.equal(SEAT);
    });
    it("updates the contract balance", async () => {
      const balance = await ethers.provider.getBalance(tokenmaster.address);
      expect(balance).to.be.equal(AMOUNT);
    });
  });
});
