import { html, Controller } from '/js/binder.js';
import { ArticleManager } from '/js/controllers/article-manager.js';

class GameView extends Controller {
    async init() {
        // Flag to indicate answer has been given but next article is not loaded
        this.pendingNext = false;

        this.articleManager = new ArticleManager();
        await this.articleManager.init();

        // Score tracker
        this.score = {
            correct: 0,
            total: 0,
        };

        this.innerHTML = html`
            <div class="text-center">
                <section id="score"></section>
                <section id="article"></section>
                <section id="control"></section>
            </div>
        `;

        this.loadNextArticle();
    }

    render() {
        this.querySelector("#control").innerHTML = ``;

        this.querySelector("#score").innerHTML = html`
            <p>Current Score: ${this.score.correct.toString()}/${this.score.total.toString()}</p>
        `;

        this.querySelector("#article").innerHTML = html`
            <h3 class="article">${this.article.text}</h3>

            <p>Was it...<a @click.eval="this.setAnswer(true)">The Onion</a> or <a @click.eval="this.setAnswer(false)">not The Onion</a>?</p>
        `;

        this.rebind();
    }

    setAnswer(guessOnion) {
        if (this.pendingNext) return;
        this.pendingNext = true;

        this.score.total++;

        const wasCorrect = guessOnion == this.article.isOnion;
        if (wasCorrect) this.score.correct++;

        let message = "";
        if (wasCorrect) {
            message = `Correct! It is ${this.article.isOnion ? "The Onion" : "not The Onion"}!`;
        } else {
            message = `Incorrect! It is ${this.article.isOnion ? "The Onion" : "not The Onion"}!`;
        }

        this.render();

        this.querySelector("#control").innerHTML = html`
            <hr />

            <div class="text-center">${message}</div>
            <div class="text-center"><a href="${this.article.source}">Read the story</a></div>

            <br />
            <button @click="this.loadNextArticle()">Next</button>
        `;

        this.rebind();
    }

    loadNextArticle() {
        this.article = this.articleManager.getNextArticle();
        this.pendingNext = false;
        this.render();
    }
}

export { GameView };
