import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  Maximize2,
  Minimize2,
  Play,
  Pause,
  RotateCcw,
  Eye,
  Activity,
  Layers,
  Server,
  Radio,
  HardDrive,
  Cpu,
  Info,
  X,
  ShieldCheck,
  ShieldAlert,
  AlertOctagon,
  RefreshCw,
  Compass,
} from 'lucide-react';
import { StatusBadge } from './ui/StatusBadge';

// 3D World Positions for 5G Standalone Architecture
const NODE_POSITIONS = {
  ue: new THREE.Vector3(-8.5, 0.5, 2.2),
  gnb: new THREE.Vector3(-3.2, 0.0, -0.2),
  amf: new THREE.Vector3(3.2, 0.0, -3.2),
  smf: new THREE.Vector3(3.2, 0.0, 3.2),
  upf: new THREE.Vector3(8.5, 0.0, 0.0),
};

// 3GPP Conduit Interface Metadata
const CONDUIT_INFO = {
  uu: {
    id: 'uu',
    name: '3GPP 5G-NR Uu Air Interface',
    plane: 'Wireless RAN Air Interface',
    protocol: '5G-NR PHY / MAC / RLC / PDCP / RRC',
    endpoints: 'UE (nr-ue0) ⟷ gNodeB (Cell Tower)',
    specs: 'Carrier NR-ARFCN 640000 • Subcarrier Spacing 30kHz (SCS)',
    brandColor: '#00B4D8',
    status: 'ACTIVE',
    throughput: '3.42 Mbps (Uu Air Carrier)',
  },
  n2: {
    id: 'n2',
    name: 'NG-C / N2 Control Plane Interface',
    plane: 'Core Control Plane Signaling',
    protocol: 'NGAP (NextGen Application Protocol) over SCTP',
    endpoints: 'gNodeB (ueransim-gnb) ⟷ AMF (open5gs-amfd)',
    specs: 'SCTP Port 38412 • NGAP Association Active',
    brandColor: '#2563EB',
    status: 'ACTIVE',
    throughput: '124 msgs/sec (NAS Signaling)',
  },
  n3: {
    id: 'n3',
    name: 'NG-U / N3 High-Throughput User Plane Interface',
    plane: 'High-Throughput Packet Forwarding',
    protocol: 'GTP-U (GPRS Tunneling Protocol User Plane) over UDP',
    endpoints: 'gNodeB (ueransim-gnb) ⟷ UPF (open5gs-upfd)',
    specs: 'GTP-U Port 2152 • Kernel ogstun Tunneling Device',
    brandColor: '#059669',
    status: 'ACTIVE',
    throughput: '1.42 GB Total Forwarded',
  },
  n4: {
    id: 'n4',
    name: 'PFCP / N4 Session Control Interface',
    plane: 'Session Rule Provisioning',
    protocol: 'PFCP (Packet Forwarding Control Protocol) over UDP',
    endpoints: 'SMF (open5gs-smfd) ⟷ UPF (open5gs-upfd)',
    specs: 'UDP Port 8805 • PDU Session Association Active',
    brandColor: '#F5A623',
    status: 'ACTIVE',
    throughput: 'PFCP Heartbeat Active',
  },
  amfSmfControl: {
    id: 'amfSmfControl',
    name: 'SBI / Service-Based Architecture Bus',
    plane: 'Control Plane Microservice Bus',
    protocol: 'HTTP/2 REST JSON API over TCP',
    endpoints: 'AMF (open5gs-amfd) ⟷ SMF (open5gs-smfd)',
    specs: 'TCP Port 7777 • Nsmf_PDUSession API Exchange',
    brandColor: '#7C3AED',
    status: 'ACTIVE',
    throughput: 'HTTP/2 Stream Active',
  },
};

// Node metadata definitions with rich enterprise palette
const NODE_INFO = {
  ue: {
    name: 'UE (User Equipment)',
    service: 'ueransim-ue',
    role: 'Radio Terminal & PDU Session Endpoint',
    plane: 'User & Control Plane',
    subtext: 'SIM IMSI / SUPI registration to 5G Core',
    specs: '3GPP Rel-16 NR Terminal (nr-ue0)',
    brandColor: '#F5A623',
    hex: 0xf5a623,
  },
  gnb: {
    name: 'gNB (NextGen Node B)',
    service: 'ueransim-gnb',
    role: '5G-NR Radio Access Network',
    plane: 'RAN (Radio Access)',
    subtext: 'Transmits 5G-NR Air Carrier; Terminates NGAP N2',
    specs: 'SCTP Port 38412 / GTP-U Port 2152',
    brandColor: '#00B4D8',
    hex: 0x00b4d8,
  },
  amf: {
    name: 'AMF (Access & Mobility)',
    service: 'open5gs-amfd',
    role: 'Control Plane Registration & Mobility',
    plane: '5G Core Control Plane',
    subtext: 'Authenticates UE, manages registration & NAS',
    specs: 'SBI Port 7777 / NGAP Port 38412',
    brandColor: '#2563EB',
    hex: 0x2563eb,
  },
  smf: {
    name: 'SMF (Session Management)',
    service: 'open5gs-smfd',
    role: 'PDU Session Establishment & IP Alloc',
    plane: '5G Core Control Plane',
    subtext: 'Controls UPF forwarding rules via PFCP',
    specs: 'PFCP Port 8805 / SBI Port 7777',
    brandColor: '#7C3AED',
    hex: 0x7c3aed,
  },
  upf: {
    name: 'UPF (User Plane Function)',
    service: 'open5gs-upfd',
    role: 'Packet Routing & Data Plane Forwarding',
    plane: '5G Core User Plane',
    subtext: 'GTP-U encapsulation to ogstun tunnel',
    specs: 'GTP-U Port 2152 / Interface ogstun',
    brandColor: '#059669',
    hex: 0x059669,
  },
};

export function ThreeDigitalTwin5G({
  overviewData,
  alertsData,
  selfHealingData,
  isExpanded,
  onToggleExpand,
}) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const animFrameIdRef = useRef(null);

  // References for smooth camera lerping / tweening
  const targetCameraPosRef = useRef(null);
  const targetLookAtRef = useRef(null);

  // References to animated 3D objects
  const packetsRef = useRef([]);
  const pulseRingsRef = useRef([]);
  const nodeMeshesRef = useRef({});
  const conduitMeshesRef = useRef({});

  // UI state
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedNodeKey, setSelectedNodeKey] = useState(null);
  const [selectedConduitKey, setSelectedConduitKey] = useState(null);
  const [cameraPreset, setCameraPreset] = useState('isometric');
  const [isDroneMode, setIsDroneMode] = useState(false);
  const [flowSpeed, setFlowSpeed] = useState(1.0);
  const [simulationMode, setSimulationMode] = useState('LIVE'); // 'LIVE' | 'AMF_FAULT' | 'RECOVERING'
  const tagRefs = useRef({});
  const [webglError, setWebglError] = useState(false);
  const [hovered3DItem, setHovered3DItem] = useState(null);

  const components = overviewData?.components || {};
  const interfaces = overviewData?.interfaces || {};
  const recoveryData = overviewData?.recovery || {};
  const recoveryComponents = recoveryData?.components || {};

  // Status helper mapping to colorful enterprise tokens
  const getNodeState = useCallback(
    (key) => {
      // Handle interactive simulation state overrides
      if (key === 'amf') {
        if (simulationMode === 'AMF_FAULT') {
          return {
            status: 'DOWN',
            hex: 0xdc2626,
            cssColor: '#DC2626',
            label: 'AMF FAILURE (SIMULATED)',
            isFailing: true,
            isRecovering: false,
            comp: { status: 'DOWN', service: 'open5gs-amfd' },
            rec: {
              lifecycleState: 'DOWN',
              activeAlert: { name: 'Open5gsAmfDown', severity: 'critical', startsAt: new Date().toISOString() },
              recovery: { state: 'IDLE', details: 'Prometheus detected daemon crash: SIGTERM' },
            },
          };
        }
        if (simulationMode === 'RECOVERING') {
          return {
            status: 'RECOVERING',
            hex: 0xd97706,
            cssColor: '#D97706',
            label: 'SELF-HEALING (IN PROGRESS)',
            isFailing: false,
            isRecovering: true,
            comp: { status: 'RECOVERING', service: 'open5gs-amfd' },
            rec: {
              lifecycleState: 'RECOVERING',
              activeAlert: null,
              recovery: { state: 'RECOVERING', details: 'Automated remediation API executing systemctl restart and socket re-bind verification' },
            },
          };
        }
      }

      const comp = components[key] || { status: 'Unavailable', service: key };
      const rec = recoveryComponents[key] || {
        lifecycleState:
          comp.status === 'UP'
            ? 'HEALTHY'
            : comp.status === 'DOWN'
            ? 'DOWN'
            : 'UNAVAILABLE',
        activeAlert: null,
        recovery: { state: 'IDLE', details: null, serviceAvailability: comp.status },
      };

      const lifecycle = rec.lifecycleState;
      const meta = NODE_INFO[key] || {};

      if (lifecycle === 'RECOVERING') {
        return {
          status: 'RECOVERING',
          hex: 0xd97706, // Vibrant Amber
          cssColor: '#D97706',
          label: 'RECOVERING',
          isFailing: false,
          isRecovering: true,
          comp,
          rec,
        };
      }
      if (lifecycle === 'RECOVERY_FAILED' || lifecycle === 'DOWN' || comp.status === 'DOWN') {
        return {
          status: 'DOWN',
          hex: 0xdc2626, // Crimson Red
          cssColor: '#DC2626',
          label: lifecycle === 'RECOVERY_FAILED' ? 'RECOVERY FAILED' : 'DOWN',
          isFailing: true,
          isRecovering: false,
          comp,
          rec,
        };
      }
      if (lifecycle === 'HEALTHY' || comp.status === 'UP') {
        return {
          status: 'UP',
          hex: meta.hex || 0x059669, // Distinct component identity color
          cssColor: meta.brandColor || '#059669',
          label: 'OPERATIONAL',
          isFailing: false,
          isRecovering: false,
          comp,
          rec,
        };
      }

      return {
        status: 'UNAVAILABLE',
        hex: 0x475569, // Slate
        cssColor: '#64748B',
        brandColor: meta.brandColor,
        label: 'UNAVAILABLE',
        isFailing: false,
        isRecovering: false,
        comp,
        rec,
      };
    },
    [components, recoveryComponents, simulationMode]
  );

  // Initialize Three.js scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a101f); // Deep tech navy
    scene.fog = new THREE.FogExp2(0x0a101f, 0.02);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(-14, 12, 16);
    cameraRef.current = camera;

    // 3. Renderer
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: 'default',
        alpha: false,
      });
    } catch (err) {
      console.warn('[ThreeDigitalTwin5G] WebGL initialization failed:', err);
      setWebglError(true);
      return;
    }
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // 4. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.minDistance = 6;
    controls.maxDistance = 45;
    controls.target.set(0, 1.2, 0);
    controlsRef.current = controls;

    // 5. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0x1e293b, 2.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(12, 20, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const cyanRim = new THREE.DirectionalLight(0x00b4d8, 0.8);
    cyanRim.position.set(-15, 10, -15);
    scene.add(cyanRim);

    const purpleRim = new THREE.DirectionalLight(0x7c3aed, 0.6);
    purpleRim.position.set(15, 8, 15);
    scene.add(purpleRim);

    // 6. Ground Cyber Floor Grid
    const gridHelper = new THREE.GridHelper(36, 36, 0x0284c7, 0x1e293b);
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);

    // Radial 5G RAN Coverage Rings on the ground centered at gNB
    const ringGeo1 = new THREE.RingGeometry(2.0, 2.06, 48);
    const ringGeo2 = new THREE.RingGeometry(4.5, 4.56, 48);
    const ringGeo3 = new THREE.RingGeometry(7.2, 7.26, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00b4d8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
    });

    const gnbGroundRing = new THREE.Group();
    gnbGroundRing.position.set(NODE_POSITIONS.gnb.x, 0.01, NODE_POSITIONS.gnb.z);
    gnbGroundRing.rotation.x = Math.PI / 2;

    const r1 = new THREE.Mesh(ringGeo1, ringMat);
    const r2 = new THREE.Mesh(ringGeo2, ringMat);
    const r3 = new THREE.Mesh(ringGeo3, ringMat);
    gnbGroundRing.add(r1, r2, r3);
    scene.add(gnbGroundRing);

    // 7. BUILD 3D 5G NODES
    const nodesGroup = new THREE.Group();
    scene.add(nodesGroup);
    const nodeMeshes = {};

    // Helper: Create Server Rack Chassis for 5G Core (AMF, SMF, UPF)
    const createCoreRack = (key, name, pos, accentColorHex) => {
      const rackGroup = new THREE.Group();
      rackGroup.position.copy(pos);
      rackGroup.userData = { key, name, type: 'core' };

      // Base pedestal
      const pedGeo = new THREE.CylinderGeometry(1.4, 1.6, 0.2, 24);
      const pedMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.6,
        metalness: 0.4,
      });
      const pedestal = new THREE.Mesh(pedGeo, pedMat);
      pedestal.position.y = 0.1;
      pedestal.receiveShadow = true;
      rackGroup.add(pedestal);

      // Pedestal glowing trim ring
      const trimGeo = new THREE.RingGeometry(1.42, 1.55, 24);
      const trimMat = new THREE.MeshBasicMaterial({
        color: accentColorHex,
        side: THREE.DoubleSide,
      });
      const trimMesh = new THREE.Mesh(trimGeo, trimMat);
      trimMesh.rotation.x = Math.PI / 2;
      trimMesh.position.y = 0.21;
      rackGroup.add(trimMesh);

      // Server tower chassis
      const bodyGeo = new THREE.BoxGeometry(1.4, 2.4, 1.4);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.3,
        metalness: 0.7,
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 1.4;
      body.castShadow = true;
      body.receiveShadow = true;
      rackGroup.add(body);

      // Chassis edge trim
      const wireGeo = new THREE.EdgesGeometry(bodyGeo);
      const wireMat = new THREE.LineBasicMaterial({ color: accentColorHex });
      const wire = new THREE.LineSegments(wireGeo, wireMat);
      wire.position.y = 1.4;
      rackGroup.add(wire);

      // Server blade slots on front
      for (let i = 0; i < 4; i++) {
        const slotGeo = new THREE.BoxGeometry(1.1, 0.35, 0.05);
        const slotMat = new THREE.MeshStandardMaterial({
          color: 0x0f172a,
          roughness: 0.5,
          metalness: 0.5,
        });
        const slot = new THREE.Mesh(slotGeo, slotMat);
        slot.position.set(0, 0.65 + i * 0.5, 0.72);
        rackGroup.add(slot);

        // Blinking drive status LED
        const ledGeo = new THREE.BoxGeometry(0.1, 0.1, 0.03);
        const ledMat = new THREE.MeshBasicMaterial({ color: accentColorHex });
        const led = new THREE.Mesh(ledGeo, ledMat);
        led.position.set(-0.4, 0.65 + i * 0.5, 0.75);
        rackGroup.add(led);
      }

      // Top glowing status beacon dome
      const beaconGeo = new THREE.SphereGeometry(0.28, 16, 16);
      const beaconMat = new THREE.MeshStandardMaterial({
        color: accentColorHex,
        emissive: accentColorHex,
        emissiveIntensity: 0.9,
        roughness: 0.1,
      });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.y = 2.75;
      rackGroup.add(beacon);

      // Pulsing beacon ring
      const ringGeo = new THREE.RingGeometry(0.35, 0.5, 24);
      const beaconRingMat = new THREE.MeshBasicMaterial({
        color: accentColorHex,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.75,
      });
      const beaconRing = new THREE.Mesh(ringGeo, beaconRingMat);
      beaconRing.rotation.x = Math.PI / 2;
      beaconRing.position.y = 2.65;
      rackGroup.add(beaconRing);

      nodesGroup.add(rackGroup);
      return { group: rackGroup, beacon, beaconMat, bodyMat, accentColorHex };
    };

    // Helper: Create 3D Cellular Mast for gNB
    const createGnbTower = (pos) => {
      const gnbGroup = new THREE.Group();
      gnbGroup.position.copy(pos);
      gnbGroup.userData = { key: 'gnb', name: 'gNB', type: 'ran' };

      // Base concrete foundation
      const fGeo = new THREE.CylinderGeometry(1.6, 1.8, 0.25, 8);
      const fMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.7 });
      const foundation = new THREE.Mesh(fGeo, fMat);
      foundation.position.y = 0.125;
      foundation.receiveShadow = true;
      gnbGroup.add(foundation);

      // Central lattice mast pillar
      const mastGeo = new THREE.CylinderGeometry(0.2, 0.6, 4.2, 8);
      const mastMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        metalness: 0.8,
        roughness: 0.2,
      });
      const mast = new THREE.Mesh(mastGeo, mastMat);
      mast.position.y = 2.25;
      mast.castShadow = true;
      gnbGroup.add(mast);

      // Cross struts
      for (let y = 1; y <= 4; y += 0.8) {
        const strutGeo = new THREE.TorusGeometry(0.45 - (y * 0.05), 0.04, 6, 8);
        const strutMat = new THREE.MeshBasicMaterial({ color: 0x00b4d8 });
        const strut = new THREE.Mesh(strutGeo, strutMat);
        strut.rotation.x = Math.PI / 2;
        strut.position.y = y;
        gnbGroup.add(strut);
      }

      // Top antenna platform
      const platGeo = new THREE.CylinderGeometry(0.9, 0.9, 0.1, 6);
      const platMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.5 });
      const plat = new THREE.Mesh(platGeo, platMat);
      plat.position.y = 4.35;
      gnbGroup.add(plat);

      // 3 Sectorized Directional Antenna Panels
      for (let a = 0; a < 3; a++) {
        const angle = (a * 2 * Math.PI) / 3;
        const antGeo = new THREE.BoxGeometry(0.22, 1.1, 0.4);
        const antMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          metalness: 0.3,
          roughness: 0.3,
        });
        const ant = new THREE.Mesh(antGeo, antMat);
        ant.position.set(Math.cos(angle) * 0.8, 4.9, Math.sin(angle) * 0.8);
        ant.rotation.y = -angle;
        gnbGroup.add(ant);
      }

      // Microwave dish
      const dishGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.15, 16);
      const dishMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.6 });
      const dish = new THREE.Mesh(dishGeo, dishMat);
      dish.position.set(0.6, 3.8, 0);
      dish.rotation.z = Math.PI / 2;
      gnbGroup.add(dish);

      // Top beacon light
      const beaconGeo = new THREE.SphereGeometry(0.25, 16, 16);
      const beaconMat = new THREE.MeshStandardMaterial({
        color: 0x00b4d8,
        emissive: 0x00b4d8,
        emissiveIntensity: 1.0,
      });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.y = 5.6;
      gnbGroup.add(beacon);

      nodesGroup.add(gnbGroup);
      return { group: gnbGroup, beacon, beaconMat };
    };

    // Helper: Create 3D Terminal / Device for UE
    const createUeTerminal = (pos) => {
      const ueGroup = new THREE.Group();
      ueGroup.position.copy(pos);
      ueGroup.userData = { key: 'ue', name: 'UE', type: 'terminal' };

      // Base ring
      const baseGeo = new THREE.CylinderGeometry(1.0, 1.2, 0.15, 24);
      const baseMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.7 });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.y = 0.08;
      ueGroup.add(base);

      // Glowing base trim ring
      const trimGeo = new THREE.RingGeometry(1.02, 1.15, 24);
      const trimMat = new THREE.MeshBasicMaterial({ color: 0xf5a623, side: THREE.DoubleSide });
      const trimMesh = new THREE.Mesh(trimGeo, trimMat);
      trimMesh.rotation.x = Math.PI / 2;
      trimMesh.position.y = 0.16;
      ueGroup.add(trimMesh);

      // Device chassis
      const phoneGeo = new THREE.BoxGeometry(0.7, 1.4, 0.12);
      const phoneMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.8,
        roughness: 0.2,
      });
      const phone = new THREE.Mesh(phoneGeo, phoneMat);
      phone.position.y = 1.0;
      phone.rotation.y = Math.PI / 6;
      phone.castShadow = true;
      ueGroup.add(phone);

      // Glowing screen with 5G indicator
      const screenGeo = new THREE.BoxGeometry(0.6, 1.25, 0.02);
      const screenMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        emissive: 0x00b4d8,
        emissiveIntensity: 0.7,
      });
      const screen = new THREE.Mesh(screenGeo, screenMat);
      screen.position.set(0, 1.0, 0.07);
      screen.rotation.y = Math.PI / 6;
      ueGroup.add(screen);

      // Antenna rod
      const antGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.5, 8);
      const antMat = new THREE.MeshStandardMaterial({ color: 0xf5a623, metalness: 0.9 });
      const ant = new THREE.Mesh(antGeo, antMat);
      ant.position.set(0.2, 1.85, 0);
      ueGroup.add(ant);

      // Beacon tip
      const beaconGeo = new THREE.SphereGeometry(0.2, 16, 16);
      const beaconMat = new THREE.MeshStandardMaterial({
        color: 0xf5a623,
        emissive: 0xf5a623,
        emissiveIntensity: 1.0,
      });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.y = 2.15;
      ueGroup.add(beacon);

      nodesGroup.add(ueGroup);
      return { group: ueGroup, beacon, beaconMat };
    };

    // Instantiate all 5 nodes with their distinct enterprise brand colors
    nodeMeshes.ue = createUeTerminal(NODE_POSITIONS.ue);
    nodeMeshes.gnb = createGnbTower(NODE_POSITIONS.gnb);
    nodeMeshes.amf = createCoreRack('amf', 'AMF', NODE_POSITIONS.amf, 0x2563eb); // Royal Blue
    nodeMeshes.smf = createCoreRack('smf', 'SMF', NODE_POSITIONS.smf, 0x7c3aed); // Royal Purple
    nodeMeshes.upf = createCoreRack('upf', 'UPF', NODE_POSITIONS.upf, 0x059669); // Emerald
    nodeMeshesRef.current = nodeMeshes;

    // 8. 3D CONDUIT PATHS & ANIMATED DATA PACKETS
    const conduitsGroup = new THREE.Group();
    scene.add(conduitsGroup);

    // Define 3D Spline Curves for 3GPP Interfaces
    const curves = {
      // Uu: Radio Link UE <-> gNB (curved wireless arc)
      uu: {
        curve: new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(NODE_POSITIONS.ue.x, 1.4, NODE_POSITIONS.ue.z),
          new THREE.Vector3(
            (NODE_POSITIONS.ue.x + NODE_POSITIONS.gnb.x) / 2,
            3.6,
            (NODE_POSITIONS.ue.z + NODE_POSITIONS.gnb.z) / 2
          ),
          new THREE.Vector3(NODE_POSITIONS.gnb.x, 4.4, NODE_POSITIONS.gnb.z)
        ),
        color: 0x00b4d8, // Electric Cyan
        isWireless: true,
      },

      // N2: gNB <-> AMF (Control Plane SCTP)
      n2: {
        curve: new THREE.CubicBezierCurve3(
          new THREE.Vector3(NODE_POSITIONS.gnb.x, 0.6, NODE_POSITIONS.gnb.z),
          new THREE.Vector3(0.0, 0.4, -2.0),
          new THREE.Vector3(1.5, 0.4, -3.2),
          new THREE.Vector3(NODE_POSITIONS.amf.x, 0.6, NODE_POSITIONS.amf.z)
        ),
        color: 0x2563eb, // Royal Blue
        isWireless: false,
      },

      // AMF-SMF Control Plane SBI (Direct bus)
      amfSmfControl: {
        curve: new THREE.LineCurve3(
          new THREE.Vector3(NODE_POSITIONS.amf.x, 1.2, NODE_POSITIONS.amf.z),
          new THREE.Vector3(NODE_POSITIONS.smf.x, 1.2, NODE_POSITIONS.smf.z)
        ),
        color: 0x7c3aed, // Royal Purple / Violet
        isWireless: false,
      },

      // N4: SMF <-> UPF (PFCP Session Control)
      n4: {
        curve: new THREE.CubicBezierCurve3(
          new THREE.Vector3(NODE_POSITIONS.smf.x, 0.6, NODE_POSITIONS.smf.z),
          new THREE.Vector3(5.5, 0.4, 3.0),
          new THREE.Vector3(7.0, 0.4, 1.5),
          new THREE.Vector3(NODE_POSITIONS.upf.x, 0.6, NODE_POSITIONS.upf.z)
        ),
        color: 0xf5a623, // Golden Amber
        isWireless: false,
      },

      // N3: gNB <-> UPF (High-Throughput User Plane GTP-U)
      n3: {
        curve: new THREE.CubicBezierCurve3(
          new THREE.Vector3(NODE_POSITIONS.gnb.x, 0.4, NODE_POSITIONS.gnb.z),
          new THREE.Vector3(1.0, 0.2, 0.0),
          new THREE.Vector3(5.0, 0.2, 0.0),
          new THREE.Vector3(NODE_POSITIONS.upf.x, 0.4, NODE_POSITIONS.upf.z)
        ),
        color: 0x059669, // Emerald Green
        isWireless: false,
      },
    };

    // Build static 3D tube conduits with their distinct interface colors
    const conduitMeshes = {};
    Object.entries(curves).forEach(([key, cfg]) => {
      const tubeGeo = new THREE.TubeGeometry(cfg.curve, 32, cfg.isWireless ? 0.05 : 0.07, 8, false);
      const tubeMat = new THREE.MeshBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: cfg.isWireless ? 0.5 : 0.8,
        wireframe: cfg.isWireless,
      });
      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
      tubeMesh.userData = { key, isConduit: true, name: cfg.name || key };
      conduitsGroup.add(tubeMesh);
      conduitMeshes[key] = { mesh: tubeMesh, mat: tubeMat, curve: cfg.curve, baseColor: cfg.color };
    });
    conduitMeshesRef.current = conduitMeshes;

    // 9. ANIMATED 3D DATA PACKETS
    const packets = [];
    const packetGeo = new THREE.SphereGeometry(0.14, 12, 12);

    const packetConfig = [
      { key: 'uu', count: 3, speed: 0.008, color: 0x00b4d8 },
      { key: 'n2', count: 2, speed: 0.007, color: 0x2563eb },
      { key: 'amfSmfControl', count: 2, speed: 0.009, color: 0x7c3aed },
      { key: 'n4', count: 2, speed: 0.007, color: 0xf5a623 },
      { key: 'n3', count: 4, speed: 0.012, color: 0x059669 },
    ];

    packetConfig.forEach((cfg) => {
      const curveObj = curves[cfg.key];
      for (let i = 0; i < cfg.count; i++) {
        const mat = new THREE.MeshBasicMaterial({
          color: cfg.color,
          transparent: true,
          opacity: 0.95,
        });
        const mesh = new THREE.Mesh(packetGeo, mat);
        scene.add(mesh);
        packets.push({
          mesh,
          mat,
          curve: curveObj.curve,
          interfaceKey: cfg.key,
          progress: i / cfg.count,
          speed: cfg.speed,
          baseColor: cfg.color,
        });
      }
    });
    packetsRef.current = packets;

    // 10. Expanding RF Wave Rings from gNB Tower
    const pulseRings = [];
    for (let i = 0; i < 3; i++) {
      const pGeo = new THREE.RingGeometry(0.5, 0.65, 32);
      const pMat = new THREE.MeshBasicMaterial({
        color: 0x00b4d8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6,
      });
      const pMesh = new THREE.Mesh(pGeo, pMat);
      pMesh.rotation.x = Math.PI / 2;
      pMesh.position.set(NODE_POSITIONS.gnb.x, 4.8, NODE_POSITIONS.gnb.z);
      scene.add(pMesh);
      pulseRings.push({ mesh: pMesh, mat: pMat, scale: 1 + i * 0.8, baseOpacity: 0.6 });
    }
    pulseRingsRef.current = pulseRings;

    // 11. Raycaster for 3D Node & Conduit Interactions
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects([...nodesGroup.children, ...conduitsGroup.children], true);

      if (intersects.length > 0) {
        renderer.domElement.style.cursor = 'pointer';
        let current = intersects[0].object;
        while (current && !current.userData?.key && current.parent !== scene) {
          current = current.parent;
        }
        if (current?.userData?.key) {
          setHovered3DItem({
            key: current.userData.key,
            isConduit: !!current.userData.isConduit,
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
          });
        }
      } else {
        renderer.domElement.style.cursor = 'grab';
        setHovered3DItem(null);
      }
    };

    const handleCanvasClick = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects([...nodesGroup.children, ...conduitsGroup.children], true);

      if (intersects.length > 0) {
        let current = intersects[0].object;
        while (current && !current.userData?.key && current.parent !== scene) {
          current = current.parent;
        }
        if (current?.userData?.key) {
          if (current.userData.isConduit) {
            setSelectedConduitKey(current.userData.key);
            setSelectedNodeKey(null);
          } else {
            cameraFlyTo(current.userData.key);
          }
        }
      }
    };

    renderer.domElement.addEventListener('pointermove', handlePointerMove);
    renderer.domElement.addEventListener('click', handleCanvasClick);

    // 12. Main Render & Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      const delta = clock.getDelta();

      // Smooth Camera Glide Interpolation
      if (targetCameraPosRef.current && targetLookAtRef.current) {
        camera.position.lerp(targetCameraPosRef.current, 0.05);
        controls.target.lerp(targetLookAtRef.current, 0.05);
        if (camera.position.distanceTo(targetCameraPosRef.current) < 0.06) {
          targetCameraPosRef.current = null;
          targetLookAtRef.current = null;
        }
      }

      // Drone auto-rotation
      controls.autoRotate = isDroneMode;
      controls.autoRotateSpeed = 1.0;
      controls.update();

      // Animate 3D data packet flows along curves
      packetsRef.current.forEach((p) => {
        if (isPlaying) {
          p.progress = (p.progress + p.speed * flowSpeed) % 1.0;
        }
        const point = p.curve.getPointAt(p.progress);
        if (point) {
          p.mesh.position.copy(point);
        }
      });

      // Animate RF pulse rings expanding from gNB tower
      if (isPlaying) {
        pulseRingsRef.current.forEach((ring) => {
          ring.scale += delta * 1.8;
          if (ring.scale > 4.5) {
            ring.scale = 0.5;
          }
          ring.mesh.scale.set(ring.scale, ring.scale, ring.scale);
          ring.mat.opacity = Math.max(0, 0.7 * (1 - ring.scale / 4.5));
        });
      }

      // Gentle floating hover on beacons
      Object.values(nodeMeshesRef.current).forEach((node) => {
        if (node.beacon) {
          node.beacon.rotation.y += delta * 0.8;
        }
      });

      // Project 3D node world coordinates to 2D screen positions for HTML labels
      const tempVec = new THREE.Vector3();
      Object.entries(NODE_POSITIONS).forEach(([key, pos]) => {
        const tagEl = tagRefs.current[key];
        if (!tagEl) return;
        tempVec.copy(pos);
        tempVec.y += key === 'gnb' ? 6.2 : 3.4;
        tempVec.project(camera);

        if (tempVec.z < 1) {
          const x = (tempVec.x * 0.5 + 0.5) * width;
          const y = (-(tempVec.y * 0.5) + 0.5) * height;
          tagEl.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -100%)`;
          tagEl.style.display = 'block';
        } else {
          tagEl.style.display = 'none';
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animFrameIdRef.current);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('click', handleCanvasClick);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update 3D Node Colors dynamically based on real Prometheus state
  useEffect(() => {
    if (!nodeMeshesRef.current) return;

    ['ue', 'gnb', 'amf', 'smf', 'upf'].forEach((key) => {
      const nodeObj = nodeMeshesRef.current[key];
      if (!nodeObj) return;

      const state = getNodeState(key);

      if (nodeObj.beaconMat) {
        nodeObj.beaconMat.color.setHex(state.hex);
        nodeObj.beaconMat.emissive.setHex(state.hex);
        nodeObj.beaconMat.emissiveIntensity = state.isFailing ? 1.4 : (state.isRecovering ? 1.1 : 0.8);
      }
    });

    if (packetsRef.current) {
      packetsRef.current.forEach((p) => {
        let fromKey = 'gnb';
        let toKey = 'amf';
        if (p.interfaceKey === 'uu') {
          fromKey = 'ue';
          toKey = 'gnb';
        } else if (p.interfaceKey === 'n2') {
          fromKey = 'gnb';
          toKey = 'amf';
        } else if (p.interfaceKey === 'amfSmfControl') {
          fromKey = 'amf';
          toKey = 'smf';
        } else if (p.interfaceKey === 'n4') {
          fromKey = 'smf';
          toKey = 'upf';
        } else if (p.interfaceKey === 'n3') {
          fromKey = 'gnb';
          toKey = 'upf';
        }

        const fromState = getNodeState(fromKey);
        const toState = getNodeState(toKey);

        if (fromState.isFailing || toState.isFailing) {
          p.mat.color.setHex(0xdc2626); // Crimson Red
          p.mesh.visible = isPlaying ? Math.floor(Date.now() / 300) % 2 === 0 : false;
        } else if (fromState.isRecovering || toState.isRecovering) {
          p.mat.color.setHex(0xd97706); // Amber
          p.mesh.visible = true;
        } else {
          p.mat.color.setHex(p.baseColor); // Vibrant interface color
          p.mesh.visible = true;
        }
      });
    }
  }, [components, recoveryComponents, isPlaying, getNodeState]);

  // Cinematic camera glide to target node
  const cameraFlyTo = (nodeKey) => {
    setSelectedNodeKey(nodeKey);
    setSelectedConduitKey(null);
    setCameraPreset(null);
    if (nodeKey === 'ue') {
      targetCameraPosRef.current = new THREE.Vector3(-12, 3.5, 5);
      targetLookAtRef.current = new THREE.Vector3(-8.5, 0.5, 2.2);
    } else if (nodeKey === 'gnb') {
      targetCameraPosRef.current = new THREE.Vector3(-7, 7.5, 4.5);
      targetLookAtRef.current = new THREE.Vector3(-3.2, 2.5, -0.2);
    } else if (nodeKey === 'amf') {
      targetCameraPosRef.current = new THREE.Vector3(0.5, 4.5, -5.5);
      targetLookAtRef.current = new THREE.Vector3(3.2, 1.4, -3.2);
    } else if (nodeKey === 'smf') {
      targetCameraPosRef.current = new THREE.Vector3(0.5, 4.5, 5.5);
      targetLookAtRef.current = new THREE.Vector3(3.2, 1.4, 3.2);
    } else if (nodeKey === 'upf') {
      targetCameraPosRef.current = new THREE.Vector3(6.0, 4.0, 3.0);
      targetLookAtRef.current = new THREE.Vector3(8.5, 1.4, 0.0);
    }
  };

  // Camera presets with smooth interpolation
  const applyCameraPreset = (preset) => {
    setCameraPreset(preset);
    setSelectedNodeKey(null);
    setSelectedConduitKey(null);
    if (preset === 'isometric') {
      targetCameraPosRef.current = new THREE.Vector3(-14, 12, 16);
      targetLookAtRef.current = new THREE.Vector3(0, 1.2, 0);
    } else if (preset === 'top') {
      targetCameraPosRef.current = new THREE.Vector3(0, 22, 0.1);
      targetLookAtRef.current = new THREE.Vector3(0, 0, 0);
    } else if (preset === 'ran') {
      targetCameraPosRef.current = new THREE.Vector3(-8, 5, 8);
      targetLookAtRef.current = new THREE.Vector3(-5, 2, 1);
    } else if (preset === 'core') {
      targetCameraPosRef.current = new THREE.Vector3(10, 6, 8);
      targetLookAtRef.current = new THREE.Vector3(5, 1.5, 0);
    }
  };

  const selectedNodeInfo = selectedNodeKey ? NODE_INFO[selectedNodeKey] : null;
  const selectedNodeState = selectedNodeKey ? getNodeState(selectedNodeKey) : null;

  if (webglError) {
    return (
      <div className="relative w-full h-[580px] flex flex-col items-center justify-center bg-[#FFFFFF] dark:bg-[#1E293B] rounded-lg border border-[#CBD5E1] dark:border-[#334155] p-6 text-center shadow-card">
        <div className="w-14 h-14 rounded-full bg-[#2563EB]/10 flex items-center justify-center mb-3">
          <Layers className="w-7 h-7 text-[#2563EB]" />
        </div>
        <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
          3D WebGL Digital Twin (Fallback Mode)
        </h3>
        <p className="text-xs text-[#64748B] dark:text-[#94A3B8] max-w-md mt-1 mb-4 leading-relaxed font-sans">
          Hardware-accelerated WebGL context is currently unavailable in this browser session. The full 5G topology, metrics, and self-healing animations remain active.
        </p>
        <button
          onClick={() => setWebglError(false)}
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#2563EB] text-white text-xs font-semibold rounded shadow-sm hover:bg-[#1D4ED8] transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry WebGL Context</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`relative w-full flex flex-col bg-[#0A101F] rounded-lg border border-[#CBD5E1] dark:border-[#334155] shadow-card overflow-hidden select-none transition-all duration-200 ${
      isExpanded ? 'h-[calc(100vh-140px)] min-h-[680px]' : 'h-[620px] sm:h-[680px]'
    }`}>
      {/* Top 3D Control Header Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex flex-wrap items-center justify-between px-3 sm:px-4 py-2 bg-[#FFFFFF]/95 dark:bg-[#1E293B]/95 backdrop-blur-md border-b border-[#E2E8F0] dark:border-[#334155] shadow-sm gap-2">
        {/* Left: 3D Scene Title and Live Metrics Badge */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isPlaying ? 'bg-[#00B4D8]' : 'bg-[#94A3B8]'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  isPlaying ? 'bg-[#00B4D8]' : 'bg-[#94A3B8]'
                }`}
              />
            </span>
            <span className="text-xs font-bold tracking-wider uppercase text-[#0F172A] dark:text-[#F8FAFC] font-mono">
              3D DIGITAL TWIN • 5G STANDALONE TOPOLOGY
            </span>
          </div>

          <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[11px] font-mono bg-[#00B4D8]/10 text-[#00B4D8] border border-[#00B4D8]/30 font-semibold">
            WebGL Accelerated
          </span>
        </div>

        {/* Right: Camera Presets & View Controls */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Drone Surveillance Auto-Orbit Toggle */}
          <button
            onClick={() => setIsDroneMode(!isDroneMode)}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-mono transition-colors ${
              isDroneMode
                ? 'bg-[#7C3AED] text-white font-bold shadow-sm'
                : 'bg-[#F1F4F8] dark:bg-[#0F172A] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] border border-[#CBD5E1] dark:border-[#334155]'
            }`}
            title={isDroneMode ? 'Disable Drone Auto-Orbit' : 'Enable 360° Cinematic Drone Orbit'}
          >
            <Compass className={`w-3.5 h-3.5 ${isDroneMode ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Drone Orbit</span>
          </button>

          {/* Flow Speed Controls */}
          <div className="hidden lg:flex items-center space-x-1 bg-[#F1F4F8] dark:bg-[#0F172A] rounded p-0.5 text-[11px] font-mono border border-[#CBD5E1] dark:border-[#334155]">
            <span className="text-[#94A3B8] px-1 font-medium">Speed:</span>
            {[0.5, 1, 2, 4].map((spd) => (
              <button
                key={spd}
                onClick={() => setFlowSpeed(spd)}
                className={`px-1.5 py-0.5 rounded ${
                  flowSpeed === spd
                    ? 'bg-[#2563EB] text-white font-bold'
                    : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {/* Camera View Switcher */}
          <div className="flex items-center bg-[#F1F4F8] dark:bg-[#0F172A] rounded-md border border-[#CBD5E1] dark:border-[#334155] p-0.5 text-xs font-mono">
            <button
              onClick={() => applyCameraPreset('isometric')}
              className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded transition-colors ${
                cameraPreset === 'isometric'
                  ? 'bg-[#2563EB] text-white font-semibold shadow-sm'
                  : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
              }`}
              title="Isometric 45° Perspective"
            >
              Isometric
            </button>
            <button
              onClick={() => applyCameraPreset('top')}
              className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded transition-colors ${
                cameraPreset === 'top'
                  ? 'bg-[#2563EB] text-white font-semibold shadow-sm'
                  : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
              }`}
              title="Top-Down Overhead Blueprint"
            >
              Top-Down
            </button>
            <button
              onClick={() => applyCameraPreset('ran')}
              className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded transition-colors ${
                cameraPreset === 'ran'
                  ? 'bg-[#2563EB] text-white font-semibold shadow-sm'
                  : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
              }`}
              title="Focus on UE and gNB RAN"
            >
              RAN
            </button>
            <button
              onClick={() => applyCameraPreset('core')}
              className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded transition-colors ${
                cameraPreset === 'core'
                  ? 'bg-[#2563EB] text-white font-semibold shadow-sm'
                  : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
              }`}
              title="Focus on AMF, SMF, UPF Core"
            >
              Core
            </button>
          </div>

          {/* Reset Camera */}
          <button
            onClick={() => applyCameraPreset('isometric')}
            className="p-1 sm:p-1.5 rounded-md bg-[#F1F4F8] dark:bg-[#0F172A] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] border border-[#CBD5E1] dark:border-[#334155] transition-colors"
            title="Reset Camera Target"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Animation Play/Pause */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-1 sm:p-1.5 rounded-md border transition-colors ${
              isPlaying
                ? 'bg-[#00B4D8]/15 text-[#00B4D8] border-[#00B4D8]/40'
                : 'bg-[#F1F4F8] dark:bg-[#0F172A] text-[#64748B] dark:text-[#94A3B8] border-[#CBD5E1] dark:border-[#334155]'
            }`}
            title={isPlaying ? 'Pause 3D Signal Pulses' : 'Resume 3D Signal Pulses'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          {/* Fullscreen Expand Toggle */}
          {onToggleExpand && (
            <button
              onClick={onToggleExpand}
              className="p-1 sm:p-1.5 rounded-md bg-[#F1F4F8] dark:bg-[#0F172A] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] border border-[#CBD5E1] dark:border-[#334155] transition-colors"
              title={isExpanded ? 'Collapse View' : 'Expand Fullscreen 3D Viewport'}
            >
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Interactive 3D Simulation Controls HUD Bar */}
      <div className="absolute top-14 sm:top-16 left-3 sm:left-4 z-20 flex flex-wrap items-center gap-2 pointer-events-auto">
        <div className="bg-[#FFFFFF]/90 dark:bg-[#1E293B]/90 backdrop-blur-md rounded-md p-1 border border-[#CBD5E1] dark:border-[#334155] shadow-md flex items-center gap-1.5 text-xs font-mono">
          <span className="text-[10px] uppercase font-bold text-[#64748B] dark:text-[#94A3B8] px-2">
            3D Simulation:
          </span>
          <button
            onClick={() => setSimulationMode('LIVE')}
            className={`px-2.5 py-1 rounded transition-colors ${
              simulationMode === 'LIVE'
                ? 'bg-[#059669] text-white font-bold shadow-sm'
                : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
            }`}
            title="Real-time Prometheus Scraper Telemetry"
          >
            Live Prometheus
          </button>
          <button
            onClick={() => setSimulationMode('AMF_FAULT')}
            className={`px-2.5 py-1 rounded transition-colors ${
              simulationMode === 'AMF_FAULT'
                ? 'bg-[#DC2626] text-white font-bold shadow-sm'
                : 'text-[#DC2626] hover:bg-[#DC2626]/10'
            }`}
            title="Simulate AMF daemon failure and Alertmanager firing state in 3D"
          >
            Simulate AMF Fault
          </button>
          {simulationMode === 'AMF_FAULT' && (
            <button
              onClick={() => {
                setSimulationMode('RECOVERING');
                setTimeout(() => setSimulationMode('LIVE'), 4000);
              }}
              className="px-2.5 py-1 rounded bg-[#D97706] text-white font-bold shadow-sm animate-pulse flex items-center space-x-1"
              title="Demonstrate 3D closed-loop recovery sequence"
            >
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Trigger Self-Healing</span>
            </button>
          )}
        </div>
      </div>

      {/* 3D WebGL Canvas Mount Container */}
      <div
        ref={mountRef}
        className="relative w-full flex-1 h-full cursor-grab active:cursor-grabbing bg-[#0A101F]"
      />

      {/* Floating High-Contrast Screen Overlays Anchored to 3D Node Positions */}
      {['ue', 'gnb', 'amf', 'smf', 'upf'].map((key) => {
        const info = NODE_INFO[key];
        const state = getNodeState(key);
        const isSelected = selectedNodeKey === key;

        return (
          <div
            key={key}
            ref={(el) => (tagRefs.current[key] = el)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              display: 'none',
              pointerEvents: 'auto',
              willChange: 'transform',
            }}
            className="z-10 group"
          >
            <button
              onClick={() => cameraFlyTo(key)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FFFFFF]/95 dark:bg-[#1E293B]/95 border shadow-lg transition-all duration-150 backdrop-blur-md cursor-pointer ${
                isSelected
                  ? 'border-[#2563EB] ring-2 ring-[#2563EB] scale-110'
                  : 'border-[#CBD5E1] dark:border-[#334155] hover:border-[#2563EB] hover:scale-105'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full inline-block"
                style={{ backgroundColor: info?.brandColor || state.cssColor }}
              />
              <span className="text-xs font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                {key.toUpperCase()}
              </span>
              <span
                className="text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold"
                style={{
                  color: state.cssColor,
                  backgroundColor: `${state.cssColor}18`,
                }}
              >
                {state.label}
              </span>
            </button>
          </div>
        );
      })}

      {/* Bottom Status & Navigation HUD */}
      <div className="absolute bottom-3 left-3 z-20 flex flex-wrap items-center gap-2 pointer-events-none">
        <div className="px-3 py-1.5 rounded-md bg-[#FFFFFF]/95 dark:bg-[#1E293B]/95 backdrop-blur-md border border-[#CBD5E1] dark:border-[#334155] shadow-md text-xs font-mono text-[#64748B] dark:text-[#94A3B8] pointer-events-auto flex items-center gap-3">
          <span className="text-[#0F172A] dark:text-[#F8FAFC] font-bold">3D Navigation:</span>
          <span>Left-Drag: Rotate</span>
          <span className="text-[#CBD5E1] dark:text-[#334155]">•</span>
          <span>Scroll: Zoom</span>
          <span className="text-[#CBD5E1] dark:text-[#334155]">•</span>
          <span>Right-Drag: Pan</span>
          <span className="text-[#CBD5E1] dark:text-[#334155]">•</span>
          <span className="text-[#2563EB] dark:text-[#38BDF8] font-semibold">Click Any Node / Conduit To Inspect</span>
        </div>
      </div>

      {/* Selected Node Telemetry HUD Inspector Drawer */}
      {selectedNodeKey && selectedNodeInfo && selectedNodeState && (
        <div className="absolute top-14 right-4 z-30 w-84 bg-[#FFFFFF]/95 dark:bg-[#1E293B]/95 backdrop-blur-md rounded-lg border border-[#CBD5E1] dark:border-[#334155] shadow-2xl p-4 text-xs font-mono animate-in fade-in slide-in-from-right-4 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0] dark:border-[#334155]">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: selectedNodeInfo.brandColor }}
              />
              <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
                {selectedNodeInfo.name}
              </h3>
            </div>
            <button
              onClick={() => setSelectedNodeKey(null)}
              className="p-1 rounded text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-[#F1F4F8] dark:hover:bg-[#0F172A]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 space-y-2.5">
            <div>
              <span className="text-[10px] uppercase text-[#64748B] dark:text-[#94A3B8] font-bold block">
                3GPP Role & Plane
              </span>
              <span className="text-[#0F172A] dark:text-[#F8FAFC] font-semibold">{selectedNodeInfo.plane}</span>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">{selectedNodeInfo.subtext}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#E2E8F0] dark:border-[#334155]">
              <div>
                <span className="text-[10px] uppercase text-[#64748B] dark:text-[#94A3B8] font-bold block">
                  Systemd Service
                </span>
                <span className="text-[#0F172A] dark:text-[#F8FAFC] font-mono text-[11px] font-semibold">
                  {selectedNodeInfo.service}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-[#64748B] dark:text-[#94A3B8] font-bold block">
                  Scrape Status
                </span>
                <span
                  className="font-bold text-[11px] px-1.5 py-0.5 rounded inline-block"
                  style={{
                    color: selectedNodeState.cssColor,
                    backgroundColor: `${selectedNodeState.cssColor}18`,
                  }}
                >
                  {selectedNodeState.label}
                </span>
              </div>
            </div>

            <div className="pt-1 border-t border-[#E2E8F0] dark:border-[#334155]">
              <span className="text-[10px] uppercase text-[#64748B] dark:text-[#94A3B8] font-bold block">
                Specs & Interfaces
              </span>
              <span className="text-[#0F172A] dark:text-[#F8FAFC] text-[11px] font-mono">
                {selectedNodeInfo.specs}
              </span>
            </div>

            {/* Incident / Recovery Details if Active */}
            {(selectedNodeState.isFailing || selectedNodeState.isRecovering) && (
              <div
                className={`p-2 rounded border text-[11px] ${
                  selectedNodeState.isFailing
                    ? 'bg-[#DC2626]/10 border-[#DC2626]/30 text-[#DC2626]'
                    : 'bg-[#D97706]/10 border-[#D97706]/30 text-[#D97706]'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  {selectedNodeState.isFailing ? (
                    <AlertOctagon className="w-3.5 h-3.5" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  )}
                  <span>
                    {selectedNodeState.isFailing ? 'Fault Detected' : 'Self-Healing Active'}
                  </span>
                </div>
                <p className="text-[10px] leading-relaxed">
                  {selectedNodeState.rec?.recovery?.details ||
                    (selectedNodeState.isFailing
                      ? 'Service failure reported by Prometheus exporter.'
                      : 'Remediation API executing automated restart hook.')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Selected Conduit 3GPP Interface Inspector Drawer */}
      {selectedConduitKey && CONDUIT_INFO[selectedConduitKey] && (
        <div className="absolute top-14 left-4 z-30 w-84 bg-[#FFFFFF]/95 dark:bg-[#1E293B]/95 backdrop-blur-md rounded-lg border border-[#CBD5E1] dark:border-[#334155] shadow-2xl p-4 text-xs font-mono animate-in fade-in slide-in-from-left-4 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0] dark:border-[#334155]">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: CONDUIT_INFO[selectedConduitKey].brandColor }}
              />
              <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                {CONDUIT_INFO[selectedConduitKey].name}
              </h3>
            </div>
            <button
              onClick={() => setSelectedConduitKey(null)}
              className="p-1 rounded text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 space-y-2">
            <div>
              <span className="text-[10px] uppercase text-[#64748B] dark:text-[#94A3B8] font-bold block">
                3GPP Interface Plane
              </span>
              <span className="text-[#0F172A] dark:text-[#F8FAFC] font-semibold">
                {CONDUIT_INFO[selectedConduitKey].plane}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase text-[#64748B] dark:text-[#94A3B8] font-bold block">
                Protocol Stack & Endpoints
              </span>
              <span className="text-[#2563EB] dark:text-[#38BDF8] font-semibold block">
                {CONDUIT_INFO[selectedConduitKey].protocol}
              </span>
              <span className="text-[#64748B] dark:text-[#94A3B8] text-[11px] block mt-0.5">
                {CONDUIT_INFO[selectedConduitKey].endpoints}
              </span>
            </div>

            <div className="pt-1.5 border-t border-[#E2E8F0] dark:border-[#334155]">
              <span className="text-[10px] uppercase text-[#64748B] dark:text-[#94A3B8] font-bold block">
                Interface Specifications
              </span>
              <span className="text-[#0F172A] dark:text-[#F8FAFC] text-[11px]">
                {CONDUIT_INFO[selectedConduitKey].specs}
              </span>
            </div>

            <div className="pt-1.5 border-t border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between">
              <span className="text-[10px] uppercase text-[#64748B] dark:text-[#94A3B8] font-bold">
                Throughput / Status
              </span>
              <span className="text-[#059669] font-bold text-[11px]">
                {CONDUIT_INFO[selectedConduitKey].throughput}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
