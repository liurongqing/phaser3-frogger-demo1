import { BASE_URL, PATH_URL } from '@/const'

export default class Main extends Phaser.Scene {
  playerSprite: any
  treasureSprite: any
  enemiesSprite: any
  playerSpeed: number
  enemySpeed: number
  enemyMaxY: number
  enemyMinY: number
  isPlayerAlive: boolean
  constructor() {
    super('mainScene')
  }

  init() {
    this.playerSpeed = 11.5
    this.enemySpeed = 2
    this.enemyMaxY = 280
    this.enemyMinY = 80
    this.isPlayerAlive = true
    console.log('init...')
  }

  preload() {
    this.load.setBaseURL(BASE_URL)
    this.load.setPath(PATH_URL)
    this.load.image('background', 'background.png')
    this.load.image('dragon', 'dragon.png')
    this.load.image('player', 'player.png')
    this.load.image('treasure', 'treasure.png')
  }

  create() {
    this.add.image(0, 0, 'background').setOrigin(0, 0)
    const width: number = this.sys.game.config.width as number
    const height: number = this.sys.game.config.height as number

    this.playerSprite = this.add
      .sprite(40, height * 0.5, 'player')
      .setScale(0.5)

    this.treasureSprite = this.add
      .sprite(width - 80, height * 0.5, 'treasure')
      .setScale(0.6)

    this.enemiesSprite = this.add.group({
      key: 'dragon',
      repeat: 5,
      setXY: {
        x: 100,
        y: 100,
        stepX: 80,
        stepY: 20
      }
    })
    Phaser.Actions.ScaleXY(this.enemiesSprite.getChildren(), -0.5, -0.5)
    Phaser.Actions.Call(
      this.enemiesSprite.getChildren(),
      (enemy: any) => {
        enemy.speed = Math.random() * 2 + 1
      },
      this
    )
  }

  // 游戏结束
  gameOver() {
    this.isPlayerAlive = false
    this.cameras.main.shake(500)
    this.time.delayedCall(
      250,
      () => {
        this.cameras.main.fade(250)
      },
      [],
      this
    )
    this.time.delayedCall(
      500,
      () => {
        this.scene.restart()
      },
      [],
      this
    )
  }

  update() {
    if (!this.isPlayerAlive) {
      return
    }
    if (this.input.activePointer.isDown) {
      // console.log('111')
      // this.player.x += this.playerSpeed
      this.playerSprite.x += this.playerSpeed
    }

    if (
      Phaser.Geom.Intersects.RectangleToRectangle(
        this.playerSprite.getBounds(),
        this.treasureSprite.getBounds()
      )
    ) {
      // 游戏成功
      this.gameOver()
    }

    const enemies = this.enemiesSprite.getChildren()
    const enemiesLen = enemies.length
    for (let i = 0; i < enemiesLen; i++) {
      enemies[i].y += enemies[i].speed

      if (enemies[i].y >= this.enemyMaxY || enemies[i].y <= this.enemyMinY) {
        enemies[i].speed *= -1
      }

      if (
        Phaser.Geom.Intersects.RectangleToRectangle(
          this.playerSprite.getBounds(),
          enemies[i].getBounds()
        )
      ) {
        // 如果与龙碰撞了，就是失败了
        this.gameOver()
        break
      }
    }
  }
}
