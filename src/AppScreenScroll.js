import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled from "styled-components";
//import {ScrollSection, ScrollContainer} as p from 'react-onepage-scroll'
//import * as p from "react-onepage-scroll";
import {ScrollSection, ScrollContainer} from 'react-onepage-scroll'

const truncate = (input, len) =>
  input.length > len ? `${input.substring(0, len)}...` : input;

export const StyledButton = styled.button`
  padding: 10px;
  border-radius: 50px;
  border: none;
  background-color: var(--secondary);
  padding: 10px;
  font-weight: bold;
  color: var(--secondary-text);
  width: 100px;
  cursor: pointer;
  box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const StyledRoundButton = styled.button`
  padding: 10px;
  border-radius: 100%;
  border: none;
  background-color: var(--primary);
  padding: 10px;
  font-weight: bold;
  font-size: 15px;
  color: var(--primary-text);
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const ResponsiveWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: stretched;
  align-items: stretched;
  width: 100%;
  @media (min-width: 767px) {
    flex-direction: row;
  }
`;

export const StyledLogo = styled.img`
  width: 1000px;
  flexWrap: 'wrap',
  @media (min-width: 767px) {
    width: 600px;
  }
  transition: width 0.5s;
  transition: height 0.5s;
`;

export const StyledImg = styled.img`
  box-shadow: 0px 5px 11px 2px rgba(0, 0, 0, 0.7);
  //border: 4px dashed var(--secondary);
  background-color: var(--accent);
  //border-radius: 100%;
  width: 200px;
  @media (min-width: 900px) {
    width: 250px;
  }
  @media (min-width: 1000px) {
    width: 300px;
  }
  transition: width 0.5s;
`;

export const StyledLink = styled.a`
  color: var(--accent-text);
  text-decoration: none;
`;

function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [claimingNft, setClaimingNft] = useState(false);
  const [feedback, setFeedback] = useState(`Click buy to mint your NFT.`);
  const [mintAmount, setMintAmount] = useState(1);
  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "",
    SCAN_LINK: "",
    NETWORK: {
      NAME: "",
      SYMBOL: "",
      ID: 0,
    },
    NFT_NAME: "",
    SYMBOL: "",
    MAX_SUPPLY: 1,
    WEI_COST: 0,
    DISPLAY_COST: 0,
    GAS_LIMIT: 0,
    MARKETPLACE: "",
    MARKETPLACE_LINK: "",
    SHOW_BACKGROUND: false,
  });

  const claimNFTs = () => {
    let cost = CONFIG.WEI_COST;
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(cost * mintAmount);
    let totalGasLimit = String(gasLimit * mintAmount);
    console.log("Cost: ", totalCostWei);
    console.log("Gas limit: ", totalGasLimit);
    setFeedback(`Minting your ${CONFIG.NFT_NAME}...`);
    setClaimingNft(true);
    blockchain.smartContract.methods
      .mint(mintAmount)
      .send({
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: totalCostWei,
      })
      .once("error", (err) => {
        console.log(err);
        setFeedback("Sorry, something went wrong please try again later.");
        setClaimingNft(false);
      })
      .then((receipt) => {
        console.log(receipt);
        setFeedback(
          `WOW, the ${CONFIG.NFT_NAME} is yours! go visit Opensea.io to view it.`
        );
        setClaimingNft(false);
        dispatch(fetchData(blockchain.account));
      });
  };

  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1;
    if (newMintAmount < 1) {
      newMintAmount = 1;
    }
    setMintAmount(newMintAmount);
  };

  const incrementMintAmount = () => {
    let newMintAmount = mintAmount + 1;
    if (newMintAmount > 10) {
      newMintAmount = 10;
    }
    setMintAmount(newMintAmount);
  };

  const getData = () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
    }
  };

  const getConfig = async () => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const config = await configResponse.json();
    SET_CONFIG(config);
  };

  useEffect(() => {
    getConfig();
  }, []);

  useEffect(() => {
    getData();
  }, [blockchain.account]);

  return (
    // <s.Screen>
      <ScrollContainer>
        {/* HOME PAGE SECTION */}
        <ScrollSection style={{backgroundImage: 'url(/bg0.png)',
                         backgroundRepeat: 'no-repeat' }} 
                         pageId={0}>
                         
          {/* <img style={{position: 'absolute', top: 0, right: 0, border: 0, zIndex: 999}} src="https://s3.amazonaws.com/github/ribbons/forkme_right_darkblue_121621.png" alt="Fork me on GitHub"/> */}
          {/* <ResponsiveWrapper flex={1} style={{ padding: 24 }} > */}
          <s.Container flex = {1} fd = "row" style={{ padding: 24 }}>
            <s.Container flex={1} ai={"flex-start"} jc={"flex-start"}>
              <StyledButton
              onClick={(e) => {
                e.preventDefault();
                window.open('https://twitter.com/PCAcards');
              }}
              >
                TWITTER
              </StyledButton>
            </s.Container>
            <s.SpacerSmall />
            {/* <s.Container flex={1} ai={"flex-start"} jc={"centre"}>
              <StyledLink target={"_BLANK"} href={""}>
                {"MINTING"}
              </StyledLink>
            </s.Container> */}
            
            <s.Container flex={1} ai={"flex-end"} jc={"flex-end"}>
              <StyledButton
                  onClick={(e) => {
                    e.preventDefault();
                    dispatch(connect());
                    getData();
                  }}
                >
                  CONNECT
              </StyledButton>
              <s.SpacerSmall />
              <s.TextDescription 
                style={{
                  textAlign: "c<s.SpacerLarge />enter",
                  color: "var(--accent-text)",
                }}
              >
                Connect to the {CONFIG.NETWORK.NAME} network
              </s.TextDescription>
            </s.Container>
          </s.Container>
          {/* </ResponsiveWrapper> */}



          <s.Container style={{backgroundImage: 'url(./config/images/ctrlogo.png', 
          paddingTop: 180, paddingBottom: 70, backgroundSize: '80%', backgroundRepeat: 'no-repeat'}} 
          flex={2} jc={"center"} ai={"center"} >
            <StyledImg alt={"slabs"} src={"/config/images/slabs.gif"} />
          </s.Container> 
          <s.Container flex={2} jc={"center"} ai={"center"}>
            <StyledLogo alt={"slabs"} src={"/config/images/presented2.png"} />
          </s.Container> 
          <s.SpacerSmall />
        </ScrollSection>

        {/* ABOUT SECTION */}
        <ScrollSection style={{backgroundImage: 'url(./bg1.png)',
                        backgroundRepeat: 'no-repeat'}}
                        pageId={1}>
          <s.Container flex={1} ai={"center"} jc={"center"}>
            <s.TextDescription 
              style={{
                fontSize: 48,
                textAlign: "center",
                color: "var(--accent-text)",
              }}
              >
                ABOUT
            </s.TextDescription>
            <s.SpacerLarge />
            <s.SpacerLarge />
            <s.TextDescription 
              style={{
                fontSize: 24,
                textAlign: "center",
                color: "var(--accent-text)",
              }}
              >
                PCA cards bring you their first graded collection - Rainbow!<br/><br/>

                Rainbow is a set of 10 cards each featuring one gorgeous colour of the Rainbow set againt a deep black background.  There is also an additional 11th bonus card for you to discover and collect!<br/><br/>

                Each card is completely unique and has been meticulously graded by the staff at PCA (Professional Crypto Authentication) using the 4 sub-grades of Corners, Centering, Surface and Edges.  Every card is packed into a PCA slab displaying the sub-grades, overall grade, card details, the PCA serial number and of course the stunning card itself.<br/><br/>

                Add this 11 card set to your NFT collection today and if that's not enough, hunt for each one in a perfect 10 GEM-MT grade!  Whatever you prefer, get ready to Chase the Rainbow!<br/><br/>
            
            
            </s.TextDescription>
          </s.Container>
        </ScrollSection>
 
        {/* MINT SECTION */}
        <ScrollSection style={{backgroundImage: 'url(./bg2.png)',
                        backgroundRepeat: 'no-repeat'}}
                        pageId={2}>
          <s.Container flex={1} ai={"center"} jc={"center"}>
            <s.TextDescription 
              style={{
                fontSize: 48,
                textAlign: "center",
                color: "var(--accent-text)",
              }}
              >
                MINTING
            </s.TextDescription>
            <s.SpacerLarge />
            <s.SpacerLarge />
            <s.TextDescription 
              style={{
                fontSize: 24,
                textAlign: "center",
                color: "var(--accent-text)",
              }}
              >
                Second Edition Mint Available Soon!
            </s.TextDescription>
          </s.Container>
        </ScrollSection>

        {/* ROADMAP SECTION */}
        <ScrollSection style={{backgroundImage: 'url(./bg3.png)',
                        backgroundRepeat: 'no-repeat'}}
                        pageId={3}>
          <s.Container flex={1} ai={"center"} jc={"center"}>
            <s.TextDescription 
              style={{
                fontSize: 48,
                textAlign: "center",
                color: "var(--accent-text)",
              }}
              >
                ROADMAP
            </s.TextDescription>
            <s.SpacerLarge />
            <s.SpacerLarge />
            <s.TextDescription 
              style={{
                fontSize: 24,
                textAlign: "center",
                color: "var(--accent-text)",
              }}
              >
                1. Current - First Edition minted and available to buy on OpenSea!<br/><br/>
                2. Near future - after the First Edition sells out, we'll grade another print of the RAINBOW Collection Cards.  These will be available to mint from this website.  Each Edition One card you hold will allow you to mint your own Second Edition card.<br/>
                Additionally there will be a pot of gold established as part of the Second Edition minting process with 5% of the cost of every card minted being poured in.  On top of this, 1ETH will be donated by PCA to kick-start the pot.  This prize can be claimed in two ways:<br/>
                 a) Collecting and owning all 10 base RAINBOW cards in GEM-MT (10) condition OR <br/>
                 b) Holding a GEM-MT (10) bonus card (11/10).  The owner to prove either condition wins the pot.<br/>
                Minting of the Second Edition will open to the general public after the First Edition holders have minted.<br/><br/>
                3. Not too distant future - Third Edition mint held with Second Edition holders on the minting whitelist before being opened to the general public.  The pot of gold will roll over and contiue to grow if unclaimed.  If claimed, 5% of sales will continue to pour into a new pot which can be claimed by meeting the second condition (whichever wasn't claimed).<br/><br/>
                4. Maybe sooner than we think - PCA will grade any series of cards.  If you're an NFT creator and want to discuss featuring your artwork on the next card series graded by PCA, reach out to us on Twitter to discuss partnership options!

            </s.TextDescription>
          </s.Container>
        </ScrollSection>
      </ScrollContainer>
    // </s.Screen>
  );
}

export default App;
