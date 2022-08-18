import praw
from praw.models import MoreComments
import pandas as pd
import re
ticker_regex = '''\\b[A-Z]{1,5}\\b'''


class Main:
    def __init__(self) -> None:
        reddit_read_only = praw.Reddit(
            client_id="W71ECmNySgGS9SEvA6T_4w",
            client_secret="Tb7cjeuwjBE5ac_Yw1TfiIWJa_7LZw",
            user_agent="Meme Stock Index"
        )

        wallstreetbets = reddit_read_only.subreddit("wallstreetbets")

        daily_discussion = None

        for post in wallstreetbets.hot(limit=1):
            daily_discussion = post
        
        print(daily_discussion.title)

        tickers: dict[str, int] = {}

        print(len(daily_discussion.comments))

        for comment in daily_discussion.comments:
            if type(comment) == MoreComments:
                continue

            comment_tickers = self.get_tickers(comment)
            if len(comment_tickers) > 0:
                for ticker in comment_tickers:
                    if ticker in tickers.keys():
                        tickers[ticker] += 1
                    else:
                        tickers[ticker] = 1
        
        print(sorted(tickers.items(), key=lambda x: x[1], reverse=True))

        pass

    def get_tickers(self, comment):
        '''
        Splits the page text into a list of words and numbers, removing 
        punctuation and whitespace
        :param post: post to be tokenized
        :return: a list of words and numbers
        '''
        content: str = comment.body
        tickers: set[str] = set(re.findall(ticker_regex, content))
        return tickers

if __name__ == "__main__":
    Main()