// Добавление констант для типов врагов и уровней сложности
const ENEMY_TYPES = {
    LEVEL_1: 'Level 1',
    LEVEL_2: 'Level 2',
    LEVEL_3: 'Level 3'
};

const GAME_MODES = {
    NORMAL: 'Normal Mode',
    HARD: 'Hard Mode',
    EXTREME: 'Extreme Mode'
};

// Добавление функции для генерации врагов
function generateEnemies(level, mode) {
    let enemies = [];
    let totalEnemies;

    switch (mode) {
        case GAME_MODES.NORMAL:
            totalEnemies = Math.floor(Math.random() * 51) + 50; // 50-100 врагов
            break;
        case GAME_MODES.HARD:
            totalEnemies = Math.floor(Math.random() * 76) + 75; // 75-150 врагов
            break;
        case GAME_MODES.EXTREME:
            totalEnemies = Math.floor(Math.random() * 101) + 100; // 100-200 врагов
            break;
        default:
            totalEnemies = 0;
    }

    for (let i = 0; i < totalEnemies; i++) {
        let type = Math.random() > 0.7 ? ENEMY_TYPES.LEVEL_3 : ENEMY_TYPES.LEVEL_1;
        if (mode === GAME_MODES.HARD) {
            type = ENEMY_TYPES.LEVEL_2;
        } else if (mode === GAME_MODES.EXTREME) {
            type = ENEMY_TYPES.LEVEL_3;
        }
        enemies.push({ type, health: 100 });
    }

    return enemies;
}

// Добавление функции для генерации бонусов
function generateBonuses() {
    let bonuses = [];
    const bonusTypes = ['Heal', 'Ammo', 'Power Weapon', 'Time Buff'];

    for (let i = 0; i < Math.floor(Math.random() * 5) + 1; i++) {
        bonuses.push(bonusTypes[Math.floor(Math.random() * bonusTypes.length)]);
    }

    return bonuses;
}

// Добавление функции для обновления состояния игры
function updateGame(player, enemies, bonuses) {
    player.health -= calculateDamage(enemies);
    if (player.health <= 0) {
        restartLevel();
    }
    player.score += collectBonuses(bonuses);
}

// Добавление функции для расчета урона от врагов
function calculateDamage(enemies) {
    let damage = 0;
    for (let enemy of enemies) {
        if (enemy.health > 0) {
            damage += Math.floor(Math.random() * 10); // Урон врага
            enemy.health -= Math.floor(Math.random() * 5); // Уменьшение здоровья врага
        }
    }
    return damage;
}

// Добавление функции для сбора бонусов игроком
function collectBonuses(bonuses) {
    let score = 0;
    for (let bonus of bonuses) {
        switch (bonus) {
            case 'Heal':
                player.health += Math.floor(Math.random() * 20); // Восстановление здоровья
                break;
            case 'Ammo':
                player.ammo += Math.floor(Math.random() * 50); // Пополнение боеприпасов
                break;
            case 'Power Weapon':
                player.powerWeapon = true; // Получение мощного оружия
                break;
            case 'Time Buff':
                player.timeBuff = true; // Дополнительное время на выживание
                break;
        }
        score += 10; // Очки за сбор бонуса
    }
    return score;
}

// Добавление функции для перезапуска уровня
function restartLevel() {
    player.health = 100;
    player.ammo = 100;
    player.powerWeapon = false;
    player.timeBuff = false;
    enemies = generateEnemies(currentLevel, currentMode);
    bonuses = generateBonuses();
}