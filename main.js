import * as THREE from './three.module.js'

let routeHistory = []

await Ammo()

// Graphics variables
let camera, scene, renderer, spotLight, water
let clock = new THREE.Clock()
let materialDynamic,
  materialGround,
  materialTreeTrunk,
  materialTreeTop,
  materialRoad,
  materialRoadCorner,
  materialInteractive,
  materialWheel = [],
  materialCarBase = [],
  materialCarTop = [],
  materialWall = [],
  materialWater,
  materialOcean

// Player data
if (!localStorage.money) localStorage.money = 0
if (!localStorage.vehicle) localStorage.vehicle = 'car'
if (!localStorage.skin) localStorage.skin = '0'
if (!localStorage.me) localStorage.me = Math.floor(Math.random() * 10000)

// Physics variables
let physicsWorld
let syncList = []
let time = 0
let actors = {}

// Keybord actions
let actions = {}
let keysActions = {
  KeyW: 'acceleration',
  KeyS: 'braking',
  KeyA: 'left',
  KeyD: 'right',
  KeyR: 'reset',
}

// - Functions -

function initGraphics() {
  scene = new THREE.Scene()

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.2,
    2000,
  )

  renderer = new THREE.WebGLRenderer({antialias: true})
  renderer.setClearColor(0xa7cbfa)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)

  let lightLevel = localStorage.time == 'Day' ? 5.0 : 1.0

  scene.add(new THREE.AmbientLight(0xffffff, lightLevel))
  const sun = new THREE.DirectionalLight(0xffffff, lightLevel)
  sun.position.set(1000, 1000, 1000)
  scene.add(sun)

  if (localStorage.headlights != 'Off') {
    spotLight = new THREE.SpotLight(0xf7e51b, 1000.0)
    spotLight.angle = Math.PI / 4
    spotLight.distance = 100.0
    scene.add(spotLight)
  }

  scene.background = new THREE.CubeTextureLoader()
    .setPath(`/textures/themes/${localStorage.theme.toLowerCase()}/`)
    .load(
      new Array(6).fill(`${localStorage.time.toLowerCase()}.png`),
      t => (t.magFilter = THREE.NearestFilter),
    )

  const loader = new THREE.TextureLoader()
  loader.setPath(`textures/themes/${localStorage.theme.toLowerCase()}/`)

  const loadMaterial = path => {
    const texture = loader.load(path)
    texture.minFilter = THREE.NearestFilter
    texture.magFilter = THREE.NearestFilter

    return new THREE.MeshPhongMaterial({
      color: 0x999999,
      map: texture,
      transparent: true,
    })
  }

  const loadMaterialRepeated = (path, repeat) => {
    const texture = loader.load(path)

    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(repeat, repeat)

    texture.needsUpdate = true

    return new THREE.MeshPhongMaterial({
      color: 0x999999,
      map: texture,
      transparent: true,
    })
  }

  materialOcean = loadMaterialRepeated('water.png', 100)

  water = new THREE.Mesh(new THREE.PlaneGeometry(1600, 1600), materialOcean)
  water.quaternion.setFromAxisAngle(new THREE.Vector3(-1, 0, 0), Math.PI / 2)
  water.position.setY(-2)
  scene.add(water)

  const loadBlockMaterials = filename => {
    let materials = new Array(6).fill(loadMaterial(filename))
    for (let i = 0; i < 6; i++) {
      // Adjust ground sides to avoid stretching
      if (i < 2 || i > 3) {
        materials[i] = materials[i].clone()
        materials[i].map = materials[i].map.clone()
        materials[i].map.repeat.set(1.0, 0.25)
      }
    }
    return materials
  }

  materialGround = loadBlockMaterials('ground.png')
  materialWater = loadBlockMaterials('water.png')
  materialTreeTrunk = new Array(6).fill(loadMaterial('tree-trunk.png'))
  materialTreeTop = new Array(6).fill(loadMaterial('tree-top.png'))
  const roadMaterial = loadMaterial('road.png')
  const roadCornerMaterial = loadMaterial('road-corner.png')
  const roadSideMaterial = loadMaterial('road-side.png')

  for (let i = 0; i < 1; i++) {
    materialWall[i] = new Array(6).fill(loadMaterial(`wall${i}.png`))
    materialWall[i][2] = loadMaterial(`wall${i}-top.png`)
  }

  for (let i = 0; i < config.numVehicleSkins; i++) {
    loader.setPath(`textures/vehicles/car/${i}/`)
    materialCarBase.push([
      loadMaterial('left.png'),
      loadMaterial('right.png'),
      loadMaterial('hood.png'),
      loadMaterial('hood.png'),
      loadMaterial('front.png'),
      loadMaterial('back.png'),
    ])
    materialCarTop.push(new Array(6).fill(loadMaterial('top.png')))
    materialWheel.push([
      loadMaterial('tire.png'),
      loadMaterial('hubcap.png'),
      loadMaterial('hubcap.png'),
    ])
  }

  materialDynamic = new THREE.MeshPhongMaterial({color: 0xfca400})

  materialRoad = [
    roadSideMaterial,
    roadSideMaterial,
    roadMaterial,
    roadSideMaterial,
    roadSideMaterial,
    roadSideMaterial,
  ]
  materialRoadCorner = [
    roadSideMaterial,
    roadSideMaterial,
    roadCornerMaterial,
    roadSideMaterial,
    roadSideMaterial,
    roadSideMaterial,
  ]

  materialInteractive = new THREE.MeshPhongMaterial({color: 0x990000})

  document.getElementById('container').replaceChildren(renderer.domElement)

  window.addEventListener('resize', onWindowResize)

  window.addEventListener('keydown', e => {
    if (keysActions[e.code]) {
      actions[keysActions[e.code]] = true
      e.preventDefault()
    }
  })

  window.addEventListener('keyup', e => {
    if (keysActions[e.code]) {
      actions[keysActions[e.code]] = false
      e.preventDefault()
    }
  })
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
}

function initPhysics() {
  let collisionConfig = new Ammo.btDefaultCollisionConfiguration()
  physicsWorld = new Ammo.btDiscreteDynamicsWorld(
    new Ammo.btCollisionDispatcher(collisionConfig),
    new Ammo.btDbvtBroadphase(),
    new Ammo.btSequentialImpulseConstraintSolver(),
    collisionConfig,
  )
  physicsWorld.setGravity(
    new Ammo.btVector3(config.windX, config.gravity, config.windZ),
  )
}

function tick() {
  let dt = Math.min(clock.getDelta(), 0.05)
  time += dt

  // Animate water
  materialWater[2].map.offset.x = 0.02 * Math.sin(time * 3)
  materialWater[2].map.offset.y = 0.01 * Math.sin(time * 3)
  materialWater[2].map.needsUpdate = true

  water.material.map.offset.x = 0.02 * Math.sin(time * 3)
  water.material.map.offset.y = 0.01 * Math.sin(time * 3)
  water.position.setY(-2 + 0.3 * Math.sin(time * 3))
  water.material.map.needsUpdate = true

  elevatorBlocks.forEach(block => {
    // Handle elevator blocks
    let wt = block.getWorldTransform()
    let pos = wt.getOrigin()
    let y = block.startPosition.y + Math.abs(((time % 8) - 4) / 2)
    pos.setValue(block.startPosition.x, y, block.startPosition.z)
    block.mesh.position.y = y
  })

  let quakeMag = parseInt(localStorage.earthquake) - 3

  if (quakeMag > 0) {
    groundBlocks.forEach(block => {
      let wt = block.getWorldTransform()
      let pos = wt.getOrigin()
      let y =
        block.startPosition.y +
        config.quake.verticalMag *
          (1 +
            Math.cos(
              time * quakeMag * config.quake.speed +
                pos.x() / config.quake.size +
                pos.z() / config.quake.size,
            ))
      let x =
        block.startPosition.x +
        config.quake.lateralMag *
          (1 +
            Math.cos(
              time * quakeMag * config.quake.speed +
                pos.x() / config.quake.size +
                pos.z() / config.quake.size,
            ))
      let z =
        block.startPosition.z +
        quakeMag *
          config.quake.lateralMag *
          (1 +
            Math.cos(
              time * quakeMag * config.quake.speed +
                pos.x() / config.quake.size +
                pos.z() / config.quake.size,
            ))
      pos.setValue(x, y, z)
      block.mesh.position.y = y
      block.mesh.position.x = x
      block.mesh.position.z = z
    })
  }

  let numGhosts = parseInt(localStorage.ghosts)

  for (let i = 1; i <= numGhosts; i++) {
    if (routeHistory.length >= config.ghostSpacing * i) {
      if (!actors['ghost' + i]) {
        actors['ghost' + i] = createVehicle(
          new THREE.Vector3(),
          false,
          i % config.numVehicleSkins,
          localStorage.vehicle,
        )
      }
      let wt = actors['ghost' + i].getChassisWorldTransform()
      let pos = wt.getOrigin()
      let hist = routeHistory[routeHistory.length - config.ghostSpacing * i]
      pos.setValue(hist.pos.x, hist.pos.y + 0.3 + config.sillyGhosts, hist.pos.z)
      wt.setOrigin(pos)
      if (!config.sillyGhosts) {
        let rot = wt.getRotation()
        rot.setValue(hist.rot.x, hist.rot.y, hist.rot.z, hist.rot.w)
        wt.setRotation(rot)
      }
    }
  }

  while (
    routeHistory.length > Math.max(config.resetFrames, numGhosts * config.ghostSpacing)
  ) {
    routeHistory.shift()
  }

  for (let i = 0; i < syncList.length; i++) syncList[i](dt)
  physicsWorld.stepSimulation(dt, 0)
  renderer.render(scene, camera)

  requestAnimationFrame(() => requestAnimationFrame(tick))
}

function createBox(
  pos,
  w,
  l,
  h,
  mass = 0,
  friction = 1,
  rot = new THREE.Quaternion(0, 0, 0, 1),
  material = materialDynamic,
  physics = true,
  shape = '',
) {
  if (!shape) {
    shape = new THREE.BoxGeometry(w, l, h, 1, 1, 1)
  }

  let geometry = new Ammo.btBoxShape(new Ammo.btVector3(w * 0.5, l * 0.5, h * 0.5))

  let mesh = new THREE.Mesh(shape, material)

  mesh.position.copy(pos)
  mesh.geometry.translate(0, -l / 2, 0)
  mesh.geometry.applyQuaternion(rot)
  mesh.geometry.translate(0, l / 2, 0)
  scene.add(mesh)

  let transform = new Ammo.btTransform()
  transform.setIdentity()
  transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z))
  transform.setRotation(new Ammo.btQuaternion(rot.x, rot.y, rot.z, rot.w))
  let motionState = new Ammo.btDefaultMotionState(transform)

  let localInertia = new Ammo.btVector3(0, 0, 0)
  geometry.calculateLocalInertia(mass, localInertia)

  let rbInfo = new Ammo.btRigidBodyConstructionInfo(
    mass,
    motionState,
    geometry,
    localInertia,
  )
  let body = new Ammo.btRigidBody(rbInfo)

  body.setFriction(friction)

  if (physics) {
    physicsWorld.addRigidBody(body)

    if (mass > 0) {
      // Sync physics and graphics
      const sync = () => {
        let ms = body.getMotionState()
        if (ms) {
          let transform = new Ammo.btTransform()
          ms.getWorldTransform(transform)
          let pos = transform.getOrigin()
          let rot = transform.getRotation()
          mesh.position.set(pos.x(), pos.y(), pos.z())
          mesh.quaternion.set(rot.x(), rot.y(), rot.z(), rot.w())
        }
      }

      syncList.push(sync)
    }
  }

  body.forceSync = () => {
    let transform = new Ammo.btTransform()
    body.getMotionState().getWorldTransform(transform)
    let pos = transform.getOrigin()
    let rot = transform.getRotation()
    mesh.position.set(pos.x(), pos.y(), pos.z())
    mesh.quaternion.set(rot.x(), rot.y(), rot.z(), rot.w())
  }

  body.mesh = mesh
  body.startPosition = mesh.position.clone()

  return body
}

function createWheelMesh(radius, width, skin) {
  let t = new THREE.CylinderGeometry(radius, radius, width, 8, 1)
  t.rotateZ(Math.PI / 2)
  let mesh = new THREE.Mesh(t, materialWheel[skin])
  scene.add(mesh)
  return mesh
}

function createChassisMesh(w, h, l, skin = 0) {
  let chassis = new THREE.Object3D()

  chassis.add(new THREE.Mesh(new THREE.BoxGeometry(w, h / 2, l), materialCarBase[skin]))

  let top = new THREE.Mesh(
    new THREE.BoxGeometry(w * (15 / 16), h / 2, l / 2),
    materialCarTop[skin],
  )
  top.position.set(0, h / 2, -l / 8)
  chassis.add(top)

  scene.add(chassis)
  return chassis
}

function createVehicle(pos, player = true, skin = 0, name = 'car') {
  // Vehicle contants
  let chassisWidth = config.vehicles[name].chassisWidth
  let chassisHeight = config.vehicles[name].chassisHeight
  let chassisLength = config.vehicles[name].chassisLength
  let massVehicle = 800

  let wheelRadius = config.vehicles[name].wheelRadius
  let wheelWidth = config.vehicles[name].wheelWidth

  let axleFrontPos = config.vehicles[name].axleFrontPos
  let axleBackPos = config.vehicles[name].axleBackPos
  let axleHalfLength = config.vehicles[name].axleHalfLength
  let axleHeight = config.vehicles[name].axleHeight

  let friction = 1000
  let suspensionStiffness = 20.0
  let suspensionDamping = 2.3
  let suspensionCompression = 4.4
  let suspensionRestLength = 0.6
  let rollInfluence = 0.1

  let steeringIncrement = 0.04
  let steeringClamp = 0.5
  let maxEngineForce = parseInt(localStorage.engine) * 5
  let maxBreakingForce = 100

  // Chassis
  let geometry = new Ammo.btBoxShape(
    new Ammo.btVector3(chassisWidth * 0.5, chassisHeight * 0.5, chassisLength * 0.5),
  )
  let transform = new Ammo.btTransform()
  transform.setIdentity()
  transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z))
  let motionState = new Ammo.btDefaultMotionState(transform)
  let localInertia = new Ammo.btVector3(0, 0, 0)
  geometry.calculateLocalInertia(massVehicle, localInertia)
  let body = new Ammo.btRigidBody(
    new Ammo.btRigidBodyConstructionInfo(
      massVehicle,
      motionState,
      geometry,
      localInertia,
    ),
  )
  physicsWorld.addRigidBody(body)
  let chassisMesh = createChassisMesh(chassisWidth, chassisHeight, chassisLength, skin)

  // Raycast Vehicle
  let engineForce = 0
  let vehicleSteering = 0
  let breakingForce = 0
  let tuning = new Ammo.btVehicleTuning()
  let rayCaster = new Ammo.btDefaultVehicleRaycaster(physicsWorld)
  let vehicle = new Ammo.btRaycastVehicle(tuning, body, rayCaster)
  vehicle.setCoordinateSystem(0, 1, 2)
  vehicle.body = body
  physicsWorld.addAction(vehicle)

  // Wheels
  let FRONT_LEFT = 0
  let FRONT_RIGHT = 1
  let BACK_LEFT = 2
  let BACK_RIGHT = 3
  let wheelMeshes = []

  if (localStorage.theme == 'Snowy-Mountain') {
    friction /= 100
  }

  function addWheel(index, x, z) {
    let isFront = i => i < 2
    let wheelInfo = vehicle.addWheel(
      new Ammo.btVector3(x, axleHeight, z),
      new Ammo.btVector3(0, -1, 0),
      new Ammo.btVector3(-1, 0, 0),
      suspensionRestLength,
      wheelRadius,
      tuning,
      isFront(index),
    )

    wheelInfo.set_m_suspensionStiffness(suspensionStiffness)
    wheelInfo.set_m_wheelsDampingRelaxation(suspensionDamping)
    wheelInfo.set_m_wheelsDampingCompression(suspensionCompression)
    wheelInfo.set_m_frictionSlip(friction)
    wheelInfo.set_m_rollInfluence(rollInfluence)

    wheelMeshes[index] = createWheelMesh(wheelRadius, wheelWidth, skin)
  }

  addWheel(FRONT_LEFT, axleHalfLength, axleFrontPos)
  addWheel(FRONT_RIGHT, -axleHalfLength, axleFrontPos)
  addWheel(BACK_LEFT, -axleHalfLength, axleBackPos)
  addWheel(BACK_RIGHT, axleHalfLength, axleBackPos)

  // Sync keybord actions and physics and graphics
  function sync(dt) {
    let speed = vehicle.getCurrentSpeedKmHour()

    breakingForce = 0
    engineForce = 0

    if (player) {
      if (actions.acceleration) {
        if (speed < -1) breakingForce = maxBreakingForce
        else engineForce = maxEngineForce
      }
      if (actions.braking) {
        if (speed > 1) breakingForce = maxBreakingForce
        else engineForce = -maxEngineForce / 2
      }
      if (actions.left) {
        if (vehicleSteering < steeringClamp) vehicleSteering += steeringIncrement
      } else {
        if (actions.right) {
          if (vehicleSteering > -steeringClamp) vehicleSteering -= steeringIncrement
        } else {
          if (vehicleSteering < -steeringIncrement) vehicleSteering += steeringIncrement
          else {
            if (vehicleSteering > steeringIncrement)
              vehicleSteering -= steeringIncrement
            else {
              vehicleSteering = 0
            }
          }
        }
      }
    }

    if (engineForce) {
      vehicle.body.activate()
    }

    if (localStorage.drive == 'All') {
      vehicle.applyEngineForce(engineForce / 2, FRONT_LEFT)
      vehicle.applyEngineForce(engineForce / 2, FRONT_RIGHT)
      vehicle.applyEngineForce(engineForce / 2, BACK_LEFT)
      vehicle.applyEngineForce(engineForce / 2, BACK_RIGHT)
    } else if (localStorage.drive == 'Front') {
      vehicle.applyEngineForce(engineForce, FRONT_LEFT)
      vehicle.applyEngineForce(engineForce, FRONT_RIGHT)
    } else {
      vehicle.applyEngineForce(engineForce, BACK_LEFT)
      vehicle.applyEngineForce(engineForce, BACK_RIGHT)
    }

    vehicle.setBrake(breakingForce / 2, FRONT_LEFT)
    vehicle.setBrake(breakingForce / 2, FRONT_RIGHT)
    vehicle.setBrake(breakingForce, BACK_LEFT)
    vehicle.setBrake(breakingForce, BACK_RIGHT)

    vehicle.setSteeringValue(vehicleSteering, FRONT_LEFT)
    vehicle.setSteeringValue(vehicleSteering, FRONT_RIGHT)

    for (let i = 0; i < vehicle.getNumWheels(); i++) {
      vehicle.updateWheelTransform(i, true)
      let wheel_transform = vehicle.getWheelTransformWS(i)
      let pos = wheel_transform.getOrigin()
      let rot = wheel_transform.getRotation()
      wheelMeshes[i].position.set(pos.x(), pos.y(), pos.z())
      wheelMeshes[i].quaternion.set(rot.x(), rot.y(), rot.z(), rot.w())
    }

    // Prevent flipping
    const MAX_ANGLE = 30 * (Math.PI / 180)
    const TORQUE_FACTOR = 10000
    const DAMPING = 0.9

    // 1. Get current up vector
    const currentUp = new THREE.Vector3(0, 1, 0).applyQuaternion(chassisMesh.quaternion)

    // 2. Calculate angle from vertical
    const angle = currentUp.angleTo(new THREE.Vector3(0, 1, 0))

    // 3. Apply corrective torque if beyond threshold
    if (angle > MAX_ANGLE) {
      console.log(angle, MAX_ANGLE)
      const axis = new THREE.Vector3()
        .crossVectors(currentUp, new THREE.Vector3(0, 1, 0))
        .normalize()

      // Calculate torque strength (proportional to angle)
      const strength = TORQUE_FACTOR * (angle - MAX_ANGLE)

      // Convert to ammo.js vector and apply
      const torque = new Ammo.btVector3(
        axis.x * strength,
        axis.y * strength,
        axis.z * strength,
      )

      // Apply torque with damping
      vehicle.getRigidBody().applyTorque(torque)

      Ammo.destroy(torque)
    }

    let chassis_transform = vehicle.getChassisWorldTransform()
    let pos = chassis_transform.getOrigin()
    let rot = chassis_transform.getRotation()
    chassisMesh.position.set(pos.x(), pos.y(), pos.z())
    chassisMesh.quaternion.set(rot.x(), rot.y(), rot.z(), rot.w())

    if (player) {
      let chassisLength = config.vehicles[localStorage.vehicle].chassisLength

      let camera_offset = new THREE.Vector3(
        -chassisLength * vehicleSteering,
        chassisLength / 2,
        (-3 * chassisLength) / 2,
      )
      camera_offset.applyQuaternion(chassisMesh.quaternion)

      camera.position.copy(camera_offset.add(chassisMesh.position))
      camera.lookAt(chassisMesh.position)

      routeHistory.push({
        time: time,
        pos: {
          x: pos.x(),
          y: pos.y(),
          z: pos.z(),
        },
        rot: {
          x: rot.x(),
          y: rot.y(),
          z: rot.z(),
          w: rot.w(),
        },
      })

      if (localStorage.headlights != 'Off') {
        let position_offset = new THREE.Vector3(0, 0.5, 2)
        position_offset.applyQuaternion(chassisMesh.quaternion)
        spotLight.position.copy(position_offset.add(chassisMesh.position))
        let target_offset = new THREE.Vector3(0, 0, 10)
        target_offset.applyQuaternion(chassisMesh.quaternion)
        spotLight.target = new THREE.Object3D()
        spotLight.target.position.copy(target_offset.add(chassisMesh.position))
        spotLight.target.updateMatrixWorld()
      }

      let wage = 5
      if (localStorage.time == 'Night') {
        wage += 10
      }
      const earnings = dt * Math.abs(speed) * wage
      localStorage.money = parseFloat(localStorage.money) + earnings

      if (actions.reset || pos.y() <= -1) {
        for (let i = 0; i < config.resetFrames; i++) {
          let old = routeHistory.pop()

          if (old) {
            let zeroRotation = new Ammo.btQuaternion(
              old.rot.x,
              old.rot.y,
              old.rot.z,
              old.rot.w,
            )
            let newPos = new Ammo.btVector3(old.pos.x, old.pos.y, old.pos.z)
            let newTransform = new Ammo.btTransform(zeroRotation, newPos)
            body.setWorldTransform(newTransform)
          }
        }

        vehicle.body.setLinearVelocity(new Ammo.btVector3(0, 0, 0))
        vehicle.body.setAngularVelocity(new Ammo.btVector3(0, 0, 0))
      }

      document.getElementById('speedometer').innerHTML = `${speed.toFixed(1)} km/h 
        ${pos.x().toFixed(2)} ${pos.y().toFixed(2)} 
        ${pos.z().toFixed(2)} 
        ${rot.x().toFixed(2)} ${rot.y().toFixed(2)} 
        ${rot.z().toFixed(2)} ${rot.w().toFixed(2)} 
        ${Math.floor(1 / dt)} \$${parseFloat(localStorage.money).toFixed(2)}`
    }
  }

  syncList.push(sync)
  return vehicle
}

const groundBlocks = []
const elevatorBlocks = []

function createObjects() {
  const block_size = 16
  let block_height = block_size / 8

  let hash = location.hash.slice(1)

  if (!hash) {
    hash = config.courses[parseInt(localStorage.course)]
  }

  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_'

  for (let i = 0; i < hash.length; i += 4) {
    let blockType = Math.floor(chars.indexOf(hash[i]) / 4)
    let blockStyle = chars.indexOf(hash[i]) % 4
    let base_height = -block_height + block_height * chars.indexOf(hash[i + 2])
    let rot = new THREE.Quaternion(0, 0, 0, 1)
    rot.setFromAxisAngle(new THREE.Vector3(0, 1, 0), (-blockStyle * Math.PI) / 2)

    if (
      blockType == config.blocks.indexOf('Road Ramp') ||
      blockType == config.blocks.indexOf('Road Ramp 2')
    ) {
      let rise = block_height

      if (blockType == config.blocks.indexOf('Road Ramp 2')) {
        rise = block_height * 2
      }

      let ramp = new THREE.Quaternion(0, 0, 0, 1)
      ramp.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.atan(rise / block_size))
      rot.multiply(ramp)

      let new_length = Math.sqrt(block_size ** 2 + rise ** 2)

      groundBlocks.push(
        createBox(
          new THREE.Vector3(
            block_size * chars.indexOf(hash[i + 1]),
            -block_height + rise / 2 + block_height * chars.indexOf(hash[i + 2]),
            block_size * chars.indexOf(hash[i + 3]),
          ),
          block_size,
          block_height,
          new_length,
          0,
          1,
          rot,
          materialRoad,
        ),
      )
    } else if (blockType == config.blocks.indexOf('Water')) {
      base_height = -block_height
      for (let y = 0; y < chars.indexOf(hash[i + 2]); y++) {
        groundBlocks.push(
          createBox(
            new THREE.Vector3(
              block_size * chars.indexOf(hash[i + 1]),
              block_height * y - 0.2,
              block_size * chars.indexOf(hash[i + 3]),
            ),
            block_size,
            block_height,
            block_size,
            0,
            1,
            rot,
            materialWater,
            false,
          ),
        )
      }
    } else {
      let material

      if (
        blockType == config.blocks.indexOf('Road Straight') ||
        blockType == config.blocks.indexOf('Elevator')
      ) {
        material = materialRoad
      } else if (blockType == config.blocks.indexOf('Road Corner')) {
        material = materialRoadCorner
      } else if (blockType == config.blocks.indexOf('Ground')) {
        material = materialGround
        for (let j = 0; j < blockStyle; j++) {
          // Trunk
          let trunk_height = (block_height * (2 + j) * config.treeTrunkHeight) / 4

          const x_off = block_size * ([0, -0.3, 0.3][j] + (0.12 * Math.random() - 0.06))
          const y_off = block_size * ([0, 0.3, -0.3][j] + (0.12 * Math.random() - 0.06))

          createBox(
            new THREE.Vector3(
              block_size * chars.indexOf(hash[i + 1]) + x_off,
              (trunk_height - block_height) / 2 +
                block_height * chars.indexOf(hash[i + 2]),
              block_size * chars.indexOf(hash[i + 3]) + y_off,
            ),
            block_size / 16,
            trunk_height,
            block_size / 16,
            1000,
            1,
            rot,
            materialTreeTrunk,
          )
          // Canopy
          if (config.treeCanopy) {
            let shape = undefined
            let canopy_height = block_height * 2 * config.treeCanopyHeight

            if (config.treeCanopy == 'cone') {
              shape = new THREE.ConeGeometry(block_size / 4, canopy_height, 4)
            }

            createBox(
              new THREE.Vector3(
                block_size * chars.indexOf(hash[i + 1]) + x_off,
                block_height * chars.indexOf(hash[i + 2]) +
                  -block_height / 2 +
                  trunk_height +
                  canopy_height / 2,
                block_size * chars.indexOf(hash[i + 3]) + y_off,
              ),
              block_size / 4,
              canopy_height,
              block_size / 4,
              100,
              1,
              rot,
              materialTreeTop,
              true,
              shape,
            )
          }
        }
      } else if (blockType == config.blocks.indexOf('Wall')) {
        material = materialGround
        base_height = -block_height
        for (let y = 0; y < chars.indexOf(hash[i + 2]); y++) {
          groundBlocks.push(
            createBox(
              new THREE.Vector3(
                block_size * chars.indexOf(hash[i + 1]),
                -block_height / 2 + block_size / 8 + (block_size / 4) * y,
                block_size * chars.indexOf(hash[i + 3]),
              ),
              block_size,
              block_size / 4,
              block_size,
              0,
              1,
              rot,
              materialWall[blockStyle],
            ),
          )
        }
      }

      groundBlocks.push(
        createBox(
          new THREE.Vector3(
            block_size * chars.indexOf(hash[i + 1]),
            base_height,
            block_size * chars.indexOf(hash[i + 3]),
          ),
          block_size,
          block_height,
          block_size,
          0,
          1,
          rot,
          material,
        ),
      )

      if (blockType == config.blocks.indexOf('Elevator')) {
        elevatorBlocks.push(groundBlocks.slice(-1)[0])
      }
    }
  }

  actors[localStorage.me] = createVehicle(
    new THREE.Vector3(block_size + -block_size / 4, 8, block_size),
    true,
    localStorage.skin,
    localStorage.vehicle,
  )
}

function networkUpdate() {
  let vehicle = actors[localStorage.me]

  let chassis_transform = vehicle.getChassisWorldTransform()
  let pos = chassis_transform.getOrigin()
  let rot = chassis_transform.getRotation()
  let vel = vehicle.getRigidBody().getLinearVelocity()

  const data = JSON.stringify({
    x: pos.x().toFixed(2),
    y: pos.y().toFixed(2),
    z: pos.z().toFixed(2),
    vx: vel.x().toFixed(2),
    vy: vel.y().toFixed(2),
    vz: vel.z().toFixed(2),
    rw: rot.w().toFixed(2),
    rx: rot.x().toFixed(2),
    ry: rot.y().toFixed(2),
    rz: rot.z().toFixed(2),
  })
  fetch(`/update/${localStorage.me}`, {method: 'POST', body: data}).then(response => {
    response.json().then(newActors => {
      Object.entries(newActors).forEach(actor => {
        if (actor[0] == localStorage.me) {
          return
        }
        if (!actors[actor[0]]) {
          actors[actor[0]] = createVehicle(
            new THREE.Vector3(actor[1].x, actor[1].y, actor[1].z),
            false,
            localStorage.skin,
            localStorage.vehicle,
          )
        } else {
          let wt = actors[actor[0]].getChassisWorldTransform()
          let pos = wt.getOrigin()
          pos.setValue(actor[1].x, actor[1].y, actor[1].z)
          wt.setOrigin(pos)
          let rot = wt.getRotation()
          rot.setValue(actor[1].rx, actor[1].ry, actor[1].rz, actor[1].rw)
          wt.setRotation(rot)
          actors[actor[0]]
            .getRigidBody()
            .setLinearVelocity(
              new Ammo.btVector3(actor[1].vx, actor[1].vy, actor[1].vz),
            )
        }
      })
    })
    networkUpdate()
  })
}

// - Init -

const config = {}
const globalConfig = await fetch('config.json')
Object.assign(config, await globalConfig.json())

try {
  const themeConfig = await fetch(
    `textures/themes/${localStorage.theme.toLowerCase()}/config.json`,
  )
  Object.assign(config, await themeConfig.json())
} catch {}

const vehicleConfig = await fetch(`textures/vehicles/config.json`)
config.vehicles = await vehicleConfig.json()

initGraphics()
initPhysics()
createObjects()
tick()

if (localStorage.netplay) {
  networkUpdate()
}
