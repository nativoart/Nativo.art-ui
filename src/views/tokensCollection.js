import React from "react";
import { currencys } from "../utils/constraint";
import { getNearContract, fromYoctoToNear, getNearAccount } from "../utils/near_interaction";
import { useParams, useHistory } from "react-router-dom";

import filtroimg from '../assets/landingSlider/img/filtro.png'
import loading from '../assets/landingSlider/img/loader.gif'
import Pagination from '@mui/material/Pagination';
import { Account } from "near-api-js";
import { ApolloClient, InMemoryCache, gql } from '@apollo/client'
import { useTranslation } from "react-i18next";
import InfiniteScroll from "react-infinite-scroll-component";
import verifyImage from '../assets/img/Check.png';
import { textAlign } from "@mui/system";
import { FiEdit } from 'react-icons/fi';


function LightEcommerceA() {
  const [Landing, setLanding] = React.useState({
    theme: "yellow",
    currency: currencys[parseInt(localStorage.getItem("blockchain"))],
    tokens: [],
    page: parseInt(window.localStorage.getItem("page")),
    pag: window.localStorage.getItem("pagSale"),
    blockchain: localStorage.getItem("blockchain"),
    tokensPerPage: 10,
    tokensPerPageNear: 15,
    titleCol: "",
    descriptionCol: "",
    ownerCol : ""
  });
  const [esconder, setesconder] = React.useState(true);
  const [counter, setcounter] = React.useState();
  const [load, setload] = React.useState(false);
  const [pagsale, setpagsale] = React.useState(0);
  const [pagCount, setpagCount] = React.useState("");
  const [chunksale, setchunksale] = React.useState(0);
  const [page, setpage] = React.useState(1);
  const [ini, setini] = React.useState(true);
  const [firstID, setFirstID] = React.useState(-1);
  const [lastID, setLastID] = React.useState(-1);
  const [statePage, setStatePage] = React.useState(true)
  const [firstLoad, setFirstLoad] = React.useState(true)
  const [loadMsg, setLoadMsg] = React.useState(true)
  const [trigger, settrigger] = React.useState(true);
  const [t, i18n] = useTranslation("global")
  const [hasTok, setHasTok] = React.useState(true)
  const [isOwner, setIsOwner] = React.useState(false)
  const [filtro, setfiltro] = React.useState({
    culture: "null",
    country: "null",
    type: "null",
    date: "null",
    price: "null",
  });
  let [tokens, setTokens] = React.useState({
    items: [],
    hasMore: true
  });
  const [showMoreTitle,setShowMoreTitle] = React.useState(false);
  const [showMoreDescription,setShowMoreDescription] = React.useState(false);

  const APIURL = process.env.REACT_APP_API_TG

  const handleChangePage = (e, value) => {
    //console.log(value)
    setpage(value)
    window.scroll(0, 0)
    settrigger(!trigger)
  }

  const handleBackPage = () => {
    // console.log("Back")
    window.scroll(0, 0)
    setStatePage(false)
    settrigger(!trigger)
  }

  const handleForwardPage = () => {
    // console.log("Forward")
    window.scroll(0, 0)
    setStatePage(true)
    settrigger(!trigger)
  }

  const modificarFiltro = (v) => {
    setfiltro(c => ({ ...c, ...v }))
  }

  const { data } = useParams();


  const { tokenid: owner } = useParams();
  React.useEffect(() => {
    // console.log("esto ---> ",owner);
    let tokData
    let colData
    setload(c => true);
    (async () => {
      let toks, onSaleToks;
      let arr = [];

      if (Landing.blockchain == "0") {
        return


      } else {
        window.contr = await getNearContract();

        //instanciar contracto
        let contract = await getNearContract();
        let account = await getNearAccount();
        const queryData = `
          query($collectionID: String, $first: Int, $tokenID: Int){
            collections(where: {collectionID: $collectionID}) {
              id
              owner_id
              title
              tokenCount
              description
              mediaIcon
              mediaBanner
              salesCount
              saleVolume
              collectionID
              timestamp
            }
            tokens(first: $first, orderBy: tokenId, orderDirection: desc, where: {collectionID: $collectionID}) {
              id
              collectionID
              contract
              tokenId
              owner_id
              title
              description
              media
              creator
              price
              onSale
              approvalID
              extra
              timestamp
            }
          }
        `
        //Declaramos el cliente
        const client = new ApolloClient({
          uri: APIURL,
          cache: new InMemoryCache(),
        })

        let userAcc = await getNearAccount()

        await client
          .query({
            query: gql(queryData),
            variables: {
              collectionID: data,
              first: Landing.tokensPerPageNear,
            },
          })
          .then((data) => {
            console.log("collections data: ", data.data.collections)
            if(data.data.collections[0].owner_id == userAcc){
              setIsOwner(true)
            }
            console.log("tokens data: ", data.data.tokens)
            if (data.data.tokens.length <= 0) {
              setHasTok(false)
            }
            else {
              setTokens({
                ...tokens,
                items: tokens.items.concat(data.data.tokens)
              });
              setLastID(parseInt(data.data.tokens[data.data.tokens.length - 1].tokenId))
            }
            colData = data.data.collections[0]
          })
          .catch((err) => {
            tokData = 0
            console.log('Error ferching data: ', err)
          })

        //convertir los datos al formato esperado por la vista
        await setLanding({
          ...Landing,
          titleCol: colData.title,
          ownerCol: colData.owner_id,
          mediaCol: colData.mediaIcon,
          bannerCol: colData.mediaBanner,
          descriptionCol: colData.description,
          tokenCount: colData.tokenCount,
          saleCount: colData.salesCount,
          saleVolume: fromYoctoToNear(colData.saleVolume),
          colID: colData.collectionID
        });
      }

    })();
  }, []);

  function delay(n){
    return new Promise(function(resolve){
        setTimeout(resolve,n*1000);
    });
  }

  let fetchMoreData = async () => {
    await delay(.75)
    if (tokens.items.length >= Landing.tokenCount) {
      setTokens({ ...tokens, hasMore: false })
      return
    }
    const queryData = `
      query($collectionID: String, $first: Int, $tokenID: Int){
        tokens(first: $first, orderBy: tokenId, orderDirection: desc, where: {collectionID: $collectionID, tokenId_lt:$tokenID}) {
          id
          collectionID
          contract
          tokenId
          owner_id
          title
          description
          media
          creator
          price
          onSale
          approvalID
          extra
          timestamp
        }
      }
    `
    //Declaramos el cliente
    const client = new ApolloClient({
      uri: APIURL,
      cache: new InMemoryCache(),
    })

    await client
      .query({
        query: gql(queryData),
        variables: {
          collectionID: data,
          first: Landing.tokensPerPageNear,
          tokenID: lastID
        },
      })
      .then((data) => {
        console.log("tokens data: ", data.data.tokens)
        setTokens({
          ...tokens,
          items: tokens.items.concat(data.data.tokens)
        });
        setLastID(parseInt(data.data.tokens[data.data.tokens.length - 1].tokenId))
      })
      .catch((err) => {
        console.log('Error ferching data: ', err)
      })
  };

  return (
    
    <section className="text-gray-600 body-font bg-darkgray">
      <div className={`flex flex-row  mb-10 md:mb-0  justify-center `}>
        <div className="trending-token w-full p-5 rounded-20  ">
          <div className=" bg-white rounded-20 ">
            <div className="p-6 pt-3 pb-3 relative">
              <img
                className="object-cover object-center rounded-xlarge h-[8rem] md:h-48  w-full bg-center"
                src={`https://nativonft.mypinata.cloud/ipfs/${Landing.bannerCol}`}
                alt='banner'
              />
              {isOwner?
              <div className="absolute bottom-0 right-0 m-4">
                <div className="relative group rounded">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-[#f2b159] to-[#ca7e16] rounded-full blur opacity-70 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt group-hover:-inset-1"></div>
                  <a href={"/collection/state/edit?id=,"+Landing.colID} className="relative text-sm bg-yellow2 text-white font-bold uppercase px-2 py-1 rounded-full shadow hover:shadow-lg outline-none focus:outline-none  ease-linear transition-all duration-150">{t("CreateCol.editBtn")}</a>
                </div>
              </div>

               : ""}
            </div>
            <div className="z-10 -mt-120 w-full text-white font-raleway">

              <div className="bg-white lg:mx-20 mx-5 text-black mt-4 pt-2 md:mt-0 md:pt-0 pb-3 rounded-t-2xl bg-opacity-80">
                <div className="flex flex-col md:flex-row">
                  <div className="w-[120px] md:w-[200px] h-[120px] md:h-[200px]  bg-circle bg-center rounded-full border-4 border-white relative bg-cover mx-auto md:mx-0  -mt-[95px] md:-mt-[45px]" style={{ backgroundImage: `url(https://nativonft.mypinata.cloud/ipfs/${Landing.mediaCol})` }} />

                  <div className="px-2 mx-auto w-full md:w-3/4">
                    {Landing.titleCol.length > 130 ?
                      <h1 className="text-sm md:text-xl font-bold pb-4 opacity-100 text-darkgray break-words break-all">{showMoreTitle ? Landing.titleCol : `${Landing.titleCol.substring(0, 130)}`} <button className="btn font-raleway text-xs font-bold text-blue2" onClick={() => setShowMoreTitle(!showMoreTitle)}>
                        {showMoreTitle ? `${t("tokCollection.seeLess")}` : `${t("tokCollection.seeMore")}`}</button></h1>
                      :
                      <h1 className="text-sm md:text-xl font-bold pb-4 opacity-100 stext-darkgray break-words break-all">{Landing.titleCol}</h1>
                    }
                    {Landing.descriptionCol.length > 150 ?
                      <p className="text-xs md:text-lg  pb-3 text-darkgray break-words">{showMoreDescription ? Landing.descriptionCol : `${Landing.descriptionCol.substring(0, 150)}`} <button className="btn font-raleway text-xs font-bold text-blue2" onClick={() => setShowMoreDescription(!showMoreDescription)}>
                        {showMoreDescription ? `${t("tokCollection.seeLess")}` : `${t("tokCollection.seeMore")}`}</button></p>
                      :
                      <p className="text-xs md:text-lg  pb-3 text-darkgray break-words">{Landing.descriptionCol == "" ? t("tokCollection.descrip") : Landing.descriptionCol}</p>
                    }
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 divide-x gap-1 bg-yellow-400 rounded-b-2xl text-darkgray lg:mx-20  mx-auto text-center bg-white bg-opacity-80">
                  <div className="flex flex-col justify-center">
                    <p className="lg:text-lg text-sm pb-1 text-darkgray"><b>{t("tokCollection.noTokens")}</b></p>
                    <p className="lg:text-base text-xs pb-1 text-darkgray">{Landing.tokenCount}</p>
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="lg:text-lg text-sm pb-1 text-darkgray"><b>{t("tokCollection.collectionID")}</b></p>
                    <p className="lg:text-base text-xs pb-1 text-darkgray">{Landing.colID}</p>
                  </div>
                  <div className="flex flex-col justify-center col-span-2 md:col-span-1">
                    <p className="lg:text-lg text-sm pb-1 text-darkgray"><b>{t("tokCollection.creator")}</b></p>
                    <a href={`../${Landing.ownerCol.split('.')[0]}`} className="lg:text-base text-xs pb-1 font-bold text-blue2 break-words">{Landing.ownerCol}</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="pt-3 mx-auto">

        <div>
          {hasTok ?
            <InfiniteScroll
              dataLength={tokens.items.length}
              next={fetchMoreData}
              hasMore={tokens.hasMore}
              loader={<h1 className="text-center w-full py-10 text-xl font-bold text-yellow2">{t("tokCollection.loading")}</h1>}
              endMessage={
                <p className="text-center w-full py-10 text-xl text-yellow2">
                  <b>{t("tokCollection.end")}</b>
                </p>
              }
              className={"flex flex-wrap px-[40px]"}
            >
              {tokens.items.map((i, index) => {
                return (
                  <>
                    <div className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4 md:p-4 " key={index}>
                      <a
                        href={"/detail/" + i.tokenId}
                      >
                        <div className="flex flex-row  mb-10 md:mb-0  justify-center " >
                          <div className="trending-token w-64 md:w-80 rounded-20 hover:shadow-yellow1   hover:scale-105 ">
                            <div className=" bg-white rounded-xl">
                              <div className="pb-3">
                                  <img
                                    className="object-cover object-center rounded-t-xl h-48 md:h-72 w-full "
                                    src={`https://nativonft.mypinata.cloud/ipfs/${i.media}`}

                                    alt={i.description}
                                  />
                              </div>
                              <div className="px-3 py-1">

                                <div className="capitalize text-black text-sm  text-ellipsis overflow-hidden whitespace-nowrap  font-raleway font-bold">{i.title}</div>
                                <div className="flex justify-end">
                                  <div className="text-black text-sm font-raleway font-normal py-2">token id: {i.tokenId}</div>
                                  </div>
                              </div>
                              {/* <div className=" px-3  pb-3 font-raleway text-xs text-right mx-auto justify-center text-ellipsis overflow-hidden">{t("tokCollection.markOwn")} <a href={`profile/${i.owner_id.split('.')[0]}`} className="font-raleway text-xs font-bold text-blue2 text-ellipsis overflow-hidden">{i.owner_id}</a></div>- */}
                            </div>
                          </div>
                        </div>
                      </a>
                    </div>

                  {/* <div className="w-full md:w-1/2 lg:w-1/3 p-4 " key={index}>
                    <a
                      href={"/detail/" + i.tokenId}
                    >
                      <div className="flex flex-row  mb-10 md:mb-0  justify-center " >
                        <div className="trending-token w-64 md:w-80 rounded-20 hover:shadow-yellow1   hover:scale-105 ">
                          <div className=" bg-white rounded-20">
                            <div className="w-full p-6 pb-0 flex relative ">
                              <div className="w-[40px] h-[40px]  bg-circle rounded-full bg-pink-2 relative">
                                <img className="w-[25px] h-[25px]  bg-transparent rounded-full top-0 -right-3 absolute" src={verifyImage}></img>
                              </div>
                              <div className="font-raleway font-bold text-black text-sm flex items-center ml-3">
                                {i.owner_id}
                              </div>

                            </div>
                            <div className="p-6 pt-3 pb-3">
                              <img
                                className="object-cover object-center rounded-xlarge h-48 md:h-72 w-full "
                                src={`https://nativonft.mypinata.cloud/ipfs/${i.media}`}

                                alt={i.description}
                              />
                            </div>
                            <div className="p-6 pt-3">

                              <div className="capitalize text-black text-sm  text-ellipsis overflow-hidden whitespace-nowrap  font-raleway font-bold">{i.title}</div>
                              <div className="flex justify-between">
                                <div className="text-black text-sm font-raleway font-normal w-1/2">token id: {i.tokenId}</div>



                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </a>
                  </div> */}
                  </>

                )
              })}
            </InfiniteScroll>
            :
            <div className="text-yellow2 text-2xl w-full text-center mt-6 font-bold">
              <p>{t("tokCollection.hasTok")}</p>
            </div>
          }

        </div>
      </div>
    </section>
  );
}

export default LightEcommerceA;
