const api_url = (after, before) => `https://api.pushshift.io/reddit/submission/search/?subreddit=wallstreetbets&after=${after}&before=${before}&size=250`;

const tickers_blacklist = ["WSB", "HODL", "APES", "BUY", "YOLO", "FUD", "YOU", "THE", "NOT", "HOLD", "APE", "ALL", "TLDR", "LFG", "SEC", "FUCK", "MSM", "FOMO", "BABY", "HALT", "STFU", "IRA", "SELL", "WISH", "FROM", "BLUE", "AND", "ARE", "USD", "FOR", "WTF", "WHAT", "PSA", "CEO"];

let tickers_ranking = new Map();

const before = Math.floor(Date.now() / 1000);
const after = before - 86400; // 24 hours ago

getApiData(api_url(after, before));

async function getApiData(url) {
    var response;
    try {
        response = await fetch(url);
    } catch (error) {
        getApiData(url);
        return;
    }

    var data = await response.json();
    console.log("Unix timestamp of last post: " + data.data.slice(-1)[0].created_utc);
    rankTickers(data);
    updatePercentage(data.data.slice(-1)[0].created_utc);
    if (data.data.length === 250) {
        getApiData(api_url(data.data.slice(-1)[0].created_utc + 1, before));
    } else {
        hideLoader();
        show(tickers_ranking);
    }
}

function rankTickers(data) {
    ticker_regex = "\\b[A-Z]{3,4}\\b";
    for (let r of data.data) {
        let content = r.title + " " + r.selftext;
        let tickers = new Set(content.match(ticker_regex));
        for (let t of tickers) {
            if (!tickers_blacklist.includes(t)) {
                if (tickers_ranking.has(t)) {
                    tickers_ranking.set(t, tickers_ranking.get(t) + 1);
                } else {
                    tickers_ranking.set(t, 1);
                }
            }
        }
    }
}

function updatePercentage(current_timestamp) {
    let percent = 100 - Math.floor((before - current_timestamp) / 86400 * 100);
    document.getElementById("percentage").innerHTML = percent;
}

function hideLoader() {
    document.getElementById('loader').style.display = 'none';
}

function show(tickers) {
    let tickers_sorted = new Map([...tickers.entries()].sort((a, b) => b[1] - a[1]));
    let tab =
        `<tr>
          <th>Rank</th>
          <th>Ticker</th>
          <th>Mentions</th>
         </tr>`;

    let rank = 1;
    for (let t of tickers_sorted.keys()) {
        tab += `<tr>
    <td>${rank}</td>
    <td>${t}</td>
    <td>${tickers_sorted.get(t)}</td>       
</tr>`;
        if (rank === 20) {
            break;
        }
        rank += 1;
    }

    document.getElementById("tickers").innerHTML = tab;
}