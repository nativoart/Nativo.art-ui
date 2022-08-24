import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  fromYoctoToNear,
  getNearAccount,
  ext_view,
  ext_call
} from "../utils/near_interaction";
import dayjs from 'dayjs';
import BidModal from "../components/bidModal.component";

import { useTranslation } from "react-i18next";
import { date } from "yup";
import { Accordion } from 'react-bootstrap-accordion'
import 'react-bootstrap-accordion/dist/index.css'

function AuctionFunction(props) {
  const [auction, setAuction] = useState({});
  const [auctionBids, setAuctionBids] = useState([]);
  const [account, setAccount] = useState({account : ""});
  const [t, i18n] = useTranslation("global")
  //setting state for the offer modal
  const [bidModal, setBidModal] = useState({
    show: false,
  });
  const [dates, setDates] = useState({
    deadline: "",
    current: "",
    diffFromDeadline: ["0", "0", "0", "0"]
  });
  const params = useParams();
  useEffect(() => {
    (async () => {

      console.log('props', props);
      console.log('token', params.tokenid);
      let contract = process.env.REACT_APP_CONTRACT_AUCTIONS;
      let account = await getNearAccount();
      let payload = {};

      payload = {
        auction_id: parseInt(params.tokenid)
      }

      let auction = await ext_view(contract, 'get_nft_auction', payload);
      let auctionBids = await ext_view(contract, 'get_bid_auction', payload);
      console.log('auction', auction);
      console.log('auction_bids', auctionBids);
      setAuction({ ...auction, auction });
      if (auctionBids != null) setAuctionBids(auctionBids.reverse())
      setAccount({"account": account});
      console.log('deadline')
      setDates({deadline: dayjs.unix(auction.auction_deadline).format("DD/MMM/YYYY HH:mm:ss"), current: dayjs().format("DD/MMM/YYYY HH:mm:ss"), diffFromDeadline: parseInt(dayjs.unix(auction.auction_deadline))-parseInt((dayjs(new Date())))});
      console.log('status', auction.status);
     
    })();
  },[]);

  async function makeAnOffer() {
    console.log("Make a offer")
    setBidModal({
      show: true,
      message: t("auctionModal.au_title"),
      loading: false,
      disabled: false,
      change: setBidModal,
      buttonName: 'X',
      tokenId: 'hardcoded'
    })
  }

  async function processCancelBidOffer() {
    if(auctionBids.length == 0){
      /*No hay oferta y cancela el owner*/

      let payload = {
        auction_id: auction.id
      }
      ext_call(process.env.REACT_APP_CONTRACT_AUCTIONS, 'withdraw_nft_owner', payload, 300000000000000, 1);
    } else {
      /*Hay oferta y cancela el bidder*/
      let payload = {
        auction_id: auction.id
      }
      ext_call(process.env.REACT_APP_CONTRACT_AUCTIONS, 'withdraw_bid_bidder', payload, 300000000000000, 1);
    }
  }

  async function processClaimNFT() {
    console.log("processClaimNFT")

    console.log("account nft_owner",auction.nft_owner);
    console.log("account nft_owner",auction);

    let payload = {
      auction_id: auction.id
    }

    ext_call(process.env.REACT_APP_CONTRACT_AUCTIONS, 'claim_nft_winner', payload, 300000000000000, 1)

  }

  
function updateTime() {
  let remaining = "";
  let dead = new Date(auction.auction_deadline * 1000);


  let current = new Date();

  const difference = dead - current;
  if (difference > 0) {
    const parts = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
    console.log('asjdsa',parts);
    remaining = Object.keys(parts).map(part => {
      return `${parts[part]}`;  
      });
      setDates({...dates, diffFromDeadline: remaining})
  }
}
setInterval(updateTime, 1000);






  return (
    <section className="text-gray-600 body-font  dark:bg-darkgray ">
      <div className="flex flex-col text-center w-full">
        <div className="container px-5 pt-5 mx-auto asda">
          <div className="flex flex-col text-center w-full">
            <div className="w-full  px-2 pb-2 sm:px-0">
              <div className="w-full p-4  " key={1}>
                {dayjs.unix(auction.auction_deadline).format("DD/MMM/YYYY HH:mm:ss") > dayjs().format("DD/MMM/YYYY HH:mm:ss") ?
                  <>{auction.status != 'Canceled' ?
                    <div className="h-[30px]  bg-active w-full flex justify-center p-5 rounded-t-20  items-center mt-2 text-white font-bold text-xl" >{t("auction.au_active")}</div>
                    :
                    <div className="h-[30px]  bg-ended w-full flex justify-center p-5 rounded-t-20  items-center mt-2 text-white font-bold text-xl" >{t("auction.au_ended")}</div>}
                  </>
                  :
                  <div className="h-[30px]  bg-ended w-full flex justify-center p-5 rounded-t-20  items-center mt-2 text-white font-bold text-xl" >{t("auction.au_ended")}</div>
                }
                <div className="flex flex-row  mb-10 md:mb-0  justify-center " >
                  <div className="trending-token w-full  ">
                    <div className=" bg-white rounded-b-20 h-auto  flex flex-col md:flex-row">
                      <div className="p-6 pt-3 pb-3  w-full md:w-1/2 flex">
                        <img
                          className="object-contain object-center rounded-xlarge h-[14rem] md:h-[25rem]  bg-center m-auto"
                          src={`https://nativonft.mypinata.cloud/ipfs/${auction.nft_media}`}
                          alt={1}
                        />
                      </div>
                      <div className="pb-3 p-6 pt-3 flex flex-col md:w-1/2  w-full">
                        <div className="capitalize text-black text-sm  font-raleway font-bold text-center"></div>
                        <div className="flex justify-around pt-2 flex-col">

                          <div className="text-black font-raleway  w-full text-left text-ellipsis overflow-hidden whitespace-nowrap py-4 border-b-2 border-gray-200 font-bold text-lg md:text-xl"><span className="font-bold"></span>{auction.description}</div>
                          <div className="flex flex-col md:flex-row w-full text-left py-4 border-b-2 border-gray-200">
                            <div className="text-black  font-raleway font-normal  w-1/3 text-lg md:text-xl"><span className="text-xs md:text-md">ID</span> <span className="font-bold text-lg md:text-xl">{auction.nft_id}</span></div>
                            <div className="text-black text-sm font-raleway font-normal  w-2/3"><span className="text-xs md:text-md">{t("auction.au_owner")} </span><span className="font-raleway  font-bold text-blue2 text-md md:text-lg">{auction.nft_owner}</span></div>
                          </div>
                          <div className="flex flex-col md:flex-row  ">
                            <div className="w-full">
                              <div className="text-black text-sm font-raleway font-normal text-left py-4 border-b-2 border-gray-200 ">
                                <div>
                                  <span className=" text-darkgray text-xs md:text-md">{t("auction.au_end")}</span>
                                </div>
                                {}
                                <div className="flex justify-around">
                                {(dayjs.unix(auction.auction_deadline).format("DD/MMM/YYYY HH:mm:ss") > dayjs(new Date()).format("DD/MMM/YYYY HH:mm:ss") && auction.status != 'Canceled' ?
                                    <>
                                    
                                  <div className="flex flex-col">
                                    <div className="font-bold m-auto text-lg md:text-xl ">{dates.diffFromDeadline[0]}</div>
                                    <div className="m-auto text-xs md:text-md">{t("auction.au_days")}</div>
                                  </div>
                                  <div className="flex flex-col">
                                    <div className="font-bold m-auto text-lg md:text-xl ">{dates.diffFromDeadline[1]}</div>
                                    <div className="m-auto text-xs md:text-md">{t("auction.au_hours")}</div>
                                  </div>
                                  <div className="flex flex-col">
                                    <div className="font-bold m-auto text-lg md:text-xl ">{dates.diffFromDeadline[2]}</div>
                                    <div className="m-auto text-xs md:text-md">{t("auction.au_minutes")}</div>
                                  </div>
                                  <div className="flex flex-col">
                                    <div className="font-bold  m-auto text-lg md:text-xl ">{dates.diffFromDeadline[3]}</div>
                                    <div className="m-auto text-xs md:text-md">{t("auction.au_seconds")}</div>
                                  </div>
                                  </> : 
                                    <>
                                    <div className="flex flex-col">
                                      <div className="font-bold  m-auto text-lg md:text-xl ">0</div>
                                      <div className="m-auto text-xs md:text-md">{t("auction.au_days")}</div>
                                    </div>
                                    <div className="flex flex-col">
                                      <div className="font-bold  m-auto text-lg md:text-xl ">0</div>
                                      <div className="m-auto text-xs md:text-md">{t("auction.au_hours")}</div>
                                    </div>
                                    <div className="flex flex-col">
                                      <div className="font-bold  m-auto text-lg md:text-xl ">0</div>
                                      <div className="m-auto text-xs md:text-md">{t("auction.au_minutes")}</div>
                                    </div>
                                    <div className="flex flex-col">
                                      <div className="font-bold  m-auto text-lg md:text-xl ">0</div>
                                      <div className="m-auto text-xs md:text-md ">{t("auction.au_seconds")}</div>
                                    </div>
                                    </>)}
                                </div>
                              </div>
                              <div className="text-black text-sm font-raleway font-normal text-left py-4 border-b-2 border-gray-200 "><span className="text-xs md:text-md">{t("auction.au_status")} </span><span  className="font-bold text-lg md:text-xl">{auction.status}</span></div>
                              <div className="text-black  text-lg  font-raleway font-normal   text-left py-4 border-b-2 border-gray-200"><span className="text-xs md:text-md">{t("auction.au_price")} </span ><span className="font-bold text-lg md:text-xl">{auction.auction_base_requested ? (fromYoctoToNear(auction.auction_base_requested)) : null}  Ⓝ</span></div>
                              <div className="w-full rounded-xlarge py-4 ">

                              {/*Auction active*/
                              (dayjs.unix(auction.auction_deadline).format("DD/MMM/YYYY HH:mm:ss") > dayjs().format("DD/MMM/YYYY HH:mm:ss") ? 
                                <>
                                {/*There is active offers for this auctions*/
                                  (auctionBids.length > 0  ?
                                  <div className="flex flex-col py-2  rounded-xlarge">
                                    <div className="flex justify-around">
                                      <div className="text-black   font-raleway text-lg font-bold"><span className="font-normal text-sm ">{t("auction.au_actual")} </span> {fromYoctoToNear(auction.auction_payback)}  Ⓝ</div>
                                      <div className=" text-black  pr-3 font-raleway text-lg font-bold"><span className="font-normal text-sm ">{t("auction.au_bidder")} </span> {auction.bidder_id}</div>
                                    </div>
                                    {
                                    (account.account==auction.nft_owner ?
                                      /*The current account is the bidder*/
                                      <div className="w-full p-2">
                                        <button
                                          className="w-full content-center justify-center text-center font-bold text-white bg-yellow2 border-0  focus:outline-none hover:bg-yellow   font-raleway text-base rounded-xlarge p-2 h-[44px]"
                                          onClick={async () => { processCancelBidOffer() }}>
                                          <span className="font-raleway">{t("auction.au_cancelAuction")}</span>
                                        </button>
                                      </div>
                                      :
                                      <>
                                      {/*The current account is the bidder*/
                                      (account.account==auction.bidder_id ? 
                                       <div className="w-full flex ">
                                         <button
                                           className="w-full content-center justify-center text-center font-bold text-white bg-yellow2 border-0 focus:outline-none hover:bg-yellow   font-raleway text-base rounded-xlarge p-2 h-[44px] "
                                           onClick={async () => { processCancelBidOffer() }}>
                                           <span className="font-raleway">{t("Detail.cancelBid")}</span>
                                         </button>
                                       </div>
                                       :
                                       ""
                                      )}
                                     </>
                                   )}
                                  </div> : 
                                  <>
                                  {/*There is NOT active offers for this auctions*/}
                                  {(account.account==auction.nft_owner  && auction.status != 'Canceled' ?
                                      /*The current account is the nft owner*/
                                      <div className="w-full p-2">
                                        <button
                                          className="w-full content-center justify-center text-center font-bold text-white bg-yellow2 border-0  focus:outline-none hover:bg-yellow   font-raleway text-base rounded-xlarge p-2"
                                          onClick={async () => { processCancelBidOffer() }}>
                                          <span className="font-raleway">{t("auction.au_cancelAuction")}</span>
                                        </button>
                                      </div>
                                      :
                                      <>
                                      </>)
                                    }
                                  </>
                                )}
                                </> :
                                <>
                                {/*Auction Finished*/ /*There is active offers for this auction*/
                                (auctionBids.length > 0 ? 
                                <>
                                {account.account == auction.bidder_id && auction.status != 'Claimed' ? <>
                                  <div className="flex flex-col py-2 ">
                                    <div className="flex justify-around ">
                                      <div className="text-black   font-raleway text-sm"><span className="font-bold">{t("auction.au_msgAuctionEnded")}</span></div>
                                    </div>
                                    <div className="w-full p-2">
                                        <button
                                          className="w-full content-center justify-center text-center font-bold text-white bg-yellow2 border-0  focus:outline-none hover:bg-yellow   font-raleway text-base rounded-xlarge p-2"
                                          onClick={async () => { processClaimNFT() }}>
                                          <span className="font-raleway">{t("auction.au_claim")}</span>
                                        </button>
                                      </div>
                                  </div>
                                </> : "" }
                                </> 
                                : 
                                        <>
                                          {/*There is NOT offers for this auction*/
                                            account.account == auction.nft_owner && auction.status != 'Canceled'?
                                              <div className="flex flex-col py-2">
                                                <div className="flex justify-around">
                                                  <div className="text-black   font-raleway text-sm"><span className="font-bold">{t("auction.au_alreadyEnded")}</span></div>
                                                </div>
                                                <div className="w-full">
                                                  <button
                                                    className="w-full content-center justify-center text-center font-bold text-white bg-yellow2 border-0  focus:outline-none hover:bg-yellow   font-raleway text-base rounded-xlarge p-2"
                                                    onClick={async () => { processCancelBidOffer() }}>
                                                    <span className="font-raleway">{t("auction.au_cancelAuction")}</span>
                                                  </button>
                                                </div>
                                              </div>
                                              : ""
                                          }
                                        </>)}
                                </>
                              )}
                                {account.account != auction.nft_owner && dayjs.unix(auction.auction_deadline).format("DD/MMM/YYYY HH:mm:ss") > dayjs(new Date()).format("DD/MMM/YYYY HH:mm:ss") ?
                                  <div className="flex flex-row flex-wrap justify-around text-center h-[44px]">
                                    <button
                                      className={`w-full content-center justify-center text-center  text-white bg-yellow2 border-0 py-2 px-6 focus:outline-none hover:bg-yellow rounded-xlarge font-raleway font-bold text-base`}
                                      onClick={async () => {
                                        makeAnOffer();
                                      }}
                                    >
                                      {t("auction.au_bid")}
                                    </button>
                                  </div> : ""}
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
          </div>
          <div className="flex flex-col text-center w-full px-4">
            <div className="w-full  px-2  sm:px-0">
              <div className="w-full " key={1}>
                <div className="flex flex-row  mb-10 md:mb-0  justify-center " >
                  <div className="trending-token w-full rounded-20 ">
                    <div className=" bg-white rounded-20 h-auto flex flex-col auction">
                    
                      {auctionBids.length != 0 ? 
                        <Accordion title={t("auction.au_bids")} className="rounded-xlarge bg-white" show="true">
                          <div className="flex flex-wrap">
                          {auctionBids.map((bid, key) => {
                            return (
                              <div className="w-full flex  flex-col bg-white" key={key}>
                                {key == 0 ? <>
                                  <div className="flex">
                                    <p className="font-bold text-center text-darkgray py-2 border-b-2 border-gray-200 w-1/2">{t("auction.au_bidAmount")}</p>
                                    <p className="font-bold text-center text-darkgray py-2 border-b-2 border-gray-200 w-1/2">{t("auction.au_bidder")}</p>
                                  </div>
                                  <div className="flex">
                                    <p className="py-2 border-b-2 border-gray-200 w-1/2 text-darkgray">{fromYoctoToNear(bid.bid_amount)} Ⓝ{ }</p>
                                    <p className="py-2 border-b-2 border-gray-200  w-1/2 text-darkgray">{bid.bidder_id}</p>
                                  </div>
                                </> :
                                  <>
                                    <div className="flex bg-white py-4 border-b-2 border-gray-200">
                                      <p className="py-2 border-b-2 border-gray-200 w-1/2 text-darkgray">{fromYoctoToNear(bid.bid_amount)} Ⓝ{ }</p>
                                      <p className="py-2 border-b-2 border-gray-200 w-1/2 text-darkgray">{bid.bidder_id}</p>
                                    </div>
                                  </>
                                }

                              </div>
                            )
                          })}
                          </div>
                        </Accordion>
                      : <>{t("auction.au_noOffer")}</>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <BidModal {...bidModal} {...auction} />
    </section>
  );
}
export default AuctionFunction;
          