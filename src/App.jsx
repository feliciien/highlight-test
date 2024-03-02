import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Perf, setCustomData } from 'r3f-perf'
import { H } from 'highlight.run'

const CanvasSnaphsotter = () => {
  const lastSampleTime = useRef(-Infinity)
  // take over render loop so we can snapshot
  useFrame(({ gl, scene, camera }) => {
    gl.render(scene, camera)

    const time = performance.now()

    if (time - lastSampleTime.current > 1000) {
      // manually throttle to ~1 sample per second to measure
      H.snapshot(gl.domElement)
      const duration = performance.now() - time
      console.log('SAMPLE DURATION', duration + 'ms')
      setCustomData(duration)
      lastSampleTime.current = performance.now()
    }
  }, 1)

  return null
}

function Box(props) {
  // const [startRotation] = useState(() => Math.random() * Math.PI)
  // This reference gives us direct access to the THREE.Mesh object
  const ref = useRef()
  // Hold state for hovered and clicked events
  const [hovered, hover] = useState(false)
  const [clicked, click] = useState(false)
  useEffect(() => {
    ref.current.rotation.x = Math.random() * Math.PI
  }, [])
  // Subscribe this component to the render-loop, rotate the mesh every frame
  useFrame((state, delta) => (ref.current.rotation.x += delta))
  // Return the view, these are regular Threejs elements expressed in JSX
  return (
    <mesh
      {...props}
      ref={ref}
      scale={clicked ? 1.5 : 1}
      onClick={(event) => click(!clicked)}
      onPointerOver={(event) => (event.stopPropagation(), hover(true))}
      onPointerOut={(event) => hover(false)}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
  )
}

export default function App() {
  const [boxes] = useState(() => {
    return Array.from({ length: 1500 }).map((_, index) => (
      <Box key={index} position={[-2 + Math.random() * 4, -2 + Math.random() * 4, -1 + Math.random() * 2]} />
    ))
  })

  return (
    <Canvas>
      <CanvasSnaphsotter />
      <Perf
        customData={{
          name: 'Snapshot',
          info: 'ms'
        }}
      />
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <pointLight position={[-10, -10, -10]} />
      {boxes}
      <OrbitControls />
    </Canvas>
  )
}
