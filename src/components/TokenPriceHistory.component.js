/* global BigInt */
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useWalletSelector } from "../utils/walletSelector";
import { ApolloClient, InMemoryCache, gql } from '@apollo/client'
import { date } from "yup";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Chart, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)


function TokenPriceHistory(props) {
  const [t, i18n] = useTranslation("global");
  const { selector, modal, accounts, accountId } = useWalletSelector();
  const [fecha, setFecha] = useState("");
  const [historyByWeek, setHistoryByWeek] = useState({});
  const [dataChart, setdataChart] = useState({});

  /**
   * Función que cambia a "no disponible" un token nft que esta a la venta siempre que se sea el owner
   * @param tokenId representa el token id del nft a quitar del marketplace
   * @return void
   */

  const APIURL= process.env.REACT_APP_API_TG

  const labels = ['Monday', 'Tuesday', 'Wednesday', 'Thurday', 'Friday', 'Saturday', 'Monday'];
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  const data = {
  labels,
  datasets: [
    {
      data: ['100','102','103','104','105'],
      borderColor: '#F79336',
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
    }
  ],
};


  function getDay(timestamp) {
  console.log('getday',timestamp.getDay());
  return timestamp.getDay();
}

  function getMonth(timestamp) {
  console.log('getMonth', timestamp.getMonth());
 return timestamp.getMonth();
}

  React.useEffect(() => {
    (async () => {
        const query = `
          query($tokenID: String, $todayTimeStamp: String, $weekTimeStamp: String){
            tokens (where : {id : $tokenID}){
              id
              collectionID
              timestamp
              priceHistory(orderBy: timestamp, orderDirection: asc, where: { timestamp_gte: $weekTimeStamp, timestamp_lte: $todayTimeStamp}){
                price
                type
                timestamp
              }
            }
          }
        `
        const client = new ApolloClient({
          uri: APIURL,
          cache: new InMemoryCache(),
        })
        let days = 20;
        console.log('todayTimeStamp',new Date().getTime()+"000000");
        console.log('weekTimeStamp',(new Date().getTime() - ((days * 24 * 60 * 60 * 1000)))+"000000")

        await client.query({
          query: gql(query),
          variables: {
            tokenID: props.tokenID,
            todayTimeStamp : new Date().getTime()+"0000000000",
            weekTimeStamp: (new Date().getTime() - ((days * 24 * 60 * 60 * 1000)))+"000000",
          }
        })
          .then((data) => {
            console.log('token Data: ', data.data.tokens)
            let dateFormat = new Date(parseInt(data.data.tokens[0].timestamp.substring(0,13)))
            setFecha(dateFormat.getDate()+'/'+(dateFormat.getMonth()+1)+'/'+dateFormat.getFullYear())
            let ArrhistoryByWeek = [];
            let historyByWeek = data.data.tokens[0].priceHistory.map( function(e) { 
              ArrhistoryByWeek.push({ 'price': e.price, 'type': e.type, 'fullTimestamp': new Date(parseInt(e.timestamp.substring(0,13))), 'Daytimestamp': getDay(new Date(parseInt(e.timestamp.substring(0,13)))), 'MonthTimestamp': getMonth(new Date(parseInt(e.timestamp.substring(0,13))))})
              return { 'price': e.price, 'type': e.type, 'fullTimestamp': new Date(parseInt(e.timestamp.substring(0,13))), 'Daytimestamp': getDay(new Date(parseInt(e.timestamp.substring(0,13)))), 'MonthTimestamp': getMonth(new Date(parseInt(e.timestamp.substring(0,13))))}
            })

            let historyGrouped  = ArrhistoryByWeek.reduce((x, y) => {

              console.log('x[y.Daytimestamp]',x[y.Daytimestamp]);
              console.log('Y',y);
              (x[y.Daytimestamp] = x[y.Daytimestamp] || []).push(y);

              return x;

          }, {});

            console.log('historyGrouped',historyGrouped);
            let lastPricebyDay = {}

            for (var i = 1; i <= 7; i++) {
              
              
              if (historyGrouped[i] != undefined) {
                historyGrouped[i].map((rank, i, arr) => {
                  if (arr.length - 1 === i) {
                    lastPricebyDay[i].push(rank.price)// = {...lastPricebyDay, rank.price }// last one
                  } else {
                    lastPricebyDay[i].push(undefined) // not last one
                  }
              });
            }
          }
          console.log(lastPricebyDay);

            console.log('lastPricebyDay',lastPricebyDay);
            setHistoryByWeek(historyByWeek);

          })
          .catch((err) => {
            console.log('error: ', err)
          })

    })();
  }, []);



  return (
    <section className="w-full relative text-[#0A0A0A] bg-white">
      {console.log("props", props)}
      
      <div className="w-full font-open-sans rounded-xl">
        <details className="duration-300" open>
          <summary class="py-6 text-base list-none font-bold">
            <div className="flex flex-row px-[26px] place-content-between">
              <div className="flex">
                <svg
                  className="h-[20px] w-[20px]"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="#0A0A0A"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 15H11V9H9V15ZM10 7C10.2833 7 10.521 6.904 10.713 6.712C10.9043 6.52067 11 6.28333 11 6C11 5.71667 10.9043 5.479 10.713 5.287C10.521 5.09567 10.2833 5 10 5C9.71667 5 9.47933 5.09567 9.288 5.287C9.096 5.479 9 5.71667 9 6C9 6.28333 9.096 6.52067 9.288 6.712C9.47933 6.904 9.71667 7 10 7ZM10 20C8.61667 20 7.31667 19.7373 6.1 19.212C4.88333 18.6873 3.825 17.975 2.925 17.075C2.025 16.175 1.31267 15.1167 0.788 13.9C0.262667 12.6833 0 11.3833 0 10C0 8.61667 0.262667 7.31667 0.788 6.1C1.31267 4.88333 2.025 3.825 2.925 2.925C3.825 2.025 4.88333 1.31233 6.1 0.787C7.31667 0.262333 8.61667 0 10 0C11.3833 0 12.6833 0.262333 13.9 0.787C15.1167 1.31233 16.175 2.025 17.075 2.925C17.975 3.825 18.6873 4.88333 19.212 6.1C19.7373 7.31667 20 8.61667 20 10C20 11.3833 19.7373 12.6833 19.212 13.9C18.6873 15.1167 17.975 16.175 17.075 17.075C16.175 17.975 15.1167 18.6873 13.9 19.212C12.6833 19.7373 11.3833 20 10 20ZM10 18C12.2333 18 14.125 17.225 15.675 15.675C17.225 14.125 18 12.2333 18 10C18 7.76667 17.225 5.875 15.675 4.325C14.125 2.775 12.2333 2 10 2C7.76667 2 5.875 2.775 4.325 4.325C2.775 5.875 2 7.76667 2 10C2 12.2333 2.775 14.125 4.325 15.675C5.875 17.225 7.76667 18 10 18Z"
                    fill="#0A0A0A"
                  />
                </svg>
                <p className="pl-3.5">{t("Detail.c-historial")}</p>
              </div>
              <div className="flex h-[24px] w-[24px] rotate-180">
                <svg
                  className=""
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="#0A0A0A"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g mask="url(#mask0_1567_19245)">
                    <path
                      d="M7.4 15.3751L6 13.9751L12 7.9751L18 13.9751L16.6 15.3751L12 10.7751L7.4 15.3751Z"
                      fill="#0A0A0A"
                    />
                  </g>
                </svg>
              </div>
            </div>
          </summary>
          <div class="bg-white flex flex-col md:flex-row p-6 border-t-2">
            <Line data={data} options={options}/>
          </div>
        </details>
      </div>
    </section>
  );
}

export default TokenPriceHistory;
