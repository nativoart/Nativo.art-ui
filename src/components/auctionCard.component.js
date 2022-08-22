import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getNearContract, fromYoctoToNear, getNearAccount } from "../utils/near_interaction";
import dayjs from 'dayjs';


function AuctionCard(nft) {
  const [t, i18n] = useTranslation("global");

  const [dates, setDates] = useState({
    deadline: "",
    current: "",
    diffFromDeadline: ["0", "0", "0", "0"]
  });


  React.useEffect(() => {
    (async () => {
      console.log('props', nft);
    })();

  }, []);

  
  function updateTime() {
    let remaining = "";
    let dead = new Date(nft.auction_deadline);
    let curent = new Date();
    const difference = dead - curent;
    if (difference > 0) {
      const parts = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
      remaining = Object.keys(parts).map(part => {
        return `${parts[part]}`;  
        });
        setDates({...dates, diffFromDeadline: remaining})
    }
  }
  setInterval(updateTime, 1000);

  return (
    <>
      <div className="w-full md:w-1/4 p-4  " key={nft.id}>
        <a
          href={"/auction/" + nft.id}
        >
          <div className="flex flex-col  mb-10 md:mb-0  justify-center " >
            <div className="trending-token w-full rounded-20 hover:shadow-yellow1   hover:scale-105 ">
              <div className="h-[20px]  bg-ended w-full flex justify-center p-4 rounded-t-20  items-center  text-white font-bold text-xl" >{t("auction.au_ended")}</div>
              <div className=" bg-white rounded-b-20 h-[365px] flex flex-col">
                <div className="w-full flex ">
                  <img
                    className="object-contain object-center h-[15rem]  bg-center m-auto"
                    src={`https://nativonft.mypinata.cloud/ipfs/${nft.nft_media}`}
                    alt={nft.description}
                  />
                </div>
                <div className="px-6  flex flex-col w-full ">
                  <div className="flex justify-around flex-col">

                    <div className="text-black text-sm font-raleway font-normal text-left text-ellipsis overflow-hidden whitespace-nowrap "><span className="text-xs">{t("auction.au_end")} </span>
                      <div className="flex justify-around">
                      {(dayjs.unix(nft.auction_deadline / 1000).format("DD/MMM/YYYY HH:mm:ss") > dayjs(new Date()).format("DD/MMM/YYYY HH:mm:ss") && nft.status != 'Canceled' ?
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
                    <div className="text-black  text-lg  font-raleway font-normal   text-left text-ellipsis overflow-hidden whitespace-nowrap py-2 flex justify-around"><span className="font-semibold text-sm">{t("auction.au_price")} </span><span className="text-right text-orange  font-raleway font-bold rounded-ful">{fromYoctoToNear(nft.auction_base_requested)} NEAR</span> </div>
                    <div className="flex  w-full text-left justify-end">
                      <div className="font-raleway text-xs text-right text-ellipsis overflow-hidden">{t("tokCollection.createdBy")} <a href={`profile/${nft.nft_owner}`} className="font-raleway text-xs font-bold text-blue2">{nft.nft_owner}</a></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a>
      </div>
    </>
  );
}


export default AuctionCard;
