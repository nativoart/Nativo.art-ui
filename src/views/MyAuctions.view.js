import  React, {useState, useEffect} from "react";
import {
  getNearAccount,
  ext_view,
  fromYoctoToNear
} from "../utils/near_interaction";
import InfiniteScroll from "react-infinite-scroll-component";
import dayjs from 'dayjs';
import AuctionCard from "../components/auctionCard.component";
import { Tab  } from "@headlessui/react";
import { useTranslation } from "react-i18next";


function MyAuctions() {
  const [t, i18n] = useTranslation("global");
  const [myAuctions, setMyAuctions] = useState({
    total_active: 0,
    all: [],
    hasMore: true,
    lastIDfetched: -1
  });
  const [index,setIndex] = React.useState(0);
  const [Landing, setLanding] = React.useState({
    tokensPerPage: 9
  });

  let isMounted = true;


  useEffect(() => {
    (async () => {
      let contract = process.env.REACT_APP_CONTRACT_AUCTIONS;
      let account = await getNearAccount();
      let payload = {};
      let total = [];
      let payload_all_supply = {
        account_id: account
      };
      total = await ext_view(contract, 'auction_supply_for_owner', payload_all_supply)

      if ((total-1) >= 0) {
        if((total-1)<=Landing.tokensPerPage){

          let payload = {
            account_id: account,
            from_index: (0).toString(),
            limit: parseInt(total)
          }
          let all_auctions = await ext_view(contract, 'auctions_for_owner', payload);
          if(isMounted){
            setIndex(0)
            setMyAuctions({ ...myAuctions, all: all_auctions.reverse()});
          }
         
        } else {
          let payload = {
            account_id: account,
            from_index: (total-Landing.tokensPerPage).toString(),
            limit: parseInt(Landing.tokensPerPage)
            
          };
          let allMyAuctions = await ext_view(contract, 'auctions_for_owner', payload);
          if(isMounted){
            setIndex((total - 1)-Landing.tokensPerPage)
            setMyAuctions({ ...myAuctions, all: myAuctions.all.concat(allMyAuctions.reverse())});
          }

        }
      }
    })();
  
    return () => {
       isMounted = false;
     }
  }, []);

  let fetchMoreAuctions = async () => {
    let contract = process.env.REACT_APP_CONTRACT_AUCTIONS;
    let account = await getNearAccount();

    let limit = true;
    let indexQuery;
    let lastLimit;
    if(index>Landing.tokensPerPage){
      indexQuery = index-Landing.tokensPerPage
      setIndex(index-Landing.tokensPerPage)
    }
    else{
      indexQuery=0
      lastLimit=parseInt(index)
      limit=false
      setIndex(0)
    }
    if (index<=0) {
      setMyAuctions({ ...myAuctions, hasMore: false});
      return;
    }
    let payload = {
      from_index: indexQuery.toString(),
      limit: (limit ? Landing.tokensPerPage: lastLimit),
      account_id: account
    }


    let all_auctions = await ext_view(contract, 'auctions_for_owner', payload);
    setMyAuctions({ ...myAuctions, all: myAuctions.all.concat(all_auctions.reverse())});
  }

  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }
  
  return (
    <section className="text-gray-600 body-font  dark:bg-darkgray ">
     {myAuctions.all.length !=0 ?  <InfiniteScroll
        dataLength={myAuctions.all}
        next={fetchMoreAuctions}
        hasMore={myAuctions.hasMore}
        loader={<h1 className="text-center w-full py-10 text-xl font-bold text-yellow2"> {t("auctions.au_loading")}</h1>}
        endMessage={
          <p className="text-center w-full py-10 text-xl text-yellow2">
            <b>{t("auctions.au_finish")}</b>
          </p>
        }
        className={"flex flex-wrap md:px-[40px]"}
      >
        {myAuctions.all.map((nft, key) => {
          return (
            <AuctionCard {...nft} key={key}></AuctionCard>
          )
        })}
      </InfiniteScroll>
      : 
        <div className="text-yellow2 text-2xl w-full text-center mt-6 font-bold">
          <p>{t("auctions.au_notAvailable")}</p>
        </div>
      }
    </section>
  );
}

export default MyAuctions;
