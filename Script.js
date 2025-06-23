const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const healthValueDisplay = document.getElementById('healthValue');
const kiValueDisplay = document.getElementById('kiValue');

// --- Configurações do Jogo ---
const GAME_WIDTH = canvas.width;
const GAME_HEIGHT = canvas.height;
const GRAVITY = 0.5; // Força da gravidade
const GROUND_Y = GAME_HEIGHT - 50; // Posição do "chão"

// --- Jogador ---
const player = {
    x: 50,
    y: GROUND_Y - 50, // Começa acima do chão
    width: 30,
    height: 50,
    color: 'blue',
    speed: 5,
    jumpStrength: 12,
    velocityY: 0,
    isJumping: false,
    health: 100,
    maxHealth: 100,
    ki: 100,
    maxKi: 100,
    direction: 'right' // Direção para animações/ataques futuros
};

// --- Estado do Teclado ---
const keys = {
    right: false,
    left: false,
    up: false
};

// --- Chão (Plataformas Simples) ---
// Em um jogo mais complexo, isso seria uma matriz de tilemap ou objetos de plataforma.
const platforms = [
    { x: 0, y: GROUND_Y, width: GAME_WIDTH, height: 50, color: 'green' }, // Chão principal
    { x: 200, y: GROUND_Y - 80, width: 100, height: 20, color: 'gray' }, // Plataforma 1
    { x: 450, y: GROUND_Y - 150, width: 150, height: 20, color: 'gray' }  // Plataforma 2
];

// --- Inimigos (Simples) ---
const enemies = [
    { x: 350, y: GROUND_Y - 30, width: 20, height: 30, color: 'red', speed: 1 }
];

// --- Funções de Desenho ---
function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawPlatforms() {
    platforms.forEach(platform => {
        ctx.fillStyle = platform.color;
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });
}

function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });
}

function updateHUD() {
    healthValueDisplay.textContent = player.health;
    kiValueDisplay.textContent = player.ki;
}

// --- Lógica do Jogo (Loop Principal) ---
function gameLoop() {
    // 1. Limpa o Canvas
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // 2. Atualiza Posição do Jogador
    if (keys.left) {
        player.x -= player.speed;
        player.direction = 'left';
    }
    if (keys.right) {
        player.x += player.speed;
        player.direction = 'right';
    }

    // Limites da tela para o jogador
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > GAME_WIDTH) player.x = GAME_WIDTH - player.width;

    // Aplica gravidade
    player.y += player.velocityY;
    player.velocityY += GRAVITY;

    // Detecção de colisão com plataformas
    let onPlatform = false;
    platforms.forEach(platform => {
        // Se o pé do jogador está na altura da plataforma E
        // o jogador está dentro da largura da plataforma E
        // o jogador estava acima da plataforma no frame anterior (caindo)
        if (player.y + player.height >= platform.y &&
            player.y + player.height <= platform.y + platform.height &&
            player.x + player.width > platform.x &&
            player.x < platform.x + platform.width) {
            
            // Se o jogador está caindo e colide com o topo da plataforma
            if (player.velocityY >= 0) {
                player.y = platform.y - player.height; // Coloca o jogador no topo da plataforma
                player.velocityY = 0;
                player.isJumping = false;
                onPlatform = true;
            }
        }
    });

    // Se não está em nenhuma plataforma e não está pulando, a gravidade continua
    if (!onPlatform && player.y + player.height < GROUND_Y) {
        player.isJumping = true; // Força o estado de pulo se estiver no ar sem plataforma
    } else if (player.y + player.height >= GROUND_Y) { // Colide com o chão principal
        player.y = GROUND_Y - player.height;
        player.velocityY = 0;
        player.isJumping = false;
    }


    // Pulo
    if (keys.up && !player.isJumping) {
        player.velocityY = -player.jumpStrength;
        player.isJumping = true;
    }

    // 3. Atualiza Posição dos Inimigos (Simples: move para frente e para trás)
    enemies.forEach(enemy => {
        enemy.x += enemy.speed;
        if (enemy.x <= 0 || enemy.x + enemy.width >= GAME_WIDTH) {
            enemy.speed *= -1; // Inverte direção
        }
        // Colisão simples entre jogador e inimigo
        if (player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y) {
            
            player.health -= 0.5; // Causa dano contínuo
            if (player.health < 0) player.health = 0; // Evita vida negativa
        }
    });


    // 4. Desenha Elementos
    drawPlatforms();
    drawPlayer();
    drawEnemies();
    updateHUD(); // Atualiza a interface

    // Loop do jogo
    requestAnimationFrame(gameLoop);
}

// --- Event Listeners para o Teclado ---
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'd') keys.right = true;
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = true;
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') keys.up = true;
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false;
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = false;
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') keys.up = false;
});

// --- Inicia o Jogo ---
gameLoop();
