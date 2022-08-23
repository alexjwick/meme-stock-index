const api_url = (after, before) => `https://api.pushshift.io/reddit/submission/search/?subreddit=wallstreetbets&after=${after}&before=${before}&size=250`;

const tickers_blacklist = ["WSB", "HODL", "APES", "BUY", "YOLO", "FUD", "YOU", "THE", "NOT", "HOLD", "APE", "ALL", "TLDR", "LFG", "SEC", "FUCK", "MSM", "FOMO", "BABY", "HALT", "STFU", "IRA", "SELL", "WISH", "FROM", "BLUE", "AND", "ARE", "USD", "FOR", "WTF", "WHAT", "PSA", "CEO"];

let tickers_mentions = new Map();
let tickers_mentions_prev = new Map();

const before = Math.floor(Date.now() / 1000);
const after = before - 172800; // 48 hours ago
const time_split = before - 86400; // 24 hours ago

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
        showRankings();
    }
}

function rankTickers(data) {
    ticker_regex = "\\b[A-Z]{3,4}\\b";
    for (let r of data.data) {
        let content = r.title + " " + r.selftext;
        let tickers = new Set(content.match(ticker_regex));
        let map;
        if (r.created_utc > time_split) {
            map = tickers_mentions;
        } else {
            map = tickers_mentions_prev;
        }
        for (let t of tickers) {
            if (!tickers_blacklist.includes(t)) {
                if (map.has(t)) {
                    map.set(t, map.get(t) + 1);
                } else {
                    map.set(t, 1);
                }
            }
        }
    }
}

function updatePercentage(current_timestamp) {
    let percent = 100 - Math.floor((before - current_timestamp) / 172800 * 100);
    document.getElementById("percentage").innerHTML = percent;
}

function hideLoader() {
    document.getElementById('loader').style.display = 'none';
}

function showRankings() {
    let tickers_ranking = new Map([...tickers_mentions.entries()].sort((a, b) => b[1] - a[1]));
    let tab =
        `<tr>
          <th>Rank</th>
          <th>Ticker</th>
          <th>Mentions</th>
          <th>% change</th>
         </tr>`;

    let rank = 1;
    for (let t of tickers_ranking.keys()) {
        tab += `<tr>
    <td>${rank}</td>
    <td>${t}</td>
    <td>${tickers_ranking.get(t)}</td>
    <td class="${getPercentChangeColor(t)}">${getPercentChangeFromYesterday(t)}%</td>       
</tr>`;
        if (rank === 20) {
            break;
        }
        rank += 1;
    }

    document.getElementById("tickers").innerHTML = tab;
}

function getPercentChangeFromYesterday(ticker) {
    if (tickers_mentions_prev.has(ticker)) {
        const percent_change = Math.floor(tickers_mentions.get(ticker) / tickers_mentions_prev.get(ticker) * 100) - 100;
        if (percent_change < 0) {
            return percent_change;
        } else {
            return "+" + percent_change;
        }
    } else {
        return "+&infin;";
    }
}

function getPercentChangeColor(ticker) {
    if (tickers_mentions_prev.has(ticker)) {
        const percent_change = Math.floor(tickers_mentions.get(ticker) / tickers_mentions_prev.get(ticker) * 100) - 100;
        if (percent_change < 0) {
            return "red";
        } else {
            return "green";
        }
    } else {
        return "green";
    }
}