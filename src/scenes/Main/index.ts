import { BASE_URL, PATH_URL } from '@/const'

export default class Main extends Phaser.Scene {
  playerSprite: any // 主角精灵
  goalSprite: any // 宝箱精灵
  enemiesSprite: any // 敌人精灵
  playerSpeed: number // 主角速度
  enemyMinSpeed: number // 敌人最小速度
  enemyMaxSpeed: number // 敌人最大速度
  enemyMaxY: number // 敌人范围值
  enemyMinY: number // 敌人范围值
  isTerminating: boolean // 主角是否还活着
  constructor() {
    super('mainScene')
  }

  init() {
    this.playerSpeed = 3
    this.enemyMinSpeed = 2
    this.enemyMaxSpeed = 4.5
    this.enemyMinY = 80
    this.enemyMaxY = 280
    this.isTerminating = false
  }

  preload() {
    this.load.setBaseURL(BASE_URL)
    this.load.setPath(PATH_URL)
    this.load.image('background', 'background.png') // 背景图
    this.load.image('enemy', 'dragon.png') // 敌人
    this.load.image('player', 'player.png') // 主角
    this.load.image('goal', 'treasure.png') // 宝箱
  }

  create() {
    this.add.image(0, 0, 'background').setOrigin(0, 0)
    const width: number = this.sys.game.config.width as number
    const height: number = this.sys.game.config.height as number

    this.playerSprite = this.add
      .sprite(40, height * 0.5, 'player')
      .setScale(0.5)

    this.goalSprite = this.add
      .sprite(width - 80, height * 0.5, 'goal')
      .setScale(0.6)

    this.enemiesSprite = this.add.group(undefined, {
      key: 'enemy',
      repeat: 5,
      setXY: {
        x: 90,
        y: 100,
        stepX: 80,
        stepY: 20
      }
    })
    Phaser.Actions.ScaleXY(this.enemiesSprite.getChildren(), -0.4, -0.4)
    Phaser.Actions.Call(
      this.enemiesSprite.getChildren(),
      (enemy: any) => {
        enemy.flipX = true
        const direction = Math.random() < 0.5 ? 1 : -1
        const speed =
          this.enemyMinSpeed +
          Math.random() * (this.enemyMaxSpeed - this.enemyMinSpeed)
        enemy.speed = direction * speed
      },
      this
    )
  }

  // 游戏结束
  gameOver() {
    this.isTerminating = true
    this.cameras.main.shake(500)

    this.cameras.main.on(
      'camerashakecomplete',
      () => {
        this.cameras.main.fade(500)
      },
      this
    )

    this.cameras.main.on(
      'camerafadeoutcomplete',
      () => {
        this.scene.restart()
      },
      this
    )
  }

  update() {
    if (this.isTerminating) return
    if (this.input.activePointer.isDown) {
      this.playerSprite.x += this.playerSpeed
    }

    const playerRect = this.playerSprite.getBounds()

    if (
      Phaser.Geom.Intersects.RectangleToRectangle(
        playerRect,
        this.goalSprite.getBounds()
      )
    ) {
      // 游戏成功
      this.gameOver()
    }

    const enemies = this.enemiesSprite.getChildren()
    const enemiesLen = enemies.length
    for (let i = 0; i < enemiesLen; i++) {
      enemies[i].y += enemies[i].speed
      //   console.log(enemies[i].y)
      if (enemies[i].y >= this.enemyMaxY || enemies[i].y <= this.enemyMinY) {
        enemies[i].speed *= -1
      }

      if (
        Phaser.Geom.Intersects.RectangleToRectangle(
          playerRect,
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
