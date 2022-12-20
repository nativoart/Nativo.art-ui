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
  fromYoctoToNear,
  fromNearToYocto,
  ext_call,
  getNFTContractsByAccount,
  getNFTByContract
} from "../utils/near_interaction";
import Swal from 'sweetalert2';
import { ApolloClient, InMemoryCache, gql } from '@apollo/client'
import { useTranslation } from "react-i18next";
import InfiniteScroll from 'react-infinite-scroll-component';
import SearchNftsModal from "./searchNftsModal.component";
import { useWalletSelector } from "../utils/walletSelector";
import { providers, utils } from "near-api-js";
import nearImage from '../assets/img/landing/trendingSection/Vector.png';
import { useLocation } from "react-router-dom";

function MyCreations(props) {
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
    tokensPerPage: 6,
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

  const APIURL = process.env.REACT_APP_API_TG;
  const [profile, setProfile] = useState({user:''});
  const location = useLocation();

  async function makeATransfer(tokenID) {
    setTransferModal({
      ...state,
      show: true,
      title: t("MyNFTs.modalTransTitle"),
      message: t("MyNFTs.modalTransMsg"),
      loading: false,
      disabled: false,
      tokenID: tokenID,
      change: setTransferModal,
      buttonName: 'X',
      tokenId: 'hardcoded'
    })
  }

  async function makeAApproval(tokenID, title, media, creator, description) {
    setApprovalModal({
      ...state,
      show: true,
      title: t("MyNFTs.modalAppTitle"),
      message: t("MyNFTs.modalAppMsg"),
      loading: false,
      disabled: false,
      tokenID: tokenID,
      title: title,
      media: media,
      creator: creator,
      description: description,
      change: setApprovalModal,
      buttonName: 'X',
      tokenId: 'hardcoded'
    })
  }

  async function makeChangePrice(tokenID) {
    setPriceModal({
      ...state,
      show: true,
      title: t("MyNFTs.modalPriTitle"),
      message: t("MyNFTs.modalPriMsg"),
      loading: false,
      disabled: false,
      tokenID: tokenID,
      change: setPriceModal,
      buttonName: 'X',
      tokenId: 'hardcoded'
    })
  }




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

  const fetchMoreDataCreator = async () => {
    await delay(.75)
    setpageCreations(pageCreations + 1);

    let contract = await getNearContract();
    let paramsSupplyForOwner = {
      account_id: profile.user
    };
    // let totalTokensByOwner = await contract.nft_supply_for_creator(paramsSupplyForOwner);
    const supply_payload = btoa(JSON.stringify(paramsSupplyForOwner))
    const { network } = selector.options;
    const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });
    const res = await provider.query({
      request_type: "call_function",
      account_id: process.env.REACT_APP_CONTRACT,
      method_name: "nft_supply_for_creator",
      args_base64: supply_payload,
      finality: "optimistic",
    })
    let totalTokensByOwner = JSON.parse(Buffer.from(res.result).toString())
    if (nfts.nftsCreations.length >= totalTokensByOwner) {
      setState({...state, hasMoreCreations: false });
      return;
    }
    let payload = {
      account_id: profile.user,
      from_index: (pageCreations * nfts.tokensPerPage).toString(),
      limit: nfts.tokensPerPage,
    };
    // let nftsPerOwnerArr = await contract.nft_tokens_for_creator(payload);
    const nft_payload = btoa(JSON.stringify(payload))
    const res_nft = await provider.query({
      request_type: "call_function",
      account_id: process.env.REACT_APP_CONTRACT,
      method_name: "nft_tokens_for_creator",
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
      console.log('metadata',tok.metadata);
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
    let newValue = nfts.nftsCreations.concat(nftsArr);
    setNfts({...nfts, nftsCreations: newValue });
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

        const query = new URLSearchParams(location);
        console.log('QUERY', query.get('pathname').split('/')[2] + (process.env.REACT_APP_NEAR_ENV == 'mainnet' ? '.near' : '.testnet'));//.pathname.split('/')[0]);
        setProfile({ user: query.get('pathname').split('/')[2] + (process.env.REACT_APP_NEAR_ENV == 'mainnet' ? '.near' : '.testnet')}); 
        const supply_payload = btoa(JSON.stringify({ account_id: accountId }))
        const { network } = selector.options;
        const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });

        const res_numNFTCrea = await provider.query({
          request_type: "call_function",
          account_id: process.env.REACT_APP_CONTRACT,
          method_name: "nft_supply_for_creator",
          args_base64: supply_payload,
          finality: "optimistic",
        })
        let numNFTCreations = JSON.parse(Buffer.from(res_numNFTCrea.result).toString())




        if (numNFTCreations == 0) {
          setLoadMsgCreations(false)
        }


        //ARR for Creators 
        
        let payloadCreations = {
          account_id: query.get('pathname').split('/')[2] + (process.env.REACT_APP_NEAR_ENV == 'mainnet' ? '.near' : '.testnet'),
          from_index: "0",
          limit: nfts.tokensPerPage,
        };

        const tokCrea_payload = btoa(JSON.stringify(payloadCreations))
        const res_tokCrea = await provider.query({
          request_type: "call_function",
          account_id: process.env.REACT_APP_CONTRACT,
          method_name: "nft_tokens_for_creator",
          args_base64: tokCrea_payload,
          finality: "optimistic",
        })
        let nftsPerOwnerArrCreations = JSON.parse(Buffer.from(res_tokCrea.result).toString())

        // //convertir los datos al formato esperado por la vista
        let nftsArrCreations = nftsPerOwnerArrCreations.map((tok, i) => {
          console.log(tok)
          let onSale = false
          //console.log("X->",  tok  )
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


        setNfts({
          ...nfts,
          nftsCreations: nftsArrCreations,
          owner: accountId,
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
            dataLength={nfts.nftsCreations.length}
            next={fetchMoreDataCreator}
            hasMore={state.hasMoreCreations}
            loader={<h4 className="dark:text-yellow2 font-raleway">{t("MyNFTs.loading")}</h4>}
            endMessage={
              <p style={{ textAlign: "center" }} className="dark:text-yellow2 font-raleway">
                <b>{t("MyNFTs.youseenit")}</b>
              </p>
            }
          >
            <div className="flex flex-wrap md:m-1 mb-6">
              {nfts.nftsCreations.map((nft, key) => {

                const itemNft = nft;
                const item = JSON.parse(nft.data);
                return (
                  <>
                    <div className="w-full xs:w-[158px] h-[279px] sm:w-[180px] md:w-[160px] lg:w-[210px] lg:p-4 xl:w-[275px] 2xl:w-[335px] xl:h-[395px] 2xl:h-[485px] " key={key}>
                      <a
                        href={"/detail/" + item.tokenID}
                      >
                        <div className="flex flex-row justify-center " >
                          <div className="trending-token w-full h-full rounded-xl shadow-lg   hover:scale-105 ">
                            <div className=" bg-white rounded-xl">
                              <div className="pb-3">
                                <img
                                  className="object-cover object-center rounded-t-xl w-full h-[163px] lg:w-[340px] xl:h-[250px] 2xl:h-[340px]"
                                  src={`https://nativonft.mypinata.cloud/ipfs/${item.image}`}
                                  alt={item.description}
                                />
                              </div>
                              <div className="px-3 py-1">
                                <p className=" text-black text-base leading-6 text-ellipsis overflow-hidden whitespace-nowrap font-open-sans font-extrabold uppercase">{item.title}</p>
                                <a href={`profile/${item.creator.split('.')[0]}`}><p className="text-black py-3 font-open-sans text-[10px] xl:pb-[23px] font-semibold leading-4 text-ellipsis overflow-hidden whitespace-nowrap uppercase">{t("tokCollection.createdBy") + ":"} {item.creator}</p></a>
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
              <h1 className="text-center dark:text-yellow2 font-raleway">{loadMsg ? t("MyNFTs.load-1") : t("MyNFTs.load-2")}</h1>
            </div>
          </div>}

      </ul>

    </>
  );
}


export default MyCreations;
