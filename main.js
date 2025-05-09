import * as THREE from './three.module.js'

const courses = [
  'c325c235c125c005c43493043204a104c034c4232303j2030103c023c4322302o2020102c032c42183011201b101c021c330c220c130',
  'c668c538c42893083208a108c67795073407b307c2478107a007c866c776c6562506c456c376c236c1460006c8759745c6252505c4157315a215c13560059844b744c6340504i404c3542214i10400142843i743c6436503c463c3332213j10340032842c752c6426512c422c34242029102b0020841c771c6616521c3318201b101c031884037407630b530c210c130c020',
  'c878c778c658c558c458c358c248c148c048c857c767c657c557c457j367j267j167c047c866c766c636c566946633663266a166c046c855c76546a5c5656465c365c2454155c045c864c7644694c5646474c364c2344144c034c853c76386937583b483c363c2334133c033c652c562c462c362c2224122c022c2210121c021c000',
  'c868c768c668c568c468c86797777667a567c467c8666776c6664556c466c8656785c6652555c465c375c265c155c065c864879476847574746473547244a144c064c863c763c6634523c463c363c2634133c053c862c762c6624512c462c362c2624122c052c761c661851154115321h2210121c051c660c560c460c360c250c150c050',
  'c83897383638353874287318720831083008c8476737c647c537c447c337c247j107c0479806570636165516741673063206a106c0362805c725c635c545c435c345c2350105c0452804c724c644c2440104c0348803a703c633c2330103c043c8326702c642c532c442c332c2420102c032c841871156115521543113211201b101c041c830c740c630c540c430c340c230c140c030',
  '9747g647j547i447j347a24767460246675593353235a135982437243624a5246334424441242823475305238343b2434113282287521652b55241028821572116311531143113011201b101',
  'c778c668c578c468c378c268c178c867976736677557n447n347n247a147c067c8764756i616h516c466c376c266k136c076c8654745h615i515c475i315h2150135c065c8744734i614h514c464h314i2140134c074c863m723h613i513c473i313h2134123c053c8724712i612h512c462h312i212k112c072c8618711l6115521143173217211b111c061c770c660c570c460c370c260c170',
  'c898c798c698c598c498c398c298c198c098c89797877677n5677457n347c227c127c097c8964776c696c596c496c396c2964136c096c89547659615351534153315a2154125c095c89447546614c59494245324k204b124c094c893474386231523b423c3938203a103c093c8924732c692c592c492c392c2920102c092c891873156315531543113011201b101c091c890c790c690c590c490c390c290c190c090',
  '98683768a6686867066728469756565655661476a37628450755466523756844474406642374282387433643n533n433n3337223a123j0236822467243520122h0228821a721867175617451b3519221b121j02187205620153074201320b220h120i020',
  'c838972876183518a418h31892183118a018j8274717i627j51784173317b217h1170017h8268716a616j516j416j316j216h1160016c855j7252615i515i415h31592151115b01598247714b614j514h414j3140214j114h0144813j713h613j513j413i3138213a113h0132812h71296127502a402j312i2120112i0122811j7110611i5116401i3119211b111h01188101710b610h51084101310b210j110i010',
  '98n877m876l8a5l89478a378c2889168a06868n7c7E7c6I745k764774367c2a74157606768o697j656j6b5k664864356c2864146607648o587j576i5a5i564954345c2654135608548n4c7o4c6s445h464a44334c2444124609448m3c7w3c6A345g364b34323i203411360a348l297f256f2b5g264c24312j202410260b248k187f176e175d1b4d183117201b10160c188k077j076i075h074g073f072e071d0b0d0',
  '98781778567855881498a398c278c108c07808779797369735973497b397c277c177c0774866679696767566a466930652065116a02688655765b675c57544550305c275c1756025c87496445544b45483043204a1046034c87347434633c5739433a333921301032043c872274286323532b4324322221201022042c87167419651555154614311221101012041c87087501650555054608310b210b100b040',
  'c877c767c667c557c477c357c267c187c067c8869786o6867586v46673563256a156c086c8854775c675c565c465c375c2650155c065c864j7747664v5447434a334c2744144c074c8734763c673c573c46383331233s123c073c862s742c662c552c472c372c2724112c062c86187415641v531j431j331v211b111c071c860c760c670c570c460c360c250c170c070',
  '9828372856283538v41873083208a10828279567v4477337a2376107682665666236u116u8356575u24501356854u584h264s114886317635663t5735493a3a3s243410398c217c216c2b5c223a24232010208c1h5c163a14221u10188c037c036c035c074b0b3b08220b120',
]
const blockNames = [
  'Road Straight',
  'Road Ramp',
  'Road Corner',
  'Wall',
  'Ground',
  'Elevator',
  'Water',
  'Road Ramp 2',
]

const config = {
  treeCanopy: 'square',
  treeCanopyHeight: 1,
  treeTrunkHeight: 4,
}

let ghostSpacing = 450
let resetFrames = 90
let sillyGhosts = 0

let quakeLateralMag = 0.1
let quakeVertialMag = 0.5
let quakeSpeed = 1
let quakeSize = 32

const numVehicleSkins = 10

let routeHistory = []

// Debug options
let showWireframe = false

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

  let lightLevel = localStorage.time == 'Day' ? 1.0 : 0.25

  scene.add(new THREE.AmbientLight(0xffffff, lightLevel))
  const sun = new THREE.DirectionalLight(0xffffff, lightLevel)
  sun.position.set(1000, 1000, 1000)
  scene.add(sun)

  if (localStorage.headlights != 'Off') {
    spotLight = new THREE.SpotLight(0xf7e51b)
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

  for (let i = 0; i < numVehicleSkins; i++) {
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

  window.addEventListener('resize', onWindowResize, false)
  window.addEventListener('keydown', keychange)
  window.addEventListener('keyup', keychange)
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
  physicsWorld.setGravity(new Ammo.btVector3(0, -9.82, 0))
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
        quakeVertialMag *
          (1 +
            Math.cos(
              time * quakeMag * quakeSpeed + pos.x() / quakeSize + pos.z() / quakeSize,
            ))
      let x =
        block.startPosition.x +
        quakeLateralMag *
          (1 +
            Math.cos(
              time * quakeMag * quakeSpeed + pos.x() / quakeSize + pos.z() / quakeSize,
            ))
      let z =
        block.startPosition.z +
        quakeMag *
          quakeLateralMag *
          (1 +
            Math.cos(
              time * quakeMag * quakeSpeed + pos.x() / quakeSize + pos.z() / quakeSize,
            ))
      pos.setValue(x, y, z)
      block.mesh.position.y = y
      block.mesh.position.x = x
      block.mesh.position.z = z
    })
  }

  let numGhosts = parseInt(localStorage.ghosts)

  for (let i = 1; i <= numGhosts; i++) {
    if (routeHistory.length >= ghostSpacing * i) {
      if (!actors['ghost' + i]) {
        actors['ghost' + i] = createVehicle(
          new THREE.Vector3(),
          false,
          i % numVehicleSkins,
        )
      }
      let wt = actors['ghost' + i].getChassisWorldTransform()
      let pos = wt.getOrigin()
      let hist = routeHistory[routeHistory.length - ghostSpacing * i]
      pos.setValue(hist.pos.x, hist.pos.y + 0.3 + sillyGhosts, hist.pos.z)
      wt.setOrigin(pos)
      if (!sillyGhosts) {
        let rot = wt.getRotation()
        rot.setValue(hist.rot.x, hist.rot.y, hist.rot.z, hist.rot.w)
        wt.setRotation(rot)
      }
    }
  }

  while (routeHistory.length > Math.max(resetFrames, numGhosts * ghostSpacing)) {
    routeHistory.shift()
  }

  for (let i = 0; i < syncList.length; i++) syncList[i](dt)
  physicsWorld.stepSimulation(dt, 0)
  renderer.render(scene, camera)

  requestAnimationFrame(() => requestAnimationFrame(tick))
}

function keychange(e) {
  if (keysActions[e.code]) {
    actions[keysActions[e.code]] = e.type == 'keydown'
    e.preventDefault()
    e.stopPropagation()
    return false
  }
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

  if (showWireframe) {
    const geo = new THREE.WireframeGeometry(mesh.geometry)
    const mat = new THREE.LineBasicMaterial({color: 0xffffff, linewidth: 5})
    const wireframe = new THREE.LineSegments(geo, mat)
    wireframe.position.copy(pos)
    wireframe.quaternion.copy(rot)
    scene.add(wireframe)
  }

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

    let chassis_transform = vehicle.getChassisWorldTransform()
    let pos = chassis_transform.getOrigin()
    let rot = chassis_transform.getRotation()
    chassisMesh.position.set(pos.x(), pos.y(), pos.z())
    chassisMesh.quaternion.set(rot.x(), rot.y(), rot.z(), rot.w())

    if (player) {
      let camera_offset = new THREE.Vector3(-4 * vehicleSteering, 2, -6)
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
        for (let i = 0; i < resetFrames; i++) {
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
    hash = courses[parseInt(localStorage.course)]
  }

  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_'

  for (let i = 0; i < hash.length; i += 4) {
    let blockType = Math.floor(chars.indexOf(hash[i]) / 4)
    let blockStyle = chars.indexOf(hash[i]) % 4
    let base_height = -block_height + block_height * chars.indexOf(hash[i + 2])
    let rot = new THREE.Quaternion(0, 0, 0, 1)
    rot.setFromAxisAngle(new THREE.Vector3(0, 1, 0), (-blockStyle * Math.PI) / 2)

    if (
      blockType == blockNames.indexOf('Road Ramp') ||
      blockType == blockNames.indexOf('Road Ramp 2')
    ) {
      let rise = block_height

      if (blockType == blockNames.indexOf('Road Ramp 2')) {
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
    } else if (blockType == blockNames.indexOf('Water')) {
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
        blockType == blockNames.indexOf('Road Straight') ||
        blockType == blockNames.indexOf('Elevator')
      ) {
        material = materialRoad
      } else if (blockType == blockNames.indexOf('Road Corner')) {
        material = materialRoadCorner
      } else if (blockType == blockNames.indexOf('Ground')) {
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
      } else if (blockType == blockNames.indexOf('Wall')) {
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

      if (blockType == blockNames.indexOf('Elevator')) {
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
try {
  const response = await fetch(
    `textures/themes/${localStorage.theme.toLowerCase()}/config.json`,
  )
  Object.assign(config, await response.json())
} catch {}

const response = await fetch(`textures/vehicles/config.json`)
config.vehicles = await response.json()

initGraphics()
initPhysics()
createObjects()
tick()

if (localStorage.netplay) {
  networkUpdate()
}
