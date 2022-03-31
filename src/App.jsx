import { useAddress, useMetamask, useEditionDrop, useToken, useVote, useNetwork } from '@thirdweb-dev/react';
import { useState, useEffect, useMemo } from 'react';
import { ChainId } from '@thirdweb-dev/sdk'
import Main from './Main';

const App = () => {
  // NFT membership address
  const editionDrop = useEditionDrop("0x973047353BCa0FcE8a6c75B7dfdC32C6eCAEF9D3");
  // Governance token address
  const token = useToken("0x912cef8d599dEEF2c255F1461286e53593dfA995")
  // Voting address
  const vote = useVote("0x7BcF6f1Fdf942b39aC043362808f4157862c89e3");
  const [hasClaimedNFT, setHasClaimedNFT] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [memberTokenAmounts, setMemberTokenAmounts] = useState([]);
  const [memberAddresses, setMemberAddresses] = useState([]);
  const [proposals, setProposals] = useState([]);
  const address = useAddress();
  const connectWithMetamask = useMetamask();
  const network = useNetwork();

  useEffect(() => {
    if (!address) return

    const checkBalance = async () => {
      try {
        const balance = await editionDrop.balanceOf(address, 0);
        if (balance.gt(0)) {
          setHasClaimedNFT(true);
          console.log("🌟 this user has a membership NFT!");
        } else {
          setHasClaimedNFT(false);
          console.log("😭 this user doesn't have a membership NFT.");
        }
      } catch (error) {
        setHasClaimedNFT(false);
        console.error("Failed to get balance", error);
      }
    };
    checkBalance();
  }, [address, editionDrop]);

  useEffect(() => {
    if (!hasClaimedNFT) return;

    const getAllAddresses = async () => {
      try {
        const memberAddresses = await editionDrop.history.getAllClaimerAddresses(0);
        setMemberAddresses(memberAddresses);
      } catch (error) {
        console.error("failed to get member list", error);
      }
    };

    const getAllBalances = async () => {
      try {
        const amounts = await token.history.getAllHolderBalances();
        setMemberTokenAmounts(amounts);
      } catch (error) {
        console.error("failed to get member balances", error);
      }
    };

    const getAllProposals = async () => {
      try {
        const proposals = await vote.getAll();
        setProposals(proposals);
      } catch (error) {
        console.log("failed to get proposals", error);
      }
    };

    getAllProposals();
    getAllAddresses();
    getAllBalances();
  }, [hasClaimedNFT, editionDrop.history, token.history, vote]);

  const memberList = useMemo(() => {
    return memberAddresses.map((address) => {
      const member = memberTokenAmounts?.find(({ holder }) => holder === address);

      return { address, tokenAmount: member?.balance.displayValue || "0" }
    });
  }, [memberAddresses, memberTokenAmounts]);

  const mintNft = async () => {
    try {
      setIsClaiming(true);
      await editionDrop.claim("0", 1);
      console.log(`🌊 Successfully Minted! Check it out on OpenSea: https://testnets.opensea.io/assets/${editionDrop.getAddress()}/0`);
      setHasClaimedNFT(true);
    } catch (error) {
      setHasClaimedNFT(false);
      console.error("Failed to mint NFT", error);
    } finally {
      setIsClaiming(false);
    }
  };

  if (!address) {
    return (
      <div className="landing">
        <h1>Welcome to MuayThaiDAO</h1>
        <button onClick={connectWithMetamask} className="btn-hero">
          Connect your wallet
        </button>
      </div>
    );
  }

  if (network?.[0].data.chain.id !== ChainId.Rinkeby) {
    return (
      <div className="unsupported-network">
        <h2>Please connect to Rinkeby</h2>
        <p>
          This dapp only works on the Rinkeby network, please switch networks in your connected wallet.
        </p>
      </div>
    );
  }

  if (hasClaimedNFT) {
    return <Main memberList={memberList} proposals={proposals} vote={vote} hasClaimedNFT={hasClaimedNFT} address={address} token={token} />
  };

  return (
    <div className="mint-nft">
      <h1>Mint your free Muay Thai 🍪DAO Membership NFT</h1>
      <button
        disabled={isClaiming}
        onClick={mintNft}
      >
        {isClaiming ? "Minting..." : "Mint your nft (FREE)"}
      </button>
    </div>
  );
}

export default App;