import { html, Controller } from '/js/binder.js';

class GameView extends Controller {
    init() {
        this.headline = {
            text: "Pentagon Pleasantly Surprised To Discover ISIS Leader Killed During Indiscriminate Bombing Of Middle East",
            source: "https://www.theonion.com/pentagon-pleasantly-surprised-to-discover-isis-leader-k-1848475901",
            isOnion: true,
        };

        this.score = {
            correct: 0,
            total: 0,
        };
    }

    renderSelf() {
        this.root.innerHTML = html`
            <div class="text-center">
                <p>Current Score: ${this.score.correct.toString()}/${this.score.total.toString()}</p>

                <h3 class="headline">${this.headline.text}</h3>

                <p>Was it...<a @click.eval="this.setAnswer(true)">The Onion</a> or <a @click.eval="this.setAnswer(false)">not The Onion</a>?</p>
            </div>
        `;

        this.rebind();
    }

    setAnswer(isOnion) {
        this.score.total++;
        if (isOnion === this.headline.isOnion) {
            this.score.correct++;
        }

        this.nextHeadline();
        this.render();
    }

    nextHeadline() {
        // TODO
    }
}

export { GameView };
