document.addEventListener('DOMContentLoaded', function() {
    const gameArea = document.querySelector('main');
    const obstacleContainer = gameArea.querySelector('.obstaculos');
    const bird = gameArea.querySelector('.passaro_voando');
    const bam = gameArea.querySelector('.bam');
    const collisionSound = new Audio('collision.mp3');
    const backgroundMusic = new Audio('background_music.mp3');
    const gameOverMusic = new Audio('gameover_music.mp3');
    const coracoesContainer = document.querySelector('.coracoes');
    const birdSize = 120;
    let obstacles = [];
    let gravity = 0.8;
    let velocity = 0;
    let lives = 3;
    let gameOverFlag = false;
    let collisionCooldown = false;
    const keysPressed = {};
    let obstacleGenerationInterval;
    let collisionDetectionInterval;

    // Função para reproduzir o som de colisão
    function playCollisionSound() {
        collisionSound.currentTime = 0; // Reinicia o som
        collisionSound.play();
    }

    // Função para iniciar a música de fundo
    function playBackgroundMusic() {
        backgroundMusic.play();
    }

    // Função para pausar a música de fundo
    function pauseBackgroundMusic() {
        backgroundMusic.pause();
    }

    // Função para tocar a música de game over
    function playGameOverMusic() {
        gameOverMusic.play();
    }

    // Função para detectar colisões
    function detectCollision() {
        if (gameOverFlag || collisionCooldown) return;

        const birdRect = bird.getBoundingClientRect();
        const adjustedBirdRect = {
            left: birdRect.left + birdSize * 0.15,
            right: birdRect.right - birdSize * 0.15,
            top: birdRect.top + birdSize * 0.15,
            bottom: birdRect.bottom - birdSize * 0.15,
        };

        obstacles.forEach(obstacle => {
            const obstacleRect = obstacle.getBoundingClientRect();
            const adjustedObstacleRect = {
                left: obstacleRect.left + obstacleRect.width * 0.15,
                right: obstacleRect.right - obstacleRect.width * 0.15,
                top: obstacleRect.top + obstacleRect.height * 0.15,
                bottom: obstacleRect.bottom - obstacleRect.height * 0.15,
            };

            if (
                adjustedBirdRect.left < adjustedObstacleRect.right &&
                adjustedBirdRect.right > adjustedObstacleRect.left &&
                adjustedBirdRect.top < adjustedObstacleRect.bottom &&
                adjustedBirdRect.bottom > adjustedObstacleRect.top
            ) {
                // Reproduz o som de colisão
                playCollisionSound();

                showBam(birdRect);
                lives--;
                updateLivesDisplay();
                if (lives <= 0) {
                    gameOver();
                }
                
                // Ativa o período de pausa após uma colisão
                collisionCooldown = true;
                setTimeout(() => {
                    collisionCooldown = false;
                }, 1000); // Tempo de pausa em milissegundos (1 segundo)
            }
        });
    }

// Função para gerar um obstáculo aleatório
function generateObstacle() {
    obstacles = []; // Limpa a matriz de obstáculos antes de gerar novos obstáculos

    const numberOfObstacles = Math.floor(Math.random() * 4) + 1; // Gera um número aleatório entre 1 e 4

    const generateWithDelay = (index) => {
        if (index < numberOfObstacles) {
            const obstacle = document.createElement('div');
            obstacle.classList.add('obstaculo');
            let top;
            
            // Verifica a sobreposição com obstáculos existentes
            do {
                top = Math.floor(Math.random() * (gameArea.clientHeight - 200));
                var overlap = obstacles.some(existingObstacle => {
                    const existingTop = parseInt(existingObstacle.style.top);
                    return Math.abs(existingTop - top) < 120; // Verifica se há sobreposição vertical
                });
            } while (overlap);

            obstacle.style.top = top + 'px';
            obstacle.style.right = '-80px';
            obstacleContainer.appendChild(obstacle);
            moveObstacle(obstacle);
            obstacles.push(obstacle);

            if (index > 0) {
                setTimeout(() => {
                    generateWithDelay(index + 1);
                }, 1000); // Atraso de 1 segundo entre obstáculos
            } else {
                generateWithDelay(index + 1);
            }
        }
    };

    generateWithDelay(0);
}
    // Função para mover o obstáculo
    function moveObstacle(obstacle) {
        const moveInterval = setInterval(() => {
            if (gameOverFlag) {
                clearInterval(moveInterval);
                return;
            }
            let right = parseInt(window.getComputedStyle(obstacle).getPropertyValue('right'));
            if (right >= gameArea.clientWidth) {
                clearInterval(moveInterval);
                obstacle.remove();
                obstacles = obstacles.filter(obs => obs !== obstacle);
            } else {
                obstacle.style.right = (right + 2) + 'px';
            }
        }, 20);
    }

    // Função para mostrar a imagem "bam!"
    function showBam(birdRect) {
        bam.style.display = 'block';
        bam.style.top = birdRect.top + 'px';
        bam.style.left = birdRect.left + 'px';
        setTimeout(() => {
            bam.style.display = 'none';
        }, 700);
    }

    // Função para controlar o movimento do pássaro
    function controlBird() {
        let birdLeft = parseInt(window.getComputedStyle(bird).getPropertyValue('left'));
        let birdTop = parseInt(window.getComputedStyle(bird).getPropertyValue('top'));
        if (keysPressed['32']) { // Barra de espaço
            velocity = -10;
        }
        if (keysPressed['68']) { // Letra 'D'
            bird.style.left = (birdLeft + 5) + 'px';
        }
        if (keysPressed['65']) { // Letra 'A'
            bird.style.left = (birdLeft - 5) + 'px';
        }
    }

    // Event listeners para controlar o pássaro com o teclado
    document.addEventListener('keydown', event => {
        keysPressed[event.keyCode] = true;
    });
    document.addEventListener('keyup', event => {
        keysPressed[event.keyCode] = false;
    });

    // Movimento do pássaro
    function moveBird() {
        if (gameOverFlag) return;
        let birdTop = parseInt(window.getComputedStyle(bird).getPropertyValue('top'));
        velocity += gravity;
        bird.style.top = (birdTop + velocity) + 'px';
        if (birdTop > gameArea.clientHeight - birdSize) {
            bird.style.top = (gameArea.clientHeight - birdSize) + 'px';
            velocity = 0;
        }
        controlBird();
        requestAnimationFrame(moveBird);
    }

    // Inicia o movimento do pássaro e a geração de obstáculos
    moveBird();
    setupHearts();
    obstacleGenerationInterval = setInterval(generateObstacle, Math.random() * 1000 + 3000);
    collisionDetectionInterval = setInterval(detectCollision, 100);

    // Inicia a música de fundo após 1 segundo
    setTimeout(() => {
        playBackgroundMusic();
    }, 1000);

    // Event listener para quando a música de fundo termina
    backgroundMusic.addEventListener('ended', function() {
        // Reinicia a música de fundo quando termina
        this.currentTime = 0;
        this.play();
    });

    // Event listener para o evento de game over
    document.addEventListener('gameover', function() {
        pauseBackgroundMusic(); // Pausa a música de fundo
        playGameOverMusic(); // Toca a música de game over
    });

    // Função para adicionar corações ao contêiner de corações
    function setupHearts() {
        for (let i= 1; i <= lives; i++) {
            const coracao = document.createElement('img');
            coracao.src = `coracoes1b.png`;
            coracao.classList.add('coracao');
            coracoesContainer.appendChild(coracao);
        }
    }

    // Função para atualizar a exibição das vidas
    function updateLivesDisplay() {
        const livesDisplay = document.getElementById('lives');
        livesDisplay.textContent = 'Vidas: ' + lives;

        // Atualiza a exibição visual dos corações
        const coracoes = coracoesContainer.querySelectorAll('.coracao');
        coracoes.forEach((coracao, index) => {
            if (index < lives) {
                coracao.style.display = 'inline';
            } else {
                coracao.style.display = 'none';
            }
        });
    }

    // Função para finalizar o jogo
    function gameOver() {
        gameOverFlag = true;
        clearInterval(obstacleGenerationInterval);
        clearInterval(collisionDetectionInterval);

        obstacles.forEach(obstacle => {
            obstacle.remove();
        });

        // Remove o contêiner de game over anterior, se existir
        const existingGameoverContainer = document.querySelector('.gameover-container');
        if (existingGameoverContainer) {
            existingGameoverContainer.remove();
        }

        // Cria um novo contêiner de game over
        const gameoverContainer = document.createElement('div');
        gameoverContainer.classList.add('gameover-container');
        const imagem = document.createElement('img');
        imagem.src = 'GAMEOVER.gif';
        gameoverContainer.appendChild(imagem);
        document.body.appendChild(gameoverContainer);

        // Dispara o evento de game over
        document.dispatchEvent(new Event('gameover'));
    }
});
