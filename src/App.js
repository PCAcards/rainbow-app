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
  width: 120px;
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
  width: 380px;
  @media (min-width: 767px) {
    width: 380px;
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

export const CoinImg = styled.img`
  //box-shadow: 0px 5px 11px 2px rgba(0, 0, 0, 0.7);
  //border: 4px dashed var(--secondary);
  //background-color: var(--accent);
  //border-radius: 100%;
  width: 30px;
  @media (min-width: 900px) {
    width: 60px;
  }
  transition: width 0.5s;
`;

export const StyledImgWide = styled.img`
  box-shadow: 0px 5px 11px 2px rgba(0, 0, 0, 0.7);
  //border: 4px dashed var(--secondary);
  background-color: var(--accent);
  //border-radius: 100%;
  width: 80%;
  @media (min-width: 900px) {
    width: 70%;
  }
  @media (min-width: 1000px) {
    width: 60%;
  }
  transition: width 0.5s;
`;

export const StyledLink = styled.a`
  color: var(--accent-text);
  text-decoration: underline;
  fontWeight: bolder;
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
    const configResponse = await fetch("/rainbow-app/config/config.json", {
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
    <s.Screen style={{ backgroundImage: 'url(/rainbow-app/bg000.png', overflowY:"scroll", backgroundSize: 'cover' }} >
    {/* HOME PAGE SECTION */}
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
            <font face="press" size="10px" >TWITTER</font>
          </StyledButton>
        </s.Container>
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
              <font face="press" size="10px" >CONNECT</font>
          </StyledButton>
          {/* <s.TextDescription 
            style={{
              textAlign: "right",
              color: "var(--accent-text)",
            }}
          >
            Connect to the {CONFIG.NETWORK.NAME} network
          </s.TextDescription> */}
        </s.Container>
      </s.Container>
      <s.SpacerSmall />
      <s.Container flex = {1} fd = "row" style={{ paddingTop: 0, paddingRight: 0  }}>
        <s.Container flex={1} ai={"flex-start"} jc={"flex-start"}>
        </s.Container>        
        <s.Container flex = {1} fd = "row" style={{ paddingTop: 0, paddingRight: 0  }}>
          <s.Container flex={1} ai={"flex-start"} jc={"flex-start"}>
            <StyledLink  href={"/rainbow-app/#ABOUT"}>
              {<font face="press" size="10px" >ABOUT</font>}
            </StyledLink>
          </s.Container>
          <s.SpacerSmall />
          <s.Container flex={1} ai={"center"} jc={"center"}>
            <StyledLink  href={"/rainbow-app/#MINTING"}>
            {<font face="press" size="10px" >MINTING</font>}
            </StyledLink>
          </s.Container>
          <s.SpacerSmall />
          <s.Container flex={1} ai={"flex-end"} jc={"flex-end"}>
          <StyledLink  href={"/rainbow-app/#ROADMAP"}>
          {<font face="press" size="10px" >ROADMAP</font>}
            </StyledLink>
          </s.Container>
        </s.Container>
        <s.Container flex={1} ai={"flex-start"} jc={"flex-start"}>
        </s.Container>     
      </s.Container> 
      <s.SpacerLarge />
      {/* </ResponsiveWrapper> */}



      {/* <s.Container style={{backgroundImage: 'url(./config/images/ctrlogo.png', 
      paddingTop: 0, paddingBottom: 60, backgroundSize: '90%', 
      backgroundRepeat: 'no-repeat', backgroundPosition: 'top, center'}} 
      flex={2} jc={"center"} ai={"center"} >  */}
      <s.Container flex={2} jc={"center"} ai={"center"} > 
        <s.TextTitle 
            style={{textAlign: "center", color: "var(--accent-text)",fontFamily: "press"}}>
            CHASE THE RAINBOW!
        </s.TextTitle>
        {/* {<font face="press" size="500">CHASE THE RAINBOW!</font>} */}
        <s.SpacerSmall />
        <StyledImg alt={"slabs"} src={"/rainbow-app/config/images/slabs.gif"} />
        <s.SpacerLarge />

        <s.Container fd={"row"} jc={"center"} ai={"center"}>
          <CoinImg alt={"Coin"} src={"/rainbow-app/config/images/coin.png"} />
          <s.TextDescription style={{textAlign: "center", 
          color: "var(--accent-text)",fontFamily: "press"}}>
            Proudly presented by Professional Crypto Authentication
          </s.TextDescription> 
          <CoinImg alt={"Coin"} src={"/rainbow-app/config/images/coin.png"}/>
        </s.Container>
        <s.SpacerLarge />
        <s.SpacerLarge />
      </s.Container> 
      <s.SpacerLarge />
      <s.SpacerLarge />
    {/* ABOUT SECTION */}
    <a id="ABOUT"></a>
      <s.Container ai={"center"} jc={"center"}>
        <s.TextTitle style={{textAlign: "center", 
        color: "var(--accent-text)",fontFamily: "press"}}>
            ABOUT
        </s.TextTitle>
      </s.Container>
      <s.SpacerSmall />
      <s.Container fd={"row"} ai={"center"} jc={"center"}>
        <CoinImg alt={"Coin"} src={"/rainbow-app/config/images/coin.png"}/>
        <s.TextDescription style={{fontFamily: 'press', textAlign: "center",
          color: "var(--accent-text)", paddingLeft: 5}}>
            PCA cards bring you their first graded collection - Rainbow!
        </s.TextDescription>
        <CoinImg alt={"Coin"} src={"/rainbow-app/config/images/coin.png"}/>
      </s.Container>
      <s.Container ai={"center"} jc={"center"}>
        <s.SpacerSmall />
        <StyledImgWide alt={"all10"} src={"/rainbow-app/config/images/all10.png"} />
      </s.Container>
      <s.SpacerLarge />
      <s.Container fd={"row"} ai={"flex-start"} jc={"flex-start"}>
        <CoinImg alt={"Coin"} src={"/rainbow-app/config/images/coin.png"}/>
        <s.TextDescription style={{fontFamily: 'press', textAlign: "left",
          color: "var(--accent-text)", paddingLeft: 5, paddingTop: 10, paddingRight: 20}}>
            Rainbow is a set of 10 cards each featuring one gorgeous colour of the 
            rainbow set againt a deep black background.  There is also an additional 
            11th bonus card for you to discover and collect!
        </s.TextDescription>
      </s.Container>
      <s.SpacerSmall />
      <s.Container ai={"center"} jc={"center"}>
        <StyledImg alt={"mystery"} src={"/rainbow-app/config/images/mystery.png"} />
      </s.Container>
      <s.SpacerSmall />
      <s.Container fd={"row"} ai={"flex-start"} jc={"flex-start"}>
        <CoinImg alt={"Coin"} src={"/rainbow-app/config/images/coin.png"}/>
        <s.TextDescription style={{fontFamily: 'press', textAlign: "left",
          color: "var(--accent-text)", paddingLeft: 5, paddingTop: 10, paddingRight: 20}}>
          Each card is completely unique and has been meticulously graded by the 
          staff at PCA (Professional Crypto Authentication) using the 4 sub-grades 
          of Corners, Centering, Surface and Edges.  Every card is packed into a 
          PCA slab displaying the sub-grades, overall grade, card details, the PCA 
          serial number and of course the stunning card itself.
        </s.TextDescription>
        <s.SpacerSmall />
      </s.Container>
      <s.SpacerSmall />
      <s.Container fd={"row"} ai={"flex-start"} jc={"flex-start"}>
        <CoinImg alt={"Coin"} src={"/rainbow-app/config/images/coin.png"}/>
        <s.TextDescription style={{fontFamily: 'press', textAlign: "left",
          color: "var(--accent-text)", paddingLeft: 5, paddingTop: 10, paddingRight: 20}}>
          Add this 11 card set to your NFT collection today and if that's not 
          enough, hunt for each one in a perfect 10 GEM-MT grade!  Whatever you 
          prefer, get ready to Chase the Rainbow!
        </s.TextDescription>
        <s.SpacerSmall />
      </s.Container>
      <s.SpacerLarge />
      <s.SpacerLarge />


    {/* MINT SECTION */}
    <a id="MINTING"></a>
      <s.Container flex={1} ai={"center"} jc={"center"}>
        <s.TextTitle 
          style={{textAlign: "center", color: "var(--accent-text)",fontFamily: "press"}}>
            MINTING
        </s.TextTitle>
      </s.Container>
      <s.SpacerLarge />
      <s.SpacerLarge />

      <s.Container fd={"row"} ai={"center"} jc={"center"}>
        <CoinImg alt={"Coin"} src={"/rainbow-app/config/images/coin.png"}/>
        <s.TextDescription style={{fontFamily: 'press', textAlign: "center",
          color: "var(--accent-text)", paddingLeft: 5}}>
            First Edition minted and available on OpenSea!
        </s.TextDescription>
        <CoinImg alt={"Coin"} src={"/rainbow-app/config/images/coin.png"}/>
      </s.Container>
      <s.SpacerSmall />

      <s.Container fd={"row"} ai={"center"} jc={"center"}>
        <StyledButton
          onClick={(e) => {
            e.preventDefault();
            window.open('https://opensea.io/collection/pcacards-rainbow');}}>
            <font face="press" size="10px" >OpenSea</font>
        </StyledButton>
      </s.Container>
      <s.SpacerLarge />
      <s.SpacerLarge />

      <s.Container fd={"row"} ai={"center"} jc={"center"}>
        <CoinImg alt={"Coin"} src={"/rainbow-app/config/images/coin.png"}/>
        <s.TextDescription style={{fontFamily: 'press', textAlign: "center",
          color: "var(--accent-text)", paddingLeft: 5}}>
            Second Edition Mint Available Soon!<br></br> 
        </s.TextDescription>
        <CoinImg alt={"Coin"} src={"/rainbow-app/config/images/coin.png"}/>
      </s.Container>
      <s.SpacerSmall />
      <s.Container fd={"row"} ai={"center"} jc={"center"}>
        <CoinImg alt={"Coin"} src={"/rainbow-app/config/images/coin.png"}/>
        <s.TextDescription style={{fontFamily: 'press', textAlign: "center",
          color: "var(--accent-text)", paddingLeft: 5}}>
            First edition card holders automatically qualify for the whitelist.
        </s.TextDescription>
        <CoinImg alt={"Coin"} src={"/rainbow-app/config/images/coin.png"}/>
      </s.Container>
      <s.Container ai={"center"} jc={"center"}>
        <img alt={"rainbow3"} src={"/rainbow-app/config/images/rainbow3.png"} width = "60%" />
      </s.Container>

    {/* ROADMAP SECTION */}
    <a id="ROADMAP"></a>
      <s.Container flex={1} ai={"center"} jc={"center"}>
        <s.TextTitle 
          style={{textAlign: "center", color: "var(--accent-text)",fontFamily: "press"}}>
            ROADMAP
        </s.TextTitle>
      </s.Container>
      <s.SpacerLarge />
      <s.SpacerLarge />

      <s.Container fd={"row"} ai={"center"} jc={"flex-start"}>
        <CoinImg alt={"Coin"} src={"/rainbow-app/config/images/coin.png"}/>
        <s.TextTitle 
          style={{textAlign: "left", color: "var(--accent-text)",
          fontFamily: "press", fontSize: "20px", paddingRight: 20, paddingLeft: 15}}>
            1. Current
        </s.TextTitle>
      </s.Container>
      <s.Container fd={"row"} ai={"center"} jc={"flex-start"}>
        <s.TextDescription style={{fontFamily: 'press', textAlign: "left",
          color: "var(--accent-text)", paddingLeft: 38, paddingTop: 0, paddingRight: 20}}>
          First Edition minted and available to buy on OpenSea!
        </s.TextDescription>
      </s.Container>
      <s.SpacerSmall />

      <s.Container fd={"row"} ai={"center"} jc={"flex-start"}>
        <CoinImg alt={"Coin"} src={"/rainbow-app/config/images/coin.png"}/>
        <s.TextTitle 
          style={{textAlign: "left", color: "var(--accent-text)",
          fontFamily: "press", fontSize: "20px", paddingRight: 20, paddingLeft: 15}}>
            2. Near Future
        </s.TextTitle>
      </s.Container>
      <s.Container fd={"row"} ai={"center"} jc={"flex-start"}>
        <s.TextDescription style={{fontFamily: 'press', textAlign: "left",
          color: "var(--accent-text)", paddingLeft: 38, paddingTop: 0, paddingRight: 20}}>
          After the First Edition is sold out, PCA will grade 
          another print of the RAINBOW Collection Cards.  These will be available 
          to mint from this website.  Each Edition One card you hold will allow 
          you to mint your own Second Edition card (whitelist).<br/><br/>
          Additionally there will be a pot of gold established as part of the 
          Second Edition minting process with 5% from every mint 
          being poured in.  On top of this, 1ETH will be donated by PCA to 
          kick-start the pot.  This prize can be claimed in two ways:<br/>
              a) Collecting and owning all 10 base RAINBOW cards in GEM-MT (10) 
              condition OR <br/>
              b) Holding a GEM-MT (10) bonus card (11/10). <br/><br/>
            Minting of the Second Edition will open to the general public after 
            the First Edition holders have minted.<br/><br/>
        </s.TextDescription>
      </s.Container>
      <s.SpacerSmall />

      <s.Container fd={"row"} ai={"flex-start"} jc={"flex-start"}>
        <CoinImg alt={"Coin"} src={"/rainbow-app/config/images/coin.png"}/>
        <s.TextTitle 
          style={{textAlign: "left", color: "var(--accent-text)",
          fontFamily: "press", fontSize: "20px", paddingRight: 20, paddingLeft: 15}}>
            3. Not Too Distant Future
        </s.TextTitle>
      </s.Container>
      <s.Container fd={"row"} ai={"flex-start"} jc={"flex-start"}>
        <s.TextDescription style={{fontFamily: 'press', textAlign: "left",
          color: "var(--accent-text)", paddingLeft: 38, paddingTop: 0, paddingRight: 20}}>
          Third Edition mint to be held with Second Edition holders on the 
          whitelist before being opened to the general public.  The pot of 
          gold will roll over and contiue to grow if unclaimed.  If claimed, 
          5% of sales will continue to pour into a second pot which can be claimed 
          by meeting the second condition which wasn't claimed.<br/><br/>
        </s.TextDescription>
      </s.Container>
      <s.SpacerSmall />

      <s.Container fd={"row"} ai={"flex-start"} jc={"flex-start"}>
        <CoinImg alt={"Coin"} src={"/rainbow-app/config/images/coin.png"}/>
        <s.TextTitle 
          style={{textAlign: "left", color: "var(--accent-text)",
          fontFamily: "press", fontSize: "20px", paddingRight: 20, paddingLeft: 15}}>
            4. Maybe sooner than we think!
        </s.TextTitle>
      </s.Container>
      <s.Container fd={"row"} ai={"flex-start"} jc={"flex-start"}>
        <s.TextDescription style={{fontFamily: 'press', textAlign: "left",
          color: "var(--accent-text)", paddingLeft: 38, paddingTop: 0, paddingRight: 20}}>
          PCA will grade any series of cards.  If you're an NFT creator and 
          want to discuss featuring your artwork on the next card series graded 
          by PCA, reach out to us on Twitter to discuss partnership options! 
          Link at the top of page.
        </s.TextDescription>
      </s.Container>
      <s.SpacerSmall />
      <s.SpacerLarge/>
      <s.SpacerLarge/>
      <s.SpacerLarge/>
      <s.Container fd={"row"} ai={"center"} jc={"center"}>
        <CoinImg alt={"Coin"} src={"/rainbow-app/config/images/coin.png"}/>
        <p>&copy;</p>
        <s.TextDescription style={{fontFamily: 'press', textAlign: "center",
          color: "var(--accent-text)", paddingLeft: 5}}>
            Copyright 2022, PCA Cards
        </s.TextDescription>
        <CoinImg alt={"Coin"} src={"/rainbow-app/config/images/coin.png"}/>
      </s.Container>
    </s.Screen>
  );
}

export default App;
