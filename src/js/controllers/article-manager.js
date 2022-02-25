function toTitleCase(str) {
    return str.replace(
        /\w\S*/g,
        function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
    );
}


class ArticleManager {

    constructor() {
        const today = new Date().toISOString().substring(0,10);

        this.articles = [];
        this.articleCounts = {
            theonion: 0,
            nottheonion: 0,
        };

        // Keep track of the last seen reddit posts so we don't show them again
        this.lastSeen = { 
            date: today,
            "theonion": null,
            "nottheonion": null,
        };

        let seen = localStorage.getItem("lastSeenPosts");

        if (seen != null) {
            let parsed = JSON.parse(seen);
            if (this.lastSeen.date < today) {
                this.lastSeen = parsed;
            }
        }
    }

    async init() {
        await this.fetchArticles("theonion");
        await this.fetchArticles("nottheonion");
        this.shuffle();
    }

    /**
     * Load posts from a given subreddit
     * @param {string} subreddit The subreddit to load posts from
     */
    async fetchArticles(subreddit) {
        const limit = 10;
        let url = `/reddit/${subreddit}?limit=${limit}`;

        if (this.lastSeen[subreddit]) {
            url = `${url}&after=${this.lastSeen[subreddit]}`;
        }

        // TODO: Change this to new URL
        if (window.location.hostname === "localhost") {
            url = `https://onionornot.app${url}`;
        }

        try {
            let response = await fetch(url);
            let json = await response.json();

            json.data.children.forEach(child => {
                let article = {
                    subreddit: subreddit,
                    text: toTitleCase(child.data.title),
                    source: child.data.url,
                    domain: child.data.domain,
                    isOnion: subreddit === "theonion",
                };
                this.articles.push(article);

                this.lastSeen[subreddit] = child.data.name;
                this.articleCounts[subreddit]++;
            });
        } catch (err) {
            console.log(`[ERR] Failed to fetch reddit posts from ${url}: ${err}`);
        }
    }

    /**
     * Grab the next article from the list
     * If our article cache is running low then top it up
     */
    getNextArticle() {
        // Check if we need to refill our list of articles
        console.log(this.articleCounts)
        Object.keys(this.articleCounts).forEach(async subreddit => {
            if (this.articleCounts[subreddit] <= 10) {
                this.fetchArticles(subreddit).then(() => {
                    // TODO: Should find a better way to store seen posts
                    // The current method can at worst hide 19 posts since you could answer the last post first
                    // then leave the page, the next page load will fetch posts after that last post
                    localStorage.setItem('lastSeenPosts', JSON.stringify(this.lastSeen));
                    this.shuffle();
                });
            }
        });

        // Our list is shuffled so we can just return the last item
        let article = this.articles.pop();
        this.articleCounts[article.subreddit]--;
        return article;
    }

    /**
     * Shuffle all articles using Fisher-Yates algorithm
     */
    shuffle() {
        for (let i = 0; i < this.articles.length; i++) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.articles[i], this.articles[j]] = [this.articles[j], this.articles[i]];
        }
    }
}


export { ArticleManager };
