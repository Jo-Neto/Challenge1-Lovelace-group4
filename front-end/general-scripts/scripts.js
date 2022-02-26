const boardModalContent = [
    `<div id="modal-logoff" class="common-modal">
        <h3>DESEJA SAIR?</h3>
        <div class="row-direction">
            <a class="btn-back-to-home">
                <button id="btn-modal-logoff" class="btn-modal">SAIR</button>
            </a>
            <button id="btn-modal-cancel" class="btn-modal" onclick="closeModal('modal-logoff')">CANCELAR</button>
        </div>
    </div>`,
    `<div id="modal-general" class="common-modal">
        <h3 id="description-modal"></h3>
        <div class="row-direction">
            <a class="btn-back-to-home">
                <button id="btn-modal-logoff" class="btn-modal">HOME</button>
            </a>
        </div>
    </div>`,
    `<div id="modal-rules">
        <img onclick="closeModal('modal-rules')" src="./board-assets/close_white_24dp.svg" id="rules-close">
        <h2>Regras do jogo</h2>
        <p>Elemental Clash é um jogo de cartas dividido em turnos e composto por dois baralhos de elementos. Cada jogador recebe um baralho de 14 cartas, sendo 4 cartas do elemento água, 4 do fogo, 4 de planta e 2 de éter. Dessas 14 cartas, 3 são sorteadas e colocadas na mão do jogador.</p>
        <p>Para jogá-lo, um jogador deve jogar uma carta e aguardar o oponente jogar a carta dele, ao jogar, verifica-se qual das cartas venceram e então o jogador que venceu ganha 1 ponto e será o primeiro a jogar na rodada seguinte. O jogador que ganhar 5 pontos primeiro vence o duelo.</p>
        <p>A ordem de qual elemento ganha de qual outro elemento é mostrado na imagem abaixo, fogo vence planta, planta vence água e água vence fogo e por fim, o éter vence todos os outros elementos (use-o com sabedoria).</p>
        <img id="img-rules" src="./board-assets/img-rules.png" alt="Imagem para ilustrar a relação entre as cartas">
        <p>Caso os dois jogadores joguem um mesmo elemento, isso causará um empate e ninguém irá pontuar na rodada, então o jogador que foi o primeiro a jogar na rodada anterior será o primeiro a jogar novamente.
            <br />
            Divirta-se!!!</p>
    </div>`,
    `<div id="modal-devs">
        <img onclick="closeModal('modal-devs')" id="devs-close" src="./board-assets/close_white_24dp.svg">
        <h2>Nossos Desenvolvedores</h2>
        <table id="social-media">
            <tbody>
                <tr>
                    <td>Fabrício Rodrigues</td>
                    <td>
                        <a href="https://www.linkedin.com/in/fabr%C3%ADcio-rodrigues-pereira-68b844227/" target="_blank"><img class="linkedin-logo" src="./board-assets/linkedin.png"> Linkedin</a>
                        <br />
                        <a href="https://github.com/SkyvengerLL" target="_blank"><img class="linkedin-logo" src="./board-assets/github.png"> GitHub</a>
                    </td>
                </tr>
                <tr>
                    <td>Fernando Ribeiro</td>
                    <td>
                        <a href="https://www.linkedin.com/in/fernando-ribeiro-b28342143/" target="_blank"><img class="linkedin-logo" src="./board-assets/linkedin.png"> Linkedin</a>
                        <br />
                        <a href="https://github.com/Ferr50" target="_blank"><img class="linkedin-logo" src="./board-assets/github.png"> GitHub</a>
                    </td>
                <tr>
                    <td>Flávia Souza</td>
                    <td>
                        <a href="https://www.linkedin.com/in/ridailda/" target="_blank"><img class="linkedin-logo" src="./board-assets/linkedin.png"> Linkedin</a>
                        <br />
                        <a href="https://github.com/flaaaaaavis" target="_blank"><img class="linkedin-logo" src="./board-assets/github.png"> GitHub</a>
                    </td>
                <tr>
                    <td>José Neto</td>
                    <td>
                        <!-- <a href="" target="_blank"><img class="linkedin-logo" src="./board-assets/linkedin.png"> Linkedin</a>
                        <br /> -->
                        <a href="https://github.com/Jo-Neto" target="_blank"><img class="linkedin-logo" src="./board-assets/github.png"> GitHub</a>
                    </td>
                </tr>
                <tr>
                    <td>Vinícius Noronha</td>
                    <td>
                        <a href="https://www.linkedin.com/in/vinicius-noronha-1540b2184/" target="_blank"><img class="linkedin-logo" src="./board-assets/linkedin.png"> Linkedin</a>
                        <br />
                        <a href="https://github.com/viniciusna" target="_blank"><img class="linkedin-logo"  src="./board-assets/github.png"> GitHub</a>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>`,
    `<div id="modal-victory" class="modal">
        <h3>Vitória!</h3>
        <div class="row-direction">
            <a class="btn-back-to-home">
                <button id="btn-modal-logoff" class="btn-modal">Home</button>
            </a>
        </div>
    </div>`,
    `<div id="modal-defeat" class="modal">
        <h3>Derrota!</h3>
        <div class="row-direction">
            <a class="btn-back-to-home">
                <button id="btn-modal-logoff" class="btn-modal">Home</button>
            </a>
        </div>
    </div>`,
    `<div id="modal-disconnected" class="modal">
        <h3>Oponente se desconectou</h3>
        <div class="row-direction">
            <a class="btn-back-to-home">
                <button id="btn-modal-logoff" class="btn-modal">Home</button>
            </a>
        </div>
    </div>`,
    `<div id="modal-give-up" class="modal">
        <h3>Oponente desistiu</h3>
        <div class="row-direction">
            <a class="btn-back-to-home">
                <button id="btn-modal-logoff" class="btn-modal">Home</button>
            </a>
        </div>
    </div>`,
    `<div id="modal-opponent-cheat" class="modal">
        <h3>Oponente trapaceou</h3>
        <span>partida finalizada</span>
        <div class="row-direction">
            <a class="btn-back-to-home">
                <button id="btn-modal-logoff" class="btn-modal">Home</button>
            </a>
        </div>
    </div>`,
    `<div id="modal-no-match" class="modal">
        <h3>Você não está em nenhuma partida</h3>
        <div class="row-direction">
            <a class="btn-back-to-home">
                <button id="btn-modal-logoff" class="btn-modal">Home</button>
            </a>
        </div>
    </div>`,
    `<div id="modal-cheat" class="modal">
        <h3>Você trapaceou :( <br> partida encerrada</h3>
        <div class="row-direction">
            <a class="btn-back-to-home">
                <button id="btn-modal-logoff" class="btn-modal">Home</button>
            </a>
        </div>
    </div>`,      
    `<div id="modal-unknow-error" class="modal">
        <h3>Ocorreu algum erro, volte para a home</h3>
        <div class="row-direction">
            <a class="btn-back-to-home">
                <button id="btn-modal-logoff" class="btn-modal">Home</button>
            </a>
        </div>
    </div>`
]

const homeModalContent = [
    `<div id="modal-loading">
        <h3>Buscando adversário digno</h3>
        <img src="./home-assets/loading.gif">
    </div>`,
    `<div id="modal-timeout">
        <h3>Nenhum player encontrado</h3>
        <span>Recarregue a página e busque novamente</span>
    </div>`
]

function setModalContent(modalContainer, content, borderColor) {
    const modal = document.getElementById(modalContainer);
    modal.innerHTML(content);
    modal.style.border = borderColor;
    modal.style.visibility = "visible";
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.visibility = "hidden";
}

// function flipCard() {
//     const card = document.querySelector(".flip-card .flip-card-inner");
//     card.style.transform = "rotateY(180deg)";
// }

