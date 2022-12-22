import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Tooltip from '@mui/material/Tooltip';
import { Tab  } from "@headlessui/react";
import { Accordion } from 'react-bootstrap-accordion'
import 'react-bootstrap-accordion/dist/index.css'

import { useHistory } from "react-router-dom";
import ModalRevender from "./modalRevender.component";
import TransferModal from "./transferModal.component"
import ApprovalModal from "./approvalModal.component"
import PriceModal from "./priceModal.component"
import load from "../assets/landingSlider/img/loader.gif";
import Pagination from '@mui/material/Pagination';
import { currencys } from "../utils/constraint";
import {
  getNearAccount,
  getNearContract,
} from "../utils/near_interaction";
import { ApolloClient, InMemoryCache, gql } from '@apollo/client'
import { useTranslation } from "react-i18next";
import InfiniteScroll from 'react-infinite-scroll-component';
import { useWalletSelector } from "../utils/walletSelector";
import { providers, utils } from "near-api-js";
import nearImage from '../assets/img/landing/trendingSection/Vector.png';
import { useLocation } from "react-router-dom";

function MyCollections(props) {
  //Hooks para el manejo de estados
  const [pagsale, setpagsale] = React.useState(0);
  const [pagCount, setpagCount] = React.useState("");
  const [chunksale, setchunksale] = React.useState(0);
  const { selector, modalWallet, accounts, accountId } = useWalletSelector();
  const [page, setpage] = React.useState(1);
  const [pageCreations, setpageCreations] = React.useState(1);
  const [pageCollections, setPageCollections] = React.useState(1);
  const [trigger, settrigger] = React.useState(true);
  const [ini, setini] = React.useState(true);
  const [firstID, setFirstID] = React.useState(-1);
  const [lastID, setLastID] = React.useState(-1);
  const [lastIDCollection, setLastIDCollection] = React.useState(-1);
  const [statePage, setStatePage] = React.useState(true)
  const [firstLoad, setFirstLoad] = React.useState(true)
  const [loadMsg, setLoadMsg] = React.useState(true)
  const [loadMsgCollections, setLoadMsgCollections] = React.useState(true);
  const [collections, setCollections] = React.useState(true)
  const [t, i18n] = useTranslation("global")
  const [nfts, setNfts] = useState({
    nfts: [],
    nftsCreations: [],
    collections: [],
    page: parseInt(window.localStorage.getItem("Mypage")),
    tokensPerPage: 3,
    tokensPerPageNear: 6,

    blockchain: localStorage.getItem("blockchain"),
    currency: currencys[parseInt(localStorage.getItem("blockchain"))],
  }); //state de los token nft
  const [modal, setModal] = useState({
    //state para la ventana modal
    show: false,
  });

  const [modalSub, setModalSub] = useState({
    //state para la ventana modal
    show: false,
  });

  const [transferModal, setTransferModal] = useState({
    show: false,
  });

  const [searchNftsModal, setSearchNftsModal] = useState({
    show: false,
  });

  const [approvalModal, setApprovalModal] = useState({
    show: false,
  });

  const [priceModal, setPriceModal] = useState({
    show: false,
  });
  const [allNfts, setAllNfts] = useState({nfts:[],contracts:[]});
  const [profile, setProfile] = useState({user:''});
  const location = useLocation();
  let imgs = [];

  const APIURL = process.env.REACT_APP_API_TG


 




  const [state, setState] = React.useState({
    items: Array.from({ length: 400 }),
    hasMore: true,
    hasMoreCreations: true,
    hasMoreCollections: true
  });

  function delay(n){
    return new Promise(function(resolve){
        setTimeout(resolve,n*1000);
    });
  }



  //Hook para el manejo de efectos
  useEffect(() => {
    (async () => {
      window.localStorage.setItem("Mypage", 0);



      if (nfts.blockchain == "0") {
        return
      } else {
        let contract = await getNearContract();
        let account = await getNearAccount();
        const query = new URLSearchParams(location);
        console.log('QUERY', query.get('pathname').split('/')[2] + (process.env.REACT_APP_NEAR_ENV == 'mainnet' ? '.near' : '.testnet'));//.pathname.split('/')[0]);
        setProfile({ user: query.get('pathname').split('/')[2] + (process.env.REACT_APP_NEAR_ENV == 'mainnet' ? '.near' : '.testnet')}); 


        let colData;
        let col;

        const queryData = `
        query($first: Int, $account: String){
          collections(first: $first,  orderBy: collectionID, orderDirection: desc, where: { owner_id: $account }){
            id
            collectionID
            owner_id
            title
            timestamp
            mediaIcon
            mediaBanner,
            description,
            tokenCount,
            visibility
          }
        }`

        //Declaramos el cliente
    const client = new ApolloClient({
      uri: APIURL,
      cache: new InMemoryCache(),
    })

    await client
      .query({
        query: gql(queryData),
        variables: {
          first: nfts.tokensPerPageNear,
          account: query.get('pathname').split('/')[2] + (process.env.REACT_APP_NEAR_ENV == 'mainnet' ? '.near' : '.testnet')
        },
      })
      .then((data) => {
        //console.log("tokens data: ", data.data.tokens)
        colData = data.data.collections
        console.log('then client',data.data.collections)
        if (data.data.collections.length <= 0) {
          setLoadMsgCollections(false)
        }
        setLastIDCollection(parseInt(data.data.collections[data.data.collections.length - 1].collectionID))
      })
      .catch((err) => {
        //console.log('Error ferching data: ', err)
        colData = 0
      })
      if(colData != 0 ) {
         col = colData.map((collection) => {
          console.log('dataCollection',collection);
          return {
            title: collection.title,
            owner: collection.owner_id,
            tokenCount: collection.tokenCount,
            description: collection.description,
            mediaIcon: collection.mediaIcon,
            mediaBanner: collection.mediaBanner,
            collectionID: collection.collectionID,
            visibility: collection.visibility
          };
        });
      }


        setNfts({
          ...nfts,
          owner: account,
          collections: nfts.collections.concat(col)
        });


      }


    })();
  }, []);


  let fetchMoreDataCollections = async () => {
    setPageCollections(pageCollections + 1);
    //instanciar contracto
    let contract = await getNearContract();
    let account = await getNearAccount();
    console.log('fetchMoreDataCollections');
    let colData;
    const queryData = `
          query($first: Int, $lastTokenID: Int, $account: String){
              collections(first: $first,  orderBy: collectionID, orderDirection: desc, where: {collectionID_lt: $lastTokenID, owner_id: $account}){
                id
                collectionID
                owner_id
                title
                timestamp
                mediaIcon
                mediaBanner,
                description,
                tokenCount,
                visibility
            }
          }
        `

    //Declaramos el cliente
    const client = new ApolloClient({
      uri: APIURL,
      cache: new InMemoryCache(),
    })

    console.log('nfts.tokensPerPage', nfts.tokensPerPage);
    console.log('lastIDCollection', lastIDCollection);
    console.log('profile.user', profile.user);

    await client
      .query({
        query: gql(queryData),
        variables: {
          first: nfts.tokensPerPage,
          lastTokenID: lastIDCollection,
          account: profile.user
        },
      })
      .then((data) => {
        colData = data.data.collections;
        if (data.data.collections.length <= nfts.tokensPerPage) {
          setState({...state, hasMore: false });
          setLastIDCollection(parseInt(data.data.collections[data.data.collections.length - 1].collectionID))
          return;
        }

        if (data.data.collections.length > nfts.tokensPerPage) {
          setState({...state, hasMore: true });
          setLastIDCollection(parseInt(data.data.collections[data.data.collections.length - 1].collectionID))
        }
       
        setpage(pageCollections + 1)
      })
      .catch((err) => {
        colData = 0
      })


      if(colData != 0 ) {
        let col = colData.map((collection) => {
          console.log('dataCollection',collection);
          return {
            title: collection.title,
            owner: collection.owner_id,
            tokenCount: collection.tokenCount,
            description: collection.description,
            mediaIcon: collection.mediaIcon,
            mediaBanner: collection.mediaBanner,
            collectionID: collection.collectionID,
            visibility: collection.visibility
          };
        });
    

        setNfts({
          ...nfts,
          collections: nfts.collections.concat(col)
        });

      }
      

  }

  

  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }

  return (
    <>
      <ul>
        {loadMsgCollections ?
          <li><InfiniteScroll
            dataLength={nfts.nfts.length}
            next={fetchMoreDataCollections}
            hasMore={state.hasMore}
            loader={<h1 className="text-center font-clash-grotesk font-semibold w-full py-10 text-xl text-black">{t("tokCollection.loading")}</h1>}
            endMessage={
              <p className="text-center font-clash-grotesk font-semibold w-full py-10 text-xl text-black">
                {t("Explore.endCol")}
              </p>
            }
          >
            <div className="flex flex-wrap px-6 lg:px-[46px] gap-4 lg:gap-[19px] justify-center">
              {nfts.collections.map((nft, key) => {
                //obtenemos la data del token nft
                //console.log(nft)
                const item = nft;
                return (
                  <>
                    <div className="w-full sm:w-[280px] md:w-[350px] lg:w-[455px] xl:w-[380px] 2xl:w-[440px]" key={key}>
                                            <a href={"/collection/" + item.collectionID}
                                            >
                                                <div className="flex flex-row justify-items-center w-full" key={key}>

                                                    <div className="rounded-xl shadow-lg bg-white hover:scale-105 w-full ">
                                                        <div className="  overflow-hidden rounded-t-md  bg-white ">

                                                            <img className="  h-[190px] object-cover object-center scale-150 w-full lg:h-[306px] " alt={item.description} src={`https://nativonft.mypinata.cloud/ipfs/${item.mediaBanner}`} />

                                                        </div>
                                                        <div className="flex flex-row  mb-4" name="card_detail">
                                                            <div className=" z-10 -mt-4 lg:-mt-8 ml-4        ">
                                                                <img className="  object-cover  rounded-md bg-white  border-2 border-white w-[90px] h-[90px] lg:w-[120px] lg:h-[120px] " src={`https://nativonft.mypinata.cloud/ipfs/${item.mediaIcon}`} alt={item.description} />
                                                            </div>

                                                            <div class="flex flex-col  mx-2 mt-2  ">
                                                                <p className="   w-[210px]  sm:w-[150px] md:w-[230px] lg:w-[305px] xl:w-[220px] 2xl:w-[280px] uppercase tracking-tighter text-black text-base font-open-sans font-extrabold collection-description h-[50px] justify-center items-center">{item.title}</p>
                                                                <p className="   w-[210px]  sm:w-[150px] md:w-[230px] lg:w-[305px] xl:w-[220px] 2xl:w-[280px] uppercase tracking-tighter text-xs text-left font-bold justify-center font-open-sans leading-4 text-black truncate">{t("Landing.popular_col-by") + " " + item.owner_id}</p>
                                                                <div className="   w-[210px]  sm:w-[150px] md:w-[230px] lg:w-[305px] xl:w-[220px] 2xl:w-[280px]   text-xs  text-black text-left justify-center font-normal font-open-sans truncate"><p className="w-full   text-xs text-black font-open-sans font-normal tracking-wide leading-4  text-left justify-center truncate uppercase"><b>{item.tokenCount > 999 ? "+" + item.tokenCount + "k " : item.tokenCount + " "}</b> {t("Landing.popular_col-tokens_on")}</p></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </a>
                                        </div>
                  </>

                );})}
            </div>
          </InfiniteScroll>
          </li>
          :
          <div className="container mx-auto flex  my- md:flex-row flex-col  justify-center h-96 items-center text-3xl ">
            <div className="flex flex-col justify-center">
              <h1 className="text-center dark:text-yellow2 font-raleway">{loadMsgCollections ? t("MyNFTs.load-1") : t("MyNFTs.load-2")}</h1>
            </div>
          </div>}

      </ul>

    </>
  );
}


export default MyCollections;
