import React from "react";
import { currencys } from "../utils/constraint";
import {
  getNearContract,
  fromYoctoToNear,
  getNearAccount,
} from "../utils/near_interaction";
import { useParams } from "react-router-dom";
 
import { ApolloClient, InMemoryCache, gql } from "@apollo/client";
import { useTranslation } from "react-i18next";
import InfiniteScroll from "react-infinite-scroll-component";
 
import Tooltip, { TooltipProps, tooltipClasses } from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";
import { useWalletSelector } from "../utils/walletSelector";

function TokensCollection() {
  const {  accountId } = useWalletSelector();

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
    ownerCol: "",
    created: "",
    timestamp: "",
    twitter: "",
    website: "",
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
  const [statePage, setStatePage] = React.useState(true);
  const [firstLoad, setFirstLoad] = React.useState(true);
  const [loadMsg, setLoadMsg] = React.useState(true);
  const [trigger, settrigger] = React.useState(true);
  const [t, i18n] = useTranslation("global");
  const [hasTok, setHasTok] = React.useState(true);
  const [isOwner, setIsOwner] = React.useState(false);
  const [tokSort, setTokSort] = React.useState(true);
  const [tokData, setTokData] = React.useState(true);
  const [hasData, setHasData] = React.useState(false);
  const [orderDirection, setOrderDirection] = React.useState("desc");
  const [tokenSort, setTokenSort] = React.useState("collectionID");

  const [filtro, setfiltro] = React.useState({
    culture: "null",
    country: "null",
    type: "null",
    date: "null",
    price: "null",
  });
  let [tokens, setTokens] = React.useState({
    items: [],
    hasMore: true,
  });
  const [showMoreTitle, setShowMoreTitle] = React.useState(false);
  const [showMoreDescription, setShowMoreDescription] = React.useState(false);

  const APIURL = process.env.REACT_APP_API_TG;

  const handleChangePage = (e, value) => {
    //console.log(value)
    setpage(value);
    window.scroll(0, 0);
    settrigger(!trigger);
  };

  const handleBackPage = () => {
    // console.log("Back")
    window.scroll(0, 0);
    setStatePage(false);
    settrigger(!trigger);
  };

  const handleForwardPage = () => {
    // console.log("Forward")
    window.scroll(0, 0);
    setStatePage(true);
    settrigger(!trigger);
  };

  const modificarFiltro = (v) => {
    setfiltro((c) => ({ ...c, ...v }));
  };

  const { data } = useParams();

  const copyToClipboard = () => {
    // Copy the text inside the text field
    navigator.clipboard.writeText(window.location.href);
  };
  const { tokenid: owner } = useParams();
  React.useEffect(() => {
     
    let tokData;
    let colData;
    setload((c) => true);
    (async () => {
      let toks, onSaleToks;
      let arr = [];

      if (Landing.blockchain == "0") {
        return;
      } else {
        window.contr = await getNearContract();

        //instanciar contracto
        let contract = await getNearContract();
        let account = await getNearAccount();
        const queryData = `
          query($collectionID: String, $first: Int, $tokenID: Int, $_orderDirection:String){
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
              twitter
              website
            }
            tokens(first: $first, orderBy: tokenId, orderDirection: $_orderDirection, where: {collectionID: $collectionID}) {
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
        `;
        //Declaramos el cliente
        const client = new ApolloClient({
          uri: APIURL,
          cache: new InMemoryCache(),
        });

        let userAcc = await getNearAccount();

        await client
          .query({
            query: gql(queryData),
            variables: {
              collectionID: data,
              first: Landing.tokensPerPageNear,
              _orderDirection: orderDirection,
            },
          })
          .then((data) => {
          
            if (data.data.tokens.length <= 0) {
              if (data.data.collections[0].owner_id == userAcc) {
                setIsOwner(true);
              }

              setHasTok(false);
            } else {
              setTokens({
                ...tokens,
                items: tokens.items.concat(data.data.tokens),
              });

              setLastID(
                parseInt(data.data.tokens[data.data.tokens.length - 1].tokenId)
              );
            }
            colData = data.data.collections[0];
          })
          .catch((err) => {
            tokData = 0;
            console.log("Error ferching data: ", err);
          });

        const monthNames = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];
        const mesNombres = [
          "Enero",
          "Febrero",
          "Marzo",
          "Abril",
          "Mayo",
          "Junio",
          "Julio",
          "Agosto",
          "Septiembre",
          "Octubre",
          "Noviembre",
          "Diciembre",
        ];

        const mesid = new Date(parseInt(colData.timestamp.substring(0, 13)));

        let daynumber = "";
        switch (mesid.getDay()) {
          case "1" || "21" || "31":
            daynumber = "st, ";
            break;
          case "2" || "22":
            daynumber = "nd, ";
            break;
          case "3" || "23":
            daynumber = "rd, ";
            break;
          default:
            daynumber = "th, ";
            break;
        }

        let fecha = [];
        fecha[0] =
          monthNames[mesid.getMonth()] +
          " " +
          mesid.getDay() +
          " " +
          daynumber +
          " " +
          mesid.getFullYear();
        fecha[1] =
          mesid.getDay() +
          " " +
          t("tokCollection.of") +
          " " +
          mesNombres[mesid.getMonth()] +
          "  " +
          mesid.getFullYear();

        let des =
          colData.description.length > 0
            ? colData.description
            : t("tokCollection.descrip");
       
        //convertir los datos al formato esperado por la vista
        await setLanding({
          ...Landing,
          titleCol: colData.title,
          ownerCol: colData.owner_id,
          mediaCol: colData.mediaIcon,
          bannerCol: colData.mediaBanner,
          descriptionCol: des,
          tokenCount: colData.tokenCount,
          saleCount: colData.salesCount,
          saleVolume: fromYoctoToNear(colData.saleVolume),
          colID: colData.collectionID,
          created: fecha,
          twitter: colData.twitter,
          website: colData.website,
        });

        console.log("esto ---> ",colData.owner_id  ," - ",accountId );
      }
    })();
  }, []);

  function delay(n) {
    return new Promise(function (resolve) {
      setTimeout(resolve, n * 1000);
    });
  }

  let fetchMoreData = async () => {
    await delay(0.75);
    if (tokens.items.length >= Landing.tokenCount) {
      setTokens({ ...tokens, hasMore: false });
      return;
    }
    const queryData = `
      query($collectionID: String, $first: Int, $tokenID: Int){
        tokens(first: $first, orderBy: tokenId, orderDirection: ${orderDirection}, where: {collectionID: $collectionID, tokenId_lt:$tokenID}) {
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
    `;
    //Declaramos el cliente
    const client = new ApolloClient({
      uri: APIURL,
      cache: new InMemoryCache(),
    });

    await client
      .query({
        query: gql(queryData),
        variables: {
          collectionID: data,
          first: Landing.tokensPerPageNear,
          tokenID: lastID,
        },
      })
      .then((data) => {
       
        setTokens({
          ...tokens,
          items: tokens.items.concat(data.data.tokens),
        });
        setLastID( parseInt(data.data.tokens[data.data.tokens.length - 1].tokenId) );
      })
      .catch((err) => {
        console.log("Error ferching data: ", err);
      });
  };
  let handleSortTokens = async (e) => {
    
    let currentdir = "";

    if ("oldRecent" == e.target.value) {
      if (!tokSort) {
        return;
      }
      setOrderDirection("asc");
      currentdir = "asc";

      setTokSort(!tokSort);
    } else if ("recentOld") {
      if (tokSort) {
        return;
      }
      currentdir = "desc";

      setOrderDirection("desc");
      setTokSort(!tokSort);
    }
    

    const queryData = `
    query($collectionID: String, $first: Int){
      tokens(first: ${Landing.tokensPerPageNear}, orderBy: tokenId, orderDirection: ${currentdir}, where: {collectionID: ${data}  }) {
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
  `;
    //Declaramos el cliente
    const client = new ApolloClient({
      uri: APIURL,
      cache: new InMemoryCache(),
    });

    await client
      .query({
        query: gql(queryData),
        variables: {
          // collectionID: data,
          // first: Landing.tokensPerPageNear,
          
        },
      })
      .then((data) => {
        

        setTokens({
          ...tokens,
          items: data.data.tokens
        });
         

        setLastID(parseInt(data.data.tokens[data.data.tokens.length - 1].tokenId));
        setFirstLoad(!firstLoad);
        return;
      })
      .catch((err) => {
        console.log("Error ferching data: ", err);
      });
  };

  return (
    <section className="text-gray-600 body-font  ">
      <div className={`flex flex-row    justify-center `}>
        <div className="trending-token w-full   rounded-20  ">
          <div className=" bg-[#F3F0F5] rounded-20  pb-10 ">
            <div name="bannerSection" className="   pb-3 relative ">
              <img
                className="object-cover object-center     h-[300px] md:h-48 lg:h-[370px]  w-full bg-center"
                src={`https://nativonft.mypinata.cloud/ipfs/${Landing.bannerCol}`}
                alt="banner"
              />
              {isOwner ? (
                <div className="absolute bottom-0 right-0 m-4">
                  <div className="relative group rounded">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#f2b159] to-[#ca7e16] rounded-full blur opacity-70 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt group-hover:-inset-1"></div>
                    <a
                      href={"/collection/state/edit?id=," + Landing.colID}
                      className="relative text-sm bg-yellow2 text-white font-bold uppercase px-2 py-1 rounded-full shadow hover:shadow-lg outline-none focus:outline-none  ease-linear transition-all duration-150"
                    >
                      {t("CreateCol.editBtn")}
                    </a>
                  </div>
                </div>
              ) : (
                ""
              )}
            </div>
            <div
              name="InfoSection"
              className="z-10 -mt-120 w-full text-white font-raleway"
            >
              <div className="bg-[#F3F0F5]   text-black   rounded-t-2xl bg-opacity-80">
                <div
                  name="InfoSection_int"
                  className="flex flex-col lg:flex-row px-4 md:px-8 xl:px-[40px]"
                >
                  <div className="  lg:w-3/12 xl:w-2/12 mx-auto     ">
                    <div
                      name="Iconimg"
                      className="w-[200px] md:w-[200px]  h-[200px]     bg-center rounded-xl border-2 border-white 
                      bg-white relative bg-cover    -mt-[145px] lg:-mt-[110px]"
                      style={{
                        backgroundImage: `url(https://nativonft.mypinata.cloud/ipfs/${Landing.mediaCol})`,
                      }}
                    />
                  </div>

                  <div
                    name="Infotext"
                    className="w-full mt-5   lg:w-10/12   flex flex-col lg:flex-row lg:justify-between gap-2"
                  >
                    <div name="Infotextleft" className="w-full bg-[#F3F0F5]">
                      <div name="title">
                        {Landing.titleCol.length > 130 ? (
                          <h1 className=" text-3xl font-open-sans font-bold pb-4 opacity-100 text-darkgray normal-case truncate ">
                            {showMoreTitle
                              ? Landing.titleCol.charAt(0).toUpperCase() +
                                Landing.titleCol.substring(
                                  1,
                                  Landing.titleCol.length
                                )
                              : `${Landing.titleCol.substring(0, 130)}`}{" "}
                            <button
                              className="btn  font-open-sans  text-xs font-bold text-blue2"
                              onClick={() => setShowMoreTitle(!showMoreTitle)}
                            >
                              {showMoreTitle
                                ? `${t("tokCollection.seeLess")}`
                                : `${t("tokCollection.seeMore")}`}
                            </button>
                          </h1>
                        ) : (
                          <h1 className=" text-3xl font-extrabold pb-2 lg:pb-4 opacity-100 text-darkgray  font-open-sans  truncate ">
                            {Landing.titleCol.charAt(0).toUpperCase() +
                              Landing.titleCol.substring(
                                1,
                                Landing.titleCol.length
                              )}
                          </h1>
                        )}
                      </div>
                      <div name="creator" className=" flex flex-row  ">
                        <p className=" text-md  font-open-sans  font-light mr-2  text-black">
                          {t("tokCollection.creatorby")}
                        </p>
                        <a
                          href={`../${Landing.ownerCol.split(".")[0]}`}
                          className=" capitalize text-md pb-1 font-bold  font-open-sans  text-black truncate"
                        >
                          {Landing.ownerCol}
                        </a>
                      </div>
                      <div
                        name="description"
                        className="h-20 bg-[#F3F0F5]  overflow-hidden mb-2"
                      >
                        <textarea
                          disabled="true"
                          defaultValue={Landing.descriptionCol}
                          className="text-base w-full h-full bg-[#F3F0F5]  font-open-sans pb-3 text-darkgray break-words"
                        />
                      </div>
                      <div
                        name="icons_sm"
                        className="bg-[#F3F0F5] w-full flex flex-row justify-center gap-3 md:gap-8 lg:hidden pt-2 pb-4"
                      >
                        {Landing.website === "" ? (
                          <a className="hover:scale-125">
                            <div name="website" className="w-10 h-10">
                              <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                                  stroke="black"
                                  stroke-width="2"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                />
                                <path
                                  d="M2 12H22"
                                  stroke="black"
                                  stroke-width="2"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                />
                                <path
                                  d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22C9.49872 19.2616 8.07725 15.708 8 12C8.07725 8.29203 9.49872 4.73835 12 2V2Z"
                                  stroke="black"
                                  stroke-width="2"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                />
                              </svg>
                            </div>
                          </a>
                        ) : (
                          <a
                          href={Landing.website}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="hover:scale-125"
                          >
                            <div name="website" className="w-10 h-10"  >
                              <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                                  stroke="black"
                                  stroke-width="2"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                />
                                <path
                                  d="M2 12H22"
                                  stroke="black"
                                  stroke-width="2"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                />
                                <path
                                  d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22C9.49872 19.2616 8.07725 15.708 8 12C8.07725 8.29203 9.49872 4.73835 12 2V2Z"
                                  stroke="black"
                                  stroke-width="2"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                />
                              </svg>
                            </div>
                          </a>
                        )}
                        {Landing.twitter === "" ? (
                          <a className="hover:scale-125">
                            <div name="twitter" className="w-10 h-10">
                              <svg
                                width="24"
                                height="20"
                                viewBox="0 0 24 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M21.4799 5.09281C21.4944 5.30281 21.4944 5.51281 21.4944 5.72475C21.4944 12.1825 16.5783 19.6302 7.58895 19.6302V19.6264C4.93346 19.6302 2.33314 18.8696 0.0976562 17.4354C0.483785 17.4818 0.87185 17.5051 1.26088 17.506C3.46153 17.508 5.59927 16.7696 7.33056 15.4099C5.23927 15.3702 3.4054 14.0067 2.76475 12.016C3.49733 12.1573 4.25217 12.1283 4.9712 11.9318C2.6912 11.4712 1.05088 9.46797 1.05088 7.14152C1.05088 7.12023 1.05088 7.09991 1.05088 7.07959C1.73024 7.45797 2.49088 7.66797 3.26895 7.6912C1.12153 6.25604 0.459592 3.39926 1.75637 1.16571C4.23766 4.21894 7.89862 6.07507 11.8286 6.27152C11.4348 4.5741 11.9728 2.79539 13.2425 1.60217C15.2109 -0.248157 18.3067 -0.153318 20.157 1.8141C21.2515 1.59829 22.3006 1.19668 23.2606 0.62765C22.8957 1.75894 22.1322 2.71991 21.1122 3.33055C22.0809 3.21636 23.0273 2.957 23.9186 2.5612C23.2625 3.54442 22.436 4.40088 21.4799 5.09281Z"
                                  fill="#032B30"
                                />

                                <defs>
                                  <clipPath id="clip0_269_22219">
                                    <rect
                                      width="24"
                                      height="19.7419"
                                      fill="white"
                                      transform="translate(0 0.12915)"
                                    />
                                  </clipPath>
                                </defs>
                              </svg>
                            </div>
                          </a>
                        ) : (
                          <a
                            href={"https://twitter.com/" + Landing.twitter}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="hover:scale-125"
                          >
                            <div name="twitter" className="w-10 h-10">
                              <svg
                                width="24"
                                height="20"
                                viewBox="0 0 24 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M21.4799 5.09281C21.4944 5.30281 21.4944 5.51281 21.4944 5.72475C21.4944 12.1825 16.5783 19.6302 7.58895 19.6302V19.6264C4.93346 19.6302 2.33314 18.8696 0.0976562 17.4354C0.483785 17.4818 0.87185 17.5051 1.26088 17.506C3.46153 17.508 5.59927 16.7696 7.33056 15.4099C5.23927 15.3702 3.4054 14.0067 2.76475 12.016C3.49733 12.1573 4.25217 12.1283 4.9712 11.9318C2.6912 11.4712 1.05088 9.46797 1.05088 7.14152C1.05088 7.12023 1.05088 7.09991 1.05088 7.07959C1.73024 7.45797 2.49088 7.66797 3.26895 7.6912C1.12153 6.25604 0.459592 3.39926 1.75637 1.16571C4.23766 4.21894 7.89862 6.07507 11.8286 6.27152C11.4348 4.5741 11.9728 2.79539 13.2425 1.60217C15.2109 -0.248157 18.3067 -0.153318 20.157 1.8141C21.2515 1.59829 22.3006 1.19668 23.2606 0.62765C22.8957 1.75894 22.1322 2.71991 21.1122 3.33055C22.0809 3.21636 23.0273 2.957 23.9186 2.5612C23.2625 3.54442 22.436 4.40088 21.4799 5.09281Z"
                                  fill="#032B30"
                                />

                                <defs>
                                  <clipPath id="clip0_269_22219">
                                    <rect
                                      width="24"
                                      height="19.7419"
                                      fill="white"
                                      transform="translate(0 0.12915)"
                                    />
                                  </clipPath>
                                </defs>
                              </svg>
                            </div>
                          </a>
                        )}
                        {/* 
                        <div name="pipeline" className="w-10 h-10">
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <line
                              x1="12.5"
                              y1="2.18557e-08"
                              x2="12.5"
                              y2="24"
                              stroke="#A4A2A4"
                            />
                          </svg>
                        </div>
                        <div name="star" className="w-10 h-10 hover:scale-125">
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                              stroke="black"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
                          </svg>
                        </div>
                        */}
                        <button
                          onClick={copyToClipboard}
                          className="  hover:scale-125 "
                        >
                          <div name="share" className="w-10 h-10">
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 6.65685 16.3431 8 18 8Z"
                                stroke="black"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                              <path
                                d="M6 15C7.65685 15 9 13.6569 9 12C9 10.3431 7.65685 9 6 9C4.34315 9 3 10.3431 3 12C3 13.6569 4.34315 15 6 15Z"
                                stroke="black"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                              <path
                                d="M18 22C19.6569 22 21 20.6569 21 19C21 17.3431 19.6569 16 18 16C16.3431 16 15 17.3431 15 19C15 20.6569 16.3431 22 18 22Z"
                                stroke="black"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                              <path
                                d="M8.58984 13.51L15.4198 17.49"
                                stroke="black"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                              <path
                                d="M15.4098 6.51001L8.58984 10.49"
                                stroke="black"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                            </svg>
                          </div>
                        </button>
                        
{  Landing.ownerCol === accountId ?  
         <a
         href={"/collection/state/edit?id=" + Landing.colID}
         className="relative    "
       >
         <div   className="w-10 h-10">
         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
             <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
             <path d="M18.5 2.49998C18.8978 2.10216 19.4374 1.87866 20 1.87866C20.5626 1.87866 21.1022 2.10216 21.5 2.49998C21.8978 2.89781 22.1213 3.43737 22.1213 3.99998C22.1213 4.56259 21.8978 5.10216 21.5 5.49998L12 15L8 16L9 12L18.5 2.49998Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
             </svg>
         </div>
       </a>
         
       
: null}
                       
                      </div>
                      <div
                        name="counters"
                        className="w-full border-2 border-dashed border-[#A4A2A4] flex flex-col lg:flex-row p-4 rounded-lg"
                      >
                        <div
                          name="countersleft"
                          className="w-full lg:w-1/2 flex flex-row justify-start"
                        >
                          <div className="w-1/2 lg:w-full flex flex-row justify-start lg:justify-center xl:justify-start">
                            <p className="lg:text-lg font-light   font-open-sans    text-darkgray">
                              {t("tokCollection.colID")}
                            </p>
                            <p className="lg:text-lg font-bold   font-open-sans    text-darkgray">
                              {Landing.colID}
                            </p>
                          </div>
                          <div className="ml-4  w-1/2 lg:w-full flex flex-row  ">
                            <p className="lg:text-lg font-light font-open-sans   text-darkgray">
                              {t("tokCollection.noTokens")}
                            </p>
                            <p className="ml-2 lg:text-lg font-bold   font-open-sans  text-darkgray pr-[8rem]">
                              {Landing.tokenCount}
                            </p>
                          </div>
                        </div>
                        <div name="countersright" className="w-full lg:w-1/2">
                          <div className="flex flex-row justify-start lg:justify-center">
                            <p className="lg:text-lg font-light  font-open-sans  text-darkgray">
                              {t("tokCollection.published")}
                            </p>
                            <p className="ml-2 lg:text-lg font-bold   font-open-sans  text-darkgray ">
                              {window.localStorage.getItem("LanguageState") ===
                              "en"
                                ? Landing.created[0]
                                : Landing.created[1]}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div name="Infotextright" className="w-2/4   mx-8 lg:mx-0">
                      <div
                        name="icons"
                        className=" bg-[#F3F0F5] w-full hidden lg:flex flex-row justify-start xl:justify-center"
                      >
                        {Landing.website === "" ? (
                          <Tooltip
                            placement="bottom"
                            arrow
                            title={t("tokCollection.NoWebsite")}
                          >
                            <a className="hover:scale-125">
                              <div
                                name="website"
                                className="w-10 h-10"
                                
                              >
                                <svg
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                                    stroke="black"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                  />
                                  <path
                                    d="M2 12H22"
                                    stroke="black"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                  />
                                  <path
                                    d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22C9.49872 19.2616 8.07725 15.708 8 12C8.07725 8.29203 9.49872 4.73835 12 2V2Z"
                                    stroke="black"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                  />
                                </svg>
                              </div>
                            </a>
                          </Tooltip>
                        ) : (
                          <Tooltip
                            placement="bottom"
                            arrow
                            title={t("tokCollection.Website")}
                          >
                            <a   
                              href={ Landing.website}
                              target="_blank"
                              rel="noreferrer noopener"
                              className="hover:scale-125"
                            >
                              
                              <div
                                
                                className="w-10 h-10"
                                 
                              >
                                <svg
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                                    stroke="black"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                  />
                                  <path
                                    d="M2 12H22"
                                    stroke="black"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                  />
                                  <path
                                    d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22C9.49872 19.2616 8.07725 15.708 8 12C8.07725 8.29203 9.49872 4.73835 12 2V2Z"
                                    stroke="black"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                  />
                                </svg>
                              </div>
                            </a>
                          </Tooltip>
                        )}
                        {Landing.twitter === "" ? (
                          <Tooltip
                            placement="bottom"
                            arrow
                            title={t("tokCollection.NoTwitter")}
                          >
                            <a className="hover:scale-125">
                              <div name="twitter" className="w-10 h-10">
                                <svg
                                  width="24"
                                  height="20"
                                  viewBox="0 0 24 20"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M21.4799 5.09281C21.4944 5.30281 21.4944 5.51281 21.4944 5.72475C21.4944 12.1825 16.5783 19.6302 7.58895 19.6302V19.6264C4.93346 19.6302 2.33314 18.8696 0.0976562 17.4354C0.483785 17.4818 0.87185 17.5051 1.26088 17.506C3.46153 17.508 5.59927 16.7696 7.33056 15.4099C5.23927 15.3702 3.4054 14.0067 2.76475 12.016C3.49733 12.1573 4.25217 12.1283 4.9712 11.9318C2.6912 11.4712 1.05088 9.46797 1.05088 7.14152C1.05088 7.12023 1.05088 7.09991 1.05088 7.07959C1.73024 7.45797 2.49088 7.66797 3.26895 7.6912C1.12153 6.25604 0.459592 3.39926 1.75637 1.16571C4.23766 4.21894 7.89862 6.07507 11.8286 6.27152C11.4348 4.5741 11.9728 2.79539 13.2425 1.60217C15.2109 -0.248157 18.3067 -0.153318 20.157 1.8141C21.2515 1.59829 22.3006 1.19668 23.2606 0.62765C22.8957 1.75894 22.1322 2.71991 21.1122 3.33055C22.0809 3.21636 23.0273 2.957 23.9186 2.5612C23.2625 3.54442 22.436 4.40088 21.4799 5.09281Z"
                                    fill="#032B30"
                                  />

                                  <defs>
                                    <clipPath id="clip0_269_22219">
                                      <rect
                                        width="24"
                                        height="19.7419"
                                        fill="white"
                                        transform="translate(0 0.12915)"
                                      />
                                    </clipPath>
                                  </defs>
                                </svg>
                              </div>
                            </a>
                          </Tooltip>
                        ) : (
                          <Tooltip
                            placement="bottom"
                            arrow
                            title={t("tokCollection.Twitter")}
                          >
                            <a
                              href={"https://twitter.com/" + Landing.twitter}
                              target="_blank"
                              rel="noreferrer noopener"
                              className="hover:scale-125"
                            >
                              <div name="twitter" className="w-10 h-10">
                                <svg
                                  width="24"
                                  height="20"
                                  viewBox="0 0 24 20"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M21.4799 5.09281C21.4944 5.30281 21.4944 5.51281 21.4944 5.72475C21.4944 12.1825 16.5783 19.6302 7.58895 19.6302V19.6264C4.93346 19.6302 2.33314 18.8696 0.0976562 17.4354C0.483785 17.4818 0.87185 17.5051 1.26088 17.506C3.46153 17.508 5.59927 16.7696 7.33056 15.4099C5.23927 15.3702 3.4054 14.0067 2.76475 12.016C3.49733 12.1573 4.25217 12.1283 4.9712 11.9318C2.6912 11.4712 1.05088 9.46797 1.05088 7.14152C1.05088 7.12023 1.05088 7.09991 1.05088 7.07959C1.73024 7.45797 2.49088 7.66797 3.26895 7.6912C1.12153 6.25604 0.459592 3.39926 1.75637 1.16571C4.23766 4.21894 7.89862 6.07507 11.8286 6.27152C11.4348 4.5741 11.9728 2.79539 13.2425 1.60217C15.2109 -0.248157 18.3067 -0.153318 20.157 1.8141C21.2515 1.59829 22.3006 1.19668 23.2606 0.62765C22.8957 1.75894 22.1322 2.71991 21.1122 3.33055C22.0809 3.21636 23.0273 2.957 23.9186 2.5612C23.2625 3.54442 22.436 4.40088 21.4799 5.09281Z"
                                    fill="#032B30"
                                  />

                                  <defs>
                                    <clipPath id="clip0_269_22219">
                                      <rect
                                        width="24"
                                        height="19.7419"
                                        fill="white"
                                        transform="translate(0 0.12915)"
                                      />
                                    </clipPath>
                                  </defs>
                                </svg>
                              </div>
                            </a>
                          </Tooltip>
                        )}
                      {/* 
                        <div name="pipeline" className="w-10 h-10">
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <line
                              x1="12.5"
                              y1="2.18557e-08"
                              x2="12.5"
                              y2="24"
                              stroke="#A4A2A4"
                            />
                          </svg>
                        </div>
                        <div name="star" className="w-10 h-10 hover:scale-125">
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                              stroke="black"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
                          </svg>
                        </div>
                         */}
                        <Tooltip
                          placement="bottom"
                          arrow
                          title={t("tokCollection.ShareCol")}
                        >
                          <button
                            onClick={copyToClipboard}
                            className="  hover:scale-125 "
                          >
                            <div name="share" className="w-10 h-10">
                              <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 6.65685 16.3431 8 18 8Z"
                                  stroke="black"
                                  stroke-width="2"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                />
                                <path
                                  d="M6 15C7.65685 15 9 13.6569 9 12C9 10.3431 7.65685 9 6 9C4.34315 9 3 10.3431 3 12C3 13.6569 4.34315 15 6 15Z"
                                  stroke="black"
                                  stroke-width="2"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                />
                                <path
                                  d="M18 22C19.6569 22 21 20.6569 21 19C21 17.3431 19.6569 16 18 16C16.3431 16 15 17.3431 15 19C15 20.6569 16.3431 22 18 22Z"
                                  stroke="black"
                                  stroke-width="2"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                />
                                <path
                                  d="M8.58984 13.51L15.4198 17.49"
                                  stroke="black"
                                  stroke-width="2"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                />
                                <path
                                  d="M15.4098 6.51001L8.58984 10.49"
                                  stroke="black"
                                  stroke-width="2"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                />
                              </svg>
                            </div>
                          </button>
                        </Tooltip>
                        {  Landing.ownerCol === accountId ?  
         <a
         href={"/collection/state/edit?id=" + Landing.colID}
         className="relative    "
       >
         <div   className="w-10 h-10">
         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
             <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
             <path d="M18.5 2.49998C18.8978 2.10216 19.4374 1.87866 20 1.87866C20.5626 1.87866 21.1022 2.10216 21.5 2.49998C21.8978 2.89781 22.1213 3.43737 22.1213 3.99998C22.1213 4.56259 21.8978 5.10216 21.5 5.49998L12 15L8 16L9 12L18.5 2.49998Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
             </svg>
         </div>
       </a>
         
       
: null}
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
        <div className="w-full lg:hidden flex justify-center py-4 ">
          <h3 className="text-3xl md:text-5xl  text-black font-bold">
            {t("tokCollection.Tokenscollection")}
          </h3>
        </div>
        <div>
          {hasTok ? (
            <>
              <div className="px-6 lg:px-12 w-full pb-6 lg:py-6 flex flex-row-reverse">
                <select
                  name="sort"
                  className="text-base font-open-sans pl-3 py-2.5 border-outlinePressed dark:text-black md:w-[283px]"
                  onChange={handleSortTokens}
                >
                  <option value="" disabled selected hidden>
                    {t("Explore.sortBy")}
                  </option>
                  <option value="recentOld">{t("Explore.sortTimeRec")}</option>
                  <option value="oldRecent">{t("Explore.sortTimeOld")}</option>
                </select>
              </div>
              <InfiniteScroll
                dataLength={tokens.items.length}
                next={fetchMoreData}
                hasMore={tokens.hasMore}
                loader={
                  <h1 className="text-center w-full py-10 text-xl font-bold text-black">
                    {t("tokCollection.loading")}
                  </h1>
                }
                endMessage={
                  <p className="text-center w-full py-10 text-xl text-black   font-open-sans ">
                    {t("tokCollection.end")}
                  </p>
                }
                className={"flex flex-wrap px-[20px] lg:px-[40px]"}
              >
                {tokens.items.map((i, index) => {
                  return (
                    <div
                      className=" w-1/2   md:w-1/3 xl:w-1/4  md:p-4 "
                      key={index}
                    >
                      <a href={"/detail/" + i.tokenId}>
                        <div className="flex flex-row  mb-10 md:mb-0   rounded-xl justify-center ">
                          <div className="trending-token w-40 md:w-[14rem] lg:w-80 rounded-xl  border shadow-xl hover:scale-105 ">
                            <div className=" bg-white rounded-xl">
                              <div className=" border rounded-t-xl ">
                                <img
                                  className="object-cover object-center rounded-t-xl h-40 md:h-[14.5rem] lg:h-72 w-full "
                                  src={`https://nativonft.mypinata.cloud/ipfs/${i.media}`}
                                  alt={i.description}
                                />
                              </div>
                              <div className="px-3 pt-1 ">
                                <h1 className="capitalize text-black   text-lg md:text-2xl  text-ellipsis overflow-hidden whitespace-nowrap   font-open-sans  font-black	">
                                  {i.title}
                                </h1>
                                <h3 className="  text-black text-sm  md:text-lg text-ellipsis overflow-hidden whitespace-nowrap   font-open-sans  font-light">
                                  {Landing.titleCol}
                                </h3>
                                <div className="flex flex-row mt-2 lg:py-4 ">
                                  <div
                                    name="near_icon"
                                    className="w-5 h-5  mt-2 scale-125"
                                  >
                                    <svg
                                      width="18"
                                      height="18"
                                      viewBox="0 0 18 18"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M13.9031 1.72228L10.5169 6.7499C10.4687 6.82231 10.4483 6.90973 10.4595 6.996C10.4708 7.08226 10.5129 7.16154 10.578 7.21917C10.6432 7.2768 10.7271 7.30887 10.814 7.30947C10.901 7.31006 10.9853 7.27913 11.0513 7.2224L14.3846 4.33115C14.4042 4.31368 14.4284 4.30226 14.4543 4.29831C14.4802 4.29436 14.5067 4.29803 14.5306 4.30889C14.5544 4.31974 14.5746 4.33731 14.5886 4.35944C14.6027 4.38158 14.61 4.40732 14.6096 4.43353V13.4853C14.6096 13.513 14.6011 13.54 14.5852 13.5627C14.5693 13.5854 14.5468 13.6027 14.5207 13.6121C14.4947 13.6216 14.4664 13.6228 14.4396 13.6156C14.4128 13.6084 14.3889 13.5931 14.3711 13.5719L4.29564 1.51078C4.13358 1.31941 3.93178 1.16563 3.70428 1.06014C3.47678 0.954646 3.22904 0.899967 2.97827 0.899902H2.62614C2.16844 0.899902 1.72949 1.08172 1.40585 1.40536C1.08221 1.729 0.900391 2.16795 0.900391 2.62565V15.3742C0.900391 15.8319 1.08221 16.2708 1.40585 16.5944C1.72949 16.9181 2.16844 17.0999 2.62614 17.0999V17.0999C2.92125 17.1 3.21145 17.0244 3.46905 16.8805C3.72666 16.7365 3.94307 16.5289 4.09764 16.2775L7.48389 11.2499C7.53212 11.1775 7.5525 11.0901 7.54126 11.0038C7.53001 10.9175 7.48791 10.8383 7.42274 10.7806C7.35757 10.723 7.27373 10.6909 7.18673 10.6903C7.09974 10.6897 7.01547 10.7207 6.94952 10.7774L3.61614 13.6687C3.59661 13.6861 3.5724 13.6975 3.54649 13.7015C3.52058 13.7054 3.49408 13.7018 3.47022 13.6909C3.44636 13.6801 3.42618 13.6625 3.41214 13.6404C3.39809 13.6182 3.3908 13.5925 3.39114 13.5663V4.51228C3.39115 4.48457 3.39969 4.45753 3.4156 4.43484C3.4315 4.41215 3.45401 4.3949 3.48005 4.38544C3.5061 4.37598 3.53443 4.37476 3.56119 4.38196C3.58795 4.38915 3.61185 4.40441 3.62964 4.42565L13.704 16.489C13.8661 16.6804 14.0679 16.8342 14.2954 16.9397C14.5229 17.0452 14.7706 17.0998 15.0214 17.0999H15.3735C15.6002 17.1001 15.8248 17.0555 16.0343 16.9689C16.2438 16.8822 16.4342 16.7551 16.5945 16.5948C16.7549 16.4346 16.8821 16.2443 16.9689 16.0348C17.0557 15.8254 17.1004 15.6009 17.1004 15.3742V2.62565C17.1004 2.16795 16.9186 1.729 16.5949 1.40536C16.2713 1.08172 15.8323 0.899902 15.3746 0.899902C15.0795 0.899825 14.7893 0.975375 14.5317 1.11934C14.2741 1.26331 14.0577 1.47089 13.9031 1.72228V1.72228Z"
                                        fill="#EB8A06"
                                      />
                                    </svg>
                                  </div>
                                  <p className="text-yellow2 text-xl md:text-2xl ml-2 mt-0.5 truncate  font-open-sans font-bold">
                                    {fromYoctoToNear(i.price)} NEAR
                                  </p>
                                </div>

                                {/* <div className="flex justify-end">
                                  <div className="text-black text-sm font-raleway font-normal py-2">token id: {i.tokenId}</div>
                                  </div> */}
                              </div>
                              <a
                                href={`/${i.owner_id.split(".")[0]}`}
                                className=" ml-2 md:hidden text-[10px] tracking-tighter font-light font-open-sans uppercase text-ellipsis overflow-hidden"
                              >
                                {i.owner_id}
                              </a>
                              <h4 className=" px-3 hidden md:flex pb-6  md:text-sm text-left mx-auto justify-left text-ellipsis overflow-hidden first-letter:font-open-sans  uppercase font-bold">
                                {t("tokCollection.by")}
                                <a
                                  href={`/${i.owner_id.split(".")[0]}`}
                                  className=" ml-1  md:text-md font-bold  font-open-sans uppercase text-ellipsis overflow-hidden"
                                >
                                  {i.owner_id}
                                </a>
                              </h4>
                            </div>
                          </div>
                        </div>
                      </a>
                    </div>
                  );
                })}
              </InfiniteScroll>
            </>
          ) : (
            <div className="text-black text-2xl w-full text-center my-6 font-bold">
              <p>{t("tokCollection.hasTok")}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default TokensCollection;
