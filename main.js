const api_url = (after, before) => `https://api.pushshift.io/reddit/submission/search/?subreddit=wallstreetbets&after=${after}&before=${before}&size=250`;

let tickers_ranking = new Map();

let after = 1660867200;
let before = 1660953600;

getApiData(api_url(after, before));

async function getApiData(url) {

    const response = await fetch(url);

    var data = await response.json();
    rankTickers(data);
    if (data.data.length === 250) {
        getApiData(api_url(data.data.slice(-1)[0].created_utc + 1, before));
    }
}

function rankTickers(data) {
    ticker_regex = "\\b[A-Z]{1,5}\\b";
    for (let r of data.data) {
        let content = r.title + " " + r.selftext;
        let tickers = new Set(content.match(ticker_regex));
        for (let t of tickers) {
            if (tickers_ranking.has(t)) {
                tickers_ranking.set(t, tickers_ranking.get(t) + 1);
            } else {
                tickers_ranking.set(t, 1);
            }
        }
    }
    show(tickers_ranking);
}

function hideLoader() {
    document.getElementById('loader').style.display = 'none';
}

function show(tickers) {
    let tab =
        `<tr>
          <th>Ticker</th>
          <th>Mentions</th>
         </tr>`;

    // Loop to access all rows 
    for (let t of tickers.keys()) {
        tab += `<tr> 
    <td>${t} </td>
    <td>${tickers.get(t)}</td>       
</tr>`;
    }
    // Setting innerHTML as tab variable
    document.getElementById("tickers").innerHTML = tab;
}