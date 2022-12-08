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
  const [loadMsgCreations, setLoadMsgCreations] = React.useState(true)
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

  const fetchMoreData = async () => {
    await delay(.75)
    setpage(page + 1);

    let paramsSupplyForOwner = {
      account_id: accountId
    };
    // let totalTokensByOwner = await contract.nft_supply_for_owner(paramsSupplyForOwner);
    const supply_payload = btoa(JSON.stringify(paramsSupplyForOwner))
    const { network } = selector.options;
    const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });
    const res_supply = await provider.query({
      request_type: "call_function",
      account_id: process.env.REACT_APP_CONTRACT,
      method_name: "nft_supply_for_owner",
      args_base64: supply_payload,
      finality: "optimistic",
    })
    let totalTokensByOwner = JSON.parse(Buffer.from(res_supply.result).toString())
    if (nfts.nfts.length >= totalTokensByOwner) {
      setState({...state, hasMore: false });
      return;
    }
    let payload = {
      account_id: accountId,
      from_index: (page * 3).toString(),
      limit: nfts.tokensPerPage,
    };
    // let nftsPerOwnerArr = await contract.nft_tokens_for_owner(payload);
    const nft_payload = btoa(JSON.stringify(payload))
    const res_nft = await provider.query({
      request_type: "call_function",
      account_id: process.env.REACT_APP_CONTRACT,
      method_name: "nft_tokens_for_owner",
      args_base64: nft_payload,
      finality: "optimistic",
    })
    let nftsPerOwnerArr = JSON.parse(Buffer.from(res_nft.result).toString())
    // //convertir los datos al formato esperado por la vista
    let nftsArr = nftsPerOwnerArr.map((tok, i) => {
      let onSale = false
      imgs.push(false);
      let data = Object.entries(tok.approved_account_ids)
      data.map((approval, i) => {
        if (approval.includes(process.env.REACT_APP_CONTRACT_MARKET)) {
          onSale = true
          console.log("Esta a la venta en nativo")
        }
      })
      fetch("https://nativonft.mypinata.cloud/ipfs/" + tok.media).then(request => request.blob()).then(() => {

        imgs[i] = true;
      });
      return {
        tokenID: tok.token_id,
        approval: tok.approved_account_ids,
        onSale: onSale,
        description: tok.metadata.description,
        // onSale: tok.on_sale,// tok.metadata.on_sale,
        // onAuction: tok.on_auction,
        data: JSON.stringify({
          title: tok.metadata.title,//"2sdfeds",// tok.metadata.title,
          image: tok.metadata.media,//"vvvvvvvvvvvvvv",//tok.metadata.media,
          description: tok.metadata.description,
          creator: tok.creator_id
        }),
      };
    });
    let newValue = nfts.nfts.concat(nftsArr);
    setNfts({...nfts, nfts: newValue });
  };







  //Hook para el manejo de efectos
  useEffect(() => {
    (async () => {
      window.localStorage.setItem("Mypage", 0);



      if (nfts.blockchain == "0") {
        return
      } else {
        let contract = await getNearContract();
        let account = await getNearAccount();


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
          account: accountId
        },
      })
      .then((data) => {
        //console.log("tokens data: ", data.data.tokens)
        colData = data.data.collections
        console.log(data.data.collections)
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
          owner: accountId,
          collections: nfts.collections.concat(col)
        });


      }


    })();
  }, []);




  

  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }

  return (
    <>
      <ul>
        {loadMsg ?
          <li><InfiniteScroll
            dataLength={nfts.nfts.length}
            next={fetchMoreData}
            hasMore={state.hasMore}
            loader={<h4 className="dark:text-yellow2 font-raleway">{t("MyNFTs.loading")}</h4>}
            endMessage={
              <p style={{ textAlign: "center" }} className="dark:text-yellow2 font-raleway">
                <b>{t("MyNFTs.youseenit")}</b>
              </p>
            }
          >
            <div className="flex flex-wrap md:m-1 mb-6">
              {nfts.collections.map((nft, key) => {
                //obtenemos la data del token nft
                //console.log(nft)
                const item = nft;
                console.log('Colections',nft);
                return (
                  <>
                    <a
                      href={"/detail/" + item.id}
                    >
                      <div className="flex flex-row  mb-10 md:mb-0  justify-center " key={key}>
                        <div className="trending-token w-64 md:w-[300px] rounded-20 shadow-lg   hover:scale-105 ">
                          <div className=" bg-white rounded-xl">
                            <div className="pb-3">
                              <img
                                className="object-cover object-center rounded-t-xl h-48 md:h-56 w-full "
                                src={`https://nativonft.mypinata.cloud/ipfs/${item.mediaIcon}`}
                                alt={item.description}
                              />
                            </div>
                            <div className="px-3 py-1">
                              <div className=" text-black text-base leading-6 text-ellipsis overflow-hidden whitespace-nowrap  font-open-sans font-extrabold uppercase">{item.title}</div>
                            {/* <div className="flex justify-start">
                              <div className=" text-base font-open-sans font-semibold py-2 text-yellow4 flex">  <img
                                className="w-[16px] h-[16px] my-auto mr-2"
                                src={nearImage}
                                alt={item.description}
                                width={15}
                                height={15}
                              /> { item.onSale == true ?  `Quitar de la venta` : "Poner a la venta"}</div>
                            </div> */}
                            </div> 
                            <div className="text-black px-3 font-open-sans text-xs font-semibold leading-4 uppercase mx-auto justify-center text-ellipsis overflow-hidden py-3">                                  
                             {t("tokCollection.createdBy") +":"} <a href={`profile/${item.creator ? item.creator.split('.')[0] : ""}`} className=" text-ellipsis overflow-hidden">{item.creator}</a></div>
                          </div>
                        </div>
                      </div>
                    </a>
                  </>

                );})}
            </div>
          </InfiniteScroll>
          </li>
          :
          <div className="container mx-auto flex  my- md:flex-row flex-col  justify-center h-96 items-center text-3xl ">
            <div className="flex flex-col justify-center">
              <h1 className="text-center dark:text-yellow2 font-raleway">{loadMsg ? t("MyNFTs.load-1") : t("MyNFTs.load-2")}</h1>
            </div>
          </div>}

      </ul>

    </>
  );
}


export default MyCollections;
