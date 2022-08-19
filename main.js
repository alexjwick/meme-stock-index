const api_url = (after, before) => `https://api.pushshift.io/reddit/submission/search/?subreddit=wallstreetbets&after=${after}&before=${before}&size=500`;

async function getApi(url) {

    const response = await fetch(url);

    var data = await response.json();
    console.log(data);
    if (response) {
        hideLoader();
    }
    tickers = getTickers(data);
    show(tickers);
}

getApi(api_url("2022-08-19", "2022-08-20"));

function hideLoader() {
    document.getElementById('loader').style.display = 'none';
}

function getTickers(data) {
    ticker_regex = "\\b[A-Z]{1,5}\\b";
    let tickers_ranking = new Map();
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
    return tickers_ranking;
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