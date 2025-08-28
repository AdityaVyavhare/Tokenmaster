import { useEffect, useState } from "react";
import { ethers } from "ethers";

// Components
import Navigation from "./components/Navigation";
import Sort from "./components/Sort";
import Card from "./components/Card";
import SeatChart from "./components/SeatChart";

// ABIs
import TokenMaster from "./abis/TokenMaster.json";

// Config
import config from "./config.json";

function App() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [tokenmaster, setTokenmaster] = useState(null);
  const [occasions, setOccasions] = useState([]);
  const [occasion, setOccasion] = useState({});

  const [toggle, setToggle] = useState(false);
  const loadblockchiaindata = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(provider);

    const network = await provider.getNetwork();

    const contract_address = config[network.chainId].TokenMaster.address;

    const tokenmaster = new ethers.Contract(
      contract_address,
      TokenMaster.abi,
      provider
    );
    console.log(tokenmaster);

    setTokenmaster(tokenmaster);

    const total = await tokenmaster.totalOccasions();
    console.log(total.toString());
    const occasions = [];
    for (let i = 1; i <= total; i++) {
      const occasion = await tokenmaster.getOccasion(i);
      occasions.push(occasion);
    }
    setOccasions(occasions);
    console.log(occasions);

    window.ethereum.on("accountsChanged", async () => {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const account = ethers.utils.getAddress(accounts[0]);
      setAccount(account);
    });
  };

  useEffect(() => {
    loadblockchiaindata();
  }, []);

  return (
    <div>
      <header>
        <Navigation account={account} setAccount={setAccount} />

        <h2 className="header__title">
          <strong>Event</strong> Tickets
        </h2>
      </header>
      <Sort />
      <div className="cards">
        {occasions.map((occasion, ind) => (
          <Card
            id={ind + 1}
            key={ind}
            provider={provider}
            setOccasion={setOccasion}
            TokenMaster={tokenmaster}
            toogle={toggle}
            setToggle={setToggle}
            account={account}
            occasion={occasion}
          />
        ))}
      </div>
      {toggle && (
        <SeatChart
          tokenMaster={tokenmaster}
          provider={provider}
          occasion={occasion}
          setToggle={setToggle}
        />
      )}
    </div>
  );
}

export default App;
