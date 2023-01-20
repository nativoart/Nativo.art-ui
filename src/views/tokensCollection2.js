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
    ownerCol : "",
    timestamp:""
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

          const monthNames = ["January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"
        ];
        const mesNombres = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diecember"
      ];
       const mesid = new Date(colData.timestamp);
       console.log("🪲 ~ file: tokensCollection2.js:193 ~ colData", colData.timestamp)
       console.log("🪲 ~ file: tokensCollection2.js:193 ~ mesid", mesid)
       
        let mes = monthNames[mesid.getMonth()]
        console.log("🪲 ~ file: tokensCollection2.js:196 ~ mes", mes)
        let fecha = mesid.getDay()+" "+t("tokCollection.of") +" "+mes+" "+ mesid.getFullYear()
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
          colID: colData.collectionID,
          created:fecha
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
    
    <section className="text-gray-600 body-font  ">
      <div className={`flex flex-row  mb-10 md:mb-10   justify-center `}>
        <div className="trending-token w-full   rounded-20  ">
          <div className=" bg-[#F3F0F5] rounded-20 ">
            <div name="bannerSection" className="   pb-3 relative ">
              <img
                className="object-cover object-center   h-[8rem] md:h-48 lg:h-[370px]  w-full bg-center"
                src={`https://nativonft.mypinata.cloud/ipfs/${Landing.bannerCol}`}
                alt='banner'
              />
              {isOwner?
              <div className="absolute bottom-0 right-0 m-4">
                <div className="relative group rounded">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-[#f2b159] to-[#ca7e16] rounded-full blur opacity-70 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt group-hover:-inset-1"></div>
                  <a href={"/collection/edit?id=,"+Landing.colID} className="relative text-sm bg-yellow2 text-white font-bold uppercase px-2 py-1 rounded-full shadow hover:shadow-lg outline-none focus:outline-none  ease-linear transition-all duration-150">{t("CreateCol.editBtn")}</a>
                </div>
              </div>

               : ""}
            </div>
            <div name="InfoSection" className="z-10 -mt-120 w-full text-white font-raleway">

              <div className="bg-[#F3F0F5]   text-black   rounded-t-2xl bg-opacity-80">
                <div name="InfoSection_int" className="flex flex-col md:flex-row">
                  <div className="  lg:w-2/12  lg:ml-20  md:h-[200px]  ">
                      <div name="Iconimg" className="w-[120px] md:w-[200px]  h-[120px] md:h-[200px]   bg-center rounded-xl border-2 border-white 
                      bg-white relative bg-cover    -mt-[95px]" style={{ backgroundImage: `url(https://nativonft.mypinata.cloud/ipfs/${Landing.mediaCol})` }} />

                  </div>

                  <div name="Infotext" className="w-full mt-10 lg:w-10/12   flex justify-between gap-2">
                    <div name="Infotextleft" className="w-full bg-[#F3F0F5]">
                   
                        <div name="title" >
                              {Landing.titleCol.length > 130 ?
                              <h1 className="text-sm md:text-3xl font-bold pb-4 opacity-100 text-darkgray truncate ">{showMoreTitle ? Landing.titleCol : `${Landing.titleCol.substring(0, 130)}`} <button className="btn font-raleway text-xs font-bold text-blue2" onClick={() => setShowMoreTitle(!showMoreTitle)}>
                                {showMoreTitle ? `${t("tokCollection.seeLess")}` : `${t("tokCollection.seeMore")}`}</button></h1>
                              :
                              <h1 className="text-sm md:text-3xl font-bold pb-4 opacity-100 stext-darkgray truncate">{Landing.titleCol}</h1>
                            }
                        </div>
                        <div name="creator" className=" flex flex-row  ">
                            <p className=" text-sm  font-light mr-4 text-black"><b>{t("tokCollection.creatorby")}</b></p>
                            <a href={`../${Landing.ownerCol.split('.')[0]}`} className=" uppercase text-sm pb-1 font-bold text-black truncate">{Landing.ownerCol}</a>
                        </div>
                        <div name="description" className="h-20 bg-[#F3F0F5]  overflow-hidden mb-2">

                        {Landing.descriptionCol.length > 150 ?
                          <textarea className="text-xs md:text-base w-full h-full bg-[#F3F0F5] pb-3 text-darkgray break-words ">{showMoreDescription ? Landing.descriptionCol : `${Landing.descriptionCol.substring(0, 150)}`} <button className="btn font-raleway text-xs font-bold text-blue2" onClick={() => setShowMoreDescription(!showMoreDescription)}>
                            {showMoreDescription ? `${t("tokCollection.seeLess")}` : `${t("tokCollection.seeMore")}`}</button></textarea>
                          :
                          <textarea className="text-xs md:text-base w-full h-full bg-[#F3F0F5] pb-3 text-darkgray break-words">{Landing.descriptionCol == "" ? t("tokCollection.descrip") : Landing.descriptionCol}</textarea>
                        }
                        </div>

                        <div name="counters" className="w-full border-2 border-dashed border-[#A4A2A4] flex flex-row p-4 rounded-lg">

                          <div name="countersleft" className="w-1/2 flex flex-row justify-between">
                            <div className="flex flex-row justify-center">
                                  <p className="lg:text-lg font-light     text-darkgray"><b>{t("tokCollection.colID")}</b></p>
                                  <p className="lg:text-lg font-bold     text-darkgray">{Landing.colID}</p>
                                </div>
                                <div className="flex flex-row justify-center">
                                <p className="lg:text-lg font-light  text-darkgray"><b>{t("tokCollection.noTokens")}</b></p>
                                <p className="ml-2 lg:text-lg font-bold   text-darkgray pr-[8rem]">{Landing.tokenCount}</p>
                              </div>
                          </div>
                          <div name="countersright" className="w-1/2">

                             <div className="flex flex-row justify-center">
                                <p className="lg:text-lg font-light  text-darkgray"><b>{t("tokCollection.noTokens")}</b></p>
                                <p className="ml-2 lg:text-lg font-bold   text-darkgray ">{Landing.created}</p>
                              </div>
                          </div>
                         
                          
                        </div>
                        
                    </div>
                    <div name="Infotextright" className="w-2/4   mx-8">

                        <div name="icons" className="bg-[#F3F0F5] w-full flex flex-row justify-end">

                          <div name="website" className="w-10 h-10">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M2 12H22" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22C9.49872 19.2616 8.07725 15.708 8 12C8.07725 8.29203 9.49872 4.73835 12 2V2Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>

                          </div>
                          <div name="twitter" className="w-10 h-10">
                          <svg width="24" height="20" viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                             
                              <path d="M21.4799 5.09281C21.4944 5.30281 21.4944 5.51281 21.4944 5.72475C21.4944 12.1825 16.5783 19.6302 7.58895 19.6302V19.6264C4.93346 19.6302 2.33314 18.8696 0.0976562 17.4354C0.483785 17.4818 0.87185 17.5051 1.26088 17.506C3.46153 17.508 5.59927 16.7696 7.33056 15.4099C5.23927 15.3702 3.4054 14.0067 2.76475 12.016C3.49733 12.1573 4.25217 12.1283 4.9712 11.9318C2.6912 11.4712 1.05088 9.46797 1.05088 7.14152C1.05088 7.12023 1.05088 7.09991 1.05088 7.07959C1.73024 7.45797 2.49088 7.66797 3.26895 7.6912C1.12153 6.25604 0.459592 3.39926 1.75637 1.16571C4.23766 4.21894 7.89862 6.07507 11.8286 6.27152C11.4348 4.5741 11.9728 2.79539 13.2425 1.60217C15.2109 -0.248157 18.3067 -0.153318 20.157 1.8141C21.2515 1.59829 22.3006 1.19668 23.2606 0.62765C22.8957 1.75894 22.1322 2.71991 21.1122 3.33055C22.0809 3.21636 23.0273 2.957 23.9186 2.5612C23.2625 3.54442 22.436 4.40088 21.4799 5.09281Z" fill="#032B30"/>
                               
                              <defs>
                              <clipPath id="clip0_269_22219">
                              <rect width="24" height="19.7419" fill="white" transform="translate(0 0.12915)"/>
                              </clipPath>
                              </defs>
                              </svg>

                          </div>
                          <div name="pipeline" className="w-10 h-10">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <line x1="12.5" y1="2.18557e-08" x2="12.5" y2="24" stroke="#A4A2A4"/>
                          </svg>


                          </div>
                          <div name="star" className="w-10 h-10">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>

                          </div>
                          <div name="share" className="w-10 h-10">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 6.65685 16.3431 8 18 8Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M6 15C7.65685 15 9 13.6569 9 12C9 10.3431 7.65685 9 6 9C4.34315 9 3 10.3431 3 12C3 13.6569 4.34315 15 6 15Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M18 22C19.6569 22 21 20.6569 21 19C21 17.3431 19.6569 16 18 16C16.3431 16 15 17.3431 15 19C15 20.6569 16.3431 22 18 22Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M8.58984 13.51L15.4198 17.49" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M15.4098 6.51001L8.58984 10.49" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>

                          </div>

                        </div>
                    </div>
                 

                  </div>
                 
                </div>
                
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="pt-3 mx-auto">

       {/*    <div>
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
                               <div className=" px-3  pb-3 font-raleway text-xs text-right mx-auto justify-center text-ellipsis overflow-hidden">{t("tokCollection.markOwn")} <a href={`profile/${i.owner_id.split('.')[0]}`} className="font-raleway text-xs font-bold text-blue2 text-ellipsis overflow-hidden">{i.owner_id}</a></div>-  
                            </div>
                          </div>
                        </div>
                      </a>
                    </div>

                 <div className="w-full md:w-1/2 lg:w-1/3 p-4 " key={index}>
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
                  </div> 
                  </>

                )
              })}
            </InfiniteScroll>
            :
            <div className="text-yellow2 text-2xl w-full text-center mt-6 font-bold">
              <p>{t("tokCollection.hasTok")}</p>
            </div>
          }

        </div>  */}
      </div>
    </section>
  );
}

export default LightEcommerceA;
